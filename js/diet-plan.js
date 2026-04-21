// ============================================
// DIET PLAN & NUTRITION MODULE
// ============================================

// ── Meal Plans by Goal ──
const MEAL_PLANS = {
  bulking: {
    dailyCalories: 3200,
    protein: 180,
    carbs: 400,
    fats: 90,
    meals: [
      {
        time: 'Breakfast',
        icon: '🌅',
        name: 'Power Oats & Eggs',
        calories: 650,
        protein: 40,
        carbs: 80,
        fats: 18,
        ingredients: 'Oats (80g), whole eggs (3), banana, peanut butter (1 tbsp), honey, milk (200ml)'
      },
      {
        time: 'Mid-Morning',
        icon: '🍌',
        name: 'Protein Shake & Almonds',
        calories: 400,
        protein: 35,
        carbs: 30,
        fats: 15,
        ingredients: 'Whey protein (1 scoop), banana, milk (300ml), almonds (20g)'
      },
      {
        time: 'Lunch',
        icon: '☀️',
        name: 'Chicken Rice Bowl',
        calories: 750,
        protein: 50,
        carbs: 90,
        fats: 18,
        ingredients: 'Grilled chicken breast (200g), brown rice (150g), mixed vegetables, olive oil, salad'
      },
      {
        time: 'Afternoon Snack',
        icon: '🥜',
        name: 'Greek Yogurt & Granola',
        calories: 350,
        protein: 25,
        carbs: 40,
        fats: 10,
        ingredients: 'Greek yogurt (200g), granola (40g), mixed berries, honey drizzle'
      },
      {
        time: 'Dinner',
        icon: '🌙',
        name: 'Salmon with Sweet Potato',
        calories: 700,
        protein: 45,
        carbs: 70,
        fats: 25,
        ingredients: 'Salmon fillet (180g), sweet potato (200g), broccoli, asparagus, olive oil'
      },
      {
        time: 'Before Bed',
        icon: '🌜',
        name: 'Casein Shake',
        calories: 350,
        protein: 30,
        carbs: 15,
        fats: 8,
        ingredients: 'Casein protein (1 scoop), milk (250ml), peanut butter (1 tsp), cinnamon'
      }
    ]
  },
  cutting: {
    dailyCalories: 2000,
    protein: 180,
    carbs: 150,
    fats: 65,
    meals: [
      {
        time: 'Breakfast',
        icon: '🌅',
        name: 'Egg White Omelette',
        calories: 350,
        protein: 35,
        carbs: 20,
        fats: 12,
        ingredients: 'Egg whites (5), 1 whole egg, spinach, bell peppers, tomatoes, 1 slice whole wheat toast'
      },
      {
        time: 'Mid-Morning',
        icon: '🍏',
        name: 'Protein & Apple',
        calories: 250,
        protein: 30,
        carbs: 20,
        fats: 5,
        ingredients: 'Whey protein (1 scoop) with water, green apple (1 medium)'
      },
      {
        time: 'Lunch',
        icon: '☀️',
        name: 'Grilled Chicken Salad',
        calories: 450,
        protein: 45,
        carbs: 25,
        fats: 18,
        ingredients: 'Chicken breast (180g), mixed greens, cherry tomatoes, cucumber, olive oil dressing, quinoa (50g)'
      },
      {
        time: 'Afternoon Snack',
        icon: '🥒',
        name: 'Cottage Cheese & Veggies',
        calories: 200,
        protein: 25,
        carbs: 10,
        fats: 6,
        ingredients: 'Low-fat cottage cheese (150g), celery sticks, carrot sticks, bell pepper strips'
      },
      {
        time: 'Dinner',
        icon: '🌙',
        name: 'Fish with Vegetables',
        calories: 450,
        protein: 40,
        carbs: 30,
        fats: 16,
        ingredients: 'White fish / tilapia (200g), steamed broccoli, green beans, brown rice (80g), lemon'
      },
      {
        time: 'Before Bed',
        icon: '🌜',
        name: 'Casein & Almonds',
        calories: 300,
        protein: 28,
        carbs: 10,
        fats: 12,
        ingredients: 'Casein protein (1 scoop) with water, almonds (15g)'
      }
    ]
  },
  maintenance: {
    dailyCalories: 2500,
    protein: 150,
    carbs: 280,
    fats: 80,
    meals: [
      {
        time: 'Breakfast',
        icon: '🌅',
        name: 'Balanced Morning Bowl',
        calories: 480,
        protein: 30,
        carbs: 55,
        fats: 15,
        ingredients: 'Oats (60g), eggs (2), banana, milk (200ml), mixed seeds (10g)'
      },
      {
        time: 'Mid-Morning',
        icon: '🍎',
        name: 'Trail Mix & Fruit',
        calories: 300,
        protein: 15,
        carbs: 35,
        fats: 12,
        ingredients: 'Mixed nuts (25g), dried fruits, apple or banana, dark chocolate (10g)'
      },
      {
        time: 'Lunch',
        icon: '☀️',
        name: 'Turkey Wrap',
        calories: 550,
        protein: 40,
        carbs: 50,
        fats: 18,
        ingredients: 'Turkey breast (150g), whole wheat wrap, avocado (half), lettuce, tomato, cheese'
      },
      {
        time: 'Afternoon Snack',
        icon: '🥛',
        name: 'Protein Smoothie',
        calories: 320,
        protein: 25,
        carbs: 35,
        fats: 8,
        ingredients: 'Whey protein (1 scoop), mixed berries, banana (half), oat milk (250ml)'
      },
      {
        time: 'Dinner',
        icon: '🌙',
        name: 'Lean Steak & Potatoes',
        calories: 600,
        protein: 42,
        carbs: 55,
        fats: 20,
        ingredients: 'Lean beef steak (180g), baby potatoes (200g), grilled asparagus, side salad, olive oil'
      },
      {
        time: 'Before Bed',
        icon: '🌜',
        name: 'Greek Yogurt',
        calories: 250,
        protein: 20,
        carbs: 15,
        fats: 10,
        ingredients: 'Greek yogurt (200g), walnuts (10g), honey (1 tsp)'
      }
    ]
  }
};

