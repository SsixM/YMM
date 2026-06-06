document.addEventListener('DOMContentLoaded', () => {

    // 1. АВТОМАТИЧЕСКАЯ СИНХРОНИЗАЦИЯ И ПЛАВНЫЙ CROSS-FADE СЛОЕВ ФОНА
    const sections = document.querySelectorAll('[data-bg]');
    const bgLayers = document.querySelectorAll('.bg-layer');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        threshold: 0.3, // Активируем слой, когда 30% секции заходит в область видимости
        rootMargin: '0px'
    };

    const bgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bgIndex = entry.target.getAttribute('data-bg');
                
                // Переключаем активную картинку на бэкграунде плавным угасанием/проявлением
                bgLayers.forEach((layer, idx) => {
                    if (idx === (parseInt(bgIndex) - 1)) {
                        layer.classList.add('active');
                    } else {
                        layer.classList.remove('active');
                    }
                });

                // Синхронизируем активный пункт меню навигации
                navLinks.forEach(link => {
                    if (link.getAttribute('data-section') === bgIndex) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        bgObserver.observe(section);
    });


    // 2. УПРАВЛЕНИЕ ТАБАМИ БАЗЫ ЗНАНИЙ
    const tabTriggers = document.querySelectorAll('.kb-tab-trigger');
    const tabPanels = document.querySelectorAll('.kb-tab-panel');

    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetId = trigger.getAttribute('data-target');

            tabTriggers.forEach(btn => btn.classList.remove('active'));
            trigger.classList.add('active');

            tabPanels.forEach(panel => {
                if (panel.getAttribute('id') === targetId) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });
        });
    });


    // 3. МЯГКАЯ СМУЗ-АНИМАЦИЯ ПОЯВЛЕНИЯ ПЛИТОК КОНТЕНТА
    const appearanceObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.02 });

    const animatedElements = document.querySelectorAll('.feat-card, .rpc-showcase-box, .download-card, .kb-container');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(15px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        appearanceObserver.observe(el);
    });
});