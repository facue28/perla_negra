import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

class ProductErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public props: Props;

    constructor(props: Props) {
        super(props);
        this.props = props;
    }

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error in ProductCard:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="h-full min-h-[300px] bg-background-alt/50 rounded-3xl border border-red-500/10 flex flex-col items-center justify-center p-4 text-center">
                    <AlertTriangle className="text-text-muted mb-2 opacity-50" size={24} />
                    <p className="text-text-muted text-xs">Prodotto non disponibile</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ProductErrorBoundary;
