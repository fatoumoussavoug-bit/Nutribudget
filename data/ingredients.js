/**
 * NutriBudget - Base de Données des Ingrédients Locaux & Internationaux (Sénégal / Dakar)
 * Données nutritionnelles pour 100g de partie comestible.
 * Sources scientifiques de référence : Table de composition des aliments d'Afrique de l'Ouest (FAO/INFOODS) & Ciqual.
 * 
 * DEUX SOURCES OFFICIELLES DE PRIX (Dakar 2026) :
 * 1. Auchan Sénégal (auchan.sn) : produits emballés, en conserve et en bouteille.
 * 2. Marchés locaux de Dakar : prix officiels de référence ANSD / CSAR 2026 pour les produits frais et vrac.
 * 
 * Vente au détail réaliste au Sénégal (pas de coût proportionnel au gramme abstrait) :
 * - Oeufs par unité à 100 FCFA
 * - Légumes (oignon, tomate, poivron, carotte) vendus au kg, 500g, 250g ou 125g (minimum 125g ou 1 pièce)
 * - Huiles au litre, demi-litre (500 ml), 250 ml ou 125 ml
 * - Huile d'olive extra vierge en bouteille uniquement (500 ml ou 1 L, pas en détail)
 * - Pain vendu par baguette entière (150 FCFA)
 * - Poisson frais (sardinelles) vendu en poissonnerie/marché au kg ou en tas (pas à Auchan)
 * - Produits en boîte (thon, sardines, concentré de tomate) vendus à la boîte entière
 * 
 * Tous les prix restent ajustables par l'utilisateur selon son marché local.
 */

const PRICE_REFERENCE = {
    sourceAuchan: "Auchan Sénégal (auchan.sn)",
    sourceMarche: "Marchés locaux · Réf. ANSD / CSAR, Dakar 2026",
    footerNotice: "Prix de référence : Auchan Sénégal + Marchés locaux ANSD / CSAR, Dakar, 2026, à ajuster selon votre marché.",
    currency: "FCFA (XOF)"
};

const AUCHAN_PRICE_REFERENCE = {
    source: "Auchan Sénégal",
    website: "https://www.auchan.sn",
    currency: "FCFA (XOF)",
    note: "Produits emballés et en bouteille relevés sur auchan.sn et dans les hypermarchés Auchan Dakar."
};

const MARCHE_LOCAL_PRICE_REFERENCE = {
    source: "Marchés locaux de Dakar",
    reference: "ANSD / CSAR Sénégal 2026",
    currency: "FCFA (XOF)",
    note: "Produits frais, légumes, viandes, poissons et céréales en vrac relevés sur les marchés de Dakar (Castors, Tilène, Soumbédioune)."
};

