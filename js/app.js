/**
 * दीपांशी फैशन वर्ल्ड - मुख्य जावास्क्रिप्ट फ़ाइल
 * प्रोडक्ट कार्ड में "View More" बटन के साथ
 */

async function loadProducts() {
    try {
        // 'products.json' फ़ाइल से डेटा खींचना
        const response = await fetch('products.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();
        const productContainer = document.getElementById('product-list');
        
        if (productContainer) {
            productContainer.innerHTML = ''; // पुराना कंटेंट साफ़ करना

            if (products.length === 0) {
                productContainer.innerHTML = '<p class="no-products">फिलहाल कोई प्रोडक्ट उपलब्ध नहीं है।</p>';
                return;
            }

            // हर एक प्रोडक्ट के लिए कार्ड तैयार करना
            products.forEach(product => {
                const productCard = `
                    <div class="product-card" data-category="${product.category || 'all'}">
                        <div class="product-image-box">
                            <a href="product-details.html?id=${product.id}">
                                <img src="${product.image}" alt="${product.name}" class="p-img" loading="lazy" onerror="this.src='images/Gemini.jpg';">
                            </a>
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-price">${product.price}</p>
                            
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

// पेज लोड होते ही फंक्शन को रन करना
document.addEventListener('DOMContentLoaded', loadProducts);
