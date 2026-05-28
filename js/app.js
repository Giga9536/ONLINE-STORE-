const products = [
    { id: 1, name: 'Laptop', price: 999.99, emoji: '💻', description: 'High-performance laptop' },
    { id: 2, name: 'Smartphone', price: 699.99, emoji: '📱', description: 'Latest smartphone' },
    { id: 3, name: 'Headphones', price: 199.99, emoji: '🎧', description: 'Wireless headphones' },
    { id: 4, name: 'Smart Watch', price: 299.99, emoji: '⌚', description: 'Stay connected' },
    { id: 5, name: 'Tablet', price: 449.99, emoji: '📱', description: 'Perfect entertainment' },
    { id: 6, name: 'Camera', price: 899.99, emoji: '📷', description: 'Professional camera' }
];

let cart = [];

window.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    const container = document.getElementById('products-container');
    if (container) displayProducts();
    updateCartCount();
});

function displayProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-emoji">${product.emoji}</div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    }
    saveCartToStorage();
    updateCartCount();
    alert(`${product.name} added!`);
}

function updateCartCount() {
    const count = document.getElementById('cart-count');
    if (count) count.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) cart = JSON.parse(saved);
}