const SEN_INGREDIENTS = [
    // ==========================================
    // CÉRÉALES, GRAINES & FÉCULENTS
    // ==========================================
    {
        id: "riz-brise-ordinaire",
        name: "Riz brisé blanc",
        category: "cereales_feculents",
        categoryLabel: "Céréales & Féculents",
        servingUnit: "g",
        per100g: {
            calories: 360,
            proteins: 7.0,
            carbs: 79.0,
            fats: 0.8,
            fiber: 1.2
        },
        defaultPricePerKg: 500, // Compatibilité test
        marketPrice2026: 450, // 450 FCFA / kg vrac marché 2026
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 500, unit: "g", price: 225, label: "Demi-kg (500g)" },
            { qty: 1000, unit: "g", price: 450, label: "1 kg" },
            { qty: 5000, unit: "g", price: 2200, label: "Sac 5 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "economique", "base-locale"],
        description: "Riz brisé blanc de grande consommation, base des plats familiaux cuits à l'eau ou au bouillon."
    },
    {
        id: "riz-parfume",
        name: "Riz parfumé",
        category: "cereales_feculents",
        categoryLabel: "Céréales & Féculents",
        servingUnit: "g",
        per100g: {
            calories: 355,
            proteins: 7.1,
            carbs: 78.5,
            fats: 0.9,
            fiber: 1.3
        },
        defaultPricePerKg: 750, // Compatibilité test
        marketPrice2026: 500, // 500 FCFA / kg marché 2026
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 500, unit: "g", price: 250, label: "Demi-kg (500g)" },
            { qty: 1000, unit: "g", price: 500, label: "1 kg" },
            { qty: 5000, unit: "g", price: 2500, label: "Sac 5 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "base-locale"],
        description: "Riz à grains longs parfumé, apprécié pour les repas du dimanche et les grandes réceptions."
    },
    {
        id: "mil-arraw",
        name: "Mil en grains",
        category: "cereales_feculents",
        categoryLabel: "Céréales & Féculents",
        servingUnit: "g",
        per100g: {
            calories: 378,
            proteins: 11.0,
            carbs: 73.0,
            fats: 4.2,
            fiber: 8.5
        },
        defaultPricePerKg: 600,
        marketPrice2026: 600,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 500, unit: "g", price: 300, label: "Demi-kg (500g)" },
            { qty: 1000, unit: "g", price: 600, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "riche-en-fibres", "economique"],
        description: "Céréale locale très nutritive, particulièrement riche en fer, magnésium et fibres végétales."
    },
    {
        id: "thiakry-mil",
        name: "Couscous de mil précuit",
        category: "cereales_feculents",
        categoryLabel: "Céréales & Féculents",
        servingUnit: "g",
        per100g: {
            calories: 365,
            proteins: 9.8,
            carbs: 76.0,
            fats: 2.1,
            fiber: 6.0
        },
        defaultPricePerKg: 1000,
        marketPrice2026: 1700, // 850 FCFA le sachet de 500g
        priceUnit: "kg",
        priceSource: "auchan",
        priceSourceLabel: "Auchan Sénégal",
        sourceRef: "Auchan Sénégal (auchan.sn)",
        purchaseFormats: [
            { qty: 500, unit: "g", price: 850, label: "Sachet 500g" },
            { qty: 1000, unit: "g", price: 1700, label: "Paquet 1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "dessert-traditionnel"],
        description: "Granules de mil roulées et étuvées emballées, prêtes à être réhydratées avec du lait fermenté."
    },
    {
        id: "fonio",
        name: "Fonio précuit",
        category: "cereales_feculents",
        categoryLabel: "Céréales & Féculents",
        servingUnit: "g",
        per100g: {
            calories: 370,
            proteins: 8.0,
            carbs: 75.0,
            fats: 1.5,
            fiber: 4.0
        },
        defaultPricePerKg: 1500,
        marketPrice2026: 1800, // 900 FCFA le sachet de 500g emballé
        priceUnit: "kg",
        priceSource: "auchan",
        priceSourceLabel: "Auchan Sénégal",
        sourceRef: "Auchan Sénégal (auchan.sn)",
        purchaseFormats: [
            { qty: 500, unit: "g", price: 900, label: "Sachet 500g" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "faible-glycemie"],
        description: "Céréale ancestrale légère et très digeste, recommandée pour les personnes diabétiques et sportifs."
    },
    {
        id: "patate-douce",
        name: "Patate douce",
        category: "cereales_feculents",
        categoryLabel: "Céréales & Féculents",
        servingUnit: "g",
        unitWeightGrams: 200,
        per100g: {
            calories: 86,
            proteins: 1.6,
            carbs: 20.1,
            fats: 0.1,
            fiber: 3.0
        },
        defaultPricePerKg: 500,
        marketPrice2026: 400,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 500, unit: "g", price: 200, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 400, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "vitamine-a", "economique"],
        description: "Tubercule doux riche en bêta-carotène et glucides lents, très accessible sur les marchés locaux."
    },
    {
        id: "manioc",
        name: "Manioc frais",
        category: "cereales_feculents",
        categoryLabel: "Céréales & Féculents",
        servingUnit: "g",
        unitWeightGrams: 300,
        per100g: {
            calories: 160,
            proteins: 1.4,
            carbs: 38.0,
            fats: 0.3,
            fiber: 1.8
        },
        defaultPricePerKg: 400,
        marketPrice2026: 350,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 500, unit: "g", price: 175, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 350, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "economique", "energie-durable"],
        description: "Tubercule nourrissant, économique et source d'énergie durable pour les familles."
    },
    {
        id: "pain-tapalapa",
        name: "Pain artisanal",
        category: "cereales_feculents",
        categoryLabel: "Céréales & Féculents",
        servingUnit: "piece",
        unitWeightGrams: 200,
        per100g: {
            calories: 265,
            proteins: 9.0,
            carbs: 52.0,
            fats: 1.8,
            fiber: 3.5
        },
        defaultPricePerKg: 600,
        pricePerPiece: 100,
        marketPrice2026: 100, // 100 FCFA par pain entier
        priceUnit: "piece",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (Boutique de quartier)",
        purchaseFormats: [
            { qty: 1, unit: "piece", price: 100, label: "1 pain entier" }
        ],
        isLocalSenegal: true,
        tags: ["economique", "petit-dejeuner"],
        description: "Pain traditionnel dense à base de blé et céréales locales, vendu entier à la boutique de quartier."
    },
    {
        id: "pain-frais",
        name: "Baguette de pain frais",
        category: "cereales_feculents",
        categoryLabel: "Céréales & Féculents",
        servingUnit: "piece",
        unitWeightGrams: 200,
        per100g: {
            calories: 265,
            proteins: 9.0,
            carbs: 54.0,
            fats: 1.2,
            fiber: 2.8
        },
        defaultPricePerKg: 800,
        pricePerPiece: 150,
        marketPrice2026: 150, // Pain par baguette entière 150 FCFA
        priceUnit: "piece",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (Boulangerie / Boutique)",
        purchaseFormats: [
            { qty: 1, unit: "piece", price: 150, label: "1 baguette entière" }
        ],
        isLocalSenegal: true,
        tags: ["energie", "petit-dejeuner"],
        description: "Baguette de pain frais croustillante, vendue par baguette entière à 150 FCFA."
    },
    {
        id: "pommes-de-terre",
        name: "Pommes de terre fraîches",
        category: "cereales_feculents",
        categoryLabel: "Céréales & Féculents",
        servingUnit: "g",
        unitWeightGrams: 150,
        per100g: {
            calories: 77,
            proteins: 2.0,
            carbs: 17.5,
            fats: 0.1,
            fiber: 2.2
        },
        defaultPricePerKg: 700,
        marketPrice2026: 500, // 500 FCFA / kg
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 250, unit: "g", price: 125, label: "Portion 250g" },
            { qty: 500, unit: "g", price: 250, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 500, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "feculent-sain", "potassium"],
        description: "Pommes de terre fraîches locales, vendues au marché par 250g, 500g ou au kg."
    },

    // ==========================================
    // LÉGUMINEUSES & GRAINES
    // ==========================================
    {
        id: "niebe",
        name: "Haricot blanc local",
        category: "legumineuses",
        categoryLabel: "Légumineuses & Graines",
        servingUnit: "g",
        per100g: {
            calories: 343,
            proteins: 24.0,
            carbs: 60.0,
            fats: 1.3,
            fiber: 10.6
        },
        defaultPricePerKg: 900, // Compatibilité test
        marketPrice2026: 800, // 800 FCFA / kg marché 2026
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 250, unit: "g", price: 200, label: "Portion 250g" },
            { qty: 500, unit: "g", price: 400, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 800, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "tres-riche-proteines", "economique", "fer"],
        description: "Légumineuse locale très riche en protéines (24%) et en fer, excellente alternative économique à la viande."
    },
    {
        id: "arachides-crues",
        name: "Arachides décortiquées",
        category: "legumineuses",
        categoryLabel: "Légumineuses & Graines",
        servingUnit: "g",
        per100g: {
            calories: 567,
            proteins: 25.8,
            carbs: 16.1,
            fats: 49.2,
            fiber: 8.5
        },
        defaultPricePerKg: 1000,
        marketPrice2026: 900,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 250, unit: "g", price: 225, label: "Portion 250g" },
            { qty: 500, unit: "g", price: 450, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 900, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "bonnes-graisses", "proteines"],
        description: "Graines d'arachides décortiquées, riches en acides gras insaturés et en protéines végétales."
    },
    {
        id: "pate-arachide",
        name: "Pâte d'arachide pure",
        category: "legumineuses",
        categoryLabel: "Légumineuses & Graines",
        servingUnit: "g",
        per100g: {
            calories: 588,
            proteins: 25.0,
            carbs: 20.0,
            fats: 50.0,
            fiber: 6.0
        },
        defaultPricePerKg: 1200,
        marketPrice2026: 1000,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 250, unit: "g", price: 250, label: "Pot 250g" },
            { qty: 500, unit: "g", price: 500, label: "Pot 500g" },
            { qty: 1000, unit: "g", price: 1000, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "riche-en-energie"],
        description: "Pâte pure d'arachides grillées sans additif, base onctueuse de sauces traditionnelles."
    },

    // ==========================================
    // POISSONS, VIANDES & ŒUFS
    // ==========================================
    {
        id: "yaboye-sardinelle",
        name: "Sardinelle fraîche",
        category: "poissons_viandes_oeufs",
        categoryLabel: "Poissons, Viandes & Œufs",
        servingUnit: "g",
        unitWeightGrams: 150,
        per100g: {
            calories: 135,
            proteins: 19.5,
            carbs: 0.0,
            fats: 6.2,
            fiber: 0.0
        },
        defaultPricePerKg: 1000, // Compatibilité test
        marketPrice2026: 1200, // 1200 FCFA / kg ou tas 500g à 600 FCFA
        priceUnit: "kg",
        priceSource: "marche_local", // Vendu au marché local ou poissonnerie, pas à Auchan
        priceSourceLabel: "Marché local",
        sourceRef: "Marché local / Poissonnerie (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 500, unit: "g", price: 600, label: "Tas de 500g" },
            { qty: 1000, unit: "g", price: 1200, label: "1 kg" },
            { qty: 2000, unit: "g", price: 2400, label: "2 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "omega-3", "economique", "proteines-pures"],
        description: "Poisson frais populaire du littoral, vendu au marché ou en poissonnerie par tas ou au kg. Très riche en oméga-3."
    },
    {
        id: "sardines-boite",
        name: "Sardines à l'huile en boîte",
        category: "poissons_viandes_oeufs",
        categoryLabel: "Poissons, Viandes & Œufs",
        servingUnit: "piece",
        unitWeightGrams: 125,
        per100g: {
            calories: 208,
            proteins: 24.6,
            carbs: 0.0,
            fats: 11.5,
            fiber: 0.0
        },
        defaultPricePerKg: 3200,
        pricePerPiece: 850,
        marketPrice2026: 850, // Boîte 125g à 850 FCFA
        priceUnit: "piece",
        priceSource: "auchan",
        priceSourceLabel: "Auchan Sénégal",
        sourceRef: "Auchan Sénégal (auchan.sn)",
        purchaseFormats: [
            { qty: 1, unit: "piece", price: 850, label: "Boîte 125g" }
        ],
        isLocalSenegal: false,
        tags: ["sans-gluten", "omega-3", "conservation-facile"],
        description: "Poisson en conserve prêt à l'emploi vendu à la boîte entière à Auchan Sénégal."
    },
    {
        id: "thon-naturel",
        name: "Thon au naturel en boîte",
        category: "poissons_viandes_oeufs",
        categoryLabel: "Poissons, Viandes & Œufs",
        servingUnit: "piece",
        unitWeightGrams: 160,
        per100g: {
            calories: 116,
            proteins: 26.0,
            carbs: 0.0,
            fats: 1.0,
            fiber: 0.0
        },
        defaultPricePerKg: 6250,
        pricePerPiece: 1290,
        marketPrice2026: 1290, // Boîte 160g à 1290 FCFA
        priceUnit: "piece",
        priceSource: "auchan",
        priceSourceLabel: "Auchan Sénégal",
        sourceRef: "Auchan Sénégal (auchan.sn)",
        purchaseFormats: [
            { qty: 1, unit: "piece", price: 1290, label: "Boîte 160g" }
        ],
        isLocalSenegal: false,
        tags: ["sans-gluten", "riche-en-proteines", "omega-3", "rapide"],
        description: "Protéine maigre de thon en boîte entière vendue à Auchan Sénégal, sans matière grasse superflue."
    },
    {
        id: "oeuf-poule",
        name: "Œuf de poule frais",
        category: "poissons_viandes_oeufs",
        categoryLabel: "Poissons, Viandes & Œufs",
        servingUnit: "piece",
        unitWeightGrams: 55,
        per100g: {
            calories: 143,
            proteins: 12.6,
            carbs: 0.7,
            fats: 9.9,
            fiber: 0.0
        },
        defaultPricePerKg: 2273,
        pricePerPiece: 125, // Compatibilité test legacy
        marketPrice2026: 100, // Oeuf par unité à 100 FCFA
        priceUnit: "piece",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 1, unit: "piece", price: 100, label: "1 œuf (100 FCFA)" },
            { qty: 6, unit: "piece", price: 600, label: "Demi-douzaine (6 œufs)" },
            { qty: 12, unit: "piece", price: 1200, label: "Douzaine (12 œufs)" },
            { qty: 30, unit: "piece", price: 2900, label: "Plateau 30 œufs" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "proteines-completes", "economique"],
        description: "Œuf de poule frais vendu par unité à 100 FCFA au marché et boutique de quartier."
    },
    {
        id: "thiof-merou",
        name: "Mérou blanc",
        category: "poissons_viandes_oeufs",
        categoryLabel: "Poissons, Viandes & Œufs",
        servingUnit: "g",
        unitWeightGrams: 350,
        per100g: {
            calories: 92,
            proteins: 19.8,
            carbs: 0.0,
            fats: 1.1,
            fiber: 0.0
        },
        defaultPricePerKg: 5000,
        marketPrice2026: 4500, // 4500 FCFA / kg
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marché local / Poissonnerie (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 500, unit: "g", price: 2250, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 4500, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "poisson-noble", "faible-lipides"],
        description: "Poisson noble de mer à chair blanche ferme et maigre, vendu au marché local ou en poissonnerie."
    },
    {
        id: "poisson-blanc",
        name: "Filet de poisson frais",
        category: "poissons_viandes_oeufs",
        categoryLabel: "Poissons, Viandes & Œufs",
        servingUnit: "g",
        unitWeightGrams: 150,
        per100g: {
            calories: 96,
            proteins: 20.0,
            carbs: 0.0,
            fats: 1.7,
            fiber: 0.0
        },
        defaultPricePerKg: 2500,
        marketPrice2026: 2000, // 2000 FCFA / kg
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marché local / Poissonnerie (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 500, unit: "g", price: 1000, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 2000, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "proteines-maigres", "poisson"],
        description: "Poisson blanc frais (merlu, tilapia) à chair tendre et digeste, vendu en poissonnerie locale."
    },
    {
        id: "poulet-fermier",
        name: "Morceaux de poulet fermier",
        category: "poissons_viandes_oeufs",
        categoryLabel: "Poissons, Viandes & Œufs",
        servingUnit: "g",
        per100g: {
            calories: 165,
            proteins: 21.0,
            carbs: 0.0,
            fats: 8.5,
            fiber: 0.0
        },
        defaultPricePerKg: 3500,
        marketPrice2026: 2500, // 2500 FCFA / kg
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux / Boucherie (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 250, unit: "g", price: 625, label: "Portion 250g" },
            { qty: 500, unit: "g", price: 1250, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 2500, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "proteines-maigres"],
        description: "Poulet fermier frais découpé, vendu en boucherie de marché par portions de 250g, 500g ou au kg."
    },
    {
        id: "viande-boeuf",
        name: "Viande de bœuf sans os",
        category: "poissons_viandes_oeufs",
        categoryLabel: "Poissons, Viandes & Œufs",
        servingUnit: "g",
        per100g: {
            calories: 215,
            proteins: 20.0,
            carbs: 0.0,
            fats: 14.5,
            fiber: 0.0
        },
        defaultPricePerKg: 4000,
        marketPrice2026: 5000, // 5000 FCFA / kg boucher Dakar 2026
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux / Boucher (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 250, unit: "g", price: 1250, label: "Portion 250g" },
            { qty: 500, unit: "g", price: 2500, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 5000, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "fer-heminique", "proteines"],
        description: "Morceaux de bœuf maigre sans os coupés par le boucher au marché (250g, 500g, 1 kg)."
    },
    {
        id: "guedj-poisson-seche",
        name: "Poisson séché traditionnel",
        category: "poissons_viandes_oeufs",
        categoryLabel: "Poissons, Viandes & Œufs",
        servingUnit: "g",
        unitWeightGrams: 50,
        per100g: {
            calories: 210,
            proteins: 42.0,
            carbs: 0.0,
            fats: 4.5,
            fiber: 0.0
        },
        defaultPricePerKg: 4500,
        marketPrice2026: 3500,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 50, unit: "g", price: 175, label: "Morceau 50g" },
            { qty: 100, unit: "g", price: 350, label: "Morceau 100g" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "condiment-traditionnel"],
        description: "Poisson séché salé vendu au marché local en petits morceaux pour aromatiser les bouillons."
    },

    // ==========================================
    // LÉGUMES & FEUILLES LOCALES
    // ==========================================
    {
        id: "oignon-jaune",
        name: "Oignon local",
        category: "legumes",
        categoryLabel: "Légumes & Feuilles",
        servingUnit: "g",
        unitWeightGrams: 120,
        per100g: {
            calories: 40,
            proteins: 1.1,
            carbs: 9.3,
            fats: 0.1,
            fiber: 1.7
        },
        defaultPricePerKg: 500, // Compatibilité test
        marketPrice2026: 600, // Oignon local 600 FCFA / kg
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 125, unit: "g", price: 75, label: "Portion 125g" },
            { qty: 250, unit: "g", price: 150, label: "Portion 250g" },
            { qty: 500, unit: "g", price: 300, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 600, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "antioxydant", "base-cuisson"],
        description: "Oignon local vendu au marché au kg, 500g, 250g ou 125g (minimum 125g ou 1 pièce)."
    },
    {
        id: "tomate-fraiche",
        name: "Tomate fraîche locale",
        category: "legumes",
        categoryLabel: "Légumes & Feuilles",
        servingUnit: "g",
        unitWeightGrams: 80,
        per100g: {
            calories: 18,
            proteins: 0.9,
            carbs: 3.9,
            fats: 0.2,
            fiber: 1.2
        },
        defaultPricePerKg: 600,
        marketPrice2026: 500, // 500 FCFA / kg
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 125, unit: "g", price: 65, label: "Portion 125g" },
            { qty: 250, unit: "g", price: 125, label: "Portion 250g" },
            { qty: 500, unit: "g", price: 250, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 500, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "lycopene", "hydratant"],
        description: "Tomate fraîche de saison vendue au marché au kg, 500g, 250g ou 125g (minimum 1 pièce ou 125g)."
    },
    {
        id: "poivron",
        name: "Poivron doux",
        category: "legumes",
        categoryLabel: "Légumes & Feuilles",
        servingUnit: "g",
        unitWeightGrams: 150,
        per100g: {
            calories: 26,
            proteins: 1.0,
            carbs: 6.0,
            fats: 0.3,
            fiber: 2.1
        },
        defaultPricePerKg: 800,
        marketPrice2026: 700, // 700 FCFA / kg
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 125, unit: "g", price: 90, label: "Portion 125g" },
            { qty: 250, unit: "g", price: 175, label: "Portion 250g" },
            { qty: 500, unit: "g", price: 350, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 700, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "vitamine-c", "antioxydant"],
        description: "Poivron doux frais vendu au marché au kg, 500g, 250g ou 125g (minimum 1 pièce ou 125g)."
    },
    {
        id: "carotte",
        name: "Carotte locale",
        category: "legumes",
        categoryLabel: "Légumes & Feuilles",
        servingUnit: "g",
        unitWeightGrams: 100,
        per100g: {
            calories: 41,
            proteins: 0.9,
            carbs: 9.6,
            fats: 0.2,
            fiber: 2.8
        },
        defaultPricePerKg: 600,
        marketPrice2026: 600,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 125, unit: "g", price: 75, label: "Portion 125g" },
            { qty: 250, unit: "g", price: 150, label: "Portion 250g" },
            { qty: 500, unit: "g", price: 300, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 600, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "pro-vitamine-a", "economique"],
        description: "Carottes fraîches croquantes, vendues au marché par portions de 125g, 250g, 500g ou 1 kg."
    },
    {
        id: "chou-blanc",
        name: "Chou blanc local",
        category: "legumes",
        categoryLabel: "Légumes & Feuilles",
        servingUnit: "g",
        unitWeightGrams: 500,
        per100g: {
            calories: 25,
            proteins: 1.3,
            carbs: 5.8,
            fats: 0.1,
            fiber: 2.5
        },
        defaultPricePerKg: 400,
        marketPrice2026: 300,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 250, unit: "g", price: 75, label: "Quart de chou 250g" },
            { qty: 500, unit: "g", price: 150, label: "Demi-chou 500g" },
            { qty: 1000, unit: "g", price: 300, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "tres-faible-calorie", "economique"],
        description: "Chou blanc vendu au marché en quartier (250g), demi-chou (500g) ou pièce entière."
    },
    {
        id: "courgette",
        name: "Courgettes fraîches",
        category: "legumes",
        categoryLabel: "Légumes & Feuilles",
        servingUnit: "g",
        unitWeightGrams: 200,
        per100g: {
            calories: 17,
            proteins: 1.2,
            carbs: 3.1,
            fats: 0.3,
            fiber: 1.0
        },
        defaultPricePerKg: 700,
        marketPrice2026: 600,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 250, unit: "g", price: 150, label: "Portion 250g" },
            { qty: 500, unit: "g", price: 300, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 600, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "faible-calorie", "digeste"],
        description: "Courgettes fraîches tendres, vendues au marché par 250g, 500g ou 1 kg."
    },
    {
        id: "haricots-verts",
        name: "Haricots verts frais",
        category: "legumes",
        categoryLabel: "Légumes & Feuilles",
        servingUnit: "g",
        unitWeightGrams: 10,
        per100g: {
            calories: 31,
            proteins: 1.8,
            carbs: 7.0,
            fats: 0.2,
            fiber: 3.4
        },
        defaultPricePerKg: 800,
        marketPrice2026: 700,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 250, unit: "g", price: 175, label: "Portion 250g" },
            { qty: 500, unit: "g", price: 350, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 700, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "faible-calorie", "fibres"],
        description: "Haricots verts frais cueillis localement, vendus par 250g, 500g ou 1 kg au marché."
    },
    {
        id: "concombre",
        name: "Concombre frais",
        category: "legumes",
        categoryLabel: "Légumes & Feuilles",
        servingUnit: "piece",
        unitWeightGrams: 250,
        per100g: {
            calories: 15,
            proteins: 0.7,
            carbs: 3.6,
            fats: 0.1,
            fiber: 0.5
        },
        defaultPricePerKg: 500,
        pricePerPiece: 100,
        marketPrice2026: 100,
        priceUnit: "piece",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 1, unit: "piece", price: 100, label: "1 concombre (250g)" },
            { qty: 2, unit: "piece", price: 200, label: "2 concombres" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "hydratant", "crudite"],
        description: "Concombre frais vendu à la pièce (100 FCFA) sur les étals des marchés."
    },
    {
        id: "salade-verte",
        name: "Salade verte fraîche",
        category: "legumes",
        categoryLabel: "Légumes & Feuilles",
        servingUnit: "piece",
        unitWeightGrams: 200,
        per100g: {
            calories: 15,
            proteins: 1.4,
            carbs: 2.9,
            fats: 0.2,
            fiber: 1.3
        },
        defaultPricePerKg: 1500,
        pricePerPiece: 300,
        marketPrice2026: 300,
        priceUnit: "piece",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 1, unit: "piece", price: 300, label: "1 pied entier (200g)" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "hydratant", "crudite"],
        description: "Pied de salade verte croquante fraîchement récolté, vendu au pied entier (300 FCFA)."
    },
    {
        id: "gombo-frais",
        name: "Gombo frais",
        category: "legumes",
        categoryLabel: "Légumes & Feuilles",
        servingUnit: "g",
        unitWeightGrams: 20,
        per100g: {
            calories: 33,
            proteins: 1.9,
            carbs: 7.5,
            fats: 0.2,
            fiber: 3.2
        },
        defaultPricePerKg: 800,
        marketPrice2026: 700,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 250, unit: "g", price: 175, label: "Portion 250g" },
            { qty: 500, unit: "g", price: 350, label: "Portion 500g" },
            { qty: 1000, unit: "g", price: 700, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "faible-calorie", "fibres-solubles"],
        description: "Légume vert mucilagineux bon pour le transit, vendu au marché par 250g, 500g ou 1 kg."
    },
    {
        id: "diakhatou",
        name: "Aubergine amère locale",
        category: "legumes",
        categoryLabel: "Légumes & Feuilles",
        servingUnit: "g",
        unitWeightGrams: 50,
        per100g: {
            calories: 25,
            proteins: 1.2,
            carbs: 4.8,
            fats: 0.2,
            fiber: 2.5
        },
        defaultPricePerKg: 600,
        marketPrice2026: 500,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 125, unit: "g", price: 65, label: "Portion 125g" },
            { qty: 250, unit: "g", price: 125, label: "Portion 250g" },
            { qty: 500, unit: "g", price: 250, label: "Portion 500g" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "digestif", "economique"],
        description: "Aubergine locale amère digestive, vendue au marché en petites portions (125g, 250g, 500g)."
    },
    {
        id: "moringa-nebeday",
        name: "Feuilles de moringa fraîches",
        category: "legumes",
        categoryLabel: "Légumes & Feuilles",
        servingUnit: "g",
        per100g: {
            calories: 64,
            proteins: 9.4,
            carbs: 8.2,
            fats: 1.4,
            fiber: 2.0
        },
        defaultPricePerKg: 1500, // Compatibilité test
        marketPrice2026: 1000,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 100, unit: "g", price: 100, label: "Botte 100g" },
            { qty: 250, unit: "g", price: 250, label: "Botte 250g" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "super-aliment", "fer", "calcium"],
        description: "Feuilles fraîches très riches en micronutriments, vendues en bottes au marché."
    },
    {
        id: "feuilles-bissap-vert",
        name: "Feuilles d'oseille de Guinée",
        category: "legumes",
        categoryLabel: "Légumes & Feuilles",
        servingUnit: "g",
        per100g: {
            calories: 28,
            proteins: 2.0,
            carbs: 4.5,
            fats: 0.3,
            fiber: 2.4
        },
        defaultPricePerKg: 1000,
        marketPrice2026: 500,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 100, unit: "g", price: 50, label: "Botte 100g" },
            { qty: 200, unit: "g", price: 100, label: "Botte 200g" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "acidule", "fer"],
        description: "Feuilles acidulées vendues en bottes de 50 à 100 FCFA sur les marchés locaux."
    },
    {
        id: "tomate-concentree",
        name: "Pâte de tomate concentrée",
        category: "legumes",
        categoryLabel: "Légumes & Feuilles",
        servingUnit: "piece",
        unitWeightGrams: 70,
        per100g: {
            calories: 82,
            proteins: 4.3,
            carbs: 15.0,
            fats: 0.5,
            fiber: 4.1
        },
        defaultPricePerKg: 2000,
        pricePerPiece: 150,
        marketPrice2026: 150, // Petite boîte 70g à 150 FCFA
        priceUnit: "piece",
        priceSource: "auchan",
        priceSourceLabel: "Auchan Sénégal",
        sourceRef: "Auchan Sénégal (auchan.sn)",
        purchaseFormats: [
            { qty: 1, unit: "piece", price: 150, label: "Petite boîte 70g" }
        ],
        isLocalSenegal: false,
        tags: ["sans-gluten", "sauce-tomate"],
        description: "Petite boîte de concentré de tomate emballée vendue à 150 FCFA à Auchan et boutique."
    },

    // ==========================================
    // FRUITS LOCAUX & SAISONNIERS
    // ==========================================
    {
        id: "avocat",
        name: "Avocat frais",
        category: "fruits",
        categoryLabel: "Fruits",
        servingUnit: "piece",
        unitWeightGrams: 200,
        per100g: {
            calories: 160,
            proteins: 2.0,
            carbs: 8.5,
            fats: 14.7,
            fiber: 6.7
        },
        defaultPricePerKg: 1500,
        pricePerPiece: 300,
        marketPrice2026: 300,
        priceUnit: "piece",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 1, unit: "piece", price: 300, label: "1 avocat frais (200g)" }
        ],
        isLocalSenegal: true,
        tags: ["bonnes-graisses", "sans-gluten", "fibres", "crudite"],
        description: "Avocat frais crémeux riche en acides gras insaturés, vendu à la pièce au marché."
    },
    {
        id: "mangue-locale",
        name: "Mangue fraîche",
        category: "fruits",
        categoryLabel: "Fruits",
        servingUnit: "piece",
        unitWeightGrams: 250,
        per100g: {
            calories: 60,
            proteins: 0.8,
            carbs: 15.0,
            fats: 0.4,
            fiber: 1.6
        },
        defaultPricePerKg: 500,
        pricePerPiece: 100,
        marketPrice2026: 100,
        priceUnit: "piece",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 1, unit: "piece", price: 100, label: "1 mangue (250g)" },
            { qty: 1000, unit: "g", price: 400, label: "1 kg au marché" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "vitamine-c", "saisonnier"],
        description: "Mangue juteuse et parfumée vendue à la pièce ou au kg en saison au marché local."
    },
    {
        id: "banane-douce",
        name: "Banane douce",
        category: "fruits",
        categoryLabel: "Fruits",
        servingUnit: "piece",
        unitWeightGrams: 120,
        per100g: {
            calories: 89,
            proteins: 1.1,
            carbs: 22.8,
            fats: 0.3,
            fiber: 2.6
        },
        defaultPricePerKg: 700,
        pricePerPiece: 100,
        marketPrice2026: 100,
        priceUnit: "piece",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 1, unit: "piece", price: 100, label: "1 banane (100 FCFA)" },
            { qty: 5, unit: "piece", price: 500, label: "Grappe de 5 (500 FCFA)" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "potassium", "energie-rapide"],
        description: "Banane douce vendue à 100 FCFA la pièce ou en grappe au marché de quartier."
    },
    {
        id: "papaye",
        name: "Papaye mûre",
        category: "fruits",
        categoryLabel: "Fruits",
        servingUnit: "piece",
        unitWeightGrams: 400,
        per100g: {
            calories: 43,
            proteins: 0.5,
            carbs: 10.8,
            fats: 0.3,
            fiber: 1.7
        },
        defaultPricePerKg: 600,
        pricePerPiece: 160,
        marketPrice2026: 160,
        priceUnit: "piece",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 1, unit: "piece", price: 160, label: "1 papaye moyenne (400g)" },
            { qty: 1000, unit: "g", price: 400, label: "1 kg" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "vitamine-c"],
        description: "Papaye fraîche mûre riche en enzymes digestives, vendue à la pièce au marché."
    },
    {
        id: "pain-de-singe-bouye",
        name: "Pulpe de baobab séchée",
        category: "fruits",
        categoryLabel: "Fruits",
        servingUnit: "g",
        per100g: {
            calories: 240,
            proteins: 2.8,
            carbs: 76.0,
            fats: 0.2,
            fiber: 44.0
        },
        defaultPricePerKg: 1500,
        marketPrice2026: 1200,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 100, unit: "g", price: 120, label: "Sachet 100g" },
            { qty: 250, unit: "g", price: 300, label: "Sachet 250g" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "super-fruit", "calcium"],
        description: "Pulpe de fruit du baobab séchée en poudre, vendue en sachets sur les marchés locaux."
    },

    // ==========================================
    // BOISSONS, INFUSIONS & CONDIMENTS
    // ==========================================
    {
        id: "kinkeliba",
        name: "Feuilles de kinkeliba séchées",
        category: "boissons_infusions",
        categoryLabel: "Thés, Boissons & Infusions",
        servingUnit: "g",
        per100g: {
            calories: 2,
            proteins: 0.1,
            carbs: 0.4,
            fats: 0.0,
            fiber: 0.0
        },
        defaultPricePerKg: 2000,
        marketPrice2026: 1500,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 100, unit: "g", price: 150, label: "Botte 100g" },
            { qty: 250, unit: "g", price: 375, label: "Botte 250g" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "drainant-hepatique", "petit-dejeuner"],
        description: "Feuilles de kinkeliba vendues en bottes au marché, dépuratives et digestives."
    },
    {
        id: "fleurs-bissap-rouge",
        name: "Fleurs d'hibiscus séchées",
        category: "boissons_infusions",
        categoryLabel: "Thés, Boissons & Infusions",
        servingUnit: "g",
        per100g: {
            calories: 37,
            proteins: 0.4,
            carbs: 7.4,
            fats: 0.1,
            fiber: 0.3
        },
        defaultPricePerKg: 1500,
        marketPrice2026: 1200,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 100, unit: "g", price: 120, label: "Sachet 100g" },
            { qty: 250, unit: "g", price: 300, label: "Sachet 250g" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "antioxydant-puissant"],
        description: "Fleurs d'hibiscus séchées vendues en sachet au marché, riches en antioxydants."
    },
    {
        id: "the-ataya",
        name: "Thé vert en feuilles",
        category: "boissons_infusions",
        categoryLabel: "Thés, Boissons & Infusions",
        servingUnit: "piece",
        unitWeightGrams: 250,
        per100g: {
            calories: 1,
            proteins: 0.1,
            carbs: 0.2,
            fats: 0.0,
            fiber: 0.0
        },
        defaultPricePerKg: 3000,
        pricePerPiece: 625,
        marketPrice2026: 625,
        priceUnit: "piece",
        priceSource: "auchan",
        priceSourceLabel: "Auchan Sénégal",
        sourceRef: "Auchan Sénégal (auchan.sn)",
        purchaseFormats: [
            { qty: 1, unit: "piece", price: 625, label: "Paquet 250g" }
        ],
        isLocalSenegal: false,
        tags: ["sans-gluten", "stimulant"],
        description: "Paquet de thé vert en feuilles emballé vendu à Auchan Sénégal."
    },
    {
        id: "cafe-touba",
        name: "Café moulu traditionnel",
        category: "boissons_infusions",
        categoryLabel: "Thés, Boissons & Infusions",
        servingUnit: "piece",
        unitWeightGrams: 250,
        per100g: {
            calories: 2,
            proteins: 0.1,
            carbs: 0.3,
            fats: 0.0,
            fiber: 0.0
        },
        defaultPricePerKg: 2500,
        pricePerPiece: 550,
        marketPrice2026: 550,
        priceUnit: "piece",
        priceSource: "auchan",
        priceSourceLabel: "Auchan Sénégal",
        sourceRef: "Auchan Sénégal (auchan.sn)",
        purchaseFormats: [
            { qty: 1, unit: "piece", price: 550, label: "Paquet 250g" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "tonifiant"],
        description: "Café moulu aux épices traditionnelles, vendu en paquet de 250g à Auchan et boutique."
    },
    {
        id: "gingembre-frais",
        name: "Gingembre frais",
        category: "boissons_infusions",
        categoryLabel: "Thés, Boissons & Infusions",
        servingUnit: "g",
        per100g: {
            calories: 80,
            proteins: 1.8,
            carbs: 17.8,
            fats: 0.8,
            fiber: 2.0
        },
        defaultPricePerKg: 1000,
        marketPrice2026: 800,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 100, unit: "g", price: 80, label: "Morceau 100g" },
            { qty: 250, unit: "g", price: 200, label: "Morceau 250g" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "anti-inflammatoire"],
        description: "Racine tonique de gingembre frais vendue au morceau sur les étals de marché."
    },

    // ==========================================
    // HUILES, PRODUITS LAITIERS & CONDIMENTS
    // ==========================================
    {
        id: "huile-arachide",
        name: "Huile végétale d'arachide",
        category: "huiles_condiments",
        categoryLabel: "Matières Grasses & Assaisonnements",
        servingUnit: "ml",
        per100g: {
            calories: 900,
            proteins: 0.0,
            carbs: 0.0,
            fats: 100.0,
            fiber: 0.0
        },
        defaultPricePerKg: 1200, // Compatibilité test
        marketPrice2026: 1200, // 1200 FCFA / litre
        priceUnit: "l",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (Boutique de quartier)",
        purchaseFormats: [
            { qty: 125, unit: "ml", price: 150, label: "Mesurette 125 ml" },
            { qty: 250, unit: "ml", price: 300, label: "Flacon 250 ml" },
            { qty: 500, unit: "ml", price: 600, label: "Demi-litre 500 ml" },
            { qty: 1000, unit: "ml", price: 1200, label: "Bouteille 1 L" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "pure-lipides"],
        description: "Huile végétale de cuisson courante vendue au litre, demi-litre, 250 ml ou 125 ml à la boutique."
    },
    {
        id: "huile-palme-rouge",
        name: "Huile de palme rouge naturelle",
        category: "huiles_condiments",
        categoryLabel: "Matières Grasses & Assaisonnements",
        servingUnit: "ml",
        per100g: {
            calories: 884,
            proteins: 0.0,
            carbs: 0.0,
            fats: 100.0,
            fiber: 0.0
        },
        defaultPricePerKg: 1500,
        marketPrice2026: 1200,
        priceUnit: "l",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 125, unit: "ml", price: 150, label: "Mesurette 125 ml" },
            { qty: 250, unit: "ml", price: 300, label: "Flacon 250 ml" },
            { qty: 500, unit: "ml", price: 600, label: "Demi-litre 500 ml" },
            { qty: 1000, unit: "ml", price: 1200, label: "Bouteille 1 L" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "pro-vitamine-a"],
        description: "Huile brute non raffinée vendue au litre, demi-litre, 250 ml ou 125 ml au marché local."
    },
    {
        id: "huile-olive",
        name: "Huile d'olive extra-vierge",
        category: "huiles_condiments",
        categoryLabel: "Matières Grasses & Assaisonnements",
        servingUnit: "ml",
        unitWeightGrams: 15,
        per100g: {
            calories: 884,
            proteins: 0.0,
            carbs: 0.0,
            fats: 100.0,
            fiber: 0.0
        },
        defaultPricePerKg: 3500,
        marketPrice2026: 8250, // 4125 FCFA la petite bouteille 500ml
        priceUnit: "l",
        priceSource: "auchan", // Uniquement en bouteille à Auchan, pas en détail
        priceSourceLabel: "Auchan Sénégal",
        sourceRef: "Auchan Sénégal (auchan.sn)",
        purchaseFormats: [
            { qty: 500, unit: "ml", price: 4125, label: "Petite bouteille 500 ml" },
            { qty: 1000, unit: "ml", price: 8250, label: "Grande bouteille 1 L" }
        ],
        isLocalSenegal: false,
        tags: ["sans-gluten", "omega-9", "bonnes-graisses"],
        description: "Huile d'olive extra-vierge de qualité supérieure, vendue UNIQUEMENT en bouteille (500 ml ou 1 L, pas en détail) à Auchan Sénégal."
    },
    {
        id: "lait-caille-kossam",
        name: "Lait fermenté pasteurisé",
        category: "produits_laitiers",
        categoryLabel: "Produits Laitiers",
        servingUnit: "g",
        per100g: {
            calories: 68,
            proteins: 3.5,
            carbs: 4.8,
            fats: 3.8,
            fiber: 0.0
        },
        defaultPricePerKg: 1000,
        marketPrice2026: 600, // 600 FCFA / litre
        priceUnit: "l",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux / Laiteries (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 250, unit: "ml", price: 150, label: "Sachet 250 ml" },
            { qty: 500, unit: "ml", price: 300, label: "Sachet 500 ml" },
            { qty: 1000, unit: "ml", price: 600, label: "Sachet 1 L" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "probiotiques", "calcium"],
        description: "Lait fermenté riche en ferments lactiques, vendu en sachets de 250 ml, 500 ml ou 1 L."
    },
    {
        id: "lait-poudre",
        name: "Lait en poudre entier",
        category: "produits_laitiers",
        categoryLabel: "Produits Laitiers",
        servingUnit: "g",
        per100g: {
            calories: 496,
            proteins: 26.3,
            carbs: 38.4,
            fats: 26.7,
            fiber: 0.0
        },
        defaultPricePerKg: 3500,
        marketPrice2026: 3500,
        priceUnit: "kg",
        priceSource: "auchan",
        priceSourceLabel: "Auchan Sénégal",
        sourceRef: "Auchan Sénégal (auchan.sn)",
        purchaseFormats: [
            { qty: 500, unit: "g", price: 1750, label: "Sachet 500g" },
            { qty: 1000, unit: "g", price: 3500, label: "Boîte 1 kg" }
        ],
        isLocalSenegal: false,
        tags: ["sans-gluten", "concentre-calcium"],
        description: "Lait entier en poudre emballé, vendu en sachet de 500g ou boîte de 1 kg à Auchan Sénégal."
    },
    {
        id: "soumbala-netetou",
        name: "Graines de néré fermentées",
        category: "huiles_condiments",
        categoryLabel: "Matières Grasses & Assaisonnements",
        servingUnit: "g",
        unitWeightGrams: 20,
        per100g: {
            calories: 380,
            proteins: 35.0,
            carbs: 22.0,
            fats: 16.0,
            fiber: 8.0
        },
        defaultPricePerKg: 3000,
        marketPrice2026: 2500,
        priceUnit: "kg",
        priceSource: "marche_local",
        priceSourceLabel: "Marché local",
        sourceRef: "Marchés locaux (ANSD/CSAR 2026)",
        purchaseFormats: [
            { qty: 50, unit: "g", price: 125, label: "Boulette 50g" },
            { qty: 100, unit: "g", price: 250, label: "Boulette 100g" }
        ],
        isLocalSenegal: true,
        tags: ["sans-gluten", "substitut-sain-bouillon", "proteines"],
        description: "Condiment traditionnel fermenté naturel au goût umami puissant, vendu en boulettes au marché."
    }
];

