/**
 * NutriTrack Persistent Storage & State Management
 * - Versioned localStorage (nutritrack_v2_data)
 * - Seamless migration from v1 (nutritrackData)
 * - Mifflin-St Jeor TDEE & macro target calculator
 * - JSON Export & Import with schema validation
 * - Demo data loader for college portfolio presentations
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.NutriTrack = root.NutriTrack || {};
    root.NutriTrack.Storage = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const STORAGE_KEY_V2 = "nutritrack_v2_data";
  const STORAGE_KEY_V1 = "nutritrackData";

  const DEFAULT_STATE = {
    version: 2,
    profile: {
      name: "Wellness Seeker",
      age: 23,
      gender: "female",
      heightCm: 165,
      weightKg: 60,
      activityLevel: "moderate", // sedentary, light, moderate, active, very_active
      goal: "maintain", // lose, maintain, gain
      dietPreference: "vegetarian", // vegetarian, vegan, eggetarian, non_vegetarian
      units: "metric" // metric, imperial
    },
    goals: {
      calories: 2000,
      protein: 100,
      carbs: 250,
      fats: 65,
      fiber: 28,
      waterMl: 2000,
      calculatedBy: "mifflin_st_jeor"
    },
    diary: {}, // 'YYYY-MM-DD': { Breakfast: [], "Morning snack": [], Lunch: [], "Evening snack": [], Dinner: [] }
    water: {}, // 'YYYY-MM-DD': { ml: 0, glasses: 0, entries: [] }
    weightHistory: [], // [{ id, date: 'YYYY-MM-DD', weight: 60.0, note: '' }]
    customFoods: [],
    recipes: [],
    settings: {
      usdaApiKey: ""
    }
  };

  /**
   * Helper to format a Date object as 'YYYY-MM-DD' in local timezone.
   */
  function formatDate(d) {
    const date = d instanceof Date ? d : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Mifflin-St Jeor Basal Metabolic Rate (BMR) & Total Daily Energy Expenditure (TDEE).
   * Calculates evidence-based calorie & macronutrient targets.
   */
  function calculateBMRAndTDEE(profile) {
    const age = Math.max(15, Math.min(100, Number(profile.age) || 24));
    const weight = Math.max(30, Math.min(300, Number(profile.weightKg) || 60));
    const height = Math.max(100, Math.min(250, Number(profile.heightCm) || 165));
    const gender = (profile.gender || "female").toLowerCase();
    const activity = profile.activityLevel || "moderate";
    const goal = profile.goal || "maintain";

    // 1. Mifflin-St Jeor BMR equation:
    // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
    // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === "male") {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // 2. Activity Multiplier
    const multipliers = {
      "sedentary": 1.2,      // Little or no exercise, desk job
      "light": 1.375,        // Light exercise 1-3 days/week
      "moderate": 1.55,      // Moderate exercise 3-5 days/week
      "active": 1.725,       // Hard exercise 6-7 days/week
      "very_active": 1.9     // Physical labor or athletic training
    };
    const factor = multipliers[activity] || 1.55;
    const maintenanceCalories = Math.round(bmr * factor);

    // 3. Goal Calorie Adjustment (Safe non-extreme ranges)
    let targetCalories = maintenanceCalories;
    if (goal === "lose") {
      targetCalories = Math.max(1200, maintenanceCalories - 400); // Modest ~400 kcal deficit
    } else if (goal === "gain") {
      targetCalories = maintenanceCalories + 350; // Clean ~350 kcal surplus
    }

    // 4. Macro Splits (Dietary Guidelines)
    // Protein: 1.6g - 2.0g per kg of bodyweight
    let proteinGrams = Math.round(weight * 1.6);
    // Fats: 25-30% of total calories (9 kcal/g)
    let fatGrams = Math.round((targetCalories * 0.28) / 9);
    // Carbs: Remainder of calories (4 kcal/g)
    let carbCalories = targetCalories - ((proteinGrams * 4) + (fatGrams * 9));
    let carbGrams = Math.max(100, Math.round(carbCalories / 4));

    // Fiber: ~14g per 1000 kcal
    let fiberGrams = Math.round((targetCalories / 1000) * 14);

    // Hydration: ~35ml per kg bodyweight
    let waterMl = Math.round(weight * 35);

    return {
      bmr: Math.round(bmr),
      tdee: maintenanceCalories,
      targetCalories: targetCalories,
      proteinGrams: proteinGrams,
      carbGrams: carbGrams,
      fatGrams: fatGrams,
      fiberGrams: fiberGrams,
      waterMl: waterMl,
      disclaimer: "These estimations use the standard Mifflin-St Jeor equation and general nutritional guidelines. They are provided for informational wellness tracking and do not constitute clinical medical advice."
    };
  }

  /**
   * Migrate data from legacy v1 (nutritrackData) if it exists.
   */
  function migrateFromV1(v1Data) {
    const newState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    try {
      if (v1Data && typeof v1Data === "object") {
        if (Number.isFinite(v1Data.goal)) {
          newState.goals.calories = Math.round(v1Data.goal);
        }

        const dateKey = v1Data.date ? formatDate(new Date(v1Data.date)) : formatDate(new Date());
        newState.diary[dateKey] = {
          "Breakfast": [],
          "Morning snack": [],
          "Lunch": [],
          "Evening snack": [],
          "Dinner": []
        };

        if (Array.isArray(v1Data.foods)) {
          v1Data.foods.forEach(f => {
            const meal = f.meal || "Lunch";
            const targetMeal = newState.diary[dateKey][meal] ? meal : "Lunch";
            newState.diary[dateKey][targetMeal].push({
              id: f.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              foodId: "legacy-imported",
              foodName: f.name || "Food Item",
              category: "other",
              servingQty: 1,
              servingUnit: "serving",
              grams: 100,
              calories: Number(f.calories) || 0,
              protein: Number(f.protein) || 0,
              carbs: Number(f.carbs) || 0,
              fats: Number(f.fats) || 0,
              fiber: 0,
              sugar: 0,
              sodium: 0,
              source: "Imported from NutriTrack v1",
              timestamp: Date.now()
            });
          });
        }

        if (Number.isFinite(v1Data.water) && v1Data.water > 0) {
          newState.water[dateKey] = {
            ml: v1Data.water * 250,
            glasses: v1Data.water,
            entries: [{ id: "legacy-water", time: "12:00", ml: v1Data.water * 250 }]
          };
        }
      }
    } catch (e) {
      console.warn("Could not migrate legacy NutriTrack v1 data.", e);
    }
    return newState;
  }

  /**
   * Loads state from localStorage. Handles v1 migration and corrupt json safely.
   */
  function loadState() {
    try {
      const v2Raw = localStorage.getItem(STORAGE_KEY_V2);
      if (v2Raw) {
        const parsed = JSON.parse(v2Raw);
        if (parsed && parsed.version === 2) {
          // Merge with default state in case new fields were added
          return {
            ...DEFAULT_STATE,
            ...parsed,
            profile: { ...DEFAULT_STATE.profile, ...(parsed.profile || {}) },
            goals: { ...DEFAULT_STATE.goals, ...(parsed.goals || {}) },
            settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
            diary: parsed.diary || {},
            water: parsed.water || {},
            weightHistory: Array.isArray(parsed.weightHistory) ? parsed.weightHistory : [],
            customFoods: Array.isArray(parsed.customFoods) ? parsed.customFoods : [],
            recipes: Array.isArray(parsed.recipes) ? parsed.recipes : []
          };
        }
      }

      // Check for legacy v1
      const v1Raw = localStorage.getItem(STORAGE_KEY_V1);
      if (v1Raw) {
        const parsedV1 = JSON.parse(v1Raw);
        const migrated = migrateFromV1(parsedV1);
        saveState(migrated);
        return migrated;
      }
    } catch (err) {
      console.error("Storage load error; initializing with default configuration.", err);
    }

    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  /**
   * Saves state to localStorage.
   */
  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
      return true;
    } catch (err) {
      console.error("Storage save failed.", err);
      alert("Browser storage quota exceeded or storage disabled. Please export your data.");
      return false;
    }
  }

  /**
   * Populates demo data (7 days of meals, water, and weight history)
   * Perfect for portfolio presentations and reviewer evaluation.
   */
  function loadDemoData() {
    const demo = JSON.parse(JSON.stringify(DEFAULT_STATE));
    demo.profile = {
      name: "Bindu K",
      age: 22,
      gender: "female",
      heightCm: 164,
      weightKg: 58.5,
      activityLevel: "moderate",
      goal: "maintain",
      dietPreference: "vegetarian",
      units: "metric"
    };
    demo.goals = {
      calories: 1950,
      protein: 95,
      carbs: 235,
      fats: 60,
      fiber: 28,
      waterMl: 2250,
      calculatedBy: "mifflin_st_jeor"
    };

    const today = new Date();
    const demoFoods = [
      {
        meal: "Breakfast",
        name: "Vegetable Poha (Cooked)",
        qty: 1,
        unit: "plate",
        grams: 160,
        cal: 210,
        p: 3.5,
        c: 35,
        f: 6,
        fib: 2.5
      },
      {
        meal: "Breakfast",
        name: "Indian Chai (Tea with Milk & 1 tsp Sugar)",
        qty: 1,
        unit: "cup",
        grams: 150,
        cal: 85,
        p: 2.2,
        c: 12,
        f: 2.8,
        fib: 0
      },
      {
        meal: "Morning snack",
        name: "Banana (Fresh Raw)",
        qty: 1,
        unit: "piece",
        grams: 118,
        cal: 105,
        p: 1.3,
        c: 27,
        f: 0.3,
        fib: 3.1
      },
      {
        meal: "Morning snack",
        name: "Almonds (Raw / Soaked)",
        qty: 10,
        unit: "piece",
        grams: 12,
        cal: 70,
        p: 2.5,
        c: 2.6,
        f: 6.0,
        fib: 1.5
      },
      {
        meal: "Lunch",
        name: "Chapati / Roti (Whole Wheat)",
        qty: 2,
        unit: "piece",
        grams: 70,
        cal: 208,
        p: 6.6,
        c: 37,
        f: 4.2,
        fib: 5.6
      },
      {
        meal: "Lunch",
        name: "Dal Tadka (Cooked Yellow Toor Dal)",
        qty: 1,
        unit: "katori",
        grams: 150,
        cal: 135,
        p: 6.8,
        c: 17,
        f: 4.0,
        fib: 4.4
      },
      {
        meal: "Lunch",
        name: "Curd / Dahi (Plain Whole Milk)",
        qty: 1,
        unit: "katori",
        grams: 150,
        cal: 95,
        p: 5.2,
        c: 6.5,
        f: 5.5,
        fib: 0
      },
      {
        meal: "Evening snack",
        name: "Roasted Makhana (Foxnuts)",
        qty: 1,
        unit: "bowl",
        grams: 30,
        cal: 105,
        p: 3.0,
        c: 20,
        f: 0.5,
        fib: 2.3
      },
      {
        meal: "Dinner",
        name: "Cooked White Rice (Steamed)",
        qty: 150,
        unit: "g",
        grams: 150,
        cal: 195,
        p: 4.0,
        c: 42.3,
        f: 0.4,
        fib: 0.6
      },
      {
        meal: "Dinner",
        name: "Paneer (Indian Cottage Cheese)",
        qty: 80,
        unit: "g",
        grams: 80,
        cal: 212,
        p: 14.6,
        c: 1.0,
        f: 16.6,
        fib: 0
      },
      {
        meal: "Dinner",
        name: "Moong Dal (Yellow Split, Cooked)",
        qty: 1,
        unit: "katori",
        grams: 150,
        cal: 132,
        p: 8.1,
        c: 18,
        f: 3.2,
        fib: 5.1
      }
    ];

    // Populate past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = formatDate(d);

      demo.diary[dateStr] = {
        "Breakfast": [],
        "Morning snack": [],
        "Lunch": [],
        "Evening snack": [],
        "Dinner": []
      };

      // Slight variation per day for realistic charts
      demoFoods.forEach((item, idx) => {
        if (i % 2 === 1 && idx === 7) return; // skip evening snack on alternate days
        demo.diary[dateStr][item.meal].push({
          id: `demo-${dateStr}-${idx}`,
          foodId: `food-${idx}`,
          foodName: item.name,
          category: "demo",
          servingQty: item.qty,
          servingUnit: item.unit,
          grams: item.grams,
          calories: item.cal,
          protein: item.p,
          carbs: item.c,
          fats: item.f,
          fiber: item.fib,
          sugar: 1,
          sodium: 150,
          source: "ICMR-NIN IFCT 2017",
          timestamp: d.getTime()
        });
      });

      // Water data
      demo.water[dateStr] = {
        ml: 1750 + (i * 100),
        glasses: 7 + (i % 2),
        entries: [
          { id: `w1-${i}`, time: "08:30", ml: 500 },
          { id: `w2-${i}`, time: "12:15", ml: 500 },
          { id: `w3-${i}`, time: "16:45", ml: 500 },
          { id: `w4-${i}`, time: "20:30", ml: 250 + (i * 100) }
        ]
      };
    }

    // Weight history (weekly records over past 5 weeks)
    demo.weightHistory = [
      { id: "wt-1", date: formatDate(new Date(today.getTime() - 28 * 86400000)), weight: 59.8, note: "Starting consistent log" },
      { id: "wt-2", date: formatDate(new Date(today.getTime() - 21 * 86400000)), weight: 59.3, note: "Good hydration" },
      { id: "wt-3", date: formatDate(new Date(today.getTime() - 14 * 86400000)), weight: 58.9, note: "Feeling energized" },
      { id: "wt-4", date: formatDate(new Date(today.getTime() - 7 * 86400000)), weight: 58.6, note: "Consistent meals" },
      { id: "wt-5", date: formatDate(today), weight: 58.5, note: "Met weekly goal" }
    ];

    saveState(demo);
    return demo;
  }

  /**
   * Export all data as a downloadable JSON file.
   */
  function exportDataAsJSON(state) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nutritrack-backup-${formatDate(new Date())}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Validate and import JSON string.
   */
  function importDataFromJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid file structure. Expected a JSON object.");
      }
      if (!parsed.diary || typeof parsed.diary !== "object") {
        throw new Error("File missing diary records.");
      }
      const merged = {
        ...DEFAULT_STATE,
        ...parsed,
        version: 2
      };
      saveState(merged);
      return { success: true, state: merged };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return {
    formatDate: formatDate,
    calculateBMRAndTDEE: calculateBMRAndTDEE,
    loadState: loadState,
    saveState: saveState,
    loadDemoData: loadDemoData,
    exportDataAsJSON: exportDataAsJSON,
    importDataFromJSON: importDataFromJSON,
    DEFAULT_STATE: DEFAULT_STATE
  };
}));
