/* ==========================================================================
   INTERACTIVE PORTFOLIO ENGINE - ZIAD FARAG (2026)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const avatarContainer = document.getElementById('avatar-container');
    const avatarInput = document.getElementById('avatar-input');
    const avatarImg = document.getElementById('avatar-img');
    
    const downloadCvBtn = document.getElementById('download-cv-btn');
    const uploadCvTrigger = document.getElementById('upload-cv-trigger');
    const cvInput = document.getElementById('cv-input');
    
    const resetStorageBtn = document.getElementById('reset-storage-btn');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const cards = document.querySelectorAll('.card');

    // 1. Toast Notification System
    function showToast(message, type = 'success', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'warning' ? 'toast-warning' : type === 'info' ? 'toast-info' : ''}`;
        
        let icon = '<i class="fa-solid fa-circle-check"></i>';
        if (type === 'error') {
            icon = '<i class="fa-solid fa-circle-xmark"></i>';
        } else if (type === 'warning') {
            icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
        } else if (type === 'info') {
            icon = '<i class="fa-solid fa-circle-info"></i>';
        }

        toast.innerHTML = `${icon}<span>${message}</span>`;
        container.appendChild(toast);

        // Remove toast after animation
        setTimeout(() => {
            toast.style.animation = 'none';
            toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, duration);
    }

    // 2. Profile Avatar Persistence Logic
    // Load stored avatar from localStorage
    function loadSavedAvatar() {
        const storedAvatar = localStorage.getItem('user_avatar');
        if (storedAvatar) {
            avatarImg.src = storedAvatar;
        } else {
            // Default image falls back to the local copied image
            avatarImg.src = 'assets/avatar.jpg';
        }
    }

    avatarContainer.addEventListener('click', () => {
        avatarInput.click();
    });

    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Image validation
        if (!file.type.startsWith('image/')) {
            showToast('Invalid file format. Please upload an image.', 'error');
            return;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB >= 2) {
            showToast('Image size exceeds 2MB limit.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const base64String = event.target.result;
            // Persist base64 representation to localStorage
            try {
                localStorage.setItem('user_avatar', base64String);
                avatarImg.src = base64String;
                showToast('Profile image updated successfully.');
            } catch (error) {
                console.error('Storage error:', error);
                showToast('Failed to save image. Browser local storage limit exceeded.', 'error');
            }
        };
        reader.readAsDataURL(file);
    });

    // 3. CV Binding and Persistence Logic
    // Load stored CV from localStorage
    function loadSavedCv() {
        const storedCvData = localStorage.getItem('user_cv');
        if (storedCvData) {
            try {
                const cvFile = JSON.parse(storedCvData);
                bindCvToDownload(cvFile.data, cvFile.name);
            } catch (err) {
                console.error('Failed to parse saved CV:', err);
                unbindCvDownload();
            }
        } else {
            unbindCvDownload();
        }
    }

    function bindCvToDownload(dataUrl, filename) {
        downloadCvBtn.href = dataUrl;
        downloadCvBtn.setAttribute('download', filename);
        downloadCvBtn.classList.remove('btn-disabled');
        // Add a subtle title to the download button
        downloadCvBtn.title = `Click to download: ${filename}`;
        
        // Visual indicator that CV is loaded
        const checkIcon = downloadCvBtn.querySelector('.fa-check-double') || document.createElement('i');
        checkIcon.className = 'fa-solid fa-circle-check cv-status-indicator';
        checkIcon.style.color = '#00FFA3';
        checkIcon.style.marginLeft = '0.5rem';
        if (!downloadCvBtn.querySelector('.cv-status-indicator')) {
            downloadCvBtn.appendChild(checkIcon);
        }
    }

    function unbindCvDownload() {
        downloadCvBtn.href = '#';
        downloadCvBtn.removeAttribute('download');
        downloadCvBtn.title = 'No CV uploaded. Use the settings gear icon to upload your CV.';
        const indicator = downloadCvBtn.querySelector('.cv-status-indicator');
        if (indicator) indicator.remove();
    }

    uploadCvTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        cvInput.click();
    });

    cvInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation: .pdf or .docx
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const validExtensions = ['pdf', 'docx'];
        if (!validExtensions.includes(fileExtension)) {
            showToast('Invalid file type. Please upload a PDF or DOCX file.', 'error');
            return;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB >= 2) {
            showToast('CV file size exceeds 2MB limit.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const base64String = event.target.result;
            const cvObject = {
                name: file.name,
                type: file.type,
                data: base64String
            };

            try {
                localStorage.setItem('user_cv', JSON.stringify(cvObject));
                bindCvToDownload(base64String, file.name);
                showToast('CV uploaded and bound successfully.');
            } catch (error) {
                console.error('Storage error:', error);
                showToast('Failed to save CV. Browser storage limit exceeded.', 'error');
            }
        };
        reader.readAsDataURL(file);
    });

    // Handle CV download click when empty
    downloadCvBtn.addEventListener('click', (e) => {
        const hasCv = localStorage.getItem('user_cv') !== null;
        if (!hasCv) {
            e.preventDefault();
            showToast('No CV bound. Click the gear settings icon next to this button to upload your CV first!', 'warning', 5000);
        }
    });

    // 4. Utility Data Reset Button
    resetStorageBtn.addEventListener('click', () => {
        localStorage.removeItem('user_avatar');
        localStorage.removeItem('user_cv');
        showToast('Local custom data wiped. Restoring defaults...', 'info');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    });

    // 5. Scroll Effects (Header and Active Section Links)
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Scroll spy active highlights
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });

    // 6. Mobile Sidebar Toggle Menu
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('open')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars-staggered';
        }
    });

    // Close mobile menu when nav link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            const icon = mobileToggle.querySelector('i');
            icon.className = 'fa-solid fa-bars-staggered';
        });
    });

    // 7. Interactive Hover Cursor Glow Effect for Cards
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Initialize Page
    loadSavedAvatar();
    loadSavedCv();
    
    // Welcome Toast message
    setTimeout(() => {
        showToast('Welcome to Ziad Farag\'s Interactive Space!', 'info');
    }, 1000);
});
