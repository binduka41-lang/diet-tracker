/**
 * NutriTrack Nutrition Calculation & Search Service Layer
 * Coordinates verified database lookup, recipe computation, serving scaling,
 * and optional external API hooks (USDA FoodData Central / Open Food Facts).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const db = require('../data/foods-db.js');
    const parser = require('./parser.js');
    module.exports = factory(db, parser);
  } else {
    root.NutriTrack = root.NutriTrack || {};
    root.NutriTrack.NutritionService = factory(
      root.NutriTrack.FOODS_DATABASE,
      root.NutriTrack.Parser
    );
  }
}(typeof self !== 'undefined' ? self : this, function (FOODS_DATABASE, Parser) {

  /**
   * Calculates nutrients for a specific food item, quantity, and unit.
   * Scaled from per100g reference values.
   */
  function calculateNutrition(foodItem, quantity, unit) {
    if (!foodItem || !foodItem.per100g) return null;

    const qty = Number(quantity) > 0 ? Number(quantity) : 1;
    let chosenUnit = unit || foodItem.defaultUnit || "piece";

    // Determine total grams for the specified quantity and unit
    let grams = 0;
    const lowerUnit = chosenUnit.toLowerCase();

    if (["g", "gram", "grams", "gm"].includes(lowerUnit)) {
      grams = qty;
    } else if (["kg", "kgs", "kilogram"].includes(lowerUnit)) {
      grams = qty * 1000;
    } else if (["ml", "mls", "milliliter"].includes(lowerUnit)) {
      grams = qty; // approx 1g/ml density for water/milk
    } else if (["l", "ltr", "liter"].includes(lowerUnit)) {
      grams = qty * 1000;
    } else if (foodItem.supportedUnits && foodItem.supportedUnits[lowerUnit] !== undefined) {
      grams = qty * foodItem.supportedUnits[lowerUnit];
    } else if (foodItem.servingGrams) {
      grams = qty * foodItem.servingGrams;
    } else {
      grams = qty * 100;
    }

    const scale = grams / 100;

    return {
      foodId: foodItem.id,
      foodName: foodItem.name,
      category: foodItem.category || "other",
      state: foodItem.state || "cooked",
      servingQty: qty,
      servingUnit: chosenUnit,
      grams: Math.round(grams * 10) / 10,
      calories: Math.round(foodItem.per100g.calories * scale * 10) / 10,
      protein: Math.round(foodItem.per100g.protein * scale * 10) / 10,
      carbs: Math.round(foodItem.per100g.carbs * scale * 10) / 10,
      fats: Math.round(foodItem.per100g.fats * scale * 10) / 10,
      fiber: Math.round((foodItem.per100g.fiber || 0) * scale * 10) / 10,
      sugar: Math.round((foodItem.per100g.sugar || 0) * scale * 10) / 10,
      sodium: Math.round((foodItem.per100g.sodium || 0) * scale * 10) / 10,
      source: foodItem.source || "NutriTrack Verified Database",
      notes: foodItem.notes || ""
    };
  }

  /**
   * Searches the database for foods matching a query string.
   * Includes alias matching, state prioritization (cooked vs dry), and ranking.
   */
  function searchFoods(query, options = {}) {
    if (!query || typeof query !== "string") return [];

    const q = query.toLowerCase().trim();
    if (!q) return [];

    const customFoods = options.customFoods || [];
    const allFoods = [...(FOODS_DATABASE || []), ...customFoods];

    const results = [];

    allFoods.forEach(food => {
      let score = 0;
      const nameLower = food.name.toLowerCase();
      const hindiLower = (food.hindiName || "").toLowerCase();

      // Check state preference if specified in options or query
      const wantsDry = options.isDry || /\b(dry|raw|uncooked)\b/i.test(q);
      const wantsCooked = options.isCooked || /\b(cooked|boiled|steamed)\b/i.test(q);

      if (wantsDry && food.state === "dry") score += 30;
      if (wantsCooked && food.state === "cooked") score += 30;

      // Exact name match
      if (nameLower === q) {
        score += 100;
      } else if (nameLower.startsWith(q)) {
        score += 70;
      } else if (nameLower.includes(q)) {
        score += 40;
      }

      // Check Hindi name
      if (hindiLower && hindiLower.includes(q)) {
        score += 50;
      }

      // Check aliases
      if (Array.isArray(food.aliases)) {
        food.aliases.forEach(alias => {
          const a = alias.toLowerCase();
          if (a === q) {
            score = Math.max(score, 90);
          } else if (a.startsWith(q)) {
            score = Math.max(score, 60);
          } else if (a.includes(q)) {
            score = Math.max(score, 35);
          }
        });
      }

      // Split multi-word query
      const words = q.split(/\s+/).filter(w => w.length > 2);
      if (words.length > 1) {
        const matchedWords = words.filter(w => nameLower.includes(w) || (food.aliases && food.aliases.some(a => a.includes(w))));
        if (matchedWords.length === words.length) {
          score += 30;
        }
      }

      if (score > 0) {
        results.push({ food, score });
      }
    });

    results.sort((a, b) => b.score - a.score);
    return results.map(r => r.food);
  }

  /**
   * Resolves a natural language query like "2 boiled eggs" or "100 g cooked rice".
   * Returns the best matching food item, calculated nutrition, and candidate alternatives.
   */
  function resolveQuery(rawText, options = {}) {
    const parsed = Parser.parseSingleQuery(rawText);
    const searchOptions = {
      isDry: parsed.isDry,
      isCooked: parsed.isCooked,
      customFoods: options.customFoods
    };

    const matches = searchFoods(parsed.foodQuery, searchOptions);

    if (matches.length === 0) {
      return {
        success: false,
        parsed: parsed,
        food: null,
        nutrition: null,
        alternatives: []
      };
    }

    const bestMatch = matches[0];
    // Determine unit: use parsed unit if valid for this food, or default to food's primary unit
    let effectiveUnit = parsed.unit;
    if (!effectiveUnit || (bestMatch.supportedUnits && !bestMatch.supportedUnits[effectiveUnit] && !["g", "kg", "ml", "l"].includes(effectiveUnit))) {
      effectiveUnit = bestMatch.defaultUnit;
    }

    let effectiveQty = parsed.quantity;
    if (!parsed.hasExplicitQty && bestMatch.defaultQty) {
      effectiveQty = bestMatch.defaultQty;
    }

    const nutrition = calculateNutrition(bestMatch, effectiveQty, effectiveUnit);

    return {
      success: true,
      parsed: parsed,
      food: bestMatch,
      nutrition: nutrition,
      alternatives: matches.slice(1, 5)
    };
  }

  /**
   * Calculates recipe total and per-serving nutrition for a list of ingredient entries.
   * ingredients: array of { foodId, quantity, unit, customGrams }
   */
  function calculateRecipeNutrition(ingredients, servings = 1, options = {}) {
    const allFoods = [...(FOODS_DATABASE || []), ...(options.customFoods || [])];
    const foodMap = new Map(allFoods.map(f => [f.id, f]));

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;
    let totalGrams = 0;

    const breakdown = [];

    ingredients.forEach(item => {
      const food = foodMap.get(item.foodId);
      if (!food) return;

      const nut = calculateNutrition(food, item.quantity, item.unit);
      if (nut) {
        totalCalories += nut.calories;
        totalProtein += nut.protein;
        totalCarbs += nut.carbs;
        totalFats += nut.fats;
        totalFiber += nut.fiber;
        totalSugar += nut.sugar;
        totalSodium += nut.sodium;
        totalGrams += nut.grams;
        breakdown.push(nut);
      }
    });

    const numServings = Math.max(1, Number(servings) || 1);

    return {
      total: {
        calories: Math.round(totalCalories * 10) / 10,
        protein: Math.round(totalProtein * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fats: Math.round(totalFats * 10) / 10,
        fiber: Math.round(totalFiber * 10) / 10,
        sugar: Math.round(totalSugar * 10) / 10,
        sodium: Math.round(totalSodium * 10) / 10,
        grams: Math.round(totalGrams * 10) / 10,
        servings: numServings
      },
      perServing: {
        calories: Math.round((totalCalories / numServings) * 10) / 10,
        protein: Math.round((totalProtein / numServings) * 10) / 10,
        carbs: Math.round((totalCarbs / numServings) * 10) / 10,
        fats: Math.round((totalFats / numServings) * 10) / 10,
        fiber: Math.round((totalFiber / numServings) * 10) / 10,
        sugar: Math.round((totalSugar / numServings) * 10) / 10,
        sodium: Math.round((totalSodium / numServings) * 10) / 10,
        grams: Math.round((totalGrams / numServings) * 10) / 10
      },
      breakdown: breakdown,
      disclaimer: "Nutrition values for mixed recipes depend on preparation method, cooking oil, and moisture loss during cooking. Values shown are ingredient-based estimates."
    };
  }

  /**
   * Optional External API integration: USDA FoodData Central
   * If user has configured an API key in their settings, this can query USDA's API.
   * If key is absent, network fails, or offline, smoothly falls back to local database.
   */
  async function searchExternalUSDA(query, apiKey) {
    if (!apiKey || !apiKey.trim() || !navigator.onLine) {
      return null;
    }
    try {
      const endpoint = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=5&api_key=${encodeURIComponent(apiKey.trim())}`;
      const res = await fetch(endpoint);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || !Array.isArray(data.foods)) return null;

      return data.foods.map(item => {
        const getNut = (id) => {
          const nut = (item.foodNutrients || []).find(n => n.nutrientId === id || n.nutrientNumber === id);
          return nut ? Number(nut.value || 0) : 0;
        };
        return {
          id: `usda-${item.fdcId}`,
          name: item.description,
          category: "usda_external",
          state: "cooked",
          defaultUnit: "g",
          defaultQty: 100,
          servingGrams: 100,
          servingLabel: "100 g standard portion",
          supportedUnits: { "g": 1, "gram": 1 },
          per100g: {
            calories: Math.round(getNut(1008)), // Energy kcal
            protein: Math.round(getNut(1003) * 10) / 10, // Protein
            carbs: Math.round(getNut(1005) * 10) / 10, // Carbs
            fats: Math.round(getNut(1004) * 10) / 10, // Total lipid
            fiber: Math.round(getNut(1079) * 10) / 10, // Fiber
            sugar: Math.round(getNut(2000) * 10) / 10, // Sugars
            sodium: Math.round(getNut(1093)) // Sodium mg
          },
          source: `USDA FoodData Central (FDC ID: ${item.fdcId})`,
          notes: "Live query result from USDA FoodData Central API."
        };
      });
    } catch (err) {
      console.warn("External USDA API call failed; continuing with local verified database.", err);
      return null;
    }
  }

  return {
    calculateNutrition: calculateNutrition,
    searchFoods: searchFoods,
    resolveQuery: resolveQuery,
    calculateRecipeNutrition: calculateRecipeNutrition,
    searchExternalUSDA: searchExternalUSDA,
    database: FOODS_DATABASE
  };
}));
