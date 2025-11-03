import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* ---------------- FIREBASE CONFIG ---------------- */
const firebaseConfig = {
  apiKey: "AIzaSyDUyAtthz_nd5Np9pSPJzrAR-5ZVJ6Q7bY",
  authDomain: "inventory-system-a1b52.firebaseapp.com",
  databaseURL: "https://inventory-system-a1b52-default-rtdb.firebaseio.com",
  projectId: "inventory-system-a1b52",
  storageBucket: "inventory-system-a1b52.firebasestorage.app",
  messagingSenderId: "43674559309",
  appId: "1:43674559309:web:1f35ca3791bda0152a8d04",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ---------------- ELEMENTS ---------------- */
const totalItemsEl = document.getElementById("totalItems");
const totalValueEl = document.getElementById("totalValue");
const totalProfitEl = document.getElementById("totalProfit");

/* ---------------- FETCH DATA ---------------- */
const itemsRef = ref(db, "items");

onValue(itemsRef, (snapshot) => {
  if (snapshot.exists()) {
    const data = Object.values(snapshot.val());

    const totalItems = data.length;
    const totalValue = data.reduce(
      (acc, item) => acc + (item.sellPrice || 0) * (item.quantity || 0),
      0
    );
    const totalProfit = data.reduce(
      (acc, item) =>
        acc + ((item.sellPrice || 0) - (item.buyPrice || 0)) * (item.quantity || 0),
      0
    );

    totalItemsEl.textContent = totalItems;
    totalValueEl.textContent = `₹${totalValue.toLocaleString()}`;
    totalProfitEl.textContent = `₹${totalProfit.toLocaleString()}`;

    renderCategoryChart(data);
  } else {
    totalItemsEl.textContent = "0";
    totalValueEl.textContent = "₹0";
    totalProfitEl.textContent = "₹0";
  }
});

/* ---------------- RENDER CATEGORY CHART ---------------- */
function renderCategoryChart(data) {
  const ctx = document.getElementById("categoryChart").getContext("2d");

  const categories = [...new Set(data.map((item) => item.category))];
  const quantities = categories.map(
    (cat) =>
      data
        .filter((item) => item.category === cat)
        .reduce((sum, i) => sum + (i.quantity || 0), 0)
  );

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: categories,
      datasets: [
        {
          label: "Category Stock Distribution",
          data: quantities,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

/* ---------------- THEME TOGGLE ---------------- */
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

if (localStorage.getItem("theme") === "dark") {
  body.setAttribute("data-theme", "dark");
  themeToggle.textContent = "☀️";
}

themeToggle?.addEventListener("click", () => {
  const current = body.getAttribute("data-theme");
  if (current === "dark") {
    body.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "🌙";
  } else {
    body.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "☀️";
  }
});
