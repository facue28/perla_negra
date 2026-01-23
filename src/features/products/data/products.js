import productLube from '@/assets/images/product-detail.png';
import productPerfume from '@/assets/images/product-detail.png';
import productSupplement from '@/assets/images/product-detail.png';

const rawProducts = [
    {
        "id": 1.0,
        "nombre": "PREMIUM RELAXING",
        "subtitulo": "GEL LUBRIFICANTE ANALE CON JOJOBA E CAMOMILLA",
        "descripcion": "Lubrificante personale a base acquosa con estratti di jojoba ad alta concentrazione che rilassano e rendono la pelle morbida e setosa. Ha proprietà lenitive e riparatrici, con un effetto positivo sulle mucose anali sensibili, mantenendo la pelle morbida e lubrificata.",
        "tamaño_ml": "130 ml",
        "tamaño_fl_oz": "4.4 fl oz",
        "precio": 16.4,
        "categoria": "GEL LUBRIFICANTE",
        "imagen": null,
        "codigo": "LUB01",
        "descripcion_adicional": "Senza parabeni | Senza profumo | Senza coloranti"
    },
    {
        "id": 2.0,
        "nombre": "SUPREME EXTRA TIME",
        "subtitulo": "Gel lubrificante ritardante con effetto freddo per relazioni più lunghe",
        "descripcion": "L'unico lubrificante anale con effetto calore. Intensity crea sulla pelle una sensazione di calore che aumenta immediatamente la sensibilità, intensificando le tue sensazioni.",
        "tamaño_ml": "130 ml",
        "tamaño_fl_oz": "4.4 fl oz",
        "precio": 16.4,
        "categoria": "GEL LUBRIFICANTE",
        "imagen": null,
        "codigo": "LUB03",
        "descripcion_adicional": "Senza parabeni | Senza profumo | Senza coloranti"
    },
    {
        "id": 3.0,
        "nombre": "INTENSITY HOT PLEASURE",
        "subtitulo": null,
        "descripcion": "L'unico lubrificante anale con effetto calore. Intensity crea sulla pelle una sensazione di calore che aumenta immediatamente la sensibilità, intensificando le tue sensazioni.",
        "tamaño_ml": "130 ml",
        "tamaño_fl_oz": "4.4 fl oz",
        "precio": 19.2,
        "categoria": "GEL LUBRIFICANTE",
        "imagen": null,
        "codigo": "LUB02",
        "descripcion_adicional": "Senza parabeni | Senza profumo | Senza coloranti"
    },
    {
        "id": 4.0,
        "nombre": "IBIZA",
        "subtitulo": "APHRODISIAC EAU DETOILETTE",
        "descripcion": "Una fragranza unisex, sensuale e vibrante. Come una brezza marina carica di desiderio, risveglia i sensi con una freschezza agrumata e un cuore morbido che evolve in un fondo caldo e irresistibile. A unisex, sensual, and vibrant fragrance. Like a sea breeze charged with desire, it awakens the senses with citrusy freshness and a soft heart that flows into a warm, addictive base. Designed to seduce—no rules, no limits, no labels. Creata per sedurre, senza regole né generi.",
        "tamaño_ml": "100 ml",
        "tamaño_fl_oz": "3.4 fl oz",
        "precio": 49.6,
        "categoria": "FRAGANZA",
        "imagen": null,
        "codigo": "IBZ",
        "descripcion_adicional": "Note di Testa: fiore di tè dolce e lime Note di Cuore: ambra grigia, iris e note terrose Note di Fondo: cuoio, iris e vaniglia."
    },
    {
        "id": 5.0,
        "nombre": "Bali Sunset stripped",
        "subtitulo": "APHRODISIAC EAU DETOILETTE",
        "descripcion": "Una fragranza femminile che gioca con i contrasti: note floreali e dolci si intrecciano in una tensione sensuale, attraversata da una vibrazione salata che risveglia e cattura i sensi.",
        "tamaño_ml": "100 ml",
        "tamaño_fl_oz": "3.4 fl oz",
        "precio": 53.6,
        "categoria": "FRAGANZA",
        "imagen": null,
        "codigo": "BSS",
        "descripcion_adicional": "Nota di testa: accordo salato Nota di cuore: gelsomino Nota di fondo: meringa"
    },
    {
        "id": 6.0,
        "nombre": "FUCKING FABULOUS",
        "subtitulo": "APHRODISIAC EAU DETOILETTE",
        "descripcion": "Una fragranza maschile dal carattere fresco e sofisticato. Le note agrumate donano energia e vitalità, mentre i legni nobili conferiscono profondità ed eleganza.",
        "tamaño_ml": "100 ml",
        "tamaño_fl_oz": "3.4 fl oz",
        "precio": 42.2,
        "categoria": "FRAGANZA",
        "imagen": null,
        "codigo": "FBLS",
        "descripcion_adicional": "Note di testa: pompelmo, lime, menta e pepe rosa Note di cuore: zenzero, vetiver e gelsomino Note di fondo: incenso di olibano e legno di cedro."
    },
    {
        "id": 7.0,
        "nombre": "VERY SEXY",
        "subtitulo": "APHRODISIAC EAU DETOILETTE",
        "descripcion": "Questo profumo non si indossa, si conquista. Pensato per la donna che non chiede permesso, che trasforma gli sguardi in desideri e i momenti in ricordi.Non è solo un profumo. È una dichiarazione d'intenti.",
        "tamaño_ml": "50 ml",
        "tamaño_fl_oz": "1,7",
        "precio": 29.2,
        "categoria": "FRAGANZA",
        "imagen": null,
        "codigo": "PLS",
        "descripcion_adicional": "Note di Testa: mandorla, caffè, bergamotto e limone. Note di Cuore: tuberosa, gelsomino, fiore d'arancio, iris e rosa bulgara. Note di Fondo: cacao, vaniglia e cannella."
    },
    {
        "id": 8.0,
        "nombre": "PETIT MORT",
        "subtitulo": "APHRODISIAC EAU DETOILETTE",
        "descripcion": "È una fragranza floreale e legnosa, con un aroma allegro, giovanile, fresco e puro che trasmette un'indescrivibile sensazione di libertà.",
        "tamaño_ml": "50 ml",
        "tamaño_fl_oz": "1,7",
        "precio": 29.2,
        "categoria": "FRAGANZA",
        "imagen": null,
        "codigo": "PM03",
        "descripcion_adicional": "Note di Testa: mela, mandarino e magnolia. Note di Cuore: ribes bianco, peonia e gelsomino. Note di Fondo: muschio e Amberwood."
    },
    {
        "id": 9.0,
        "nombre": "ITFEMME",
        "subtitulo": "APHRODISIAC EAU DETOILETTE",
        "descripcion": "Il calore narcotico della vaniglia libera il suo istinto carnale. Un aroma orientale-floreale, provocante e selvaggio, che cattura, accelera ed esalta i sensi. Un risultato magnetico.",
        "tamaño_ml": "60 ml",
        "tamaño_fl_oz": "2 fl oz",
        "precio": 32.7,
        "categoria": "FRAGANZA",
        "imagen": null,
        "codigo": "IT01",
        "descripcion_adicional": "Note di Testa: Ylang-Ylang e vaniglia Note di Cuore: Legno di sandalo Note di Fondo: Popcorn"
    },
    {
        "id": 10.0,
        "nombre": "ITFEMME FLORALE",
        "subtitulo": "APHRODISIAC EAU DETOILETTE",
        "descripcion": "Immergiti in una tentazione irresistibile con questa fragranza provocante e seducente, dal contrasto audace e affascinante. È un profumo creato per chi non passa inosservata",
        "tamaño_ml": "60 ml",
        "tamaño_fl_oz": "2 fl oz",
        "precio": 32.7,
        "categoria": "FRAGANZA",
        "imagen": null,
        "codigo": "IT02",
        "descripcion_adicional": "Note di Testa: bergamotto, agrumi e pera. Note di Cuore: gelsomino, ylang ylang e legno di palissandro. Note di Fondo: vaniglia, fava tonka e legno di cedro."
    },
    {
        "id": 11.0,
        "nombre": "CRAZY GIRL",
        "subtitulo": "APHRODISIAC EAU DETOILETTE",
        "descripcion": "Una fragranza creata per le donne che emanano sicurezza e amano il gioco della seduzione. Un profumo fresco, seducente, sensuale e irresistibile",
        "tamaño_ml": "60 ml",
        "tamaño_fl_oz": "2 fl oz",
        "precio": 30.7,
        "categoria": "FRAGANZA",
        "imagen": null,
        "codigo": "C51",
        "descripcion_adicional": "Note di Testa: lampone e limone di Amalfi Note di Cuore: gelsomino, fiore d'arancio africano e gardenia Note di Fondo: miele e ambra."
    },
    {
        "id": 12.0,
        "nombre": "HOT INEVITABLE",
        "subtitulo": "APHRODISIAC EAU DETOILETTE",
        "descripcion": "Una collezione di fragranze irresistibili, dove ogni variante è un invito al desiderio: da quella fruttata e assuefacente, a quella floreale, intensa o misteriosa. Personalità diverse, un'unica intenzione: sedurre senza limiti.",
        "tamaño_ml": "100 ml",
        "tamaño_fl_oz": "3.4 fl oz",
        "precio": 37.8,
        "categoria": "FRAGANZA",
        "imagen": null,
        "codigo": "C01",
        "descripcion_adicional": "Note di Testa: mango e bergamotto Note di Cuore: gelsomino e incenso di olibano Note di Fondo: vaniglia e sandalo."
    },
    {
        "id": 13.0,
        "nombre": "HOT INEVITABLE PRIVEE",
        "subtitulo": "APHRODISIAC EAU DETOILETTE",
        "descripcion": "Una collezione di fragranze irresistibili, dove ogni variante è un invito al desiderio: da quella fruttata e assuefacente, a quella floreale, intensa o misteriosa. Personalità diverse, un'unica intenzione: sedurre senza limiti.",
        "tamaño_ml": "100 ml",
        "tamaño_fl_oz": "3.4 fl oz",
        "precio": 37.8,
        "categoria": "FRAGANZA",
        "imagen": null,
        "codigo": "C01V-1",
        "descripcion_adicional": "Note di Testa: pera, pepe rosa e fiore d'arancio Note di Cuore: caffè, gelsomino, mandorla Note di Fondo: vaniglia e legno di cedro"
    },
    {
        "id": 14.0,
        "nombre": "HOT INEVITABLE SO EXCITED",
        "subtitulo": "APHRODISIAC EAU DETOILETTE",
        "descripcion": "Una collezione di fragranze irresistibili, dove ogni variante è un invito al desiderio: da quella fruttata e assuefacente, a quella floreale, intensa o misteriosa. Personalità diverse, un'unica intenzione: sedurre senza limiti.",
        "tamaño_ml": "100 ml",
        "tamaño_fl_oz": "3.4 fl oz",
        "precio": 37.8,
        "categoria": "FRAGANZA",
        "imagen": null,
        "codigo": "C01V-2",
        "descripcion_adicional": "Note di Testa: peonia, pesca e violetta Note di Cuore: gigli, giglio bianco, giacinto, gelsomino, fresia Note di Fondo: muschio, legno di cedro, ambra."
    },
    {
        "id": 15.0,
        "nombre": "FOR HIM",
        "subtitulo": "APHRODISIAC EAU DETOILETTE",
        "descripcion": "ISPIRATO A UN UOMO DISTINTO, MISTERIOSO E SENSUALE. Un ritratto olfattivo per l'amante sicuro di sé, capace di proiettare la forza iconica dell'attrazione sessuale",
        "tamaño_ml": "100 ml",
        "tamaño_fl_oz": "3.4 fl oz",
        "precio": 33.2,
        "categoria": "FRAGANZA",
        "imagen": null,
        "codigo": "FH",
        "descripcion_adicional": "Note di Testa: mela verde, lavanda Note di Fondo: abete, legno di cedro"
    },
    {
        "id": 16.0,
        "nombre": "FOR HIM VIP",
        "subtitulo": "APHRODISIAC EAU DETOILETTE",
        "descripcion": "IL PROFUMO DELLA SEDUZIONE Una fragranza dallo spirito audace, intenso e irresistibile",
        "tamaño_ml": "100 ml",
        "tamaño_fl_oz": "3.4 fl oz",
        "precio": 33.2,
        "categoria": "FRAGANZA",
        "imagen": null,
        "codigo": "FH02",
        "descripcion_adicional": "Note di Testa: limone, zenzero e menta. Note di Fondo: Fava Tonka e Amberwood."
    },
    {
        "id": 17.0,
        "nombre": "INEVITABLE MEN APHRODISIAC",
        "subtitulo": "APHRODISIAC EAU DETOILETTE",
        "descripcion": "Niente è più intenso di Inevitable",
        "tamaño_ml": "100 ml",
        "tamaño_fl_oz": "3.4 fl oz",
        "precio": 33.2,
        "categoria": "FRAGANZA",
        "imagen": null,
        "codigo": "IN01",
        "descripcion_adicional": "Note di Testa: pompelmo, cardamomo e coriandolo Nota di Cuore: assenzio, geranio, artemisia e mango Nota di Fondo: vetiver, legno di guaiaco e fava tonka"
    },
    {
        "id": 18.0,
        "nombre": "INEVITABLE MEN VIP APHRODISIAC",
        "subtitulo": "APHRODISIAC EAU DETOILETTE",
        "descripcion": "Niente è più intenso di Inevitable",
        "tamaño_ml": "100 ml",
        "tamaño_fl_oz": "3.4 fl oz",
        "precio": 33.2,
        "categoria": "FRAGANZA",
        "imagen": null,
        "codigo": "IN02",
        "descripcion_adicional": "Nota di Testa: incenso di Kyara Note di Cuore: ambra e fava tonka Note di Fondo: vaniglia, cuoio e note legnose."
    },
    {
        "id": 19.0,
        "nombre": "hi! SEX",
        "subtitulo": "AFRODISIACO",
        "descripcion": "È un afrodisiaco naturale, ma anche un invito a riconnetterti con la tua essenza, a risvegliare il tuo desiderio e a vivere la tua intimità in modo pieno e consapevole. La sua formula combina il potere di ingredienti millenari che rivitalizzano il corpo, potenziano l'energia e migliorano le prestazioni sessuali",
        "tamaño_ml": "60 CAPS",
        "tamaño_fl_oz": null,
        "precio": 35.9,
        "categoria": "SUPLEMENTO",
        "imagen": null,
        "codigo": "HSX-AE- 001",
        "descripcion_adicional": "AUMENTA IL TUO DESIDERIO SESSUALE: 2 capsule al giorno"
    },
    {
        "id": 20.0,
        "nombre": "hi! SEX",
        "subtitulo": "AFRODISIACO",
        "descripcion": "È un afrodisiaco naturale, ma anche un invito a riconnetterti con la tua essenza, a risvegliare il tuo desiderio e a vivere la tua intimità in modo pieno e consapevole. La sua formula combina il potere di ingredienti millenari che rivitalizzano il corpo, potenziano l'energia e migliorano le prestazioni sessuali",
        "tamaño_ml": "40 CAPS + ESPOSITORE",
        "tamaño_fl_oz": null,
        "precio": 69.7,
        "categoria": "SUPLEMENTO",
        "imagen": null,
        "codigo": "HSX-AE- 003",
        "descripcion_adicional": null
    },
    {
        "id": 21.0,
        "nombre": "BLACK DRAGON",
        "subtitulo": "CREMA INTENSIFICANTE",
        "descripcion": "L'esclusiva formula di Sexitive, sviluppata con estratti naturali, favorisce una maggiore eccitazione e intensifica la risposta sessuale. Inizia con una sensazione calda e delicata che poi si intensifica profondamente",
        "tamaño_ml": "50 ml",
        "tamaño_fl_oz": "1.7 fl oz",
        "precio": 25.2,
        "categoria": "CREMA",
        "imagen": null,
        "codigo": "DRN02",
        "descripcion_adicional": "L'esclusiva formula di Sexitive, sviluppata con estratti naturali, favorisce una maggiore eccitazione e intensifica la risposta sessuale. Inizia con una sensazione calda e delicata che poi si intensifica profondamente"
    },
    {
        "id": 22.0,
        "nombre": "MORE SEX - BERRIES",
        "subtitulo": "Goditi un delizioso sesso orale con una sensazione unica.",
        "descripcion": "Dimostra al partner che hai buon gusto. Questo lubrificante è stato creato per aggiungere sapore e migliorare il sesso orale.",
        "tamaño_ml": "50 ml",
        "tamaño_fl_oz": "1.7 fl oz",
        "precio": 21.9,
        "categoria": "GEL LUBRIFICANTE COMESTIBLE",
        "imagen": null,
        "codigo": "MMSB",
        "descripcion_adicional": "FRUTTI DI BOSCO"
    },
    {
        "id": 23.0,
        "nombre": "MORE SEX - CHOCOLATE",
        "subtitulo": "Goditi un delizioso sesso orale con una sensazione unica.",
        "descripcion": "Dimostra al partner che hai buon gusto. Questo lubrificante è stato creato per aggiungere sapore e migliorare il sesso orale.",
        "tamaño_ml": "50 ml",
        "tamaño_fl_oz": "1.7 fl oz",
        "precio": 21.9,
        "categoria": "GEL LUBRIFICANTE COMESTIBLE",
        "imagen": null,
        "codigo": "MMSC",
        "descripcion_adicional": "CHOCOLATE"
    },
    {
        "id": 24.0,
        "nombre": "MINE MY PLEASURE",
        "subtitulo": "Gel lubrificante con L-Arginina",
        "descripcion": "Gel lubrificante con L-Arginina, un amminoacido di origine naturale con capacità vasodilatatrice, specificamente formulato per aumentare l'eccitazione e la sensibilità del clitoride, favorendo orgasmi più intensi e veloci.",
        "tamaño_ml": "50 ml",
        "tamaño_fl_oz": "1.7 fl oz",
        "precio": 15,
        "categoria": "GEL INTIMO",
        "imagen": null,
        "codigo": "MMP",
        "descripcion_adicional": null
    },
    {
        "id": 25.0,
        "nombre": "DIVA'S SECRET - EFFETTO CALORE",
        "subtitulo": "Una combinazione unica di componenti che stimolano, aumentano il desiderio e aiutano a intensificare gli orgasmi.",
        "descripcion": "Una volta applicato, genera un aumento della temperatura, massimizzando il piacere.",
        "tamaño_ml": "30 ml",
        "tamaño_fl_oz": "1 fl oz",
        "precio": 16.4,
        "categoria": "GEL INTIMO",
        "imagen": null,
        "codigo": "DVS01",
        "descripcion_adicional": "Una combinazione unica di componenti che stimolano, aumentano il desiderio e aiutano a intensificare gli orgasmi."
    },
    {
        "id": 26.0,
        "nombre": "DIVA'S SECRET - EFFETTO STRINGENTE ",
        "subtitulo": "Una combinazione unica di componenti che stimolano, aumentano il desiderio e aiutano a intensificare gli orgasmi.",
        "descripcion": "Una volta applicato, regala un'immediata sensazione di avvolgente compattezza, intensificando il piacere con il suo effetto stringente.",
        "tamaño_ml": "30 ml",
        "tamaño_fl_oz": "1 fl oz",
        "precio": 18.7,
        "categoria": "GEL INTIMO",
        "imagen": null,
        "codigo": "DVS02",
        "descripcion_adicional": "Una combinazione unica di componenti che stimolano, aumentano il desiderio e aiutano a intensificare gli orgasmi."
    },
    {
        "id": 27.0,
        "nombre": "SENS BOMB MACA",
        "subtitulo": "GEL INTIMO CON ESTRATTI NATURAL",
        "descripcion": "Tutto il potere afrodisiaco della Maca concentrato in questo gel intimo femminile, che offre un'azione rinvigorente aumentando il desiderio sessuale.",
        "tamaño_ml": "70 ml",
        "tamaño_fl_oz": "2.5 fl oz",
        "precio": 13.9,
        "categoria": "GEL INTIMO",
        "imagen": null,
        "codigo": null,
        "descripcion_adicional": "I gel Sens Bomb, con il loro effetto calore, offrono una stimolante sensazione di relax che risveglia il desiderio sessuale."
    },
    {
        "id": 28.0,
        "nombre": "SENS BOMB SANDALO",
        "subtitulo": "GEL INTIMO CON ESTRATTI NATURAL",
        "descripcion": "Formulato con il potere stimolante e afrodisiaco del Sandalo. Progettato per aiutare a intensificare le sensazioni. Offre uno stimolante effetto di rilassamento che risveglia il desiderio.",
        "tamaño_ml": "70 ml",
        "tamaño_fl_oz": "2.5 fl oz",
        "precio": 13.9,
        "categoria": "GEL INTIMO",
        "imagen": null,
        "codigo": null,
        "descripcion_adicional": "I gel Sens Bomb, con il loro effetto calore, offrono una stimolante sensazione di relax che risveglia il desiderio sessuale."
    }
];

