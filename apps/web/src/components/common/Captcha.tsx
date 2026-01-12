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
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  // If no site key is configured, skip captcha and auto-verify
  useEffect(() => {
    if (!siteKey) {
      onVerify('captcha-disabled');
    }
  }, [siteKey, onVerify]);

  useEffect(() => {
    if (!siteKey) return;

    const renderCaptcha = () => {
      // Only render if container exists and widget hasn't been rendered yet
      if (containerRef.current && widgetIdRef.current === null && window.grecaptcha) {
        try {
          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              onVerify(token);
            },
            'error-callback': () => {
              onError?.();
            },
            'expired-callback': () => {
              onExpire?.();
            }
          });
        } catch (error) {
          // Widget might already be rendered, try to reset it
          console.warn('reCAPTCHA render error:', error);
        }
      }
    };

    // Check if grecaptcha is already loaded
    if (window.grecaptcha && window.grecaptcha.render) {
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
          if (window.grecaptcha) {
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
        const checkInterval = setInterval(() => {
          if (window.grecaptcha && window.grecaptcha.render) {
            clearInterval(checkInterval);
            window.grecaptcha.ready(renderCaptcha);
          }
        }, 100);

        // Clear interval after 10 seconds to prevent memory leak
        setTimeout(() => clearInterval(checkInterval), 10000);
      }
    }

    // Cleanup function
    return () => {
      widgetIdRef.current = null;
    };
  }, [siteKey, onVerify, onError, onExpire]);

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
