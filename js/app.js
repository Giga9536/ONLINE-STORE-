// Products organized by category
const products = {
    'woman-suit': [
        { id: 1, name: 'Classic Black Suit', price: 4999, emoji: '👗', description: 'Elegant black formal suit perfect for office' },
        { id: 2, name: 'Navy Blue Suit', price: 5499, emoji: '👗', description: 'Professional navy blue suit with jacket' },
        { id: 3, name: 'Maroon Suit', price: 4799, emoji: '👗', description: 'Stylish maroon suit for special occasions' }
    ],
    'woman-saree': [
        { id: 4, name: 'Silk Saree Red', price: 3999, emoji: '🎀', description: 'Beautiful red silk saree with embroidery' },
        { id: 5, name: 'Cotton Saree Blue', price: 2499, emoji: '🎀', description: 'Comfortable cotton saree in blue color' },
        { id: 6, name: 'Chiffon Saree Gold', price: 3499, emoji: '🎀', description: 'Elegant gold chiffon saree with pallu' }
    ]
};

// Shopping Cart Array
let cart = [];

// Load cart from localStorage when page loads
window.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    displayAllProducts();
    updateCartCount();
});

// Display all products by category
function displayAllProducts() {
    displayProductsByCategory('woman-suit');
    displayProductsByCategory('woman-saree');
}

// Display products for a specific category
function displayProductsByCategory(category) {
    const containerId = `${category}-products`;
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    container.innerHTML = '';
    
    products[category].forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-emoji">${product.emoji}</div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">₹${product.price.toFixed(2)}</div>
                <div class="product-quantity">
                    <button class="quantity-btn" onclick="changeQuantity(event, -1)">-</button>
                    <input type="number" class="quantity-input" value="1" min="1" id="qty-${product.id}">
                    <button class="quantity-btn" onclick="changeQuantity(event, 1)">+</button>
                </div>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        container.appendChild(productCard);
    });
}

// Change quantity with +/- buttons
function changeQuantity(event, change) {
    const input = event.target.parentElement.querySelector('.quantity-input');
    let value = parseInt(input.value) + change;
    if (value >= 1) {
        input.value = value;
    }
}

// Get product by ID from any category
function getProductById(productId) {
    for (let category in products) {
        const product = products[category].find(p => p.id === productId);
        if (product) return product;
    }
    return null;
}

// Add product to cart
function addToCart(productId) {
    const product = getProductById(productId);
    if (!product) return;
    
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = parseInt(quantityInput.value);
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            emoji: product.emoji,
            quantity: quantity
        });
    }
    
    // Reset quantity input
    quantityInput.value = 1;
    
    // Save cart and update UI
    saveCartToStorage();
    updateCartCount();
    alert(`${quantity} ${product.name}(s) added to cart!`);
}

// Display cart items
function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartContent = document.getElementById('cart-content');
    
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartContent.style.display = 'none';
        return;
    }
    
    cartEmpty.style.display = 'none';
    cartContent.style.display = 'block';
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.emoji} ${item.name}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>
                <input type="number" value="${item.quantity}" min="1" 
                       onchange="updateQuantity(${item.id}, this.value)" style="width: 50px;">
            </td>
            <td>₹${(item.price * item.quantity).toFixed(2)}</td>
            <td>
                <button class="btn btn-danger" onclick="removeFromCart(${item.id})">🗑️ Remove</button>
            </td>
        `;
        cartItemsContainer.appendChild(row);
    });
    
    updateCartSummary();
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = parseInt(newQuantity);
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCartToStorage();
            updateCartCount();
            displayCart();
        }
    }
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartCount();
    displayCart();
}

// Update cart summary (subtotal, tax, total)
function updateCartSummary() {
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

// Update cart count in navbar
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}
