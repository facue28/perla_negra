const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-background-dark py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-serif text-text-primary mb-8">Privacy Policy</h1>
                <div className="prose prose-invert max-w-none text-text-muted space-y-6">
                    <p className="text-lg">La tua privacy è fondamentale per Perla Negra. Questa informativa descrive come trattiamo i tuoi dati personali in conformità con il Regolamento Generale sulla Protezione dei Dati (GDPR - EU 2016/679).</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">1. Titolare del Trattamento</h3>
                    <p><strong>Perla Negra</strong></p>
                    <p>Per qualsiasi domanda relativa alla privacy, puoi contattarci tramite il nostro form di contatto o WhatsApp al +39 377 831 7091.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">2. Raccolta Dati</h3>
                    <p>Raccogliamo solo i dati strettamente necessari per elaborare e spedire il tuo ordine:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Nome completo</strong> - Per identificare il destinatario</li>
                        <li><strong>Numero di telefono</strong> - Per comunicazioni relative all'ordine via WhatsApp</li>
                        <li><strong>Indirizzo di consegna</strong> - Per la spedizione dei prodotti</li>
                        <li><strong>Dettagli dell'ordine</strong> - Prodotti ordinati e quantità</li>
                    </ul>
                    <p className="mt-4">Non condividiamo questi dati con terze parti per scopi di marketing.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">3. Base Legale del Trattamento</h3>
                    <p>Il trattamento dei tuoi dati personali si basa su:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Esecuzione del contratto</strong> - Necessario per elaborare e consegnare il tuo ordine</li>
                        <li><strong>Obbligo legale</strong> - Conservazione dei dati per fini fiscali e contabili</li>
                        <li><strong>Consenso</strong> - Per l'uso di cookie non essenziali (se applicabile)</li>
                    </ul>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">4. Finalità del Trattamento</h3>
                    <p>I tuoi dati vengono utilizzati esclusivamente per:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Elaborazione e gestione degli ordini</li>
                        <li>Comunicazioni relative alla consegna</li>
                        <li>Servizio clienti e supporto post-vendita</li>
                        <li>Adempimenti fiscali e contabili</li>
                    </ul>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">5. Tempo di Conservazione</h3>
                    <p>Conserviamo i tuoi dati personali per:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Dati dell'ordine</strong> - 10 anni (obblighi fiscali)</li>
                        <li><strong>Dati di contatto</strong> - Fino a revoca del consenso o richiesta di cancellazione</li>
                    </ul>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">6. Sicurezza dei Dati</h3>
                    <p>Adottiamo misure di sicurezza tecniche e organizzative appropriate per proteggere i tuoi dati personali da:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Accessi non autorizzati</li>
                        <li>Perdita, distruzione o alterazione accidentale</li>
                        <li>Divulgazione o accesso non autorizzato</li>
                    </ul>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">7. Cookie</h3>
                    <p>Il nostro sito utilizza cookie essenziali per garantire il corretto funzionamento:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Cookie di sessione</strong> - Per mantenere il carrello attivo</li>
                        <li><strong>Cookie di preferenze</strong> - Per ricordare le tue scelte (età, consenso cookie)</li>
                    </ul>
                    <p className="mt-4">Puoi gestire le tue preferenze sui cookie in qualsiasi momento attraverso il banner che appare al primo accesso.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">8. WhatsApp</h3>
                    <p>Le comunicazioni via WhatsApp sono protette dalla crittografia end-to-end della piattaforma stessa. Utilizziamo WhatsApp come canale di comunicazione sicuro per gestire gli ordini.</p>
                    <p>WhatsApp è un servizio di Meta Platforms, Inc. Per maggiori informazioni sulla loro privacy policy, visita: <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">whatsapp.com/legal/privacy-policy</a></p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">9. I Tuoi Diritti (GDPR)</h3>
                    <p>Ai sensi del GDPR, hai il diritto di:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Accesso</strong> - Ottenere una copia dei tuoi dati personali</li>
                        <li><strong>Rettifica</strong> - Correggere dati inesatti o incompleti</li>
                        <li><strong>Cancellazione</strong> - Richiedere la cancellazione dei tuoi dati ("diritto all'oblio")</li>
                        <li><strong>Limitazione</strong> - Limitare il trattamento in determinate circostanze</li>
                        <li><strong>Portabilità</strong> - Ricevere i tuoi dati in formato strutturato</li>
                        <li><strong>Opposizione</strong> - Opporti al trattamento per motivi legittimi</li>
                    </ul>
                    <p className="mt-4">Per esercitare questi diritti, contattaci tramite il form di contatto o WhatsApp.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">10. Trasferimenti Internazionali</h3>
                    <p>I tuoi dati vengono conservati esclusivamente all'interno dell'Unione Europea. Non effettuiamo trasferimenti di dati verso paesi terzi.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">11. Modifiche alla Privacy Policy</h3>
                    <p>Ci riserviamo il diritto di modificare questa privacy policy. In caso di modifiche sostanziali, ti informeremo tramite un avviso sul sito.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">12. Reclami</h3>
                    <p>Se ritieni che il trattamento dei tuoi dati violi il GDPR, hai il diritto di presentare un reclamo all'autorità di controllo competente:</p>
                    <p className="ml-4 mt-2">
                        <strong>Garante per la Protezione dei Dati Personali</strong><br />
                        Piazza Venezia, 11 - 00187 Roma<br />
                        Tel: +39 06 696771<br />
                        Web: <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">garanteprivacy.it</a>
                    </p>

                    <div className="bg-background-alt p-6 rounded-xl border-l-4 border-accent mt-8">
                        <p className="text-accent font-bold mb-2">🔒 Massima Discrezione</p>
                        <p>La tua privacy è la nostra priorità. Tutti i dati vengono trattati con la massima riservatezza e discrezione.</p>
                    </div>

                    <p className="mt-8 italic text-sm border-t border-border/20 pt-6">Ultimo aggiornamento: Gennaio 2026</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
