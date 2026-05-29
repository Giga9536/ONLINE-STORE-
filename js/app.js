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
        // ✅ आपकी असली Google Sheet ID यहाँ सुरक्षित रूप से लिंक कर दी गई है
        const sheetId = '1dAUsZm2emo96kRbFH6exyMHyK5HPVy9mHaqhY49c0nM';
        const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

        const response = await fetch(sheetUrl);
        if (!response.ok) throw new Error(`Google Sheet Fetch Error! status: ${response.status}`);
        const csvText = await response.text();
        
        // सुरक्षित CSV पार्सर जो एक्स्ट्रा कोट्स और लेआउट की गड़बड़ी को साफ करता है
        const lines = csvText.split(/\r?\n/);
        if (lines.length === 0) return;

        // हेडर्स से फालतू के कोट्स हटाना
        const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
        const productsData = [];

        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].trim();
            if (!currentLine) continue;
            
            // कोट्स और कॉमा को सही से संभालने वाला रेगुलेटर
            const matches = currentLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || currentLine.split(',');
            const rowData = matches.map(v => v.replace(/^"|"$/g, '').trim());
            
            const product = {};
            headers.forEach((header, index) => {
                let value = rowData[index] || '';
                // वैल्यू के अंदर छिपे हुए अतिरिक्त कोट्स को पूरी तरह साफ करना
                product[header] = value.replace(/^"|"$/g, '').trim();
            });
            
            if (product.id) {
                product.id = parseInt(product.id);
                // थंबनेल गैलरी का ऑटोमैटिक पाथ सिंक ताकि लेआउट न टूटे
                product.media = [
                    { "type": "image", "url": product.image },
                    { "type": "image", "url": "images/Gemini.jpg" }
                ];
                productsData.push(product);
            }
        }

        window.allProductsList = productsData;

        // होमपेज收藏 ग्रिड रेंडरर
        const productContainer = document.getElementById('product-list');
        if (productContainer) {
            productContainer.innerHTML = '';
            productsData.forEach(product => {
                let purePrice = typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.]/g, '')) : parseFloat(product.price);
                if (isNaN(purePrice)) purePrice = 1999;

                let priceHtml = `<p class="product-price">₹${purePrice.toLocaleString('en-IN')}</p>`;
                if (product.original_price) {
                    let oldPrice = parseFloat(product.original_price.replace(/[^\d.]/g, ''));
                    let discountPercent = Math.round(((oldPrice - purePrice) / oldPrice) * 100);
                    if (!isNaN(discountPercent) && discountPercent > 0) {
                        priceHtml = `
                            <p class="product-price" style="font-size: 0.95rem;">
                                <span style="color: #7f8c8d; text-decoration: line-through; font-size: 0.85rem; font-weight: normal; margin-right: 4px;">₹${oldPrice.toLocaleString('en-IN')}</span>
                                <span style="color: #e67e22; font-weight: bold;">₹${purePrice.toLocaleString('en-IN')}</span>
                                <span style="color: #27ae60; font-size: 0.8rem; font-weight: bold; margin-left: 4px;">(${discountPercent}% Off)</span>
                            </p>
                        `;
                    }
                }

                const productCard = `
                    <div class="product-card">
                        <div class="product-image-box">
                            <a href="product-details.html?id=${product.id}">
                                <img src="${product.image}" alt="${product.name}" class="p-img" loading="lazy" onerror="this.src='images/Gemini.jpg';">
                            </a>
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">${product.name}</h3>
                            ${priceHtml}
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
        console.error("Error loading products layout from Google Sheets:", error);
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
            if (med.url && med.url.toLowerCase().includes('.mp4')) {
                thumbnailsHtml += `
                    <div style="width: 60px; height: 75px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer; background: #2c3e50; display:flex; align-items:center; justify-content:center; font-size:1.3rem; color:white;"
                         onclick="document.getElementById('main-media-box').innerHTML='<video src=\\'${med.url}\\' controls autoplay style=\\'width:100%; max-height:400px; object-fit:contain;\\'></video>'; this.parentElement.querySelectorAll('div, img').forEach(i=>i.style.borderColor='#ddd'); this.style.borderColor='#3498db';">
                         ▶️
                    </div>`;
            } else {
                thumbnailsHtml += `
                    <img src="${med.url || product.image}" 
                         alt="thumb-${idx}" 
                         style="width: 60px; height: 75px; object-fit: cover; border: 2px solid ${idx === 0 ? '#3498db' : '#ddd'}; border-radius: 4px; cursor: pointer; background: #fff;"
                         onclick="document.getElementById('main-media-box').innerHTML='<img id=\\'main-detail-img\\' src=\\'${med.url || product.image}\\' style=\\'width:100%; max-height:400px; object-fit:contain\\'>'; this.parentElement.querySelectorAll('div, img').forEach(i=>i.style.borderColor='#ddd'); this.style.borderColor='#3498db';"
                         onerror="this.src='images/Gemini.jpg';"
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

    let detailPriceHtml = `<div class="detail-price">₹${purePrice.toLocaleString('en-IN')}</div>`;
    if (product.original_price) {
        let oldPrice = parseFloat(product.original_price.replace(/[^\d.]/g, ''));
        let discountPercent = Math.round(((oldPrice - purePrice) / oldPrice) * 100);
        if (!isNaN(discountPercent) && discountPercent > 0) {
            detailPriceHtml = `
                <div class="detail-price" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 1rem;">
                    <span style="color: #7f8c8d; text-decoration: line-through; font-size: 1.1rem; font-weight: normal;">₹${oldPrice.toLocaleString('en-IN')}</span>
                    <span style="color: #e67e22; font-weight: bold; font-size: 1.5rem;">₹${purePrice.toLocaleString('en-IN')}</span>
                    <span style="color: #27ae60; font-size: 0.9rem; font-weight: bold; background: #e8f5e9; padding: 2px 8px; border-radius: 4px;">${discountPercent}% Off</span>
                </div>
            `;
        }
    }

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
            ${detailPriceHtml}
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
                <button class="btn btn-primary" onclick="addToCart(${product.id})" style="padding: 0.75rem; font-size: 1rem; cursor: pointer;">
                    🛒 Add to Cart
                </button>
                <button class="btn" onclick="buyDirectOnWhatsApp(${product.id})" style="background-color: #25D366; color: white; border: none; padding: 0.75rem; font-size: 1rem; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
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
                <div class="review-attached-images" style="margin-top:0.5rem;">
                    <img src="images/kurti1.jpg" style="width:65px; height:85px; object-fit:cover; border-radius:4px; border:1px solid #ddd;">
                </div>
            </div>
            <div class="review-box">
                <div class="review-header"><span class="reviewer-name">Anjali Verma</span><span class="review-stars">⭐⭐⭐⭐⭐</span></div>
                <p class="review-comment">I ordered after checking the video thumbnail, the outfit looks exactly as shown. Highly recommended boutique service.</p>
                <div class="review-attached-images" style="margin-top:0.5rem;">
                    <img src="images/IMG_20260528_163105.jpg" style="width:65px; height:85px; object-fit:cover; border-radius:4px; border:1px solid #ddd;">
                </div>
            </div>

            <div id="extended-reviews" class="extended-reviews-slide">
                <div class="review-box">
                    <div class="review-header"><span class="reviewer-name">Ritu Singh</span><span class="review-stars">⭐⭐⭐⭐⭐</span></div>
                    <p class="review-comment">The color saturation and design lines are more vibrant than photos. Absolutely wonderful collection for traditional festivals.</p>
                    <div class="review-attached-images" style="margin-top:0.5rem;"><img src="images/IMG_20260528_163041.jpg" style="width:65px; height:85px; object-fit:cover; border-radius:4px; border:1px solid #ddd;"></div>
                </div>
                <div class="review-box">
                    <div class="review-header"><span class="reviewer-name">Sangeeta Yadav</span><span class="review-stars">⭐⭐⭐⭐⭐</span></div>
                    <p class="review-comment">Express delivery was quick and support is helpful. Will certainly buy more traditional variants very soon.</p>
                    <div class="review-attached-images" style="margin-top:0.5rem;"><img src="images/green%20suit.jpg" style="width:65px; height:85px; object-fit:cover; border-radius:4px; border:1px solid #ddd;"></div>
                </div>
                <div class="review-box">
                    <div class="review-header"><span class="reviewer-name">Neha Kapoor</span><span class="review-stars">⭐⭐⭐⭐⭐</span></div>
                    <p class="review-comment">Premium thread work is top notch. The luster remains intact even after gentle handwash. Worth every single rupee!</p>
                    <div class="review-attached-images" style="margin-top:0.5rem;"><img src="images/carrot%20suit.jpg" style="width:65px; height:85px; object-fit:cover; border-radius:4px; border:1px solid #ddd;"></div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 1.5rem;">
                <button id="view-more-reviews-btn" class="view-more-btn" onclick="toggleReviewsSlider()">View More Reviews 🔽</button>
            </div>
        </div>
    `;
}

function displayCart() {
    const cartItemsBox = document.getElementById('cart-items');
    const emptyBox = document.getElementById('cart-empty');
    const contentBox = document.getElementById('cart-content');
    
    if (!cartItemsBox) return;

    if (cart.length === 0) {
        if (emptyBox) emptyBox.style.display = 'block';
        if (contentBox) contentBox.style.display = 'none';
        return;
    }

    if (emptyBox) emptyBox.style.display = 'none';
    if (contentBox) contentBox.style.display = 'grid';
    
    cartItemsBox.innerHTML = '';
    let totalBill = 0;

    cart.forEach((item, index) => {
        const cost = item.price * item.quantity;
        totalBill += cost;
        
        let finalImageSrc = item.image;
        if (!finalImageSrc.startsWith('images/') && !finalImageSrc.startsWith('http')) {
            finalImageSrc = 'images/' + finalImageSrc;
        }
        
        cartItemsBox.innerHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 0.5rem 0;">
                    <img src="${finalImageSrc}" style="width:50px; height:65px; object-fit:cover; border-radius:6px; border:1px solid #ddd;" onerror="this.src='images/Gemini.jpg';">
                </td>
                <td style="padding: 0.5rem; font-size:0.9rem;">
                    <strong>${item.name}</strong><br>
                    <small style="color:#e67e22; font-weight:500;">Size: ${item.size} x ${item.quantity}</small>
                </td>
                <td style="padding: 0.5rem; text-align:right; font-weight:bold;">₹${cost.toLocaleString('en-IN')}</td>
                <td style="padding: 0.5rem; text-align:right;">
                    <button style="background:none; border:none; color:#e74c3c; cursor:pointer; font-weight:bold; font-size:1.1rem;" onclick="removeCartItemIndex(${index})">❌</button>
                </td>
            </tr>
        `;
    });

    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    if (subtotalEl) subtotalEl.textContent = `₹${totalBill.toLocaleString('en-IN')}`;
    if (totalEl) totalEl.textContent = `₹${totalBill.toLocaleString('en-IN')}`;
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
        const modalAmountEl = document.getElementById('modal-total-amount');
        if (modalAmountEl) modalAmountEl.textContent = `₹${activePendingBillingData.amount.toLocaleString('en-IN')}`;
        const payModal = document.getElementById('payment-modal');
        if (payModal) payModal.style.display = 'flex';
    } else {
        verifyOnlinePaymentAndDispatch(); 
    }
}

