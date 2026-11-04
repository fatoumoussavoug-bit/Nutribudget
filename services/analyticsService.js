/**
 * NutriBudget - Service d'Analyse Nutritionnelle & Budgétaire (Étape 7)
 *
 * PRINCIPE D'OR ARCHITECTURAL :
 * L'IA ne calcule JAMAIS les calories, macros ou coûts.
 * Tous les calculs sont délégués de manière 100% déterministe à NutriCalculator.
 *
 * Ce service analyse un plan hebdomadaire et produit :
 * - Bilan nutritionnel 7 jours (kcal, macros, micronutriments)
 * - Score d'équilibre alimentaire selon recommandations FAO/OMS Afrique subsaharienne
 * - Efficacité budgétaire (FCFA / kcal, FCFA / g protéines)
 * - Tendances et alertes nutritionnelles déterministes
 * - Comparaison profil utilisateur vs plan réel
 */

(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else {
        root.NutriAnalytics = factory();
    }
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // ============================================================
    // CONSTANTES FAO/OMS — Valeurs de référence Afrique subsaharienne
    // ============================================================

    const DRI_REFERENCE = {
        calories: { min: 1800, optimal: 2100, max: 2600 },
        proteins: { min: 46, optimal: 60, max: 120 },
        carbs: { min: 225, optimal: 275, max: 350 },
        fats: { min: 44, optimal: 65, max: 80 },
        proteinPct: { min: 10, optimal: 15, max: 25 },
        carbPct: { min: 45, optimal: 55, max: 65 },
        fatPct: { min: 20, optimal: 30, max: 35 }
    };

    const BUDGET_BENCHMARKS = {
        frugal: 1500,
        standard: 3000,
        confort: 5000,
        premium: 8000
    };

    const BALANCE_WEIGHTS = {
        calorieAdherence: 30,
        macroBalance: 30,
        mealVariety: 20,
        budgetEfficiency: 20
    };

    const DAYS_KEYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
    const DAYS_SHORT = { lundi: "Lun", mardi: "Mar", mercredi: "Mer", jeudi: "Jeu", vendredi: "Ven", samedi: "Sam", dimanche: "Dim" };
    const MEAL_SLOT_KEYS = ["petit_dejeuner", "dejeuner", "collation", "diner"];

    // ============================================================
    // ANALYSE DU PLAN HEBDOMADAIRE
    // ============================================================

    function analyzeWeeklyPlan(plan, userProfile) {
        if (!plan || !plan.days || !plan.summary) {
            return _emptyReport();
        }

        const summary = plan.summary;
        const calc = userProfile && userProfile.calculated ? userProfile.calculated : null;
        const targetCal = calc ? (calc.targetCalories || 2000) : DRI_REFERENCE.calories.optimal;
        const servings = plan.servings || 1;

        const calorieBilan = _computeCalorieBilan(plan, targetCal);
        const macroBilan = _computeMacroBilan(summary, targetCal);
        const varietyBilan = _computeVarietyBilan(plan);
        const budgetBilan = _computeBudgetBilan(summary, servings);
        const balanceScore = _computeBalanceScore(calorieBilan, macroBilan, varietyBilan, budgetBilan);
        const alerts = _generateAlerts(calorieBilan, macroBilan, varietyBilan, budgetBilan);
        const profileComparison = calc ? _compareWithProfile(summary, calc, servings) : null;
        const dailyTrend = _computeDailyTrend(plan);

        return {
            planId: plan.id || null,
            generatedAt: new Date().toISOString(),
            planServings: servings,
            planSummary: summary,
            calorieBilan,
            macroBilan,
            varietyBilan,
            budgetBilan,
            balanceScore,
            alerts,
            profileComparison,
            dailyTrend
        };
    }

    function _emptyReport() {
        return {
            planId: null,
            generatedAt: new Date().toISOString(),
            planServings: 1,
            planSummary: null,
            calorieBilan: { status: "empty", avgCalPerDay: 0, targetCalPerDay: 2100, deviationPct: 0, adherenceScore: 0 },
            macroBilan: { status: "empty", avgProteins: 0, avgCarbs: 0, avgFats: 0, protPct: 0, carbPct: 0, fatPct: 0, macroScore: 0 },
            varietyBilan: { status: "empty", totalMeals: 0, uniqueRecipes: 0, varietyScore: 0 },
            budgetBilan: { status: "empty", weeklyCostFCFA: 0, costPerPersonPerDayFCFA: 0, budgetScore: 50 },
            balanceScore: { total: 0, grade: "N/A", gradeLabel: "Non évalué", gradeColor: "#94A3B8", breakdown: {} },
            alerts: [],
            profileComparison: null,
            dailyTrend: []
        };
    }

    function _computeCalorieBilan(plan, targetCalPerDay) {
        const dailyValues = DAYS_KEYS.map(key => {
            const d = plan.days[key];
            return (d && d.totals) ? (d.totals.calories || 0) : 0;
        });

        const filledDays = dailyValues.filter(v => v > 0);
        const avgCalPerDay = filledDays.length > 0
            ? Math.round(filledDays.reduce((a, b) => a + b, 0) / filledDays.length)
            : 0;

        const deviationPct = targetCalPerDay > 0 && avgCalPerDay > 0
            ? Math.round(((avgCalPerDay - targetCalPerDay) / targetCalPerDay) * 100)
            : 0;

        let status = "optimal";
        if (avgCalPerDay === 0) status = "empty";
        else if (deviationPct < -20) status = "deficit_severe";
        else if (deviationPct < -10) status = "deficit_modere";
        else if (deviationPct > 25) status = "surplus_eleve";
        else if (deviationPct > 10) status = "surplus_modere";

        return {
            status,
            avgCalPerDay,
            targetCalPerDay: Math.round(targetCalPerDay),
            deviationPct,
            dailyValues,
            weeklyTotal: plan.summary.weeklyCalories || 0,
            adherenceScore: Math.max(0, 100 - Math.abs(deviationPct) * 2)
        };
    }

    function _computeMacroBilan(summary, totalCalPerDay) {
        const avgProt = summary.avgProteinsPerDay || 0;
        const avgCarb = summary.avgCarbsPerDay || 0;
        const avgFat = summary.avgFatsPerDay || 0;

        const calFromProt = avgProt * 4;
        const calFromCarb = avgCarb * 4;
        const calFromFat = avgFat * 9;
        const totalMacrosCal = calFromProt + calFromCarb + calFromFat || 1;

        const protPct = Math.round((calFromProt / totalMacrosCal) * 100);
        const carbPct = Math.round((calFromCarb / totalMacrosCal) * 100);
        const fatPct = Math.round((calFromFat / totalMacrosCal) * 100);

        const protStatus = _evaluateMacro(protPct, DRI_REFERENCE.proteinPct.min, DRI_REFERENCE.proteinPct.max);
        const carbStatus = _evaluateMacro(carbPct, DRI_REFERENCE.carbPct.min, DRI_REFERENCE.carbPct.max);
        const fatStatus = _evaluateMacro(fatPct, DRI_REFERENCE.fatPct.min, DRI_REFERENCE.fatPct.max);

        const macroScore = Math.round(
            (_macroScore(protPct, DRI_REFERENCE.proteinPct) * 0.35) +
            (_macroScore(carbPct, DRI_REFERENCE.carbPct) * 0.40) +
            (_macroScore(fatPct, DRI_REFERENCE.fatPct) * 0.25)
        );

        return {
            avgProteins: Math.round(avgProt * 10) / 10,
            avgCarbs: Math.round(avgCarb * 10) / 10,
            avgFats: Math.round(avgFat * 10) / 10,
            protPct, carbPct, fatPct,
            protStatus, carbStatus, fatStatus,
            macroScore,
            reference: DRI_REFERENCE
        };
    }

    function _computeVarietyBilan(plan) {
        const allMeals = [];
        const recipeIdCount = {};

        DAYS_KEYS.forEach(dayKey => {
            const day = plan.days[dayKey];
            if (!day || !day.meals) return;
            MEAL_SLOT_KEYS.forEach(slot => {
                const meal = day.meals[slot];
                if (meal && meal.recipeId) {
                    allMeals.push({ recipeId: meal.recipeId, title: meal.title, slot, dayKey });
                    recipeIdCount[meal.recipeId] = (recipeIdCount[meal.recipeId] || 0) + 1;
                }
            });
        });

        const totalMeals = allMeals.length;
        const uniqueRecipes = Object.keys(recipeIdCount).length;
        const diversityRatio = totalMeals > 0 ? uniqueRecipes / totalMeals : 0;
        const varietyScore = Math.round(Math.min(100, diversityRatio * 150));

        const topRepeated = Object.entries(recipeIdCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([id, count]) => {
                const meal = allMeals.find(m => m.recipeId === id);
                return { recipeId: id, title: meal ? meal.title : id, count };
            });

        let varietyStatus = "excellent";
        if (totalMeals === 0) varietyStatus = "empty";
        else if (diversityRatio < 0.3) varietyStatus = "monotone";
        else if (diversityRatio < 0.5) varietyStatus = "faible";
        else if (diversityRatio < 0.7) varietyStatus = "correct";
        else if (diversityRatio < 0.85) varietyStatus = "bon";

        return { totalMeals, uniqueRecipes, diversityRatio: Math.round(diversityRatio * 100) / 100, varietyScore, varietyStatus, topRepeated };
    }

    function _computeBudgetBilan(summary, servings) {
        const weeklyCost = summary.weeklyCostFCFA || 0;
        const weeklyCalories = summary.weeklyCalories || 0;
        const weeklyProteins = summary.weeklyProteins || 0;
        const avgCostPerDay = summary.avgCostPerDayFCFA || 0;
        const costPerPersonPerDay = summary.costPerPersonPerDayFCFA || 0;

        const fcfaPerKcal = weeklyCalories > 0 ? Math.round((weeklyCost / weeklyCalories) * 100) / 100 : 0;
        const fcfaPerGProtein = weeklyProteins > 0 ? Math.round((weeklyCost / weeklyProteins) * 10) / 10 : 0;

        let budgetCategory = "standard";
        if (costPerPersonPerDay <= BUDGET_BENCHMARKS.frugal) budgetCategory = "frugal";
        else if (costPerPersonPerDay <= BUDGET_BENCHMARKS.standard) budgetCategory = "standard";
        else if (costPerPersonPerDay <= BUDGET_BENCHMARKS.confort) budgetCategory = "confort";
        else budgetCategory = "premium";

        const optimalFcfaPerKcal = 1.2;
        const budgetScore = fcfaPerKcal > 0
            ? Math.max(0, Math.round(100 - Math.abs(fcfaPerKcal - optimalFcfaPerKcal) * 40))
            : 50;

        return { weeklyCostFCFA: weeklyCost, avgCostPerDayFCFA: Math.round(avgCostPerDay), costPerPersonPerDayFCFA: Math.round(costPerPersonPerDay), fcfaPerKcal, fcfaPerGProtein, budgetCategory, budgetScore, benchmarks: BUDGET_BENCHMARKS };
    }

    function _computeBalanceScore(calBilan, macroBilan, varietyBilan, budgetBilan) {
        if (!calBilan || calBilan.status === "empty") {
            return { total: 0, grade: "N/A", gradeLabel: "Non évalué", gradeColor: "#94A3B8", breakdown: {} };
        }

        const calScore = calBilan.adherenceScore || 0;
        const macroScore = macroBilan.macroScore || 0;
        const varietyScore = varietyBilan.varietyScore || 0;
        const budgetScore = budgetBilan.budgetScore || 50;

        const total = Math.round(
            (calScore * BALANCE_WEIGHTS.calorieAdherence / 100) +
            (macroScore * BALANCE_WEIGHTS.macroBalance / 100) +
            (varietyScore * BALANCE_WEIGHTS.mealVariety / 100) +
            (budgetScore * BALANCE_WEIGHTS.budgetEfficiency / 100)
        );

        let grade = "F", gradeLabel = "Insuffisant", gradeColor = "#EF4444";
        if (total >= 90) { grade = "A+"; gradeLabel = "Excellent"; gradeColor = "#10B981"; }
        else if (total >= 80) { grade = "A"; gradeLabel = "Très bien"; gradeColor = "#22C55E"; }
        else if (total >= 70) { grade = "B"; gradeLabel = "Bien"; gradeColor = "#84CC16"; }
        else if (total >= 60) { grade = "C"; gradeLabel = "Correct"; gradeColor = "#EAB308"; }
        else if (total >= 45) { grade = "D"; gradeLabel = "À améliorer"; gradeColor = "#F97316"; }

        return {
            total, grade, gradeLabel, gradeColor,
            breakdown: {
                calorieAdherence: { score: Math.round(calScore), weight: BALANCE_WEIGHTS.calorieAdherence },
                macroBalance: { score: Math.round(macroScore), weight: BALANCE_WEIGHTS.macroBalance },
                mealVariety: { score: Math.round(varietyScore), weight: BALANCE_WEIGHTS.mealVariety },
                budgetEfficiency: { score: Math.round(budgetScore), weight: BALANCE_WEIGHTS.budgetEfficiency }
            }
        };
    }

    function _generateAlerts(calBilan, macroBilan, varietyBilan, budgetBilan) {
        const alerts = [];

        if (calBilan.status === "deficit_severe") {
            alerts.push({ type: "danger", icon: "⚠️", category: "calories", title: "Déficit calorique important", message: `Apport moyen (${calBilan.avgCalPerDay} kcal/j) bien en dessous de la cible (${calBilan.targetCalPerDay} kcal/j).`, recommendation: "Ajoutez des céréales locales (mil, fonio) ou des légumineuses (niébé) aux repas." });
        } else if (calBilan.status === "deficit_modere") {
            alerts.push({ type: "warning", icon: "🔶", category: "calories", title: "Léger déficit calorique", message: `Apport moyen ${calBilan.deviationPct}% sous la cible. Acceptable si objectif perte de poids.`, recommendation: "Surveillez votre énergie quotidienne et ajustez si nécessaire." });
        } else if (calBilan.status === "surplus_eleve") {
            alerts.push({ type: "warning", icon: "🔶", category: "calories", title: "Surplus calorique élevé", message: `L'apport dépasse la cible de ${calBilan.deviationPct}%.`, recommendation: "Réduisez les portions de riz ou féculents, privilégiez plus de légumes." });
        }

        if (macroBilan.protStatus === "deficient") {
            alerts.push({ type: "warning", icon: "🥩", category: "proteines", title: "Protéines insuffisantes", message: `Protéines : ${macroBilan.protPct}% (recommandé : ${DRI_REFERENCE.proteinPct.min}-${DRI_REFERENCE.proteinPct.max}%).`, recommendation: "Intégrez plus de poisson (thiof, yaboye), niébé ou œufs." });
        }

        if (macroBilan.fatStatus === "exces") {
            alerts.push({ type: "info", icon: "🫒", category: "lipides", title: "Lipides légèrement élevés", message: `Lipides : ${macroBilan.fatPct}% (max recommandé : ${DRI_REFERENCE.fatPct.max}%).`, recommendation: "Modérez l'huile d'arachide, préférez la cuisson à la vapeur." });
        }

        if (varietyBilan.varietyStatus === "monotone" || varietyBilan.varietyStatus === "faible") {
            alerts.push({ type: "info", icon: "🔄", category: "variété", title: "Diversité alimentaire à améliorer", message: `${varietyBilan.uniqueRecipes} recette(s) unique(s) pour ${varietyBilan.totalMeals} repas.`, recommendation: "Utilisez le planificateur pour générer un menu plus varié." });
        }

        if (budgetBilan.budgetCategory === "frugal" && calBilan.avgCalPerDay > 0 && calBilan.avgCalPerDay < 1600) {
            alerts.push({ type: "warning", icon: "💰", category: "budget", title: "Budget serré avec apport bas", message: `Budget ${budgetBilan.costPerPersonPerDayFCFA} FCFA/pers/j et apport calorique insuffisant.`, recommendation: "Mil, sorgho et niébé sont les sources caloriques les plus abordables de Dakar." });
        }

        return alerts;
    }

    function _compareWithProfile(summary, calc, servings) {
        const targetCal = calc.targetCalories || 2000;
        const avgCal = (summary.avgCaloriesPerDay || 0) / Math.max(1, servings);
        const calGap = Math.round(avgCal - targetCal);
        const calGapPct = targetCal > 0 ? Math.round((calGap / targetCal) * 100) : 0;
        return { userTargetCalories: Math.round(targetCal), planAvgCalPerPersonPerDay: Math.round(avgCal), calorieGap: calGap, calorieGapPct: calGapPct, bmi: calc.bmi || null, goal: calc.goal || null, tdee: calc.TDEE || null };
    }

    function _computeDailyTrend(plan) {
        return DAYS_KEYS.map(key => {
            const dayData = plan.days[key];
            const totals = dayData && dayData.totals ? dayData.totals : {};
            return {
                dayKey: key,
                dayShort: DAYS_SHORT[key],
                calories: totals.calories || 0,
                costFCFA: totals.costFCFA || 0,
                proteins: totals.proteins || 0,
                filledSlots: dayData ? Object.values(dayData.meals || {}).filter(m => m !== null).length : 0
            };
        });
    }

    function _evaluateMacro(value, min, max) {
        if (value < min * 0.8) return "deficient";
        if (value < min) return "bas";
        if (value > max * 1.2) return "exces";
        if (value > max) return "eleve";
        return "optimal";
    }

    function _macroScore(value, ref) {
        if (value >= ref.min && value <= ref.max) return 100;
        const dist = value < ref.min ? ref.min - value : value - ref.max;
        const range = Math.max(1, ref.max - ref.min);
        return Math.max(0, 100 - (dist / range) * 120);
    }

    // ============================================================
    // API PUBLIQUE
    // ============================================================

    function formatReportText(report) {
        if (!report || !report.planSummary) return "Aucun plan analysé.";
        const s = report.planSummary;
        const score = report.balanceScore;
        const cal = report.calorieBilan;
        const macro = report.macroBilan;
        const budget = report.budgetBilan;

        let text = "📊 BILAN NUTRITIONNEL HEBDOMADAIRE — NUTRIBUDGET 🇸🇳\n";
        text += "══════════════════════════════════════\n\n";
        text += `🏆 Score d'équilibre : ${score.total}/100 (${score.grade} — ${score.gradeLabel})\n\n`;
        text += `🔥 Calories\n`;
        text += `  • Moyenne/jour : ${(cal.avgCalPerDay || 0).toLocaleString("fr-FR")} kcal\n`;
        text += `  • Cible : ${(cal.targetCalPerDay || 0).toLocaleString("fr-FR")} kcal/j\n`;
        text += `  • Écart : ${cal.deviationPct > 0 ? "+" : ""}${cal.deviationPct}%\n\n`;
        text += `🥗 Macronutriments (moy./j)\n`;
        text += `  • Protéines : ${macro.avgProteins}g (${macro.protPct}%) — ${macro.protStatus}\n`;
        text += `  • Glucides : ${macro.avgCarbs}g (${macro.carbPct}%) — ${macro.carbStatus}\n`;
        text += `  • Lipides : ${macro.avgFats}g (${macro.fatPct}%) — ${macro.fatStatus}\n\n`;
        text += `💰 Budget\n`;
        text += `  • Semaine : ${(s.weeklyCostFCFA || 0).toLocaleString("fr-FR")} FCFA\n`;
        text += `  • Par convive/jour : ${(budget.costPerPersonPerDayFCFA || 0).toLocaleString("fr-FR")} FCFA\n`;
        text += `  • Efficacité : ${budget.fcfaPerKcal} FCFA/kcal\n`;

        if (report.alerts && report.alerts.length > 0) {
            text += `\n⚠️ Alertes & Conseils\n`;
            report.alerts.forEach(a => {
                text += `  ${a.icon} ${a.title} → ${a.recommendation}\n`;
            });
        }

        return text;
    }

    function comparePlans(reportA, reportB) {
        if (!reportA || !reportB) return null;
        return {
            calorieDiff: (reportA.calorieBilan.avgCalPerDay || 0) - (reportB.calorieBilan.avgCalPerDay || 0),
            costDiff: (reportA.budgetBilan.weeklyCostFCFA || 0) - (reportB.budgetBilan.weeklyCostFCFA || 0),
            scoreDiff: (reportA.balanceScore.total || 0) - (reportB.balanceScore.total || 0),
            varietyDiff: (reportA.varietyBilan.uniqueRecipes || 0) - (reportB.varietyBilan.uniqueRecipes || 0),
            winner: (reportA.balanceScore.total >= reportB.balanceScore.total) ? "A" : "B"
        };
    }

    function computeMealBalance(nutritionObj) {
        if (!nutritionObj || !nutritionObj.perServing) return null;
        const ps = nutritionObj.perServing;
        const totalKcal = ps.calories || 0;
        if (totalKcal === 0) return null;

        const protKcal = (ps.proteins || 0) * 4;
        const carbKcal = (ps.carbs || 0) * 4;
        const fatKcal = (ps.fats || 0) * 9;
        const total = protKcal + carbKcal + fatKcal || 1;

        const protPct = Math.round((protKcal / total) * 100);
        const carbPct = Math.round((carbKcal / total) * 100);
        const fatPct = Math.round((fatKcal / total) * 100);

        const score = Math.round(
            (_macroScore(protPct, DRI_REFERENCE.proteinPct) * 0.35) +
            (_macroScore(carbPct, DRI_REFERENCE.carbPct) * 0.40) +
            (_macroScore(fatPct, DRI_REFERENCE.fatPct) * 0.25)
        );

        return { protPct, carbPct, fatPct, score, totalKcal };
    }

    return {
        DRI_REFERENCE,
        BUDGET_BENCHMARKS,
        analyzeWeeklyPlan,
        formatReportText,
        comparePlans,
        computeMealBalance
    };
});
