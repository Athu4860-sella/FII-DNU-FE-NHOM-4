// ==========================
// BASE URL
// ==========================

const BASE_API =
    "https://69fc37aafce564e259177aba.mockapi.io/api/v1";

const DISHES_API =
    `${BASE_API}/dishes`;

const CATEGORIES_API =
    `${BASE_API}/categories`;


// ==========================
// DISHES API
// ==========================

// GET ALL DISHES
function getDishes() {

    return fetch(DISHES_API)
        .then(res => res.json())
        .catch(err => {
            console.log(err);

            alert("Không thể tải danh sách món ăn");
        });
}

// CREATE DISH
function createDish(data) {

    return fetch(DISHES_API, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)
    })
        .then(res => res.json());
}

// UPDATE DISH
function updateDish(id, data) {

    return fetch(`${DISHES_API}/${id}`, {
        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)
    })
        .then(res => res.json());
}

// DELETE DISH
function deleteDish(id) {

    return fetch(`${DISHES_API}/${id}`, {
        method: "DELETE"
    })
        .then(res => res.json());
}



// ==========================
// CATEGORIES API
// ==========================

// GET ALL CATEGORIES
function getCategories() {

    return fetch(CATEGORIES_API)
        .then(res => res.json())
        .catch(err => {
            console.log(err);

            alert("Không thể tải danh mục");
        });
}

// CREATE CATEGORY
function createCategory(data) {

    return fetch(CATEGORIES_API, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)
    })
        .then(res => res.json());
}

// UPDATE CATEGORY
function updateCategory(id, data) {

    return fetch(`${CATEGORIES_API}/${id}`, {
        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)
    })
        .then(res => res.json());
}

// DELETE CATEGORY
function deleteCategory(id) {

    return fetch(`${CATEGORIES_API}/${id}`, {
        method: "DELETE"
    })
        .then(res => res.json());
}