/**
 * NutriTrack Verified Foods Database
 * Primary Sources:
 * - ICMR-NIN Indian Food Composition Tables (IFCT 2017), National Institute of Nutrition, Hyderabad.
 * - USDA FoodData Central (FDC), U.S. Department of Agriculture.
 * 
 * All baseline nutrients are standardized per 100g (or 100ml) edible portion.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.NutriTrack = root.NutriTrack || {};
    root.NutriTrack.FOODS_DATABASE = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const FOODS_DATABASE = [
    // -------------------------------------------------------------------------
    // 1. EGGS & POULTRY & MEAT
    // -------------------------------------------------------------------------
    {
      id: "boiled-egg",
      name: "Boiled Egg",
      hindiName: "उबला अंडा (Ubla Anda)",
      category: "poultry",
      state: "cooked",
      defaultUnit: "piece",
      defaultQty: 1,
      servingGrams: 50,
      servingLabel: "1 large egg (~50g)",
      supportedUnits: {
        "piece": 50,
        "egg": 50,
        "unit": 50,
        "g": 1,
        "gram": 1,
        "grams": 1
      },
      per100g: {
        calories: 148,
        protein: 12.6,
        carbs: 0.8,
        fats: 10.0,
        fiber: 0.0,
        sugar: 0.6,
        sodium: 124
      },
      aliases: ["egg", "eggs", "boiled egg", "boiled eggs", "hard boiled egg", "anda", "ande", "ubla anda"],
      source: "USDA FoodData Central (FDC ID: 173424)",
      notes: "Standard large hard-boiled hen's egg without shell."
    },
    {
      id: "egg-white-boiled",
      name: "Egg White (Boiled)",
      hindiName: "अंडे की सफेदी",
      category: "poultry",
      state: "cooked",
      defaultUnit: "piece",
      defaultQty: 1,
      servingGrams: 33,
      servingLabel: "1 egg white (~33g)",
      supportedUnits: {
        "piece": 33,
        "egg": 33,
        "white": 33,
        "g": 1
      },
      per100g: {
        calories: 52,
        protein: 10.9,
        carbs: 0.7,
        fats: 0.2,
        fiber: 0.0,
        sugar: 0.7,
        sodium: 166
      },
      aliases: ["egg white", "egg whites", "boiled egg white", "anda safedi"],
      source: "USDA FoodData Central",
      notes: "Pure boiled egg albumen, practically zero fat."
    },
    {
      id: "egg-omelette",
      name: "Egg Omelette (1 Egg)",
      hindiName: "ऑमलेट",
      category: "poultry",
      state: "cooked",
      defaultUnit: "serving",
      defaultQty: 1,
      servingGrams: 65,
      servingLabel: "1 egg omelette with 1 tsp oil (~65g)",
      supportedUnits: {
        "serving": 65,
        "piece": 65,
        "omelette": 65,
        "g": 1
      },
      per100g: {
        calories: 169,
        protein: 10.1,
        carbs: 1.5,
        fats: 13.8,
        fiber: 0.1,
        sugar: 0.6,
        sodium: 210
      },
      aliases: ["omelette", "egg omelette", "fried egg", "anda bhurji", "scrambled egg"],
      source: "USDA / Standard Recipe Estimate",
      notes: "Includes 1 tsp cooking oil with minimal onions and green chillies."
    },
    {
      id: "chicken-breast-cooked",
      name: "Chicken Breast (Cooked, Skinless)",
      hindiName: "चिकन ब्रेस्ट (पका हुआ)",
      category: "poultry",
      state: "cooked",
      defaultUnit: "g",
      defaultQty: 100,
      servingGrams: 100,
      servingLabel: "100 g grilled / boiled breast",
      supportedUnits: {
        "g": 1,
        "gram": 1,
        "grams": 1,
        "piece": 120,
        "serving": 150,
        "cup": 140
      },
      per100g: {
        calories: 165,
        protein: 31.0,
        carbs: 0.0,
        fats: 3.6,
        fiber: 0.0,
        sugar: 0.0,
        sodium: 74
      },
      aliases: ["chicken", "chicken breast", "boiled chicken", "grilled chicken", "murgh"],
      source: "USDA FoodData Central (FDC ID: 171077)",
      notes: "Boneless, skinless lean chicken breast cooked without heavy oil."
    },
    {
      id: "chicken-curry",
      name: "Chicken Curry (Home-style)",
      hindiName: "चिकन करी",
      category: "dishes",
      state: "cooked",
      defaultUnit: "serving",
      defaultQty: 1,
      servingGrams: 200,
      servingLabel: "1 katori / small bowl (~200g)",
      supportedUnits: {
        "serving": 200,
        "bowl": 200,
        "katori": 180,
        "cup": 220,
        "plate": 250,
        "g": 1
      },
      per100g: {
        calories: 140,
        protein: 12.0,
        carbs: 4.0,
        fats: 8.0,
        fiber: 1.1,
        sugar: 1.2,
        sodium: 320
      },
      aliases: ["chicken curry", "murgh curry", "chicken gravy", "tari chicken"],
      source: "ICMR-NIN IFCT 2017 / Home Recipe Model",
      notes: "Standard home preparation with chicken pieces, onion-tomato gravy, and moderate oil."
    },
    {
      id: "fish-curry",
      name: "Fish Curry (Indian style)",
      hindiName: "मछली करी",
      category: "dishes",
      state: "cooked",
      defaultUnit: "serving",
      defaultQty: 1,
      servingGrams: 180,
      servingLabel: "1 serving with 1-2 pieces (~180g)",
      supportedUnits: {
        "serving": 180,
        "bowl": 180,
        "katori": 160,
        "plate": 220,
        "g": 1
      },
      per100g: {
        calories: 122,
        protein: 11.5,
        carbs: 3.5,
        fats: 6.8,
        fiber: 0.8,
        sugar: 0.9,
        sodium: 290
      },
      aliases: ["fish curry", "machhi curry", "fish", "surmai curry", "rohu curry"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Freshwater/sea fish in mild spiced gravy."
    },

    // -------------------------------------------------------------------------
    // 2. GRAINS, ROTIS, BREAD & RICE
    // -------------------------------------------------------------------------
    {
      id: "chapati-roti",
      name: "Chapati / Roti (Whole Wheat)",
      hindiName: "रोटी / चपाती",
      category: "grains",
      state: "cooked",
      defaultUnit: "piece",
      defaultQty: 1,
      servingGrams: 35,
      servingLabel: "1 medium roti (~35g)",
      supportedUnits: {
        "piece": 35,
        "roti": 35,
        "rotis": 35,
        "chapati": 35,
        "chapatis": 35,
        "phulka": 30,
        "phulkas": 30,
        "g": 1
      },
      per100g: {
        calories: 297,
        protein: 9.5,
        carbs: 53.0,
        fats: 6.0,
        fiber: 8.0,
        sugar: 1.5,
        sodium: 120
      },
      aliases: ["roti", "rotis", "chapati", "chapatis", "chappati", "phulka", "fulka", "atta roti", "whole wheat roti"],
      source: "ICMR-NIN IFCT 2017",
      notes: "1 medium plain cooked roti with minimal oil/ghee brush is ~104 kcal, 3.3g protein."
    },
    {
      id: "phulka-no-oil",
      name: "Phulka (Oil-Free Whole Wheat Roti)",
      hindiName: "फुल्का (बिना तेल)",
      category: "grains",
      state: "cooked",
      defaultUnit: "piece",
      defaultQty: 1,
      servingGrams: 30,
      servingLabel: "1 puffed phulka (~30g)",
      supportedUnits: {
        "piece": 30,
        "roti": 30,
        "phulka": 30,
        "g": 1
      },
      per100g: {
        calories: 280,
        protein: 9.3,
        carbs: 53.4,
        fats: 1.7,
        fiber: 8.3,
        sugar: 1.2,
        sodium: 5
      },
      aliases: ["phulka", "fulka", "plain phulka", "dry roti", "oil free roti"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Flame-puffed roti made without added oil or ghee. ~84 kcal per phulka."
    },
    {
      id: "paratha-plain",
      name: "Plain Paratha (Shallow Fried)",
      hindiName: "सादा पराठा",
      category: "grains",
      state: "cooked",
      defaultUnit: "piece",
      defaultQty: 1,
      servingGrams: 60,
      servingLabel: "1 medium paratha (~60g)",
      supportedUnits: {
        "piece": 60,
        "paratha": 60,
        "parathas": 60,
        "g": 1
      },
      per100g: {
        calories: 300,
        protein: 6.7,
        carbs: 40.0,
        fats: 12.5,
        fiber: 5.3,
        sugar: 1.1,
        sodium: 180
      },
      aliases: ["paratha", "plain paratha", "roti paratha", "parantha"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Whole wheat shallow-fried with 1-1.5 tsp oil or ghee (~180 kcal each)."
    },
    {
      id: "cooked-white-rice",
      name: "Cooked White Rice (Steamed)",
      hindiName: "पका हुआ चावल (सफेद)",
      category: "grains",
      state: "cooked",
      defaultUnit: "g",
      defaultQty: 100,
      servingGrams: 100,
      servingLabel: "100 g cooked steamed rice",
      supportedUnits: {
        "g": 1,
        "gram": 1,
        "grams": 1,
        "cup": 160,
        "katori": 150,
        "bowl": 200,
        "plate": 250,
        "tbsp": 25,
        "serving": 150
      },
      per100g: {
        calories: 130,
        protein: 2.7,
        carbs: 28.2,
        fats: 0.3,
        fiber: 0.4,
        sugar: 0.1,
        sodium: 1
      },
      aliases: ["cooked rice", "rice", "white rice", "steamed rice", "boiled rice", "chawal", "bhat", "cooked white rice"],
      source: "USDA FoodData Central (FDC ID: 168878) & ICMR-NIN",
      notes: "Cooked plain rice. 100g cooked rice yields 130 kcal. (Note: Raw rice is ~360 kcal/100g before water absorption)."
    },
    {
      id: "raw-white-rice",
      name: "Raw White Rice (Dry / Uncooked)",
      hindiName: "कच्चा चावल (Uncooked)",
      category: "grains",
      state: "dry",
      defaultUnit: "g",
      defaultQty: 100,
      servingGrams: 100,
      servingLabel: "100 g dry uncooked grain",
      supportedUnits: {
        "g": 1,
        "gram": 1,
        "grams": 1,
        "cup": 190,
        "tbsp": 15
      },
      per100g: {
        calories: 360,
        protein: 7.0,
        carbs: 79.0,
        fats: 0.6,
        fiber: 1.3,
        sugar: 0.2,
        sodium: 2
      },
      aliases: ["raw rice", "uncooked rice", "dry rice", "kaccha chawal"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Uncooked grain. Swells 2.5x to 3x in weight during boiling."
    },
    {
      id: "cooked-brown-rice",
      name: "Cooked Brown Rice",
      hindiName: "ब्राउन राइस (पका हुआ)",
      category: "grains",
      state: "cooked",
      defaultUnit: "g",
      defaultQty: 100,
      servingGrams: 100,
      servingLabel: "100 g cooked brown rice",
      supportedUnits: {
        "g": 1,
        "gram": 1,
        "grams": 1,
        "cup": 160,
        "katori": 150,
        "bowl": 200,
        "plate": 250
      },
      per100g: {
        calories: 111,
        protein: 2.6,
        carbs: 23.0,
        fats: 0.9,
        fiber: 1.8,
        sugar: 0.4,
        sodium: 5
      },
      aliases: ["brown rice", "cooked brown rice", "steamed brown rice"],
      source: "USDA FoodData Central (FDC ID: 169704)",
      notes: "Whole grain with intact bran layer, higher fiber."
    },
    {
      id: "rolled-oats-cooked",
      name: "Oats (Cooked in Water)",
      hindiName: "ओट्स (पानी में पका हुआ)",
      category: "grains",
      state: "cooked",
      defaultUnit: "cup",
      defaultQty: 1,
      servingGrams: 234,
      servingLabel: "1 cup cooked oatmeal (~234g)",
      supportedUnits: {
        "cup": 234,
        "bowl": 200,
        "serving": 200,
        "katori": 150,
        "g": 1
      },
      per100g: {
        calories: 71,
        protein: 2.5,
        carbs: 12.0,
        fats: 1.4,
        fiber: 1.7,
        sugar: 0.3,
        sodium: 2
      },
      aliases: ["oats", "oatmeal", "cooked oats", "porridge oats"],
      source: "USDA FoodData Central (FDC ID: 173904)",
      notes: "Cooked plain in water. For milk oats, add milk nutrition."
    },
    {
      id: "rolled-oats-dry",
      name: "Rolled Oats (Dry Raw)",
      hindiName: "कच्चा ओट्स (Dry)",
      category: "grains",
      state: "dry",
      defaultUnit: "g",
      defaultQty: 40,
      servingGrams: 40,
      servingLabel: "1 typical serving (40g dry)",
      supportedUnits: {
        "g": 1,
        "gram": 1,
        "grams": 1,
        "cup": 80,
        "tbsp": 10
      },
      per100g: {
        calories: 389,
        protein: 16.9,
        carbs: 66.3,
        fats: 6.9,
        fiber: 10.6,
        sugar: 0.0,
        sodium: 2
      },
      aliases: ["dry oats", "raw oats", "rolled oats dry", "uncooked oats"],
      source: "USDA FoodData Central",
      notes: "Dry rolled oat flakes rich in beta-glucan fiber."
    },
    {
      id: "vegetable-poha",
      name: "Vegetable Poha (Cooked)",
      hindiName: "पोहा (सब्जी वाला)",
      category: "dishes",
      state: "cooked",
      defaultUnit: "plate",
      defaultQty: 1,
      servingGrams: 160,
      servingLabel: "1 medium plate (~160g)",
      supportedUnits: {
        "plate": 160,
        "bowl": 150,
        "katori": 120,
        "serving": 160,
        "g": 1
      },
      per100g: {
        calories: 131,
        protein: 2.2,
        carbs: 21.8,
        fats: 3.8,
        fiber: 1.6,
        sugar: 1.0,
        sodium: 210
      },
      aliases: ["poha", "vegetable poha", "kanda poha", "batata poha", "flattened rice cooked"],
      source: "ICMR-NIN IFCT 2017",
      notes: "1 plate (~160g) cooked poha with peanuts and peas provides ~210 kcal."
    },
    {
      id: "upma-rava",
      name: "Rava / Suji Upma (Cooked)",
      hindiName: "उपमा",
      category: "dishes",
      state: "cooked",
      defaultUnit: "plate",
      defaultQty: 1,
      servingGrams: 160,
      servingLabel: "1 medium plate (~160g)",
      supportedUnits: {
        "plate": 160,
        "bowl": 150,
        "katori": 120,
        "serving": 160,
        "g": 1
      },
      per100g: {
        calories: 138,
        protein: 2.8,
        carbs: 21.2,
        fats: 4.4,
        fiber: 1.8,
        sugar: 0.8,
        sodium: 240
      },
      aliases: ["upma", "rava upma", "suji upma", "uppittu"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Cooked semolina breakfast dish with mustard seeds, curry leaves, and vegetables."
    },
    {
      id: "idli-steamed",
      name: "Idli (Steamed Rice & Urad Dal)",
      hindiName: "इडली",
      category: "dishes",
      state: "cooked",
      defaultUnit: "piece",
      defaultQty: 2,
      servingGrams: 40,
      servingLabel: "1 medium idli (~40g)",
      supportedUnits: {
        "piece": 40,
        "idli": 40,
        "idlis": 40,
        "plate": 80, // 2 idlis
        "g": 1
      },
      per100g: {
        calories: 138,
        protein: 4.5,
        carbs: 28.8,
        fats: 0.8,
        fiber: 2.0,
        sugar: 0.4,
        sodium: 140
      },
      aliases: ["idli", "idlis", "steamed idli", "rice idli"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Steamed fermented rice and urad dal batter. 1 idli (~40g) is ~55 kcal, 1.8g protein."
    },
    {
      id: "plain-dosa",
      name: "Plain Dosa (Sada Dosa)",
      hindiName: "सादा डोसा",
      category: "dishes",
      state: "cooked",
      defaultUnit: "piece",
      defaultQty: 1,
      servingGrams: 70,
      servingLabel: "1 medium plain dosa (~70g)",
      supportedUnits: {
        "piece": 70,
        "dosa": 70,
        "dosas": 70,
        "serving": 70,
        "g": 1
      },
      per100g: {
        calories: 193,
        protein: 4.3,
        carbs: 32.8,
        fats: 5.0,
        fiber: 1.7,
        sugar: 0.5,
        sodium: 180
      },
      aliases: ["dosa", "plain dosa", "sada dosa", "crispy dosa"],
      source: "ICMR-NIN IFCT 2017",
      notes: "1 medium plain dosa (~70g) cooked with 1 tsp oil is ~135 kcal."
    },
    {
      id: "masala-dosa",
      name: "Masala Dosa (with Potato Masala)",
      hindiName: "मसाला डोसा",
      category: "dishes",
      state: "cooked",
      defaultUnit: "piece",
      defaultQty: 1,
      servingGrams: 150,
      servingLabel: "1 medium masala dosa (~150g)",
      supportedUnits: {
        "piece": 150,
        "dosa": 150,
        "serving": 150,
        "g": 1
      },
      per100g: {
        calories: 187,
        protein: 3.7,
        carbs: 25.3,
        fats: 8.0,
        fiber: 2.3,
        sugar: 1.0,
        sodium: 290
      },
      aliases: ["masala dosa", "potato dosa", "aloo dosa"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Crisp crepe filled with spiced potato onion filling. ~280 kcal per dosa."
    },
    {
      id: "moong-dal-khichdi",
      name: "Moong Dal Khichdi (Cooked)",
      hindiName: "खिचड़ी (मूंग दाल और चावल)",
      category: "dishes",
      state: "cooked",
      defaultUnit: "bowl",
      defaultQty: 1,
      servingGrams: 200,
      servingLabel: "1 katori / bowl (~200g)",
      supportedUnits: {
        "bowl": 200,
        "katori": 180,
        "plate": 250,
        "serving": 200,
        "cup": 220,
        "g": 1
      },
      per100g: {
        calories: 110,
        protein: 3.3,
        carbs: 19.0,
        fats: 2.3,
        fiber: 2.3,
        sugar: 0.4,
        sodium: 170
      },
      aliases: ["khichdi", "khichri", "moong khichdi", "dal khichdi", "dal khichri"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Soft comforting blend of rice and yellow moong dal with mild ghee tempering."
    },
    {
      id: "curd-rice",
      name: "Curd Rice (Thayir Sadam)",
      hindiName: "दही चावल (Curd Rice)",
      category: "dishes",
      state: "cooked",
      defaultUnit: "bowl",
      defaultQty: 1,
      servingGrams: 200,
      servingLabel: "1 medium bowl (~200g)",
      supportedUnits: {
        "bowl": 200,
        "katori": 180,
        "cup": 220,
        "serving": 200,
        "g": 1
      },
      per100g: {
        calories: 120,
        protein: 3.0,
        carbs: 18.0,
        fats: 4.0,
        fiber: 0.8,
        sugar: 2.2,
        sodium: 160
      },
      aliases: ["curd rice", "dahi chawal", "thayir sadam", "daddojanam", "yogurt rice"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Soft cooked rice mixed with curd, salt, and mustard-curry leaf tadka."
    },
    {
      id: "vegetable-pulao",
      name: "Vegetable Pulao (Veg Pulav)",
      hindiName: "सब्जी पुलाव",
      category: "dishes",
      state: "cooked",
      defaultUnit: "plate",
      defaultQty: 1,
      servingGrams: 250,
      servingLabel: "1 standard plate (~250g)",
      supportedUnits: {
        "plate": 250,
        "serving": 250,
        "bowl": 200,
        "katori": 160,
        "cup": 180,
        "g": 1
      },
      per100g: {
        calories: 124,
        protein: 2.2,
        carbs: 19.2,
        fats: 4.2,
        fiber: 1.7,
        sugar: 1.2,
        sodium: 230
      },
      aliases: ["vegetable pulao", "veg pulao", "pulao", "pulav", "veg pulav", "vegetable biryani"],
      source: "ICMR-NIN IFCT 2017",
      notes: "1 plate (250g) provides ~310 kcal, 5.5g protein, 48g carbs, 10.5g fats."
    },
    {
      id: "chicken-biryani",
      name: "Chicken Biryani",
      hindiName: "चिकन बिरयानी",
      category: "dishes",
      state: "cooked",
      defaultUnit: "serving",
      defaultQty: 1,
      servingGrams: 350,
      servingLabel: "1 standard serving plate (~350g)",
      supportedUnits: {
        "serving": 350,
        "plate": 350,
        "bowl": 250,
        "g": 1
      },
      per100g: {
        calories: 149,
        protein: 7.4,
        carbs: 16.6,
        fats: 5.4,
        fiber: 1.0,
        sugar: 0.8,
        sodium: 360
      },
      aliases: ["chicken biryani", "biryani", "dum biryani", "hyderabadi chicken biryani", "murgh biryani"],
      source: "ICMR-NIN IFCT 2017 / Standard Formulation",
      notes: "1 full serving (350g) delivers ~520 kcal, 26g protein, 58g carbs, 19g fats."
    },
    {
      id: "white-bread-slice",
      name: "White Bread",
      hindiName: "सफेद ब्रेड",
      category: "grains",
      state: "cooked",
      defaultUnit: "slice",
      defaultQty: 1,
      servingGrams: 25,
      servingLabel: "1 slice (~25g)",
      supportedUnits: {
        "slice": 25,
        "slices": 25,
        "piece": 25,
        "g": 1
      },
      per100g: {
        calories: 266,
        protein: 8.9,
        carbs: 49.4,
        fats: 3.3,
        fiber: 2.7,
        sugar: 5.7,
        sodium: 490
      },
      aliases: ["white bread", "bread", "bread slice", "sandwich bread"],
      source: "USDA FoodData Central (FDC ID: 172685)",
      notes: "Standard commercially sliced white sandwich bread (~67 kcal/slice)."
    },
    {
      id: "whole-wheat-bread-slice",
      name: "Whole Wheat Bread",
      hindiName: "ब्राउन / गेहूं ब्रेड",
      category: "grains",
      state: "cooked",
      defaultUnit: "slice",
      defaultQty: 1,
      servingGrams: 28,
      servingLabel: "1 slice (~28g)",
      supportedUnits: {
        "slice": 28,
        "slices": 28,
        "piece": 28,
        "g": 1
      },
      per100g: {
        calories: 247,
        protein: 12.8,
        carbs: 41.3,
        fats: 3.4,
        fiber: 6.8,
        sugar: 5.6,
        sodium: 450
      },
      aliases: ["brown bread", "whole wheat bread", "atta bread", "wheat bread slice"],
      source: "USDA FoodData Central",
      notes: "Higher fiber 100% whole grain bread slice (~69 kcal/slice)."
    },
    {
      id: "besan-chilla",
      name: "Besan Chilla (Gram Flour Pancake)",
      hindiName: "बेसन चीला",
      category: "dishes",
      state: "cooked",
      defaultUnit: "piece",
      defaultQty: 1,
      servingGrams: 60,
      servingLabel: "1 medium chilla (~60g)",
      supportedUnits: {
        "piece": 60,
        "chilla": 60,
        "pancake": 60,
        "g": 1
      },
      per100g: {
        calories: 217,
        protein: 10.0,
        carbs: 25.0,
        fats: 8.3,
        fiber: 5.8,
        sugar: 2.0,
        sodium: 260
      },
      aliases: ["besan chilla", "besan cheela", "chilla", "cheela", "gram flour pancake"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Protein-rich savory chickpea flour pancake cooked with veggies and light oil."
    },

    // -------------------------------------------------------------------------
    // 3. PULSES, DAL & SOYA
    // -------------------------------------------------------------------------
    {
      id: "dal-tadka-toor",
      name: "Dal Tadka (Cooked Yellow Toor Dal)",
      hindiName: "दाल तड़का (तूर दाल)",
      category: "pulses",
      state: "cooked",
      defaultUnit: "katori",
      defaultQty: 1,
      servingGrams: 150,
      servingLabel: "1 katori / small bowl (~150g)",
      supportedUnits: {
        "katori": 150,
        "katoris": 150,
        "cup": 240,
        "cups": 240,
        "bowl": 200,
        "serving": 150,
        "tbsp": 15,
        "g": 1
      },
      per100g: {
        calories: 90,
        protein: 4.5,
        carbs: 11.4,
        fats: 2.7,
        fiber: 2.9,
        sugar: 0.6,
        sodium: 210
      },
      aliases: ["dal", "dal tadka", "toor dal", "arhar dal", "yellow dal", "cooked dal", "daal", "peeli dal"],
      source: "ICMR-NIN IFCT 2017",
      notes: "1 katori (150g) is ~135 kcal, 6.8g protein. 1 cup (240g) is ~216 kcal, 10.8g protein."
    },
    {
      id: "moong-dal-cooked",
      name: "Moong Dal (Yellow Split, Cooked)",
      hindiName: "मूंग दाल (पकी हुई)",
      category: "pulses",
      state: "cooked",
      defaultUnit: "katori",
      defaultQty: 1,
      servingGrams: 150,
      servingLabel: "1 katori (~150g)",
      supportedUnits: {
        "katori": 150,
        "cup": 240,
        "bowl": 200,
        "serving": 150,
        "g": 1
      },
      per100g: {
        calories: 88,
        protein: 5.4,
        carbs: 12.0,
        fats: 2.1,
        fiber: 3.4,
        sugar: 0.5,
        sodium: 180
      },
      aliases: ["moong dal", "mung dal", "yellow moong dal", "moong daal"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Light and easily digestible yellow split lentils."
    },
    {
      id: "sambar-vegetable",
      name: "Sambar (South Indian Lentil Stew)",
      hindiName: "सांभर",
      category: "pulses",
      state: "cooked",
      defaultUnit: "katori",
      defaultQty: 1,
      servingGrams: 150,
      servingLabel: "1 katori (~150g)",
      supportedUnits: {
        "katori": 150,
        "cup": 240,
        "bowl": 200,
        "serving": 150,
        "g": 1
      },
      per100g: {
        calories: 63,
        protein: 2.5,
        carbs: 9.3,
        fats: 1.9,
        fiber: 2.3,
        sugar: 1.8,
        sodium: 260
      },
      aliases: ["sambar", "sambhar", "veg sambar", "south indian sambar"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Lentils cooked with tamarind, mixed vegetables, drumstick, and sambar masala."
    },
    {
      id: "rajma-curry",
      name: "Rajma (Kidney Beans Curry, Cooked)",
      hindiName: "राजमा मसाला",
      category: "pulses",
      state: "cooked",
      defaultUnit: "bowl",
      defaultQty: 1,
      servingGrams: 200,
      servingLabel: "1 medium bowl (~200g)",
      supportedUnits: {
        "bowl": 200,
        "katori": 160,
        "cup": 240,
        "serving": 200,
        "g": 1
      },
      per100g: {
        calories: 120,
        protein: 5.5,
        carbs: 17.0,
        fats: 3.3,
        fiber: 4.0,
        sugar: 1.4,
        sodium: 280
      },
      aliases: ["rajma", "rajmah", "kidney beans curry", "rajma masala", "punjabi rajma"],
      source: "ICMR-NIN IFCT 2017",
      notes: "1 bowl (200g) cooked rajma curry provides ~240 kcal and 11g plant protein."
    },
    {
      id: "chole-chana-masala",
      name: "Chole / Chana Masala (Chickpea Curry)",
      hindiName: "छोले / चना मसाला",
      category: "pulses",
      state: "cooked",
      defaultUnit: "bowl",
      defaultQty: 1,
      servingGrams: 200,
      servingLabel: "1 medium bowl (~200g)",
      supportedUnits: {
        "bowl": 200,
        "katori": 160,
        "cup": 240,
        "serving": 200,
        "g": 1
      },
      per100g: {
        calories: 133,
        protein: 5.3,
        carbs: 18.0,
        fats: 4.3,
        fiber: 3.8,
        sugar: 1.5,
        sodium: 310
      },
      aliases: ["chole", "chana masala", "chickpea curry", "kabuli chana curry", "chhole"],
      source: "ICMR-NIN IFCT 2017",
      notes: "White chickpeas stewed in onion, tomato, and aromatic Indian spices."
    },
    {
      id: "soya-chunks-dry",
      name: "Soya Chunks (Dry / Raw / Mealmaker)",
      hindiName: "सोया चंक्स (सूखा / Dry)",
      category: "pulses",
      state: "dry",
      defaultUnit: "g",
      defaultQty: 50,
      servingGrams: 50,
      servingLabel: "50 g dry soya chunks",
      supportedUnits: {
        "g": 1,
        "gram": 1,
        "grams": 1,
        "cup": 40, // lightweight dry nuggets
        "serving": 50
      },
      per100g: {
        calories: 345,
        protein: 52.0,
        carbs: 33.0,
        fats: 0.5,
        fiber: 13.0,
        sugar: 0.0,
        sodium: 15
      },
      aliases: ["soya chunks dry", "dry soya chunks", "soya chunks", "mealmaker", "soya wadi", "soya nuggets dry", "nutrela dry"],
      source: "ICMR-NIN IFCT 2017 & Manufacturer Standard",
      notes: "50g dry soya chunks provides 172.5 kcal, 26g protein, 16.5g carbs, 0.25g fat, 6.5g fiber."
    },
    {
      id: "soya-chunks-cooked",
      name: "Soya Chunks (Boiled / Cooked)",
      hindiName: "सोया चंक्स (उबला हुआ)",
      category: "pulses",
      state: "cooked",
      defaultUnit: "g",
      defaultQty: 100,
      servingGrams: 100,
      servingLabel: "100 g boiled hydrated chunks",
      supportedUnits: {
        "g": 1,
        "gram": 1,
        "grams": 1,
        "cup": 150,
        "katori": 120,
        "serving": 150
      },
      per100g: {
        calories: 115,
        protein: 17.3,
        carbs: 11.0,
        fats: 0.2,
        fiber: 4.3,
        sugar: 0.0,
        sodium: 5
      },
      aliases: ["cooked soya chunks", "boiled soya chunks", "soya chunks cooked", "hydrated soya chunks"],
      source: "Calculated from dry absorption ratio (~3x water weight)",
      notes: "Hydrated cooked chunks without oil."
    },
    {
      id: "boiled-kala-chana",
      name: "Boiled Kala Chana (Brown Chickpeas)",
      hindiName: "उबला काला चना",
      category: "pulses",
      state: "cooked",
      defaultUnit: "bowl",
      defaultQty: 1,
      servingGrams: 100,
      servingLabel: "100 g boiled brown chickpeas",
      supportedUnits: {
        "g": 1,
        "gram": 1,
        "grams": 1,
        "cup": 160,
        "katori": 130,
        "bowl": 100
      },
      per100g: {
        calories: 164,
        protein: 8.9,
        carbs: 27.4,
        fats: 2.6,
        fiber: 7.6,
        sugar: 1.0,
        sodium: 24
      },
      aliases: ["kala chana", "boiled chana", "black chickpeas", "boiled black chana"],
      source: "ICMR-NIN IFCT 2017",
      notes: "High in complex carbs and gut-healthy fiber."
    },
    {
      id: "sprouts-salad",
      name: "Moong Sprouts Salad",
      hindiName: "अंकुरित मूंग सलाद",
      category: "pulses",
      state: "cooked",
      defaultUnit: "bowl",
      defaultQty: 1,
      servingGrams: 100,
      servingLabel: "100 g fresh sprouts with lemon",
      supportedUnits: {
        "g": 1,
        "gram": 1,
        "grams": 1,
        "cup": 110,
        "katori": 90,
        "bowl": 100
      },
      per100g: {
        calories: 62,
        protein: 5.5,
        carbs: 10.5,
        fats: 0.4,
        fiber: 3.5,
        sugar: 2.1,
        sodium: 15
      },
      aliases: ["sprouts", "moong sprouts", "sprouts salad", "ankurit moong"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Germinated green gram, high in active enzymes and vitamin C."
    },

    // -------------------------------------------------------------------------
    // 4. DAIRY & PLANT MILK
    // -------------------------------------------------------------------------
    {
      id: "paneer-raw",
      name: "Paneer (Indian Cottage Cheese)",
      hindiName: "पनीर",
      category: "dairy",
      state: "raw",
      defaultUnit: "g",
      defaultQty: 100,
      servingGrams: 100,
      servingLabel: "100 g paneer block",
      supportedUnits: {
        "g": 1,
        "gram": 1,
        "grams": 1,
        "piece": 25, // cube
        "cube": 25,
        "cubes": 25,
        "serving": 100,
        "cup": 120
      },
      per100g: {
        calories: 265,
        protein: 18.3,
        carbs: 1.2,
        fats: 20.8,
        fiber: 0.0,
        sugar: 1.2,
        sodium: 22
      },
      aliases: ["paneer", "cottage cheese", "raw paneer", "fresh paneer"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Standard cow/buffalo milk cottage cheese. 100g paneer delivers 265 kcal, 18.3g protein."
    },
    {
      id: "cow-milk",
      name: "Milk (Cow's Milk, Whole)",
      hindiName: "गाय का दूध (Cow Milk)",
      category: "dairy",
      state: "raw",
      defaultUnit: "ml",
      defaultQty: 200,
      servingGrams: 103, // 100ml ~ 103g
      servingLabel: "200 ml glass of milk",
      supportedUnits: {
        "ml": 1,
        "glass": 200,
        "glasses": 200,
        "cup": 240,
        "cups": 240,
        "l": 1000,
        "liter": 1000,
        "liters": 1000,
        "g": 1
      },
      per100g: {
        calories: 61,
        protein: 3.2,
        carbs: 4.8,
        fats: 3.3,
        fiber: 0.0,
        sugar: 4.8,
        sodium: 44
      },
      aliases: ["milk", "cow milk", "doodh", "whole milk", "fresh milk"],
      source: "ICMR-NIN IFCT 2017 & USDA (FDC ID: 746782)",
      notes: "Per 100ml: 61 kcal, 3.2g P, 4.8g C, 3.3g F. 200 ml = 122 kcal, 6.4g protein."
    },
    {
      id: "toned-milk",
      name: "Toned Milk (3% Fat)",
      hindiName: "टोन्ड दूध (Toned Milk)",
      category: "dairy",
      state: "raw",
      defaultUnit: "ml",
      defaultQty: 200,
      servingGrams: 103,
      servingLabel: "200 ml glass of toned milk",
      supportedUnits: {
        "ml": 1,
        "glass": 200,
        "cup": 240,
        "l": 1000,
        "g": 1
      },
      per100g: {
        calories: 58,
        protein: 3.1,
        carbs: 4.7,
        fats: 3.0,
        fiber: 0.0,
        sugar: 4.7,
        sodium: 48
      },
      aliases: ["toned milk", "low fat milk", "toned doodh"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Standard toned milk common across India (Amul, Mother Dairy, Nandini)."
    },
    {
      id: "curd-dahi",
      name: "Curd / Dahi (Plain Whole Milk)",
      hindiName: "दही (Curd / Yogurt)",
      category: "dairy",
      state: "raw",
      defaultUnit: "katori",
      defaultQty: 1,
      servingGrams: 150,
      servingLabel: "1 katori (~150g)",
      supportedUnits: {
        "katori": 150,
        "bowl": 150,
        "cup": 240,
        "serving": 150,
        "tbsp": 20,
        "g": 1
      },
      per100g: {
        calories: 63,
        protein: 3.5,
        carbs: 4.3,
        fats: 3.7,
        fiber: 0.0,
        sugar: 4.3,
        sodium: 46
      },
      aliases: ["curd", "dahi", "plain curd", "plain yogurt", "yogurt", "mosaru"],
      source: "ICMR-NIN IFCT 2017",
      notes: "1 katori (150g) curd is ~95 kcal, 5.2g protein."
    },
    {
      id: "buttermilk-chaas",
      name: "Buttermilk / Chaas (Plain Salted)",
      hindiName: "छाछ / मट्ठा (Chaas)",
      category: "dairy",
      state: "raw",
      defaultUnit: "glass",
      defaultQty: 1,
      servingGrams: 200,
      servingLabel: "1 glass (~200ml)",
      supportedUnits: {
        "glass": 200,
        "cup": 240,
        "ml": 1,
        "g": 1
      },
      per100g: {
        calories: 20,
        protein: 1.1,
        carbs: 1.5,
        fats: 0.8,
        fiber: 0.0,
        sugar: 1.5,
        sodium: 120
      },
      aliases: ["chaas", "buttermilk", "chach", "mattha", "mor", "majjiga"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Diluted beaten curd with roasted cumin, mint, and rock salt. ~40 kcal per 200ml glass."
    },
    {
      id: "greek-yogurt",
      name: "Greek Yogurt (Plain Low Fat)",
      hindiName: "ग्रीक योगर्ट",
      category: "dairy",
      state: "raw",
      defaultUnit: "g",
      defaultQty: 100,
      servingGrams: 100,
      servingLabel: "100 g cup",
      supportedUnits: {
        "g": 1,
        "cup": 170,
        "tub": 100,
        "tbsp": 25
      },
      per100g: {
        calories: 73,
        protein: 10.0,
        carbs: 3.6,
        fats: 1.9,
        fiber: 0.0,
        sugar: 3.6,
        sodium: 40
      },
      aliases: ["greek yogurt", "strained yogurt", "hung curd"],
      source: "USDA FoodData Central",
      notes: "Strained curd concentrated in whey protein."
    },

    // -------------------------------------------------------------------------
    // 5. FRUITS
    // -------------------------------------------------------------------------
    {
      id: "banana-raw",
      name: "Banana (Fresh Raw)",
      hindiName: "केला (Kela)",
      category: "fruits",
      state: "raw",
      defaultUnit: "piece",
      defaultQty: 1,
      servingGrams: 118,
      servingLabel: "1 medium banana (~118g)",
      supportedUnits: {
        "piece": 118,
        "banana": 118,
        "bananas": 118,
        "unit": 118,
        "g": 1,
        "gram": 1,
        "grams": 1
      },
      per100g: {
        calories: 89,
        protein: 1.1,
        carbs: 22.8,
        fats: 0.3,
        fiber: 2.6,
        sugar: 12.2,
        sodium: 1
      },
      aliases: ["banana", "bananas", "kela", "fresh banana", "ripe banana"],
      source: "USDA FoodData Central (FDC ID: 173944)",
      notes: "1 medium raw banana (118g edible weight) provides ~105 kcal, 1.3g protein, 27g carbs, 3.1g fiber."
    },
    {
      id: "apple-raw",
      name: "Apple (with Peel)",
      hindiName: "सेब (Seb)",
      category: "fruits",
      state: "raw",
      defaultUnit: "piece",
      defaultQty: 1,
      servingGrams: 182,
      servingLabel: "1 medium apple (~182g)",
      supportedUnits: {
        "piece": 182,
        "apple": 182,
        "apples": 182,
        "unit": 182,
        "g": 1
      },
      per100g: {
        calories: 52,
        protein: 0.3,
        carbs: 13.8,
        fats: 0.2,
        fiber: 2.4,
        sugar: 10.4,
        sodium: 1
      },
      aliases: ["apple", "apples", "seb", "red apple", "fresh apple"],
      source: "USDA FoodData Central (FDC ID: 171688)",
      notes: "1 medium apple (182g) provides ~95 kcal, 4.4g fiber."
    },
    {
      id: "papaya-fresh",
      name: "Papaya (Fresh Cubes)",
      hindiName: "पपीता (Papita)",
      category: "fruits",
      state: "raw",
      defaultUnit: "cup",
      defaultQty: 1,
      servingGrams: 145,
      servingLabel: "1 cup cubed (~145g)",
      supportedUnits: {
        "cup": 145,
        "bowl": 150,
        "plate": 200,
        "g": 1
      },
      per100g: {
        calories: 43,
        protein: 0.5,
        carbs: 10.8,
        fats: 0.3,
        fiber: 1.7,
        sugar: 7.8,
        sodium: 8
      },
      aliases: ["papaya", "papita", "fresh papaya"],
      source: "ICMR-NIN IFCT 2017 & USDA",
      notes: "Rich in digestive enzyme papain and beta-carotene."
    },
    {
      id: "mango-ripe",
      name: "Mango (Ripe Sliced)",
      hindiName: "आम (Aam)",
      category: "fruits",
      state: "raw",
      defaultUnit: "cup",
      defaultQty: 1,
      servingGrams: 165,
      servingLabel: "1 cup sliced (~165g)",
      supportedUnits: {
        "cup": 165,
        "piece": 200,
        "mango": 200,
        "bowl": 150,
        "g": 1
      },
      per100g: {
        calories: 60,
        protein: 0.8,
        carbs: 15.0,
        fats: 0.4,
        fiber: 1.6,
        sugar: 13.7,
        sodium: 1
      },
      aliases: ["mango", "aam", "ripe mango", "alphonso", "kesar mango"],
      source: "ICMR-NIN IFCT 2017",
      notes: "1 cup sliced mango (165g) provides ~99 kcal."
    },
    {
      id: "watermelon-cubes",
      name: "Watermelon (Fresh Cubed)",
      hindiName: "तरबूज (Tarbooj)",
      category: "fruits",
      state: "raw",
      defaultUnit: "cup",
      defaultQty: 1,
      servingGrams: 150,
      servingLabel: "1 cup cubed (~150g)",
      supportedUnits: {
        "cup": 150,
        "bowl": 150,
        "plate": 250,
        "slice": 280,
        "g": 1
      },
      per100g: {
        calories: 30,
        protein: 0.6,
        carbs: 7.6,
        fats: 0.2,
        fiber: 0.4,
        sugar: 6.2,
        sodium: 1
      },
      aliases: ["watermelon", "tarbooj", "water melon"],
      source: "USDA FoodData Central",
      notes: "Over 91% water by weight, very hydrating."
    },

    // -------------------------------------------------------------------------
    // 6. VEGETABLES & SABZIS
    // -------------------------------------------------------------------------
    {
      id: "palak-paneer",
      name: "Palak Paneer (Spinach Cottage Cheese)",
      hindiName: "पालक पनीर",
      category: "dishes",
      state: "cooked",
      defaultUnit: "serving",
      defaultQty: 1,
      servingGrams: 200,
      servingLabel: "1 katori / serving (~200g)",
      supportedUnits: {
        "serving": 200,
        "katori": 180,
        "bowl": 200,
        "cup": 220,
        "g": 1
      },
      per100g: {
        calories: 130,
        protein: 6.5,
        carbs: 4.0,
        fats: 9.5,
        fiber: 2.0,
        sugar: 1.2,
        sodium: 270
      },
      aliases: ["palak paneer", "saag paneer", "spinach paneer"],
      source: "ICMR-NIN IFCT 2017 Model",
      notes: "1 serving (200g) is ~260 kcal, 13g protein."
    },
    {
      id: "paneer-butter-masala",
      name: "Paneer Butter Masala",
      hindiName: "पनीर बटर मसाला",
      category: "dishes",
      state: "cooked",
      defaultUnit: "serving",
      defaultQty: 1,
      servingGrams: 200,
      servingLabel: "1 restaurant serving (~200g)",
      supportedUnits: {
        "serving": 200,
        "katori": 180,
        "bowl": 200,
        "g": 1
      },
      per100g: {
        calories: 175,
        protein: 6.0,
        carbs: 5.5,
        fats: 14.0,
        fiber: 1.3,
        sugar: 2.4,
        sodium: 380
      },
      aliases: ["paneer butter masala", "paneer makhani", "butter paneer"],
      source: "ICMR-NIN / Restaurant Nutritional Profile",
      notes: "Rich creamy gravy with butter and cream. ~350 kcal per serving."
    },
    {
      id: "aloo-gobi-sabzi",
      name: "Aloo Gobi (Potato Cauliflower Sabzi)",
      hindiName: "आलू गोभी की सब्जी",
      category: "dishes",
      state: "cooked",
      defaultUnit: "katori",
      defaultQty: 1,
      servingGrams: 150,
      servingLabel: "1 katori (~150g)",
      supportedUnits: {
        "katori": 150,
        "bowl": 150,
        "serving": 150,
        "cup": 180,
        "g": 1
      },
      per100g: {
        calories: 93,
        protein: 2.1,
        carbs: 10.7,
        fats: 4.7,
        fiber: 2.3,
        sugar: 1.8,
        sodium: 230
      },
      aliases: ["aloo gobi", "alu gobi", "gobi aloo", "cauliflower potato sabzi"],
      source: "ICMR-NIN IFCT 2017",
      notes: "1 katori (150g) cooked aloo gobi is ~140 kcal."
    },
    {
      id: "bhindi-masala",
      name: "Bhindi Masala (Okra Sabzi)",
      hindiName: "भिंडी मसाला",
      category: "dishes",
      state: "cooked",
      defaultUnit: "katori",
      defaultQty: 1,
      servingGrams: 150,
      servingLabel: "1 katori (~150g)",
      supportedUnits: {
        "katori": 150,
        "bowl": 150,
        "serving": 150,
        "g": 1
      },
      per100g: {
        calories: 80,
        protein: 1.9,
        carbs: 8.0,
        fats: 4.3,
        fiber: 2.8,
        sugar: 1.5,
        sodium: 210
      },
      aliases: ["bhindi", "bhindi masala", "okra", "ladyfinger sabzi", "bhindi fry"],
      source: "ICMR-NIN IFCT 2017",
      notes: "1 katori (150g) cooked bhindi is ~120 kcal."
    },
    {
      id: "potato-boiled",
      name: "Potato (Boiled without Skin)",
      hindiName: "उबला आलू (Boiled Potato)",
      category: "vegetables",
      state: "cooked",
      defaultUnit: "piece",
      defaultQty: 1,
      servingGrams: 150,
      servingLabel: "1 medium potato (~150g)",
      supportedUnits: {
        "piece": 150,
        "potato": 150,
        "potatoes": 150,
        "katori": 120,
        "g": 1
      },
      per100g: {
        calories: 87,
        protein: 2.0,
        carbs: 20.0,
        fats: 0.1,
        fiber: 1.8,
        sugar: 0.9,
        sodium: 4
      },
      aliases: ["potato", "boiled potato", "aloo", "alu", "boiled aloo"],
      source: "USDA FoodData Central (FDC ID: 170027)",
      notes: "1 medium boiled potato (150g) is ~130 kcal, 3g protein, 30g carbs."
    },
    {
      id: "onion-raw",
      name: "Onion (Fresh Raw)",
      hindiName: "प्याज (Pyaz)",
      category: "vegetables",
      state: "raw",
      defaultUnit: "piece",
      defaultQty: 1,
      servingGrams: 100,
      servingLabel: "1 medium onion (~100g)",
      supportedUnits: {
        "piece": 100,
        "onion": 100,
        "cup": 160,
        "tbsp": 15,
        "g": 1
      },
      per100g: {
        calories: 40,
        protein: 1.1,
        carbs: 9.3,
        fats: 0.1,
        fiber: 1.7,
        sugar: 4.2,
        sodium: 4
      },
      aliases: ["onion", "pyaz", "raw onion", "kanda"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Fresh sliced or chopped salad onion."
    },
    {
      id: "tomato-raw",
      name: "Tomato (Fresh Raw)",
      hindiName: "टमाटर (Tamatar)",
      category: "vegetables",
      state: "raw",
      defaultUnit: "piece",
      defaultQty: 1,
      servingGrams: 120,
      servingLabel: "1 medium tomato (~120g)",
      supportedUnits: {
        "piece": 120,
        "tomato": 120,
        "cup": 180,
        "tbsp": 15,
        "g": 1
      },
      per100g: {
        calories: 18,
        protein: 0.9,
        carbs: 3.9,
        fats: 0.2,
        fiber: 1.2,
        sugar: 2.6,
        sodium: 5
      },
      aliases: ["tomato", "tamatar", "fresh tomato", "red tomato"],
      source: "ICMR-NIN IFCT 2017",
      notes: "1 medium ripe tomato is ~22 kcal."
    },
    {
      id: "cucumber-raw",
      name: "Cucumber (with Peel)",
      hindiName: "खीरा (Kheera)",
      category: "vegetables",
      state: "raw",
      defaultUnit: "piece",
      defaultQty: 1,
      servingGrams: 150,
      servingLabel: "1 medium cucumber (~150g)",
      supportedUnits: {
        "piece": 150,
        "cucumber": 150,
        "cup": 120,
        "g": 1
      },
      per100g: {
        calories: 15,
        protein: 0.7,
        carbs: 3.6,
        fats: 0.1,
        fiber: 0.5,
        sugar: 1.7,
        sodium: 2
      },
      aliases: ["cucumber", "kheera", "kakdi"],
      source: "USDA FoodData Central",
      notes: "Refreshing low-calorie salad vegetable."
    },

    // -------------------------------------------------------------------------
    // 7. NUTS, SEEDS & HEALTHY FATS
    // -------------------------------------------------------------------------
    {
      id: "almonds-raw",
      name: "Almonds (Raw / Soaked)",
      hindiName: "बादाम (Badam)",
      category: "nuts_seeds",
      state: "raw",
      defaultUnit: "piece",
      defaultQty: 10,
      servingGrams: 12,
      servingLabel: "10 kernels (~12g)",
      supportedUnits: {
        "piece": 1.2,
        "almond": 1.2,
        "almonds": 1.2,
        "handful": 28,
        "tbsp": 10,
        "g": 1
      },
      per100g: {
        calories: 579,
        protein: 21.2,
        carbs: 21.6,
        fats: 49.9,
        fiber: 12.5,
        sugar: 4.4,
        sodium: 1
      },
      aliases: ["almonds", "almond", "badam", "soaked badam", "raw almonds"],
      source: "USDA FoodData Central (FDC ID: 170567)",
      notes: "10 almonds (~12g) is ~70 kcal, 2.5g protein, 6.0g healthy monounsaturated fat."
    },
    {
      id: "walnuts-raw",
      name: "Walnuts (Raw Halves)",
      hindiName: "अखरोट (Akhrot)",
      category: "nuts_seeds",
      state: "raw",
      defaultUnit: "piece",
      defaultQty: 4,
      servingGrams: 14,
      servingLabel: "4 walnut halves (~14g)",
      supportedUnits: {
        "piece": 3.5,
        "half": 3.5,
        "walnut": 3.5,
        "handful": 28,
        "g": 1
      },
      per100g: {
        calories: 654,
        protein: 15.2,
        carbs: 13.7,
        fats: 65.2,
        fiber: 6.7,
        sugar: 2.6,
        sodium: 2
      },
      aliases: ["walnut", "walnuts", "akhrot", "raw walnuts"],
      source: "USDA FoodData Central",
      notes: "High in plant-based Omega-3 ALA fatty acids."
    },
    {
      id: "peanut-butter",
      name: "Peanut Butter (Unsweetened)",
      hindiName: "पीनट बटर",
      category: "nuts_seeds",
      state: "raw",
      defaultUnit: "tbsp",
      defaultQty: 1,
      servingGrams: 16,
      servingLabel: "1 tablespoon (~16g)",
      supportedUnits: {
        "tbsp": 16,
        "tablespoon": 16,
        "tsp": 5,
        "teaspoon": 5,
        "g": 1
      },
      per100g: {
        calories: 588,
        protein: 25.1,
        carbs: 19.6,
        fats: 50.4,
        fiber: 6.0,
        sugar: 6.5,
        sodium: 17
      },
      aliases: ["peanut butter", "peanut paste", "mungfali butter"],
      source: "USDA FoodData Central",
      notes: "1 tbsp (16g) provides ~94 kcal, 4.0g protein, 8.1g fats."
    },
    {
      id: "roasted-peanuts",
      name: "Roasted Peanuts (Mungfali)",
      hindiName: "भुनी मूंगफली (Mungfali)",
      category: "nuts_seeds",
      state: "cooked",
      defaultUnit: "handful",
      defaultQty: 1,
      servingGrams: 30,
      servingLabel: "1 handful (~30g)",
      supportedUnits: {
        "handful": 30,
        "tbsp": 12,
        "katori": 80,
        "cup": 140,
        "g": 1
      },
      per100g: {
        calories: 567,
        protein: 25.8,
        carbs: 16.1,
        fats: 49.2,
        fiber: 8.5,
        sugar: 4.7,
        sodium: 18
      },
      aliases: ["peanuts", "roasted peanuts", "mungfali", "singdana"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Dry roasted peanuts, excellent budget-friendly plant protein."
    },
    {
      id: "chia-seeds",
      name: "Chia Seeds",
      hindiName: "चिया बीज",
      category: "nuts_seeds",
      state: "raw",
      defaultUnit: "tbsp",
      defaultQty: 1,
      servingGrams: 12,
      servingLabel: "1 tablespoon (~12g)",
      supportedUnits: {
        "tbsp": 12,
        "tablespoon": 12,
        "tsp": 4,
        "g": 1
      },
      per100g: {
        calories: 486,
        protein: 16.5,
        carbs: 42.1,
        fats: 30.7,
        fiber: 34.4,
        sugar: 0.0,
        sodium: 16
      },
      aliases: ["chia seeds", "chia seed", "sabja seeds", "chia"],
      source: "USDA FoodData Central",
      notes: "Extremely rich in soluble dietary fiber (34% by weight)."
    },

    // -------------------------------------------------------------------------
    // 8. BEVERAGES & SNACKS
    // -------------------------------------------------------------------------
    {
      id: "indian-chai-milk-sugar",
      name: "Indian Chai (Tea with Milk & 1 tsp Sugar)",
      hindiName: "चाय (दूध और चीनी वाली)",
      category: "beverages",
      state: "cooked",
      defaultUnit: "cup",
      defaultQty: 1,
      servingGrams: 150,
      servingLabel: "1 standard tea cup (~150ml)",
      supportedUnits: {
        "cup": 150,
        "glass": 150,
        "serving": 150,
        "ml": 1
      },
      per100g: {
        calories: 57,
        protein: 1.5,
        carbs: 8.0,
        fats: 1.9,
        fiber: 0.0,
        sugar: 7.5,
        sodium: 25
      },
      aliases: ["chai", "tea", "milk tea", "kadak chai", "masala chai", "adrak chai"],
      source: "Standard Indian Tea Model (50% toned milk, 50% water, 1 tsp sugar)",
      notes: "1 cup (150ml) is ~85 kcal, 2.2g protein, 12g carbs."
    },
    {
      id: "black-coffee-tea",
      name: "Black Coffee / Black Tea (Unsweetened)",
      hindiName: "ब्लैक कॉफी / ब्लैक टी",
      category: "beverages",
      state: "cooked",
      defaultUnit: "cup",
      defaultQty: 1,
      servingGrams: 150,
      servingLabel: "1 cup (~150ml)",
      supportedUnits: {
        "cup": 150,
        "mug": 240,
        "ml": 1
      },
      per100g: {
        calories: 1,
        protein: 0.1,
        carbs: 0.2,
        fats: 0.0,
        fiber: 0.0,
        sugar: 0.0,
        sodium: 2
      },
      aliases: ["black coffee", "black tea", "green tea", "espresso", "americano"],
      source: "USDA FoodData Central",
      notes: "Virtually zero calories without milk or sugar."
    },
    {
      id: "coconut-water",
      name: "Fresh Coconut Water",
      hindiName: "नारियल पानी (Nariyal Pani)",
      category: "beverages",
      state: "raw",
      defaultUnit: "glass",
      defaultQty: 1,
      servingGrams: 250,
      servingLabel: "1 glass (~250ml)",
      supportedUnits: {
        "glass": 250,
        "coconut": 250,
        "ml": 1
      },
      per100g: {
        calories: 19,
        protein: 0.7,
        carbs: 3.7,
        fats: 0.2,
        fiber: 1.1,
        sugar: 2.6,
        sodium: 105
      },
      aliases: ["coconut water", "nariyal pani", "daab pani", "tender coconut water"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Natural electrolyte beverage rich in potassium and magnesium."
    },
    {
      id: "roasted-makhana",
      name: "Roasted Makhana (Foxnuts / Lotus Seeds)",
      hindiName: "भुना मखाना",
      category: "snacks",
      state: "cooked",
      defaultUnit: "bowl",
      defaultQty: 1,
      servingGrams: 30,
      servingLabel: "1 bowl (~30g dry roasted with minimal ghee)",
      supportedUnits: {
        "bowl": 30,
        "katori": 20,
        "cup": 15,
        "serving": 30,
        "g": 1
      },
      per100g: {
        calories: 350,
        protein: 9.7,
        carbs: 64.0,
        fats: 3.5,
        fiber: 7.6,
        sugar: 0.5,
        sodium: 15
      },
      aliases: ["makhana", "roasted makhana", "foxnuts", "lotus seeds", "phool makhana"],
      source: "ICMR-NIN IFCT 2017",
      notes: "Light and crunchy low-glycemic Indian snack. 30g serving is ~105 kcal, 3g protein."
    },
    {
      id: "samosa-potato",
      name: "Potato Samosa (Deep Fried)",
      hindiName: "समोसा",
      category: "snacks",
      state: "cooked",
      defaultUnit: "piece",
      defaultQty: 1,
      servingGrams: 75,
      servingLabel: "1 medium samosa (~75g)",
      supportedUnits: {
        "piece": 75,
        "samosa": 75,
        "samosas": 75,
        "g": 1
      },
      per100g: {
        calories: 345,
        protein: 5.3,
        carbs: 34.5,
        fats: 20.0,
        fiber: 3.0,
        sugar: 1.8,
        sodium: 380
      },
      aliases: ["samosa", "samosas", "aloo samosa", "punjabi samosa"],
      source: "ICMR-NIN IFCT 2017",
      notes: "1 medium samosa (75g) delivers ~260 kcal and 15g fat."
    }
  ];

  return FOODS_DATABASE;
}));
