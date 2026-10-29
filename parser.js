/**
 * NutriTrack Natural Language Quantity, Unit & Food Query Parser
 * Interprets user natural queries, e.g.:
 *  - "2 boiled eggs"
 *  - "1 banana"
 *  - "100 g cooked rice"
 *  - "2 chapatis"
 *  - "50 g soya chunks, dry"
 *  - "1 cup dal"
 *  - "200 ml milk"
 *  - "2 eggs and 2 chapatis for breakfast"
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.NutriTrack = root.NutriTrack || {};
    root.NutriTrack.Parser = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const WORD_NUMBERS = {
    "a": 1,
    "an": 1,
    "half": 0.5,
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10
  };

  const KNOWN_UNITS = [
    // Metric
    "grams", "gram", "gm", "gms", "g",
    "kilograms", "kilogram", "kg", "kgs",
    "milliliters", "milliliter", "ml", "mls",
    "liters", "liter", "l", "ltr",
    // Household measurements
    "katoris", "katori",
    "cups", "cup",
    "bowls", "bowl",
    "glasses", "glass",
    "plates", "plate",
    "servings", "serving",
    "tablespoons", "tablespoon", "tbsp",
    "teaspoons", "teaspoon", "tsp",
    "handfuls", "handful",
    // Count units
    "pieces", "piece", "pcs", "pc", "unit", "units",
    "slices", "slice",
    "rotis", "roti", "chapatis", "chapati", "phulkas", "phulka", "parathas", "paratha",
    "dosas", "dosa", "idlis", "idli",
    "eggs", "egg",
    "bananas", "banana",
    "apples", "apple"
  ];

  const MEAL_KEYWORDS = {
    "breakfast": "Breakfast",
    "morning snack": "Morning snack",
    "snack": "Evening snack",
    "snacks": "Evening snack",
    "lunch": "Lunch",
    "evening snack": "Evening snack",
    "dinner": "Dinner"
  };

  /**
   * Parses fraction strings like "1/2", "1/4", "3/4" or "1 1/2" into a float.
   */
  function parseNumericValue(rawStr) {
    if (!rawStr) return null;
    const str = String(rawStr).trim().toLowerCase();

    if (WORD_NUMBERS[str] !== undefined) {
      return WORD_NUMBERS[str];
    }

    // "1 1/2"
    if (str.includes(" ") && str.includes("/")) {
      const parts = str.split(/\s+/);
      const whole = parseFloat(parts[0]);
      const fracParts = parts[1].split("/");
      if (parts.length === 2 && fracParts.length === 2 && !isNaN(whole)) {
        const num = parseFloat(fracParts[0]);
        const den = parseFloat(fracParts[1]);
        if (den !== 0) return whole + (num / den);
      }
    }

    // "1/2" or "3/4"
    if (str.includes("/")) {
      const parts = str.split("/");
      if (parts.length === 2) {
        const num = parseFloat(parts[0]);
        const den = parseFloat(parts[1]);
        if (den !== 0 && !isNaN(num) && !isNaN(den)) {
          return num / den;
        }
      }
    }

    const val = parseFloat(str);
    return isNaN(val) ? null : val;
  }

  /**
   * Normalizes unit strings into canonical unit keys.
   */
  function canonicalizeUnit(unitStr) {
    if (!unitStr) return "piece";
    const u = unitStr.toLowerCase().trim();
    if (["g", "gram", "grams", "gm", "gms"].includes(u)) return "g";
    if (["kg", "kgs", "kilogram", "kilograms"].includes(u)) return "kg";
    if (["ml", "mls", "milliliter", "milliliters"].includes(u)) return "ml";
    if (["l", "ltr", "liter", "liters"].includes(u)) return "l";
    if (["katori", "katoris"].includes(u)) return "katori";
    if (["cup", "cups"].includes(u)) return "cup";
    if (["bowl", "bowls"].includes(u)) return "bowl";
    if (["glass", "glasses"].includes(u)) return "glass";
    if (["plate", "plates"].includes(u)) return "plate";
    if (["serving", "servings"].includes(u)) return "serving";
    if (["tbsp", "tablespoon", "tablespoons"].includes(u)) return "tbsp";
    if (["tsp", "teaspoon", "teaspoons"].includes(u)) return "tsp";
    if (["slice", "slices"].includes(u)) return "slice";
    if (["handful", "handfuls"].includes(u)) return "handful";
    if (["roti", "rotis", "chapati", "chapatis", "phulka", "phulkas"].includes(u)) return "piece";
    if (["dosa", "dosas", "idli", "idlis"].includes(u)) return "piece";
    if (["egg", "eggs", "banana", "bananas", "apple", "apples"].includes(u)) return "piece";
    return "piece";
  }

  /**
   * Parse a single item query e.g. "2 boiled eggs", "50 g soya chunks, dry", "100 g cooked rice"
   */
  function parseSingleQuery(rawQuery) {
    if (!rawQuery || typeof rawQuery !== "string") {
      return { quantity: 1, unit: "piece", foodQuery: "", isAmbiguous: true };
    }

    let text = rawQuery.trim();

    // Check for trailing qualifiers like ", dry" or ", cooked"
    let dryQualifier = false;
    let cookedQualifier = false;
    if (/\b(dry|raw|uncooked)\b/i.test(text)) {
      dryQualifier = true;
    }
    if (/\b(cooked|boiled|steamed)\b/i.test(text)) {
      cookedQualifier = true;
    }

    // Regex to match leading number (or fraction or number-word) + optional unit
    // Example patterns:
    // "100 g cooked rice" -> match: "100", "g", rest: "cooked rice"
    // "2 boiled eggs" -> match: "2", "", rest: "boiled eggs"
    // "1 cup dal" -> match: "1", "cup", rest: "dal"
    // "1/2 cup curd" -> match: "1/2", "cup", rest: "curd"
    // "two bananas" -> match: "two", "", rest: "bananas"
    // "50g soya chunks" -> handle connected number and unit "50g"

    // Separate attached number+unit: "50g" -> "50 g", "200ml" -> "200 ml"
    text = text.replace(/(\d+)(g|gm|gms|kg|ml|l|ltr)\b/gi, "$1 $2");

    const tokens = text.split(/\s+/);
    let parsedQty = null;
    let parsedUnit = null;
    let foodTokens = [];

    const FOOD_NOUN_UNITS = [
      "banana", "bananas",
      "egg", "eggs",
      "roti", "rotis", "chapati", "chapatis", "phulka", "phulkas", "paratha", "parathas",
      "dosa", "dosas", "idli", "idlis",
      "apple", "apples"
    ];

    // Check first token for quantity
    let firstToken = tokens[0] ? tokens[0].toLowerCase() : "";
    let val = parseNumericValue(firstToken);

    if (val !== null && val > 0) {
      parsedQty = val;
      // Check second token for unit
      let secondToken = tokens[1] ? tokens[1].toLowerCase() : "";
      if (FOOD_NOUN_UNITS.includes(secondToken)) {
        parsedUnit = "piece";
        foodTokens = [secondToken, ...tokens.slice(2)];
      } else if (KNOWN_UNITS.includes(secondToken)) {
        parsedUnit = canonicalizeUnit(secondToken);
        foodTokens = tokens.slice(2);
      } else {
        foodTokens = tokens.slice(1);
      }
    } else {
      // Quantity wasn't the first word; see if there's a unit or quantity inside
      foodTokens = tokens;
    }

    // Clean up food query
    let foodQuery = foodTokens.join(" ").replace(/[,.]/g, " ").trim();

    // Check if food query ended up empty
    if (!foodQuery && tokens.length > 0) {
      foodQuery = tokens.join(" ");
    }

    // Normalize food query: if query contains "eggs" or "chapatis", leave the canonical food term
    return {
      raw: rawQuery,
      quantity: parsedQty !== null ? parsedQty : 1,
      unit: parsedUnit, // can be null if user didn't specify unit (e.g. "2 boiled eggs" -> unit: null initially, matched against food's default)
      foodQuery: foodQuery,
      isDry: dryQualifier,
      isCooked: cookedQualifier,
      hasExplicitQty: parsedQty !== null
    };
  }

  /**
   * Parse a natural language meal sentence e.g.
   * "2 eggs and 2 chapatis for breakfast"
   * "1 bowl dal with 100g cooked rice for lunch"
   */
  function parseSmartMealSentence(sentence) {
    if (!sentence || typeof sentence !== "string") return { meal: "Breakfast", items: [] };

    let text = sentence.trim();
    let detectedMeal = null;

    // Check for "for <meal>" or "in <meal>"
    for (const [kw, mealName] of Object.entries(MEAL_KEYWORDS)) {
      const regex = new RegExp(`\\b(for|at|in)?\\s*${kw}\\b`, "i");
      if (regex.test(text)) {
        detectedMeal = mealName;
        text = text.replace(regex, " ").trim();
        break;
      }
    }

    // Split items by "and", "with", "+", or commas
    const rawItems = text
      .split(/\band\b|\bwith\b|\+|\&|,/i)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const parsedItems = rawItems.map(itemStr => parseSingleQuery(itemStr));

    return {
      originalSentence: sentence,
      meal: detectedMeal || "Breakfast",
      items: parsedItems
    };
  }

  return {
    parseSingleQuery: parseSingleQuery,
    parseSmartMealSentence: parseSmartMealSentence,
    parseNumericValue: parseNumericValue,
    canonicalizeUnit: canonicalizeUnit
  };
}));
