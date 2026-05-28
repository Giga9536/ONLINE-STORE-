// js/app.js के अंदर products डेटा में सबसे नीचे इसे जोड़ें
const products = {
    'woman-suit': [
        { id: 1, name: 'Classic Black Suit', price: 4999, image: 'images/black-suit.jpg', description: 'Elegant black formal suit perfect for office' },
        { id: 2, name: 'Navy Blue Suit', price: 5499, image: 'images/navy-suit.jpg', description: 'Professional navy blue suit with jacket' },
        { id: 3, name: 'Maroon Suit', price: 4799, image: 'images/maroon-suit.jpg', description: 'Stylish maroon suit for special occasions' },
        
        // 🆕 आपका नया प्रोडक्ट यहाँ जुड़ गया है:
        { id: 7, name: 'Gemini Premium Outfit', price: 1999, image: 'images/Gemini.jpg', description: 'Trending Gemini collection trendy outfit for women' }

    ],
    'woman-saree': [
        { id: 4, name: 'Silk Saree Red', price: 3999, image: 'images/red-saree.jpg', description: 'Beautiful red silk saree with embroidery' },
        { id: 5, name: 'Cotton Saree Blue', price: 2499, image: 'images/blue-saree.jpg', description: 'Comfortable cotton saree in blue color' },
        { id: 6, name: 'Chiffon Saree Gold', price: 3499, image: 'images/gold-saree.jpg', description: 'Elegant gold chiffon saree with pallu' }
    ]
};


let cart = [];
let orderHistory = [];

// Page Load initialization
window.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    loadOrdersFromStorage();
    updateCartCount();
    
    // Check if we are on cart.html page
    if (document.getElementById('cart-items')) {
        displayCart();
        displayOrderHistory();
    }
});

// Quantity handlers (+ / - buttons)
function changeQuantity(event, change) {
    const input = event.target.parentElement.querySelector('.quantity-input');
    if (input) {
        let value = parseInt(input.value) + change;
        if (value >= 1) {
            input.value = value;
        }
    }
}

function getProductById(productId) {
    for (let category in products) {
        const product = products[category].find(p => p.id === productId);
        if (product) return product;
    }
    return null;
}

// Add to Cart Function (Fixed & Protected)
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

// Display items inside cart page
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
            <td style="padding: 1rem 0; text-align: left;">
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
    if (totalEl) totalEl.textContent = `₹${subtotal.toFixed(2)}`;
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

function loadOrdersFromStorage() {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
        orderHistory = JSON.parse(savedOrders);
    }
}

function displayOrderHistory() {
    const section = document.getElementById('orders-history-section');
    const listContainer = document.getElementById('orders-list');
    
    if (!section || !listContainer) return;
    
    if (orderHistory.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    listContainer.innerHTML = '';
    
    orderHistory.slice().reverse().forEach((order, index) => {
        const orderBox = document.createElement('div');
        orderBox.style.border = "1px solid #ddd";
        orderBox.style.padding = "1rem";
        orderBox.style.borderRadius = "6px";
        orderBox.style.marginBottom = "1rem";
        orderBox.style.backgroundColor = "#fcfcfc";
        
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `<li>${item.emoji} ${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}</li>`;
        });
        
        orderBox.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-weight: bold; color: #27ae60; margin-bottom: 0.5rem;">
                <span>Order #${orderHistory.length - index}</span>
                <span>Status: Processing (COD)</span>
            </div>
            <p style="font-size: 0.9rem; color: #555; margin-bottom: 0.5rem;"><strong>Address:</strong> ${order.address}, ${order.city}</p>
            <ul style="padding-left: 1.2rem; font-size: 0.95rem; margin-bottom: 0.5rem; text-align: left;">
                ${itemsHtml}
            </ul>
            <div style="text-align: right; font-weight: bold; border-top: 1px dashed #ddd; padding-top: 0.5rem;">
                Total Paid: ₹${order.totalAmount.toFixed(2)}
            </div>
        `;
        listContainer.appendChild(orderBox);
    });
}

// Order Form Action with Form Error Prevention
function placeOrder(event) {
    event.preventDefault();
    
    try {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        
        let totalAmount = 0;
        let itemsText = ''; 
        
        cart.forEach((item, index) => {
            totalAmount += item.price * item.quantity;
            itemsText += `${index + 1}. ${item.emoji} ${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}\n`;
        });
        
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const newOrder = {
            id: Date.now(),
            customerName: name,
            phone: phone,
            address: address,
            city: city,
            items: [...cart],
            totalAmount: totalAmount,
            date: new Date().toLocaleDateString()
        };
        
        orderHistory.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orderHistory));
        
        // ==========================================
        // 📲 व्हाट्सएप नंबर सेट करें 
        // ==========================================
        const MY_WHATSAPP_NUMBER = "919870708753"; // <-- यहाँ अपना सही व्हाट्सएप नंबर 91 लगाकर डालें (बिना + के)
        
        const message = `🛍️ *NEW ORDER PLACED!* 🛍️\n\n` +
                        `👤 *Customer Name:* ${name}\n` +
                        `📞 *Customer Phone:* ${phone}\n` +
                        `📍 *Shipping Address:* ${address}, ${city}\n\n` +
                        `📦 *Items Ordered:* \n${itemsText}\n` +
                        `💰 *Total Amount:* ₹${totalAmount.toFixed(2)} (COD)`;
                        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${MY_WHATSAPP_NUMBER}?text=${encodedMessage}`;
        
        alert(`Thank you, ${name}! Click OK to send your order on WhatsApp.`);
        
        cart = [];
        saveCartToStorage();
        
        // WhatsApp ओपन करें
        window.open(whatsappUrl, '_blank'); 
        window.location.href = "index.html";
        
    } catch (error) {
        console.error("Error placing order:", error);
    }
}
