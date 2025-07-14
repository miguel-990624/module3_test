# module3_test

Instructions to run with Vite and JSON Server

Dependencies and usage

✅ README.md

# Module 3 - Product Management SPA (Single Page Application)

This project is a **Single Page Application (SPA)** built using **HTML**, **CSS**, and **JavaScript**, designed to simulate a simple e-commerce system. It includes **login/registration**, **role-based access control**, and full **CRUD operations** for products and users using `json-server` as the mock backend API. Vite is used as the development server for fast module reloading.

---

## 📁 Project Structure

module3_test/
├── public/
│ └── index.html # Main entry point
├── html/
│ └── *.html # HTML views (login, register, dashboard, products, cart, etc.)
├── js/
│ └── script.js # Main SPA router and logic
│ └── auth.js # Login/register/auth logic
│ └── users.js # User CRUD logic
│ └── products.js # Product CRUD logic
│ └── cart.js # Cart functionality
├── db.json # Mock database for JSON Server
├── style/
│ └── style.css # App styling
├── vite.config.js # Vite config
└── package.json # Project dependencies and scripts

---

## 🚀 Features

- Login and register system (stored in `localStorage`)
- Admin and visitor roles
- Protected routes based on authentication
- CRUD operations:
  - Admin: Manage users and products
  - Visitors: Browse products and add to cart
- Cart with add/remove functionality
- Built using vanilla JS + JSON Server for fake REST API

---

## ⚙️ Getting Started

Follow these steps to install and run the project locally.

### 1. Clone the repository

bash
git clone https://github.com/miguel-990624/module3_test.git
cd module3_test

2. Install dependencies
bash
Copiar código
npm install

3. Run JSON Server
This project uses json-server to simulate a backend REST API with the db.json file.

bash
Copiar código
npx json-server --watch db.json --port 3000
Your API will be available at http://localhost:3000.

4. Start Vite development server
In a new terminal (same project folder):

bash
Copiar código
npm run dev
Vite will run your frontend at http://localhost:5173 by default.

📌 Notes
Login credentials are stored in localStorage.

Only admins can access user and product management routes.

The app uses basic native modals (alert, confirm) instead of third-party libraries.

All views are dynamically loaded into a single-page layout using JavaScript and route mapping.

🛠 Scripts
json
Copiar código
"scripts": {
  "dev": "vite",
  "server": "json-server --watch db.json --port 3000"
}
You can run:

npm run dev → to start Vite

npm run server → to start JSON Server

📄 License
This project is open source and free to use.

---