// Catégories officielles disponibles (Français neutre)
const INGREDIENT_CATEGORIES = [
    { id: "all", label: "Tous les ingrédients" },
    { id: "cereales_feculents", label: "Céréales & Féculents" },
    { id: "legumineuses", label: "Légumineuses & Graines" },
    { id: "poissons_viandes_oeufs", label: "Poissons, Viandes & Œufs" },
    { id: "legumes", label: "Légumes & Feuilles" },
    { id: "fruits", label: "Fruits" },
    { id: "boissons_infusions", label: "Thés, Boissons & Infusions" },
    { id: "huiles_condiments", label: "Matières Grasses & Épices" },
    { id: "produits_laitiers", label: "Produits Laitiers" }
];

// Export pour Node.js et navigateurs
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        SEN_INGREDIENTS,
        INGREDIENT_CATEGORIES,
        PRICE_REFERENCE,
        AUCHAN_PRICE_REFERENCE,
        MARCHE_LOCAL_PRICE_REFERENCE
    };
}
if (typeof window !== "undefined") {
    window.NutriData = {
        SEN_INGREDIENTS,
        INGREDIENT_CATEGORIES,
        PRICE_REFERENCE,
        AUCHAN_PRICE_REFERENCE,
        MARCHE_LOCAL_PRICE_REFERENCE
    };
}
