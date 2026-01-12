import { useEffect, useRef, useId } from 'react';

interface CaptchaProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: string | HTMLElement, parameters: {
        sitekey: string;
        callback?: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
      }) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
      ready: (callback: () => void) => void;
    };
    onRecaptchaLoad?: () => void;
  }
}

/**
 * Google reCAPTCHA v2 (checkbox) component
 * Uses explicit render for proper handling of multiple widgets and SPA navigation.
 */
export const Captcha = ({ onVerify, onError, onExpire }: CaptchaProps) => {
  const containerId = useId().replace(/:/g, '_');
  const widgetIdRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRenderedRef = useRef<boolean>(false);
  const isRenderingRef = useRef<boolean>(false);
  const readyCallbackSetRef = useRef<boolean>(false);
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  // Update refs when callbacks change
  useEffect(() => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
  }, [onVerify, onError, onExpire]);

  // If no site key is configured, skip captcha and auto-verify
  useEffect(() => {
    if (!siteKey) {
      onVerifyRef.current('captcha-disabled');
    }
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey) return;

    let checkInterval: ReturnType<typeof setInterval> | null = null;

    const renderCaptcha = () => {
      // Prevent multiple simultaneous render attempts
      if (isRenderingRef.current || isRenderedRef.current) return;
      
      // Only render if container exists and widget hasn't been rendered
      if (
        containerRef.current && 
        widgetIdRef.current === null && 
        !isRenderedRef.current &&
        window.grecaptcha && 
        typeof window.grecaptcha.render === 'function'
      ) {
        // Check if container already has reCAPTCHA elements (iframes or divs with recaptcha class)
        const hasRecaptchaElements = containerRef.current.querySelector('iframe[src*="recaptcha"], .g-recaptcha, [id*="recaptcha"]');
        if (hasRecaptchaElements) {
          // Widget already exists, don't render again
          isRenderedRef.current = true;
          return;
        }
        
        // Double-check: if container has any children, don't render
        if (containerRef.current.children.length > 0) {
          isRenderedRef.current = true;
          return;
        }
        
        isRenderingRef.current = true;
        try {
          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              onVerifyRef.current(token);
            },
            'error-callback': () => {
              onErrorRef.current?.();
            },
            'expired-callback': () => {
              onExpireRef.current?.();
            }
          });
          isRenderedRef.current = true;
        } catch (error: any) {
          // If widget already exists, mark as rendered and don't retry
          if (error?.message?.includes('already been rendered')) {
            isRenderedRef.current = true;
            // Widget exists, just mark it as rendered - don't try to render again
          } else {
            console.warn('reCAPTCHA render error:', error);
          }
        } finally {
          isRenderingRef.current = false;
        }
      }
    };

    // Only set up ready callback once per component instance
    if (!readyCallbackSetRef.current) {
      readyCallbackSetRef.current = true;
      
      // Check if grecaptcha is already loaded
      if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
        // Use grecaptcha.ready to ensure API is fully loaded
        window.grecaptcha.ready(renderCaptcha);
      } else {
        // Load the script if not already loading
        const existingScript = document.querySelector<HTMLScriptElement>(
          'script[src*="recaptcha/api.js"]'
        );

        if (!existingScript) {
          // Set up callback for when script loads
          window.onRecaptchaLoad = () => {
            if (window.grecaptcha && !isRenderedRef.current) {
              window.grecaptcha.ready(renderCaptcha);
            }
          };

          const script = document.createElement('script');
          script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        } else {
          // Script exists but grecaptcha not ready yet, poll for it
          checkInterval = setInterval(() => {
            if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
              if (checkInterval) clearInterval(checkInterval);
              if (!isRenderedRef.current) {
                window.grecaptcha.ready(renderCaptcha);
              }
            }
          }, 100);

          // Clear interval after 10 seconds to prevent memory leak
          setTimeout(() => {
            if (checkInterval) clearInterval(checkInterval);
          }, 10000);
        }
      }
    }

    // Cleanup function
    return () => {
      // Reset widget if it exists
      if (widgetIdRef.current !== null && window.grecaptcha && typeof window.grecaptcha.reset === 'function') {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (error) {
          // Ignore reset errors
        }
      }
      
      // Clear container completely
      if (containerRef.current) {
        // Remove all child nodes
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
      
      widgetIdRef.current = null;
      isRenderedRef.current = false;
      isRenderingRef.current = false;
      readyCallbackSetRef.current = false;
      
      // Clear any intervals
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [siteKey]); // Only depend on siteKey, callbacks are in refs

  // Don't render anything if no site key
  if (!siteKey) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <div
        ref={containerRef}
        id={`recaptcha-${containerId}`}
      />
    </div>
  );
};
