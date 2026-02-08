import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';

interface SEOProps {
    title?: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
    structuredData?: Record<string, any>;
    noIndex?: boolean;
    statusCode?: number;
}

const SEO = ({ title, description, image, url, type = 'website', structuredData, noIndex = false, statusCode }: SEOProps) => {
    const siteTitle = 'Perla Negra';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const currentUrl = url || typeof window !== 'undefined' ? window.location.href : '';

    // Force title update manually to guarantee it works on SPA navigation
    useEffect(() => {
        document.title = fullTitle;
    }, [fullTitle]);

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={currentUrl} />

            {/* Robots */}
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:url" content={currentUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            {image && <meta property="og:image" content={image} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}

            {/* Prerender.io Status Code */}
            {statusCode && <meta name="prerender-status-code" content={statusCode.toString()} />}

            {/* Structured Data (JSON-LD) */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;

