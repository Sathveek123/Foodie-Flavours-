import { DISH_DATA, MenuPreviewDish } from "../components/MenuPreviewTabs";

export interface PlannerInput {
  budget: number;
  peopleCount: number;
  dietaryFilter: "any" | "veg" | "non-veg" | "vegan";
  occasion?: "casual" | "date" | "family" | "celebration" | "quick-bite";
  splitPreferences?: { vegCount: number; nonVegCount: number };
}

export interface MappedDish extends MenuPreviewDish {
  category: string;
  rating: number;
  popularity: number;
  isVegan: boolean;
}

export interface MealPlanItem {
  dish: MappedDish;
  quantity: number;
}

export interface MealPlanResult {
  items: MealPlanItem[];
  totalCost: number;
  budgetUtilization: number; // percentage (0-100)
  nutritionSummary: {
    totalCalories: number;
    balance: "light" | "balanced" | "hearty";
  };
  reasoning: string;
}

// Map the dishes to include dynamic ratings and popularity matching DashboardPage.tsx
export const getMappedDishes = (): MappedDish[] => {
  return Object.entries(DISH_DATA).flatMap(([categoryName, dishes]) =>
    dishes.map((dish) => {
      const rating = 4.2 + (dish.id % 9) * 0.1;
      const popularity = (dish.id * 17) % 150 + 20;
      const isVegan = dish.isVeg && dish.id % 2 === 0;
      return {
        ...dish,
        category: categoryName,
        rating,
        popularity,
        isVegan,
      };
    })
  );
};

