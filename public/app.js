import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase, ref, push, onValue, remove
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUyAtthz_nd5Np9pSPJzrAR-5ZVJ6Q7bY",
  authDomain: "inventory-system-a1b52.firebaseapp.com",
  databaseURL: "https://inventory-system-a1b52-default-rtdb.firebaseio.com",
  projectId: "inventory-system-a1b52",
  storageBucket: "inventory-system-a1b52.firebasestorage.app",
  messagingSenderId: "43674559309",
  appId: "1:43674559309:web:1f35ca3791bda0152a8d04",
  measurementId: "G-KPJ75HYDT0"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const itemsRef = ref(db, "items");


// 🧾 Load items dynamically
function loadItems() {
  const tbody = document.querySelector("#itemsTable tbody");
  const searchBar = document.getElementById("searchBar");
  const sortBy = document.getElementById("sortBy");

  onValue(itemsRef, (snapshot) => {
    let data = snapshot.val() || {};

    const renderTable = () => {
      tbody.innerHTML = "";
      let items = Object.entries(data);

      // 🔍 Filter items by name or category
      const search = searchBar?.value?.toLowerCase() || "";
      items = items.filter(([id, item]) =>
        item.name.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search)
      );

      // ↕ Sort by selected field
      items.sort(([, a], [, b]) => {
        if (sortBy?.value === "quantity") return b.quantity - a.quantity;
        if (sortBy?.value === "price") return b.price - a.price;
        return a.name.localeCompare(b.name);
      });

      // 🧱 Render rows
      if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">No matching items</td></tr>`;
        return;
      }

      items.forEach(([id, item]) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${id}</td>
          <td>${item.name}</td>
          <td>${item.category}</td>
          <td>${item.quantity}</td>
          <td>₹${item.price}</td>
          <td><button class="delete-btn" onclick="deleteItem('${id}')">🗑️ Delete</button></td>
        `;
        tbody.appendChild(tr);
      });
    };

    // Attach live listeners to search and sort controls
    if (searchBar) searchBar.addEventListener("input", renderTable);
    if (sortBy) sortBy.addEventListener("change", renderTable);

    renderTable();
  });
}

// ➕ Add new item to Firebase
function addItem() {
  const name = document.getElementById("name").value.trim();
  const category = document.getElementById("category").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value);
  const price = parseFloat(document.getElementById("price").value);

  if (!name || !category || isNaN(quantity) || isNaN(price)) {
    alert("⚠️ Please fill in all fields correctly!");
    return;
  }

  push(itemsRef, { name, category, quantity, price })
    .then(() => {
      showToast("✅ Item added successfully!");
      clearForm();
    })
    .catch((err) => showToast("❌ Error adding item: " + err.message));
}

// 🗑️ Delete item
function deleteItem(id) {
  remove(ref(db, "items/" + id))
    .then(() => showToast("🗑️ Item deleted successfully!"))
    .catch((err) => showToast("❌ Error deleting item: " + err.message));
}

// 🧹 Clear form fields
function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("category").value = "";
  document.getElementById("quantity").value = "";
  document.getElementById("price").value = "";
}

// 🔔 Simple toast notifications
function showToast(message) {
  let toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.background = "#2563eb";
  toast.style.color = "white";
  toast.style.padding = "10px 16px";
  toast.style.borderRadius = "8px";
  toast.style.fontWeight = "500";
  toast.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s ease";

  document.body.appendChild(toast);
  setTimeout(() => (toast.style.opacity = "1"), 50);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}

// 🌍 Initialize when page loads
window.onload = () => {
  if (document.getElementById("itemsTable")) loadItems();
};

// Make functions globally available for HTML
window.addItem = addItem;
window.deleteItem = deleteItem;