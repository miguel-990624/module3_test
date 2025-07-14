const dynnamicContent = document.getElementById("content");


const routes = {
    "/": "/html/login.html",
    "/events": "/html/events.html",
    "/add": "/html/add.html",
    "/enrollment": "/html/enrollment.html",
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
    //const currentUser = localStorage.getItem("currentUser").JSON.parse();
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const isAdmin = localStorage.getItem("isAdmin");
    const userRole = localStorage.getItem("role");
    const navbar = document.getElementById("navbar");
    const AdminNavbar =
        `
        <h2>Events</h2>
        <section>
            <img src="./resources/profile.png" alt="profile" class="profile-img">
            <div class="profile-info">
                <h3>${localStorage.getItem("name")}</h3>
                <p>${userRole}</p>
            </div>
        </section>
    <nav>
        <a href="/events" data-link>Events</a>
        
        <button id="logout-btn" type="button">Logout</button>
    </nav>
    `;

    const UserNavbar =
    `
    <h2>Events</h2>
        <section>
            <img src="./resources/profile.png" alt="profile" class="profile-img">
            <div class="profile-info">
                <h3>${localStorage.getItem("name")}</h3>
                <p>${userRole}</p>
            </div>
        </section>
    <nav>
        <a href="/events" data-link>Events</a>
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

    if (!isLoggedIn && path !== "/" && path !== "/register") {
        return navigate("/");
    }

    if (isLoggedIn && path === "/" && path === "/register") {
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
    // if (path === "/enrollment") setupCart();
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
                localStorage.setItem("name" , user.name);
                localStorage.setItem("email", user.email);
                localStorage.setItem("userID", user.id);
                localStorage.setItem("role", user.role);
                localStorage.setItem("ID", user.id);
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
    const addNew = document.getElementById("addNew");
    const display = document.getElementById("event-list");
    const isAdmin = localStorage.getItem("isAdmin");

    if(isAdmin === "true" || isAdmin === true) {
        addNew.innerHTML = `
        <button id="add-btn" type="button" class="add-btn">
            <a href="/add" data-link>ADD NEW EVENT</a>
        </button>
        `;
    } else {
        addNew.innerHTML = "";
    }
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
                if( isAdmin === true || isAdmin === "true") {
                    display.innerHTML = "<p>No events available. Please add some.</p>";
                }else {
                    display.innerHTML = "<p>No events available.</p>";
                    return;
                }
            }
            data.forEach(element => {
                const tableRow = document.createElement("tr");
                tableRow.innerHTML = `
                <td><img src="./resources/events.png" alt="event"></td>
                <td>${element.name}</td>
                <td>${element.description}</td>
                <td>${element.capacity}</td>
                <td>${element.date}</td>
                `;

                const buttonContainer = document.createElement("td");

                if (isAdmin === "true" || isAdmin === true) {

                    const editBtn = document.createElement("button");
                    editBtn.classList.add("edit-btn");
                    editBtn.innerHTML = "<img src='./resources/edit.png' alt='edit' class='edit-btn'>";
                    editBtn.addEventListener("click", () => {
                        navigate(`/edit?id=${element.id}`)
                    });

                    const deleteBtn = document.createElement("button");
                    deleteBtn.innerHTML = "<img src='./resources/delete.png' alt='delete' class='delete-btn'>";
                    deleteBtn.classList.add("delete-btn");
                    deleteBtn.addEventListener("click", () => {
                        fetch(`http://localhost:3000/events/${element.id}`,{
                            method: "DELETE"
                        })
                        .then(res => {
                            if (!res.ok) {
                                throw new Error("Failed to delete event");
                            }
                            return res.json();
                        })
                        .then(() => {
                            alert("Event deleted successfully");
                            navigate("/events");
                        })
                        .catch(error => console.error("Oops, looks like something went wrong", error));
                    });

                    buttonContainer.appendChild(editBtn);
                    buttonContainer.appendChild(deleteBtn);

                }else {
                    const enrollBtn = document.createElement("button");
                    enrollBtn.classList.add("enroll-btn");
                    enrollBtn.innerHTML = "enroll";
                    enrollBtn.addEventListener("click", () => {

                    });

                    buttonContainer.appendChild(enrollBtn);
                }

                tableRow.appendChild(buttonContainer);
                display.appendChild(tableRow);
            })
        })
};

function setupAddForm() {
    const form = document.getElementById("add-form");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formName = document.getElementById("name").value.trim();
        const formDescription = document.getElementById("description").value.trim();
        const formCapacity = document.getElementById("capacity").value.trim();
        const formDate = document.getElementById("date").value.trim();
        const eventOcupation = 0;

        if (!formName || !formDescription || !formCapacity || !formDate) {
            alert("Please enter valid values");
            return;
        };

        fetch("http://localhost:3000/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                name: formName,
                description: formDescription,
                capacity: Number(formCapacity),
                date: formDate,
                ocuppation: eventOcupation
            })
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
    const form = document.getElementById("edit-form");
    
    let eventID = path.split("?")[1];
    eventID = eventID.split("=")[1];


    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const updatedName = document.getElementById("name").value.trim();
        const updatedDescription = document.getElementById("description").value.trim();
        const updatedCapacity = document.getElementById("capacity").value.trim();
        const updatedDate = document.getElementById("date").value.trim();

        fetch(`http://localhost:3000/events/${eventID}`)
        .then(res => res.json())
        .then(data => {

            fetch(`http://localhost:3000/events/${eventID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: eventID,
                    name: updatedName,
                    description: updatedDescription,
                    capacity: Number(updatedCapacity),
                    date: updatedDate,
                    ocuppation: data.ocuppation
                })
            })
            .then(res => res.json())
            .then(() => {
                navigate("/events");
            });
        })
    });
        
}



window.addEventListener("popstate", () => {
    navigate(location.pathname);
});

navigate(location.pathname);