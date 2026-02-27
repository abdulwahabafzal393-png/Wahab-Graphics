document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply animation to sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.6s ease-out';
        observer.observe(section);
    });

    // Modal Logic
    const modal = document.getElementById('gallery-modal');
    const trigger = document.getElementById('social-media-trigger');
    const closeBtn = document.querySelector('.close-modal');

    if (trigger) {
        trigger.addEventListener('click', () => {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Stop scrolling
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        });
    }

    // Close modal if clicking outside the content
    window.addEventListener('click', (e) => {
        if (modal && e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Dynamic Gallery Logic
    const galleryContainer = document.querySelector('.modal-gallery') || document.querySelector('.portfolio-grid');
    const isSubPage = window.location.pathname.includes('printing-work/') ||
        window.location.pathname.includes('printing-work.html') ||
        window.location.pathname.includes('social-media.html') ||
        window.location.pathname.includes('view-work.html') ||
        window.location.pathname.includes('logos.html');

    if (galleryContainer && isSubPage) {
        const urlParams = new URLSearchParams(window.location.search);
        let category = urlParams.get('category');

        const loadGallery = (data) => {
            if (!category) {
                const path = window.location.pathname;
                if (path.includes('wedding-cards')) category = 'wedding-cards';
                else if (path.includes('panaflex')) category = 'panaflex';
                else if (path.includes('stickers')) category = 'stickers';
                else if (path.includes('bill-books')) category = 'bill-books';
                else if (path.includes('brochures')) category = 'brochures';
                else if (path.includes('business-cards')) category = 'business-cards';
                else if (path.includes('social-media.html')) category = 'facebook-designs';
                else if (path.includes('logos.html')) category = 'logos';
            }

            let projects = [];
            if (category === 'printing') projects = data.printing;
            else if (category === 'social') projects = data.social;
            else if (category === 'wallpaper') projects = data.wallpaper;
            else if (category === 'designing') projects = data.designing;
            else if (category === 'logos') projects = data.logos;
            else {
                projects = [
                    ...data.printing,
                    ...data.social,
                    ...data.wallpaper,
                    ...(data.designing || []),
                    ...(data.logos || [])
                ].filter(p => p.category === category || !category);
            }

            if (projects.length > 0) {
                if (!window.location.pathname.includes('index.html')) {
                    galleryContainer.innerHTML = '';
                }

                projects.forEach(project => {
                    const img = document.createElement('img');
                    img.src = window.location.pathname.includes('printing-work/') ? '../' + project.src : project.src;
                    img.alt = project.title;
                    img.className = 'gallery-img';
                    img.addEventListener('click', () => openLightbox(img.src));
                    galleryContainer.appendChild(img);
                });
            }
        };

        // Use local projectsData variable if available (fixes CORS for local files)
        if (typeof projectsData !== 'undefined') {
            loadGallery(projectsData);
        } else {
            // Fallback to fetch for server environments
            fetch(window.location.pathname.includes('printing-work/') ? '../projects.json' : 'projects.json')
                .then(res => res.json())
                .then(data => loadGallery(data))
                .catch(err => console.error('Error loading projects:', err));
        }
    }

    function openLightbox(src) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        if (lightbox && lightboxImg) {
            lightbox.style.display = 'flex';
            lightboxImg.src = src;
            loadSocialData(src);
        }
    }

    // Lightbox Logic (Refactored)
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightbox = document.querySelector('.close-lightbox');

    if (lightbox && lightboxImg) {
        const likeBtn = document.getElementById('like-btn');
        const likeCount = document.getElementById('like-count');
        const commentInput = document.getElementById('comment-input');
        const postCommentBtn = document.getElementById('post-comment-btn');
        const commentsList = document.getElementById('comments-list');

        let currentImgSrc = '';

        window.loadSocialData = function (src) {
            currentImgSrc = src;
            const data = JSON.parse(localStorage.getItem(src)) || { likes: 0, comments: [] };
            likeCount.textContent = data.likes;

            commentsList.innerHTML = '';
            data.comments.forEach(comment => {
                const item = document.createElement('div');
                item.className = 'comment-item';
                item.innerHTML = `<p>${comment}</p>`;
                commentsList.appendChild(item);
            });
        };

        // Existing images that might be hardcoded
        document.querySelectorAll('.gallery-img').forEach(img => {
            img.addEventListener('click', () => openLightbox(img.src));
        });
    }

    // Live Chat Widget Logic
    const chatWidget = document.getElementById('chat-widget');
    const chatToggle = document.getElementById('chat-toggle');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatMessages = document.getElementById('chat-messages');

    if (chatToggle && chatWidget) {
        chatToggle.addEventListener('click', () => {
            chatWidget.classList.toggle('active');
        });

        const sendMessage = () => {
            const text = chatInput.value.trim();
            if (text) {
                // Add user message to UI
                const userMsg = document.createElement('div');
                userMsg.className = 'message user';
                userMsg.textContent = text;
                chatMessages.appendChild(userMsg);

                chatInput.value = '';
                chatMessages.scrollTop = chatMessages.scrollHeight;

                // Redirect to WhatsApp after a short delay
                setTimeout(() => {
                    const waUrl = `https://wa.me/923115621959?text=${encodeURIComponent(text)}`;
                    window.open(waUrl, '_blank');
                }, 500);
            }
        };

        sendChatBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // QR Modal Logic
    const qrModal = document.getElementById('qr-modal');
    const qrTrigger = document.getElementById('qr-trigger');
    const closeQr = document.querySelector('.close-qr');

    if (qrTrigger && qrModal) {
        qrTrigger.addEventListener('click', () => {
            qrModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });

        if (closeQr) {
            closeQr.addEventListener('click', () => {
                qrModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === qrModal) {
                qrModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
});
