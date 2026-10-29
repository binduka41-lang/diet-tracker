const STORAGE_KEY = "nutritrackData";
const DEFAULT_GOAL = 2000;
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snacks"];
const MEAL_EMOJIS = { Breakfast: "🍳", Lunch: "🥙", Dinner: "🍲", Snacks: "🍎" };

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const today = new Date().toDateString();
    if (saved && saved.date === today) {
      return {
        date: today,
        foods: Array.isArray(saved.foods) ? saved.foods : [],
        water: Number.isFinite(saved.water) ? Math.min(8, Math.max(0, saved.water)) : 0,
        goal: Number.isFinite(saved.goal) ? saved.goal : DEFAULT_GOAL
      };
    }
  } catch (error) {
    console.warn("Could not load saved tracker data.", error);
  }
  return { date: new Date().toDateString(), foods: [], water: 0, goal: DEFAULT_GOAL };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    alert("Your browser could not save the data. Check your browser storage settings.");
  }
}

function numberFrom(id) {
  return Number(document.getElementById(id).value) || 0;
}

function sum(field) {
  return state.foods.reduce((total, food) => total + Number(food[field] || 0), 0);
}

function safeText(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function formatNumber(value) {
  return Number(value.toFixed(1)).toString();
}

function renderDashboard() {
  const calories = sum("calories");
  const protein = sum("protein");
  const carbs = sum("carbs");
  const fats = sum("fats");

  document.getElementById("caloriesConsumed").textContent = formatNumber(calories);
  document.getElementById("calorieGoal").textContent = state.goal;
  document.getElementById("caloriesRemaining").textContent = formatNumber(Math.max(0, state.goal - calories));
  document.getElementById("calorieProgress").style.width = `${Math.min(100, (calories / state.goal) * 100)}%`;

  document.getElementById("proteinTotal").textContent = formatNumber(protein);
  document.getElementById("carbsTotal").textContent = formatNumber(carbs);
  document.getElementById("fatsTotal").textContent = formatNumber(fats);
  document.getElementById("proteinProgress").style.width = `${Math.min(100, protein)}%`;
  document.getElementById("carbsProgress").style.width = `${Math.min(100, (carbs / 250) * 100)}%`;
  document.getElementById("fatsProgress").style.width = `${Math.min(100, (fats / 65) * 100)}%`;

  document.getElementById("waterCount").textContent = state.water;
  document.getElementById("goalInput").value = state.goal;
  renderWater();
  renderMeals();
}

function renderWater() {
  const holder = document.getElementById("waterGlasses");
  holder.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `glass ${i < state.water ? "filled" : ""}`;
    button.textContent = "●";
    button.title = `Set water intake to ${i + 1} glasses`;
    button.setAttribute("aria-label", button.title);
    button.addEventListener("click", () => {
      state.water = i < state.water ? i + 1 : i + 1;
      saveState();
      renderDashboard();
    });
    holder.appendChild(button);
  }
}

function renderMeals() {
  const holder = document.getElementById("mealLists");
  const emptyState = document.getElementById("emptyState");
  holder.innerHTML = "";
  emptyState.hidden = state.foods.length > 0;

  MEALS.forEach(meal => {
    const foods = state.foods.filter(food => food.meal === meal);
    if (!foods.length) return;

    const group = document.createElement("div");
    group.className = "meal-group";
    const mealCalories = foods.reduce((total, food) => total + food.calories, 0);
    group.innerHTML = `
      <div class="meal-title"><span>${MEAL_EMOJIS[meal]} ${meal}</span><span>${formatNumber(mealCalories)} kcal</span></div>
      ${foods.map(food => `
        <div class="food-item">
          <div class="food-symbol">${MEAL_EMOJIS[meal]}</div>
          <div class="food-details">
            <strong>${safeText(food.name)}</strong>
            <span>P ${formatNumber(food.protein)} g · C ${formatNumber(food.carbs)} g · F ${formatNumber(food.fats)} g</span>
          </div>
          <div class="food-calories">${formatNumber(food.calories)} kcal</div>
          <button class="delete-food" type="button" data-id="${food.id}" aria-label="Delete ${safeText(food.name)}" title="Delete food">×</button>
        </div>
      `).join("")}
    `;
    holder.appendChild(group);
  });

  holder.querySelectorAll(".delete-food").forEach(button => {
    button.addEventListener("click", () => {
      state.foods = state.foods.filter(food => food.id !== button.dataset.id);
      saveState();
      renderDashboard();
    });
  });
}

document.getElementById("foodForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("foodName").value.trim();
  const calories = numberFrom("foodCalories");
  const protein = numberFrom("foodProtein");
  const carbs = numberFrom("foodCarbs");
  const fats = numberFrom("foodFats");

  if (!name) {
    alert("Please enter a food name.");
    return;
  }
  if ([calories, protein, carbs, fats].some(value => value < 0 || !Number.isFinite(value))) {
    alert("Please enter valid nutrition values.");
    return;
  }

  state.foods.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    meal: document.getElementById("mealType").value,
    calories, protein, carbs, fats
  });
  saveState();
  renderDashboard();
  event.target.reset();
  document.getElementById("foodProtein").value = 0;
  document.getElementById("foodCarbs").value = 0;
  document.getElementById("foodFats").value = 0;
  document.getElementById("foodName").focus();
});

document.getElementById("addWater").addEventListener("click", () => {
  state.water = Math.min(8, state.water + 1);
  saveState();
  renderDashboard();
});

document.getElementById("removeWater").addEventListener("click", () => {
  state.water = Math.max(0, state.water - 1);
  saveState();
  renderDashboard();
});

document.getElementById("saveGoal").addEventListener("click", () => {
  const goal = Number(document.getElementById("goalInput").value);
  if (!Number.isFinite(goal) || goal < 500 || goal > 10000) {
    alert("Please choose a calorie goal between 500 and 10,000.");
    return;
  }
  state.goal = Math.round(goal);
  saveState();
  renderDashboard();
});

document.getElementById("resetButton").addEventListener("click", () => {
  const confirmed = confirm("Reset today's food log and water intake? This cannot be undone.");
  if (!confirmed) return;
  state.foods = [];
  state.water = 0;
  saveState();
  renderDashboard();
});

document.getElementById("todayDate").textContent = new Intl.DateTimeFormat("en-IN", {
  weekday: "short", day: "numeric", month: "short", year: "numeric"
}).format(new Date());

renderDashboard();
