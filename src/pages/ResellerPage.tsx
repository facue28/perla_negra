import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { Send, MapPin, User, Mail, Phone, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import SEO from '@/components/ui/SEO';
import Select from '@/components/ui/Select';
import { toast } from 'sonner';
import { ResellerSchema, ResellerFormData } from '@/features/forms/schemas';
import Turnstile from '@/components/ui/Turnstile';

const ResellerPage: React.FC = () => {
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<ResellerFormData>({
        resolver: zodResolver(ResellerSchema),
        defaultValues: {
            nombre: '',
            cognome: '',
            email: '',
            telefono: '+39',
            provincia: '',
            citta: '',
            conoscenza: '',
            messaggio: '',
            trap: '',
            turnstileToken: ''
        }
    });

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

    const onSubmit = async (data: ResellerFormData) => {
        try {
            const response = await fetch("/api/reseller", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success("Candidatura inviata con successo!");
                reset();
                setIsSuccess(true);
            } else {
                toast.error("Errore nell'invio", {
                    description: result.error || "Riprova più tardi."
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Errore di connessione.");
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
                            Unisciti alle migliaia di imprenditori che ci scelgono, potenziando el loro business e moltiplicando i profitti con l'eleganza di Perla Negra.
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
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-zinc-900/30 p-8 rounded-3xl backdrop-blur-sm border border-white/5 shadow-2xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Nome</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                                        <input
                                            {...register('nombre')}
                                            className={`w-full bg-background-dark border ${errors.nombre ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                                            placeholder="Mario"
                                        />
                                    </div>
                                    {errors.nombre && <p className="text-red-500 text-xs mt-1 ml-2">{errors.nombre.message}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Cognome</label>
                                    <input
                                        {...register('cognome')}
                                        className={`w-full bg-background-dark border ${errors.cognome ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                                        placeholder="Rossi"
                                    />
                                    {errors.cognome && <p className="text-red-500 text-xs mt-1 ml-2">{errors.cognome.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                                        <input
                                            {...register('email')}
                                            className={`w-full bg-background-dark border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                                            placeholder="mario@azienda.com"
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-xs mt-1 ml-2">{errors.email.message}</p>}
                                </div>

                                <div>
                                    <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Telefono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                                        <input
                                            {...register('telefono')}
                                            className={`w-full bg-background-dark border ${errors.telefono ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                                            placeholder="+39 333 1234567"
                                        />
                                    </div>
                                    {errors.telefono && <p className="text-red-500 text-xs mt-1 ml-2">{errors.telefono.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Provincia</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 z-10" />
                                        <Select
                                            options={provinceOptions}
                                            value={watch('provincia')}
                                            onChange={(val) => setValue('provincia', val, { shouldValidate: true })}
                                            placeholder="Seleziona"
                                            className={`w-full bg-background-dark border ${errors.provincia ? 'border-red-500' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                                        />
                                    </div>
                                    {errors.provincia && <p className="text-red-500 text-xs mt-1 ml-2">{errors.provincia.message}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Città</label>
                                    <input
                                        {...register('citta')}
                                        className={`w-full bg-background-dark border ${errors.citta ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                                        placeholder="Milano"
                                    />
                                    {errors.citta && <p className="text-red-500 text-xs mt-1 ml-2">{errors.citta.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Come ci hai conosciuto?</label>
                                <Select
                                    options={sourceOptions}
                                    value={watch('conoscenza')}
                                    onChange={(val) => setValue('conoscenza', val, { shouldValidate: true })}
                                    placeholder="Seleziona un'opzione"
                                    className={`w-full bg-background-dark border ${errors.conoscenza ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all`}
                                />
                                {errors.conoscenza && <p className="text-red-500 text-xs mt-1 ml-2">{errors.conoscenza.message}</p>}
                            </div>

                            <div>
                                <label className="text-xs text-text-muted ml-2 uppercase tracking-wider font-bold">Messaggio / Note</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-4 text-text-muted w-4 h-4" />
                                    <textarea
                                        {...register('messaggio')}
                                        rows={3}
                                        className="w-full bg-background-dark border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white hover:border-accent/30 focus:ring-1 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all resize-none"
                                        placeholder="Raccontaci del tuo business..."
                                    ></textarea>
                                </div>
                            </div>

                            <Turnstile
                                siteKey={TURNSTILE_SITE_KEY}
                                onVerify={(token) => setValue('turnstileToken', token, { shouldValidate: true })}
                            />
                            {errors.turnstileToken && <p className="text-red-500 text-xs text-center">{errors.turnstileToken.message}</p>}

                            <input
                                {...register('trap')}
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
                                        <Loader2 className="w-6 h-6 animate-spin" />
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
