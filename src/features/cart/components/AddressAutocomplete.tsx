import React, { useState, useEffect, useRef } from 'react';
import { Search, AlertTriangle, Loader2, MapPin, CheckCircle } from 'lucide-react';
import { provinces } from '@/features/cart/data/italy_provinces';
import Select from '@/components/ui/Select';

interface AddressAutocompleteProps {
    register: any;
    setValue: any;
    watch: any;
    errors: any;
    disabled?: boolean;
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

const AddressAutocomplete = ({ register, setValue, watch, errors, disabled }: AddressAutocompleteProps) => {
    const [query, setQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<RadarAddress[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [addressVerified, setAddressVerified] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState<boolean>(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

    // Load initial query if defined
    useEffect(() => {
        const currentAddr = watch('indirizzo');
        if (currentAddr && !query) {
            setQuery(currentAddr);
        }
    }, [watch('indirizzo')]);

    const fetchSuggestions = async (text: string) => {
        setIsLoading(true);
        const cap = watch('cap');
        const filter = cap && cap.length === 5 ? `&filter=postcode:${cap}` : '&filter=countrycode:it';

        try {
            const response = await fetch(
                `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&limit=8${filter}&apiKey=${GEOAPIFY_KEY}`
            );
            const data = await response.json();

            // Map Geoapify markers to a consistent format
            const geoSuggestions = data.features?.map((f: any) => ({
                addressLabel: f.properties.address_line1,
                formattedAddress: f.properties.formatted,
                city: f.properties.city || f.properties.municipality,
                stateCode: f.properties.state_code,
                postalCode: f.properties.postcode,
                street: f.properties.street,
                number: f.properties.housenumber,
                county: f.properties.county,
                state: f.properties.state,
            })) || [];

            setSuggestions(geoSuggestions);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Error fetching address suggestions:", error);
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
    }, [query, addressVerified, GEOAPIFY_KEY]);

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


    // New: Validate CAP vs City using Geoapify (better coverage)
    const validateLocation = async () => {
        const cap = watch('cap');
        const citta = watch('citta');
        const provincia = watch('provincia');

        if (!cap || cap.length < 5) return;

        // Truth in CAP: Clear fields relative to city/province as soon as we start validating a full CAP
        // This prevents browser autocomplete from sticking with wrong values.
        setValue('citta', '', { shouldDirty: true });
        setValue('provincia', '', { shouldDirty: true });

        setIsValidating(true);
        setValidationError(null);

        try {
            // Build query: if city is missing, search only by CAP to auto-fill
            const queryUrl = citta
                ? `https://api.geoapify.com/v1/geocode/search?postcode=${cap}&city=${encodeURIComponent(citta)}&country=Italy&limit=1&apiKey=${GEOAPIFY_KEY}`
                : `https://api.geoapify.com/v1/geocode/search?postcode=${cap}&country=Italy&limit=1&apiKey=${GEOAPIFY_KEY}`;

            const response = await fetch(queryUrl);
            const data = await response.json();

            if (!data.features || data.features.length === 0) {
                const isVerbania = ['28921', '28922', '28923', '28924', '28925', '28900'].includes(cap);
                if (isVerbania) {
                    setValue('citta', 'Verbania', { shouldDirty: true, shouldValidate: true });
                    setValue('provincia', 'VB', { shouldDirty: true, shouldValidate: true });
                    setValidationError(null);
                    return;
                }

                setValidationError('Non abbiamo riconosciuto questa combinazione CAP/Comune. Verifica che siano corretti.');
                return;
            }

            const match = data.features[0].properties;

            // Auto-fill: Force overwrite to ensure CAP truth
            if (match.postcode === cap) {
                setValue('citta', match.city || match.municipality || '', { shouldDirty: true, shouldValidate: true });

                const rawCode = (match.county_code || match.state_code || '').toUpperCase().replace('IT-', '');
                const countyName = (match.county || '').toLowerCase();

                const provinceMatch = provinces.find(p =>
                    p.code === rawCode ||
                    p.name.toLowerCase() === countyName ||
                    countyName.includes(p.name.toLowerCase())
                );

                if (provinceMatch) {
                    setValue('provincia', provinceMatch.code, { shouldDirty: true, shouldValidate: true });
                }
            }

            // Validation check if city was already present
            if (citta) {
                const cityMatch = match.city?.toLowerCase().includes(citta.toLowerCase()) ||
                    citta.toLowerCase().includes(match.city?.toLowerCase() || '') ||
                    match.municipality?.toLowerCase().includes(citta.toLowerCase());

                if (!cityMatch && match.postcode !== cap) {
                    setValidationError(`Il CAP ${cap} potrebbe non corrispondere a ${citta}. Verifica i dati.`);
                } else {
                    setValidationError(null);
                }
            }

        } catch (error) {
            console.error("Validation error:", error);
            setValidationError(null);
        } finally {
            setIsValidating(false);
        }
    };

    const handleSelect = (item: RadarAddress) => {
        const props = item;

        const findProvinceCode = (apiProps: RadarAddress) => {
            if (apiProps.stateCode && apiProps.stateCode.length === 2) {
                const code = apiProps.stateCode.toUpperCase();
                const match = provinces.find(p => p.code === code);
                if (match) return match.code;
            }
            const searchTerms = [apiProps.county, apiProps.city, apiProps.state].filter(Boolean) as string[];

            for (const term of searchTerms) {
                const cleanTerm = term.toLowerCase();
                const match = provinces.find(p =>
                    p.name.toLowerCase() === cleanTerm ||
                    cleanTerm.includes(p.name.toLowerCase())
                );
                if (match) return match.code;
            }

            return '';
        };

        const provinceCode = findProvinceCode(props);

        // Auto-fill form data using react-hook-form setValue
        const options = { shouldValidate: true, shouldDirty: true };
        setValue('indirizzo', props.street || props.addressLabel || '', options);
        setValue('civico', props.number || '', options);
        setValue('cap', props.postalCode || '', options);
        setValue('citta', props.city || props.placeLabel || '', options);
        setValue('provincia', provinceCode, options);

        setQuery(`${props.street || props.addressLabel || props.formattedAddress}`);
        setShowSuggestions(false);
        setAddressVerified(true);
    };

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setAddressVerified(false);
        setValue('indirizzo', val, { shouldDirty: true });
        setShowSuggestions(true);
    };

    const handleManualChange = (field: string, value: string) => {
        setValue(field, value, { shouldValidate: true, shouldDirty: true });
    };

    return (
        <div className="space-y-4" ref={wrapperRef}>

            {/* 1. CAP (Postal Code) - Start of the Funnel */}
            <div className="space-y-1">
                <label htmlFor="checkout-cap" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                    CAP (Codice Postale) *
                </label>
                <div className="relative">
                    <input
                        {...register('cap')}
                        id="checkout-cap"
                        type="text"
                        onBlur={validateLocation}
                        autoComplete="none"
                        placeholder={disabled ? "-" : "00100"}
                        maxLength={5}
                        className={`w-full bg-background-dark border ${errors.cap || validationError ? 'border-yellow-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all ${disabled ? 'opacity-40 cursor-not-allowed bg-white/5' : ''}`}
                    />
                    {isValidating && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="animate-spin text-accent" size={16} />
                        </div>
                    )}
                </div>
                {validationError && (
                    <div className="flex items-center gap-1.5 text-yellow-500 text-[10px] mt-1 ml-1 font-medium bg-yellow-500/5 p-1.5 rounded-lg border border-yellow-500/10">
                        <AlertTriangle size={12} />
                        <span>{validationError}</span>
                    </div>
                )}
                {errors.cap && <p className="text-red-400 text-xs ml-1">{errors.cap.message}</p>}
            </div>

            {/* 2. Provincia & Comune - Funnel Grid (General to Specific) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                        Provincia *
                    </label>
                    <div className="relative">
                        <Select
                            value={watch('provincia')}
                            onChange={(val) => handleManualChange('provincia', val)}
                            options={provinces.map(p => ({ value: p.code, label: `${p.name} (${p.code})` }))}
                            placeholder={disabled ? "-" : "Seleziona"}
                            disabled={disabled}
                            className={`w-full ${errors.provincia ? 'border-red-500' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                        />
                        {watch('provincia') && !errors.provincia && !isValidating && (
                            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-accent pointer-events-none">
                                <CheckCircle size={14} />
                            </div>
                        )}
                    </div>
                    {errors.provincia && <p className="text-red-400 text-xs ml-1">{errors.provincia.message}</p>}
                </div>

                <div className="space-y-1">
                    <label htmlFor="checkout-city" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                        Comune *
                    </label>
                    <div className="relative">
                        <input
                            {...register('citta')}
                            id="checkout-city"
                            type="text"
                            onBlur={validateLocation}
                            disabled={disabled}
                            autoComplete="none"
                            placeholder={disabled ? "-" : "Roma"}
                            className={`w-full bg-background-dark border ${errors.citta ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all ${disabled ? 'opacity-40 cursor-not-allowed bg-white/5' : ''}`}
                        />
                        {watch('citta') && !errors.citta && !isValidating && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-accent">
                                <CheckCircle size={14} />
                            </div>
                        )}
                    </div>
                    {errors.citta && <p className="text-red-400 text-xs ml-1">{errors.citta.message}</p>}
                </div>
            </div>

            {/* 3. Address Search (Indirizzo) - Filtered by CAP */}
            <div className="relative">
                <label htmlFor="checkout-address" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                    Indirizzo (Via, Piazza...) *
                </label>
                <div className="relative">
                    <input
                        id="checkout-address"
                        name="indirizzo"
                        type="text"
                        value={disabled ? '' : (query || watch('indirizzo'))}
                        onChange={handleQueryChange}
                        disabled={disabled}
                        autoComplete="none"
                        placeholder={disabled ? "Non richiesto per il ritiro" : "Inizia a scrivere la tua via..."}
                        className={`w-full bg-background-dark border ${errors.indirizzo ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-text-primary hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all ${disabled ? 'opacity-40 cursor-not-allowed bg-white/5' : ''}`}
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
                {errors.indirizzo && <p className="text-red-400 text-xs ml-1 mt-1">{errors.indirizzo.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* 4. Civico */}
                <div className="space-y-1">
                    <label htmlFor="checkout-civico" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                        N. Civico *
                    </label>
                    <input
                        {...register('civico')}
                        id="checkout-civico"
                        type="text"
                        disabled={disabled}
                        placeholder={disabled ? "-" : "12/A"}
                        className={`w-full bg-background-dark border ${errors.civico ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all ${disabled ? 'opacity-40 cursor-not-allowed bg-white/5' : ''}`}
                    />
                    {errors.civico && <p className="text-red-400 text-xs ml-1">{errors.civico.message}</p>}
                </div>

                {/* 5. Dettagli */}
                <div className="space-y-1">
                    <label htmlFor="checkout-details" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                        Interno / Citofono
                    </label>
                    <input
                        {...register('dettagli')}
                        id="checkout-details"
                        type="text"
                        disabled={disabled}
                        placeholder={disabled ? "Ritiro (Verbania)" : "Scala A, cit. 4..."}
                        className={`w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-text-primary hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all resize-none ${disabled ? 'opacity-40 cursor-not-allowed bg-white/5' : ''}`}
                    />
                </div>
            </div>

            {/* Success Feedback */}
            {addressVerified && !validationError && (
                <div className="flex items-center gap-2 text-green-400 text-xs bg-green-400/10 p-2 rounded-lg border border-green-400/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span>Indirizzo riconosciuto correttamente.</span>
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete;
