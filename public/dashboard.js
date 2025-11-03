import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* ---------------- FIREBASE CONFIG ---------------- */
const firebaseConfig = {
  apiKey: "AIzaSyDUyAtthz_nd5Np9pSPJzrAR-5ZVJ6Q7bY",
  authDomain: "inventory-system-a1b52.firebaseapp.com",
  databaseURL: "https://inventory-system-a1b52-default-rtdb.firebaseio.com",
  projectId: "inventory-system-a1b52",
  storageBucket: "inventory-system-a1b52.firebasestorage.app",
  messagingSenderId: "43674559309",
  appId: "1:43674559309:web:1f35ca3791bda0152a8d04",
  measurementId: "G-KPJ75HYDT0",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ---------------- ELEMENTS ---------------- */
const totalItems = document.getElementById("totalItems");
const totalQuantity = document.getElementById("totalQuantity");
const totalValue = document.getElementById("totalValue");
const lowStockList = document.getElementById("lowStockList");
const ctx = document.getElementById("categoryChart").getContext("2d");

let categoryChart;
const LOW_STOCK_THRESHOLD = 10;

/* ---------------- FETCH LIVE DATA ---------------- */
const itemsRef = ref(db, "items");

onValue(itemsRef, (snapshot) => {
  if (snapshot.exists()) {
    const data = Object.values(snapshot.val());
    updateDashboard(data);
  } else {
    updateDashboard([]);
  }
});

/* ---------------- UPDATE DASHBOARD ---------------- */
function updateDashboard(data) {
  // Totals
  const totalItemCount = data.length;
  const totalQty = data.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const totalVal = data.reduce(
    (acc, item) => acc + (Number(item.quantity) * Number(item.price) || 0),
    0
  );

  totalItems.textContent = totalItemCount;
  totalQuantity.textContent = totalQty.toLocaleString();
  totalValue.textContent = "₹" + totalVal.toLocaleString();

  // Low stock section
  const lowStock = data.filter((item) => Number(item.quantity) < LOW_STOCK_THRESHOLD);

  if (lowStock.length === 0) {
    lowStockList.innerHTML = `<li class="none">✅ All items in stock</li>`;
  } else {
    lowStockList.innerHTML = "";
    lowStock.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${item.name}</strong> — only ${item.quantity} left`;
      lowStockList.appendChild(li);
    });
  }

  // Category distribution chart
  const categories = {};
  data.forEach((item) => {
    const cat = item.category || "Uncategorized";
    categories[cat] = (categories[cat] || 0) + 1;
  });

  const labels = Object.keys(categories);
  const values = Object.values(categories);

  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#3B82F6",
            "#10B981",
            "#F59E0B",
            "#EF4444",
            "#8B5CF6",
            "#14B8A6",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "var(--text-color)" },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
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
