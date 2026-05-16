// main.js

// ================= USER PAGE =================

// LOAD CATEGORY

getCategories();

// LOAD FOOD

getFoods();

// SEARCH FOOD

$("#searchInput").on("keyup", function () {
  const keyword = $(this).val().toLowerCase();

  const filteredFoods = foodsData.filter((food) =>
    food.TenMon.toLowerCase().includes(keyword),
  );

  displayFoods(filteredFoods);
});

// FILTER CATEGORY

function filterCategory(category) {
  const filteredFoods = foodsData.filter((food) => food.DanhMuc === category);

  displayFoods(filteredFoods);
}
