// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', () => {
    // Sepet işlemleri
    const cart = [];
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const closeButton = document.querySelector('.close');
    const cartItems = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartCount = document.querySelector('.cart-count');
    const checkoutButton = document.getElementById('checkout-btn');
    const orderNotes = document.getElementById('order-notes');
    
    // Sipariş onay modalı
    const orderConfirmModal = document.getElementById('order-confirm-modal');
    const orderNumber = document.getElementById('order-number');
    const orderItems = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');
    const paymentMethod = document.getElementById('payment-method');
    const preparationTime = document.getElementById('preparation-time');
    const printReceiptButton = document.getElementById('print-receipt');
    const closeOrderButton = document.getElementById('close-order');
    
    // Menü arama
    const menuSearch = document.getElementById('menu-search');
    
    // Sepeti aç/kapat
    cartButton.addEventListener('click', (e) => {
        e.preventDefault();
        cartModal.classList.add('show');
    });
    
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            cartModal.classList.remove('show');
            orderConfirmModal.classList.remove('show');
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('show');
        }
        if (e.target === orderConfirmModal) {
            orderConfirmModal.classList.remove('show');
        }
    });
    
    // Menü arama fonksiyonu
    menuSearch.addEventListener('input', () => {
        const searchTerm = menuSearch.value.toLowerCase();
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            const itemName = item.querySelector('h3').textContent.toLowerCase();
            const itemDesc = item.querySelector('p').textContent.toLowerCase();
            
            if (itemName.includes(searchTerm) || itemDesc.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    // Sepete ürün ekle fonksiyonu
    function addToCart(item) {
        const existingItem = cart.find(cartItem => 
            cartItem.name === item.name && 
            cartItem.size === item.size && 
            JSON.stringify(cartItem.extras) === JSON.stringify(item.extras)
        );

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                name: item.name,
                price: item.price,
                size: item.size,
                extras: item.extras,
                quantity: 1,
                description: `${item.name} (${item.size})${item.extras.length ? ' + ' + item.extras.join(', ') : ''}`
            });
        }

        updateCart();
    }

    // Bildirim göster fonksiyonu
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    // Sepete ekle butonuna tıklandığında
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.menu-item');
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));
            const sizeSelect = menuItem.querySelector('.size-select');
            const size = sizeSelect ? sizeSelect.value : 'normal';
            
            // Seçili ekstraları topla
            const extras = [];
            const checkboxes = menuItem.querySelectorAll('input[type="checkbox"]:checked');
            checkboxes.forEach(checkbox => {
                extras.push(checkbox.getAttribute('data-extra'));
            });
            
            // Sepete ekle
            addToCart({
                name: name,
                price: price,
                size: size,
                extras: extras
            });
            
            // Bildirim göster
            showNotification(`${name} sepete eklendi!`);
        });
    });
    
    // Sepeti güncelle
    function updateCart() {
        cartItems.innerHTML = '';
        let subtotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-details">
                    <div>${item.description}</div>
                    <div class="cart-item-options">${item.quantity} adet</div>
                </div>
                <div>
                    <span>₺${itemTotal.toFixed(2)}</span>
                    <button class="remove-item" data-index="${cart.indexOf(item)}">Sil</button>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
        
        const tax = subtotal * 0.18;
        const total = subtotal + tax;
        
        cartSubtotal.textContent = `₺${subtotal.toFixed(2)}`;
        cartTax.textContent = `₺${tax.toFixed(2)}`;
        cartTotalPrice.textContent = `₺${total.toFixed(2)}`;
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    // Sepetten ürün sil
    cartItems.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const index = parseInt(e.target.dataset.index);
            cart.splice(index, 1);
            updateCart();
        }
    });
    
    // Kredi kartı form kontrolü
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    const creditCardForm = document.getElementById('credit-card-form');
    const cardNumber = document.getElementById('card-number');
    const cardExpiry = document.getElementById('card-expiry');
    const cardCvv = document.getElementById('card-cvv');

    // Ödeme yöntemi seçimi
    paymentMethods.forEach(method => {
        method.addEventListener('change', (e) => {
            if (e.target.value === 'credit') {
                creditCardForm.style.display = 'block';
                e.target.closest('.payment-method').classList.add('selected');
                document.querySelector('.payment-method input[value="cash"]').closest('.payment-method').classList.remove('selected');
            } else {
                creditCardForm.style.display = 'none';
                e.target.closest('.payment-method').classList.add('selected');
                document.querySelector('.payment-method input[value="credit"]').closest('.payment-method').classList.remove('selected');
            }
        });
    });

    // Kredi kartı numarası formatı
    cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = value.substring(0, 19);
    });

    // Son kullanma tarihi formatı
    cardExpiry.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        e.target.value = value.substring(0, 5);
    });

    // CVV formatı
    cardCvv.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
    });

    // Kredi kartı validasyonu
    function validateCreditCard() {
        let isValid = true;
        const errors = {};

        // Kart numarası kontrolü
        const cardNumberValue = cardNumber.value.replace(/\s/g, '');
        if (cardNumberValue.length !== 16) {
            isValid = false;
            errors.cardNumber = 'Geçerli bir kart numarası giriniz';
            cardNumber.classList.add('error');
        } else {
            cardNumber.classList.remove('error');
        }

        // Son kullanma tarihi kontrolü
        const expiryValue = cardExpiry.value;
        if (!expiryValue.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
            isValid = false;
            errors.cardExpiry = 'Geçerli bir son kullanma tarihi giriniz';
            cardExpiry.classList.add('error');
        } else {
            const [month, year] = expiryValue.split('/');
            const now = new Date();
            const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
            if (expiry < now) {
                isValid = false;
                errors.cardExpiry = 'Kartınızın süresi dolmuş';
                cardExpiry.classList.add('error');
            } else {
                cardExpiry.classList.remove('error');
            }
        }

        // CVV kontrolü
        if (cardCvv.value.length !== 3) {
            isValid = false;
            errors.cardCvv = 'Geçerli bir CVV giriniz';
            cardCvv.classList.add('error');
        } else {
            cardCvv.classList.remove('error');
        }

        return { isValid, errors };
    }

    // Sipariş ver butonuna tıklandığında
    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Sepetiniz boş!');
            return;
        }

        const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
        
        if (selectedPayment === 'credit') {
            const { isValid, errors } = validateCreditCard();
            if (!isValid) {
                let errorMessage = 'Lütfen kredi kartı bilgilerini kontrol ediniz:\n';
                Object.values(errors).forEach(error => {
                    errorMessage += `- ${error}\n`;
                });
                alert(errorMessage);
                return;
            }
        }

        // Ödeme yöntemini al
        const paymentText = selectedPayment === 'cash' ? 'Nakit' : 'Kredi Kartı';
        
        // Sipariş numarası oluştur
        const orderId = 'ORD' + Math.floor(Math.random() * 1000000);
        
        // Sipariş detaylarını göster
        orderNumber.textContent = orderId;
        orderItems.innerHTML = '';
        
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <div>${item.description} x ${item.quantity}</div>
                <div>₺${itemTotal.toFixed(2)}</div>
            `;
            orderItems.appendChild(orderItem);
        });
        
        const tax = total * 0.18;
        const finalTotal = total + tax;
        
        orderTotal.textContent = `₺${finalTotal.toFixed(2)}`;
        paymentMethod.textContent = paymentText;
        
        // Tahmini hazırlanma süresi
        const prepTime = Math.max(5, cart.reduce((sum, item) => sum + item.quantity, 0) * 2);
        preparationTime.textContent = prepTime;
        
        // Sepeti temizle ve modalı kapat
        cartModal.classList.remove('show');
        
        // Sipariş onay modalını göster
        orderConfirmModal.classList.add('show');

        // Kredi kartı formunu temizle
        if (selectedPayment === 'credit') {
            cardNumber.value = '';
            cardExpiry.value = '';
            cardCvv.value = '';
            creditCardForm.style.display = 'none';
        }
    });
    
    // Menü kategorileri
    const categoryButtons = document.querySelectorAll('.category-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            menuItems.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Smooth scroll
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Scroll olayını dinle ve navbar'ı güncelle
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.style.backgroundColor = 'rgba(44, 24, 16, 0.9)';
        } else {
            nav.style.backgroundColor = '#2c1810';
        }
    });
    
    // Bildirim stili
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #d4a373;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        }
        
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(20px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);

    // Fiş yazdırma fonksiyonu
    function printReceipt() {
        const receiptWindow = window.open('', '_blank');
        const currentDate = new Date().toLocaleString('tr-TR');
        
        const receiptContent = `
            <html>
            <head>
                <title>Fiş - ${orderNumber.textContent}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
                    
                    body {
                        font-family: 'Poppins', sans-serif;
                        padding: 40px;
                        max-width: 400px;
                        margin: 0 auto;
                        background-color: #fff;
                        color: #2c1810;
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #d4a373;
                        padding-bottom: 20px;
                    }
                    
                    .header h2 {
                        font-size: 32px;
                        color: #2c1810;
                        margin: 0 0 10px 0;
                        font-weight: 600;
                    }
                    
                    .header p {
                        margin: 5px 0;
                        color: #666;
                        font-size: 14px;
                    }
                    
                    .items {
                        margin: 30px 0;
                    }
                    
                    .item {
                        display: flex;
                        justify-content: space-between;
                        margin: 12px 0;
                        font-size: 15px;
                        color: #444;
                    }
                    
                    .item-name {
                        flex: 1;
                        padding-right: 20px;
                    }
                    
                    .item-price {
                        font-weight: 500;
                        color: #2c1810;
                    }
                    
                    .total {
                        border-top: 2px solid #d4a373;
                        margin-top: 30px;
                        padding-top: 20px;
                    }
                    
                    .total .item {
                        font-size: 16px;
                        font-weight: 500;
                        color: #2c1810;
                    }
                    
                    .payment-info {
                        margin: 20px 0;
                        padding: 15px;
                        background-color: #faf3e0;
                        border-radius: 8px;
                    }
                    
                    .payment-info .item {
                        color: #2c1810;
                    }
                    
                    .footer {
                        text-align: center;
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px dashed #d4a373;
                    }
                    
                    .footer p {
                        margin: 5px 0;
                        color: #666;
                        font-size: 14px;
                    }
                    
                    .logo {
                        font-size: 40px;
                        color: #d4a373;
                        margin-bottom: 20px;
                    }
                    
                    .order-info {
                        background-color: #2c1810;
                        color: #fff;
                        padding: 10px 20px;
                        border-radius: 25px;
                        display: inline-block;
                        margin: 10px 0;
                        font-size: 14px;
                    }
                    
                    @media print {
                        body {
                            padding: 20px;
                        }
                        
                        .payment-info {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            background-color: #faf3e0 !important;
                        }
                        
                        .order-info {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            background-color: #2c1810 !important;
                            color: #fff !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">☕</div>
                    <h2>ROASTED.</h2>
                    <div class="order-info">
                        Sipariş No: ${orderNumber.textContent}
                    </div>
                    <p>${currentDate}</p>
                </div>
                
                <div class="items">
                    ${Array.from(orderItems.children).map(item => `
                        <div class="item">
                            <span class="item-name">${item.children[0].textContent}</span>
                            <span class="item-price">${item.children[1].textContent}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="total">
                    <div class="item">
                        <strong>Ara Toplam</strong>
                        <span>${cartSubtotal.textContent}</span>
                    </div>
                    <div class="item">
                        <strong>KDV (%18)</strong>
                        <span>${cartTax.textContent}</span>
                    </div>
                    <div class="item" style="font-size: 18px; margin-top: 10px;">
                        <strong>Toplam</strong>
                        <strong>${orderTotal.textContent}</strong>
                    </div>
                </div>
                
                <div class="payment-info">
                    <div class="item">
                        <span>Ödeme Yöntemi</span>
                        <strong>${paymentMethod.textContent}</strong>
                    </div>
                    <div class="item">
                        <span>Tahmini Hazırlanma Süresi</span>
                        <strong>${preparationTime.textContent} dakika</strong>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Bizi tercih ettiğiniz için teşekkür ederiz!</p>
                    <p style="font-size: 16px; margin-top: 10px;">Afiyet olsun ☕</p>
                    <p style="margin-top: 20px; font-size: 12px; color: #999;">
                        www.roasted.com | Tel: (0212) 555 55 55
                    </p>
                </div>
            </body>
            </html>
        `;
        
        receiptWindow.document.write(receiptContent);
        receiptWindow.document.close();
        setTimeout(() => {
            receiptWindow.print();
        }, 500);
    }

    // Fiş yazdır butonuna tıklandığında
    printReceiptButton.addEventListener('click', printReceipt);

    // Tamam butonuna tıklandığında
    closeOrderButton.addEventListener('click', () => {
        orderConfirmModal.classList.remove('show');
        // Sepeti temizle
        cart.length = 0;
        updateCart();
    });

    function updateItemPrice(menuItem) {
        const sizeSelect = menuItem.querySelector('.size-select');
        const checkboxes = menuItem.querySelectorAll('input[type="checkbox"]');
        const priceDisplay = menuItem.querySelector('.price');
        const addToCartBtn = menuItem.querySelector('.add-to-cart');

        let basePrice = parseInt(sizeSelect.options[sizeSelect.selectedIndex].getAttribute('data-price'));
        let totalPrice = basePrice;

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                totalPrice += parseInt(checkbox.getAttribute('data-price'));
            }
        });

        priceDisplay.textContent = `₺${totalPrice}`;
        addToCartBtn.setAttribute('data-price', totalPrice);
    }

    // Size değişikliğini dinle
    document.querySelectorAll('.size-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const menuItem = e.target.closest('.menu-item');
            updateItemPrice(menuItem);
        });
    });

    // Checkbox değişikliğini dinle
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const menuItem = e.target.closest('.menu-item');
            updateItemPrice(menuItem);
        });
    });
}); 