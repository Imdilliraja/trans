// ===================== ADMIN AUTH & CORE =====================
(function () {
    const ADMIN_USER = 'dilli';
    const ADMIN_PASS = 'raja';

    // ---- Login Page ----
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        if (sessionStorage.getItem('adminLoggedIn') === 'true') { window.location.href = 'admin.html'; return; }
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const userId = document.getElementById('userId').value.trim();
            const password = document.getElementById('password').value;
            const errorEl = document.getElementById('loginError');
            if (userId === ADMIN_USER && password === ADMIN_PASS) {
                sessionStorage.setItem('adminLoggedIn', 'true');
                errorEl.style.display = 'none';
                window.location.href = 'admin.html';
            } else {
                errorEl.style.display = 'flex';
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 500);
            }
        });
        const toggleBtn = document.getElementById('togglePassword');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function () {
                const pw = document.getElementById('password');
                const icon = this.querySelector('i');
                if (pw.type === 'password') { pw.type = 'text'; icon.classList.replace('fa-eye', 'fa-eye-slash'); }
                else { pw.type = 'password'; icon.classList.replace('fa-eye-slash', 'fa-eye'); }
            });
        }
        return;
    }

    // ---- Admin Dashboard: Auth Check ----
    if (sessionStorage.getItem('adminLoggedIn') !== 'true') { window.location.href = 'admin-login.html'; return; }

    // ---- Data Store (localStorage) ----
    function getProducts() { return JSON.parse(localStorage.getItem('th_products') || '[]'); }
    function saveProducts(products) { localStorage.setItem('th_products', JSON.stringify(products)); }
    function getMessages() { return JSON.parse(localStorage.getItem('th_messages') || '[]'); }
    function saveMessages(msgs) { localStorage.setItem('th_messages', JSON.stringify(msgs)); }
    function getBookings() { return JSON.parse(localStorage.getItem('th_bookings') || '[]'); }
    function saveBookings(bks) { localStorage.setItem('th_bookings', JSON.stringify(bks)); }
    function generateId() { return 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5); }

    // ---- Sidebar Navigation ----
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.admin-section');
    function showSection(name) {
        sections.forEach(s => s.classList.remove('active'));
        sidebarLinks.forEach(l => l.classList.remove('active'));
        const section = document.getElementById('section-' + name);
        const link = document.querySelector(`[data-section="${name}"]`);
        if (section) section.classList.add('active');
        if (link) link.classList.add('active');
        if (name === 'messages') renderMessages();
        if (name === 'bookings') renderBookings();
        if (name === 'dashboard') renderDashboard();
        if (name === 'products') renderProducts();
    }
    window.showSection = showSection;
    sidebarLinks.forEach(link => { link.addEventListener('click', function (e) { e.preventDefault(); showSection(this.dataset.section); }); });

    // ---- Mobile Sidebar Toggle ----
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('adminSidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    if (menuToggle) menuToggle.addEventListener('click', () => sidebar.classList.add('open'));
    if (sidebarClose) sidebarClose.addEventListener('click', () => sidebar.classList.remove('open'));

    // ---- Logout ----
    const logoutBtn = document.getElementById('adminLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            sessionStorage.removeItem('adminLoggedIn');
            window.location.href = 'admin-login.html';
        });
    }

    // ---- Product Form ----
    const productForm = document.getElementById('productForm');
    const editIdField = document.getElementById('editProductId');
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const imageFileInput = document.getElementById('productImageFile');
    const imageSrcInput = document.getElementById('productImageSrc');
    const fileUploadArea = document.getElementById('fileUploadArea');
    let currentImageSrc = '';

    // ---- Image Tab Switch ----
    window.switchImageTab = function (tab) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
        document.getElementById('tab-' + tab)?.classList.add('active');
    };

    // ---- File Upload Handler ----
    function handleFileUpload(file) {
        if (!file || !file.type.startsWith('image/')) { showToast('Please select a valid image file!', 'error'); return; }
        if (file.size > 5 * 1024 * 1024) { showToast('Image must be less than 5MB!', 'error'); return; }
        const reader = new FileReader();
        reader.onload = function (e) {
            currentImageSrc = e.target.result;
            if (imageSrcInput) imageSrcInput.value = currentImageSrc;
            if (imagePreview) imagePreview.innerHTML = `<img src="${currentImageSrc}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }

    if (imageFileInput) {
        imageFileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) handleFileUpload(this.files[0]);
        });
    }

    // ---- Drag & Drop ----
    if (fileUploadArea) {
        fileUploadArea.addEventListener('dragover', function (e) { e.preventDefault(); this.classList.add('dragover'); });
        fileUploadArea.addEventListener('dragleave', function () { this.classList.remove('dragover'); });
        fileUploadArea.addEventListener('drop', function (e) {
            e.preventDefault(); this.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
        });
        fileUploadArea.addEventListener('click', function () { imageFileInput?.click(); });
    }

    // ---- URL Input Handler ----
    if (imageInput) {
        imageInput.addEventListener('input', function () {
            const url = this.value.trim();
            if (url) {
                currentImageSrc = url;
                if (imageSrcInput) imageSrcInput.value = url;
                if (imagePreview) {
                    const img = new Image();
                    img.onload = function () { imagePreview.innerHTML = `<img src="${url}" alt="Preview">`; };
                    img.onerror = function () { imagePreview.innerHTML = '<i class="fas fa-exclamation-circle" style="color:#dc2626"></i><span style="color:#dc2626">Invalid image URL</span>'; };
                    img.src = url;
                }
            } else {
                currentImageSrc = '';
                if (imageSrcInput) imageSrcInput.value = '';
                if (imagePreview) imagePreview.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><span>Image preview will appear here</span>';
            }
        });
    }

    if (productForm) {
        productForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const products = getProducts();
            const editId = editIdField.value;
            const name = document.getElementById('productName').value.trim();
            const category = document.getElementById('productCategory').value;
            const price = parseFloat(document.getElementById('productPrice').value);
            const status = document.getElementById('productStatus').value;
            const description = document.getElementById('productDescription').value.trim();
            const features = document.getElementById('productFeatures').value.split(',').map(f => f.trim()).filter(Boolean);
            const imageVal = (imageSrcInput && imageSrcInput.value) || (imageInput && imageInput.value.trim()) || '';

            if (!name) { showToast('Please enter product name!', 'error'); return; }
            if (!category) { showToast('Please select a category!', 'error'); return; }
            if (isNaN(price) || price < 0) { showToast('Please enter a valid price!', 'error'); return; }

            const productData = {
                id: editId || generateId(), name, category, price, status, description, features, image: imageVal, createdAt: new Date().toISOString()
            };

            if (editId) {
                const idx = products.findIndex(p => p.id === editId);
                if (idx !== -1) { productData.createdAt = products[idx].createdAt; products[idx] = productData; }
                showToast('Product updated successfully!');
            } else {
                products.push(productData);
                showToast('Product added successfully!');
            }

            saveProducts(products);
            resetForm();
            renderProducts();
            renderDashboard();
        });
    }

    function resetForm() {
        if (productForm) productForm.reset();
        if (editIdField) editIdField.value = '';
        if (imageSrcInput) imageSrcInput.value = '';
        if (imageFileInput) imageFileInput.value = '';
        currentImageSrc = '';
        const title = document.getElementById('formTitle');
        const btnText = document.getElementById('submitBtnText');
        if (title) title.textContent = 'Add New Product';
        if (btnText) btnText.textContent = 'Save Product';
        if (imagePreview) imagePreview.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><span>Image preview will appear here</span>';
        window.switchImageTab('upload');
    }
    window.resetForm = resetForm;

    // ---- Edit Product ----
    window.editProduct = function (id) {
        const products = getProducts();
        const product = products.find(p => p.id === id);
        if (!product) return;
        showSection('add-product');
        document.getElementById('editProductId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStatus').value = product.status;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productFeatures').value = (product.features || []).join(', ');
        const img = product.image || '';
        if (img.startsWith('data:')) {
            currentImageSrc = img;
            if (imageSrcInput) imageSrcInput.value = img;
            if (imageInput) imageInput.value = '';
            window.switchImageTab('upload');
        } else {
            currentImageSrc = img;
            if (imageSrcInput) imageSrcInput.value = '';
            if (imageInput) imageInput.value = img;
            window.switchImageTab('url');
        }
        const title = document.getElementById('formTitle');
        const btnText = document.getElementById('submitBtnText');
        if (title) title.textContent = 'Edit Product';
        if (btnText) btnText.textContent = 'Update Product';
        if (imagePreview && product.image) imagePreview.innerHTML = `<img src="${product.image}" alt="Preview">`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ---- Delete Product ----
    let deleteTargetId = null;
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    window.deleteProduct = function (id) { deleteTargetId = id; if (deleteModal) deleteModal.classList.add('active'); };
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function () {
            let products = getProducts();
            products = products.filter(p => p.id !== deleteTargetId);
            saveProducts(products);
            if (deleteModal) deleteModal.classList.remove('active');
            deleteTargetId = null;
            renderProducts(); renderDashboard();
            showToast('Product deleted!');
        });
    }
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function () {
            if (deleteModal) deleteModal.classList.remove('active');
            deleteTargetId = null;
        });
    }

    // ---- Render Products Table ----
    function renderProducts() {
        const tbody = document.getElementById('productsTable');
        if (!tbody) return;
        const products = getProducts();
        if (products.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No products added yet</td></tr>'; return; }
        tbody.innerHTML = products.map(p => `
            <tr>
                <td><img src="${p.image || ''}" alt="${p.name}" class="table-thumb" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22><rect fill=%22%23f0f0f0%22 width=%2250%22 height=%2250%22/><text x=%2225%22 y=%2230%22 text-anchor=%22middle%22 fill=%22%23aaa%22 font-size=%2212%22>N/A</text></svg>'"></td>
                <td><strong>${p.name}</strong></td>
                <td><span class="category-badge">${p.category}</span></td>
                <td class="desc-cell">${(p.description || '').substring(0, 50)}${(p.description || '').length > 50 ? '...' : ''}</td>
                <td><strong>₹${p.price.toLocaleString()}</strong></td>
                <td><span class="status-badge ${p.status}">${p.status}</span></td>
                <td class="actions-cell">
                    <button class="btn-icon" onclick="editProduct('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-danger-icon" onclick="deleteProduct('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    // ---- Render Dashboard ----
    function renderDashboard() {
        const products = getProducts();
        const messages = getMessages();
        const bookings = getBookings();
        const totalProductsEl = document.getElementById('totalProducts');
        const totalRevenueEl = document.getElementById('totalRevenue');
        const activeBookingsEl = document.getElementById('activeBookings');
        const newMessagesEl = document.getElementById('newMessages');
        const recentTbody = document.getElementById('recentProductsTable');

        if (totalProductsEl) totalProductsEl.textContent = products.length;
        const totalRevenue = products.reduce((sum, p) => sum + (p.price || 0), 0);
        if (totalRevenueEl) totalRevenueEl.textContent = '₹' + totalRevenue.toLocaleString();
        if (activeBookingsEl) activeBookingsEl.textContent = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
        if (newMessagesEl) newMessagesEl.textContent = messages.filter(m => !m.read).length;

        if (recentTbody) {
            const recent = products.slice(-5).reverse();
            if (recent.length === 0) { recentTbody.innerHTML = '<tr><td colspan="6" class="empty-state">No products added yet</td></tr>'; }
            else {
                recentTbody.innerHTML = recent.map(p => `
                    <tr>
                        <td><img src="${p.image || ''}" alt="${p.name}" class="table-thumb" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22><rect fill=%22%23f0f0f0%22 width=%2250%22 height=%2250%22/><text x=%2225%22 y=%2230%22 text-anchor=%22middle%22 fill=%22%23aaa%22 font-size=%2212%22>N/A</text></svg>'"></td>
                        <td><strong>${p.name}</strong></td>
                        <td><span class="category-badge">${p.category}</span></td>
                        <td><strong>₹${p.price.toLocaleString()}</strong></td>
                        <td><span class="status-badge ${p.status}">${p.status}</span></td>
                        <td class="actions-cell">
                            <button class="btn-icon" onclick="editProduct('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon btn-danger-icon" onclick="deleteProduct('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    }

    // ---- Render Messages (from localStorage) ----
    function renderMessages() {
        const messagesList = document.querySelector('.messages-list');
        if (!messagesList) return;
        const messages = getMessages();
        if (messages.length === 0) {
            messagesList.innerHTML = '<div class="empty-state"><i class="fas fa-envelope-open" style="font-size:48px;margin-bottom:16px;display:block;color:#ccc;"></i><p>No messages yet</p></div>';
            return;
        }
        messagesList.innerHTML = messages.map(m => `
            <div class="message-card ${m.read ? '' : 'unread'}" data-id="${m.id}">
                <div class="message-header">
                    <strong>${m.name}</strong>
                    <span class="message-date">${new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <p class="message-email"><i class="fas fa-envelope"></i> ${m.email}${m.phone ? ' &middot; <i class="fas fa-phone"></i> ' + m.phone : ''}</p>
                <p>${m.message}</p>
                <div class="message-actions">
                    <button class="btn-small" onclick="markMessageRead('${m.id}')"><i class="fas fa-check"></i> Mark Read</button>
                    <button class="btn-small btn-danger" onclick="deleteMessage('${m.id}')"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        `).join('');
    }

    window.markMessageRead = function (id) {
        const msgs = getMessages();
        const msg = msgs.find(m => m.id === id);
        if (msg) { msg.read = true; saveMessages(msgs); renderMessages(); renderDashboard(); showToast('Message marked as read'); }
    };

    window.deleteMessage = function (id) {
        if (!confirm('Delete this message?')) return;
        let msgs = getMessages();
        msgs = msgs.filter(m => m.id !== id);
        saveMessages(msgs);
        renderMessages(); renderDashboard();
        showToast('Message deleted!');
    };

    // ---- Render Bookings (from localStorage) ----
    function renderBookings() {
        const tbody = document.querySelector('#section-bookings .admin-table tbody');
        if (!tbody) return;
        let bookings = getBookings();
        if (bookings.length === 0) {
            // Seed with sample data if empty
            bookings = [
                { id: 'b_1', guestName: 'Rahul Sharma', roomType: 'Deluxe Room', checkIn: '2025-04-01', checkOut: '2025-04-05', status: 'confirmed', amount: 10000 },
                { id: 'b_2', guestName: 'Priya Patel', roomType: 'Suite', checkIn: '2025-04-03', checkOut: '2025-04-06', status: 'pending', amount: 15000 },
                { id: 'b_3', guestName: 'Amit Kumar', roomType: 'Standard Room', checkIn: '2025-04-05', checkOut: '2025-04-07', status: 'confirmed', amount: 5000 }
            ];
            saveBookings(bookings);
        }
        tbody.innerHTML = bookings.map(b => `
            <tr>
                <td><strong>${b.guestName}</strong></td>
                <td>${b.roomType}</td>
                <td>${b.checkIn}</td>
                <td>${b.checkOut}</td>
                <td><span class="status-badge ${b.status}">${b.status}</span></td>
                <td>₹${b.amount.toLocaleString()}</td>
            </tr>
        `).join('');
    }

    // ---- Search & Filter ----
    window.filterProducts = function () {
        const search = (document.getElementById('productSearch')?.value || '').toLowerCase();
        const category = document.getElementById('categoryFilter')?.value || 'all';
        const products = getProducts();
        const filtered = products.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(search) || (p.description || '').toLowerCase().includes(search);
            const matchCategory = category === 'all' || p.category === category;
            return matchSearch && matchCategory;
        });
        const tbody = document.getElementById('productsTable');
        if (!tbody) return;
        if (filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No products found</td></tr>'; return; }
        tbody.innerHTML = filtered.map(p => `
            <tr>
                <td><img src="${p.image || ''}" alt="${p.name}" class="table-thumb" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22><rect fill=%22%23f0f0f0%22 width=%2250%22 height=%2250%22/><text x=%2225%22 y=%2230%22 text-anchor=%22middle%22 fill=%22%23aaa%22 font-size=%2212%22>N/A</text></svg>'"></td>
                <td><strong>${p.name}</strong></td>
                <td><span class="category-badge">${p.category}</span></td>
                <td class="desc-cell">${(p.description || '').substring(0, 50)}${(p.description || '').length > 50 ? '...' : ''}</td>
                <td><strong>₹${p.price.toLocaleString()}</strong></td>
                <td><span class="status-badge ${p.status}">${p.status}</span></td>
                <td class="actions-cell">
                    <button class="btn-icon" onclick="editProduct('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-danger-icon" onclick="deleteProduct('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    };

    // ---- Change Password ----
    const changePwForm = document.getElementById('changePasswordForm');
    if (changePwForm) {
        changePwForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const current = document.getElementById('currentPassword').value;
            const newPw = document.getElementById('newPassword').value;
            const confirm = document.getElementById('confirmPassword').value;
            if (current !== ADMIN_PASS) { showToast('Current password is incorrect!', 'error'); return; }
            if (newPw !== confirm) { showToast('New passwords do not match!', 'error'); return; }
            if (newPw.length < 4) { showToast('Password must be at least 4 characters!', 'error'); return; }
            showToast('Password updated successfully! (Demo only)');
            this.reset();
        });
    }

    // ---- Toast ----
    function showToast(message, type) {
        const toast = document.getElementById('toast');
        const msg = document.getElementById('toastMessage');
        if (toast && msg) {
            msg.textContent = message;
            toast.className = 'toast active' + (type === 'error' ? ' error' : '');
            setTimeout(() => toast.classList.remove('active'), 3000);
        }
    }
    window.showToast = showToast;

    // ---- Real-time sync: listen for storage events ----
    window.addEventListener('storage', function (e) {
        if (e.key === 'th_products') { renderProducts(); renderDashboard(); }
        if (e.key === 'th_messages') { renderMessages(); renderDashboard(); }
        if (e.key === 'th_bookings') { renderBookings(); renderDashboard(); }
    });

    // ---- Init ----
    renderProducts();
    renderDashboard();
    renderMessages();
    renderBookings();
})();
