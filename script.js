document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-links a');

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

    // Close menu when clicking a link
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuBtn.querySelector('i').classList.remove('fa-times');
            menuBtn.querySelector('i').classList.add('fa-bars');
        });
    });

    // Smooth Scroll for Anchor Links (Optional, CSS scroll-behavior usually handles this but good for legacy)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Form Submission (Simulated)
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const originalText = btn.innerText;
        
        btn.innerText = 'Gönderiliyor...';
        btn.disabled = true;

        setTimeout(() => {
            alert('Mesajınız başarıyla alındı! Size en kısa sürede dönüş yapacağız.');
            contactForm.reset();
            btn.innerText = originalText;
            btn.disabled = false;
        }, 1500);
    });

    // Modal Logic
    const modal = document.getElementById('projectModal');
    const closeModal = document.querySelector('.close-modal');
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
            modalDesc.innerText = desc;
            modalCategory.innerText = category;

            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });

    // Close Modal functions
    const closeMyModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Enable scrolling
    }

    closeModal.addEventListener('click', closeMyModal);

    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeMyModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeMyModal();
        }
    });
});
