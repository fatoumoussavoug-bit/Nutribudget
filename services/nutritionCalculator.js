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

        // Calcul du coût théorique (legacy proportionnel pour les tests)
        let costFCFA = 0;
        let isCustom = customPrices[ingredient.id] !== undefined && !isNaN(customPrices[ingredient.id]);
        if (ingredient.priceUnit === "piece" && (item.unit === "piece" || item.unit === "pièce")) {
            const piecePrice = isCustom 
                ? Number(customPrices[ingredient.id])
                : (ingredient.pricePerPiece || (ingredient.defaultPricePerKg / (1000 / (ingredient.unitWeightGrams || 100))));
            costFCFA = Math.round(Number(item.quantity || 0) * piecePrice);
        } else {
            const effectivePriceKg = getEffectivePrice(ingredient.id);
            costFCFA = Math.round((weightGrams / 1000) * effectivePriceKg);
        }

        const realShopItem = calculateRealShoppingItem(item);

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
            realCostFCFA: realShopItem.realCostFCFA,
            purchaseFormatLabel: realShopItem.purchaseFormatLabel,
            priceSource: realShopItem.priceSource,
            priceSourceLabel: realShopItem.priceSourceLabel,
            sourceRef: realShopItem.sourceRef,
            unitsToBuy: realShopItem.unitsToBuy,
            effectivePricePerKg: getEffectivePrice(ingredient.id),
            priceUnit: ingredient.priceUnit || "kg",
            hasCustomPrice: isCustom,
            isUnknown: false
        };
    }

    /**
     * Calcule le format d'achat réaliste et le coût effectif au Sénégal
     * Respecte les unités réelles de vente :
     * - Œuf par unité à 100 FCFA
     * - Tomate, oignon, poivron, carotte au kg, 500g, 250g ou 125g (min 125g ou 1 pièce)
     * - Huile au litre, demi-litre (500 ml), 250 ml ou 125 ml
     * - Huile d'olive extra-vierge UNIQUEMENT en bouteille (500 ml ou 1 L, pas en détail)
     * - Pain par baguette entière 150 FCFA
     * - Poisson comme sardinelles : source Marché local ou poissonnerie (vendu au kg ou en tas, pas à Auchan)
     * - Produits emballés : boîte entière à Auchan Sénégal
     */
    function calculateRealShoppingItem(item) {
        const ingredient = findIngredient(item.ingredientId);
        if (!ingredient) {
            return {
                ingredientId: item.ingredientId,
                name: item.name || "Ingrédient non répertorié",
                recipeQuantity: item.quantity || 0,
                recipeUnit: item.unit || "g",
                recipeWeightGrams: 0,
                purchaseFormatLabel: "Format standard",
                priceSource: "marche_local",
                priceSourceLabel: "Marché local",
                sourceRef: "Marché local",
                realCostFCFA: 0,
                unitsToBuy: 1,
                unitPrice: 0,
                isUnknown: true
            };
        }

        const weightGrams = convertToGrams(ingredient, item.quantity, item.unit);
        const isCustom = customPrices[ingredient.id] !== undefined && !isNaN(customPrices[ingredient.id]);
        const customVal = isCustom ? Number(customPrices[ingredient.id]) : null;

        const priceSource = ingredient.priceSource || (ingredient.isLocalSenegal ? "marche_local" : "auchan");
        const priceSourceLabel = priceSource === "auchan" ? "Auchan Sénégal" : "Marché local";
        const sourceRef = ingredient.sourceRef || (priceSource === "auchan" ? "Auchan Sénégal (auchan.sn)" : "Marchés locaux (ANSD/CSAR 2026)");

        const formats = Array.isArray(ingredient.purchaseFormats) && ingredient.purchaseFormats.length > 0 
            ? ingredient.purchaseFormats 
            : [];

        let unitsToBuy = 1;
        let realCostFCFA = 0;
        let purchaseFormatLabel = "";

        const isPiece = ingredient.priceUnit === "piece" || item.unit === "piece" || item.unit === "pièce" || item.unit === "unite" || item.unit === "unité";

        if (isPiece) {
            const qtyPieces = Math.max(1, Math.round(Number(item.quantity) || 1));
            let piecePrice = 100;
            if (customVal !== null) {
                piecePrice = customVal;
            } else if (ingredient.marketPrice2026 && ingredient.priceUnit === "piece") {
                piecePrice = ingredient.marketPrice2026;
            } else if (ingredient.pricePerPiece) {
                piecePrice = ingredient.id === "oeuf-poule" ? 100 : ingredient.pricePerPiece;
            }

            if (formats.length > 0) {
                let minCost = Infinity;
                let chosen = null;
                for (const fmt of formats) {
                    const count = Math.ceil(qtyPieces / fmt.qty) || 1;
                    const p = customVal !== null ? Math.round(fmt.qty * customVal) : fmt.price;
                    const cost = count * p;
                    if (cost < minCost) {
                        minCost = cost;
                        chosen = { ...fmt, count, calcPrice: p };
                    }
                }
                if (chosen) {
                    unitsToBuy = chosen.count;
                    realCostFCFA = minCost;
                    purchaseFormatLabel = chosen.count > 1 
                        ? `${chosen.count}x ${chosen.label}`
                        : chosen.label;
                } else {
                    unitsToBuy = qtyPieces;
                    realCostFCFA = unitsToBuy * piecePrice;
                    purchaseFormatLabel = unitsToBuy === 1 
                        ? `1 unité (${piecePrice.toLocaleString("fr-FR")} FCFA)` 
                        : `${unitsToBuy} unités (${piecePrice.toLocaleString("fr-FR")} FCFA / u)`;
                }
            } else {
                unitsToBuy = qtyPieces;
                realCostFCFA = unitsToBuy * piecePrice;
                purchaseFormatLabel = unitsToBuy === 1 
                    ? `1 unité (${piecePrice.toLocaleString("fr-FR")} FCFA)` 
                    : `${unitsToBuy} unités (${piecePrice.toLocaleString("fr-FR")} FCFA / u)`;
            }
        } else if (formats.length > 0) {
            const neededQty = weightGrams;

            const evaluatedFormats = formats.map(fmt => {
                const fmtGrams = fmt.unit === "kg" || fmt.unit === "l" ? fmt.qty * 1000 : fmt.qty;
                let p = fmt.price;
                if (customVal !== null) {
                    p = Math.round((fmtGrams / 1000) * customVal);
                }
                return {
                    ...fmt,
                    fmtGrams,
                    calcPrice: p
                };
            });

            let minCost = Infinity;
            let chosen = null;

            for (const fmt of evaluatedFormats) {
                const count = Math.ceil(neededQty / fmt.fmtGrams) || 1;
                const cost = count * fmt.calcPrice;
                if (cost < minCost || (cost === minCost && (!chosen || fmt.fmtGrams < chosen.fmtGrams))) {
                    minCost = cost;
                    chosen = { ...fmt, count };
                }
            }

            if (chosen) {
                unitsToBuy = chosen.count;
                realCostFCFA = minCost;
                purchaseFormatLabel = chosen.count > 1 
                    ? `${chosen.count}x ${chosen.label} (${chosen.calcPrice.toLocaleString("fr-FR")} FCFA/u)`
                    : `${chosen.label} (${chosen.calcPrice.toLocaleString("fr-FR")} FCFA)`;
            } else {
                const fallbackPrice = customVal !== null ? customVal : (ingredient.marketPrice2026 || ingredient.defaultPricePerKg || 1000);
                realCostFCFA = Math.round((neededQty / 1000) * fallbackPrice);
                purchaseFormatLabel = `Portion ${Math.round(neededQty)}g`;
            }
        } else {
            const fallbackPrice = customVal !== null ? customVal : (ingredient.marketPrice2026 || ingredient.defaultPricePerKg || 1000);
            realCostFCFA = Math.round((weightGrams / 1000) * fallbackPrice);
            purchaseFormatLabel = `Portion ${Math.round(weightGrams)}g`;
        }

        return {
            ingredientId: ingredient.id,
            name: ingredient.name,
            category: ingredient.category,
            recipeQuantity: Number(item.quantity) || 0,
            recipeUnit: item.unit || "g",
            recipeWeightGrams: Math.round(weightGrams * 10) / 10,
            purchaseFormatLabel,
            priceSource,
            priceSourceLabel,
            sourceRef,
            realCostFCFA: Math.round(realCostFCFA),
            unitsToBuy,
            isUnknown: false
        };
    }

    /**
     * Calcule le panier réel et le coût global d'une recette au Sénégal
     * @param {Array} ingredientItems
     * @param {number} servings
     * @returns {Object}
     */
    function calculateRealShoppingCost(ingredientItems = [], servings = 1) {
        const safeServings = Math.max(1, Number(servings) || 1);
        const items = (ingredientItems || []).map(calculateRealShoppingItem);

        let totalCostFCFA = 0;
        let auchanCostFCFA = 0;
        let marcheCostFCFA = 0;

        items.forEach(it => {
            totalCostFCFA += it.realCostFCFA;
            if (it.priceSource === "auchan") {
                auchanCostFCFA += it.realCostFCFA;
            } else {
                marcheCostFCFA += it.realCostFCFA;
            }
        });

        return {
            items,
            totalCostFCFA: Math.round(totalCostFCFA),
            costPerServingFCFA: Math.round(totalCostFCFA / safeServings),
            auchanCostFCFA: Math.round(auchanCostFCFA),
            marcheCostFCFA: Math.round(marcheCostFCFA),
            referenceNotice: "Prix de référence : Auchan Sénégal + Marchés locaux ANSD / CSAR, Dakar, 2026, à ajuster selon votre marché."
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

        const realShopping = calculateRealShoppingCost(recipeIngredients, safeServings);

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
                costFCFA: totalCostFCFA,
                realCostFCFA: realShopping.totalCostFCFA,
                realShoppingCostFCFA: realShopping.totalCostFCFA
            },
            perServing: {
                ...perServing,
                realCostFCFA: realShopping.costPerServingFCFA,
                realShoppingCostFCFA: realShopping.costPerServingFCFA
            },
            realShopping,
            macroDistribution,
            disclaimer: "Valeurs nutritionnelles calculées d'après les tables FAO/INFOODS. Prix de référence : Auchan Sénégal + Marchés locaux ANSD / CSAR, Dakar, 2026, à ajuster selon votre marché."
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

    function removeCustomPrice(ingredientId) {
        if (customPrices[ingredientId] !== undefined) {
            delete customPrices[ingredientId];
            if (typeof window !== "undefined" && window.localStorage) {
                try {
                    window.localStorage.setItem("nutribudget_custom_prices", JSON.stringify(customPrices));
                } catch (e) { }
            }
            return true;
        }
        return false;
    }

    return {
        findIngredient,
        setIngredients,
        getEffectivePrice,
        setCustomPrice,
        removeCustomPrice,
        resetCustomPrices,
        getCustomPrices: () => ({ ...customPrices }),
        hasCustomPrice: (id) => customPrices[id] !== undefined,
        convertToGrams,
        calculateItemNutrition,
        calculateRealShoppingItem,
        calculateRealShoppingCost,
        calculateRecipeNutrition,
        searchIngredients,
        getAllIngredients: () => [...ingredientsList],
        PRICE_REFERENCE_NOTICE: "Prix de référence : Auchan Sénégal + Marchés locaux ANSD / CSAR, Dakar, 2026, à ajuster selon votre marché.",
        PRICE_SOURCE_REFERENCE: "Auchan Sénégal (auchan.sn) & Marchés locaux (ANSD/CSAR 2026)"
    };
});
