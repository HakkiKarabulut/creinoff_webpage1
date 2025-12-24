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

        // Add New Project
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const name = document.getElementById('pName').value;
                const category = document.getElementById('pCategory').value;
                const status = document.getElementById('pStatus').value;
                const btn = form.querySelector('button');

                btn.disabled = true;
                btn.innerText = 'Ekleniyor...';

                try {
                    // Check if supabase is available
                    if (typeof window.supabase === 'undefined') {
                        throw new Error('Supabase bağlantısı kurulamadı. config.js dosyasını kontrol edin.');
                    }

                    // Insert into Supabase
                    const { data, error } = await window.supabase
                        .from('projects')
                        .insert([
                            { title: name, category: category, status: status }
                        ])
                        .select();

                    if (error) {
                        throw error;
                    }

                    modal.classList.remove('active');
                    form.reset();
                    loadProjects(); // Refresh table
                } catch (err) {
                    console.error('Project add error:', err);
                    alert('Hata: ' + (err.message || err));
                    if (err.message && err.message.includes('row-level security')) {
                        alert('İPUCU: Supabase SQL Editor\'de public_access.sql kodlarını çalıştırmayı unuttunuz mu?');
                    }
                } finally {
                    btn.disabled = false;
                    btn.innerText = 'Ekle';
                }
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
            if (typeof window.supabase === 'undefined') {
                throw new Error('Supabase başlatılamadı.');
            }

            const { data: projects, error } = await window.supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

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
                            <button class="action-btn edit-btn" data-id="${project.id}"><i class="fas fa-edit"></i></button>
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
            const { data: messages, error } = await window.supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            if (messages && messages.length > 0) {
                let html = '<div class="table-header"><h3>Gelen Mesajlar</h3></div><table class="data-table"><thead><tr><th>İsim</th><th>E-posta</th><th>Mesaj</th><th>Tarih</th></tr></thead><tbody>';

                messages.forEach(msg => {
                    const date = new Date(msg.created_at).toLocaleDateString('tr-TR');
                    html += `
                        <tr>
                            <td>${msg.name}</td>
                            <td>${msg.email}</td>
                            <td>${msg.message.substring(0, 50)}...</td>
                            <td>${date}</td>
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
            const { data: projects, error } = await window.supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;

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
            // Simple counts
            const { count: projectCount } = await window.supabase.from('projects').select('*', { count: 'exact', head: true });
            const { count: messageCount } = await window.supabase.from('messages').select('*', { count: 'exact', head: true });
            const { count: activeProjectCount } = await window.supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            // Update UI
            const activeProjectEl = document.getElementById('stat-active-projects');
            if (activeProjectEl) {
                activeProjectEl.innerText = activeProjectCount || 0;
            }

            const messageCountEl = document.getElementById('stat-total-messages');
            if (messageCountEl) {
                messageCountEl.innerText = messageCount || 0;
            }

            // console.log('Stats:', projectCount, messageCount, activeProjectCount);
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
                        const { error } = await window.supabase.from('projects').delete().eq('id', id);

                        if (error) {
                            throw error;
                        }
                        this.closest('tr').remove();
                    } catch (err) {
                        alert('Silme hatası: ' + err.message);
                    }
                }
            });
        });

        editBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                alert('Düzenleme özelliği henüz aktif değil.');
            });
        });
    }
});
