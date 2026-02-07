import { useState, useMemo, useEffect } from 'react';

// Game-specific values (from Gioco category) - Constant moved outside
const GAME_VALUES = ['Dadi', 'Carte', 'Roulette'];

export const useProductFilters = (products) => {
    // States for filters
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSensations, setSelectedSensations] = useState([]);
    const [selectedProductFilters, setSelectedProductFilters] = useState([]); // Formerly usage: 'anale', 'vaginale', 'orale', flavors etc.
    const [selectedTarget, setSelectedTarget] = useState([]); // 'uomo', 'donna', 'unisex'
    const [sortOrder, setSortOrder] = useState('newest'); // 'asc', 'desc', 'newest', 'oldest'
    const [priceRange, setPriceRange] = useState({ min: 0, max: 200 }); // Ajustable range
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Collapsible sections state
    const [expanded, setExpanded] = useState({
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

    // Game-specific values (moved outside)

    // Helper: Split selectedProductFilters into Games, Flavors, and Usage Area for isolated filtering
    // Must be defined BEFORE sensations memo to use as dependency
    const { selectedGames, selectedFlavors, selectedUsage } = useMemo(() => {
        const games = [];
        const flavors = [];
        const usage = [];

        selectedProductFilters.forEach(val => {
            if (GAME_VALUES.includes(val)) {
                games.push(val);
            } else {
                // Check if any product with this filter value is an Oil
                // Loop over products is safe as this runs deeply
                const matchesOil = products?.some(p => {
                    const pVal = p.productFilter?.trim() || p.usageArea?.trim();
                    return pVal && pVal.toLowerCase() === val.toLowerCase() && p.category === 'Olio commestibile';
                });

                if (matchesOil) {
                    flavors.push(val);
                } else {
                    usage.push(val); // Default fallback if not Oil or Game -> Usage
                }
            }
        });
        return { selectedGames: games, selectedFlavors: flavors, selectedUsage: usage };
    }, [selectedProductFilters, products]);

    // Dynamic sensations based on selected categories
    // Dynamic sensations based on selected categories and other filters
    const sensations = useMemo(() => {
        // STRICT FACET RULE: If Flavors (Oils) or Games are selected, HIDE Sensations entirely.
        if (selectedFlavors.length > 0 || selectedGames.length > 0) {
            return [];
        }

        // STRICT CATEGORY RULE: Games do NOT use sensations.
        if (selectedCategories.includes('Gioco')) {
            return [];
        }

        let relevantProducts = products || [];

        // Filter by Category
        if (selectedCategories.length > 0) {
            relevantProducts = relevantProducts.filter(p => selectedCategories.includes(p.category));
        }

        // Filter by Product Filter (Usage Area / Flavor / Game Type)
        if (selectedProductFilters.length > 0) {
            relevantProducts = relevantProducts.filter(p => selectedProductFilters.includes(p.productFilter));
        }

        // Filter by Target Audience
        if (selectedTarget.length > 0) {
            relevantProducts = relevantProducts.filter(p => selectedTarget.includes(p.targetAudience));
        }

        return [...new Set(relevantProducts.map(p => p.sensation).filter(Boolean))];
    }, [selectedCategories, selectedProductFilters, selectedTarget, products, selectedFlavors, selectedGames]);

    // Helper to get products currently relevant base on other filters (Concept: Cascading Filters)
    // Products filtered here determine which filter options are visible
    // Game-specific values (from Gioco category)


    // Helper for robust deduplication and normalization
    const getUniqueOptions = (productList, allowedValues, excludeValues = []) => {
        const optionsMap = new Map(); // Key (lowercase) -> DisplayValue

        productList.forEach(p => {
            const rawValue = p.productFilter?.trim() || p.usageArea?.trim();
            if (!rawValue) return;

            // If we have an allow-list, strict check
            if (allowedValues && !allowedValues.includes(rawValue)) return;

            // If we have an exclude-list, strict check
            if (excludeValues.length > 0 && excludeValues.includes(rawValue)) return;

            const key = rawValue.toLowerCase();
            // Store the first variation we see (or could force Title Case here)
            if (!optionsMap.has(key)) {
                // Capitalize first letter just in case
                const display = rawValue.charAt(0).toUpperCase() + rawValue.slice(1);
                optionsMap.set(key, display);
            }
        });

        return Array.from(optionsMap.values()).sort();
    };



    // commonBaseProducts: Filtered by Category and Sensation (Base for both specific lists)
    const commonBaseProducts = useMemo(() => {
        let result = products || [];
        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.category));
        }
        if (selectedSensations.length > 0) {
            result = result.filter(p => selectedSensations.includes(p.sensation));
        }
        return result;
    }, [products, selectedCategories, selectedSensations]);

    // Helper to get products currently relevant based on other filters (Concept: Cascading Filters)
    // This one includes ALL selectedProductFilters, used for downstream filters like Target Audience
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


    // productsForGames: Used to calculate available Game options.
    // FILTER: Base + Selected Usage Areas (Cascading).
    // DO NOT FILTER by Selected Games (to keep other game options visible - Multi-select OR logic).
    // productsForGames: Used to calculate available Game options.
    // FILTER: Base + Selected General Options (Cascading).
    // DO NOT FILTER by Selected Games (to keep other game options visible - Multi-select OR logic).
    // --- FACETED OPTIONS GENERATION ---

    // 1. Products relevant for GAME OPTIONS
    // STRICT FACET RULE: Hide games if flavors or usage are selected
    const productsForGames = useMemo(() => {
        if (selectedFlavors.length > 0 || selectedUsage.length > 0) {
            return [];
        }

        // Show all game products from the base set
        return commonBaseProducts.filter(p => p.category === 'Gioco');
    }, [commonBaseProducts, selectedFlavors, selectedUsage]);

    // 2. Products relevant for FLAVOR OPTIONS
    // STRICT FACET RULE: Hide flavors if games or usage are selected
    const productsForFlavors = useMemo(() => {
        if (selectedGames.length > 0 || selectedUsage.length > 0) {
            return [];
        }

        // Show all oil products from the base set
        return commonBaseProducts.filter(p => p.category === 'Olio commestibile');
    }, [commonBaseProducts, selectedGames, selectedUsage]);


    // 3. Products relevant for USAGE OPTIONS
    // STRICT FACET RULE: Hide usage if flavors or games are selected
    const productsForUsage = useMemo(() => {
        if (selectedFlavors.length > 0 || selectedGames.length > 0) {
            return [];
        }

        // Show all non-game, non-oil products from the base set
        return commonBaseProducts.filter(p =>
            p.category !== 'Gioco' && p.category !== 'Olio commestibile'
        );
    }, [commonBaseProducts, selectedFlavors, selectedGames]);


    // Dynamic Game Types
    const gameTypes = useMemo(() => {
        return getUniqueOptions(productsForGames, GAME_VALUES, []);
    }, [productsForGames]);

    // Dynamic Flavor Options (Oils)
    const flavorOptions = useMemo(() => {
        // Collect Only flavors (oils)
        // We iterate productsForFlavors but ONLY keep items that are effectively flavors
        const optionsMap = new Set();
        productsForFlavors.forEach(p => {
            const val = p.productFilter?.trim() || p.usageArea?.trim();
            if (val && p.category === 'Olio commestibile') {
                optionsMap.add(val.charAt(0).toUpperCase() + val.slice(1).toLowerCase());
            }
        });
        return Array.from(optionsMap).sort();
    }, [productsForFlavors]);

    // Dynamic Usage Options (Others)
    const usageOptions = useMemo(() => {
        // Collect anything that is NOT a Game AND NOT a Flavor
        const optionsMap = new Set();
        productsForUsage.forEach(p => {
            const val = p.productFilter?.trim() || p.usageArea?.trim();
            if (!val) return;

            const isGame = p.category === 'Gioco' || GAME_VALUES.includes(val);
            const isFlavor = p.category === 'Olio commestibile';

            if (!isGame && !isFlavor) {
                optionsMap.add(val.charAt(0).toUpperCase() + val.slice(1).toLowerCase());
            }
        });
        return Array.from(optionsMap).sort();
    }, [productsForUsage]);








    // Dynamic Target Audiences (for Fragrances etc)
    const targetAudiences = useMemo(() => {
        return [...new Set(relevantProductsForProductFilter.map(p => p.targetAudience?.trim()).filter(Boolean))];
    }, [relevantProductsForProductFilter]);

    // Auto-deselect sensations that are no longer available
    useEffect(() => {
        // eslint-disable-next-line
        setSelectedSensations(prev => prev.filter(s => sensations.includes(s)));
    }, [sensations]);

    // Toggle logic
    const toggleSection = (section) => {
        setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCategoryChange = (category) => {
        setSelectedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category);
            } else {
                return [...prev, category];
            }
        });
    };

    const handleSensationChange = (sensation) => {
        setSelectedSensations(prev => {
            if (prev.includes(sensation)) {
                return prev.filter(s => s !== sensation);
            } else {
                return [...prev, sensation];
            }
        });
    };

    const handleProductFilterChange = (filter) => {
        setSelectedProductFilters(prev => {
            if (prev.includes(filter)) {
                return prev.filter(u => u !== filter);
            } else {
                return [...prev, filter];
            }
        });
    };

    const handleTargetChange = (target) => {
        setSelectedTarget(prev => {
            if (prev.includes(target)) {
                return prev.filter(t => t !== target);
            } else {
                return [...prev, target];
            }
        });
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedSensations([]);
        setSelectedProductFilters([]);
        setSelectedTarget([]);
        setSortOrder('newest');
        setPriceRange({ min: 0, max: 200 });
        setIsFilterOpen(false);
    };

    // Filtering and Sorting logic
    const filteredAndSortedProducts = useMemo(() => {
        if (!products) return [];
        let result = [...products];

        // Filter by Search Query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                (p.name && p.name.toLowerCase().includes(query)) ||
                (p.category && p.category.toLowerCase().includes(query)) ||
                (p.brand && p.brand.toLowerCase().includes(query)) ||
                (p.usageArea && p.usageArea.toLowerCase().includes(query)) ||
                (p.targetAudience && p.targetAudience.toLowerCase().includes(query)) ||
                (p.description && p.description.toLowerCase().includes(query))
            );
        }

        // Filter by Category
        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.category));
        }

        // Filter by Sensation
        if (selectedSensations.length > 0) {
            result = result.filter(p => selectedSensations.includes(p.sensation));
        }

        // Filter by Product Filter (Usage Area) (Case Insensitive & Trimmed match)
        if (selectedProductFilters.length > 0) {
            // Normalize selection to lowercase for matching
            const normalizedSelection = selectedProductFilters.map(u => u.toLowerCase());

            result = result.filter(p => {
                const val = (p.productFilter || p.usageArea)?.trim().toLowerCase();
                return val && normalizedSelection.includes(val);
            });
        }

        // Filter by Target Audience (Case Insensitive & Trimmed match)
        if (selectedTarget.length > 0) {
            const normalizedSelection = selectedTarget.map(t => t.toLowerCase());

            result = result.filter(p => {
                const productTarget = p.targetAudience?.trim().toLowerCase();
                return productTarget && normalizedSelection.includes(productTarget);
            });
        }

        // Filter by Price
        result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

        // Sort
        switch (sortOrder) {
            case 'asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            default:
                break;
        }

        return result;
    }, [products, selectedCategories, selectedSensations, selectedProductFilters, selectedTarget, priceRange, sortOrder, searchQuery]);

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
