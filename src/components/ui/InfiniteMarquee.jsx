import './InfiniteMarquee.css';

const InfiniteMarquee = () => {
    // "The Editor" Style: Mixed Typography
    // Sans-Serif (Standard) + Serif (Italic/Elegant)
    const renderContent = () => (
        <>
            <span className="marquee-item">
                DIVENTA <span className="font-signature text-accent font-light">Partner</span>
            </span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-item">
                ESPANDI <span className="font-signature text-accent font-light">il tuo Business</span>
            </span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-item">
                PERLA NEGRA
            </span>
            <span className="marquee-separator">✦</span>
        </>
    );

    const handleClick = () => {
        const b2bSection = document.getElementById('b2b-section');
        if (b2bSection) {
            b2bSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div
            className="marquee-container"
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
            aria-label="Scroll to B2B section"
        >
            <div className="marquee-content">
                {/* Repeat content enough times to fill ultra-wide screens smoothly */}
                {renderContent()}
                {renderContent()}
                {renderContent()}
                {renderContent()}
                {renderContent()}
                {renderContent()}
                {renderContent()}
                {renderContent()}
            </div>
        </div>
    );
};

export default InfiniteMarquee;
