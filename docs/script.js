// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.4)';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.9)';
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animations
document.querySelectorAll('.feature-card, .project-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Track external link clicks
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', function() {
        // Could add analytics tracking here
        console.log('External link clicked:', this.href);
    });
});

// Add active state to navigation links based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

function highlightNavigation() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.style.color = 'var(--text-secondary)';
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.style.color = 'var(--text-primary)';
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// Mobile menu toggle (for future enhancement)
const mobileMenuButton = document.createElement('button');
mobileMenuButton.className = 'mobile-menu-toggle';
mobileMenuButton.setAttribute('aria-label', 'Toggle menu');
mobileMenuButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
`;

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    // Press 'G' + 'H' to go to GitHub
    if (e.key === 'g' || e.key === 'G') {
        const nextKey = (event) => {
            if (event.key === 'h' || event.key === 'H') {
                window.open('https://github.com/iAn-P1nt0/password-kit', '_blank');
                document.removeEventListener('keydown', nextKey);
            }
        };
        setTimeout(() => {
            document.addEventListener('keydown', nextKey, { once: true });
        }, 0);
    }
});

// Add copy-to-clipboard functionality for npm install command
function addCopyButtons() {
    const installCommand = 'npm install password-kit';
    
    // You can add copy buttons to code snippets in the future
    console.log('Install command:', installCommand);
}

addCopyButtons();

// Performance optimization: Lazy load images if any are added
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Console Easter egg
console.log('%c🔐 TrustVault Password Utils', 'font-size: 20px; font-weight: bold; color: #4f46e5;');
console.log('%cSecure. Open Source. TypeScript.', 'font-size: 14px; color: #94a3b8;');
console.log('%cContribute: https://github.com/iAn-P1nt0/password-kit', 'font-size: 12px; color: #64748b;');
console.log('%cSponsor: https://github.com/sponsors/iAn-P1nt0', 'font-size: 12px; color: #ec4899;');
