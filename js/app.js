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

// सुरक्षित तरीके से CSV की एक लाइन को एरे में बदलने का यूनिवर्सल फंक्शन
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result.map(v => v.replace(/^"|"$/g, '').trim());
}

async function loadProducts() {
    try {
        const sheetId = '1dAUsZm2emo96kRbFH6exyMHyK5HPVy9mHaqhY49c0nM';
        const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

        const response = await fetch(sheetUrl);
        if (!response.ok) throw new Error(`Google Sheet Fetch Error! status: ${response.status}`);
        const csvText = await response.text();
        
        const lines = csvText.split(/\r?\n/);
        if (lines.length === 0) return;

        const headers = parseCSVLine(lines[0]);
        const productsData = [];

        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].trim();
            if (!currentLine) continue;
            
            const rowData = parseCSVLine(currentLine);
            const product = {};
            
            headers.forEach((header, index) => {
                product[header] = rowData[index] || '';
            });
            
            if (product.id) {
                product.id = parseInt(product.id);
                
                // मजबूत मीडिया गैलरी एरे सिंकर (सभी स्पेलिंग चेक की गई)
                product.media = [];
                if (product.image) product.media.push({ "type": "image", "url": product.image });
                if (product.image2) product.media.push({ "type": "image", "url": product.image2 });
                if (product.image3) product.media.push({ "type": "image", "url": product.image3 });
                if (product.image4) product.media.push({ "type": "image", "url": product.image4 });
                
                if (product.video) {
                    product.media.push({ "type": "video", "url": product.video.trim() });
                }
                
                productsData.push(product);
            }
        }

        window.allProductsList = productsData;

        // होमपेज ग्रिड रेंडरर (product-list और product-container दोनों का सपोर्ट)
        const productContainer = document.getElementById('product-list') || document.getElementById('product-container');
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
        
        let thumbnailsHtml = '<div class="thumbnail-slider-container" style="display: flex; gap: 8px; margin-top: 1rem; overflow-x: auto; white-space: nowrap; padding: 5px; justify-content: flex-start; align-items:center; max-width: 100%;">';
        
        product.media.forEach((med, idx) => {
            let pathStr = String(med.url).toLowerCase();
            if (med.type === 'video' || pathStr.includes('.mp4') || pathStr.includes('video')) {
                thumbnailsHtml += `
                    <div style="width: 60px; height: 75px; min-width: 60px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer; background: #2c3e50; display:flex; align-items:center; justify-content:center; font-size:1.3rem; color:white; flex-shrink:0;"
                         onclick="document.getElementById('main-media-box').innerHTML='<video src=\\'${med.url}\\' controls autoplay style=\\'width:100%; max-height:400px; object-fit:contain;\\'></video>'; this.parentElement.querySelectorAll('div, img').forEach(i=>i.style.borderColor='#ddd'); this.style.borderColor='#3498db';">
                         ▶️
                    </div>`;
            } else {
                thumbnailsHtml += `
                    <img src="${med.url}" 
                         alt="thumb-${idx}" 
                         style="width: 60px; height: 75px; min-width: 60px; object-fit: cover; border: 2px solid ${idx === 0 ? '#3498db' : '#ddd'}; border-radius: 4px; cursor: pointer; background: #fff; flex-shrink:0;"
                         onclick="document.getElementById('main-media-box').innerHTML='<img id=\\'main-detail-img\\' src=\\'${med.url}\\' style=\\'width:100%; max-height:400px; object-fit:contain\\'>'; this.parentElement.querySelectorAll('div, img').forEach(i=>i.style.borderColor='#ddd'); this.style.borderColor='#3498db';"
                         onerror="this.src='images/Gemini.jpg';"
                    >`;
            }
        });
        thumbnailsHtml += '</div>';
        mediaHtml = mainMediaHtml + thumbnailsHtml;
    } else {
        mediaHtml = `<img src="${product.image}" alt="${product.name}" onerror="this.src='images/Gemini.jpg';" style="width:100%; max-height:400px; object-fit:contain; border-radius: 8px;">`;
    }

    // ... (बाकी फंक्शनलिटी वैसी ही रहेगी)
    detailContainer.innerHTML = `
        <div style="grid-column: span 2; text-align: right; margin-bottom: 1rem;">
            <a href="cart.html" class="details-page-cart">
                🛒 View Cart <span id="details-cart-count" class="cart-count">0</span>
            </a>
        </div>
        <div class="detail-image-box">${mediaHtml}</div>
        <div class="detail-info-box">
            <h1 class="detail-title">${product.name}</h1>
            <p class="detail-desc">${product.description || 'Premium quality outfit.'}</p>
        </div>
    `;
}
