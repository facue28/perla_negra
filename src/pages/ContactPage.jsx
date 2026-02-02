import { useState } from 'react';
import { toast } from 'sonner';
import SEO from '@/components/ui/SEO';
import { motion } from 'framer-motion';
import { Mail, User, MessageSquare, Send, MapPin, Phone } from 'lucide-react';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        mensaje: '',
        trap: '' // Honeypot for bots
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("https://formsubmit.co/ajax/panteranegrait@gmail.com", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    _subject: `Nuovo Messaggio da Contatti: ${formData.nombre}`,
                    _template: "table",
                    _captcha: "false",
                    _honey: formData.trap
                })
            });

            if (response.ok) {
                toast.success("Messaggio inviato!");
                setFormData({ nombre: '', apellido: '', email: '', mensaje: '', trap: '' });
                setIsSuccess(true); // Trigger success view
            } else {
                toast.error("Si è verificato un errore.", {
                    description: "Per favore riprova o scrivici su WhatsApp."
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Errore di connessione.", {
                description: "Controlla la tua connessione internet."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
    return (
        <div className="bg-background-dark py-20 text-text-primary min-h-screen relative overflow-hidden">
            <SEO title="Contatti" description="Contattaci per qualsiasi domanda o richiesta. Riservatezza garantita." />

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <span className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-4 block">Contatti</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-white">
                        Parliamo
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl mx-auto leading-relaxed">
                        Siamo qui per ascoltarti con la massima discrezione.
                        Che sia una domanda sui prodotti o una richiesta di collaborazione.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Contact Info Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="lg:col-span-5 space-y-8"
                    >
                        <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:border-accent/30 transition-colors">
                            <h3 className="text-2xl font-serif text-white mb-6">Mettiti in contatto</h3>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4 group">
                                    <div className="bg-accent/10 p-3 rounded-xl text-accent group-hover:bg-accent group-hover:text-background-dark transition-all">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-muted font-bold uppercase tracking-wider mb-1">Email</p>
                                        <a href="mailto:info@perlanegra.it" className="text-white hover:text-accent transition-colors text-lg">
                                            panteranegrait@gmail.com
                                        </a>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 group">
                                    <div className="bg-accent/10 p-3 rounded-xl text-accent group-hover:bg-accent group-hover:text-background-dark transition-all">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-muted font-bold uppercase tracking-wider mb-1">Sede</p>
                                        <p className="text-white text-lg">Italia</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-accent/20 to-transparent p-8 rounded-3xl border border-accent/20">
                            <h4 className="flex items-center gap-2 text-accent font-bold text-xl mb-4">
                                <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                                Discrezione Totale
                            </h4>
                            <p className="text-text-muted text-sm leading-relaxed mb-4">
                                Sappiamo quanto sia importante la privacy.
                            </p>
                            <ul className="text-sm text-white/80 space-y-2 list-disc list-inside">
                                <li>Spedizioni anonime al 100%</li>
                                <li>Nessun riferimento sul pacco</li>
                                <li>Dati trattati con massima sicurezza</li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Form Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="lg:col-span-7"
                    >
                        <div className="bg-background-alt/50 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">

                            {/* Decorative gradient inside form */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>

                            {isSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 text-accent ring-8 ring-accent/5">
                                        <Send size={40} />
                                    </div>
                                    <h3 className="text-4xl font-serif text-white mb-6">Messaggio Inviato!</h3>
                                    <p className="text-text-muted text-lg mb-10 max-w-md mx-auto">
                                        Grazie per averci contattato. Abbiamo ricevuto la tua richiesta e ti risponderemo il prima possibile.
                                    </p>
                                    <button
                                        onClick={() => setIsSuccess(false)}
                                        className="inline-block px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 text-white font-medium transition-all"
                                    >
                                        Invia un altro messaggio
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="nombre" className="text-xs uppercase tracking-wider font-bold text-text-muted ml-2">Nome</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-accent transition-colors w-5 h-5" />
                                                <input
                                                    type="text"
                                                    id="nombre"
                                                    name="nombre"
                                                    value={formData.nombre}
                                                    onChange={handleChange}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none transition-all placeholder:text-white/20"
                                                    placeholder="Il tuo nome"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="apellido" className="text-xs uppercase tracking-wider font-bold text-text-muted ml-2">Cognome</label>
                                            <input
                                                type="text"
                                                id="apellido"
                                                name="apellido"
                                                value={formData.apellido}
                                                onChange={handleChange}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none transition-all placeholder:text-white/20"
                                                placeholder="Il tuo cognome"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-xs uppercase tracking-wider font-bold text-text-muted ml-2">Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-accent transition-colors w-5 h-5" />
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none transition-all placeholder:text-white/20"
                                                placeholder="latua@email.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="mensaje" className="text-xs uppercase tracking-wider font-bold text-text-muted ml-2">Messaggio</label>
                                        <div className="relative group">
                                            <MessageSquare className="absolute left-4 top-5 text-text-muted group-hover:text-accent transition-colors w-5 h-5" />
                                            <textarea
                                                id="mensaje"
                                                name="mensaje"
                                                rows={5}
                                                value={formData.mensaje}
                                                onChange={handleChange}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none transition-all resize-none placeholder:text-white/20"
                                                placeholder="Come possiamo aiutarti?"
                                                required
                                            ></textarea>
                                        </div>
                                    </div>

                                    {/* Honeypot Trap */}
                                    <input
                                        type="text"
                                        name="trap"
                                        value={formData.trap}
                                        onChange={handleChange}
                                        style={{ display: 'none' }}
                                        tabIndex="-1"
                                        autoComplete="off"
                                    />

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full bg-accent text-background-dark py-4 rounded-xl font-bold text-lg hover:bg-accent-hover transition-all shadow-[0_0_20px_rgba(63,255,193,0.3)] hover:shadow-[0_0_30px_rgba(63,255,193,0.5)] flex items-center justify-center gap-3 uppercase tracking-widest ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? 'Invio in corso...' : (
                                            <>
                                                <span>Invia Messaggio</span>
                                                <Send size={20} />
                                            </>
                                        )}
                                    </motion.button>

                                    <p className="text-center text-xs text-text-muted/60 mt-4">
                                        Rispondiamo solitamente entro 24h.
                                    </p>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
    );
};

export default ContactPage;
