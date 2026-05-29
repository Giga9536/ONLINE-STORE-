/**
 * दीपांशी फैशन वर्ल्ड - मुख्य जावास्क्रिप्ट फ़ाइल (अपडेटेड)
 * प्रोडक्ट कार्ड लोडिंग, साइज चार्ट ट्रैकिंग और व्हाट्सएप इंटीग्रेशन के साथ
 */

let cart = [];
let orderHistory = [];

// पेज लोड होते ही डेटा लोड करना और कार्ट काउंट अपडेट करना
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCartFromStorage();
    loadOrdersFromStorage();
    updateCartCount();

    // यदि हम चेकआउट (cart.html) पेज पर हैं, तो कार्ट और हिस्ट्री दिखाएं
    if (document.getElementById('cart-items')) {
        displayCart();
        displayOrderHistory();
    }
});

/**
 * 1. JSON फ़ाइल से डायनेमिक रूप से प्रोडक्ट्स लोड करना
 */
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const productsData = await response.json();
        // वैश्विक उपयोग के लिए विंडो ऑब्जेक्ट में प्रोडक्ट्स को सुरक्षित करना
        window.allProductsList = productsData; 

        const productContainer = document.getElementById('product-list');
        
        if (productContainer) {
            productContainer.innerHTML = ''; // पुराना कंटेंट साफ़ करना

            if (productsData.length === 0) {
                productContainer.innerHTML = '<p class="no-products">फिलहाल कोई प्रोडक्ट उपलब्ध नहीं है।</p>';
                return;
            }

            // हर एक प्रोडक्ट के लिए कार्ड तैयार करना (ग्रिड लेआउट में)
            productsData.forEach(product => {
                const productCard = `
                    <div class="product-card" data-category="${product.category || 'all'}">
                        <div class="product-image-box">
                            <a href="product-details.html?id=${product.id}">
                                <img src="${product.image}" alt="${product.name}" class="p-img" loading="lazy" onerror="this.src='images/Gemini.jpg';">
                            </a>
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-price">₹${parseFloat(product.price).toLocaleString('en-IN')}</p>
                            
                            <a href="product-details.html?id=${product.id}" class="btn btn-primary" style="text-decoration: none; display: inline-block; text-align: center;">
                                View More
                            </a>
                        </div>
                    </div>
                `;
                productContainer.innerHTML += productCard;
            });
            console.log("सभी प्रोडक्ट्स 'View More' बटन के साथ लोड हो गए हैं!");
        }
    } catch (error) {
        console.error("प्रॉडक्ट लोड करने में समस्या आई:", error);
    }
}

/**
 * 2. आईडी (ID) के आधार पर प्रोडक्ट ढूंढने का ग्लोबल हेल्पर फंक्शन
 */
function getProductById(productId) {
    if (window.allProductsList) {
        return window.allProductsList.find(p => p.id === productId) || null;
    }
    return null;
}

/**
 * 3. क्वांटिटी (+ / - बटन) को बदलने का फंक्शन
 */
function changeQuantity(event, change) {
    const input = event.target.parentElement.querySelector('.quantity-input');
    if (input) {
        let value = parseInt(input.value) + change;
        if (value >= 1) {
            input.value = value;
        }
    }
}

/**
 * 4. कार्ट में प्रोडक्ट जोड़ने का मुख्य फंक्शन (साइज़ और क्वांटिटी बैकअप के साथ)
 */
function addToCart(productId) {
    // अगर विंडो लिस्ट में नहीं है, तो लोकल स्टोरेज से अस्थाई रूप से डेटा निकालने का प्रयास करें
    let product = getProductById(productId);
    
    if (!product) {
        alert("Product loading... Please try again in a second.");
        return;
    }
    
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    // डिटेल्स पेज से चुना गया साइज़ निकालें (डिफ़ॉल्ट 'M')
    const currentSelectedSize = localStorage.getItem('last_selected_size') || 'M';
    
    // कार्ट में चेक करें कि क्या समान आईडी और साइज़ का आइटम पहले से मौजूद है
    const existingItem = cart.find(item => item.id === productId && item.size === currentSelectedSize);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: product.image,
            size: currentSelectedSize, // साइज़ यहाँ स्टोर हो रहा है
            quantity: quantity
        });
    }
    
    if (quantityInput) quantityInput.value = 1;
    
    saveCartToStorage();
    updateCartCount();
    alert(`${quantity} ${product.name} (Size: ${currentSelectedSize}) added to cart!`);
}

