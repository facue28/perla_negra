# 🖤 Perla Negra - E-commerce per Adulti

<div align="center">

**Benessere intimo senza tabù**

Un'esperienza e-commerce elegante e discreta per prodotti destinati a un pubblico adulto (+18).

[Demo Live](https://perlanegra.it) • [Installazione](#-installazione) • [Caratteristiche](#-caratteristiche)

</div>

---

## 📖 Descrizione

**Perla Negra** è un sex shop online moderno e professionale costruito con React e TypeScript. Il sito offre un'esperienza utente premium con design elegante, navigazione intuitiva, un sistema di ordini integrato con WhatsApp e un pannello di amministrazione backend potente gestito via Supabase.

Il progetto è stato pensato per garantire:
- ✨ Design moderno con effetti glassmorphism e animazioni fluide
- 🔒 Privacy, discrezione e sicurezza dei dati (RLS)
- 📱 Completa responsività mobile (Mobile-First)
- 🇮🇹 Interfaccia completamente in italiano
- ⚡ Performance ottimizzate e SEO robusto

---

## 🛠️ Stack Tecnologico

### Frontend
- **Framework**: [React](https://react.dev/) con TypeScript per tipizzazione statica
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animazioni**: [Framer Motion](https://www.framer.com/motion/)
- **Icone**: [Lucide React](https://lucide.dev/)

### Backend & Database (BaaS)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Autenticazione**: Supabase Auth
- **Storage**: Supabase Storage (per le immagini dei prodotti)
- **Sicurezza**: Row Level Security (RLS) per proteggere prodotti, ordini e coupon

---

## 🚀 Installazione

### Prerequisiti

- [Node.js](https://nodejs.org/) v18 o superiore
- Progetto Supabase configurato (con tabelle per `products`, `orders`, `coupons`, `admins`)

### Passi

1. **Clona il repository**
   ```bash
   git clone <repository-url>
   cd Perla_negra
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente**
   Crea un file `.env.local` nella root del progetto e aggiungi le chiavi di Supabase e Turnstile:
   ```env
   VITE_SUPABASE_URL=tuo_supabase_url
   VITE_SUPABASE_ANON_KEY=tua_supabase_anon_key
   VITE_TURNSTILE_SITE_KEY=tua_chiave_turnstile
   ```

4. **Avvia il server di sviluppo**
   ```bash
   npm run dev
   ```

5. **Apri nel browser**
   ```
   http://localhost:5173
   ```

---

## 📁 Struttura del Progetto (Principale)

L'architettura segue i principi Feature-Sliced Design (parzialmente) e separazione delle responsabilità:

```
Perla_negra/
├── public/              # File statici e Sitemap
├── src/
│   ├── assets/          # Brand, icone, immagini
│   ├── components/      # Componenti UI riutilizzabili e Layout (Navbar, Footer)
│   ├── features/        # Moduli isolati per dominio
│   │   ├── admin/       # Logica e UI del Pannello di Controllo
│   │   ├── auth/        # Gestione Autenticazione Supabase
│   │   ├── cart/        # Logica del Carrello e Checkout
│   │   ├── orders/      # Gestione Ordini
│   │   └── products/    # Visualizzazione e gestione Prodotti
│   ├── pages/           # Viste principali (HomePage, ProductListPage, ecc.)
│   ├── lib/             # Utility globali (Supabase client, SEO, Analytics)
│   ├── App.tsx          # Configurazione Routing
│   ├── main.tsx         # Entry point React
│   └── index.css        # Stili base e configurazione Tailwind
```

---

## ✨ Caratteristiche Principali

### 🔞 Verificazione dell'Età
- Modal elegante con controllo accesso garantito (+18) e persistenza via localStorage.

### 🛒 Sistema di Carrello e Ordini
- Logica centralizzata tramite Context API.
- Gestione di Coupon e Codici Sconto direttamente da DB.
- Integrazione sicura degli ordini sul DB tramite RPC (Remote Procedure Call) con rate limiting.
- Redirezione finale fluidissima verso WhatsApp per la conclusione dell'acquisto.

### 🛡️ Pannello di Amministrazione (Admin)
- Dashboard protetta accessibile solo ad amministratori autorizzati.
- Gestione CRUD (Create, Read, Update, Delete) per i Prodotti.
- Visualizzazione e gestione degli Ordini ricevuti.
- Supporto per la "Cancellazione Logica" (Soft Delete) per non perdere lo storico ordini.

### 🎨 Design Premium & CRO
- Layout ottimizzato per la conversione (Call To Actions chiare, Trust Badges).
- Navbar intelligente (nasconde/mostra in base allo scroll) e Sticky Bar su mobile per il Checkout.
- Ottimizzazione LCP (Largest Contentful Paint) con Static Shell per l'Hero section.

### 🔮 Funzionalità Future (Roadmap)
- **Rastreo dell'Ordine (Order Tracking):** Area dedicata dove il cliente può inserire il numero d'ordine e l'email per visualizzare lo stato della spedizione in tempo reale.

---

## 🔒 Sicurezza e Privacy (Hardened)

- **Row Level Security (RLS)** attiva su tutte le tabelle Supabase: i clienti possono leggere i prodotti attivi, ma solo gli admin possono modificarli o vedere tutti gli ordini.
- **Validazione Server-Side**: L'inserimento di ordini avviene tramite una funzione PostgreSQL sicura (`create_order`) che valida la disponibilità, calcola i totali in modo autoritativo e applica i coupon.
- **Protezione Anti-Bot**: Integrazione con Cloudflare Turnstile nel checkout.

---

## 📝 Licenza

Questo progetto è privato e proprietario.

© 2026 Perla Negra. Tutti i diritti riservati. L'uso non autorizzato, la copia o la distribuzione del codice sorgente è severamente vietato.

---

## 📞 Supporto

Per domande o supporto, contattaci attraverso:
- 🌐 Website: [perlanegra.it](https://perlanegra.it)
- 📸 Instagram: [@perlanegra.it](https://www.instagram.com/perlanegra.it)
- 💬 WhatsApp: +39 377 831 7091
