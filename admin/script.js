document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    // Check if we are on the dashboard page
    if (window.location.pathname.includes('dashboard.html')) {
        checkAuth();
        initDashboard();
    }

    // Login Logic
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('loginError');

            // Simple mock authentication
            if (username === 'admin' && password === 'admin') {
                localStorage.setItem('isAdminLoggedIn', 'true');
                window.location.href = 'dashboard.html';
            } else {
                errorMsg.style.display = 'block';
            }
        });
    }

    // Logout Logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isAdminLoggedIn');
            window.location.href = 'index.html';
        });
    }

    // Auth Check Function
    function checkAuth() {
        const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
        if (!isLoggedIn) {
            window.location.href = 'index.html';
        }
    }

    // Dashboard Initialization
    function initDashboard() {
        // Tab Switching
        const navItems = document.querySelectorAll('.nav-item[data-target]');
        const sections = document.querySelectorAll('.content-section');
        const pageTitle = document.getElementById('pageTitle');
        const pageDesc = document.getElementById('pageDesc');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('data-target');

                // Update Nav
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Update Sections
                sections.forEach(section => {
                    section.classList.add('hidden');
                    if (section.id === targetId) {
                        section.classList.remove('hidden');
                    }
                });

                // Update Header
                const titles = {
                    'overview': ['Genel Bakış', 'Hoşgeldin, Admin!'],
                    'projects': ['Projeler', 'Tüm projelerinizi buradan yönetebilirsiniz.'],
                    'messages': ['Mesajlar', 'Gelen kutunuz.'],
                    'settings': ['Ayarlar', 'Site ayarlarını düzenleyin.']
                };

                if (titles[targetId]) {
                    pageTitle.innerText = titles[targetId][0];
                    pageDesc.innerText = titles[targetId][1];
                }

                // Load data based on tab
                if (targetId === 'projects') loadProjects();
                if (targetId === 'messages') loadMessages();
                if (targetId === 'overview') loadStats();
            });
        });

        // Modal Logic
        const modal = document.getElementById('newProjectModal');
        const openBtn = document.getElementById('newProjectBtn');
        const closeBtn = document.querySelector('.close-modal');
        const form = document.getElementById('newProjectForm');

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                modal.classList.add('active');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const id = document.getElementById('pId').value;
                const name = document.getElementById('pName').value;
                const category = document.getElementById('pCategory').value;
                const status = document.getElementById('pStatus').value;

                const logoFile = document.getElementById('pLogo').files[0];
                const site_url = document.getElementById('pSite').value;
                const download_url = document.getElementById('pDownload').value;
                const social_instagram = document.getElementById('pInsta').value;
                const social_facebook = document.getElementById('pFace').value;
                const social_x = document.getElementById('pX').value;

                const btn = form.querySelector('button');
                const originalText = btn.innerText;

                btn.disabled = true;
                btn.innerText = id ? 'Güncelleniyor...' : 'Ekleniyor...';

                try {
                    const url = '../api/projects.php';
                    // Always POST for file uploads, we will handle ID in backend
                    const method = 'POST';

                    const formData = new FormData();
                    if (id) formData.append('id', id); // If ID exists, it's an update
                    formData.append('title', name);
                    formData.append('category', category);
                    formData.append('status', status);
                    formData.append('site_url', site_url);
                    formData.append('download_url', download_url);
                    formData.append('social_instagram', social_instagram);
                    formData.append('social_facebook', social_facebook);
                    formData.append('social_x', social_x);

                    if (logoFile) {
                        formData.append('logo', logoFile);
                    } else if (id) {
                        // If updating and no file selected, we might want to keep existing.
                        // The backend should handle this: if file not sent, keep old one.
                        // But we can also send the existing URL if we dragged it around, 
                        // but standard file input doesn't hold value.
                        // So we just don't append 'logo' and backend knows to keep it.
                    }

                    const response = await fetch(url, {
                        method: method,
                        // Content-Type header NOT set for FormData, browser does it with boundary
                        body: formData
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.error || 'Bir hata oluştu.');
                    }

                    modal.classList.remove('active');
                    form.reset();
                    // Reset ID
                    document.getElementById('pId').value = '';
                    // Clear file input specifically (reset handles it but good measure)
                    document.getElementById('pLogo').value = '';

                    loadProjects(); // Refresh table
                } catch (err) {
                    console.error('Project save error:', err);
                    alert('Hata: ' + (err.message || err));
                } finally {
                    btn.disabled = false;
                    btn.innerText = 'Ekle'; // Reset to default
                }
            });
        }

        // Reset form when opening for new project
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                document.getElementById('pId').value = '';
                document.querySelector('.modal-header h2').innerText = 'Yeni Proje Ekle';
                form.querySelector('button').innerText = 'Ekle';
                form.reset();
                modal.classList.add('active');
            });
        }

        // Initial Load
        loadStats();
        loadStats();
        loadRecentProjects(); // Load recent projects for overview
        loadProjects(); // Pre-load projects
    }

    // Data Loading Functions
    async function loadProjects() {
        const tableBody = document.querySelector('#projectsTable tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Yükleniyor...</td></tr>';

        try {
            const response = await fetch('../api/projects.php');
            if (!response.ok) throw new Error('Projeler yüklenemedi.');
            const projects = await response.json();

            if (!projects || projects.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Henüz proje yok.</td></tr>';
                return;
            }

            tableBody.innerHTML = '';
            projects.forEach(project => {
                const date = new Date(project.created_at).toLocaleDateString('tr-TR');
                const statusClass = project.status === 'active' ? 'status-active' : 'status-pending';
                const statusText = project.status === 'active' ? 'Yayında' : 'Geliştiriliyor';

                const row = `
                    <tr>
                        <td>${project.title}</td>
                        <td>${project.category}</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td>${date}</td>
                        <td>
                            <button class="action-btn edit-btn" 
                                data-id="${project.id}" 
                                data-title="${project.title}" 
                                data-category="${project.category}" 
                                data-status="${project.status}"
                                data-logo="${project.logo_url || ''}"
                                data-site="${project.site_url || ''}"
                                data-download="${project.download_url || ''}"
                                data-insta="${project.social_instagram || ''}"
                                data-face="${project.social_facebook || ''}"
                                data-x="${project.social_x || ''}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" data-id="${project.id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', row);
            });

            bindTableEvents();
        } catch (err) {
            console.error('Load projects error:', err);
            tableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Hata: ${err.message}</td></tr>`;
        }
    }

    async function loadMessages() {
        const container = document.querySelector('#messages .table-container');

        try {
            const response = await fetch('../api/messages.php');
            if (!response.ok) throw new Error('Mesajlar yüklenemedi.');
            const messages = await response.json();

            if (messages && messages.length > 0) {
                let html = '<div class="table-header"><h3>Gelen Mesajlar</h3></div><table class="data-table"><thead><tr><th>İsim</th><th>E-posta</th><th>Mesaj</th><th>Tarih</th><th>Durum</th></tr></thead><tbody>';

                messages.forEach(msg => {
                    const date = new Date(msg.created_at).toLocaleDateString('tr-TR');
                    const isRead = msg.is_read == 1;
                    const statusBadge = isRead ? '<span class="status-badge status-active">Okundu</span>' : '<span class="status-badge status-pending">Okunmadı</span>';
                    const toggleBtn = `<button class="action-btn" onclick="toggleReadStatus(${msg.id}, ${isRead ? 0 : 1})" title="${isRead ? 'Okunmadı Yap' : 'Okundu işaretle'}"><i class="fas ${isRead ? 'fa-times-circle' : 'fa-check-circle'}"></i></button>`;

                    html += `
                        <tr>
                            <td>${msg.name}</td>
                            <td>${msg.email}</td>
                            <td>${msg.message.substring(0, 50)}...</td>
                            <td>${date}</td>
                            <td>
                                ${statusBadge}
                                ${toggleBtn}
                            </td>
                        </tr>
                    `;
                });
                html += '</tbody></table>';
                container.innerHTML = html;
            } else {
                container.innerHTML = `
                    <div class="table-header"><h3>Gelen Mesajlar</h3></div>
                    <div style="padding: 20px; text-align: center; color: #888;">
                        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                        <p>Henüz yeni mesajınız yok.</p>
                    </div>
                `;
            }
        } catch (err) {
            console.error('Load messages error:', err);
            if (container) {
                container.innerHTML = `<div style="color:red; padding:20px;">Mesajlar yüklenirken hata oluştu: ${err.message}</div>`;
            }
        }
    }

    async function loadRecentProjects() {
        const tableBody = document.getElementById('recentProjectsTableBody');
        if (!tableBody) return;

        try {
            const response = await fetch('../api/projects.php');
            if (!response.ok) throw new Error('Projeler yüklenemedi.');
            const allProjects = await response.json();
            const projects = allProjects.slice(0, 5); // Frontend-side slicing

            if (!projects || projects.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Henüz proje yok.</td></tr>';
                return;
            }

            tableBody.innerHTML = '';
            projects.forEach(project => {
                const date = new Date(project.created_at).toLocaleDateString('tr-TR');
                const statusClass = project.status === 'active' ? 'status-active' : 'status-pending';
                const statusText = project.status === 'active' ? 'Yayında' : 'Geliştiriliyor';

                const row = `
                    <tr>
                        <td>${project.title}</td>
                        <td>${project.category}</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td>${date}</td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', row);
            });
        } catch (err) {
            console.error('Load recent projects error:', err);
            tableBody.innerHTML = `<tr><td colspan="4" style="color:red;">Hata: ${err.message}</td></tr>`;
        }
    }

    async function loadStats() {
        try {
            const [projectsRes, messagesRes] = await Promise.all([
                fetch('../api/projects.php'),
                fetch('../api/messages.php')
            ]);

            const projects = await projectsRes.json();
            const messages = await messagesRes.json();

            const projectCount = projects.length;
            const messageCount = messages.length;
            const activeProjectCount = projects.filter(p => p.status === 'active').length;

            // Update UI
            const activeProjectEl = document.getElementById('stat-active-projects');
            if (activeProjectEl) {
                activeProjectEl.innerText = activeProjectCount || 0;
            }

            const messageCountEl = document.getElementById('stat-total-messages');
            if (messageCountEl) {
                messageCountEl.innerText = messageCount || 0;
            }
        } catch (err) {
            console.error('Stats load error:', err);
        }
    }

    function bindTableEvents() {
        const deleteBtns = document.querySelectorAll('.delete-btn');
        const editBtns = document.querySelectorAll('.edit-btn');

        deleteBtns.forEach(btn => {
            btn.addEventListener('click', async function () {
                if (confirm('Bu projeyi silmek istediğinize emin misiniz?')) {
                    const id = this.getAttribute('data-id');
                    try {
                        const response = await fetch(`../api/projects.php?id=${id}`, {
                            method: 'DELETE'
                        });

                        const result = await response.json();

                        if (!result.success) {
                            throw new Error(result.error || 'Silme başarısız.');
                        }
                        this.closest('tr').remove();
                    } catch (err) {
                        alert('Silme hatası: ' + err.message);
                    }
                }
            });
        });

        editBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const modal = document.getElementById('newProjectModal');
                const form = document.getElementById('newProjectForm');

                // Populate Form
                document.getElementById('pId').value = this.getAttribute('data-id');
                document.getElementById('pName').value = this.getAttribute('data-title');
                document.getElementById('pCategory').value = this.getAttribute('data-category');
                document.getElementById('pStatus').value = this.getAttribute('data-status');

                // For file input, we cannot set value. 
                // We could show a preview or text saying "Current: ..." but for now just leave empty.
                // document.getElementById('pLogo').value = this.getAttribute('data-logo'); 

                document.getElementById('pSite').value = this.getAttribute('data-site');
                document.getElementById('pDownload').value = this.getAttribute('data-download');
                document.getElementById('pInsta').value = this.getAttribute('data-insta');
                document.getElementById('pFace').value = this.getAttribute('data-face');
                document.getElementById('pX').value = this.getAttribute('data-x');

                // Update UI Text
                document.querySelector('.modal-header h2').innerText = 'Projeyi Düzenle';
                form.querySelector('button').innerText = 'Güncelle';

                modal.classList.add('active');
            });
        });
    }

    // Toggle Read Status
    window.toggleReadStatus = async (id, newStatus) => {
        try {
            const response = await fetch('../api/messages.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, is_read: newStatus })
            });

            if (!response.ok) throw new Error('Güncelleme başarısız.');

            // Reload messages tab
            const btn = document.querySelector(`[data-target="messages"]`);
            if (btn) btn.click();
        } catch (err) {
            console.error(err);
            alert('Hata: ' + err.message);
        }
    };
});
