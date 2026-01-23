import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

const Select = ({ value, onChange, options, placeholder = "Seleziona", className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-background-dark border border-border/30 rounded-lg px-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none flex items-center justify-between transition-colors ${isOpen ? 'border-accent' : ''}`}
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
