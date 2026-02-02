const TermsPage = () => {
    return (
        <div className="min-h-screen bg-background-dark pt-24 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-serif text-text-primary mb-8">Termini e Condizioni</h1>
                <div className="prose prose-invert max-w-none text-text-muted space-y-6">
                    <p className="text-lg">Benvenuto su Perla Negra. L'uso di questo negozio online implica l'accettazione dei seguenti termini e condizioni.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">1. Uso del Sito</h3>
                    <p>Questo sito è destinato esclusivamente a persone maggiorenni (+18). Navigando su questo sito dichiari di avere l'età legale per acquistare prodotti per adulti nella tua giurisdizione.</p>
                    <p>Ti impegni a utilizzare il sito in conformità con tutte le leggi e i regolamenti applicabili e a non utilizzarlo per scopi illegali o non autorizzati.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">2. Prodotti e Ordini</h3>
                    <p>Tutti gli ordini sono soggetti a disponibilità. Ci riserviamo il diritto di annullare ordini in caso di errori di prezzo, esaurimento dello stock o altri motivi validi.</p>
                    <p>I prezzi indicati sono in Euro (€) e includono l'IVA ove applicabile.</p>
                    <p>Le immagini dei prodotti sono rappresentative e potrebbero differire leggermente dal prodotto effettivo.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">3. Spedizione Discreta</h3>
                    <p>Garantiamo che tutte le spedizioni vengono effettuate in imballaggi anonimi, senza riferimenti al contenuto o al nome del negozio all'esterno.</p>
                    <p>I tempi di consegna variano in base alla località di destinazione e al metodo di spedizione scelto. Generalmente, le spedizioni vengono effettuate entro 2-5 giorni lavorativi.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">4. Pagamento</h3>
                    <p>Gli ordini vengono inviati tramite WhatsApp per concordare il metodo di pagamento e i dettagli della consegna direttamente con il venditore.</p>
                    <p>Accettiamo diverse forme di pagamento che verranno discusse durante il processo di ordine.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">5. Diritto di Recesso</h3>
                    <p>Per motivi igienici e di sicurezza, i prodotti intimi non possono essere restituiti una volta aperti o utilizzati, salvo difetti di fabbricazione.</p>
                    <p>In conformità con le normative europee, hai il diritto di recedere dal contratto entro 14 giorni dalla ricezione del prodotto, a condizione che il prodotto sia nella sua confezione originale sigillata e non aperta.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">6. Garanzia e Responsabilità</h3>
                    <p>I nostri prodotti sono garantiti contro difetti di fabbricazione. In caso di problemi, contattaci entro 7 giorni dalla ricezione.</p>
                    <p>Perla Negra non si assume responsabilità per l'uso improprio dei prodotti o per eventuali reazioni allergiche. Si consiglia di leggere attentamente le istruzioni e gli ingredienti prima dell'uso.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">7. Proprietà Intellettuale</h3>
                    <p>Tutti i contenuti presenti su questo sito, inclusi testi, immagini, loghi e grafiche, sono di proprietà di Perla Negra e protetti dalle leggi sul copyright.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">8. Modifiche ai Termini</h3>
                    <p>Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Le modifiche entrano in vigore al momento della pubblicazione sul sito.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">9. Legge Applicabile</h3>
                    <p>Questi termini e condizioni sono regolati dalla legge italiana. Qualsiasi controversia sarà soggetta alla giurisdizione esclusiva dei tribunali italiani.</p>

                    <h3 className="text-2xl font-serif text-text-primary mt-8">10. Contatti</h3>
                    <p>Per qualsiasi domanda relativa a questi termini, puoi contattarci attraverso la nostra pagina di contatto o via WhatsApp.</p>

                    <div className="bg-background-alt p-6 rounded-xl border-l-4 border-accent mt-8">
                        <p className="text-accent font-bold mb-2">📧 Hai domande?</p>
                        <p>Non esitare a contattarci per qualsiasi chiarimento sui nostri termini e condizioni.</p>
                    </div>

                    <p className="mt-8 italic text-sm border-t border-border/20 pt-6">Ultimo aggiornamento: Gennaio 2026</p>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
