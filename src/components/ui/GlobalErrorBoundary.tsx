import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Global Error Caught:", error, errorInfo);

        // Dynamic Sentry Import (to avoid bundling issues if not used elsewhere)
        import('@sentry/react').then(Sentry => {
            Sentry.captureException(error, {
                extra: {
                    componentStack: errorInfo.componentStack
                }
            });
        }).catch(err => console.error("Failed to load Sentry", err));
    }

    public handleReload = () => {
        window.location.reload();
    };

    public handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background-dark flex items-center justify-center p-4 font-sans text-text-primary">
                    <div className="max-w-md w-full bg-background-alt/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center relative overflow-hidden">

                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-accent/10 blur-[60px] pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                <AlertTriangle size={40} className="text-red-400" />
                            </div>

                            <h1 className="text-3xl font-serif text-white mb-3">
                                Ops! Qualcosa non va.
                            </h1>

                            <p className="text-text-muted mb-8 leading-relaxed text-sm">
                                Si è verificato un errore imprevisto. Non preoccuparti, i tuoi dati sono al sicuro. Prova a ricaricare la pagina.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                <button
                                    onClick={this.handleReload}
                                    className="flex-1 bg-accent text-background-dark py-3.5 rounded-xl font-bold hover:bg-accent-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 active:scale-95"
                                >
                                    <RefreshCw size={18} />
                                    Ricarica
                                </button>

                                <button
                                    onClick={this.handleGoHome}
                                    className="flex-1 bg-white/5 text-white py-3.5 rounded-xl font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/5 active:scale-95"
                                >
                                    <Home size={18} />
                                    Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // @ts-ignore
        return this.props.children;
    }
}

export default GlobalErrorBoundary;
