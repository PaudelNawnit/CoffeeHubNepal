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

    let checkInterval: ReturnType<typeof setInterval> | null = null;

    const renderCaptcha = () => {
      // Only render if container exists and widget hasn't been rendered yet
      if (containerRef.current && widgetIdRef.current === null && window.grecaptcha && typeof window.grecaptcha.render === 'function') {
        // Clear container to prevent double render
        if (containerRef.current.innerHTML.trim() !== '') {
          containerRef.current.innerHTML = '';
        }
        
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
        } catch (error: any) {
          // If widget already exists, clear and try again
          if (error?.message?.includes('already been rendered')) {
            if (containerRef.current) {
              containerRef.current.innerHTML = '';
              widgetIdRef.current = null;
              // Try rendering again after a short delay
              setTimeout(() => {
                if (containerRef.current && window.grecaptcha && typeof window.grecaptcha.render === 'function') {
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
                  } catch (retryError) {
                    console.warn('reCAPTCHA retry render error:', retryError);
                  }
                }
              }, 100);
            }
          } else {
            console.warn('reCAPTCHA render error:', error);
          }
        }
      }
    };

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
        checkInterval = setInterval(() => {
          if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
            if (checkInterval) clearInterval(checkInterval);
            window.grecaptcha.ready(renderCaptcha);
          }
        }, 100);

        // Clear interval after 10 seconds to prevent memory leak
        setTimeout(() => {
          if (checkInterval) clearInterval(checkInterval);
        }, 10000);
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
      
      // Clear container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      
      widgetIdRef.current = null;
      
      // Clear any intervals
      if (checkInterval) {
        clearInterval(checkInterval);
      }
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
