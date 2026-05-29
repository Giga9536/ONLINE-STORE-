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
        displayOrderHistory();
    }
    if (document.getElementById('product-detail-content')) {
        triggerProductDetailsRender();
    }
});

async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const productsData = await response.json();
        window.allProductsList = productsData;

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

    // 🔥 ऑटोमैटिक बेस्ट सेलर रेंडरर लॉजिक
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
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="addToCart(${product.id})">🛒 Add to Cart</button>
            </div>
        </div>

        <div class="bestseller-section" style="grid-column: span 2;">
            <h3 class="bestseller-title">🔥 Our Best Sellers</h3>
            <div class="bestseller-slider">${bestsellerCardsHtml}</div>
        </div>

        <div class="reviews-section" style="grid-column: span 2;">
            <h3 class="bestseller-title" style="border-left-color: #27ae60;">🌟 Customer Reviews</h3>
            <div class="review-box">
                <div class="review-header">
                    <span class="reviewer-name">प्रिया शर्मा</span>
                    <span class="review-stars">⭐⭐⭐⭐⭐</span>
                </div>
                <p class="review-comment">कपड़े का फैब्रिक और कढ़ाई बहुत ही सुंदर है। फिटिंग एकदम परफेक्ट आई, थैंक यू दीपांशी फैशन वर्ल्ड!</p>
            </div>
            <div class="review-box">
                <div class="review-header">
                    <span class="reviewer-name">अंजलि वर्मा</span>
                    <span class="review-stars">⭐⭐⭐⭐⭐</span>
                </div>
                <p class="review-comment">मैंने पहली बार वीडियो थंबनेल देखकर ऑर्डर किया था, जैसा वीडियो में सूट दिखा बिल्कुल वैसा ही मिला।</p>
            </div>
        </div>
    `;
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
    saveCartToStorage();
    updateCartCount();
    
    const detailsCartCount = document.getElementById('details-cart-count');
    if (detailsCartCount) {
        detailsCartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    alert(`Product added to cart successfully!`);
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function saveCartToStorage() { localStorage.setItem('cart', JSON.stringify(cart)); }
function loadCartFromStorage() { const savedCart = localStorage.getItem('cart'); if (savedCart) cart = JSON.parse(savedCart); }
function loadOrdersFromStorage() { const savedOrders = localStorage.getItem('orders'); if (savedOrders) orderHistory = JSON.parse(savedOrders); }
