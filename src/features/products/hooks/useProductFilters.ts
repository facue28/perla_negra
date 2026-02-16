import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Product } from '@/features/products/types';

// Game-specific values (from Gioco category) - Constant moved outside
const GAME_VALUES = ['Dadi', 'Carte', 'Roulette'];

interface PriceRange {
    min: number;
    max: number;
}

interface ExpandedState {
    categories: boolean;
    sensations: boolean;
    usage: boolean;
    flavors: boolean;
    games: boolean;
    target: boolean;
    price: boolean;
}

interface UseProductFiltersReturn {
    selectedCategories: string[];
    setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
    selectedSensations: string[];
    setSelectedSensations: React.Dispatch<React.SetStateAction<string[]>>;
    sortOrder: string;
    setSortOrder: React.Dispatch<React.SetStateAction<string>>;
    priceRange: PriceRange;
    setPriceRange: React.Dispatch<React.SetStateAction<PriceRange>>;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    isFilterOpen: boolean;
    setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
    expanded: ExpandedState;
    toggleSection: (section: keyof ExpandedState) => void;
    categories: string[];
    sensations: string[];
    handleCategoryChange: (category: string) => void;
    handleSensationChange: (sensation: string) => void;
    selectedProductFilters: string[];
    setSelectedProductFilters: React.Dispatch<React.SetStateAction<string[]>>;
    selectedTarget: string[];
    setSelectedTarget: React.Dispatch<React.SetStateAction<string[]>>;
    handleProductFilterChange: (filter: string) => void;
    handleTargetChange: (target: string) => void;
    gameTypes: string[];
    flavorOptions: string[];
    usageOptions: string[];
    targetAudiences: string[];
    clearFilters: () => void;
    filteredAndSortedProducts: Product[];
}

