// ================================================
// PREVIEW GENERATOR LOGIC
// ================================================

/**
 * ИНТЕГРАЦИЯ С ИИ:
 * 
 * Для использования реального ИИ замените функцию generatePreview():
 * 
 * 1. MIDJOURNEY API:
 *    - API: https://api.midjourney.com/v1/imagine
 *    - Отправьте: photo + параметры + prompt
 *    - Получите: image URL
 * 
 * 2. DALL-E 3 (OpenAI):
 *    - API: https://api.openai.com/v1/images/generations
 *    - Параметр: model: "dall-e-3"
 *    - Prompt генерируется из параметров формы
 * 
 * 3. RECRAFT:
 *    - API: https://api.recraft.ai/v1/images/generations
 *    - Хорошая стилизация и контроль
 * 
 * 4. SPLINE (для 3D):
 *    - Embed: <iframe src="https://my.spline.design/..."></iframe>
 *    - Или Three.js для полного контроля
 * 
 * СХЕМА ОТПРАВКИ:
 * 
 * fetch('YOUR_API_ENDPOINT', {
 *     method: 'POST',
 *     headers: {
 *         'Content-Type': 'application/json',
 *         'Authorization': 'Bearer YOUR_API_KEY'
 *     },
 *     body: JSON.stringify({
 *         image: photoBase64,  // закодировано в base64
 *         gender: formData.gender,
 *         clothing: formData.clothing,
 *         pose: formData.pose,
 *         accessories: formData.accessories,
 *         colorScheme: formData.color,
 *         prompt: buildPrompt(formData)  // генерируем текстовый промт
 *     })
 * })
 * .then(res => res.json())
 * .then(data => {
 *     // data.imageUrl содержит готовый результат
 *     displayPreview(data.imageUrl);
 * })
 */

function generateAIPrompt(formData) {
    // Генерируем текстовый промт для ИИ на основе параметров формы
    const genderText = {
        male: 'мужчину',
        female: 'женщину',
        neutral: 'человека'
    }[formData.gender] || 'человека';

    const clothingText = {
        casual: 'в casual одежде',
        formal: 'в деловом костюме',
        tech: 'в hoodie и кроссовках',
        custom: 'в пользовательском стиле'
    }[formData.clothing] || '';

    const poseText = {
        standing: 'стоящего спокойно',
        sitting: 'сидящего',
        working: 'работающего',
        dynamic: 'в динамичной позе'
    }[formData.pose] || '';

    const colorText = {
        vibrant: 'яркая и весёлая',
        professional: 'профессиональная',
        pastel: 'пастельная',
        dark: 'тёмная и стильная'
    }[formData.color] || '';

    const accessories = formData.accessories.length > 0 
        ? ', с ' + formData.accessories.join(', ')
        : '';

    return `Создай реалистичную 3D-фигурку кастомную фигурку ${genderText} ${clothingText}, ${poseText}${accessories}. Цветовая схема: ${colorText}. Стиль: профессиональный и дружелюбный. Высокое качество, детализированная работа.`;
}

