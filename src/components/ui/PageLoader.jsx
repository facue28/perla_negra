const PageLoader = () => {
    return (
        <div className="flex items-center justify-center min-h-[50vh] w-full">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
                <p className="text-text-muted text-sm tracking-widest animate-pulse">CARICAMENTO...</p>
            </div>
        </div>
    );
};

export default PageLoader;
