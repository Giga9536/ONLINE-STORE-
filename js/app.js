let cart = [];
window.allProductsList = [];

document.addEventListener('DOMContentLoaded', async () => {
    // सबसे पहले डेटा लोड करें
    await loadProducts();
    
    // अगर हम डिटेल्स पेज पर हैं, तो रेंडर शुरू करें
    if (document.getElementById('product-detail-content')) {
        renderProductDetails();
    }
});

async function loadProducts() {
    const sheetId = '1dAUsZm2emo96kRbFH6exyMHyK5HPVy9mHaqhY49c0nM';
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

    try {
        const response = await fetch(sheetUrl);
        const csvText = await response.text();
        const lines = csvText.split(/\r?\n/).slice(1);
        
        window.allProductsList = lines.map((line, index) => {
            const cols = line.split(',');
            return {
                id: index + 1,
                name: cols[0] ? cols[0].replace(/"/g, '').trim() : 'Product',
                price: cols[1] ? cols[1].replace(/"/g, '').trim() : '1999',
                image: cols[3] ? cols[3].replace(/"/g, '').trim() : 'images/Gemini.jpg'
            };
        });

        // होम पेज के लिए रेंडरिंग
        const list = document.getElementById('product-list');
        if (list) {
            list.innerHTML = window.allProductsList.map(p => `
                <div class="product-card">
                    <img src="${p.image}" class="p-img" onerror="this.src='images/Gemini.jpg'">
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <p>₹${p.price}</p>
                        <a href="product-details.html?id=${p.id}" class="btn btn-primary">View More</a>
                    </div>
                </div>`).join('');
        }
    } catch (err) { console.error("Load Error:", err); }
}

function renderProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = window.allProductsList.find(p => p.id === productId);
    
    const container = document.getElementById('product-detail-content');
    
    // अगर डेटा अभी तक लोड नहीं हुआ है, तो 300ms रुककर दोबारा कोशिश करें
    if (!product) {
        setTimeout(renderProductDetails, 300);
        return;
    }

    container.innerHTML = `
        <div class="detail-container" style="text-align:center;">
            <img src="${product.image}" style="width:100%; max-width:400px; border-radius:10px;">
            <h1>${product.name}</h1>
            <p style="font-size: 1.5rem; color:#e67e22;">₹${product.price}</p>
        </div>
    `;
}
