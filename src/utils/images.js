/** Paths relative to public/Assets — served at /Assets/... in CRA */
export const ASSETS = {
  banner: "/Assets/banner.jpg",
  breakfast: "/Assets/breakfast.jpg",
  lunch: "/Assets/lunch.jpg",
  snacks: "/Assets/snacks.jpg",
  dinner: "/Assets/dinner.jpg",
  drinks: "/Assets/drinks.jpg",
  nightlife: "/Assets/nightlife.jpg",
  northIndian: "/Assets/north-indian.jpg",
  southIndian: "/Assets/south-indian.jpg",
  chinese: "/Assets/chinese.jpg",
  fastfood: "/Assets/fastfood.jpg",
  streetfood: "/Assets/streetfood.jpg",
  menuItem: "/Assets/menu-item.jpg",
  beverage: "/Assets/beverage.jpg",
  restaurants: [
    "/Assets/restaurant-1.jpg",
    "/Assets/restaurant-2.jpg",
    "/Assets/restaurant-3.jpg",
    "/Assets/restaurant-4.jpg",
    "/Assets/restaurant-5.jpg",
    "/Assets/restaurant-6.jpg",
  ],
};

export const MEAL_IMAGES = {
  1: ASSETS.breakfast,
  2: ASSETS.lunch,
  3: ASSETS.snacks,
  4: ASSETS.dinner,
  5: ASSETS.drinks,
  6: ASSETS.nightlife,
};

export const CUISINE_IMAGES = {
  1: ASSETS.northIndian,
  2: ASSETS.southIndian,
  3: ASSETS.chinese,
  4: ASSETS.fastfood,
  5: ASSETS.streetfood,
};

/** Normalize DB paths like "Assets/foo.jpg" or "./Assets/foo" → "/Assets/foo.jpg" */
export const getImageUrl = (path, fallback = ASSETS.restaurants[0]) => {
  if (!path) return fallback;
  if (typeof path === "string" && path.startsWith("http")) return path;
  const normalized = String(path)
    .replace(/^\.\//, "")
    .replace(/^Assets\//, "/Assets/");
  if (normalized.startsWith("/Assets/")) return normalized;
  if (normalized.startsWith("Assets/")) return `/${normalized}`;
  return fallback;
};

export const restaurantGallery = (id) => {
  const n = ASSETS.restaurants.length;
  const a = ASSETS.restaurants[(id - 1) % n];
  const b = ASSETS.restaurants[id % n];
  const c = MEAL_IMAGES[(id % 6) + 1] || ASSETS.menuItem;
  return [a, b, c];
};
