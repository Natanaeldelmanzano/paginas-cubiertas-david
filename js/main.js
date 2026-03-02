/*
 * ═══════════════════════════════════════════════════════════════════
 * CUBIERTAS DAVID - JAVASCRIPT PRINCIPAL
 * Sin librerías externas. Vanilla JS puro.
 * ═══════════════════════════════════════════════════════════════════
 *
 * MÓDULOS:
 * 1. Menú hamburguesa móvil
 * 2. Header sticky con reducción al hacer scroll
 * 3. Scroll suave para anclas
 * 4. Lazy loading de imágenes
 * 5. Tracking de clics (teléfono, WhatsApp) para GA4
 * 6. FAQ acordeón
 * 7. Scroll reveal (animación al aparecer)
 * ═══════════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', function () {

    /* ═══════════════════════════════════════════════════════════════
       1. MENÚ HAMBURGUESA PARA MÓVIL
       ═══════════════════════════════════════════════════════════════ */

    const toggle = document.getElementById('mobile-toggle');
    const nav    = document.getElementById('main-nav');

    if (toggle && nav) {

        /* Abrir / cerrar el menú principal */
        toggle.addEventListener('click', function () {
            const isOpen = nav.classList.toggle('open');
            toggle.classList.toggle('active', isOpen);
            toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
            /* Evitar scroll del body cuando el menú está abierto */
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        /* Cerrar menú al hacer clic fuera de él */
        document.addEventListener('click', function (e) {
            if (!nav.contains(e.target) && !toggle.contains(e.target)) {
                nav.classList.remove('open');
                toggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        /* Dropdowns táctiles en móvil:
           Al tocar el toggle, mostrar/ocultar el submenú */
        const dropdownToggles = nav.querySelectorAll('.dropdown-toggle');
        dropdownToggles.forEach(function (dt) {
            dt.addEventListener('click', function (e) {
                /* Solo en pantallas pequeñas */
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const parent = dt.closest('.dropdown');
                    parent.classList.toggle('open');
                }
            });
        });

        /* Cerrar menú al hacer clic en un enlace interno */
        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('open');
                toggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }


    /* ═══════════════════════════════════════════════════════════════
       2. HEADER STICKY CON REDUCCIÓN AL HACER SCROLL
       ═══════════════════════════════════════════════════════════════ */

    const header = document.getElementById('main-header');
    let ultimoScroll = 0;

    if (header) {
        window.addEventListener('scroll', function () {
            const scrollActual = window.pageYOffset || document.documentElement.scrollTop;

            /* Añadir clase 'scrolled' después de 80px de scroll */
            if (scrollActual > 80) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            ultimoScroll = scrollActual;
        }, { passive: true });
    }


    /* ═══════════════════════════════════════════════════════════════
       3. SCROLL SUAVE PARA ANCLAS INTERNAS
       ═══════════════════════════════════════════════════════════════ */

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = anchor.getAttribute('href');
            if (href === '#') return;

            const destino = document.querySelector(href);
            if (destino) {
                e.preventDefault();
                const topbarAltura  = document.querySelector('.topbar')  ? document.querySelector('.topbar').offsetHeight  : 0;
                const headerAltura  = document.getElementById('main-header') ? document.getElementById('main-header').offsetHeight : 0;
                const offset        = topbarAltura + headerAltura + 16;
                const posicion      = destino.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({ top: posicion, behavior: 'smooth' });
            }
        });
    });


    /* ═══════════════════════════════════════════════════════════════
       4. LAZY LOADING DE IMÁGENES
       Carga imágenes solo cuando están cerca del viewport
       ═══════════════════════════════════════════════════════════════ */

    const imagenesLazy = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window && imagenesLazy.length > 0) {
        const observadorImg = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.addEventListener('load', function () {
                        img.classList.add('loaded');
                    });
                    obs.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px 0px', /* Cargar 200px antes de que aparezca */
            threshold: 0.01
        });

        imagenesLazy.forEach(function (img) {
            observadorImg.observe(img);
        });
    } else {
        /* Fallback: cargar todas si no hay IntersectionObserver */
        imagenesLazy.forEach(function (img) {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.classList.add('loaded');
            }
        });
    }


    /* ═══════════════════════════════════════════════════════════════
       5. TRACKING DE CLICS PARA GOOGLE ANALYTICS 4
       Registra clics en teléfono y WhatsApp como eventos de conversión
       ═══════════════════════════════════════════════════════════════ */

    function trackEvento(categoria, accion, etiqueta) {
        if (typeof gtag !== 'undefined') {
            gtag('event', accion, {
                event_category: categoria,
                event_label:    etiqueta,
                value:          1
            });
        }
    }

    /* Tracking: clics en teléfono */
    document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
        link.addEventListener('click', function () {
            trackEvento('contacto', 'click_telefono', link.href);
        });
    });

    /* Tracking: clics en WhatsApp */
    document.querySelectorAll('a[href*="wa.me"], .whatsapp-float, .topbar-whatsapp').forEach(function (link) {
        link.addEventListener('click', function () {
            trackEvento('contacto', 'click_whatsapp', window.location.pathname);
        });
    });

    /* Tracking: clic en botón flotante de WhatsApp */
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (whatsappFloat) {
        whatsappFloat.addEventListener('click', function () {
            trackEvento('contacto', 'click_whatsapp_flotante', window.location.pathname);
        });
    }


    /* ═══════════════════════════════════════════════════════════════
       6. FAQ ACORDEÓN
       Muestra/oculta respuestas al clic en la pregunta
       ═══════════════════════════════════════════════════════════════ */

    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function (item) {
        const pregunta  = item.querySelector('.faq-pregunta');
        const respuesta = item.querySelector('.faq-respuesta');

        if (!pregunta || !respuesta) return;

        pregunta.addEventListener('click', function () {
            const estaActivo = item.classList.contains('activo');

            /* Cerrar todos los demás */
            faqItems.forEach(function (otroItem) {
                otroItem.classList.remove('activo');
                const otraRespuesta = otroItem.querySelector('.faq-respuesta');
                if (otraRespuesta) otraRespuesta.style.display = 'none';
            });

            /* Abrir el actual si estaba cerrado */
            if (!estaActivo) {
                item.classList.add('activo');
                respuesta.style.display = 'block';
            }
        });
    });


    /* ═══════════════════════════════════════════════════════════════
       7. SCROLL REVEAL - ANIMACIÓN AL APARECER ELEMENTOS
       ═══════════════════════════════════════════════════════════════ */

    const elementosReveal = document.querySelectorAll(
        '.barrio, .tipo, .paso, .servicio-card, .trabajo-card, .metodo'
    );

    if ('IntersectionObserver' in window && elementosReveal.length > 0) {
        /* Añadir clase base para la animación */
        elementosReveal.forEach(function (el) {
            el.classList.add('reveal');
        });

        const observadorReveal = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry, i) {
                if (entry.isIntersecting) {
                    /* Pequeño delay escalonado para efecto cascada */
                    setTimeout(function () {
                        entry.target.classList.add('visible');
                    }, i * 80);
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elementosReveal.forEach(function (el) {
            observadorReveal.observe(el);
        });
    }


    /* ═══════════════════════════════════════════════════════════════
       8. RESALTAR ENLACE ACTIVO EN EL MENÚ
       ═══════════════════════════════════════════════════════════════ */

    const rutaActual = window.location.pathname;

    document.querySelectorAll('.nav-links a').forEach(function (link) {
        const href = link.getAttribute('href');
        if (href && (href === rutaActual || href === rutaActual.replace('.html', '') + '.html')) {
            link.style.color = 'var(--color-primary)';
            link.style.fontWeight = '700';
        }
    });

}); /* Fin DOMContentLoaded */
