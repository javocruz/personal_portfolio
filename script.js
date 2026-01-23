/**
 * Javier Cruz Villarreal - Portfolio JavaScript
 * Handles animations, smooth scroll, and interactive elements
 */

(function() {
    'use strict';

    // =====================================================
    // CONFIGURATION
    // =====================================================
    const CONFIG = {
        terminalText: 'whoami && cat profile.txt',
        typingSpeed: 80,
        scrollOffset: 80,
        animationThreshold: 0.15
    };

    // =====================================================
    // DOM ELEMENTS
    // =====================================================
    const elements = {
        nav: document.getElementById('nav'),
        navToggle: document.getElementById('nav-toggle'),
        navLinks: document.getElementById('nav-links'),
        terminalText: document.getElementById('terminal-text'),
        sections: document.querySelectorAll('.section'),
        animatedElements: document.querySelectorAll('[data-animate]'),
        aboutText: document.querySelector('.about-text'),
        aboutTerminal: document.querySelector('.about-terminal'),
        contactContent: document.querySelector('.contact-content')
    };

    // =====================================================
    // UTILITY FUNCTIONS
    // =====================================================

    /**
     * Debounce function to limit execution rate
     */
    function debounce(func, wait = 10) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Check if element is in viewport
     */
    function isInViewport(element, threshold = 0) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return (
            rect.top <= windowHeight * (1 - threshold) &&
            rect.bottom >= 0
        );
    }

    // =====================================================
    // TERMINAL TYPING EFFECT
    // =====================================================

    function typeTerminalText() {
        if (!elements.terminalText) return;

        const text = CONFIG.terminalText;
        let index = 0;

        function type() {
            if (index < text.length) {
                elements.terminalText.textContent += text.charAt(index);
                index++;
                setTimeout(type, CONFIG.typingSpeed);
            }
        }

        // Start typing after a short delay
        setTimeout(type, 800);
    }

    // =====================================================
    // NAVIGATION
    // =====================================================

    /**
     * Handle navigation scroll state
     */
    function handleNavScroll() {
        if (!elements.nav) return;

        if (window.scrollY > 50) {
            elements.nav.classList.add('scrolled');
        } else {
            elements.nav.classList.remove('scrolled');
        }
    }

    /**
     * Toggle mobile navigation
     */
    function toggleMobileNav() {
        if (!elements.navToggle || !elements.navLinks) return;

        elements.navToggle.classList.toggle('active');
        elements.navLinks.classList.toggle('active');

        // Update ARIA
        const isExpanded = elements.navToggle.classList.contains('active');
        elements.navToggle.setAttribute('aria-expanded', isExpanded);

        // Prevent body scroll when menu is open
        document.body.style.overflow = isExpanded ? 'hidden' : '';
    }

    /**
     * Close mobile nav when clicking a link
     */
    function closeMobileNav() {
        if (!elements.navToggle || !elements.navLinks) return;

        elements.navToggle.classList.remove('active');
        elements.navLinks.classList.remove('active');
        elements.navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    /**
     * Smooth scroll to section
     */
    function smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (!element) return;

        const offsetTop = element.offsetTop - CONFIG.scrollOffset;

        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });

        // Update URL without jumping
        history.pushState(null, '', target);
    }

    // =====================================================
    // SCROLL ANIMATIONS
    // =====================================================

    /**
     * Handle scroll animations for elements
     */
    function handleScrollAnimations() {
        // Animate data-animate elements
        elements.animatedElements.forEach(element => {
            if (isInViewport(element, CONFIG.animationThreshold)) {
                element.classList.add('visible');
            }
        });

        // Animate about section
        if (elements.aboutText && isInViewport(elements.aboutText, CONFIG.animationThreshold)) {
            elements.aboutText.classList.add('visible');
        }

        if (elements.aboutTerminal && isInViewport(elements.aboutTerminal, CONFIG.animationThreshold)) {
            elements.aboutTerminal.classList.add('visible');
        }

        // Animate contact section
        if (elements.contactContent && isInViewport(elements.contactContent, CONFIG.animationThreshold)) {
            elements.contactContent.classList.add('visible');
        }
    }

    /**
     * Highlight active navigation link
     */
    function highlightActiveNav() {
        const scrollPosition = window.scrollY + CONFIG.scrollOffset + 100;

        elements.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active from all links
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                });

                // Add active to current section link
                const activeLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }

    // =====================================================
    // INTERSECTION OBSERVER (Better Performance)
    // =====================================================

    function initIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: CONFIG.animationThreshold
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: unobserve after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all animated elements
        elements.animatedElements.forEach(element => {
            observer.observe(element);
        });

        // Observe special elements
        if (elements.aboutText) observer.observe(elements.aboutText);
        if (elements.aboutTerminal) observer.observe(elements.aboutTerminal);
        if (elements.contactContent) observer.observe(elements.contactContent);
    }

    // =====================================================
    // KEYBOARD NAVIGATION
    // =====================================================

    function handleKeyboardNav(e) {
        // Close mobile nav on Escape
        if (e.key === 'Escape') {
            closeMobileNav();
        }
    }

    // =====================================================
    // PARALLAX EFFECT (Subtle)
    // =====================================================

    function handleParallax() {
        const hero = document.querySelector('.hero-content');
        if (!hero) return;

        const scrolled = window.scrollY;
        const rate = scrolled * 0.3;

        if (scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${rate}px)`;
            hero.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
        }
    }

    // =====================================================
    // GLOW CURSOR EFFECT (Optional)
    // =====================================================

    function initGlowCursor() {
        const glowElements = document.querySelectorAll('.project-card, .skill-category, .timeline-content');

        glowElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                element.style.setProperty('--mouse-x', `${x}px`);
                element.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    // =====================================================
    // EVENT LISTENERS
    // =====================================================

    function initEventListeners() {
        // Scroll events (debounced for performance)
        const debouncedScroll = debounce(() => {
            handleNavScroll();
            highlightActiveNav();
            handleParallax();
        }, 5);

        window.addEventListener('scroll', debouncedScroll, { passive: true });

        // Initial scroll check
        handleNavScroll();

        // Mobile nav toggle
        if (elements.navToggle) {
            elements.navToggle.addEventListener('click', toggleMobileNav);
        }

        // Navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                smoothScrollTo(target);
                closeMobileNav();
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboardNav);

        // Close mobile nav when clicking outside
        document.addEventListener('click', (e) => {
            if (elements.navLinks && elements.navLinks.classList.contains('active')) {
                if (!elements.navLinks.contains(e.target) && !elements.navToggle.contains(e.target)) {
                    closeMobileNav();
                }
            }
        });

        // Resize handler
        window.addEventListener('resize', debounce(() => {
            // Close mobile nav on resize to desktop
            if (window.innerWidth > 768) {
                closeMobileNav();
            }
        }, 100));
    }

    // =====================================================
    // PRELOADER (Optional)
    // =====================================================

    function hidePreloader() {
        document.body.classList.add('loaded');
    }

    // =====================================================
    // INITIALIZE
    // =====================================================

    function init() {
        // Start typing effect
        typeTerminalText();

        // Initialize intersection observer for animations
        if ('IntersectionObserver' in window) {
            initIntersectionObserver();
        } else {
            // Fallback for older browsers
            window.addEventListener('scroll', debounce(handleScrollAnimations, 10), { passive: true });
            handleScrollAnimations();
        }

        // Initialize event listeners
        initEventListeners();

        // Initialize glow cursor effect
        initGlowCursor();

        // Hide preloader after content loads
        window.addEventListener('load', hidePreloader);

        // Initial animation trigger
        setTimeout(() => {
            handleScrollAnimations();
        }, 100);

        console.log('%c Portfolio Loaded ', 'background: #0a0e17; color: #00ff88; padding: 8px 16px; font-family: monospace; font-size: 14px;');
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
