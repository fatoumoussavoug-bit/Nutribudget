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
            id: "recette-salade-mediterraneenne-oeufs",
            title: "Salade méditerranéenne : avocat, œufs durs et concombres",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 9,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🥗",
            description: "Une grande salade méditerranéenne fraîche et croquante mariant l'onctuosité de l'avocat, le croquant du concombre et les protéines des œufs durs.",
            chefTip: "Un filet de jus de citron et une pincée d'origan sublime cette salade sans avoir besoin de sauces grasses.",
            tags: ["healthy", "vegetarien", "sans-gluten", "salade"],
            ingredients: [
                { ingredientId: "avocat", quantity: 1, unit: "piece" },
                { ingredientId: "oeuf-poule", quantity: 3, unit: "piece" },
                { ingredientId: "concombre", quantity: 150, unit: "g" },
                { ingredientId: "tomate-fraiche", quantity: 150, unit: "g" },
                { ingredientId: "salade-verte", quantity: 120, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Cuire les œufs 9 minutes dans de l'eau bouillante salée, les refroidir et les écaler.",
                "Couper le concombre en fines rondelles et les tomates en dés.",
                "Détailler l'avocat en lamelles régulières.",
                "Disposer la salade verte essorée dans un saladier ou deux grandes assiettes creuses.",
                "Ajouter les crudités, l'avocat et les œufs coupés en deux.",
                "Arroser d'un filet d'huile d'olive, saler et poivrer légèrement."
            ]
        },
        {
            id: "recette-poisson-vapeur-courgettes-riz",
            title: "Filet de poisson blanc vapeur, courgettes et riz",
            mealType: "diner",
            prepTimeMinutes: 12,
            cookingTimeMinutes: 15,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🐟",
            description: "Un dîner léger, digeste et équilibré : poisson blanc cuit à la vapeur avec des rondelles de courgettes fondantes et du riz blanc.",
            chefTip: "La cuisson vapeur préserve la délicatesse de la chair du poisson et tous les micronutriments des légumes.",
            tags: ["healthy", "faible-calorie", "poisson", "sans-gluten"],
            ingredients: [
                { ingredientId: "poisson-blanc", quantity: 350, unit: "g" },
                { ingredientId: "courgette", quantity: 250, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 160, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 80, unit: "g" },
                { ingredientId: "huile-olive", quantity: 12, unit: "ml" }
            ],
            steps: [
                "Faire cuire le riz blanc dans de l'eau bouillante salée pendant 15 minutes.",
                "Laver les courgettes et les couper en rondelles fines.",
                "Cuire les filets de poisson et les courgettes à la vapeur pendant 10 à 12 minutes.",
                "Dresser le poisson fondant avec les courgettes vapeur et le riz chaud.",
                "Arroser d'un filet d'huile d'olive et de jus de citron."
            ]
        },
        {
            id: "recette-boeuf-haricots-pommes-de-terre",
            title: "Poêlée de bœuf émincé, haricots verts et pommes de terre",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 15,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🥩",
            description: "Un plat complet riche en fer et protéines : émincé de bœuf poêlé avec haricots verts frais et dés de pommes de terre vapeur.",
            chefTip: "Saisissez la viande à feu très vif pendant 2 minutes seulement pour qu'elle reste tendre et juteuse.",
            tags: ["healthy", "riche-en-fer", "riche-en-proteines", "sans-gluten"],
            ingredients: [
                { ingredientId: "viande-boeuf", quantity: 300, unit: "g" },
                { ingredientId: "haricots-verts", quantity: 200, unit: "g" },
                { ingredientId: "pommes-de-terre", quantity: 250, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 80, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Éplucher les pommes de terre, les couper en dés et les cuire à l'eau 15 minutes.",
                "Cuire les haricots verts à l'eau bouillante 8 à 10 minutes, puis égoutter.",
                "Émincer le bœuf en fines lanières.",
                "Dans une poêle avec l'huile d'olive, faire revenir l'oignon 3 minutes puis saisir le bœuf à feu vif 2 à 3 minutes.",
                "Ajouter les dés de pommes de terre et les haricots verts pour réchauffer le tout 2 minutes.",
                "Servir bien chaud."
            ]
        },
        {
            id: "recette-omelette-courgettes-salade-pain",
            title: "Omelette moelleuse aux courgettes, salade et pain",
            mealType: "diner",
            prepTimeMinutes: 10,
            cookingTimeMinutes: 8,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🍳",
            description: "Omelette végétarienne légère et aérée aux fines rondelles de courgettes sautées, servie avec une salade verte et du pain frais.",
            chefTip: "Faites bien dorer les courgettes avant de verser les œufs pour faire ressortir leur saveur douce.",
            tags: ["healthy", "vegetarien", "rapide", "faible-calorie"],
            ingredients: [
                { ingredientId: "oeuf-poule", quantity: 4, unit: "piece" },
                { ingredientId: "courgette", quantity: 200, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 60, unit: "g" },
                { ingredientId: "salade-verte", quantity: 80, unit: "g" },
                { ingredientId: "pain-frais", quantity: 120, unit: "g" },
                { ingredientId: "huile-olive", quantity: 12, unit: "ml" }
            ],
            steps: [
                "Laver la courgette et la tailler en fines demi-rondelles, émincer l'oignon.",
                "Dans une poêle avec un filet d'huile, faire suer l'oignon et dorer les courgettes 5 minutes.",
                "Battre les 4 œufs dans un bol avec sel et poivre.",
                "Verser les œufs sur les courgettes et cuire à feu moyen 4 minutes en repliant les bords.",
                "Dresser avec une salade verte assaisonnée et le pain frais croustillant."
            ]
        },
        {
            id: "recette-poulet-saute-poivrons-riz",
            title: "Poulet émincé sauté aux poivrons, carottes et riz",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 18,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🍗",
            description: "Wok sain et coloré : morceaux de poulet fermier sautés avec poivrons croquants et carottes, sur un lit de riz blanc.",
            chefTip: "Un plat plein de couleur et d'antioxydants grâce au mélange poivron rouge/vert et carottes.",
            tags: ["healthy", "riche-en-proteines", "equilibre", "sans-gluten"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 350, unit: "g" },
                { ingredientId: "poivron", quantity: 150, unit: "g" },
                { ingredientId: "carotte", quantity: 120, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 160, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 80, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Cuire le riz dans de l'eau bouillante salée 15 minutes, égoutter.",
                "Tailler le poulet en aiguillettes et émincer les poivrons, carottes et oignons.",
                "Faire dorer le poulet dans une poêle chaude avec l'huile 8 minutes, puis réserver.",
                "Sauter les légumes dans la même poêle 6 minutes à feu vif.",
                "Remettre le poulet pour lier les saveurs et servir avec le riz chaud."
            ]
        },
        {
            id: "recette-salade-pommes-terre-thon-oeufs",
            title: "Salade de pommes de terre vapeur, thon et œufs durs",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 18,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🥗",
            description: "Salade rustique et nourrissante : pommes de terre fondantes tièdes, thon au naturel émietté, œufs durs et persil ou oignons doux.",
            chefTip: "Assaisonnez les pommes de terre encore tièdes : elles absorberont délicatement l'huile d'olive sans devenir grasses.",
            tags: ["healthy", "riche-en-proteines", "sans-gluten", "salade"],
            ingredients: [
                { ingredientId: "pommes-de-terre", quantity: 350, unit: "g" },
                { ingredientId: "thon-naturel", quantity: 160, unit: "g" },
                { ingredientId: "oeuf-poule", quantity: 2, unit: "piece" },
                { ingredientId: "oignon-jaune", quantity: 50, unit: "g" },
                { ingredientId: "salade-verte", quantity: 80, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Éplucher les pommes de terre, les couper en dés et les cuire à la vapeur 18 minutes.",
                "Cuire les œufs 9 minutes dans de l'eau bouillante, les refroidir, les écaler et les couper en morceaux.",
                "Égoutter et émietter le thon au naturel.",
                "Émincer très finement l'oignon.",
                "Dans un saladier, mélanger les pommes de terre tièdes, le thon, l'oignon et les œufs.",
                "Disposer sur un lit de salade verte et arroser d'huile d'olive et de poivre."
            ]
        },
        {
            id: "recette-poulet-haricots-patates-douces",
            title: "Blanc de poulet grillé, haricots verts et patates douces rôties",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 25,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🍗",
            description: "Le combo santé par excellence des sportifs : protéines maigres du poulet fermier, glucides à IG bas de la patate douce et fibres des haricots verts.",
            chefTip: "La patate douce rôtie au four développe un goût naturellement doux et sucré qui contraste à merveille avec les haricots verts.",
            tags: ["healthy", "fitness", "riche-en-proteines", "sans-gluten"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 350, unit: "g" },
                { ingredientId: "patate-douce", quantity: 300, unit: "g" },
                { ingredientId: "haricots-verts", quantity: 200, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Peler les patates douces, les tailler en cubes et les faire rôtir au four à 200°C avec un filet d'huile 25 minutes.",
                "Cuire les haricots verts 10 minutes à la vapeur pour préserver leur couleur verte et leur croquant.",
                "Assaisonner les blancs de poulet et les griller à la poêle 5 minutes par face.",
                "Dresser les assiettes avec les cubes de patate douce dorés, les haricots verts et le poulet tranché."
            ]
        },
        {
            id: "recette-salade-avocat-thon-oeufs",
            title: "Salade complète avocat, thon au naturel et œufs durs",
            mealType: "diner",
            prepTimeMinutes: 12,
            cookingTimeMinutes: 9,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🥗",
            description: "Un concentré d'oméga-3 et de bonnes graisses : demi-avocats crémeux, thon au naturel, œufs durs et tomates fraîches.",
            chefTip: "Un dîner complet prêt en 10 minutes sans aucune cuisson autre que les œufs durs.",
            tags: ["healthy", "riche-en-proteines", "omega-3", "sans-gluten"],
            ingredients: [
                { ingredientId: "avocat", quantity: 1, unit: "piece" },
                { ingredientId: "thon-naturel", quantity: 160, unit: "g" },
                { ingredientId: "oeuf-poule", quantity: 2, unit: "piece" },
                { ingredientId: "tomate-fraiche", quantity: 150, unit: "g" },
                { ingredientId: "salade-verte", quantity: 100, unit: "g" },
                { ingredientId: "huile-olive", quantity: 12, unit: "ml" }
            ],
            steps: [
                "Cuire les œufs 9 minutes dans de l'eau frémissante, les refroidir, les écaler et les couper en deux.",
                "Laver la salade et découper les tomates en quartiers.",
                "Peler et découper l'avocat en lamelles généreuses.",
                "Dresser la salade verte, déposer le thon émietté, les lamelles d'avocat, les tomates et les œufs.",
                "Arroser d'huile d'olive, d'un filet de jus de citron, saler et poivrer."
            ]
        },
        {
            id: "recette-poisson-roti-tomates-poivrons-riz",
            title: "Poisson blanc rôti aux tomates fraîches, poivrons et riz",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 18,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🐟",
            description: "Filets de poisson blanc cuits sur une compotée de tomates fraîches, oignons et poivrons doux, accompagnés de riz blanc.",
            chefTip: "Les sucs de tomate et de poivron créent une sauce légère et parfumée naturelle sans ajouter de crème ni beurre.",
            tags: ["healthy", "omega-3", "poisson", "sans-gluten"],
            ingredients: [
                { ingredientId: "poisson-blanc", quantity: 350, unit: "g" },
                { ingredientId: "tomate-fraiche", quantity: 200, unit: "g" },
                { ingredientId: "poivron", quantity: 120, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 80, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 160, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Cuire le riz dans de l'eau bouillante salée 15 minutes, puis égoutter.",
                "Faire fondre les oignons, les dés de tomates et les lamelles de poivrons dans une sauteuse 8 minutes.",
                "Déposer les filets de poisson assaisonnés sur le lit de légumes et couvrir 8 à 10 minutes à feu doux.",
                "Servir le poisson nappé de la fondue de légumes avec le riz bien chaud."
            ]
        },
        {
            id: "recette-bowl-veggie-avocat-oeuf-riz",
            title: "Bowl végétarien équilibré : riz, avocat, œufs mollets et crudités",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 15,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🥑",
            description: "Un bowl végétarien complet et sain : base de riz blanc tiède, œufs mollets coulants, demi-avocat, concombres et carottes râpées.",
            chefTip: "Cuisez les œufs 6 minutes dans l'eau bouillante pour un jaune bien coulant qui fait office de sauce naturelle crémeuse.",
            tags: ["healthy", "vegetarien", "sans-gluten", "equilibre"],
            ingredients: [
                { ingredientId: "oeuf-poule", quantity: 2, unit: "piece" },
                { ingredientId: "avocat", quantity: 1, unit: "piece" },
                { ingredientId: "riz-brise-ordinaire", quantity: 160, unit: "g" },
                { ingredientId: "concombre", quantity: 120, unit: "g" },
                { ingredientId: "carotte", quantity: 120, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Cuire le riz dans de l'eau bouillante salée 15 minutes, égoutter et laisser tiédir.",
                "Cuire les œufs 6 minutes dans l'eau bouillante pour des œufs mollets, puis les refroidir et les écaler.",
                "Râper les carottes, couper le concombre en dés et l'avocat en lamelles.",
                "Dresser une base de riz au fond de deux bols.",
                "Disposer harmonieusement l'avocat, les carottes, le concombre et l'œuf mollet fendu en deux.",
                "Arroser d'un filet d'huile d'olive et parsemer d'un tour de moulin à poivre."
            ]
        },
        {
            id: "recette-bibimbap-coreen-healthy",
            title: "Bibimbap coréen healthy au bœuf et légumes sautés",
            cuisine: "asiatique",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 15,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🥢",
            description: "Grand bol coréen complet et équilibré : riz chaud garni de lamelles de bœuf maigre poêlé, carottes et courgettes sautées, œuf au plat et concombre frais.",
            chefTip: "Chaque légume est sauté séparément rapidement pour garder ses couleurs vives et sa texture croquante.",
            tags: ["asiatique", "coreen", "riche-en-proteines", "sans-gluten", "healthy"],
            ingredients: [
                { ingredientId: "riz-brise-ordinaire", quantity: 160, unit: "g" },
                { ingredientId: "viande-boeuf", quantity: 200, unit: "g" },
                { ingredientId: "oeuf-poule", quantity: 2, unit: "piece" },
                { ingredientId: "courgette", quantity: 150, unit: "g" },
                { ingredientId: "carotte", quantity: 120, unit: "g" },
                { ingredientId: "concombre", quantity: 100, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Cuire le riz dans de l'eau bouillante salée 15 minutes, égoutter et garder au chaud.",
                "Tailler le bœuf en fines lamelles et le saisir 2 minutes à feu vif dans une poêle avec un filet d'huile.",
                "Faire sauter séparément les carottes râpées et les courgettes en julienne 3 minutes chacune.",
                "Cuire deux œufs au plat dans la même poêle.",
                "Dresser le riz au fond de deux grands bols, disposer les légumes et la viande en sections autour, et déposer un œuf au centre.",
                "Mélanger délicatement avant de déguster."
            ]
        },
        {
            id: "recette-wok-poulet-legumes-asiatique",
            title: "Wok asiatique de poulet sauté et légumes croquants",
            cuisine: "asiatique",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 12,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🥢",
            description: "Une poêlée asiatique vive et saine : aiguillettes de poulet fermier sautées à feu vif avec poivrons, courgettes et oignons, servies avec riz blanc.",
            chefTip: "Ajoutez un peu de gingembre frais râpé pour apporter la note aromatique asiatique authentique.",
            tags: ["asiatique", "wok", "riche-en-proteines", "sans-gluten", "healthy"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 350, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 160, unit: "g" },
                { ingredientId: "poivron", quantity: 120, unit: "g" },
                { ingredientId: "courgette", quantity: 120, unit: "g" },
                { ingredientId: "carotte", quantity: 100, unit: "g" },
                { ingredientId: "gingembre-frais", quantity: 10, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Cuire le riz dans l'eau bouillante salée 15 minutes, puis égoutter.",
                "Émincer le poulet en fines lanières et découper tous les légumes en bâtonnets.",
                "Dans un wok ou une poêle très chaude avec l'huile, faire sauter le poulet avec le gingembre 5 minutes.",
                "Ajouter les légumes et faire sauter 5 minutes à feu vif pour garder le croquant.",
                "Servir bien chaud sur le lit de riz."
            ]
        },
        {
            id: "recette-poulet-vapeur-gingembre-chine",
            title: "Poulet vapeur au gingembre frais et riz parfumé",
            cuisine: "asiatique",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 20,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🥢",
            description: "Plat sain emblématique de la cuisine cantonaise : suprêmes de poulet fermier cuits doucement à la vapeur avec gingembre frais et oignons doux, servis sur riz parfumé.",
            chefTip: "La cuisson vapeur préserve la tendreté absolue du poulet et tous ses nutriments sans ajouter de gras superflu.",
            tags: ["asiatique", "chine", "vapeur", "healthy", "riche-en-proteines", "sans-gluten"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 350, unit: "g" },
                { ingredientId: "gingembre-frais", quantity: 15, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 80, unit: "g" },
                { ingredientId: "riz-parfume", quantity: 160, unit: "g" },
                { ingredientId: "huile-olive", quantity: 10, unit: "ml" }
            ],
            steps: [
                "Cuire le riz parfumé dans l'eau bouillante salée 15 minutes, puis égoutter.",
                "Découper le poulet fermier en aiguillettes et râper finement le gingembre frais.",
                "Disposer le poulet dans un panier vapeur avec les lamelles d'oignons et le gingembre râpé.",
                "Cuire à la vapeur douce pendant 18 à 20 minutes jusqu'à ce que la chair soit très tendre.",
                "Arroser d'un léger filet d'huile d'olive et servir aussitôt avec le riz parfumé bien chaud."
            ]
        },
        {
            id: "recette-boeuf-saute-poivrons-cantonais",
            title: "Sauté de bœuf cantonais aux poivrons et oignons croquants",
            cuisine: "asiatique",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 10,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🥢",
            description: "Recette traditionnelle chinoise rapide et équilibrée : émincé de bœuf maigre saisi vivement à la poêle avec poivrons doux croquants et riz blanc.",
            chefTip: "Saisissez la viande à feu vif pendant 2 à 3 minutes maximum pour préserver tout son jus et sa tendreté.",
            tags: ["asiatique", "chine", "riche-en-fer", "riche-en-proteines", "sans-gluten"],
            ingredients: [
                { ingredientId: "viande-boeuf", quantity: 300, unit: "g" },
                { ingredientId: "poivron", quantity: 160, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 100, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 160, unit: "g" },
                { ingredientId: "huile-arachide", quantity: 12, unit: "ml" }
            ],
            steps: [
                "Cuire le riz dans de l'eau bouillante salée 15 minutes, puis égoutter.",
                "Couper le bœuf en très fines lanières, et émincer les poivrons et oignons.",
                "Chauffer l'huile dans un wok ou une poêle à feu vif et faire sauter les légumes 4 minutes.",
                "Ajouter le bœuf émincé et faire sauter 3 minutes supplémentaires à feu très vif en remuant.",
                "Dresser bien chaud sur les assiettes avec le riz blanc."
            ]
        },
        {
            id: "recette-poisson-blanc-teriyaki-japon",
            title: "Poisson blanc façon teriyaki léger, haricots verts et riz parfumé",
            cuisine: "asiatique",
            mealType: "dejeuner",
            prepTimeMinutes: 12,
            cookingTimeMinutes: 15,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🍱",
            description: "Inspiré de l'art culinaire japonais : filets de poisson blanc frais délicatement dorés au gingembre, accompagnés de haricots verts vapeur et de riz parfumé.",
            chefTip: "Une cuisson douce du poisson permet de préserver toutes ses protéines nobles et sa chair fondante.",
            tags: ["asiatique", "japon", "poisson", "healthy", "sans-gluten"],
            ingredients: [
                { ingredientId: "poisson-blanc", quantity: 350, unit: "g" },
                { ingredientId: "haricots-verts", quantity: 200, unit: "g" },
                { ingredientId: "riz-parfume", quantity: 160, unit: "g" },
                { ingredientId: "gingembre-frais", quantity: 10, unit: "g" },
                { ingredientId: "huile-olive", quantity: 10, unit: "ml" }
            ],
            steps: [
                "Cuire le riz parfumé à l'eau bouillante salée 15 minutes.",
                "Cuire les haricots verts à la vapeur ou à l'eau bouillante 10 minutes pour garder leur vert vif et leur croquant.",
                "Dans une poêle antiadhésive avec l'huile et le gingembre frais râpé, dorer les filets de poisson 3 à 4 minutes par face.",
                "Dresser les filets de poisson moelleux avec les haricots verts et le riz parfumé bien chaud.",
                "Déguster chaud pour un repas complet, léger et digeste."
            ]
        },
        {
            id: "recette-oyakodon-japonais-poulet-oeuf",
            title: "Oyakodon japonais allégé au poulet mijoté et œufs fondants",
            cuisine: "asiatique",
            mealType: "diner",
            prepTimeMinutes: 10,
            cookingTimeMinutes: 12,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🍱",
            description: "Le fameux donburi réconfortant du Japon : dés de poulet et oignons mijotés dans un bouillon léger, liés d'œufs battus juste saisis, sur un bol de riz chaud.",
            chefTip: "Ne surcuisez pas les œufs : le secret de l'oyakodon traditionnel est de laisser les œufs encore légèrement crémeux.",
            tags: ["asiatique", "japon", "riche-en-proteines", "healthy", "rapide"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 300, unit: "g" },
                { ingredientId: "oeuf-poule", quantity: 3, unit: "piece" },
                { ingredientId: "oignon-jaune", quantity: 120, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 160, unit: "g" },
                { ingredientId: "huile-olive", quantity: 10, unit: "ml" }
            ],
            steps: [
                "Cuire le riz à l'eau bouillante 15 minutes et le réserver au chaud dans deux bols.",
                "Émincer l'oignon et découper le poulet en petits dés réguliers.",
                "Faire suer l'oignon dans une sauteuse avec l'huile d'olive et un petit fond d'eau pendant 4 minutes.",
                "Ajouter les dés de poulet, saler légèrement et laisser mijoter 5 minutes à feu moyen.",
                "Battre les œufs à la fourchette et les verser en filet régulier sur le poulet. Couvrir 1 minute jusqu'à ce que les œufs soient pris mais fondants.",
                "Glisser la préparation sur les bols de riz chaud et déguster sans attendre."
            ]
        },
        {
            id: "recette-goi-ga-salade-poulet-vietnam",
            title: "Gỏi Gà - Salade vietnamienne de poulet effiloché, chou croquant et carottes",
            cuisine: "asiatique",
            mealType: "dejeuner",
            prepTimeMinutes: 20,
            cookingTimeMinutes: 15,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🥗",
            description: "Salade traditionnelle du Vietnam, ultra-croquante et saine : poulet poché effiloché, chou blanc émincé, carottes, concombres et éclats d'arachides grillées.",
            chefTip: "Massez légèrement le chou émincé avec une pincée de sel pour l'attendrir tout en conservant son croquant rafraîchissant.",
            tags: ["asiatique", "vietnam", "salade", "healthy", "croquant", "sans-gluten"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 300, unit: "g" },
                { ingredientId: "chou-blanc", quantity: 180, unit: "g" },
                { ingredientId: "carotte", quantity: 120, unit: "g" },
                { ingredientId: "concombre", quantity: 120, unit: "g" },
                { ingredientId: "arachides-crues", quantity: 30, unit: "g" },
                { ingredientId: "huile-olive", quantity: 12, unit: "ml" }
            ],
            steps: [
                "Pocher les morceaux de poulet 12 minutes dans une eau frémissante salée, laisser tiédir et effilocher à la main.",
                "Émincer très finement le chou blanc, râper les carottes et découper le concombre en petits bâtonnets.",
                "Torréfier les arachides 3 minutes à la poêle sèche, puis les concasser grossièrement.",
                "Dans un grand saladier, réunir le poulet effiloché avec le chou, les carottes et le concombre.",
                "Assaisonner d'huile d'olive, d'une pincée de sel, de poivre et parsemer d'arachides croquantes avant de servir."
            ]
        },
        {
            id: "recette-bouillon-pho-boeuf-vietnam",
            title: "Bouillon façon Phô vietnamien au bœuf émincé, gingembre et légumes",
            cuisine: "asiatique",
            mealType: "diner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 20,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🍜",
            description: "Bouillon réconfortant emblématique du Vietnam : bouillon infusé au gingembre frais et oignons, garni de fines lamelles de bœuf, riz et légumes croquants.",
            chefTip: "Versez le bouillon bouillant directement sur les très fines lamelles de bœuf cru pour une cuisson instantanée ultra-tendre.",
            tags: ["asiatique", "vietnam", "bouillon", "healthy", "hydratant", "sans-gluten"],
            ingredients: [
                { ingredientId: "viande-boeuf", quantity: 260, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 140, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 100, unit: "g" },
                { ingredientId: "gingembre-frais", quantity: 15, unit: "g" },
                { ingredientId: "chou-blanc", quantity: 100, unit: "g" },
                { ingredientId: "carotte", quantity: 80, unit: "g" }
            ],
            steps: [
                "Faire dorer à sec les oignons coupés en deux et les tranches de gingembre dans une casserole 3 minutes.",
                "Ajouter 1 litre d'eau, saler, poivrer et laisser frémir 15 minutes pour obtenir un bouillon très parfumé.",
                "Cuire le riz séparément à l'eau bouillante 15 minutes et le répartir au fond de deux grands bols.",
                "Couper la viande de bœuf en très fines lamelles.",
                "Plonger le chou émincé et les carottes en julienne 3 minutes dans le bouillon frémissant.",
                "Déposer le bœuf émincé et les légumes sur le riz, puis verser le bouillon bouillant par-dessus pour cuire le bœuf instantanément."
            ]
        },
        {
            id: "recette-dhal-indien-legumineuses-riz",
            title: "Dhal indien mijoté aux tomates, oignons, gingembre et riz parfumé",
            cuisine: "asiatique",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 25,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🍛",
            description: "Le plat végétarien par excellence de l'Inde : haricots fondants mijotés lentement avec des tomates fraîches, oignons dorés et gingembre râpé, servis sur riz parfumé.",
            chefTip: "L'association de légumineuses et de riz offre un profil protéique végétal complet et très digeste.",
            tags: ["asiatique", "inde", "vegetarien", "riche-en-fibres", "economique", "sans-gluten"],
            ingredients: [
                { ingredientId: "niebe", quantity: 180, unit: "g" },
                { ingredientId: "riz-parfume", quantity: 160, unit: "g" },
                { ingredientId: "tomate-fraiche", quantity: 200, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 100, unit: "g" },
                { ingredientId: "gingembre-frais", quantity: 15, unit: "g" },
                { ingredientId: "huile-arachide", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Cuire les haricots dans de l'eau bouillante 25 minutes jusqu'à ce qu'ils soient tendres.",
                "Cuire le riz parfumé séparément dans de l'eau bouillante salée 15 minutes, puis égoutter.",
                "Dans une sauteuse avec l'huile, faire revenir l'oignon émincé et le gingembre frais râpé 5 minutes.",
                "Ajouter les dés de tomates fraîches, saler et laisser mijoter 8 minutes.",
                "Ajouter les haricots cuits avec une louche de bouillon et laisser mijoter 7 minutes en écrasant légèrement pour lier la sauce.",
                "Servir bien chaud sur le riz parfumé."
            ]
        },
        {
            id: "recette-poulet-tikka-raita-inde",
            title: "Poulet façon Tikka grillé aux épices, salade Raita au concombre et riz",
            cuisine: "asiatique",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 12,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🍛",
            description: "Grande spécialité indienne saine : aiguillettes de poulet marinées et grillées, accompagnées d'une sauce raïta fraîche au concombre et kossam, avec riz blanc.",
            chefTip: "Le kossam (lait caillé) apporte une onctuosité naturelle et des ferments lactiques bénéfiques pour la digestion.",
            tags: ["asiatique", "inde", "riche-en-proteines", "healthy", "sans-gluten"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 350, unit: "g" },
                { ingredientId: "lait-caille-kossam", quantity: 180, unit: "g" },
                { ingredientId: "concombre", quantity: 150, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 60, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 160, unit: "g" },
                { ingredientId: "huile-olive", quantity: 10, unit: "ml" }
            ],
            steps: [
                "Cuire le riz dans de l'eau bouillante salée 15 minutes, puis égoutter.",
                "Découper le poulet en morceaux réguliers et les enrober d'huile d'olive, d'oignons hachés, sel et poivre.",
                "Râper le concombre, presser pour enlever l'eau et le mélanger avec le kossam pour créer la raïta fraîche.",
                "Griller les morceaux de poulet dans une poêle chaude 8 à 10 minutes jusqu'à belle coloration.",
                "Dresser le riz blanc, le poulet grillé fumant et la raïta fraîche au concombre."
            ]
        },
        {
            id: "recette-salade-boeuf-thai-yam-nuea",
            title: "Yam Nuea - Salade thaïlandaise de bœuf grillé, concombres et tomates",
            cuisine: "asiatique",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 8,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🥗",
            description: "Salade thaïlandaise saine et explosive en saveurs : fines lamelles de bœuf grillé rosé, concombres croquants, tomates fraîches et salade verte.",
            chefTip: "Laissez reposer la viande 3 minutes après cuisson avant de la trancher finement pour qu'elle reste juteuse.",
            tags: ["asiatique", "thailande", "salade", "riche-en-proteines", "healthy"],
            ingredients: [
                { ingredientId: "viande-boeuf", quantity: 300, unit: "g" },
                { ingredientId: "concombre", quantity: 150, unit: "g" },
                { ingredientId: "tomate-fraiche", quantity: 150, unit: "g" },
                { ingredientId: "salade-verte", quantity: 100, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 60, unit: "g" },
                { ingredientId: "huile-olive", quantity: 12, unit: "ml" }
            ],
            steps: [
                "Saisir le bœuf à la poêle très chaude avec un filet d'huile d'olive 2 à 3 minutes par face.",
                "Laisser reposer 3 minutes sur une planche puis trancher en fines lamelles.",
                "Disposer dans un saladier les feuilles de salade lavées, les concombres en rondelles et les tomates en dés.",
                "Ajouter l'oignon émincé et les lamelles de bœuf tièdes.",
                "Assaisonner d'huile d'olive, de sel, de poivre et d'un filet de jus de citron."
            ]
        },
        {
            id: "recette-pad-krapow-poulet-thai",
            title: "Pad Krapow au poulet émincé, haricots verts, riz blanc et œuf au plat",
            cuisine: "asiatique",
            mealType: "dejeuner",
            prepTimeMinutes: 12,
            cookingTimeMinutes: 12,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🥢",
            description: "Plat thaïlandais incontournable en version équilibrée : poulet émincé sauté vivement avec haricots verts et poivrons, servi avec riz chaud et œuf au plat.",
            chefTip: "Percez le jaune d'œuf coulant pour napper la viande sautée et le riz.",
            tags: ["asiatique", "thailande", "riche-en-proteines", "healthy", "complet"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 300, unit: "g" },
                { ingredientId: "oeuf-poule", quantity: 2, unit: "piece" },
                { ingredientId: "haricots-verts", quantity: 120, unit: "g" },
                { ingredientId: "poivron", quantity: 100, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 160, unit: "g" },
                { ingredientId: "huile-olive", quantity: 12, unit: "ml" }
            ],
            steps: [
                "Cuire le riz dans de l'eau bouillante salée 15 minutes, égoutter.",
                "Couper les haricots verts en petits tronçons et le poivron en dés. Émincer finement le poulet.",
                "Faire sauter le poulet 4 minutes à feu vif dans une sauteuse avec l'huile.",
                "Ajouter les haricots verts et les poivrons, et faire sauter 4 minutes supplémentaires en remuant.",
                "Dans une autre poêle, cuire les deux œufs au plat.",
                "Servir le sauté de poulet et légumes avec le riz bien chaud et déposer un œuf au plat par assiette."
            ]
        },
        {
            id: "recette-dakgomtang-poulet-coree",
            title: "Dakgomtang - Bouillon coréen réconfortant au poulet fermier et gingembre",
            cuisine: "asiatique",
            mealType: "diner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 25,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🍲",
            description: "Bouillon coréen traditionnel purifiant et réconfortant : poulet fermier mijoté avec gingembre frais, oignons et carottes, servi avec son bol de riz.",
            chefTip: "Un plat traditionnel coréen réputé pour restaurer l'énergie sans aucune lourdeur digestive.",
            tags: ["asiatique", "coreen", "bouillon", "healthy", "sans-gluten"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 380, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 150, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 100, unit: "g" },
                { ingredientId: "gingembre-frais", quantity: 15, unit: "g" },
                { ingredientId: "carotte", quantity: 100, unit: "g" }
            ],
            steps: [
                "Dans une marmite, déposer le poulet découpé, l'oignon coupé en quatre, les carottes en rondelles et le gingembre tranché.",
                "Couvrir d'eau (environ 1 litre), saler et laisser mijoter doucement 20 minutes à feu moyen.",
                "Cuire le riz dans une casserole séparée 15 minutes, puis répartir au fond des bols.",
                "Effilocher les morceaux de poulet et les disposer sur le riz avec les rondelles de carottes.",
                "Verser le bouillon chaud fumant par-dessus et déguster aussitôt."
            ]
        },
        {
            id: "recette-bulgogi-ssam-salade-coree",
            title: "Bulgogi Ssam - Bouchées coréennes de bœuf sauté en feuilles de salade",
            cuisine: "asiatique",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 10,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🥬",
            description: "L'art du 'Ssam' coréen : fines lamelles de bœuf sauté aux oignons, dégustées enroulées dans de grandes feuilles de salade croquante avec carottes et concombres.",
            chefTip: "Déposez un peu de riz, du bœuf sauté et des crudités dans une feuille de salade, refermez en ballotin et croquez !",
            tags: ["asiatique", "coreen", "healthy", "riche-en-proteines", "sans-gluten"],
            ingredients: [
                { ingredientId: "viande-boeuf", quantity: 300, unit: "g" },
                { ingredientId: "salade-verte", quantity: 150, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 100, unit: "g" },
                { ingredientId: "concombre", quantity: 100, unit: "g" },
                { ingredientId: "carotte", quantity: 80, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 150, unit: "g" },
                { ingredientId: "huile-olive", quantity: 10, unit: "ml" }
            ],
            steps: [
                "Cuire le riz dans de l'eau bouillante salée 15 minutes, égoutter et garder au tiède.",
                "Laver et essorer les grandes feuilles de salade en les gardant entières.",
                "Tailler le concombre et la carotte en fins bâtonnets croquants.",
                "Émincer le bœuf et l'oignon. Faire sauter à feu vif dans une poêle huilée 5 minutes en remuant.",
                "Servir le plat de bœuf sauté chaud, le bol de riz tiède et le panier de salade pour confectionner les bouchées à table."
            ]
        },
        {
            id: "recette-shakshuka-oeufs-pain",
            title: "Shakshuka orientale aux œufs pochés, poivrons et pain frais",
            cuisine: "moyen_orient",
            mealType: "dejeuner",
            prepTimeMinutes: 12,
            cookingTimeMinutes: 15,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🧆",
            description: "Le plat emblématique du Moyen-Orient : des œufs pochés dans une compotée mijotée de tomates fraîches, poivrons doux et oignons, dégusté avec du bon pain.",
            chefTip: "Créez de petits puits dans la sauce tomate pour y casser délicatement les œufs afin que les blancs cuisent tout en gardant les jaunes coulants.",
            tags: ["moyen_orient", "vegetarien", "healthy", "rapide"],
            ingredients: [
                { ingredientId: "oeuf-poule", quantity: 4, unit: "piece" },
                { ingredientId: "tomate-fraiche", quantity: 300, unit: "g" },
                { ingredientId: "poivron", quantity: 150, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 100, unit: "g" },
                { ingredientId: "pain-frais", quantity: 150, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Émincer l'oignon et le poivron, couper les tomates en dés.",
                "Faire revenir l'oignon et le poivron dans une poêle avec l'huile d'olive pendant 6 minutes.",
                "Ajouter les dés de tomates, saler, poivrer et laisser compoter 6 minutes à feu moyen.",
                "Former 4 petits creux dans la sauce et y casser délicatement les œufs.",
                "Couvrir et laisser cuire 4 à 5 minutes jusqu'à ce que les blancs soient pris et les jaunes encore coulants.",
                "Servir directement à la poêle avec le pain frais croustillant."
            ]
        },
        {
            id: "recette-chili-healthy-boeuf-riz",
            title: "Chili con carne healthy au bœuf maigre, haricots et riz",
            cuisine: "americaine",
            mealType: "dejeuner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 25,
            difficulty: "Facile",
            baseServings: 2,
            imageEmoji: "🥘",
            description: "Version saine et équilibrée du classique américain : bœuf émincé mijoté aux tomates, poivrons et haricots protéinés, servi avec du riz blanc.",
            chefTip: "Le mélange haricots + bœuf permet de réduire la quantité de viande tout en augmentant l'apport en fibres rassasiantes.",
            tags: ["americaine", "riche-en-fibres", "riche-en-proteines", "sans-gluten", "healthy"],
            ingredients: [
                { ingredientId: "viande-boeuf", quantity: 200, unit: "g" },
                { ingredientId: "niebe", quantity: 120, unit: "g" },
                { ingredientId: "riz-brise-ordinaire", quantity: 160, unit: "g" },
                { ingredientId: "tomate-fraiche", quantity: 200, unit: "g" },
                { ingredientId: "poivron", quantity: 100, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 80, unit: "g" },
                { ingredientId: "huile-olive", quantity: 15, unit: "ml" }
            ],
            steps: [
                "Cuire les haricots préalablement dans l'eau bouillante 25 minutes et égoutter.",
                "Cuire le riz dans de l'eau bouillante salée 15 minutes.",
                "Faire dorer le bœuf émincé avec l'oignon et l'huile d'olive dans une sauteuse 5 minutes.",
                "Ajouter les dés de tomates, le poivron et les haricots cuits avec un demi-verre d'eau.",
                "Laisser mijoter 15 minutes à feu doux jusqu'à sauce onctueuse.",
                "Dresser le chili parfumé sur le lit de riz chaud."
            ]
        },
        {
            id: "recette-chawarma-poulet-leger-pain",
            title: "Chawarma léger de poulet mariné, salade et pain frais",
            cuisine: "moyen_orient",
            mealType: "diner",
            prepTimeMinutes: 15,
            cookingTimeMinutes: 12,
            difficulty: "Très facile",
            baseServings: 2,
            imageEmoji: "🥙",
            description: "Chawarma maison sain et diététique : lanières de poulet grillé aux épices douces, garniture fraîche de salade, tomates et concombres dans du pain frais.",
            chefTip: "Faites mariner le poulet avec un filet d'huile d'olive et un trait de jus de citron 10 minutes avant cuisson pour une viande ultra moelleuse.",
            tags: ["moyen_orient", "rapide", "riche-en-proteines", "healthy"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 300, unit: "g" },
                { ingredientId: "pain-frais", quantity: 150, unit: "g" },
                { ingredientId: "salade-verte", quantity: 100, unit: "g" },
                { ingredientId: "tomate-fraiche", quantity: 120, unit: "g" },
                { ingredientId: "concombre", quantity: 100, unit: "g" },
                { ingredientId: "huile-olive", quantity: 12, unit: "ml" }
            ],
            steps: [
                "Couper le poulet en fines lamelles et l'assaisonner de sel, poivre et jus de citron.",
                "Griller le poulet à feu vif dans une poêle avec l'huile d'olive 6 à 8 minutes jusqu'à ce qu'il soit bien doré.",
                "Trancher les tomates et le concombre, effeuiller la salade.",
                "Ouvrir le pain frais et garnir avec les crudités croquantes.",
                "Ajouter les lamelles de poulet grillé tiède et déguster aussitôt."
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
        const cuisine = options.cuisine || "all";
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

            // 1b. Filtre cuisine du monde (africaine, asiatique, europeenne, americaine, moyen_orient)
            if (cuisine !== "all") {
                const rCuisine = rawRecipe.cuisine || "";
                const rTags = rawRecipe.tags || [];
                if (rCuisine !== cuisine && !rTags.includes(cuisine)) {
                    return;
                }
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
    // GÉNÉRATEUR IA DE RECETTES HEALTHY RÉELLES (SUR-MESURE)
    // Ne génère que des vraies recettes qui existent, saines et équilibrées
    // ============================================================
    function generateRecipeFromPrompt(userPrompt = "", options = {}) {
        const text = (userPrompt || "").toLowerCase().trim();
        const servings = options.servings || 2;

        const hasAvocat = text.includes("avocat");
        const hasOeuf = text.includes("oeuf") || text.includes("œuf");
        const hasPoulet = text.includes("poulet") || text.includes("volaille");
        const hasPoisson = text.includes("poisson") || text.includes("merou") || text.includes("tilapia") || text.includes("yaboye");
        const hasThon = text.includes("thon");
        const hasBoeuf = text.includes("boeuf") || text.includes("bœuf") || text.includes("viande");
        const hasRiz = text.includes("riz");
        const hasPommeTerre = text.includes("pomme de terre") || text.includes("pommes de terre") || text.includes("patate");
        const hasHaricotVert = text.includes("haricot vert") || text.includes("haricots verts") || text.includes("haricot");
        const hasOmelette = text.includes("omelette");
        const hasSalade = text.includes("salade") || text.includes("crudite") || text.includes("crudité");
        const hasPain = text.includes("pain") || text.includes("toast") || text.includes("tartine");

        let recipe = null;

        // Requêtes spécifiques par cuisine du monde
        if (text.includes("dakgomtang")) {
            recipe = {
                title: "Dakgomtang - Bouillon coréen réconfortant au poulet fermier et gingembre",
                cuisine: "asiatique",
                mealType: "diner",
                prepTimeMinutes: 15,
                cookingTimeMinutes: 25,
                difficulty: "Facile",
                imageEmoji: "🍲",
                description: "Bouillon coréen traditionnel purifiant et réconfortant : poulet fermier mijoté avec gingembre frais, oignons et carottes, servi avec son bol de riz.",
                chefTip: "Un plat traditionnel coréen réputé pour restaurer l'énergie sans aucune lourdeur digestive.",
                tags: ["asiatique", "coreen", "bouillon", "healthy", "sans-gluten"],
                ingredients: [
                    { ingredientId: "poulet-fermier", quantity: 190 * servings, unit: "g" },
                    { ingredientId: "riz-brise-ordinaire", quantity: 75 * servings, unit: "g" },
                    { ingredientId: "oignon-jaune", quantity: 50 * servings, unit: "g" },
                    { ingredientId: "gingembre-frais", quantity: 8 * servings, unit: "g" },
                    { ingredientId: "carotte", quantity: 50 * servings, unit: "g" }
                ],
                steps: [
                    "Déposer le poulet, l'oignon, la carotte et le gingembre tranché dans une marmite d'eau.",
                    "Laisser mijoter doucement 20 minutes à feu moyen en écumant au besoin.",
                    "Cuire le riz dans une casserole séparée 15 minutes.",
                    "Disposer le poulet effiloché sur le riz et verser le bouillon chaud fumant par-dessus."
                ]
            };
        }
        else if (text.includes("bulgogi") || text.includes("ssam")) {
            recipe = {
                title: "Bulgogi Ssam - Bouchées coréennes de bœuf sauté en feuilles de salade",
                cuisine: "asiatique",
                mealType: "dejeuner",
                prepTimeMinutes: 15,
                cookingTimeMinutes: 10,
                difficulty: "Facile",
                imageEmoji: "🥬",
                description: "L'art du 'Ssam' coréen : fines lamelles de bœuf sauté aux oignons, dégustées enroulées dans de grandes feuilles de salade croquante avec carottes et concombres.",
                chefTip: "Déposez un peu de riz, du bœuf sauté et des crudités dans une feuille de salade, refermez en ballotin et croquez !",
                tags: ["asiatique", "coreen", "healthy", "riche-en-proteines", "sans-gluten"],
                ingredients: [
                    { ingredientId: "viande-boeuf", quantity: 150 * servings, unit: "g" },
                    { ingredientId: "salade-verte", quantity: 75 * servings, unit: "g" },
                    { ingredientId: "oignon-jaune", quantity: 50 * servings, unit: "g" },
                    { ingredientId: "concombre", quantity: 50 * servings, unit: "g" },
                    { ingredientId: "carotte", quantity: 40 * servings, unit: "g" },
                    { ingredientId: "riz-brise-ordinaire", quantity: 75 * servings, unit: "g" },
                    { ingredientId: "huile-olive", quantity: 5 * servings, unit: "ml" }
                ],
                steps: [
                    "Cuire le riz dans de l'eau bouillante salée 15 minutes, égoutter et garder au tiède.",
                    "Laver les feuilles de salade et découper concombre et carotte en fins bâtonnets.",
                    "Faire sauter le bœuf émincé et l'oignon à feu vif 5 minutes dans une poêle huilée.",
                    "Composer les bouchées en enroulant bœuf, riz et crudités dans les feuilles de salade."
                ]
            };
        }
        else if (text.includes("bibimbap") || text.includes("coreen") || text.includes("coréen") || text.includes("coree") || text.includes("corée")) {
            recipe = {
                title: "Bibimbap coréen healthy au bœuf et légumes",
                cuisine: "asiatique",
                mealType: "dejeuner",
                prepTimeMinutes: 15,
                cookingTimeMinutes: 15,
                difficulty: "Facile",
                imageEmoji: "🥢",
                description: "Le fameux bol coréen rééquilibré : base de riz blanc tiède, émincé de bœuf maigre poêlé, carottes et courgettes sautées au wok et œuf au plat.",
                chefTip: "Faites sauter chaque légume rapidement pour préserver son croquant et ses vitamines.",
                tags: ["asiatique", "coreen", "riche-en-proteines", "sans-gluten"],
                ingredients: [
                    { ingredientId: "riz-brise-ordinaire", quantity: 80 * servings, unit: "g" },
                    { ingredientId: "viande-boeuf", quantity: 100 * servings, unit: "g" },
                    { ingredientId: "oeuf-poule", quantity: 1 * servings, unit: "piece" },
                    { ingredientId: "courgette", quantity: 75 * servings, unit: "g" },
                    { ingredientId: "carotte", quantity: 60 * servings, unit: "g" },
                    { ingredientId: "concombre", quantity: 50 * servings, unit: "g" },
                    { ingredientId: "huile-olive", quantity: 8 * servings, unit: "ml" }
                ],
                steps: [
                    "Cuire le riz dans de l'eau bouillante salée 15 minutes, puis égoutter.",
                    "Saisir les lamelles de bœuf 2 minutes à feu vif dans une poêle légèrement huilée.",
                    "Faire sauter séparément les carottes râpées et les courgettes en julienne 3 minutes.",
                    "Cuire les œufs au plat.",
                    "Dresser le riz au centre des bols, disposer les légumes et le bœuf en sections, et déposer un œuf au plat au sommet."
                ]
            };
        }
        else if (text.includes("japon") || text.includes("teriyaki") || text.includes("oyakodon")) {
            if (text.includes("oyakodon") || (hasPoulet && hasOeuf)) {
                recipe = {
                    title: "Oyakodon japonais allégé au poulet mijoté et œufs fondants",
                    cuisine: "asiatique",
                    mealType: "diner",
                    prepTimeMinutes: 10,
                    cookingTimeMinutes: 12,
                    difficulty: "Facile",
                    imageEmoji: "🍱",
                    description: "Le fameux donburi réconfortant du Japon : dés de poulet et oignons mijotés dans un bouillon léger, liés d'œufs battus juste saisis, sur un bol de riz chaud.",
                    chefTip: "Ne surcuisez pas les œufs pour conserver leur texture moelleuse et fondante.",
                    tags: ["asiatique", "japon", "riche-en-proteines", "healthy", "rapide"],
                    ingredients: [
                        { ingredientId: "poulet-fermier", quantity: 150 * servings, unit: "g" },
                        { ingredientId: "oeuf-poule", quantity: Math.ceil(1.5 * servings), unit: "piece" },
                        { ingredientId: "oignon-jaune", quantity: 60 * servings, unit: "g" },
                        { ingredientId: "riz-brise-ordinaire", quantity: 80 * servings, unit: "g" },
                        { ingredientId: "huile-olive", quantity: 5 * servings, unit: "ml" }
                    ],
                    steps: [
                        "Cuire le riz à l'eau bouillante 15 minutes et le réserver au chaud.",
                        "Faire suer les oignons et les dés de poulet dans une sauteuse 5 minutes.",
                        "Verser les œufs battus en filet, couvrir 1 minute jusqu'à ce que les œufs soient pris mais crémeux.",
                        "Glisser sur le riz chaud et servir immédiatement."
                    ]
                };
            } else {
                recipe = {
                    title: "Poisson blanc façon teriyaki léger, haricots verts et riz parfumé",
                    cuisine: "asiatique",
                    mealType: "dejeuner",
                    prepTimeMinutes: 12,
                    cookingTimeMinutes: 15,
                    difficulty: "Très facile",
                    imageEmoji: "🍱",
                    description: "Inspiré de l'art culinaire japonais : filets de poisson blanc frais délicatement dorés au gingembre, accompagnés de haricots verts vapeur et de riz parfumé.",
                    chefTip: "Une cuisson douce du poisson préserve sa fraîcheur et sa richesse en protéines.",
                    tags: ["asiatique", "japon", "poisson", "healthy", "sans-gluten"],
                    ingredients: [
                        { ingredientId: "poisson-blanc", quantity: 175 * servings, unit: "g" },
                        { ingredientId: "haricots-verts", quantity: 100 * servings, unit: "g" },
                        { ingredientId: "riz-parfume", quantity: 80 * servings, unit: "g" },
                        { ingredientId: "gingembre-frais", quantity: 5 * servings, unit: "g" },
                        { ingredientId: "huile-olive", quantity: 5 * servings, unit: "ml" }
                    ],
                    steps: [
                        "Cuire le riz parfumé 15 minutes et cuire les haricots verts à la vapeur 10 minutes.",
                        "Dorer les filets de poisson à la poêle avec le gingembre râpé 3 à 4 minutes par face.",
                        "Dresser le poisson chaud avec les haricots verts croquants et le riz parfumé."
                    ]
                };
            }
        }
        else if (text.includes("chine") || text.includes("chinois") || text.includes("canton")) {
            if (hasBoeuf || text.includes("boeuf") || text.includes("bœuf")) {
                recipe = {
                    title: "Sauté de bœuf cantonais aux poivrons et oignons croquants",
                    cuisine: "asiatique",
                    mealType: "dejeuner",
                    prepTimeMinutes: 15,
                    cookingTimeMinutes: 10,
                    difficulty: "Facile",
                    imageEmoji: "🥢",
                    description: "Recette traditionnelle chinoise rapide et équilibrée : émincé de bœuf maigre saisi vivement à la poêle avec poivrons doux croquants et riz blanc.",
                    chefTip: "Saisissez la viande à feu vif pendant 2 à 3 minutes maximum pour préserver tout son jus.",
                    tags: ["asiatique", "chine", "riche-en-fer", "riche-en-proteines", "sans-gluten"],
                    ingredients: [
                        { ingredientId: "viande-boeuf", quantity: 150 * servings, unit: "g" },
                        { ingredientId: "poivron", quantity: 80 * servings, unit: "g" },
                        { ingredientId: "oignon-jaune", quantity: 50 * servings, unit: "g" },
                        { ingredientId: "riz-brise-ordinaire", quantity: 80 * servings, unit: "g" },
                        { ingredientId: "huile-arachide", quantity: 6 * servings, unit: "ml" }
                    ],
                    steps: [
                        "Cuire le riz dans de l'eau bouillante salée 15 minutes, puis égoutter.",
                        "Faire sauter les oignons et les poivrons émincés 4 minutes à feu vif.",
                        "Ajouter le bœuf en lanières et faire sauter 3 minutes supplémentaires à feu vif.",
                        "Servir chaud avec le riz blanc."
                    ]
                };
            } else {
                recipe = {
                    title: "Poulet vapeur au gingembre frais et riz parfumé",
                    cuisine: "asiatique",
                    mealType: "dejeuner",
                    prepTimeMinutes: 15,
                    cookingTimeMinutes: 20,
                    difficulty: "Facile",
                    imageEmoji: "🥢",
                    description: "Plat sain emblématique de la cuisine cantonaise : suprêmes de poulet fermier cuits doucement à la vapeur avec gingembre frais et oignons doux, servis sur riz parfumé.",
                    chefTip: "La cuisson vapeur préserve la tendreté absolue du poulet sans aucun apport superflu de gras.",
                    tags: ["asiatique", "chine", "vapeur", "healthy", "riche-en-proteines", "sans-gluten"],
                    ingredients: [
                        { ingredientId: "poulet-fermier", quantity: 175 * servings, unit: "g" },
                        { ingredientId: "gingembre-frais", quantity: 8 * servings, unit: "g" },
                        { ingredientId: "oignon-jaune", quantity: 40 * servings, unit: "g" },
                        { ingredientId: "riz-parfume", quantity: 80 * servings, unit: "g" },
                        { ingredientId: "huile-olive", quantity: 5 * servings, unit: "ml" }
                    ],
                    steps: [
                        "Cuire le riz parfumé dans l'eau bouillante salée 15 minutes, puis égoutter.",
                        "Disposer les aiguillettes de poulet dans un panier vapeur avec le gingembre râpé et l'oignon.",
                        "Cuire à la vapeur douce 18 à 20 minutes jusqu'à ce que la chair soit très tendre.",
                        "Arroser d'un léger filet d'huile et servir avec le riz parfumé."
                    ]
                };
            }
        }
        else if (text.includes("vietnam") || text.includes("pho") || text.includes("phô") || text.includes("goi ga")) {
            if (text.includes("pho") || text.includes("phô") || text.includes("bouillon")) {
                recipe = {
                    title: "Bouillon façon Phô vietnamien au bœuf émincé, gingembre et légumes",
                    cuisine: "asiatique",
                    mealType: "diner",
                    prepTimeMinutes: 15,
                    cookingTimeMinutes: 20,
                    difficulty: "Facile",
                    imageEmoji: "🍜",
                    description: "Bouillon réconfortant emblématique du Vietnam : bouillon infusé au gingembre frais et oignons, garni de fines lamelles de bœuf, riz et légumes croquants.",
                    chefTip: "Versez le bouillon bouillant directement sur le bœuf très finement tranché pour une cuisson instantanée parfaite.",
                    tags: ["asiatique", "vietnam", "bouillon", "healthy", "hydratant", "sans-gluten"],
                    ingredients: [
                        { ingredientId: "viande-boeuf", quantity: 130 * servings, unit: "g" },
                        { ingredientId: "riz-brise-ordinaire", quantity: 70 * servings, unit: "g" },
                        { ingredientId: "oignon-jaune", quantity: 50 * servings, unit: "g" },
                        { ingredientId: "gingembre-frais", quantity: 8 * servings, unit: "g" },
                        { ingredientId: "chou-blanc", quantity: 50 * servings, unit: "g" },
                        { ingredientId: "carotte", quantity: 40 * servings, unit: "g" }
                    ],
                    steps: [
                        "Faire frémir l'eau avec oignons et gingembre 15 minutes pour préparer le bouillon parfumé.",
                        "Cuire le riz à part et le répartir au fond des bols.",
                        "Plonger le chou et les carottes 3 minutes dans le bouillon chaud.",
                        "Disposer le bœuf en très fines lamelles sur le riz, verser le bouillon bouillant dessus et servir fumant."
                    ]
                };
            } else {
                recipe = {
                    title: "Gỏi Gà - Salade vietnamienne de poulet effiloché, chou croquant et carottes",
                    cuisine: "asiatique",
                    mealType: "dejeuner",
                    prepTimeMinutes: 20,
                    cookingTimeMinutes: 15,
                    difficulty: "Très facile",
                    imageEmoji: "🥗",
                    description: "Salade traditionnelle du Vietnam, ultra-croquante et saine : poulet poché effiloché, chou blanc émincé, carottes, concombres et éclats d'arachides grillées.",
                    chefTip: "Massez légèrement le chou avec du sel pour le rendre tendre tout en préservant son croquant rafraîchissant.",
                    tags: ["asiatique", "vietnam", "salade", "healthy", "croquant", "sans-gluten"],
                    ingredients: [
                        { ingredientId: "poulet-fermier", quantity: 150 * servings, unit: "g" },
                        { ingredientId: "chou-blanc", quantity: 90 * servings, unit: "g" },
                        { ingredientId: "carotte", quantity: 60 * servings, unit: "g" },
                        { ingredientId: "concombre", quantity: 60 * servings, unit: "g" },
                        { ingredientId: "arachides-crues", quantity: 15 * servings, unit: "g" },
                        { ingredientId: "huile-olive", quantity: 6 * servings, unit: "ml" }
                    ],
                    steps: [
                        "Pocher le poulet 12 minutes dans de l'eau salée, laisser tiédir et effilocher à la main.",
                        "Émincer finement le chou, râper les carottes et trancher le concombre.",
                        "Torréfier les arachides à la poêle sèche 3 minutes puis les concasser.",
                        "Mélanger poulet et crudités dans un saladier, assaisonner d'huile d'olive, sel, poivre et parsemer d'arachides."
                    ]
                };
            }
        }
        else if (text.includes("inde") || text.includes("indien") || text.includes("dhal") || text.includes("daal") || text.includes("tikka") || text.includes("raita")) {
            if (text.includes("dhal") || text.includes("daal") || text.includes("vegetarien") || text.includes("niebe")) {
                recipe = {
                    title: "Dhal indien mijoté aux tomates, oignons, gingembre et riz parfumé",
                    cuisine: "asiatique",
                    mealType: "dejeuner",
                    prepTimeMinutes: 15,
                    cookingTimeMinutes: 25,
                    difficulty: "Facile",
                    imageEmoji: "🍛",
                    description: "Le plat végétarien par excellence de l'Inde : haricots fondants mijotés lentement avec des tomates fraîches, oignons dorés et gingembre râpé, servis sur riz parfumé.",
                    chefTip: "L'association de légumineuses et de riz offre un profil protéique végétal complet et digeste.",
                    tags: ["asiatique", "inde", "vegetarien", "riche-en-fibres", "economique", "sans-gluten"],
                    ingredients: [
                        { ingredientId: "niebe", quantity: 90 * servings, unit: "g" },
                        { ingredientId: "riz-parfume", quantity: 80 * servings, unit: "g" },
                        { ingredientId: "tomate-fraiche", quantity: 100 * servings, unit: "g" },
                        { ingredientId: "oignon-jaune", quantity: 50 * servings, unit: "g" },
                        { ingredientId: "gingembre-frais", quantity: 8 * servings, unit: "g" },
                        { ingredientId: "huile-arachide", quantity: 8 * servings, unit: "ml" }
                    ],
                    steps: [
                        "Cuire les haricots dans de l'eau bouillante 25 minutes jusqu'à ce qu'ils soient tendres.",
                        "Cuire le riz parfumé séparément dans de l'eau bouillante salée 15 minutes.",
                        "Dans une sauteuse, dorer l'oignon et le gingembre râpé dans l'huile 5 minutes.",
                        "Ajouter les dés de tomates, laisser compoter, puis incorporer les haricots cuits et laisser mijoter 7 minutes.",
                        "Servir chaud sur le riz parfumé."
                    ]
                };
            } else {
                recipe = {
                    title: "Poulet façon Tikka grillé aux épices, salade Raita au concombre et riz",
                    cuisine: "asiatique",
                    mealType: "dejeuner",
                    prepTimeMinutes: 15,
                    cookingTimeMinutes: 12,
                    difficulty: "Facile",
                    imageEmoji: "🍛",
                    description: "Grande spécialité indienne saine : aiguillettes de poulet marinées et grillées, accompagnées d'une sauce raïta fraîche au concombre et kossam, avec riz blanc.",
                    chefTip: "Le kossam apporte des probiotiques naturels et une fraîcheur bienfaisante pour équilibrer le repas.",
                    tags: ["asiatique", "inde", "riche-en-proteines", "healthy", "sans-gluten"],
                    ingredients: [
                        { ingredientId: "poulet-fermier", quantity: 175 * servings, unit: "g" },
                        { ingredientId: "lait-caille-kossam", quantity: 90 * servings, unit: "g" },
                        { ingredientId: "concombre", quantity: 75 * servings, unit: "g" },
                        { ingredientId: "oignon-jaune", quantity: 30 * servings, unit: "g" },
                        { ingredientId: "riz-brise-ordinaire", quantity: 80 * servings, unit: "g" },
                        { ingredientId: "huile-olive", quantity: 5 * servings, unit: "ml" }
                    ],
                    steps: [
                        "Cuire le riz à l'eau bouillante salée 15 minutes, égoutter.",
                        "Assaisonner le poulet d'oignon, sel, poivre et huile d'olive, puis griller à la poêle 8 à 10 minutes.",
                        "Râper le concombre et le mélanger au kossam avec une pincée de sel.",
                        "Dresser le riz chaud, les morceaux de poulet doré et la raïta fraîche."
                    ]
                };
            }
        }
        else if (text.includes("thailande") || text.includes("thaïlande") || text.includes("thai") || text.includes("thaï") || text.includes("krapow") || text.includes("yam nuea")) {
            if (hasBoeuf || text.includes("yam nuea") || (hasSalade && !hasPoulet)) {
                recipe = {
                    title: "Yam Nuea - Salade thaïlandaise de bœuf grillé, concombres et tomates",
                    cuisine: "asiatique",
                    mealType: "dejeuner",
                    prepTimeMinutes: 15,
                    cookingTimeMinutes: 8,
                    difficulty: "Très facile",
                    imageEmoji: "🥗",
                    description: "Salade thaïlandaise saine et explosive en saveurs : fines lamelles de bœuf grillé rosé, concombres croquants, tomates fraîches et salade verte.",
                    chefTip: "Laissez reposer la viande 3 minutes avant de la trancher pour qu'elle reste juteuse.",
                    tags: ["asiatique", "thailande", "salade", "riche-en-proteines", "healthy"],
                    ingredients: [
                        { ingredientId: "viande-boeuf", quantity: 150 * servings, unit: "g" },
                        { ingredientId: "concombre", quantity: 75 * servings, unit: "g" },
                        { ingredientId: "tomate-fraiche", quantity: 75 * servings, unit: "g" },
                        { ingredientId: "salade-verte", quantity: 50 * servings, unit: "g" },
                        { ingredientId: "oignon-jaune", quantity: 30 * servings, unit: "g" },
                        { ingredientId: "huile-olive", quantity: 6 * servings, unit: "ml" }
                    ],
                    steps: [
                        "Saisir le bœuf à feu vif 2 à 3 minutes par face, laisser reposer 3 minutes et trancher en lanières.",
                        "Disposer dans un saladier salade, concombres et tomates.",
                        "Ajouter l'oignon émincé et les lamelles de bœuf tièdes.",
                        "Assaisonner avec l'huile d'olive, sel, poivre et jus de citron."
                    ]
                };
            } else {
                recipe = {
                    title: "Pad Krapow au poulet émincé, haricots verts, riz blanc et œuf au plat",
                    cuisine: "asiatique",
                    mealType: "dejeuner",
                    prepTimeMinutes: 12,
                    cookingTimeMinutes: 12,
                    difficulty: "Facile",
                    imageEmoji: "🥢",
                    description: "Plat thaïlandais incontournable en version équilibrée : poulet émincé sauté vivement avec haricots verts et poivrons, servi avec riz chaud et œuf au plat.",
                    chefTip: "Percez le jaune d'œuf coulant pour napper la viande sautée et le riz.",
                    tags: ["asiatique", "thailande", "riche-en-proteines", "healthy", "complet"],
                    ingredients: [
                        { ingredientId: "poulet-fermier", quantity: 150 * servings, unit: "g" },
                        { ingredientId: "oeuf-poule", quantity: 1 * servings, unit: "piece" },
                        { ingredientId: "haricots-verts", quantity: 60 * servings, unit: "g" },
                        { ingredientId: "poivron", quantity: 50 * servings, unit: "g" },
                        { ingredientId: "riz-brise-ordinaire", quantity: 80 * servings, unit: "g" },
                        { ingredientId: "huile-olive", quantity: 6 * servings, unit: "ml" }
                    ],
                    steps: [
                        "Cuire le riz 15 minutes, égoutter.",
                        "Faire sauter le poulet émincé 4 minutes à feu vif, puis ajouter haricots verts en tronçons et poivrons pour 4 minutes de plus.",
                        "Cuire les œufs au plat dans une petite poêle.",
                        "Servir le sauté sur le riz chaud et déposer l'œuf au plat sur le dessus."
                    ]
                };
            }
        }
        else if (text.includes("shakshuka") || text.includes("chachouka")) {
            recipe = {
                title: "Shakshuka orientale aux œufs pochés, poivrons et pain frais",
                cuisine: "moyen_orient",
                mealType: "dejeuner",
                prepTimeMinutes: 12,
                cookingTimeMinutes: 15,
                difficulty: "Très facile",
                imageEmoji: "🧆",
                description: "Plat traditionnel du Moyen-Orient : œufs pochés dans une compotée de tomates fraîches, poivrons doux et oignons, servi avec du pain frais.",
                chefTip: "Pochez les œufs à feu doux à couvert pour garder les jaunes coulants.",
                tags: ["moyen_orient", "vegetarien", "healthy", "rapide"],
                ingredients: [
                    { ingredientId: "oeuf-poule", quantity: 2 * servings, unit: "piece" },
                    { ingredientId: "tomate-fraiche", quantity: 150 * servings, unit: "g" },
                    { ingredientId: "poivron", quantity: 75 * servings, unit: "g" },
                    { ingredientId: "oignon-jaune", quantity: 50 * servings, unit: "g" },
                    { ingredientId: "pain-frais", quantity: 75 * servings, unit: "g" },
                    { ingredientId: "huile-olive", quantity: 8 * servings, unit: "ml" }
                ],
                steps: [
                    "Faire fondre les oignons et les lamelles de poivrons dans une sauteuse avec l'huile 6 minutes.",
                    "Ajouter les dés de tomates, saler, poivrer et laisser mijoter 6 minutes.",
                    "Casser les œufs dans des petits creux de la sauce et laisser pocher 4 minutes à couvert.",
                    "Servir chaud directement à la poêle avec le pain frais."
                ]
            };
        }
        else if (text.includes("chili")) {
            recipe = {
                title: "Chili con carne healthy au bœuf maigre, haricots et riz",
                cuisine: "americaine",
                mealType: "dejeuner",
                prepTimeMinutes: 15,
                cookingTimeMinutes: 25,
                difficulty: "Facile",
                imageEmoji: "🥘",
                description: "Version healthy du plat américain : bœuf émincé mijoté aux tomates fraîches, poivrons et haricots riches en fibres, sur un lit de riz.",
                chefTip: "Un plat complet riche en protéines et en glucides complexes qui cale durablement.",
                tags: ["americaine", "riche-en-fibres", "riche-en-proteines", "sans-gluten"],
                ingredients: [
                    { ingredientId: "viande-boeuf", quantity: 100 * servings, unit: "g" },
                    { ingredientId: "niebe", quantity: 60 * servings, unit: "g" },
                    { ingredientId: "riz-brise-ordinaire", quantity: 80 * servings, unit: "g" },
                    { ingredientId: "tomate-fraiche", quantity: 100 * servings, unit: "g" },
                    { ingredientId: "poivron", quantity: 50 * servings, unit: "g" },
                    { ingredientId: "oignon-jaune", quantity: 40 * servings, unit: "g" },
                    { ingredientId: "huile-olive", quantity: 8 * servings, unit: "ml" }
                ],
                steps: [
                    "Cuire les haricots à l'eau bouillante 25 minutes, et cuire le riz séparément.",
                    "Faire revenir le bœuf émincé avec l'oignon et l'huile 5 minutes.",
                    "Ajouter les tomates, poivrons et haricots égouttés avec un demi-verre d'eau.",
                    "Laisser mijoter 15 minutes et servir sur le riz blanc chaud."
                ]
            };
        }
        else if (text.includes("chawarma") || text.includes("shawarma")) {
            recipe = {
                title: "Chawarma léger de poulet mariné, salade et pain frais",
                cuisine: "moyen_orient",
                mealType: "diner",
                prepTimeMinutes: 15,
                cookingTimeMinutes: 12,
                difficulty: "Très facile",
                imageEmoji: "🥙",
                description: "Chawarma sain : lamelles de poulet grillé aux aromates, crudités croquantes et pain frais.",
                chefTip: "Arrosez d'un filet de citron frais pour apporter fraîcheur et peps sans calories superflues.",
                tags: ["moyen_orient", "rapide", "riche-en-proteines"],
                ingredients: [
                    { ingredientId: "poulet-fermier", quantity: 150 * servings, unit: "g" },
                    { ingredientId: "pain-frais", quantity: 75 * servings, unit: "g" },
                    { ingredientId: "salade-verte", quantity: 50 * servings, unit: "g" },
                    { ingredientId: "tomate-fraiche", quantity: 60 * servings, unit: "g" },
                    { ingredientId: "concombre", quantity: 50 * servings, unit: "g" },
                    { ingredientId: "huile-olive", quantity: 6 * servings, unit: "ml" }
                ],
                steps: [
                    "Assaisonner le poulet d'une pointe d'ail, de sel et d'huile d'olive.",
                    "Griller les lamelles de poulet à la poêle 7 minutes jusqu'à ce qu'elles soient bien dorées.",
                    "Garnir le pain frais de salade verte, tomates et concombres.",
                    "Déposer le poulet chaud dans le pain et servir."
                ]
            };
        }
        else if (text.includes("wok") || (text.includes("asiatique") && hasPoulet)) {
            recipe = {
                title: "Wok asiatique de poulet sauté et légumes croquants",
                cuisine: "asiatique",
                mealType: "dejeuner",
                prepTimeMinutes: 15,
                cookingTimeMinutes: 12,
                difficulty: "Facile",
                imageEmoji: "🥢",
                description: "Poêlée asiatique vive et saine : poulet sauté à feu vif avec courgettes, carottes et poivrons sur lit de riz.",
                chefTip: "La cuisson vive et brève préserve tout le croquant des légumes.",
                tags: ["asiatique", "wok", "riche-en-proteines", "sans-gluten"],
                ingredients: [
                    { ingredientId: "poulet-fermier", quantity: 175 * servings, unit: "g" },
                    { ingredientId: "riz-brise-ordinaire", quantity: 80 * servings, unit: "g" },
                    { ingredientId: "poivron", quantity: 60 * servings, unit: "g" },
                    { ingredientId: "courgette", quantity: 60 * servings, unit: "g" },
                    { ingredientId: "carotte", quantity: 50 * servings, unit: "g" },
                    { ingredientId: "huile-olive", quantity: 8 * servings, unit: "ml" }
                ],
                steps: [
                    "Cuire le riz dans l'eau bouillante salée 15 minutes, égoutter.",
                    "Émincer le poulet et tailler les légumes en bâtonnets.",
                    "Faire sauter le poulet 5 minutes à feu vif dans un wok ou sauteuse huilée.",
                    "Ajouter les légumes et faire sauter 5 minutes en remuant sans arrêt.",
                    "Dresser sur le lit de riz bien chaud."
                ]
            };
        }
        // 1. Avocat + Œufs + Poulet
        if (hasAvocat && hasOeuf && hasPoulet) {
            recipe = {
                title: "Salade complète avocat, œufs durs et poulet grillé",
                mealType: "dejeuner",
                prepTimeMinutes: 15,
                cookingTimeMinutes: 10,
                difficulty: "Très facile",
                imageEmoji: "🥗",
                description: "Une grande salade complète healthy et gourmande : poulet fermier grillé tiède, lamelles d'avocat crémeux, œufs durs et lit de crudités fraîches.",
                chefTip: "Faites dorer le poulet à feu vif avec une pointe de sel et de poivre, et arrosez d'un filet de jus de citron pour sublimer l'avocat.",
                tags: ["healthy", "riche-en-proteines", "bonnes-graisses", "sans-gluten"],
                ingredients: [
                    { ingredientId: "poulet-fermier", quantity: 150 * servings, unit: "g" },
                    { ingredientId: "avocat", quantity: Math.ceil(0.5 * servings), unit: "piece" },
                    { ingredientId: "oeuf-poule", quantity: 1 * servings, unit: "piece" },
                    { ingredientId: "salade-verte", quantity: 70 * servings, unit: "g" },
                    { ingredientId: "tomate-fraiche", quantity: 70 * servings, unit: "g" },
                    { ingredientId: "huile-olive", quantity: 7 * servings, unit: "ml" }
                ],
                steps: [
                    "Griller les blancs de poulet assaisonnés dans une poêle légèrement huilée 4 à 5 minutes par face.",
                    "Cuire les œufs 9 minutes dans de l'eau bouillante salée, les refroidir immédiatement à l'eau froide et les écaler.",
                    "Laver et essorer la salade verte, découper les tomates en quartiers et l'avocat en lamelles régulières.",
                    "Disposer le lit de salade verte dans deux assiettes creuses ou bols.",
                    "Trancher le poulet grillé et le déposer harmonieusement avec l'avocat, les tomates et les demi-œufs durs.",
                    "Arroser d'un filet d'huile d'olive et d'une touche de jus de citron."
                ]
            };
        }
        // 2. Avocat + Œufs (avec ou sans toast)
        else if (hasAvocat && hasOeuf) {
            if (hasPain) {
                recipe = {
                    title: "Tartine croustillante d'avocat écrasé, œuf au plat et salade",
                    mealType: "petit_dejeuner",
                    prepTimeMinutes: 10,
                    cookingTimeMinutes: 6,
                    difficulty: "Très facile",
                    imageEmoji: "🥑",
                    description: "Tranches de pain frais toastées recouvertes d'avocat écrasé relevé d'une pointe de citron, surmontées d'un œuf au plat et servies avec salade.",
                    chefTip: "Écrasez l'avocat grossièrement à la fourchette en laissant des morceaux pour une texture gourmande.",
                    tags: ["healthy", "vegetarien", "rapide", "petit-dejeuner"],
                    ingredients: [
                        { ingredientId: "pain-frais", quantity: 60 * servings, unit: "g" },
                        { ingredientId: "avocat", quantity: Math.ceil(0.5 * servings), unit: "piece" },
                        { ingredientId: "oeuf-poule", quantity: 1 * servings, unit: "piece" },
                        { ingredientId: "tomate-fraiche", quantity: 60 * servings, unit: "g" },
                        { ingredientId: "salade-verte", quantity: 40 * servings, unit: "g" },
                        { ingredientId: "huile-olive", quantity: 5 * servings, unit: "ml" }
                    ],
                    steps: [
                        "Faire toaster légèrement les tranches de pain frais au grille-pain ou à la poêle sèche.",
                        "Écraser la chair d'avocat à la fourchette avec du sel, du poivre et quelques gouttes de jus de citron.",
                        "Cuire les œufs au plat dans une poêle antiadhésive avec un filet d'huile d'olive 3 minutes.",
                        "Tartiner généreusement l'avocat sur le pain chaud et déposer un œuf au plat sur chaque tartine.",
                        "Servir aussitôt avec des quartiers de tomate fraîche et quelques feuilles de salade verte."
                    ]
                };
            } else {
                recipe = {
                    title: "Salade fraîche d'avocat crémeux, œufs durs et crudités",
                    mealType: "dejeuner",
                    prepTimeMinutes: 12,
                    cookingTimeMinutes: 9,
                    difficulty: "Très facile",
                    imageEmoji: "🥗",
                    description: "Une salade vitaminée et rassasiante associant avocat fondant, œufs durs protéinés, concombres croquants et tomates mûres.",
                    chefTip: "Un filet d'huile d'olive extra-vierge et une pincée de sel marin suffisent pour un goût authentique.",
                    tags: ["healthy", "vegetarien", "sans-gluten", "salade"],
                    ingredients: [
                        { ingredientId: "avocat", quantity: Math.ceil(0.5 * servings), unit: "piece" },
                        { ingredientId: "oeuf-poule", quantity: 2 * servings, unit: "piece" },
                        { ingredientId: "salade-verte", quantity: 80 * servings, unit: "g" },
                        { ingredientId: "tomate-fraiche", quantity: 80 * servings, unit: "g" },
                        { ingredientId: "concombre", quantity: 60 * servings, unit: "g" },
                        { ingredientId: "huile-olive", quantity: 7 * servings, unit: "ml" }
                    ],
                    steps: [
                        "Plonger les œufs 9 minutes dans de l'eau frémissante, les rafraîchir à l'eau froide puis les couper en quartiers.",
                        "Tailler l'avocat en lamelles, le concombre en rondelles et les tomates en dés.",
                        "Dresser la salade verte lavée et bien essorée au fond du plat.",
                        "Disposer les quartiers d'œufs, l'avocat et les crudités par sections de couleur.",
                        "Assaisonner d'huile d'olive et de poivre moulu avant de servir."
                    ]
                };
            }
        }
        // 3. Poulet + Riz + Légumes
        else if (hasPoulet && (hasRiz || text.includes("legume") || text.includes("légume"))) {
            recipe = {
                title: "Poulet grillé émincé, riz et légumes sautés",
                mealType: "dejeuner",
                prepTimeMinutes: 15,
                cookingTimeMinutes: 20,
                difficulty: "Facile",
                imageEmoji: "🍗",
                description: "Le déjeuner healthy idéal : morceaux de poulet fermier dorés, riz blanc léger et poêlée croquante de courgettes et carottes.",
                chefTip: "Faites sauter les légumes à feu très vif 5 à 7 minutes seulement pour qu'ils restent bien croquants.",
                tags: ["healthy", "riche-en-proteines", "equilibre", "sans-gluten"],
                ingredients: [
                    { ingredientId: "poulet-fermier", quantity: 175 * servings, unit: "g" },
                    { ingredientId: "riz-brise-ordinaire", quantity: 80 * servings, unit: "g" },
                    { ingredientId: "courgette", quantity: 100 * servings, unit: "g" },
                    { ingredientId: "carotte", quantity: 75 * servings, unit: "g" },
                    { ingredientId: "oignon-jaune", quantity: 50 * servings, unit: "g" },
                    { ingredientId: "huile-olive", quantity: 8 * servings, unit: "ml" }
                ],
                steps: [
                    "Rincer le riz et le cuire 15 minutes dans de l'eau bouillante salée, puis égoutter.",
                    "Découper les filets de poulet en aiguillettes et les légumes en rondelles fines.",
                    "Faire dorer le poulet dans une poêle chaude avec un peu d'huile d'olive 8 minutes.",
                    "Dans une sauteuse avec le reste d'huile, faire revenir l'oignon, la carotte et la courgette 7 minutes.",
                    "Dresser le riz blanc au centre de l'assiette, entouré des légumes croquants et du poulet doré."
                ]
            };
        }
        // 4. Poulet + Pommes de terre
        else if (hasPoulet && hasPommeTerre) {
            recipe = {
                title: "Poulet rôti au four, pommes de terre et haricots verts",
                mealType: "dejeuner",
                prepTimeMinutes: 15,
                cookingTimeMinutes: 30,
                difficulty: "Facile",
                imageEmoji: "🍗",
                description: "Poulet fermier rôti doré et savoureux, servi avec pommes de terre fondantes au four et haricots verts vapeur.",
                chefTip: "Cuisez les pommes de terre avec un peu d'oignon émincé pour une douceur naturellement caramélisée sans excès de matière grasse.",
                tags: ["healthy", "familial", "riche-en-proteines", "sans-gluten"],
                ingredients: [
                    { ingredientId: "poulet-fermier", quantity: 200 * servings, unit: "g" },
                    { ingredientId: "pommes-de-terre", quantity: 175 * servings, unit: "g" },
                    { ingredientId: "haricots-verts", quantity: 100 * servings, unit: "g" },
                    { ingredientId: "oignon-jaune", quantity: 50 * servings, unit: "g" },
                    { ingredientId: "huile-olive", quantity: 8 * servings, unit: "ml" }
                ],
                steps: [
                    "Éplucher les pommes de terre et les couper en morceaux réguliers.",
                    "Placer les pommes de terre et l'oignon émincé dans un plat à four avec l'huile d'olive, sel et poivre à 200°C pendant 30 min.",
                    "Cuire le poulet assaisonné au four ou à la poêle jusqu'à ce qu'il soit bien doré.",
                    "Cuire les haricots verts à la vapeur 10 minutes pour préserver leurs vitamines et leur texture ferme.",
                    "Dresser le poulet chaud avec les pommes de terre fondantes et les haricots verts."
                ]
            };
        }
        // 5. Poisson + Pommes de terre + Salade
        else if (hasPoisson && (hasPommeTerre || hasSalade)) {
            recipe = {
                title: "Poisson grillé, pommes de terre vapeur et salade fraîche",
                mealType: "dejeuner",
                prepTimeMinutes: 15,
                cookingTimeMinutes: 20,
                difficulty: "Facile",
                imageEmoji: "🐟",
                description: "Filet de poisson blanc grillé délicatement à la poêle, accompagné de pommes de terre vapeur fondantes et de salade verte.",
                chefTip: "Arrosez d'un filet de jus de citron frais juste avant de servir pour relever la chair fine du poisson.",
                tags: ["healthy", "omega-3", "poisson", "sans-gluten"],
                ingredients: [
                    { ingredientId: "poisson-blanc", quantity: 175 * servings, unit: "g" },
                    { ingredientId: "pommes-de-terre", quantity: 150 * servings, unit: "g" },
                    { ingredientId: "salade-verte", quantity: 60 * servings, unit: "g" },
                    { ingredientId: "tomate-fraiche", quantity: 50 * servings, unit: "g" },
                    { ingredientId: "huile-olive", quantity: 8 * servings, unit: "ml" }
                ],
                steps: [
                    "Éplucher les pommes de terre et les cuire à la vapeur ou à l'eau 18 à 20 minutes.",
                    "Assaisonner les filets de poisson de sel fin, poivre et jus de citron.",
                    "Saisir le poisson dans une poêle antiadhésive avec un filet d'huile d'olive 3 à 4 minutes par face.",
                    "Laver la salade verte et tailler la tomate en quartiers.",
                    "Dresser le poisson grillé avec les pommes de terre vapeur arrosées d'un trait d'huile d'olive et la salade fraîche."
                ]
            };
        }
        // 6. Poisson + Riz + Haricots verts
        else if (hasPoisson && (hasRiz || hasHaricotVert)) {
            recipe = {
                title: "Filet de poisson blanc poêlé, riz et haricots verts vapeur",
                mealType: "dejeuner",
                prepTimeMinutes: 12,
                cookingTimeMinutes: 15,
                difficulty: "Facile",
                imageEmoji: "🐟",
                description: "Un repas hypocalorique, digeste et riche en protéines pures : poisson blanc poêlé, riz blanc léger et haricots verts vapeur.",
                chefTip: "Idéal pour un déjeuner tonifiant qui ne pèse pas sur la digestion.",
                tags: ["healthy", "faible-calorie", "proteines-maigres", "sans-gluten"],
                ingredients: [
                    { ingredientId: "poisson-blanc", quantity: 175 * servings, unit: "g" },
                    { ingredientId: "riz-brise-ordinaire", quantity: 80 * servings, unit: "g" },
                    { ingredientId: "haricots-verts", quantity: 120 * servings, unit: "g" },
                    { ingredientId: "oignon-jaune", quantity: 40 * servings, unit: "g" },
                    { ingredientId: "huile-olive", quantity: 7 * servings, unit: "ml" }
                ],
                steps: [
                    "Cuire le riz dans de l'eau bouillante salée 15 minutes, puis égoutter.",
                    "Cuire les haricots verts à la vapeur 10 minutes pour qu'ils restent bien verts et croquants.",
                    "Faire revenir les filets de poisson à la poêle avec l'huile d'olive et l'oignon émincé 3 minutes par face.",
                    "Dresser le poisson doré avec le riz chaud et les haricots verts vapeur."
                ]
            };
        }
        // 7. Thon + Haricots verts + Œufs
        else if (hasThon && (hasHaricotVert || hasOeuf)) {
            recipe = {
                title: "Salade de thon au naturel, haricots verts et œufs durs",
                mealType: "diner",
                prepTimeMinutes: 15,
                cookingTimeMinutes: 10,
                difficulty: "Très facile",
                imageEmoji: "🥗",
                description: "La salade composée healthy par excellence façon niçoise : haricots verts croquants, thon au naturel émietté, œufs durs et tomates fraîches.",
                chefTip: "Plongez les haricots cuits dans un bain d'eau glacée pour stopper la cuisson et préserver leur texture croquante.",
                tags: ["healthy", "riche-en-proteines", "sans-gluten", "salade"],
                ingredients: [
                    { ingredientId: "thon-naturel", quantity: 80 * servings, unit: "g" },
                    { ingredientId: "haricots-verts", quantity: 125 * servings, unit: "g" },
                    { ingredientId: "oeuf-poule", quantity: 1 * servings, unit: "piece" },
                    { ingredientId: "tomate-fraiche", quantity: 75 * servings, unit: "g" },
                    { ingredientId: "oignon-jaune", quantity: 30 * servings, unit: "g" },
                    { ingredientId: "huile-olive", quantity: 7 * servings, unit: "ml" }
                ],
                steps: [
                    "Cuire les haricots verts 8 à 10 minutes dans l'eau bouillante salée, puis égoutter.",
                    "Cuire les œufs 9 minutes dans de l'eau frémissante, les refroidir, les écaler et les couper en deux.",
                    "Égoutter le thon au naturel et l'émietter délicatement à la fourchette.",
                    "Couper les tomates en quartiers et émincer très finement l'oignon.",
                    "Réunir les haricots verts, les tomates, l'oignon et le thon dans un plat.",
                    "Déposer les demi-œufs durs sur le dessus et arroser d'un filet d'huile d'olive."
                ]
            };
        }
        // 8. Omelette aux légumes + Pain
        else if (hasOmelette || (hasOeuf && (text.includes("legume") || text.includes("légume") || hasPain))) {
            recipe = {
                title: "Omelette moelleuse aux légumes et pain frais",
                mealType: "petit_dejeuner",
                prepTimeMinutes: 10,
                cookingTimeMinutes: 8,
                difficulty: "Très facile",
                imageEmoji: "🍳",
                description: "Omelette aérée et dorée aux tomates fraîches, oignons doux et poivrons croquants, servie avec du pain frais croustillant.",
                chefTip: "Battez les œufs avec une cuillère d'eau pour rendre l'omelette encore plus moelleuse.",
                tags: ["healthy", "vegetarien", "rapide", "petit-dejeuner"],
                ingredients: [
                    { ingredientId: "oeuf-poule", quantity: 2 * servings, unit: "piece" },
                    { ingredientId: "tomate-fraiche", quantity: 60 * servings, unit: "g" },
                    { ingredientId: "oignon-jaune", quantity: 40 * servings, unit: "g" },
                    { ingredientId: "poivron", quantity: 50 * servings, unit: "g" },
                    { ingredientId: "pain-frais", quantity: 60 * servings, unit: "g" },
                    { ingredientId: "huile-olive", quantity: 5 * servings, unit: "ml" }
                ],
                steps: [
                    "Émincer l'oignon et le poivron, couper la tomate en petits dés.",
                    "Faire revenir les légumes dans une poêle antiadhésive avec l'huile d'olive 4 minutes.",
                    "Battre les œufs entiers avec une pincée de sel et un tour de poivre.",
                    "Verser les œufs battus sur les légumes chauds dans la poêle.",
                    "Cuire 3 à 4 minutes à feu moyen en ramenant les bords vers le centre.",
                    "Plier l'omelette en deux et servir immédiatement avec le pain frais."
                ]
            };
        }
        // 9. Bœuf + Poivrons + Riz
        else if (hasBoeuf) {
            recipe = {
                title: "Sauté de bœuf émincé aux poivrons et riz blanc",
                mealType: "dejeuner",
                prepTimeMinutes: 15,
                cookingTimeMinutes: 15,
                difficulty: "Facile",
                imageEmoji: "🥩",
                description: "Lamelles de bœuf maigre saisies à feu vif avec poivrons croquants et oignons, servies sur un lit de riz blanc parfumé.",
                chefTip: "Saisissez la viande rapidement à feu très vif pour qu'elle reste bien juteuse et tendre.",
                tags: ["healthy", "riche-en-fer", "riche-en-proteines", "sans-gluten"],
                ingredients: [
                    { ingredientId: "viande-boeuf", quantity: 150 * servings, unit: "g" },
                    { ingredientId: "riz-brise-ordinaire", quantity: 80 * servings, unit: "g" },
                    { ingredientId: "poivron", quantity: 100 * servings, unit: "g" },
                    { ingredientId: "oignon-jaune", quantity: 60 * servings, unit: "g" },
                    { ingredientId: "huile-olive", quantity: 7 * servings, unit: "ml" }
                ],
                steps: [
                    "Cuire le riz blanc dans de l'eau bouillante salée 15 minutes, puis égoutter.",
                    "Détailler le bœuf en fines lanières et trancher les poivrons et l'oignon en lamelles.",
                    "Faire chauffer l'huile d'olive dans une sauteuse et saisir le bœuf 3 minutes à feu vif. Réserver.",
                    "Faire sauter les poivrons et l'oignon dans la même poêle 5 à 6 minutes.",
                    "Remettre la viande pour réchauffer l'ensemble pendant 1 minute.",
                    "Dresser sur le lit de riz bien chaud."
                ]
            };
        }
        // 10. Fallback universel healthy
        else {
            recipe = {
                title: "Bowl équilibré au poulet grillé, avocat et riz",
                mealType: "dejeuner",
                prepTimeMinutes: 15,
                cookingTimeMinutes: 15,
                difficulty: "Facile",
                imageEmoji: "🥑",
                description: "Un bowl complet sain et nourrissant : émincé de poulet fermier grillé, tranches d'avocat crémeux, riz blanc tiède et crudités de saison.",
                chefTip: "Le repas équilibré par excellence : protéines complètes, glucides à digestion lente et bonnes graisses mono-insaturées.",
                tags: ["healthy", "equilibre", "riche-en-proteines", "sans-gluten"],
                ingredients: [
                    { ingredientId: "poulet-fermier", quantity: 150 * servings, unit: "g" },
                    { ingredientId: "avocat", quantity: Math.ceil(0.5 * servings), unit: "piece" },
                    { ingredientId: "riz-brise-ordinaire", quantity: 80 * servings, unit: "g" },
                    { ingredientId: "concombre", quantity: 60 * servings, unit: "g" },
                    { ingredientId: "carotte", quantity: 60 * servings, unit: "g" },
                    { ingredientId: "huile-olive", quantity: 8 * servings, unit: "ml" }
                ],
                steps: [
                    "Cuire le riz dans de l'eau bouillante salée pendant 15 minutes, égoutter et laisser tiédir.",
                    "Émincer le poulet et le faire dorer à la poêle avec l'huile d'olive 8 minutes.",
                    "Couper l'avocat en lamelles et le concombre et les carottes en fines rondelles.",
                    "Disposer le riz tiède au fond de bols.",
                    "Garnir harmonieusement avec le poulet doré, les lamelles d'avocat et les crudités.",
                    "Arroser d'un filet de jus de citron et déguster."
                ]
            };
        }

        recipe.id = "ia-recette-" + Date.now();
        recipe.baseServings = servings;
        return enrichRecipeWithNutrition(recipe, servings);
    }

    // ============================================================
    // GÉNÉRATEUR CRÉATIF LOCAL (SUR-MESURE & OFFLINE)
    // Coordonne les ingrédients sélectionnés pour créer une vraie recette saine
    // ============================================================
    function generateCreativeRecipe(selectedIngredientIds = [], options = {}) {
        if (!selectedIngredientIds || selectedIngredientIds.length === 0) {
            throw new Error("Veuillez sélectionner au moins un ingrédient pour créer une recette.");
        }

        const servings = options.servings || 2;
        const names = selectedIngredientIds.join(" ");

        // Déléguer au moteur de composition culinaire saine
        return generateRecipeFromPrompt(names, { servings, ...options });
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
        generateRecipeFromPrompt,
        generateAIPrompt,
        parseAndValidateAIRecipe,
        enrichRecipeWithNutrition,
        toggleFavorite,
        isFavorite,
        getFavoriteIds,
        getPresets: () => PRESETS
    };
});