// Mapper to normalize categories for UI
const categoryMap = {
    'GEL LUBRIFICANTE': 'Lubricantes',
    'GEL LUBRIFICANTE COMESTIBLE': 'Lubricantes',
    'FRAGANZA': 'Fragancias',
    'SUPLEMENTO': 'Afrodisiacos',
    'CREMA': 'Afrodisiacos',
    'GEL INTIMO': 'Lubricantes' // Or Afrodisiacos depending on preference
};

// Helper to get image by category
const getImageByCategory = (cat) => {
    switch (cat) {
        case 'GEL LUBRIFICANTE':
        case 'GEL LUBRIFICANTE COMESTIBLE':
        case 'GEL INTIMO':
            return productLube;
        case 'FRAGANZA':
            return productPerfume;
        case 'SUPLEMENTO':
        case 'CREMA':
            return productSupplement;
        default:
            return productLube;
    }
};

// Helper to capitalize first letter of each word (Title Case)
const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
};

// Helper to create URL-friendly slugs
const createSlug = (str) => {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

export const products = rawProducts.map(p => ({
    id: p.id,
    name: toTitleCase(p.nombre),
    slug: createSlug(p.nombre),
    category: categoryMap[p.categoria] || p.categoria,
    price: p.precio,
    image: p.imagen || getImageByCategory(p.categoria),
    description: p.descripcion,
    subtitle: toTitleCase(p.subtitulo),
    size: p.tamaño_ml,
    sizeFlOz: p.tamaño_fl_oz,
    code: p.codigo,
    shortDescription: p.subtitulo || (p.descripcion ? p.descripcion.split('.')[0] + '.' : ''),
    details: p.descripcion_adicional
}));
