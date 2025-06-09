const itemInput = document.getElementById("itemInput");
const priceInput = document.getElementById("priceInput");
const list = document.getElementById("itemList");
const totalSpan = document.getElementById("totalAmount");
let total = 0;

function loadItems() {
  const items = JSON.parse(localStorage.getItem("groceryList")) || [];
  total = 0;
  items.forEach(({ name, price }) => {
    createItem(name, price);
    total += price;
  });
  updateTotal();
}

function createItem(name, price) {
  const li = document.createElement("li");

  const nameSpan = document.createElement("span");
  nameSpan.textContent = name;

  const priceSpan = document.createElement("span");
  priceSpan.textContent = `€${price.toFixed(2)}`;
  priceSpan.style.marginLeft = "auto";
  priceSpan.style.paddingRight = "1rem";

  const removeBtn = document.createElement("button");
  removeBtn.innerHTML = "✕";
  removeBtn.onclick = () => {
    li.remove();
    total -= price;
    updateTotal();
    saveItems();
  };

  li.appendChild(nameSpan);
  li.appendChild(priceSpan);
  li.appendChild(removeBtn);
  list.appendChild(li);
}

function addItem() {
  const name = itemInput.value.trim();
  const price = parseFloat(priceInput.value);

  if (!name || isNaN(price)) return;

  createItem(name, price);
  total += price;
  updateTotal();
  itemInput.value = "";
  priceInput.value = "";
  saveItems();
}

function updateTotal() {
  totalSpan.textContent = `€${total.toFixed(2)}`;
}

function saveItems() {
  const items = [];
  document.querySelectorAll("#itemList li").forEach(li => {
    const spans = li.querySelectorAll("span");
    const name = spans[0].textContent.trim();
    const priceText = spans[1].textContent.replace("€", "");
    const price = parseFloat(priceText);
    if (name && !isNaN(price)) {
      items.push({ name, price });
    }
  });
  localStorage.setItem("groceryList", JSON.stringify(items));
}

async function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const items = JSON.parse(localStorage.getItem("groceryList")) || [];
  let y = 20;
  const date = new Date().toLocaleDateString();
  const Name = `Spesa_${date}.pdf`;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Lista della Spesa", 10, 10);
  doc.setFontSize(10);
  doc.text(`Data: ${date}`, 150, 10);

  // Table headers
  doc.setFont("helvetica", "bold");
  doc.setFillColor(230, 230, 250);
  doc.rect(10, y, 190, 8, 'F');
  doc.text("Prodotto", 12, y + 6);
  doc.text("Prezzo", 170, y + 6);
  y += 10;

  // Table rows
  doc.setFont("helvetica", "normal");
  items.forEach(({ name, price }) => {
    doc.text(name, 12, y);
    doc.text(`€${price.toFixed(2)}`, 170, y);
    y += 8;
  });

  // Totale
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text(`Totale: €${total.toFixed(2)}`, 150, y);

  doc.save(Name);

  // Clear list after saving
  localStorage.removeItem("groceryList");
  list.innerHTML = "";
  total = 0;
  updateTotal();
}

window.onload = loadItems;
itemInput.addEventListener("keyup", e => e.key === "Enter" && addItem());