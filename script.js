document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth scrolling pour les liens de navigation
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const headerOffset = 80;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 2. Navbar style au scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            navbar.style.padding = '15px 0';
        } else {
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
            navbar.style.padding = '20px 0';
        }
    });

    // 3. Animations Fade-in on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Appliquer les classes fade-in aux éléments souhaités
    const elementsToAnimate = [
        ...document.querySelectorAll('.step-card'),
        ...document.querySelectorAll('.pricing-card'),
        ...document.querySelectorAll('.testimonial-card'),
        document.querySelector('.hero-image'),
        document.querySelector('.section-title')
    ];

    elementsToAnimate.forEach(el => {
        if (el) {
            el.classList.add('fade-in');
            observer.observe(el);
        }
    });

    // 4. Logique du Modal de Contact
    const modal = document.getElementById('contact-modal');
    const contactTriggers = document.querySelectorAll('.contact-trigger');
    const closeModal = document.querySelector('.close-modal');

    contactTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('show');
        });
    });

    closeModal.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Merci ! Votre demande a été envoyée avec succès.');
            modal.classList.remove('show');
            contactForm.reset();
        });
    }
});
