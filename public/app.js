// ---------------- FIREBASE IMPORTS ----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  set,
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ---------------- GLOBAL VARIABLES ---------------- */
let items = [];
let filteredItems = [];

/* ---------------- DOM ELEMENTS ---------------- */
const tbody = document.querySelector("tbody");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const filterSelect = document.getElementById("filterSelect");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

// Modal Elements
const modal = document.getElementById("addItemModal");
const addItemBtn = document.getElementById("addItemBtn");
const saveItemBtn = document.getElementById("saveItemBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");

const nameInput = document.getElementById("itemName");
const categoryInput = document.getElementById("itemCategory");
const qtyInput = document.getElementById("itemQuantity");
const priceInput = document.getElementById("itemPrice");

/* ---------------- FETCH LIVE DATA ---------------- */
const itemsRef = ref(db, "items");

onValue(itemsRef, (snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.val();
    items = Object.values(data);
    populateCategoryFilter(items);
    renderTable(items);
  } else {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; opacity:0.7;">No items found</td></tr>`;
  }
});

/* ---------------- POPULATE CATEGORY FILTER ---------------- */
function populateCategoryFilter(data) {
  const categories = [...new Set(data.map((i) => i.category || "Uncategorized"))];
  filterSelect.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filterSelect.appendChild(opt);
  });
}

/* ---------------- FILTER, SORT, SEARCH ---------------- */
function updateDisplay() {
  const query = searchInput?.value?.toLowerCase() || "";
  const sortBy = sortSelect?.value;
  const cat = filterSelect?.value;

  filteredItems = [...items];

  // Filter by category
  if (cat && cat !== "all") {
    filteredItems = filteredItems.filter((i) => i.category === cat);
  }

  // Search by name
  if (query) {
    filteredItems = filteredItems.filter((i) =>
      i.name.toLowerCase().includes(query)
    );
  }

  // Sort
  if (sortBy === "name") filteredItems.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === "quantity") filteredItems.sort((a, b) => b.quantity - a.quantity);
  if (sortBy === "price") filteredItems.sort((a, b) => b.price - a.price);

  renderTable(filteredItems);
}

/* ---------------- CLEAR FILTERS ---------------- */
function clearFilters() {
  searchInput.value = "";
  sortSelect.value = "name";
  filterSelect.value = "all";
  renderTable(items);
}

/* ---------------- RENDER TABLE ---------------- */
function renderTable(data) {
  tbody.innerHTML = "";
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; opacity:.6;">No items found</td></tr>`;
    return;
  }

  data.forEach((i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i.name}</td>
      <td>${i.category}</td>
      <td>${i.quantity}</td>
      <td>₹${i.price.toLocaleString()}</td>
      <td><button class="delete-btn" data-id="${i.id}">🗑️ Delete</button></td>
    `;
    tbody.appendChild(tr);
  });

  // Delete item event listener
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (confirm("Delete this item?")) {
        await remove(ref(db, `items/${id}`));
      }
    });
  });
}

/* ---------------- ADD NEW ITEM ---------------- */
addItemBtn?.addEventListener("click", () => {
  modal.style.display = "flex";
});

closeModalBtn?.addEventListener("click", closeModal);
cancelBtn?.addEventListener("click", closeModal);

window.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

function closeModal() {
  modal.style.display = "none";
  clearModalInputs();
}

saveItemBtn?.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  const category = categoryInput.value.trim() || "Uncategorized";
  const quantity = Number(qtyInput.value) || 0;
  const price = Number(priceInput.value) || 0;

  if (!name || quantity <= 0 || price <= 0) {
    alert("⚠️ Please fill all fields correctly — no empty or zero values.");
    return;
  }

  const id = Date.now().toString();
  const newItem = { id, name, category, quantity, price };

  await set(ref(db, "items/" + id), newItem);
  modal.style.display = "none";
  clearModalInputs();
});

function clearModalInputs() {
  nameInput.value = "";
  categoryInput.value = "";
  qtyInput.value = "";
  priceInput.value = "";
}

/* ---------------- EVENT LISTENERS ---------------- */
searchInput?.addEventListener("input", updateDisplay);
sortSelect?.addEventListener("change", updateDisplay);
filterSelect?.addEventListener("change", updateDisplay);
clearFiltersBtn?.addEventListener("click", clearFilters);

/* ---------------- EXPORT INVENTORY ---------------- */
const exportBtn = document.getElementById("exportBtn");

exportBtn?.addEventListener("click", () => {
  if (!items.length) {
    alert("⚠️ No items available to export!");
    return;
  }

  // Convert JSON to CSV
  const headers = ["Name", "Category", "Quantity", "Price (₹)"];
  const csvRows = [headers.join(",")];

  items.forEach((item) => {
    const row = [
      `"${item.name}"`,
      `"${item.category}"`,
      item.quantity,
      item.price,
    ];
    csvRows.push(row.join(","));
  });

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // Create a hidden download link
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "inventory-data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});


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
