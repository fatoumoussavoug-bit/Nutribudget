/**
 * NutriBudget - Contrôleur Principal de l'Espace Application (Étape 3)
 * Gère l'authentification, la navigation, le formulaire de profil et le tableau de bord.
 */

const App = (function () {
    "use strict";

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
        });
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
                showToast("Compte créé avec succès ! Bienvenue " + (user.name || "") + " 🎉", "success");
                showApp(user);
                // Rediriger vers le profil pour le remplir
                setTimeout(() => showTab("profile"), 800);
            } catch (err) {
                btn.innerHTML = "Créer mon compte";
                btn.classList.remove("loading");
                errEl.textContent = err.message;
                errEl.style.display = "block";
            }
        }, 400);
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
            document.getElementById("budget-daily-total").textContent =
                budget.dailyTotalFCFA.toLocaleString("fr-FR") + " FCFA";
            document.getElementById("budget-daily-person").textContent =
                budget.dailyPerPersonFCFA.toLocaleString("fr-FR") + " FCFA";
            document.getElementById("budget-per-meal").textContent =
                budget.perMealPerPersonFCFA.toLocaleString("fr-FR") + " FCFA";
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
    // FORMULAIRE PROFIL — Chargement & Sauvegarde
    // ============================================================
    function loadProfileForm() {
        const profile = NutriProfile.getProfile();
        if (!profile) return;

        // Remplir les champs
        setValue("prof-age", profile.age);
        setValue("prof-weight", profile.weight);
        setValue("prof-height", profile.height);
        setValue("prof-gender", profile.gender);
        setValue("prof-activity", profile.activityLevel);
        setValue("prof-budget-amount", profile.budgetAmountFCFA || "");
        setValue("prof-budget-period", profile.budgetPeriod || "hebdomadaire");
        setValue("prof-household", profile.householdSize || 1);

        // Objectif (radio)
        const goal = profile.goal || "maintien";
        const goalRadio = document.querySelector(`input[name="prof-goal"][value="${goal}"]`);
        if (goalRadio) goalRadio.checked = true;

        // Conditions médicales
        document.querySelectorAll('input[name="conditions"]').forEach(cb => {
            cb.checked = Array.isArray(profile.specialConditions) &&
                profile.specialConditions.includes(cb.value);
        });

        // Exclusions alimentaires
        document.querySelectorAll('input[name="exclusions"]').forEach(cb => {
            cb.checked = Array.isArray(profile.exclusions) &&
                profile.exclusions.includes(cb.value);
        });
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

        const profileData = {
            age: parseInt(document.getElementById("prof-age").value),
            weight: parseFloat(document.getElementById("prof-weight").value),
            height: parseInt(document.getElementById("prof-height").value),
            gender: document.getElementById("prof-gender").value,
            goal: goalEl ? goalEl.value : "maintien",
            activityLevel: document.getElementById("prof-activity").value,
            budgetAmountFCFA: parseFloat(document.getElementById("prof-budget-amount").value) || 0,
            budgetPeriod: document.getElementById("prof-budget-period").value,
            householdSize: parseInt(document.getElementById("prof-household").value) || 1,
            specialConditions: conditions,
            exclusions: exclusions
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
        logout,
        showTab,
        showComingSoon,
        handleSaveProfile,
        showToast
    };
})();
