/**
 * NutriBudget - Moteur de Calcul Nutritionnel et Budgétaire Déterministe
 * Ne fait AUCUN appel à l'IA pour les calculs.
 * Garantit des valeurs mathématiques exactes et reproductibles à partir de la table FAO/INFOODS.
 */

(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        const ingredientsModule = require("../data/ingredients.js");
        module.exports = factory(ingredientsModule.SEN_INGREDIENTS);
    } else {
        root.NutriCalculator = factory(root.NutriData ? root.NutriData.SEN_INGREDIENTS : []);
    }
})(typeof self !== "undefined" ? self : this, function (defaultIngredients) {
    "use strict";

    // Stockage en mémoire / cache des ingrédients et des prix personnalisés par l'utilisateur
    let ingredientsList = Array.isArray(defaultIngredients) ? [...defaultIngredients] : [];
    let customPrices = {}; // { [ingredientId]: customPricePerKg }

    // Charger les prix personnalisés depuis le localStorage si disponible dans le navigateur
    if (typeof window !== "undefined" && window.localStorage) {
        try {
            const saved = window.localStorage.getItem("nutribudget_custom_prices");
            if (saved) {
                customPrices = JSON.parse(saved);
            }
        } catch (e) {
            console.warn("Impossible de lire nutribudget_custom_prices depuis le localStorage", e);
        }
    }

    /**
     * Retrouver un ingrédient par son identifiant unique
     * @param {string} id
     * @returns {Object|null}
     */
    function findIngredient(id) {
        if (!id) return null;
        return ingredientsList.find(ing => ing.id === id) || null;
    }

    /**
     * Mettre à jour la liste des ingrédients (ex: si chargée dynamiquement)
     */
    function setIngredients(newList) {
        if (Array.isArray(newList)) {
            ingredientsList = [...newList];
        }
    }

    /**
     * Obtenir le prix effectif (en FCFA/kg ou unité) en tenant compte des personnalisations utilisateur
     * @param {string} ingredientId
     * @returns {number}
     */
    function getEffectivePrice(ingredientId) {
        if (customPrices[ingredientId] !== undefined && !isNaN(customPrices[ingredientId])) {
            return Number(customPrices[ingredientId]);
        }
        const ingredient = findIngredient(ingredientId);
        return ingredient ? (ingredient.defaultPricePerKg || 0) : 0;
    }

    /**
     * Personnaliser le prix d'un ingrédient pour adapter au quartier de l'utilisateur
     * @param {string} ingredientId
     * @param {number} newPricePerKg
     */
    function setCustomPrice(ingredientId, newPricePerKg) {
        const val = Number(newPricePerKg);
        if (!isNaN(val) && val >= 0) {
            customPrices[ingredientId] = val;
            if (typeof window !== "undefined" && window.localStorage) {
                try {
                    window.localStorage.setItem("nutribudget_custom_prices", JSON.stringify(customPrices));
                } catch (e) {
                    console.warn("Échec d'enregistrement du prix personnalisé", e);
                }
            }
            return true;
        }
        return false;
    }

    /**
     * Réinitialiser tous les prix personnalisés aux prix indicatifs par défaut
     */
    function resetCustomPrices() {
        customPrices = {};
        if (typeof window !== "undefined" && window.localStorage) {
            try {
                window.localStorage.removeItem("nutribudget_custom_prices");
            } catch (e) { }
        }
    }

    /**
     * Convertit une quantité donnée avec son unité en poids en grammes
     * @param {Object} ingredient
     * @param {number} quantity
     * @param {string} unit ('g', 'ml', 'piece', 'kg', 'l', 'cuillere_soupe', 'cuillere_cafe')
     * @returns {number} Poids en grammes
     */
    function convertToGrams(ingredient, quantity, unit = "g") {
        const q = Math.max(0, Number(quantity) || 0);
        if (q === 0) return 0;

        const cleanUnit = (unit || "g").toLowerCase().trim();

        switch (cleanUnit) {
            case "kg":
                return q * 1000;
            case "l":
                return q * 1000; // approximation 1L ~ 1000g pour les liquides alimentaires courants
            case "ml":
                return q; // 1ml ~ 1g
            case "g":
                return q;
            case "piece":
            case "pièce":
            case "unite":
            case "unité":
                if (ingredient && ingredient.unitWeightGrams) {
                    return q * ingredient.unitWeightGrams;
                }
                return q * 100; // estimation par défaut 100g par pièce si non spécifié
            case "cuillere_soupe":
            case "cs":
                return q * 15; // 1 cuillère à soupe ~ 15g / 15ml
            case "cuillere_cafe":
            case "cc":
                return q * 5; // 1 cuillère à café ~ 5g / 5ml
            default:
                return q;
        }
    }

    /**
     * Calcule la nutrition et le coût exact d'un seul élément d'ingrédient
     * @param {Object} item { ingredientId, quantity, unit }
     * @returns {Object}
     */
    function calculateItemNutrition(item) {
        const ingredient = findIngredient(item.ingredientId);
        if (!ingredient) {
            return {
                ingredientId: item.ingredientId,
                name: item.name || "Ingrédient non répertorié",
                quantity: item.quantity || 0,
                unit: item.unit || "g",
                weightGrams: 0,
                calories: 0,
                proteins: 0,
                carbs: 0,
                fats: 0,
                fiber: 0,
                costFCFA: 0,
                isUnknown: true
            };
        }

        const weightGrams = convertToGrams(ingredient, item.quantity, item.unit);
        const factor = weightGrams / 100; // Données exprimées pour 100g

        const calories = Math.round((ingredient.per100g.calories || 0) * factor * 10) / 10;
        const proteins = Math.round((ingredient.per100g.proteins || 0) * factor * 10) / 10;
        const carbs = Math.round((ingredient.per100g.carbs || 0) * factor * 10) / 10;
        const fats = Math.round((ingredient.per100g.fats || 0) * factor * 10) / 10;
        const fiber = Math.round((ingredient.per100g.fiber || 0) * factor * 10) / 10;

        // Calcul du coût
        let costFCFA = 0;
        if (ingredient.priceUnit === "piece" && (item.unit === "piece" || item.unit === "pièce")) {
            const piecePrice = ingredient.pricePerPiece || (ingredient.defaultPricePerKg / (1000 / (ingredient.unitWeightGrams || 100)));
            costFCFA = Math.round(Number(item.quantity || 0) * piecePrice);
        } else {
            const effectivePriceKg = getEffectivePrice(ingredient.id);
            costFCFA = Math.round((weightGrams / 1000) * effectivePriceKg);
        }

        return {
            ingredientId: ingredient.id,
            name: ingredient.name,
            category: ingredient.category,
            quantity: Number(item.quantity) || 0,
            unit: item.unit || "g",
            weightGrams: Math.round(weightGrams * 10) / 10,
            calories,
            proteins,
            carbs,
            fats,
            fiber,
            costFCFA,
            effectivePricePerKg: getEffectivePrice(ingredient.id),
            isUnknown: false
        };
    }

    /**
     * Calcule les macronutriments, calories et coût total d'une recette complète
     * @param {Array} ingredientsList Array of { ingredientId, quantity, unit }
     * @param {number} servings Nombre de portions (défaut = 1)
     * @returns {Object} Rapport complet
     */
    function calculateRecipeNutrition(recipeIngredients = [], servings = 1) {
        const safeServings = Math.max(1, Number(servings) || 1);
        const analyzedItems = (recipeIngredients || []).map(calculateItemNutrition);

        // Cumuls totaux
        let totalWeightGrams = 0;
        let totalCalories = 0;
        let totalProteins = 0;
        let totalCarbs = 0;
        let totalFats = 0;
        let totalFiber = 0;
        let totalCostFCFA = 0;

        analyzedItems.forEach(item => {
            totalWeightGrams += item.weightGrams;
            totalCalories += item.calories;
            totalProteins += item.proteins;
            totalCarbs += item.carbs;
            totalFats += item.fats;
            totalFiber += item.fiber;
            totalCostFCFA += item.costFCFA;
        });

        // Arrondis propres
        totalWeightGrams = Math.round(totalWeightGrams);
        totalCalories = Math.round(totalCalories);
        totalProteins = Math.round(totalProteins * 10) / 10;
        totalCarbs = Math.round(totalCarbs * 10) / 10;
        totalFats = Math.round(totalFats * 10) / 10;
        totalFiber = Math.round(totalFiber * 10) / 10;
        totalCostFCFA = Math.round(totalCostFCFA);

        // Répartition énergétique (% des calories totales)
        // 1g protéine = 4 kcal, 1g glucide = 4 kcal, 1g lipide = 9 kcal
        const kcalFromProteins = totalProteins * 4;
        const kcalFromCarbs = totalCarbs * 4;
        const kcalFromFats = totalFats * 9;
        const totalMacroKcal = kcalFromProteins + kcalFromCarbs + kcalFromFats;

        const macroDistribution = {
            proteinPercent: totalMacroKcal > 0 ? Math.round((kcalFromProteins / totalMacroKcal) * 100) : 0,
            carbPercent: totalMacroKcal > 0 ? Math.round((kcalFromCarbs / totalMacroKcal) * 100) : 0,
            fatPercent: totalMacroKcal > 0 ? Math.round((kcalFromFats / totalMacroKcal) * 100) : 0
        };

        // Données par portion
        const perServing = {
            calories: Math.round(totalCalories / safeServings),
            proteins: Math.round((totalProteins / safeServings) * 10) / 10,
            carbs: Math.round((totalCarbs / safeServings) * 10) / 10,
            fats: Math.round((totalFats / safeServings) * 10) / 10,
            fiber: Math.round((totalFiber / safeServings) * 10) / 10,
            weightGrams: Math.round(totalWeightGrams / safeServings),
            costFCFA: Math.round(totalCostFCFA / safeServings)
        };

        return {
            servings: safeServings,
            items: analyzedItems,
            total: {
                weightGrams: totalWeightGrams,
                calories: totalCalories,
                proteins: totalProteins,
                carbs: totalCarbs,
                fats: totalFats,
                fiber: totalFiber,
                costFCFA: totalCostFCFA
            },
            perServing,
            macroDistribution,
            disclaimer: "Valeurs nutritionnelles calculées d'après les tables FAO/INFOODS. Les prix sont indicatifs pour les marchés de Dakar (FCFA) et personnalisables."
        };
    }

    /**
     * Filtre et recherche d'ingrédients
     */
    function searchIngredients(query = "", category = "all") {
        const q = (query || "").toLowerCase().trim();
        return ingredientsList.filter(ing => {
            const matchesCategory = (category === "all" || ing.category === category);
            const matchesQuery = !q || (
                ing.name.toLowerCase().includes(q) ||
                (ing.description && ing.description.toLowerCase().includes(q)) ||
                (ing.tags && ing.tags.some(tag => tag.toLowerCase().includes(q)))
            );
            return matchesCategory && matchesQuery;
        });
    }

    return {
        findIngredient,
        setIngredients,
        getEffectivePrice,
        setCustomPrice,
        resetCustomPrices,
        convertToGrams,
        calculateItemNutrition,
        calculateRecipeNutrition,
        searchIngredients,
        getAllIngredients: () => [...ingredientsList]
    };
});
