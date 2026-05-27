const products = [
    { id: 1, name: 'Laptop', price: 999.99, emoji: '💻', description: 'High-performance laptop' },
    { id: 2, name: 'Smartphone', price: 699.99, emoji: '📱', description: 'Latest smartphone' },
    { id: 3, name: 'Headphones', price: 199.99, emoji: '🎧', description: 'Wireless headphones' },
    { id: 4, name: 'Smart Watch', price: 299.99, emoji: '⌚', description: 'Stay connected' },
    { id: 5, name: 'Tablet', price: 449.99, emoji: '📱', description: 'Perfect for entertainment' },
    { id: 6, name: 'Camera', price: 899.99, emoji: '📷', description: 'Professional camera' }
];

let cart = [];

window.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) displayProducts();
    if (document.getElementById('cart-items')) displayCart();
    updateCartCount();
});

function displayProducts() {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-emoji">${product.emoji}</div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            emoji: product.emoji,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartCount();
    alert(`${product.name} added to cart!`);
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}
