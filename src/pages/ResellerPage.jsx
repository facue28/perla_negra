import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Building2, User, Mail, Phone, MessageSquare, CheckCircle } from 'lucide-react';
import SEO from '@/components/ui/SEO';
import Select from '@/components/ui/Select';
import { toast } from 'sonner';
import { isValidPhoneNumber } from 'libphonenumber-js';

const ResellerPage = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        cognome: '',
        email: '',
        telefono: '+39',
        provincia: '',
        citta: '',
        conoscenza: '',
        messaggio: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fade-in animation for content
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Name & Surname
        if (!formData.nombre.trim()) newErrors.nombre = "Il nome è obbligatorio";
        if (!formData.cognome.trim()) newErrors.cognome = "Il cognome è obbligatorio";

        // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "L'email è obbligatoria";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Inserisci un'email valida";
        }

        // Phone (Same strict check as Checkout)
        if (!formData.telefono || formData.telefono.trim() === '+' || !formData.telefono.trim()) {
            newErrors.telefono = "Il telefono è obbligatorio";
        } else if (!isValidPhoneNumber(formData.telefono)) {
            newErrors.telefono = "Numero non valido (controlla prefisso).";
        }

        // Location
        if (!formData.provincia) newErrors.provincia = "Seleziona una provincia";
        if (!formData.citta.trim()) newErrors.citta = "La città è obbligatoria";

        // How did you find us
        if (!formData.conoscenza) newErrors.conoscenza = "Seleziona un'opzione";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Per favore correggi gli errori nel modulo.", {
                style: { backgroundColor: '#fee2e2', color: '#dc2626' }
            });
            return;
        }

        setIsSubmitting(true);

        // Simulate network delay for UX
        setTimeout(() => {
            const message = `*Richiesta Rivenditore Perla Negra*%0A%0A` +
                `👤 *Nome:* ${formData.nombre} ${formData.cognome}%0A` +
                `📧 *Email:* ${formData.email}%0A` +
                `📱 *Telefono:* ${formData.telefono}%0A` +
                `📍 *Città:* ${formData.citta} (${formData.provincia})%0A` +
                `🔍 *Vi ho conosciuto tramite:* ${formData.conoscenza}%0A%0A` +
                `💬 *Messaggio:* ${formData.messaggio || 'Nessun messaggio'}`;

            const whatsappUrl = `https://wa.me/393519183656?text=${message}`; // Replace with actual business number if different

            window.open(whatsappUrl, '_blank');
            setIsSubmitting(false);
            toast.success("Richiesta pronta per l'invio su WhatsApp!");

            // Optional: Reset form
            // setFormData({...});
        }, 1500);
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
        <div className="min-h-screen bg-background-dark flex flex-col lg:flex-row">
            <SEO
                title="Diventa Rivenditore"
                description="Unisciti alla rete Perla Negra. Porta l'eleganza e la seduzione nel tuo business."
            />

            {/* Left Column: Image & Inspiration */}
            <div className="lg:w-1/2 relative min-h-[40vh] lg:min-h-screen overflow-hidden group">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src="/hero/reseller.png"
                        alt="Perla Negra Business"
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-background-dark" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end lg:justify-center p-8 lg:p-16 z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                    >
                        <h1 className="text-4xl lg:text-6xl font-serif text-white mb-6 drop-shadow-lg">
                            Comenzá tu <br />
                            <span className="text-accent italic">emprendimiento</span>
                        </h1>
                        <p className="text-text-muted text-lg lg:text-xl max-w-md leading-relaxed mb-8">
                            Sumate a los miles de emprendedores que ya nos eligen, potenciando sus negocios y multiplicando sus ingresos.
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
            <div className="lg:w-1/2 p-4 lg:p-12 xl:p-20 flex items-center justify-center bg-background-dark">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="w-full max-w-lg bg-background-alt/30 backdrop-blur-sm p-8 rounded-3xl border border-white/5 shadow-2xl"
                >
                    <h2 className="text-2xl font-serif text-white mb-2">Candidatura Partner</h2>
                    <p className="text-text-muted text-sm mb-8">Compila il modulo per ricevere il catalogo B2B.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name & Surname Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Nome</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Mario"
                                        className={`w-full bg-background-dark border ${errors.nombre ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent transition-all`}
                                    />
                                </div>
                                {errors.nombre && <p className="text-red-400 text-xs ml-1">{errors.nombre}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Cognome</label>
                                <input
                                    type="text"
                                    name="cognome"
                                    value={formData.cognome}
                                    onChange={handleInputChange}
                                    placeholder="Rossi"
                                    className={`w-full bg-background-dark border ${errors.cognome ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent transition-all`}
                                />
                                {errors.cognome && <p className="text-red-400 text-xs ml-1">{errors.cognome}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="mario.rossi@email.com"
                                    className={`w-full bg-background-dark border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent transition-all`}
                                />
                            </div>
                            {errors.email && <p className="text-red-400 text-xs ml-1">{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">WhatsApp</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                    placeholder="+39 333 1234567"
                                    className={`w-full bg-background-dark border ${errors.telefono ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent transition-all`}
                                />
                            </div>
                            {errors.telefono && <p className="text-red-400 text-xs ml-1">{errors.telefono}</p>}
                        </div>

                        {/* Location Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Provincia</label>
                                <Select
                                    value={formData.provincia}
                                    onChange={(val) => {
                                        setFormData(prev => ({ ...prev, provincia: val }));
                                        if (errors.provincia) setErrors(prev => ({ ...prev, provincia: null }));
                                    }}
                                    options={provinceOptions}
                                    placeholder="Seleziona..."
                                    error={errors.provincia}
                                />
                                {errors.provincia && <p className="text-red-400 text-xs ml-1">{errors.provincia}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Città</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input
                                        type="text"
                                        name="citta"
                                        value={formData.citta}
                                        onChange={handleInputChange}
                                        placeholder="Milano"
                                        className={`w-full bg-background-dark border ${errors.citta ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent transition-all`}
                                    />
                                </div>
                                {errors.citta && <p className="text-red-400 text-xs ml-1">{errors.citta}</p>}
                            </div>
                        </div>

                        {/* Source */}
                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Come ci hai conosciuto?</label>
                            <Select
                                value={formData.conoscenza}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, conoscenza: val }));
                                    if (errors.conoscenza) setErrors(prev => ({ ...prev, conoscenza: null }));
                                }}
                                options={sourceOptions}
                                placeholder="Seleziona un'opzione..."
                                error={errors.conoscenza}
                            />
                            {errors.conoscenza && <p className="text-red-400 text-xs ml-1">{errors.conoscenza}</p>}
                        </div>

                        {/* Message */}
                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Messaggio (Opzionale)</label>
                            <div className="relative">
                                <MessageSquare size={16} className="absolute left-4 top-4 text-text-muted" />
                                <textarea
                                    name="messaggio"
                                    value={formData.messaggio}
                                    onChange={handleInputChange}
                                    placeholder="Raccontaci del tuo business..."
                                    rows="3"
                                    className={`w-full bg-background-dark border ${errors.messaggio ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent transition-all resize-none`}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full mt-6 bg-accent text-background-dark py-4 rounded-xl font-bold text-lg hover:bg-accent-hover transition-all shadow-[0_0_20px_rgba(63,255,193,0.3)] hover:shadow-[0_0_30px_rgba(63,255,193,0.5)] flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <span>Invio in corso...</span>
                            ) : (
                                <>
                                    <span>INVIA CANDIDATURA</span>
                                    <Send size={20} />
                                </>
                            )}
                        </motion.button>

                        <p className="text-center text-xs text-text-muted mt-4">
                            Cliccando su invia, verrai reindirizzato su WhatsApp per finalizzare la richiesta.
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ResellerPage;
