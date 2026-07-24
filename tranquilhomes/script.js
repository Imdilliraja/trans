// ===================== HIDE .html FROM URL =====================
(function () {
    // On load: if URL has .html, replace with clean URL; hide index too
    var path = window.location.pathname;
    if (path.endsWith('.html')) {
        var clean = path.replace('.html', '');
        // Hide index → root
        if (clean.endsWith('/index')) {
            clean = clean.replace('/index', '/');
        }
        window.history.replaceState({}, '', clean);
    } else if (path.endsWith('/index')) {
        window.history.replaceState({}, '', path.replace('/index', '/'));
    }

    // On reload/refresh: navigate to .html version so server can find it
    window.addEventListener('keydown', function (e) {
        if ((e.key === 'F5') || (e.ctrlKey && e.key === 'r') || (e.ctrlKey && e.key === 'R')) {
            e.preventDefault();
            var p = window.location.pathname;
            // Restore index for home page
            if (p === '/' || p.endsWith('/')) {
                window.location.href = p + 'index.html';
            } else if (!p.endsWith('.html')) {
                window.location.href = p + '.html';
            } else {
                window.location.reload();
            }
        }
    });

    // Also handle browser reload button via beforeunload
    window.addEventListener('beforeunload', function () {
        var p = window.location.pathname;
        if (!p.endsWith('.html') && !p.endsWith('/')) {
            try { window.history.replaceState({}, '', p + '.html'); } catch (e) {}
        } else if (p.endsWith('/')) {
            try { window.history.replaceState({}, '', p + 'index.html'); } catch (e) {}
        }
    });
})();

// ===================== PROGRESSIVE IMAGE LOADING =====================
(function () {
    document.querySelectorAll('img[data-prog-src]').forEach(function (img) {
        var highSrc = img.getAttribute('data-prog-src');
        if (!highSrc) return;

        img.classList.add('blur');
        img.style.opacity = '0.7';

        var tempImg = new Image();
        tempImg.onload = function () {
            img.src = highSrc;
            img.classList.remove('blur');
            img.classList.add('loaded');
            img.style.opacity = '1';
        };
        tempImg.src = highSrc;
    });

    document.querySelectorAll('.prog-wrap').forEach(function (wrap) {
        var placeholder = wrap.querySelector('.prog-placeholder');
        var fullImg = wrap.querySelector('.prog-full');
        if (!placeholder || !fullImg) return;

        var highSrc = fullImg.getAttribute('data-prog-src');
        if (!highSrc) return;

        var tempImg = new Image();
        tempImg.onload = function () {
            fullImg.src = highSrc;
            fullImg.classList.add('show');
            placeholder.classList.add('hide');
        };
        tempImg.src = highSrc;
    });
})();

// ===================== HERO SLIDER =====================
(function () {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    if (!slides.length) return;
    let current = 0;
    let autoPlayInterval;

    function goToSlide(index) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
    }

    function nextSlide() { goToSlide(current + 1); }
    function prevSlide() { goToSlide(current - 1); }
    function startAutoPlay() { autoPlayInterval = setInterval(nextSlide, 5000); }
    function stopAutoPlay() { clearInterval(autoPlayInterval); }

    if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoPlay(); nextSlide(); startAutoPlay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoPlay(); prevSlide(); startAutoPlay(); });
    dots.forEach(dot => {
        dot.addEventListener('click', () => { stopAutoPlay(); goToSlide(parseInt(dot.dataset.index)); startAutoPlay(); });
    });
    startAutoPlay();
})();

// ===================== MOBILE NAV =====================
(function () {
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('mobileNavOverlay');
    const closeBtn = document.getElementById('mobileNavClose');
    if (hamburger && overlay && closeBtn) {
        hamburger.addEventListener('click', () => overlay.classList.add('active'));
        closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
        overlay.querySelectorAll('a').forEach(link => { link.addEventListener('click', () => overlay.classList.remove('active')); });
    }
})();