function generatePreview() {
    const previewForm = document.getElementById('previewForm');
    const photoInput = document.getElementById('photoUpload');
    const genderSelect = document.getElementById('gender');
    const clothingSelect = document.getElementById('clothing');
    const poseSelect = document.getElementById('pose');
    const colorSelect = document.getElementById('color');
    const previewBox = document.getElementById('previewBox');
    const canvas3d = document.getElementById('canvas3d');
    const controls3d = document.getElementById('controls3d');
    const previewInfo = document.getElementById('previewInfo');
    const previewMessage = document.getElementById('previewMessage');

    // Проверяем все поля
    if (!photoInput.files[0]) {
        showPreviewMessage('❌ Пожалуйста, загрузите фото', 'error');
        return;
    }

    if (!genderSelect.value || !clothingSelect.value || !poseSelect.value || !colorSelect.value) {
        showPreviewMessage('❌ Пожалуйста, выберите все параметры', 'error');
        return;
    }

    // Собираем выбранные аксессуары
    const selectedAccessories = Array.from(document.querySelectorAll('input[name="accessories"]:checked'))
        .map(cb => cb.value);

    const formData = {
        photo: photoInput.files[0],
        gender: genderSelect.value,
        clothing: clothingSelect.value,
        pose: poseSelect.value,
        accessories: selectedAccessories,
        color: colorSelect.value
    };

    // Показываем loading
    showPreviewMessage('⏳ Генерируем 3D модель...', 'loading');
    previewInfo.style.display = 'none';

    // Читаем фото в base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const photoBase64 = e.target.result;

        console.log('Form Data:', formData);
        console.log('Photo loaded');

        // Инициализируем Three.js если ещё не инициализировано
        if (!scene) {
            initThreeJS();
        }

        // Обновляем 3D модель на основе параметров
        updateFigurine(formData);

        // Скрываем 2D фото и показываем 3D canvas
        previewBox.style.display = 'none';
        canvas3d.style.display = 'block';
        controls3d.style.display = 'block';

        // Показываем информацию и кнопки
        previewInfo.style.display = 'block';
        previewMessage.style.display = 'none';

        // Показываем успешное сообщение
        showPreviewMessage('✅ 3D модель готова! Вращайте для осмотра со всех сторон', 'success');

        // Через 3 секунды скрываем сообщение
        setTimeout(() => {
            previewMessage.style.display = 'none';
        }, 3000);
    };

    reader.readAsDataURL(photoInput.files[0]);
}

function createPhotoPreview(photoDataUrl, formData, previewBox, previewInfo, previewMessage) {
    // Очищаем placeholder
    previewBox.innerHTML = '';

    // Создаём контейнер для фото и информации
    const previewContainer = document.createElement('div');
    previewContainer.style.position = 'relative';
    previewContainer.style.width = '100%';
    previewContainer.style.height = '100%';

    // Создаём img элемент с реальным фото
    const img = document.createElement('img');
    img.src = photoDataUrl;
    img.alt = 'Загруженное фото сотрудника';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '10px';

    previewContainer.appendChild(img);

    // Создаём информационный оверлей с параметрами
    const infoOverlay = document.createElement('div');
    infoOverlay.style.position = 'absolute';
    infoOverlay.style.bottom = '0';
    infoOverlay.style.left = '0';
    infoOverlay.style.right = '0';
    infoOverlay.style.background = 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)';
    infoOverlay.style.padding = '30px 20px 20px';
    infoOverlay.style.borderRadius = '0 0 10px 10px';
    infoOverlay.style.color = 'white';
    infoOverlay.style.animation = 'slideUp 0.5s ease';

    // Информация о параметрах
    const params = document.createElement('div');
    params.style.fontSize = '13px';
    params.style.lineHeight = '1.8';

    const paramTexts = [
        `👤 ${getReadableOption(formData.gender)}`,
        `👕 ${getReadableOption(formData.clothing)}`,
        `💃 ${getReadableOption(formData.pose)}`,
        `🎨 ${getReadableOption(formData.color)}`
    ];

    if (formData.accessories.length > 0) {
        paramTexts.push(`🎁 ${formData.accessories.map(a => getReadableOption(a)).join(', ')}`);
    }

    params.innerHTML = paramTexts.join('<br>');
    infoOverlay.appendChild(params);
    previewContainer.appendChild(infoOverlay);

    // Добавляем закруглённый бордер
    previewBox.style.borderRadius = '15px';
    previewBox.style.overflow = 'hidden';
    previewBox.style.border = '3px solid #667eea';
    previewBox.appendChild(previewContainer);

    // Показываем информацию и кнопки
    previewInfo.style.display = 'block';
    previewMessage.style.display = 'none';

    // Показываем успешное сообщение
    showPreviewMessage('✅ Фото загружено! Выберите параметры фигурки и нажмите "Подтвердить заказ"', 'success');

    // Через 3 секунды скрываем сообщение
    setTimeout(() => {
        previewMessage.style.display = 'none';
    }, 3000);
}

