/* ========================================
   SCRIPT PRINCIPAL - PORTFOLIO WEB
   ======================================== */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeForm();
    initializeAnimations();
    initializeScrollEffects();
    initParticleBackground();
});

/* ========================================
   NAVEGACIÓN Y SCROLL SUAVE
   ======================================== */

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link:not(.contact-btn)');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    // Calcular el offset de la navegación
                    const navHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - navHeight;
                    
                    // Scroll suave
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Marcar como activo
                    navLinks.forEach(l => l.style.color = '');
                    link.style.color = 'var(--color-primary)';
                }
            }
        });
    });

    // Actualizar navegación activa al hacer scroll
    window.addEventListener('scroll', updateActiveNav);
}

function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link:not(.contact-btn)');
    const navHeight = document.querySelector('.header').offsetHeight + 50;

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight;
        const sectionHeight = section.clientHeight;

        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === '#' + currentSection) {
            link.style.color = 'var(--color-primary)';
        } else {
            link.style.color = '';
        }
    });
}

/* ========================================
   FORMULARIO DE CONTACTO
   ======================================== */

function initializeForm() {
    const form = document.querySelector('.contact-form');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Obtener datos del formulario
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                subject: document.getElementById('subject').value.trim(),
                message: document.getElementById('message').value.trim()
            };

            // Validar
            if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                showNotification('Por favor, rellena todos los campos', 'error');
                return;
            }

            // Validar email
            if (!isValidEmail(formData.email)) {
                showNotification('Por favor, introduce un email válido', 'error');
                return;
            }

            // Aquí irían las acciones del servidor
            // Por ahora, mostramos un mensaje de éxito
            handleFormSubmit(formData);
        });
    }
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function handleFormSubmit(formData) {
    // Mostrar el mensaje de éxito
    showNotification('¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.', 'success');

    // Limpiar el formulario después de 1 segundo
    setTimeout(() => {
        document.querySelector('.contact-form').reset();
    }, 500);

    // Aquí se podría enviar los datos a un servidor
    console.log('Datos del formulario:', formData);
}

function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background-color: ${type === 'success' ? 'var(--color-success)' : 
                          type === 'error' ? '#dc3545' : 'var(--color-primary)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

/* ========================================
   ANIMACIONES DE ENTRADA
   ======================================== */

function initializeAnimations() {
    // Observador (Intersection Observer) para animar elementos al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar tarjetas de proyectos y destacados
    document.querySelectorAll('.project-card, .highlight-item').forEach(el => {
        observer.observe(el);
    });
}

/* ========================================
   EFECTOS AL HACER SCROLL
   ======================================== */

function initializeScrollEffects() {
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Efecto de sombra en el header al hacer scroll
        if (scrollY > 10) {
            header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
        }
    });
}

/* ========================================
   ANIMACIONES CSS (en el archivo style.css)
   ======================================== */

// Inyectar estilos de animación adicionales
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

/* ========================================
   UTILIDADES
   ======================================== */

// Función de utilidad para debounce (útil para eventos frecuentes)
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/* ========================================
   FONDO DE PARTÍCULAS — TECH BACKGROUND
   ======================================== */

function initParticleBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'tech-bg-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    let W, H, particles;
    const COUNT = 90;
    const MAX_DIST = 160;
    const GR = 150, GG = 108, GB = 8; // deep gold for light bg

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function Particle() {
        this.x = Math.random() * (W || window.innerWidth);
        this.y = Math.random() * (H || window.innerHeight);
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.r = Math.random() * 1.6 + 0.8;
        this.alpha = Math.random() * 0.28 + 0.12;
    }

    Particle.prototype.update = function () {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -10) this.x = W + 10;
        else if (this.x > W + 10) this.x = -10;
        if (this.y < -10) this.y = H + 10;
        else if (this.y > H + 10) this.y = -10;
    };

    Particle.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GR},${GG},${GB},${this.alpha})`;
        ctx.fill();
    };

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < COUNT; i++) particles.push(new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distSq = dx * dx + dy * dy;
                if (distSq < MAX_DIST * MAX_DIST) {
                    const alpha = (1 - Math.sqrt(distSq) / MAX_DIST) * 0.13;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${GR},${GG},${GB},${alpha})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        requestAnimationFrame(animate);
    }

    init();
    animate();
    window.addEventListener('resize', debounce(() => { init(); }, 200));
}

// Log de inicialización
console.log('✓ Portfolio inicializado correctamente');
console.log('✓ Navegación activa');
console.log('✓ Formulario de contacto listo');
console.log('✓ Animaciones habilitadas');
