// Shuffle function using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Dynamically generate and shuffle brother cards in three groups
function generateShuffledBrotherCards() {
    if (typeof brothersData === 'undefined') {
        console.error('Brothers data not loaded');
        return;
    }
    
    // Define groups (using exact names from brothersData)
    const yesGroup = [
        'Isabelle Baginski',
        'Yuta Kawamura',
        'Connor Wong', // Note: user said "Connor Wang" but data has "Connor Wong"
        'Henry Cai',
        'Aidan Chan',
        'Hannah Kim',
        'Siena Rahman',
        'Charleen You',
        'Rainer Duchmanh'
    ];
    
    const idkGroup = [
        'Carrie Song',
        'Rashna Kasaju', // Note: user said "Rashua Kasaju" but data has "Rashna Kasaju"
        'Samuel Zou',
        'Luke Alexander',
        'Tolu Bolaji',
        'Ana Jiang',
        'Anna Lin',
        'Camila Sanchez',
        'Steven Ye',
        'Alex Chan'
    ];
    
    const noGroup = [
        'Sandra Obrycki',
        'Michelle Weng',
        'Karan Grover',
        'Estella Saha',
        'Naoki Sekine',
        'Madison Stone',
        'Jaelyn Gunter',
        'Jack Hardiman',
        'Chanul Dandeniya',
        'Vincent Ouyang',
        'Laaibah Shoaib',
        'Daniel Yoo',
        'Adrian Morel',
        'Brian Ren',
        'Jenny Chen',
        'Natsumi Ekanayaka',
        'Ashley Lee',
        'Aldo Ramirez',
        'Reon Sarkar',
        'Walter Benitez',
        'Claudelle Cortez',
        'Jahzeel Requena',
        'Waylene Hui',
        'Joshua Jacob',
        'James Kyung',
        'William Sim',
        'Jaden Yang'
    ];
    
    // Filter groups to only include names that exist in brothersData
    const yesFiltered = yesGroup.filter(name => brothersData[name]);
    const idkFiltered = idkGroup.filter(name => brothersData[name]);
    const noFiltered = noGroup.filter(name => brothersData[name]);
    
    // Shuffle each group separately
    const shuffledYes = shuffleArray(yesFiltered);
    const shuffledIdk = shuffleArray(idkFiltered);
    const shuffledNo = shuffleArray(noFiltered);
    
    // Combine in order: Yes (top), IDK (middle), No (bottom)
    const finalOrder = [...shuffledYes, ...shuffledIdk, ...shuffledNo];
    
    // Get the brothers grid container
    const brothersGrid = document.querySelector('.brothers-grid');
    if (!brothersGrid) {
        console.error('Brothers grid not found');
        return;
    }
    
    // Clear existing cards
    brothersGrid.innerHTML = '';
    
    // Generate cards in grouped and shuffled order
    finalOrder.forEach(brotherName => {
        const data = brothersData[brotherName];
        if (!data) return;
        
        const card = document.createElement('div');
        card.className = 'brother-card';
        card.dataset.brotherName = brotherName;
        card.innerHTML = `
            <div class="card-image">
                <img src="${data.image}" alt="${data.fullName}">
            </div>
            <div class="card-overlay">
                <h3 class="brother-name">${data.fullName}</h3>
                <button class="view-profile-btn">View Profile</button>
            </div>
        `;
        
        brothersGrid.appendChild(card);
    });
    
    // Apply any active filters after generating cards
    applyFilters();
}

// Filter functionality
function isEC(brotherName) {
    // EC members list
    const ecMembers = [
        'Karan Grover',
        'Carrie Song',
        'Sandra Obrycki',
        'Jaelyn Gunter',
        'Isabelle Baginski',
        'Samuel Zou',
        'Connor Wong',
        'Naoki Sekine',
        'Charleen You'
    ];
    return ecMembers.includes(brotherName);
}