function callAIAPI(photoBase64, formData, prompt) {
    // ================================================
    // ЗАМЕНИТЕ ЭТОТ КОД НА РЕАЛЬНЫЙ API ВЫЗОВ
    // ================================================
    
    // ВАРИАНТ 1: Реальный API (расскомментируйте и добавьте ключ)
    // const apiKey = 'YOUR_OPENAI_API_KEY';
    // const endpoint = 'https://api.openai.com/v1/images/generations';
    // 
    // return fetch(endpoint, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${apiKey}`
    //     },
    //     body: JSON.stringify({
    //         model: 'dall-e-3',
    //         prompt: prompt,
    //         n: 1,
    //         size: '1024x1024',
    //         quality: 'hd'
    //     })
    // })
    // .then(res => res.json())
    // .then(data => {
    //     if (data.data && data.data[0]) {
    //         return data.data[0].url;
    //     }
    //     throw new Error('No image in response');
    // });

    // Эта функция больше не используется с новой реализацией
    // Фото загружается напрямую в createPhotoPreview()
    return Promise.resolve('');
}

function generateMockPreview(formData) {
    // Эта функция больше не используется с новой реализацией
    // Фото теперь загружается напрямую
    return null;
}

function getReadableOption(value) {
    const options = {
        casual: 'Casual (повседневная)',
        formal: 'Formal (деловой)',
        tech: 'Tech (hoodie + кроссовки)',
        custom: 'Индивидуальный стиль',
        male: '👨 Мужчина',
        female: '👩 Женщина',
        neutral: '👤 Не указывать',
        standing: 'Стоя, спокойно',
        sitting: 'Сидя',
        working: 'За работой',
        dynamic: 'Динамичная поза',
        vibrant: 'Яркая и весёлая',
        professional: 'Профессиональная',
        pastel: 'Пастельная',
        dark: 'Тёмная и стильная',
        glasses: 'Очки',
        beard: 'Борода',
        cap: 'Кепка',
        laptop: 'Ноутбук',
        coffee: 'Кружка кофе'
    };
    return options[value] || value;
}

function displayPreview(imageUrl, previewBox, previewInfo, previewMessage) {
    // Очищаем placeholder
    previewBox.innerHTML = '';

    // Создаём img элемент
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Ваш превью фигурки';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';

    previewBox.appendChild(img);

    // Показываем информацию и кнопки
    previewInfo.style.display = 'block';
    previewMessage.style.display = 'none';

    // Скрываем сообщение об ошибке/загрузке
    showPreviewMessage('✅ Превью готово! Вот как будет выглядеть ваша фигурка', 'success');

    // Через 3 секунды скрываем сообщение
    setTimeout(() => {
        previewMessage.style.display = 'none';
    }, 3000);
}

function showPreviewMessage(message, type) {
    const previewMessage = document.getElementById('previewMessage');
    previewMessage.textContent = message;
    previewMessage.classList.remove('loading', 'success', 'error');
    previewMessage.classList.add(type);
    previewMessage.style.display = 'block';
}

