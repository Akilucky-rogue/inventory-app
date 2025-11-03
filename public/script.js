const API = '/api/items';

async function refresh() {
  const res = await fetch(API);
  const data = await res.json();
  const tbody = document.querySelector('tbody');
  tbody.innerHTML = '';
  data.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.quantity}</td>
      <td>${item.price}</td>
      <td>
        <button onclick="edit(${item.id})">Edit</button>
        <button onclick="del(${item.id})">Delete</button>
      </td>`;
    tbody.appendChild(row);
  });
}

async function edit(id) {
  const res = await fetch(`${API}/${id}`);
  const item = await res.json();
  document.getElementById('id').value = item.id;
  document.getElementById('name').value = item.name;
  document.getElementById('category').value = item.category;
  document.getElementById('quantity').value = item.quantity;
  document.getElementById('price').value = item.price;
}

async function del(id) {
  if (!confirm('Delete item?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  refresh();
}

document.getElementById('form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('id').value;
  const body = {
    name: document.getElementById('name').value,
    category: document.getElementById('category').value,
    quantity: +document.getElementById('quantity').value,
    price: +document.getElementById('price').value
  };
  if (id)
    await fetch(`${API}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  else
    await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  document.getElementById('form').reset();
  refresh();
});

refresh();
