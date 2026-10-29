/**
 * NutriTrack Main Application Controller
 * Connects UI views, event listeners, search engine, diary management,
 * water tracker, recipe builder, weight tracking, and charts.
 */
(function () {
  "use strict";

  const { FOODS_DATABASE, Parser, NutritionService, Storage, Charts, Modals } = window.NutriTrack;

  // Meal types in strict chronological order
  const MEALS = ["Breakfast", "Morning snack", "Lunch", "Evening snack", "Dinner"];
  const MEAL_ICONS = {
    "Breakfast": "🍳",
    "Morning snack": "🍎",
    "Lunch": "🥙",
    "Evening snack": "🍵",
    "Dinner": "🍲"
  };

  // State instance
  let state = Storage.loadState();
  let selectedDate = Storage.formatDate(new Date());
  let currentView = "dashboard";
  let activeSearchFood = null;
  let smartLogParsed = null;
  let recipeIngredients = [];
  let isSubmitting = false;

  // Ensure current date diary structures exist
  function ensureDateStructures(dateStr) {
    if (!state.diary[dateStr]) {
      state.diary[dateStr] = {
        "Breakfast": [],
        "Morning snack": [],
        "Lunch": [],
        "Evening snack": [],
        "Dinner": []
      };
    }
    MEALS.forEach(m => {
      if (!Array.isArray(state.diary[dateStr][m])) {
        state.diary[dateStr][m] = [];
      }
    });

    if (!state.water[dateStr]) {
      state.water[dateStr] = { ml: 0, glasses: 0, entries: [] };
    }
  }

  // ---------------------------------------------------------------------------
  // Navigation & View Routing
  // ---------------------------------------------------------------------------
  function switchView(viewName) {
    currentView = viewName;
    document.querySelectorAll(".view-section").forEach(sec => {
      sec.hidden = sec.id !== `view-${viewName}`;
    });
    document.querySelectorAll(".nav-link").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === viewName);
    });

    if (viewName === "dashboard") {
      renderDashboard();
    } else if (viewName === "diary") {
      renderDiary();
    } else if (viewName === "search") {
      initSearchView();
    } else if (viewName === "smartlog") {
      // focus input
      const inp = document.getElementById("smartLogInput");
      if (inp) inp.focus();
    } else if (viewName === "recipes") {
      renderRecipeList();
    } else if (viewName === "progress") {
      renderProgressView();
    } else if (viewName === "profile") {
      renderProfileView();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------------------------------------------------------------------------
  // Date Navigation
  // ---------------------------------------------------------------------------
  function setDate(dateStr) {
    selectedDate = dateStr;
    ensureDateStructures(selectedDate);
    const dateInput = document.getElementById("currentDateInput");
    if (dateInput) dateInput.value = selectedDate;

    // Display formatted date
    const dObj = new Date(selectedDate + "T12:00:00");
    const isToday = selectedDate === Storage.formatDate(new Date());
    const displayLabel = dObj.toLocaleDateString("en-IN", {
      weekday: "short", day: "numeric", month: "short", year: "numeric"
    }) + (isToday ? " (Today)" : "");

    const dateDisplayEl = document.getElementById("dateDisplayLabel");
    if (dateDisplayEl) dateDisplayEl.textContent = displayLabel;

    renderDashboard();
    renderDiary();
    renderWater();
  }

  function changeDayOffset(delta) {
    const cur = new Date(selectedDate + "T12:00:00");
    cur.setDate(cur.getDate() + delta);
    setDate(Storage.formatDate(cur));
  }

  // ---------------------------------------------------------------------------
  // Dashboard Calculations & Rendering
  // ---------------------------------------------------------------------------
  function getTotalsForDate(dateStr) {
    ensureDateStructures(dateStr);
    const dayMeals = state.diary[dateStr];
    let calories = 0, protein = 0, carbs = 0, fats = 0, fiber = 0;

    MEALS.forEach(meal => {
      (dayMeals[meal] || []).forEach(item => {
        calories += Number(item.calories) || 0;
        protein += Number(item.protein) || 0;
        carbs += Number(item.carbs) || 0;
        fats += Number(item.fats) || 0;
        fiber += Number(item.fiber) || 0;
      });
    });

    return {
      calories: Math.round(calories * 10) / 10,
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fats: Math.round(fats * 10) / 10,
      fiber: Math.round(fiber * 10) / 10
    };
  }

  function renderDashboard() {
    ensureDateStructures(selectedDate);
    const totals = getTotalsForDate(selectedDate);
    const goals = state.goals;

    // Calories
    const calEl = document.getElementById("dashCaloriesConsumed");
    if (calEl) calEl.textContent = Math.round(totals.calories);
    const goalEl = document.getElementById("dashCaloriesGoal");
    if (goalEl) goalEl.textContent = goals.calories;
    const remEl = document.getElementById("dashCaloriesRemaining");
    if (remEl) {
      const rem = Math.max(0, goals.calories - totals.calories);
      remEl.textContent = `${Math.round(rem)} kcal remaining`;
    }
    const calProg = document.getElementById("dashCaloriesProgress");
    if (calProg) {
      const pct = Math.min(100, (totals.calories / goals.calories) * 100);
      calProg.style.width = `${pct}%`;
    }

    // Macros
    const setMacro = (idNum, idProg, val, target) => {
      const el = document.getElementById(idNum);
      if (el) el.textContent = Math.round(val);
      const prog = document.getElementById(idProg);
      if (prog) {
        const pct = Math.min(100, (val / (target || 1)) * 100);
        prog.style.width = `${pct}%`;
      }
    };

    setMacro("dashProteinVal", "dashProteinProg", totals.protein, goals.protein);
    setMacro("dashCarbsVal", "dashCarbsProg", totals.carbs, goals.carbs);
    setMacro("dashFatsVal", "dashFatsProg", totals.fats, goals.fats);
    setMacro("dashFiberVal", "dashFiberProg", totals.fiber, goals.fiber);

    // Goal targets display
    const setTargetLabel = (id, target, unit) => {
      const el = document.getElementById(id);
      if (el) el.textContent = `Goal: ${target} ${unit}`;
    };
    setTargetLabel("dashProteinGoal", goals.protein, "g");
    setTargetLabel("dashCarbsGoal", goals.carbs, "g");
    setTargetLabel("dashFatsGoal", goals.fats, "g");
    setTargetLabel("dashFiberGoal", goals.fiber, "g");

    // Meal Breakdown Cards
    const mealBreakdownList = document.getElementById("dashMealBreakdown");
    if (mealBreakdownList) {
      mealBreakdownList.innerHTML = "";
      MEALS.forEach(meal => {
        const items = state.diary[selectedDate][meal] || [];
        const mealCal = items.reduce((s, i) => s + (Number(i.calories) || 0), 0);
        const mealP = items.reduce((s, i) => s + (Number(i.protein) || 0), 0);

        const card = document.createElement("div");
        card.className = "meal-pill-card";
        card.innerHTML = `
          <div class="meal-pill-header">
            <span>${MEAL_ICONS[meal]} <strong>${meal}</strong></span>
            <span class="meal-pill-cal">${Math.round(mealCal)} kcal</span>
          </div>
          <div class="meal-pill-sub">${items.length} ${items.length === 1 ? "item" : "items"} · ${Math.round(mealP)}g protein</div>
        `;
        card.onclick = () => {
          switchView("diary");
        };
        mealBreakdownList.appendChild(card);
      });
    }

    // Render Weekly Charts using real saved data
    renderWeeklyCharts();
    renderQuickAddPills();
  }

  function renderWeeklyCharts() {
    // Generate past 7 days data from selectedDate backwards
    const daysData = [];
    const baseDate = new Date(selectedDate + "T12:00:00");

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateStr = Storage.formatDate(d);
      const totals = getTotalsForDate(dateStr);
      const dayLabel = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
      daysData.push({
        label: dayLabel,
        date: dateStr,
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fats: totals.fats
      });
    }

    Charts.renderCalorieChart("weeklyCalorieCanvas", daysData, state.goals.calories);
    Charts.renderMacroChart("weeklyMacroCanvas", daysData, state.goals.protein);
  }

  function renderQuickAddPills() {
    const holder = document.getElementById("dashQuickAddList");
    if (!holder) return;
    holder.innerHTML = "";

    const quickPicks = [
      { text: "2 boiled eggs", meal: "Breakfast" },
      { text: "1 banana", meal: "Morning snack" },
      { text: "2 chapatis", meal: "Lunch" },
      { text: "1 katori dal", meal: "Lunch" },
      { text: "100 g paneer", meal: "Dinner" },
      { text: "200 ml milk", meal: "Dinner" }
    ];

    quickPicks.forEach(pick => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quick-pill-btn";
      btn.innerHTML = `+ ${pick.text}`;
      btn.onclick = () => {
        executeQuickAdd(pick.text, pick.meal);
      };
      holder.appendChild(btn);
    });
  }

  function executeQuickAdd(text, targetMeal) {
    if (isSubmitting) return;
    isSubmitting = true;

    const res = NutritionService.resolveQuery(text, { customFoods: state.customFoods });
    if (res.success && res.nutrition) {
      addFoodToDiary(res.nutrition, targetMeal || "Breakfast");
      Modals.showToast(`Added ${res.nutrition.servingQty} ${res.nutrition.servingUnit} ${res.nutrition.foodName} to ${targetMeal}!`);
    } else {
      // open search view pre-filled
      switchView("search");
      const searchInput = document.getElementById("foodSearchInput");
      if (searchInput) {
        searchInput.value = text;
        triggerFoodSearch(text);
      }
    }
    setTimeout(() => { isSubmitting = false; }, 300);
  }

  // ---------------------------------------------------------------------------
  // Food Search & Nutrition Calculator
  // ---------------------------------------------------------------------------
  function initSearchView() {
    const input = document.getElementById("foodSearchInput");
    if (input) {
      input.focus();
      if (!input.value.trim()) {
        renderSearchPresets();
      }
    }
  }

  function renderSearchPresets() {
    const holder = document.getElementById("searchSuggestions");
    if (!holder) return;
    holder.innerHTML = "";

    const presets = [
      "2 boiled eggs",
      "1 banana",
      "100 g cooked rice",
      "2 chapatis",
      "100 g paneer",
      "50 g soya chunks, dry",
      "1 cup dal",
      "200 ml milk",
      "1 plate vegetable pulao",
      "1 serving chicken biryani"
    ];

    const title = document.createElement("div");
    title.className = "suggestion-title";
    title.textContent = "Common Searches & Queries (Click to calculate):";
    holder.appendChild(title);

    const wrap = document.createElement("div");
    wrap.className = "preset-chips";
    presets.forEach(p => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "preset-chip";
      chip.textContent = p;
      chip.onclick = () => {
        const input = document.getElementById("foodSearchInput");
        if (input) input.value = p;
        triggerFoodSearch(p);
      };
      wrap.appendChild(chip);
    });
    holder.appendChild(wrap);
  }

  function triggerFoodSearch(rawQuery) {
    if (!rawQuery || !rawQuery.trim()) {
      renderSearchPresets();
      document.getElementById("foodCalculatorCard").hidden = true;
      return;
    }

    const res = NutritionService.resolveQuery(rawQuery, { customFoods: state.customFoods });
    const suggestionsHolder = document.getElementById("searchSuggestions");

    if (res.success && res.food) {
      activeSearchFood = res.food;
      displayCalculator(res.food, res.parsed.quantity, res.nutrition.servingUnit);

      // Show alternatives in suggestions box
      if (suggestionsHolder) {
        suggestionsHolder.innerHTML = "";
        if (res.alternatives.length > 0) {
          const altHeader = document.createElement("div");
          altHeader.className = "suggestion-title";
          altHeader.textContent = "Other matching foods:";
          suggestionsHolder.appendChild(altHeader);

          res.alternatives.forEach(alt => {
            const itemBtn = document.createElement("button");
            itemBtn.type = "button";
            itemBtn.className = "suggestion-item";
            itemBtn.innerHTML = `<strong>${alt.name}</strong> <span class="alt-sub">${alt.source}</span>`;
            itemBtn.onclick = () => {
              activeSearchFood = alt;
              displayCalculator(alt, 1, alt.defaultUnit);
            };
            suggestionsHolder.appendChild(itemBtn);
          });
        }
      }
    } else {
      // No direct match
      if (suggestionsHolder) {
        suggestionsHolder.innerHTML = `
          <div class="empty-state">
            <p>No verified food found for "<strong>${rawQuery}</strong>".</p>
            <p class="small muted">Try checking spelling, or try: <em>banana, boiled eggs, cooked rice, chapatis, dal, milk, paneer, soya chunks</em>.</p>
            <button type="button" class="secondary-btn" id="openCustomFoodBtn">+ Create custom food entry</button>
          </div>
        `;
        const customBtn = document.getElementById("openCustomFoodBtn");
        if (customBtn) {
          customBtn.onclick = () => openCustomFoodModal(rawQuery);
        }
      }
      document.getElementById("foodCalculatorCard").hidden = true;
    }
  }

  function displayCalculator(food, qty, unit) {
    const card = document.getElementById("foodCalculatorCard");
    if (!card) return;
    card.hidden = false;

    document.getElementById("calcFoodName").textContent = food.name;
    document.getElementById("calcFoodHindi").textContent = food.hindiName || "";
    document.getElementById("calcFoodSource").textContent = `Source: ${food.source}`;
    document.getElementById("calcFoodNotes").textContent = food.notes || "";

    const qtyInput = document.getElementById("calcQtyInput");
    qtyInput.value = qty || food.defaultQty || 1;

    // Populate units dropdown
    const unitSelect = document.getElementById("calcUnitSelect");
    unitSelect.innerHTML = "";

    const supported = food.supportedUnits ? Object.keys(food.supportedUnits) : [food.defaultUnit || "piece"];
    supported.forEach(u => {
      const opt = document.createElement("option");
      opt.value = u;
      opt.textContent = u;
      if (u === unit) opt.selected = true;
      unitSelect.appendChild(opt);
    });

    // Make sure 'g' is an option
    if (!supported.includes("g")) {
      const gOpt = document.createElement("option");
      gOpt.value = "g";
      gOpt.textContent = "g (grams)";
      unitSelect.appendChild(gOpt);
    }

    updateCalculatorValues();
  }

  function updateCalculatorValues() {
    if (!activeSearchFood) return;
    const qty = parseFloat(document.getElementById("calcQtyInput").value) || 1;
    const unit = document.getElementById("calcUnitSelect").value;

    const nut = NutritionService.calculateNutrition(activeSearchFood, qty, unit);
    if (!nut) return;

    document.getElementById("calcCalVal").textContent = nut.calories;
    document.getElementById("calcProteinVal").textContent = `${nut.protein}g`;
    document.getElementById("calcCarbsVal").textContent = `${nut.carbs}g`;
    document.getElementById("calcFatsVal").textContent = `${nut.fats}g`;
    document.getElementById("calcFiberVal").textContent = `${nut.fiber}g`;
    document.getElementById("calcSugarVal").textContent = `${nut.sugar}g`;
    document.getElementById("calcSodiumVal").textContent = `${nut.sodium}mg`;
    document.getElementById("calcGramsVal").textContent = `(~${nut.grams} g total weight)`;

    // Save current calculation on button dataset
    const addBtn = document.getElementById("calcAddBtn");
    if (addBtn) {
      addBtn.dataset.calcPayload = JSON.stringify(nut);
    }
  }

  // ---------------------------------------------------------------------------
  // Food Diary Operations
  // ---------------------------------------------------------------------------
  function addFoodToDiary(nutritionPayload, targetMeal) {
    ensureDateStructures(selectedDate);
    const meal = targetMeal || "Breakfast";

    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      foodId: nutritionPayload.foodId || "custom",
      foodName: nutritionPayload.foodName,
      category: nutritionPayload.category || "other",
      servingQty: nutritionPayload.servingQty,
      servingUnit: nutritionPayload.servingUnit,
      grams: nutritionPayload.grams,
      calories: nutritionPayload.calories,
      protein: nutritionPayload.protein,
      carbs: nutritionPayload.carbs,
      fats: nutritionPayload.fats,
      fiber: nutritionPayload.fiber || 0,
      sugar: nutritionPayload.sugar || 0,
      sodium: nutritionPayload.sodium || 0,
      source: nutritionPayload.source || "NutriTrack",
      timestamp: Date.now()
    };

    state.diary[selectedDate][meal].push(entry);
    Storage.saveState(state);
    renderDiary();
    renderDashboard();
  }

  function deleteDiaryEntry(meal, entryId) {
    ensureDateStructures(selectedDate);
    const items = state.diary[selectedDate][meal] || [];
    const index = items.findIndex(i => i.id === entryId);
    if (index === -1) return;

    const deletedItem = items[index];
    items.splice(index, 1);
    Storage.saveState(state);
    renderDiary();
    renderDashboard();

    // Show undo toast
    Modals.showToast(`Deleted ${deletedItem.foodName}`, {
      onUndo: () => {
        items.splice(index, 0, deletedItem);
        Storage.saveState(state);
        renderDiary();
        renderDashboard();
        Modals.showToast(`Restored ${deletedItem.foodName}!`);
      }
    });
  }

  function openEditEntryModal(meal, entryId) {
    ensureDateStructures(selectedDate);
    const entry = (state.diary[selectedDate][meal] || []).find(i => i.id === entryId);
    if (!entry) return;

    document.getElementById("editEntryName").textContent = entry.foodName;
    document.getElementById("editEntryQty").value = entry.servingQty;
    document.getElementById("editEntryUnit").value = entry.servingUnit;
    document.getElementById("editEntryMeal").value = meal;
    document.getElementById("editEntryId").value = entryId;
    document.getElementById("editEntryOriginalMeal").value = meal;

    Modals.openModal("modalEditEntry");
  }

  function saveEditedEntry() {
    const entryId = document.getElementById("editEntryId").value;
    const origMeal = document.getElementById("editEntryOriginalMeal").value;
    const newMeal = document.getElementById("editEntryMeal").value;
    const newQty = parseFloat(document.getElementById("editEntryQty").value) || 1;

    ensureDateStructures(selectedDate);
    const origItems = state.diary[selectedDate][origMeal] || [];
    const idx = origItems.findIndex(i => i.id === entryId);
    if (idx === -1) return;

    const item = origItems[idx];
    const ratio = newQty / (item.servingQty || 1);

    item.servingQty = newQty;
    item.calories = Math.round(item.calories * ratio * 10) / 10;
    item.protein = Math.round(item.protein * ratio * 10) / 10;
    item.carbs = Math.round(item.carbs * ratio * 10) / 10;
    item.fats = Math.round(item.fats * ratio * 10) / 10;
    item.fiber = Math.round(item.fiber * ratio * 10) / 10;
    item.grams = Math.round(item.grams * ratio * 10) / 10;

    if (origMeal !== newMeal) {
      origItems.splice(idx, 1);
      state.diary[selectedDate][newMeal].push(item);
    }

    Storage.saveState(state);
    Modals.closeActiveModal();
    renderDiary();
    renderDashboard();
    Modals.showToast("Updated diary entry!");
  }

  function renderDiary() {
    ensureDateStructures(selectedDate);
    const diaryContainer = document.getElementById("diaryMealsList");
    if (!diaryContainer) return;
    diaryContainer.innerHTML = "";

    let dayHasFoods = false;

    MEALS.forEach(meal => {
      const items = state.diary[selectedDate][meal] || [];
      if (items.length > 0) dayHasFoods = true;

      const mealCal = items.reduce((s, i) => s + (Number(i.calories) || 0), 0);
      const mealP = items.reduce((s, i) => s + (Number(i.protein) || 0), 0);
      const mealC = items.reduce((s, i) => s + (Number(i.carbs) || 0), 0);
      const mealF = items.reduce((s, i) => s + (Number(i.fats) || 0), 0);

      const section = document.createElement("section");
      section.className = "card meal-diary-card";
      section.innerHTML = `
        <div class="meal-diary-header">
          <div>
            <h3>${MEAL_ICONS[meal]} ${meal}</h3>
            <span class="meal-macros-sub">${Math.round(mealP)}g P · ${Math.round(mealC)}g C · ${Math.round(mealF)}g F</span>
          </div>
          <div class="meal-header-right">
            <span class="meal-cal-badge">${Math.round(mealCal)} kcal</span>
            <button type="button" class="add-meal-item-btn" data-meal="${meal}" title="Add food to ${meal}">+ Add</button>
          </div>
        </div>
        <div class="meal-items-wrap">
          ${items.length === 0 ? `<p class="empty-meal-hint">No food logged for ${meal}.</p>` : ""}
          ${items.map(item => `
            <div class="diary-food-row" data-id="${item.id}">
              <div class="food-info-col">
                <strong>${item.foodName}</strong>
                <span class="food-qty-label">${item.servingQty} ${item.servingUnit} (~${item.grams}g)</span>
              </div>
              <div class="food-macros-col">
                <span>P: ${item.protein}g</span>
                <span>C: ${item.carbs}g</span>
                <span>F: ${item.fats}g</span>
              </div>
              <div class="food-cal-col">${item.calories} kcal</div>
              <div class="food-actions-col">
                <button type="button" class="btn-icon edit-entry-btn" data-meal="${meal}" data-id="${item.id}" title="Edit entry">✏️</button>
                <button type="button" class="btn-icon delete-entry-btn" data-meal="${meal}" data-id="${item.id}" title="Delete entry">🗑️</button>
              </div>
            </div>
          `).join("")}
        </div>
      `;

      diaryContainer.appendChild(section);
    });

    // Attach event listeners for add, edit, delete
    diaryContainer.querySelectorAll(".add-meal-item-btn").forEach(btn => {
      btn.onclick = () => {
        const meal = btn.dataset.meal;
        switchView("search");
        const mealSelect = document.getElementById("calcMealSelect");
        if (mealSelect) mealSelect.value = meal;
      };
    });

    diaryContainer.querySelectorAll(".edit-entry-btn").forEach(btn => {
      btn.onclick = () => openEditEntryModal(btn.dataset.meal, btn.dataset.id);
    });

    diaryContainer.querySelectorAll(".delete-entry-btn").forEach(btn => {
      btn.onclick = () => deleteDiaryEntry(btn.dataset.meal, btn.dataset.id);
    });

    const dayTotals = getTotalsForDate(selectedDate);
    const dayTotalsEl = document.getElementById("diaryDayTotalsSummary");
    if (dayTotalsEl) {
      dayTotalsEl.innerHTML = `
        <strong>Day Total:</strong> ${Math.round(dayTotals.calories)} kcal | 
        Protein: ${Math.round(dayTotals.protein)}g | 
        Carbs: ${Math.round(dayTotals.carbs)}g | 
        Fats: ${Math.round(dayTotals.fats)}g | 
        Fiber: ${Math.round(dayTotals.fiber)}g
      `;
    }
  }

  // ---------------------------------------------------------------------------
  // Water Tracker
  // ---------------------------------------------------------------------------
  function renderWater() {
    ensureDateStructures(selectedDate);
    const waterData = state.water[selectedDate];
    const goalMl = state.goals.waterMl || 2000;

    const countEl = document.getElementById("waterAmountDisplay");
    if (countEl) countEl.textContent = `${waterData.ml} ml`;

    const goalDisplayEl = document.getElementById("waterGoalDisplay");
    if (goalDisplayEl) goalDisplayEl.textContent = `/ ${goalMl} ml`;

    const glassesHolder = document.getElementById("waterGlassesHolder");
    if (glassesHolder) {
      glassesHolder.innerHTML = "";
      const totalGlasses = Math.max(8, Math.round(goalMl / 250));
      const filledGlasses = Math.round(waterData.ml / 250);

      for (let i = 0; i < totalGlasses; i++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `glass-btn ${i < filledGlasses ? "filled" : ""}`;
        btn.innerHTML = "💧";
        btn.title = `${(i + 1) * 250} ml`;
        btn.onclick = () => {
          setWaterIntake((i + 1) * 250);
        };
        glassesHolder.appendChild(btn);
      }
    }
  }

  function addWaterMl(delta) {
    ensureDateStructures(selectedDate);
    const current = state.water[selectedDate].ml;
    setWaterIntake(Math.max(0, current + delta));
  }

  function setWaterIntake(totalMl) {
    ensureDateStructures(selectedDate);
    state.water[selectedDate].ml = totalMl;
    state.water[selectedDate].glasses = Math.round(totalMl / 250);
    Storage.saveState(state);
    renderWater();
  }

  // ---------------------------------------------------------------------------
  // Smart NLP Food Entry
  // ---------------------------------------------------------------------------
  function handleSmartLogInput() {
    const input = document.getElementById("smartLogInput");
    if (!input || !input.value.trim()) return;

    const sentence = input.value.trim();
    const parsed = Parser.parseSmartMealSentence(sentence);

    const container = document.getElementById("smartLogReviewCards");
    container.innerHTML = "";

    const results = [];

    parsed.items.forEach((item, index) => {
      const res = NutritionService.resolveQuery(item.foodQuery, { customFoods: state.customFoods });
      let nut = null;
      if (res.success && res.food) {
        nut = NutritionService.calculateNutrition(res.food, item.quantity, item.unit || res.food.defaultUnit);
      }

      results.push({
        rawText: item.raw,
        parsedItem: item,
        matchedFood: res.food || null,
        nutrition: nut,
        enabled: nut !== null
      });

      const card = document.createElement("div");
      card.className = `smart-review-card ${nut ? "matched" : "unmatched"}`;
      card.innerHTML = `
        <label class="smart-item-toggle">
          <input type="checkbox" id="smartCheck-${index}" ${nut ? "checked" : "disabled"}>
          <div class="smart-item-details">
            <span class="smart-item-orig">"${item.raw}"</span>
            ${nut ? `
              <div class="smart-item-match">
                ✅ Matched: <strong>${nut.foodName}</strong> (${nut.servingQty} ${nut.servingUnit})
                <span class="smart-match-nut">${nut.calories} kcal · ${nut.protein}g protein</span>
              </div>
            ` : `
              <div class="smart-item-unmatched">
                ⚠️ Could not identify food in database. You can add it manually.
              </div>
            `}
          </div>
        </label>
      `;
      container.appendChild(card);
    });

    smartLogParsed = {
      meal: parsed.meal,
      results: results
    };

    document.getElementById("smartLogMealSelect").value = parsed.meal;
    document.getElementById("smartLogReviewSection").hidden = false;
  }

  function commitSmartLog() {
    if (!smartLogParsed || !smartLogParsed.results) return;
    const targetMeal = document.getElementById("smartLogMealSelect").value || smartLogParsed.meal;

    let addedCount = 0;
    smartLogParsed.results.forEach((item, index) => {
      const checkbox = document.getElementById(`smartCheck-${index}`);
      if (checkbox && checkbox.checked && item.nutrition) {
        addFoodToDiary(item.nutrition, targetMeal);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      Modals.showToast(`Logged ${addedCount} items to ${targetMeal}!`);
      document.getElementById("smartLogInput").value = "";
      document.getElementById("smartLogReviewSection").hidden = true;
      switchView("diary");
    } else {
      Modals.showToast("No confirmed items were selected to log.");
    }
  }

  // ---------------------------------------------------------------------------
  // Recipe Builder
  // ---------------------------------------------------------------------------
  function renderRecipeList() {
    const list = document.getElementById("savedRecipesList");
    if (!list) return;
    list.innerHTML = "";

    const presets = [
      {
        id: "preset-dal-tadka",
        name: "Home Dal Tadka (4 Servings)",
        servings: 4,
        ingredients: [
          { foodId: "dal-tadka-toor", name: "Dal Tadka (Cooked)", qty: 600, unit: "g" },
          { foodId: "tomato-raw", name: "Tomato", qty: 100, unit: "g" },
          { foodId: "onion-raw", name: "Onion", qty: 80, unit: "g" }
        ],
        notes: "Standard toor dal recipe with tomato onion tadka."
      },
      {
        id: "preset-poha",
        name: "Vegetable Poha (2 Servings)",
        servings: 2,
        ingredients: [
          { foodId: "vegetable-poha", name: "Vegetable Poha", qty: 320, unit: "g" },
          { foodId: "roasted-peanuts", name: "Roasted Peanuts", qty: 20, unit: "g" }
        ],
        notes: "Flattened rice breakfast with peanuts."
      }
    ];

    const allRecipes = [...presets, ...(state.recipes || [])];

    allRecipes.forEach(rec => {
      const card = document.createElement("div");
      card.className = "card recipe-card";

      // Calculate total nutrition
      const nutCalc = NutritionService.calculateRecipeNutrition(rec.ingredients, rec.servings, { customFoods: state.customFoods });

      card.innerHTML = `
        <div class="recipe-card-header">
          <div>
            <h4>${rec.name}</h4>
            <span class="small muted">${rec.servings} servings · ${rec.ingredients.length} ingredients</span>
          </div>
          <button type="button" class="primary-btn log-recipe-btn" data-id="${rec.id}">+ Log 1 Serving</button>
        </div>
        <div class="recipe-nut-bar">
          <span><strong>Per serving:</strong> ${nutCalc.perServing.calories} kcal</span>
          <span>P: ${nutCalc.perServing.protein}g</span>
          <span>C: ${nutCalc.perServing.carbs}g</span>
          <span>F: ${nutCalc.perServing.fats}g</span>
        </div>
      `;

      card.querySelector(".log-recipe-btn").onclick = () => {
        addFoodToDiary({
          foodId: rec.id,
          foodName: `${rec.name} (1 serving)`,
          category: "dishes",
          servingQty: 1,
          servingUnit: "serving",
          grams: nutCalc.perServing.grams,
          calories: nutCalc.perServing.calories,
          protein: nutCalc.perServing.protein,
          carbs: nutCalc.perServing.carbs,
          fats: nutCalc.perServing.fats,
          fiber: nutCalc.perServing.fiber,
          sugar: nutCalc.perServing.sugar,
          sodium: nutCalc.perServing.sodium,
          source: "Custom Recipe"
        }, "Lunch");
        Modals.showToast(`Logged 1 serving of ${rec.name} to Lunch!`);
      };

      list.appendChild(card);
    });
  }

  function openRecipeBuilderModal() {
    recipeIngredients = [];
    document.getElementById("newRecipeName").value = "";
    document.getElementById("newRecipeServings").value = 2;
    renderRecipeIngredientsTable();
    Modals.openModal("modalRecipeBuilder");
  }

  function renderRecipeIngredientsTable() {
    const list = document.getElementById("recipeIngredientsList");
    if (!list) return;
    list.innerHTML = "";

    recipeIngredients.forEach((ing, idx) => {
      const row = document.createElement("div");
      row.className = "recipe-ing-row";
      row.innerHTML = `
        <span>${ing.name}</span>
        <span>${ing.quantity} ${ing.unit}</span>
        <span>${ing.calories} kcal</span>
        <button type="button" class="btn-icon" data-idx="${idx}">×</button>
      `;
      row.querySelector("button").onclick = () => {
        recipeIngredients.splice(idx, 1);
        renderRecipeIngredientsTable();
      };
      list.appendChild(row);
    });

    const servings = parseFloat(document.getElementById("newRecipeServings").value) || 1;
    const calc = NutritionService.calculateRecipeNutrition(recipeIngredients, servings, { customFoods: state.customFoods });

    const totalEl = document.getElementById("recipeTotalStats");
    if (totalEl) {
      totalEl.innerHTML = `
        <strong>Total:</strong> ${calc.total.calories} kcal | ${calc.total.protein}g P | ${calc.total.carbs}g C | ${calc.total.fats}g F<br>
        <strong>Per Serving:</strong> ${calc.perServing.calories} kcal | ${calc.perServing.protein}g P | ${calc.perServing.carbs}g C | ${calc.perServing.fats}g F
      `;
    }
  }

  function addIngredientToRecipe() {
    const name = document.getElementById("recipeIngSearch").value.trim();
    const qty = parseFloat(document.getElementById("recipeIngQty").value) || 1;
    const unit = document.getElementById("recipeIngUnit").value;

    if (!name) return;

    const res = NutritionService.resolveQuery(name, { customFoods: state.customFoods });
    if (!res.success || !res.food) {
      alert("Could not identify ingredient in database. Please check spelling.");
      return;
    }

    const nut = NutritionService.calculateNutrition(res.food, qty, unit);
    recipeIngredients.push({
      foodId: res.food.id,
      name: res.food.name,
      quantity: qty,
      unit: unit,
      calories: nut.calories,
      protein: nut.protein,
      carbs: nut.carbs,
      fats: nut.fats,
      fiber: nut.fiber,
      grams: nut.grams
    });

    document.getElementById("recipeIngSearch").value = "";
    document.getElementById("recipeIngQty").value = 100;
    renderRecipeIngredientsTable();
  }

  function saveNewRecipe() {
    const name = document.getElementById("newRecipeName").value.trim();
    const servings = parseInt(document.getElementById("newRecipeServings").value) || 1;

    if (!name) {
      alert("Please provide a recipe name.");
      return;
    }
    if (recipeIngredients.length === 0) {
      alert("Please add at least one ingredient.");
      return;
    }

    const newRec = {
      id: `recipe-${Date.now()}`,
      name: name,
      servings: servings,
      ingredients: recipeIngredients
    };

    state.recipes.push(newRec);
    Storage.saveState(state);
    Modals.closeActiveModal();
    renderRecipeList();
    Modals.showToast(`Saved recipe "${name}"!`);
  }

  // ---------------------------------------------------------------------------
  // Weight & Progress
  // ---------------------------------------------------------------------------
  function renderProgressView() {
    const dateInput = document.getElementById("weightLogDate");
    if (dateInput) dateInput.value = selectedDate;

    renderWeightHistoryTable();
    Charts.renderWeightChart("weightHistoryCanvas", state.weightHistory);
  }

  function renderWeightHistoryTable() {
    const tbody = document.getElementById("weightHistoryTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (state.weightHistory.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center muted">No weight entries logged yet.</td></tr>`;
      return;
    }

    // Sort descending by date
    const sorted = [...state.weightHistory].sort((a, b) => b.date.localeCompare(a.date));

    sorted.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.date}</td>
        <td><strong>${item.weight} kg</strong></td>
        <td>${item.note || "—"}</td>
        <td><button type="button" class="btn-icon delete-weight-btn" data-id="${item.id}">🗑️</button></td>
      `;
      tr.querySelector(".delete-weight-btn").onclick = () => {
        state.weightHistory = state.weightHistory.filter(h => h.id !== item.id);
        Storage.saveState(state);
        renderProgressView();
        Modals.showToast("Deleted weight entry.");
      };
      tbody.appendChild(tr);
    });
  }

  function addWeightEntry() {
    const weightVal = parseFloat(document.getElementById("weightInputVal").value);
    const dateVal = document.getElementById("weightLogDate").value || selectedDate;
    const noteVal = document.getElementById("weightNoteInput").value.trim();

    if (!weightVal || weightVal < 25 || weightVal > 300) {
      alert("Please enter a realistic weight in kg (between 25 and 300).");
      return;
    }

    state.weightHistory.push({
      id: `wt-${Date.now()}`,
      date: dateVal,
      weight: Math.round(weightVal * 10) / 10,
      note: noteVal
    });

    // Also update profile current weight
    state.profile.weightKg = weightVal;

    Storage.saveState(state);
    document.getElementById("weightInputVal").value = "";
    document.getElementById("weightNoteInput").value = "";
    renderProgressView();
    Modals.showToast(`Logged ${weightVal} kg on ${dateVal}!`);
  }

  // ---------------------------------------------------------------------------
  // Profile & Goal Calculations
  // ---------------------------------------------------------------------------
  function renderProfileView() {
    const prof = state.profile;
    const goals = state.goals;

    document.getElementById("profileName").value = prof.name || "";
    document.getElementById("profileAge").value = prof.age || 24;
    document.getElementById("profileGender").value = prof.gender || "female";
    document.getElementById("profileHeight").value = prof.heightCm || 165;
    document.getElementById("profileWeight").value = prof.weightKg || 60;
    document.getElementById("profileActivity").value = prof.activityLevel || "moderate";
    document.getElementById("profileGoal").value = prof.goal || "maintain";
    document.getElementById("profileDiet").value = prof.dietPreference || "vegetarian";

    document.getElementById("goalCalories").value = goals.calories;
    document.getElementById("goalProtein").value = goals.protein;
    document.getElementById("goalCarbs").value = goals.carbs;
    document.getElementById("goalFats").value = goals.fats;
    document.getElementById("goalFiber").value = goals.fiber;
    document.getElementById("goalWater").value = goals.waterMl;

    document.getElementById("usdaApiKeyInput").value = state.settings.usdaApiKey || "";
  }

  function runProfileCalculator() {
    const prof = {
      age: parseInt(document.getElementById("profileAge").value) || 24,
      gender: document.getElementById("profileGender").value,
      heightCm: parseFloat(document.getElementById("profileHeight").value) || 165,
      weightKg: parseFloat(document.getElementById("profileWeight").value) || 60,
      activityLevel: document.getElementById("profileActivity").value,
      goal: document.getElementById("profileGoal").value
    };

    const calc = Storage.calculateBMRAndTDEE(prof);

    document.getElementById("goalCalories").value = calc.targetCalories;
    document.getElementById("goalProtein").value = calc.proteinGrams;
    document.getElementById("goalCarbs").value = calc.carbGrams;
    document.getElementById("goalFats").value = calc.fatGrams;
    document.getElementById("goalFiber").value = calc.fiberGrams;
    document.getElementById("goalWater").value = calc.waterMl;

    const explainEl = document.getElementById("calculatorExplanation");
    if (explainEl) {
      explainEl.hidden = false;
      explainEl.innerHTML = `
        <strong>Calculated Targets (Mifflin-St Jeor):</strong><br>
        • Basal Metabolic Rate (BMR): <strong>${calc.bmr} kcal</strong><br>
        • Total Daily Energy Expenditure (TDEE): <strong>${calc.tdee} kcal</strong><br>
        • Target Calorie Intake: <strong>${calc.targetCalories} kcal</strong> (${prof.goal.toUpperCase()})<br>
        <span class="small muted">${calc.disclaimer}</span>
      `;
    }
  }

  function saveProfileAndGoals() {
    state.profile.name = document.getElementById("profileName").value.trim() || "User";
    state.profile.age = parseInt(document.getElementById("profileAge").value) || 24;
    state.profile.gender = document.getElementById("profileGender").value;
    state.profile.heightCm = parseFloat(document.getElementById("profileHeight").value) || 165;
    state.profile.weightKg = parseFloat(document.getElementById("profileWeight").value) || 60;
    state.profile.activityLevel = document.getElementById("profileActivity").value;
    state.profile.goal = document.getElementById("profileGoal").value;
    state.profile.dietPreference = document.getElementById("profileDiet").value;

    state.goals.calories = parseInt(document.getElementById("goalCalories").value) || 2000;
    state.goals.protein = parseInt(document.getElementById("goalProtein").value) || 100;
    state.goals.carbs = parseInt(document.getElementById("goalCarbs").value) || 250;
    state.goals.fats = parseInt(document.getElementById("goalFats").value) || 65;
    state.goals.fiber = parseInt(document.getElementById("goalFiber").value) || 28;
    state.goals.waterMl = parseInt(document.getElementById("goalWater").value) || 2000;

    state.settings.usdaApiKey = document.getElementById("usdaApiKeyInput").value.trim();

    Storage.saveState(state);
    renderDashboard();
    Modals.showToast("Profile and targets saved!");
  }

  // ---------------------------------------------------------------------------
  // Custom Food Creator Modal
  // ---------------------------------------------------------------------------
  function openCustomFoodModal(prefillName) {
    document.getElementById("customFoodName").value = prefillName || "";
    document.getElementById("customFoodCalories").value = 150;
    document.getElementById("customFoodProtein").value = 5;
    document.getElementById("customFoodCarbs").value = 20;
    document.getElementById("customFoodFats").value = 3;
    document.getElementById("customFoodFiber").value = 1;
    Modals.openModal("modalCustomFood");
  }

  function saveCustomFood() {
    const name = document.getElementById("customFoodName").value.trim();
    if (!name) {
      alert("Please provide a food name.");
      return;
    }

    const cal = parseFloat(document.getElementById("customFoodCalories").value) || 0;
    const p = parseFloat(document.getElementById("customFoodProtein").value) || 0;
    const c = parseFloat(document.getElementById("customFoodCarbs").value) || 0;
    const f = parseFloat(document.getElementById("customFoodFats").value) || 0;
    const fib = parseFloat(document.getElementById("customFoodFiber").value) || 0;

    const newFood = {
      id: `custom-${Date.now()}`,
      name: name,
      category: "custom",
      state: "cooked",
      defaultUnit: "serving",
      defaultQty: 1,
      servingGrams: 100,
      servingLabel: "1 serving (100g)",
      supportedUnits: { "serving": 100, "g": 1 },
      per100g: {
        calories: cal,
        protein: p,
        carbs: c,
        fats: f,
        fiber: fib,
        sugar: 0,
        sodium: 100
      },
      aliases: [name.toLowerCase()],
      source: "User Custom Food",
      notes: "Custom food item added by user."
    };

    state.customFoods.push(newFood);
    Storage.saveState(state);
    Modals.closeActiveModal();
    Modals.showToast(`Saved custom food "${name}"!`);

    activeSearchFood = newFood;
    displayCalculator(newFood, 1, "serving");
  }

  // ---------------------------------------------------------------------------
  // Initialization & Event Binding
  // ---------------------------------------------------------------------------
  function initApp() {
    // Nav links
    document.querySelectorAll(".nav-link").forEach(btn => {
      btn.addEventListener("click", () => switchView(btn.dataset.view));
    });

    // Mobile nav toggle
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", () => {
        document.getElementById("mainNav").classList.toggle("open");
      });
    }

    // Date controls
    document.getElementById("prevDayBtn").onclick = () => changeDayOffset(-1);
    document.getElementById("nextDayBtn").onclick = () => changeDayOffset(1);
    document.getElementById("todayDayBtn").onclick = () => setDate(Storage.formatDate(new Date()));
    document.getElementById("currentDateInput").onchange = (e) => setDate(e.target.value);

    // Food search input live debounce
    let searchTimer = null;
    const searchInput = document.getElementById("foodSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => triggerFoodSearch(e.target.value), 250);
      });
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          clearTimeout(searchTimer);
          triggerFoodSearch(searchInput.value);
        }
      });
    }

    // Calculator quantity & unit controls
    document.getElementById("calcQtyInput").addEventListener("input", updateCalculatorValues);
    document.getElementById("calcUnitSelect").addEventListener("change", updateCalculatorValues);

    document.getElementById("calcAddBtn").addEventListener("click", () => {
      if (!activeSearchFood) return;
      const payloadStr = document.getElementById("calcAddBtn").dataset.calcPayload;
      if (!payloadStr) return;
      const nut = JSON.parse(payloadStr);
      const targetMeal = document.getElementById("calcMealSelect").value;
      addFoodToDiary(nut, targetMeal);
      Modals.showToast(`Added ${nut.servingQty} ${nut.servingUnit} ${nut.foodName} to ${targetMeal}!`);
      switchView("diary");
    });

    // Water quick buttons
    document.getElementById("waterAdd250").onclick = () => addWaterMl(250);
    document.getElementById("waterAdd500").onclick = () => addWaterMl(500);
    document.getElementById("waterSub250").onclick = () => addWaterMl(-250);
    document.getElementById("waterResetBtn").onclick = () => setWaterIntake(0);

    // Smart Log buttons
    document.getElementById("smartLogSubmitBtn").onclick = handleSmartLogInput;
    document.getElementById("smartLogCommitBtn").onclick = commitSmartLog;

    // Smart prompt pill helpers
    document.querySelectorAll(".smart-pill").forEach(pill => {
      pill.onclick = () => {
        const inp = document.getElementById("smartLogInput");
        inp.value = pill.textContent.replace(/^"|"$/g, "");
        handleSmartLogInput();
      };
    });

    // Recipe Builder buttons
    document.getElementById("openRecipeBuilderBtn").onclick = openRecipeBuilderModal;
    document.getElementById("recipeAddIngBtn").onclick = addIngredientToRecipe;
    document.getElementById("recipeSaveBtn").onclick = saveNewRecipe;
    document.getElementById("newRecipeServings").addEventListener("input", renderRecipeIngredientsTable);

    // Weight logger
    document.getElementById("saveWeightBtn").onclick = addWeightEntry;

    // Profile & Goal buttons
    document.getElementById("calculateGoalsBtn").onclick = runProfileCalculator;
    document.getElementById("saveProfileBtn").onclick = saveProfileAndGoals;

    // Custom Food Modal save
    document.getElementById("saveCustomFoodBtn").onclick = saveCustomFood;

    // Edit Entry Modal save
    document.getElementById("saveEditEntryBtn").onclick = saveEditedEntry;

    // Modal Close buttons
    document.querySelectorAll(".modal-close-btn").forEach(btn => {
      btn.onclick = Modals.closeActiveModal;
    });

    // Demo Data & Backup controls
    document.getElementById("loadDemoDataBtn").onclick = () => {
      const confirmLoad = confirm("Load 7 days of realistic demo diary, water, and weight data? This will overwrite existing records.");
      if (confirmLoad) {
        state = Storage.loadDemoData();
        setDate(Storage.formatDate(new Date()));
        Modals.showToast("Loaded 7-day demo data successfully!");
      }
    };

    document.getElementById("exportDataBtn").onclick = () => {
      Storage.exportDataAsJSON(state);
      Modals.showToast("Downloaded data backup JSON.");
    };

    document.getElementById("importFileInput").onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = Storage.importDataFromJSON(event.target.result);
        if (res.success) {
          state = res.state;
          setDate(Storage.formatDate(new Date()));
          Modals.showToast("Imported data successfully!");
        } else {
          alert(`Import failed: ${res.error}`);
        }
      };
      reader.readAsText(file);
    };

    document.getElementById("resetAllDataBtn").onclick = () => {
      const confirmed = confirm("Are you sure you want to reset all data to defaults? This cannot be undone.");
      if (confirmed) {
        localStorage.removeItem("nutritrack_v2_data");
        state = Storage.loadState();
        setDate(Storage.formatDate(new Date()));
        Modals.showToast("Reset all data to default state.");
      }
    };

    // Responsive window resize for charts
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (currentView === "dashboard") renderWeeklyCharts();
        if (currentView === "progress") Charts.renderWeightChart("weightHistoryCanvas", state.weightHistory);
      }, 200);
    });

    // Initial render
    setDate(selectedDate);
    switchView("dashboard");
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }

})();
