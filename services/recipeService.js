/**
 * NutriBudget - Service Générateur de Recettes & Sélecteur d'Ingrédients (Étape 4)
 * 
 * PRINCIPE D'OR ARCHITECTURAL :
 * L'IA / le générateur ne calcule JAMAIS les calories, macros ou coûts.
 * Tous les calculs sont délégués de manière 100% déterministe à NutriCalculator.
 */

(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        const ingredientsModule = require("../data/ingredients.js");
        const calculatorModule = require("./nutritionCalculator.js");
        const profileModule = require("./userProfileService.js");
        module.exports = factory(
            ingredientsModule.SEN_INGREDIENTS,
            ingredientsModule.INGREDIENT_CATEGORIES,
            calculatorModule,
            profileModule
        );
    } else {
        root.NutriRecipes = factory(
            root.NutriData ? root.NutriData.SEN_INGREDIENTS : [],
            root.NutriData ? root.NutriData.INGREDIENT_CATEGORIES : [],
            root.NutriCalculator,
            root.NutriProfile
        );
    }
})(typeof self !== "undefined" ? self : this, function (ingredients, categories, calculator, profileService) {
    "use strict";

    // ============================================================
    // CATALOGUE OFFICIEL DES VRAIES RECETTES HEALTHY DU MONDE & DU SÉNÉGAL
    // Vraies recettes qui existent, saines, équilibrées et en français simple
    // ============================================================
    const RECIPE_CATALOG = [
        {
            id: "recette-salade-avocat-oeuf-poulet",
            title: "Salade d'avocat, œufs durs et poulet grillé",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 10,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🥗",
            description: "Une grande salade complète, riche en protéines maigres et bonnes graisses mono-insaturées, avec avocat crémeux et poulet grillé.",
            chefTip: "Faites dorer le poulet à sec ou avec une goutte d'huile d'olive, puis laissez-le tiédir avant de le mélanger aux crudités fraîches.",
            tags: ["sans-gluten", "riche-en-proteines", "bonnes-graisses", "healthy", "salade"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 300, unit: "g" },
                { ingredientId: "avocat", quantity: 1, unit: "piece" },
                { ingredientId: "oeuf-poule", quantity: 2, unit: "piece" },
                { ingredientId: "salade-verte", quantity: 150, unit: "g" },
                { ingredientId: "tomate-fraiche", quantity: 150, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Assaisonner les blancs de poulet d'une pincée de sel et de poivre, puis les faire griller à la poêle 4 à 5 minutes par face.",
                "Cuire les œufs 9 minutes dans de l'eau bouillante pour obtenir des œufs durs, les refroidir sous l'eau froide et les écaler.",
                "Laver et essorer la salade verte. Couper les tomates en quartiers et l'avocat en lamelles régulières.",
                "Dresser le lit de salade verte dans deux grandes assiettes ou bols.",
                "Trancher le poulet grillé en lamelles et le disposer sur la salade avec l'avocat, les tomates et les œufs coupés en deux.",
                "Arroser d'un filet d'huile d'olive et d'un trait de jus de citron avant de déguster."
            ]
        },
        {
            id: "recette-poulet-grille-riz-legumes",
            title: "Poulet grillé, riz et légumes sautés",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 20,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🍗",
            description: "Le déjeuner équilibré par excellence : morceaux de poulet dorés, riz blanc léger et poêlée croquante de courgettes et carottes.",
            chefTip: "Faites sauter les légumes à feu vif pendant quelques minutes seulement pour préserver leur texture croquante et leurs vitamines.",
            tags: ["sans-gluten", "riche-en-proteines", "equilibre", "legumes-frais"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 350, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 160, unit: "g" },
                { ingredientId: "courgette", quantity: 200, unit: "g" },
                { ingredientId: "carotte", quantity: 150, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 100, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Rincer le riz blanc et le faire cuire dans deux fois son volume d'eau légèrement salée pendant 15 minutes.",
                "Couper les carottes et les courgettes en fines rondelles, et émincer l'oignon.",
                "Dans une poêle avec la moitié de l'huile, faire dorer les morceaux de poulet assaisonnés de sel et de poivre pendant 10 minutes.",
                "Dans une seconde poêle bien chaude, faire sauter l'oignon, les carottes et les courgettes avec le reste d'huile pendant 7 à 8 minutes.",
                "Dresser les assiettes avec une portion de riz blanc, les légumes sautés croquants et le poulet grillé bien chaud."
            ]
        },
        {
            id: "recette-omelette-legumes-pain",
            title: "Omelette aux légumes et pain",
            mealType: "petit_dejeuner",
            prepTimeMinutes: 10,
            cookingTimeMinutes: 8,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🍳",
            description: "Une omelette fondante et colorée aux tomates fraîches, oignons doux et poivrons, servie avec du bon pain croustillant.",
            chefTip: "Ajoutez une cuillère à soupe d'eau aux œufs battus pour rendre l'omelette encore plus aérée et moelleuse.",
            tags: ["vegetarien", "rapide", "petit-dejeuner", "diner-leger", "proteines"],
            ingredients: [
                { ingredientId: "oeuf-poule", quantity: 4, unit: "piece" },
                { ingredientId: "tomate-fraiche", quantity: 120, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 80, unit: "g" },
                { ingredientId: "poivron", quantity: 100, unit: "g" },
                { ingredientId: "pain-frais", quantity: 120, unit: "g" },
                { ingredientId: "huile-olive", quantity: 10, unit: "ml" }
            ],
            steps: [
                "Émincer l'oignon et le poivron, et couper la tomate en petits dés.",
                "Faire revenir les légumes dans une poêle avec l'huile d'olive pendant 4 minutes pour les attendrir.",
                "Battre les 4 œufs entiers dans un bol avec une pincée de sel et un tour de poivre.",
                "Verser les œufs battus sur les légumes dans la poêle chaude.",
                "Laisser cuire à feu moyen 4 minutes en ramenant délicatement les bords vers le centre.",
                "Plier l'omelette en deux et servir immédiatement avec les tranches de pain frais."
            ]
        },
        {
            id: "recette-poisson-grille-pommes-salade",
            title: "Poisson grillé, pommes de terre vapeur et salade",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 20,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🐟",
            description: "Filet de poisson frais délicatement grillé, servi avec des pommes de terre fondantes cuites à la vapeur et une salade verte fraîche.",
            chefTip: "Un simple filet de jus de citron frais au moment de servir rehausse la finesse du poisson sans ajouter de sodium.",
            tags: ["sans-gluten", "omega-3", "poisson", "healthy", "faible-gras"],
            ingredients: [
                { ingredientId: "poisson-blanc", quantity: 350, unit: "g" },
                { ingredientId: "pommes-de-terre", quantity: 300, unit: "g" },
                { ingredientId: "salade-verte", quantity: 120, unit: "g" },
                { ingredientId: "tomate-fraiche", quantity: 100, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Éplucher les pommes de terre, les couper en morceaux et les cuire à la vapeur ou à l'eau bouillante salée pendant 18 à 20 minutes.",
                "Assaisonner les filets de poisson frais avec sel, poivre et un peu d'ail émincé.",
                "Dans une poêle antiadhésive avec un filet d'huile d'olive, saisir le poisson 3 à 4 minutes de chaque côté jusqu'à cuisson parfaite.",
                "Laver la salade verte et couper la tomate en dés.",
                "Dresser harmonieusement : le poisson grillé, les pommes de terre vapeur arrosées d'un filet d'huile d'olive et la salade verte croquante."
            ]
        },
        {
            id: "recette-salade-thon-haricots-oeufs",
            title: "Salade de thon, haricots verts et œufs",
            mealType: "diner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 10,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🥗",
            description: "Une salade fraîche et rassasiante façon niçoise : haricots verts croquants, thon au naturel émietté, œufs durs et tomates juteuses.",
            chefTip: "Plongez les haricots verts dans l'eau très froide juste après la cuisson pour stopper la cuisson et fixer leur belle couleur verte.",
            tags: ["sans-gluten", "riche-en-proteines", "faible-calorie", "healthy", "salade"],
            ingredients: [
                { ingredientId: "thon-naturel", quantity: 160, unit: "g" },
                { ingredientId: "haricots-verts", quantity: 250, unit: "g" },
                { ingredientId: "oeuf-poule", quantity: 2, unit: "piece" },
                { ingredientId: "tomate-fraiche", quantity: 150, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 50, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Équeuter les haricots verts et les plonger 8 à 10 minutes dans l'eau bouillante salée, puis les égoutter.",
                "Faire cuire les œufs 9 minutes dans de l'eau frémissante, les refroidir, les écaler et les couper en deux.",
                "Égoutter le thon au naturel et l'émietter à la fourchette.",
                "Couper les tomates en quartiers et émincer l'oignon très finement.",
                "Dans un grand saladier, réunir les haricots verts tiédis, les tomates, l'oignon et le thon émietté.",
                "Disposer les œufs durs sur le dessus, arroser d'huile d'olive, saler et poivrer légèrement."
            ]
        },
        {
            id: "recette-bowl-healthy-poulet-avocat",
            title: "Bowl healthy au poulet, avocat et riz",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 15,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🥑",
            description: "Un bowl complet équilibré : riz blanc tiède, émincé de poulet grillé, tranches d'avocat crémeux, carottes râpées et concombres croquants.",
            chefTip: "Ce bowl réunit tous les macronutriments idéaux (protéines pures, glucides complexes, bonnes graisses et fibres végétales).",
            tags: ["sans-gluten", "healthy", "riche-en-proteines", "bonnes-graisses"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 300, unit: "g" },
                { ingredientId: "avocat", quantity: 1, unit: "piece" },
                { ingredientId: "riz-brise-ordinaire", quantity: 160, unit: "g" },
                { ingredientId: "carotte", quantity: 120, unit: "g" },
                { ingredientId: "concombre", quantity: 120, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Cuire le riz blanc dans de l'eau bouillante salée pendant 15 minutes, égoutter et laisser tiédir.",
                "Couper le poulet en aiguillettes et le faire dorer à la poêle avec un filet d'huile d'olive 8 minutes.",
                "Râper les carottes, trancher le concombre en rondelles et découper l'avocat en lamelles.",
                "Dans deux grands bols, disposer une base de riz blanc.",
                "Ajouter par sections le poulet grillé, les lamelles d'avocat, les carottes et le concombre.",
                "Arroser d'un filet d'huile d'olive et déguster immédiatement."
            ]
        },
        {
            id: "recette-salade-thon-avocat-crudites",
            title: "Salade fraîche au thon et avocat",
            mealType: "diner",
            prepTimeMinutes: 12,
            cookingTimeMinutes: 0,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🥑",
            description: "Une salade fraîche sans cuisson associant le thon au naturel, des dés d'avocat fondant, des concombres croquants et des tomates fraîches.",
            chefTip: "Idéale pour les soirs chauds ou quand on n'a pas le temps de cuisiner : prête en 10 minutes montre en main !",
            tags: ["sans-gluten", "sans-cuisson", "rapide", "healthy", "omega-3"],
            ingredients: [
                { ingredientId: "thon-naturel", quantity: 160, unit: "g" },
                { ingredientId: "avocat", quantity: 1, unit: "piece" },
                { ingredientId: "tomate-fraiche", quantity: 150, unit: "g" },
                { ingredientId: "concombre", quantity: 120, unit: "g" },
                { ingredientId: "salade-verte", quantity: 100, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Laver et essorer la salade verte, la répartir dans deux assiettes creuses.",
                "Couper l'avocat et les tomates en dés réguliers.",
                "Peler et trancher le concombre en fines rondelles.",
                "Égoutter le thon au naturel et le déposer au centre de chaque assiette.",
                "Garnir avec les dés d'avocat, de tomates et les rondelles de concombre.",
                "Assaisonner d'huile d'olive, d'une pincée de sel marin et d'un tour de moulin à poivre."
            ]
        },
        {
            id: "recette-poisson-riz-haricots-verts",
            title: "Filet de poisson, riz et haricots verts",
            mealType: "dejeuner",
            prepTimeMinutes: 12,
            cookingTimeMinutes: 15,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🐟",
            description: "Un plat sain et digeste : poisson blanc cuit à la poêle avec un filet d'huile d'olive, accompagné de riz blanc et de haricots verts vapeur.",
            chefTip: "Un repas hypocalorique riche en protéines maigres parfait pour les objectifs de maintien ou de perte de poids progressive.",
            tags: ["sans-gluten", "faible-calorie", "proteines-maigres", "healthy"],
            ingredients: [
                { ingredientId: "poisson-blanc", quantity: 350, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 160, unit: "g" },
                { ingredientId: "haricots-verts", quantity: 250, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Cuire le riz blanc dans de l'eau bouillante salée pendant 15 minutes.",
                "Équeuter les haricots verts et les cuire 10 minutes à la vapeur ou dans l'eau bouillante.",
                "Chauffer l'huile d'olive dans une poêle et saisir les filets de poisson 3 minutes de chaque côté avec sel et poivre.",
                "Servir le poisson moelleux entouré du riz blanc et des haricots verts vapeur bien chauds."
            ]
        },
        {
            id: "recette-boeuf-saute-poivrons-riz",
            title: "Poêlée de bœuf aux poivrons, oignons et riz",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 15,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🥩",
            description: "Fines lanières de bœuf saisies rapidement à la poêle avec des poivrons colorés et des oignons doux, servies sur un lit de riz blanc.",
            chefTip: "Saisissez la viande à feu vif pendant 2 à 3 minutes maximum pour qu'elle reste juteuse et tendre sans sécher.",
            tags: ["sans-gluten", "riche-en-fer", "proteines", "equilibre"],
            ingredients: [
                { ingredientId: "viande-boeuf", quantity: 300, unit: "g" },
                { ingredientId: "poivron", quantity: 150, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 150, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 160, unit: "g" },
                { ingredientId: "huile-arachide", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Cuire le riz blanc dans de l'eau bouillante salée pendant 15 minutes, égoutter.",
                "Couper le bœuf en fines lanières. Émincer les oignons et tailler les poivrons en lamelles.",
                "Dans une poêle bien chaude avec la moitié de l'huile, saisir le bœuf 3 minutes à feu vif, saler, poivrer et réserver.",
                "Faire sauter les poivrons et les oignons dans la même poêle avec le reste d'huile 6 minutes pour les dorer.",
                "Remettre le bœuf avec les légumes 1 minute pour réchauffer l'ensemble.",
                "Servir aussitôt avec le riz blanc bien chaud."
            ]
        },
        {
            id: "recette-toast-avocat-oeuf",
            title: "Toast d'avocat, œufs et salade verte",
            mealType: "petit_dejeuner",
            prepTimeMinutes: 10,
            cookingTimeMinutes: 5,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🥑",
            description: "Pain croustillant tartiné d'avocat écrasé au citron, surmonté d'œufs pochés ou au plat, accompagné de salade verte croquante.",
            chefTip: "Un petit-déjeuner complet plébiscité dans le monde entier pour son énergie saine et durable toute la matinée.",
            tags: ["vegetarien", "rapide", "petit-dejeuner", "bonnes-graisses"],
            ingredients: [
                { ingredientId: "pain-frais", quantity: 120, unit: "g" },
                { ingredientId: "avocat", quantity: 1, unit: "piece" },
                { ingredientId: "oeuf-poule", quantity: 2, unit: "piece" },
                { ingredientId: "salade-verte", quantity: 80, unit: "g" },
                { ingredientId: "tomate-fraiche", quantity: 80, unit: "g" },
                { ingredientId: "huile-olive", quantity: 10, unit: "ml" }
            ],
            steps: [
                "Faire griller les tranches de pain frais au grille-pain ou à la poêle.",
                "Écraser la chair d'avocat à la fourchette avec sel, poivre et une goutte de jus de citron.",
                "Dans une poêle avec l'huile d'olive, cuire les deux œufs au plat 3 minutes à feu moyen.",
                "Tartiner généreusement l'avocat écrasé sur le pain croustillant.",
                "Déposer un œuf au plat sur chaque tartine.",
                "Servir immédiatement avec une salade verte fraîche parsemée de dés de tomate."
            ]
        },
        {
            id: "recette-poulet-roti-pommes-de-terre",
            title: "Poulet rôti, pommes de terre et haricots verts",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 30,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🍗",
            description: "Morceaux de poulet dorés et croustillants, accompagnés de pommes de terre fondantes et de haricots verts cuits à la vapeur.",
            chefTip: "Faites rôtir les pommes de terre avec un peu d'oignon émincé pour leur donner une saveur caramélisée sans excès de matière grasse.",
            tags: ["sans-gluten", "riche-en-proteines", "familial", "healthy"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 400, unit: "g" },
                { ingredientId: "pommes-de-terre", quantity: 350, unit: "g" },
                { ingredientId: "haricots-verts", quantity: 200, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 100, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Éplucher les pommes de terre, les tailler en morceaux réguliers et émincer l'oignon.",
                "Mettre les pommes de terre et les oignons dans un plat avec l'huile d'olive, sel et poivre, et enfourner 30 minutes à 200°C.",
                "Assaisonner les morceaux de poulet et les faire dorer à la poêle ou au four avec les pommes de terre.",
                "Cuire les haricots verts à la vapeur pendant 10 minutes pour qu'ils restent bien verts et fermes.",
                "Dresser le poulet rôti croustillant avec les pommes de terre fondantes et les haricots verts chauds."
            ]
        },
        {
            id: "recette-ceebu-jen-sain",
            title: "Ceebu Jën Penda Mbaye Équilibré",
            mealType: "dejeuner",
            prepTimeMinutes: 45,
            cookingTimeMinutes: 50,
            difficulty: "Moyen",
            baseServings: 4,
            imageEmoji: "🍲",
            description: "Le plat national sénégalais revisité avec un dosage d'huile maîtrisé, du poisson frais riche en oméga-3 et une abondance de légumes locaux.",
            chefTip: "Remplacez le cube bouillon industriel par du Nététou et du poisson séché (Guedj) : vos artères vous remercieront et le goût authentique sera décuplé !",
            tags: ["traditionnel", "omega-3", "poisson", "sans-gluten"],
            ingredients: [
                { ingredientId: "yaboye-sardinelle", quantity: 600, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 360, unit: "g" },
                { ingredientId: "huile-arachide", quantity: 50, unit: "ml" },
                { ingredientId: "tomate-concentree", quantity: 70, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 200, unit: "g" },
                { ingredientId: "carotte", quantity: 200, unit: "g" },
                { ingredientId: "chou-blanc", quantity: 250, unit: "g" },
                { ingredientId: "diakhatou", quantity: 150, unit: "g" },
                { ingredientId: "feuilles-bissap-vert", quantity: 60, unit: "g" },
                { ingredientId: "soumbala-netetou", quantity: 20, unit: "g" },
                { ingredientId: "guedj-poisson-seche", quantity: 30, unit: "g" }
            ],
            steps: [
                "Nettoyer et vider le poisson Yaboye. Préparer le roff (hachis d'ail, piment, persil et une pincée de sel) et piquer la chair.",
                "Dans une marmite, chauffer légèrement l'huile d'arachide. Faire dorer délicatement le poisson puis le réserver.",
                "Faire revenir les oignons hachés et la tomate concentrée délayée dans un peu d'eau jusqu'à obtention d'une belle couleur rouge foncée.",
                "Ajouter le nététou, le guedj et 1,5 litre d'eau. Porter à ébullition puis incorporer les légumes (carotte, chou, diakhatou). Laisser mijoter 25 min.",
                "Retirer les légumes et le poisson, rectifier l'assaisonnement.",
                "Verser le riz brisé préalablement lavé et essoré dans le bouillon frémissant. Baisser à feu doux, couvrir hermétiquement et laisser cuire 20 min.",
                "Dresser le riz rouge au centre du plat, surmonté des légumes, du poisson et du beugueul de bissap vert."
            ]
        },
        {
            id: "recette-yassa-poulet-fonio",
            title: "Yassa au Poulet & Fonio Précuit",
            mealType: "dejeuner",
            prepTimeMinutes: 25,
            cookingTimeMinutes: 35,
            difficulty: "Facile",
            baseServings: 4,
            imageEmoji: "🍗",
            description: "Un Yassa savoureux et équilibré servi sur un lit de fonio complet, céréale locale à index glycémique bas recommandée aux diabétiques et sportifs.",
            chefTip: "Faites compoter la montagne d'oignons à feu doux avec du gingembre frais râpé pour développer une douceur naturellement caramélisée sans sucre.",
            tags: ["sans-gluten", "riche-en-fibres", "volaille", "faible-ig"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 600, unit: "g" },
                { ingredientId: "fonio", quantity: 300, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 450, unit: "g" },
                { ingredientId: "gingembre-frais", quantity: 20, unit: "g" },
                { ingredientId: "huile-arachide", quantity: 35, unit: "ml" }
            ],
            steps: [
                "Couper le poulet fermier en morceaux. Mariner avec du gingembre râpé, un peu de sel et d'épices douces.",
                "Dorer les morceaux de poulet dans une poêle sans excès d'huile.",
                "Dans une sauteuse, chauffer l'huile et faire fondre doucement la grande quantité d'oignons émincés jusqu'à translucidité dorée.",
                "Ajouter la marinade et un demi-verre d'eau. Laisser compoter 20 minutes à couvert.",
                "Pendant ce temps, cuire le fonio 5 minutes dans 2 fois son volume d'eau bouillante salée ou à la vapeur.",
                "Remettre les morceaux de poulet dans la sauce aux oignons 10 minutes à feu doux pour qu'ils s'imprègnent des sucs.",
                "Servir la compotée d'oignons sur le lit de fonio léger et aéré."
            ]
        },
        {
            id: "recette-soupou-kandia",
            title: "Soupou Kandia Terroir (Gombo & Poissons)",
            mealType: "dejeuner",
            prepTimeMinutes: 30,
            cookingTimeMinutes: 45,
            difficulty: "Moyen",
            baseServings: 4,
            imageEmoji: "🥣",
            description: "Sauce gluante traditionnelle au gombo frais, riche en mucilages digestifs et antioxydants, dosée modérément en huile de palme rouge brute.",
            chefTip: "L'huile de palme rouge brute (non raffinée) est l'une des sources végétales les plus riches en caroténoïdes (vitamine A) : 2 cuillères à soupe suffisent pour tout le plat !",
            tags: ["sans-gluten", "riche-en-fibres", "poisson", "terroir"],
            ingredients: [
                { ingredientId: "gombo-frais", quantity: 400, unit: "g" },
                { ingredientId: "yaboye-sardinelle", quantity: 400, unit: "g" },
                { ingredientId: "huile-palme-rouge", quantity: 30, unit: "ml" },
                { ingredientId: "riz-brise-ordinaire", quantity: 320, unit: "g" },
                { ingredientId: "soumbala-netetou", quantity: 20, unit: "g" },
                { ingredientId: "guedj-poisson-seche", quantity: 40, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 100, unit: "g" }
            ],
            steps: [
                "Hacher finement le gombo frais au couteau ou au mortier.",
                "Faire bouillir 1 litre d'eau avec le poisson frais nettoyé, le guedj émietté, le nététou et l'oignon haché.",
                "Après 15 min de bouillon, retirer délicatement le poisson frais.",
                "Verser le gombo haché dans le bouillon. Fouetter énergiquement avec une spatule en bois pour développer la texture soyeuse.",
                "Laisser cuire à feu doux pendant 20 minutes jusqu'à ce que la texture s'épaississe.",
                "Ajouter l'huile de palme rouge et remettre le poisson. Cuire encore 10 min à feu doux.",
                "Cuire le riz blanc brisé à la vapeur en accompagnement. Servir bien chaud."
            ]
        },
        {
            id: "recette-salade-niebe-fraicheur",
            title: "Salade Énergétique de Niébé & Crudités",
            mealType: "diner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 25,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🥗",
            description: "Une salade fraîche, économique et ultra-protéinée à base de haricots niébé sénégalais, idéale pour le soir ou en récupération sportive.",
            chefTip: "Le niébé est le super-aliment économique du Sénégal : 24g de protéines pour 100g, zéro cholestérol et un prix imbattable sur tous les marchés !",
            tags: ["vegetarien", "vegan", "economique", "sans-gluten", "riche-en-proteines"],
            ingredients: [
                { ingredientId: "niebe", quantity: 160, unit: "g" },
                { ingredientId: "tomate-fraiche", quantity: 150, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 80, unit: "g" },
                { ingredientId: "huile-arachide", quantity: 15, unit: "ml" },
                { ingredientId: "moringa-nebeday", quantity: 20, unit: "g" }
            ],
            steps: [
                "Rincer le niébé et le cuire dans une casserole d'eau bouillante pendant environ 25-30 minutes jusqu'à tendreté. Égoutter et laisser refroidir.",
                "Couper les tomates en petits dés.",
                "Émincer très finement l'oignon et le mélanger aux dés de tomates.",
                "Dans un grand saladier, réunir le niébé refroidi, les dés de crudités et les feuilles fraîches de moringa hachées.",
                "Arroser d'un filet d'huile d'arachide et d'une pincée de sel marin, mélanger délicatement et servir frais."
            ]
        },
        {
            id: "recette-omelette-dakaroise",
            title: "Omelette Dakaroise aux Légumes du Marché",
            mealType: "petit_dejeuner",
            prepTimeMinutes: 10,
            cookingTimeMinutes: 8,
            difficulty: "Très facile",
            baseServings: 1,
            imageEmoji: "🍳",
            description: "Un petit-déjeuner complet et rapide à haute teneur protéique pour bien démarrer la journée avec les œufs locaux et légumes des Niayes.",
            chefTip: "L'ajout de feuilles de Moringa (Nébéday) dans l'omelette apporte un concentré de fer et de calcium idéal dès le matin.",
            tags: ["vegetarien", "sans-gluten", "rapide", "petit-dejeuner", "riche-en-proteines"],
            ingredients: [
                { ingredientId: "oeuf-poule", quantity: 2, unit: "piece" },
                { ingredientId: "oignon-jaune", quantity: 50, unit: "g" },
                { ingredientId: "tomate-fraiche", quantity: 60, unit: "g" },
                { ingredientId: "moringa-nebeday", quantity: 15, unit: "g" },
                { ingredientId: "huile-arachide", quantity: 10, unit: "ml" }
            ],
            steps: [
                "Battre les deux œufs entiers dans un bol avec une pincée de sel et un tour de poivre.",
                "Hacher finement l'oignon, la tomate et les feuilles de moringa.",
                "Dans une poêle antiadhésive, chauffer l'huile d'arachide et faire suer les légumes 3 minutes.",
                "Verser les œufs battus uniformément sur les légumes dorés.",
                "Laisser cuire 3 à 4 minutes à feu moyen jusqu'à consistance soyeuse.",
                "Plier l'omelette en deux et servir immédiatement avec une tasse de Kinkeliba."
            ]
        },
        {
            id: "recette-arraw-porridge-fruits",
            title: "Porridge d'Arraw de Mil aux Fruits & Arachides",
            mealType: "petit_dejeuner",
            prepTimeMinutes: 5,
            cookingTimeMinutes: 15,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🥣",
            description: "Une bouillie énergétique traditionnelle à base de granules de mil (Arraw), adoucie au lait caillé frais (Kossam) et garnie de pâte d'arachide pure.",
            chefTip: "Le mil apporte une satiété durable toute la matinée grâce à sa richesse en fibres et en glucides complexes à diffusion lente.",
            tags: ["sans-gluten", "vegetarien", "energie", "petit-dejeuner"],
            ingredients: [
                { ingredientId: "mil-arraw", quantity: 100, unit: "g" },
                { ingredientId: "lait-caille-kossam", quantity: 200, unit: "g" },
                { ingredientId: "banane-douce", quantity: 1, unit: "piece" },
                { ingredientId: "pate-arachide", quantity: 25, unit: "g" },
                { ingredientId: "arachides-crues", quantity: 20, unit: "g" }
            ],
            steps: [
                "Dans une casserole, porter à ébullition 400 ml d'eau.",
                "Verser en pluie les granules d'Arraw de mil tout en remuant au fouet pour éviter les grumeaux.",
                "Baisser le feu et laisser épaissir 12 à 15 minutes en remuant régulièrement.",
                "Hors du feu, incorporer la pâte d'arachide pure (Tigadèguè).",
                "Verser dans deux bols, napper de lait caillé Kossam frais et parsemer de rondelles de banane douce et d'arachides concassées."
            ]
        },
        {
            id: "recette-thiakry-leger-mangue",
            title: "Thiakry Léger au Kossam & Mangue Fraîche",
            mealType: "collation",
            prepTimeMinutes: 10,
            cookingTimeMinutes: 10,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🍨",
            description: "Le dessert emblématique dakarois en version légère : couscous de mil étuvé, yaourt caillé Kossam et dés de mangue juteuse gorgée de soleil.",
            chefTip: "En saison des mangues (mai à août), profitez-en pour sucrer naturellement le thiakry sans aucun sucre raffiné ajouté !",
            tags: ["vegetarien", "dessert", "sans-gluten", "collation"],
            ingredients: [
                { ingredientId: "thiakry-mil", quantity: 120, unit: "g" },
                { ingredientId: "lait-caille-kossam", quantity: 250, unit: "g" },
                { ingredientId: "mangue-locale", quantity: 150, unit: "g" }
            ],
            steps: [
                "Réhydrater le couscous de thiakry dans un peu d'eau tiède ou cuire 5 min à la vapeur.",
                "Laisser refroidir à température ambiante.",
                "Peler et détailler la mangue en petits dés réguliers.",
                "Dans des verrines ou des bols, mélanger le thiakry aéré avec le lait caillé Kossam onctueux.",
                "Déposer généreusement les dés de mangue fraîche sur le dessus. Servir bien frais."
            ]
        },
        {
            id: "recette-poisson-braise-patates",
            title: "Poisson Braisé à la Dakaroise & Patates Douces",
            mealType: "diner",
            prepTimeMinutes: 20,
            cookingTimeMinutes: 25,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🐟",
            description: "Sardinelle Yaboye marinée et grillée, accompagnée de quartiers de patates douces dorées au four avec un concassé de tomates fraîches.",
            chefTip: "Cuire les patates douces au four plutôt qu'en friture divise les calories de moitié tout en préservant le fondant et le goût sucré naturel.",
            tags: ["sans-gluten", "riche-en-proteines", "poisson", "omega-3"],
            ingredients: [
                { ingredientId: "yaboye-sardinelle", quantity: 400, unit: "g" },
                { ingredientId: "patate-douce", quantity: 300, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 120, unit: "g" },
                { ingredientId: "tomate-fraiche", quantity: 80, unit: "g" },
                { ingredientId: "huile-arachide", quantity: 20, unit: "ml" }
            ],
            steps: [
                "Écailler, vider et entailler les poissons. Les enduire d'un hachis d'oignon, sel et poivre.",
                "Préchauffer le four à 200°C ou allumer un gril.",
                "Peler les patates douces, les tailler en quartiers, les enrober d'un filet d'huile d'arachide et enfourner 25 min.",
                "Griller les poissons 6 à 8 minutes par face jusqu'à ce que la peau soit croustillante et la chair tendre.",
                "Préparer une sauce crue d'oignons émincés et dés de tomates fraîches.",
                "Dresser le poisson chaud avec les patates douces rôties."
            ]
        },
        {
            id: "recette-kinkeliba-gingembre-vitalite",
            title: "Infusion Détox Kinkeliba, Bissap & Gingembre",
            mealType: "boisson",
            prepTimeMinutes: 5,
            cookingTimeMinutes: 10,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🫖",
            description: "La tisane de santé par excellence d'Afrique de l'Ouest. Hépato-protectrice, drainante et tonifiante sans caféine excitante.",
            chefTip: "À boire tiède au réveil ou après les repas pour faciliter la digestion et détoxifier le foie naturellement.",
            tags: ["sans-gluten", "vegan", "detox", "sans-cafeine", "boisson"],
            ingredients: [
                { ingredientId: "kinkeliba", quantity: 25, unit: "g" },
                { ingredientId: "gingembre-frais", quantity: 15, unit: "g" },
                { ingredientId: "fleurs-bissap-rouge", quantity: 15, unit: "g" }
            ],
            steps: [
                "Rincer rapidement les feuilles de kinkéliba et les fleurs de bissap rouge à l'eau claire.",
                "Écraser légèrement le morceau de gingembre frais.",
                "Dans une bouilloire ou casserole, verser 600 ml d'eau et porter à ébullition avec les plantes.",
                "Laisser frémir 7 à 10 minutes jusqu'à obtenir une belle couleur pourpre rubis et un parfum tonique.",
                "Filtrer l'infusion dans deux tasses. Déguster chaud ou glacé."
            ]
        },
        {
            id: "recette-smoothie-bouye-banane",
            title: "Smoothie Protecteur Bouye (Baobab) & Banane",
            mealType: "boisson",
            prepTimeMinutes: 5,
            cookingTimeMinutes: 0,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🥤",
            description: "Une boisson onctueuse et tonique au fruit du baobab (Bouye), qui contient 6 fois plus de vitamine C qu'une orange et un taux exceptionnel de calcium et potassium.",
            chefTip: "Idéal après un effort physique ou en collation de l'après-midi pour recharger ses minéraux sans fatigue digestive.",
            tags: ["sans-gluten", "vegetarien", "super-aliment", "vitamines", "boisson"],
            ingredients: [
                { ingredientId: "pain-de-singe-bouye", quantity: 40, unit: "g" },
                { ingredientId: "banane-douce", quantity: 2, unit: "piece" },
                { ingredientId: "lait-caille-kossam", quantity: 200, unit: "g" }
            ],
            steps: [
                "Diluer la poudre de pulpe de pain de singe (bouye) dans 150 ml d'eau tiède, puis filtrer si nécessaire.",
                "Dans un mixeur ou blender, placer les bananes pelées coupées en morceaux.",
                "Ajouter le lait caillé Kossam frais et le jus de bouye velouté.",
                "Mixer à pleine puissance pendant 45 secondes jusqu'à consistance mousseuse.",
                "Servir bien frais avec quelques glaçons."
            ]
        },
        {
            id: "recette-mafe-vegetarien-niebe",
            title: "Mafé Végétarien au Niébé & Patates Douces",
            mealType: "dejeuner",
            prepTimeMinutes: 20,
            cookingTimeMinutes: 40,
            difficulty: "Facile",
            baseServings: 4,
            imageEmoji: "🍲",
            description: "Une version végétale du classique Mafé dakarois où le haricot niébé apporte toutes les protéines nécessaires, sublimé par la pâte d'arachide et les patates douces fondantes.",
            chefTip: "Délayez toujours la pâte d'arachide dans une louche de bouillon chaud avant de l'incorporer pour une sauce soyeuse et sans grumeaux.",
            tags: ["vegetarien", "sans-gluten", "riche-en-proteines", "terroir", "economique"],
            ingredients: [
                { ingredientId: "niebe", quantity: 200, unit: "g" },
                { ingredientId: "pate-arachide", quantity: 100, unit: "g" },
                { ingredientId: "patate-douce", quantity: 300, unit: "g" },
                { ingredientId: "carotte", quantity: 150, unit: "g" },
                { ingredientId: "chou-blanc", quantity: 150, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 150, unit: "g" },
                { ingredientId: "tomate-concentree", quantity: 50, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 320, unit: "g" }
            ],
            steps: [
                "Cuire préalablement le niébé 25 minutes dans de l'eau bouillante non salée.",
                "Dans une marmite, faire revenir l'oignon haché et la tomate concentrée avec un fond d'eau.",
                "Ajouter 1 litre d'eau, porter à ébullition et incorporer les patates douces, carottes et chou en gros morceaux.",
                "Délayer la pâte d'arachide pure avec un peu de bouillon chaud et l'ajouter à la marmite. Ajouter le niébé précuit.",
                "Laisser mijoter à feu doux 25 minutes jusqu'à ce que la sauce épaississe et prenne une texture onctueuse.",
                "Cuire le riz blanc à la vapeur en accompagnement. Servir la sauce mafé bien chaude sur le riz."
            ]
        },
        {
            id: "recette-thiere-mboum-poulet",
            title: "Thiéré Mboum au Poulet & Feuilles de Moringa",
            mealType: "diner",
            prepTimeMinutes: 25,
            cookingTimeMinutes: 35,
            difficulty: "Moyen",
            baseServings: 4,
            imageEmoji: "🥣",
            description: "Le réconfortant couscous de mil sénégalais nappé d'une sauce verte Mboum aux feuilles de Moringa fraîches, réputé pour sa richesse en fer et son extrême digestibilité.",
            chefTip: "Le Moringa perd ses vitamines en surcuisson : n'ajoutez les feuilles hachées qu'au dernier quart d'heure de mijotage !",
            tags: ["traditionnel", "sans-gluten", "riche-en-fer", "volaille"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 500, unit: "g" },
                { ingredientId: "thiakry-mil", quantity: 300, unit: "g" },
                { ingredientId: "moringa-nebeday", quantity: 80, unit: "g" },
                { ingredientId: "arachides-crues", quantity: 40, unit: "g" },
                { ingredientId: "huile-arachide", quantity: 25, unit: "ml" },
                { ingredientId: "oignon-jaune", quantity: 150, unit: "g" },
                { ingredientId: "soumbala-netetou", quantity: 15, unit: "g" }
            ],
            steps: [
                "Faire dorer les morceaux de poulet dans une sauteuse avec l'huile d'arachide et l'oignon haché.",
                "Piler les arachides avec le nététou pour former une poudre aromatique.",
                "Mouiller avec 700 ml d'eau, incorporer la poudre d'arachides-nététou et laisser mijoter 20 minutes.",
                "Pendant ce temps, cuire le couscous de mil à la vapeur.",
                "Ajouter les feuilles de moringa lavées et émincées dans la sauce. Poursuivre la cuisson 10 minutes à feu doux.",
                "Dresser le couscous de mil chaud et napper généreusement de sauce Mboum."
            ]
        },
        {
            id: "recette-fonde-mil-kossam",
            title: "Fondé Onctueux de Mil au Kossam & Bouye",
            mealType: "petit_dejeuner",
            prepTimeMinutes: 10,
            cookingTimeMinutes: 20,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🥣",
            description: "Un petit-déjeuner traditionnel revigorant composé de boulettes de mil mijotées, servies avec du Kossam crémeux parfumé d'une note acidulée de pain de singe.",
            chefTip: "Le mélange mil + Kossam offre une combinaison protéines/calcium idéale pour soutenir une matinée active sans coup de pompe.",
            tags: ["vegetarien", "sans-gluten", "energie", "petit-dejeuner"],
            ingredients: [
                { ingredientId: "mil-arraw", quantity: 120, unit: "g" },
                { ingredientId: "lait-caille-kossam", quantity: 250, unit: "g" },
                { ingredientId: "pain-de-singe-bouye", quantity: 25, unit: "g" },
                { ingredientId: "banane-douce", quantity: 1, unit: "piece" }
            ],
            steps: [
                "Porter 500 ml d'eau à frémissement dans une casserole.",
                "Verser l'arraw de mil et laisser cuire à feu moyen 18 minutes en remuant jusqu'à ce que les granules soient tendres.",
                "Diluer la pulpe de bouye dans 3 cuillères à soupe d'eau tiède et l'incorporer au lait caillé Kossam.",
                "Répartir le fondé de mil chaud dans deux bols.",
                "Verser le coulis de Kossam au bouye sur le dessus et garnir de rondelles de banane douce."
            ]
        },
        {
            id: "recette-salade-fraicheur-mangue-oeuf",
            title: "Salade Fraîcheur des Niayes (Mangue & Œufs)",
            mealType: "diner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 10,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🥗",
            description: "Une salade croquante et légère qui marie la douceur de la mangue mûre du Sénégal aux œufs durs locaux et légumes râpés des Niayes.",
            chefTip: "Pour une vinaigrette dakaroise tonique, ajoutez une pointe de gingembre râpé à l'huile d'arachide.",
            tags: ["vegetarien", "sans-gluten", "rapide", "vitamines"],
            ingredients: [
                { ingredientId: "oeuf-poule", quantity: 2, unit: "piece" },
                { ingredientId: "mangue-locale", quantity: 150, unit: "g" },
                { ingredientId: "carotte", quantity: 120, unit: "g" },
                { ingredientId: "tomate-fraiche", quantity: 120, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 60, unit: "g" },
                { ingredientId: "huile-arachide", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Cuire les 2 œufs 9 minutes dans de l'eau frémissante pour obtenir des œufs durs. Écaler et couper en quartiers.",
                "Râper les carottes et tailler les tomates en petits dés.",
                "Émincer très finement l'oignon.",
                "Peler la mangue et la couper en fines lamelles.",
                "Disposer les carottes râpées, dés de tomates et mangue dans un plat.",
                "Poser les quartiers d'œufs durs au sommet, assaisonner d'huile d'arachide et d'une pincée de sel marin."
            ]
        }
    ];

    // ============================================================
    // GESTION DES FAVORIS UTILISATEUR (LocalStorage)
    // ============================================================
    const FAVORITES_STORAGE_KEY = "nutribudget_favorite_recipes";

    function getFavoriteIds() {
        if (typeof window === "undefined" || !window.localStorage) return [];
        try {
            const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function toggleFavorite(recipeId) {
        if (!recipeId) return false;
        const favs = getFavoriteIds();
        const index = favs.indexOf(recipeId);
        let isNowFav = false;
        if (index >= 0) {
            favs.splice(index, 1);
            isNowFav = false;
        } else {
            favs.push(recipeId);
            isNowFav = true;
        }
        if (typeof window !== "undefined" && window.localStorage) {
            try {
                window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favs));
            } catch (e) { }
        }
        return isNowFav;
    }

    function isFavorite(recipeId) {
        return getFavoriteIds().includes(recipeId);
    }

    // ============================================================
    // CALCUL DÉTERMINISTE D'UNE RECETTE (Couplage NutriCalculator)
    // ============================================================
    function enrichRecipeWithNutrition(recipe, targetServings = null) {
        if (!recipe) return null;
        const servings = targetServings || recipe.baseServings || 1;

        // Mise à l'échelle des ingrédients si servings != baseServings
        const scaleFactor = servings / (recipe.baseServings || 1);
        const scaledIngredients = (recipe.ingredients || []).map(item => ({
            ingredientId: item.ingredientId,
            quantity: Math.round(item.quantity * scaleFactor * 10) / 10,
            unit: item.unit
        }));

        // Calcul mathématique exact via NutriCalculator
        const nutritionData = calculator ? calculator.calculateRecipeNutrition(scaledIngredients, servings) : null;

        return {
            ...recipe,
            activeServings: servings,
            scaledIngredients,
            nutrition: nutritionData,
            isFavorite: isFavorite(recipe.id)
        };
    }

    // ============================================================
    // MOTEUR DE CORRESPONDANCE D'INGRÉDIENTS (PLACARD & FRIGO)
    // ============================================================
    function matchRecipesWithIngredients(userIngredientIds = [], options = {}) {
        const availableSet = new Set((userIngredientIds || []).map(id => String(id).toLowerCase().trim()));
        const mealType = options.mealType || "all";
        const maxBudget = options.maxBudget ? Number(options.maxBudget) : null;
        const maxPrepTime = options.maxPrepTime ? Number(options.maxPrepTime) : null;
        const servings = options.servings || 2;

        // Exclusions du profil utilisateur (ex: "arachides", "poisson", "porc", "gluten", "oeufs")
        const exclusions = (options.userExclusions || []).map(ex => String(ex).toLowerCase().trim());

        const results = [];

        RECIPE_CATALOG.forEach(rawRecipe => {
            // 1. Filtre type de repas
            if (mealType !== "all" && rawRecipe.mealType !== mealType) {
                return;
            }

            // 2. Filtre temps de préparation
            if (maxPrepTime && rawRecipe.prepTimeMinutes > maxPrepTime) {
                return;
            }

            // 3. Filtre exclusions alimentaires
            let containsExcluded = false;
            if (exclusions.length > 0) {
                for (const item of rawRecipe.ingredients) {
                    const ing = ingredients.find(i => i.id === item.ingredientId);
                    if (!ing) continue;

                    const ingTags = (ing.tags || []).map(t => t.toLowerCase());
                    const ingCat = (ing.category || "").toLowerCase();
                    const ingName = (ing.name || "").toLowerCase();
                    const ingId = (ing.id || "").toLowerCase();

                    for (const ex of exclusions) {
                        if (ex === "poisson" && (ingCat.includes("poisson") || ingTags.includes("poisson") || ingName.includes("poisson") || ingId.includes("yaboye") || ingId.includes("thiof") || ingId.includes("guedj") || ingId.includes("kethiakh"))) {
                            containsExcluded = true;
                            break;
                        }
                        if (ex === "arachides" && (ingId.includes("arachide") || ingName.includes("arachide") || ingTags.includes("arachide"))) {
                            containsExcluded = true;
                            break;
                        }
                        if (ex === "gluten" && !ingTags.includes("sans-gluten") && (ingCat.includes("cereale") && !ingId.includes("riz") && !ingId.includes("mil") && !ingId.includes("fonio"))) {
                            containsExcluded = true;
                            break;
                        }
                        if (ex === "oeufs" && (ingId.includes("oeuf") || ingName.includes("oeuf"))) {
                            containsExcluded = true;
                            break;
                        }
                        if (ex === "porc" && (ingId.includes("porc") || ingName.includes("porc"))) {
                            containsExcluded = true;
                            break;
                        }
                        if (ex === "lactose" && (ingCat.includes("lait") || ingName.includes("lait") || ingId.includes("lait") || ingId.includes("kossam"))) {
                            containsExcluded = true;
                            break;
                        }
                        // Détection générique pour tout aliment personnalisé
                        if (ex && ex.length >= 3) {
                            if (ingId.includes(ex) || ingName.includes(ex) || ingTags.some(t => t.includes(ex)) || ingCat.includes(ex)) {
                                containsExcluded = true;
                                break;
                            }
                        }
                    }
                    if (containsExcluded) break;
                }
            }
            if (containsExcluded) return;

            // 4. Enrichissement nutritionnel et budgétaire déterministe
            const enriched = enrichRecipeWithNutrition(rawRecipe, servings);

            // 5. Filtre budget max
            if (maxBudget && enriched.nutrition && enriched.nutrition.total.costFCFA > maxBudget) {
                return;
            }

            // 6. Analyse de correspondance des ingrédients
            const recipeIngIds = rawRecipe.ingredients.map(i => i.ingredientId);
            const totalRequired = recipeIngIds.length;
            const matchedIds = [];
            const missingIds = [];
            let missingCostFCFA = 0;

            enriched.scaledIngredients.forEach(item => {
                const isAvailable = availableSet.has(item.ingredientId);
                const itemNutrition = enriched.nutrition ? enriched.nutrition.items.find(ni => ni.ingredientId === item.ingredientId) : null;
                const itemCost = itemNutrition ? itemNutrition.costFCFA : 0;

                if (isAvailable) {
                    matchedIds.push(item.ingredientId);
                } else {
                    missingIds.push({
                        ingredientId: item.ingredientId,
                        quantity: item.quantity,
                        unit: item.unit,
                        costFCFA: itemCost,
                        name: itemNutrition ? itemNutrition.name : item.ingredientId
                    });
                    missingCostFCFA += itemCost;
                }
            });

            const matchScore = totalRequired > 0 ? Math.round((matchedIds.length / totalRequired) * 100) : 0;

            results.push({
                ...enriched,
                matchScore,
                totalRequiredIngredients: totalRequired,
                matchedIngredientCount: matchedIds.length,
                matchedIds,
                missingIngredients: missingIds,
                missingCount: missingIds.length,
                missingCostFCFA: Math.round(missingCostFCFA),
                pantryCostSavedFCFA: Math.round(enriched.nutrition.total.costFCFA - missingCostFCFA)
            });
        });

        // Tri : D'abord le taux de correspondance décroissant, puis le coût total croissant
        results.sort((a, b) => {
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            return (a.nutrition?.total?.costFCFA || 0) - (b.nutrition?.total?.costFCFA || 0);
        });

        return results;
    }

    // ============================================================
    // GÉNÉRATEUR CRÉATIF LOCAL (SUR-MESURE & OFFLINE)
    // ============================================================
    function generateCreativeRecipe(selectedIngredientIds = [], options = {}) {
        if (!selectedIngredientIds || selectedIngredientIds.length === 0) {
            throw new Error("Veuillez sélectionner au moins un ingrédient pour créer une recette.");
        }

        const servings = options.servings || 2;
        const mealType = options.mealType || "dejeuner";

        const selectedObjects = selectedIngredientIds
            .map(id => ingredients.find(i => i.id === id))
            .filter(Boolean);

        if (selectedObjects.length === 0) {
            throw new Error("Aucun ingrédient reconnu dans la sélection.");
        }

        const bases = selectedObjects.filter(i => i.category === "cereales_feculents");
        const proteins = selectedObjects.filter(i => i.category === "poissons_viandes_oeufs" || i.category === "legumineuses");
        const veggies = selectedObjects.filter(i => i.category === "legumes");
        const fruits = selectedObjects.filter(i => i.category === "fruits");
        const liquids = selectedObjects.filter(i => i.category === "boissons_infusions" || i.category === "produits_laitiers");
        const seasonings = selectedObjects.filter(i => i.category === "huiles_condiments");

        const recipeItems = [];
        let title = "Plat Maison Dakarois";
        let emoji = "🥘";
        let desc = "Recette saine et équilibrée composée à partir de vos ingrédients du marché.";
        const steps = [];

        if (mealType === "boisson" || (liquids.length > 0 && bases.length === 0 && proteins.length === 0)) {
            emoji = "🫖";
            title = "Infusion Bien-Être aux Saveurs Sénégalaises";
            desc = "Boisson locale hydratante et tonifiante.";
            selectedObjects.forEach(ing => {
                let q = 10;
                let u = "g";
                if (ing.category === "produits_laitiers") { q = 150; u = "g"; }
                recipeItems.push({ ingredientId: ing.id, quantity: q * servings, unit: u });
            });
            steps.push("Rincer les ingrédients végétaux à l'eau claire.");
            steps.push(`Faire infuser ou mixer dans ${250 * servings} ml d'eau ou de lait tiède.`);
            steps.push("Déguster tiède ou bien frais selon vos préférences.");
        } else {
            let primaryProteinName = proteins.length > 0 ? proteins[0].name.split("(")[0].trim() : null;
            let primaryBaseName = bases.length > 0 ? bases[0].name.split("(")[0].trim() : null;
            let primaryVeggieName = veggies.length > 0 ? veggies[0].name.split("(")[0].trim() : null;

            if (primaryProteinName && primaryBaseName) {
                title = `Mijoté de ${primaryProteinName} au ${primaryBaseName}`;
            } else if (primaryProteinName && primaryVeggieName) {
                title = `Poêlée de ${primaryProteinName} et ${primaryVeggieName}`;
            } else if (primaryBaseName) {
                title = `Plat Gourmand au ${primaryBaseName} et Légumes`;
            } else {
                title = `Poêlée Énergétique Dakaroise`;
            }

            bases.forEach(b => {
                recipeItems.push({ ingredientId: b.id, quantity: 80 * servings, unit: "g" });
            });
            proteins.forEach(p => {
                const q = p.id.includes("oeuf") ? 2 * servings : 120 * servings;
                const u = p.id.includes("oeuf") ? "piece" : "g";
                recipeItems.push({ ingredientId: p.id, quantity: q, unit: u });
            });
            veggies.forEach(v => {
                recipeItems.push({ ingredientId: v.id, quantity: 70 * servings, unit: "g" });
            });
            seasonings.forEach(s => {
                const q = s.id.includes("huile") ? 10 * servings : 10 * servings;
                const u = s.id.includes("huile") ? "ml" : "g";
                recipeItems.push({ ingredientId: s.id, quantity: q, unit: u });
            });
            fruits.forEach(f => {
                recipeItems.push({ ingredientId: f.id, quantity: 80 * servings, unit: "g" });
            });
            liquids.forEach(l => {
                recipeItems.push({ ingredientId: l.id, quantity: 100 * servings, unit: "g" });
            });

            steps.push("Préparer et laver soigneusement tous les ingrédients locaux.");
            if (proteins.length > 0) {
                steps.push(`Faire dorer ${proteins.map(p => p.name.split("(")[0]).join(", ")} avec un filet d'huile ou aromates.`);
            }
            if (veggies.length > 0) {
                steps.push(`Ajouter les légumes découpés (${veggies.map(v => v.name.split("(")[0]).join(", ")}) et laisser mijoter 15 minutes.`);
            }
            if (bases.length > 0) {
                steps.push(`Cuire ${bases.map(b => b.name.split("(")[0]).join(", ")} à l'eau ou à la vapeur selon la consistance désirée.`);
            }
            steps.push("Dresser harmonieusement et servir chaud en famille.");
        }

        const creativeRecipe = {
            id: "creative-" + Date.now(),
            title,
            mealType,
            prepTimeMinutes: 20,
            cookingTimeMinutes: 25,
            difficulty: "Facile",
            baseServings: servings,
            imageEmoji: emoji,
            description: desc,
            chefTip: "Cette création maison maximise les nutriments de vos ingrédients locaux à prix très doux.",
            tags: ["creation-maison", "anti-gaspillage", "local"],
            ingredients: recipeItems,
            steps
        };

        return enrichRecipeWithNutrition(creativeRecipe, servings);
    }

    // ============================================================
    // INTÉGRATION IA & CONTRAT STRICT DE SÉPARATION
    // ============================================================
    function generateAIPrompt(options = {}) {
        const selectedIngredients = (options.selectedIngredientIds || [])
            .map(id => ingredients.find(i => i.id === id))
            .filter(Boolean);

        const ingredientsContext = selectedIngredients.map(i => `- ID: "${i.id}", Nom: "${i.name}", Catégorie: "${i.category}"`).join("\n");
        const userGoal = options.userGoal || "maintien";
        const targetCalories = options.targetCalories || 2000;
        const servings = options.servings || 2;
        const mealType = options.mealType || "dejeuner";
        const budgetFCFA = options.budgetFCFA || 1500;

        return {
            systemPrompt: `Tu es un Chef Diététicien Sénégalais d'excellence pour NutriBudget.
RÈGLE D'OR ABSOLUE :
Ne calcule JAMAIS toi-même les calories, les macronutriments (protéines, glucides, lipides) ni les prix en FCFA.
Notre moteur mathématique déterministe (NutriCalculator) s'en charge avec précision scientifique à partir des tables officielles FAO/INFOODS.
Ta seule mission est de concevoir la structure culinaire, les étapes traditionnelles sénégalaises et l'astuce du marché dakarois.

Tu DOIS retourner STRICTEMENT un JSON valide au format suivant :
{
  "title": "Nom appétissant en wolof/français",
  "mealType": "${mealType}",
  "prepTimeMinutes": 25,
  "cookingTimeMinutes": 30,
  "difficulty": "Facile|Moyen|Avancé",
  "imageEmoji": "🍲",
  "description": "Courte description culinaire et bienfaits",
  "chefTip": "Astuce du chef (remplacement sain, marché de Dakar, etc.)",
  "tags": ["senegalais", "sans-gluten", ...],
  "ingredients": [
    { "ingredientId": "id-exact-de-la-liste", "quantity": 150, "unit": "g" }
  ],
  "steps": [
    "Étape 1 détaillée...",
    "Étape 2..."
  ]
}`,
            userPrompt: `Conçois une délicieuse recette sénégalaise pour ${servings} personnes (${mealType}) adaptée à un profil visant "${userGoal}" (cible globale : ~${targetCalories} kcal/jour, budget indicatif : ~${budgetFCFA} FCFA).

Ingrédients disponibles dans le panier de l'utilisateur :
${ingredientsContext || "Tous les ingrédients locaux courants du marché de Dakar."}

Assure-toi d'utiliser uniquement les "ingredientId" de la liste officielle fournie.`
        };
    }

    function parseAndValidateAIRecipe(aiResponseText, servings = 2) {
        let parsed;
        try {
            const cleaned = aiResponseText.replace(/```json/gi, "").replace(/```/g, "").trim();
            parsed = JSON.parse(cleaned);
        } catch (e) {
            throw new Error("La réponse de l'IA ne contient pas un format JSON valide.");
        }

        if (!parsed.title || !Array.isArray(parsed.ingredients)) {
            throw new Error("Format de recette invalide : titre ou ingrédients manquants.");
        }

        const validatedIngredients = [];
        parsed.ingredients.forEach(item => {
            const exists = ingredients.find(i => i.id === item.ingredientId);
            if (exists) {
                validatedIngredients.push({
                    ingredientId: item.ingredientId,
                    quantity: Math.max(1, Number(item.quantity) || 50),
                    unit: item.unit || "g"
                });
            }
        });

        if (validatedIngredients.length === 0) {
            throw new Error("Aucun ingrédient de la recette générée ne correspond à la table sénégalaise.");
        }

        const validRecipe = {
            id: "ai-recipe-" + Date.now(),
            title: parsed.title,
            mealType: parsed.mealType || "dejeuner",
            prepTimeMinutes: Number(parsed.prepTimeMinutes) || 20,
            cookingTimeMinutes: Number(parsed.cookingTimeMinutes) || 25,
            difficulty: parsed.difficulty || "Facile",
            baseServings: servings,
            imageEmoji: parsed.imageEmoji || "🍲",
            description: parsed.description || "Recette personnalisée créée par l'IA NutriBudget.",
            chefTip: parsed.chefTip || "Cuisinez avec des produits locaux frais pour préserver les vitamines !",
            tags: Array.isArray(parsed.tags) ? parsed.tags : ["ia-personnalisee", "terroir"],
            ingredients: validatedIngredients,
            steps: Array.isArray(parsed.steps) && parsed.steps.length > 0 ? parsed.steps : [
                "Préparer tous les ingrédients locaux avec soin.",
                "Cuire à feu moyen en respectant les temps de cuisson.",
                "Assaisonner naturellement et servir chaud."
            ]
        };

        return enrichRecipeWithNutrition(validRecipe, servings);
    }

    // ============================================================
    // PANIERS TYPES PRÉDÉFINIS (PRESETS DAKAROIS)
    // ============================================================
    const PRESETS = {
        ceeb: {
            label: "Panier Ceeb express",
            icon: "🐟",
            ingredients: ["yaboye-sardinelle", "riz-brise-ordinaire", "carotte", "chou-blanc", "diakhatou", "huile-arachide", "oignon-jaune", "soumbala-netetou"]
        },
        yassa: {
            label: "Panier Yassa terroir",
            icon: "🍗",
            ingredients: ["poulet-fermier", "oignon-jaune", "gingembre-frais", "huile-arachide", "fonio"]
        },
        proteines_eco: {
            label: "Protéines économiques",
            icon: "💪",
            ingredients: ["niebe", "oeuf-poule", "yaboye-sardinelle", "arachides-crues", "lait-caille-kossam"]
        },
        petit_dej: {
            label: "Petit-déjeuner terroir",
            icon: "☀️",
            ingredients: ["mil-arraw", "lait-caille-kossam", "banane-douce", "oeuf-poule", "kinkeliba"]
        },
        vitalite_detox: {
            label: "Vitalité & Détox Dakar",
            icon: "🌿",
            ingredients: ["kinkeliba", "gingembre-frais", "pain-de-singe-bouye", "moringa-nebeday", "fleurs-bissap-rouge"]
        }
    };

    return {
        getCatalog: () => [...RECIPE_CATALOG],
        getRecipeById: (id, servings = null) => {
            const raw = RECIPE_CATALOG.find(r => r.id === id);
            return raw ? enrichRecipeWithNutrition(raw, servings) : null;
        },
        matchRecipesWithIngredients,
        generateCreativeRecipe,
        generateAIPrompt,
        parseAndValidateAIRecipe,
        enrichRecipeWithNutrition,
        toggleFavorite,
        isFavorite,
        getFavoriteIds,
        getPresets: () => PRESETS
    };
});
