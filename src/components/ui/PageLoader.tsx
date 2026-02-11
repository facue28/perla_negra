import React from 'react';

const PageLoader = (): React.ReactElement => {
    return (
        <div className="flex items-center justify-center min-h-[50vh] w-full">
            <div className="flex flex-col items-center gap-6">
                <div className="w-12 h-12 border-4 border-accent/10 border-t-accent rounded-full animate-spin"></div>
                <div className="text-center space-y-2">
                    <p className="text-accent text-xs tracking-[0.3em] font-medium animate-pulse uppercase">Perla Negra</p>
                    <p className="text-text-muted/40 text-[9px] tracking-widest uppercase">Caricamento...</p>
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
