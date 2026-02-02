import { useState } from 'react';
import { toast } from 'sonner';
import SEO from '@/components/ui/SEO';

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
        <div className="bg-background-dark py-16 text-text-primary min-h-screen">
            <SEO title="Contatti" description="Contattaci per qualsiasi domanda o richiesta. Riservatezza garantita." />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-12">
                    <h2 className="text-sm font-bold tracking-widest uppercase text-text-muted mb-2 animate-pulse">Contatti</h2>
                    <p className="text-text-muted text-sm">Scrivici con discrezione. Rispondiamo appena possibile.</p>
                </div>

                <div className="mb-10">
                    <h1 className="text-5xl font-serif font-bold mb-4">Parliamo</h1>
                    <p className="text-text-muted mb-6">
                        Un messaggio, una domanda o una richiesta: siamo qui per ascoltarti.
                        <br />
                        <span className="text-accent text-sm">La tua privacy è importante per noi.</span>
                    </p>
                </div>

                {isSuccess ? (
                    <div className="bg-background-alt p-12 rounded-3xl border border-white/5 text-center animate-fade-in-up">
                        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <h3 className="text-3xl font-serif text-white mb-4">Messaggio Inviato!</h3>
                        <p className="text-text-muted text-lg mb-8 max-w-md mx-auto">
                            Grazie per averci contattato. Abbiamo ricevuto la tua richiesta e ti risponderemo il prima possibile.
                        </p>
                        <button
                            onClick={() => setIsSuccess(false)}
                            className="text-accent text-sm font-bold tracking-widest uppercase hover:underline"
                        >
                            Invia un altro messaggio
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ... Existing Form Fields ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="nombre" className="text-sm text-text-muted ml-2">Nome</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="w-full bg-background-alt border-none rounded-2xl px-6 py-4 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition-all"
                                    placeholder=""
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="apellido" className="text-sm text-text-muted ml-2">Cognome</label>
                                <input
                                    type="text"
                                    id="apellido"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    className="w-full bg-background-alt border-none rounded-2xl px-6 py-4 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition-all"
                                    placeholder=""
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm text-text-muted ml-2">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-background-alt border-none rounded-full px-6 py-4 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition-all"
                                placeholder=""
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="mensaje" className="text-sm text-text-muted ml-2">Messaggio</label>
                            <textarea
                                id="mensaje"
                                name="mensaje"
                                rows={6}
                                value={formData.mensaje}
                                onChange={handleChange}
                                className="w-full bg-background-alt border-none rounded-3xl px-6 py-4 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition-all resize-none"
                                placeholder=""
                                required
                            ></textarea>
                        </div>

                        {/* Honeypot Trap - Invisible to humans */}
                        <input
                            type="text"
                            name="trap"
                            value={formData.trap}
                            onChange={handleChange}
                            style={{ display: 'none' }}
                            tabIndex="-1"
                            autoComplete="off"
                        />

                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`bg-accent text-background-dark px-12 py-3 rounded-full font-bold text-lg hover:bg-accent-hover transition-all transform hover:scale-105 shadow-lg shadow-accent/20 flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed scale-100' : ''}`}
                            >
                                {isSubmitting ? 'Invio in corso...' : 'Invia messaggio'}
                            </button>

                            <div className="bg-background-alt p-6 rounded-3xl max-w-sm border border-border/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-accent font-bold">Discrezione</span>
                                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                                </div>
                                <ul className="text-xs text-text-muted space-y-1 list-disc list-inside">
                                    <li>Risposte private e curate</li>
                                    <li>Linguaggio inclusivo</li>
                                    <li>Consigli d'uso e ingredienti</li>
                                </ul>
                            </div>
                        </div>

                        <div className="text-xs text-text-muted mt-8">
                            <p>Rispondiamo entro 24-48 ore lavorative.</p>
                            <p>Nessun dato viene condiviso con terze parti.</p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ContactPage;
