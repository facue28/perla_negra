import React, { useState, ChangeEvent, FormEvent } from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { Send, MapPin, User, Mail, Phone, MessageSquare, CheckCircle } from 'lucide-react';
import SEO from '@/components/ui/SEO';
import Select from '@/components/ui/Select';
import { toast } from 'sonner';
import { validatePhoneAsync } from '@/utils/phoneUtils';

interface ResellerFormData {
    nombre: string;
    cognome: string;
    email: string;
    telefono: string;
    provincia: string;
    citta: string;
    conoscenza: string;
    messaggio: string;
    trap: string;
}

interface ResellerErrors {
    nombre?: string | null;
    cognome?: string | null;
    email?: string | null;
    telefono?: string | null;
    provincia?: string | null;
    citta?: string | null;
    conoscenza?: string | null;
}

const ResellerPage: React.FC = () => {
    const [formData, setFormData] = useState<ResellerFormData>({
        nombre: '',
        cognome: '',
        email: '',
        telefono: '+39',
        provincia: '',
        citta: '',
        conoscenza: '',
        messaggio: '',
        trap: '' // Honeypot
    });

    const [errors, setErrors] = useState<ResellerErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    // Parallax Logic
    const { scrollY } = useScroll();
    const yBg = useTransform(scrollY, [0, 1000], [0, 200]);

    // Fade-in animation for content
    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name as keyof ResellerErrors]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const validateForm = async (): Promise<boolean> => {
        const newErrors: ResellerErrors = {};

        // Name & Surname
        if (!formData.nombre.trim()) newErrors.nombre = "Il nome è obbligatorio";
        if (!formData.cognome.trim()) newErrors.cognome = "Il cognome è obbligatoio";

        // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "L'email è obbligatoria";
        } else if (formData.email.length > 100) {
            newErrors.email = "L'email è troppo lunga";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Inserisci un'email valida";
        }

        // Phone
        if (!formData.telefono || formData.telefono.trim() === '+' || !formData.telefono.trim()) {
            newErrors.telefono = "Il telefono è obbligaorio";
        } else {
            const isValid = await validatePhoneAsync(formData.telefono);
            if (!isValid) {
                newErrors.telefono = "Numero non valido (controlla prefisso).";
            }
        }

        // Location
        if (!formData.provincia) newErrors.provincia = "Seleziona una provincia";
        if (!formData.citta.trim()) newErrors.citta = "La città è obbligatoria";

        // How did you find us
        if (!formData.conoscenza) newErrors.conoscenza = "Seleziona un'opzione";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const isValid = await validateForm();
        if (!isValid) {
            toast.error("Per favorere correggi gli errori nel modulo.", {
                style: { backgroundColor: '#fee2e2', color: '#dc2626' }
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("https://formsubmit.co/ajax/panteranegrait@gmail.com", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    _subject: `Nuova Candidatura Rivenditore: ${formData.nombre} ${formData.cognome}`,
                    _template: "table",
                    _captcha: "false",
                    _honey: formData.trap,
                    Nome: formData.nombre,
                    Cognome: formData.cognome,
                    Email: formData.email,
                    Telefono: formData.telefono,
                    Citta: `${formData.citta} (${formData.provincia})`,
                    Conosciuto_Tramite: formData.conoscenza,
                    Messaggio: formData.messaggio
                })
            });

            if (response.ok) {
                toast.success("Candidatura inviata con successo!");
                setFormData({
                    nombre: '', cognome: '', email: '', telefono: '+39',
                    provincia: '', citta: '', conoscenza: '', messaggio: '', trap: ''
                });
                setIsSuccess(true);
            } else {
                toast.error("Si è verificato un errore.", { description: "Riprova più tardi." });
            }
        } catch (error) {
            toast.error("Errore di connesione.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const provinceOptions = [
        { value: 'MI', label: 'Milano' },
        { value: 'RM', label: 'Roma' },
        { value: 'NA', label: 'Napoli' },
        { value: 'TO', label: 'Torino' },
        { value: 'FI', label: 'Firenze' },
        { value: 'BO', label: 'Bologna' },
        { value: 'Altro', label: 'Altra Provincia' }
    ];

    const sourceOptions = [
        { value: 'Instagram', label: 'Instagram' },
        { value: 'Facebook', label: 'Facebook' },
        { value: 'Google', label: 'Google' },
        { value: 'Amico', label: 'Passaparola / Amico' },
        { value: 'Altro', label: 'Altro' }
    ];

    return (
        <div className="min-h-screen bg-background-dark flex flex-col lg:flex-row overflow-hidden relative pt-24">
            <SEO
                title="Diventa Rivenditore"
                description="Unisciti alla rete Perla Negra. Porta l'eleganza e la seduzione nel tuo business."
            />

            {/* Left Column: Image & Inspiration (Parallax) */}
            <div className="lg:w-1/2 relative min-h-[40vh] lg:min-h-screen overflow-hidden group">
                <motion.div
                    style={{ y: yBg }}
                    className="absolute inset-0 h-[120%] -top-[10%]"
                >
                    <img
                        src="/hero/reseller.webp"
                        alt="Perla Negra Business"
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-background-dark" />
                </motion.div>

                <div className="absolute inset-0 flex flex-col justify-end lg:justify-center p-8 lg:p-16 z-10 pointer-events-none">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                    >
                        <h1 className="text-4xl lg:text-6xl font-serif text-white mb-6 drop-shadow-lg">
                            Inizia il tuo <br />
                            <span className="text-accent italic">Business</span>
                        </h1>
                        <p className="text-text-muted text-lg lg:text-xl max-w-md leading-relaxed mb-8">
                            Unisciti alle migliaia di imprenditori che ci scelgono, potenziando il loro business e moltiplicando i profitti con l'eleganza di Perla Negra.
                        </p>
                        <div className="hidden lg:flex items-center gap-4 text-sm text-white/50 uppercase tracking-widest">
                            <span>Esclusività</span>
                            <span className="w-1 h-1 bg-accent rounded-full" />
                            <span>Qualità</span>
                            <span className="w-1 h-1 bg-accent rounded-full" />
                            <span>Supporto</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:w-1/2 p-4 lg:p-12 flex items-center justify-center overflow-y-auto">
                <div className="w-full max-w-lg pt-16 lg:pt-0">
                    <div className="mb-8">
                        <h2 className="text-3xl font-serif text-white mb-2">Diventa Partner</h2>
                        <p className="text-text-muted">Compila il modulo per candidarti come rivenditore ufficiale.</p>
                    </div>

                    {isSuccess ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-zinc-900/50 backdrop-blur-md p-10 rounded-3xl border border-white/5 text-center"
                        >
                            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-serif text-white mb-4">Candidatura Inviata!</h3>
                            <p className="text-text-muted mb-8 leading-relaxed">
                                Grazie per il tuo interesse. Il nostro team esaminerà la tua richiesta e ti contatterà al più presto per discutere le opportunità di collaborazione.
                            </p>
                            <button
                                onClick={() => setIsSuccess(false)}
                                className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full text-white text-sm font-bold tracking-wider transition-colors"
                            >
                                TORNA AL MODULO
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5 bg-zinc-900/30 p-8 rounded-3xl backdrop-blur-sm border border-white/5 shadow-2xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Nome</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            className={`w-full bg-background-dark border ${errors.nombre ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                                            placeholder="Mario"
                                        />
                                    </div>
                                    {errors.nombre && <p className="text-red-500 text-xs mt-1 ml-2">{errors.nombre}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Cognome</label>
                                    <input
                                        type="text"
                                        name="cognome"
                                        value={formData.cognome}
                                        onChange={handleInputChange}
                                        className={`w-full bg-background-dark border ${errors.cognome ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                                        placeholder="Rossi"
                                    />
                                    {errors.cognome && <p className="text-red-500 text-xs mt-1 ml-2">{errors.cognome}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full bg-background-dark border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                                            placeholder="mario@azienda.com"
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-xs mt-1 ml-2">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Telefono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            className={`w-full bg-background-dark border ${errors.telefono ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                                            placeholder="+39 333 1234567"
                                        />
                                    </div>
                                    {errors.telefono && <p className="text-red-500 text-xs mt-1 ml-2">{errors.telefono}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Provincia</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 z-10" />
                                        <Select
                                            options={provinceOptions}
                                            value={formData.provincia}
                                            onChange={(val) => {
                                                setFormData({ ...formData, provincia: val });
                                                if (errors.provincia) setErrors({ ...errors, provincia: null });
                                            }}
                                            placeholder="Seleziona"
                                            className={`w-full bg-background-dark border ${errors.provincia ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                                        />
                                    </div>
                                    {errors.provincia && <p className="text-red-500 text-xs mt-1 ml-2">{errors.provincia}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Città</label>
                                    <input
                                        type="text"
                                        name="citta"
                                        value={formData.citta}
                                        onChange={handleInputChange}
                                        className={`w-full bg-background-dark border ${errors.citta ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                                        placeholder="Milano"
                                    />
                                    {errors.citta && <p className="text-red-500 text-xs mt-1 ml-2">{errors.citta}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Come ci hai conosciuto?</label>
                                <Select
                                    options={sourceOptions}
                                    value={formData.conoscenza}
                                    onChange={(val) => {
                                        setFormData({ ...formData, conoscenza: val });
                                        if (errors.conoscenza) setErrors({ ...errors, conoscenza: null });
                                    }}
                                    placeholder="Seleziona un'opzione"
                                    className={`w-full bg-background-dark border ${errors.conoscenza ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                                />
                                {errors.conoscenza && <p className="text-red-500 text-xs mt-1 ml-2">{errors.conoscenza}</p>}
                            </div>

                            <div>
                                <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Messaggio / Note</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-4 text-text-muted w-4 h-4" />
                                    <textarea
                                        name="messaggio"
                                        rows={3}
                                        value={formData.messaggio}
                                        onChange={handleInputChange}
                                        className="w-full bg-background-dark border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all resize-none"
                                        placeholder="Raccontaci del tuo business..."
                                    ></textarea>
                                </div>
                            </div>

                            <input
                                type="text"
                                name="trap"
                                value={formData.trap}
                                onChange={handleInputChange}
                                style={{ display: 'none' }}
                                tabIndex={-1}
                                autoComplete="off"
                            />

                            <div className="space-y-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full bg-accent text-background-dark font-bold py-4 rounded-xl shadow-lg shadow-accent/20 flex items-center justify-center gap-2 uppercase tracking-widest ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent-light'}`}
                                >
                                    {isSubmitting ? (
                                        <span>Invio in corso...</span>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            <span>Invia Candidatura</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>

                            <p className="text-center text-xs text-text-muted mt-4">
                                Ti contatteremo al più presto.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResellerPage;
