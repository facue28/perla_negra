import { Filter, ChevronUp, ChevronDown, Minus } from 'lucide-react';
// @ts-ignore
import Select from '@/components/ui/Select';
import React, { Dispatch, SetStateAction } from 'react';

// Category-specific filter label mapping
const FILTER_LABEL_MAP: Record<string, { usageArea: string }> = {
    'Gioco': {
        usageArea: 'Tipo di gioco'
    },
    'Fragranza': {
        usageArea: 'Tipo di fragranza'
    }
};

interface ExpandedState {
    categories: boolean;
    sensations: boolean;
    usage: boolean;
    flavors: boolean;
    games: boolean;
    target: boolean;
    price: boolean;
}

interface PriceRange {
    min: number;
    max: number;
}

interface ProductFiltersProps {
    clearFilters: () => void;
    sortOrder: string;
    setSortOrder: Dispatch<SetStateAction<string>>;
    expanded: ExpandedState;
    toggleSection: (section: keyof ExpandedState) => void;
    sensations: string[];
    selectedSensations: string[];
    handleSensationChange: (sensation: string) => void;
    selectedProductFilters: string[];
    handleProductFilterChange: (filter: string) => void;
    gameTypes?: string[];
    flavorOptions?: string[];
    usageOptions?: string[];
    selectedTarget: string[];
    handleTargetChange: (target: string) => void;
    targetAudiences?: string[];
    priceRange: PriceRange;
    setPriceRange: Dispatch<SetStateAction<PriceRange>>;
    isMobile?: boolean;
    selectedCategories?: string[];
}

