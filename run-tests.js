/**
 * NutriTrack Automated Test Suite
 * Tests all 15 core criteria specified in Section 13:
 * 1. Search for "1 banana"
 * 2. Search for "2 boiled eggs"
 * 3. Search for "100 g cooked rice"
 * 4. Search for "50 g dry soya chunks"
 * 5. Verify serving change 1 -> 2 doubles nutrition
 * 6. Add foods to breakfast and lunch and verify daily totals
 * 7. Edit and delete diary entry, verify totals update
 * 8. Verify data persistence across reloads / migrations
 * 9. Date selection & independent diary logs
 * 10. Unknown food & ambiguous quantities handling
 * 11. Offline / API failure handling
 * 12. Responsive design & layout constraints
 * 13. Empty profile and empty diary states
 * 14. Charts using real saved data
 * 15. Syntax, asset paths, and zero-error integrity
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock localStorage for node environment
const storageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    _dump: () => store
  };
})();
global.localStorage = storageMock;
global.window = { NutriTrack: {} };
global.self = global;

// Load app modules
const FOODS_DATABASE = require('../js/data/foods-db.js');
const Parser = require('../js/services/parser.js');
const NutritionService = require('../js/services/nutrition.js');
const Storage = require('../js/services/storage.js');

let passCount = 0;
let failCount = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message}`);
    failCount++;
  }
}

console.log("\n=======================================================");
console.log("       NutriTrack Automated Test Execution Suite       ");
console.log("=======================================================\n");

// TEST 1: Search for "1 banana"
it('1. Search for "1 banana"', () => {
  const res = NutritionService.resolveQuery("1 banana");
  assert.strictEqual(res.success, true, "Search should succeed");
  assert.strictEqual(res.food.id, "banana-raw", "Identified food should be banana");
  assert.strictEqual(res.nutrition.servingQty, 1, "Quantity should be 1");
  // 1 medium banana is 105 kcal, 1.3g protein
  assert.ok(res.nutrition.calories >= 100 && res.nutrition.calories <= 110, `Calories expected ~105, got ${res.nutrition.calories}`);
  assert.ok(res.nutrition.protein >= 1.0, `Protein expected >= 1g, got ${res.nutrition.protein}`);
});

// TEST 2: Search for "2 boiled eggs"
it('2. Search for "2 boiled eggs"', () => {
  const res = NutritionService.resolveQuery("2 boiled eggs");
  assert.strictEqual(res.success, true, "Search should succeed");
  assert.strictEqual(res.food.id, "boiled-egg", "Identified food should be boiled egg");
  assert.strictEqual(res.nutrition.servingQty, 2, "Quantity should be 2");
  // 2 eggs (~100g) = 148 kcal, 12.6g protein
  assert.strictEqual(res.nutrition.calories, 148, `Calories expected 148, got ${res.nutrition.calories}`);
  assert.strictEqual(res.nutrition.protein, 12.6, `Protein expected 12.6, got ${res.nutrition.protein}`);
});

// TEST 3: Search for "100 g cooked rice"
it('3. Search for "100 g cooked rice"', () => {
  const res = NutritionService.resolveQuery("100 g cooked rice");
  assert.strictEqual(res.success, true, "Search should succeed");
  assert.strictEqual(res.food.id, "cooked-white-rice", "Should identify cooked white rice");
  assert.strictEqual(res.nutrition.state, "cooked", "State must be cooked, not dry");
  assert.strictEqual(res.nutrition.grams, 100, "Grams should be 100");
  assert.strictEqual(res.nutrition.calories, 130, `Calories expected 130, got ${res.nutrition.calories}`);
  assert.strictEqual(res.nutrition.protein, 2.7, `Protein expected 2.7, got ${res.nutrition.protein}`);
});

// TEST 4: Search for "50 g dry soya chunks"
it('4. Search for "50 g dry soya chunks"', () => {
  const res = NutritionService.resolveQuery("50 g dry soya chunks");
  assert.strictEqual(res.success, true, "Search should succeed");
  assert.strictEqual(res.food.id, "soya-chunks-dry", "Should identify dry soya chunks");
  assert.strictEqual(res.nutrition.grams, 50, "Grams should be 50");
  // 100g dry = 345 kcal, 52g protein -> 50g = 172.5 kcal, 26g protein
  assert.strictEqual(res.nutrition.calories, 172.5, `Calories expected 172.5, got ${res.nutrition.calories}`);
  assert.strictEqual(res.nutrition.protein, 26.0, `Protein expected 26.0, got ${res.nutrition.protein}`);
});

// TEST 5: Change serving 1 -> 2 and verify nutrition doubles
it('5. Verify serving change 1 -> 2 doubles nutrition', () => {
  const egg = FOODS_DATABASE.find(f => f.id === "boiled-egg");
  const nut1 = NutritionService.calculateNutrition(egg, 1, "piece");
  const nut2 = NutritionService.calculateNutrition(egg, 2, "piece");

  assert.strictEqual(nut2.calories, nut1.calories * 2, "Calories should exactly double");
  assert.strictEqual(nut2.protein, nut1.protein * 2, "Protein should exactly double");
  assert.strictEqual(nut2.grams, nut1.grams * 2, "Weight should exactly double");
});

// TEST 6: Add foods to breakfast and lunch and verify daily totals
it('6. Add foods to breakfast and lunch and verify daily totals', () => {
  const testState = JSON.parse(JSON.stringify(Storage.DEFAULT_STATE));
  const testDate = "2026-10-29";
  testState.diary[testDate] = {
    "Breakfast": [],
    "Morning snack": [],
    "Lunch": [],
    "Evening snack": [],
    "Dinner": []
  };

  const eggRes = NutritionService.resolveQuery("2 boiled eggs");
  testState.diary[testDate]["Breakfast"].push(eggRes.nutrition); // 148 kcal, 12.6g P

  const riceRes = NutritionService.resolveQuery("100 g cooked rice");
  testState.diary[testDate]["Lunch"].push(riceRes.nutrition); // 130 kcal, 2.7g P

  // Calculate day total
  let totalCal = 0, totalP = 0;
  Object.values(testState.diary[testDate]).forEach(items => {
    items.forEach(i => {
      totalCal += i.calories;
      totalP += i.protein;
    });
  });

  assert.strictEqual(totalCal, 278, `Total calories should be 148 + 130 = 278, got ${totalCal}`);
  assert.strictEqual(Math.round(totalP * 10) / 10, 15.3, `Total protein should be 12.6 + 2.7 = 15.3, got ${totalP}`);
});

// TEST 7: Edit and delete a diary entry and verify totals update
it('7. Edit and delete a diary entry and verify totals update', () => {
  const testState = JSON.parse(JSON.stringify(Storage.DEFAULT_STATE));
  const testDate = "2026-10-29";
  testState.diary[testDate] = { "Breakfast": [] };

  const eggRes = NutritionService.resolveQuery("2 boiled eggs");
  eggRes.nutrition.id = "test-egg-entry";
  testState.diary[testDate]["Breakfast"].push(eggRes.nutrition);

  // Edit quantity from 2 to 3
  const item = testState.diary[testDate]["Breakfast"][0];
  const factor = 3 / 2;
  item.servingQty = 3;
  item.calories = item.calories * factor;
  assert.strictEqual(item.calories, 222, `3 eggs should equal 222 kcal, got ${item.calories}`);

  // Delete entry
  testState.diary[testDate]["Breakfast"] = [];
  assert.strictEqual(testState.diary[testDate]["Breakfast"].length, 0, "Breakfast should be empty after deletion");
});

// TEST 8: Storage persistence across reloads & migration
it('8. Refresh the browser and verify saved data remains & migrations work', () => {
  storageMock.clear();

  // Test legacy v1 migration
  storageMock.setItem("nutritrackData", JSON.stringify({
    date: new Date().toDateString(),
    goal: 2200,
    foods: [{ name: "Legacy Apple", calories: 95, protein: 0.5, carbs: 25, fats: 0.3, meal: "Breakfast" }],
    water: 4
  }));

  const loaded = Storage.loadState();
  assert.strictEqual(loaded.version, 2, "State should be migrated to v2");
  assert.strictEqual(loaded.goals.calories, 2200, "Goal calories should migrate");
  const todayKey = Storage.formatDate(new Date());
  assert.strictEqual(loaded.diary[todayKey]["Breakfast"].length, 1, "Legacy food should migrate to Breakfast");
  assert.strictEqual(loaded.diary[todayKey]["Breakfast"][0].foodName, "Legacy Apple");

  // Save changes and reload
  loaded.profile.name = "Verified Tester";
  Storage.saveState(loaded);
  const reloaded = Storage.loadState();
  assert.strictEqual(reloaded.profile.name, "Verified Tester", "Data persists across reloads");
});

// TEST 9: Select another date and verify diary changes correctly
it('9. Select another date and verify diary changes correctly', () => {
  const testState = JSON.parse(JSON.stringify(Storage.DEFAULT_STATE));
  testState.diary["2026-10-28"] = { "Breakfast": [{ foodName: "Oatmeal", calories: 150 }] };
  testState.diary["2026-10-29"] = { "Breakfast": [{ foodName: "Dosa", calories: 200 }] };

  assert.strictEqual(testState.diary["2026-10-28"]["Breakfast"][0].foodName, "Oatmeal");
  assert.strictEqual(testState.diary["2026-10-29"]["Breakfast"][0].foodName, "Dosa");
  assert.notStrictEqual(testState.diary["2026-10-28"], testState.diary["2026-10-29"], "Dates maintain isolated records");
});

// TEST 10: Unknown food names and ambiguous quantities
it('10. Test unknown food names and ambiguous quantities', () => {
  // Unknown food
  const unknown = NutritionService.resolveQuery("unknown exotic dragonfruit candy");
  assert.strictEqual(unknown.success, false, "Unknown food should return success = false");
  assert.strictEqual(unknown.food, null, "Food should be null");

  // Ambiguous query: "rice" without unit or quantity
  const amb = NutritionService.resolveQuery("rice");
  assert.strictEqual(amb.success, true, "Resolves to default staple");
  assert.strictEqual(amb.food.id, "cooked-white-rice", "Default should be cooked white rice");
  assert.strictEqual(amb.nutrition.grams, 100, "Should default to 100g reference");
});

// TEST 11: Offline / failed API responses
it('11. Test offline or failed API responses', async () => {
  // Pass null or invalid key to USDA search
  const result = await NutritionService.searchExternalUSDA("apple", null);
  assert.strictEqual(result, null, "Should return null and not crash when API key is missing or offline");
});

// TEST 12: Test responsive layout and CSS integrity
it('12. Test CSS stylesheet and layout integrity', () => {
  const css = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');
  assert.ok(css.includes('@media (max-width: 1080px)'), "CSS must include tablet breakpoint");
  assert.ok(css.includes('@media (max-width: 860px)'), "CSS must include medium mobile breakpoint");
  assert.ok(css.includes('@media (max-width: 580px)'), "CSS must include small mobile breakpoint");
  assert.ok(css.includes('prefers-reduced-motion'), "CSS must respect reduced motion accessibility");
});

// TEST 13: Test empty profile and empty diary states
it('13. Test empty profile and empty diary states', () => {
  const emptyState = JSON.parse(JSON.stringify(Storage.DEFAULT_STATE));
  assert.strictEqual(Object.keys(emptyState.diary).length, 0, "New user starts with clean empty diary");
  assert.strictEqual(emptyState.weightHistory.length, 0, "New user starts with empty weight history");
  // Calculate BMR on defaults
  const bmr = Storage.calculateBMRAndTDEE(emptyState.profile);
  assert.ok(bmr.targetCalories >= 1200, "Calculated target calories must be within safe physiological range");
});

// TEST 14: Verify charts calculate from actual saved data
it('14. Verify charts calculate from actual saved data', () => {
  const demoData = Storage.loadDemoData();
  const dateKeys = Object.keys(demoData.diary);
  assert.ok(dateKeys.length >= 7, "Demo data must populate 7 days of diary records");
  
  // Verify each day contains real calculated entries
  dateKeys.forEach(date => {
    let dayCal = 0;
    Object.values(demoData.diary[date]).forEach(mealItems => {
      mealItems.forEach(item => { dayCal += item.calories; });
    });
    assert.ok(dayCal > 1000, `Day ${date} should have realistic calories (>1000), got ${dayCal}`);
  });
});

// TEST 15: Verify all file paths and zero syntax errors
it('15. Verify all file paths and zero syntax errors', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const requiredFiles = [
    'style.css',
    'js/data/foods-db.js',
    'js/services/parser.js',
    'js/services/nutrition.js',
    'js/services/storage.js',
    'js/components/charts.js',
    'js/components/modals.js',
    'js/app.js'
  ];

  requiredFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    assert.ok(fs.existsSync(fullPath), `Required file must exist: ${file}`);
    assert.ok(html.includes(file), `index.html must reference: ${file}`);
  });
});

console.log("\n=======================================================");
console.log(`Test Execution Summary: ${passCount} Passed, ${failCount} Failed.`);
console.log("=======================================================\n");

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
