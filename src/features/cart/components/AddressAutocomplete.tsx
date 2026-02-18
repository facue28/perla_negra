import React, { useState, useEffect, useRef } from 'react';
import { Search, AlertTriangle, Loader2, MapPin } from 'lucide-react';
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

    const API_KEY = import.meta.env.VITE_RADAR_KEY;

    // Load initial query if defined
    useEffect(() => {
        const currentAddr = watch('indirizzo');
        if (currentAddr && !query) {
            setQuery(currentAddr);
        }
    }, [watch('indirizzo')]);

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
        const cap = watch('cap');
        const citta = watch('citta');
        if (!cap || !citta || cap.length < 5) return;

        setIsValidating(true);
        setValidationError(null);

        try {
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

            const cityMatch = match.city?.toLowerCase().includes(citta.toLowerCase()) ||
                citta.toLowerCase().includes(match.city?.toLowerCase() || '');

            if (!cityMatch && match.postalCode !== cap) {
                setValidationError(`Il CAP ${cap} sembra non corrispondere a ${citta}.`);
            } else {
                setValidationError(null);
            }

        } catch (error) {
            console.error("Validation error:", error);
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

        // Note: latitude/longitude are not in the Zod schema but kept in form state if needed
        // For checkout, we mostly need address strings.

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
                        value={disabled ? '' : (query || watch('indirizzo'))}
                        onChange={handleQueryChange}
                        disabled={disabled}
                        placeholder={disabled ? "Non richiesto per il ritiro" : "Es. Via Roma"}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* 2. Civico */}
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
                </div>

                {/* 3. CAP */}
                <div className="space-y-1">
                    <label htmlFor="checkout-cap" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                        CAP *
                    </label>
                    <input
                        {...register('cap')}
                        id="checkout-cap"
                        type="text"
                        onBlur={validateLocation}
                        disabled={disabled}
                        placeholder={disabled ? "-" : "00100"}
                        maxLength={5}
                        className={`w-full bg-background-dark border ${errors.cap || validationError ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all ${disabled ? 'opacity-40 cursor-not-allowed bg-white/5' : ''}`}
                    />
                    {/* Validation Feedback */}
                    {isValidating && <span className="text-xs text-text-muted absolute right-3 mt-4">Verificando...</span>}
                    {validationError && <p className="text-red-400 text-xs ml-1 mt-1">{validationError}</p>}
                    {errors.cap && <p className="text-red-400 text-xs ml-1">{errors.cap.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* 4. Comune */}
                <div className="space-y-1">
                    <label htmlFor="checkout-city" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                        Comune *
                    </label>
                    <input
                        {...register('citta')}
                        id="checkout-city"
                        type="text"
                        onBlur={validateLocation}
                        disabled={disabled}
                        placeholder={disabled ? "-" : "Roma"}
                        className={`w-full bg-background-dark border ${errors.citta ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all ${disabled ? 'opacity-40 cursor-not-allowed bg-white/5' : ''}`}
                    />
                    {errors.citta && <p className="text-red-400 text-xs ml-1">{errors.citta.message}</p>}
                </div>

                {/* 5. Provincia */}
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                        Provincia *
                    </label>
                    <Select
                        value={watch('provincia')}
                        onChange={(val) => handleManualChange('provincia', val)}
                        options={provinces.map(p => ({ value: p.code, label: `${p.name} (${p.code})` }))}
                        placeholder={disabled ? "-" : "Seleziona"}
                        disabled={disabled}
                        className={`w-full ${errors.provincia ? 'border-red-500' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    />
                    {errors.provincia && <p className="text-red-400 text-xs ml-1">{errors.provincia.message}</p>}
                </div>
            </div>

            {/* 6. Dettagli */}
            <div className="space-y-1">
                <label htmlFor="checkout-details" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">
                    Dettagli (Scala, Piano, Citofono)
                </label>
                <input
                    {...register('dettagli')}
                    id="checkout-details"
                    type="text"
                    disabled={disabled}
                    placeholder={disabled ? "Ritiro in sede (Verbania)" : "Scala A, Int 4..."}
                    className={`w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-text-primary hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all resize-none ${disabled ? 'opacity-40 cursor-not-allowed bg-white/5' : ''}`}
                />
            </div>

            {/* Soft Validation Warning */}
            {addressVerified && (watch('cap').length !== 5 || watch('provincia').length !== 2) && (
                <div className="flex items-start gap-2 text-yellow-400 text-xs bg-yellow-400/10 p-2 rounded-lg">
                    <AlertTriangle size={14} className="mt-0.5" />
                    <span>Verifica CAP e Provincia: podrían no ser correctos.</span>
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete;