function isChair(brotherName) {
    // Chairs list
    const chairs = [
        'James Kyung',
        'Aldo Ramirez',
        'Jahzeel Requena',
        'William Sim',
        'Jenny Chen',
        'Ashley Lee',
        'Tolu Bolaji',
        'Anna Lin',
        'Aidan Chan',
        'Camila Sanchez',
        'Walter Benitez',
        'Claudelle Cortez'
    ];
    return chairs.includes(brotherName);
}

// Starred functionality with localStorage
function getStarredBrothers() {
    try {
        const starred = localStorage.getItem('starredBrothers');
        return starred ? JSON.parse(starred) : [];
    } catch (e) {
        return [];
    }
}

function setStarredBrothers(starredList) {
    try {
        localStorage.setItem('starredBrothers', JSON.stringify(starredList));
    } catch (e) {
        console.error('Failed to save starred brothers:', e);
    }
}

function toggleStar(brotherName) {
    if (!brotherName) {
        console.error('No brother name provided to toggleStar');
        return;
    }
    
    const starred = getStarredBrothers();
    const index = starred.indexOf(brotherName);

    if (index > -1) {
        starred.splice(index, 1);
    } else {
        starred.push(brotherName);
    }

    setStarredBrothers(starred);
    updateProfileStarButton(brotherName);
    
    // Only apply filters if filters are set up
    if (typeof applyFilters === 'function') {
        applyFilters(); // Reapply filters to update visibility
    }
}

function updateProfileStarButton(brotherName) {
    const starBtn = document.getElementById('profileStarBtn');
    if (starBtn && brotherName) {
        const isStarred = getStarredBrothers().includes(brotherName);
        const starIcon = starBtn.querySelector('.profile-star-icon');
        
        if (isStarred) {
            starBtn.classList.add('starred');
            if (starIcon) {
                starIcon.setAttribute('fill', 'currentColor');
            }
        } else {
            starBtn.classList.remove('starred');
            if (starIcon) {
                starIcon.setAttribute('fill', 'none');
            }
        }
    }
}

function isStarred(brotherName) {
    return getStarredBrothers().includes(brotherName);
}

function applyFilters() {
    const filterEC = document.getElementById('filter-ec');
    const filterChairs = document.getElementById('filter-chairs');
    const filterStarred = document.getElementById('filter-starred');
    
    if (!filterEC || !filterChairs || !filterStarred) return;
    
    const showEC = filterEC.checked;
    const showChairs = filterChairs.checked;
    const showStarred = filterStarred.checked;
    
    // If no filters are active, show all cards
    const hasActiveFilters = showEC || showChairs || showStarred;
    
    const cards = document.querySelectorAll('.brother-card');
    cards.forEach(card => {
        const brotherName = card.dataset.brotherName;
        if (!brotherName) return;
        
        let shouldShow = true;
        
        if (hasActiveFilters) {
            shouldShow = false;
            
            // Show if matches any active filter
            if (showEC && isEC(brotherName)) {
                shouldShow = true;
            }
            if (showChairs && isChair(brotherName)) {
                shouldShow = true;
            }
            if (showStarred && isStarred(brotherName)) {
                shouldShow = true;
            }
        }
        
        if (shouldShow) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Setup filter event listeners
document.addEventListener('DOMContentLoaded', function() {
    function setupFilters() {
        const filtersToggle = document.getElementById('filtersToggle');
        const filtersContainer = document.getElementById('filtersContainer');
        const filterEC = document.getElementById('filter-ec');
        const filterChairs = document.getElementById('filter-chairs');
        const filterStarred = document.getElementById('filter-starred');
        
        if (!filterEC || !filterChairs || !filterStarred || !filtersToggle || !filtersContainer) {
            setTimeout(setupFilters, 100);
            return;
        }
        
        // Toggle filters dropdown
        filtersToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = filtersContainer.classList.contains('active');
            const isMobile = window.innerWidth <= 768;
            
            if (isActive) {
                filtersContainer.classList.remove('active');
                filtersToggle.classList.remove('active');
                if (isMobile) {
                    filtersContainer.style.display = 'none';
                }
            } else {
                filtersContainer.classList.add('active');
                filtersToggle.classList.add('active');
                if (isMobile) {
                    filtersContainer.style.display = 'flex';
                }
            }
        });
        
        // Close filters when clicking outside (desktop only)
        document.addEventListener('click', function(e) {
            const isMobile = window.innerWidth <= 768;
            if (!isMobile && !filtersContainer.contains(e.target) && !filtersToggle.contains(e.target)) {
                filtersContainer.classList.remove('active');
                filtersToggle.classList.remove('active');
            }
        });
        
        // Prevent closing when clicking inside filters container
        filtersContainer.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                    // On mobile, show filters inline when active
                    if (filtersContainer.classList.contains('active')) {
                        filtersContainer.style.display = 'flex';
                    }
                } else {
                    // On desktop, reset display
                    filtersContainer.style.display = '';
                }
            }, 100);
        });
        
        // Add click animation effect
        function addClickAnimation(checkbox) {
            checkbox.addEventListener('change', function() {
                const checkboxLabel = checkbox.closest('.filter-checkbox');
                if (checkboxLabel) {
                    // Trigger animation by temporarily removing and re-adding class
                    checkboxLabel.style.animation = 'none';
                    setTimeout(() => {
                        checkboxLabel.style.animation = '';
                    }, 10);
                }
            });
        }
        
        addClickAnimation(filterEC);
        addClickAnimation(filterChairs);
        addClickAnimation(filterStarred);
        
        filterEC.addEventListener('change', applyFilters);
        filterChairs.addEventListener('change', applyFilters);
        filterStarred.addEventListener('change', applyFilters);
    }
    
    setTimeout(setupFilters, 200);
});

