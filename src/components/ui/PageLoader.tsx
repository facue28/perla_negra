import React from 'react';

const PageLoader = (): React.ReactElement => {
    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-black">
            <div className="flex flex-col items-center gap-6">
                <div className="w-14 h-14 border-4 border-accent/10 border-t-accent rounded-full animate-spin shadow-[0_0_20px_rgba(63,255,193,0.15)]"></div>
                <div className="text-center space-y-2">
                    <p className="text-accent text-sm tracking-[0.3em] font-medium animate-pulse uppercase">Perla Negra</p>
                    <p className="text-text-muted/40 text-[10px] tracking-widest uppercase">Caricamento in corso...</p>
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