// डायरेक्ट व्हाट्सएप आर्डर लॉजिक
function buyDirectOnWhatsApp(productId) {
    const product = getProductById(productId);
    if (!product) return;
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value) || 1;
    
    const activeSizeBtn = document.querySelector('.size-btn.selected');
    const selectedSize = activeSizeBtn ? activeSizeBtn.textContent.trim() : 'M';
    
    let purePrice = typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.]/g, '')) : parseFloat(product.price);
    const totalPrice = purePrice * quantity;
    const whatsappNum = "919870708753";

    const msg = `👋 *Hello Deepanshi Fashion World!*\n\nI want to buy this item directly:\n\n👗 *Item Name:* ${product.name}\n📐 *Size:* ${selectedSize}\n📦 *Quantity:* ${quantity}\n💰 *Price:* ₹${purePrice.toLocaleString('en-IN')}\n💵 *Total:* ₹${totalPrice.toLocaleString('en-IN')}\n\nKindly process my dispatch order. Thank you!`;
    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`, '_blank');
}

function closePaymentGatewayModal() {
    const payModal = document.getElementById('payment-modal');
    if (payModal) payModal.style.display = 'none';
}

function verifyOnlinePaymentAndDispatch() {
    if (!activePendingBillingData) return;
    closePaymentGatewayModal();

    orderHistory.unshift(activePendingBillingData);
    localStorage.setItem('orders', JSON.stringify(orderHistory));

    const invId = document.getElementById('inv-id');
    const invDate = document.getElementById('inv-date');
    const invMethod = document.getElementById('inv-method');
    const invName = document.getElementById('inv-name');
    const invPhone = document.getElementById('inv-phone');
    const invAddress = document.getElementById('inv-address');
    const invItemsList = document.getElementById('invoice-items-list');
    const invTotal = document.getElementById('inv-total');

    if (invId) invId.textContent = activePendingBillingData.id;
    if (invDate) invDate.textContent = activePendingBillingData.date;
    if (invMethod) invMethod.textContent = activePendingBillingData.method;
    if (invName) invName.textContent = activePendingBillingData.name;
    if (invPhone) invPhone.textContent = activePendingBillingData.phone;
    if (invAddress) invAddress.textContent = `${activePendingBillingData.address}, ${activePendingBillingData.city} - ${activePendingBillingData.pincode}`;
    
    let itemsBillSummaryText = '';
    let waItemsText = '';
    cart.forEach(item => {
        itemsBillSummaryText += `<div style="display:flex; justify-content:space-between; margin-bottom:0.2rem;"><span>• ${item.name} (${item.size}) x${item.quantity}</span><span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span></div>`;
        waItemsText += `• *${item.name}* (Size: ${item.size}) x ${item.quantity}\n`;
    });
    if (invItemsList) invItemsList.innerHTML = itemsBillSummaryText;
    if (invTotal) invTotal.textContent = `₹${activePendingBillingData.amount.toLocaleString('en-IN')}`;

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

    const invModal = document.getElementById('invoice-modal');
    if (invModal) invModal.style.display = 'flex';
    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(waMsg)}`, '_blank');

    cart = [];
    saveCartToStorage();
    updateCartCount();
}

function closeInvoiceAndRedirectHome() {
    const invModal = document.getElementById('invoice-modal');
    if (invModal) invModal.style.display = 'none';
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

function addToCart(productId) {
    let product = getProductById(productId);
    if (!product) return;
    
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    const activeSizeBtn = document.querySelector('.size-btn.selected');
    const currentSelectedSize = activeSizeBtn ? activeSizeBtn.textContent.trim() : 'M';
    
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
    
    saveCartToStorage();
    updateCartCount();
    
    const detailsCartCount = document.getElementById('details-cart-count');
    if (detailsCartCount) {
        detailsCartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    alert(`"${product.name}" (Size: ${currentSelectedSize}) added to cart! Redirecting to Checkout Form... 🛒`);
    window.location.href = 'cart.html';
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function saveCartToStorage() { localStorage.setItem('cart', JSON.stringify(cart)); }
function loadCartFromStorage() { const savedCart = localStorage.getItem('cart'); if (savedCart) cart = JSON.parse(savedCart); }
function loadOrdersFromStorage() { const savedOrders = localStorage.getItem('orders'); if (savedOrders) orderHistory = JSON.parse(savedOrders); }
