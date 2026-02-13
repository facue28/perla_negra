import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

const Select = ({ value, onChange, options, placeholder = "Seleziona", className = "", disabled = false }: SelectProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchBuffer = useRef<string>("");
    const searchTimer = useRef<NodeJS.Timeout | null>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard Navigation (Type to Select)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        // Handle Enter to confirm/close
        if (e.key === 'Enter' && isOpen) {
            e.preventDefault();
            setIsOpen(false);
            return;
        }

        // Handle Escape to close
        if (e.key === 'Escape') {
            setIsOpen(false);
            return;
        }

        // Prevent default only if it's a character key to avoid blocking Tab/Enter unless intended
        if (e.key.length === 1 && e.key.match(/[a-z0-9]/i)) {
            // e.preventDefault(); // Optional: might block native shortcuts, usually better not to unless scrolling

            // Clear buffer timer
            if (searchTimer.current) {
                clearTimeout(searchTimer.current);
            }

            // Update buffer
            searchBuffer.current += e.key.toLowerCase();

            // Find match
            const match = options.find(opt =>
                opt.label.toLowerCase().startsWith(searchBuffer.current)
            );

            if (match) {
                onChange(match.value);

                // If the list is open, we should scroll to it (advanced, optional for now)
                // For now, selecting it is enough user feedback
            }

            // Reset buffer after 500ms
            searchTimer.current = setTimeout(() => {
                searchBuffer.current = "";
            }, 500);
        }
    };

    const handleSelect = (optionValue: string) => {
        if (disabled) return;
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={dropdownRef} onKeyDown={handleKeyDown}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent hover:border-accent/30 focus:ring-1 focus:ring-accent/50 flex items-center justify-between transition-all ${isOpen ? 'border-accent ring-1 ring-accent/50' : ''} ${disabled ? 'opacity-40 cursor-not-allowed bg-white/5' : ''} ${className}`}
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                {isOpen ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
            </button>

            {/* Dropdown Options */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-background-alt border border-border/10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-border/20 py-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group ${option.value === value
                                    ? 'bg-accent/10 text-accent font-medium'
                                    : 'text-text-primary hover:bg-white/5'
                                    }`}
                            >
                                <span>{option.label}</span>
                                {option.value === value && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Select;
