import { Filter, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import Select from '@/components/ui/Select';

const ProductFilters = ({
    clearFilters,
    sortOrder,
    setSortOrder,
    expanded,
    toggleSection,
    sensations,
    selectedSensations,
    handleSensationChange,
    priceRange,
    setPriceRange,
    isMobile = false
}) => {
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

            {/* Sensation Filter */}
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
                                    {sens}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

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
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">$</span>
                                <input
                                    type="number"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                                    className="w-full bg-background-dark border border-border/30 rounded px-3 py-2 pl-6 text-sm text-text-primary focus:border-accent focus:outline-none"
                                    placeholder="Min"
                                />
                            </div>
                            <Minus size={12} className="text-text-muted" />
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">$</span>
                                <input
                                    type="number"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                    className="w-full bg-background-dark border border-border/30 rounded px-3 py-2 pl-6 text-sm text-text-primary focus:border-accent focus:outline-none"
                                    placeholder="Max"
                                />
                            </div>
                        </div>
                        <div className="text-xs text-text-muted text-center">
                            Intervallo: ${priceRange.min} - ${priceRange.max}
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
