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

// Form Submission with PHP API
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
            const response = await fetch('api/messages.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Bir hata oluştu.');
            }

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

    // Action Buttons
    const btnDownload = document.getElementById('modalDownload');
    const btnSite = document.getElementById('modalSite');
    const btnInsta = document.getElementById('modalInsta');
    const btnFace = document.getElementById('modalFace');
    const btnX = document.getElementById('modalX');

    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();

            // Get data
            const title = card.getAttribute('data-title');
            const desc = card.getAttribute('data-desc');
            const category = card.getAttribute('data-category');

            // New Fields
            const siteUrl = card.getAttribute('data-site');
            const downloadUrl = card.getAttribute('data-download');
            const insta = card.getAttribute('data-insta');
            const face = card.getAttribute('data-face');
            const x = card.getAttribute('data-x');

            // Set data
            modalTitle.innerText = title;
            modalDesc.innerText = desc || "Detaylı açıklama bulunmuyor.";
            modalCategory.innerText = category;

            // Configure Buttons
            configureBtn(btnDownload, downloadUrl);
            configureBtn(btnSite, siteUrl);
            configureBtn(btnInsta, insta);
            configureBtn(btnFace, face);
            configureBtn(btnX, x);

            // Show modal
            const modal = document.getElementById('projectModal');
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });
}

function configureBtn(btn, url) {
    if (!btn) return;
    if (url && url.length > 5) { // Basic length check
        btn.style.display = 'flex';
        btn.href = url;
    } else {
        btn.style.display = 'none';
    }
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

    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center;"><i class="fas fa-spinner fa-spin"></i> Veriler yükleniyor...</div>';

    try {
        const response = await fetch('api/projects.php');
        if (!response.ok) {
            throw new Error(`HTTP hatası: ${response.status}`);
        }

        const projects = await response.json();

        if (!projects || projects.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6b7280;"><h3>Bu kısım güncellenecek</h3><p>Projelerimiz çok yakında eklenecektir.</p></div>';
            return;
        }

        container.innerHTML = '';
        projects.forEach(project => {
            const style = getCategoryStyle(project.category);
            const description = "Bu proje, " + project.category + " alanında geliştirilmiş modern bir çözümdür.";

            // Logo Logic
            let imageHtml = '';
            if (project.logo_url && project.logo_url.length > 5) {
                imageHtml = `<img src="${project.logo_url}" alt="${project.title}" style="width:100%; height:100%; object-fit:cover;">`;
            } else {
                imageHtml = `<div style="width:100%; height:100%; background: ${style.bg}; display: flex; align-items: center; justify-content: center; color: ${style.color}; font-size: 3rem;">
                        <i class="fas ${style.icon}"></i>
                    </div>`;
            }

            const html = `
            <a href="#" class="project-card" data-title="${project.title}"
                data-desc="${description}"
                data-category="${project.category}"
                data-site="${project.site_url || ''}"
                data-download="${project.download_url || ''}"
                data-insta="${project.social_instagram || ''}"
                data-face="${project.social_facebook || ''}"
                data-x="${project.social_x || ''}">
                <div class="project-image">
                    ${imageHtml}
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
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6b7280;">
                <i class="fas fa-tools" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <h3>Bu kısım güncellenecek</h3>
                <p>Projelerimiz çok yakında eklenecektir.</p>
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

