// ── View routing ──────────────────────────────
    const views = ['inici', 'pressupost', 'metes', 'dashboard', 'comparador', 'assessor', 'login', 'register', 'historial', 'compte'];
    const navIds = ['inici', 'pressupost', 'metes', 'dashboard', 'comparador', 'assessor', 'historial', 'compte'];
    const navDesktop = { inici: 'nav-inici', pressupost: 'nav-pressupost', metes: 'nav-metes', dashboard: 'nav-dashboard', comparador: 'nav-comparador', assessor: 'nav-assessor', historial: 'nav-historial', compte: 'nav-compte' };
    const navMobile  = { inici: 'mnav-inici', pressupost: 'mnav-pressupost', metes: 'mnav-metes', dashboard: 'mnav-dashboard', comparador: 'mnav-comparador', assessor: 'mnav-assessor', historial: 'mnav-historial', compte: 'mnav-compte' };

    function showView(name) {
      views.forEach(v => {
        const el = document.getElementById('view-' + v);
        if (el) el.classList.toggle('active', v === name);
      });
      Object.keys(navDesktop).forEach(k => {
        const el = document.getElementById(navDesktop[k]);
        if (el) el.classList.toggle('active', k === name);
      });
      Object.keys(navMobile).forEach(k => {
        const el = document.getElementById(navMobile[k]);
        if (el) el.classList.toggle('active', k === name);
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (name === 'historial') initHistorial();
      if (name === 'compte')   initCompte();
      if (name === 'metes')    initMetes();
      if (name === 'dashboard') initDashboard();
      if (name === 'assessor')  initAssessor();
    }

    // ── Mobile hamburger ──────────────────────────
    let menuOpen = false;
    function toggleMenu() {
      menuOpen = !menuOpen;
      const menu = document.getElementById('mobile-menu');
      const iOpen = document.getElementById('icon-open');
      const iClose = document.getElementById('icon-close');
      menu.classList.toggle('open', menuOpen);
      iOpen.classList.toggle('hidden', menuOpen);
      iClose.classList.toggle('hidden', !menuOpen);
    }

    // ── Init Lucide icons ─────────────────────────
    // La inicialització es fa des de loadViews() a index.html un cop les vistes estan al DOM.

    // ══════════════════════════════════════════════
    //  MÒDUL ASSESSOR IA — 100% OFFLINE v2
    // ══════════════════════════════════════════════

    // ── Normalitzador de text ─────────────────────
    function norm(s) {
      return s.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[·.,'"""'']/g, ' ')
        .replace(/\s+/g, ' ').trim();
    }

    // ── Sinònims i àlies → categoria ─────────────
    // Qualsevol paraula clau aquí remapeja a la categoria destí
    const ALIAS = {
      // Piscines
      'piscina': 'piscines', 'piscines': 'piscines', 'natacio': 'piscines', 'nadar': 'piscines',
      'aquatic': 'piscines', 'aquatics': 'piscines', 'pisci': 'piscines',
      // Gimnàs
      'gimnas': 'gimnas', 'gimnasio': 'gimnas', 'gym': 'gimnas', 'fitness': 'gimnas',
      'crossfit': 'gimnas', 'pilates': 'gimnas', 'yoga': 'gimnas', 'zumba': 'gimnas',
      'musculacio': 'gimnas', 'pessos': 'gimnas', 'cardio': 'gimnas', 'sport': 'gimnas',
      // Streaming vídeo
      'netflix': 'streaming-video', 'hbo': 'streaming-video', 'disney': 'streaming-video',
      'prime video': 'streaming-video', 'movistar plus': 'streaming-video', 'filmin': 'streaming-video',
      'series': 'streaming-video', 'serie': 'streaming-video', 'pelicula': 'streaming-video',
      'pel licula': 'streaming-video', 'cinema casa': 'streaming-video', 'streaming': 'streaming-video',
      'plataforma video': 'streaming-video', 'vod': 'streaming-video',
      // Streaming música
      'spotify': 'streaming-musica', 'musica': 'streaming-musica', 'podcast': 'streaming-musica',
      'apple music': 'streaming-musica', 'tidal': 'streaming-musica', 'deezer': 'streaming-musica',
      'canco': 'streaming-musica', 'cancons': 'streaming-musica',
      // Transport públic
      'metro': 'transport', 'bus': 'transport', 'autobus': 'transport', 'tren': 'transport',
      'rodalies': 'transport', 'fgc': 'transport', 'tmb': 'transport', 'transport': 'transport',
      't-usual': 'transport', 't-jove': 'transport', 'targeta transport': 'transport',
      'abonament': 'transport', 'viatge': 'transport',
      // Bicing / bicicleta
      'bicing': 'bici', 'bicicleta': 'bici', 'bici': 'bici', 'ciclisme': 'bici',
      'bicis': 'bici', 'bici electrica': 'bici',
      // Patinets / mobilitat
      'patinet': 'patinets', 'patinets': 'patinets', 'scooter': 'patinets', 'voi': 'patinets',
      'lime': 'patinets', 'bolt': 'patinets', 'mobilitat': 'patinets',
      // Mòbil
      'mobil': 'mobil', 'telefon': 'mobil', 'tarifa': 'mobil', 'sim': 'mobil',
      'gigas': 'mobil', 'gb': 'mobil', 'trucades': 'mobil', '4g': 'mobil', '5g': 'mobil',
      'operadora': 'mobil', 'vodafone': 'mobil', 'movistar': 'mobil', 'orange': 'mobil',
      'yoigo': 'mobil', 'digi': 'mobil', 'amena': 'mobil', 'jazztel': 'mobil', 'simyo': 'mobil',
      // Internet fibra
      'fibra': 'internet', 'internet': 'internet', 'wifi casa': 'internet', 'adsl': 'internet',
      'router': 'internet', 'connexio internet': 'internet', 'banda ampla': 'internet',
      // Lloguer pis
      'pis': 'lloguer', 'habitacio': 'lloguer', 'lloguer': 'lloguer', 'apartament': 'lloguer',
      'estudi': 'lloguer', 'habitatge': 'lloguer', 'alquiler': 'lloguer', 'flat': 'lloguer',
      'residencia': 'lloguer', 'residencies': 'lloguer',
      // Coworking
      'coworking': 'coworking', 'espai treball': 'coworking', 'oficina': 'coworking',
      'desk': 'coworking', 'hot desk': 'coworking', 'espai compartit': 'coworking',
      // Alimentació / supermercats
      'supermercat': 'supermercats', 'super': 'supermercats', 'alimentacio': 'supermercats',
      'compra': 'supermercats', 'mercat': 'supermercats', 'aliments': 'supermercats',
      'menjar casa': 'supermercats', 'lidl': 'supermercats', 'aldi': 'supermercats',
      'mercadona': 'supermercats', 'condis': 'supermercats', 'bonpreu': 'supermercats',
      // Restaurants / menjar fora
      'restaurant': 'restaurants', 'menu': 'restaurants', 'dinar': 'restaurants',
      'sopar': 'restaurants', 'menjar fora': 'restaurants', 'bar': 'restaurants',
      'cafeteria': 'restaurants', 'pizza': 'restaurants', 'kebab': 'restaurants',
      'hamburguesa': 'restaurants', 'tapes': 'restaurants', 'entrepà': 'restaurants',
      // Cafès
      'cafe': 'cafes', 'cafes': 'cafes', 'cafeteria': 'cafes', 'te': 'cafes',
      'cappuccino': 'cafes', 'espresso': 'cafes', 'llet': 'cafes',
      // Assegurança salut
      'asseguranca salut': 'asseguranca-salut', 'mutua': 'asseguranca-salut',
      'asseguranca medica': 'asseguranca-salut', 'metge privat': 'asseguranca-salut',
      'clinica privada': 'asseguranca-salut', 'sanitas': 'asseguranca-salut',
      'adeslas': 'asseguranca-salut', 'asisa': 'asseguranca-salut',
      // Dental
      'dents': 'dental', 'dental': 'dental', 'dentista': 'dental', 'ortodon': 'dental',
      'bracket': 'dental', 'revisio dental': 'dental', 'neteja dental': 'dental',
      // Perruqueria
      'perruqueria': 'perruqueria', 'cabell': 'perruqueria', 'tall cabell': 'perruqueria',
      'barber': 'perruqueria', 'barberia': 'perruqueria', 'tint': 'perruqueria',
      'haircut': 'perruqueria', 'perruquer': 'perruqueria',
      // Farmàcia
      'farmacia': 'farmacia', 'medicament': 'farmacia', 'pastilla': 'farmacia',
      'antibiotic': 'farmacia', 'paracetamol': 'farmacia', 'crema': 'farmacia',
      // Idiomes
      'idiomes': 'idiomes', 'angles': 'idiomes', 'english': 'idiomes', 'frances': 'idiomes',
      'alemany': 'idiomes', 'italia': 'idiomes', 'classe idiomes': 'idiomes',
      'academia idiomes': 'idiomes', 'curs idiomes': 'idiomes',
      // Formació / cursos
      'curs': 'formacio', 'cursos': 'formacio', 'formacio': 'formacio', 'academia': 'formacio',
      'online learning': 'formacio', 'udemy': 'formacio', 'coursera': 'formacio',
      'certificat': 'formacio', 'master online': 'formacio',
      // Gaming / videojocs
      'videojoc': 'gaming', 'gaming': 'gaming', 'joc': 'gaming', 'playstation': 'gaming',
      'xbox': 'gaming', 'nintendo': 'gaming', 'steam': 'gaming', 'gamepass': 'gaming',
      'ps plus': 'gaming', 'consola': 'gaming',
      // Aparcament
      'aparcament': 'aparcament', 'parking': 'aparcament', 'garatge': 'aparcament',
      'aparcar': 'aparcament', 'moto aparcament': 'aparcament',
      // Roba / moda
      'roba': 'roba', 'moda': 'roba', 'zara': 'roba', 'hm': 'roba', 'shein': 'roba',
      'vinted': 'roba', 'roba segona ma': 'roba', 'subscripcio roba': 'roba',
      // Viatges / vacances
      'viatge': 'viatges', 'vacances': 'viatges', 'hotel': 'viatges', 'vueling': 'viatges',
      'ryanair': 'viatges', 'vol': 'viatges', 'hostal': 'viatges', 'airbnb': 'viatges',
    };

    // ── Base de dades de categories ───────────────
    const DB = {

      piscines: {
        label: 'piscines municipals',
        options: [
          {
            name: 'Piscines Municipals BCN (CM)', price: 11.30, priceLabel: '11,30€/mes',
            badge: 'Millor preu',
            description: 'Xarxa de piscines cobertes de l\'Ajuntament de Barcelona. Abonament mensual per al barri.',
            details: 'Centres com Can Dragó, Piscina del Carmel, Joan Miró, Neptú i 20+ més.'
          },
          {
            name: 'Esportiu Municipal (accés complet)', price: 22.50, priceLabel: '22,50€/mes',
            badge: 'Millor qualitat-preu',
            description: 'Abonament als centres esportius municipals (CEM) amb accés a piscina + gimnàs.',
            details: 'CEM Olímpic de la Vall d\'Hebron, CEM Mar Bella, CEM Espanya Industrial i altres.'
          },
          {
            name: 'DIR amb piscina', price: 29.90, priceLabel: '29,90€/mes',
            badge: 'Recomanat',
            description: 'Centres DIR seleccionats inclouen piscina coberta + sala de fitness + classes.',
            details: 'DIR Claris, DIR Diagonal, DIR Bac de Roda disposen de piscina.'
          },
          {
            name: 'Holmes Place Premium', price: 49.90, priceLabel: '49,90€/mes',
            badge: 'Més popular',
            description: 'Piscina olímpica, spa, sauna i àmplies instal·lacions. Experiència premium.',
            details: 'Centres a Passeig de Gràcia i Diagonal amb piscina coberta.'
          },
        ],
        tip: 'Les piscines municipals de l\'Ajuntament (CM) són de lluny les més barates. Truca al centre del teu barri per confirmar disponibilitat.'
      },

      gimnas: {
        label: 'gimnàs i fitness',
        options: [
          {
            name: 'Altafit / McFit', price: 19.90, priceLabel: '19,90€/mes',
            badge: 'Millor preu',
            description: 'Cadena de baix cost amb bona qualitat. Sense permanència ni matrícula.',
            details: 'Ubicacions a Sant Andreu, Nou Barris, Horta, Sants i Poblenou.'
          },
          {
            name: 'DIR Clàssic', price: 22.90, priceLabel: '22,90€/mes',
            badge: 'Econòmic',
            description: 'Accés a la xarxa de centres DIR a Barcelona. Tarifa mensual flexible.',
            details: '30+ centres. Classes grupals, sala de pesos i zona cardio incloses.'
          },
          {
            name: 'Anytime Fitness', price: 24.90, priceLabel: '24,90€/mes',
            badge: 'Millor qualitat-preu',
            description: 'Obert 24h/7 dies. Accés amb clau a qualsevol centre del món.',
            details: 'Ubicacions al centre, Sants, Les Corts i Poblenou.'
          },
          {
            name: 'VivaGym', price: 27.90, priceLabel: '27,90€/mes',
            badge: 'Recomanat',
            description: 'Classes il·limitades incloses: spinning, body pump, funcional, ioga.',
            details: 'Centres moderns a Eixample, Gràcia i Sarrià-Sant Gervasi.'
          },
          {
            name: 'Holmes Place', price: 49.90, priceLabel: '49,90€/mes',
            badge: 'Premium',
            description: 'Gimnàs premium amb piscina, spa, sauna i personal trainer.',
            details: 'Centres a Diagonal, Passeig de Gràcia i Pedralbes.'
          },
        ],
        tip: 'Molts gimnàs fan el primer mes gratis o sense matrícula si et domicilies. Demana sempre la promoció d\'entrada.'
      },

      'streaming-video': {
        label: 'streaming de vídeo',
        options: [
          {
            name: 'Netflix (amb anuncis)', price: 4.99, priceLabel: '4,99€/mes',
            badge: 'Millor preu',
            description: 'Catàleg complet de Netflix en HD amb anuncis puntuals (4-5 min/hora).',
            details: '2 pantalles simultànies. La millor opció si el pressupost és el criteri.'
          },
          {
            name: 'Amazon Prime Video', price: 4.99, priceLabel: '4,99€/mes',
            badge: 'Millor qualitat-preu',
            description: 'Inclou Prime Video + enviaments Amazon gratuïts + Prime Music.',
            details: 'Pla anual: 49,90€/any = 4,16€/mes efectiu.'
          },
          {
            name: 'HBO Max (Bàsic)', price: 5.99, priceLabel: '5,99€/mes',
            badge: 'Recomanat',
            description: 'Tot el catàleg HBO, Warner, DC i Max Originals. Qualitat HD.',
            details: 'El millor per a sèries de qualitat i cinema d\'autor.'
          },
          {
            name: 'Disney+', price: 5.99, priceLabel: '5,99€/mes',
            badge: 'Econòmic',
            description: 'Marvel, Star Wars, Pixar, Disney i National Geographic.',
            details: 'Pla Estàndard HD compartible amb membres de la llar.'
          },
          {
            name: 'Filmin', price: 8.99, priceLabel: '8,99€/mes',
            badge: 'Especial',
            description: 'Cinema independent, europeu i de festival. Única plataforma amb molt contingut en català.',
            details: 'Catàleg molt curiós per a amants del cinema de qualitat.'
          },
        ],
        tip: 'Netflix anuncis + HBO Bàsic = 10,98€/mes i tens pràcticament tot. Molts comparteixen comptes amb amics o família.'
      },

      'streaming-musica': {
        label: 'streaming de música',
        options: [
          {
            name: 'Spotify (Estudiant)', price: 5.99, priceLabel: '5,99€/mes',
            badge: 'Millor preu',
            description: 'Pla estudiant: 50% de descompte. Inclou Spotify Premium complet sense anuncis.',
            details: 'Cal verificar el centre d\'estudis. Vàlid per a universitaris.'
          },
          {
            name: 'YouTube Music Premium', price: 10.99, priceLabel: '10,99€/mes',
            badge: 'Millor qualitat-preu',
            description: 'Inclou YouTube Premium (sense anuncis a YouTube) + tota la música.',
            details: 'Pla familiar disponible fins 6 persones per 17,99€/mes.'
          },
          {
            name: 'Spotify Individual', price: 11.99, priceLabel: '11,99€/mes',
            badge: 'Més popular',
            description: 'El referent mundial. 100M de cançons, podcasts, audiollibres.',
            details: 'Descàrrega offline. Disponible a tots els dispositius.'
          },
          {
            name: 'Apple Music', price: 10.99, priceLabel: '10,99€/mes',
            badge: 'Recomanat (Apple)',
            description: 'Ideal si tens iPhone o Mac. Qualitat Lossless inclosa.',
            details: 'Pla estudiant a 5,99€/mes. Integració perfecta amb l\'ecosistema Apple.'
          },
        ],
        tip: 'Si ets estudiant, Spotify Estudiant a 5,99€ és imbatible. Si no, el pla familiar compartit entre 6 surt a ~3€/persona.'
      },

      transport: {
        label: 'transport públic a Barcelona',
        options: [
          {
            name: 'Bicing (subscripció anual)', price: 13.67, priceLabel: '13,67€/mes',
            badge: 'Millor preu',
            description: '164€/any = bicicleta pública il·limitada. Viatges de fins a 30 min sense cost.',
            details: '500+ estacions. Inclou bici elèctrica (+10 min gratis extra).'
          },
          {
            name: 'T-Jove (menors de 30)', price: 20.00, priceLabel: '20€/mes',
            badge: 'Millor qualitat-preu',
            description: '70 viatges mensuals multi-operador: metro, bus, FGC, Rodalies. Subvencionada.',
            details: 'Cal tenir menys de 30 anys. Es renova automàticament cada mes.'
          },
          {
            name: 'T-Usual (1 zona)', price: 20.00, priceLabel: '~20€/mes',
            badge: 'Recomanat',
            description: 'Viatges il·limitats a la zona 1 (tota Barcelona ciutat): metro, bus, FGC, Rodalies.',
            details: 'La millor opció si fas més de 40 viatges al mes.'
          },
          {
            name: 'T-Usual (2 zones)', price: 38.30, priceLabel: '38,30€/mes',
            badge: 'Àrea metropolitana',
            description: 'Per a qui viu fora de Barcelona: Badalona, Hospitalet, Sant Cugat, etc.',
            details: 'Inclou tots els operadors de transport de l\'àrea metropolitana.'
          },
        ],
        tip: 'Si tens menys de 30 anys, la T-Jove és la millor opció. Si hi ha dies que vas en bici, combina Bicing + T-Casual puntual.'
      },

      bici: {
        label: 'bicicleta a Barcelona',
        options: [
          {
            name: 'Bicing (anual)', price: 13.67, priceLabel: '13,67€/mes (164€/any)',
            badge: 'Millor preu',
            description: 'Sistema de bici pública de l\'Ajuntament. Il·limitada en viatges curts de 30 min.',
            details: '500+ estacions per tota la ciutat. App per trobar bicis i estacions lliures.'
          },
          {
            name: 'Donkey Republic (mensual)', price: 29.00, priceLabel: '29€/mes',
            badge: 'Flexible',
            description: 'Bici privada de lloguer mensual. Sense estació fixa, es deixa on vulguis.',
            details: 'App molt senzilla. Ideal si el Bicing no cobreix bé el teu barri.'
          },
          {
            name: 'Compra bici de segona mà', price: 80, priceLabel: '~80€ (preu únic)',
            badge: 'Inversió única',
            description: 'Wallapop i Milanuncios tenen moltes bicis de qualitat per 60-120€.',
            details: 'Amortitzada en 2-3 mesos vs Bicing. Recorda comprar un bon cadenat (~20€).'
          },
          {
            name: 'Bici elèctrica de lloguer', price: 45.00, priceLabel: '~45€/mes',
            badge: 'Econòmic elèctric',
            description: 'Diverses empreses ofereixen subscripcions mensuals de bici elèctrica a BCN.',
            details: 'Grize, eCooltra Scooter i altres. Consulta disponibilitat per barri.'
          },
        ],
        tip: 'El Bicing és ideal per a trajectes dins Barcelona. Per anar a Gràcia, Sants o Poblenou és perfecte i molt barat.'
      },

      patinets: {
        label: 'patinets i mobilitat urbana',
        options: [
          {
            name: 'Voi (bons de minuts)', price: 15.00, priceLabel: '~15€/mes',
            badge: 'Millor preu',
            description: 'Patinet elèctric compartit. Pack mensual de 60 min per 14,99€.',
            details: 'Cobertura a tot Barcelona. App senzilla i molt extesa.'
          },
          {
            name: 'Lime (subscripció)', price: 19.99, priceLabel: '19,99€/mes',
            badge: 'Millor qualitat-preu',
            description: 'Subscripció Lime Prime: descompte del 10% en tots els trajectes + 3 viatges gratis/mes.',
            details: 'Cobertura àmplia. Compatible amb l\'app de Google Maps.'
          },
          {
            name: 'Bolt Scooter', price: 12.00, priceLabel: '~12€/mes ús ocasional',
            badge: 'Econòmic',
            description: 'Preus per minut dels més baixos. Sense subscripció mensual obligatòria.',
            details: 'Especialment econòmic per a trajectes curts i puntuals.'
          },
        ],
        tip: 'Si els fas servir molt, una bici pròpia o el Bicing sortirà molt més barat que el patinet de lloguer a llarg termini.'
      },

      mobil: {
        label: 'tarifes de mòbil',
        options: [
          {
            name: 'Digi Mòbil 25GB', price: 5.00, priceLabel: '5€/mes',
            badge: 'Millor preu',
            description: '25GB en 4G/5G, trucades il·limitades, sense permanència.',
            details: 'Xarxa Vodafone. Cobertura excel·lent a Barcelona i Catalunya.'
          },
          {
            name: 'Amena 30GB', price: 7.95, priceLabel: '7,95€/mes',
            badge: 'Econòmic',
            description: '30GB en 4G, trucades il·limitades. Operadora virtual d\'Orange.',
            details: 'Portabilitat molt senzilla. Sense matrícula ni costos d\'alta.'
          },
          {
            name: 'Simyo (personalitzable)', price: 8.00, priceLabel: 'des de 8€/mes',
            badge: 'Millor qualitat-preu',
            description: 'Tries exactament els GB i minuts que vols. Pagues el just.',
            details: 'Xarxa Orange. Canvies de pla cada mes sense cap penalització.'
          },
          {
            name: 'Yoigo 50GB', price: 12.99, priceLabel: '12,99€/mes',
            badge: 'Recomanat',
            description: '50GB en 5G, trucades il·limitades, roaming UE inclòs.',
            details: 'Ideal si viatges per Europa sovint o necessites molta dada.'
          },
          {
            name: 'Movistar 20GB (Fusió)', price: 19.99, priceLabel: '19,99€/mes',
            badge: 'Premium',
            description: 'Millor cobertura i servei tècnic. Inclou servei 24h.',
            details: 'Recomanat si el mòbil és clau per feina o necessites la millor cobertura possible.'
          },
        ],
        tip: 'Amb Digi a 5€/mes tens tot el que necessita la majoria. Porta el número actual i activa\'t en menys de 2 dies.'
      },

      internet: {
        label: 'fibra i internet a casa',
        options: [
          {
            name: 'Digi Fibra 1Gb', price: 20.00, priceLabel: '20€/mes',
            badge: 'Millor preu',
            description: 'Fibra simètrica 1Gb. Sense permanència, sense cost d\'instal·lació.',
            details: 'Disponible a la majoria de barris de Barcelona. Creixent ràpidament.'
          },
          {
            name: 'Amena Fibra 600Mb', price: 24.95, priceLabel: '24,95€/mes',
            badge: 'Econòmic',
            description: '600Mb simètrics. Inclou router Wi-Fi 6. Xarxa Orange.',
            details: 'Molt bona estabilitat i suport tècnic 24h.'
          },
          {
            name: 'Jazztel Fibra 1Gb', price: 27.95, priceLabel: '27,95€/mes',
            badge: 'Millor qualitat-preu',
            description: '1Gb + telèfon fix inclòs. Sense permanència. Promoció habitual 3 mesos gratis.',
            details: 'Recomanat si voleu incloure un número de telèfon fix a casa.'
          },
          {
            name: 'Orange Fibra 1Gb', price: 32.95, priceLabel: '32,95€/mes',
            badge: 'Recomanat',
            description: 'Gran xarxa pròpia, molt bona cobertura i servei tècnic a domicili.',
            details: 'Ideal per a llars amb molts dispositius connectats simultàniament.'
          },
        ],
        tip: 'Digi Fibra és la més barata de llarg. Si combines Digi fibra + Digi mòbil pots estalviar fins a 5€/mes addicionals.'
      },

      lloguer: {
        label: 'lloguer d\'habitació a Barcelona',
        options: [
          {
            name: 'Habitació pis compartit (perifèria)', price: 450, priceLabel: '~450€/mes',
            badge: 'Millor preu',
            description: 'Habitació en pis compartit a barris com Nou Barris, Sant Andreu, Horta.',
            details: 'Idealista i Fotocasa. Inclou normalment llum i aigua. Sense mobles extres.'
          },
          {
            name: 'Habitació pis compartit (Eixample/Gràcia)', price: 600, priceLabel: '~600€/mes',
            badge: 'Millor qualitat-preu',
            description: 'Habitació en zones cèntriques i ben comunicades amb transport públic.',
            details: 'Busca a Badi, SpotAHome o Roomies per trobar opcions verificades.'
          },
          {
            name: 'Residència universitària', price: 700, priceLabel: '~700€/mes',
            badge: 'Recomanat estudiants',
            description: 'Residències com Resa, Nexo o Resa Pedralbes. Tot inclòs: llum, wifi, neteja zones comunes.',
            details: 'Cal reservar amb molt d\'antelació. Paga la pena per comoditat i seguretat.'
          },
          {
            name: 'Estudi / apartament propi', price: 1000, priceLabel: '~1.000€/mes',
            badge: 'Independència total',
            description: 'Estudi de 25-35m² al centre de Barcelona. Preu mínim del mercat actual.',
            details: 'Molt complicat trobar per sota de 900€ a Barcelona ciutat. Considera àrea metropolitana.'
          },
        ],
        tip: 'Barris amb millor preu/connexió: Nou Barris, Sant Andreu, Horta-Guinardó. Tots amb metro i bus directe al centre.'
      },

      coworking: {
        label: 'espais de coworking',
        options: [
          {
            name: 'Biblioteca pública BCN', price: 0, priceLabel: '0€/mes (gratuït)',
            badge: 'Millor preu',
            description: 'Les biblioteques municipals de Barcelona ofereixen llocs de treball amb WiFi gratuït.',
            details: 'Biblioteques com La Sagrera, Vapor Vell, Jaume Fuster. Horari de 9h a 21h.'
          },
          {
            name: 'WeWork Hot Desk', price: 250, priceLabel: '~250€/mes',
            badge: 'Econòmic coworking',
            description: 'Accés flexible a qualsevol centre WeWork de Barcelona. Includes café i sales reunions.',
            details: 'Centres a Passeig de Gràcia, 22@, Diagonal.'
          },
          {
            name: 'Cowork BCN (22@ District)', price: 180, priceLabel: '~180€/mes',
            badge: 'Millor qualitat-preu',
            description: 'Espais independents al districte tecnològic 22@. Ambient startup.',
            details: 'Molts coworkings locals al 22@ per sota de 200€/mes. Busca a Coworker.com.'
          },
          {
            name: 'Cafès amb wifi (informal)', price: 30, priceLabel: '~30€/mes',
            badge: 'Alternatiu',
            description: 'Molts cafès de Barcelona permeten treballar si consumes. ~3-5€/sessió.',
            details: 'Federal Café, Nomad, Right Side Coffee. Recomanat per sessions de 2-3h.'
          },
        ],
        tip: 'Per a estudiants i freelances, combina la biblioteca gratuïta per al treball intens + un cafè amb wifi per a reunions.'
      },

      supermercats: {
        label: 'supermercats i alimentació',
        options: [
          {
            name: 'Lidl', price: 170, priceLabel: '~170€/mes (1 persona)',
            badge: 'Millor preu',
            description: 'El supermercat més barat de BCN per cistella bàsica. Excel·lent fruita i verdura.',
            details: 'Gairebé tots els barris de Barcelona. Ofertes setmanals molt competitives.'
          },
          {
            name: 'Aldi', price: 180, priceLabel: '~180€/mes (1 persona)',
            badge: 'Econòmic',
            description: 'Preus equivalents a Lidl. Producte propi de bona qualitat.',
            details: 'Menys ubicacions que Lidl però preus molt similars.'
          },
          {
            name: 'Mercadona', price: 210, priceLabel: '~210€/mes (1 persona)',
            badge: 'Millor qualitat-preu',
            description: 'El millor equilibri qualitat-preu. Marca Hacendado molt consistent.',
            details: 'App per compra online. Disponible a tota Barcelona.'
          },
          {
            name: 'Bonpreu / Esclat', price: 240, priceLabel: '~240€/mes (1 persona)',
            badge: 'Producte local',
            description: 'Supermercat català amb bon producte fresc, local i km0.',
            details: 'Programa Plusfresc amb descomptes acumulatius.'
          },
        ],
        tip: 'Estratègia estalvi: Lidl per a fruita/verdura/bàsics i Mercadona per a marca pròpia. Estalvi estimat: 40-60€/mes.'
      },

      restaurants: {
        label: 'menjar fora a Barcelona',
        options: [
          {
            name: 'Mercat municipal (parades cuina)', price: 6, priceLabel: '~6€/plat',
            badge: 'Millor preu',
            description: 'Parades de cuina als mercats: Santa Caterina, Abaceria, Vall d\'Hebron.',
            details: 'Plats del dia des de 5€. Qualitat excel·lent i producte molt fresc.'
          },
          {
            name: 'Menú del dia (bar de barri)', price: 10.50, priceLabel: '~10,50€/dinar',
            badge: 'Clàssic Barcelona',
            description: 'Primer + segon + postre + beguda. La fórmula més econòmica per dinar.',
            details: 'Evita zones turístiques (Barceloneta, Gòtic, Ramblas). Al Poblenou o Sants és molt millor preu.'
          },
          {
            name: 'Menjar preparat (supermercat)', price: 4.50, priceLabel: '~4,50€/àpat',
            badge: 'Econòmic',
            description: 'Mercadona, Lidl i Aldi tenen plats preparats de qualitat des de 3,50€.',
            details: 'Ideal per a sopars ràpids i econòmics a casa.'
          },
          {
            name: 'Cadenes de menjar ràpid (casual)', price: 12, priceLabel: '~12€/persona',
            badge: 'Conegut',
            description: 'McDonald\'s, Burger King, Telepizza. Preus controlats i previsibles.',
            details: 'Tiquets restaurant (Pluxee/Sodexo) redueixen el cost efectiu fins un 50%.'
          },
        ],
        tip: 'El menú del dia en un bar de barri és el millor valor de Barcelona. Demanat sempre el menú, mai la carta.'
      },

      cafes: {
        label: 'cafès i cafeteries',
        options: [
          {
            name: 'Bar de barri tradicional', price: 1.20, priceLabel: '~1,20€/cafè',
            badge: 'Millor preu',
            description: 'Cafè tallat o sol en un bar tradicional de Barcelona. El preu més baix garantit.',
            details: 'Evita zones turístiques. A l\'Eixample i Gràcia trobaràs bones opcions.'
          },
          {
            name: 'Cafeteria de mercat', price: 1.50, priceLabel: '~1,50€/cafè',
            badge: 'Econòmic',
            description: 'Les cafeteries dins dels mercats municipals solen tenir preus molt bons.',
            details: 'Bon ambient i qualitat de producte. Mercat de l\'Abaceria, Santa Caterina.'
          },
          {
            name: 'Cafè de especialitat (terç ona)', price: 3.50, priceLabel: '~3,50€/cafè',
            badge: 'Qualitat premium',
            description: 'Cafès de tercera onada: Nomad, Right Side, Federal Café, Satan\'s Coffee.',
            details: 'Molt bon lloc per treballar amb portàtil. WiFi inclòs normalment.'
          },
          {
            name: 'Starbucks / The Lounge', price: 5.50, priceLabel: '~5,50€/cafè',
            badge: 'Cadena coneguda',
            description: 'Cadenes internacionals. Preus alts però molt espai per asseure\'s i treballar.',
            details: 'Útil si necessites un lloc tranquil per reunions o estudiar durant hores.'
          },
        ],
        tip: 'Un cafè de bar de barri a 1,20€ és idèntic en cafeïna al de Starbucks a 5€. Estalvi potencial: 100€+/mes si en prens 2 al dia.'
      },

      'asseguranca-salut': {
        label: 'assegurança de salut privada',
        options: [
          {
            name: 'Capio Assistència Bàsica', price: 15.90, priceLabel: '15,90€/mes',
            badge: 'Millor preu',
            description: 'Cobertura bàsica: metge de capçalera, consultes especialistes i urgències.',
            details: 'Xarxa de clíniques Capio a Barcelona i àrea metropolitana.'
          },
          {
            name: 'Asisa Jove (fins 35 anys)', price: 19.90, priceLabel: '19,90€/mes',
            badge: 'Econòmic',
            description: 'Pla específic per a joves. Inclou dental bàsic i sense copagament.',
            details: 'Sense permanència. Es pot cancel·lar en qualsevol moment.'
          },
          {
            name: 'Adeslas Bàsic', price: 24.90, priceLabel: '24,90€/mes',
            badge: 'Millor qualitat-preu',
            description: 'Cobertura completa: capçalera, especialistes, urgències 24h, proves diagnòstiques.',
            details: 'Àmplia xarxa de metges concertats. App per sol·licitar cites.'
          },
          {
            name: 'Sanitas Selección', price: 29.90, priceLabel: '29,90€/mes',
            badge: 'Recomanat',
            description: 'Cobertura ampliada amb hospitalització i cirurgia incloses.',
            details: 'Hospitals propis a Barcelona. Molt recomanat per a llarga estada a la ciutat.'
          },
        ],
        tip: 'Recorda que a Catalunya tens dret a la sanitat pública gratuïta (CAP). La privada és un complement, no una substitució.'
      },

      dental: {
        label: 'serveis dentals i clíniques',
        options: [
          {
            name: 'Clínica Dental Pública (CatSalut)', price: 0, priceLabel: 'Gratuït (bàsic)',
            badge: 'Millor preu',
            description: 'Revisions i extraccions cobertes pel CatSalut. Demana cita al teu CAP.',
            details: 'Cobertura limitada: revisió, neteja bàsica i urgències. No inclou ortodòncia ni implants.'
          },
          {
            name: 'Òdex Dental / Vitaldent', price: 25, priceLabel: '~25€/neteja',
            badge: 'Econòmic',
            description: 'Cadenes dentals amb preus estandarditzats i transparent. Sense sorpreses.',
            details: 'Neteja + revisió anual per ~50-60€. Plans de finançament disponibles.'
          },
          {
            name: 'Clínica Dental de preu mitjà', price: 60, priceLabel: '~60€/consulta',
            badge: 'Qualitat-preu',
            description: 'Clíniques independents de barri. Millor relació personal-pacient.',
            details: 'Busca a Google Maps clíniques amb 4+ estrelles al teu barri.'
          },
          {
            name: 'Assegurança dental (Adeslas)', price: 8, priceLabel: '~8€/mes (+salut)',
            badge: 'Recomanat',
            description: 'Add-on dental a l\'assegurança de salut. Cobreix netezes, empastats i revisió anual.',
            details: 'Val la pena si vas al dentista almenys 1 cop a l\'any.'
          },
        ],
        tip: 'Una neteja anual al dentista privat (50-60€) és molt més barat que tractar problemes descuidats. No l\'ajornis.'
      },

      perruqueria: {
        label: 'perruqueria i barberia',
        options: [
          {
            name: 'Escola de Perruqueria', price: 8, priceLabel: '~8€/tall',
            badge: 'Millor preu',
            description: 'Les escoles de perruqueria de Barcelona fan talls a preus molt baixos, supervisats per professors.',
            details: 'Escola Llotja, ITES i altres centres de formació. Cal reservar amb antelació.'
          },
          {
            name: 'Barberia de barri (homes)', price: 12, priceLabel: '~12€/tall',
            badge: 'Econòmic',
            description: 'Barberies tradicionals fora de les zones turístiques. Tall + afaitat des de 10€.',
            details: 'Al Raval, Gracia, Sants i Nou Barris trobaràs opcions molt econòmiques.'
          },
          {
            name: 'Perruqueria unisex estàndard', price: 20, priceLabel: '~20€/tall (dones)',
            badge: 'Millor qualitat-preu',
            description: 'Tall + assecat per a cabells llargs. Preu mig a Barcelona fora del centre.',
            details: 'Busca a Fresha o Treatwell per comparar preus al teu barri.'
          },
          {
            name: 'Perruqueria premium / saló', price: 45, priceLabel: '~45€/servei',
            badge: 'Premium',
            description: 'Salons especialitzats per a tints, tractaments i estilisme avançat.',
            details: 'Sants, Gràcia i Eixample concentren molts salons de qualitat amb bon preu relatiu.'
          },
        ],
        tip: 'Les escoles de perruqueria són la joia oculta de l\'estalvi a Barcelona. Qualitat supervisada a preus imbatibles.'
      },

      farmacia: {
        label: 'farmàcia i medicaments',
        options: [
          {
            name: 'Medicaments genèrics (receta)', price: 2.50, priceLabel: '~2,50€/medicament',
            badge: 'Millor preu',
            description: 'Medicaments genèrics amb recepta del CatSalut. Preu regulat per l\'Estat.',
            details: 'Demana sempre el genèric equivalent al teu metge. Idèntica eficàcia, molt menys preu.'
          },
          {
            name: 'Farmàcies de descompte', price: 0, priceLabel: 'Preu variable',
            badge: 'Econòmic',
            description: 'FarmaDirecte, PromoFarma i similars online. Descomptes de fins al 40% vs farmàcia física.',
            details: 'Ideal per a productes OTC: vitamines, antiàcids, cremes solars, etc.'
          },
          {
            name: 'Marca blanca (paracetamol, ibuprofè)', price: 1.20, priceLabel: '~1,20€/caixa',
            badge: 'Millor qualitat-preu',
            description: 'Paracetamol genèric i ibuprofè genèric. Idèntics a Gelocatil i Nurofen però molt més barats.',
            details: 'Disponibles a totes les farmàcies. Demana pel principi actiu, no la marca.'
          },
        ],
        tip: 'A Espanya, els medicaments sense recepta es poden comprar a farmàcies o online. Compara sempre el preu del genèric.'
      },

      idiomes: {
        label: 'classes d\'idiomes a Barcelona',
        options: [
          {
            name: 'Duolingo / Apps gratuïtes', price: 0, priceLabel: 'Gratuït',
            badge: 'Millor preu',
            description: 'Duolingo, Babbel (versió free), Anki. Suficient per a nivells inicials i manteniment.',
            details: 'Ideal per a 15-20 min/dia de pràctica consistent. No substitueix les classes.'
          },
          {
            name: 'Conversation Exchange (Tandem)', price: 0, priceLabel: 'Gratuït',
            badge: 'Gratuït i efectiu',
            description: 'Intercanvi d\'idiomes amb nadius. Tu ensenyes català/castellà, ells t\'ensenyen anglès/francès.',
            details: 'Apps: Tandem, HelloTalk. BCN té una comunitat d\'intercanvi molt activa.'
          },
          {
            name: 'Escola Oficial d\'Idiomes (EOI)', price: 15, priceLabel: '~15€/mes',
            badge: 'Millor qualitat-preu',
            description: 'Escola pública oficial. Preus molt subvencionats (~180€/any). Certificats oficials.',
            details: 'Cal fer proves de nivell. Alta demanda: apunta\'t a la llista d\'espera aviat.'
          },
          {
            name: 'Acadèmia privada (grup)', price: 60, priceLabel: '~60€/mes',
            badge: 'Recomanat',
            description: 'Classes en grup de 6-10 persones. Progrés ràpid amb professor dedicat.',
            details: 'Wall Street English, International House, Englishtown i moltes acadèmies locals.'
          },
          {
            name: 'Classe particular (online)', price: 35, priceLabel: '~35€/mes (1h/setmana)',
            badge: 'Flexible',
            description: 'Professor particular online. Molt personalitzat i flexible d\'horari.',
            details: 'Busca a Preply, iTalki o Tusclases. Professors des de 8€/hora.'
          },
        ],
        tip: 'La combinació imbatible: EOI per a la base + Tandem per a pràctica oral. Tot per ~15€/mes.'
      },

      formacio: {
        label: 'formació i cursos online',
        options: [
          {
            name: 'YouTube / Recursos gratuïts', price: 0, priceLabel: 'Gratuït',
            badge: 'Millor preu',
            description: 'Per a molts temes tècnics (programació, disseny, màrqueting) YouTube és suficient.',
            details: 'Canals com Midudev, Fireship, Traversy Media, The Net Ninja.'
          },
          {
            name: 'Coursera (audit gratuït)', price: 0, priceLabel: 'Gratuït (sense certificat)',
            badge: 'Gratuït',
            description: 'La majoria de cursos de Coursera es poden auditar gratis sense certificat.',
            details: 'Universitats com Stanford, Google, IBM ofereixen contingut gratuïtament.'
          },
          {
            name: 'Udemy (en oferta)', price: 13, priceLabel: '~13€/curs (en oferta)',
            badge: 'Millor qualitat-preu',
            description: 'Udemy fa ofertes constants fins a 90% de descompte. Mai paguis el preu complet.',
            details: 'Cursos vitalicis. Espera una oferta (cada 2-3 setmanes hi ha promocions).'
          },
          {
            name: 'LinkedIn Learning', price: 29.99, priceLabel: '29,99€/mes',
            badge: 'Professional',
            description: 'Accés il·limitat a 20.000+ cursos. Certificats reconeguts per empreses.',
            details: 'El primer mes és gratuït. Molt útil per a transicions professionals.'
          },
        ],
        tip: 'Mai paguis el preu complet d\'Udemy. Afegeix els cursos a la llista de desitjos i espera l\'oferta de ~10-15€.'
      },

      gaming: {
        label: 'videojocs i subscripcions gaming',
        options: [
          {
            name: 'Xbox Game Pass Ultimate', price: 14.99, priceLabel: '14,99€/mes',
            badge: 'Millor qualitat-preu',
            description: 'Centenars de jocs inclosos per a PC i Xbox + EA Play + multijugador online.',
            details: 'Inclou tots els jocs de Microsoft el dia del llançament. El millor valor del mercat.'
          },
          {
            name: 'PlayStation Plus Essential', price: 8.99, priceLabel: '8,99€/mes',
            badge: 'Econòmic (PS)',
            description: 'Multijugador online + 2-3 jocs gratis cada mes per a PS4/PS5.',
            details: 'Obligatori per a jugar online en PlayStation. Pla anual: ~60€ (5€/mes).'
          },
          {
            name: 'Steam (plataforma free)', price: 0, priceLabel: 'Gratuït (jocs apart)',
            badge: 'PC Gaming',
            description: 'La plataforma és gratuïta. Molts jocs gratuïts i rebaixes fins al 90%.',
            details: 'Sales de Steam (juny i desembre) amb grans descomptes. Requer PC o portàtil.'
          },
          {
            name: 'Nintendo Switch Online', price: 3.99, priceLabel: '3,99€/mes',
            badge: 'Millor preu',
            description: 'Online + accés a catàleg de jocs NES, SNES, N64, Mega Drive.',
            details: 'El més barat del mercat si ja tens Nintendo Switch.'
          },
        ],
        tip: 'El Game Pass de Microsoft és objectivament el millor valor en gaming ara mateix. Si tens PC, és una inversió clara.'
      },

      aparcament: {
        label: 'aparcament a Barcelona',
        options: [
          {
            name: 'Zona Verda (residents)', price: 20, priceLabel: '~20€/mes',
            badge: 'Millor preu',
            description: 'Aparcament en superfície per a residents al districte. Molt econòmic.',
            details: 'Cal ser empadronat al barri. Sol·licita el distintiu de resident a l\'Ajuntament.'
          },
          {
            name: 'SABA / Bamsa (mensual)', price: 90, priceLabel: '~90€/mes',
            badge: 'Econòmic interior',
            description: 'Abonament mensual en aparcaments públics gestionats per SABA o Bamsa.',
            details: 'Preus varien molt per zona. Aparcaments perifèrics (Zona Franca) molt més barats.'
          },
          {
            name: 'Garatge particular', price: 70, priceLabel: '~70€/mes',
            badge: 'Millor qualitat-preu',
            description: 'Lloguer de plaça de garatge privat. Molts anuncis a Idealista i Wallapop.',
            details: 'Barris com Nou Barris, Sant Andreu o Horta. Pots negociar el preu.'
          },
          {
            name: 'Park & Ride (Rodalia)', price: 5, priceLabel: '~5€/dia o abonament',
            badge: 'Alternatiu',
            description: 'Deixa el cotxe a un aparcament d\'intercanvi al cinturó i entra en tren.',
            details: 'Aparcaments a Cornellà, Mollet, Sant Cugat. Combina amb T-Usual.'
          },
        ],
        tip: 'A Barcelona tenir cotxe al centre surt molt car. Valora vendre\'l i combinar transport públic + Bicing + alquiler puntual.'
      },

      roba: {
        label: 'roba i moda econòmica',
        options: [
          {
            name: 'Vinted (segona mà)', price: 0, priceLabel: '0€ (comissions venda)',
            badge: 'Millor preu',
            description: 'Plataforma de roba de segona mà. Peces de qualitat des d\'1-5€.',
            details: 'Ideal per a marques de qualitat a preus molt baixos. Tant compra com venda.'
          },
          {
            name: 'Shein', price: 15, priceLabel: '~15€/peça mitja',
            badge: 'Econòmic (nou)',
            description: 'Roba nova a preus molt baixos. Gran varietat i noves col·leccions setmanals.',
            details: 'Considera l\'impacte mediambiental. Ideal per a peces bàsiques i temporals.'
          },
          {
            name: 'H&M / Primark', price: 20, priceLabel: '~20€/peça',
            badge: 'Fast fashion estàndard',
            description: 'Roba nova de qualitat mitja a preus accessibles. Disponibles a BCN.',
            details: 'H&M té programa de reciclatge de roba. Primark a La Maquinista i Diagonal.'
          },
          {
            name: 'Zara (sales)', price: 25, priceLabel: '~25€/peça en rebaixes',
            badge: 'Qualitat-preu',
            description: 'En temporada de rebaixes (gener i juliol) trobes bones peces a bon preu.',
            details: 'Les sales de Zara online comencen abans que a botiga física.'
          },
        ],
        tip: 'Vinted és la joia oculta de l\'estalvi en roba. Pots trobar peces de Zara o H&M usades per 3-5€ en perfecte estat.'
      },

      viatges: {
        label: 'viatges i allotjament econòmic',
        options: [
          {
            name: 'Vueling / Ryanair (anticipació)', price: 20, priceLabel: 'des de 20€/trajecte',
            badge: 'Millor preu vols',
            description: 'Vols nacionals i europeus des de 20€ si reserves amb 2-3 mesos d\'antelació.',
            details: 'Activa les alertes de preus a Google Flights per als teus destins favorits.'
          },
          {
            name: 'Hostal / Alberg (BCN)', price: 25, priceLabel: '~25€/nit',
            badge: 'Allotjament econòmic',
            description: 'Albergs i hostals a Barcelona des de 20€/nit. Molts inclouen esmorzar.',
            details: 'Booking.com i Hostelworld. Millors preus reservant directament a la recepció.'
          },
          {
            name: 'Interrail (joves)', price: 197, priceLabel: '197€ (passe mensual)',
            badge: 'Europa en tren',
            description: 'Passe Interrail Global 1 mes per a menors de 27 anys. Trens il·limitats per Europa.',
            details: 'La millor manera de viatjar per Europa si tens temps i flexibilitat.'
          },
          {
            name: 'Blablacar (cotxe compartit)', price: 15, priceLabel: '~15€/trajecte BCN-Madrid',
            badge: 'Econòmic terrestre',
            description: 'Compartir cotxe per trajectes llargs. Molt més barat que el tren o avió.',
            details: 'Barcelona-Madrid des de 12€. Barcelona-València des de 8€.'
          },
        ],
        tip: 'Google Flights amb el mode "explorar destins" mostra els llocs més barats per volar des de Barcelona qualsevol cap de setmana.'
      },
    };

    function normalizeText(text) {
      return String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/["“”«»'·]/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .replace(/\bmes\b/g, 'mas')
        .replace(/\bm[ée]s\b/g, 'mas')
        .replace(/\bmenys\b/g, 'menos')
        .replace(/\bproductes\b/g, 'productos')
        .replace(/\bpiscines\b/g, 'piscinas')
        .trim();
    }

    function parsePriceIntent(rawText) {
      const normalized = normalizeText(rawText);
      const betweenMatch = normalized.match(/\bentre\s+(\d+(?:[.,]\d+)?)\s*(?:€|euros?)?\s*(?:i|y|a)\s*(\d+(?:[.,]\d+)?)/);
      if (betweenMatch) {
        return {
          productQuery: normalized.replace(betweenMatch[0], '').trim(),
          priceOperator: 'between',
          minPrice: parseFloat(betweenMatch[1].replace(',', '.')),
          maxPrice: parseFloat(betweenMatch[2].replace(',', '.')),
          intent: detectIntent(normalized),
          language: detectLanguage(normalized),
        };
      }

      const gtMatch = normalized.match(/\b(?:m[ée]s de|mas de|mayor que|superior a|por encima de|a partir de|>\s*)(\d+(?:[.,]\d+)?)/);
      if (gtMatch) {
        return {
          productQuery: normalized.replace(gtMatch[0], '').trim(),
          priceOperator: 'gt',
          minPrice: parseFloat(gtMatch[1].replace(',', '.')),
          maxPrice: null,
          intent: detectIntent(normalized),
          language: detectLanguage(normalized),
        };
      }

      const ltMatch = normalized.match(/\b(?:menys de|menos de|inferior a|por debajo de|sota|bajo|<\s*)(\d+(?:[.,]\d+)?)/);
      if (ltMatch) {
        return {
          productQuery: normalized.replace(ltMatch[0], '').trim(),
          priceOperator: 'lt',
          minPrice: null,
          maxPrice: parseFloat(ltMatch[1].replace(',', '.')),
          intent: detectIntent(normalized),
          language: detectLanguage(normalized),
        };
      }

      const lteMatch = normalized.match(/\b(?:m[aá]xim(?:o|)|maximo|fins a|hasta|no [mM]es de|no mes de)\s*(\d+(?:[.,]\d+)?)/);
      if (lteMatch) {
        return {
          productQuery: normalized.replace(lteMatch[0], '').trim(),
          priceOperator: 'lte',
          minPrice: null,
          maxPrice: parseFloat(lteMatch[1].replace(',', '.')),
          intent: detectIntent(normalized),
          language: detectLanguage(normalized),
        };
      }

      const gteMatch = normalized.match(/\b(?:m[ií]nim(?:o|)|minimo|a partir de|com a minim)\s*(\d+(?:[.,]\d+)?)/);
      if (gteMatch) {
        return {
          productQuery: normalized.replace(gteMatch[0], '').trim(),
          priceOperator: 'gte',
          minPrice: parseFloat(gteMatch[1].replace(',', '.')),
          maxPrice: null,
          intent: detectIntent(normalized),
          language: detectLanguage(normalized),
        };
      }

      const priceInText = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:€|euros?)/);
      if (priceInText) {
        return {
          productQuery: normalized.replace(priceInText[0], '').trim(),
          priceOperator: null,
          minPrice: null,
          maxPrice: null,
          intent: detectIntent(normalized),
          language: detectLanguage(normalized),
        };
      }

      return {
        productQuery: normalized.trim(),
        priceOperator: null,
        minPrice: null,
        maxPrice: null,
        intent: detectIntent(normalized),
        language: detectLanguage(normalized),
      };
    }

    function detectLanguage(text) {
      if (/\b(mes|mas|menos|quiero|quieres|por favor|ensenyame|ensenyem|mostra|mostrar|vull|vols)\b/.test(text)) return 'es';
      if (/\b(mas|m[ée]s|menys|vull|vols|ensenyame|ensenyem|mostra|mostrar|gracies)\b/.test(text)) return 'ca';
      return 'es';
    }

    function detectIntent(text) {
      if (/\b(compara|comparar|vs|contra|diferencia|diferència)\b/.test(text)) return 'compare';
      if (/\b(recomienda|recomendar|recomana|recomano|recomiéndame|recomana|quiero|vull|necessito|necesito|busca|busca'm|cerca|mostra|ensenyame|enséñame)\b/.test(text)) return 'recommendation';
      return 'search';
    }

    function findCategoryKey(text) {
      const normalized = normalizeText(text);
      const aliasKeys = Object.keys(ALIAS).sort((a, b) => b.length - a.length);
      for (const alias of aliasKeys) {
        if (normalized.includes(alias)) return ALIAS[alias];
      }
      let bestKey = null;
      let bestScore = 0;
      for (const [key, cat] of Object.entries(DB)) {
        const label = normalizeText(cat.label);
        const score = label.split(' ').reduce((acc, word) => acc + (word && normalized.includes(word) ? 1 : 0), 0);
        if (score > bestScore) {
          bestScore = score;
          bestKey = key;
        }
      }
      return bestKey;
    }

    function searchProductsByIntent(intentData) {
      const { productQuery, priceOperator, minPrice, maxPrice, intent, language } = intentData;
      const categoryKey = findCategoryKey(productQuery);
      let results = [];
      let categoryLabel = null;

      if (categoryKey && DB[categoryKey]) {
        categoryLabel = DB[categoryKey].label;
        results = [...DB[categoryKey].options];
      } else {
        const queryWords = productQuery.split(/\s+/).filter(Boolean);
        const scored = Object.entries(DB).map(([key, cat]) => {
          const label = normalizeText(cat.label);
          const matchCount = queryWords.reduce((sum, word) => sum + (label.includes(word) ? 1 : 0), 0);
          const optionScore = cat.options.reduce((sum, item) => {
            const itemText = normalizeText(`${item.name} ${item.description} ${item.badge}`);
            return sum + queryWords.reduce((acc, word) => acc + (itemText.includes(word) ? 1 : 0), 0);
          }, 0);
          return { key, score: matchCount + optionScore, cat };
        }).filter(r => r.score > 0).sort((a, b) => b.score - a.score);

        if (scored.length > 0) {
          categoryKey = scored[0].key;
          categoryLabel = scored[0].cat.label;
          results = [...scored[0].cat.options];
        }
      }

      if (results.length === 0) {
        return {
          found: false,
          errorMessage: `No he trobat ${productQuery || 'productes'} amb aquesta descripció. Prova amb una altra consulta o pregunta per alguna categoria com piscines, gimnàs o subscripcions.`,
        };
      }

      const hasPriceFilter = priceOperator !== null;
      const filtered = results.filter(item => {
        if (priceOperator === 'gt') return item.price > minPrice;
        if (priceOperator === 'gte') return item.price >= minPrice;
        if (priceOperator === 'lt') return item.price < maxPrice;
        if (priceOperator === 'lte') return item.price <= maxPrice;
        if (priceOperator === 'between') return item.price >= minPrice && item.price <= maxPrice;
        return true;
      });

      if (filtered.length === 0) {
        const fallback = results.sort((a, b) => a.price - b.price)[0];
        const label = categoryLabel || productQuery || 'productes';
        let errorMessage = '';
        if (priceOperator === 'gt') {
          errorMessage = language === 'ca'
            ? `No he trobat ${label} per més de ${minPrice}€. Vols que et mostri alternatives més barates o similars?`
            : `No he encontrado ${label} por más de ${minPrice}€. ¿Quieres que te muestre alternativas más baratas o similares?`;
        } else if (priceOperator === 'lt') {
          errorMessage = language === 'ca'
            ? `No he trobat ${label} per menys de ${maxPrice}€. Vols que et mostri alternatives similars?`
            : `No he encontrado ${label} por menos de ${maxPrice}€. ¿Quieres que te muestre alternativas similares?`;
        } else if (priceOperator === 'between') {
          errorMessage = language === 'ca'
            ? `No he trobat ${label} entre ${minPrice}€ i ${maxPrice}€. Vols que et mostri altres opcions?`
            : `No he encontrado ${label} entre ${minPrice}€ y ${maxPrice}€. ¿Quieres que te muestre otras opciones?`;
        } else {
          errorMessage = language === 'ca'
            ? `No he trobat ${label} amb aquestes condicions. Vols que et mostri opcions properes?`
            : `No he encontrado ${label} con estas condiciones. ¿Quieres que te muestre opciones cercanas?`;
        }
        return {
          found: false,
          errorMessage,
          category: categoryLabel,
          options: [fallback],
          tip: DB[categoryKey]?.tip || '',
        };
      }

      filtered.sort((a, b) => {
        if (intent === 'recommendation') return a.price - b.price;
        if (priceOperator === 'gt') return a.price - b.price;
        if (priceOperator === 'lt') return a.price - b.price;
        return a.price - b.price;
      });

      let summary = '';
      const label = categoryLabel || productQuery || 'productes';
      if (priceOperator === 'gt') {
        summary = language === 'ca'
          ? `He trobat aquestes ${label} per més de ${minPrice}€:`
          : `He encontrado estas ${label} por más de ${minPrice}€:`;
      } else if (priceOperator === 'lt') {
        summary = language === 'ca'
          ? `He trobat aquestes ${label} per menys de ${maxPrice}€:`
          : `He encontrado estas ${label} por menos de ${maxPrice}€:`;
      } else if (priceOperator === 'between') {
        summary = language === 'ca'
          ? `He trobat aquestes ${label} entre ${minPrice}€ i ${maxPrice}€:`
          : `He encontrado estas ${label} entre ${minPrice}€ y ${maxPrice}€:`;
      } else if (intent === 'recommendation') {
        summary = language === 'ca'
          ? `Et recomano aquestes ${label}:`
          : `Te recomiendo estas ${label}:`;
      } else {
        summary = language === 'ca'
          ? `He trobat aquestes ${label}:`
          : `He encontrado estas ${label}:`;
      }

      return {
        found: true,
        category: categoryLabel,
        maxPrice,
        minPrice,
        priceOperator,
        summary,
        options: filtered,
        tip: DB[categoryKey]?.tip || '',
      };
    }

    function queryOffline(text) {
      const intentData = parsePriceIntent(text);
      return searchProductsByIntent(intentData);
    }

    function runAssessorTests() {
      const samples = [
        { input: 'Busco piscines per menys de 20€', expect: 'lt' },
        { input: 'Vull gimnàs per més de 30€', expect: 'gt' },
        { input: 'Quin pla de streaming puc pagar amb 5 euros?', expect: 'lte' },
        { input: 'Cost de transport mensual a Barcelona', expect: 'search' },
      ];
      const results = samples.map(sample => {
        const parsed = parsePriceIntent(sample.input);
        const response = searchProductsByIntent(parsed);
        return {
          input: sample.input,
          operator: parsed.priceOperator,
          category: parsed.category || findCategoryKey(parsed.productQuery),
          found: response.found,
          summary: response.summary || response.errorMessage,
        };
      });
      console.group('Assessor IA self-test');
      results.forEach(result => console.log(result));
      console.groupEnd();
      return results;
    }

    const AI_STATE_KEY = 'smartprice_ai_state';

    function getAIState() {
      const raw = localStorage.getItem(AI_STATE_KEY);
      if (!raw) return { folders: [], chats: [], activeFolderId: null, activeChatId: null };
      try {
        const parsed = JSON.parse(raw);
        return {
          folders: Array.isArray(parsed.folders) ? parsed.folders : [],
          chats: Array.isArray(parsed.chats) ? parsed.chats : [],
          activeFolderId: parsed.activeFolderId || null,
          activeChatId: parsed.activeChatId || null,
        };
      } catch {
        return { folders: [], chats: [], activeFolderId: null, activeChatId: null };
      }
    }

    function saveAIState(state) {
      localStorage.setItem(AI_STATE_KEY, JSON.stringify(state));
    }

    function generateId(prefix = 'id') {
      if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
      }
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    }

    function dedupeById(items) {
      const seen = new Set();
      return items.filter(item => {
        if (!item || !item.id) return false;
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    }

    function sanitizeAIState(state) {
      state.folders = dedupeById(state.folders || []).map(folder => ({
        ...folder,
        isOpen: folder.isOpen !== false,
      }));
      const folderIds = new Set(state.folders.map(folder => folder.id));
      state.chats = dedupeById(state.chats || []).filter(chat => folderIds.has(chat.folderId));
      state.folders = state.folders.length ? state.folders : [createDefaultAssessorState().folders[0]];
      state.activeFolderId = state.activeFolderId && folderIds.has(state.activeFolderId) ? state.activeFolderId : state.folders[0]?.id;
      const chatIds = new Set(state.chats.map(chat => chat.id));
      state.activeChatId = state.activeChatId && chatIds.has(state.activeChatId) ? state.activeChatId : state.chats.find(chat => chat.folderId === state.activeFolderId)?.id || null;
      if (!state.activeChatId && state.activeFolderId) {
        const chatId = generateId('chat');
        const newChat = { id: chatId, folderId: state.activeFolderId, title: 'Nova conversa', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: [] };
        state.chats.push(newChat);
        state.activeChatId = chatId;
      }
      return state;
    }

    async function getCurrentAIUser() {
      return await dbGetUser();
    }

    async function loadAIStateFromSupabase(userId) {
      const [folders, chats, messages] = await Promise.all([
        dbGetAIFolders(userId),
        dbGetAIChats(userId),
        dbGetAIMessages(userId),
      ]);

      const normalizedMessages = dedupeById(messages).map(msg => ({
        id: msg.id,
        chatId: msg.chat_id,
        role: msg.role,
        content: msg.content,
        meta: msg.meta || null,
        createdAt: msg.created_at,
      }));

      const messageGrouped = normalizedMessages.reduce((map, msg) => {
        const list = map.get(msg.chatId) || [];
        if (!list.some(existing => existing.id === msg.id)) {
          list.push(msg);
        }
        map.set(msg.chatId, list);
        return map;
      }, new Map());

      const sanitizedFolders = dedupeById((folders || []).map(f => ({
        id: f.id,
        name: f.name,
        icon: f.icon || '📁',
        color: f.color || 'blue',
        position: f.position ?? 0,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
        isOpen: true,
      })));

      const sanitizedChats = dedupeById((chats || []).map(chat => ({
        id: chat.id,
        folderId: chat.folder_id,
        title: chat.title,
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
        messages: (messageGrouped.get(chat.id) || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
      })));

      const sortedChats = [...sanitizedChats].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      const state = {
        folders: sanitizedFolders,
        chats: sanitizedChats,
        activeFolderId: sortedChats[0]?.folderId || sanitizedFolders[0]?.id || null,
        activeChatId: sortedChats[0]?.id || null,
      };

      if (!state.folders.length && !state.chats.length) {
        return await createDefaultUserAIState(userId);
      }

      sanitizeAIState(state);
      saveAIState(state);
      return state;
    }

    async function createDefaultUserAIState(userId) {
      const now = new Date().toISOString();
      const folderId = generateId('folder');
      const chatId = generateId('chat');

      const folder = { id: folderId, name: 'General', icon: '📁', color: 'blue', position: 0, createdAt: now, updatedAt: now };
      const chat = { id: chatId, folderId, title: 'Nova conversa', createdAt: now, updatedAt: now, messages: [] };

      await dbCreateAIFolder({ userId, id: folderId, name: folder.name, icon: folder.icon, color: folder.color, position: folder.position, createdAt: now, updatedAt: now });
      await dbCreateAIChat({ userId, id: chatId, folderId, title: chat.title, createdAt: now, updatedAt: now });

      const state = { folders: [folder], chats: [chat], activeFolderId: folderId, activeChatId: chatId };
      saveAIState(state);
      return state;
    }

    async function persistFolder(folder) {
      const user = await getCurrentAIUser();
      if (!user) return;
      try {
        await dbUpsertAIFolder({
          userId: user.id,
          id: folder.id,
          name: folder.name,
          icon: folder.icon || '📁',
          color: folder.color || 'blue',
          position: folder.position ?? 0,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
        });
      } catch (err) {
        console.error('[AI STORAGE ERROR]', {
          context: 'persistFolder',
          error: err,
          message: err?.message,
          details: err?.details,
          hint: err?.hint,
          code: err?.code,
        });
        if (err?.code !== '42P01' && !(err?.message || '').includes('does not exist')) {
          showGlobalToast('No s\'ha pogut desar la carpeta al servidor.', true);
        }
      }
    }

    async function persistChat(chat) {
      const user = await getCurrentAIUser();
      if (!user) return;
      try {
        await dbUpsertAIChat({ userId: user.id, id: chat.id, folderId: chat.folderId, title: chat.title, createdAt: chat.createdAt, updatedAt: chat.updatedAt });
      } catch (err) {
        console.error('[AI STORAGE ERROR]', {
          context: 'persistChat',
          error: err,
          message: err?.message,
          details: err?.details,
          hint: err?.hint,
          code: err?.code,
        });
        if (err?.code !== '42P01' && !(err?.message || '').includes('does not exist')) {
          showGlobalToast('No s\'ha pogut desar el xat al servidor.', true);
        }
      }
    }

    async function deleteChatFromDB(chatId) {
      const user = await getCurrentAIUser();
      if (!user) return;
      try {
        await dbDeleteAIMessages(chatId, user.id);
        await dbDeleteAIChat(chatId, user.id);
      } catch (err) {
        console.error('Error eliminant xat AI:', err);
        showGlobalToast('No s\'ha pogut eliminar el xat del servidor.', true);
      }
    }

    async function deleteFolderFromDB(folderId, chatIds = []) {
      const user = await getCurrentAIUser();
      if (!user) return;
      try {
        for (const chatId of chatIds) {
          await deleteChatFromDB(chatId);
        }
        await dbDeleteAIFolder(folderId, user.id);
      } catch (err) {
        console.error('Error eliminant carpeta AI:', err);
        showGlobalToast('No s\'ha pogut eliminar la carpeta del servidor.', true);
      }
    }

    async function persistMessage(message, chat) {
      const user = await getCurrentAIUser();
      if (!user) return;
      try {
        await dbCreateAIMessage({ userId: user.id, chatId: chat.id, role: message.role, content: message.content, meta: message.meta });
        await dbUpdateAIChat(chat.id, { updated_at: chat.updatedAt });
      } catch (err) {
        console.error('[AI STORAGE ERROR]', {
          context: 'persistMessage',
          error: err,
          message: err?.message,
          details: err?.details,
          hint: err?.hint,
          code: err?.code,
        });
        // Només mostrem toast si no és un error de taula inexistent (ja es mostra a initAssessor)
        if (err?.code !== '42P01' && !(err?.message || '').includes('does not exist')) {
          showGlobalToast('No s\'ha pogut desar el missatge al servidor.', true);
        }
      }
    }

    function formatRelativeDate(isoDate) {
      if (!isoDate) return '';
      const then = new Date(isoDate);
      const diff = Math.floor((Date.now() - then.getTime()) / 86400000);
      if (diff === 0) return 'avui';
      if (diff === 1) return 'ahir';
      if (diff < 7) return `fa ${diff} dies`;
      return then.toLocaleDateString('ca-ES', { day: '2-digit', month: 'short' });
    }

    function generateChatTitle(text) {
      if (!text) return 'Nova conversa';
      const words = text.trim().split(/\s+/).slice(0, 5);
      const title = words.join(' ');
      return title.length > 30 ? `${title.slice(0, 30)}...` : title;
    }

    function serializeBotResult(data) {
      return {
        found: data.found !== false,
        summary: data.summary || '',
        options: Array.isArray(data.options) ? data.options.map(opt => ({
          name: opt.name || '',
          badge: opt.badge || '',
          description: opt.description || '',
          priceLabel: opt.priceLabel || '',
          price: opt.price ?? null,
          details: opt.details || '',
        })) : [],
        tip: data.tip || '',
        errorMessage: data.errorMessage || '',
        category: data.category || '',
        maxPrice: data.maxPrice || null,
      };
    }

    function createDefaultAssessorState() {
      const now = new Date().toISOString();
      const folderId = generateId('folder');
      const chatId = generateId('chat');
      return {
        folders: [{ id: folderId, name: 'General', icon: '📁', color: 'blue', position: 0, createdAt: now, updatedAt: now, isOpen: true }],
        chats: [{ id: chatId, folderId, title: 'Nova conversa', createdAt: now, updatedAt: now, messages: [] }],
        activeFolderId: folderId,
        activeChatId: chatId,
      };
    }

    async function initAssessor() {
      const user = await getCurrentAIUser();
      if (user) {
        try {
          const state = await loadAIStateFromSupabase(user.id);
          if (!state.activeChatId || !state.chats.some(c => c.id === state.activeChatId)) {
            state.activeChatId = state.chats[state.chats.length - 1]?.id || state.chats[0]?.id;
          }
          saveAIState(state);
          renderAssessorState(state);
          return;
        } catch (err) {
          console.error('[AI STORAGE ERROR]', {
            context: 'initAssessor / loadAIStateFromSupabase',
            error: err,
            message: err?.message,
            details: err?.details,
            hint: err?.hint,
            code: err?.code,
          });
          // Si l'error és per taules inexistents (42P01) mostrem un toast específic
          // Altrament, intentem continuar amb l'estat local
          const isTableMissing = err?.code === '42P01' || (err?.message || '').includes('does not exist');
          if (isTableMissing) {
            showGlobalToast('Configuració de la base de dades incompleta. Contacta amb l\'administrador.', true);
          } else {
            showGlobalToast('No s\'han pogut carregar les converses del servidor.', true);
          }
          // Fall through to localStorage
        }
      }

      // Sense sessió o amb error: usar localStorage (o crear estat per defecte)
      const state = getAIState();
      if (state.folders.length === 0 || state.chats.length === 0) {
        const fresh = createDefaultAssessorState();
        saveAIState(fresh);
        renderAssessorState(fresh);
        return;
      }

      if (!state.activeFolderId || !state.folders.some(f => f.id === state.activeFolderId)) {
        state.activeFolderId = state.activeChatId ? state.chats.find(c => c.id === state.activeChatId)?.folderId : state.folders[0]?.id;
      }

      if (!state.activeChatId || !state.chats.some(c => c.id === state.activeChatId)) {
        const folderChats = state.chats.filter(c => c.folderId === state.activeFolderId);
        state.activeChatId = folderChats.length > 0 ? folderChats[0].id : null;
      }

      saveAIState(state);
      renderAssessorState(state);
    }

    function renderAssessorState(state) {
      renderFolders(state);
      renderActiveChatMessages(state);
      if (window.lucide) lucide.createIcons();
    }

    function getActiveChat(state = getAIState()) {
      return state.chats.find(c => c.id === state.activeChatId) || null;
    }

    function getActiveFolder(state = getAIState()) {
      const folder = state.folders.find(f => f.id === state.activeFolderId);
      if (folder) return folder;
      const chat = getActiveChat(state);
      return state.folders.find(f => f.id === chat?.folderId) || state.folders[0] || null;
    }

    function setActiveChat(chatId) {
      const state = getAIState();
      const chat = state.chats.find(c => c.id === chatId);
      if (!chat) return;
      state.activeChatId = chatId;
      state.activeFolderId = chat.folderId;
      saveAIState(state);
      renderAssessorState(state);
      if (window.innerWidth < 1024) {
        const sidebar = document.getElementById('ai-sidebar');
        if (sidebar) sidebar.classList.add('hidden');
      }
    }

    function setActiveFolder(folderId) {
      const state = getAIState();
      if (!state.folders.some(f => f.id === folderId)) return;
      const folder = state.folders.find(f => f.id === folderId);
      if (folder) folder.isOpen = true;
      state.activeFolderId = folderId;
      const chatsInFolder = state.chats.filter(c => c.folderId === folderId);
      state.activeChatId = chatsInFolder.length > 0 ? chatsInFolder.find(c => c.id === state.activeChatId)?.id || chatsInFolder[0].id : null;
      saveAIState(state);
      renderAssessorState(state);
      if (window.innerWidth < 1024) {
        const sidebar = document.getElementById('ai-sidebar');
        if (sidebar) sidebar.classList.add('hidden');
      }
    }

    function createFolder(name, icon = '📁', color = 'blue') {
      const state = getAIState();
      const now = new Date().toISOString();
      const folderId = generateId('folder');
      const folder = { id: folderId, name: name || 'Nova carpeta', icon, color, position: state.folders.length, createdAt: now, updatedAt: now, isOpen: true };
      state.folders.push(folder);
      state.activeFolderId = folderId;
      const chatId = generateId('chat');
      const chat = { id: chatId, folderId, title: 'Nova conversa', createdAt: now, updatedAt: now, messages: [] };
      state.chats.push(chat);
      state.activeChatId = chatId;
      sanitizeAIState(state);
      saveAIState(state);
      renderAssessorState(state);
      persistFolder(folder);
      persistChat(chat);
      return folderId;
    }

    function renameFolder(folderId, name) {
      const state = getAIState();
      const folder = state.folders.find(f => f.id === folderId);
      if (!folder) return;
      folder.name = name || folder.name;
      folder.updatedAt = new Date().toISOString();
      saveAIState(state);
      renderFolders(state);
      showGlobalToast('Carpeta renombrada');
      persistFolder(folder);
    }

    function deleteFolder(folderId) {
      const state = getAIState();
      if (state.folders.length <= 1) {
        showGlobalToast('No es pot eliminar l\'única carpeta.', true);
        return;
      }
      const folderChats = state.chats.filter(c => c.folderId === folderId);
      state.folders = state.folders.filter(f => f.id !== folderId);
      state.chats = state.chats.filter(c => c.folderId !== folderId);
      if (!state.chats.some(c => c.id === state.activeChatId)) {
        const sameFolderChats = state.chats.filter(c => c.folderId === state.activeFolderId);
        if (sameFolderChats.length > 0) {
          state.activeChatId = sameFolderChats[0].id;
        } else {
          const nextFolder = state.folders[0];
          state.activeFolderId = nextFolder?.id || null;
          state.activeChatId = nextFolder ? state.chats.find(c => c.folderId === nextFolder.id)?.id : null;
        }
      }
      sanitizeAIState(state);
      saveAIState(state);
      renderAssessorState(state);
      showGlobalToast('Carpeta eliminada');
      deleteFolderFromDB(folderId, folderChats.map(chat => chat.id));
    }

    function createChat(folderId, title) {
      const state = getAIState();
      const targetFolder = state.folders.find(f => f.id === folderId) || state.folders[0];
      if (!targetFolder) {
        const newFolderId = createFolder('General');
        return createChat(newFolderId, title);
      }
      const now = new Date().toISOString();
      const chatId = generateId('chat');
      const chat = { id: chatId, folderId: targetFolder.id, title: title || 'Nova conversa', createdAt: now, updatedAt: now, messages: [] };
      state.chats.push(chat);
      state.activeChatId = chatId;
      state.activeFolderId = targetFolder.id;
      sanitizeAIState(state);
      saveAIState(state);
      renderAssessorState(state);
      persistChat(chat);
      return chatId;
    }

    function renameChat(chatId, title) {
      const state = getAIState();
      const chat = state.chats.find(c => c.id === chatId);
      if (!chat) return;
      chat.title = title || chat.title;
      chat.updatedAt = new Date().toISOString();
      saveAIState(state);
      renderFolders(state);
      renderActiveChatMessages(state);
      showGlobalToast('Xat renombrat');
      persistChat(chat);
    }

    function duplicateChat(chatId) {
      const state = getAIState();
      const original = state.chats.find(c => c.id === chatId);
      if (!original) return;
      const now = new Date().toISOString();
      const newChatId = generateId('chat');
      const duplicated = {
        id: newChatId,
        folderId: original.folderId,
        title: `${original.title} (còpia)`,
        createdAt: now,
        updatedAt: now,
        messages: original.messages.map(msg => ({ ...msg, id: generateId('msg'), createdAt: now })),
      };
      state.chats.push(duplicated);
      state.activeChatId = newChatId;
      state.activeFolderId = original.folderId;
      saveAIState(state);
      renderAssessorState(state);
      persistChat(duplicated);
      duplicated.messages.forEach(msg => persistMessage(msg, duplicated));
      showGlobalToast('Xat duplicat');
    }

    function duplicateActiveChat() {
      const state = getAIState();
      if (!state.activeChatId) return;
      duplicateChat(state.activeChatId);
    }

    function moveChatToFolder(chatId, targetFolderId) {
      const state = getAIState();
      const chat = state.chats.find(c => c.id === chatId);
      if (!chat || chat.folderId === targetFolderId) return;
      const targetFolder = state.folders.find(f => f.id === targetFolderId);
      if (!targetFolder) return;
      chat.folderId = targetFolder.id;
      chat.updatedAt = new Date().toISOString();
      state.activeFolderId = targetFolder.id;
      state.activeChatId = chat.id;
      saveAIState(state);
      renderAssessorState(state);
      persistChat(chat);
      showGlobalToast('Xat mogut a carpeta');
    }

    function moveChatPrompt(chatId) {
      const state = getAIState();
      const chat = state.chats.find(c => c.id === chatId);
      if (!chat) return;
      const otherFolders = state.folders.filter(f => f.id !== chat.folderId);
      if (!otherFolders.length) {
        showGlobalToast('No hi ha cap altra carpeta on moure aquest xat.', true);
        return;
      }
      const root = document.getElementById('ai-modal-root');
      if (!root) return;
      closeAIModal();
      root.classList.remove('hidden');
      root.innerHTML = `
        <div class="ai-modal-card bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200 w-full max-w-xl mx-auto overflow-hidden">
          <div class="px-6 py-6 border-b border-slate-200">
            <p class="font-display font-800 text-xl text-ink mb-1">Moure xat</p>
            <p class="font-body text-sm text-ink-muted">Tria la carpeta on vols ubicar aquest xat.</p>
          </div>
          <div class="px-6 py-5 bg-surface space-y-3">
            ${otherFolders.map(folder => `
              <button type="button" class="w-full rounded-3xl border border-ink-muted/10 bg-white px-4 py-4 text-left text-sm text-ink hover:border-brand-300" onclick="moveChatToFolder('${chatId}', '${folder.id}');closeAIModal();">
                <div class="flex items-center justify-between gap-3">
                  <span>${escapeHtml(folder.name)}</span>
                  <span class="text-ink-muted text-xs">${state.chats.filter(c => c.folderId === folder.id).length} xat${state.chats.filter(c => c.folderId === folder.id).length === 1 ? '' : 's'}</span>
                </div>
              </button>`).join('')}
          </div>
          <div class="px-6 py-5 bg-white flex justify-end">
            <button id="ai-modal-cancel" class="rounded-2xl border border-ink-muted/15 bg-surface px-4 py-3 text-sm font-semibold text-ink-muted hover:border-brand-300">Cancel·la</button>
          </div>
        </div>`;
      setTimeout(() => root.classList.add('ai-modal-visible'), 10);
      const cancelBtn = document.getElementById('ai-modal-cancel');
      if (cancelBtn) cancelBtn.onclick = closeAIModal;
      _aiModalKeyHandler = event => {
        if (event.key === 'Escape') closeAIModal();
      };
      document.addEventListener('keydown', _aiModalKeyHandler);
    }

    function exportActiveChat() {
      const state = getAIState();
      const chat = getActiveChat(state);
      if (!chat) {
        showGlobalToast('No hi ha cap xat actiu per exportar.', true);
        return;
      }
      const data = {
        id: chat.id,
        title: chat.title,
        folder: state.folders.find(f => f.id === chat.folderId)?.name || 'General',
        messages: chat.messages,
      };
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      a.download = `${chat.title.replace(/[^a-z0-9-_]/gi, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showGlobalToast('Xat exportat');
    }

    function deleteChat(chatId) {
      const state = getAIState();
      const chatIndex = state.chats.findIndex(c => c.id === chatId);
      if (chatIndex === -1) return;
      const deletedChat = state.chats.splice(chatIndex, 1)[0];
      if (state.activeChatId === chatId) {
        const sameFolderChats = state.chats.filter(c => c.folderId === deletedChat.folderId);
        if (sameFolderChats.length > 0) {
          state.activeChatId = sameFolderChats[0].id;
          state.activeFolderId = deletedChat.folderId;
        } else {
          const nextFolder = state.folders.find(f => f.id !== deletedChat.folderId) || state.folders[0];
          state.activeFolderId = nextFolder?.id || null;
          state.activeChatId = state.chats.find(c => c.folderId === state.activeFolderId)?.id || null;
        }
      }
      sanitizeAIState(state);
      saveAIState(state);
      renderAssessorState(state);
      showGlobalToast('Xat eliminat');
      deleteChatFromDB(chatId);
    }

    function saveMessageToActiveChat(role, content, meta) {
      const state = getAIState();
      const chat = getActiveChat(state);
      if (!chat) return;
      const message = {
        id: generateId('msg'),
        role,
        content: content || '',
        createdAt: new Date().toISOString(),
        meta: meta || null,
      };
      chat.messages.push(message);
      chat.updatedAt = new Date().toISOString();
      if (role === 'user' && chat.title === 'Nova conversa') {
        chat.title = generateChatTitle(content);
      }
      saveAIState(state);
      renderFolders(state);
      updateAssessorHeader(state);
      persistMessage(message, chat);
      persistChat(chat);
      return message;
    }

    function getFolderAccentClasses(color) {
      const accents = {
        blue: { ring: 'ring-blue-100', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
        green: { ring: 'ring-emerald-100', bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
        orange: { ring: 'ring-orange-100', bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
        purple: { ring: 'ring-violet-100', bg: 'bg-violet-50', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700' },
        pink: { ring: 'ring-pink-100', bg: 'bg-pink-50', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-700' },
        red: { ring: 'ring-rose-100', bg: 'bg-rose-50', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700' },
        gray: { ring: 'ring-slate-100', bg: 'bg-slate-50', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-700' },
      };
      return accents[color] || accents.blue;
    }

    function toggleFolderExpansion(folderId) {
      const state = getAIState();
      const folder = state.folders.find(f => f.id === folderId);
      if (!folder) return;
      folder.isOpen = folder.isOpen !== false ? false : true;
      saveAIState(state);
      renderAssessorState(state);
    }

    function renderFolders(state) {
      const folderList = document.getElementById('ai-folder-list');
      if (!folderList) return;
      const activeFolder = getActiveFolder(state);
      folderList.innerHTML = '';
      state.folders.forEach(folder => {
        const chatsInFolder = state.chats.filter(c => c.folderId === folder.id).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        const active = folder.id === activeFolder?.id;
        const accent = getFolderAccentClasses(folder.color || 'blue');
        const isOpen = folder.isOpen !== false;
        const chatItems = chatsInFolder.length === 0
          ? `<div class="rounded-3xl border border-ink-muted/10 bg-slate-50 px-4 py-5 text-center text-sm text-ink-muted">Aquesta carpeta encara no té xats. Crea un de nou per començar.</div>`
          : chatsInFolder.map(chat => {
              const chatActive = chat.id === state.activeChatId;
              return `
                <div class="rounded-3xl border ${chatActive ? 'border-brand-300 bg-brand-50 shadow-sm' : 'border-transparent bg-white hover:border-slate-200'} overflow-hidden">
                  <button type="button" onclick="setActiveChat('${chat.id}')" class="w-full text-left px-4 py-3 text-sm text-ink transition flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <p class="font-display font-700 truncate">${escapeHtml(chat.title)}</p>
                      <p class="font-body text-xs text-ink-muted mt-1">${chat.messages.length} missatge${chat.messages.length === 1 ? '' : 's'}</p>
                    </div>
                    <span class="font-body text-[11px] text-ink-muted">${formatRelativeDate(chat.updatedAt)}</span>
                  </button>
                  <div class="flex items-center justify-end gap-2 px-3 pb-3">
                    <button type="button" onclick="duplicateChat('${chat.id}'); event.stopPropagation()" class="rounded-full border border-ink-muted/10 bg-white p-2 text-xs text-ink-muted hover:border-brand-300">⎘</button>
                    <button type="button" onclick="moveChatPrompt('${chat.id}'); event.stopPropagation()" class="rounded-full border border-ink-muted/10 bg-white p-2 text-xs text-ink-muted hover:border-brand-300">⇄</button>
                    <button type="button" onclick="renameChatPrompt('${chat.id}'); event.stopPropagation()" class="rounded-full border border-ink-muted/10 bg-white p-2 text-xs text-ink-muted hover:border-brand-300">✎</button>
                    <button type="button" onclick="deleteChatPrompt('${chat.id}'); event.stopPropagation()" class="rounded-full border border-ink-muted/10 bg-white p-2 text-xs text-ink-muted hover:text-red-600">🗑</button>
                  </div>
                </div>`;
            }).join('');

        folderList.innerHTML += `
          <div class="rounded-3xl border ${active ? 'border-slate-300 bg-slate-50 shadow-sm' : 'border-ink-muted/10 bg-white hover:border-slate-200'} transition overflow-hidden">
            <div class="flex items-center justify-between gap-3 px-4 py-4 cursor-pointer" onclick="setActiveFolder('${folder.id}')">
              <div class="flex items-center gap-3">
                <span class="flex h-11 w-11 items-center justify-center rounded-2xl ${accent.bg} ${accent.text} ring-1 ring-inset ${accent.ring} text-lg">${escapeHtml(folder.icon || '📁')}</span>
                <div class="min-w-0">
                  <p class="font-display font-700 text-sm text-ink truncate">${escapeHtml(folder.name)}</p>
                  <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                    <span>${chatsInFolder.length} xat${chatsInFolder.length === 1 ? '' : 's'}</span>
                    <span class="rounded-full px-2 py-0.5 ${accent.badge} lowercase">${escapeHtml(folder.color || 'blue')}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" onclick="toggleFolderExpansion('${folder.id}'); event.stopPropagation()" class="rounded-full border border-ink-muted/10 bg-white p-2 text-xs text-ink-muted hover:border-brand-300">${isOpen ? '▾' : '▸'}</button>
                <button type="button" onclick="createChatPrompt('${folder.id}'); event.stopPropagation()" class="rounded-2xl border border-ink-muted/10 bg-surface px-3 py-2 text-xs font-semibold text-ink-muted hover:border-brand-300">+ Xat</button>
              </div>
            </div>
            <div class="px-4 ${isOpen ? 'block' : 'hidden'} pb-4 space-y-3">
              ${chatItems}
            </div>
            <div class="flex items-center justify-end gap-1 px-3 pb-3">
              <button type="button" onclick="renameFolderPrompt('${folder.id}');event.stopPropagation()" class="rounded-full border border-ink-muted/10 bg-white p-2 text-xs text-ink-muted hover:text-brand-600">✎</button>
              <button type="button" onclick="deleteFolderPrompt('${folder.id}');event.stopPropagation()" class="rounded-full border border-ink-muted/10 bg-white p-2 text-xs text-ink-muted hover:text-red-600">🗑</button>
            </div>
          </div>`;
      });
    }

    function renderWelcomeMessage() {
      return `
        <div class="flex gap-3" id="msg-welcome">
          <div class="w-7 h-7 rounded-full bg-brand-100 flex-shrink-0 flex items-center justify-center mt-0.5">
            <i data-lucide="bot" class="w-3 h-3 text-brand-600"></i>
          </div>
          <div class="flex flex-col gap-2 max-w-sm">
            <div class="chat-bubble-in px-4 py-3">
              <p class="font-body text-sm text-ink leading-relaxed">
                Hola! 👋 Soc el teu assessor de pressupost. Escriu-me una petició com ara:
              </p>
              <ul class="mt-2 space-y-1">
                <li class="font-body text-xs text-ink-muted flex items-start gap-1.5"><span class="text-brand-500 mt-0.5">›</span> <em>"Busca'm gimnasos per menys de 30€/mes"</em></li>
                <li class="font-body text-xs text-ink-muted flex items-start gap-1.5"><span class="text-brand-500 mt-0.5">›</span> <em>"Plataformes de streaming per menys de 10€"</em></li>
                <li class="font-body text-xs text-ink-muted flex items-start gap-1.5"><span class="text-brand-500 mt-0.5">›</span> <em>"Transport públic mensual a Barcelona"</em></li>
              </ul>
            </div>
          </div>
        </div>`;
    }

    function renderActiveChatMessages(state) {
      const container = document.getElementById('chat-messages');
      if (!container) return;
      container.innerHTML = '';
      const chat = getActiveChat(state);
      if (!chat || chat.messages.length === 0) {
        container.innerHTML = renderWelcomeMessage();
        document.getElementById('chat-chips').style.display = 'flex';
        updateAssessorHeader(state);
        return;
      }
      document.getElementById('chat-chips').style.display = 'none';
      chat.messages.forEach(renderStoredMessage);
      updateAssessorHeader(state);
    }

    function renderStoredMessage(message) {
      if (message.role === 'user') {
        const container = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.className = 'flex gap-3 justify-end';
        div.innerHTML = `
          <div class="chat-bubble-out px-4 py-3 max-w-xs">
            <p class="font-body text-sm text-white leading-relaxed">${escapeHtml(message.content)}</p>
          </div>`;
        container.appendChild(div);
        return;
      }
      if (message.meta?.found === false) {
        appendErrorMessage(message.meta);
        return;
      }
      appendBotResponse(message.meta || { summary: message.content || '', options: [], tip: '' });
    }

    function updateAssessorHeader(state) {
      const chat = getActiveChat(state);
      const titleEl = document.getElementById('ai-active-chat-title');
      const metaEl = document.getElementById('ai-active-chat-meta');
      const folderNameEl = document.getElementById('ai-active-folder-name');
      const folderMetaEl = document.getElementById('ai-active-folder-meta');
      const folderCountEl = document.getElementById('ai-folder-chat-count');
      const syncStatusEl = document.getElementById('ai-sync-status');
      const folder = getActiveFolder(state);
      const messageCount = chat ? chat.messages.length : 0;

      if (titleEl) titleEl.textContent = chat ? chat.title : 'Assessor IA';
      if (metaEl) metaEl.textContent = chat
        ? `${messageCount} missatge${messageCount === 1 ? '' : 's'} · actualitzat ${formatRelativeDate(chat.updatedAt)}`
        : 'Selecciona un xat o crea’n un de nou per començar.';
      if (folderNameEl) folderNameEl.textContent = folder ? folder.name : 'General';
      if (folderMetaEl) folderMetaEl.textContent = folder
        ? `${state.chats.filter(c => c.folderId === folder.id).length} xat${state.chats.filter(c => c.folderId === folder.id).length === 1 ? '' : 's'} · carpeta activa`
        : 'Selecciona una carpeta.';
      if (folderCountEl) folderCountEl.textContent = folder
        ? `${state.chats.filter(c => c.folderId === folder.id).length} xat${state.chats.filter(c => c.folderId === folder.id).length === 1 ? '' : 's'} en aquesta carpeta.`
        : 'Cap xat disponible.';
      if (syncStatusEl) syncStatusEl.textContent = 'Sincronitzat';
    }

    let _aiModalKeyHandler = null;

    function closeAIModal() {
      const root = document.getElementById('ai-modal-root');
      if (!root || root.classList.contains('hidden')) return;
      root.classList.remove('ai-modal-visible');
      document.removeEventListener('keydown', _aiModalKeyHandler);
      _aiModalKeyHandler = null;
      root.addEventListener('transitionend', () => {
        if (!root.classList.contains('ai-modal-visible')) {
          root.classList.add('hidden');
          root.innerHTML = '';
        }
      }, { once: true });
    }

    function openTextModal({ title, description, placeholder = '', defaultValue = '', confirmText = 'Guardar', cancelText = 'Cancel·la', danger = false, multiline = false, validate, onConfirm }) {
      const root = document.getElementById('ai-modal-root');
      if (!root) return;
      closeAIModal();
      root.classList.remove('hidden');
      root.innerHTML = `
        <div class="ai-modal-card bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200 w-full max-w-xl mx-auto overflow-hidden">
          <div class="px-6 py-6 border-b border-slate-200">
            <p class="font-display font-800 text-xl text-ink mb-1">${escapeHtml(title)}</p>
            <p class="font-body text-sm text-ink-muted">${escapeHtml(description)}</p>
          </div>
          <div class="px-6 py-5 bg-surface">
            ${multiline
              ? `<textarea id="ai-modal-input" class="w-full min-h-[140px] rounded-3xl border border-ink-muted/10 bg-white p-4 text-sm text-ink focus:outline-none focus:border-brand-300" placeholder="${escapeHtml(placeholder)}">${escapeHtml(defaultValue)}</textarea>`
              : `<input id="ai-modal-input" type="text" value="${escapeHtml(defaultValue)}" placeholder="${escapeHtml(placeholder)}" class="w-full rounded-3xl border border-ink-muted/10 bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:border-brand-300" />`}
            <p id="ai-modal-error" class="mt-3 text-sm text-red-600 min-h-[1.25rem]"></p>
          </div>
          <div class="px-6 py-5 bg-white flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3">
            <button id="ai-modal-cancel" class="w-full sm:w-auto rounded-2xl border border-ink-muted/15 bg-surface px-4 py-3 text-sm font-semibold text-ink-muted hover:border-brand-300">${escapeHtml(cancelText)}</button>
            <button id="ai-modal-confirm" class="w-full sm:w-auto rounded-2xl px-4 py-3 text-sm font-semibold ${danger ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-brand-600 text-white hover:bg-brand-700'}">${escapeHtml(confirmText)}</button>
          </div>
        </div>`;

      const input = document.getElementById('ai-modal-input');
      const error = document.getElementById('ai-modal-error');
      const cancelBtn = document.getElementById('ai-modal-cancel');
      const confirmBtn = document.getElementById('ai-modal-confirm');
      setTimeout(() => root.classList.add('ai-modal-visible'), 10);
      if (!input || !cancelBtn || !confirmBtn) return;

      function validateAndConfirm() {
        const value = input.value;
        const validationError = validate ? validate(value) : !value.trim() ? 'Aquest camp no pot estar buit.' : null;
        if (validationError) {
          error.textContent = validationError;
          return;
        }
        closeAIModal();
        onConfirm(value.trim());
      }

      cancelBtn.onclick = closeAIModal;
      confirmBtn.onclick = validateAndConfirm;
      root.onclick = event => { if (event.target === root) closeAIModal(); };

      _aiModalKeyHandler = event => {
        if (event.key === 'Escape') {
          closeAIModal();
        }
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          validateAndConfirm();
        }
      };

      document.addEventListener('keydown', _aiModalKeyHandler);
      input.focus();
    }

    function openConfirmModal({ title, description, confirmText = 'Confirmar', cancelText = 'Cancel·la', danger = false, onConfirm }) {
      const root = document.getElementById('ai-modal-root');
      if (!root) return;
      closeAIModal();
      root.classList.remove('hidden');
      root.innerHTML = `
        <div class="ai-modal-card bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200 w-full max-w-lg mx-auto overflow-hidden">
          <div class="px-6 py-6 border-b border-slate-200">
            <p class="font-display font-800 text-xl text-ink mb-1">${escapeHtml(title)}</p>
            <p class="font-body text-sm text-ink-muted">${escapeHtml(description)}</p>
          </div>
          <div class="px-6 py-5 bg-white flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3">
            <button id="ai-modal-cancel" class="w-full sm:w-auto rounded-2xl border border-ink-muted/15 bg-surface px-4 py-3 text-sm font-semibold text-ink-muted hover:border-brand-300">${escapeHtml(cancelText)}</button>
            <button id="ai-modal-confirm" class="w-full sm:w-auto rounded-2xl px-4 py-3 text-sm font-semibold ${danger ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-brand-600 text-white hover:bg-brand-700'}">${escapeHtml(confirmText)}</button>
          </div>
        </div>`;

      const cancelBtn = document.getElementById('ai-modal-cancel');
      const confirmBtn = document.getElementById('ai-modal-confirm');
      if (!cancelBtn || !confirmBtn) return;
      setTimeout(() => root.classList.add('ai-modal-visible'), 10);

      cancelBtn.onclick = closeAIModal;
      confirmBtn.onclick = () => { closeAIModal(); onConfirm(); };
      root.onclick = event => { if (event.target === root) closeAIModal(); };

      _aiModalKeyHandler = event => {
        if (event.key === 'Escape') closeAIModal();
        if (event.key === 'Enter') {
          event.preventDefault();
          closeAIModal();
          onConfirm();
        }
      };
      document.addEventListener('keydown', _aiModalKeyHandler);
    }

    function toggleAssessorSidebar(visible = null) {
      const sidebar = document.getElementById('ai-sidebar');
      if (!sidebar) return;
      if (visible === true) sidebar.classList.remove('hidden');
      else if (visible === false) sidebar.classList.add('hidden');
      else sidebar.classList.toggle('hidden');
    }

    function openFolderModal({ title, description, folder = null, confirmText = 'Guardar', onConfirm }) {
      const root = document.getElementById('ai-modal-root');
      if (!root) return;
      closeAIModal();
      root.classList.remove('hidden');
      const colors = ['blue', 'green', 'orange', 'purple', 'pink', 'red', 'gray'];
      const iconOptions = ['📁', '💼', '🧩', '🚀', '📊', '🗂️', '✨'];
      const defaultName = folder?.name || 'Nova carpeta';
      const defaultIcon = folder?.icon || '📁';
      const defaultColor = folder?.color || 'blue';
      root.innerHTML = `
        <div class="ai-modal-card bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200 w-full max-w-xl mx-auto overflow-hidden">
          <div class="px-6 py-6 border-b border-slate-200">
            <p class="font-display font-800 text-xl text-ink mb-1">${escapeHtml(title)}</p>
            <p class="font-body text-sm text-ink-muted">${escapeHtml(description)}</p>
          </div>
          <div class="px-6 py-5 bg-surface space-y-5">
            <div>
              <label class="font-display font-700 text-sm text-ink mb-2 block">Nom</label>
              <input id="ai-folder-name" type="text" value="${escapeHtml(defaultName)}" class="w-full rounded-3xl border border-ink-muted/10 bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:border-brand-300" />
            </div>
            <div>
              <p class="font-display font-700 text-sm text-ink mb-3">Icona</p>
              <div class="grid grid-cols-7 gap-3">
                ${iconOptions.map(icon => `
                  <button type="button" data-icon="${escapeHtml(icon)}" class="folder-icon-choice rounded-2xl border border-ink-muted/10 bg-white px-3 py-3 text-lg transition ${icon === defaultIcon ? 'border-brand-500 bg-brand-50 shadow-sm' : 'hover:border-slate-300'}">${escapeHtml(icon)}</button>
                `).join('')}
              </div>
            </div>
            <div>
              <p class="font-display font-700 text-sm text-ink mb-3">Color</p>
              <div class="grid grid-cols-7 gap-3">
                ${colors.map(color => `
                  <button type="button" data-color="${color}" class="folder-color-choice rounded-2xl border border-ink-muted/10 px-3 py-3 transition ${color === defaultColor ? 'ring-2 ring-offset-2 ring-brand-500' : 'hover:border-slate-400'} ${color === 'blue' ? 'bg-blue-100' : color === 'green' ? 'bg-emerald-100' : color === 'orange' ? 'bg-orange-100' : color === 'purple' ? 'bg-violet-100' : color === 'pink' ? 'bg-pink-100' : color === 'red' ? 'bg-rose-100' : 'bg-slate-200'}"></button>
                `).join('')}
              </div>
            </div>
            <p id="ai-folder-error" class="text-sm text-red-600 min-h-[1.25rem]"></p>
          </div>
          <div class="px-6 py-5 bg-white flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3">
            <button id="ai-modal-cancel" class="w-full sm:w-auto rounded-2xl border border-ink-muted/15 bg-surface px-4 py-3 text-sm font-semibold text-ink-muted hover:border-brand-300">Cancel·la</button>
            <button id="ai-modal-confirm" class="w-full sm:w-auto rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700">${escapeHtml(confirmText)}</button>
          </div>
        </div>`;

      const nameInput = document.getElementById('ai-folder-name');
      const iconButtons = Array.from(root.querySelectorAll('.folder-icon-choice'));
      const colorButtons = Array.from(root.querySelectorAll('.folder-color-choice'));
      const errorEl = document.getElementById('ai-folder-error');
      const cancelBtn = document.getElementById('ai-modal-cancel');
      const confirmBtn = document.getElementById('ai-modal-confirm');
      let selectedIcon = defaultIcon;
      let selectedColor = defaultColor;

      iconButtons.forEach(button => {
        button.addEventListener('click', () => {
          selectedIcon = button.dataset.icon;
          iconButtons.forEach(btn => btn.classList.remove('border-brand-500', 'bg-brand-50', 'shadow-sm'));
          button.classList.add('border-brand-500', 'bg-brand-50', 'shadow-sm');
        });
      });
      colorButtons.forEach(button => {
        button.addEventListener('click', () => {
          selectedColor = button.dataset.color;
          colorButtons.forEach(btn => btn.classList.remove('ring-2', 'ring-offset-2', 'ring-brand-500'));
          button.classList.add('ring-2', 'ring-offset-2', 'ring-brand-500');
        });
      });

      setTimeout(() => root.classList.add('ai-modal-visible'), 10);
      cancelBtn.onclick = closeAIModal;
      confirmBtn.onclick = () => {
        const name = nameInput.value.trim();
        if (!name) {
          if (errorEl) errorEl.textContent = 'El nom no pot estar buit.';
          return;
        }
        closeAIModal();
        onConfirm(name, selectedIcon, selectedColor);
      };
      root.onclick = event => { if (event.target === root) closeAIModal(); };

      _aiModalKeyHandler = event => {
        if (event.key === 'Escape') closeAIModal();
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          confirmBtn.click();
        }
      };
      document.addEventListener('keydown', _aiModalKeyHandler);
      nameInput.focus();
    }

    function createFolderPrompt() {
      openFolderModal({
        title: 'Nova carpeta',
        description: 'Configura la teva nova carpeta amb icona i color.',
        confirmText: 'Crear carpeta',
        onConfirm: (name, icon, color) => createFolder(name, icon, color),
      });
    }

    function renameFolderPrompt(folderId) {
      const state = getAIState();
      const folder = state.folders.find(f => f.id === folderId) || getActiveFolder(state);
      if (!folder) return;
      openFolderModal({
        title: 'Editar carpeta',
        description: 'Canvia el nom, l\'icona o el color de la carpeta.',
        folder,
        confirmText: 'Guardar',
        onConfirm: (name, icon, color) => {
          renameFolder(folder.id, name);
          folder.icon = icon;
          folder.color = color;
          folder.updatedAt = new Date().toISOString();
          saveAIState(state);
          renderAssessorState(state);
          persistFolder(folder);
        },
      });
    }

    function deleteFolderPrompt(folderId) {
      const state = getAIState();
      const folder = state.folders.find(f => f.id === folderId);
      if (!folder) return;
      openConfirmModal({
        title: 'Eliminar carpeta',
        description: `Segur que vols eliminar la carpeta "${escapeHtml(folder.name)}" i tots els seus xats?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancel·la',
        danger: true,
        onConfirm: () => deleteFolder(folderId),
      });
    }

    function createChatPrompt(folderId = null) {
      const state = getAIState();
      const targetFolderId = folderId || getActiveFolder(state)?.id || state.folders[0]?.id;
      if (!targetFolderId) return;
      openTextModal({
        title: 'Nou xat',
        description: 'Dóna un nom a la nova conversa.',
        placeholder: 'Nova conversa',
        defaultValue: 'Nova conversa',
        confirmText: 'Crear xat',
        onConfirm: title => createChat(targetFolderId, title),
      });
    }

    function renameChatPrompt(chatId) {
      const state = getAIState();
      const chat = state.chats.find(c => c.id === chatId) || getActiveChat(state);
      if (!chat) return;
      openTextModal({
        title: 'Renombra xat',
        description: 'Escriu el nou nom del xat.',
        placeholder: 'Nom del xat',
        defaultValue: chat.title,
        confirmText: 'Renombrar',
        onConfirm: title => renameChat(chat.id, title),
      });
    }

    function deleteChatPrompt(chatId) {
      const state = getAIState();
      const chat = state.chats.find(c => c.id === chatId) || getActiveChat(state);
      if (!chat) return;
      openConfirmModal({
        title: 'Eliminar xat',
        description: `Segur que vols eliminar el xat "${escapeHtml(chat.title)}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancel·la',
        danger: true,
        onConfirm: () => deleteChat(chat.id),
      });
    }

    function exportAIState() {
      const state = getAIState();
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'smartprice_ai_state.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showGlobalToast('Converses exportades');
    }

    function importAIState() {
      openTextModal({
        title: 'Importa converses',
        description: 'Enganxa el JSON de les converses per importar.',
        placeholder: '{ "folders": [...], "chats": [...] }',
        multiline: true,
        confirmText: 'Importar',
        validate: value => {
          if (!value.trim()) return 'El JSON no pot estar buit.';
          try {
            const parsed = JSON.parse(value);
            if (!parsed || !Array.isArray(parsed.folders) || !Array.isArray(parsed.chats)) throw new Error('invalid');
            return null;
          } catch {
            return 'JSON no vàlid. Revisa la sintaxi.';
          }
        },
        onConfirm: value => {
          const parsed = JSON.parse(value);
          saveAIState(parsed);
          initAssessor();
          showGlobalToast('Converses importades');
        },
      });
    }

    let assessorLoading = false;

    function autoResizeTextarea(el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 96) + 'px';
    }

    function handleChatKey(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    }

    function sendChip(text) {
      const input = document.getElementById('chat-input');
      input.value = text;
      autoResizeTextarea(input);
      document.getElementById('chat-chips').style.display = 'none';
      sendMessage();
    }

    function clearChat() {
      const state = getAIState();
      const chat = getActiveChat(state);
      if (!chat) return;
      openConfirmModal({
        title: 'Neteja xat',
        description: 'Segur que vols esborrar tots els missatges d\'aquest xat?',
        confirmText: 'Netejar',
        cancelText: 'Cancel·la',
        danger: true,
        onConfirm: () => {
          chat.messages = [];
          chat.updatedAt = new Date().toISOString();
          saveAIState(state);
          renderActiveChatMessages(state);
          document.getElementById('chat-input').value = '';
          autoResizeTextarea(document.getElementById('chat-input'));
          showGlobalToast('Xat netejat');
        }
      });
    }

    function sendMessage() {
      const input = document.getElementById('chat-input');
      const text = input.value.trim();
      if (!text || assessorLoading) return;

      document.getElementById('chat-chips').style.display = 'none';
      appendUserMessage(text);
      saveMessageToActiveChat('user', text, null);
      input.value = '';
      autoResizeTextarea(input);
      assessorLoading = true;
      setInputDisabled(true);

      const loadingId = appendLoadingMessage();
      setTimeout(() => {
        removeLoadingMessage(loadingId);
        const result = queryOffline(text);
        const payload = serializeBotResult(result);
        if (payload.found === false) {
          appendErrorMessage(payload);
          saveMessageToActiveChat('assistant', payload.errorMessage, payload);
        } else {
          appendBotResponse(payload);
          saveMessageToActiveChat('assistant', payload.summary, payload);
        }
        assessorLoading = false;
        setInputDisabled(false);
        document.getElementById('chat-input').focus();
        scrollChatToBottom();
        if (window.lucide) lucide.createIcons();
      }, 600);
    }

    function setInputDisabled(disabled) {
      const btn = document.getElementById('chat-send-btn');
      const input = document.getElementById('chat-input');
      btn.disabled = disabled;
      input.disabled = disabled;
    }

    function scrollChatToBottom() {
      const container = document.getElementById('chat-messages');
      container.scrollTop = container.scrollHeight;
    }

    function appendUserMessage(text) {
      const container = document.getElementById('chat-messages');
      const div = document.createElement('div');
      div.className = 'flex gap-3 justify-end';
      div.innerHTML = `
        <div class="chat-bubble-out px-4 py-3 max-w-xs">
          <p class="font-body text-sm text-white leading-relaxed">${escapeHtml(text)}</p>
        </div>`;
      container.appendChild(div);
      scrollChatToBottom();
    }

    function appendLoadingMessage() {
      const container = document.getElementById('chat-messages');
      const id = 'loading-' + Date.now();
      const div = document.createElement('div');
      div.id = id;
      div.className = 'flex gap-3';
      div.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-brand-100 flex-shrink-0 flex items-center justify-center mt-0.5">
          <i data-lucide="bot" class="w-3 h-3 text-brand-600"></i>
        </div>
        <div class="chat-bubble-in px-4 py-3">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style="animation-delay:0ms"></span>
            <span class="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style="animation-delay:150ms"></span>
            <span class="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style="animation-delay:300ms"></span>
          </div>
        </div>`;
      container.appendChild(div);
      if (window.lucide) lucide.createIcons();
      scrollChatToBottom();
      return id;
    }

    function removeLoadingMessage(id) {
      const el = document.getElementById(id);
      if (el) el.remove();
    }

    // Criterion 3: Structured response with options cards
    function appendBotResponse(data) {
      const container = document.getElementById('chat-messages');
      const div = document.createElement('div');
      div.className = 'flex gap-3';

      const badgeColors = {
        'Millor preu': 'bg-brand-50 text-brand-700 border-brand-200',
        'Millor qualitat-preu': 'bg-violet-50 text-violet-700 border-violet-200',
        'Més popular': 'bg-amber-50 text-amber-700 border-amber-200',
        'Recomanat': 'bg-blue-50 text-blue-700 border-blue-200',
        'Econòmic': 'bg-brand-50 text-brand-600 border-brand-200',
      };

      const optionsHTML = data.options.map((opt, i) => {
        const badgeClass = badgeColors[opt.badge] || 'bg-brand-50 text-brand-700 border-brand-200';
        const badgeHTML = opt.badge
          ? `<span class="inline-block font-display font-700 text-xs px-2 py-0.5 rounded-full border ${badgeClass} mb-1.5">${escapeHtml(opt.badge)}</span>`
          : '';
        const isFirst = i === 0;
        // Build shortcut button only if a price is known and it's a monthly service
        const hasPrice = opt.price !== null && opt.price !== undefined && opt.price > 0;
        const shortcutBtn = hasPrice
          ? `<button
               type="button"
               onclick="addAIMonthlyExpenseShortcut(${JSON.stringify({ name: opt.name, amount: opt.price, priceLabel: opt.priceLabel || (opt.price + '€/mes'), category: data.category || 'Subscripcions' }).replace(/"/g, '&quot;')})"
               class="mt-2 w-full rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 font-display font-700 text-xs px-3 py-2 flex items-center justify-center gap-1.5 transition-colors">
               <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
               Afegir al pressupost
             </button>`
          : '';
        return `
          <div class="rounded-xl border ${isFirst ? 'border-brand-300 bg-brand-50/60' : 'border-ink-muted/10 bg-white'} p-3">
            ${badgeHTML}
            <div class="flex items-start justify-between gap-2">
              <p class="font-display font-700 text-sm text-ink">${escapeHtml(opt.name)}</p>
              <p class="font-display font-800 text-sm text-brand-600 whitespace-nowrap flex-shrink-0">${escapeHtml(opt.priceLabel || (opt.price + '€/mes'))}</p>
            </div>
            <p class="font-body text-xs text-ink-muted mt-1 leading-relaxed">${escapeHtml(opt.description)}</p>
            ${opt.details ? `<p class="font-body text-xs text-ink-muted/60 mt-1">${escapeHtml(opt.details)}</p>` : ''}
            ${shortcutBtn}
          </div>`;
      }).join('');

      const tipHTML = data.tip
        ? `<div class="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
             <i data-lucide="lightbulb" class="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5"></i>
             <p class="font-body text-xs text-amber-800">${escapeHtml(data.tip)}</p>
           </div>`
        : '';

      div.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-brand-100 flex-shrink-0 flex items-center justify-center mt-0.5">
          <i data-lucide="bot" class="w-3 h-3 text-brand-600"></i>
        </div>
        <div class="flex flex-col gap-2 min-w-0 flex-1">
          <div class="chat-bubble-in px-4 py-3">
            <p class="font-body text-sm text-ink leading-relaxed">${escapeHtml(data.summary)}</p>
          </div>
          <div class="space-y-2">
            ${optionsHTML}
          </div>
          ${tipHTML}
        </div>`;
      container.appendChild(div);
      scrollChatToBottom();
    }

    // Criterion 4: structured error when no options found
    function appendErrorMessage(data) {
      const container = document.getElementById('chat-messages');
      const div = document.createElement('div');
      div.className = 'flex gap-3';
      div.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-brand-100 flex-shrink-0 flex items-center justify-center mt-0.5">
          <i data-lucide="bot" class="w-3 h-3 text-brand-600"></i>
        </div>
        <div class="flex flex-col gap-2 max-w-sm">
          <div class="chat-bubble-in px-4 py-3">
            <div class="flex items-start gap-2 mb-2">
              <i data-lucide="search-x" class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"></i>
              <p class="font-display font-700 text-sm text-ink">No he trobat opcions</p>
            </div>
            <p class="font-body text-sm text-ink-muted leading-relaxed">${escapeHtml(data.errorMessage || 'No he pogut trobar alternatives per a aquesta petició.')}</p>
          </div>
        </div>`;
      container.appendChild(div);
      scrollChatToBottom();
    }

    // ══════════════════════════════════════════════
    //  ACCESSOS DIRECTES IA → PRESSUPOST
    // ══════════════════════════════════════════════

    /**
     * Punt d'entrada quan l'usuari clica "Afegir al pressupost" en una opció del xat.
     * expenseData = { name, amount, priceLabel, category }
     */
    async function addAIMonthlyExpenseShortcut(expenseData) {
      const user = await dbGetUser();

      if (!user) {
        // Sense sessió → modal informatiu
        openAIExpenseInfoModal({
          title: 'Inicia sessió primer',
          body: 'Has d\'iniciar sessió per afegir despeses al teu pressupost.',
          btnText: 'Anar a l\'inici de sessió',
          onConfirm: () => showView('login'),
        });
        return;
      }

      // Amb sessió → modal de confirmació
      confirmAddMonthlyExpenseModal(expenseData);
    }

    /**
     * Modal de confirmació amb detalls de la despesa.
     */
    function confirmAddMonthlyExpenseModal(expenseData) {
      const root = document.getElementById('ai-modal-root');
      if (!root) return;
      closeAIModal();

      const priceStr = expenseData.priceLabel || (expenseData.amount + '€/mes');
      const category = expenseData.category || 'Subscripcions';

      root.classList.remove('hidden');
      root.innerHTML = `
        <div class="ai-modal-card bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200 w-full max-w-md mx-auto overflow-hidden">
          <div class="px-6 py-6 border-b border-slate-200">
            <p class="font-display font-800 text-xl text-ink mb-1">Afegir despesa fixa mensual</p>
            <p class="font-body text-sm text-ink-muted">Vols afegir aquesta despesa al teu pressupost?</p>
          </div>
          <div class="px-6 py-5 bg-surface space-y-3">
            <div class="rounded-2xl border border-brand-200 bg-brand-50 p-4 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-display font-700 text-xs text-ink-muted uppercase tracking-wide">Nom</span>
                <span class="font-display font-700 text-sm text-ink">${escapeHtml(expenseData.name)}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-display font-700 text-xs text-ink-muted uppercase tracking-wide">Import</span>
                <span class="font-display font-800 text-sm text-brand-600">${escapeHtml(priceStr)}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-display font-700 text-xs text-ink-muted uppercase tracking-wide">Categoria</span>
                <span class="font-display font-700 text-sm text-ink-muted">${escapeHtml(category)}</span>
              </div>
            </div>
            <p class="font-body text-xs text-ink-muted/70">S'afegirà com a despesa fixa al formulari de pressupost actual. Podràs editar-la o eliminar-la des de la secció Pressupost.</p>
          </div>
          <div class="px-6 py-5 bg-white flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3">
            <button id="ai-modal-cancel" class="w-full sm:w-auto rounded-2xl border border-ink-muted/15 bg-surface px-4 py-3 text-sm font-semibold text-ink-muted hover:border-brand-300">Cancel·lar</button>
            <button id="ai-modal-confirm" class="w-full sm:w-auto rounded-2xl px-4 py-3 text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700">Afegir despesa</button>
          </div>
        </div>`;

      const cancelBtn = document.getElementById('ai-modal-cancel');
      const confirmBtn = document.getElementById('ai-modal-confirm');
      setTimeout(() => root.classList.add('ai-modal-visible'), 10);

      cancelBtn.onclick = closeAIModal;
      confirmBtn.onclick = () => {
        closeAIModal();
        createMonthlyExpenseUsingExistingBudgetSystem(expenseData);
      };
      root.onclick = event => { if (event.target === root) closeAIModal(); };
      _aiModalKeyHandler = event => {
        if (event.key === 'Escape') closeAIModal();
        if (event.key === 'Enter') { event.preventDefault(); closeAIModal(); createMonthlyExpenseUsingExistingBudgetSystem(expenseData); }
      };
      document.addEventListener('keydown', _aiModalKeyHandler);
    }

    /**
     * Crea la despesa reutilitzant el sistema existent de despesesDades + renderDespeses.
     * NO modifica la lògica de pressupost, simplement afegeix una entrada com faria l'usuari manualment.
     */
    function createMonthlyExpenseUsingExistingBudgetSystem(expenseData) {
      // Usem el mateix format que despesesDades: { id, nom, import }
      const nouId = Date.now();
      despesesDades.push({
        id: nouId,
        nom: expenseData.name,
        import: String(expenseData.amount),
      });

      // Renderitzem la llista (igual que afegirDespesa() i renderDespeses())
      renderDespeses();

      // Mostrem modal d'èxit amb botons de navegació
      openAIExpenseInfoModal({
        title: 'Despesa afegida! ✓',
        body: `"${expenseData.name}" s'ha afegit correctament al teu pressupost com a despesa fixa mensual.`,
        btnText: 'Veure pressupost',
        onConfirm: () => showView('pressupost'),
        secondaryBtnText: 'Continuar parlant',
        onSecondary: () => { /* simplement tanquem */ },
      });
    }

    /**
     * Modal informatiu genèric per a l'assessor (sense input).
     */
    function openAIExpenseInfoModal({ title, body, btnText, onConfirm, secondaryBtnText, onSecondary }) {
      const root = document.getElementById('ai-modal-root');
      if (!root) return;
      closeAIModal();
      root.classList.remove('hidden');

      const secondaryHTML = secondaryBtnText
        ? `<button id="ai-expense-secondary" class="w-full sm:w-auto rounded-2xl border border-ink-muted/15 bg-surface px-4 py-3 text-sm font-semibold text-ink-muted hover:border-brand-300">${escapeHtml(secondaryBtnText)}</button>`
        : '';

      root.innerHTML = `
        <div class="ai-modal-card bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200 w-full max-w-md mx-auto overflow-hidden">
          <div class="px-6 py-6 border-b border-slate-200">
            <p class="font-display font-800 text-xl text-ink mb-1">${escapeHtml(title)}</p>
            <p class="font-body text-sm text-ink-muted">${escapeHtml(body)}</p>
          </div>
          <div class="px-6 py-5 bg-white flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3">
            ${secondaryHTML}
            <button id="ai-expense-confirm" class="w-full sm:w-auto rounded-2xl px-4 py-3 text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700">${escapeHtml(btnText)}</button>
          </div>
        </div>`;

      setTimeout(() => root.classList.add('ai-modal-visible'), 10);
      const confirmBtn = document.getElementById('ai-expense-confirm');
      const secondaryBtn = document.getElementById('ai-expense-secondary');
      if (confirmBtn) confirmBtn.onclick = () => { closeAIModal(); onConfirm && onConfirm(); };
      if (secondaryBtn) secondaryBtn.onclick = () => { closeAIModal(); onSecondary && onSecondary(); };
      root.onclick = event => { if (event.target === root) closeAIModal(); };
      _aiModalKeyHandler = event => { if (event.key === 'Escape') closeAIModal(); };
      document.addEventListener('keydown', _aiModalKeyHandler);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // ══════════════════════════════════════════════
    //  MÒDUL PRESSUPOST
    // ══════════════════════════════════════════════

    // Despeses per defecte
    const DESPESES_DEFECTE = [
      { nom: 'Lloguer / Residència', import: '' },
      { nom: 'Transport', import: '' },
      { nom: 'Alimentació', import: '' },
      { nom: 'Oci i altres', import: '' },
    ];

    // Serveis de referència per a recomanacions (preu mensual estimat)
    const SERVEIS_RECOMANATS = [
      { nom: 'Gimnàs bàsic', preu: 25, icona: 'dumbbell', descripcio: 'Centres low-cost com VivaGym o Altafit' },
      { nom: 'Transport públic T-Casual', preu: 11.35, icona: 'bus', descripcio: 'T-Casual Barcelona (10 viatges)' },
      { nom: 'Abonament T-Usual', preu: 40, icona: 'train', descripcio: 'Viatges il·limitats zona 1 Barcelona' },
      { nom: 'Streaming (bàsic)', preu: 7.99, icona: 'tv', descripcio: 'Plataformes de streaming amb pla econòmic' },
      { nom: 'Gimnàs premium', preu: 50, icona: 'activity', descripcio: 'Centres amb SPA i classes dirigides' },
      { nom: 'Bicicleta Bicing', preu: 47.16, icona: 'bike', descripcio: 'Abonament anual Bicing (3.93€/mes)' },
    ];

    let despesesDades = [];

    function fmt(val) {
      return val.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }

    function initDespesesPerDefecte() {
      despesesDades = DESPESES_DEFECTE.map((d, i) => ({ id: i, nom: d.nom, import: d.import }));
      renderDespeses();
    }

    function renderDespeses() {
      const container = document.getElementById('despeses-container');
      container.innerHTML = '';
      despesesDades.forEach(d => {
        const row = document.createElement('div');
        row.className = 'space-y-1';
        row.innerHTML = `
          <div class="flex items-center gap-2">
            <input
              type="text"
              value="${d.nom}"
              placeholder="Nom de la despesa"
              oninput="actualitzarNomDespesa(${d.id}, this.value)"
              class="flex-1 h-11 rounded-xl border-2 border-red-100 bg-red-50/30 px-4 font-body text-sm text-ink placeholder-red-300 focus:outline-none focus:border-red-300 focus:bg-white transition-colors"
            />
            <div class="relative w-32">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 font-display font-700 text-ink-muted text-xs">€</span>
              <input
                type="number"
                min="0"
                max="99999"
                step="any"
                value="${d.import}"
                placeholder="0"
                oninput="validarPressupost(this);validarNegatiu(this,'error-despesa-${d.id}');actualitzarImportDespesa(${d.id}, this.value)"
                class="w-full h-11 rounded-xl border-2 border-red-100 bg-red-50/30 pl-7 pr-3 font-body text-sm text-ink placeholder-red-300 focus:outline-none focus:border-red-300 focus:bg-white transition-colors"
              />
            </div>
            <button onclick="eliminarDespesa(${d.id})" class="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0" title="Eliminar">
              <i data-lucide="x" class="w-4 h-4 text-red-400"></i>
            </button>
          </div>
          <p id="error-despesa-${d.id}" class="hidden font-body text-xs text-red-500 font-600 pl-1">No es permeten números negatius</p>`;
        container.appendChild(row);
      });
      if (window.lucide) lucide.createIcons();
      actualitzarTotalDespeses();
    }

    function afegirDespesa() {
      const nouId = Date.now();
      despesesDades.push({ id: nouId, nom: '', import: '' });
      renderDespeses();
      // Focus al nou input de nom
      const inputs = document.querySelectorAll('#despeses-container input[type="text"]');
      if (inputs.length > 0) inputs[inputs.length - 1].focus();
    }

    let ultimaDespesaEliminada = null;
    let timerDesfer = null;

    function eliminarDespesa(id) {
      const idx = despesesDades.findIndex(d => d.id === id);
      if (idx !== -1) {
        ultimaDespesaEliminada = { idx, data: despesesDades[idx] };
        despesesDades.splice(idx, 1);
        renderDespeses();
        
        // Show undo toast
        const toast = document.getElementById('undo-toast');
        toast.classList.remove('hidden');
        toast.classList.add('flex');
        
        clearTimeout(timerDesfer);
        timerDesfer = setTimeout(() => {
          toast.classList.add('hidden');
          toast.classList.remove('flex');
          ultimaDespesaEliminada = null;
        }, 5000);
      }
    }

    function desferEliminacio() {
      if (ultimaDespesaEliminada) {
        despesesDades.splice(ultimaDespesaEliminada.idx, 0, ultimaDespesaEliminada.data);
        ultimaDespesaEliminada = null;
        renderDespeses();
        
        const toast = document.getElementById('undo-toast');
        toast.classList.add('hidden');
        toast.classList.remove('flex');
        clearTimeout(timerDesfer);
      }
    }

    function validarNegatiu(input, errorId) {
      const val = parseFloat(input.value);
      const isNeg = !isNaN(val) && val < 0;
      document.getElementById(errorId).classList.toggle('hidden', !isNeg);
      input.style.borderColor = isNeg ? '#ef4444' : '';
    }

    window.MAX_INGRESSOS = 999999999;
    window.MAX_PRESSUPOST = 99999;

    window.validarIngressos = function(input) {
      const val = parseFloat(input.value);
      const errorEl = document.getElementById('error-ingressos');
      if (!isNaN(val) && val > window.MAX_INGRESSOS) {
        input.value = window.MAX_INGRESSOS;
        errorEl.classList.remove('hidden');
        input.style.borderColor = '#ef4444';
        setTimeout(() => {
          errorEl.classList.add('hidden');
          input.style.borderColor = '';
        }, 3000);
      } else {
        errorEl.classList.add('hidden');
        input.style.borderColor = '';
      }
    };

    window.validarPressupost = function(input) {
      const val = parseFloat(input.value);
      if (!isNaN(val) && val > window.MAX_PRESSUPOST) {
        input.value = window.MAX_PRESSUPOST;
        input.style.borderColor = '#ef4444';
        setTimeout(() => {
          input.style.borderColor = '';
        }, 3000);
      }
    };

    function teCampsNegatius() {
      const ingressos = parseFloat(document.getElementById('ingressos-nets').value);
      if (!isNaN(ingressos) && (ingressos < 0 || ingressos > window.MAX_INGRESSOS)) return true;
      const meta = parseFloat(document.getElementById('meta-estalvi').value);
      if (!isNaN(meta) && (meta < 0 || meta > window.MAX_PRESSUPOST)) return true;
      return despesesDades.some(d => {
        const v = parseFloat(d.import);
        return !isNaN(v) && (v < 0 || v > window.MAX_PRESSUPOST);
      });
    }

    function actualitzarNomDespesa(id, val) {
      const d = despesesDades.find(d => d.id === id);
      if (d) d.nom = val;
    }

    function actualitzarImportDespesa(id, val) {
      const d = despesesDades.find(d => d.id === id);
      if (d) { d.import = val; actualitzarTotalDespeses(); }
    }

    function actualitzarTotalDespeses() {
      const total = despesesDades.reduce((acc, d) => acc + (parseFloat(d.import) || 0), 0);
      document.getElementById('total-despeses-label').textContent = fmt(total);
      return total;
    }

    function calcularBalanc() {
      if (teCampsNegatius()) {
        document.getElementById('balanc-resum').classList.add('hidden');
        return;
      }
      const ingressos = parseFloat(document.getElementById('ingressos-nets').value) || 0;
      const despeses = despesesDades.reduce((acc, d) => acc + (parseFloat(d.import) || 0), 0);
      const meta = parseFloat(document.getElementById('meta-estalvi').value) || 0;
      const disponible = ingressos - despeses;
      const pct = meta > 0 ? Math.min(Math.round((disponible / meta) * 100), 100) : 0;

      // Actualitzar resum si hi ha dades
      if (ingressos > 0 || despeses > 0) {
        document.getElementById('resum-ingressos').textContent = fmt(ingressos);
        document.getElementById('resum-despeses').textContent = fmt(despeses);

        const dispEl = document.getElementById('resum-disponible');
        dispEl.textContent = fmt(disponible);
        dispEl.className = 'font-display font-800 text-xl ' + (disponible >= 0 ? 'text-brand-600' : 'text-red-500');

        document.getElementById('resum-pct').textContent = pct + '%';
        document.getElementById('barra-progres').style.width = pct + '%';
        document.getElementById('barra-progres').style.background =
          pct >= 100 ? '#16a34a' : pct >= 60 ? '#22c55e' : pct >= 30 ? '#facc15' : '#f87171';

        // Missatge de progrés
        let msg = '';
        if (meta <= 0) { msg = 'Defineix una meta d\'estalvi per veure el progrés.'; }
        else if (disponible < 0) { msg = 'Les teves despeses superen els ingressos. Revisa les despeses fixes.'; }
        else if (disponible < meta) { msg = `Et falten ${fmt(meta - disponible)} per assolir la teva meta mensual.`; }
        else { msg = `Molt bé! Pots assolir la teva meta i et sobren ${fmt(disponible - meta)} lliures aquest mes.`; }
        document.getElementById('resum-msg').textContent = msg;

        // Alerta optimització
        const alertaEl = document.getElementById('alerta-optimitzacio');
        const alertaText = document.getElementById('alerta-text');
        if (disponible < 0) {
          alertaText.textContent = `El teu balanç és negatiu (${fmt(disponible)}). Considera revisar despeses com oci o subscripcions per alliberar marge.`;
          alertaEl.classList.remove('hidden');
        } else if (meta > 0 && disponible < meta) {
          alertaText.textContent = `Per assolir la teva meta de ${fmt(meta)}, hauries de reduir les despeses o augmentar els ingressos en ${fmt(meta - disponible)}.`;
          alertaEl.classList.remove('hidden');
        } else {
          alertaEl.classList.add('hidden');
        }

        // Diagnòstic de viabilitat
        const COST_VIDA_MITJA = 1050; // Cost de vida mitjà estimat a Barcelona
        const viabilitatBloc = document.getElementById('viabilitat-bloc');
        const viabilitatBadge = document.getElementById('viabilitat-badge');
        const viabilitatText = document.getElementById('viabilitat-text');
        const viabilitatIconContainer = document.getElementById('viabilitat-icon-container');
        const viabilitatIcon = document.getElementById('viabilitat-icon');

        if (meta > 0) {
          viabilitatBloc.classList.remove('hidden');
          const margeReal = ingressos - despeses;
          const margeEstimat = ingressos - COST_VIDA_MITJA;

          if (margeReal < meta) {
            // Impossible
            viabilitatBloc.className = 'mt-3 rounded-2xl p-5 border border-red-200 bg-red-50 transition-all';
            viabilitatBadge.className = 'font-display font-700 text-xs px-2 py-0.5 rounded-full border border-red-200 bg-red-100 text-red-700';
            viabilitatBadge.textContent = 'Impossible';
            viabilitatIconContainer.className = 'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-red-100';
            viabilitatIcon.setAttribute('data-lucide', 'x-circle');
            viabilitatIcon.className = 'w-4 h-4 text-red-600';
            viabilitatText.innerHTML = `La teva meta és <b>matemàticament impossible</b> amb els ingressos i despeses actuals. Et falten ${fmt(meta - margeReal)} per assolir-la.`;
          } else if (margeEstimat < meta && despeses < COST_VIDA_MITJA) {
            // Poc realista
            viabilitatBloc.className = 'mt-3 rounded-2xl p-5 border border-amber-200 bg-amber-50 transition-all';
            viabilitatBadge.className = 'font-display font-700 text-xs px-2 py-0.5 rounded-full border border-amber-200 bg-amber-100 text-amber-700';
            viabilitatBadge.textContent = 'Poc Realista';
            viabilitatIconContainer.className = 'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-amber-100';
            viabilitatIcon.setAttribute('data-lucide', 'alert-triangle');
            viabilitatIcon.className = 'w-4 h-4 text-amber-600';
            viabilitatText.innerHTML = `Aconseguible matemàticament, però el cost de vida mitjà a la teva zona (${fmt(COST_VIDA_MITJA)}) podria dificultar-ho. Vigila les despeses imprevistes.`;
          } else {
            // Realista
            viabilitatBloc.className = 'mt-3 rounded-2xl p-5 border border-brand-200 bg-brand-50 transition-all';
            viabilitatBadge.className = 'font-display font-700 text-xs px-2 py-0.5 rounded-full border border-brand-200 bg-brand-100 text-brand-700';
            viabilitatBadge.textContent = 'Realista';
            viabilitatIconContainer.className = 'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-brand-100';
            viabilitatIcon.setAttribute('data-lucide', 'check-circle-2');
            viabilitatIcon.className = 'w-4 h-4 text-brand-600';
            viabilitatText.innerHTML = `La teva meta és <b>realista i assolible</b>. Tens un marge de seguretat suficient segons el teu pressupost.`;
          }
        } else {
          viabilitatBloc.classList.add('hidden');
        }

        // Recomanacions de serveis
        const recBloc = document.getElementById('recomanacions-bloc');
        const recLlista = document.getElementById('recomanacions-llista');
        const marge = Math.max(0, disponible - (meta > 0 ? meta : 0));
        const accessibles = SERVEIS_RECOMANATS.filter(s => s.preu <= marge);
        if (accessibles.length > 0 && ingressos > 0) {
          recLlista.innerHTML = accessibles.map(s => `
            <div class="flex items-center justify-between py-2 px-3 rounded-xl bg-white border border-brand-100">
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
                  <i data-lucide="${s.icona}" class="w-3.5 h-3.5 text-brand-600"></i>
                </div>
                <div>
                  <p class="font-display font-700 text-xs text-ink">${s.nom}</p>
                  <p class="font-body text-xs text-ink-muted/70">${s.descripcio}</p>
                </div>
              </div>
              <span class="font-display font-700 text-xs text-brand-600 ml-2 whitespace-nowrap">${fmt(s.preu)}/mes</span>
            </div>`).join('');
          if (window.lucide) lucide.createIcons();
          recBloc.classList.remove('hidden');
        } else {
          recBloc.classList.add('hidden');
        }

        document.getElementById('balanc-resum').classList.remove('hidden');
        dibuixarGrafic();
      }
    }
    
    let pressupostChartInstance = null;
    function dibuixarGrafic() {
      const chartContainer = document.getElementById('chart-container');
      const ingressos = parseFloat(document.getElementById('ingressos-nets').value) || 0;
      
      if (despesesDades.length === 0 && ingressos === 0) {
        chartContainer.classList.add('hidden');
        return;
      }
      
      chartContainer.classList.remove('hidden');
      const ctx = document.getElementById('pressupost-chart').getContext('2d');
      
      let labels = [];
      let data = [];
      let backgroundColors = [];
      
      const colors = ['#f87171', '#fbbf24', '#60a5fa', '#a78bfa', '#f472b6', '#34d399'];
      
      let totalDespeses = 0;
      despesesDades.forEach((d, index) => {
        const importDespesa = parseFloat(d.import) || 0;
        if (importDespesa > 0) {
          labels.push(d.nom || ('Despesa ' + (index+1)));
          data.push(importDespesa);
          backgroundColors.push(colors[index % colors.length]);
          totalDespeses += importDespesa;
        }
      });
      
      const restant = ingressos - totalDespeses;
      if (restant > 0) {
        labels.push('Marge disponible');
        data.push(restant);
        backgroundColors.push('#22c55e'); // brand-500
      } else if (restant < 0) {
        // Si hi ha deute, afegim una franja vermella i reduïm o eliminen l'àrea? Millor no mostrar "disponible".
      }
      
      if (pressupostChartInstance) {
        pressupostChartInstance.destroy();
      }
      
      pressupostChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                font: {
                  family: "'DM Sans', sans-serif",
                  size: 11
                },
                usePointStyle: true,
                padding: 15
              }
            }
          },
          cutout: '65%'
        }
      });
    }

    function guardarPressupost() {
      const MAX    = 100000;
      const ingEl  = document.getElementById('ingressos-nets');
      const metaEl = document.getElementById('meta-estalvi');
      const ingressos = parseFloat(ingEl.value);
      const meta      = parseFloat(metaEl.value);
      const errors = [];

      // Reset highlights
      ingEl.classList.remove('ring-2', 'ring-red-400');
      metaEl.classList.remove('ring-2', 'ring-red-400');

      // Comprova ingressos
      if (!ingressos || ingressos < 0) {
        errors.push('Els ingressos introduïts no són vàlids');
        ingEl.classList.add('ring-2', 'ring-red-400');
      }

      // Comprova meta
      if (!isNaN(meta) && meta < 0) {
        errors.push('El valor de la meta d\'estalvi no és vàlid');
        metaEl.classList.add('ring-2', 'ring-red-400');
      } else if (!isNaN(meta) && meta > MAX) {
        errors.push('El valor de la meta d\'estalvi no és vàlid');
        metaEl.classList.add('ring-2', 'ring-red-400');
      }

      // Comprova cada despesa
      despesesDades.forEach(d => {
        const v   = parseFloat(d.import);
        const nom = d.nom ? `"${d.nom}"` : 'una despesa';
        if (!isNaN(v) && (v < 0 || v > MAX)) errors.push(`El valor de la despesa ${nom} no és vàlid`);
      });

      if (errors.length > 0) {
        showGlobalToast(errors.join(' \u00b7 '), true);
        setTimeout(() => {
          ingEl.classList.remove('ring-2', 'ring-red-400');
          metaEl.classList.remove('ring-2', 'ring-red-400');
        }, 2500);
        return;
      }

      if (teCampsNegatius()) return;
      
      calcularBalanc();
      const resEl = document.getElementById('balanc-resum');
      const navH  = 64 + 16;
      const top   = resEl.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }

    function mostrarToastGuardar() {
      const toast = document.getElementById('toast-guardar');
      toast.classList.remove('hidden');
      toast.classList.add('flex');
      clearTimeout(window._toastTimer);
      window._toastTimer = setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('flex');
      }, 4000);
      if (window.lucide) lucide.createIcons();
    }

    function netejarPressupost() {
      document.getElementById('ingressos-nets').value = '';
      document.getElementById('meta-estalvi').value = '';
      initDespesesPerDefecte();
      document.getElementById('balanc-resum').classList.add('hidden');
    }

    function exportarCSV() {
      const ingressos = document.getElementById('ingressos-nets').value || 0;
      const meta = document.getElementById('meta-estalvi').value || 0;
      
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Categoria,Nom,Import\n";
      csvContent += `Ingressos,Ingressos nets,${ingressos}\n`;
      csvContent += `Meta,Meta d'estalvi,${meta}\n`;
      
      despesesDades.forEach(d => {
        csvContent += `Despesa,${d.nom || 'Sense nom'},${d.import || 0}\n`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "pressupost_smartprice.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showGlobalToast("Pressupost exportat a CSV");
    }

    async function handleComencaAra() {
      const session = await dbGetSession();
      if (session) {
        showView('pressupost');
      } else {
        showView('register');
      }
    }

    // ── MÒDUL COMPARADOR ──────────────────────────
    function initComparador() {
      const navContainer = document.getElementById('categories-nav');
      // Categories clau per mostrar
      const cats = ['supermercats', 'lloguer', 'transport', 'gimnas', 'streaming-video', 'mobil', 'internet'];

      cats.forEach((key, i) => {
        const cat = DB[key];
        if (!cat) return;
        const btn = document.createElement('button');
        btn.className = `cat-btn font-display font-600 text-sm px-4 py-2 rounded-full border transition-all ${i === 0 ? 'bg-ink text-white border-ink' : 'bg-white text-ink-muted border-ink-muted/20 hover:border-ink/50'}`;
        btn.textContent = cat.label.charAt(0).toUpperCase() + cat.label.slice(1);
        btn.onclick = () => selectCategory(key, btn);
        navContainer.appendChild(btn);
      });

      // Seleccionar la primera per defecte
      if (cats.length > 0) {
        selectCategory(cats[0], navContainer.firstElementChild);
      }
    }

    let currentCategoryKey = null;

    function selectCategory(key, btnEl) {
      currentCategoryKey = key;
      // Update active button state
      document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.className = 'cat-btn font-display font-600 text-sm px-4 py-2 rounded-full border transition-all bg-white text-ink-muted border-ink-muted/20 hover:border-ink/50 hover:bg-brand-50 hover:text-brand-700';
      });
      if (btnEl) {
        btnEl.className = 'cat-btn font-display font-600 text-sm px-4 py-2 rounded-full border transition-all bg-brand-500 text-white border-brand-500 shadow-lg transform scale-105';
      }

      const cat = DB[key];
      if (!cat) return;

      document.getElementById('comparador-results').classList.remove('hidden');
      document.getElementById('filtre-preu-container').classList.remove('hidden');
      document.getElementById('comparador-cat-title').textContent = cat.label;

      const prices = cat.options.map(o => o.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

      document.getElementById('comparador-min').textContent = fmt(min);
      document.getElementById('comparador-avg').textContent = fmt(avg);
      document.getElementById('comparador-max').textContent = fmt(max);

      // Initialize slider
      const slider = document.getElementById('comparador-max-preu');
      slider.max = Math.ceil(max);
      slider.value = slider.max;
      document.getElementById('comparador-max-preu-label').textContent = 'Tots els preus';

      renderComparadorOptions(cat.options, avg);
    }

    function filtrarComparador(maxPrice) {
      if (!currentCategoryKey) return;
      const cat = DB[currentCategoryKey];
      const slider = document.getElementById('comparador-max-preu');
      const isMax = parseFloat(maxPrice) >= parseFloat(slider.max);
      document.getElementById('comparador-max-preu-label').textContent = isMax ? 'Tots els preus' : `Fins a ${maxPrice} €`;
      
      const filtered = cat.options.filter(o => o.price <= maxPrice);
      const avg = cat.options.reduce((a, b) => a + b.price, 0) / cat.options.length;
      renderComparadorOptions(filtered, avg);
    }

    function renderComparadorOptions(options, avg) {
      const optionsContainer = document.getElementById('comparador-options');
      optionsContainer.innerHTML = '';

      if (options.length === 0) {
        optionsContainer.innerHTML = '<p class="font-body text-sm text-ink-muted col-span-full text-center py-8">No s\'han trobat opcions per sota d\'aquest preu.</p>';
        return;
      }

      options.forEach(opt => {
        let colorClass = 'text-amber-600';
        let borderClass = 'border-amber-200';
        if (opt.price <= avg * 0.9) { colorClass = 'text-brand-600'; borderClass = 'border-brand-200'; }
        else if (opt.price >= avg * 1.1) { colorClass = 'text-red-500'; borderClass = 'border-red-200'; }

        optionsContainer.innerHTML += `
          <div class="bento-card p-5 bg-white flex flex-col justify-between h-full border ${borderClass} hover:shadow-lg transition-all">
            <div>
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-display font-700 text-base text-ink">${opt.name}</h4>
                <span class="font-display font-800 text-lg ${colorClass}">${escapeHtml(opt.priceLabel)}</span>
              </div>
              <p class="font-body text-sm text-ink-muted mb-3">${escapeHtml(opt.description)}</p>
            </div>
            ${opt.badge ? `<div class="mt-auto pt-2"><span class="inline-block font-display font-700 text-xs px-2 py-1 bg-surface rounded text-ink-muted border border-ink/10">${escapeHtml(opt.badge)}</span></div>` : ''}
          </div>
        `;
      });

      if (window.lucide) lucide.createIcons();
    }

    // ── MÒDUL AUTENTICACIÓ (Mock) ─────────────────
    function showGlobalToast(msg, isError = false) {
      const toast = document.getElementById('global-toast');
      const toastMsg = document.getElementById('global-toast-msg');
      const toastIcon = document.getElementById('global-toast-icon');
      
      toastMsg.textContent = msg;
      
      if (isError) {
        toast.className = "fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-lg transform transition-all duration-300 translate-y-0 opacity-100";
        toastMsg.className = "font-body text-sm font-500 text-red-800";
        toastIcon.setAttribute('data-lucide', 'alert-circle');
        toastIcon.className = "w-5 h-5 text-red-500 flex-shrink-0";
      } else {
        toast.className = "fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 shadow-lg transform transition-all duration-300 translate-y-0 opacity-100";
        toastMsg.className = "font-body text-sm font-500 text-brand-800";
        toastIcon.setAttribute('data-lucide', 'check-circle');
        toastIcon.className = "w-5 h-5 text-brand-500 flex-shrink-0";
      }
      if (window.lucide) lucide.createIcons();
      
      clearTimeout(window._globalToastTimer);
      window._globalToastTimer = setTimeout(() => {
        toast.classList.replace('translate-y-0', 'translate-y-10');
        toast.classList.replace('opacity-100', 'opacity-0');
        setTimeout(() => {
          toast.classList.remove('flex');
          toast.classList.add('hidden');
        }, 300);
      }, 3000);
    }

    async function handleLogin(e) {
      e.preventDefault();
      const email    = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      try {
        const { user } = await dbLogin(email, password);
        const name = user.user_metadata?.full_name || email;
        showGlobalToast("Sessió iniciada correctament amb " + email);
        showView('pressupost');
        updateAuthUI(email, name);
        document.getElementById('login-form').reset();
      } catch (err) {
        if (err.message.includes('Invalid login credentials')) {
          showGlobalToast("Correu o contrasenya incorrectes.", true);
        } else if (err.message.includes('Email not confirmed')) {
          showGlobalToast("Confirma el teu correu electrònic abans d'entrar.", true);
        } else {
          showGlobalToast("Error en iniciar sessió: " + err.message, true);
        }
      }
    }

    async function handleRegister(e) {
      e.preventDefault();
      const name            = document.getElementById('register-name').value.trim();
      const email           = document.getElementById('register-email').value.trim();
      const password        = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-password-confirm')?.value;

      const pwErrors = validatePassword(password);
      if (pwErrors.length > 0) {
        showGlobalToast('La contrasenya no compleix els requisits: ' + pwErrors[0], true);
        document.getElementById('register-password').focus();
        return;
      }

      if (confirmPassword !== undefined && password !== confirmPassword) {
        showGlobalToast('Les contrasenyes no coincideixen.', true);
        document.getElementById('register-password-confirm').focus();
        return;
      }

      try {
        await dbRegister(name, email, password);
        showGlobalToast('Compte creat correctament per a ' + name + '! Comprova el teu correu per confirmar el compte.');
        showView('login');
        document.getElementById('register-form').reset();
        checkPasswordStrength('');
      } catch (err) {
        if (err.message.includes('already registered') || err.message.includes('already been registered')) {
          showGlobalToast('Aquest correu ja està registrat.', true);
        } else {
          showGlobalToast('Error en crear compte: ' + err.message, true);
        }
      }
    }
    
    // ── VALIDACIÓ DE CONTRASENYA ────────────────────
    function validatePassword(password) {
      const errors = [];
      if (password.length < 8)       errors.push('mínim 8 caràcters');
      if (!/[A-Z]/.test(password))   errors.push('almenys 1 majúscula');
      if (!/[a-z]/.test(password))   errors.push('almenys 1 minúscula');
      if (!/[\d\W_]/.test(password)) errors.push('almenys 1 número o símbol');
      return errors;
    }

    function checkPasswordStrength(val) {
      const bar  = document.getElementById('password-strength-bar');
      const reqs = document.getElementById('password-requirements');
      if (!bar || !reqs) return;

      if (!val) {
        bar.classList.add('hidden');
        reqs.classList.add('hidden');
        return;
      }
      bar.classList.remove('hidden');
      reqs.classList.remove('hidden');

      const checks = {
        length: val.length >= 8,
        upper:  /[A-Z]/.test(val),
        lower:  /[a-z]/.test(val),
        number: /[\d\W_]/.test(val),
      };

      // Actualitza icones de requisits
      Object.entries(checks).forEach(([key, pass]) => {
        const el   = document.getElementById('req-' + key);
        if (!el) return;
        const icon = el.querySelector('.req-icon');
        el.className = 'font-body text-xs flex items-center gap-1.5 transition-colors ' +
          (pass ? 'text-brand-600' : 'text-ink-muted/60');
        if (icon) icon.textContent = pass ? '\u2713' : '\u25cb';
      });

      // Barra de força
      const score = Object.values(checks).filter(Boolean).length;
      const segColors = { 1: '#f87171', 2: '#fbbf24', 3: '#fbbf24', 4: '#22c55e' };
      ['strength-seg-1','strength-seg-2','strength-seg-3','strength-seg-4'].forEach((id, i) => {
        const seg = document.getElementById(id);
        if (seg) seg.style.backgroundColor = i < score ? (segColors[score] || '') : '';
      });

      const labelEl = document.getElementById('strength-label');
      const labels  = { 1: 'Molt feble', 2: 'Feble', 3: 'Bona', 4: 'Forta' };
      const lcls    = { 1: 'text-red-400', 2: 'text-amber-500', 3: 'text-amber-500', 4: 'text-brand-600' };
      if (labelEl) {
        labelEl.textContent = labels[score] || '';
        labelEl.className   = 'font-body text-xs ' + (lcls[score] || 'text-ink-muted/70');
      }
    }

    // ── RECUPERACIÓ DE CONTRASENYA ────────────────
    function toggleRecoveryPanel() {
      const panel = document.getElementById('recovery-panel');
      if (!panel) return;
      panel.classList.toggle('hidden');
      if (!panel.classList.contains('hidden')) {
        const form    = document.getElementById('recovery-form');
        const success = document.getElementById('recovery-success');
        if (form)    form.classList.remove('hidden');
        if (success) { success.classList.add('hidden'); success.classList.remove('flex'); }
        const emailInput = document.getElementById('recovery-email');
        if (emailInput) { emailInput.value = ''; emailInput.focus(); }
        if (window.lucide) lucide.createIcons();
      }
    }

    function handleRecovery(e) {
      e.preventDefault();
      const email   = document.getElementById('recovery-email').value.trim();
      const form    = document.getElementById('recovery-form');
      const success = document.getElementById('recovery-success');
      const msg     = document.getElementById('recovery-success-msg');

      form.classList.add('hidden');
      success.classList.remove('hidden');
      success.classList.add('flex');
      msg.textContent = `Si existeix un compte associat a ${email}, rebràs les instruccions de recuperació en breus moments. Comprova també la carpeta de spam.`;
      if (window.lucide) lucide.createIcons();
    }

    async function checkSession() {
      const session = await dbGetSession();
      if (session) {
        const email = session.user.email;
        const name  = session.user.user_metadata?.full_name || email;
        const metes = session.user.user_metadata?.metes;
        if (metes && Array.isArray(metes)) {
          metesDades = metes;
          localStorage.setItem('smartprice_metes', JSON.stringify(metesDades));
        }
        updateAuthUI(email, name);
      }
    }

    function updateAuthUI(email, name) {
      const authDesktop  = document.getElementById('auth-desktop');
      const authMobile   = document.getElementById('auth-mobile');
      const displayLabel = name && name !== email ? name : email;

      const loggedInDesktop = `
        <div class="flex items-center gap-3">
          <span class="font-display font-600 text-sm text-ink-muted">${displayLabel}</span>
          <button onclick="logout()" class="font-display font-600 text-sm text-red-500 hover:text-red-600 transition-colors px-3 py-1.5 border border-red-200 hover:border-red-300 rounded-full bg-red-50">Tancar sessió</button>
        </div>
      `;

      const loggedInMobile = `
        <div class="flex gap-2 pt-2 pb-1 flex-col">
          <span class="font-display font-600 text-sm text-ink-muted text-center">${displayLabel}</span>
          <button onclick="logout();toggleMenu()" class="w-full font-display font-600 text-sm text-red-500 border border-red-200 rounded-full py-2 hover:bg-red-50 transition-colors">Tancar sessió</button>
        </div>
      `;

      if (authDesktop) authDesktop.innerHTML = loggedInDesktop;
      if (authMobile)  authMobile.innerHTML  = loggedInMobile;
    }

    async function logout() {
      try { 
        await dbLogout(); 
      } catch (err) { 
        console.error('Error tancant sessió:', err); 
      }

      // Esborrar la memòria cau local perquè no quedi informació de l'usuari
      localStorage.removeItem('smartprice_pressupost');
      localStorage.removeItem('smartprice_metes');
      localStorage.removeItem('smartprice_ai_state');
      
      // Recarregar la pàgina per netejar completament l'aplicació i les variables
      window.location.reload();
    }


    // ══════════════════════════════════════════════
    //  MÒDUL MODAL DESAR PRESSUPOST
    // ══════════════════════════════════════════════

    const MESOS_CA = ['Gener','Febrer','Març','Abril','Maig','Juny','Juliol','Agost','Setembre','Octubre','Novembre','Desembre'];

    function obrirModalDesar() {
      const ingressos = parseFloat(document.getElementById('ingressos-nets').value) || 0;
      if (ingressos <= 0) {
        showGlobalToast('Primer calcula el pressupost abans de desar-lo.', true);
        return;
      }
      // Omplir selector d'anys (any actual i 2 anteriors)
      const anySelect = document.getElementById('desar-any');
      if (anySelect && !anySelect.options.length) {
        const ara = new Date().getFullYear();
        for (let y = ara; y >= ara - 2; y--) {
          const opt = document.createElement('option');
          opt.value = y; opt.textContent = y;
          anySelect.appendChild(opt);
        }
      }
      // Preseleccionar mes actual
      const mesSelect = document.getElementById('desar-mes');
      if (mesSelect) mesSelect.value = new Date().getMonth() + 1;
      // Netejar nom
      const nomInput = document.getElementById('desar-nom');
      if (nomInput) nomInput.value = '';

      const modal = document.getElementById('modal-desar');
      if (modal) { modal.classList.remove('hidden'); if (window.lucide) lucide.createIcons(); }
    }

    function tancarModalDesar() {
      const modal = document.getElementById('modal-desar');
      if (modal) modal.classList.add('hidden');
    }

    async function confirmarDesar() {
      const user = await dbGetUser();
      if (!user) {
        showGlobalToast('Cal iniciar sessió per desar pressupostos.', true);
        tancarModalDesar();
        showView('login');
        return;
      }

      const ingressos     = parseFloat(document.getElementById('ingressos-nets').value) || 0;
      const meta          = parseFloat(document.getElementById('meta-estalvi').value) || 0;
      const totalDespeses = despesesDades.reduce((acc, d) => acc + (parseFloat(d.import) || 0), 0);
      const balanc        = ingressos - totalDespeses;
      const mes           = parseInt(document.getElementById('desar-mes').value);
      const year          = parseInt(document.getElementById('desar-any').value);
      const nom           = document.getElementById('desar-nom').value.trim();

      const btn = document.getElementById('btn-confirmar-desar');
      if (btn) { btn.disabled = true; btn.textContent = 'Desant...'; }

      try {
        await dbSavePressupost({ ingressos, metaEstalvi: meta, despeses: despesesDades, totalDespeses, balanc, nom, mes, year });
        tancarModalDesar();
        mostrarToastGuardar();
      } catch (err) {
        showGlobalToast('Error en desar: ' + err.message, true);
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="save" class="w-4 h-4 inline mr-2"></i>Desar a la base de dades'; if (window.lucide) lucide.createIcons(); }
      }
    }


    // ══════════════════════════════════════════════
    //  MÒDUL HISTORIAL
    // ══════════════════════════════════════════════

    async function initHistorial() {
      const elNoAuth  = document.getElementById('historial-no-auth');
      const elLoading = document.getElementById('historial-loading');
      const elEmpty   = document.getElementById('historial-empty');
      const elList    = document.getElementById('historial-list');
      if (!elList) return;

      [elNoAuth, elLoading, elEmpty, elList].forEach(el => el && el.classList.add('hidden'));

      const user = await dbGetUser();
      if (!user) { elNoAuth && elNoAuth.classList.remove('hidden'); return; }

      elLoading && elLoading.classList.remove('hidden');

      try {
        const pressupostos = await dbGetPressupostos();
        elLoading && elLoading.classList.add('hidden');

        if (!pressupostos.length) { elEmpty && elEmpty.classList.remove('hidden'); return; }

        elList.innerHTML = '';
        for (const p of pressupostos) {
          const avaluacio = await dbGetAvaluacioByPressupost(p.id);
          elList.appendChild(crearTarjetaHistorial(p, avaluacio));
        }
        elList.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
      } catch (err) {
        elLoading && elLoading.classList.add('hidden');
        showGlobalToast('Error carregant historial: ' + err.message, true);
      }
    }

    function crearTarjetaHistorial(p, avaluacio) {
      const mesNom = p.mes ? MESOS_CA[p.mes - 1] : '';
      const period = mesNom && p.year ? `${mesNom} ${p.year}` : '';
      const titol  = p.nom ? (period ? `${p.nom} — ${period}` : p.nom) : (period || 'Pressupost');
      const data   = new Date(p.created_at).toLocaleDateString('ca-ES');

      const avaluat = avaluacio !== null;
      let badgeHtml = '';
      if (avaluat) {
        badgeHtml = avaluacio.ha_estalviat
          ? `<span class="flex-shrink-0 font-display font-600 text-xs px-3 py-1 rounded-full bg-brand-50 text-brand-600 border border-brand-200">✓ Ha estalviat</span>`
          : `<span class="flex-shrink-0 font-display font-600 text-xs px-3 py-1 rounded-full bg-red-50 text-red-500 border border-red-200">✗ No ha estalviat</span>`;
      } else {
        badgeHtml = `<button onclick="obrirModalAvaluacio('${p.id}','${titol.replace(/'/g,"\\'")}')"
          class="flex-shrink-0 font-display font-600 text-xs px-3 py-1.5 rounded-full border border-ink-muted/20 text-ink-muted hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all">
          Avaluar mes
        </button>`;
      }

      let extraHtml = '';
      if (avaluat && !avaluacio.ha_estalviat && (avaluacio.motiu || avaluacio.falta_import)) {
        extraHtml = `<div class="mt-3 p-3 bg-red-50 rounded-xl border border-red-100 space-y-1">
          ${avaluacio.falta_import ? `<p class="font-display font-600 text-xs text-red-500">Ha faltat: ${fmt(avaluacio.falta_import)}</p>` : ''}
          ${avaluacio.motiu ? `<p class="font-body text-xs text-red-600 italic">"${avaluacio.motiu}"</p>` : ''}
        </div>`;
      }

      const card = document.createElement('div');
      card.id = 'card-' + p.id;
      card.className = 'bento-card p-6';
      card.innerHTML = `
        <div class="flex items-start justify-between gap-4 mb-4">
          <div class="flex-1 min-w-0">
            <h3 class="font-display font-700 text-base text-ink">${titol}</h3>
            <p class="font-body text-xs text-ink-muted mt-0.5">Desat el ${data}</p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            ${badgeHtml}
            <div id="del-${p.id}" class="relative">
              <button onclick="iniciarEliminar('${p.id}')"
                class="p-2 text-ink-muted/40 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all"
                title="Eliminar pressupost">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-brand-50/60 rounded-xl p-3 text-center">
            <p class="font-body text-xs text-ink-muted mb-1">Ingressos</p>
            <p class="font-display font-700 text-sm text-brand-600">${fmt(p.ingressos)}</p>
          </div>
          <div class="bg-red-50/60 rounded-xl p-3 text-center">
            <p class="font-body text-xs text-ink-muted mb-1">Despeses</p>
            <p class="font-display font-700 text-sm text-red-500">${fmt(p.total_despeses)}</p>
          </div>
          <div class="rounded-xl p-3 text-center ${p.balanc >= 0 ? 'bg-emerald-50/60' : 'bg-red-50/60'}">
            <p class="font-body text-xs text-ink-muted mb-1">Balanç</p>
            <p class="font-display font-700 text-sm ${p.balanc >= 0 ? 'text-emerald-600' : 'text-red-500'}">${fmt(p.balanc)}</p>
          </div>
        </div>
        ${p.meta_estalvi > 0 ? `<div class="mt-3 pt-3 border-t border-ink-muted/10 flex justify-between items-center">
          <span class="font-body text-xs text-ink-muted">Meta d'estalvi</span>
          <span class="font-display font-600 text-xs text-violet-600">${fmt(p.meta_estalvi)}</span>
        </div>` : ''}
        ${extraHtml}
      `;
      return card;
    }


    function iniciarEliminar(id) {
      const container = document.getElementById('del-' + id);
      if (!container) return;
      container.innerHTML = `
        <div class="flex items-center gap-1 bg-red-50 border border-red-200 rounded-xl px-2 py-1">
          <span class="font-body text-xs text-red-500">Eliminar?</span>
          <button onclick="confirmarEliminar('${id}')" class="font-display font-700 text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-lg transition-colors">Sí</button>
          <button onclick="cancelarEliminar('${id}')" class="font-display font-600 text-xs text-ink-muted hover:text-ink px-1 py-0.5 rounded-lg transition-colors">No</button>
        </div>`;
    }

    function cancelarEliminar(id) {
      const container = document.getElementById('del-' + id);
      if (!container) return;
      container.innerHTML = `
        <button onclick="iniciarEliminar('${id}')"
          class="p-2 text-ink-muted/40 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all"
          title="Eliminar pressupost">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>`;
      if (window.lucide) lucide.createIcons();
    }

    async function confirmarEliminar(id) {
      try {
        await dbDeletePressupost(id);
        const card = document.getElementById('card-' + id);
        if (card) card.remove();
        const list = document.getElementById('historial-list');
        if (list && !list.children.length) {
          list.classList.add('hidden');
          document.getElementById('historial-empty')?.classList.remove('hidden');
        }
        showGlobalToast('Pressupost eliminat.');
      } catch (err) {
        showGlobalToast('Error en eliminar: ' + err.message, true);
      }
    }

    // ══════════════════════════════════════════════
    //  MÒDUL MODAL AVALUACIÓ
    // ══════════════════════════════════════════════

    let _avaluacioPressupostId = null;
    let _avaluacioSeleccio     = null;

    function obrirModalAvaluacio(pressupostId, nom) {
      _avaluacioPressupostId = pressupostId;
      _avaluacioSeleccio     = null;
      const nomEl = document.getElementById('modal-avaluacio-nom');
      if (nomEl) nomEl.textContent = nom;
      document.getElementById('avaluacio-extra')?.classList.add('hidden');
      document.getElementById('falta-import') && (document.getElementById('falta-import').value = '');
      document.getElementById('motiu-text')   && (document.getElementById('motiu-text').value   = '');
      ['btn-avaluacio-si','btn-avaluacio-no'].forEach(id => {
        const b = document.getElementById(id);
        if (b) b.className = 'flex-1 font-display font-600 text-sm py-3 rounded-2xl border-2 border-ink-muted/20 text-ink-muted transition-all';
      });
      document.getElementById('btn-guardar-avaluacio').disabled = true;
      const modal = document.getElementById('modal-avaluacio');
      if (modal) { modal.classList.remove('hidden'); if (window.lucide) lucide.createIcons(); }
    }

    function tancarModalAvaluacio() {
      const modal = document.getElementById('modal-avaluacio');
      if (modal) modal.classList.add('hidden');
      _avaluacioPressupostId = null;
      _avaluacioSeleccio     = null;
    }

    function seleccionarEstalvi(valor) {
      _avaluacioSeleccio = valor;
      const btnSi = document.getElementById('btn-avaluacio-si');
      const btnNo = document.getElementById('btn-avaluacio-no');
      const extra = document.getElementById('avaluacio-extra');
      const btnGuardar = document.getElementById('btn-guardar-avaluacio');

      if (valor) {
        btnSi.className = 'flex-1 font-display font-600 text-sm py-3 rounded-2xl border-2 border-brand-400 bg-brand-50 text-brand-600 transition-all';
        btnNo.className = 'flex-1 font-display font-600 text-sm py-3 rounded-2xl border-2 border-ink-muted/20 text-ink-muted transition-all';
        extra && extra.classList.add('hidden');
      } else {
        btnNo.className = 'flex-1 font-display font-600 text-sm py-3 rounded-2xl border-2 border-red-300 bg-red-50 text-red-500 transition-all';
        btnSi.className = 'flex-1 font-display font-600 text-sm py-3 rounded-2xl border-2 border-ink-muted/20 text-ink-muted transition-all';
        extra && extra.classList.remove('hidden');
      }
      if (btnGuardar) btnGuardar.disabled = false;
    }

    async function guardarAvaluacio() {
      if (_avaluacioSeleccio === null || !_avaluacioPressupostId) return;
      const faltaImport = parseFloat(document.getElementById('falta-import')?.value) || null;
      const motiu       = document.getElementById('motiu-text')?.value.trim() || null;
      const btn = document.getElementById('btn-guardar-avaluacio');
      if (btn) { btn.disabled = true; btn.textContent = 'Guardant...'; }
      try {
        await dbSaveAvaluacio({ pressupostId: _avaluacioPressupostId, haEstalviat: _avaluacioSeleccio, faltaImport, motiu });
        tancarModalAvaluacio();
        showGlobalToast('Avaluació guardada correctament!');
        initHistorial();
      } catch (err) {
        showGlobalToast('Error en guardar: ' + err.message, true);
        if (btn) { btn.disabled = false; btn.textContent = 'Guardar avaluació'; }
      }
    }


    // ══════════════════════════════════════════════
    //  MÒDUL COMPTE
    // ══════════════════════════════════════════════

    async function initCompte() {
      const elNoAuth  = document.getElementById('compte-no-auth');
      const elContent = document.getElementById('compte-content');
      if (!elContent) return;

      const user = await dbGetUser();
      if (!user) {
        elNoAuth  && elNoAuth.classList.remove('hidden');
        elContent && elContent.classList.add('hidden');
        return;
      }
      elNoAuth  && elNoAuth.classList.add('hidden');
      elContent && elContent.classList.remove('hidden');

      const name    = user.user_metadata?.full_name || '';
      const email   = user.email || '';
      const initials = (name || email).charAt(0).toUpperCase();

      const el = id => document.getElementById(id);
      if (el('compte-initials')) el('compte-initials').textContent = initials;
      if (el('compte-name'))     el('compte-name').textContent     = name || '(sense nom)';
      if (el('compte-email'))    el('compte-email').textContent    = email;
      if (el('compte-new-name')) el('compte-new-name').value       = name;

      try {
        const stats = await dbGetStats();
        if (el('stat-total'))        el('stat-total').textContent        = stats.total;
        if (el('stat-avg-balanc'))   el('stat-avg-balanc').textContent   = fmt(stats.avgBalanc);
        if (el('stat-avg-estalvi'))  el('stat-avg-estalvi').textContent  = fmt(stats.avgEstalvi);
        if (el('stat-avaluacions'))  el('stat-avaluacions').textContent  = stats.totalAvaluacions;
      } catch {}

      if (window.lucide) lucide.createIcons();
    }

    async function carregarStatsPublics() {
      try {
        const s = await dbGetPublicStats();
        const elU = document.getElementById('stat-inici-usuaris');
        const elE = document.getElementById('stat-inici-estalvi');
        const elS = document.getElementById('stat-inici-satisfaccio');
        if (elU) elU.textContent = s.total_users > 0 ? s.total_users + '+' : '0';
        if (elE) elE.textContent = s.avg_estalvi > 0 ? '€' + Math.round(s.avg_estalvi) : '—';
        if (elS) elS.textContent = s.pct_satisfaccio > 0 ? s.pct_satisfaccio + '%' : '—';
      } catch {}
    }

    async function canviarNom() {
      const newName = document.getElementById('compte-new-name')?.value.trim();
      if (!newName) { showGlobalToast('El nom no pot estar buit.', true); return; }
      try {
        await dbUpdateUserName(newName);
        showGlobalToast('Nom actualitzat correctament!');
        initCompte();
        const session = await dbGetSession();
        if (session) updateAuthUI(session.user.email, newName);
      } catch (err) {
        showGlobalToast('Error: ' + err.message, true);
      }
    }


    // ══════════════════════════════════════════════
    //  MÒDUL METES (PROJECTES DE FUTUR)
    // ══════════════════════════════════════════════
    
    let metesDades = JSON.parse(localStorage.getItem('smartprice_metes') || '[]');
    let ritmeEstalviMensual = 0;

    // Sincronitza les metes a localStorage i, si l'usuari està registrat, a Supabase
    async function syncMetesDades() {
      localStorage.setItem('smartprice_metes', JSON.stringify(metesDades));
      const session = await dbGetSession();
      if (session) {
        try { await dbSaveMetes(metesDades); } catch(e) {}
      }
    }

    async function initMetes() {
      // 1. Prioritzar el valor actual del DOM (per si l'usuari està fent proves sense desar)
      const metaDom = parseFloat(document.getElementById('meta-estalvi').value);
      if (!isNaN(metaDom) && metaDom > 0) {
        ritmeEstalviMensual = metaDom;
      } else {
        // 2. Si el DOM està buit, intentar obtenir l'últim pressupost desat a la BD
        try {
          const lastP = await dbGetLastPressupost();
          if (lastP && lastP.meta_estalvi > 0) {
            ritmeEstalviMensual = lastP.meta_estalvi;
          } else {
            ritmeEstalviMensual = 0;
          }
        } catch(e) {
          ritmeEstalviMensual = 0;
        }
      }
      
      document.getElementById('metes-ritme-estalvi').textContent = fmt(ritmeEstalviMensual).replace(' €','');
      renderMetes();
    }

    async function afegirNovaMeta() {
      const nomInput = document.getElementById('meta-nom');
      const costInput = document.getElementById('meta-cost');
      const actualInput = document.getElementById('meta-actual');
      
      const nom = nomInput.value.trim();
      const cost = parseFloat(costInput.value);
      const actual = parseFloat(actualInput.value) || 0;
      
      if (!nom || isNaN(cost) || cost <= 0) {
        showGlobalToast("Has d'indicar un nom i un cost total vàlid", true);
        return;
      }
      if (actual < 0 || actual > cost) {
        showGlobalToast("L'import estalviat no pot ser negatiu ni superior al cost total", true);
        return;
      }
      
      metesDades.push({
        id: Date.now(),
        nom,
        cost,
        actual
      });
      
      await syncMetesDades();
      
      nomInput.value = '';
      costInput.value = '';
      actualInput.value = '0';
      
      showGlobalToast(`S'ha afegit "${nom}" a les teves metes`);
      renderMetes();
    }

    async function eliminarMeta(id) {
      metesDades = metesDades.filter(m => m.id !== id);
      await syncMetesDades();
      renderMetes();
    }

    async function sumarDinersMeta(id) {
      const meta = metesDades.find(m => m.id === id);
      if (!meta) return;
      
      const text = window.prompt(`Quants diners vols afegir a la meta "${meta.nom}"?\n(Actualment tens ${fmt(meta.actual)} estalviats)`);
      if (!text) return;
      
      const importAAfegir = parseFloat(text.replace(',', '.'));
      if (isNaN(importAAfegir) || importAAfegir <= 0) {
        showGlobalToast("L'import afegit no és vàlid", true);
        return;
      }
      
      meta.actual += importAAfegir;
      if (meta.actual > meta.cost) meta.actual = meta.cost;
      
      await syncMetesDades();
      showGlobalToast(`Has sumat ${fmt(importAAfegir)} a la teva meta! 🎉`);
      renderMetes();
    }

    function renderMetes() {
      const container = document.getElementById('metes-llista');
      
      if (metesDades.length === 0) {
        container.innerHTML = `
          <div class="text-center py-12 border-2 border-dashed border-ink-muted/20 rounded-2xl">
            <div class="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mx-auto mb-3">
              <i data-lucide="star" class="w-6 h-6 text-ink-muted/40"></i>
            </div>
            <p class="font-body text-sm text-ink-muted">Encara no has afegit cap meta.</p>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }
      
      container.innerHTML = '';
      
      metesDades.forEach(meta => {
        const pct = Math.min(Math.round((meta.actual / meta.cost) * 100), 100);
        const falta = meta.cost - meta.actual;
        
        let previsioMsg = '';
        if (falta <= 0) {
          previsioMsg = `<span class="text-brand-600 font-700">Has assolit aquesta meta! 🎉</span>`;
        } else if (ritmeEstalviMensual > 0) {
          const mesos = Math.ceil(falta / ritmeEstalviMensual);
          const dataAconseguit = new Date();
          dataAconseguit.setMonth(dataAconseguit.getMonth() + mesos);
          const opcionsData = { month: 'long', year: 'numeric' };
          previsioMsg = `Et falten <b>${mesos} mesos</b>. Ho aconseguiràs el <b>${dataAconseguit.toLocaleDateString('ca-ES', opcionsData)}</b>`;
        } else {
          previsioMsg = `<span class="text-amber-600">Configura el teu pressupost per veure quan ho aconseguiràs</span>`;
        }
        
        const card = document.createElement('div');
        card.className = "bg-white border border-ink-muted/10 rounded-2xl p-5 shadow-sm";
        card.innerHTML = `
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="font-display font-700 text-lg text-ink">${escapeHtml(meta.nom)}</h3>
              <p class="font-body text-xs text-ink-muted mt-1">${previsioMsg}</p>
            </div>
            <div class="flex gap-2">
              <button onclick="sumarDinersMeta(${meta.id})" class="px-3 py-1.5 text-xs font-display font-700 text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-colors flex items-center gap-1">
                <i data-lucide="plus" class="w-3 h-3"></i> Sumar estalvi
              </button>
              <button onclick="eliminarMeta(${meta.id})" class="p-1.5 text-ink-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between font-body text-sm">
              <span class="text-ink-muted">Estalviat: <span class="font-600 text-ink">${fmt(meta.actual)}</span></span>
              <span class="text-ink-muted">Objectiu: <span class="font-600 text-ink">${fmt(meta.cost)}</span></span>
            </div>
            <div class="w-full bg-surface rounded-full h-3 overflow-hidden">
              <div class="bg-brand-500 h-3 rounded-full transition-all duration-1000 ease-out" style="width: ${pct}%"></div>
            </div>
            <div class="text-right">
              <span class="font-display font-700 text-xs text-brand-600">${pct}% completat</span>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
      
      if (window.lucide) lucide.createIcons();
    }


    // ══════════════════════════════════════════════
    //  MÒDUL DASHBOARD ANALÍTIC
    // ══════════════════════════════════════════════

    let chartDistribucioInstancia = null;
    let chartEvolucioInstancia = null;

    async function initDashboard() {
      // 1. KPI: Total Estalviat (Metes actuals)
      const metes = JSON.parse(localStorage.getItem('smartprice_metes') || '[]');
      const totalEstalviat = metes.reduce((acc, m) => acc + m.actual, 0);
      document.getElementById('dash-estalvi-total').textContent = fmt(totalEstalviat);

      // Metes KPI
      const metesCompletades = metes.filter(m => m.actual >= m.cost).length;
      const pctMetes = metes.length > 0 ? Math.round((metesCompletades / metes.length) * 100) : 0;
      document.getElementById('dash-compliment').textContent = pctMetes + '%';

      // 2. Distribució de despeses
      let categories = {};
      let totalDespesaActual = 0;
      
      // Intentar primer amb les dades locals no desades
      despesesDades.forEach(d => {
        const importNum = parseFloat(d.import) || 0;
        if (importNum > 0) {
          totalDespesaActual += importNum;
          if (!categories[d.nom]) categories[d.nom] = 0;
          categories[d.nom] += importNum;
        }
      });

      // Si no hi ha res localment, anar a buscar a la base de dades
      if (totalDespesaActual === 0) {
        try {
          const lastP = await dbGetLastPressupost();
          if (lastP && lastP.despeses) {
            const despesesBD = typeof lastP.despeses === 'string' ? JSON.parse(lastP.despeses) : lastP.despeses;
            despesesBD.forEach(d => {
              const importNum = parseFloat(d.import) || 0;
              if (importNum > 0) {
                totalDespesaActual += importNum;
                if (!categories[d.nom]) categories[d.nom] = 0;
                categories[d.nom] += importNum;
              }
            });
          }
        } catch(e) {}
      }

      document.getElementById('dash-despesa-mitjana').textContent = fmt(totalDespesaActual);

      if (totalDespesaActual === 0) {
        document.getElementById('dash-no-despeses').classList.remove('hidden');
      } else {
        document.getElementById('dash-no-despeses').classList.add('hidden');
        renderDistChart(categories);
      }

      // 3. Evolució de l'estalvi (Historial)
      try {
        const history = await dbGetPressupostos();
        document.getElementById('dash-mesos').textContent = history.length;
        if (history.length < 2) {
          document.getElementById('dash-no-historial').classList.remove('hidden');
        } else {
          document.getElementById('dash-no-historial').classList.add('hidden');
          // Ordenem històric per data ascendent per pintar el gràfic de línies
          history.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
          renderEvolChart(history);
        }
      } catch (err) {
        document.getElementById('dash-mesos').textContent = '0';
        document.getElementById('dash-no-historial').classList.remove('hidden');
      }
    }

    function renderDistChart(categories) {
      const ctx = document.getElementById('chart-distribucio').getContext('2d');
      if (chartDistribucioInstancia) chartDistribucioInstancia.destroy();

      const labels = Object.keys(categories).map(c => c.charAt(0).toUpperCase() + c.slice(1));
      const data = Object.values(categories);

      chartDistribucioInstancia = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { font: { family: 'Outfit, sans-serif' } } }
          },
          cutout: '70%'
        }
      });
    }

    function renderEvolChart(history) {
      const ctx = document.getElementById('chart-evolucio').getContext('2d');
      if (chartEvolucioInstancia) chartEvolucioInstancia.destroy();

      const labels = history.map(h => {
        const d = new Date(h.created_at);
        return d.toLocaleDateString('ca-ES', { month: 'short', day: 'numeric' });
      });
      
      const dataIngressos = history.map(h => h.ingressos || 0);
      const dataDespeses = history.map(h => h.total_despeses || 0);

      chartEvolucioInstancia = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Ingressos',
              data: dataIngressos,
              backgroundColor: '#10b981', // Verd brand
              borderRadius: 4
            },
            {
              label: 'Despeses',
              data: dataDespeses,
              backgroundColor: '#ef4444', // Vermell alert
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: { family: 'Outfit, sans-serif' } } }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { borderDash: [5, 5], color: '#e2e8f0' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }