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
            });
        });

        // Modal Logic
        const modal = document.getElementById('newProjectModal');
        const openBtn = document.getElementById('newProjectBtn');
        const closeBtn = document.querySelector('.close-modal');
        const form = document.getElementById('newProjectForm');
        const tableBody = document.querySelector('#projectsTable tbody');

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
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const name = document.getElementById('pName').value;
                const category = document.getElementById('pCategory').value;
                const status = document.getElementById('pStatus').value;
                const date = new Date().toLocaleDateString('tr-TR');

                const statusClass = status === 'active' ? 'status-active' : 'status-pending';
                const statusText = status === 'active' ? 'Yayında' : 'Geliştiriliyor';

                const newRow = `
                    <tr>
                        <td>${name}</td>
                        <td>${category}</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td>${date}</td>
                        <td>
                            <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;

                tableBody.insertAdjacentHTML('afterbegin', newRow);

                // Re-bind events for new buttons
                bindTableEvents();

                modal.classList.remove('active');
                form.reset();
            });
        }

        // Bind Edit/Delete Events
        function bindTableEvents() {
            const deleteBtns = document.querySelectorAll('.delete-btn');
            const editBtns = document.querySelectorAll('.edit-btn');

            deleteBtns.forEach(btn => {
                // Remove old listeners to avoid duplicates (simple way)
                btn.replaceWith(btn.cloneNode(true));
            });

            // Re-select after replacement
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    if (confirm('Bu projeyi silmek istediğinize emin misiniz?')) {
                        this.closest('tr').remove();
                    }
                });
            });

            editBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    alert('Düzenleme özelliği henüz aktif değil.');
                });
            });
        }

        // Initial bind
        bindTableEvents();
    }
});
