/**
 * दीपांशी फैशन वर्ल्ड - मुख्य जावास्क्रिप्ट फ़ाइल
 * यह कोड बिना मुख्य फ़ाइल को बदले 'products.json' से प्रोडक्ट्स लोड करता है।
 */

// 1. JSON फाइल से प्रोडक्ट्स का डेटा लोड करने वाला मुख्य फंक्शन
async function loadProducts() {
    try {
        // 'products.json' फ़ाइल से डेटा खींचना (Fetch करना)
        const response = await fetch('products.json');
        
        // अगर फ़ाइल लोड होने में कोई समस्या हो तो एरर दिखाएँ
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // डेटा को JSON फॉर्मेट में बदलना
        const products = await response.json();
        
        // HTML के उस हिस्से (Container) को चुनना जहाँ प्रोडक्ट्स दिखाने हैं
        const productContainer = document.getElementById('product-list');
        
        // सुरक्षा के लिए पहले से मौजूद पुराना कंटेंट साफ़ करना
        productContainer.innerHTML = ''; 

        // यदि कोई प्रोडक्ट न मिले तो स्क्रीन पर मैसेज दिखाना
        if (products.length === 0) {
            productContainer.innerHTML = '<p class="no-products">फिलहाल कोई प्रोडक्ट उपलब्ध नहीं है।</p>';
            return;
        }

        // हर एक प्रोडक्ट के लिए ऑटोमैटिक HTML कार्ड (Design) तैयार करना
        products.forEach(product => {
            const productCard = `
                <div class="product-card" data-category="${product.category || 'all'}">
                    <div class="product-img-box">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-price">${product.price}</p>
                        <button class="buy-btn" onclick="orderOnWhatsApp('${product.name}', '${product.price}')">
                            अभी खरीदें
                        </button>
                    </div>
                </div>
            `;
            // तैयार कार्ड को वेबसाइट के पेज पर एक-एक करके जोड़ते जाना
            productContainer.innerHTML += productCard;
        });

        console.log("सभी प्रोडक्ट्स सफलतापूर्वक लोड हो गए हैं!");

    } catch (error) {
        console.error("प्रॉडक्ट लोड करने में समस्या आई:", error);
        // यूजर को स्क्रीन पर एरर मैसेज दिखाना ताकि वेबसाइट खाली न लगे
        const productContainer = document.getElementById('product-list');
        if (productContainer) {
            productContainer.innerHTML = '<p class="error-msg">प्रोडक्ट्स लोड करने में कुछ तकनीकी दिक्कत आ रही है। कृपया बाद में प्रयास करें।</p>';
        }
    }
}

// 2. (वैकल्पिक) व्हाट्सएप पर ऑर्डर भेजने का एक प्रोफेशनल फंक्शन
function orderOnWhatsApp(productName, productPrice) {
    // यहाँ अपना बिज़नेस व्हाट्सएप नंबर डालें (बिना + या 0 के, जैसे: 919876543210)
    const whatsappNumber = "91XXXXXXXXXX"; 
    
    // व्हाट्सएप पर जाने वाला ऑटोमैटिक मैसेज
    const message = `नमस्ते दीपांशी फैशन वर्ल्ड, मुझे यह प्रोडक्ट खरीदना है:\n\n📌 नाम: ${productName}\n💰 कीमत: ${productPrice}\n\nकृपया इसकी उपलब्धता की पुष्टि करें।`;
    
    // लिंक को सही फॉर्मेट में एनकोड करना
    const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
    
    // नए टैब में व्हाट्सएप चैट खोलना
    window.open(whatsappURL, '_blank');
}

// 3. वेबसाइट का पेज जैसे ही पूरी तरह लोड होगा, यह कोड अपने आप रन हो जाएगा
document.addEventListener('DOMContentLoaded', loadProducts);