export const useProductFilters = (products: Product[]): UseProductFiltersReturn => {
    // States for filters
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedSensations, setSelectedSensations] = useState<string[]>([]);
    const [selectedProductFilters, setSelectedProductFilters] = useState<string[]>([]); // Formerly usage: 'anale', 'vaginale', 'orale', flavors etc.
    const [selectedTarget, setSelectedTarget] = useState<string[]>([]); // 'uomo', 'donna', 'unisex'
    const [sortOrder, setSortOrder] = useState<string>('newest'); // 'asc', 'desc', 'newest', 'oldest'
    const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 200 }); // Ajustable range
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

    // Search with Debounce
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');

    // Debounce effect
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300); // 300ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    // Collapsible sections state
    const [expanded, setExpanded] = useState<ExpandedState>({
        categories: false,
        sensations: false,
        usage: false,
        flavors: false,
        games: false,
        target: false,
        price: true
    });

    const categories = useMemo(() => {
        if (!products) return [];
        return [...new Set(products.map(p => p.category))];
    }, [products]);

    // Helper: Split selectedProductFilters into Games, Flavors, and Usage Area for isolated filtering
    const { selectedGames, selectedFlavors, selectedUsage } = useMemo(() => {
        const games: string[] = [];
        const flavors: string[] = [];
        const usage: string[] = [];

        selectedProductFilters.forEach(val => {
            if (GAME_VALUES.includes(val)) {
                games.push(val);
            } else {
                const matchesOil = products?.some(p => {
                    const pVal = p.productFilter?.trim() || p.usageArea?.trim();
                    return pVal && pVal.toLowerCase() === val.toLowerCase() && p.category === 'Olio commestibile';
                });

                if (matchesOil) {
                    flavors.push(val);
                } else {
                    usage.push(val);
                }
            }
        });
        return { selectedGames: games, selectedFlavors: flavors, selectedUsage: usage };
    }, [selectedProductFilters, products]);

    // Dynamic sensations based on selected categories and other filters
    const sensations = useMemo(() => {
        if (selectedFlavors.length > 0 || selectedGames.length > 0) {
            return [];
        }
        if (selectedCategories.includes('Gioco')) {
            return [];
        }

        let relevantProducts = products || [];

        if (selectedCategories.length > 0) {
            relevantProducts = relevantProducts.filter(p => selectedCategories.includes(p.category));
        }

        if (selectedProductFilters.length > 0) {
            relevantProducts = relevantProducts.filter(p => {
                const pFilter = p.productFilter;
                return pFilter && selectedProductFilters.includes(pFilter);
            });
        }

        if (selectedTarget.length > 0) {
            relevantProducts = relevantProducts.filter(p => {
                const pTarget = p.targetAudience;
                return pTarget && selectedTarget.includes(pTarget);
            });
        }

        return [...new Set(relevantProducts.map(p => p.sensation).filter((s): s is string => !!s))];
    }, [selectedCategories, selectedProductFilters, selectedTarget, products, selectedFlavors, selectedGames]);


    // Helper for robust deduplication and normalization
    const getUniqueOptions = useCallback((productList: Product[], allowedValues: string[] | null, excludeValues: string[] = []) => {
        const optionsMap = new Map<string, string>();

        productList.forEach(p => {
            const rawValue = p.productFilter?.trim() || p.usageArea?.trim();
            if (!rawValue) return;

            if (allowedValues && !allowedValues.includes(rawValue)) return;
            if (excludeValues.length > 0 && excludeValues.includes(rawValue)) return;

            const key = rawValue.toLowerCase();
            if (!optionsMap.has(key)) {
                const display = rawValue.charAt(0).toUpperCase() + rawValue.slice(1);
                optionsMap.set(key, display);
            }
        });

        return Array.from(optionsMap.values()).sort((a, b) => a.localeCompare(b));
    }, []);

    const commonBaseProducts = useMemo(() => {
        let result = products || [];
        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.category));
        }
        if (selectedSensations.length > 0) {
            result = result.filter(p => p.sensation && selectedSensations.includes(p.sensation));
        }
        return result;
    }, [products, selectedCategories, selectedSensations]);

    const relevantProductsForProductFilter = useMemo(() => {
        let result = commonBaseProducts;
        if (selectedProductFilters.length > 0) {
            const normalizedFilters = selectedProductFilters.map(f => f.toLowerCase());
            result = result.filter(p => {
                const trimmed = p.productFilter?.trim();
                const trimmedUsage = p.usageArea?.trim();
                const val = trimmed || trimmedUsage;
                return val && normalizedFilters.includes(val.toLowerCase());
            });
        }
        return result;
    }, [commonBaseProducts, selectedProductFilters]);


    const productsForGames = useMemo(() => {
        if (selectedFlavors.length > 0 || selectedUsage.length > 0) {
            return [];
        }
        return commonBaseProducts.filter(p => p.category === 'Gioco');
    }, [commonBaseProducts, selectedFlavors, selectedUsage]);

    const productsForFlavors = useMemo(() => {
        if (selectedGames.length > 0 || selectedUsage.length > 0) {
            return [];
        }
        return commonBaseProducts.filter(p => p.category === 'Olio commestibile');
    }, [commonBaseProducts, selectedGames, selectedUsage]);

    const productsForUsage = useMemo(() => {
        if (selectedFlavors.length > 0 || selectedGames.length > 0) {
            return [];
        }
        return commonBaseProducts.filter(p =>
            p.category !== 'Gioco' && p.category !== 'Olio commestibile'
        );
    }, [commonBaseProducts, selectedFlavors, selectedGames]);


    const gameTypes = useMemo(() => {
        return getUniqueOptions(productsForGames, GAME_VALUES, []);
    }, [productsForGames, getUniqueOptions]);

    const flavorOptions = useMemo(() => {
        const optionsMap = new Set<string>();
        productsForFlavors.forEach(p => {
            const val = p.productFilter?.trim() || p.usageArea?.trim();
            if (val && p.category === 'Olio commestibile') {
                optionsMap.add(val.charAt(0).toUpperCase() + val.slice(1).toLowerCase());
            }
        });
        return Array.from(optionsMap).sort((a, b) => a.localeCompare(b));
    }, [productsForFlavors]);

    const usageOptions = useMemo(() => {
        const optionsMap = new Set<string>();
        productsForUsage.forEach(p => {
            const val = p.productFilter?.trim() || p.usageArea?.trim();
            if (!val) return;

            const isGame = p.category === 'Gioco' || GAME_VALUES.includes(val);
            const isFlavor = p.category === 'Olio commestibile';

            if (!isGame && !isFlavor) {
                optionsMap.add(val.charAt(0).toUpperCase() + val.slice(1).toLowerCase());
            }
        });
        return Array.from(optionsMap).sort((a, b) => a.localeCompare(b));
    }, [productsForUsage]);

    const targetAudiences = useMemo(() => {
        return [...new Set(relevantProductsForProductFilter.map(p => p.targetAudience?.trim()).filter((t): t is string => !!t))];
    }, [relevantProductsForProductFilter]);

    useEffect(() => {
        // eslint-disable-next-line
        setSelectedSensations(prev => prev.filter(s => sensations.includes(s)));
    }, [sensations]);

    // UseCallback wrappers
    const toggleSection = useCallback((section: keyof ExpandedState) => {
        setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    }, []);

    const handleCategoryChange = useCallback((category: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category);
            } else {
                return [...prev, category];
            }
        });
    }, []);

    const handleSensationChange = useCallback((sensation: string) => {
        setSelectedSensations(prev => {
            if (prev.includes(sensation)) {
                return prev.filter(s => s !== sensation);
            } else {
                return [...prev, sensation];
            }
        });
    }, []);

    const handleProductFilterChange = useCallback((filter: string) => {
        setSelectedProductFilters(prev => {
            if (prev.includes(filter)) {
                return prev.filter(u => u !== filter);
            } else {
                return [...prev, filter];
            }
        });
    }, []);

    const handleTargetChange = useCallback((target: string) => {
        setSelectedTarget(prev => {
            if (prev.includes(target)) {
                return prev.filter(t => t !== target);
            } else {
                return [...prev, target];
            }
        });
    }, []);

    const clearFilters = useCallback(() => {
        setSelectedCategories([]);
        setSelectedSensations([]);
        setSelectedProductFilters([]);
        setSelectedTarget([]);
        setSortOrder('newest');
        setPriceRange({ min: 0, max: 200 });
        setIsFilterOpen(false);
        setSearchQuery('');
    }, []);

    // Filtering and Sorting logic - Optimized with debouncedSearchQuery
    const filteredAndSortedProducts = useMemo(() => {
        if (!products) return [];
        let result = [...products];

        // Filter by Search Query - USING DEBOUNCED VALUE
        if (debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase();
            result = result.filter(p =>
                (p.name && p.name.toLowerCase().includes(query)) ||
                (p.category && p.category.toLowerCase().includes(query)) ||
                (p.brand && p.brand?.toLowerCase().includes(query)) ||
                (p.usageArea && p.usageArea?.toLowerCase().includes(query)) ||
                (p.targetAudience && p.targetAudience?.toLowerCase().includes(query)) ||
                (p.description && p.description?.toLowerCase().includes(query))
            );
        }

        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.category));
        }

        if (selectedSensations.length > 0) {
            result = result.filter(p => p.sensation && selectedSensations.includes(p.sensation));
        }

        if (selectedProductFilters.length > 0) {
            const normalizedSelection = selectedProductFilters.map(u => u.toLowerCase());

            result = result.filter(p => {
                const val = (p.productFilter || p.usageArea)?.trim().toLowerCase();
                return val && normalizedSelection.includes(val);
            });
        }

        if (selectedTarget.length > 0) {
            const normalizedSelection = selectedTarget.map(t => t.toLowerCase());

            result = result.filter(p => {
                const productTarget = p.targetAudience?.trim().toLowerCase();
                return productTarget && normalizedSelection.includes(productTarget);
            });
        }

        result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

        switch (sortOrder) {
            case 'asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                result.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                });
                break;
            case 'oldest':
                result.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateA - dateB;
                });
                break;
            default:
                break;
        }

        return result;
    }, [products, selectedCategories, selectedSensations, selectedProductFilters, selectedTarget, priceRange, sortOrder, debouncedSearchQuery]); // Changed dependency to debouncedSearchQuery

    return {
        selectedCategories,
        setSelectedCategories,
        selectedSensations,
        setSelectedSensations,
        sortOrder,
        setSortOrder,
        priceRange,
        setPriceRange,
        searchQuery,
        setSearchQuery,
        isFilterOpen,
        setIsFilterOpen,
        expanded,
        toggleSection,
        categories,
        sensations,
        handleCategoryChange,
        handleSensationChange,
        selectedProductFilters,
        setSelectedProductFilters,
        selectedTarget,
        setSelectedTarget,
        handleProductFilterChange,
        handleTargetChange,
        gameTypes,
        flavorOptions,
        usageOptions,
        targetAudiences,
        clearFilters,
        filteredAndSortedProducts
    };
};
