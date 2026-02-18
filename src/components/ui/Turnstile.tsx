import React, { useEffect, useRef } from 'react';

interface TurnstileProps {
    onVerify: (token: string) => void;
    siteKey: string;
}

declare global {
    interface Window {
        onloadTurnstileCallback: () => void;
        turnstile: {
            render: (container: string | HTMLElement, options: any) => string;
            reset: (widgetId: string) => void;
        };
    }
}

const Turnstile: React.FC<TurnstileProps> = ({ onVerify, siteKey }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    useEffect(() => {
        // Add script if not exists
        if (!document.getElementById('turnstile-script')) {
            const script = document.createElement('script');
            script.id = 'turnstile-script';
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }

        const renderWidget = () => {
            if (window.turnstile && containerRef.current && !widgetIdRef.current) {
                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    callback: (token: string) => onVerify(token),
                });
            }
        };

        if (window.turnstile) {
            renderWidget();
        } else {
            const interval = setInterval(() => {
                if (window.turnstile) {
                    renderWidget();
                    clearInterval(interval);
                }
            }, 100);
            return () => clearInterval(interval);
        }

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                // window.turnstile.reset(widgetIdRef.current);
            }
        };
    }, [onVerify, siteKey]);

    return <div ref={containerRef} className="my-4 flex justify-center" />;
};

export default Turnstile;
