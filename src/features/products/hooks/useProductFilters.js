import { useState, useMemo, useEffect } from 'react';

export const useProductFilters = (products) => {
    // States for filters
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSensations, setSelectedSensations] = useState([]);
    const [selectedUsage, setSelectedUsage] = useState([]); // 'anale', 'vaginale', 'orale' etc.
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
        target: false,
        price: true
    });

    const categories = useMemo(() => {
        if (!products) return [];
        return [...new Set(products.map(p => p.category))];
    }, [products]);

    // Dynamic sensations based on selected categories
    // Dynamic sensations based on selected categories and other filters
    const sensations = useMemo(() => {
        let relevantProducts = products || [];

        // Filter by Category
        if (selectedCategories.length > 0) {
            relevantProducts = relevantProducts.filter(p => selectedCategories.includes(p.category));
        }

        // Filter by Usage Area (User Requirement: Context-aware sensations)
        if (selectedUsage.length > 0) {
            relevantProducts = relevantProducts.filter(p => selectedUsage.includes(p.usageArea));
        }

        // Filter by Target Audience
        if (selectedTarget.length > 0) {
            relevantProducts = relevantProducts.filter(p => selectedTarget.includes(p.targetAudience));
        }

        return [...new Set(relevantProducts.map(p => p.sensation).filter(Boolean))];
    }, [selectedCategories, selectedUsage, selectedTarget, products]);

    // Helper to get products currently relevant base on other filters (Concept: Cascading Filters)
    // We want usageAreas to be visible if the products currently in view (filtered by category AND sensation) have usageAreas.
    const relevantProductsForUsage = useMemo(() => {
        let result = products || [];
        // Filter by Category if selected
        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.category));
        }
        // Filter by Sensation if selected
        if (selectedSensations.length > 0) {
            result = result.filter(p => selectedSensations.includes(p.sensation));
        }
        return result;
    }, [products, selectedCategories, selectedSensations]);


    // Dynamic Usage Areas (only for Lubricants effectively, but generic logic)
    const usageAreas = useMemo(() => {
        // If no products remain after category/sensation filtering, or none of them have usageArea -> list is empty -> Filter UI hides.
        return [...new Set(relevantProductsForUsage.map(p => p.usageArea).filter(Boolean))];
    }, [relevantProductsForUsage]);

    // Dynamic Target Audiences (for Fragrances etc)
    const targetAudiences = useMemo(() => {
        return [...new Set(relevantProductsForUsage.map(p => p.targetAudience).filter(Boolean))];
    }, [relevantProductsForUsage]);

    // Auto-deselect sensations that are no longer available
    useEffect(() => {
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

    const handleUsageChange = (usage) => {
        setSelectedUsage(prev => {
            if (prev.includes(usage)) {
                return prev.filter(u => u !== usage);
            } else {
                return [...prev, usage];
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
        setSelectedUsage([]);
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

        // Filter by Usage Area
        if (selectedUsage.length > 0) {
            result = result.filter(p => selectedUsage.includes(p.usageArea));
        }

        // Filter by Target Audience
        if (selectedTarget.length > 0) {
            result = result.filter(p => selectedTarget.includes(p.targetAudience));
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
    }, [products, selectedCategories, selectedSensations, selectedUsage, selectedTarget, priceRange, sortOrder, searchQuery]);

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
        selectedUsage,
        setSelectedUsage,
        selectedTarget,
        setSelectedTarget,
        handleUsageChange,
        handleTargetChange,
        usageAreas,
        targetAudiences,
        clearFilters,
        filteredAndSortedProducts
    };
};
