/**
 * दीपांशी फैशन वर्ल्ड - मुख्य जावास्क्रिप्ट फ़ाइल
 */

async function loadProducts() {
    try {
        const response = await fetch('products.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();
        const productContainer = document.getElementById('product-list');
        
        if (productContainer) {
            productContainer.innerHTML = ''; 

            if (products.length === 0) {
                productContainer.innerHTML = '<p class="no-products">फिलहाल कोई प्रोडक्ट उपलब्ध नहीं है।</p>';
                return;
            }

            products.forEach(product => {
                const productCard = `
                    <div class="product-card" data-category="${product.category || 'all'}">
                        <div class="product-image-box">
                            <img src="${product.image}" alt="${product.name}" class="p-img" loading="lazy" onerror="this.src='images/Gemini.jpg';">
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-price">${product.price}</p>
                            <button class="btn btn-primary" onclick="orderOnWhatsApp('${product.name}', '${product.price}')">
                                अभी खरीदें
                            </button>
                        </div>
                    </div>
                `;
                productContainer.innerHTML += productCard;
            });
            console.log("सभी प्रोडक्ट्स लोड हो गए!");
        }
    } catch (error) {
        console.error("प्रॉडक्ट लोड करने में समस्या आई:", error);
    }
}

function orderOnWhatsApp(productName, productPrice) {
    const whatsappNumber = "91XXXXXXXXXX"; // यहाँ अपना असली नंबर डालें
    const message = `नमस्ते दीपांशी फैशन वर्ल्ड, मुझे यह प्रोडक्ट खरीदना है:\n\n📌 नाम: ${productName}\n💰 कीमत: ${productPrice}\n\nकृपया इसकी उपलब्धता की पुष्टि करें।`;
    const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}

document.addEventListener('DOMContentLoaded', loadProducts);
