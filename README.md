# 🖤 Perla Negra - E-commerce per Adulti

<div align="center">

**Benessere intimo senza tabù**

Un'esperienza e-commerce elegante e discreta per prodotti destinati a un pubblico adulto (+18).

[Demo Live](http://localhost:5173) • [Installazione](#-installazione) • [Caratteristiche](#-caratteristiche)

</div>

---

## 📖 Descrizione

**Perla Negra** è un sex shop online moderno e professionale costruito con React. Il sito offre un'esperienza utente premium con design elegante, navigazione intuitiva e un sistema di ordini integrato con WhatsApp.

Il progetto è stato pensato per garantire:
- ✨ Design moderno con effetti glassmorphism
- 🔒 Privacy e discrezione
- 📱 Completa responsività mobile
- 🇮🇹 Interfaccia completamente in italiano
- ⚡ Performance ottimizzate

---

## 🛠️ Stack Tecnológico

- **Framework**: [React 19](https://react.dev/) - Libreria UI moderna e performante
- **Build Tool**: [Vite 7](https://vitejs.dev/) - Build tool velocissimo
- **Routing**: [React Router v7](https://reactrouter.com/) - Navigazione tra pagine
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - Framework CSS utility-first
- **Icons**: [Lucide React](https://lucide.dev/) - Icone moderne e personalizzabili
- **Linguaggio**: JavaScript (ES6+)

---

## 🚀 Installazione

### Prerequisiti

- [Node.js](https://nodejs.org/) v18 o superiore
- npm (viene installato con Node.js)

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

3. **Avvia il server di sviluppo**
   ```bash
   npm run dev
   ```

4. **Apri nel browser**
   ```
   http://localhost:5173
   ```

---

## 📜 Comandi Disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia il server di sviluppo in modalità hot-reload |
| `npm run build` | Crea il build di produzione ottimizzato |
| `npm run preview` | Visualizza il build di produzione localmente |
| `npm run lint` | Esegue ESLint per verificare la qualità del codice |

---

## 📁 Struttura del Progetto

```
Perla_negra/
├── public/              # File statici (favicon, etc.)
├── src/
│   ├── assets/          # Asset globali organizzati
│   │   ├── brand/       # Logo e identità di marca
│   │   ├── icons/       # Icone UI
│   │   ├── images/      # Immagini globali (hero, background)
│   │   ├── illustrations/
│   │   └── video-posters/
│   ├── features/        # Funzionalità específicas
│   │   └── products/
│   │       └── assets/  # Asset del catálogo
│   ├── components/      # Componenti riutilizzabili
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── AgeVerification.jsx
│   │   └── CookieConsent.jsx
│   ├── pages/           # Pagine dell'applicazione
│   │   ├── ChiSono.jsx
│   │   ├── ProductList.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── CartPage.jsx
│   │   ├── Contact.jsx
│   │   ├── NotFoundPage.jsx
│   │   └── legal/       # Pagine legali
│   │       ├── TermsPage.jsx
│   │       ├── PrivacyPage.jsx
│   │       └── ResponsibleUsePage.jsx
│   ├── context/         # Context API (stato globale)
│   │   └── CartContext.jsx
│   ├── data/            # Dati dei prodotti
│   │   └── products.js
│   ├── App.jsx          # Componente principale
│   ├── main.jsx         # Entry point
│   └── index.css        # Stili globali
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## ✨ Caratteristiche Principali

### 🔞 Verificazione dell'Età
- Modal elegante con effetto glassmorphism
- Controllo accesso solo per maggiorenni (+18)
- Salvataggio della preferenza in localStorage

### 🍪 Gestione Cookie (GDPR)
- Banner di consenso conforme alle normative europee
- Opzioni "Accetta" / "Rifiuta"
- Link alla Privacy Policy

### 🛒 Sistema di Carrello
- Gestione prodotti con Context API
- Quantità modificabili
- Calcolo totale automatico

### 📱 Ordini WhatsApp
- Generazione automatica di ID univoci (`PN-DDMM-XXX`)
- Messaggio formattato con dettagli cliente e prodotti
- Integrazione diretta con WhatsApp

### 🎨 Design Premium
- Palette di colori elegante (nero, accent verde acqua)
- Effetti glassmorphism e blur
- Animazioni fluide
- Tipografia professionale (Inter + Times New Roman)

### 📦 Catalogo Prodotti
- Sistema di filtri per categoria
- Ordinamento per prezzo
- Filtro per range di prezzo
- Pagine dettaglio prodotto complete

### 📄 Pagine Legali
- Termini e Condizioni
- Privacy Policy (GDPR compliant)
- Uso Responsabile

---

## 🌐 Deployment

### Build di Produzione

Per creare una versione ottimizzata per la produzione:

```bash
npm run build
```

I file ottimizzati verranno generati nella cartella `dist/`.

### Hosting Consigliati

- [Vercel](https://vercel.com/) - Deploy automatico da Git
- [Netlify](https://www.netlify.com/) - CI/CD integrato
- [Firebase Hosting](https://firebase.google.com/docs/hosting) - Google Cloud

---

## ⚙️ Configurazione

### WhatsApp Business Number

Per configurare il numero WhatsApp per gli ordini, modifica:

**File**: `src/pages/CartPage.jsx`

```javascript
// Linea 49
const shopNumber = "393778317091"; // Sostituire con il tuo numero
```

### Prodotti

Per aggiungere o modificare prodotti:

**File**: `src/data/products.js`

```javascript
{
  id: 1,
  name: "Nome Prodotto",
  price: 29.99,
  category: "Categoria",
  image: "/product_image.png",
  description: "Descrizione breve",
  details: "Descrizione estesa"
}
```

---

## 🔒 Privacy e Sicurezza

- ✅ Nessun dato sensibile salvato in database
- ✅ Comunicazioni WhatsApp cifrate end-to-end
- ✅ Conformità GDPR per utenti europei
- ✅ Cookie essenziali con consenso esplicito

---

## 📝 Licenza

Questo progetto è privato e proprietario.

© 2026 Perla Negra. Tutti i diritti riservati.

---

## 👤 Autore

**Perla Negra Team**
- Website: [perlanegra.it](https://perlanegra.it)
- Instagram: [@perlanegra.it](https://www.instagram.com/perlanegra.it)
- WhatsApp: +39 377 831 7091

---

## 📞 Supporto

Per domande o supporto, contattaci attraverso:
- 📧 Form di contatto sul sito
- 💬 WhatsApp
- 📸 Instagram Direct

---

<div align="center">

**Fatto con 🖤 da Perla Negra**

*Benessere intimo senza tabù*

</div>
