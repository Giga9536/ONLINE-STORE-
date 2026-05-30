// JS: मास्टर कोड (इसे सुरक्षित रखें)
window.allProductsList = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
});

async function loadProducts() {
    const sheetId = '1dAUsZm2emo96kRbFH6exyMHyK5HPVy9mHaqhY49c0nM';
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

    try {
        const response = await fetch(sheetUrl);
        const csvText = await response.text();
        const lines = csvText.split(/\r?\n/).slice(1);
        
        const container = document.getElementById('product-list');
        if (!container) return;
        
        container.innerHTML = '';
        lines.forEach(line => {
            const cols = line.split(',');
            if (cols.length < 2) return;
            
            const pName = cols[0].replace(/"/g, '');
            const pImg = cols[3] ? cols[3].replace(/"/g, '') : 'images/Gemini.jpg';
            
            container.innerHTML += `
                <div class="product-card">
                    <img src="${pImg}" class="p-img" onerror="this.src='images/Gemini.jpg'">
                    <h3 class="product-name">${pName}</h3>
                    <p class="product-price">₹1,999</p>
                    <a href="product-details.html" class="btn btn-primary">View Details</a>
                </div>
            `;
        });
    } catch (e) {
        console.error("Error:", e);
    }
}
