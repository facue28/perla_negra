import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';

const SEO = ({ title, description, image, url, type = 'website' }) => {
    const siteTitle = 'Perla Negra';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const currentUrl = url || window.location.href;

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
        </Helmet>
    );
};

export default SEO;
