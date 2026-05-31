let cart = [];
window.allProductsList = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    // यदि हम डिटेल्स पेज पर हैं, तो रेंडर शुरू करें
    if (document.getElementById('product-detail-content')) {
        triggerProductDetailsRender();
    }
});

async function loadProducts() {
    const container = document.getElementById('product-list');
    if (!container) return;

    const sheetId = '1dAUsZm2emo96kRbFH6exyMHyK5HPVy9mHaqhY49c0nM';
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

    try {
        const response = await fetch(sheetUrl);
        const csvText = await response.text();
        const lines = csvText.split(/\r?\n/).slice(1);
        
        container.innerHTML = ''; 
        window.allProductsList = []; // ग्लोबल लिस्ट को रिसेट करें

        lines.forEach((line, index) => {
            if (!line.trim()) return;
            const cols = line.split(',');
            
            const product = {
                name: cols[0] ? cols[0].replace(/"/g, '').trim() : 'Product',
                price: cols[1] ? cols[1].replace(/"/g, '').trim() : '1999',
                image: cols[3] ? cols[3].replace(/"/g, '').trim() : 'images/Gemini.jpg',
                id: index + 1 // इंडेक्स के आधार पर सही आईडी
            };
            
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

// डिटेल्स रेंडरिंग फ़ंक्शन जो एरर दे रहा था
function triggerProductDetailsRender() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = window.allProductsList.find(p => p.id === productId);
    
    const detailContainer = document.getElementById('product-detail-content');
    if (detailContainer && product) {
        detailContainer.innerHTML = `
            <h1>${product.name}</h1>
            <img src="${product.image}" style="width:100%">
            <p>Price: ₹${product.price}</p>
        `;
    }
}
