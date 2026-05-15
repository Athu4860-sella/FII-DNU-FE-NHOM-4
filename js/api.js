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

// GET
function getDishes() {

    return fetch(DISHES_API)

        .then(res => {

            if (!res.ok) {
                throw new Error("Lỗi API");
            }

            return res.json();
        })

        .catch(err => {

            console.log(err);

            alert("Không thể tải dữ liệu");
        });
}


// CREATE
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


// UPDATE
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


// DELETE
function deleteDish(id) {

    return fetch(`${DISHES_API}/${id}`, {

        method: "DELETE"

    })

        .then(res => res.json());
}



// ==========================
// CATEGORIES API
// ==========================

// GET CATEGORY
function getCategories() {

    return fetch(CATEGORIES_API)

        .then(res => res.json())

        .catch(err => {

            console.log(err);

            alert("Không tải được category");
        });
}