import React, { useState, useEffect, useRef } from 'react';
import { Search, AlertTriangle, Loader2, MapPin } from 'lucide-react';
import { provinces } from '@/features/cart/data/italy_provinces';
import Select from '@/components/ui/Select';

interface AddressAutocompleteProps {
    formData: any; // Ideally this should be a shared CheckoutForm interface
    setFormData: (data: any) => void;
    errors: Record<string, string>;
    setErrors: (errors: Record<string, string>) => void;
}

interface RadarAddress {
    addressLabel?: string;
    formattedAddress?: string;
    city?: string;
    placeLabel?: string;
    stateCode?: string;
    postalCode?: string;
    street?: string;
    number?: string;
    county?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
}

const AddressAutocomplete = ({ formData, setFormData, errors, setErrors }: AddressAutocompleteProps) => {
    const [query, setQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<RadarAddress[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [addressVerified, setAddressVerified] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<string | null>(null); // New validation state
    const [isValidating, setIsValidating] = useState<boolean>(false); // New loading state
    const wrapperRef = useRef<HTMLDivElement>(null);

    const API_KEY = import.meta.env.VITE_RADAR_KEY;

    const fetchSuggestions = async (text: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `https://api.radar.io/v1/search/autocomplete?query=${encodeURIComponent(text)}&country=IT&layers=address,street&limit=8`,
                {
                    headers: {
                        'Authorization': API_KEY
                    }
                }
            );
            const data = await response.json();
            setSuggestions(data.addresses || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Error fetching address:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 4 && !addressVerified) {
                fetchSuggestions(query);
            }
        }, 450);

        return () => clearTimeout(timer);
    }, [query, addressVerified, API_KEY]);
    // fetchSuggestions is stable enough here essentially, suppressing dep warning implicitly by not listing it
    // because listing it requires wrapping it in useCallback which requires API_KEY in dep... cyclical logic.
    // It is fine.

    // Close suggestions on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    // New: Validate CAP vs City
    const validateLocation = async () => {
        const { cap, citta } = formData;
        if (!cap || !citta || cap.length < 5) return;

        setIsValidating(true);
        setValidationError(null);

        try {
            // Search specifically for the CAP and City combination
            const response = await fetch(
                `https://api.radar.io/v1/search/autocomplete?query=${encodeURIComponent(`${cap} ${citta}`)}&country=IT&layers=postalCode,locality&limit=1`,
                { headers: { 'Authorization': API_KEY } }
            );
            const data = await response.json();

            if (!data.addresses || data.addresses.length === 0) {
                setValidationError('Indirizzo non trovato o CAP non valido per questo comune.');
                return;
            }

            const match: RadarAddress = data.addresses[0];

            // Loose comparison (case insensitive)
            const cityMatch = match.city?.toLowerCase().includes(citta.toLowerCase()) ||
                citta.toLowerCase().includes(match.city?.toLowerCase() || '');

            // Check matching (allow some flexibility)
            if (!cityMatch && match.postalCode !== cap) {
                setValidationError(`Il CAP ${cap} sembra non corrispondere a ${citta}.`);
            } else {
                setValidationError(null); // Valid
            }

        } catch (error) {
            console.error("Validation error:", error);
        } finally {
            setIsValidating(false);
        }
    };

    const handleSelect = (item: RadarAddress) => {
        // Radar Item Structure
        const props = item;

        // Helper to find province code by name
        const findProvinceCode = (apiProps: RadarAddress) => {
            // 1. Try direct match with stateCode (e.g., 'RM')
            if (apiProps.stateCode && apiProps.stateCode.length === 2) {
                const code = apiProps.stateCode.toUpperCase();
                // Validate it exists in our list
                const match = provinces.find(p => p.code === code);
                if (match) return match.code;
            }

            // 2. Search by Name (County/Province name)
            // Radar puts Province in 'county' often, but sometimes in 'state' or even 'city' for some regions
            const searchTerms = [apiProps.county, apiProps.city, apiProps.state].filter(Boolean) as string[];

            for (const term of searchTerms) {
                const cleanTerm = term.toLowerCase();
                // Find strict or partial match (e.g. "Città Metropolitana di Roma" contains "Roma")
                const match = provinces.find(p =>
                    p.name.toLowerCase() === cleanTerm ||
                    cleanTerm.includes(p.name.toLowerCase())
                );
                if (match) return match.code;
            }

            return '';
        };

        const provinceCode = findProvinceCode(props);

        // Auto-fill form data
        const newData = {
            ...formData,
            indirizzo: props.street || props.addressLabel || '', // Prioritize pure street name to avoid number duplication
            civico: props.number || '',
            cap: props.postalCode || '',
            citta: props.city || props.placeLabel || '',
            provincia: provinceCode,
            latitude: props.latitude,
            longitude: props.longitude
            // Keep existing details
        };

        setFormData(newData);
        setQuery(`${props.street || props.addressLabel || props.formattedAddress}`); // Update input to show only street
        setShowSuggestions(false);
        setAddressVerified(true);

        // Clear hard errors if valid
        if (props.postalCode) clearError('cap');
        if (props.city) clearError('citta');
        if (provinceCode) clearError('provincia');
    };

    const handleManualChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });

        // Mark as needing review if core fields change after verification
        if (addressVerified && ['indirizzo', 'civico', 'cap', 'citta', 'provincia'].includes(field)) {
            // We could set a specific 'needs_review' flag here if needed
        }
    };

    // Helper to update query input manually
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setAddressVerified(false); // Reset verification on manual edit

        // CRITICAL FIX: Also update form data immediately for manual entry
        setFormData((prev: any) => ({ ...prev, indirizzo: val }));

        setShowSuggestions(true);
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    return (
        <div className="space-y-4" ref={wrapperRef}>

            {/* 1. Address Search (Indirizzo) */}
            <div className="relative">
                <label htmlFor="checkout-address" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                    Indirizzo (Inizia a scrivere...)
                </label>
                <div className="relative">
                    <input
                        id="checkout-address"
                        name="indirizzo"
                        type="text"
                        value={query || formData.indirizzo} // Fallback to formData if query empty
                        onChange={handleQueryChange}
                        placeholder="Es. Via Roma"
                        className={`w-full bg-background-dark border ${errors.indirizzo ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-text-primary hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />

                    {isLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="animate-spin text-accent" size={18} />
                        </div>
                    )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-[60] left-0 right-0 mt-2 bg-background-alt border border-white/10 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                        {suggestions.map((item, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleSelect(item)}
                                className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-start gap-3 border-b border-white/5 last:border-0"
                            >
                                <MapPin className="text-accent mt-1 flex-shrink-0" size={16} />
                                <div>
                                    <div className="text-text-primary text-sm font-medium">
                                        {item.addressLabel || item.formattedAddress}
                                    </div>
                                    <div className="text-text-muted text-xs">
                                        {item.city}, {item.stateCode} {item.postalCode}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* 2. Civico */}
                <div className="space-y-1">
                    <label htmlFor="checkout-civico" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                        N. Civico *
                    </label>
                    <input
                        id="checkout-civico"
                        name="civico"
                        type="text"
                        value={formData.civico}
                        onChange={(e) => handleManualChange('civico', e.target.value)}
                        placeholder="12/A"
                        className={`w-full bg-background-dark border ${errors.civico ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                    />
                </div>

                {/* 3. CAP */}
                <div className="space-y-1">
                    <label htmlFor="checkout-cap" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                        CAP *
                    </label>
                    <input
                        id="checkout-cap"
                        name="cap"
                        type="text"
                        value={formData.cap}
                        onChange={(e) => handleManualChange('cap', e.target.value)}
                        onBlur={validateLocation} // Trigger validation
                        placeholder="00100"
                        maxLength={5}
                        className={`w-full bg-background-dark border ${errors.cap || validationError ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                    />
                    {/* Validation Feedback */}
                    {isValidating && <span className="text-xs text-text-muted absolute right-3 mt-4">Verificando...</span>}
                    {validationError && <p className="text-red-400 text-xs ml-1 mt-1">{validationError}</p>}
                    {errors.cap && <p className="text-red-400 text-xs ml-1">{errors.cap}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* 4. Comune */}
                <div className="space-y-1">
                    <label htmlFor="checkout-city" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                        Comune *
                    </label>
                    <input
                        id="checkout-city"
                        name="citta"
                        type="text"
                        value={formData.citta}
                        onChange={(e) => handleManualChange('citta', e.target.value)}
                        onBlur={validateLocation} // Trigger validation
                        placeholder="Roma"
                        className={`w-full bg-background-dark border ${errors.citta ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                    />
                    {errors.citta && <p className="text-red-400 text-xs ml-1">{errors.citta}</p>}
                </div>

                {/* 5. Provincia */}
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                        Provincia *
                    </label>
                    <Select
                        value={formData.provincia}
                        onChange={(val) => handleManualChange('provincia', val)}
                        options={provinces.map(p => ({ value: p.code, label: `${p.name} (${p.code})` }))}
                        placeholder="Seleziona"
                        className={`w-full ${errors.provincia ? 'border-red-500' : ''}`}
                    />
                    {errors.provincia && <p className="text-red-400 text-xs ml-1">{errors.provincia}</p>}
                </div>
            </div>

            {/* 6. Dettagli */}
            <div className="space-y-1">
                <label htmlFor="checkout-details" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                    Dettagli (Scala, Piano, Citofono)
                </label>
                <input
                    id="checkout-details"
                    name="dettagli"
                    type="text"
                    value={formData.dettagli}
                    onChange={(e) => handleManualChange('dettagli', e.target.value)}
                    placeholder="Scala A, Int 4..."
                    className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-text-primary hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all"
                />
            </div>



            {/* Soft Validation Warning */}
            {addressVerified && (formData.cap.length !== 5 || formData.provincia.length !== 2) && (
                <div className="flex items-start gap-2 text-yellow-400 text-xs bg-yellow-400/10 p-2 rounded-lg">
                    <AlertTriangle size={14} className="mt-0.5" />
                    <span>Verifica CAP e Provincia: potrebbero non essere corretti.</span>
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete;
