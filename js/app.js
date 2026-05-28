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
let orderHistory = []; // ऑर्डर्स सेव करने के लिए एरे

// Page Load Check
window.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    loadOrdersFromStorage(); // पुराने ऑर्डर्स लोड करें
    updateCartCount();
    
    // Check if we are on cart.html page
    if (document.getElementById('cart-items')) {
        displayCart();
        displayOrderHistory(); // ऑर्डर्स को स्क्रीन पर दिखाएं
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
    if (totalEl) totalEl.textContent = `₹${subtotal.toFixed(2)}`;
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Save & Load Data From LocalStorage
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

// NEW FUNCTION: Display Placed Orders History
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
    
    // Show latest order on top
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
            <ul style="padding-left: 1.2rem; font-size: 0.95rem; margin-bottom: 0.5rem;">
                ${itemsHtml}
            </ul>
            <div style="text-align: right; font-weight: bold; border-top: 1px dashed #ddd; padding-top: 0.5rem;">
                Total Paid: ₹${order.totalAmount.toFixed(2)}
            </div>
        `;
        listContainer.appendChild(orderBox);
    });
}
// Action when Place Order is clicked (100% Working WhatsApp Code)
function placeOrder(event) {
    // 1. फॉर्म को सबमिट होने और पेज रीलोड होने से रोकें
    event.preventDefault();
    
    // 2. फॉर्म से कस्टमर की डिटेल्स निकालें
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    
    let totalAmount = 0;
    let itemsText = ''; 
    
    // 3. कार्ट के सामान की लिस्ट बनाएं
    cart.forEach((item, index) => {
        totalAmount += item.price * item.quantity;
        itemsText += `${index + 1}. ${item.emoji} ${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}\n`;
    });
    
    // 4. लोकल स्टोरेज (My Orders) में डेटा सेव करें
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
    // 📲 यहाँ अपना 10 अंकों का नंबर 91 के साथ डालें
    // ==========================================
    const MY_WHATSAPP_NUMBER = "91XXXXXXXXXX"; // <-- XXXXXXXXXX की जगह अपना नंबर डालें (उदा: 919876543210)
    
    // 5. व्हाट्सएप मैसेज का सुंदर टेक्स्ट फॉर्मेट
    const message = `🛍️ *NEW ORDER PLACED!* 🛍️\n\n` +
                    `👤 *Customer Name:* ${name}\n` +
                    `📞 *Customer Phone:* ${phone}\n` +
                    `📍 *Shipping Address:* ${address}, ${city}\n\n` +
                    `📦 *Items Ordered:* \n${itemsText}\n` +
                    `💰 *Total Amount:* ₹${totalAmount.toFixed(2)} (COD)`;
                    
    // 6. मैसेज को यूआरएल के लिए सुरक्षित (Encode) करें
    const encodedMessage = encodeURIComponent(message);
    
    // 7. व्हाट्सएप का सही एपीआई लिंक
    const whatsappUrl = `https://wa.me/${MY_WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // 8. यूजर को बताएं और कार्ट खाली करें
    alert(`Thank you, ${name}! Redirecting to WhatsApp to send your order...`);
    
    cart = [];
    saveCartToStorage();
    
    // 9. कस्टमर को तुरंत व्हाट्सएप ऐप या वेब पर भेजें
    window.open(whatsappUrl, '_blank'); 
    
    // 10. वापस होम पेज पर भेजें
    window.location.href = "index.html";
}



}
