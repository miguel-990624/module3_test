const dynnamicContent = document.getElementById("content");


const routes = {
    "/": "/html/login.html",
    "/events": "/html/events.html",
    "/add": "/html/add.html",
    "/cart": "/html/cart.html",
    "/edit": "/html/edit.html",
    "/register": "/html/register.html"
};


document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
        e.preventDefault();
        const path = e.target.getAttribute("href");
        navigate(path);
    }
});

async function navigate(path) {

    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const isAdmin = localStorage.getItem("isAdmin");
    const navbar = document.getElementById("navbar");
    const AdminNavbar =
        `
    <nav>
        <a href="/events" data-link>Events</a>
        <a href="/add" data-link>Add New Product</a>
        <a href="/cart" data-link>Cart</a>
        <button id="logout-btn" type="button">Logout</button>
    </nav>
    `;

    if (isLoggedIn) {
        navbar.innerHTML = AdminNavbar;
        const logoutBtn = document.getElementById("logout-btn")

        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("loggedIn");
                navigate("/");
            });
        }
    } else {
        navbar.innerHTML = "";
    }

    if (!isLoggedIn && path !== "/") {
        return navigate("/");
    }

    if (isLoggedIn && path === "/") {
        return navigate("/events");
    }



    const cleanPath = path.split("?")[0];
    const route = routes[cleanPath];
    const html = await fetch(route).then(res => res.text());
    dynnamicContent.innerHTML = html;

    if (path === "/") setupLogin();
    if (path === "/register") setupRegister();
    if (path === "/events") setupEvents();
    if (path === "/add") setupAddForm();
    if (path.startsWith("/edit")) {
        setupEditForm(path);
    }
    if (path === "/cart") setupCart();
    history.pushState({}, "", path);
};

function setupLogin() {
    const login = document.getElementById("login-form");
    login.addEventListener("submit", (e) => {
        e.preventDefault();
        const loginEmail = document.getElementById("email").value.trim();
        const loginPassword = document.getElementById("password").value.trim();
        if(!loginEmail || !loginPassword){
            alert("Please enter valid values");
            return;
        }

        fetch("http://localhost:3000/users")
        .then(res => res.json())
        .then(users => {
            const user = users.find((u) => u.email === loginEmail && u.password === loginPassword);

              if (user) {
                localStorage.setItem("loggedIn", "true");
                localStorage.setItem("isAdmin", (user.role === "admin"));
                navigate("/events");
              } else {
                alert ("Correo o contraseña incorrectos");
                return navigate("/");
              }
        })  
    })
}

function setupRegister() {
    const login = document.getElementById("register-form");
    login.addEventListener("submit", (e) => {
        e.preventDefault();
        const registerName = document.getElementById("name").value.trim();
        const registerEmail = document.getElementById("email").value.trim();
        const registerPassword1 = document.getElementById("password1").value.trim();
        const registerPassword2 = document.getElementById("password2").value.trim();

        if(!registerName || !registerEmail || !registerPassword1 || !registerPassword2){
            alert("Please enter valid values");
            return;
        }

        if (registerPassword1 !== registerPassword2){
            alert("Passwords do not match");
            return;
        }

        fetch("http://localhost:3000/users")
        .then(res => res.json())
        .then(users => {
            const user = users.find((u) => u.email === registerEmail);

              if (user) {
                alert ("Email already registered");
                return navigate("/");
              } else {
                fetch("http://localhost:3000/users",{
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: registerName,
                        email: registerEmail,
                        password: registerPassword1,
                        role: "Visitor"
                    })
                })
                .then(res => res.json())
                .then(() => {
                    alert ("User added successfully");
                    return navigate("/");
                })
              }
        })
    })
}

function setupEvents() {
    const display = document.getElementById("event-list");
    const isAdmin = localStorage.getItem("isAdmin");
    display.innerHTML = "";
    fetch("http://localhost:3000/events")
        .then(res => {
            if (!res.ok) {
                throw new Error("Failed to fetch events");
            }
            return res.json();
        })
        .then(data => {
            if (data.length === 0) {
                if( isAdmin) {
                    display.innerHTML = "<p>No events available. Please add some.</p>";
                }else {
                    display.innerHTML = "<p>No events available.</p>";
                    return;
                }
            }
            data.forEach(element => {
                const tableRow = document.createElement("tr");
                tableRow.innerHTML = `
                <td>${element.name}</td>
                <td>${element.price}</td>
                `;
                const editBtn = document.createElement("button");
                editBtn.classList.add("edit-btn");
                editBtn.textContent = "Edit";
                editBtn.addEventListener("click", () => {
                    navigate(`/edit?id=${element.id}`)
                });

                const addBtn = document.createElement("button");
                addBtn.textContent = "Add to Cart";
                addBtn.addEventListener("click", () => {
                    addToCart(element);
                });

                tableRow.appendChild(editBtn);
                tableRow.appendChild(addBtn);
                display.appendChild(tableRow);
            })
        })
};

function setupAddForm() {
    const form = document.getElementById("add-form");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formName = document.getElementById("name").value.trim();
        const formPrice = document.getElementById("price").value.trim();

        if (!formName || !formPrice || isNaN(formPrice)) {
            alert("Please enter valid values");
            return;
        };

        fetch("http://localhost:3000/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: formName, price: Number(formPrice) })
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error("Failed to fetch events");
                }
                return res.json();
            })
            .then(() => { navigate("/events") })
            .catch(error => console.error("Oops, looks like something went wrong", error));
    });

    form.reset();
}

function setupEditForm(path) {
    const URLparam = new URLSearchParams(path.split("?")[1]);
    const id = URLparam.get("id");
    const form = document.getElementById("edit-form");

    if (!id) {
        console.error("No product ID found in URL");
        return;
    }

    fetch(`http://localhost:3000/events/${id}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("name").value = data.name;
            document.getElementById("price").value = data.price;
        });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const updatedName = document.getElementById("name").value.trim();
        const updatedPrice = document.getElementById("price").value.trim();

        fetch(`http://localhost:3000/events/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: updatedName,
                price: Number(updatedPrice)
            })
        })
            .then(res => res.json())
            .then(() => {
                navigate("/events");
            });
    });
}

function addToCart(product) {
    let cart = sessionStorage.getItem("cart");
    cart = cart ? JSON.parse(cart) : [];
    cart.push(product);
    sessionStorage.setItem("cart", JSON.stringify(cart));
}

function setupCart() {
    const cartContainer = document.getElementById("cart-container");
    cartContainer.innerHTML = "";

    let cart = sessionStorage.getItem("cart");
    cart = cart ? JSON.parse(cart) : [];

    cart.forEach(item => {
        cartItem = document.createElement("div");
        cartItem.innerHTML = `
        <h2>${item.name}</h2>
        <h3>${item.price}</h3>
        `;
        cartContainer.appendChild(cartItem);
    })

    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);

    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `<strong>Total: ${total}</strong>`;
    cartContainer.appendChild(totalDiv);
}

window.addEventListener("popstate", () => {
    navigate(location.pathname);
});

navigate(location.pathname);