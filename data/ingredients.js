/**
 * NutriBudget - Base de Données des Ingrédients Locaux & Saisonniers (Sénégal / Dakar)
 * Données nutritionnelles pour 100g de partie comestible.
 * Sources scientifiques de référence : Table de composition des aliments d'Afrique de l'Ouest (FAO/INFOODS) & Ciqual.
 * Prix indicatifs moyens observés sur les marchés de Dakar en Francs CFA (XOF).
 */

const SEN_INGREDIENTS = [
    // ==========================================
    // CÉRÉALES, GRAINES & FÉCULENTS
    // ==========================================
    {
        id: "riz-brise-ordinaire",
        name: "Riz brisé blanc (Riz ordinaire / Ceeb)",
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
        defaultPricePerKg: 500, // ~500 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "economique", "base-locale"],
        description: "Aliment de base au Sénégal, utilisé pour le ceebu jën, ceebu yapp et riz au gras."
    },
    {
        id: "riz-parfume",
        name: "Riz parfumé (Riz de luxe)",
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
        defaultPricePerKg: 750, // ~750 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "base-locale"],
        description: "Riz à grains longs parfumé, apprécié pour les repas dominicaux et grandes occasions."
    },
    {
        id: "mil-arraw",
        name: "Mil en grains / Sankhal / Arraw (Dugub)",
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
        defaultPricePerKg: 600, // ~600 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "riche-en-fibres", "economique", "produit-terroir"],
        description: "Céréale ancestrale sénégalaise très nutritive, riche en fer, magnésium et fibres."
    },
    {
        id: "thiakry-mil",
        name: "Thiakry / Couscous de mil précuit",
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
        defaultPricePerKg: 1000, // ~1000 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "dessert-traditionnel", "produit-terroir"],
        description: "Granules de mil roulées et étuvées, servies traditionnellement avec du lait caillé."
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
        defaultPricePerKg: 1500, // ~1500 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "faible-glycemie", "produit-terroir"],
        description: "Super-céréale d'Afrique de l'Ouest, digeste et particulièrement adaptée aux personnes diabétiques."
    },
    {
        id: "patate-douce",
        name: "Patate douce locale",
        category: "cereales_feculents",
        categoryLabel: "Céréales & Féculents",
        servingUnit: "g",
        unitWeightGrams: 200, // ~200g la pièce
        per100g: {
            calories: 86,
            proteins: 1.6,
            carbs: 20.1,
            fats: 0.1,
            fiber: 3.0
        },
        defaultPricePerKg: 500, // ~500 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "vitamine-a", "economique"],
        description: "Tubercule riche en bêta-carotène et glucides lents, très accessible sur les marchés."
    },
    {
        id: "manioc",
        name: "Manioc frais (Ñambé)",
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
        defaultPricePerKg: 400, // ~400 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "economique", "energie-durable"],
        description: "Tubercule rassasiant, économique et source d'énergie durable pour les familles."
    },
    {
        id: "pain-tapalapa",
        name: "Pain Tapalapa (artisanal)",
        category: "cereales_feculents",
        categoryLabel: "Céréales & Féculents",
        servingUnit: "g",
        unitWeightGrams: 250, // ~250g la baguette
        per100g: {
            calories: 265,
            proteins: 9.0,
            carbs: 52.0,
            fats: 1.8,
            fiber: 3.5
        },
        defaultPricePerKg: 600, // ~150 FCFA la baguette de 250g = 600 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["economique", "petit-dejeuner"],
        description: "Pain traditionnel dense à base de farine de blé et de mil/maïs, très populaire au petit-déjeuner."
    },

    // ==========================================
    // LÉGUMINEUSES & PROTÉINES VÉGÉTALES
    // ==========================================
    {
        id: "niebe",
        name: "Niébé sec (Haricot local / Ñebbe)",
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
        defaultPricePerKg: 900, // ~900 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "tres-riche-proteines", "economique", "fer", "vegan"],
        description: "L'or noir protéique d'Afrique de l'Ouest. Idéal pour les budgets modestes : 24% de protéines végétales !"
    },
    {
        id: "arachides-crues",
        name: "Arachides décortiquées (Guerté)",
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
        defaultPricePerKg: 1000, // ~1000 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "bonnes-graisses", "proteines", "produit-terroir"],
        description: "Produit phare de l'agriculture sénégalaise, riche en lipides mono-insaturés et protéines."
    },
    {
        id: "pate-arachide",
        name: "Pâte d'arachide pure (Tigadèguè)",
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
        defaultPricePerKg: 1200, // ~1200 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "riche-en-energie", "sauce-mafe"],
        description: "Ingrédient central de la fameuse sauce Mafé, concentré d'énergie et de minéraux."
    },

    // ==========================================
    // POISSONS, VIANDES & ŒUFS
    // ==========================================
    {
        id: "yaboye-sardinelle",
        name: "Yaboye frais (Sardinelle / Poisson populaire)",
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
        defaultPricePerKg: 1000, // ~500 à 1000 FCFA / kg selon arrivage Soumbédioune
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "omega-3", "economique", "proteines-pures"],
        description: "Le poisson le plus accessible et nutritif du littoral dakarois, concentré en oméga-3 et calcium."
    },
    {
        id: "sardines-boite",
        name: "Sardines à l'huile (en conserve)",
        category: "poissons_viandes_oeufs",
        categoryLabel: "Poissons, Viandes & Œufs",
        servingUnit: "g",
        unitWeightGrams: 125, // Boîte standard 125g
        per100g: {
            calories: 208,
            proteins: 24.6,
            carbs: 0.0,
            fats: 11.5,
            fiber: 0.0
        },
        defaultPricePerKg: 3200, // ~400 FCFA la boîte de 125g = 3200 FCFA/kg
        priceUnit: "kg",
        isLocalSenegal: false,
        tags: ["sans-gluten", "omega-3", "conservation-facile", "proteines"],
        description: "Protéine prête à l'emploi idéale pour enrichir le petit-déjeuner ou les dîners rapides."
    },
    {
        id: "oeuf-poule",
        name: "Œuf de poule frais (pièce)",
        category: "poissons_viandes_oeufs",
        categoryLabel: "Poissons, Viandes & Œufs",
        servingUnit: "piece",
        unitWeightGrams: 55, // 1 œuf moyen ~ 55g
        per100g: {
            calories: 143,
            proteins: 12.6,
            carbs: 0.7,
            fats: 9.9,
            fiber: 0.0
        },
        defaultPricePerKg: 2270, // ~125 FCFA l'œuf = 2270 FCFA / kg (ou 125 FCFA pièce)
        pricePerPiece: 125,
        priceUnit: "piece",
        isLocalSenegal: true,
        tags: ["sans-gluten", "proteines-completes", "economique"],
        description: "Protéine de référence à haute valeur biologique, cuisson ultra-rapide."
    },
    {
        id: "thiof-merou",
        name: "Thiof frais (Mérou blanc)",
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
        defaultPricePerKg: 5000, // ~4500 à 6000 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "poisson-noble", "faible-lipides", "proteines"],
        description: "Poisson emblématique du Ceebu Jën Penda Mbaye, chair blanche très maigre et savoureuse."
    },
    {
        id: "poulet-fermier",
        name: "Poulet local découpé",
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
        defaultPricePerKg: 3000, // ~3000 FCFA / kg (poulet ~1.2kg à 3500 FCFA)
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "proteines-maigres", "yassa-poulet"],
        description: "Viande blanche très appréciée, base du Yassa Poulet mariné aux oignons et citron vert."
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
        defaultPricePerKg: 4000, // ~4000 FCFA / kg chez le boucher
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "fer-heminique", "proteines"],
        description: "Source concentrée de fer héminique et vitamine B12."
    },
    {
        id: "guedj-poisson-seche",
        name: "Guedj (Poisson séché fermenté)",
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
        defaultPricePerKg: 4500, // ~4500 FCFA / kg (souvent acheté par petits morceaux de 100 à 200 FCFA)
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "condiment-traditionnel", "haute-densite-proteique"],
        description: "Condiment umami traditionnel qui relève les sauces locales tout en apportant des protéines concentrées."
    },

    // ==========================================
    // LÉGUMES & FEUILLES LOCALES
    // ==========================================
    {
        id: "moringa-nebeday",
        name: "Feuilles de Moringa fraîches / séchées (Nébéday)",
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
        defaultPricePerKg: 1500, // ~1500 FCFA / kg (vendu en bottes de 100 à 250 FCFA)
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "super-aliment", "vitamines-a-c", "fer", "calcium"],
        description: "L'arbre de vie sénégalais. Exceptionnelle densité nutritionnelle en fer, calcium et vitamines."
    },
    {
        id: "gombo-frais",
        name: "Gombo frais (Kandia)",
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
        defaultPricePerKg: 800, // ~800 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "faible-calorie", "fibres-solubles", "sauce-kandia"],
        description: "Légume mucilagineux excellent pour le transit, base de la sauce Soupe Kandia."
    },
    {
        id: "diakhatou",
        name: "Diakhatou (Aubergine amère locale)",
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
        defaultPricePerKg: 600, // ~600 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "faible-calorie", "digestif", "economique"],
        description: "Légume amer traditionnel qui stimule la sécrétion biliaire et favorise la digestion des repas."
    },
    {
        id: "oignon-jaune",
        name: "Oignons locaux (Soblé)",
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
        defaultPricePerKg: 500, // ~500 FCFA / kg (selon récoltes des Niayes)
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "antioxydant", "base-cuisson"],
        description: "L'incontournable de la cuisine dakaroise (base de tous les ragoûts, marinades et Yassa)."
    },
    {
        id: "carotte",
        name: "Carotte des Niayes",
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
        defaultPricePerKg: 600, // ~600 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "pro-vitamine-a", "economique"],
        description: "Légume croquant cultivé localement dans la zone des Niayes."
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
        defaultPricePerKg: 400, // ~400 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "tres-faible-calorie", "economique", "vitamine-c"],
        description: "Légume économique présent dans presque tous les plats mijotés sénégalais."
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
        defaultPricePerKg: 600, // ~600 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "lycopene", "hydratant"],
        description: "Apporte fraîcheur et lycopène protecteur pour le système cardiovasculaire."
    },
    {
        id: "tomate-concentree",
        name: "Pâte de tomate concentrée",
        category: "legumes",
        categoryLabel: "Légumes & Feuilles",
        servingUnit: "g",
        unitWeightGrams: 70, // Petite boîte standard
        per100g: {
            calories: 82,
            proteins: 4.3,
            carbs: 15.0,
            fats: 0.5,
            fiber: 4.1
        },
        defaultPricePerKg: 2000, // ~150 FCFA la boîte de 70g = 2100 FCFA/kg
        priceUnit: "kg",
        isLocalSenegal: false,
        tags: ["sans-gluten", "ceeb-rouge", "sauce-tomate"],
        description: "Donne sa couleur rubis et sa profondeur de goût au Ceebu Jën rouge."
    },
    {
        id: "feuilles-bissap-vert",
        name: "Bissap vert / Oseille de Guinée (Feuilles)",
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
        defaultPricePerKg: 1000, // En bottes de 100 FCFA
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "acidule", "fer", "sauce-beugue"],
        description: "Feuilles acidulées indispensables à la sauce Beugueudj pour accompagner le riz."
    },

    // ==========================================
    // FRUITS LOCAUX & SAISONNIERS
    // ==========================================
    {
        id: "mangue-locale",
        name: "Mangue fraîche (saisonnière)",
        category: "fruits",
        categoryLabel: "Fruits",
        servingUnit: "g",
        unitWeightGrams: 250,
        per100g: {
            calories: 60,
            proteins: 0.8,
            carbs: 15.0,
            fats: 0.4,
            fiber: 1.6
        },
        defaultPricePerKg: 500, // ~400 à 700 FCFA / kg en pleine saison
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "vitamine-c", "antioxydants", "saisonnier"],
        description: "Reine des fruits au Sénégal de mai à août, délicieuse en dessert ou smoothie vitaminé."
    },
    {
        id: "banane-douce",
        name: "Banane douce locale",
        category: "fruits",
        categoryLabel: "Fruits",
        servingUnit: "g",
        unitWeightGrams: 120, // 1 banane moyenne
        per100g: {
            calories: 89,
            proteins: 1.1,
            carbs: 22.8,
            fats: 0.3,
            fiber: 2.6
        },
        defaultPricePerKg: 700, // ~700 FCFA / kg (environ 100 FCFA la pièce)
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "potassium", "energie-rapide"],
        description: "Excellente source de potassium et d'énergie saine pour le petit-déjeuner ou l'entraînement."
    },
    {
        id: "papaye",
        name: "Papaye mûre",
        category: "fruits",
        categoryLabel: "Fruits",
        servingUnit: "g",
        unitWeightGrams: 400,
        per100g: {
            calories: 43,
            proteins: 0.5,
            carbs: 10.8,
            fats: 0.3,
            fiber: 1.7
        },
        defaultPricePerKg: 600, // ~600 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "papaine-digestive", "vitamine-c"],
        description: "Riche en papaïne pour faciliter la digestion gastrique."
    },
    {
        id: "pain-de-singe-bouye",
        name: "Pulpe de Baobab séchée (Bouye / Pain de singe)",
        category: "fruits",
        categoryLabel: "Fruits",
        servingUnit: "g",
        per100g: {
            calories: 240,
            proteins: 2.8,
            carbs: 76.0,
            fats: 0.2,
            fiber: 44.0 // Extraordinairement riche en prébiotiques !
        },
        defaultPricePerKg: 1500, // ~1500 FCFA / kg en sachets
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "super-fruit", "vitamine-c-concentree", "prebiotiques", "calcium"],
        description: "Contient 6 fois plus de vitamine C qu'une orange et 2 fois plus de calcium que le lait."
    },

    // ==========================================
    // BOISSONS, INFUSIONS & CONDIMENTS TRADITIONNELS
    // ==========================================
    {
        id: "kinkeliba",
        name: "Feuilles de Kinkeliba séchées (Seh-Haw)",
        category: "boissons_infusions",
        categoryLabel: "Thés, Boissons & Infusions",
        servingUnit: "g",
        per100g: {
            calories: 2, // Infusion quasiment acalorique
            proteins: 0.1,
            carbs: 0.4,
            fats: 0.0,
            fiber: 0.0
        },
        defaultPricePerKg: 2000, // Vendu en grosses bottes à 200 - 500 FCFA
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "zero-sucre", "drainant-hepatique", "petit-dejeuner"],
        description: "La tisane de santé par excellence au Sénégal, dépurative du foie et excellente au réveil."
    },
    {
        id: "fleurs-bissap-rouge",
        name: "Fleurs d'Hibiscus séchées (Bissap rouge)",
        category: "boissons_infusions",
        categoryLabel: "Thés, Boissons & Infusions",
        servingUnit: "g",
        per100g: {
            calories: 37, // Brute sans sucre ajouté
            proteins: 0.4,
            carbs: 7.4,
            fats: 0.1,
            fiber: 0.3
        },
        defaultPricePerKg: 1500, // ~1500 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "antioxydant-puissant", "baisse-tension", "sans-sucre"],
        description: "Boisson nationale sénégalaise, réputée pour réguler naturellement la tension artérielle."
    },
    {
        id: "the-ataya",
        name: "Thé vert en feuilles (Base Ataya / Menthe)",
        category: "boissons_infusions",
        categoryLabel: "Thés, Boissons & Infusions",
        servingUnit: "g",
        per100g: {
            calories: 1,
            proteins: 0.1,
            carbs: 0.2,
            fats: 0.0,
            fiber: 0.0
        },
        defaultPricePerKg: 3000, // Paquet standard ~500 FCFA
        priceUnit: "kg",
        isLocalSenegal: false,
        tags: ["sans-gluten", "stimulant", "antioxydants"],
        description: "Thé vert utilisé pour la cérémonie de l'Ataya, riche en polyphénols antioxydants."
    },
    {
        id: "cafe-touba",
        name: "Café Touba (moulu avec piment noir de Guinée / Djar)",
        category: "boissons_infusions",
        categoryLabel: "Thés, Boissons & Infusions",
        servingUnit: "g",
        per100g: {
            calories: 2,
            proteins: 0.1,
            carbs: 0.3,
            fats: 0.0,
            fiber: 0.0
        },
        defaultPricePerKg: 2500, // Paquet 250g ~ 600 FCFA
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "stimulant-digestif", "djar", "tonifiant"],
        description: "Café aromatisé au Djar (Xylopia aethiopica), doté de vertus tonifiantes et digestives reconnues."
    },
    {
        id: "gingembre-frais",
        name: "Gingembre frais (Gnamakoudji)",
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
        defaultPricePerKg: 1000, // ~1000 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "anti-inflammatoire", "vitalite"],
        description: "Racine tonique aux puissantes vertus anti-inflammatoires, utilisée en jus ou infusion."
    },

    // ==========================================
    // HUILES, PRODUITS LAITIERS & CONDIMENTS
    // ==========================================
    {
        id: "huile-arachide",
        name: "Huile d'arachide raffinée",
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
        defaultPricePerKg: 1200, // ~1200 FCFA / litre
        priceUnit: "l",
        isLocalSenegal: true,
        tags: ["sans-gluten", "pure-lipides", "haute-cuisson"],
        description: "Huile de cuisson principale au Sénégal. À doser avec modération pour maîtriser les calories."
    },
    {
        id: "huile-palme-rouge",
        name: "Huile de palme rouge artisanale",
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
        defaultPricePerKg: 1500, // ~1500 FCFA / litre
        priceUnit: "l",
        isLocalSenegal: true,
        tags: ["sans-gluten", "vitamine-e", "pro-vitamine-a", "sauce-kandia"],
        description: "Huile non raffinée rougeoyante, riche en caroténoïdes naturels et tocotriénols."
    },
    {
        id: "lait-caille-kossam",
        name: "Lait caillé pasteurisé / Kossam",
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
        defaultPricePerKg: 1000, // ~1000 FCFA / kg ou sachet
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "probiotiques", "calcium", "thiakry"],
        description: "Lait fermenté riche en ferments lactiques protecteurs pour le microbiote intestinal."
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
        defaultPricePerKg: 3500, // ~3500 FCFA / kg
        priceUnit: "kg",
        isLocalSenegal: false,
        tags: ["sans-gluten", "concentre-calcium", "petit-dejeuner"],
        description: "Très utilisé pour enrichir les bouillies de mil (arraw) et le café matinal."
    },
    {
        id: "soumbala-netetou",
        name: "Nététou / Soumbala (Graines de néré fermentées)",
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
        defaultPricePerKg: 3000, // Boulettes à 50 - 100 FCFA
        priceUnit: "kg",
        isLocalSenegal: true,
        tags: ["sans-gluten", "probiotique-traditionnel", "substitut-cube", "proteines", "vegan"],
        description: "Super-exhausteur de goût naturel ouest-africain, excellente alternative saine aux cubes industriels trop salés !"
    }
];

// Catégories officielles disponibles
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

// Export pour modules JS ou environnement global navigateur
if (typeof module !== "undefined" && module.exports) {
    module.exports = { SEN_INGREDIENTS, INGREDIENT_CATEGORIES };
}
if (typeof window !== "undefined") {
    window.NutriData = {
        SEN_INGREDIENTS,
        INGREDIENT_CATEGORIES
    };
}
