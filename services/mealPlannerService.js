/**
 * NutriBudget - Service Planificateur de Menus & Liste de Courses Intelligente (Étape 6)
 * 
 * PRINCIPE D'OR ARCHITECTURAL :
 * L'IA / le planificateur ne calcule JAMAIS les calories, macros ou coûts.
 * Tous les calculs sont délégués de manière 100% déterministe à NutriCalculator.
 */

(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        const ingredientsModule = require("../data/ingredients.js");
        const calculatorModule = require("./nutritionCalculator.js");
        const recipeServiceModule = require("./recipeService.js");
        const profileModule = require("./userProfileService.js");
        module.exports = factory(
            ingredientsModule.SEN_INGREDIENTS,
            calculatorModule,
            recipeServiceModule,
            profileModule
        );
    } else {
        root.NutriPlanner = factory(
            root.NutriData ? root.NutriData.SEN_INGREDIENTS : [],
            root.NutriCalculator,
            root.NutriRecipes,
            root.NutriProfile
        );
    }
})(typeof self !== "undefined" ? self : this, function (ingredients, calculator, recipeService, profileService) {
    "use strict";

    const STORAGE_KEY_PLAN = "nutribudget_weekly_plan";
    const STORAGE_KEY_CHECKLIST = "nutribudget_shopping_checklist";

    const DAYS_ORDER = [
        { key: "lundi", label: "Lundi", short: "Lun" },
        { key: "mardi", label: "Mardi", short: "Mar" },
        { key: "mercredi", label: "Mercredi", short: "Mer" },
        { key: "jeudi", label: "Jeudi", short: "Jeu" },
        { key: "vendredi", label: "Vendredi", short: "Ven" },
        { key: "samedi", label: "Samedi", short: "Sam" },
        { key: "dimanche", label: "Dimanche", short: "Dim" }
    ];

    const MEAL_SLOTS = [
        { key: "petit_dejeuner", label: "Petit-déjeuner", icon: "☀️", targetRatio: 0.25 },
        { key: "dejeuner", label: "Déjeuner", icon: "🍲", targetRatio: 0.35 },
        { key: "collation", label: "Collation / Goûter", icon: "🥭", targetRatio: 0.15 },
        { key: "diner", label: "Dîner", icon: "🌙", targetRatio: 0.25 }
    ];

    const MARKET_STALLS = {
        viandes_poissons: {
            id: "viandes_poissons",
            title: "🐟 Poissonnerie & Boucherie",
            subtitle: "Arrivages Soumbédioune & Boucheries locales",
            color: "#0284C7",
            categories: ["poissons_viandes_oeufs"]
        },
        legumes_condiments: {
            id: "legumes_condiments",
            title: "🥕 Légumes & Condiments des Niayes",
            subtitle: "Maraîchers locaux, herbes & assaisonnements",
            color: "#16A34A",
            categories: ["legumes", "condiments"]
        },
        cereales_feculents: {
            id: "cereales_feculents",
            title: "🌾 Céréales, Grains & Féculents",
            subtitle: "Riz de la vallée, fonio, mil & racines",
            color: "#D97706",
            categories: ["cereales_feculents"]
        },
        epicerie_huiles: {
            id: "epicerie_huiles",
            title: "🥜 Épicerie, Huiles & Graines",
            subtitle: "Huiles végétales, pâte d'arachide & légumineuses",
            color: "#EA580C",
            categories: ["legumineuses", "huiles_graisses", "produits_laitiers"]
        },
        boissons_fruits: {
            id: "boissons_fruits",
            title: "🥤 Fruits & Boissons Traditionnelles",
            subtitle: "Kinkeliba, bissap, bouye & fruits frais",
            color: "#9333EA",
            categories: ["fruits", "boissons"]
        }
    };

    /**
     * Crée une structure de plan hebdomadaire vide
     * @param {number} servings
     * @returns {Object}
     */
    function createEmptyWeeklyPlan(servings = 2) {
        const days = {};
        DAYS_ORDER.forEach(d => {
            days[d.key] = {
                key: d.key,
                label: d.label,
                short: d.short,
                meals: {
                    petit_dejeuner: null,
                    dejeuner: null,
                    collation: null,
                    diner: null
                }
            };
        });

        return {
            id: "plan-" + Date.now(),
            createdAt: new Date().toISOString(),
            servings: Math.max(1, Number(servings) || 2),
            days: days
        };
    }

    /**
     * Vérifie si une recette respecte les exclusions alimentaires de l'utilisateur
     */
    function isRecipeAllowed(recipe, exclusions = []) {
        if (!exclusions || exclusions.length === 0) return true;
        const exclSet = new Set(exclusions.map(e => e.toLowerCase()));

        for (const ing of (recipe.ingredients || [])) {
            const ingId = ing.ingredientId;
            if (exclSet.has("poisson") && (ingId.includes("poisson") || ingId.includes("yaboye") || ingId.includes("thiof") || ingId.includes("guedj") || ingId.includes("sardine"))) {
                return false;
            }
            if (exclSet.has("poulet") && ingId.includes("poulet")) {
                return false;
            }
            if (exclSet.has("boeuf") && ingId.includes("boeuf")) {
                return false;
            }
            if (exclSet.has("porc") && ingId.includes("porc")) {
                return false;
            }
            if (exclSet.has("oeufs") && ingId.includes("oeuf")) {
                return false;
            }
            if (exclSet.has("arachides") && (ingId.includes("arachide") || ingId.includes("guerté") || ingId.includes("pate-arachide"))) {
                return false;
            }
            if (exclSet.has("lait") && (ingId.includes("lait") || ingId.includes("kossam"))) {
                return false;
            }
            if (exclSet.has("gluten") && (ingId.includes("pain") || ingId.includes("farine-ble"))) {
                return false;
            }
            // Détection générique pour tout aliment personnalisé
            for (const ex of exclSet) {
                if (ex && ex.length >= 3 && ingId.includes(ex)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Génère un plan hebdomadaire complet, équilibré et varié sur 7 jours
     * @param {Object} options { servings, targetCalories, exclusions, budgetLevel }
     * @returns {Object} Plan hebdomadaire enrichi
     */
    function generateSmartWeeklyPlan(options = {}) {
        const servings = Math.max(1, Number(options.servings) || 2);
        const profile = profileService ? profileService.getProfile() : null;
        const exclusions = options.exclusions || (profile && profile.exclusions ? profile.exclusions : []);
        const targetCalories = Number(options.targetCalories) || (profile && profile.calculated ? profile.calculated.targetCalories : 2000);

        const plan = createEmptyWeeklyPlan(servings);
        const catalog = recipeService ? recipeService.getCatalog() : [];
        const allowedCatalog = catalog.filter(r => isRecipeAllowed(r, exclusions));

        // Regrouper les recettes par slot (ou créneaux compatibles)
        const poolBySlot = {
            petit_dejeuner: allowedCatalog.filter(r => r.mealType === "petit_dejeuner" || r.mealType === "boisson"),
            dejeuner: allowedCatalog.filter(r => r.mealType === "dejeuner"),
            collation: allowedCatalog.filter(r => r.mealType === "collation" || r.mealType === "boisson"),
            diner: allowedCatalog.filter(r => r.mealType === "diner" || r.mealType === "dejeuner")
        };

        // Fallbacks au cas où une catégorie est vide après exclusions
        Object.keys(poolBySlot).forEach(k => {
            if (poolBySlot[k].length === 0) {
                poolBySlot[k] = allowedCatalog.length > 0 ? [...allowedCatalog] : [...catalog];
            }
        });

        // Historique récent pour assurer la rotation des saveurs
        const recentHistory = {
            petit_dejeuner: [],
            dejeuner: [],
            collation: [],
            diner: []
        };

        DAYS_ORDER.forEach(day => {
            MEAL_SLOTS.forEach(slot => {
                const pool = poolBySlot[slot.key];
                // Filtrer les recettes récemment utilisées pour éviter les doublons successifs
                let candidates = pool.filter(r => !recentHistory[slot.key].slice(-2).includes(r.id));
                if (candidates.length === 0) candidates = pool;

                // Choisir la recette
                const chosen = candidates[Math.floor(Math.random() * candidates.length)] || pool[0];
                if (chosen) {
                    recentHistory[slot.key].push(chosen.id);
                    const enriched = recipeService.enrichRecipeWithNutrition(chosen, servings);
                    plan.days[day.key].meals[slot.key] = {
                        recipeId: chosen.id,
                        title: chosen.title,
                        mealType: slot.key,
                        imageEmoji: chosen.imageEmoji || "🍲",
                        prepTimeMinutes: chosen.prepTimeMinutes || 20,
                        cookingTimeMinutes: chosen.cookingTimeMinutes || 30,
                        tags: chosen.tags || [],
                        nutrition: enriched.nutrition,
                        scaledIngredients: enriched.scaledIngredients || enriched.ingredients
                    };
                }
            });
        });

        return enrichPlanWithTotals(plan);
    }

    /**
     * Assigne une recette spécifique à un créneau (Jour + Repas)
     */
    function setMealSlot(plan, dayKey, slotKey, recipeId, customServings = null) {
        if (!plan || !plan.days || !plan.days[dayKey]) return plan;
        const servings = customServings || plan.servings || 2;
        const recipe = recipeService ? recipeService.getRecipeById(recipeId, servings) : null;
        if (!recipe) return plan;

        plan.days[dayKey].meals[slotKey] = {
            recipeId: recipe.id,
            title: recipe.title,
            mealType: slotKey,
            imageEmoji: recipe.imageEmoji || "🍲",
            prepTimeMinutes: recipe.prepTimeMinutes || 20,
            cookingTimeMinutes: recipe.cookingTimeMinutes || 30,
            tags: recipe.tags || [],
            nutrition: recipe.nutrition,
            scaledIngredients: recipe.scaledIngredients || recipe.ingredients
        };

        return enrichPlanWithTotals(plan);
    }

    /**
     * Supprime une recette d'un créneau
     */
    function removeMealSlot(plan, dayKey, slotKey) {
        if (!plan || !plan.days || !plan.days[dayKey]) return plan;
        plan.days[dayKey].meals[slotKey] = null;
        return enrichPlanWithTotals(plan);
    }

    /**
     * Calcule et enrichit un plan avec les totaux nutritionnels et budgétaires déterministes
     */
    function enrichPlanWithTotals(plan) {
        if (!plan || !plan.days) return plan;

        let weeklyCalories = 0;
        let weeklyProteins = 0;
        let weeklyCarbs = 0;
        let weeklyFats = 0;
        let weeklyCostFCFA = 0;
        let filledSlotsCount = 0;

        DAYS_ORDER.forEach(d => {
            const day = plan.days[d.key];
            if (!day) return;

            let dayCal = 0;
            let dayProt = 0;
            let dayCarb = 0;
            let dayFat = 0;
            let dayCost = 0;

            MEAL_SLOTS.forEach(s => {
                const meal = day.meals[s.key];
                if (meal && meal.nutrition) {
                    filledSlotsCount++;
                    // perServing et total
                    const nutPerServing = meal.nutrition.perServing || {};
                    const nutTotal = meal.nutrition.total || {};

                    dayCal += (nutPerServing.calories || 0);
                    dayProt += (nutPerServing.proteins || 0);
                    dayCarb += (nutPerServing.carbs || 0);
                    dayFat += (nutPerServing.fats || 0);
                    dayCost += (nutTotal.costFCFA || 0);
                }
            });

            day.totals = {
                calories: Math.round(dayCal),
                proteins: Math.round(dayProt * 10) / 10,
                carbs: Math.round(dayCarb * 10) / 10,
                fats: Math.round(dayFat * 10) / 10,
                costFCFA: Math.round(dayCost)
            };

            weeklyCalories += day.totals.calories;
            weeklyProteins += day.totals.proteins;
            weeklyCarbs += day.totals.carbs;
            weeklyFats += day.totals.fats;
            weeklyCostFCFA += day.totals.costFCFA;
        });

        const activeDaysCount = DAYS_ORDER.filter(d => plan.days[d.key] && plan.days[d.key].totals && plan.days[d.key].totals.calories > 0).length || 1;
        const servings = plan.servings || 2;

        plan.summary = {
            weeklyCalories: Math.round(weeklyCalories),
            avgCaloriesPerDay: Math.round(weeklyCalories / activeDaysCount),
            weeklyProteins: Math.round(weeklyProteins),
            avgProteinsPerDay: Math.round((weeklyProteins / activeDaysCount) * 10) / 10,
            weeklyCarbs: Math.round(weeklyCarbs),
            avgCarbsPerDay: Math.round((weeklyCarbs / activeDaysCount) * 10) / 10,
            weeklyFats: Math.round(weeklyFats),
            avgFatsPerDay: Math.round((weeklyFats / activeDaysCount) * 10) / 10,
            weeklyCostFCFA: Math.round(weeklyCostFCFA),
            avgCostPerDayFCFA: Math.round(weeklyCostFCFA / activeDaysCount),
            costPerPersonPerDayFCFA: Math.round((weeklyCostFCFA / activeDaysCount) / servings),
            filledSlotsCount: filledSlotsCount,
            totalSlotsCount: 28,
            completionPercent: Math.round((filledSlotsCount / 28) * 100)
        };

        return plan;
    }

    /**
     * Trouve à quel étal de marché appartient un ingrédient
     */
    function getStallForIngredient(ing) {
        if (!ing) return "epicerie_huiles";
        const cat = ing.category;

        for (const stallKey in MARKET_STALLS) {
            if (MARKET_STALLS[stallKey].categories.includes(cat)) {
                return stallKey;
            }
        }
        return "epicerie_huiles";
    }

    /**
     * Génère la liste de courses consolidée à partir du plan hebdomadaire
     * @param {Object} plan
     * @param {Object} options { selectedDays, pantryIngredientIds }
     * @returns {Object} Liste de courses détaillée par étals avec calculs FCFA
     */
    function generateShoppingList(plan, options = {}) {
        if (!plan || !plan.days) {
            return {
                items: [],
                stalls: {},
                totals: { grossCostFCFA: 0, pantrySavingsFCFA: 0, netToBuyCostFCFA: 0, totalItemsCount: 0, toBuyItemsCount: 0 }
            };
        }

        const selectedDays = options.selectedDays && options.selectedDays.length > 0 
            ? options.selectedDays 
            : DAYS_ORDER.map(d => d.key);

        const pantrySet = new Set(
            Array.isArray(options.pantryIngredientIds) 
                ? options.pantryIngredientIds 
                : (options.pantryIngredientIds instanceof Set ? Array.from(options.pantryIngredientIds) : [])
        );

        // Consolidation par ingredientId
        const consolidated = {}; // { [ingredientId]: { totalGrams, totalPieces, totalMl, occurrences, recipes: [] } }

        selectedDays.forEach(dayKey => {
            const day = plan.days[dayKey];
            if (!day || !day.meals) return;

            MEAL_SLOTS.forEach(slot => {
                const meal = day.meals[slot.key];
                if (!meal) return;

                // On prend les ingrédients mis à l'échelle pour ce repas
                const ingredients = meal.scaledIngredients || [];
                ingredients.forEach(item => {
                    const id = item.ingredientId;
                    if (!consolidated[id]) {
                        consolidated[id] = {
                            ingredientId: id,
                            rawQuantity: 0,
                            unit: item.unit || "g",
                            occurrences: 0,
                            recipeNames: new Set()
                        };
                    }
                    consolidated[id].rawQuantity += Number(item.quantity) || 0;
                    consolidated[id].occurrences++;
                    consolidated[id].recipeNames.add(meal.title);
                });
            });
        });

        // Convertir en articles marchands avec prix déterministes
        const allItems = [];
        let grossCostFCFA = 0;
        let pantrySavingsFCFA = 0;
        let netToBuyCostFCFA = 0;

        for (const ingId in consolidated) {
            const data = consolidated[ingId];
            const ingMeta = ingredients.find(i => i.id === ingId);
            if (!ingMeta) continue;

            const unit = data.unit;
            const rawQty = data.rawQuantity;
            const inPantry = pantrySet.has(ingId);

            // Calcul du coût déterministe via NutriCalculator
            const singleItemSpec = [{ ingredientId: ingId, quantity: rawQty, unit: unit }];
            const singleCalc = calculator.calculateRecipeNutrition(singleItemSpec, 1);
            const itemCostFCFA = singleCalc.total.costFCFA;

            grossCostFCFA += itemCostFCFA;
            if (inPantry) {
                pantrySavingsFCFA += itemCostFCFA;
            } else {
                netToBuyCostFCFA += itemCostFCFA;
            }

            // Formatage lisible pour les étals de Dakar
            let formattedDisplayQty = "";
            if (unit === "piece" || unit === "pièce") {
                formattedDisplayQty = `${Math.ceil(rawQty)} pièce${rawQty > 1 ? "s" : ""}`;
            } else if (unit === "ml" || unit === "l") {
                if (rawQty >= 1000) {
                    formattedDisplayQty = `${(rawQty / 1000).toFixed(1).replace(/\.0$/, "")} L`;
                } else {
                    formattedDisplayQty = `${Math.round(rawQty)} ml`;
                }
            } else {
                // Grammes
                if (rawQty >= 1000) {
                    formattedDisplayQty = `${(rawQty / 1000).toFixed(2).replace(/\.00$/, "")} kg`;
                } else {
                    formattedDisplayQty = `${Math.round(rawQty)} g`;
                }
            }

            const stallKey = getStallForIngredient(ingMeta);

            allItems.push({
                ingredientId: ingId,
                name: ingMeta.name,
                category: ingMeta.category,
                categoryLabel: ingMeta.categoryLabel,
                stallKey: stallKey,
                rawQuantity: rawQty,
                unit: unit,
                displayQuantity: formattedDisplayQty,
                costFCFA: itemCostFCFA,
                inPantry: inPantry,
                recipesUsedIn: Array.from(data.recipeNames),
                marketNote: ingMeta.description || ""
            });
        }

        // Tri par ordre alphabétique dans chaque étal
        allItems.sort((a, b) => a.name.localeCompare(b.name, "fr"));

        // Regroupement par étal
        const stalls = {};
        for (const stallKey in MARKET_STALLS) {
            const meta = MARKET_STALLS[stallKey];
            const stallItems = allItems.filter(i => i.stallKey === stallKey);
            const stallTotalFCFA = stallItems.reduce((acc, it) => acc + it.costFCFA, 0);
            const stallNetFCFA = stallItems.filter(it => !it.inPantry).reduce((acc, it) => acc + it.costFCFA, 0);

            stalls[stallKey] = {
                ...meta,
                items: stallItems,
                totalCostFCFA: stallTotalFCFA,
                netCostFCFA: stallNetFCFA,
                itemsCount: stallItems.length
            };
        }

        return {
            items: allItems,
            stalls: stalls,
            totals: {
                grossCostFCFA: Math.round(grossCostFCFA),
                pantrySavingsFCFA: Math.round(pantrySavingsFCFA),
                netToBuyCostFCFA: Math.round(netToBuyCostFCFA),
                totalItemsCount: allItems.length,
                toBuyItemsCount: allItems.filter(i => !i.inPantry).length
            }
        };
    }

    /**
     * Génère un texte prêt à être partagé sur WhatsApp pour faire les courses au marché de Dakar
     * @param {Object} shoppingList Résultat de generateShoppingList()
     * @param {Object} planSummary
     * @returns {string} Texte formaté pour WhatsApp
     */
    function formatWhatsAppShoppingList(shoppingList, planSummary = null) {
        if (!shoppingList || !shoppingList.items || shoppingList.items.length === 0) {
            return "🛒 *Liste de Courses NutriBudget* 🇸🇳\nAucun article sélectionné pour cette période.";
        }

        const totals = shoppingList.totals;
        let text = `🛒 *LISTE DE COURSES NUTRIBUDGET* 🇸🇳\n`;
        text += `_Marchés de Dakar & Terroir Sénégalais_\n\n`;

        if (totals.pantrySavingsFCFA > 0) {
            text += `💰 *Budget à prévoir :* ~${totals.netToBuyCostFCFA.toLocaleString("fr-FR")} FCFA\n`;
            text += `✅ *Économies grâce au placard :* -${totals.pantrySavingsFCFA.toLocaleString("fr-FR")} FCFA\n`;
            text += `📦 *Total articles à acheter :* ${totals.toBuyItemsCount} / ${totals.totalItemsCount}\n\n`;
        } else {
            text += `💰 *Budget total estimé :* ~${totals.grossCostFCFA.toLocaleString("fr-FR")} FCFA\n`;
            text += `📦 *Articles :* ${totals.totalItemsCount} ingrédients\n\n`;
        }

        text += `──────────────────\n`;

        for (const stallKey in shoppingList.stalls) {
            const stall = shoppingList.stalls[stallKey];
            if (stall.items.length === 0) continue;

            text += `\n${stall.title}\n`;
            stall.items.forEach(it => {
                const check = it.inPantry ? "✅ [Au placard] " : "▫️ ";
                text += `${check}*${it.name.split("(")[0].trim()}* : ${it.displayQuantity}`;
                if (!it.inPantry) {
                    text += ` (~${it.costFCFA.toLocaleString("fr-FR")} FCFA)`;
                }
                text += `\n`;
            });
        }

        text += `\n──────────────────\n`;
        text += `💡 *Astuce Terroir :* Privilégiez les légumes frais des Niayes et la sardinelle (Yaboye) à Soumbédioune pour un maximum d'oméga-3 au meilleur prix.\n`;
        text += `🌱 _Généré par NutriBudget - Alimentation saine & budget maîtrisé_`;

        return text;
    }

    /**
     * Sauvegarde du plan hebdomadaire dans le localStorage
     */
    function saveWeeklyPlan(plan) {
        if (typeof window === "undefined" || !window.localStorage) return false;
        try {
            window.localStorage.setItem(STORAGE_KEY_PLAN, JSON.stringify(plan));
            return true;
        } catch (e) {
            console.warn("Échec sauvegarde weekly plan", e);
            return false;
        }
    }

    /**
     * Chargement du plan hebdomadaire depuis le localStorage
     */
    function loadWeeklyPlan() {
        if (typeof window === "undefined" || !window.localStorage) return null;
        try {
            const saved = window.localStorage.getItem(STORAGE_KEY_PLAN);
            if (!saved) return null;
            const parsed = JSON.parse(saved);
            return enrichPlanWithTotals(parsed);
        } catch (e) {
            console.warn("Échec chargement weekly plan", e);
            return null;
        }
    }

    /**
     * Sauvegarde de l'état coché de la liste de courses
     */
    function saveShoppingChecklist(checklistObj) {
        if (typeof window === "undefined" || !window.localStorage) return false;
        try {
            window.localStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(checklistObj));
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Chargement de l'état coché de la liste de courses
     */
    function loadShoppingChecklist() {
        if (typeof window === "undefined" || !window.localStorage) return {};
        try {
            const saved = window.localStorage.getItem(STORAGE_KEY_CHECKLIST);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    return {
        DAYS_ORDER,
        MEAL_SLOTS,
        MARKET_STALLS,
        createEmptyWeeklyPlan,
        generateSmartWeeklyPlan,
        setMealSlot,
        removeMealSlot,
        enrichPlanWithTotals,
        generateShoppingList,
        formatWhatsAppShoppingList,
        saveWeeklyPlan,
        loadWeeklyPlan,
        saveShoppingChecklist,
        loadShoppingChecklist,
        isRecipeAllowed
    };
});
