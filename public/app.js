import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  set,
  update,
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
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ---------------- GLOBALS ---------------- */
let items = [];
let filteredItems = [];
let editMode = false;
let editItemId = null;

/* ---------------- ELEMENTS ---------------- */
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
const subcategoryInput = document.getElementById("itemSubcategory");
const qtyInput = document.getElementById("itemQuantity");
const buyPriceInput = document.getElementById("itemBuyPrice");
const sellPriceInput = document.getElementById("itemSellPrice");

/* ---------------- FETCH LIVE DATA ---------------- */
const itemsRef = ref(db, "items");

onValue(itemsRef, (snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.val();
    items = Object.values(data);
    populateCategoryFilter(items);
    renderTable(items);
  } else {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No items found</td></tr>`;
  }
});

/* ---------------- POPULATE CATEGORY FILTER ---------------- */
function populateCategoryFilter(data) {
  const categories = [...new Set(data.map((i) => i.category))];
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
  let query = searchInput?.value?.toLowerCase() || "";
  let sortBy = sortSelect?.value;
  let cat = filterSelect?.value;

  filteredItems = [...items];

  if (cat && cat !== "all") {
    filteredItems = filteredItems.filter((i) => i.category === cat);
  }

  if (query) {
    filteredItems = filteredItems.filter(
      (i) =>
        i.name.toLowerCase().includes(query) ||
        i.category.toLowerCase().includes(query) ||
        i.subcategory?.toLowerCase().includes(query)
    );
  }

  if (sortBy === "name") filteredItems.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === "quantity") filteredItems.sort((a, b) => b.quantity - a.quantity);
  if (sortBy === "price")
    filteredItems.sort((a, b) => b.sellPrice - a.sellPrice);

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
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;opacity:.6;">No items found</td></tr>`;
    return;
  }

  data.forEach((i) => {
    const profitMargin =
      i.sellPrice && i.buyPrice
        ? (i.sellPrice - i.buyPrice).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
          })
        : "₹0";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i.name}</td>
      <td>${i.category}</td>
      <td>${i.subcategory || "-"}</td>
      <td>${i.quantity}</td>
      <td>₹${i.buyPrice?.toLocaleString() || 0}</td>
      <td>₹${i.sellPrice?.toLocaleString() || 0}</td>
      <td>${profitMargin}</td>
      <td>
        <button class="edit-btn" data-id="${i.id}">✏️ Edit</button>
        <button class="delete-btn" data-id="${i.id}">🗑 Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (confirm("Delete this item?")) {
        await remove(ref(db, `items/${id}`));
      }
    });
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const item = items.find((it) => it.id === id);
      if (item) openEditModal(item);
    });
  });
}

/* ---------------- MODAL HANDLING ---------------- */
addItemBtn?.addEventListener("click", () => openAddModal());
closeModalBtn?.addEventListener("click", closeModal);
cancelBtn?.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

function openAddModal() {
  editMode = false;
  clearModalInputs();
  modal.classList.add("active");
  document.body.classList.add("modal-open");
}

function openEditModal(item) {
  editMode = true;
  editItemId = item.id;

  nameInput.value = item.name;
  categoryInput.value = item.category;
  subcategoryInput.value = item.subcategory || "";
  qtyInput.value = item.quantity;
  buyPriceInput.value = item.buyPrice || "";
  sellPriceInput.value = item.sellPrice || "";

  modal.classList.add("active");
  document.body.classList.add("modal-open");
}

function closeModal() {
  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
  clearModalInputs();
  editMode = false;
  editItemId = null;
}

function clearModalInputs() {
  nameInput.value = "";
  categoryInput.value = "";
  subcategoryInput.value = "";
  qtyInput.value = "";
  buyPriceInput.value = "";
  sellPriceInput.value = "";
}

saveItemBtn?.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  const category = categoryInput.value.trim();
  const subcategory = subcategoryInput.value.trim();
  const quantity = parseInt(qtyInput.value);
  const buyPrice = parseFloat(buyPriceInput.value);
  const sellPrice = parseFloat(sellPriceInput.value);

  if (!name || !category || !quantity || !buyPrice || !sellPrice) {
    alert("Please fill all fields properly!");
    return;
  }

  if (editMode && editItemId) {
    await update(ref(db, `items/${editItemId}`), {
      name,
      category,
      subcategory,
      quantity,
      buyPrice,
      sellPrice,
    });
    alert("✅ Item updated successfully!");
  } else {
    const id = Date.now().toString();
    const newItem = {
      id,
      name,
      category,
      subcategory,
      quantity,
      buyPrice,
      sellPrice,
    };
    await set(ref(db, "items/" + id), newItem);
    alert("✅ Item added successfully!");
  }

  closeModal();
});

/* ---------------- SEARCH / SORT / FILTER EVENTS ---------------- */
searchInput?.addEventListener("input", updateDisplay);
sortSelect?.addEventListener("change", updateDisplay);
filterSelect?.addEventListener("change", updateDisplay);
clearFiltersBtn?.addEventListener("click", clearFilters);

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

/* ---------------- IMPORT STOCKS (CSV UPLOAD) ---------------- */
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

// Trigger file input when clicking import
importBtn?.addEventListener("click", () => importFile.click());

// Handle CSV upload
importFile?.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const text = e.target.result;
    const rows = text.split("\n").map((r) => r.trim()).filter(Boolean);

    if (rows.length < 2) {
      alert("⚠️ Invalid file. Please upload a valid CSV with headers.");
      return;
    }

    const headers = rows[0].split(",").map((h) => h.trim().toLowerCase());
    const expectedHeaders = [
      "name",
      "category",
      "subcategory",
      "quantity",
      "buyprice",
      "sellprice",
    ];

    if (!expectedHeaders.every((h) => headers.includes(h))) {
      alert("⚠️ Invalid CSV format.\nHeaders must be: name, category, subcategory, quantity, buyprice, sellprice");
      return;
    }

    const newItems = rows.slice(1).map((row) => {
      const cols = row.split(",");
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name: cols[headers.indexOf("name")]?.trim(),
        category: cols[headers.indexOf("category")]?.trim(),
        subcategory: cols[headers.indexOf("subcategory")]?.trim(),
        quantity: parseInt(cols[headers.indexOf("quantity")]),
        buyPrice: parseFloat(cols[headers.indexOf("buyprice")]),
        sellPrice: parseFloat(cols[headers.indexOf("sellprice")]),
      };
    });

    let validCount = 0;
    for (const item of newItems) {
      if (item.name && item.category && item.quantity && item.buyPrice && item.sellPrice) {
        await set(ref(db, `items/${item.id}`), item);
        validCount++;
      }
    }

    alert(`✅ Successfully imported ${validCount} items!`);
    importFile.value = "";
  };

  reader.readAsText(file);
});

/* ---------------- EXPORT INVENTORY TO CSV ---------------- */
const exportBtn = document.getElementById("exportBtn");
exportBtn?.addEventListener("click", () => {
  if (!items.length) {
    alert("⚠️ No items to export!");
    return;
  }

  const headers = ["Name", "Category", "Subcategory", "Quantity", "BuyPrice", "SellPrice"];
  const csvRows = [headers.join(",")];

  items.forEach((i) => {
    const row = [
      `"${i.name}"`,
      `"${i.category}"`,
      `"${i.subcategory || ""}"`,
      i.quantity,
      i.buyPrice,
      i.sellPrice,
    ];
    csvRows.push(row.join(","));
  });

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
});
