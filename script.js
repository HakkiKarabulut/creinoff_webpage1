// Debug Error Handler
window.onerror = function (msg, url, line) {
    const c = document.getElementById('public-projects-grid');
    if (c) c.innerHTML += '<div style="color:red;border:1px solid red;padding:5px;">Err: ' + msg + '</div>';
    console.error(msg);
};

// Mobile Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
const links = document.querySelectorAll('.nav-links a');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Close menu when clicking a link
links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        if (menuBtn) {
            menuBtn.querySelector('i').classList.remove('fa-times');
            menuBtn.querySelector('i').classList.add('fa-bars');
        }
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Form Submission with Supabase
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const originalText = btn.innerText;

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        btn.innerText = 'Gönderiliyor...';
        btn.disabled = true;

        try {
            // Robust client retrieval
            let sb = window.supabaseClient || window.supabase;
            if (!sb && typeof supabase !== 'undefined' && window.SUPABASE_URL && window.SUPABASE_KEY) {
                sb = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
                window.supabaseClient = sb;
            }

            if (!sb) throw new Error('Veritabanı bağlantısı kurulamadı. Lütfen sayfayı yenileyiniz.');

            const { data, error } = await sb
                .from('messages')
                .insert([
                    { name: name, email: email, message: message }
                ]);

            if (error) throw error;

            alert('Mesajınız başarıyla alındı! Size en kısa sürede dönüş yapacağız.');
            contactForm.reset();
        } catch (err) {
            console.error('Submission error:', err);
            alert('Bir hata oluştu: ' + err.message);
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

// Modal Logic
const modal = document.getElementById('projectModal');
const closeModal = document.querySelector('.close-modal');
function bindProjectModals() {
    const projectCards = document.querySelectorAll('.project-card');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalCategory = document.getElementById('modalCategory');

    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();

            // Get data
            const title = card.getAttribute('data-title');
            const desc = card.getAttribute('data-desc');
            const category = card.getAttribute('data-category');

            // Set data
            modalTitle.innerText = title;
            modalDesc.innerText = desc || "Detaylı açıklama bulunmuyor.";
            modalCategory.innerText = category;

            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });
}

// Close Modal functions
const closeMyModal = () => {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Enable scrolling
    }
}

if (closeModal) {
    closeModal.addEventListener('click', closeMyModal);
}

// Close when clicking outside
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeMyModal();
        }
    });
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeMyModal();
    }
});
// Initial Load
loadPublicProjects();

async function loadPublicProjects() {
    const container = document.getElementById('public-projects-grid');
    if (!container) {
        console.error('Container #public-projects-grid not found');
        return;
    }

    // Debug: Update status
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center;"><i class="fas fa-spinner fa-spin"></i> Veri çekiliyor... (Supabase kontrol ediliyor)</div>';

    try {
        let sb = window.supabaseClient || window.supabase;

        // Diagnostic checks
        if (!sb) {
            // Try to initialize if global vars available
            if (typeof supabase !== 'undefined' && window.SUPABASE_URL && window.SUPABASE_KEY) {
                sb = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
            } else {
                throw new Error('Supabase client not initialized. Library or Config missing.');
            }
        }

        // Check if it's the client (has .from)
        if (typeof sb.from !== 'function') {
            // It might be the library object if overwrite failed or config didn't run
            if (sb.createClient && window.SUPABASE_URL && window.SUPABASE_KEY) {
                sb = sb.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
            } else {
                throw new Error('Invalid Supabase object found. Missing .from() method.');
            }
        }

        // Assign back for future use
        window.supabaseClient = sb;

        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center;"><i class="fas fa-spinner fa-spin"></i> Veriler yükleniyor...</div>';

        const { data: projects, error } = await sb
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!projects || projects.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Henüz proje bulunmuyor.</p>';
            return;
        }

        container.innerHTML = '';
        projects.forEach(project => {
            const style = getCategoryStyle(project.category);
            const description = "Bu proje, " + project.category + " alanında geliştirilmiş modern bir çözümdür.";

            const html = `
            <a href="#" class="project-card" data-title="${project.title}"
                data-desc="${description}"
                data-category="${project.category}">
                <div class="project-image">
                    <div style="width:100%; height:100%; background: ${style.bg}; display: flex; align-items: center; justify-content: center; color: ${style.color}; font-size: 3rem;">
                        <i class="fas ${style.icon}"></i>
                    </div>
                </div>
                <div class="project-info">
                    <div class="project-tags">
                        <span class="tag">${project.category}</span>
                        ${project.status === 'pending' ? '<span class="tag" style="background:#fef9c3; color:#ca8a04">Geliştiriliyor</span>' : ''}
                    </div>
                    <h3>${project.title}</h3>
                    <p>${description}</p>
                </div>
            </a>`;
            container.insertAdjacentHTML('beforeend', html);
        });

        // Placeholder Logic
        const totalSlots = 5;
        const currentCount = projects.length;
        if (currentCount < totalSlots) {
            const missing = totalSlots - currentCount;
            for (let i = 0; i < missing; i++) {
                const placeholderHtml = `
                <div class="project-card" style="opacity: 0.7; cursor: default;">
                    <div class="project-image">
                        <div style="width:100%; height:100%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 3rem;">
                            <i class="fas fa-tools"></i>
                        </div>
                    </div>
                    <div class="project-info">
                        <div class="project-tags">
                            <span class="tag" style="background:#fef9c3; color:#ca8a04">Geliştiriliyor</span>
                        </div>
                        <h3>Yeni Proje Yolda</h3>
                        <p>Ekibimiz yeni ve heyecan verici bir proje üzerinde çalışıyor. Çok yakında burada olacak!</p>
                    </div>
                </div>`;
                container.insertAdjacentHTML('beforeend', placeholderHtml);
            }
        }

        bindProjectModals();
    } catch (err) {
        console.error('Projects load error:', err);
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: red;">
                <i class="fas fa-exclamation-circle"></i>
                <p>Projeler yüklenirken hata oluştu.</p>
                <small>${err.message}</small>
            </div>`;
    }
}

function getCategoryStyle(category) {
    const styles = {
        'E-Ticaret': { icon: 'fa-shopping-cart', bg: '#e0f2fe', color: '#0ea5e9' },
        'Mobil Uygulama': { icon: 'fa-mobile-alt', bg: '#dcfce7', color: '#16a34a' },
        'Kurumsal': { icon: 'fa-building', bg: '#fef9c3', color: '#ca8a04' },
        'Eğitim': { icon: 'fa-graduation-cap', bg: '#ede9fe', color: '#7c3aed' },
        'Restoran': { icon: 'fa-utensils', bg: '#fee2e2', color: '#dc2626' }
    };
    return styles[category] || { icon: 'fa-laptop-code', bg: '#f3f4f6', color: '#4b5563' };
}

// Explicit call
setTimeout(loadPublicProjects, 100);

