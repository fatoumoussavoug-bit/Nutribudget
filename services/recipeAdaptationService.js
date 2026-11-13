/**
 * NutriBudget - Service d'Adaptation Dynamique des Recettes (Étape 5)
 * 
 * Permet d'adapter n'importe quelle recette sénégalaise en 1 clic :
 * - "Plus de protéines" (Boost musculaire / satiété)
 * - "Plus économique" (Optimisation du coût en FCFA)
 * - "Alléger en graisses" (Maîtrise des lipides et calories d'huile)
 * - "Adapter à mes calories cibles" (Calibration sur le profil utilisateur)
 * - "Remplacement intelligent d'ingrédient" (Substitutions locales dakaroises)
 * 
 * PRINCIPE D'OR : Tous les recalculs nutritionnels et budgétaires
 * sont délégués de manière 100% déterministe à NutriCalculator.
 */

(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        const ingredientsModule = require("../data/ingredients.js");
        const calculatorModule = require("./nutritionCalculator.js");
        const recipeModule = require("./recipeService.js");
        const profileModule = require("./userProfileService.js");
        module.exports = factory(
            ingredientsModule.SEN_INGREDIENTS,
            calculatorModule,
            recipeModule,
            profileModule
        );
    } else {
        root.NutriAdaptation = factory(
            root.NutriData ? root.NutriData.SEN_INGREDIENTS : [],
            root.NutriCalculator,
            root.NutriRecipes,
            root.NutriProfile
        );
    }
})(typeof self !== "undefined" ? self : this, function (ingredients, calculator, recipeService, profileService) {
    "use strict";

    // ============================================================
    // DICTIONNAIRE DE SUBSTITUTIONS INTELLIGENTES DU TERROIR
    // Remplacement équivalent par catégorie & bénéfice culinaire / nutritionnel
    // ============================================================
    const SUBSTITUTION_RULES = {
        // Céréales & Féculents
        "riz-brise-ordinaire": [
            { id: "fonio", reason: "Index glycémique plus bas, idéal pour diabétiques et fibres", category: "sante" },
            { id: "mil-arraw", reason: "Riche en fer et magnésium, tradition ancestrale", category: "nutriments" },
            { id: "patate-douce", reason: "Riche en bêta-carotène (vitamine A) et glucides complexes", category: "vitamines" },
            { id: "manioc", reason: "Très rassasiant et économique", category: "economie" }
        ],
        "riz-parfume": [
            { id: "riz-brise-ordinaire", reason: "Plus économique (-33% sur le prix du riz)", category: "economie" },
            { id: "fonio", reason: "Alternative digeste et légère sans gluten", category: "sante" }
        ],
        "fonio": [
            { id: "mil-arraw", reason: "Alternative céréalière locale très économique", category: "economie" },
            { id: "riz-brise-ordinaire", reason: "Céréale classique plus accessible", category: "praticite" }
        ],
        "thiakry-mil": [
            { id: "mil-arraw", reason: "Version bouillie matinale traditionnelle", category: "terroir" }
        ],

        // Poissons & Viandes
        "poisson-blanc": [
            { id: "yaboye-sardinelle", reason: "Poisson frais local très économique (-60% du prix) et ultra-riche en oméga-3", category: "economie" },
            { id: "poulet-fermier", reason: "Viande blanche maigre et facile à trouver partout", category: "praticite" },
            { id: "thon-naturel", reason: "Alternative pratique en boîte prête à l'emploi", category: "praticite" }
        ],
        "thon-naturel": [
            { id: "sardines-boite", reason: "Boîte de conserve locale très économique disponible dans toutes les boutiques", category: "economie" },
            { id: "oeuf-poule", reason: "Protéines complètes rapides et très économiques", category: "economie" },
            { id: "yaboye-sardinelle", reason: "Poisson frais local riche en oméga-3", category: "nutriments" }
        ],
        "poulet-fermier": [
            { id: "yaboye-sardinelle", reason: "Économise 66% du coût protéique et apporte des oméga-3", category: "economie" },
            { id: "niebe", reason: "Protéine végétale économique, sans cholestérol", category: "vegan" },
            { id: "oeuf-poule", reason: "Protéines complètes rapides et économiques", category: "economie" }
        ],
        "viande-boeuf": [
            { id: "yaboye-sardinelle", reason: "Moins cher (-75%), plus maigre et riche en acides gras sains", category: "economie" },
            { id: "poulet-fermier", reason: "Viande blanche plus maigre", category: "sante" },
            { id: "niebe", reason: "Remplacement économique 100% végétal", category: "vegan" }
        ],
        "thiof-merou": [
            { id: "yaboye-sardinelle", reason: "Poisson populaire dakarois 5 fois moins cher et plus riche en oméga-3", category: "economie" },
            { id: "sardines-boite", reason: "Alternative pratique prête à l'emploi", category: "praticite" }
        ],
        "yaboye-sardinelle": [
            { id: "oeuf-poule", reason: "Alternative protéique rapide sans préparation de poisson", category: "praticite" },
            { id: "niebe", reason: "Alternative végétale riche en fibres et minéraux", category: "vegan" },
            { id: "poulet-fermier", reason: "Pour les personnes n'aimant pas le poisson", category: "gout" }
        ],

        // Matières grasses
        "huile-olive": [
            { id: "huile-arachide", reason: "Huile végétale locale beaucoup plus économique (-65% du coût)", category: "economie" },
            { id: "huile-palme-rouge", reason: "Huile brute locale riche en vitamine A naturelle", category: "nutriments" }
        ],
        "huile-arachide": [
            { id: "huile-palme-rouge", reason: "Apporte de la vitamine A naturelle et couleur rouge terroir", category: "nutriments" },
            { id: "huile-olive", reason: "Graisses mono-insaturées protectrices du système cardiovasculaire", category: "sante" }
        ],
        "huile-palme-rouge": [
            { id: "huile-arachide", reason: "Saveur plus neutre et teneur réduite en acides gras saturés", category: "sante" }
        ],

        // Féculents & Pommes de terre
        "pommes-de-terre": [
            { id: "patate-douce", reason: "Tubercule local économique, riche en vitamine A et à index glycémique plus modéré", category: "sante" },
            { id: "manioc", reason: "Féculent local très nourrissant et très accessible", category: "economie" },
            { id: "riz-brise-ordinaire", reason: "Féculent universel rapide à préparer", category: "praticite" }
        ],
        "pain-frais": [
            { id: "pain-tapalapa", reason: "Pain artisanal traditionnel très consistant et plus économique", category: "economie" },
            { id: "riz-brise-ordinaire", reason: "Base glucidique locale très accessible", category: "praticite" }
        ],

        // Fruits & Bonnes graisses
        "avocat": [
            { id: "oeuf-poule", reason: "Alternative crémeuse et riche en protéines complètes", category: "proteines" },
            { id: "pate-arachide", reason: "Bonnes graisses végétales locales et onctuosité", category: "terroir" }
        ],

        // Légumineuses
        "haricots-verts": [
            { id: "niebe", reason: "Légumineuse locale économique ultra-protéinée (24g/100g) et rassasiante", category: "economie" },
            { id: "courgette", reason: "Légume vert tendre et très digeste", category: "praticite" },
            { id: "chou-blanc", reason: "Légume vert économique et croquant", category: "economie" }
        ],
        "niebe": [
            { id: "oeuf-poule", reason: "Protéines animales complètes", category: "proteines" },
            { id: "arachides-crues", reason: "Apporte du croquant et de l'énergie", category: "energie" },
            { id: "haricots-verts", reason: "Légume vert léger pour alléger en calories", category: "sante" }
        ],
        "pate-arachide": [
            { id: "arachides-crues", reason: "Arachides entières concassées pour texture croquante", category: "texture" }
        ],

        // Légumes & Feuilles
        "courgette": [
            { id: "diakhatou", reason: "Légume local très économique et stimulant pour la digestion", category: "terroir" },
            { id: "carotte", reason: "Croquant et riche en bêta-carotène", category: "vitamines" },
            { id: "gombo-frais", reason: "Légume vert doux riche en fibres solubles", category: "nutriments" }
        ],
        "poivron": [
            { id: "tomate-fraiche", reason: "Légume juteux riche en antioxydants", category: "praticite" },
            { id: "carotte", reason: "Croquant et couleur vive", category: "vitamines" }
        ],
        "concombre": [
            { id: "salade-verte", reason: "Feuille fraîche et croquante", category: "praticite" },
            { id: "tomate-fraiche", quantity: 1, reason: "Crudité fraîche gorgée d'eau", category: "praticite" }
        ],

        // Légumes & Feuilles
        "gombo-frais": [
            { id: "chou-blanc", reason: "Légume économique sans mucilage pour ceux qui n'aiment pas la texture gluante", category: "texture" },
            { id: "moringa-nebeday", reason: "Concentré exceptionnel de fer et calcium", category: "superaliment" }
        ],
        "moringa-nebeday": [
            { id: "feuilles-bissap-vert", reason: "Touche acidulée stimulante et riche en fer", category: "gout" }
        ],
        "chou-blanc": [
            { id: "carotte", reason: "Apporte du croquant et du bêta-carotène", category: "vitamines" },
            { id: "diakhatou", reason: "Touche amère digestive traditionnelle", category: "terroir" }
        ]
    };

    /**
     * Trouver un ingrédient par son ID dans la base
     */
    function findIngredient(id) {
        if (!id) return null;
        return ingredients.find(ing => ing.id === id) || null;
    }

    /**
     * Obtenir les substitutions disponibles pour un ingrédient donné
     */
    function getAvailableSubstitutions(ingredientId) {
        const rules = SUBSTITUTION_RULES[ingredientId] || [];
        return rules.map(rule => {
            const targetIng = findIngredient(rule.id);
            return {
                id: rule.id,
                name: targetIng ? targetIng.name : rule.id,
                categoryLabel: targetIng ? targetIng.categoryLabel : "",
                priceUnitLabel: targetIng ? (targetIng.priceUnit === "piece" ? `${targetIng.pricePerPiece || 100} FCFA/pièce` : `${targetIng.defaultPricePerKg} FCFA/kg`) : "",
                reason: rule.reason,
                badgeCategory: rule.category
            };
        });
    }

    /**
     * Clone une recette de manière profonde
     */
    function cloneRecipe(recipe) {
        return {
            ...recipe,
            ingredients: (recipe.ingredients || []).map(i => ({ ...i })),
            steps: Array.isArray(recipe.steps) ? [...recipe.steps] : [],
            tags: Array.isArray(recipe.tags) ? [...recipe.tags] : []
        };
    }

    // ============================================================
    // 1. ADAPTATION "+ DE PROTÉINES" (BOOST PROTÉIQUE SÉNÉGALAIS)
    // ============================================================
    function adaptMoreProteins(recipe, targetServings = null) {
        const adapted = cloneRecipe(recipe);
        const servings = targetServings || adapted.activeServings || adapted.baseServings || 2;

        let boosted = false;

        // Chercher une source protéique existante à renforcer (+30%)
        adapted.ingredients = adapted.ingredients.map(item => {
            const ing = findIngredient(item.ingredientId);
            if (!ing) return item;

            const isProteinSource = ing.category === "poissons_viandes_oeufs" ||
                                    ing.category === "legumineuses" ||
                                    ing.id.includes("yaboye") ||
                                    ing.id.includes("poulet") ||
                                    ing.id.includes("niebe") ||
                                    ing.id.includes("oeuf");

            if (isProteinSource && !boosted) {
                boosted = true;
                const multiplier = ing.priceUnit === "piece" ? 1.5 : 1.35;
                const newQty = ing.priceUnit === "piece"
                    ? Math.round(item.quantity * multiplier)
                    : Math.round(item.quantity * multiplier);
                return { ...item, quantity: Math.max(item.quantity + 1, newQty) };
            }
            return item;
        });

        // Si aucune protéine majeure n'a pu être augmentée, ajouter du Niébé ou des Œufs
        if (!boosted) {
            adapted.ingredients.push({
                ingredientId: "niebe",
                quantity: 60 * servings,
                unit: "g"
            });
            adapted.steps.push("Ajouter le niébé pré-cuit pour un enrichissement protéique naturel et économique.");
        }

        adapted.adaptationApplied = "plus_proteines";
        adapted.adaptationLabel = "💪 Version Enrichie en Protéines (+30%)";
        adapted.adaptationDescription = "Renforce les portions de poisson, volaille, œufs ou niébé pour maximiser la satiété et la récupération musculaire.";

        return recipeService ? recipeService.enrichRecipeWithNutrition(adapted, servings) : adapted;
    }

    // ============================================================
    // 2. ADAPTATION "PLUS ÉCONOMIQUE" (OPTIMISATION DU BUDGET FCFA)
    // ============================================================
    function adaptLowerCost(recipe, targetServings = null) {
        const adapted = cloneRecipe(recipe);
        const servings = targetServings || adapted.activeServings || adapted.baseServings || 2;

        adapted.ingredients = adapted.ingredients.map(item => {
            // Remplacer les viandes/poissons nobles coûteux par Yaboye ou Niébé
            if (item.ingredientId === "thiof-merou" || item.ingredientId === "viande-boeuf") {
                return { ingredientId: "yaboye-sardinelle", quantity: item.quantity, unit: "g" };
            }
            if (item.ingredientId === "poulet-fermier" && item.quantity > 400) {
                // Diminuer la part de poulet et compléter par du niébé économique
                return { ingredientId: "poulet-fermier", quantity: Math.round(item.quantity * 0.7), unit: "g" };
            }
            // Remplacer riz de luxe par riz brisé ordinaire
            if (item.ingredientId === "riz-parfume") {
                return { ingredientId: "riz-brise-ordinaire", quantity: item.quantity, unit: "g" };
            }
            // Modérer légèrement l'huile si supérieure à 40ml
            if (item.ingredientId === "huile-arachide" && item.quantity > 30) {
                return { ingredientId: "huile-arachide", quantity: Math.round(item.quantity * 0.75), unit: "ml" };
            }
            return item;
        });

        // Si la recette utilise du poulet allégé, compenser avec 50g de niébé par portion
        const hasPoulet = adapted.ingredients.some(i => i.ingredientId === "poulet-fermier");
        const hasNiebe = adapted.ingredients.some(i => i.ingredientId === "niebe");
        if (hasPoulet && !hasNiebe) {
            adapted.ingredients.push({
                ingredientId: "niebe",
                quantity: 40 * servings,
                unit: "g"
            });
        }

        adapted.adaptationApplied = "moins_cher";
        adapted.adaptationLabel = "💰 Version Économique & Anti-Inflation";
        adapted.adaptationDescription = "Substitue les ingrédients coûteux par des super-aliments populaires (Yaboye, Niébé, Riz brisé) pour alléger la facture au marché.";

        return recipeService ? recipeService.enrichRecipeWithNutrition(adapted, servings) : adapted;
    }

    // ============================================================
    // 3. ADAPTATION "ALLÉGÉE EN GRAISSES / LIPIDES MAÎTRISÉS"
    // ============================================================
    function adaptHealthyLight(recipe, targetServings = null) {
        const adapted = cloneRecipe(recipe);
        const servings = targetServings || adapted.activeServings || adapted.baseServings || 2;

        adapted.ingredients = adapted.ingredients.map(item => {
            const ing = findIngredient(item.ingredientId);
            if (!ing) return item;

            // Réduire drastiquement les huiles (-40% à -50%)
            if (item.ingredientId === "huile-arachide" || item.ingredientId === "huile-palme-rouge") {
                const reduced = Math.max(10, Math.round(item.quantity * 0.5));
                return { ...item, quantity: reduced };
            }
            // Alléger la pâte d'arachide (-30%)
            if (item.ingredientId === "pate-arachide") {
                return { ...item, quantity: Math.round(item.quantity * 0.7) };
            }
            return item;
        });

        // Ajouter un assaisonnement sain pour compenser le goût (Nététou ou aromates)
        const hasSoumbala = adapted.ingredients.some(i => i.ingredientId === "soumbala-netetou");
        if (!hasSoumbala) {
            adapted.ingredients.push({
                ingredientId: "soumbala-netetou",
                quantity: 10 * servings,
                unit: "g"
            });
            adapted.steps.push("Assaisonner avec du nététou naturel pour relever les saveurs sans ajout de matière grasse.");
        }

        adapted.adaptationApplied = "legere_lipides";
        adapted.adaptationLabel = "🌿 Version Légère (Lipides Maîtrisés)";
        adapted.adaptationDescription = "Divise par deux les huiles de cuisson tout en préservant le moelleux grâce aux bouillons parfumés et au nététou.";

        return recipeService ? recipeService.enrichRecipeWithNutrition(adapted, servings) : adapted;
    }

    // ============================================================
    // 4. ADAPTATION "CALIBRER SUR MA CIBLE CALORIQUE"
    // ============================================================
    function scaleToTargetCalories(recipe, targetCaloriesPerServing, targetServings = null) {
        if (!recipe) return null;
        const servings = targetServings || recipe.activeServings || recipe.baseServings || 2;
        const targetKcal = Number(targetCaloriesPerServing);
        if (!targetKcal || targetKcal <= 0) return recipe;

        // Calculer l'état actuel
        const currentEnriched = recipeService ? recipeService.enrichRecipeWithNutrition(recipe, servings) : recipe;
        const currentCalPerServing = currentEnriched.nutrition ? currentEnriched.nutrition.perServing.calories : 500;

        if (currentCalPerServing <= 0) return recipe;

        const ratio = targetKcal / currentCalPerServing;
        const adapted = cloneRecipe(recipe);

        // Appliquer le ratio aux féculents et protéines
        adapted.ingredients = adapted.ingredients.map(item => {
            const ing = findIngredient(item.ingredientId);
            if (!ing) return item;

            // Les légumes peuvent rester constants pour conserver les fibres et le volume
            if (ing.category === "legumes") {
                return item;
            }

            const scaledQty = ing.priceUnit === "piece"
                ? Math.max(1, Math.round(item.quantity * ratio))
                : Math.max(5, Math.round(item.quantity * ratio));

            return { ...item, quantity: scaledQty };
        });

        adapted.adaptationApplied = "cible_calorique";
        adapted.adaptationLabel = `🎯 Calibré sur ${Math.round(targetKcal)} kcal / portion`;
        adapted.adaptationDescription = `Ajuste les quantités pour s'aligner exactement sur vos besoins énergétiques quotidiens (${Math.round(targetKcal)} kcal).`;

        return recipeService ? recipeService.enrichRecipeWithNutrition(adapted, servings) : adapted;
    }

    // ============================================================
    // 5. REMPLACEMENT D'UN INGRÉDIENT PRÉCIS
    // ============================================================
    function substituteIngredient(recipe, targetIngredientId, replacementIngredientId, targetServings = null) {
        if (!recipe || !targetIngredientId || !replacementIngredientId) return recipe;
        const servings = targetServings || recipe.activeServings || recipe.baseServings || 2;

        const oldIng = findIngredient(targetIngredientId);
        const newIng = findIngredient(replacementIngredientId);
        if (!oldIng || !newIng) return recipe;

        const adapted = cloneRecipe(recipe);
        let replaced = false;

        adapted.ingredients = adapted.ingredients.map(item => {
            if (item.ingredientId === targetIngredientId) {
                replaced = true;
                // Conversion d'unités si nécessaire
                let newUnit = item.unit;
                let newQty = item.quantity;

                if (newIng.priceUnit === "piece" && item.unit !== "piece") {
                    newUnit = "piece";
                    newQty = Math.max(1, Math.round(item.quantity / (newIng.unitWeightGrams || 100)));
                } else if (item.unit === "piece" && newIng.priceUnit !== "piece") {
                    newUnit = "g";
                    newQty = item.quantity * (oldIng.unitWeightGrams || 100);
                }

                return {
                    ingredientId: replacementIngredientId,
                    quantity: newQty,
                    unit: newUnit
                };
            }
            return item;
        });

        if (!replaced) return recipe;

        // Mise à jour des étapes de préparation
        adapted.steps = adapted.steps.map(step => {
            return step.replace(new RegExp(oldIng.name.split("(")[0].trim(), "gi"), newIng.name.split("(")[0].trim());
        });

        adapted.adaptationApplied = "substitution";
        adapted.adaptationLabel = `🔄 Remplacement : ${newIng.name.split("(")[0].trim()}`;
        adapted.adaptationDescription = `Substitue "${oldIng.name.split("(")[0].trim()}" par "${newIng.name.split("(")[0].trim()}".`;

        return recipeService ? recipeService.enrichRecipeWithNutrition(adapted, servings) : adapted;
    }

    // ============================================================
    // 6. DIFF & COMPARAISON COMPARATIVE "AVANT / APRÈS"
    // ============================================================
    function compareRecipes(originalRecipe, adaptedRecipe) {
        if (!originalRecipe || !adaptedRecipe) return null;

        const origNut = originalRecipe.nutrition || { total: {}, perServing: {} };
        const adaptNut = adaptedRecipe.nutrition || { total: {}, perServing: {} };

        const deltaCalories = (adaptNut.perServing.calories || 0) - (origNut.perServing.calories || 0);
        const deltaProteins = Math.round(((adaptNut.perServing.proteins || 0) - (origNut.perServing.proteins || 0)) * 10) / 10;
        const deltaCarbs = Math.round(((adaptNut.perServing.carbs || 0) - (origNut.perServing.carbs || 0)) * 10) / 10;
        const deltaFats = Math.round(((adaptNut.perServing.fats || 0) - (origNut.perServing.fats || 0)) * 10) / 10;
        const deltaCostFCFA = (adaptNut.total.costFCFA || 0) - (origNut.total.costFCFA || 0);
        const deltaCostPerServing = (adaptNut.perServing.costFCFA || 0) - (origNut.perServing.costFCFA || 0);

        return {
            original: {
                calories: origNut.perServing.calories || 0,
                proteins: origNut.perServing.proteins || 0,
                costFCFA: origNut.total.costFCFA || 0,
                costPerServing: origNut.perServing.costFCFA || 0
            },
            adapted: {
                calories: adaptNut.perServing.calories || 0,
                proteins: adaptNut.perServing.proteins || 0,
                costFCFA: adaptNut.total.costFCFA || 0,
                costPerServing: adaptNut.perServing.costFCFA || 0
            },
            deltas: {
                calories: deltaCalories,
                proteins: deltaProteins,
                carbs: deltaCarbs,
                fats: deltaFats,
                costFCFA: deltaCostFCFA,
                costPerServing: deltaCostPerServing
            },
            isCheaper: deltaCostFCFA < 0,
            isMoreProtein: deltaProteins > 0,
            isLighter: deltaCalories < 0
        };
    }

    // ============================================================
    // API PUBLIQUE DU SERVICE D'ADAPTATION
    // ============================================================
    return {
        getAvailableSubstitutions,
        adaptMoreProteins,
        adaptLowerCost,
        adaptHealthyLight,
        scaleToTargetCalories,
        substituteIngredient,
        compareRecipes
    };
});