/**
 * 5. चेकआउट पेज (cart.html) पर लाइव आइटम दिखाना
 */
function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartContent = document.getElementById('cart-content');
    
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        if (cartEmpty) cartEmpty.style.display = 'block';
        if (cartContent) cartContent.style.display = 'none';
        return;
    }
    
    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartContent) cartContent.style.display = 'grid';
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const row = document.createElement('tr');
        row.style.borderBottom = "1px solid #eee";
        
        const imgHtml = item.image 
            ? `<img src="${item.image}" style="width: 40px; height: 50px; object-fit: contain; border-radius: 4px; margin-right: 0.5rem; vertical-align: middle;" onerror="this.src='images/Gemini.jpg';">`
            : `<span style="font-size: 1.5rem; margin-right: 0.5rem;">🛍️</span>`;

        row.innerHTML = `
            <td style="padding: 1rem 0; text-align: left;">
                ${imgHtml}
                <strong>${item.name}</strong> <br>
                <small style="color: #7f8c8d;">Size: <span style="color:#2c3e50; font-weight:bold;">${item.size}</span> | ₹${item.price} x ${item.quantity}</small>
            </td>
            <td style="text-align: right; padding: 1rem 0;">
                <strong>₹${(item.price * item.quantity).toFixed(2)}</strong> <br>
                <button onclick="removeFromCart(${item.id}, '${item.size}')" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 0.85rem; margin-top: 0.5rem;">🗑️ Remove</button>
            </td>
        `;
        cartItemsContainer.appendChild(row);
    });
    
    updateCartSummary();
}

function removeFromCart(productId, size) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
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

/**
 * 6. लोकल स्टोरेज मैनेजर्स
 */
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

/**
 * 7. पुराना ऑर्डर इतिहास (My Orders History) दिखाना
 */
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
            itemsHtml += `<li>🛍️ ${item.name} (Size: ${item.size}) (Qty: ${item.quantity}) - ₹${item.price * item.quantity}</li>`;
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

/**
 * 8. व्हाट्सएप पर ऑर्डर भेजने का मुख्य फ़ंक्शन (Size Blocks के साथ इंटीग्रेटेड)
 */
function placeOrder(event) {
    event.preventDefault();
    
    try {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        let totalAmount = 0;
        let itemsText = ''; 
        
        // कार्ट में मौजूद हर एक आइटम का नाम और उसका चुना हुआ साइज़ टेक्स्ट में जोड़ना
        cart.forEach((item, index) => {
            totalAmount += item.price * item.quantity;
            itemsText += `${index + 1}. 🛍️ ${item.name} \n   [Size: *${item.size}*] [Qty: ${item.quantity}] - ₹${item.price * item.quantity}\n\n`;
        });

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
        
        // 📲 आपका व्हाट्सएप नंबर (सुरक्षित रूप से कॉन्फ़िगर किया गया)
        const MY_WHATSAPP_NUMBER = "919870708753"; 
        
        // सुंदर व्हाट्सएप बोल्ड फॉर्मेटिंग संदेश
        const message = `🛍️ *NEW ORDER PLACED!* 🛍️\n\n` +
                        `👤 *Customer Name:* ${name}\n` +
                        `📞 *Customer Phone:* ${phone}\n` +
                        `📍 *Shipping Address:* ${address}, ${city}\n\n` +
                        `📦 *Items Ordered:* \n\n${itemsText}` +
                        `💰 *Total Amount:* ₹${totalAmount.toFixed(2)} (COD)`;
                        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${MY_WHATSAPP_NUMBER}?text=${encodedMessage}`;
        
        alert(`Thank you, ${name}! Click OK to send your order and size details on WhatsApp.`);
        
        cart = [];
        saveCartToStorage();
        
        // व्हाट्सएप खोलना
        window.open(whatsappUrl, '_blank'); 
        window.location.href = "index.html";
        
    } catch (error) {
        console.error("Error placing order:", error);
    }
}
