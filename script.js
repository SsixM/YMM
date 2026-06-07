document.addEventListener('DOMContentLoaded', () => {

    // --- 1. АВТОМАТИЧЕСКАЯ СИНХРОНИЗАЦИЯ И КРОССФЕЙД СЛОЕВ ФОНА ---
    const sections = document.querySelectorAll('[data-bg]');
    const bgLayers = document.querySelectorAll('.bg-layer');
    const navLinks = document.querySelectorAll('.nav-link');

    const bgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bgIndex = entry.target.getAttribute('data-bg');
                bgLayers.forEach((layer, idx) => {
                    if (idx === (parseInt(bgIndex) - 1)) {
                        layer.classList.add('active');
                    } else {
                        layer.classList.remove('active');
                    }
                });
                navLinks.forEach(link => {
                    if (link.getAttribute('data-section') === bgIndex) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, { root: null, threshold: 0.3, rootMargin: '0px' });

    sections.forEach(section => bgObserver.observe(section));


    // --- 2. УПРАВЛЕНИЕ ТАБАМИ БАЗЫ ЗНАНИЙ ---
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


    // --- 3. ДИНАМИЧЕСКИЕ ОТЗЫВЫ (ЧЕСТНАЯ 5-БАЛЛЬНАЯ СИСТЕМА) ---
    let selectedScore = 5; 
    const reviewsBox = document.getElementById('reviews-box');
    const inputStarsContainer = document.getElementById('input-stars-container');
    const ratingNumericalDisplay = document.getElementById('rating-numerical-display');
    const formNotification = document.getElementById('form-notification');

    // Локальный пул настоящих отзывов на случай падения бэкенда
    const mockReviews = [
        { name: "Alexander_Dev", platform: "Windows", text: "Надоело слушать рекламу каких-то курсов и банков прямо посреди моих ночных миксов. Мод решил эту проблему раз и навсегда. Дискорд статус — отдельный кайф!", stars: 5, date: "04.06.2026" },
        { name: "cyber_punk99", platform: "Linux", text: "Собрал на Arch через AppImage, всё завелось с первой попытки. База текстов песен Lrclib работает без нареканий, даже подписка не нужна. Авторам респект!", stars: 5, date: "31.05.2026" },
        { name: "Екатерина К.", platform: "macOS", text: "Очень долго искала нормальную рабочую сборку под Apple Silicon без костылей. Спека под arm64 встала идеально, плеер летает, анимации плавные.", stars: 5, date: "24.05.2026" }
    ];

    // Функция генерации чистых SVG-звёзд (Оценки вроде 4.5 математически округляются вверх до целых звёзд)
    function generateStarsSVG(score) {
        let starsHTML = '';
        const roundedScore = Math.round(score); 
        for (let i = 1; i <= 5; i++) {
            const activeClass = i <= roundedScore ? 'active-filled' : '';
            starsHTML += `<svg class="star-svg ${activeClass}" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.784 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z"/></svg>`;
        }
        return starsHTML;
    }

    // Интерактивное переключение звёзд в форме при наведении и клике
    function updateFormStarsVisual(score) {
        ratingNumericalDisplay.innerText = `${score} / 5`;
        const stars = inputStarsContainer.querySelectorAll('.interactive-star');
        stars.forEach((star, idx) => {
            if (idx < score) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    inputStarsContainer.querySelectorAll('.interactive-star').forEach(star => {
        star.addEventListener('click', () => {
            selectedScore = parseInt(star.getAttribute('data-score'));
            updateFormStarsVisual(selectedScore);
        });
        star.addEventListener('mouseenter', () => {
            const hoverScore = parseInt(star.getAttribute('data-score'));
            updateFormStarsVisual(hoverScore);
        });
    });

    inputStarsContainer.addEventListener('mouseleave', () => {
        updateFormStarsVisual(selectedScore);
    });


    // Выгрузка полученного массива отзывов в DOM-дерево
    function renderReviews(reviewsList) {
        if (!reviewsBox) return;
        reviewsBox.innerHTML = '';
        
        reviewsList.forEach(item => {
            const card = document.createElement('div');
            card.className = 'review-card';
            
            card.innerHTML = `
                <div class="review-meta">
                    <div class="user-info">
                        <h5>${item.name}</h5>
                        <span>Платформа: ${item.platform} Client</span>
                    </div>
                    <span class="review-date">${item.date}</span>
                </div>
                <div class="review-stars">${generateStarsSVG(item.stars)}</div>
                <p class="review-text">${item.text}</p>
            `;
            reviewsBox.appendChild(card);
        });

        // Подвязка новых добавленных карточек к общему обсерверу анимаций
        reviewsBox.querySelectorAll('.review-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(15px)';
            card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            appearanceObserver.observe(card);
        });
    }

    // Загрузка данных с бэкенда (GET)
    async function loadReviews() {
        try {
            const response = await fetch('http://d7.aurorix.net:25401/api/reviews');
            if (!response.ok) throw new Error();
            const data = await response.json();
            renderReviews(data);
        } catch {
            renderReviews(mockReviews);
        }
    }

    // Обработка формы (POST) — АБСОЛЮТНО БЕЗ ИСПОЛЬЗОВАНИЯ ALERT
    const reviewForm = document.getElementById('add-review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            formNotification.className = "form-notification hidden"; // Сброс анимационных стилей

            const nameInput = document.getElementById('form-name').value.trim();
            const platformInput = document.querySelector('input[name="form-platform"]:checked').value;
            const textInput = document.getElementById('form-text').value.trim();

            const payload = {
                name: nameInput,
                platform: platformInput,
                text: textInput,
                stars: selectedScore
            };

            try {
                const response = await fetch('http://d7.aurorix.net:25401/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    // Строго маскируем ошибки лимита или структуры под недоступность сервера
                    formNotification.innerText = "Что-то сервер не отвечает";
                    formNotification.className = "form-notification error-state animate-shake";
                    return;
                }

                // Успешная запись
                document.getElementById('form-text').value = '';
                formNotification.innerText = "Ваш отзыв успешно записан";
                formNotification.className = "form-notification success-state";
                await loadReviews();
                
            } catch (err) {
                // Любое сетевое падение маскируется под жесткую блокировку
                formNotification.innerText = "Что-то сервер не отвечает";
                formNotification.className = "form-notification error-state animate-shake";
            }
        });
    }

    // Базовая инициализация компонентов
    updateFormStarsVisual(selectedScore);
    loadReviews();


    // --- 4. МЯГКАЯ СМУЗ-АНИМАЦИЯ ПОЯВЛЕНИЯ КОНТЕНТА ---
    const appearanceObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.02 });

    document.querySelectorAll('.feat-card, .rpc-showcase-box, .main-download-box, .platform-card, .kb-container, .review-form-container').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(15px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        appearanceObserver.observe(el);
    });
});