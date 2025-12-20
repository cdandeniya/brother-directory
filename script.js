// Smooth scroll behavior
document.addEventListener('DOMContentLoaded', function() {
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translate(0, 0) scale(1)';
            }
        });
    }, observerOptions);

    // Animate hero content on load
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(20px)';
        heroContent.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        
        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 100);
    }

    // Smooth scroll enhancement
    let isScrolling = false;
    let scrollTimeout;
    
    // Add smooth scroll class while scrolling
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            document.body.classList.add('is-scrolling');
            isScrolling = true;
        }
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            document.body.classList.remove('is-scrolling');
            isScrolling = false;
        }, 150);
    }, { passive: true });
    
    // Smooth scroll for programmatic scrolling
    const smoothScrollTo = (element) => {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 0;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    };

    // Animate section title
    const sectionTitle = document.querySelector('.section-title');
    if (sectionTitle) {
        sectionTitle.style.opacity = '0';
        sectionTitle.style.transform = 'translateX(-20px)';
        sectionTitle.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(sectionTitle);
    }

    // Animate brother cards with stagger
    const brotherCards = document.querySelectorAll('.brother-card');
    brotherCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translate(0, 30px) scale(0.95)';
        card.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
        observer.observe(card);
    });

    // Smooth scroll indicator click
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.style.cursor = 'pointer';
        scrollIndicator.addEventListener('click', () => {
            const brothersSection = document.querySelector('.brothers-section');
            if (brothersSection) {
                brothersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        
        // Animate scroll indicator
        scrollIndicator.style.opacity = '0';
        setTimeout(() => {
            scrollIndicator.style.transition = 'opacity 1s ease-out';
            scrollIndicator.style.opacity = '0.5';
        }, 1500);
    }

    // Smooth reveal for header elements (but NOT welcome text)
    const logo = document.querySelector('.logo');
    const headerNav = document.querySelector('.header-nav');
    
    if (logo) {
        logo.style.opacity = '0';
        logo.style.transform = 'translateY(-10px)';
        logo.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        setTimeout(() => {
            logo.style.opacity = '1';
            logo.style.transform = 'translateY(0)';
        }, 200);
    }
    
    // Animate header nav but keep welcome text static
    if (headerNav) {
        const contactBtn = headerNav.querySelector('.contact-btn');
        if (contactBtn) {
            contactBtn.style.opacity = '0';
            contactBtn.style.transform = 'translateY(-10px)';
            contactBtn.style.transition = 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s';
            setTimeout(() => {
                contactBtn.style.opacity = '1';
                contactBtn.style.transform = 'translateY(0)';
            }, 400);
        }
    }

    // Custom blue circle cursor - always visible with smooth follow
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        width: 20px;
        height: 20px;
        border: 2px solid #3B82F6;
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        transition: left 0.6s cubic-bezier(0.23, 1, 0.32, 1), top 0.6s cubic-bezier(0.23, 1, 0.32, 1), transform 0.2s ease-out, border-color 0.2s ease-out;
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
        left: 50%;
        top: 50%;
    `;
    document.body.appendChild(cursor);
    
    // Custom cursor is visible but default cursor is also available
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    
    // Smooth cursor following using requestAnimationFrame
    function animateCursor() {
        // Smooth interpolation
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Update mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Scale up on hover over interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .brother-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursor.style.borderColor = '#1E3A8A';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.borderColor = '#3B82F6';
        });
    });

    // Smooth page transitions
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 50);

    // Add loading state completion
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });
});

// Smooth scroll for any anchor links - use event delegation to handle dynamically changed hrefs
document.addEventListener('click', function(e) {
    const anchor = e.target.closest('a');
    if (anchor && anchor.getAttribute('href') && anchor.getAttribute('href').startsWith('#')) {
        // Only handle if it's actually a hash link (not external links that were changed)
        const href = anchor.getAttribute('href');
        if (href === '#' || (href.startsWith('#') && href.length > 1)) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }
});

// Add subtle floating hover effect that stays centered and floats in a square
document.querySelectorAll('.brother-card').forEach(card => {
    let animationFrame = null;
    let startTime = null;
    let isAnimating = false;
    const hoverDistance = 6; // pixels to move in each direction
    
    card.addEventListener('mouseenter', function() {
        const cardElement = this;
        
        // Stop any existing animation
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        
        // Reset to center position first
        cardElement.style.transition = 'none';
        cardElement.style.transform = 'translate(0, -8px) scale(1.02)';
        
        startTime = performance.now();
        isAnimating = true;
        
        function animate(currentTime) {
            if (!isAnimating) return;
            
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            
            // Create a smooth floating motion within a square pattern
            // Using different frequencies for x and y to create a circular/square pattern
            const x = Math.sin(elapsed / 2000) * hoverDistance;
            const y = Math.cos(elapsed / 1800) * hoverDistance;
            
            // Apply transform: translate for floating around center, scale for zoom
            // NO rotation, NO translateX/translateY separately - use translate() to keep centered
            cardElement.style.transform = `translate(${x}px, ${y - 8}px) scale(1.02)`;
            
            animationFrame = requestAnimationFrame(animate);
        }
        
        animationFrame = requestAnimationFrame(animate);
    });
    
    card.addEventListener('mouseleave', function() {
        isAnimating = false;
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        this.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        this.style.transform = 'translate(0, 0) scale(1)';
    });
});

// Profile Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    const profileModal = document.getElementById('profileModal');
    if (!profileModal) return;
    
    const profileClose = document.querySelector('.profile-close');
    const profileOverlay = document.querySelector('.profile-modal-overlay');
    const viewProfileButtons = document.querySelectorAll('.view-profile-btn');
    
    // Open profile modal with morphing animation
    viewProfileButtons.forEach((button) => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.brother-card');
            const image = card.querySelector('.card-image img');
            const nameElement = card.querySelector('.brother-name');
            const brotherName = nameElement.textContent;
            
            openProfileWithAnimation(brotherName, image, card);
        });
    });
    
    // Close profile modal
    function closeProfile() {
        profileModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    if (profileClose) {
        profileClose.addEventListener('click', closeProfile);
    }
    if (profileOverlay) {
        profileOverlay.addEventListener('click', function(e) {
            // Don't close if clicking on social buttons or their parent
            // Allow navigation to proceed for social buttons
            const socialBtn = e.target.closest('.social-btn');
            if (socialBtn) {
                // Let the button's own click handler handle the navigation
                return;
            }
            if (e.target.closest('.profile-social-buttons')) {
                return;
            }
            closeProfile();
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && profileModal.classList.contains('active')) {
            closeProfile();
        }
    });
    
    function openProfileWithAnimation(brotherName, sourceImage, sourceCard) {
        const imageSrc = sourceImage.src;
        
        // Clear previous information immediately
        clearProfileContent();
        
        // Get source card position (start from top of card)
        const cardRect = sourceCard.getBoundingClientRect();
        const sourceX = cardRect.left + cardRect.width / 2;
        const sourceY = cardRect.top; // Start from top of card
        const sourceWidth = cardRect.width;
        const sourceHeight = cardRect.height;
        
        // Get target position (profile modal image section)
        const profileImageSection = document.querySelector('.profile-image-section');
        const profileImage = document.querySelector('.profile-image');
        
        // Show modal immediately
        profileModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Set the profile image source
        if (profileImage) {
            profileImage.src = imageSrc;
            profileImage.alt = brotherName;
            profileImage.style.opacity = '0';
        }
        
        // Calculate target position
        setTimeout(() => {
            const targetRect = profileImageSection.getBoundingClientRect();
            const targetX = targetRect.left;
            const targetY = targetRect.top;
            const targetWidth = targetRect.width;
            const targetHeight = targetRect.height;
            
            // Create animated card clone
            const animatedCard = sourceCard.cloneNode(true);
            const initialX = cardRect.left;
            const initialY = cardRect.top;
            const initialWidth = cardRect.width;
            const initialHeight = cardRect.height;
            
            // Hide overlay and button in clone
            const overlay = animatedCard.querySelector('.card-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
            }
            const button = animatedCard.querySelector('.view-profile-btn');
            if (button) {
                button.style.display = 'none';
            }
            
            animatedCard.style.cssText = `
                position: fixed;
                left: ${initialX}px;
                top: ${initialY}px;
                width: ${initialWidth}px;
                height: ${initialHeight}px;
                z-index: 10005;
                pointer-events: none;
                border-radius: 20px;
                overflow: hidden;
                transform: translateZ(0);
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
                will-change: transform, width, height, border-radius;
            `;
            
            document.body.appendChild(animatedCard);
            sourceCard.style.opacity = '0';
            
            // Force a reflow to ensure initial styles are applied
            void animatedCard.offsetWidth;
            
            // Calculate transform values for smooth animation
            const deltaX = targetX - initialX;
            const deltaY = targetY - initialY;
            
            // Start smooth morph animation using transform for better performance
            requestAnimationFrame(() => {
                animatedCard.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), width 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), height 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), border-radius 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)';
                animatedCard.style.transform = `translate(${deltaX}px, ${deltaY}px) translateZ(0)`;
                animatedCard.style.width = `${targetWidth}px`;
                animatedCard.style.height = `${targetHeight}px`;
                animatedCard.style.borderRadius = '0';
            });
            
            // Show profile image behind animated card before removing it (seamless transition)
            setTimeout(() => {
                if (profileImage) {
                    profileImage.style.opacity = '1';
                    profileImage.style.transition = 'opacity 0.1s ease';
                }
            }, 550);
            
            // Set button links immediately (before animation)
            const data = brothersData[brotherName];
            if (data) {
                // Set LinkedIn button immediately
                const linkedinBtn = document.querySelector('.linkedin-btn[data-field="linkedin"]');
                if (linkedinBtn) {
                    if (data.linkedin && data.linkedin.trim() !== '' && data.linkedin !== '-') {
                        let linkedinUrl = data.linkedin.trim();
                        if (!linkedinUrl.startsWith('http://') && !linkedinUrl.startsWith('https://')) {
                            linkedinUrl = 'https://' + linkedinUrl;
                        }
                        linkedinBtn.href = linkedinUrl;
                        linkedinBtn.target = '_blank';
                        linkedinBtn.rel = 'noopener noreferrer';
                        linkedinBtn.style.display = 'flex';
                        linkedinBtn.style.pointerEvents = 'auto';
                        linkedinBtn.style.cursor = 'pointer';
                        // Use onclick to ensure it works - this will override any other handlers
                        linkedinBtn.onclick = function(e) {
                            e.stopPropagation(); // Prevent overlay from closing modal
                            e.stopImmediatePropagation(); // Prevent other handlers
                            if (linkedinUrl && linkedinUrl !== '#' && !linkedinUrl.includes('#')) {
                                window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
                            }
                            return false; // Additional safeguard
                        };
                        console.log('LinkedIn button set:', linkedinUrl);
                    } else {
                        linkedinBtn.style.display = 'none';
                    }
                } else {
                    console.error('LinkedIn button not found');
                }
                
                // Set Gmail button immediately
                const gmailBtn = document.querySelector('.gmail-btn[data-field="email"]');
                if (gmailBtn) {
                    if (data.email && data.email.trim() !== '' && data.email !== '-') {
                        const emailUrl = `mailto:${data.email.trim()}`;
                        gmailBtn.href = emailUrl;
                        gmailBtn.style.display = 'flex';
                        gmailBtn.style.pointerEvents = 'auto';
                        gmailBtn.style.cursor = 'pointer';
                        console.log('Gmail button set:', emailUrl);
                    } else {
                        gmailBtn.style.display = 'none';
                    }
                } else {
                    console.error('Gmail button not found');
                }
            }
            
            // Start showing information earlier - while image is still animating
            setTimeout(() => {
                showProfileContent(brotherName);
            }, 300);
            
            // After animation completes, remove animated card smoothly
            setTimeout(() => {
                // Fade out animated card very quickly while profile image is already visible
                animatedCard.style.opacity = '0';
                animatedCard.style.transition = 'opacity 0.05s ease';
                
                setTimeout(() => {
                    animatedCard.remove();
                    sourceCard.style.opacity = '';
                }, 50);
            }, 600);
        }, 10);
    }
    
    function clearProfileContent() {
        // Scroll to top of profile modal
        const profileContent = document.querySelector('.profile-content');
        const profileInfoSection = document.querySelector('.profile-info-section');
        if (profileContent) {
            profileContent.scrollTop = 0;
        }
        if (profileInfoSection) {
            profileInfoSection.scrollTop = 0;
        }
        
        // Clear name
        const profileNameEl = document.querySelector('.profile-name');
        if (profileNameEl) {
            profileNameEl.textContent = '';
        }
        
        // Clear subtitle
        const profileSubtitleEl = document.querySelector('.profile-subtitle');
        if (profileSubtitleEl) {
            profileSubtitleEl.textContent = '';
        }
        
        // Reset all detail items to visible
        const detailItemsReset = document.querySelectorAll('.profile-detail-item');
        detailItemsReset.forEach(item => {
            item.style.display = 'flex';
        });
        
        // Clear all detail fields
        const detailElements = document.querySelectorAll('[data-field]');
        detailElements.forEach(element => {
            const field = element.getAttribute('data-field');
            if (field === 'linkedin') {
                // The LinkedIn button IS the <a> tag itself, not a parent containing an <a>
                if (element.tagName === 'A') {
                    element.href = '#';
                    element.style.display = 'none';
                } else {
                    // Fallback: if it's a parent element, look for nested <a>
                    const link = element.querySelector('a');
                    if (link) {
                        link.textContent = '-';
                        link.href = '#';
                        link.style.display = 'none';
                    }
                }
            } else if (field === 'email') {
                // The Email button IS the <a> tag itself, not a parent containing an <a>
                if (element.tagName === 'A') {
                    element.href = '#';
                    element.style.display = 'none';
                } else {
                    // Fallback: if it's a parent element, look for nested <a>
                    const link = element.querySelector('a');
                    if (link) {
                        link.textContent = '-';
                        link.href = '#';
                        link.style.display = 'none';
                    }
                }
            } else {
                element.textContent = '-';
            }
        });
        
        // Hide info section immediately
        const profileInfoEl = document.querySelector('.profile-info-section');
        const profileNameEl2 = document.querySelector('.profile-name');
        const detailItems = document.querySelectorAll('.profile-detail-item');
        
        if (profileInfoEl) {
            profileInfoEl.style.transform = 'translateX(50px)';
            profileInfoEl.style.opacity = '0';
        }
        if (profileNameEl2) {
            profileNameEl2.style.transform = 'translateY(20px)';
            profileNameEl2.style.opacity = '0';
        }
        detailItems.forEach(item => {
            item.style.transform = 'translateY(15px)';
            item.style.opacity = '0';
        });
    }
    
    function showProfileContent(brotherName) {
        if (typeof brothersData === 'undefined') {
            console.error('Brothers data not loaded');
            return;
        }
        
        const data = brothersData[brotherName];
        if (!data) {
            console.error('No data found for:', brotherName);
            return;
        }
        
        // Set name
        const profileNameEl = document.querySelector('.profile-name');
        if (profileNameEl) {
            profileNameEl.textContent = data.fullName;
        }
        
        // Set subtitle (Major | Pledge Class | Grad Year)
        const profileSubtitleEl = document.querySelector('.profile-subtitle');
        if (profileSubtitleEl) {
            profileSubtitleEl.textContent = `${data.major} | ${data.pledgeClass} | ${data.graduationDate}`;
        }
        
        // Set LinkedIn button (ensure it's set again in case it was reset)
        const linkedinBtn = document.querySelector('.linkedin-btn[data-field="linkedin"]');
        if (linkedinBtn) {
            if (data.linkedin && data.linkedin !== '-' && data.linkedin.trim() !== '') {
                // Ensure LinkedIn URL is properly formatted
                let linkedinUrl = data.linkedin.trim();
                if (!linkedinUrl.startsWith('http://') && !linkedinUrl.startsWith('https://')) {
                    linkedinUrl = 'https://' + linkedinUrl;
                }
                linkedinBtn.href = linkedinUrl;
                linkedinBtn.target = '_blank';
                linkedinBtn.rel = 'noopener noreferrer';
                linkedinBtn.style.display = 'flex';
                linkedinBtn.style.pointerEvents = 'auto';
                linkedinBtn.style.cursor = 'pointer';
                // Use onclick to ensure it works - this will override any other handlers
                linkedinBtn.onclick = function(e) {
                    e.stopPropagation(); // Prevent overlay from closing modal
                    e.stopImmediatePropagation(); // Prevent other handlers
                    if (linkedinUrl && linkedinUrl !== '#' && !linkedinUrl.includes('#')) {
                        window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
                    }
                    return false; // Additional safeguard
                };
                console.log('LinkedIn button set to:', linkedinUrl);
            } else {
                linkedinBtn.style.display = 'none';
            }
        } else {
            console.error('LinkedIn button not found');
        }
        
        // Set Gmail button (ensure it's set again in case it was reset)
        const gmailBtn = document.querySelector('.gmail-btn[data-field="email"]');
        if (gmailBtn) {
            if (data.email && data.email !== '-' && data.email.trim() !== '') {
                const emailUrl = `mailto:${data.email.trim()}`;
                gmailBtn.href = emailUrl;
                gmailBtn.style.display = 'flex';
                gmailBtn.style.pointerEvents = 'auto';
                gmailBtn.style.cursor = 'pointer';
                console.log('Gmail button set to:', emailUrl);
            } else {
                gmailBtn.style.display = 'none';
            }
        } else {
            console.error('Gmail button not found');
        }
        
        // Set all detail fields (excluding major, pledgeClass, graduationDate, linkedin, email - they're in subtitle/buttons)
        const fields = {
            'bio': data.bio,
            'dspPositions': data.dspPositions,
            'committees': data.committees,
            'careerInterests': data.careerInterests,
            'pastRoles': data.pastRoles,
            'hobbies': data.hobbies,
            'funFact': data.funFact,
            'personality': data.personality,
            'favoriteMemory': data.favoriteMemory,
            'littleQualities': data.littleQualities
        };
        
        Object.keys(fields).forEach(field => {
            const element = document.querySelector(`[data-field="${field}"]`);
            if (element) {
                // Skip empty fields (don't show them)
                if (!fields[field] || fields[field].trim() === '' || fields[field] === 'n/a') {
                    const detailItem = element.closest('.profile-detail-item');
                    if (detailItem) {
                        detailItem.style.display = 'none';
                    }
                } else {
                    const detailItem = element.closest('.profile-detail-item');
                    if (detailItem) {
                        detailItem.style.display = 'flex';
                    }
                    element.textContent = fields[field];
                }
            }
        });
        
        // Reset animations for info section
        const profileInfoEl = document.querySelector('.profile-info-section');
        const profileNameEl2 = document.querySelector('.profile-name');
        const detailItems = document.querySelectorAll('.profile-detail-item');
        
        // Reset all elements to initial state
        if (profileInfoEl) {
            profileInfoEl.style.transform = 'translateX(50px)';
            profileInfoEl.style.opacity = '0';
        }
        if (profileNameEl2) {
            profileNameEl2.style.transform = 'translateY(20px)';
            profileNameEl2.style.opacity = '0';
        }
        detailItems.forEach(item => {
            item.style.transform = 'translateY(15px)';
            item.style.opacity = '0';
        });
        
        // Force reflow to ensure styles are applied
        void profileModal.offsetWidth;
        
        // Trigger animations immediately - description slides in faster
        requestAnimationFrame(() => {
            if (profileInfoEl) {
                profileInfoEl.style.transform = 'translateX(0)';
                profileInfoEl.style.opacity = '1';
            }
            if (profileNameEl2) {
                profileNameEl2.style.transform = 'translateY(0)';
                profileNameEl2.style.opacity = '1';
            }
            if (profileSubtitleEl2) {
                profileSubtitleEl2.style.transform = 'translateY(0)';
                profileSubtitleEl2.style.opacity = '1';
            }
        });
        
        // Animate detail items faster with shorter delays
        detailItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transform = 'translateY(0)';
                item.style.opacity = '1';
            }, 50 + (index * 25));
        });
    }
    
    function openProfile(brotherName, imageSrc) {
        if (typeof brothersData === 'undefined') {
            console.error('Brothers data not loaded');
            return;
        }
        
        const data = brothersData[brotherName];
        if (!data) {
            console.error('No data found for:', brotherName);
            return;
        }
        
        // Set image
        const profileImage = document.querySelector('.profile-image');
        if (profileImage) {
            profileImage.src = imageSrc;
            profileImage.alt = brotherName;
        }
        
        // Set name
        const profileName = document.querySelector('.profile-name');
        if (profileName) {
            profileName.textContent = data.fullName;
        }
        
        // Set all detail fields
        const fields = {
            'pledgeClass': data.pledgeClass,
            'graduationDate': data.graduationDate,
            'major': data.major,
            'dspPositions': data.dspPositions,
            'committees': data.committees,
            'careerInterests': data.careerInterests,
            'pastRoles': data.pastRoles,
            'linkedin': data.linkedin,
            'hobbies': data.hobbies,
            'funFact': data.funFact,
            'personality': data.personality,
            'favoriteMemory': data.favoriteMemory,
            'littleQualities': data.littleQualities
        };
        
        Object.keys(fields).forEach(field => {
            const element = document.querySelector(`[data-field="${field}"]`);
            if (element) {
                if (field === 'linkedin') {
                    const link = element.querySelector('a');
                    if (link) {
                        if (fields[field] && fields[field] !== '-') {
                            link.href = fields[field];
                            link.textContent = 'View LinkedIn';
                            link.style.display = 'inline';
                        } else {
                            link.textContent = '-';
                            link.style.display = 'none';
                        }
                    }
                } else {
                    element.textContent = fields[field] || '-';
                }
            }
        });
        
        // Reset animations
        const profileImageEl = document.querySelector('.profile-image');
        const profileInfoEl = document.querySelector('.profile-info-section');
        const profileNameEl = document.querySelector('.profile-name');
        const detailItems = document.querySelectorAll('.profile-detail-item');
        
        // Reset all elements to initial state
        if (profileImageEl) {
            profileImageEl.style.transform = 'scale(1.2)';
            profileImageEl.style.opacity = '0';
        }
        if (profileInfoEl) {
            profileInfoEl.style.transform = 'translateX(50px)';
            profileInfoEl.style.opacity = '0';
        }
        if (profileNameEl) {
            profileNameEl.style.transform = 'translateY(20px)';
            profileNameEl.style.opacity = '0';
        }
        detailItems.forEach(item => {
            item.style.transform = 'translateY(15px)';
            item.style.opacity = '0';
        });
        
        // Show modal
        profileModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Force reflow to ensure initial state is applied
        void profileModal.offsetWidth;
        
        // Trigger animations - image zooms in first
        setTimeout(() => {
            if (profileImageEl) {
                profileImageEl.style.transform = 'scale(1)';
                profileImageEl.style.opacity = '1';
            }
        }, 50);
        
        // Then description slides in from the side
        setTimeout(() => {
            if (profileInfoEl) {
                profileInfoEl.style.transform = 'translateX(0)';
                profileInfoEl.style.opacity = '1';
            }
        }, 350);
    }
});