// ================================================
// FORM SUBMISSION HANDLER
// ================================================
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = {
                name: contactForm.querySelector('input[placeholder="Ваше имя"]').value,
                email: contactForm.querySelector('input[placeholder="Ваш email"]').value,
                phone: contactForm.querySelector('input[placeholder="Номер телефона"]').value,
                company: contactForm.querySelector('input[placeholder="Название компании"]').value,
                figureType: contactForm.querySelector('select').value,
                message: contactForm.querySelector('textarea').value
            };

            // Validate form
            if (!formData.name || !formData.email || !formData.phone || !formData.company || !formData.figureType) {
                showMessage('Пожалуйста, заполните все поля формы', 'error');
                return;
            }

            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                showMessage('Пожалуйста, введите корректный email', 'error');
                return;
            }

            // Validate phone
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(formData.phone)) {
                showMessage('Пожалуйста, введите корректный номер телефона', 'error');
                return;
            }

            // Show success message (in real app, would send to server)
            console.log('Данные заказа:', formData);
            showMessage('✓ Спасибо! Мы получили ваш заказ. Менеджер свяжется с вами в течение часа.', 'success');

            // Reset form
            contactForm.reset();

            // Hide message after 5 seconds
            setTimeout(() => {
                formMessage.classList.remove('success', 'error');
                formMessage.textContent = '';
            }, 5000);
        });
    }

    // ================================================
    // PREVIEW FORM HANDLERS
    // ================================================

    const generateBtn = document.getElementById('generateBtn');
    const confirmBtn = document.getElementById('confirmBtn');
    const editBtn = document.getElementById('editBtn');
    const previewForm = document.getElementById('previewForm');

    if (generateBtn) {
        generateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            generatePreview();
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            // Собираем данные превью для финального заказа
            const photoInput = document.getElementById('photoUpload');
            const genderSelect = document.getElementById('gender');
            const clothingSelect = document.getElementById('clothing');
            const poseSelect = document.getElementById('pose');
            const colorSelect = document.getElementById('color');
            
            const selectedAccessories = Array.from(document.querySelectorAll('input[name="accessories"]:checked'))
                .map(cb => cb.value);

            const previewData = {
                photo: photoInput.files[0]?.name || 'uploaded_photo.jpg',
                gender: genderSelect.value,
                clothing: clothingSelect.value,
                pose: poseSelect.value,
                accessories: selectedAccessories,
                color: colorSelect.value,
                timestamp: new Date().toISOString()
            };

            console.log('Заказ подтвержден:', previewData);
            
            // Переходим на форму заказа и заполняем дополнительные данные
            document.querySelector('.contact-section').scrollIntoView({ behavior: 'smooth' });
            
            // Показываем сообщение
            showMessage('✓ Отлично! Ваш дизайн сохранён. Теперь заполните форму заказа для доставки', 'success', 'contactForm');
        });
    }

    if (editBtn) {
        editBtn.addEventListener('click', function() {
            // Скрываем превью и показываем форму для редактирования
            document.getElementById('previewInfo').style.display = 'none';
            document.getElementById('canvas3d').style.display = 'none';
            document.getElementById('controls3d').style.display = 'none';
            document.getElementById('previewBox').style.display = 'block';
            previewForm.scrollIntoView({ behavior: 'smooth' });
            showPreviewMessage('✎ Измените параметры и нажмите "Генерировать превью"', 'loading');
        });
    }

    // ================================================
    // 3D / 2D TOGGLE
    // ================================================
    const toggle3d = document.getElementById('toggle3d');
    if (toggle3d) {
        toggle3d.addEventListener('change', function() {
            const previewBox = document.getElementById('previewBox');
            const canvas3d = document.getElementById('canvas3d');
            const controls3d = document.getElementById('controls3d');

            if (this.checked) {
                // Переключаемся на 2D
                canvas3d.style.display = 'none';
                controls3d.style.display = 'none';
                previewBox.style.display = 'block';
                this.nextElementSibling.textContent = 'Переключить на 3D';
            } else {
                // Переключаемся на 3D
                previewBox.style.display = 'none';
                canvas3d.style.display = 'block';
                controls3d.style.display = 'block';
                this.nextElementSibling.textContent = 'Переключить на 2D';
            }
        });
    }

    // Helper function to show messages
    function showMessage(message, type, targetId = 'formMessage') {
        const formMessage = document.getElementById(targetId);
        if (formMessage) {
            formMessage.textContent = message;
            formMessage.classList.remove('success', 'error');
            formMessage.classList.add(type);
            
            setTimeout(() => {
                formMessage.classList.remove('success', 'error');
                formMessage.textContent = '';
            }, 5000);
        }
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.audience-card, .step-card, .benefit-card, .gallery-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add hover effect for CTA buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// Add ripple effect styles dynamically
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        pointer-events: none;
        animation: ripple-animation 0.6s ease-out;
    }

    @keyframes ripple-animation {
        to {
            opacity: 0;
            transform: scale(2);
        }
    }

    /* Smooth transitions for all interactive elements */
    button, a, input, textarea, select {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);
