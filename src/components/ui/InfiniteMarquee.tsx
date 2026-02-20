import React from 'react';
import './InfiniteMarquee.css';

const InfiniteMarquee: React.FC = () => {
    // "The Editor" Style: Mixed Typography
    // Sans-Serif (Standard) + Serif (Italic/Elegant)
    const renderContent = (): React.ReactElement => (
        <>
            <span className="marquee-item">
                DIVENTA <span className="text-accent tracking-[0.2em] uppercase font-bold">PARTNER</span>
            </span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-item">
                ESPANDI <span className="text-accent tracking-[0.2em] uppercase font-bold">IL TUO BUSINESS</span>
            </span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-item">
                PERLA NEGRA
            </span>
            <span className="marquee-separator">✦</span>
        </>
    );

    const handleClick = (): void => {
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
            onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleClick()}
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