let currentGoal = 'bulking';
let waterGlassCount = 0;

/**
 * Render macro summary bar
 */
function renderMacroSummary(plan) {
  const container = document.getElementById('macroSummary');
  if (!container) return;

  container.innerHTML = `
    <div class="macro-card animate-fade-up stagger-1">
      <div class="macro-value" style="color: var(--color-neon);">${plan.dailyCalories}<span class="macro-unit">kcal</span></div>
      <div class="macro-label">Daily Calories</div>
    </div>
    <div class="macro-card animate-fade-up stagger-2">
      <div class="macro-value" style="color: var(--color-info);">${plan.protein}<span class="macro-unit">g</span></div>
      <div class="macro-label">Protein</div>
    </div>
    <div class="macro-card animate-fade-up stagger-3">
      <div class="macro-value" style="color: var(--color-warning);">${plan.carbs}<span class="macro-unit">g</span></div>
      <div class="macro-label">Carbs</div>
    </div>
    <div class="macro-card animate-fade-up stagger-4">
      <div class="macro-value" style="color: var(--color-error);">${plan.fats}<span class="macro-unit">g</span></div>
      <div class="macro-label">Fats</div>
    </div>
  `;
}

/**
 * Render meal cards
 */
function renderMeals(meals) {
  const container = document.getElementById('mealGrid');
  if (!container) return;

  container.innerHTML = meals.map((meal, i) => `
    <div class="meal-card animate-fade-up stagger-${i + 1}">
      <div class="meal-card-header">
        <span class="meal-time-icon">${meal.icon}</span>
        <span class="meal-time">${meal.time}</span>
        <span class="badge badge-neon" style="margin-left: auto;">${meal.calories} kcal</span>
      </div>
      <div class="meal-card-body">
        <div class="meal-name">${meal.name}</div>
        <div class="meal-macros">
          <span class="meal-macro"><strong>${meal.protein}g</strong> protein</span>
          <span class="meal-macro"><strong>${meal.carbs}g</strong> carbs</span>
          <span class="meal-macro"><strong>${meal.fats}g</strong> fats</span>
        </div>
        <div class="meal-ingredients">📝 ${meal.ingredients}</div>
      </div>
    </div>
  `).join('');
}

/**
 * Render water tracker
 */
function renderWaterTracker() {
  const container = document.getElementById('waterGlasses');
  const countEl = document.getElementById('waterCount');
  if (!container) return;

  container.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const glass = document.createElement('div');
    glass.className = `water-glass ${i < waterGlassCount ? 'filled' : ''}`;
    glass.addEventListener('click', () => {
      waterGlassCount = i + 1;
      renderWaterTracker();
      updateWaterStat();
    });
    container.appendChild(glass);
  }

  if (countEl) countEl.textContent = waterGlassCount;
}

/**
 * Update the water stat on the overview
 */
function updateWaterStat() {
  const statEl = document.getElementById('statWater');
  if (statEl) statEl.textContent = `${waterGlassCount}/8`;
}

/**
 * Render the full diet section
 */
function renderDiet(goal) {
  const plan = MEAL_PLANS[goal];
  if (!plan) return;

  renderMacroSummary(plan);
  renderMeals(plan.meals);
  renderWaterTracker();
}

/**
 * Initialize diet plan module
 */
export function initDietPlan(userGoal) {
  currentGoal = userGoal || 'bulking';
  const tabs = document.getElementById('dietGoalTabs');

  if (tabs) {
    const tabBtns = tabs.querySelectorAll('.tab');

    // Set the user's goal tab as active
    tabBtns.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.goal === currentGoal) {
        btn.classList.add('active');
      }
    });

    // Tab click handlers
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentGoal = btn.dataset.goal;
        renderDiet(currentGoal);
      });
    });
  }

  renderDiet(currentGoal);
}
