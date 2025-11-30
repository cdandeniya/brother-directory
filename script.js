// Animation Observer - Intersection Observer for scroll animations
// Matching Elementor's exact animation behavior
document.addEventListener('DOMContentLoaded', function() {
    
    // Track scroll direction globally
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
    }, { passive: true });
    
    // Setup Intersection Observer for animations
    // Matching Elementor's exact behavior - elements animate when they enter viewport
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };

    const animationObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            const element = entry.target;
            const currentScrollY = window.scrollY;
            const isScrollingUp = currentScrollY < lastScrollY;
            
            if (entry.isIntersecting) {
                // Add reveal class for headingReveal and slideFromLeft animations
                if (element.classList.contains('headingReveal') || 
                    element.classList.contains('slideFromLeft') ||
                    element.classList.contains('slideFromBottom') ||
                    element.classList.contains('revealFromTop')) {
                    if (!element.classList.contains('reveal')) {
                        element.classList.add('reveal');
                    }
                }
                
                // Animate invisible elements - match Elementor's exact behavior
                if (element.classList.contains('invisible') || 
                    element.classList.contains('elementor-invisible')) {
                    // Add stagger delay for hero text elements
                    const staggerDelay = Array.from(element.parentElement?.children || []).indexOf(element) * 0.15;
                    element.style.animationDelay = `${staggerDelay}s`;
                    // Remove invisible classes and add animation classes
                    element.classList.remove('invisible', 'elementor-invisible');
                    element.classList.add('animated', 'elementor-animation-fadeIn');
                }
            } else {
                // Smoothly fade out when element leaves viewport
                if (element.classList.contains('headingReveal') || 
                    element.classList.contains('slideFromLeft') ||
                    element.classList.contains('slideFromBottom') ||
                    element.classList.contains('revealFromTop')) {
                    if (element.classList.contains('reveal')) {
                        element.classList.remove('reveal');
                    }
                }
                
                if (element.classList.contains('animated') || 
                    element.classList.contains('elementor-animation-fadeIn')) {
                    // Smoothly transition out
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(30px)';
                    // Reset after transition completes so it can re-animate
                    setTimeout(() => {
                        if (!entry.isIntersecting) {
                            element.classList.remove('animated', 'elementor-animation-fadeIn');
                            element.classList.add('invisible', 'elementor-invisible');
                            element.style.animationDelay = '';
                            element.style.opacity = '';
                            element.style.transform = '';
                        }
                    }, 600);
                }
            }
        });
    }, observerOptions);

    // Observe all elements with animation classes immediately
    const observeElements = () => {
        const animatedElements = document.querySelectorAll(
            '.headingReveal, .slideFromLeft, .slideFromBottom, .revealFromTop, .invisible, .elementor-invisible'
        );
        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });
    };

    // Knowledge Section scroll-driven animation - Right to Left as you scroll (Enhanced)
    const knowledgeSection = document.getElementById('meet-the-brothers');
    const knowledgeContent = knowledgeSection?.querySelector('.knowledge-content');
    
    if (knowledgeSection && knowledgeContent) {
        let ticking = false;
        
        const easeOutCubic = (t) => {
            return 1 - Math.pow(1 - t, 3);
        };
        
        const updateScrollAnimation = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const rect = knowledgeSection.getBoundingClientRect();
                    const windowHeight = window.innerHeight;
                    const windowWidth = window.innerWidth;
                    
                    // Calculate when section enters viewport
                    const sectionTop = rect.top;
                    const sectionHeight = rect.height;
                    
                    // Start animation when section is 50% visible from bottom
                    const triggerPoint = windowHeight * 0.5;
                    const endPoint = -sectionHeight * 0.5;
                    
                    // Calculate scroll progress (0 to 1)
                    let progress = 0;
                    if (sectionTop < triggerPoint && sectionTop > endPoint) {
                        progress = Math.max(0, Math.min(1, (triggerPoint - sectionTop) / (triggerPoint - endPoint)));
                    } else if (sectionTop <= endPoint) {
                        progress = 1;
                    }
                    
                    // Apply easing for smoother motion
                    const easedProgress = easeOutCubic(progress);
                    
                    // Animate from right (responsive distance) to left (0) based on scroll progress
                    const maxTranslate = Math.min(150, windowWidth * 0.15); // Responsive max distance
                    const translateX = maxTranslate * (1 - easedProgress);
                    
                    // Opacity with smooth fade in
                    const opacity = Math.min(1, easedProgress * 1.2);
                    
                    // Apply transform with smooth transition
                    knowledgeContent.style.transform = `translateX(${translateX}px)`;
                    knowledgeContent.style.opacity = opacity;
                    
                    ticking = false;
                });
                
                ticking = true;
            }
        };
        
        // Update on scroll with throttling via requestAnimationFrame
        window.addEventListener('scroll', updateScrollAnimation, { passive: true });
        window.addEventListener('resize', updateScrollAnimation, { passive: true });
        
        // Initial check
        updateScrollAnimation();
    }

    // Initial observation
    observeElements();

    // Re-observe after a short delay to catch any dynamically loaded content
    setTimeout(observeElements, 100);

    // Hero paragraph animations on load with stagger
    const heroIntro = document.querySelector('.hero-intro');
    const heroDescription = document.querySelector('.hero-description');
    
    const animateHeroText = () => {
        // Wait for title animations to start, then animate paragraphs
        setTimeout(() => {
            if (heroIntro) {
                heroIntro.classList.add('animate-in');
            }
            if (heroDescription) {
                setTimeout(() => {
                    heroDescription.classList.add('animate-in');
                }, 200); // Stagger second paragraph
            }
        }, 400);
    };
    
    // Animate on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', animateHeroText);
    } else {
        animateHeroText();
    }

    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Team member card scroll animations
    const teamMemberCards = document.querySelectorAll('.team-member-card');
    
    // Create observer for card animations
    const cardObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const cardObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            const currentScrollY = window.scrollY;
            const isScrollingUp = currentScrollY < lastScrollY;
            
            if (entry.isIntersecting) {
                // Stagger animation based on card index (slower)
                if (!entry.target.classList.contains('animate-in')) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, (index % 4) * 150); // Stagger every 150ms, reset every 4 cards
                }
            } else {
                // Smoothly fade out when card leaves viewport
                if (entry.target.classList.contains('animate-in')) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(30px)';
                    // Reset after transition completes so it can re-animate
                    setTimeout(() => {
                        if (!entry.isIntersecting) {
                            entry.target.classList.remove('animate-in');
                            entry.target.style.opacity = '';
                            entry.target.style.transform = '';
                        }
                    }, 600);
                }
            }
        });
    }, cardObserverOptions);
    
    // Observe all team member cards
    teamMemberCards.forEach(card => {
        cardObserver.observe(card);
    });
    
    // Team member card hover effects (update to work with animation)
    teamMemberCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (this.classList.contains('animate-in')) {
                this.style.transform = 'translateY(-5px)';
                this.style.transition = 'transform 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (this.classList.contains('animate-in')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });

    // Brother Directory
    const brothers = [
        {
            id: 1,
            name: 'John Smith',
            pledgeClass: 'Alpha Class 2020',
            role: 'President',
            major: 'Computer Science',
            gradYear: '2024',
            bio: 'John is passionate about leadership and technology. He has been instrumental in organizing community service events and building strong relationships within the fraternity.',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop'
        },
        {
            id: 2,
            name: 'Michael Chen',
            pledgeClass: 'Beta Class 2021',
            role: 'Vice President',
            major: 'Business Administration',
            gradYear: '2025',
            bio: 'Michael brings strategic thinking and organizational skills to the fraternity. He is dedicated to fostering brotherhood and academic excellence.',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop'
        },
        {
            id: 3,
            name: 'David Rodriguez',
            pledgeClass: 'Gamma Class 2021',
            role: 'Treasurer',
            major: 'Finance',
            gradYear: '2025',
            bio: 'David manages the fraternity finances with precision and care. He is known for his attention to detail and commitment to transparency.',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop'
        },
        {
            id: 4,
            name: 'James Wilson',
            pledgeClass: 'Delta Class 2022',
            role: 'Secretary',
            major: 'Political Science',
            gradYear: '2026',
            bio: 'James keeps detailed records and ensures smooth communication within the fraternity. He is passionate about civic engagement and leadership development.',
            image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop'
        },
        {
            id: 5,
            name: 'Robert Taylor',
            pledgeClass: 'Epsilon Class 2022',
            role: 'Rush Chair',
            major: 'Marketing',
            gradYear: '2026',
            bio: 'Robert leads recruitment efforts and helps new members integrate into the fraternity. He is outgoing, friendly, and dedicated to growing our brotherhood.',
            image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop'
        },
        {
            id: 6,
            name: 'William Anderson',
            pledgeClass: 'Zeta Class 2022',
            role: 'Social Chair',
            major: 'Communications',
            gradYear: '2026',
            bio: 'William organizes social events and builds connections with other organizations. He brings energy and creativity to everything he does.',
            image: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=500&fit=crop'
        },
        {
            id: 7,
            name: 'Christopher Martinez',
            pledgeClass: 'Eta Class 2023',
            role: 'Philanthropy Chair',
            major: 'Public Health',
            gradYear: '2027',
            bio: 'Christopher coordinates community service projects and charity events. He is committed to making a positive impact in our community.',
            image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=500&fit=crop'
        },
        {
            id: 8,
            name: 'Daniel Thompson',
            pledgeClass: 'Theta Class 2023',
            role: 'Member',
            major: 'Engineering',
            gradYear: '2027',
            bio: 'Daniel is an active member who contributes to various fraternity initiatives. He is known for his problem-solving skills and collaborative spirit.',
            image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=500&fit=crop'
        }
    ];

    // Render brother cards
    const brotherGrid = document.getElementById('brotherGrid');
    if (brotherGrid) {
        brothers.forEach((brother, index) => {
            const card = document.createElement('div');
            card.className = 'brother-card invisible';
            card.dataset.brotherId = brother.id;
            card.innerHTML = `
                <div class="brother-image-wrapper">
                    <div class="brother-image" style="background-image: url('${brother.image}')"></div>
                </div>
                <h4 class="brother-name">${brother.name}</h4>
                <p class="brother-pledge-class">${brother.pledgeClass}</p>
                <p class="brother-role">${brother.role}</p>
            `;
            brotherGrid.appendChild(card);
            
            // Add click handler
            card.addEventListener('click', () => openBrotherPanel(brother));
        });

        // Observe brother cards for animation
        const brotherCards = document.querySelectorAll('.brother-card');
        brotherCards.forEach(card => {
            animationObserver.observe(card);
        });
    }

    // Brother Panel functionality
    const brotherPanelOverlay = document.getElementById('brotherPanelOverlay');
    const brotherPanel = document.getElementById('brotherPanel');
    const brotherPanelContent = document.getElementById('brotherPanelContent');
    const brotherPanelClose = document.getElementById('brotherPanelClose');

    function openBrotherPanel(brother) {
        if (!brotherPanelContent) return;
        
        brotherPanelContent.innerHTML = `
            <div class="brother-panel-image" style="background-image: url('${brother.image}')"></div>
            <h2 class="brother-panel-name">${brother.name}</h2>
            <p class="brother-panel-pledge-class">${brother.pledgeClass}</p>
            <p class="brother-panel-role">${brother.role}</p>
            <div class="brother-panel-details">
                <p class="brother-panel-detail-item">
                    <span class="brother-panel-detail-label">Major:</span> ${brother.major}
                </p>
                <p class="brother-panel-detail-item">
                    <span class="brother-panel-detail-label">Graduation Year:</span> ${brother.gradYear}
                </p>
            </div>
            <div class="brother-panel-bio">
                ${brother.bio}
            </div>
        `;
        
        if (brotherPanelOverlay) {
            brotherPanelOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeBrotherPanel() {
        if (brotherPanelOverlay) {
            brotherPanelOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Close panel handlers
    if (brotherPanelClose) {
        brotherPanelClose.addEventListener('click', closeBrotherPanel);
    }

    if (brotherPanelOverlay) {
        brotherPanelOverlay.addEventListener('click', (e) => {
            if (e.target === brotherPanelOverlay) {
                closeBrotherPanel();
            }
        });
    }

    // Close panel on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && brotherPanelOverlay && brotherPanelOverlay.classList.contains('active')) {
            closeBrotherPanel();
        }
    });

    // Scroll to Top Button
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (scrollToTopBtn) {
        // Show/hide button based on scroll position
        const toggleScrollButton = () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        };
        
        // Check on scroll
        window.addEventListener('scroll', toggleScrollButton, { passive: true });
        
        // Initial check
        toggleScrollButton();
        
        // Smooth scroll to top on click
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