const ProductFilters = ({
    clearFilters,
    sortOrder,
    setSortOrder,
    expanded,
    toggleSection,
    sensations,
    selectedSensations,
    handleSensationChange,


    selectedProductFilters,
    handleProductFilterChange,
    gameTypes = [],
    flavorOptions = [],
    usageOptions = [],
    selectedTarget,
    handleTargetChange,
    targetAudiences = [],
    priceRange,
    setPriceRange,
    isMobile = false,
    selectedCategories = []  // Category context for intelligent labels
}: ProductFiltersProps) => {
    // Get contextual label for usage area based on selected category
    const getUsageAreaLabel = () => {
        // Only apply custom label if a single category is selected
        if (selectedCategories.length === 1) {
            const category = selectedCategories[0];
            return FILTER_LABEL_MAP[category]?.usageArea || "Zona d'uso";
        }
        return "Zona d'uso";  // Default label
    };
    return (
        <div className="space-y-6">
            {!isMobile && (
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-text-primary font-bold text-lg">
                        <Filter size={20} className="text-accent" />
                        <span>Filtri</span>
                    </div>
                    <button
                        onClick={clearFilters}
                        className="text-text-muted text-xs hover:text-accent transition-colors"
                    >
                        Cancella
                    </button>
                </div>
            )}

            {/* Mobile Sort - Visible only in Drawer/Mobile Context if needed */}
            {isMobile && (
                <div className="mb-6">
                    <label className="text-xs text-text-muted mb-1 block font-medium">Ordina per</label>
                    <Select
                        value={sortOrder}
                        onChange={setSortOrder}
                        options={[
                            { value: 'newest', label: 'Più recenti' },
                            { value: 'oldest', label: 'Meno recenti' },
                            { value: 'asc', label: 'Prezzo: Basso → Alto' },
                            { value: 'desc', label: 'Prezzo: Alto → Basso' }
                        ]}
                    />
                </div>
            )}

            {/* Sensation Filter - Only show if available AND not Olio Commestibile */}
            {sensations.length > 0 && !selectedCategories.some(c => c.toLowerCase() === 'olio commestibile') && (
                <div className="border-b border-border/20 py-4">
                    <button
                        onClick={() => toggleSection('sensations')}
                        className="w-full flex items-center justify-between text-text-primary font-medium hover:text-accent transition-colors mb-2"
                    >
                        <span>Sensazione</span>
                        {expanded.sensations ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {expanded.sensations && (
                        <div className="space-y-2 mt-3 animate-slideDown">
                            {sensations.map(sens => (
                                <label key={sens} className="flex items-center space-x-3 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedSensations.includes(sens) ? 'bg-accent border-accent select-none' : 'border-text-muted group-hover:border-accent'}`}>
                                        {selectedSensations.includes(sens) && <div className="w-2 h-2 bg-background-dark rounded-sm" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedSensations.includes(sens)}
                                        onChange={() => handleSensationChange(sens)}
                                    />
                                    <span className={`text-sm ${selectedSensations.includes(sens) ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'}`}>
                                        {sens.charAt(0).toUpperCase() + sens.slice(1).toLowerCase()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Game Types Filter - Only show when gameTypes exist */}
            {gameTypes.length > 0 && (
                <div className="border-b border-border/20 py-4">
                    <button
                        onClick={() => toggleSection('games')}
                        className="w-full flex items-center justify-between text-text-primary font-medium hover:text-accent transition-colors mb-2"
                    >
                        <span>Tipo di gioco</span>
                        {expanded.games ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {expanded.games && (
                        <div className="space-y-2 mt-3 animate-slideDown">
                            {gameTypes.map(game => (
                                <label key={game} className="flex items-center space-x-3 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedProductFilters.includes(game) ? 'bg-accent border-accent select-none' : 'border-text-muted group-hover:border-accent'}`}>
                                        {selectedProductFilters.includes(game) && <div className="w-2 h-2 bg-background-dark rounded-sm" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedProductFilters.includes(game)}
                                        onChange={() => handleProductFilterChange(game)}
                                    />
                                    <span className={`text-sm ${selectedProductFilters.includes(game) ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'}`}>
                                        {game.charAt(0).toUpperCase() + game.slice(1).toLowerCase()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Flavors Filter (Gusti) - Olii e Massaggi */}
            {flavorOptions.length > 0 && (
                <div className="border-b border-border/20 py-4">
                    <button
                        onClick={() => toggleSection('flavors')}
                        className="w-full flex items-center justify-between text-text-primary font-medium hover:text-accent transition-colors mb-2"
                    >
                        <span>Gusti</span>
                        {expanded.flavors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {expanded.flavors && (
                        <div className="space-y-2 mt-3 animate-slideDown">
                            {flavorOptions.map(item => (
                                <label key={item} className="flex items-center space-x-3 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedProductFilters.includes(item) ? 'bg-accent border-accent select-none' : 'border-text-muted group-hover:border-accent'}`}>
                                        {selectedProductFilters.includes(item) && <div className="w-2 h-2 bg-background-dark rounded-sm" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedProductFilters.includes(item)}
                                        onChange={() => handleProductFilterChange(item)}
                                    />
                                    <span className={`text-sm ${selectedProductFilters.includes(item) ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'}`}>
                                        {item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Usage Area Filter - Generic for others */}
            {usageOptions.length > 0 && (
                <div className="border-b border-border/20 py-4">
                    <button
                        onClick={() => toggleSection('usage')}
                        className="w-full flex items-center justify-between text-text-primary font-medium hover:text-accent transition-colors mb-2"
                    >
                        <span>{getUsageAreaLabel()}</span>
                        {expanded.usage ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {expanded.usage && (
                        <div className="space-y-2 mt-3 animate-slideDown">
                            {usageOptions.map(item => (
                                <label key={item} className="flex items-center space-x-3 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedProductFilters.includes(item) ? 'bg-accent border-accent select-none' : 'border-text-muted group-hover:border-accent'}`}>
                                        {selectedProductFilters.includes(item) && <div className="w-2 h-2 bg-background-dark rounded-sm" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedProductFilters.includes(item)}
                                        onChange={() => handleProductFilterChange(item)}
                                    />
                                    <span className={`text-sm ${selectedProductFilters.includes(item) ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'}`}>
                                        {item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Target Audience Filter - Only show if available (e.g. Fragrances) */}
            {targetAudiences.length > 0 && (
                <div className="border-b border-border/20 py-4">
                    <button
                        onClick={() => toggleSection('target')}
                        className="w-full flex items-center justify-between text-text-primary font-medium hover:text-accent transition-colors mb-2"
                    >
                        <span>Per chi?</span>
                        {expanded.target ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {expanded.target && (
                        <div className="space-y-2 mt-3 animate-slideDown">
                            {targetAudiences.map(item => (
                                <label key={item} className="flex items-center space-x-3 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedTarget.includes(item) ? 'bg-accent border-accent select-none' : 'border-text-muted group-hover:border-accent'}`}>
                                        {selectedTarget.includes(item) && <div className="w-2 h-2 bg-background-dark rounded-sm" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedTarget.includes(item)}
                                        onChange={() => handleTargetChange(item)}
                                    />
                                    <span className={`text-sm ${selectedTarget.includes(item) ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'}`}>
                                        {item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Price Range Filter */}
            <div className="py-4">
                <button
                    onClick={() => toggleSection('price')}
                    className="w-full flex items-center justify-between text-text-primary font-medium hover:text-accent transition-colors mb-2"
                >
                    <span>Prezzo</span>
                    {expanded.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {expanded.price && (
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">€</span>
                                <input
                                    type="number"
                                    aria-label="Prezzo Minimo"
                                    value={priceRange.min}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                                    className="w-full bg-background-dark border border-border/30 rounded px-3 py-2 pl-6 text-sm text-text-primary focus:border-accent focus:outline-none"
                                    placeholder="Min"
                                />
                            </div>
                            <Minus size={12} className="text-text-muted" />
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">€</span>
                                <input
                                    type="number"
                                    aria-label="Prezzo Massimo"
                                    value={priceRange.max}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                    className="w-full bg-background-dark border border-border/30 rounded px-3 py-2 pl-6 text-sm text-text-primary focus:border-accent focus:outline-none"
                                    placeholder="Max"
                                />
                            </div>
                        </div>
                        <div className="text-xs text-text-muted text-center">
                            Intervallo: €{priceRange.min} - €{priceRange.max}
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Sort - Hidden on mobile/drawer, visible on desktop sidebar */}
            {!isMobile && (
                <div className="border-t border-border/20 pt-4 mt-2 hidden md:block">
                    <label className="text-xs text-text-muted mb-2 block font-medium">Ordina per</label>
                    <Select
                        value={sortOrder}
                        onChange={setSortOrder}
                        options={[
                            { value: 'newest', label: 'Più recenti' },
                            { value: 'oldest', label: 'Meno recenti' },
                            { value: 'asc', label: 'Prezzo: Basso → Alto' },
                            { value: 'desc', label: 'Prezzo: Alto → Basso' }
                        ]}
                    />
                </div>
            )}
        </div>
    );
};

export default ProductFilters;