// Pure solver function for a single homogeneous group
export function solveSingleGroup(
  budget: number,
  peopleCount: number,
  dietaryFilter: "any" | "veg" | "non-veg" | "vegan",
  occasion: "casual" | "date" | "family" | "celebration" | "quick-bite" = "casual"
): MealPlanResult {
  const allDishes = getMappedDishes();

  // Find cheapest item overall
  const cheapestPrice = Math.min(...allDishes.map((d) => d.price));
  if (budget < cheapestPrice) {
    return {
      items: [],
      totalCost: 0,
      budgetUtilization: 0,
      nutritionSummary: { totalCalories: 0, balance: "light" },
      reasoning: `Your budget of ₹${budget} is insufficient to afford any menu item. The most affordable selection is Masala Chai Latte at ₹140. Please increase your budget by at least ₹${cheapestPrice - budget} to receive recommendations.`,
    };
  }

  // 1. Filter by dietary constraints
  let filtered = allDishes.filter((dish) => {
    if (dietaryFilter === "veg") return dish.isVeg;
    if (dietaryFilter === "non-veg") return !dish.isVeg;
    if (dietaryFilter === "vegan") return dish.isVegan;
    return true;
  });

  if (filtered.length === 0) {
    return {
      items: [],
      totalCost: 0,
      budgetUtilization: 0,
      nutritionSummary: { totalCalories: 0, balance: "light" },
      reasoning: `No menu items found matching the dietary constraint: ${dietaryFilter.toUpperCase()}. Please try resetting your diet filter options.`,
    };
  }

  // 2. Score each dish dynamically based on rating, popularity, and occasion
  const scoredDishes = filtered.map((dish) => {
    let baseScore = dish.rating * 3 + dish.popularity * 0.05;

    // Apply occasion multipliers
    if (occasion === "casual" || occasion === "quick-bite") {
      if (dish.category === "Starters" || dish.category === "Drinks") {
        baseScore *= 1.3;
      }
      if (dish.category === "Main Course") {
        baseScore *= 0.7; // favor quick/lighter items over heavy mains
      }
    } else if (occasion === "date") {
      if (dish.rating >= 4.5) {
        baseScore *= 1.4; // boost signature/premium choicest options
      }
      if (dish.category === "Desserts") {
        baseScore *= 1.3; // boost desserts for sharing
      }
    } else if (occasion === "family") {
      const kidFriendly = ["Pizza", "Burger", "Fries", "Pasta"];
      const isKidFriendly = kidFriendly.some((kw) =>
        dish.name.toLowerCase().includes(kw.toLowerCase())
      );
      if (isKidFriendly) {
        baseScore *= 1.4;
      }
    } else if (occasion === "celebration") {
      if (dish.rating >= 4.6 || dish.popularity >= 100) {
        baseScore *= 1.3; // favor top sellers
      }
      if (dish.category === "Desserts") {
        baseScore *= 1.5; // highly reward sweet additions
      }
    }

    return { dish, score: baseScore };
  });

  // Sort by score density (score/price) for greediness
  const getDensity = (d: { dish: MappedDish; score: number }) => d.score / d.dish.price;

  // 3. Constrained priority-based greedy allocation to build a "balanced plate"
  const selected: Map<number, { dish: MappedDish; quantity: number }> = new Map();
  let remainingBudget = budget;

  const addDish = (dish: MappedDish) => {
    if (remainingBudget >= dish.price) {
      remainingBudget -= dish.price;
      const current = selected.get(dish.id);
      if (current) {
        current.quantity += 1;
      } else {
        selected.set(dish.id, { dish, quantity: 1 });
      }
      return true;
    }
    return false;
  };

  const getFilteredDishesOfCategory = (category: string) => {
    return scoredDishes
      .filter((d) => d.dish.category === category)
      .sort((a, b) => getDensity(b) - getDensity(a))
      .map((d) => d.dish);
  };

  const mainCourses = getFilteredDishesOfCategory("Main Course");
  const starters = getFilteredDishesOfCategory("Starters");
  const drinks = getFilteredDishesOfCategory("Drinks");
  const desserts = getFilteredDishesOfCategory("Desserts");

  // Step A: Attempt to add 1 Main Course per person (if budget allows)
  let mainsAdded = 0;
  if (mainCourses.length > 0) {
    for (let p = 0; p < peopleCount; p++) {
      // Find the best main course we can afford
      const affordableMain = mainCourses.find((m) => remainingBudget >= m.price);
      if (affordableMain) {
        addDish(affordableMain);
        mainsAdded++;
      } else {
        break; // can't afford any more mains
      }
    }
  }

  // Step B: Attempt to add 1 Drink per person
  let drinksAdded = 0;
  if (drinks.length > 0) {
    for (let p = 0; p < peopleCount; p++) {
      const affordableDrink = drinks.find((d) => remainingBudget >= d.price);
      if (affordableDrink) {
        addDish(affordableDrink);
        drinksAdded++;
      } else {
        break;
      }
    }
  }

  // Step C: Attempt to add 1 Starter per person
  let startersAdded = 0;
  if (starters.length > 0) {
    for (let p = 0; p < peopleCount; p++) {
      const affordableStarter = starters.find((s) => remainingBudget >= s.price);
      if (affordableStarter) {
        addDish(affordableStarter);
        startersAdded++;
      } else {
        break;
      }
    }
  }

  // Step D: Attempt to add 1 Dessert if occasion is celebration/date or we have remaining budget
  if (desserts.length > 0) {
    const isDessertRequired = occasion === "celebration" || occasion === "date";
    const loops = isDessertRequired ? Math.max(1, Math.floor(peopleCount / 2)) : 1;
    for (let i = 0; i < loops; i++) {
      const affordableDessert = desserts.find((d) => remainingBudget >= d.price);
      if (affordableDessert) {
        addDish(affordableDessert);
      } else {
        break;
      }
    }
  }

  // Step E: Greedily backfill the remaining budget to optimize utilization (aiming for 85-98%)
  const sortedAllAllowed = [...scoredDishes]
    .sort((a, b) => getDensity(b) - getDensity(a))
    .map((d) => d.dish);

  let iterations = 0;
  while (remainingBudget >= cheapestPrice && iterations < 20) {
    // Try to find the highest density item we can afford
    const bestAffordable = sortedAllAllowed.find((d) => remainingBudget >= d.price);
    if (bestAffordable) {
      addDish(bestAffordable);
    } else {
      break;
    }
    iterations++;
  }

  const items = Array.from(selected.values());
  const totalCost = budget - remainingBudget;
  const budgetUtilization = Math.round((totalCost / budget) * 100);

  // Nutrition compilation
  let totalCalories = 0;
  items.forEach((item) => {
    const calories = item.dish.id * 3 + 120; // consistent calorie math
    totalCalories += calories * item.quantity;
  });

  const avgCaloriesPerPerson = totalCalories / peopleCount;
  let balance: "light" | "balanced" | "hearty" = "balanced";
  if (avgCaloriesPerPerson < 400) balance = "light";
  else if (avgCaloriesPerPerson > 800) balance = "hearty";

  // Dynamic reasoning string construction
  let reasoning = "";
  const itemSummary = items.map((i) => `${i.quantity}x ${i.dish.name}`).join(", ");
  
  if (mainsAdded === 0 && budget >= 300) {
    reasoning = `Given your ₹${budget} budget constraint for ${peopleCount} guests, a main course could not be accommodated. Instead, we have curated a premium selection of sides and drinks: ${itemSummary}. This utilizes ${budgetUtilization}% of your budget with ₹${remainingBudget} remaining.`;
  } else if (mainsAdded === 0) {
    reasoning = `We composed a cozy selection of starters/drinks: ${itemSummary} fitting within your ₹${budget} budget, utilizing ${budgetUtilization}% of it.`;
  } else {
    reasoning = `For your ${occasion} occasion, we designed a balanced plate containing ${itemSummary}. We highlighted our top-rated ${items[0].dish.category.toLowerCase()} options like the ${items[0].dish.name}. This fits perfectly into your ₹${budget} budget with ${budgetUtilization}% utilization (₹${remainingBudget} remaining).`;
  }

  return {
    items,
    totalCost,
    budgetUtilization,
    nutritionSummary: { totalCalories, balance },
    reasoning,
  };
}

