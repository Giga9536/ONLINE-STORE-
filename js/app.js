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

// CSV पार्सर
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
        else current += char;
    }
    result.push(current.trim());
    return result.map(v => v.replace(/^"|"$/g, '').trim());
}

async function loadProducts() {
    const container = document.getElementById('product-list') || document.getElementById('product-container');
    if (!container) return;

    const sheetId = '1dAUsZm2emo96kRbFH6exyMHyK5HPVy9mHaqhY49c0nM';
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

    try {
        const response = await fetch(sheetUrl);
        const csvText = await response.text();
        const lines = csvText.split(/\r?\n/).slice(1);
        
        container.innerHTML = ''; 
        window.allProductsList = [];

        lines.forEach(line => {
            if (!line.trim()) return;
            const cols = parseCSVLine(line);
            
            const product = {
                name: cols[0] || 'Product',
                price: cols[1] || '1999',
                image: cols[3] || 'images/Gemini.jpg',
                id: cols[4] || '1',
                media: []
            };

            // मीडिया गैलरी सिंकर
            if (cols[3]) product.media.push({ "type": "image", "url": cols[3] });
            if (cols[5]) product.media.push({ "type": "image", "url": cols[5] });
            if (cols[6]) product.media.push({ "type": "image", "url": cols[6] });
            if (cols[7]) product.media.push({ "type": "video", "url": cols[7] });
            
            window.allProductsList.push(product);

            container.innerHTML += `
                <div class="product-card">
                    <div class="product-image-box">
                        <a href="product-details.html?id=${product.id}">
                            <img src="${product.image}" class="p-img" onerror="this.src='images/Gemini.jpg'">
                        </a>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-price">₹${product.price}</p>
                        <a href="product-details.html?id=${product.id}" class="btn btn-primary">View More</a>
                    </div>
                </div>`;
        });
    } catch (err) {
        container.innerHTML = `<p>डेटा लोड करने में समस्या: ${err.message}</p>`;
    }
}

// बाकी फंक्शन्स
function loadCartFromStorage() { const saved = localStorage.getItem('cart'); if (saved) cart = JSON.parse(saved); }
function loadOrdersFromStorage() { const saved = localStorage.getItem('orders'); if (saved) orderHistory = JSON.parse(saved); }
function updateCartCount() { const cartCount = document.getElementById('cart-count'); if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0); }
