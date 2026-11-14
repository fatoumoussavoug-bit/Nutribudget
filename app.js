/**
 * NutriBudget - Contrôleur Principal de l'Espace Application (Étape 3)
 * Gère l'authentification, la navigation, le formulaire de profil et le tableau de bord.
 */

const App = (function () {
    "use strict";

    // Variables pour la vérification email lors de l'inscription
    let _pendingVerifyCode = null;
    let _pendingUser = null;

    // ============================================================
    // INITIALISATION
    // ============================================================
    function init() {
        const currentUser = NutriProfile.getCurrentUser();
        if (currentUser) {
            showApp(currentUser);
        } else {
            showAuthScreen();
        }
    }

    // ============================================================
    // AUTH — Écran de connexion / inscription
    // ============================================================
    function showAuthScreen() {
        document.getElementById("auth-screen").style.display = "flex";
        document.getElementById("app-screen").classList.remove("active");
        document.getElementById("nav-logged-in").style.display = "none";
        document.getElementById("nav-logged-out").style.display = "flex";
    }

    function showApp(user) {
        document.getElementById("auth-screen").style.display = "none";
        document.getElementById("app-screen").classList.add("active");
        document.getElementById("nav-logged-in").style.display = "flex";
        document.getElementById("nav-logged-out").style.display = "none";

        // Mise à jour de la navbar
        const initials = (user.name || user.email || "U")
            .split(" ")
            .map(w => w[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
        document.getElementById("nav-avatar").textContent = initials;
        document.getElementById("nav-username").textContent = user.name || user.email.split("@")[0];

        // Charger le dashboard
        loadDashboard();
    }

    function switchAuthTab(tab) {
        const tabs = ["login", "register"];
        tabs.forEach(t => {
            document.getElementById("tab-" + t).classList.toggle("active", t === tab);
            document.getElementById("form-" + t).classList.toggle("active", t === tab);
            document.getElementById("form-" + t).style.display = (t === tab) ? "block" : "none";
        });
        // Cacher la vérification email si on revient aux onglets normaux
        const verifyForm = document.getElementById("form-verify-email");
        if (verifyForm) verifyForm.style.display = "none";
        // Réafficher les onglets
        const authTabs = document.querySelector(".auth-tabs");
        if (authTabs) authTabs.style.display = "flex";
        // Effacer les erreurs
        document.getElementById("login-error").style.display = "none";
        document.getElementById("register-error").style.display = "none";
    }

    function handleLogin(e) {
        e.preventDefault();
        const btn = document.getElementById("login-submit-btn");
        const errEl = document.getElementById("login-error");
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;

        btn.innerHTML = '<span class="spinner"></span>';
        btn.classList.add("loading");
        errEl.style.display = "none";

        setTimeout(() => {
            try {
                const user = NutriProfile.login(email, password);
                btn.innerHTML = "Se connecter";
                btn.classList.remove("loading");
                showToast("Bienvenue, " + (user.name || "vous") + " ! 👋", "success");
                showApp(user);
            } catch (err) {
                btn.innerHTML = "Se connecter";
                btn.classList.remove("loading");
                errEl.textContent = err.message;
                errEl.style.display = "block";
            }
        }, 400);
    }

    function handleRegister(e) {
        e.preventDefault();
        const btn = document.getElementById("register-submit-btn");
        const errEl = document.getElementById("register-error");
        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;

        btn.innerHTML = '<span class="spinner"></span>';
        btn.classList.add("loading");
        errEl.style.display = "none";

        setTimeout(() => {
            try {
                const user = NutriProfile.register(email, password, name);
                btn.innerHTML = "Créer mon compte";
                btn.classList.remove("loading");

                // Générer un code de vérification à 6 chiffres
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                _pendingVerifyCode = code;
                _pendingUser = user;

                // Afficher le code dans la console (simulation d'envoi email)
                console.log("%c[NutriBudget DEV] 📧 Code de vérification pour " + email + " : " + code,
                    "background:#2ECC71; color:white; padding:6px 12px; border-radius:4px; font-size:14px; font-weight:bold;");

                // Afficher l'étape de vérification
                document.getElementById("form-register").style.display = "none";
                document.getElementById("form-register").classList.remove("active");
                const authTabs = document.querySelector(".auth-tabs");
                if (authTabs) authTabs.style.display = "none";
                document.getElementById("verify-email-display").textContent = email;
                document.getElementById("verify-code-input").value = "";
                const codeBadge = document.getElementById("verify-code-badge");
                if (codeBadge) codeBadge.textContent = code;
                document.getElementById("verify-error").style.display = "none";
                document.getElementById("form-verify-email").style.display = "block";

                showToast("Code envoyé ! Vérifiez la console (F12) pour les tests 🔑", "info");

            } catch (err) {
                btn.innerHTML = "Créer mon compte";
                btn.classList.remove("loading");
                errEl.textContent = err.message;
                errEl.style.display = "block";
            }
        }, 400);
    }

    function handleVerifyEmail() {
        const input = document.getElementById("verify-code-input").value.trim();
        const errEl = document.getElementById("verify-error");
        const btn = document.getElementById("verify-submit-btn");

        errEl.style.display = "none";

        if (!input || input.length !== 6) {
            errEl.textContent = "Veuillez entrer le code à 6 chiffres.";
            errEl.style.display = "block";
            return;
        }

        if (input !== _pendingVerifyCode) {
            errEl.textContent = "Code incorrect. Réessayez ou renvoyez un nouveau code.";
            errEl.style.display = "block";
            // Faire vibrer l'input
            const inp = document.getElementById("verify-code-input");
            inp.style.borderColor = "#E74C3C";
            setTimeout(() => { inp.style.borderColor = ""; }, 1500);
            return;
        }

        // Code correct !
        btn.innerHTML = '<span class="spinner"></span>';
        btn.classList.add("loading");

        setTimeout(() => {
            btn.innerHTML = "✅ Valider mon compte";
            btn.classList.remove("loading");

            const user = _pendingUser;
            if (NutriProfile.setCurrentUser) {
                NutriProfile.setCurrentUser(user);
            }
            _pendingVerifyCode = null;
            _pendingUser = null;

            showToast("Email vérifié ! Bienvenue " + (user.name || "") + " 🎉", "success");
            showApp(user);
            // Rediriger vers le profil pour le remplir
            setTimeout(() => showTab("profile"), 800);
        }, 500);
    }

    function resendVerifyCode() {
        if (!_pendingUser) return;
        const email = _pendingUser.email;
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        _pendingVerifyCode = code;

        console.log("%c[NutriBudget DEV] 📧 Nouveau code de vérification pour " + email + " : " + code,
            "background:#E67E22; color:white; padding:6px 12px; border-radius:4px; font-size:14px; font-weight:bold;");

        document.getElementById("verify-code-input").value = "";
        const codeBadge = document.getElementById("verify-code-badge");
        if (codeBadge) codeBadge.textContent = code;
        document.getElementById("verify-error").style.display = "none";
        showToast("Nouveau code envoyé ! Vérifiez la console (F12) 🔑", "info");
    }

    function logout() {
        NutriProfile.logout();
        showToast("À bientôt ! 👋", "info");
        setTimeout(() => showAuthScreen(), 500);
    }

    // ============================================================
    // NAVIGATION — Sidebar tabs
    // ============================================================
    function showTab(tabName) {
        // Vues
        document.querySelectorAll(".app-tab-view").forEach(v => v.classList.remove("active"));
        const view = document.getElementById("tab-view-" + tabName);
        if (view) view.classList.add("active");

        // Sidebar items
        document.querySelectorAll(".sidebar-item").forEach(item => {
            item.classList.remove("active");
        });
        const sidebarItem = document.getElementById("sidebar-" + tabName);
        if (sidebarItem) sidebarItem.classList.add("active");

        // Charger les données de la vue
        if (tabName === "dashboard") loadDashboard();
        if (tabName === "profile") loadProfileForm();
        if (tabName === "recipes") loadRecipesTab();
        if (tabName === "planner") loadPlannerTab();
        if (tabName === "shopping") loadShoppingTab();
    }

    function showComingSoon(featureName) {
        showToast("✨ " + featureName + " arrive à la prochaine étape !", "info");
    }

    // ============================================================
    // TABLEAU DE BORD — Dashboard
    // ============================================================
    function loadDashboard() {
        const profile = NutriProfile.getProfile();

        if (!profile || !profile.calculated) {
            document.getElementById("dashboard-empty").style.display = "block";
            document.getElementById("dashboard-results").style.display = "none";
            return;
        }

        const user = NutriProfile.getCurrentUser();
        const calc = profile.calculated;

        document.getElementById("dashboard-empty").style.display = "none";
        document.getElementById("dashboard-results").style.display = "block";

        // Salutation personnalisée
        const hour = new Date().getHours();
        let greet = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
        const userName = user ? (user.name || user.email.split("@")[0]) : "";
        document.getElementById("dashboard-greeting").textContent = greet + (userName ? ", " + userName + " !" : " !");

        const goalLabels = { perte: "objectif perte de poids", maintien: "maintien du poids", prise: "prise de masse" };
        document.getElementById("dashboard-subtext").textContent =
            "Voici votre bilan personnalisé pour un " + (goalLabels[profile.goal] || "objectif nutritionnel") + ".";

        // Stats principales
        document.getElementById("stat-calories").textContent = calc.targetCalories.toLocaleString("fr-FR");
        document.getElementById("stat-bmr").textContent = calc.bmr.toLocaleString("fr-FR");
        document.getElementById("stat-tdee").textContent = calc.tdee.toLocaleString("fr-FR");
        document.getElementById("stat-bmi").textContent = calc.bmi.bmi;
        document.getElementById("stat-bmi-cat").textContent = calc.bmi.category;

        // Macros barres
        const m = calc.targetMacros;
        const d = m.distribution;
        document.getElementById("macro-proteins-val").textContent =
            m.proteins + "g/j (" + d.proteinPercent + "% des kcal)";
        document.getElementById("macro-carbs-val").textContent =
            m.carbs + "g/j (" + d.carbPercent + "% des kcal)";
        document.getElementById("macro-fats-val").textContent =
            m.fats + "g/j (" + d.fatPercent + "% des kcal)";

        // Animation différée pour les barres
        requestAnimationFrame(() => {
            setTimeout(() => {
                document.getElementById("macro-proteins-bar").style.width = d.proteinPercent + "%";
                document.getElementById("macro-carbs-bar").style.width = d.carbPercent + "%";
                document.getElementById("macro-fats-bar").style.width = d.fatPercent + "%";
            }, 100);
        });

        // IMC
        const bmi = calc.bmi;
        document.getElementById("bmi-number").textContent = bmi.bmi;
        document.getElementById("bmi-number").style.color = bmi.color || "var(--primary)";
        document.getElementById("bmi-category").textContent = bmi.category;
        document.getElementById("bmi-category").style.color = bmi.color || "var(--primary)";

        // Position du marqueur IMC sur l'échelle (IMC de 15 à 40 → 0% à 100%)
        const bmiPct = Math.min(100, Math.max(0, ((bmi.bmi - 15) / 25) * 100));
        document.getElementById("bmi-marker").style.left = bmiPct + "%";

        // Budget
        const budget = calc.budget;
        if (budget && budget.amountFCFA > 0) {
            document.getElementById("budget-card").style.display = "block";
            const curr = budget.currency || "FCFA";
            const days = budget.days || 7;
            const periodLabels = { "7": "Semaine (7 j)", "15": "15 jours", "30": "Mois (30 j)", "custom": `${days} jours` };
            const periodLabel = periodLabels[budget.period] || `${days} jours`;

            const cardCurrEl = document.getElementById("budget-card-currency");
            if (cardCurrEl) cardCurrEl.textContent = curr;

            const badgeEl = document.getElementById("budget-period-badge");
            if (badgeEl) badgeEl.textContent = `Période : ${periodLabel}`;

            const totalStatedEl = document.getElementById("budget-total-stated");
            if (totalStatedEl) totalStatedEl.textContent = `${budget.amountFCFA.toLocaleString("fr-FR")} ${curr}`;

            const daysStatedEl = document.getElementById("budget-days-stated");
            if (daysStatedEl) daysStatedEl.textContent = `${days} jour${days > 1 ? "s" : ""}`;

            const hhStatedEl = document.getElementById("budget-household-stated");
            if (hhStatedEl) {
                const hh = budget.householdSize || 1;
                hhStatedEl.textContent = `${hh} personne${hh > 1 ? "s" : ""}`;
            }

            document.getElementById("budget-daily-total").textContent =
                budget.dailyTotalFCFA.toLocaleString("fr-FR") + " " + curr;
            document.getElementById("budget-daily-person").textContent =
                budget.dailyPerPersonFCFA.toLocaleString("fr-FR") + " " + curr;
            document.getElementById("budget-per-meal").textContent =
                budget.perMealPerPersonFCFA.toLocaleString("fr-FR") + " " + curr;
        } else {
            document.getElementById("budget-card").style.display = "none";
        }

        // Avertissements de santé
        const warnContainer = document.getElementById("warnings-container");
        warnContainer.innerHTML = "";
        if (calc.warnings && calc.warnings.length > 0) {
            calc.warnings.forEach(w => {
                const icons = { warning: "⚠️", alert: "🔔", critical: "🚨" };
                const div = document.createElement("div");
                div.className = "health-warning " + w.type;
                div.innerHTML = `<span class="warning-icon">${icons[w.type] || "ℹ️"}</span><span>${w.message}</span>`;
                warnContainer.appendChild(div);
            });
        }
    }

    // ============================================================
    // GESTION DU BUDGET FLEXIBLE & CONDITIONS EN TEMPS RÉEL
    // ============================================================
    function updateBudgetCalculation() {
        const amountInput = document.getElementById("prof-budget-amount");
        const periodSelect = document.getElementById("prof-budget-period");
        const customGroup = document.getElementById("prof-budget-custom-days-group");
        const customDaysInput = document.getElementById("prof-budget-custom-days");
        const householdInput = document.getElementById("prof-household");
        const previewEl = document.getElementById("prof-budget-preview");
        const dailyCalcEl = document.getElementById("prof-budget-daily-calc");
        const perPersonCalcEl = document.getElementById("prof-budget-per-person-calc");
        const currencySelect = document.getElementById("prof-budget-currency");

        if (!amountInput || !periodSelect) return;

        const period = periodSelect.value;
        const isCustom = period === "custom";
        if (customGroup) {
            customGroup.style.display = isCustom ? "block" : "none";
        }

        const amount = parseFloat(amountInput.value) || 0;
        let days = 7;
        if (isCustom) {
            days = parseInt(customDaysInput?.value) || 0;
        } else {
            days = parseInt(period) || (period === "journalier" ? 1 : 7);
        }

        const household = Math.max(1, parseInt(householdInput?.value) || 1);
        const currency = currencySelect?.value || "FCFA";

        if (amount > 0 && days > 0) {
            const daily = Math.round(amount / days);
            const perPerson = Math.round(daily / household);
            const perMeal = Math.round(perPerson / 3);

            if (dailyCalcEl) {
                dailyCalcEl.textContent = `${daily.toLocaleString("fr-FR")} ${currency} / jour`;
            }
            if (perPersonCalcEl) {
                perPersonCalcEl.innerHTML = `
                    <span>Soit environ <strong>${perPerson.toLocaleString("fr-FR")} ${currency}</strong> / jour par personne</span>
                    <span style="display:inline-block; margin-left:6px; opacity:0.85;">(~${perMeal.toLocaleString("fr-FR")} ${currency} / repas pour ${household} pers.)</span>
                `;
            }
            if (previewEl) {
                previewEl.style.display = "block";
            }
        } else {
            if (previewEl) {
                previewEl.style.display = "none";
            }
        }
    }

    function toggleOtherCondition() {
        const cb = document.getElementById("cond-autre-cb");
        const group = document.getElementById("cond-autre-group");
        if (cb && group) {
            group.style.display = cb.checked ? "block" : "none";
        }
    }

    function initProfileDynamicListeners() {
        ["prof-budget-amount", "prof-budget-period", "prof-budget-custom-days", "prof-household", "prof-budget-currency"].forEach(id => {
            const el = document.getElementById(id);
            if (el && !el._budgetBound) {
                el.addEventListener("input", updateBudgetCalculation);
                el.addEventListener("change", updateBudgetCalculation);
                el._budgetBound = true;
            }
        });
        const otherCb = document.getElementById("cond-autre-cb");
        if (otherCb && !otherCb._bound) {
            otherCb.addEventListener("change", toggleOtherCondition);
            otherCb._bound = true;
        }
    }

    // ============================================================
    // FORMULAIRE PROFIL — Chargement & Sauvegarde
    // ============================================================
    function loadProfileForm() {
        initProfileDynamicListeners();

        const profile = NutriProfile.getProfile();
        if (!profile) {
            updateBudgetCalculation();
            return;
        }

        // Remplir les champs
        setValue("prof-age", profile.age);
        setValue("prof-weight", profile.weight);
        setValue("prof-height", profile.height);
        setValue("prof-gender", profile.gender);
        setValue("prof-activity", profile.activityLevel);
        setValue("prof-budget-amount", profile.budgetAmountFCFA || "");

        // Période du budget
        let periodVal = "7";
        if (profile.budgetPeriod === "custom") {
            periodVal = "custom";
        } else if (profile.budgetPeriod === "15") {
            periodVal = "15";
        } else if (profile.budgetPeriod === "30" || profile.budgetPeriod === "mensuel") {
            periodVal = "30";
        } else if (profile.budgetPeriod === "journalier" || profile.budgetPeriod === "1") {
            periodVal = "custom";
        } else {
            periodVal = "7";
        }
        setValue("prof-budget-period", periodVal);

        if (periodVal === "custom") {
            setValue("prof-budget-custom-days", profile.budgetDays || profile.customDays || (profile.budgetPeriod === "journalier" ? 1 : ""));
        }
        setValue("prof-budget-currency", profile.budgetCurrency || "FCFA");
        setValue("prof-household", profile.householdSize || 1);

        // Objectif (radio)
        const goal = profile.goal || "maintien";
        const goalRadio = document.querySelector(`input[name="prof-goal"][value="${goal}"]`);
        if (goalRadio) goalRadio.checked = true;

        // Conditions médicales
        const conds = Array.isArray(profile.specialConditions) ? profile.specialConditions : [];
        document.querySelectorAll('input[name="conditions"]').forEach(cb => {
            cb.checked = conds.includes(cb.value);
        });

        // Autre condition
        const hasOtherCond = conds.includes("autre") || Boolean(profile.otherCondition);
        const condAutreCb = document.getElementById("cond-autre-cb");
        if (condAutreCb) condAutreCb.checked = hasOtherCond;
        setValue("prof-other-condition", profile.otherCondition || "");
        toggleOtherCondition();

        // Exclusions alimentaires
        document.querySelectorAll('input[name="exclusions"]').forEach(cb => {
            cb.checked = Array.isArray(profile.exclusions) &&
                profile.exclusions.includes(cb.value);
        });

        // Autres aliments que je ne mange pas (case de texte libre)
        setValue("prof-custom-exclusions", profile.customExclusions || "");

        // Recalculer le budget affiché en temps réel
        updateBudgetCalculation();
    }

    function handleSaveProfile(e) {
        e.preventDefault();
        const btn = document.getElementById("profile-save-btn");
        const errEl = document.getElementById("profile-form-errors");
        errEl.style.display = "none";

        // Collecte des données
        const goalEl = document.querySelector('input[name="prof-goal"]:checked');
        const conditions = [...document.querySelectorAll('input[name="conditions"]:checked')].map(cb => cb.value);
        const exclusions = [...document.querySelectorAll('input[name="exclusions"]:checked')].map(cb => cb.value);
        const customExclusions = document.getElementById("prof-custom-exclusions") ? document.getElementById("prof-custom-exclusions").value.trim() : "";
        const otherCondition = document.getElementById("prof-other-condition") ? document.getElementById("prof-other-condition").value.trim() : "";
        const budgetPeriod = document.getElementById("prof-budget-period").value;
        const customDays = parseInt(document.getElementById("prof-budget-custom-days")?.value) || 0;
        const budgetCurrency = document.getElementById("prof-budget-currency") ? document.getElementById("prof-budget-currency").value : "FCFA";
        const budgetAmount = parseFloat(document.getElementById("prof-budget-amount").value) || 0;

        let budgetDays = 7;
        if (budgetPeriod === "custom") {
            budgetDays = customDays;
        } else {
            budgetDays = parseInt(budgetPeriod) || 7;
        }

        // Validation période personnalisée
        if (budgetAmount > 0 && budgetPeriod === "custom" && (!customDays || customDays < 1)) {
            errEl.textContent = "Veuillez préciser le nombre exact de jours (au moins 1) pour votre période personnalisée.";
            errEl.style.display = "block";
            errEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
            return;
        }

        const profileData = {
            age: parseInt(document.getElementById("prof-age").value),
            weight: parseFloat(document.getElementById("prof-weight").value),
            height: parseInt(document.getElementById("prof-height").value),
            gender: document.getElementById("prof-gender").value,
            goal: goalEl ? goalEl.value : "maintien",
            activityLevel: document.getElementById("prof-activity").value,
            budgetAmountFCFA: budgetAmount,
            budgetPeriod: budgetPeriod,
            budgetDays: budgetDays,
            budgetCurrency: budgetCurrency,
            householdSize: parseInt(document.getElementById("prof-household").value) || 1,
            specialConditions: conditions,
            otherCondition: otherCondition,
            exclusions: exclusions,
            customExclusions: customExclusions
        };

        // Validation de l'activité
        if (!profileData.activityLevel) {
            errEl.textContent = "Veuillez sélectionner votre niveau d'activité physique.";
            errEl.style.display = "block";
            return;
        }

        btn.innerHTML = '<span class="spinner"></span> Calcul en cours…';
        btn.classList.add("loading");

        setTimeout(() => {
            try {
                NutriProfile.saveProfile(profileData);
                btn.innerHTML = "💾 Enregistrer mon profil";
                btn.classList.remove("loading");
                showToast("✅ Profil enregistré ! Votre bilan a été mis à jour.", "success");
                showTab("dashboard");
            } catch (err) {
                btn.innerHTML = "💾 Enregistrer mon profil";
                btn.classList.remove("loading");
                errEl.textContent = err.message;
                errEl.style.display = "block";
                errEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        }, 300);
    }

    // ============================================================
    // RECETTES & GÉNÉRATEUR IA (Étape 4)
    // ============================================================
    let selectedPantryIngredients = new Set(["yaboye-sardinelle", "riz-brise-ordinaire", "oignon-jaune", "huile-arachide"]);
    let activeRecipeCategory = "all";
    let ingredientSearchQuery = "";
    let activeServings = 2;
    let currentModalRecipe = null;
    let originalModalRecipe = null;
    let activeAdaptationType = null;
    let activeSubstitutionTarget = null;
    let cachedFilteredRecipes = [];

    // ============================================================
    // ÉTAT — Planificateur Hebdo & Liste de Courses (Étape 6)
    // ============================================================
    let currentWeeklyPlan = null;
    let activeShoppingPeriod = "all";
    let activePlannerDayFilter = "all";
    let plannerServings = 2;
    let shoppingChecklist = {};

    function loadRecipesTab() {
        // Initialiser les portions selon le profil si disponible
        const profile = NutriProfile.getProfile();
        if (profile && profile.householdSize) {
            setRecipeServings(profile.householdSize, false);
        }

        renderCategoryPills();
        renderIngredientCards();
        updatePantryCounter();
        filterRecipes();
    }

    function renderCategoryPills() {
        const container = document.getElementById("recipe-categories-filter");
        if (!container || !window.NutriData) return;

        const categories = window.NutriData.INGREDIENT_CATEGORIES || [];
        container.innerHTML = categories.map(cat => `
            <button type="button" class="category-chip ${cat.id === activeRecipeCategory ? "active" : ""}" onclick="App.setRecipeCategory('${cat.id}')">
                ${cat.label}
            </button>
        `).join("");
    }

    function setRecipeCategory(catId) {
        activeRecipeCategory = catId;
        renderCategoryPills();
        renderIngredientCards();
    }

    function handleIngredientSearch(query) {
        ingredientSearchQuery = (query || "").trim().toLowerCase();
        renderIngredientCards();
    }

    function renderIngredientCards() {
        const grid = document.getElementById("recipe-ingredients-grid");
        if (!grid || !window.NutriData) return;

        let list = window.NutriData.SEN_INGREDIENTS || [];

        // Filtre catégorie
        if (activeRecipeCategory !== "all") {
            list = list.filter(ing => ing.category === activeRecipeCategory);
        }

        // Filtre recherche textuelle
        if (ingredientSearchQuery) {
            list = list.filter(ing =>
                ing.name.toLowerCase().includes(ingredientSearchQuery) ||
                (ing.description && ing.description.toLowerCase().includes(ingredientSearchQuery)) ||
                (ing.tags && ing.tags.some(t => t.toLowerCase().includes(ingredientSearchQuery)))
            );
        }

        if (list.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:30px; color:var(--text-light); font-size:0.9rem;">
                    Aucun ingrédient ne correspond à votre recherche.
                </div>
            `;
            return;
        }

        grid.innerHTML = list.map(ing => {
            const isSelected = selectedPantryIngredients.has(ing.id);
            const priceLabel = ing.priceUnit === "piece" 
                ? (ing.pricePerPiece || 100) + " FCFA / pièce"
                : ing.defaultPricePerKg + " FCFA / kg";

            return `
                <div class="ingredient-card-item ${isSelected ? "selected" : ""}" onclick="App.togglePantryIngredient('${ing.id}')">
                    <div class="ing-card-top">
                        <span style="font-size:1.2rem;">${getCategoryEmoji(ing.category)}</span>
                        <div class="ing-check-icon">✓</div>
                    </div>
                    <div class="ing-card-name">${escapeHtml(ing.name)}</div>
                    <div class="ing-card-meta">
                        <span>${escapeHtml(ing.categoryLabel || "")}</span>
                        <span style="font-weight:700; color:var(--primary-dark);">${priceLabel}</span>
                    </div>
                </div>
            `;
        }).join("");
    }

    function getCategoryEmoji(cat) {
        const map = {
            cereales_feculents: "🌾",
            legumineuses: "🥜",
            poissons_viandes_oeufs: "🐟",
            legumes: "🥬",
            fruits: "🥭",
            boissons_infusions: "🫖",
            huiles_condiments: "🌿",
            produits_laitiers: "🥛"
        };
        return map[cat] || "🌱";
    }

    function togglePantryIngredient(ingId) {
        if (selectedPantryIngredients.has(ingId)) {
            selectedPantryIngredients.delete(ingId);
        } else {
            selectedPantryIngredients.add(ingId);
        }
        renderIngredientCards();
        updatePantryCounter();
        filterRecipes();
    }

    function clearPantrySelection() {
        selectedPantryIngredients.clear();
        renderIngredientCards();
        updatePantryCounter();
        filterRecipes();
        showToast("Placard vidé.", "info");
    }

    function selectAllPantry() {
        if (!window.NutriData) return;
        (window.NutriData.SEN_INGREDIENTS || []).forEach(i => selectedPantryIngredients.add(i.id));
        renderIngredientCards();
        updatePantryCounter();
        filterRecipes();
        showToast("Tous les ingrédients locaux ont été sélectionnés !", "success");
    }

    function applyPantryPreset(presetKey) {
        if (!window.NutriRecipes) return;
        const presets = window.NutriRecipes.getPresets();
        const p = presets[presetKey];
        if (p && Array.isArray(p.ingredients)) {
            selectedPantryIngredients = new Set(p.ingredients);
            renderIngredientCards();
            updatePantryCounter();
            filterRecipes();
            showToast(`${p.icon} Panier "${p.label}" appliqué !`, "success");
        }
    }

    function updatePantryCounter() {
        const badge = document.getElementById("pantry-counter-badge");
        if (badge) {
            badge.innerHTML = `<span>${selectedPantryIngredients.size}</span> ingrédient(s) sélectionné(s) au placard`;
        }
    }

    function setRecipeServings(servings, triggerFilter = true) {
        activeServings = Number(servings) || 2;
        [1, 2, 4, 6].forEach(s => {
            const btn = document.getElementById("serv-btn-" + s);
            if (btn) btn.classList.toggle("active", s === activeServings);
        });
        if (triggerFilter) {
            filterRecipes();
        }
    }

    function filterRecipes() {
        if (!window.NutriRecipes) return;

        const mealType = document.getElementById("filter-meal-type") ? document.getElementById("filter-meal-type").value : "all";
        const cuisine = document.getElementById("filter-cuisine-origin") ? document.getElementById("filter-cuisine-origin").value : "all";
        const maxBudget = document.getElementById("filter-max-budget") ? document.getElementById("filter-max-budget").value : "";

        // Récupérer les exclusions du profil utilisateur connecté
        const profile = NutriProfile.getProfile();
        let exclusions = (profile && Array.isArray(profile.exclusions)) ? [...profile.exclusions] : [];
        if (profile && profile.customExclusions) {
            const extra = profile.customExclusions.split(/[,;\n]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
            exclusions = Array.from(new Set([...exclusions, ...extra]));
        }

        const pantryArray = Array.from(selectedPantryIngredients);

        cachedFilteredRecipes = window.NutriRecipes.matchRecipesWithIngredients(pantryArray, {
            mealType,
            cuisine,
            maxBudget: maxBudget ? Number(maxBudget) : null,
            servings: activeServings,
            userExclusions: exclusions
        });

        renderRecipeCards(cachedFilteredRecipes);
    }

    function renderRecipeCards(recipes) {
        const container = document.getElementById("recipes-results-container");
        const countHeader = document.getElementById("recipes-results-count");
        if (!container) return;

        if (countHeader) {
            countHeader.textContent = `🍲 Recettes adaptées (${recipes.length})`;
        }

        if (recipes.length === 0) {
            container.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:48px 24px; background:var(--white); border-radius:var(--radius-md); border:1px dashed var(--border);">
                    <div style="font-size:2.4rem; margin-bottom:12px;">🥗</div>
                    <h4 style="font-size:1.1rem; color:var(--secondary); margin-bottom:6px;">Aucune recette ne correspond à ces critères</h4>
                    <p style="font-size:0.88rem; color:var(--text-light); max-width:460px; margin:0 auto 16px;">
                        Essayez d'élargir le type de repas ou de sélectionner davantage d'ingrédients au placard.
                    </p>
                    <button type="button" class="btn btn-secondary" onclick="App.generateCreativeRecipeModal()">
                        ✨ Créer un plat sur-mesure avec mon placard
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = recipes.map(recipe => {
            const nut = recipe.nutrition || { total: {}, perServing: {}, macroDistribution: {} };
            const isFav = recipe.isFavorite || NutriRecipes.isFavorite(recipe.id);

            // Badge de correspondance
            let matchBadgeHtml = "";
            if (recipe.matchScore === 100) {
                matchBadgeHtml = `<span class="recipe-match-pill match-100">✨ 100% au placard</span>`;
            } else if (recipe.matchScore >= 60) {
                matchBadgeHtml = `<span class="recipe-match-pill match-high">🛒 ${recipe.matchScore}% dispo (manque ${recipe.missingCount})</span>`;
            } else if (recipe.matchScore > 0) {
                matchBadgeHtml = `<span class="recipe-match-pill match-med">🧺 ${recipe.matchScore}% au placard</span>`;
            } else {
                matchBadgeHtml = `<span class="recipe-match-pill" style="background:#F1F5F9; color:#64748B;">À acheter au marché</span>`;
            }

            let cuisineBadge = "";
            if (recipe.cuisine === "asiatique") cuisineBadge = `<span style="background:#FEF3C7; color:#92400E; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:10px;">🥢 Asiatique</span>`;
            else if (recipe.cuisine === "europeenne") cuisineBadge = `<span style="background:#E0E7FF; color:#3730A3; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:10px;">🥖 Européenne</span>`;
            else if (recipe.cuisine === "americaine") cuisineBadge = `<span style="background:#FCE7F3; color:#9D174D; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:10px;">🥑 Américaine</span>`;
            else if (recipe.cuisine === "moyen_orient") cuisineBadge = `<span style="background:#FEF08A; color:#854D0E; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:10px;">🧆 Moyen-Orient</span>`;
            else if (recipe.cuisine === "africaine") cuisineBadge = `<span style="background:#DCFCE7; color:#166534; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:10px;">🌍 Africaine</span>`;

            const mealLabels = {
                dejeuner: "Déjeuner",
                diner: "Dîner",
                petit_dejeuner: "Petit-déjeuner",
                collation: "Collation / Dessert",
                boisson: "Thé / Boisson"
            };

            return `
                <div class="recipe-card">
                    <div class="recipe-card-header">
                        <div class="recipe-badge-row">
                            ${matchBadgeHtml}
                            <button type="button" class="recipe-fav-btn" onclick="App.toggleCardFavorite('${recipe.id}', event)" title="Ajouter aux favoris">
                                ${isFav ? "⭐" : "☆"}
                            </button>
                        </div>
                        <div class="recipe-title">
                            <span>${recipe.imageEmoji || "🍲"}</span>
                            <span>${escapeHtml(recipe.title)}</span>
                        </div>
                        <div class="recipe-meta-sub">
                            ${cuisineBadge}
                            <span>${mealLabels[recipe.mealType] || "Repas"}</span>
                            <span>⏱️ ${recipe.prepTimeMinutes + recipe.cookingTimeMinutes} min</span>
                            <span>👥 ${recipe.activeServings} pers</span>
                        </div>
                    </div>

                    <div class="recipe-card-body">
                        <p class="recipe-desc-text">${escapeHtml(recipe.description || "")}</p>

                        <!-- Stats calculées par NutriCalculator -->
                        <div class="recipe-card-stats">
                            <div class="recipe-stat-cell">
                                <div class="recipe-stat-val">${nut.perServing?.calories || 0}</div>
                                <div class="recipe-stat-lbl">kcal / pers</div>
                            </div>
                            <div class="recipe-stat-cell">
                                <div class="recipe-stat-val" style="color:#27AE60;">${nut.perServing?.proteins || 0}g</div>
                                <div class="recipe-stat-lbl">Protéines</div>
                            </div>
                            <div class="recipe-stat-cell">
                                <div class="recipe-stat-val" style="color:#2563EB;">${nut.perServing?.carbs || 0}g</div>
                                <div class="recipe-stat-lbl">Glucides</div>
                            </div>
                        </div>

                        <!-- État placard -->
                        <div class="pantry-status-info">
                            ${recipe.missingCount > 0 
                                ? `<span style="color:#991B1B; font-weight:600;">+ ${recipe.missingCostFCFA} FCFA à acheter (${recipe.missingCount} ingrédient(s))</span>` 
                                : `<span style="color:#15803D; font-weight:700;">✅ Tous les ingrédients sont déjà prêts chez vous !</span>`}
                        </div>
                    </div>

                    <div class="recipe-card-footer">
                        <div>
                            <div class="recipe-cost-label">Coût estimé (total)</div>
                            <div class="recipe-cost-amount">${(nut.total?.costFCFA || 0).toLocaleString("fr-FR")} FCFA</div>
                        </div>
                        <button type="button" class="btn btn-primary" onclick="App.openRecipeModal('${recipe.id}')" style="padding:8px 16px; font-size:0.85rem;">
                            Voir la recette →
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    function toggleCardFavorite(recipeId, event) {
        if (event) event.stopPropagation();
        if (!window.NutriRecipes) return;
        const isNowFav = window.NutriRecipes.toggleFavorite(recipeId);
        filterRecipes();
        showToast(isNowFav ? "Recette ajoutée à vos favoris ! ⭐" : "Recette retirée des favoris.", "info");
    }

    function openRecipeModal(recipeId) {
        if (!window.NutriRecipes) return;
        currentModalRecipe = window.NutriRecipes.getRecipeById(recipeId, activeServings);
        if (!currentModalRecipe) {
            // Chercher dans les recettes créatives en cache
            currentModalRecipe = cachedFilteredRecipes.find(r => r.id === recipeId);
        }
        if (!currentModalRecipe) return;

        // Conserver une copie originale immuable pour le comparateur Avant / Après
        originalModalRecipe = JSON.parse(JSON.stringify(currentModalRecipe));
        activeAdaptationType = null;
        activeSubstitutionTarget = null;

        renderRecipeModalContent(currentModalRecipe);
        const modal = document.getElementById("recipe-detail-modal");
        if (modal) modal.classList.add("show");
    }

    function closeRecipeModal(event) {
        if (event && event.target !== event.currentTarget) return;
        const modal = document.getElementById("recipe-detail-modal");
        if (modal) modal.classList.remove("show");
        activeSubstitutionTarget = null;
    }

    function changeModalServings(newServings) {
        if (!currentModalRecipe || !window.NutriRecipes) return;
        if (originalModalRecipe) {
            originalModalRecipe = window.NutriRecipes.enrichRecipeWithNutrition(originalModalRecipe, newServings);
        }
        currentModalRecipe = window.NutriRecipes.enrichRecipeWithNutrition(currentModalRecipe, newServings);
        renderRecipeModalContent(currentModalRecipe);
    }

    // ============================================================
    // GESTIONNAIRES D'ADAPTATION DYNAMIQUE (Étape 5)
    // ============================================================
    function applyRecipeAdaptation(type) {
        if (!currentModalRecipe || !window.NutriAdaptation) return;

        // Base de calcul : toujours à partir de la recette d'origine pour éviter les dérives
        const base = originalModalRecipe || currentModalRecipe;
        const servings = currentModalRecipe.activeServings || 2;

        try {
            let adapted = null;
            if (type === "plus_proteines") {
                adapted = window.NutriAdaptation.adaptMoreProteins(base, servings);
                showToast("💪 Version enrichie en protéines appliquée !", "success");
            } else if (type === "moins_cher") {
                adapted = window.NutriAdaptation.adaptLowerCost(base, servings);
                showToast("💰 Version économique anti-inflation appliquée !", "success");
            } else if (type === "legere_lipides") {
                adapted = window.NutriAdaptation.adaptHealthyLight(base, servings);
                showToast("🌿 Version allégée en huile appliquée !", "success");
            } else if (type === "cible_calorique") {
                const profile = NutriProfile.getProfile();
                let targetKcal = 600;
                if (profile && profile.calculated && profile.calculated.targetCalories) {
                    // Estimation portion selon repas : ~35% du total quotidien pour déjeuner/dîner
                    const factor = base.mealType === "petit_dejeuner" ? 0.25 : base.mealType === "collation" ? 0.15 : 0.35;
                    targetKcal = Math.round(profile.calculated.targetCalories * factor);
                }
                adapted = window.NutriAdaptation.scaleToTargetCalories(base, targetKcal, servings);
                showToast(`🎯 Portions calibrées sur votre cible (${targetKcal} kcal/repas) !`, "success");
            }

            if (adapted) {
                activeAdaptationType = type;
                currentModalRecipe = adapted;
                renderRecipeModalContent(currentModalRecipe);
            }
        } catch (err) {
            showToast("Erreur lors de l'adaptation : " + err.message, "error");
        }
    }

    function resetRecipeAdaptation() {
        if (!originalModalRecipe) return;
        currentModalRecipe = JSON.parse(JSON.stringify(originalModalRecipe));
        activeAdaptationType = null;
        activeSubstitutionTarget = null;
        renderRecipeModalContent(currentModalRecipe);
        showToast("↩️ Recette restaurée à sa version d'origine.", "info");
    }

    function toggleIngredientSubstitution(ingredientId) {
        if (activeSubstitutionTarget === ingredientId) {
            activeSubstitutionTarget = null;
        } else {
            activeSubstitutionTarget = ingredientId;
        }
        renderRecipeModalContent(currentModalRecipe);
    }

    function applyIngredientSubstitution(targetId, replacementId) {
        if (!currentModalRecipe || !window.NutriAdaptation) return;
        try {
            const adapted = window.NutriAdaptation.substituteIngredient(
                currentModalRecipe,
                targetId,
                replacementId,
                currentModalRecipe.activeServings
            );
            currentModalRecipe = adapted;
            activeAdaptationType = "substitution";
            activeSubstitutionTarget = null;
            renderRecipeModalContent(currentModalRecipe);
            showToast(`🔄 Ingrédient substitué avec succès !`, "success");
        } catch (err) {
            showToast("Impossible de substituer : " + err.message, "error");
        }
    }

    // ============================================================
    // PLANIFICATEUR DE MENUS HEBDOMADAIRE (Étape 6)
    // ============================================================

    function loadPlannerTab() {
        if (!window.NutriPlanner) return;
        // Charger un plan sauvegardé ou créer un plan vide
        const saved = window.NutriPlanner.loadWeeklyPlan();
        if (saved && saved.days) {
            currentWeeklyPlan = saved;
            plannerServings = saved.servings || 2;
        } else {
            currentWeeklyPlan = window.NutriPlanner.createEmptyWeeklyPlan(plannerServings);
        }
        // Synchroniser les boutons convives
        [1, 2, 4, 6].forEach(s => {
            const btn = document.getElementById("planner-serv-" + s);
            if (btn) btn.classList.toggle("active", s === plannerServings);
        });
        renderPlannerGrid(currentWeeklyPlan, activePlannerDayFilter);
        updatePlannerKPIs(currentWeeklyPlan);
    }

    function generateWeeklyPlan() {
        if (!window.NutriPlanner) { showToast("Service planificateur non disponible", "error"); return; }
        const profile = NutriProfile.getProfile();
        let exclusions = (profile && Array.isArray(profile.exclusions)) ? [...profile.exclusions] : [];
        if (profile && profile.customExclusions) {
            const extra = profile.customExclusions.split(/[,;\n]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
            exclusions = Array.from(new Set([...exclusions, ...extra]));
        }
        const targetCalories = (profile && profile.calculated) ? profile.calculated.targetCalories : 2000;
        showToast("⚡ Génération de votre menu de la semaine...", "info");
        try {
            currentWeeklyPlan = window.NutriPlanner.generateSmartWeeklyPlan({
                servings: plannerServings,
                exclusions,
                targetCalories
            });
            window.NutriPlanner.saveWeeklyPlan(currentWeeklyPlan);
            renderPlannerGrid(currentWeeklyPlan, activePlannerDayFilter);
            updatePlannerKPIs(currentWeeklyPlan);
            showToast("✅ Plan de la semaine généré avec succès !", "success");
        } catch (err) {
            showToast("Erreur lors de la génération : " + err.message, "error");
        }
    }

    function resetWeeklyPlan() {
        if (!window.NutriPlanner) return;
        currentWeeklyPlan = window.NutriPlanner.createEmptyWeeklyPlan(plannerServings);
        window.NutriPlanner.saveWeeklyPlan(currentWeeklyPlan);
        renderPlannerGrid(currentWeeklyPlan, activePlannerDayFilter);
        updatePlannerKPIs(currentWeeklyPlan);
        showToast("🔄 Plan réinitialisé.", "info");
    }

    function changePlannerServings(n) {
        plannerServings = Number(n) || 2;
        [1, 2, 4, 6].forEach(s => {
            const btn = document.getElementById("planner-serv-" + s);
            if (btn) btn.classList.toggle("active", s === plannerServings);
        });
        // Regénérer si un plan existe
        if (currentWeeklyPlan && currentWeeklyPlan.summary && currentWeeklyPlan.summary.filledSlotsCount > 0) {
            generateWeeklyPlan();
        } else {
            if (currentWeeklyPlan) { currentWeeklyPlan.servings = plannerServings; }
        }
    }

    function filterPlannerDay(dayKey) {
        activePlannerDayFilter = dayKey;
        // Mettre à jour les boutons de filtre
        document.querySelectorAll(".planner-day-tab-btn").forEach(btn => {
            btn.classList.remove("active");
        });
        const activeBtn = document.getElementById("day-tab-" + dayKey);
        if (activeBtn) activeBtn.classList.add("active");
        renderPlannerGrid(currentWeeklyPlan, dayKey);
    }

    function renderPlannerGrid(plan, dayFilter) {
        const container = document.getElementById("planner-week-container");
        if (!container) return;
        if (!plan || !plan.days) {
            container.innerHTML = `<div style="text-align:center;padding:48px;color:var(--text-light)">Aucun plan disponible. Cliquez sur "Générer ma semaine".</div>`;
            return;
        }

        const days = window.NutriPlanner ? window.NutriPlanner.DAYS_ORDER : [];
        const slots = window.NutriPlanner ? window.NutriPlanner.MEAL_SLOTS : [];
        const filteredDays = (dayFilter && dayFilter !== "all") ? days.filter(d => d.key === dayFilter) : days;

        const slotLabels = { petit_dejeuner: "☀️ Petit-déj", dejeuner: "🍲 Déjeuner", collation: "🥭 Collation", diner: "🌙 Dîner" };

        container.innerHTML = filteredDays.map(day => {
            const dayData = plan.days[day.key];
            const dayTotals = dayData && dayData.totals ? dayData.totals : { calories: 0, costFCFA: 0 };

            const slotsHtml = slots.map(slot => {
                const meal = dayData && dayData.meals ? dayData.meals[slot.key] : null;
                if (meal && meal.recipeId) {
                    const nut = meal.nutrition || { perServing: {}, total: {} };
                    const ps = nut.perServing || {};
                    const tot = nut.total || {};
                    return `<div class="planner-slot-card filled">
                        <div class="slot-meal-type">${slotLabels[slot.key] || slot.label}</div>
                        <div class="slot-recipe-title">${escapeHtml(meal.imageEmoji || "🍲")} ${escapeHtml(meal.title)}</div>
                        <div class="slot-recipe-meta">
                            <span>🔥 ${Math.round(ps.calories || 0)} kcal</span>
                            <span>💰 ${Math.round(tot.costFCFA || 0)} FCFA</span>
                        </div>
                        <button type="button" class="slot-remove-btn" onclick="App.removeMealFromSlot('${day.key}', '${slot.key}')" title="Retirer">✕</button>
                    </div>`;
                } else {
                    return `<div class="planner-slot-card empty" onclick="App.openMealSelectorModal('${day.key}', '${slot.key}')">
                        <div class="slot-meal-type">${slotLabels[slot.key] || slot.label}</div>
                        <div class="slot-empty-hint">+ Ajouter un repas</div>
                    </div>`;
                }
            }).join("");

            return `<div class="planner-day-column">
                <div class="planner-day-header">
                    <span class="day-name">${day.label}</span>
                    <span class="day-summary">${dayTotals.calories > 0 ? dayTotals.calories + " kcal · " + dayTotals.costFCFA.toLocaleString("fr-FR") + " FCFA" : "Vide"}</span>
                </div>
                ${slotsHtml}
            </div>`;
        }).join("");
    }

    function updatePlannerKPIs(plan) {
        if (!plan || !plan.summary) {
            setText("planner-kpi-cal", "0 kcal/j");
            setText("planner-kpi-cost", "0 FCFA");
            setText("planner-kpi-cost-pers", "0 FCFA");
            setText("planner-kpi-completion", "0%");
            setText("planner-kpi-slots", "0 / 28 repas planifiés");
            return;
        }
        const s = plan.summary;
        setText("planner-kpi-cal", (s.avgCaloriesPerDay || 0).toLocaleString("fr-FR") + " kcal/j");
        setText("planner-kpi-cost", (s.weeklyCostFCFA || 0).toLocaleString("fr-FR") + " FCFA");
        setText("planner-kpi-cost-pers", (s.costPerPersonPerDayFCFA || 0).toLocaleString("fr-FR") + " FCFA");
        setText("planner-kpi-completion", (s.completionPercent || 0) + "%");
        setText("planner-kpi-slots", (s.filledSlotsCount || 0) + " / 28 repas planifiés");
    }

    function openMealSelectorModal(dayKey, slotKey) {
        if (!window.NutriRecipes) return;
        const slotLabels = { petit_dejeuner: "Petit-déjeuner", dejeuner: "Déjeuner", collation: "Collation", diner: "Dîner" };
        const catalog = window.NutriRecipes.getCatalog();
        // Filtrer les recettes compatibles avec le slot
        const compat = catalog.filter(r => {
            if (slotKey === "diner") return r.mealType === "diner" || r.mealType === "dejeuner";
            if (slotKey === "collation") return r.mealType === "collation" || r.mealType === "boisson";
            if (slotKey === "petit_dejeuner") return r.mealType === "petit_dejeuner" || r.mealType === "boisson";
            return r.mealType === slotKey;
        });

        // Créer une modale légère
        const existing = document.getElementById("meal-selector-modal");
        if (existing) existing.remove();

        const modal = document.createElement("div");
        modal.id = "meal-selector-modal";
        modal.className = "recipe-modal-backdrop";
        modal.style.cssText = "display:flex;z-index:9999;";
        modal.innerHTML = `
            <div class="recipe-modal-dialog" style="max-width:640px;max-height:80vh;overflow-y:auto;" onclick="event.stopPropagation()">
                <div class="recipe-modal-header" style="padding:20px 24px;">
                    <div>
                        <div style="font-size:0.85rem;font-weight:700;color:var(--primary-dark);margin-bottom:4px;">CHOISIR UN REPAS</div>
                        <h3 style="font-size:1.2rem;font-weight:800;color:var(--secondary);">📅 ${escapeHtml(slotLabels[slotKey] || slotKey)}</h3>
                    </div>
                    <button type="button" class="modal-close-btn" onclick="document.getElementById('meal-selector-modal').remove()">✕</button>
                </div>
                <div style="padding:16px 24px 24px;">
                    <div class="meal-selector-grid">
                        ${compat.map(r => `
                            <div class="meal-selector-card" onclick="App.selectMealForSlot('${dayKey}','${slotKey}','${r.id}')">
                                <span style="font-size:2rem;">${r.imageEmoji || "🍲"}</span>
                                <div>
                                    <div style="font-size:0.88rem;font-weight:700;color:var(--secondary);">${escapeHtml(r.title)}</div>
                                    <div style="font-size:0.78rem;color:var(--text-light);margin-top:2px;">⏱️ ${(r.prepTimeMinutes || 0) + (r.cookingTimeMinutes || 0)} min</div>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>`;
        modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
    }

    function selectMealForSlot(dayKey, slotKey, recipeId) {
        if (!window.NutriPlanner || !currentWeeklyPlan) return;
        currentWeeklyPlan = window.NutriPlanner.setMealSlot(currentWeeklyPlan, dayKey, slotKey, recipeId);
        window.NutriPlanner.saveWeeklyPlan(currentWeeklyPlan);
        const modal = document.getElementById("meal-selector-modal");
        if (modal) modal.remove();
        renderPlannerGrid(currentWeeklyPlan, activePlannerDayFilter);
        updatePlannerKPIs(currentWeeklyPlan);
        showToast("✅ Repas ajouté au planning !", "success");
    }

    function removeMealFromSlot(dayKey, slotKey) {
        if (!window.NutriPlanner || !currentWeeklyPlan) return;
        currentWeeklyPlan = window.NutriPlanner.removeMealSlot(currentWeeklyPlan, dayKey, slotKey);
        window.NutriPlanner.saveWeeklyPlan(currentWeeklyPlan);
        renderPlannerGrid(currentWeeklyPlan, activePlannerDayFilter);
        updatePlannerKPIs(currentWeeklyPlan);
        showToast("🗑️ Repas retiré du planning.", "info");
    }

    // ============================================================
    // LISTE DE COURSES AUTOMATIQUE (Étape 6)
    // ============================================================

    function loadShoppingTab() {
        if (!window.NutriPlanner) return;
        // Charger la checklist sauvegardée
        shoppingChecklist = window.NutriPlanner.loadShoppingChecklist() || {};
        // Récupérer le plan actuel (ou le charger)
        if (!currentWeeklyPlan || !currentWeeklyPlan.days) {
            const saved = window.NutriPlanner.loadWeeklyPlan();
            if (saved) { currentWeeklyPlan = saved; }
        }
        refreshShoppingList();
    }

    function refreshShoppingList() {
        if (!window.NutriPlanner) return;
        if (!currentWeeklyPlan || !currentWeeklyPlan.days) {
            const container = document.getElementById("shopping-stalls-container");
            if (container) container.innerHTML = `<div style="text-align:center;padding:48px;color:var(--text-light);grid-column:1/-1;">Aucun plan de menus disponible. Générez d'abord votre semaine dans le Planificateur.</div>`;
            return;
        }
        try {
            const pantry = Array.from(selectedPantryIngredients);
            const shopList = window.NutriPlanner.generateShoppingList(currentWeeklyPlan, {
                pantryIngredients: pantry,
                period: activeShoppingPeriod
            });
            updateShoppingHeroStats(shopList.totals || {});
            renderShoppingStalls(shopList);
        } catch (err) {
            showToast("Erreur liste de courses : " + err.message, "error");
        }
    }

    function filterShoppingPeriod(period) {
        activeShoppingPeriod = period;
        ["all", "first3", "weekend"].forEach(p => {
            const btn = document.getElementById("shop-filter-" + p);
            if (btn) btn.classList.toggle("active", p === period);
        });
        refreshShoppingList();
    }

    function updateShoppingHeroStats(totals) {
        setText("shopping-stat-net", (totals.netCostFCFA || totals.totalCostFCFA || 0).toLocaleString("fr-FR") + " FCFA");
        const saved = totals.savedFCFA || 0;
        setText("shopping-stat-saved", (saved > 0 ? "-" : "") + saved.toLocaleString("fr-FR") + " FCFA");
        setText("shopping-stat-gross", (totals.grossCostFCFA || totals.totalCostFCFA || 0).toLocaleString("fr-FR") + " FCFA");
        const totalItems = totals.totalItems || totals.itemCount || 0;
        const toByItems = totals.itemsToBuy || totalItems;
        setText("shopping-stat-items", totalItems + " articles");
        setText("shopping-stat-items-sub", toByItems + " à acheter");
    }

    function renderShoppingStalls(shopList) {
        const container = document.getElementById("shopping-stalls-container");
        if (!container || !window.NutriPlanner) return;

        const stalls = window.NutriPlanner.MARKET_STALLS;
        const stallItems = shopList.byStall || shopList.stalls || {};

        const stallKeys = Object.keys(stalls);
        if (stallKeys.length === 0 || Object.keys(stallItems).length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:48px;color:var(--text-light);grid-column:1/-1;">La liste de courses est vide. Générez un plan de menus d'abord.</div>`;
            return;
        }

        container.innerHTML = stallKeys.map(stallKey => {
            const stall = stalls[stallKey];
            const items = stallItems[stallKey] || [];
            if (items.length === 0) return "";

            const stallTotal = items.reduce((sum, it) => sum + (it.needToBuy ? (it.estimatedCostFCFA || it.costFCFA || 0) : 0), 0);

            const itemsHtml = items.map(item => {
                const checked = shoppingChecklist[item.id || item.ingredientId] || false;
                const inPantry = !item.needToBuy;
                return `<div class="shopping-item-row ${checked ? 'checked' : ''} ${inPantry ? 'in-pantry' : ''}">
                    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;flex:1;">
                        <input type="checkbox" ${checked ? 'checked' : ''} ${inPantry ? 'disabled' : ''}
                            onchange="App.toggleShoppingItem('${item.id || item.ingredientId}')"
                            style="width:16px;height:16px;accent-color:var(--primary);">
                        <span style="font-size:0.9rem;font-weight:${inPantry ? '400' : '600'};color:${inPantry ? 'var(--text-light)' : 'var(--secondary)'};text-decoration:${checked ? 'line-through' : 'none'};">
                            ${escapeHtml(item.name || item.ingredientId)}
                        </span>
                        ${inPantry ? '<span style="font-size:0.72rem;background:#D1FAE5;color:#065F46;padding:2px 6px;border-radius:20px;">✓ Au placard</span>' : ''}
                    </label>
                    <div style="text-align:right;">
                        <div style="font-size:0.82rem;color:var(--text-light);">${item.totalQuantityFormatted || (Math.round(item.totalQuantity || 0) + " g")}</div>
                        ${!inPantry ? `<div style="font-size:0.85rem;font-weight:700;color:var(--primary-dark);">${Math.round(item.estimatedCostFCFA || item.costFCFA || 0).toLocaleString('fr-FR')} FCFA</div>` : ''}
                    </div>
                </div>`;
            }).join("");

            return `<div class="stall-card" style="--stall-color:${stall.color || 'var(--primary)'}">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;">
                    <div>
                        <div style="font-size:1rem;font-weight:800;color:var(--secondary);">${stall.title}</div>
                        <div style="font-size:0.78rem;color:var(--text-light);margin-top:2px;">${stall.subtitle}</div>
                    </div>
                    <div style="font-size:0.9rem;font-weight:800;color:var(--primary-dark);background:var(--primary-light);padding:4px 10px;border-radius:20px;white-space:nowrap;">${Math.round(stallTotal).toLocaleString("fr-FR")} FCFA</div>
                </div>
                <div>${itemsHtml}</div>
            </div>`;
        }).join("");
    }

    function toggleShoppingItem(ingredientId) {
        if (!ingredientId || !window.NutriPlanner) return;
        shoppingChecklist[ingredientId] = !shoppingChecklist[ingredientId];
        window.NutriPlanner.saveShoppingChecklist(shoppingChecklist);
        // Re-render pour refléter le changement visuel
        refreshShoppingList();
    }

    function shareShoppingWhatsApp() {
        if (!window.NutriPlanner || !currentWeeklyPlan) {
            showToast("Aucune liste de courses disponible.", "error");
            return;
        }
        try {
            const pantry = Array.from(selectedPantryIngredients);
            const shopList = window.NutriPlanner.generateShoppingList(currentWeeklyPlan, {
                pantryIngredients: pantry,
                period: activeShoppingPeriod
            });
            const text = window.NutriPlanner.formatWhatsAppShoppingList(shopList);
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    showToast("📲 Liste copiée ! Collez-la dans WhatsApp.", "success");
                });
            } else {
                // Fallback
                const ta = document.createElement("textarea");
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                ta.remove();
                showToast("📲 Liste copiée ! Collez-la dans WhatsApp.", "success");
            }
        } catch (err) {
            showToast("Impossible de copier : " + err.message, "error");
        }
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function renderRecipeModalContent(recipe) {
        const nut = recipe.nutrition || { total: {}, perServing: {}, macroDistribution: {}, items: [] };

        document.getElementById("modal-recipe-title").innerHTML = `<span>${recipe.imageEmoji || "🍲"}</span> ${escapeHtml(recipe.title)}`;
        const cuisineNames = {
            asiatique: "Cuisine Asiatique",
            europeenne: "Cuisine Européenne",
            americaine: "Cuisine Américaine",
            moyen_orient: "Cuisine Moyen-Orientale",
            africaine: "Cuisine Africaine"
        };
        const cuisineLabel = cuisineNames[recipe.cuisine] || "Cuisine du Monde";
        document.getElementById("modal-recipe-category").textContent = `${recipe.mealType.toUpperCase()} · ${recipe.difficulty || "Facile"} · ${cuisineLabel.toUpperCase()} · PRIX DU MARCHÉ LOCAL`;
        document.getElementById("modal-recipe-meta").innerHTML = `
            <span>⏱️ Préparation : ${recipe.prepTimeMinutes} min</span>
            <span>🔥 Cuisson : ${recipe.cookingTimeMinutes} min</span>
        `;

        // Boutons convives dans la modale
        [1, 2, 4, 6].forEach(s => {
            const btn = document.getElementById("modal-serv-" + s);
            if (btn) btn.classList.toggle("active", s === recipe.activeServings);
        });

        // ==========================================
        // GESTION DE LA BARRE D'ADAPTATION & DU DIFF
        // ==========================================
        const badgeEl = document.getElementById("modal-adaptation-badge");
        const resetBtn = document.getElementById("adapt-btn-reset");
        const diffCard = document.getElementById("recipe-diff-card");

        // Boutons actifs
        ["pro", "eco", "light", "target"].forEach(key => {
            const btnMap = { pro: "plus_proteines", eco: "moins_cher", light: "legere_lipides", target: "cible_calorique" };
            const b = document.getElementById("adapt-btn-" + key);
            if (b) b.classList.toggle("active", activeAdaptationType === btnMap[key]);
        });

        if (activeAdaptationType && originalModalRecipe && window.NutriAdaptation) {
            if (badgeEl) {
                badgeEl.style.display = "inline-block";
                badgeEl.textContent = recipe.adaptationLabel || "Personnalisée";
            }
            if (resetBtn) resetBtn.style.display = "inline-flex";

            // Calcul du comparatif Avant / Après
            const diff = window.NutriAdaptation.compareRecipes(originalModalRecipe, recipe);
            if (diff && diffCard) {
                diffCard.style.display = "block";

                // Calories
                document.getElementById("diff-val-calories").textContent = `${diff.original.calories} → ${diff.adapted.calories} kcal`;
                const calDeltaEl = document.getElementById("diff-delta-calories");
                const calDelta = diff.deltas.calories;
                calDeltaEl.textContent = (calDelta > 0 ? "+" : "") + calDelta + " kcal";
                calDeltaEl.className = "diff-stat-delta " + (calDelta < 0 ? "delta-good" : "delta-neutral");

                // Protéines
                document.getElementById("diff-val-proteins").textContent = `${diff.original.proteins}g → ${diff.adapted.proteins}g`;
                const proDeltaEl = document.getElementById("diff-delta-proteins");
                const proDelta = diff.deltas.proteins;
                proDeltaEl.textContent = (proDelta > 0 ? "+" : "") + proDelta + "g";
                proDeltaEl.className = "diff-stat-delta " + (proDelta > 0 ? "delta-good" : "delta-neutral");

                // Coût
                document.getElementById("diff-val-cost").textContent = `${diff.original.costFCFA.toLocaleString("fr-FR")} → ${diff.adapted.costFCFA.toLocaleString("fr-FR")} FCFA`;
                const costDeltaEl = document.getElementById("diff-delta-cost");
                const costDelta = diff.deltas.costFCFA;
                costDeltaEl.textContent = (costDelta > 0 ? "+" : "") + costDelta.toLocaleString("fr-FR") + " FCFA";
                costDeltaEl.className = "diff-stat-delta " + (costDelta < 0 ? "delta-good" : (costDelta === 0 ? "delta-neutral" : "delta-alert"));
            }
        } else {
            if (badgeEl) badgeEl.style.display = "none";
            if (resetBtn) resetBtn.style.display = "none";
            if (diffCard) diffCard.style.display = "none";
        }

        // Macros
        document.getElementById("modal-macro-kcal").textContent = (nut.perServing?.calories || 0).toLocaleString("fr-FR");
        document.getElementById("modal-macro-prot").textContent = (nut.perServing?.proteins || 0) + "g";
        document.getElementById("modal-macro-carbs").textContent = (nut.perServing?.carbs || 0) + "g";
        document.getElementById("modal-macro-fats").textContent = (nut.perServing?.fats || 0) + "g";

        // Budget
        document.getElementById("modal-cost-total").textContent = (nut.total?.costFCFA || 0).toLocaleString("fr-FR") + " FCFA";
        document.getElementById("modal-cost-per-serving").textContent = `Soit ${(nut.perServing?.costFCFA || 0).toLocaleString("fr-FR")} FCFA / portion (${recipe.activeServings} convive(s))`;

        // Économies du placard
        let pantryCost = 0;
        let toBuyCost = 0;
        nut.items.forEach(it => {
            if (selectedPantryIngredients.has(it.ingredientId)) {
                pantryCost += it.costFCFA;
            } else {
                toBuyCost += it.costFCFA;
            }
        });
        document.getElementById("modal-pantry-saved").textContent = pantryCost.toLocaleString("fr-FR") + " FCFA";
        document.getElementById("modal-pantry-to-buy").textContent = toBuyCost.toLocaleString("fr-FR") + " FCFA";

        // Astuce du chef
        document.getElementById("modal-chef-tip-text").textContent = recipe.chefTip || "Utilisez des produits frais du marché de Dakar pour des vitamines préservées !";

        // Table des ingrédients avec bouton de substitution 🔄
        const tbody = document.getElementById("modal-ingredients-tbody");
        if (tbody) {
            tbody.innerHTML = nut.items.map(it => {
                const inPantry = selectedPantryIngredients.has(it.ingredientId);
                const hasSubs = window.NutriAdaptation && window.NutriAdaptation.getAvailableSubstitutions(it.ingredientId).length > 0;
                const isSubOpen = activeSubstitutionTarget === it.ingredientId;

                let subsBoxHtml = "";
                if (isSubOpen && window.NutriAdaptation) {
                    const subs = window.NutriAdaptation.getAvailableSubstitutions(it.ingredientId);
                    subsBoxHtml = `
                        <tr>
                            <td colspan="5" style="padding:0; border:none;">
                                <div class="substitute-options-box">
                                    <div style="font-weight:700; color:var(--secondary); margin-bottom:8px;">
                                        🔄 Remplacer "${escapeHtml(it.name.split("(")[0].trim())}" par une alternative locale :
                                    </div>
                                    ${subs.map(s => `
                                        <div class="substitute-option-item" onclick="App.applyIngredientSubstitution('${it.ingredientId}', '${s.id}')">
                                            <div>
                                                <strong>${escapeHtml(s.name.split("(")[0].trim())}</strong>
                                                <span style="font-size:0.75rem; color:var(--text-light); margin-left:6px;">(${s.priceUnitLabel})</span>
                                                <div style="font-size:0.78rem; color:#0369A1; margin-top:2px;">💡 ${escapeHtml(s.reason)}</div>
                                            </div>
                                            <button type="button" class="btn btn-secondary" style="padding:4px 10px; font-size:0.75rem;">
                                                Choisir →
                                            </button>
                                        </div>
                                    `).join("")}
                                </div>
                            </td>
                        </tr>
                    `;
                }

                return `
                    <tr>
                        <td>
                            ${inPantry 
                                ? `<span style="background:#DCFCE7; color:#15803D; font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:12px;">Au placard</span>` 
                                : `<span style="background:#FEE2E2; color:#991B1B; font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:12px;">À acheter</span>`}
                        </td>
                        <td><strong>${escapeHtml(it.name)}</strong></td>
                        <td>${it.quantity} ${it.unit} (${it.weightGrams}g)</td>
                        <td><strong style="color:var(--primary-dark);">${it.costFCFA} FCFA</strong></td>
                        <td>
                            ${hasSubs 
                                ? `<button type="button" class="substitute-btn" onclick="App.toggleIngredientSubstitution('${it.ingredientId}')" title="Voir les alternatives locales">
                                    ${isSubOpen ? "✕ Fermer" : "🔄 Remplacer"}
                                   </button>` 
                                : `<span style="font-size:0.75rem; color:var(--text-light);">Standard</span>`}
                        </td>
                    </tr>
                    ${subsBoxHtml}
                `;
            }).join("");
        }

        // Étapes numérotées
        const stepsContainer = document.getElementById("modal-steps-container");
        if (stepsContainer && Array.isArray(recipe.steps)) {
            stepsContainer.innerHTML = recipe.steps.map(step => `
                <li class="modal-step-item">${escapeHtml(step)}</li>
            `).join("");
        }

        // Bouton favori modale
        const favBtn = document.getElementById("modal-fav-toggle-btn");
        if (favBtn && window.NutriRecipes) {
            const isFav = window.NutriRecipes.isFavorite(recipe.id);
            favBtn.innerHTML = isFav ? "<span>⭐</span> Retirer des favoris" : "<span>☆</span> Ajouter aux favoris";
        }
    }

    function toggleCurrentRecipeFavorite() {
        if (!currentModalRecipe || !window.NutriRecipes) return;
        const isNowFav = window.NutriRecipes.toggleFavorite(currentModalRecipe.id);
        renderRecipeModalContent(currentModalRecipe);
        filterRecipes();
        showToast(isNowFav ? "Ajouté aux favoris ! ⭐" : "Retiré des favoris.", "info");
    }

    function generateCreativeRecipeModal() {
        if (!window.NutriRecipes) return;
        const pantryArray = Array.from(selectedPantryIngredients);
        if (pantryArray.length === 0) {
            showToast("Veuillez sélectionner au moins un ingrédient au placard !", "error");
            return;
        }

        try {
            const mealType = document.getElementById("filter-meal-type") ? document.getElementById("filter-meal-type").value : "dejeuner";
            const creative = window.NutriRecipes.generateCreativeRecipe(pantryArray, {
                mealType: mealType === "all" ? "dejeuner" : mealType,
                servings: activeServings
            });
            cachedFilteredRecipes.unshift(creative);
            renderRecipeCards(cachedFilteredRecipes);
            openRecipeModal(creative.id);
            showToast("✨ Recette sur-mesure créée à partir de votre placard !", "success");
        } catch (err) {
            showToast(err.message, "error");
        }
    }

    function openAIPromptModal() {
        const modal = document.getElementById("ai-prompt-modal");
        if (!modal) return;
        const promptInput = document.getElementById("ai-user-custom-prompt");
        if (promptInput) promptInput.value = "";
        const resultContainer = document.getElementById("ai-result-container");
        if (resultContainer) resultContainer.style.display = "none";
        modal.classList.add("show");
    }

    function closeAIPromptModal(event) {
        if (event && event.target !== event.currentTarget) return;
        const modal = document.getElementById("ai-prompt-modal");
        if (modal) modal.classList.remove("show");
    }

    let _lastGeneratedAIRecipe = null;

    function generateRecipeFromAIPrompt() {
        if (!window.NutriRecipes) return;
        const promptInput = document.getElementById("ai-user-custom-prompt");
        const promptText = promptInput ? promptInput.value.trim() : "";

        if (!promptText) {
            showToast("Veuillez décrire ce que vous souhaitez manger ! 🥗", "error");
            if (promptInput) promptInput.focus();
            return;
        }

        const btn = document.getElementById("ai-generate-btn");
        if (btn) {
            btn.innerHTML = '<span class="spinner"></span> Génération...';
            btn.disabled = true;
        }

        setTimeout(() => {
            try {
                const recipe = window.NutriRecipes.generateRecipeFromPrompt(promptText, {
                    servings: activeServings
                });

                _lastGeneratedAIRecipe = recipe;

                // Afficher le résultat dans la modale
                const resultContainer = document.getElementById("ai-result-container");
                const recipeCard = document.getElementById("ai-recipe-card");

                const ingredientsHtml = (recipe.ingredients || []).map(ing => {
                    const ingObj = (window.NutriData && window.NutriData.SEN_INGREDIENTS)
                        ? window.NutriData.SEN_INGREDIENTS.find(i => i.id === ing.ingredientId)
                        : null;
                    const name = ingObj ? ingObj.name.split("(")[0].trim() : ing.ingredientId;
                    const unitStr = ing.unit === "piece" ? " pièce(s)" : " " + ing.unit;
                    return `<li style="margin-bottom:6px; font-size:0.9rem;">
                        <strong>${escapeHtml(name)}</strong> : ${ing.quantity}${unitStr}
                    </li>`;
                }).join("");

                const stepsHtml = (recipe.steps || []).map((step, idx) => {
                    return `<li style="margin-bottom:8px; font-size:0.88rem; line-height:1.5;">
                        <span style="font-weight:700; color:var(--primary);">${idx + 1}.</span> ${escapeHtml(step)}
                    </li>`;
                }).join("");

                recipeCard.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
                        <div>
                            <div style="font-size:1.8rem; margin-bottom:4px;">${recipe.imageEmoji || "🍽️"}</div>
                            <h3 style="font-size:1.25rem; font-weight:800; color:var(--text-dark); margin:0 0 4px 0;">${escapeHtml(recipe.title)}</h3>
                            <p style="font-size:0.88rem; color:var(--text-light); margin:0;">${escapeHtml(recipe.description || "")}</p>
                        </div>
                        <span style="background:var(--primary-light); color:var(--primary-dark); padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:700; text-transform:capitalize;">
                            ${recipe.mealType || "Repas"}
                        </span>
                    </div>

                    <!-- Badges d'impact nutritionnel et budget avec vrais prix -->
                    <div style="display:flex; gap:12px; flex-wrap:wrap; margin:16px 0; padding:12px; background:var(--bg-alt); border-radius:var(--radius-sm);">
                        <div style="flex:1; min-width:130px;">
                            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-light); font-weight:700; display:block;">Calories approx.</span>
                            <strong style="font-size:1.15rem; color:#E67E22;">🔥 ~${Math.round(recipe.nutritionPerServing ? recipe.nutritionPerServing.calories : 450)} kcal</strong>
                            <div style="font-size:0.75rem; color:var(--text-light);">par portion</div>
                        </div>
                        <div style="flex:1; min-width:130px;">
                            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-light); font-weight:700; display:block;">Prix estimé réel</span>
                            <strong style="font-size:1.15rem; color:var(--primary);">💰 ${Math.round(recipe.estimatedCostFCFA || 0).toLocaleString("fr-FR")} FCFA</strong>
                            <div style="font-size:0.75rem; color:var(--text-light);">total (${Math.round(recipe.costPerServingFCFA || 0).toLocaleString("fr-FR")} FCFA/portion)</div>
                        </div>
                        <div style="flex:1; min-width:130px;">
                            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-light); font-weight:700; display:block;">Temps total</span>
                            <strong style="font-size:1.15rem; color:var(--text-dark);">⏱️ ${(recipe.prepTimeMinutes || 15) + (recipe.cookingTimeMinutes || 15)} min</strong>
                            <div style="font-size:0.75rem; color:var(--text-light);">${recipe.difficulty || "Facile"}</div>
                        </div>
                    </div>

                    <!-- Ingrédients en français simple -->
                    <div style="margin-bottom:16px;">
                        <h4 style="font-size:0.95rem; font-weight:700; color:var(--secondary); margin-bottom:8px;">
                            🛒 Ingrédients du marché (${recipe.baseServings || 2} portions) :
                        </h4>
                        <ul style="padding-left:18px; margin:0;">
                            ${ingredientsHtml}
                        </ul>
                    </div>

                    <!-- Étapes simples -->
                    <div style="margin-bottom:18px;">
                        <h4 style="font-size:0.95rem; font-weight:700; color:var(--secondary); margin-bottom:8px;">
                            👩‍🍳 Préparation étape par étape :
                        </h4>
                        <ol style="padding-left:0; list-style:none; margin:0;">
                            ${stepsHtml}
                        </ol>
                    </div>

                    ${recipe.chefTip ? `
                    <div style="background:#FFFBEB; border-left:4px solid #F59E0B; padding:10px 14px; border-radius:4px; margin-bottom:18px; font-size:0.85rem; color:#92400E;">
                        <strong>💡 Astuce Chef :</strong> ${escapeHtml(recipe.chefTip)}
                    </div>
                    ` : ""}

                    <!-- Boutons d'action -->
                    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px; flex-wrap:wrap;">
                        <button type="button" class="btn btn-secondary" onclick="App.saveAIGeneratedRecipe(false)" style="padding:8px 16px; font-size:0.88rem;">
                            ⭐ Enregistrer dans mon profil
                        </button>
                        <button type="button" class="btn btn-primary" onclick="App.saveAIGeneratedRecipe(true)" style="padding:8px 16px; font-size:0.88rem;">
                            🍽️ Voir la fiche complète
                        </button>
                    </div>
                `;

                if (resultContainer) resultContainer.style.display = "block";
                resultContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });

                showToast("✨ Recette saine générée avec succès !", "success");

            } catch (err) {
                showToast(err.message, "error");
            } finally {
                if (btn) {
                    btn.innerHTML = "✨ Générer ma recette";
                    btn.disabled = false;
                }
            }
        }, 500);
    }

    function saveAIGeneratedRecipe(openDetail = false) {
        if (!_lastGeneratedAIRecipe) return;
        const recipe = _lastGeneratedAIRecipe;

        // Ajouter aux favoris et au catalogue filtré
        if (window.NutriRecipes && window.NutriRecipes.toggleFavorite) {
            window.NutriRecipes.toggleFavorite(recipe.id);
        }
        cachedFilteredRecipes.unshift(recipe);
        renderRecipeCards(cachedFilteredRecipes);

        showToast("Recette enregistrée dans votre profil et vos favoris ! ⭐", "success");

        if (openDetail) {
            closeAIPromptModal();
            openRecipeModal(recipe.id);
        }
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ============================================================
    // UTILITAIRES
    // ============================================================
    function setValue(id, value) {
        const el = document.getElementById(id);
        if (el && value !== undefined && value !== null) {
            el.value = value;
        }
    }

    function showToast(message, type = "success") {
        const container = document.getElementById("toast-container");
        if (!container) return;
        const toast = document.createElement("div");
        const icons = { success: "✅", error: "❌", info: "ℹ️" };
        toast.className = "toast " + type;
        toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 4200);
    }

    // Bouton déconnexion dans la navbar
    document.addEventListener("DOMContentLoaded", () => {
        const logoutBtn = document.getElementById("nav-logout-btn");
        if (logoutBtn) logoutBtn.addEventListener("click", logout);
        init();
    });

    // API publique
    return {
        switchAuthTab,
        handleLogin,
        handleRegister,
        handleVerifyEmail,
        resendVerifyCode,
        logout,
        showTab,
        showComingSoon,
        handleSaveProfile,
        updateBudgetCalculation,
        toggleOtherCondition,
        showToast,
        // Méthodes Étape 4 (Recettes & Placard)
        setRecipeCategory,
        handleIngredientSearch,
        togglePantryIngredient,
        clearPantrySelection,
        selectAllPantry,
        applyPantryPreset,
        setRecipeServings,
        filterRecipes,
        toggleCardFavorite,
        openRecipeModal,
        closeRecipeModal,
        changeModalServings,
        toggleCurrentRecipeFavorite,
        generateCreativeRecipeModal,
        openAIPromptModal,
        closeAIPromptModal,
        generateRecipeFromAIPrompt,
        saveAIGeneratedRecipe,
        // Méthodes Étape 5 (Adaptation & Substitutions)
        applyRecipeAdaptation,
        resetRecipeAdaptation,
        toggleIngredientSubstitution,
        applyIngredientSubstitution,
        // Méthodes Étape 6 (Planificateur & Liste de Courses)
        generateWeeklyPlan,
        resetWeeklyPlan,
        changePlannerServings,
        filterPlannerDay,
        openMealSelectorModal,
        selectMealForSlot,
        removeMealFromSlot,
        filterShoppingPeriod,
        refreshShoppingList,
        toggleShoppingItem,
        shareShoppingWhatsApp,
        // Méthodes Prix Auchan & Marché
        openMarketPricesModal,
        closeMarketPricesModal,
        filterMarketPricesTable,
        applyCustomPrice,
        removeCustomPrice,
        resetAllCustomPricesToAuchan,
        toggleRecipePriceEditor
    };

    // ======================================================
    // PRIX AUCHAN SÉNÉGAL & PERSONNALISATION MARCHÉ
    // ======================================================

    function openMarketPricesModal() {
        const modal = document.getElementById("market-prices-modal");
        if (!modal) return;
        modal.style.display = "block";
        renderMarketPricesTable();
    }

    function closeMarketPricesModal(event) {
        if (event && event.target !== event.currentTarget) return;
        const modal = document.getElementById("market-prices-modal");
        if (modal) modal.style.display = "none";
        // Rafraîchir les recettes pour refléter les nouveaux prix
        if (typeof cachedFilteredRecipes !== "undefined" && cachedFilteredRecipes && cachedFilteredRecipes.length > 0) {
            filterRecipes();
        }
    }

    function renderMarketPricesTable() {
        if (!window.NutriCalculator) return;
        const tbody = document.getElementById("market-prices-tbody");
        if (!tbody) return;

        const allIngredients = window.NutriCalculator.getAllIngredients();
        const catFilter = document.getElementById("market-price-category-filter");
        const searchEl = document.getElementById("market-price-search");
        const catVal = catFilter ? catFilter.value : "all";
        const searchQ = searchEl ? searchEl.value.toLowerCase().trim() : "";

        const filtered = allIngredients.filter(ing => {
            if (catVal !== "all" && ing.category !== catVal) return false;
            if (searchQ && !ing.name.toLowerCase().includes(searchQ)) return false;
            return true;
        });

        const categoryLabels = {
            cereales_feculents: "Céréales",
            poissons_viandes_oeufs: "Viandes/Poissons",
            legumes: "Légumes",
            legumineuses: "Légumineuses",
            huiles_condiments: "Huiles",
            produits_laitiers: "Laitiers",
            fruits: "Fruits",
            boissons_infusions: "Infusions"
        };

        tbody.innerHTML = filtered.map(ing => {
            const isCustom = window.NutriCalculator.hasCustomPrice(ing.id);
            const refPrice = ing.priceUnit === "piece" ? ing.pricePerPiece : ing.defaultPricePerKg;
            const refLabel = ing.priceUnit === "piece" ? "FCFA/pièce" : `FCFA/${ing.priceUnit || "kg"}`;
            const effectivePrice = window.NutriCalculator.getEffectivePrice(ing.id);
            const customVal = isCustom ? effectivePrice : "";
            const catLabel = categoryLabels[ing.category] || ing.category;
            const shortName = (ing.name || "").split("(")[0].trim();

            return `<tr style="border-bottom:1px solid var(--border);">
                <td style="padding:9px 12px; font-weight:600; color:var(--text-dark);">${shortName}</td>
                <td style="padding:9px 12px; font-size:0.78rem; color:var(--text-light);">${catLabel}</td>
                <td style="padding:9px 12px;">
                    <strong style="color:var(--primary-dark);">${refPrice ? refPrice.toLocaleString("fr-FR") : "N/A"} ${refLabel}</strong>
                    <br><span style="font-size:0.7rem; color:#0369A1;">🏪 auchan.sn</span>
                </td>
                <td style="padding:9px 12px;">
                    <input type="number"
                        placeholder="${refPrice ? refPrice.toLocaleString("fr-FR") : ""}"
                        value="${customVal}"
                        min="0" step="10"
                        onchange="App.applyCustomPrice('${ing.id}', this.value)"
                        style="width:120px; padding:5px 8px; font-size:0.85rem; border:1.5px solid ${isCustom ? "#F59E0B" : "var(--border)"}; border-radius:6px; outline:none;">
                </td>
                <td style="padding:9px 12px; text-align:center;">
                    ${isCustom
                        ? `<span style="background:#FEF3C7; color:#92400E; font-size:0.72rem; padding:3px 9px; border-radius:10px; font-weight:700; white-space:nowrap;">✏️ Modifié</span>`
                        : `<span style="background:#DCFCE7; color:#15803D; font-size:0.72rem; padding:3px 9px; border-radius:10px; font-weight:700; white-space:nowrap;">🏪 Auchan</span>`}
                </td>
                <td style="padding:9px 12px; text-align:center;">
                    ${isCustom
                        ? `<button type="button" onclick="App.removeCustomPrice('${ing.id}')" style="padding:3px 10px; font-size:0.75rem; color:#DC2626; border:1.5px solid #FCA5A5; border-radius:6px; background:#fff; cursor:pointer; font-weight:600;">↺ Auchan</button>`
                        : `<span style="font-size:0.75rem; color:var(--text-light);">—</span>`}
                </td>
            </tr>`;
        }).join("");

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="padding:24px; text-align:center; color:var(--text-light); font-style:italic;">Aucun aliment trouvé.</td></tr>`;
        }
    }

    function filterMarketPricesTable() {
        renderMarketPricesTable();
    }

    function applyCustomPrice(ingredientId, value) {
        if (!window.NutriCalculator) return;
        const numVal = parseFloat(value);
        if (!isNaN(numVal) && numVal > 0) {
            window.NutriCalculator.setCustomPrice(ingredientId, numVal);
            showToast("Prix mis à jour ! Le budget sera recalculé.", "success");
        } else if (value === "" || value === "0") {
            window.NutriCalculator.removeCustomPrice(ingredientId);
        }
        renderMarketPricesTable();
        if (typeof cachedFilteredRecipes !== "undefined" && cachedFilteredRecipes && cachedFilteredRecipes.length > 0) {
            filterRecipes();
        }
        // Rafraîchir la modale recette ouverte si nécessaire
        if (typeof currentModalRecipe !== "undefined" && currentModalRecipe) {
            const updated = window.NutriRecipes ? window.NutriRecipes.getRecipeById(currentModalRecipe.id, currentModalRecipe.activeServings) : null;
            if (updated && typeof renderRecipeModalContent === "function") renderRecipeModalContent(updated);
        }
    }

    function removeCustomPrice(ingredientId) {
        if (!window.NutriCalculator) return;
        window.NutriCalculator.removeCustomPrice(ingredientId);
        renderMarketPricesTable();
        showToast("Prix rétabli selon Auchan Sénégal.", "info");
        if (typeof cachedFilteredRecipes !== "undefined" && cachedFilteredRecipes && cachedFilteredRecipes.length > 0) {
            filterRecipes();
        }
    }

    function resetAllCustomPricesToAuchan() {
        if (!window.NutriCalculator) return;
        window.NutriCalculator.resetCustomPrices();
        renderMarketPricesTable();
        showToast("Tous les prix sont rétablis selon Auchan Sénégal.", "success");
        if (typeof cachedFilteredRecipes !== "undefined" && cachedFilteredRecipes && cachedFilteredRecipes.length > 0) {
            filterRecipes();
        }
    }

    function toggleRecipePriceEditor() {
        const panel = document.getElementById("recipe-price-editor-panel");
        const btn = document.getElementById("btn-toggle-recipe-price-editor");
        if (!panel) return;
        const isOpen = panel.style.display !== "none" && panel.style.display !== "";
        if (isOpen) {
            panel.style.display = "none";
            if (btn) btn.textContent = "✏️ Ajuster mes prix du marché";
        } else {
            panel.style.display = "block";
            if (btn) btn.textContent = "✕ Fermer l'éditeur de prix";
            if (typeof currentModalRecipe !== "undefined" && currentModalRecipe && currentModalRecipe.nutrition) {
                panel.innerHTML = currentModalRecipe.nutrition.items.map(it => {
                    const ing = window.NutriCalculator ? window.NutriCalculator.findIngredient(it.ingredientId) : null;
                    if (!ing) return "";
                    const isCustom = window.NutriCalculator.hasCustomPrice(ing.id);
                    const refPrice = ing.priceUnit === "piece" ? ing.pricePerPiece : ing.defaultPricePerKg;
                    const effectivePrice = window.NutriCalculator.getEffectivePrice(ing.id);
                    return `<div style="display:flex; align-items:center; gap:10px; margin-bottom:8px; flex-wrap:wrap; padding:6px; background:${isCustom ? "#FFFBEB" : "#F9FAFB"}; border-radius:6px;">
                        <span style="flex:1; font-size:0.85rem; font-weight:600; min-width:140px;">${(it.name || "").split("(")[0].trim()}</span>
                        <span style="font-size:0.78rem; color:#0369A1; min-width:120px; white-space:nowrap;">Réf.: ${refPrice ? refPrice.toLocaleString("fr-FR") : "N/A"} FCFA/${ing.priceUnit || "kg"}</span>
                        <input type="number" value="${isCustom ? effectivePrice : ""}" placeholder="Mon prix..." min="0" step="10"
                            onchange="App.applyCustomPrice('${ing.id}', this.value)"
                            style="width:110px; padding:5px 8px; font-size:0.85rem; border:1.5px solid ${isCustom ? "#F59E0B" : "var(--border)"}; border-radius:6px; outline:none;">
                        <span style="font-size:0.72rem; padding:2px 8px; border-radius:10px; font-weight:700; white-space:nowrap; color:${isCustom ? "#92400E" : "#15803D"}; background:${isCustom ? "#FEF3C7" : "#DCFCE7"};">
                            ${isCustom ? "Modifié" : "Auchan"}
                        </span>
                    </div>`;
                }).join("");
            }
        }
    }

})();

