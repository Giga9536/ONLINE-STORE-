let cart = [];
window.allProductsList = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
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
        lines.forEach(line => {
            if (!line.trim()) return;
            const cols = line.split(',');
            const pName = cols[0] ? cols[0].replace(/"/g, '').trim() : 'Product';
            const pPrice = cols[1] ? cols[1].replace(/"/g, '').trim() : '1999';
            const pImg = cols[3] ? cols[3].replace(/"/g, '').trim() : 'images/Gemini.jpg';
            const pId = cols[4] ? cols[4].replace(/"/g, '').trim() : '1';

            container.innerHTML += `
                <div class="product-card">
                    <div class="product-image-box">
                        <a href="product-details.html?id=${pId}">
                            <img src="${pImg}" class="p-img" onerror="this.src='images/Gemini.jpg'">
                        </a>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${pName}</h3>
                        <p class="product-price">₹${pPrice}</p>
                        <a href="product-details.html?id=${pId}" class="btn btn-primary">View More</a>
                    </div>
                </div>`;
        });
    } catch (err) {
        container.innerHTML = `<p>डेटा लोड करने में समस्या: ${err.message}</p>`;
    }
}
