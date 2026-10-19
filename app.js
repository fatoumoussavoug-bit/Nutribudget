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
        if (tabName === "recipes") loadRecipesTab();
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
        const maxBudget = document.getElementById("filter-max-budget") ? document.getElementById("filter-max-budget").value : "";

        // Récupérer les exclusions du profil utilisateur connecté
        const profile = NutriProfile.getProfile();
        const exclusions = (profile && Array.isArray(profile.exclusions)) ? profile.exclusions : [];

        const pantryArray = Array.from(selectedPantryIngredients);

        cachedFilteredRecipes = window.NutriRecipes.matchRecipesWithIngredients(pantryArray, {
            mealType,
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

    function renderRecipeModalContent(recipe) {
        const nut = recipe.nutrition || { total: {}, perServing: {}, macroDistribution: {}, items: [] };

        document.getElementById("modal-recipe-title").innerHTML = `<span>${recipe.imageEmoji || "🍲"}</span> ${escapeHtml(recipe.title)}`;
        document.getElementById("modal-recipe-category").textContent = `${recipe.mealType.toUpperCase()} · ${recipe.difficulty || "Facile"} · MARCHÉS DU SÉNÉGAL`;
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
        if (!window.NutriRecipes) return;
        const pantryArray = Array.from(selectedPantryIngredients);
        const profile = NutriProfile.getProfile();

        const prompts = window.NutriRecipes.generateAIPrompt({
            selectedIngredientIds: pantryArray,
            userGoal: profile ? profile.goal : "maintien",
            targetCalories: profile && profile.calculated ? profile.calculated.targetCalories : 2000,
            servings: activeServings,
            mealType: document.getElementById("filter-meal-type") ? document.getElementById("filter-meal-type").value : "dejeuner"
        });

        document.getElementById("ai-prompt-system").value = prompts.systemPrompt;
        document.getElementById("ai-prompt-user").value = prompts.userPrompt;

        const modal = document.getElementById("ai-prompt-modal");
        if (modal) modal.classList.add("show");
    }

    function closeAIPromptModal(event) {
        if (event && event.target !== event.currentTarget) return;
        const modal = document.getElementById("ai-prompt-modal");
        if (modal) modal.classList.remove("show");
    }

    function copyPromptText(elementId) {
        const textarea = document.getElementById(elementId);
        if (!textarea) return;
        textarea.select();
        navigator.clipboard.writeText(textarea.value).then(() => {
            showToast("Prompt copié dans le presse-papier ! 📋", "success");
        }).catch(() => {
            document.execCommand("copy");
            showToast("Prompt copié ! 📋", "success");
        });
    }

    function loadMockAIResponse() {
        const mock = {
            title: "Mijoté Léger de Poulet aux Légumes des Niayes & Fonio",
            mealType: "dejeuner",
            prepTimeMinutes: 20,
            cookingTimeMinutes: 25,
            difficulty: "Facile",
            imageEmoji: "🍲",
            description: "Une recette d'inspiration dakaroise associant le poulet fermier et le fonio complet.",
            chefTip: "Parfumez la sauce avec du nététou concassé pour une note umami sans excès de sodium.",
            tags: ["senegalais", "sans-gluten", "ia-generee"],
            ingredients: [
                { ingredientId: "poulet-fermier", quantity: 500, unit: "g" },
                { ingredientId: "fonio", quantity: 240, unit: "g" },
                { ingredientId: "carotte", quantity: 150, unit: "g" },
                { ingredientId: "oignon-jaune", quantity: 200, unit: "g" },
                { ingredientId: "huile-arachide", quantity: 25, unit: "ml" },
                { ingredientId: "soumbala-netetou", quantity: 15, unit: "g" }
            ],
            steps: [
                "Découper et faire dorer le poulet fermier avec les oignons émincés.",
                "Ajouter les carottes en rondelles, le nététou et un verre d'eau. Laisser mijoter 20 minutes.",
                "Cuire le fonio à la vapeur ou 5 minutes à l'eau bouillante.",
                "Dresser le ragoût surmontant le lit de fonio et déguster bien chaud."
            ]
        };
        document.getElementById("ai-json-input").value = JSON.stringify(mock, null, 2);
    }

    function testAIReponse() {
        if (!window.NutriRecipes) return;
        const text = document.getElementById("ai-json-input").value.trim();
        if (!text) {
            showToast("Veuillez coller un JSON de recette d'abord !", "error");
            return;
        }

        try {
            const recipe = window.NutriRecipes.parseAndValidateAIRecipe(text, activeServings);
            closeAIPromptModal();
            cachedFilteredRecipes.unshift(recipe);
            renderRecipeCards(cachedFilteredRecipes);
            openRecipeModal(recipe.id);
            showToast("Recette IA validée et calculée avec succès par NutriCalculator ! 🎉", "success");
        } catch (err) {
            showToast(err.message, "error");
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
        logout,
        showTab,
        showComingSoon,
        handleSaveProfile,
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
        copyPromptText,
        loadMockAIResponse,
        testAIReponse,
        // Méthodes Étape 5 (Adaptation & Substitutions)
        applyRecipeAdaptation,
        resetRecipeAdaptation,
        toggleIngredientSubstitution,
        applyIngredientSubstitution
    };
})();