// ===================== HEADER SCROLL =====================
(function () {
    const header = document.querySelector('.site-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.style.boxShadow = window.scrollY > 50 ? '0 4px 30px rgba(0,0,0,0.12)' : '0 2px 20px rgba(0,0,0,0.08)';
    });
})();

// ===================== SMOOTH SCROLL =====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});

// ===================== PAYMENT POPUP =====================
(function () {
    const trigger = document.getElementById('paymentTrigger');
    const popup = document.getElementById('paymentPopup');
    const closeBtn = document.getElementById('popupClose');
    if (trigger && popup && closeBtn) {
        trigger.addEventListener('click', () => popup.classList.add('active'));
        closeBtn.addEventListener('click', () => popup.classList.remove('active'));
        popup.addEventListener('click', (e) => { if (e.target === popup) popup.classList.remove('active'); });
    }
})();

// ===================== LIGHTBOX =====================
(function () {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    if (lightbox && lightboxImg) {
        document.querySelectorAll('.restaurant-gallery img, .gallery-grid img').forEach(img => {
            img.addEventListener('click', () => { lightboxImg.src = img.src; lightbox.classList.add('active'); document.body.style.overflow = 'hidden'; });
        });
        if (lightboxClose) lightboxClose.addEventListener('click', () => { lightbox.classList.remove('active'); document.body.style.overflow = ''; });
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) { lightbox.classList.remove('active'); document.body.style.overflow = ''; } });
    }
})();

// ===================== CONTACT FORM (Saves to localStorage) =====================
(function () {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = form.querySelector('input[type="text"]').value.trim();
        const email = form.querySelector('input[type="email"]').value.trim();
        const message = form.querySelector('textarea').value.trim();
        const phone = form.querySelector('input[type="tel"]')?.value.trim() || '';
        if (!name || !email || !message) return;
        const messages = JSON.parse(localStorage.getItem('th_messages') || '[]');
        messages.push({ id: 'm_' + Date.now(), name, email, phone, message, date: new Date().toISOString(), read: false });
        localStorage.setItem('th_messages', JSON.stringify(messages));
        form.reset();
        showToast('Message sent successfully! We will get back to you soon.');
    });
})();

// ===================== TOAST NOTIFICATION =====================
function showToast(msg, type) {
    let toast = document.getElementById('siteToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'siteToast';
        toast.className = 'site-toast';
        toast.innerHTML = '<i class="fas fa-check-circle"></i><span></span>';
        document.body.appendChild(toast);
    }
    toast.querySelector('span').textContent = msg;
    toast.querySelector('i').className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
    toast.className = 'site-toast active' + (type === 'error' ? ' error' : '');
    setTimeout(() => toast.classList.remove('active'), 3500);
}
window.showToast = showToast;

// ===================== IMAGE ERROR HANDLER =====================
function handleImageError(img) {
    if (img.dataset.errorHandled) return;
    img.dataset.errorHandled = 'true';
    const parent = img.parentElement;
    if (parent) {
        parent.style.background = 'linear-gradient(135deg, #f0fdf4, #e8f5e9)';
        parent.style.display = 'flex';
        parent.style.alignItems = 'center';
        parent.style.justifyContent = 'center';
    }
    img.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.innerHTML = '<i class="fas fa-image"></i><span>No Image</span>';
    if (parent) parent.appendChild(placeholder);
}

document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function () { handleImageError(this); });
});