// Smooth scroll behavior
document.addEventListener('DOMContentLoaded', function() {
    // Generate shuffled cards - wait for brothersData to be available
    function tryGenerateCards() {
        if (typeof brothersData !== 'undefined' && Object.keys(brothersData).length > 0) {
            generateShuffledBrotherCards();
        } else {
            // Retry after a short delay if data isn't loaded yet
            setTimeout(tryGenerateCards, 50);
        }
    }
    tryGenerateCards();
    
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

    // Typewriter effect function - types continuously across both lines
    function typeWriterContinuous(line1, line2, text1, text2, speed, callback) {
        let i = 0;
        const fullText = text1 + ' ' + text2;
        line1.textContent = '';
        line2.textContent = '';
        line1.classList.add('typing');
        
        function type() {
            if (i < fullText.length) {
                const char = fullText.charAt(i);
                const currentPos = i;
                
                // Determine which line to add the character to
                if (currentPos < text1.length) {
                    line1.textContent += char;
                } else if (currentPos === text1.length) {
                    // Space between lines - show line 2 and start typing
                    line2.classList.add('typing');
                    line2.textContent += char;
                } else {
                    // Typing in line 2
                    line2.textContent += char;
                }
                
                i++;
                setTimeout(type, speed);
            } else {
                // Finished typing
                line1.classList.remove('typing');
                line1.classList.add('complete');
                line2.classList.remove('typing');
                line2.classList.add('complete');
                if (callback) callback();
            }
        }
        
        type();
    }
    
    // Animate hero content with typewriter effect
    function animateHeroContent() {
        const line1 = document.querySelector('.line-1');
        const line2 = document.querySelector('.line-2');
        const subtext = document.querySelector('.hero-subtext');
        
        if (line1 && line2) {
            const text1 = line1.textContent.trim();
            const text2 = line2.textContent.trim();
            
            setTimeout(() => {
                typeWriterContinuous(line1, line2, text1, text2, 80, () => {
                    // After typing completes, show subtitle immediately
                    if (subtext) {
                        setTimeout(() => {
                            subtext.classList.add('animated');
                        }, 100);
                    }
                });
            }, 300);
        }
    }
    
    // Start animation after page load
    setTimeout(() => {
        animateHeroContent();
    }, 100);

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

    // Animate brother cards as they scroll into view with subtle stagger
    // Use a function that can be called after cards are generated
    function setupCardAnimations() {
        const brotherCards = document.querySelectorAll('.brother-card');
        if (brotherCards.length === 0) {
            // Cards not generated yet, retry
            setTimeout(setupCardAnimations, 100);
            return;
        }
        
        const cardObserver = new IntersectionObserver(function(entries) {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Get card's index to calculate stagger delay
                    const cardIndex = Array.from(brotherCards).indexOf(entry.target);
                    const colIndex = cardIndex % 4; // Column position (0-3)
                    
                    // Subtle stagger: 30ms delay per card in row for smooth sequential appearance
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, colIndex * 30);
                    
                    cardObserver.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px' // Trigger earlier for smoother appearance
        });
        
        brotherCards.forEach((card) => {
            cardObserver.observe(card);
        });
    }
    
    // Setup animations after cards are generated
    setTimeout(setupCardAnimations, 200);

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

    // Custom blue circle cursor - only on desktop (not mobile/touch devices)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0) ||
                     window.innerWidth <= 768;
    
    if (!isMobile) {
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
    }

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
// Use event delegation or wait for cards to be generated
function setupCardHoverEffects() {
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
}

// Setup hover effects after cards are generated
function setupHoverEffectsWithRetry() {
    const cards = document.querySelectorAll('.brother-card');
    if (cards.length === 0) {
        setTimeout(setupHoverEffectsWithRetry, 100);
        return;
    }
    setupCardHoverEffects();
    setupStarButtons(); // Setup star buttons when cards are ready
}
setTimeout(setupHoverEffectsWithRetry, 200);

// Profile Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    const profileModal = document.getElementById('profileModal');
    if (!profileModal) return;
    
    const profileClose = document.querySelector('.profile-close');
    const profileOverlay = document.querySelector('.profile-modal-overlay');
    
    // Setup profile star button
    const profileStarBtn = document.getElementById('profileStarBtn');
    if (profileStarBtn) {
        profileStarBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            // Get brother name from modal data attribute (more reliable than reading DOM)
            const profileModal = document.getElementById('profileModal');
            if (profileModal && profileModal.dataset.currentBrother) {
                const brotherName = profileModal.dataset.currentBrother;
                toggleStar(brotherName);
            } else {
                // Fallback: try reading from profile name element
                const profileName = document.querySelector('.profile-name');
                if (profileName && profileName.textContent) {
                    const brotherName = profileName.textContent;
                    toggleStar(brotherName);
                }
            }
        });
    }
    
    // Use event delegation for dynamically generated buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-profile-btn') || e.target.closest('.view-profile-btn')) {
            const button = e.target.classList.contains('view-profile-btn') ? e.target : e.target.closest('.view-profile-btn');
            e.stopPropagation();
            const card = button.closest('.brother-card');
            if (!card) return;
            const image = card.querySelector('.card-image img');
            const nameElement = card.querySelector('.brother-name');
            const brotherName = nameElement.textContent;
            
            openProfileWithAnimation(brotherName, image, card);
        }
    });
    
    // Close profile modal
    function closeProfile() {
        profileModal.classList.remove('active');
        document.body.style.overflow = '';
        // Clear the current brother name when closing
        if (profileModal) {
            delete profileModal.dataset.currentBrother;
        }
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
        
        // Store current brother name on modal immediately
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            profileModal.dataset.currentBrother = brotherName;
        }
        
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
        // Clear the current brother name from modal
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            delete profileModal.dataset.currentBrother;
        }
        
        // Reset star button state
        const starBtn = document.getElementById('profileStarBtn');
        if (starBtn) {
            starBtn.classList.remove('starred');
            const starIcon = starBtn.querySelector('.profile-star-icon');
            if (starIcon) {
                starIcon.setAttribute('fill', 'none');
            }
        }
        
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
        
        // Store current brother name on modal for easy access
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            profileModal.dataset.currentBrother = brotherName;
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
        
        // Update star button state
        updateProfileStarButton(brotherName);
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
        
        // Update star button
        updateProfileStarButton(brotherName);
        
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
