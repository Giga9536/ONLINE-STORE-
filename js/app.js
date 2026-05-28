// Products Data
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

let cart = [];

// Page Load check
window.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    updateCartCount();
    
    // Check if we are on index.html or cart.html
    if (document.getElementById('cart-items')) {
        displayCart(); // If on cart page, show checkout details
    }
});

// Change quantity on home page
function changeQuantity(event, change) {
    const input = event.target.parentElement.querySelector('.quantity-input');
    let value = parseInt(input.value) + change;
    if (value >= 1) {
        input.value = value;
    }
}

function getProductById(productId) {
    for (let category in products) {
        const product = products[category].find(p => p.id === productId);
        if (product) return product;
    }
    return null;
}

// Add to Cart Function
function addToCart(productId) {
    const product = getProductById(productId);
    if (!product) return;
    
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
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
    
    if (quantityInput) quantityInput.value = 1;
    
    saveCartToStorage();
    updateCartCount();
    alert(`${quantity} ${product.name}(s) added to cart!`);
}

// Display Live Items on Checkout/Cart Page
function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartContent = document.getElementById('cart-content');
    
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartContent.style.display = 'none';
        return;
    }
    
    cartEmpty.style.display = 'none';
    cartContent.style.display = 'grid';
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const row = document.createElement('tr');
        row.style.borderBottom = "1px solid #eee";
        row.innerHTML = `
            <td style="padding: 1rem 0;">
                <span style="font-size: 1.5rem; margin-right: 0.5rem;">${item.emoji}</span>
                <strong>${item.name}</strong> <br>
                <small style="color: #7f8c8d;">₹${item.price} x ${item.quantity}</small>
            </td>
            <td style="text-align: right; padding: 1rem 0;">
                <strong>₹${(item.price * item.quantity).toFixed(2)}</strong> <br>
                <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 0.85rem; margin-top: 0.5rem;">🗑️ Remove</button>
            </td>
        `;
        cartItemsContainer.appendChild(row);
    });
    
    updateCartSummary();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartCount();
    displayCart();
}

function updateCartSummary() {
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${subtotal.toFixed(2)}`; // Free Delivery
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

// Order Form Action
function placeOrder(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    
    alert(`Thank you, ${name}! Your order has been placed successfully via Cash on Delivery.\nWe will contact you on ${phone}.`);
    
    // Clear Cart after success
    cart = [];
    saveCartToStorage();
    window.location.href = "index.html";
}