// ===================== PRODUCTS (Live from Admin) =====================
(function () {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    function getProducts() {
        try { return JSON.parse(localStorage.getItem('th_products') || '[]'); } catch (e) { return []; }
    }

    function renderProducts(filter) {
        if (!productsGrid) return;
        const products = getProducts();
        const activeProducts = products.filter(p => p.status === 'active');
        const filtered = filter === 'all' ? activeProducts : activeProducts.filter(p => p.category === filter);

        if (filtered.length === 0) {
            productsGrid.innerHTML = `
                <div class="products-empty">
                    <i class="fas fa-box-open"></i>
                    <p>No products available${filter !== 'all' ? ' in this category' : ''}</p>
                    <span>Products added from the admin panel will appear here</span>
                    <a href="admin-login.html" class="btn-admin-access"><i class="fas fa-cog"></i> Admin Panel</a>
                </div>`;
            return;
        }

        const isAdmin = sessionStorage.getItem('adminLoggedIn') === 'true';

        productsGrid.innerHTML = filtered.map(p => `
            <div class="product-card" data-category="${p.category}" data-id="${p.id}">
                <div class="product-image">
                    <img src="${p.image || ''}" alt="${p.name}" onerror="handleImageError(this)">
                    <span class="product-category-tag">${getCategoryLabel(p.category)}</span>
                    ${isAdmin ? `<div class="product-admin-actions">
                        <a href="admin.html" class="product-edit-btn" title="Edit in Admin"><i class="fas fa-edit"></i></a>
                        <button class="product-delete-btn" data-id="${p.id}" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>` : ''}
                </div>
                <div class="product-body">
                    <h3 class="product-title">${p.name}</h3>
                    <p class="product-desc">${p.description || 'No description available'}</p>
                    ${p.features && p.features.length ? `
                        <div class="product-features">
                            ${p.features.slice(0, 3).map(f => `<span class="feature-tag"><i class="fas fa-check"></i> ${f}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div class="product-footer">
                        <div class="product-price">
                            <span class="price-label">Starting from</span>
                            <span class="price-value">₹${p.price.toLocaleString()}</span>
                        </div>
                        <button class="btn-book-now btn-product" data-id="${p.id}">Book Now</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Product card click -> open detail modal
        productsGrid.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', function (e) {
                if (e.target.closest('.product-admin-actions') || e.target.closest('.btn-product')) return;
                const id = this.dataset.id;
                openProductModal(id);
            });
        });

        // Book Now buttons
        productsGrid.querySelectorAll('.btn-product').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const id = this.dataset.id;
                const product = filtered.find(p => p.id === id);
                if (product) openProductModal(id);
            });
        });

        // Admin delete buttons
        productsGrid.querySelectorAll('.product-delete-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault(); e.stopPropagation();
                if (confirm('Delete this product?')) {
                    let all = getProducts();
                    all = all.filter(p => p.id !== this.dataset.id);
                    localStorage.setItem('th_products', JSON.stringify(all));
                    renderProducts(filter);
                    showToast('Product deleted!');
                }
            });
        });
    }

    function getCategoryLabel(cat) {
        const labels = { room: 'Room', food: 'Food', service: 'Service', amenity: 'Amenity' };
        return labels[cat] || cat;
    }

    // Product Detail Modal
    function openProductModal(id) {
        const products = getProducts();
        const product = products.find(p => p.id === id);
        if (!product) return;

        let modal = document.getElementById('productDetailModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'productDetailModal';
            modal.className = 'product-modal-overlay';
            modal.innerHTML = `
                <div class="product-modal-content">
                    <button class="product-modal-close" id="productModalClose">&times;</button>
                    <div class="product-modal-image"><img src="" alt="" id="modalProductImg"></div>
                    <div class="product-modal-body">
                        <span class="product-modal-category" id="modalProductCategory"></span>
                        <h2 id="modalProductName"></h2>
                        <p class="product-modal-desc" id="modalProductDesc"></p>
                        <div class="product-modal-features" id="modalProductFeatures"></div>
                        <div class="product-modal-footer">
                            <div class="product-modal-price">
                                <span class="price-label">Starting from</span>
                                <span class="price-value" id="modalProductPrice"></span>
                            </div>
                            <button class="btn-book-now btn-modal-book">Book Now</button>
                        </div>
                    </div>
                </div>`;
            document.body.appendChild(modal);

            document.getElementById('productModalClose').addEventListener('click', () => { modal.classList.remove('active'); document.body.style.overflow = ''; });
            modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.remove('active'); document.body.style.overflow = ''; } });
            modal.querySelector('.btn-modal-book').addEventListener('click', () => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                document.getElementById('paymentPopup')?.classList.add('active');
            });
        }

        document.getElementById('modalProductImg').src = product.image || '';
        document.getElementById('modalProductImg').alt = product.name;
        document.getElementById('modalProductCategory').textContent = getCategoryLabel(product.category);
        document.getElementById('modalProductName').textContent = product.name;
        document.getElementById('modalProductDesc').textContent = product.description || 'No description available';
        document.getElementById('modalProductPrice').textContent = '₹' + product.price.toLocaleString();

        const featuresEl = document.getElementById('modalProductFeatures');
        if (product.features && product.features.length) {
            featuresEl.innerHTML = product.features.map(f => `<span class="feature-tag"><i class="fas fa-check"></i> ${f}</span>`).join('');
            featuresEl.style.display = 'flex';
        } else {
            featuresEl.innerHTML = '';
            featuresEl.style.display = 'none';
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderProducts(this.dataset.filter);
        });
    });

    // Initial render
    renderProducts('all');

    // Real-time sync across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'th_products') {
            const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            renderProducts(activeFilter);
        }
    });

    // Refresh on focus
    window.addEventListener('focus', () => {
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        renderProducts(activeFilter);
    });

    // ===================== SCROLL REVEAL ANIMATIONS (Optimized) =====================
    const revealElements = document.querySelectorAll('.destination-card, .accommodation-card, .product-card, .testimonial-card, .gallery-item');
    
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        revealElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = `all 0.6s ease ${index % 4 * 0.1}s`;
            revealObserver.observe(el);
        });
    }

    // Parallax scrolling removed for performance

    // ===================== COUNTER ANIMATION =====================
    const counters = document.querySelectorAll('.stat-number, [data-count]');
    
    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-count') || el.textContent);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                el.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                el.textContent = target;
            }
        };
        
        el.textContent = '0';
        updateCounter();
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    // ===================== SMOOTH SCROLL PROGRESS =====================
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #1a6b4a, #2ecc71);
        z-index: 10000;
    `;
    document.body.appendChild(progressBar);

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = (scrollTop / docHeight) * 100;
                progressBar.style.width = `${scrollPercent}%`;
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    // Mouse trail removed for performance

    // ===================== TILT EFFECT ON CARDS (Desktop only) =====================
    if (window.matchMedia('(min-width: 768px) and (hover: hover)').matches) {
        const tiltCards = document.querySelectorAll('.destination-card, .product-card, .testimonial-card');
        let ticking = false;

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const rect = card.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;
                        const rotateX = (y - centerY) / 25;
                        const rotateY = (centerX - x) / 25;

                        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            }, { passive: true });
        });
    }

    // ===================== DYNAMIC GREETING BASED ON TIME =====================
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const greetingEl = document.querySelector('.hero-greeting');
    if (greetingEl) {
        greetingEl.textContent = getGreeting();
    }

    // ===================== SCROLL TO TOP SMOOTH =====================
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.style.opacity = '1';
                backToTop.style.visibility = 'visible';
            } else {
                backToTop.style.opacity = '0';
                backToTop.style.visibility = 'hidden';
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Magnetic button effect removed for performance

    // ===================== LAZY LOAD IMAGES =====================
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    }, { rootMargin: '50px' });

    lazyImages.forEach(img => imageObserver.observe(img));

    // Ripple effect removed for performance

    // ===================== TYPING EFFECT FOR TAGLINE =====================
    const typingElements = document.querySelectorAll('.typing-text');
    
    typingElements.forEach(el => {
        const text = el.textContent;
        el.textContent = '';
        el.style.visibility = 'visible';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                typeWriter();
                observer.disconnect();
            }
        });
        
        observer.observe(el);
    });

    // ===================== SMOOTH PAGE TRANSITION =====================
    document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.endsWith('.html') && !href.startsWith('http') && !href.startsWith('#')) {
                e.preventDefault();
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.25s ease';
                setTimeout(() => { window.location.href = href; }, 250);
            }
        });
    });

    // Fade in on page load
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
        document.body.style.transition = 'opacity 0.4s ease';
        document.body.style.opacity = '1';
    });
})();
