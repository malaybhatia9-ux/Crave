"use strict";

const menu = [
  { id: "smash-burger", name: "Classic Smash Burger", category: "Burgers", price: 249, description: "Griddled patty, cheddar, lettuce and house sauce.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80" },
  { id: "garden-burger", name: "Garden Veggie Burger", category: "Burgers", price: 199, description: "Crisp vegetables with a savoury veggie patty.", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=700&q=80" },
  { id: "margherita", name: "Margherita Pizza", category: "Pizza", price: 329, description: "Tomato, mozzarella and fragrant basil.", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80" },
  { id: "pepper-pizza", name: "Pepper Paneer Pizza", category: "Pizza", price: 379, description: "Paneer, peppers and a gently spiced tomato base.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80" },
  { id: "paneer-bowl", name: "Paneer Tikka Bowl", category: "Indian", price: 289, description: "A sample bowl with rice, paneer and mint yoghurt.", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80" },
  { id: "fries", name: "Seasoned Fries", category: "Sides", price: 119, description: "Golden fries with a light seasoning.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80" },
  { id: "brownie", name: "Chocolate Brownie", category: "Desserts", price: 149, description: "A rich chocolate dessert for the end of a meal.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80" },
  { id: "cheesecake", name: "Berry Cheesecake", category: "Desserts", price: 179, description: "Creamy cheesecake with a berry topping.", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=700&q=80" }
];

const cart = new Map();
let activeCategory = "All";
let toastTimer;
const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const foodGrid = document.querySelector("#foodGrid");
const cartItems = document.querySelector("#cartItems");

function renderCategories() {
  const categories = ["All", ...new Set(menu.map(item => item.category))];
  document.querySelector("#categoryRow").innerHTML = categories.map(category => `<button class="category ${activeCategory === category ? "active" : ""}" type="button" data-category="${category}">${category === "All" ? "✦ All dishes" : category}</button>`).join("");
}

function renderMenu() {
  const query = document.querySelector("#searchInput").value.trim().toLocaleLowerCase();
  const filtered = menu.filter(item => (activeCategory === "All" || item.category === activeCategory) && `${item.name} ${item.category} ${item.description}`.toLocaleLowerCase().includes(query));
  foodGrid.innerHTML = filtered.map(item => `<article class="food-card"><div class="food-image"><img loading="lazy" src="${item.image}" alt="${item.name}" onerror="this.closest('.food-image').classList.add('image-failed');this.remove()"><span>${item.category}</span></div><div class="food-copy"><div class="food-name"><h3>${item.name}</h3><b>${money(item.price)}</b></div><p>${item.description}</p><button class="add-button" type="button" data-add="${item.id}" aria-label="Add ${item.name} to basket">Add to basket <span>+</span></button></div></article>`).join("");
  document.querySelector("#emptyState").hidden = filtered.length !== 0;
}

function renderCart() {
  let count = 0;
  let subtotal = 0;
  const entries = [...cart.entries()];
  for (const [id, quantity] of entries) {
    const dish = menu.find(item => item.id === id);
    if (!dish) continue;
    count += quantity;
    subtotal += dish.price * quantity;
  }
  document.querySelector("#cartCount").textContent = count;
  cartItems.innerHTML = entries.length ? entries.map(([id, quantity]) => {
    const dish = menu.find(item => item.id === id);
    return `<div class="cart-line"><div><b>${dish.name}</b><small>${money(dish.price)} each</small></div><div class="quantity"><button type="button" data-qty="${id}" data-delta="-1" aria-label="Remove one ${dish.name}">−</button><span>${quantity}</span><button type="button" data-qty="${id}" data-delta="1" aria-label="Add one ${dish.name}">+</button></div></div>`;
  }).join("") : '<p class="cart-empty">Your basket is empty. Add a dish from the menu.</p>';
  const delivery = subtotal ? 39 : 0;
  document.querySelector("#subtotal").textContent = money(subtotal);
  document.querySelector("#deliveryFee").textContent = money(delivery);
  document.querySelector("#grandTotal").textContent = money(subtotal + delivery);
}

function showToast(message) {
  const toast = document.querySelector("#toastMessage");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

document.querySelector("#categoryRow").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategories();
  renderMenu();
});
document.querySelector("#searchInput").addEventListener("input", renderMenu);
foodGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const id = button.dataset.add;
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  showToast(`${menu.find(item => item.id === id).name} added`);
});
cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-qty]");
  if (!button) return;
  const id = button.dataset.qty;
  const next = (cart.get(id) || 0) + Number(button.dataset.delta);
  if (next > 0) cart.set(id, next); else cart.delete(id);
  renderCart();
});
document.querySelector("#checkoutForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!cart.size) {
    showToast("Add at least one dish before placing a demo order.");
    document.querySelector("#menu").scrollIntoView({ behavior: "smooth" });
    return;
  }
  if (!event.currentTarget.reportValidity()) return;
  const message = document.querySelector("#orderMessage");
  const name = document.querySelector("#customerName").value.trim();
  message.textContent = `Thanks, ${name}. Your demo order is complete in this browser. Nothing was sent to a restaurant and no payment was taken.`;
  message.hidden = false;
  cart.clear();
  renderCart();
  event.currentTarget.reset();
});
document.querySelector("#year").textContent = new Date().getFullYear();
renderCategories();
renderMenu();
renderCart();
