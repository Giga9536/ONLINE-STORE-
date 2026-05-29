/**
 * दीपांशी फैशन वर्ल्ड - मुख्य जावास्क्रिप्ट फ़ाइल (थंबनेल स्लाइडर गैलरी अपग्रेडेड)
 * प्रोडक्ट कार्ड लोडिंग, साइज चार्ट ट्रैकिंग और व्हाट्सएप इंटीग्रेशन के साथ
 */

let cart = [];
let orderHistory = [];
window.allProductsList = []; // ग्लोबल लिस्ट बैकअप

// पेज लोड होते ही डेटा लोड करना और कार्ट काउंट अपडेट करना
document.addEventListener('DOMContentLoaded', async () => {
    loadCartFromStorage();
    loadOrdersFromStorage();
    updateCartCount();

    // सबसे पहले प्रोडक्ट्स को JSON से पूरी तरह सिंक होने का इंतजार (await) करेंगे
    await loadProducts();

    // यदि हम चेकआउट (cart.html) पेज पर हैं, तो कार्ट और हिस्ट्री दिखाएं
    if (document.getElementById('cart-items')) {
        displayCart();
        displayOrderHistory();
    }

    // अगर हम डिटेल्स पेज पर हैं, तो डेटा आने के बाद डिटेल्स और थंबनेल स्लाइडर रेंडर करेंगे
    if (document.getElementById('product-detail-content')) {
        triggerProductDetailsRender();
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
        window.allProductsList = productsData; // वैश्विक उपयोग के लिए सुरक्षित

        const productContainer = document.getElementById('product-list');
        
        if (productContainer) {
            productContainer.innerHTML = ''; // पुराना कंटेंट साफ़ करना

            if (productsData.length === 0) {
                productContainer.innerHTML = '<p class="no-products">फिलहाल कोई推销 उपलब्ध नहीं है।</p>';
                return;
            }

            // हर एक प्रोडक्ट के लिए कार्ड तैयार करना (ग्रिड लेआउट में)
            productsData.forEach(product => {
                let purePrice = 0;
                if (typeof product.price === 'string') {
                    purePrice = parseFloat(product.price.replace(/[^\d.]/g, ''));
                } else {
                    purePrice = parseFloat(product.price);
                }
                if (isNaN(purePrice)) purePrice = 1999;

                const productCard = `
                    <div class="product-card" data-category="${product.category || 'all'}">
                        <div class="product-image-box">
                            <a href="product-details.html?id=${product.id}">
                                <img src="${product.image}" alt="${product.name}" class="p-img" loading="lazy" onerror="this.src='images/Gemini.jpg';">
                            </a>
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-price">₹${purePrice.toLocaleString('en-IN')}</p>
                            
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
    if (window.allProductsList && window.allProductsList.length > 0) {
        return window.allProductsList.find(p => p.id === productId) || null;
    }
    return null;
}

/**
 * 3. प्रोडक्ट डिटेल्स पेज पर थंबनेल स्लाइडर के साथ डेटा दिखाने का फंक्शन
 */
function triggerProductDetailsRender() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) return;
    
    const product = getProductById(productId);
    const detailContainer = document.getElementById('product-detail-content');
    
    if (!detailContainer) return;
    
    if (product) {
        let purePrice = typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.]/g, '')) : parseFloat(product.price);
        if (isNaN(purePrice)) purePrice = 1999;

        // 🖼️ थंबनेल स्लाइडर (Media Array) रेंडरिंग लॉजिक
        let mediaHtml = '';
        
        if (product.media && product.media.length > 0) {
            let mainImageHtml = `<img id="main-detail-img" src="${product.image}" alt="${product.name}" onerror="this.src='images/Gemini.jpg';" style="width:100%; max-height:400px; object-fit:contain;">`;
            
            let thumbnailsHtml = '<div class="thumbnail-slider-container" style="display: flex; gap: 0.5rem; margin-top: 1rem; overflow-x: auto; padding-bottom: 5px; justify-content: center;">';
            
            product.media.forEach((med, idx) => {
                thumbnailsHtml += `
                    <img src="${med.url}" 
                         alt="thumb-${idx}" 
                         style="width: 60px; height: 75px; object-fit: cover; border: 2px solid ${idx === 0 ? '#3498db' : '#ddd'}; border-radius: 4px; cursor: pointer; background: #fff;"
                         onclick="document.getElementById('main-detail-img').src='${med.url}'; this.parentElement.querySelectorAll('img').forEach(i=>i.style.borderColor='#ddd'); this.style.borderColor='#3498db';"
                    >`;
            });
            thumbnailsHtml += '</div>';
            
            mediaHtml = mainImageHtml + thumbnailsHtml;
        } else {
            mediaHtml = product.image 
                ? `<img src="${product.image}" alt="${product.name}" onerror="this.src='images/Gemini.jpg';" style="width:100%; max-height:400px; object-fit:contain;">`
                : `<div style="font-size: 8rem; text-align: center; padding: 3rem;">👗</div>`;
        }

        detailContainer.innerHTML = `
            <div class="detail-image-box">
                ${mediaHtml}
            </div>
            <div class="detail-info-box">
                <h1 class="detail-title">${product.name}</h1>
                <div class="detail-price">₹${purePrice.toLocaleString('en-IN')}</div>
                <p class="detail-desc">${product.description || 'Premium quality outfit perfect for your beautiful wardrobe.'}</p>
                
                <div class="size-section">
                    <div class="size-title">
                        <span>Select Size:</span>
                        <span style="color: #3498db; font-size: 0.9rem; cursor: pointer; text-decoration: underline;">Size Chart</span>
                    </div>
                    <div class="size-grid">
                        <button class="size-btn" onclick="selectSize(this, 'S')">S</button>
                        <button class="size-btn selected" onclick="selectSize(this, 'M')">M</button>
                        <button class="size-btn" onclick="selectSize(this, 'L')">L</button>
                        <button class="size-btn" onclick="selectSize(this, 'XL')">XL</button>
                        <button class="size-btn" onclick="selectSize(this, 'XXL')">XXL</button>
                        <button class="size-btn" onclick="selectSize(this, '3XL')">3XL</button>
                    </div>
                </div>

                <div class="product-quantity" style="margin-bottom: 1.5rem;">
                    <span style="font-weight: bold; color: #2c3e50; display: block; margin-bottom: 0.5rem;">Quantity:</span>
                    <button class="quantity-btn" onclick="changeQuantity(event, -1)">-</button>
                    <input type="text" class="quantity-input" id="qty-${product.id}" value="1" readonly>
                    <button class="quantity-btn" onclick="changeQuantity(event, 1)">+</button>
                </div>

                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="addWithDetails(${product.id})">🛒 Add to Cart</button>
                    <button class="btn btn-buy-now" onclick="buyNowWithDetails(${product.id})">⚡ Buy Now</button>
                </div>
            </div>
        `;
    } else {
        detailContainer.innerHTML = '<p class="no-products">क्षमा करें, इस प्रोडक्ट की डिटेल्स नहीं मिल सकीं।</p>';
    }
}

/**
 * 4. क्वांटिटी (+ / - बटन) को बदलने का फंक्शन
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
 * 5. डिटेल्स पेज साइज़ सेलेक्टर
 */
function selectSize(element, size) {
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
    element.classList.add('selected');
    localStorage.setItem('last_selected_size', size);
}

function addWithDetails(productId) {
    addToCart(productId);
}

function buyNowWithDetails(productId) {
    addToCart(productId);
    setTimeout(() => {
        window.location.href = "cart.html";
    }, 500);
}

/**
 * 6. कार्ट में प्रोडक्ट जोड़ने का मुख्य फंक्शन
 */
function addToCart(productId) {
    let product = getProductById(productId);
    
    if (!product) {
        alert("Product loading... Please try again in a second.");
        return;
    }
    
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    const currentSelectedSize = localStorage.getItem('last_selected_size') || 'M';
    
    let purePrice = typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.]/g, '')) : parseFloat(product.price);
    if (isNaN(purePrice)) purePrice = 1999;

    const existingItem = cart.find(item => item.id === productId && item.size === currentSelectedSize);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: purePrice,
            image: product.image,
            size: currentSelectedSize,
            quantity: quantity
        });
    }
    
    if (quantityInput) quantityInput.value = 1;
    
    saveCartToStorage();
    updateCartCount();
    alert(`${quantity} ${product.name} (Size: ${currentSelectedSize}) added to cart!`);
}

/**
 * 7. चेकआउट पेज (cart.html) पर लाइव आइटम दिखाना
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
 * 8. लोकल स्टोरेज मैनेजर्स
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
 * 9. व्हाट्सएप पर ऑर्डर भेजने का मुख्य फ़ंक्शन
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
        
        const MY_WHATSAPP_NUMBER = "919870708753"; 
        
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
        
        window.open(whatsappUrl, '_blank'); 
        window.location.href = "index.html";
        
    } catch (error) {
        console.error("Error placing order:", error);
    }
}
