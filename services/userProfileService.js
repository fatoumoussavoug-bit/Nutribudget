/**
 * NutriBudget - Service Profil Utilisateur, Besoins Énergétiques & Garde-fous de Sécurité
 * Formules scientifiques validées : Mifflin-St Jeor (BMR) & Facteurs d'activité OMS/FAO (PAL/TDEE).
 * Garde-fous stricts de santé publique (seuils planchers vitaux, alertes mineurs et situations médicales).
 */

(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else {
        root.NutriProfile = factory();
    }
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const STORAGE_KEY_USER = "nutribudget_current_user";
    const STORAGE_KEY_PROFILES = "nutribudget_user_profiles";

    // Facteurs d'activité physique (Physical Activity Level - PAL)
    const ACTIVITY_FACTORS = {
        sedentaire: { label: "Sédentaire (travail de bureau, peu ou pas de sport)", factor: 1.2 },
        leger: { label: "Légèrement actif (marche quotidienne, sport 1-3 j/semaine)", factor: 1.375 },
        modere: { label: "Modérément actif (sport 3-5 j/semaine, travail actif)", factor: 1.55 },
        intense: { label: "Très actif (sport intense 6-7 j/semaine, travail physique)", factor: 1.725 },
        tres_intense: { label: "Extrêmement actif (athlète, travaux lourds quotidiens)", factor: 1.9 }
    };

    // Seuils planchers de sécurité physiologique vitale (en kcal/jour)
    const SAFETY_FLOORS = {
        femme: 1200,
        homme: 1500
    };

    /**
     * Valide les données brutes d'un profil
     * @param {Object} data
     * @returns {{ isValid: boolean, errors: string[] }}
     */
    function validateProfileData(data) {
        const errors = [];
        if (!data) {
            return { isValid: false, errors: ["Les données du profil sont obligatoires."] };
        }

        const age = Number(data.age);
        if (isNaN(age) || age < 10 || age > 110) {
            errors.push("L'âge doit être compris entre 10 et 110 ans.");
        }

        const weight = Number(data.weight);
        if (isNaN(weight) || weight < 30 || weight > 250) {
            errors.push("Le poids doit être compris entre 30 et 250 kg.");
        }

        const height = Number(data.height);
        if (isNaN(height) || height < 100 || height > 230) {
            errors.push("La taille doit être comprise entre 100 et 230 cm.");
        }

        if (!data.gender || !["homme", "femme"].includes(data.gender.toLowerCase())) {
            errors.push("Le genre doit être 'homme' ou 'femme'.");
        }

        if (!data.goal || !["perte", "maintien", "prise"].includes(data.goal.toLowerCase())) {
            errors.push("L'objectif doit être 'perte', 'maintien' ou 'prise'.");
        }

        if (data.householdSize !== undefined && data.householdSize !== null && data.householdSize !== "") {
            const size = Number(data.householdSize);
            if (isNaN(size) || size < 1 || size > 20) {
                errors.push("Le nombre de personnes au foyer doit être compris entre 1 et 20.");
            }
        }

        if (data.budgetAmountFCFA !== undefined && data.budgetAmountFCFA !== null && data.budgetAmountFCFA !== "") {
            const budget = Number(data.budgetAmountFCFA);
            if (isNaN(budget) || budget < 0) {
                errors.push("Le budget alimentaire doit être un montant positif en FCFA.");
            }
        }

        if (data.budgetPeriod === "custom" && data.budgetAmountFCFA && Number(data.budgetAmountFCFA) > 0) {
            const days = Number(data.budgetDays);
            if (isNaN(days) || days < 1) {
                errors.push("Veuillez préciser le nombre exact de jours (au moins 1) pour la période personnalisée.");
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Calcule le Métabolisme de Base (BMR) selon la formule de référence Mifflin-St Jeor
     * BMR = 10*poids(kg) + 6.25*taille(cm) - 5*age + (5 pour homme, -161 pour femme)
     * @param {number} weight Poids en kg
     * @param {number} height Taille en cm
     * @param {number} age Âge en années
     * @param {string} gender 'homme' ou 'femme'
     * @returns {number} BMR arrondi en kcal
     */
    function calculateBMR(weight, height, age, gender) {
        const w = Number(weight);
        const h = Number(height);
        const a = Number(age);
        const g = (gender || "femme").toLowerCase();

        let bmr = (10 * w) + (6.25 * h) - (5 * a);
        if (g === "homme") {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        return Math.round(bmr);
    }

    /**
     * Calcule la Dépense Énergétique Totale (TDEE)
     * @param {number} bmr
     * @param {string} activityLevel ('sedentaire', 'leger', 'modere', 'intense', 'tres_intense')
     * @returns {number} TDEE en kcal
     */
    function calculateTDEE(bmr, activityLevel = "sedentaire") {
        const activity = ACTIVITY_FACTORS[activityLevel] || ACTIVITY_FACTORS.sedentaire;
        return Math.round(bmr * activity.factor);
    }

    /**
     * Calcule l'Indice de Masse Corporelle (IMC) et sa classification OMS
     */
    function calculateBMI(weight, height) {
        const hMeters = Number(height) / 100;
        const w = Number(weight);
        if (!hMeters || hMeters <= 0 || !w || w <= 0) return { bmi: 0, category: "inconnu" };

        const bmi = Math.round((w / (hMeters * hMeters)) * 10) / 10;
        let category = "";
        let color = "";

        if (bmi < 18.5) {
            category = "Insuffisance pondérale";
            color = "#E67E22";
        } else if (bmi < 25) {
            category = "Corpulence normale";
            color = "#27AE60";
        } else if (bmi < 30) {
            category = "Surpoids";
            color = "#F39C12";
        } else if (bmi < 35) {
            category = "Obésité modérée (Classe I)";
            color = "#E74C3C";
        } else {
            category = "Obésité sévère (Classe II/III)";
            color = "#C0392B";
        }

        return { bmi, category, color };
    }

    /**
     * Moteur d'évaluation nutritionnelle complet avec garde-fous de santé
     * @param {Object} profile
     * @returns {Object} Analyse détaillée
     */
    function calculateEnergyNeeds(profile) {
        const validation = validateProfileData(profile);
        if (!validation.isValid) {
            throw new Error(`Profil invalide: ${validation.errors.join(", ")}`);
        }

        const age = Number(profile.age);
        const weight = Number(profile.weight);
        const height = Number(profile.height);
        const gender = profile.gender.toLowerCase();
        const goal = profile.goal.toLowerCase();
        const activityLevel = profile.activityLevel || "sedentaire";
        const householdSize = Math.max(1, Number(profile.householdSize) || 1);
        const budgetAmount = Number(profile.budgetAmountFCFA) || 0;
        const budgetPeriod = profile.budgetPeriod || "hebdomadaire";

        const bmr = calculateBMR(weight, height, age, gender);
        const tdee = calculateTDEE(bmr, activityLevel);
        const bmiInfo = calculateBMI(weight, height);

        // Détermination de la cible calorique selon l'objectif
        let rawTargetCalories = tdee;
        let calorieDelta = 0;

        if (goal === "perte") {
            // Déficit calorique modéré et durable (environ -400 à -500 kcal, sans dépasser 20% du TDEE)
            const maxDeficit = Math.round(tdee * 0.20);
            calorieDelta = -Math.min(450, maxDeficit);
            rawTargetCalories = tdee + calorieDelta;
        } else if (goal === "prise") {
            // Surplus modéré de construction musculaire saine (+300 à +400 kcal)
            calorieDelta = 350;
            rawTargetCalories = tdee + calorieDelta;
        }

        // ====================================================
        // GARDE-FOUS DE SÉCURITÉ MÉTABOLIQUE (OMS / ANSES)
        // ====================================================
        const safetyFloor = SAFETY_FLOORS[gender] || 1200;
        let isFloorTriggered = false;
        let targetCalories = rawTargetCalories;

        if (targetCalories < safetyFloor) {
            targetCalories = safetyFloor;
            isFloorTriggered = true;
        }

        // Alertes et avertissements de santé
        const warnings = [];
        const isMinor = age < 18;
        if (isMinor) {
            warnings.push({
                type: "warning",
                code: "MINOR_USER",
                message: "Attention : Vous avez moins de 18 ans. En période de croissance, tout déficit calorique strict est déconseillé sans avis médical ou pédiatrique."
            });
        }

        if (isFloorTriggered) {
            warnings.push({
                type: "alert",
                code: "SAFETY_FLOOR_APPLIED",
                message: `Pour préserver votre santé et vos fonctions vitales, l'apport énergétique quotidien a été sécurisé au plancher biologique de ${safetyFloor} kcal/jour.`
            });
        }

        if (profile.specialConditions && Array.isArray(profile.specialConditions)) {
            const conditions = profile.specialConditions.map(c => c.toLowerCase());
            if (conditions.includes("grossesse") || conditions.includes("allaitement")) {
                warnings.push({
                    type: "critical",
                    code: "PREGNANCY_LACTATION",
                    message: "Grossesse / Allaitement : Les besoins en micronutriments et calories sont spécifiques. Consultez impérativement un professionnel de santé."
                });
            }
            if (conditions.includes("diabete")) {
                warnings.push({
                    type: "warning",
                    code: "DIABETES",
                    message: "Diabète : Privilégiez les céréales locales à faible indice glycémique (Fonio, Mil) et suivez les recommandations de votre médecin traitant."
                });
            }
            if (conditions.includes("hypertension")) {
                warnings.push({
                    type: "warning",
                    code: "HYPERTENSION",
                    message: "Hypertension : Privilégiez le Nététou et les herbes aromatiques à la place des cubes salés, et intégrez des infusions de Bissap rouge réputées régulatrices."
                });
            }
            if (profile.otherCondition && profile.otherCondition.trim()) {
                warnings.push({
                    type: "warning",
                    code: "CUSTOM_CONDITION",
                    message: `Condition particulière signalée (${profile.otherCondition.trim()}) : Assurez-vous d'adapter vos choix alimentaires selon l'avis de votre professionnel de santé.`
                });
            }
        }

        if (bmiInfo.bmi < 18.5 && goal === "perte") {
            warnings.push({
                type: "critical",
                code: "UNDERWEIGHT_WEIGHT_LOSS",
                message: "Alerte de santé : Votre IMC indique déjà une insuffisance pondérale. Un objectif de perte de poids n'est pas recommandé."
            });
        }

        // ====================================================
        // RÉPARTITION DES MACRONUTRIMENTS CIBLES
        // ====================================================
        // Protéines : 1.6 à 2.0 g/kg si perte/prise, 1.2 à 1.5 g/kg si maintien
        let proteinGramsPerKg = 1.4;
        if (goal === "perte") proteinGramsPerKg = 1.7; // Préserver la masse maigre en déficit
        if (goal === "prise") proteinGramsPerKg = 1.8; // Synthèse musculaire

        let targetProteins = Math.round(weight * proteinGramsPerKg);
        // S'assurer que les protéines restent dans une fourchette sécuritaire (15% à 30% des calories)
        const proteinKcal = targetProteins * 4;
        if (proteinKcal > targetCalories * 0.30) {
            targetProteins = Math.round((targetCalories * 0.25) / 4);
        }

        // Lipides : ~25% à 30% des calories totales (bonnes graisses locales : arachides, yaboye)
        const fatKcal = Math.round(targetCalories * 0.28);
        const targetFats = Math.round(fatKcal / 9);

        // Glucides : Le reste des calories (énergie des céréales locales : riz, mil, patate douce)
        const carbKcal = Math.max(0, targetCalories - (targetProteins * 4) - (targetFats * 9));
        const targetCarbs = Math.round(carbKcal / 4);

        // ====================================================
        // CALCUL DU BUDGET ALIMENTAIRE (FCFA)
        // ====================================================
        let budgetDays = 7;
        if (profile.budgetDays && Number(profile.budgetDays) > 0) {
            budgetDays = Math.round(Number(profile.budgetDays));
        } else if (budgetPeriod === "15" || budgetPeriod === "15_jours") {
            budgetDays = 15;
        } else if (budgetPeriod === "30" || budgetPeriod === "30_jours" || budgetPeriod === "mensuel") {
            budgetDays = 30;
        } else if (budgetPeriod === "journalier" || budgetPeriod === "1") {
            budgetDays = 1;
        } else {
            budgetDays = 7;
        }

        let dailyBudgetTotalFCFA = 0;
        if (budgetAmount > 0 && budgetDays > 0) {
            dailyBudgetTotalFCFA = Math.round(budgetAmount / budgetDays);
        }

        const dailyBudgetPerPersonFCFA = householdSize > 0
            ? Math.round(dailyBudgetTotalFCFA / householdSize)
            : dailyBudgetTotalFCFA;

        // Estimation par repas principal (3 repas par jour)
        const budgetPerMealPerPersonFCFA = Math.round(dailyBudgetPerPersonFCFA / 3);

        return {
            bmr,
            tdee,
            bmi: bmiInfo,
            targetCalories,
            rawTargetCalories,
            isFloorTriggered,
            safetyFloor,
            calorieDelta,
            targetMacros: {
                proteins: targetProteins,
                carbs: targetCarbs,
                fats: targetFats,
                distribution: {
                    proteinPercent: Math.round(((targetProteins * 4) / targetCalories) * 100),
                    carbPercent: Math.round(((targetCarbs * 4) / targetCalories) * 100),
                    fatPercent: Math.round(((targetFats * 9) / targetCalories) * 100)
                }
            },
            budget: {
                period: budgetPeriod,
                days: budgetDays,
                currency: profile.budgetCurrency || "FCFA",
                amountFCFA: budgetAmount,
                householdSize,
                dailyTotalFCFA: dailyBudgetTotalFCFA,
                dailyPerPersonFCFA: dailyBudgetPerPersonFCFA,
                perMealPerPersonFCFA: budgetPerMealPerPersonFCFA
            },
            warnings,
            medicalDisclaimer: "NutriBudget est un outil d'accompagnement nutritionnel et budgétaire. Ces estimations ne constituent pas une prescription médicale ni un diagnostic diététique. En cas de doute ou de pathologie, consultez un médecin ou un nutritionniste qualifié."
        };
    }

    // ====================================================
    // GESTION DU STOCKAGE LOCAL DU PROFIL & DE LA SESSION
    // ====================================================
    function getStoredProfiles() {
        if (typeof window === "undefined" || !window.localStorage) return {};
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY_PROFILES);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.error("Erreur lecture STORAGE_KEY_PROFILES", e);
            return {};
        }
    }

    function saveStoredProfiles(profilesMap) {
        if (typeof window === "undefined" || !window.localStorage) return;
        try {
            window.localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profilesMap));
        } catch (e) {
            console.error("Erreur écriture STORAGE_KEY_PROFILES", e);
        }
    }

    function getCurrentUser() {
        if (typeof window === "undefined" || !window.localStorage) return null;
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY_USER);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function setCurrentUser(user) {
        if (typeof window === "undefined" || !window.localStorage) return;
        try {
            if (user) {
                window.localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
            } else {
                window.localStorage.removeItem(STORAGE_KEY_USER);
            }
        } catch (e) { }
    }

    /**
     * Inscription d'un utilisateur avec persistance locale sécurisée
     */
    function register(email, password, name = "") {
        const cleanEmail = (email || "").trim().toLowerCase();
        if (!cleanEmail || !cleanEmail.includes("@")) {
            throw new Error("Veuillez fournir une adresse email valide.");
        }
        if (!password || password.length < 6) {
            throw new Error("Le mot de passe doit comporter au moins 6 caractères.");
        }

        const profiles = getStoredProfiles();
        if (profiles[cleanEmail]) {
            throw new Error("Un compte existe déjà avec cette adresse email.");
        }

        const newUser = {
            id: "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
            email: cleanEmail,
            name: name || cleanEmail.split("@")[0],
            createdAt: new Date().toISOString()
        };

        profiles[cleanEmail] = {
            user: newUser,
            passwordHash: btoa(password), // Stockage local simple (prêt pour JWT/Supabase au backend)
            profile: null
        };

        saveStoredProfiles(profiles);
        setCurrentUser(newUser);
        return newUser;
    }

    /**
     * Connexion
     */
    function login(email, password) {
        const cleanEmail = (email || "").trim().toLowerCase();
        const profiles = getStoredProfiles();
        const account = profiles[cleanEmail];

        if (!account || account.passwordHash !== btoa(password)) {
            throw new Error("Adresse email ou mot de passe incorrect.");
        }

        setCurrentUser(account.user);
        return account.user;
    }

    /**
     * Déconnexion
     */
    function logout() {
        setCurrentUser(null);
    }

    /**
     * Sauvegarder ou mettre à jour le profil de l'utilisateur actif
     */
    function saveProfile(profileData) {
        const currentUser = getCurrentUser();
        const email = currentUser ? currentUser.email : "guest@nutribudget.local";

        const validation = validateProfileData(profileData);
        if (!validation.isValid) {
            throw new Error(`Erreurs de validation : ${validation.errors.join(", ")}`);
        }

        const calculated = calculateEnergyNeeds(profileData);
        const fullProfileRecord = {
            ...profileData,
            calculated,
            updatedAt: new Date().toISOString()
        };

        const profiles = getStoredProfiles();
        if (!profiles[email]) {
            profiles[email] = {
                user: currentUser || { id: "guest", email, name: "Invité" },
                profile: fullProfileRecord
            };
        } else {
            profiles[email].profile = fullProfileRecord;
        }

        saveStoredProfiles(profiles);
        return fullProfileRecord;
    }

    /**
     * Récupérer le profil de l'utilisateur actif
     */
    function getProfile() {
        const currentUser = getCurrentUser();
        const email = currentUser ? currentUser.email : "guest@nutribudget.local";
        const profiles = getStoredProfiles();
        return (profiles[email] && profiles[email].profile) ? profiles[email].profile : null;
    }

    return {
        ACTIVITY_FACTORS,
        SAFETY_FLOORS,
        validateProfileData,
        calculateBMR,
        calculateTDEE,
        calculateBMI,
        calculateEnergyNeeds,
        register,
        login,
        logout,
        getCurrentUser,
        setCurrentUser,
        saveProfile,
        getProfile
    };
});
