import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
const totalItems = document.getElementById("totalItems");
const totalValue = document.getElementById("totalValue");
const totalProfit = document.getElementById("totalProfit");
const categoryChart = document.getElementById("categoryChart");

/* ---------------- FETCH LIVE DATA ---------------- */
const itemsRef = ref(db, "items");

onValue(itemsRef, (snapshot) => {
  if (!snapshot.exists()) {
    totalItems.textContent = "0";
    totalValue.textContent = "₹0";
    totalProfit.textContent = "₹0";
    return;
  }

  const data = Object.values(snapshot.val());

  const totalItemsCount = data.length;

  const totalValueAmount = data.reduce(
    (sum, i) => sum + (i.sellPrice * i.quantity || 0),
    0
  );

  const totalProfitAmount = data.reduce(
    (sum, i) => sum + ((i.sellPrice - i.buyPrice) * i.quantity || 0),
    0
  );

  totalItems.textContent = totalItemsCount;
  totalValue.textContent = `₹${totalValueAmount.toLocaleString()}`;
  totalProfit.textContent = `₹${totalProfitAmount.toLocaleString()}`;

  // Category Distribution Chart
  const ctx = categoryChart.getContext("2d");
  const categories = [...new Set(data.map((i) => i.category))];
  const categoryCounts = categories.map(
    (cat) => data.filter((i) => i.category === cat).length
  );

  if (window.categoryPieChart) window.categoryPieChart.destroy();
  window.categoryPieChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categories,
      datasets: [
        {
          data: categoryCounts,
          backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } },
    },
  });
});