// Master solver that supports mixed-diet group splitting
export function solveMealPlan(input: PlannerInput): MealPlanResult {
  const { budget, peopleCount, dietaryFilter, occasion = "casual", splitPreferences } = input;

  // Case A: Mixed-diet group order (e.g. some veg, some non-veg)
  if (
    peopleCount > 1 &&
    splitPreferences &&
    splitPreferences.vegCount > 0 &&
    splitPreferences.nonVegCount > 0 &&
    dietaryFilter === "any"
  ) {
    const vegCount = splitPreferences.vegCount;
    const nonVegCount = splitPreferences.nonVegCount;
    const totalCount = vegCount + nonVegCount;

    // Distribute budget proportionally
    const vegBudget = Math.round(budget * (vegCount / totalCount));
    const nonVegBudget = budget - vegBudget;

    const vegResult = solveSingleGroup(vegBudget, vegCount, "veg", occasion);
    const nonVegResult = solveSingleGroup(nonVegBudget, nonVegCount, "non-veg", occasion);

    // Merge results
    const mergedMap: Map<number, MealPlanItem> = new Map();
    [...vegResult.items, ...nonVegResult.items].forEach((item) => {
      const current = mergedMap.get(item.dish.id);
      if (current) {
        current.quantity += item.quantity;
      } else {
        mergedMap.set(item.dish.id, { dish: item.dish, quantity: item.quantity });
      }
    });

    const items = Array.from(mergedMap.values());
    const totalCost = vegResult.totalCost + nonVegResult.totalCost;
    const budgetUtilization = Math.round((totalCost / budget) * 100);
    const totalCalories = vegResult.nutritionSummary.totalCalories + nonVegResult.nutritionSummary.totalCalories;

    const avgCaloriesPerPerson = totalCalories / peopleCount;
    let balance: "light" | "balanced" | "hearty" = "balanced";
    if (avgCaloriesPerPerson < 400) balance = "light";
    else if (avgCaloriesPerPerson > 800) balance = "hearty";

    const reasoning = `Mixed Group Order Split: We split your ₹${budget} budget proportionally (₹${vegBudget} Veg for ${vegCount} guests, ₹${nonVegBudget} Non-Veg for ${nonVegCount} guests). \n- Veg selections include: ${vegResult.items.map(i => `${i.quantity}x ${i.dish.name}`).join(", ") || "none"}.\n- Non-Veg selections include: ${nonVegResult.items.map(i => `${i.quantity}x ${i.dish.name}`).join(", ") || "none"}.\nTotal budget utilized is ${budgetUtilization}% (₹${budget - totalCost} remaining).`;

    return {
      items,
      totalCost,
      budgetUtilization,
      nutritionSummary: { totalCalories, balance },
      reasoning,
    };
  }

  // Case B: Standard homogeneous group solver
  return solveSingleGroup(budget, peopleCount, dietaryFilter, occasion);
}
