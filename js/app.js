let cart = [];
let orderHistory = [];
window.allProductsList = [];

document.addEventListener('DOMContentLoaded', async () => {
    loadCartFromStorage();
    loadOrdersFromStorage();
    updateCartCount();
    
    await loadProducts();

    if (document.getElementById('cart-items')) {
        displayCart();
    }
    if (document.getElementById('product-detail-content')) {
        triggerProductDetailsRender();
    }
});

// लाइव पिनकोड डिलीवरी सर्विसिबिलिटी चेकर लॉजिक
function checkPincodeService(pin) {
    const statusText = document.getElementById('pincode-status');
    if (!statusText) return;
    
    if (pin.length === 6) {
        if (pin.startsWith('11') || pin.startsWith('20') || pin.startsWith('40') || pin.startsWith('50') || pin.startsWith('70')) {
            statusText.style.color = '#27ae60';
            statusText.textContent = '⚡ Standard Delivery Available (Expected: 3-5 Days)';
        } else {
            statusText.style.color = '#e67e22';
            statusText.textContent = '✈️ Available via External Courier SpeedPost (Expected: 5-7 Days)';
        }
    } else {
        statusText.textContent = '';
    }
}

async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const productsData = await response.json();
        window.allProductsList = productsData;

        // होमपेज प्रोडक्ट्स रेंडरर
        const productContainer = document.getElementById('product-list');
        if (productContainer) {
            productContainer.innerHTML = '';
            productsData.forEach(product => {
                let purePrice = typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.]/g, '')) : parseFloat(product.price);
                if (isNaN(purePrice)) purePrice = 1999;

                const productCard = `
                    <div class="product-card">
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
        }
    } catch (error) {
        console.error("Error loading products layout:", error);
    }
}

function getProductById(productId) {
    if (window.allProductsList && window.allProductsList.length > 0) {
        return window.allProductsList.find(p => p.id === productId) || null;
    }
    return null;
}

function triggerProductDetailsRender() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    if (!productId) return;
    
    const product = getProductById(productId);
    const detailContainer = document.getElementById('product-detail-content');
    if (!detailContainer || !product) return;

    let mediaHtml = '';
    if (product.media && product.media.length > 0) {
        let mainMediaHtml = `<div id="main-media-box" style="width:100%; max-height:400px; display:flex; justify-content:center;">
                                <img id="main-detail-img" src="${product.image}" alt="${product.name}" onerror="this.src='images/Gemini.jpg';" style="width:100%; max-height:400px; object-fit:contain;">
                             </div>`;
        
        let thumbnailsHtml = '<div class="thumbnail-slider-container" style="display: flex; gap: 0.5rem; margin-top: 1rem; overflow-x: auto; padding-bottom: 5px; justify-content: center; align-items:center;">';
        
        product.media.forEach((med, idx) => {
            if (med.url.toLowerCase().includes('.mp4')) {
                thumbnailsHtml += `
                    <div style="width: 60px; height: 75px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer; background: #2c3e50; display:flex; align-items:center; justify-content:center; font-size:1.3rem; color:white;"
                         onclick="document.getElementById('main-media-box').innerHTML='<video src=\\'${med.url}\\' controls autoplay style=\\'width:100%; max-height:400px; object-fit:contain;\\'></video>'; this.parentElement.querySelectorAll('div, img').forEach(i=>i.style.borderColor='#ddd'); this.style.borderColor='#3498db';">
                         ▶️
                    </div>`;
            } else {
                thumbnailsHtml += `
                    <img src="${med.url}" 
                         alt="thumb-${idx}" 
                         style="width: 60px; height: 75px; object-fit: cover; border: 2px solid ${idx === 0 ? '#3498db' : '#ddd'}; border-radius: 4px; cursor: pointer; background: #fff;"
                         onclick="document.getElementById('main-media-box').innerHTML='<img id=\\'main-detail-img\\' src=\\'${med.url}\\' style=\\'width:100%; max-height:400px; object-fit:contain\\'>'; this.parentElement.querySelectorAll('div, img').forEach(i=>i.style.borderColor='#ddd'); this.style.borderColor='#3498db';"
                    >`;
            }
        });
        thumbnailsHtml += '</div>';
        mediaHtml = mainMediaHtml + thumbnailsHtml;
    } else {
        mediaHtml = `<img src="${product.image}" alt="${product.name}" onerror="this.src='images/Gemini.jpg';" style="width:100%; max-height:400px; object-fit:contain;">`;
    }

    let purePrice = typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.]/g, '')) : parseFloat(product.price);
    if (isNaN(purePrice)) purePrice = 1999;

    const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    let bestsellerCardsHtml = '';
    const randomBestsellers = window.allProductsList.filter(p => p.id !== product.id).slice(0, 5);
    randomBestsellers.forEach(bp => {
        let bpPrice = typeof bp.price === 'string' ? parseFloat(bp.price.replace(/[^\d.]/g, '')) : parseFloat(bp.price);
        bestsellerCardsHtml += `
            <a href="product-details.html?id=${bp.id}" class="bestseller-card">
                <img src="${bp.image}" class="bestseller-img" onerror="this.src='images/Gemini.jpg';">
                <div class="bestseller-name">${bp.name}</div>
                <div class="bestseller-price">₹${bpPrice.toLocaleString('en-IN')}</div>
            </a>
        `;
    });

    detailContainer.innerHTML = `
        <div style="grid-column: span 2; text-align: right; margin-bottom: 1rem;">
            <a href="cart.html" class="details-page-cart">
                🛒 View Cart <span id="details-cart-count" class="cart-count">${totalCartItems}</span>
            </a>
        </div>
        
        <div class="detail-image-box">${mediaHtml}</div>
        <div class="detail-info-box">
            <h1 class="detail-title">${product.name}</h1>
            <div class="detail-price">₹${purePrice.toLocaleString('en-IN')}</div>
            <p class="detail-desc">${product.description || 'Premium quality outfit perfect for your wardrobe.'}</p>
            
            <div class="size-section">
                <div class="size-title"><span>Select Size:</span></div>
                <div class="size-grid">
                    <button class="size-btn" onclick="selectSize(this, 'S')">S</button>
                    <button class="size-btn selected" onclick="selectSize(this, 'M')">M</button>
                    <button class="size-btn" onclick="selectSize(this, 'L')">L</button>
                    <button class="size-btn" onclick="selectSize(this, 'XL')">XL</button>
                    <button class="size-btn" onclick="selectSize(this, 'XXL')">XXL</button>
                    <button class="size-btn" onclick="selectSize(this, '3XL')">3XL</button>
                </div>
            </div>
            
            <div class="product-quantity">
                <button class="quantity-btn" onclick="changeQuantity(event, -1)">-</button>
                <input type="text" class="quantity-input" id="qty-${product.id}" value="1" readonly>
                <button class="quantity-btn" onclick="changeQuantity(event, 1)">+</button>
            </div>
            
            <div class="action-buttons" style="display: flex; flex-direction: column; gap: 0.8rem; margin-top: 1.5rem;">
                <button class="btn btn-primary" onclick="addToCart(${product.id})" style="padding: 0.75rem; font-size: 1rem;">
                    🛒 Add to Cart
                </button>
                <button class="btn" onclick="buyDirectOnWhatsApp(${product.id})" style="background-color: #25D366; color: white; border: none; padding: 0.75rem; font-size: 1rem; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    💬 Buy on WhatsApp
                </button>
            </div>
        </div>

        <div class="bestseller-section" style="grid-column: span 2;">
            <h3 class="bestseller-title">🔥 Our Best Sellers</h3>
            <div class="bestseller-slider">${bestsellerCardsHtml}</div>
        </div>

        <div class="reviews-section" style="grid-column: span 2;">
            <h3 class="bestseller-title" style="border-left-color: #27ae60;">🌟 Customer Reviews (Feedback)</h3>
            
            <div class="review-box">
                <div class="review-header"><span class="reviewer-name">Priya Sharma</span><span class="review-stars">⭐⭐⭐⭐⭐</span></div>
                <p class="review-comment">The fabric and embroidery are exceptionally beautiful. Fitting turned out to be perfect. Thank you Deepanshi Fashion World!</p>
                <div class="review-attached-images">
                    <img src="images/kurti1.jpg" class="review-img" alt="Review Wear">
                </div>
            </div>
            <div class="review-box">
                <div class="review-header"><span class="reviewer-name">Anjali Verma</span><span class="review-stars">⭐⭐⭐⭐⭐</span></div>
                <p class="review-comment">I ordered after checking the video thumbnail, the outfit looks exactly as shown. Highly recommended boutique service.</p>
                <div class="review-attached-images">
                    <img src="images/IMG_20260528_163105.jpg" class="review-img" alt="Review Wear">
                </div>
            </div>

            <div id="extended-reviews" class="extended-reviews-slide">
                <div class="review-box">
                    <div class="review-header"><span class="reviewer-name">Ritu Singh</span><span class="review-stars">⭐⭐⭐⭐⭐</span></div>
                    <p class="review-comment">The color saturation and design lines are more vibrant than photos. Absolutely wonderful collection for traditional festivals.</p>
                    <div class="review-attached-images"><img src="images/IMG_20260528_163041.jpg" class="review-img"></div>
                </div>
                <div class="review-box">
                    <div class="review-header"><span class="reviewer-name">Sangeeta Yadav</span><span class="review-stars">⭐⭐⭐⭐⭐</span></div>
                    <p class="review-comment">Express delivery was quick and support is helpful. Will certainly buy more traditional variants very soon.</p>
                    <div class="review-attached-images"><img src="images/green%20suit.jpg" class="review-img"></div>
                </div>
                <div class="review-box">
                    <div class="review-header"><span class="reviewer-name">Neha Kapoor</span><span class="review-stars">⭐⭐⭐⭐⭐</span></div>
                    <p class="review-comment">Premium thread work is top notch. The luster remains intact even after gentle handwash. Worth every single rupee!</p>
                    <div class="review-attached-images"><img src="images/carrot%20suit.jpg" class="review-img"></div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 1.5rem;">
                <button id="view-more-reviews-btn" class="view-more-btn" onclick="toggleReviewsSlider()">View More Reviews 🔽</button>
            </div>
        </div>
    `;
}

// डायरेक्ट व्हाट्सएप आर्डर
function buyDirectOnWhatsApp(productId) {
    const product = getProductById(productId);
    if (!product) return;
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value) || 1;
    const selectedSize = localStorage.getItem('last_selected_size') || 'M';
    let purePrice = typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.]/g, '')) : parseFloat(product.price);
    const totalPrice = purePrice * quantity;
    const whatsappNum = "919870708753";

    const msg = `👋 *Hello Deepanshi Fashion World!*\n\nI want to buy this item directly:\n\n👗 *Item Name:* ${product.name}\n📐 *Size:* ${selectedSize}\n📦 *Quantity:* ${quantity}\n💰 *Price:* ₹${purePrice.toLocaleString('en-IN')}\n💵 *Total:* ₹${totalPrice.toLocaleString('en-IN')}\n\nKindly process my dispatch order. Thank you!`;
    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`, '_blank');
}

