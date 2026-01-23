import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const Drawer = ({ isOpen, onClose, title, children, side = 'right' }) => {
    const overlayRef = useRef(null);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Close on click outside
    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const sideClasses = {
        right: 'inset-y-0 right-0 h-full border-l border-border/10',
        left: 'inset-y-0 left-0 h-full border-r border-border/10',
        bottom: 'inset-x-0 bottom-0 max-h-[90vh] border-t border-border/10 rounded-t-3xl'
    };

    const animationClasses = {
        right: 'animate-in slide-in-from-right duration-300',
        left: 'animate-in slide-in-from-left duration-300',
        bottom: 'animate-in slide-in-from-bottom duration-300'
    };

    return createPortal(
        <div
            className="fixed inset-0 z-50 bg-background-dark/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleOverlayClick}
            ref={overlayRef}
        >
            <div
                className={`absolute bg-background-alt shadow-2xl flex flex-col w-full md:max-w-md ${sideClasses[side]} ${animationClasses[side]}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/10">
                    <h2 className="text-xl font-bold text-text-primary">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-text-muted hover:text-accent transition-colors rounded-full hover:bg-white/5"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Drawer;
