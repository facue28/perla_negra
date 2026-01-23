import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';

const SEO = ({ title, description, image, type = 'website' }) => {
    const siteTitle = 'Perla Negra';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    // Force title update manually to guarantee it works on SPA navigation
    useEffect(() => {
        document.title = fullTitle;
    }, [fullTitle]);

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />

            {/* Open Graph / Facebook */}
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