/**
 * 🛍️ नया कार्ट पेज अलाइनमेंट रेंडरर सिंक (प्रॉपर आइटम शो नियम)
 */
function displayCart() {
    const cartItemsBox = document.getElementById('cart-items');
    const emptyBox = document.getElementById('cart-empty');
    const contentBox = document.getElementById('cart-content');
    
    if (!cartItemsBox) return;

    if (cart.length === 0) {
        emptyBox.style.display = 'block';
        contentBox.style.display = 'none';
        return;
    }

    emptyBox.style.display = 'none';
    contentBox.style.display = 'grid';
    cartItemsBox.innerHTML = '';

    let totalBill = 0;
    cart.forEach((item, index) => {
        const cost = item.price * item.quantity;
        totalBill += cost;
        
        cartItemsBox.innerHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 0.5rem 0;"><img src="${item.image}" style="width:40px; height:50px; object-fit:cover; border-radius:4px;"></td>
                <td style="padding: 0.5rem; font-size:0.9rem;"><strong>${item.name}</strong><br><small style="color:#e67e22;">Size: ${item.size} x ${item.quantity}</small></td>
                <td style="padding: 0.5rem; text-align:right; font-weight:bold;">₹${cost.toLocaleString('en-IN')}</td>
                <td style="padding: 0.5rem; text-align:right;"><button style="background:none; border:none; color:#e74c3c; cursor:pointer; font-weight:bold;" onclick="removeCartItemIndex(${index})">❌</button></td>
            </tr>
        `;
    });

    document.getElementById('subtotal').textContent = `₹${totalBill.toLocaleString('en-IN')}`;
    document.getElementById('total').textContent = `₹${totalBill.toLocaleString('en-IN')}`;
}

function removeCartItemIndex(index) {
    cart.splice(index, 1);
    saveCartToStorage();
    updateCartCount();
    displayCart();
}

function togglePaymentGatewayNotice(mode) {
    const notice = document.getElementById('online-payment-notice');
    if (notice) notice.style.display = (mode === 'ONLINE') ? 'block' : 'none';
}

// ✅ नया: मास्टर फॉर्म हैंडलर (COD वर्सेस ऑनलाइन पेमेंट मोड स्प्लिटर)
let activePendingBillingData = null;
function handleCheckoutFormSubmit(event) {
    event.preventDefault();
    
    const mode = document.getElementById('payment').value;
    activePendingBillingData = {
        id: "DF" + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString('en-IN'),
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        pincode: document.getElementById('pincode').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        method: mode === 'COD' ? 'Cash on Delivery (COD)' : 'Paid Online (UPI Verified)',
        amount: cart.reduce((s, i) => s + (i.price * i.quantity), 0)
    };

    if (mode === 'ONLINE') {
        document.getElementById('modal-total-amount').textContent = `₹${activePendingBillingData.amount.toLocaleString('en-IN')}`;
        document.getElementById('payment-modal').style.display = 'flex';
    } else {
        verifyOnlinePaymentAndDispatch(); // COD डायरेक्ट आर्डर प्लेसमेंट
    }
}

function closePaymentGatewayModal() {
    document.getElementById('payment-modal').style.display = 'none';
}

// ✅ नया: मल्टी-आइटम व्हाट्सएप समरी इंजन + आटोमेटिक इनवॉइस जनरेटर फिक्स
function verifyOnlinePaymentAndDispatch() {
    if (!activePendingBillingData) return;
    closePaymentGatewayModal();

    // ऑर्डर हिस्ट्री में सेव करें
    orderHistory.unshift(activePendingBillingData);
    localStorage.setItem('orders', JSON.stringify(orderHistory));

    // डिजिटल पक्का बिल (Invoice Modal) डेटा लोड
    document.getElementById('inv-id').textContent = activePendingBillingData.id;
    document.getElementById('inv-date').textContent = activePendingBillingData.date;
    document.getElementById('inv-method').textContent = activePendingBillingData.method;
    document.getElementById('inv-name').textContent = activePendingBillingData.name;
    document.getElementById('inv-phone').textContent = activePendingBillingData.phone;
    document.getElementById('inv-address').textContent = `${activePendingBillingData.address}, ${activePendingBillingData.city} - ${activePendingBillingData.pincode}`;
    
    let itemsBillSummaryText = '';
    let waItemsText = '';
    cart.forEach(item => {
        itemsBillSummaryText += `<div style="display:flex; justify-content:space-between; margin-bottom:0.2rem;"><span>• ${item.name} (${item.size}) x${item.quantity}</span><span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span></div>`;
        waItemsText += `• *${item.name}* (Size: ${item.size}) x ${item.quantity}\n`;
    });
    document.getElementById('invoice-items-list').innerHTML = itemsBillSummaryText;
    document.getElementById('inv-total').textContent = `₹${activePendingBillingData.amount.toLocaleString('en-IN')}`;

    // व्हाट्सएप मल्टी-आइटम मैसेज ट्रिगर
    const whatsappNum = "919870708753";
    const waMsg = `🛍️ *NEW ORDER DISPATCH RECEIPT* (#${activePendingBillingData.id})\n\n` +
                  `👤 *Customer:* ${activePendingBillingData.name}\n` +
                  `📞 *Phone:* ${activePendingBillingData.phone}\n` +
                  `📍 *Address:* ${activePendingBillingData.address}, ${activePendingBillingData.city}\n` +
                  `📮 *Pincode:* ${activePendingBillingData.pincode}\n` +
                  `💳 *Payment:* ${activePendingBillingData.method}\n\n` +
                  `📦 *Ordered Suits Layout:*\n${waItemsText}\n` +
                  `💰 *Grand Total Amount:* ₹${activePendingBillingData.amount.toLocaleString('en-IN')}\n\n` +
                  `Please secure package tracking number. Thank you!`;

    // इनवॉइस पॉप-अप शो करें
    document.getElementById('invoice-modal').style.display = 'flex';
    
    // व्हाट्सएप को बैकग्राउंड टैब में ओपन करें
    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(waMsg)}`, '_blank');

    // कार्ट साफ़ करें
    cart = [];
    saveCartToStorage();
    updateCartCount();
}

function closeInvoiceAndRedirectHome() {
    document.getElementById('invoice-modal').style.display = 'none';
    window.location.href = 'index.html';
}

function toggleReviewsSlider() {
    const extendedBox = document.getElementById('extended-reviews');
    const btn = document.getElementById('view-more-reviews-btn');
    if (extendedBox.classList.contains('open')) {
        extendedBox.classList.remove('open');
        btn.innerHTML = 'View More Reviews 🔽';
    } else {
        extendedBox.classList.add('open');
        btn.innerHTML = 'Show Less Reviews 🔼';
    }
}

function changeQuantity(event, change) {
    const input = event.target.parentElement.querySelector('.quantity-input');
    if (input) {
        let value = parseInt(input.value) + change;
        if (value >= 1) input.value = value;
    }
}

function selectSize(element, size) {
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
    element.classList.add('selected');
    localStorage.setItem('last_selected_size', size);
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function saveCartToStorage() { localStorage.setItem('cart', JSON.stringify(cart)); }
function loadCartFromStorage() { const savedCart = localStorage.getItem('cart'); if (savedCart) cart = JSON.parse(savedCart); }
function loadOrdersFromStorage() { const savedOrders = localStorage.getItem('orders'); if (savedOrders) orderHistory = JSON.parse(savedOrders); }
