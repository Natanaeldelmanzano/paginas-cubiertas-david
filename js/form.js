/*
 * ═══════════════════════════════════════════════════════════════════
 * FORMULARIO DE CONTACTO - JAVASCRIPT
 * ═══════════════════════════════════════════════════════════════════
 * 
 * FUNCIONALIDADES:
 * 1. Detección automática de la página de origen
 * 2. Pre-selección del servicio según la URL
 * 3. Validación de campos en tiempo real
 * 4. Envío AJAX sin recargar la página
 * 5. Mensajes de éxito/error
 * 6. Tracking de conversiones para Google Analytics
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════
// 1. ESPERAR A QUE EL DOM ESTÉ CARGADO
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Formulario de contacto inicializado');
    
    // Obtener elementos del DOM
    const form = document.getElementById('contact-form');
    const pageSource = document.getElementById('page_source');
    const servicioSelect = document.getElementById('servicio');
    const submitButton = form.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('form-message');
    
    // ═══════════════════════════════════════════════════════════════
    // 2. DETECCIÓN AUTOMÁTICA DE PÁGINA DE ORIGEN
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Captura la URL y el título de la página actual
     * Esto permite saber desde qué página se envió el formulario
     */
    function detectPageSource() {
        const currentPath = window.location.pathname;
        const currentTitle = document.title;
        const pageInfo = `${currentPath} | ${currentTitle}`;
        
        if (pageSource) {
            pageSource.value = pageInfo;
            console.log('📍 Página detectada:', pageInfo);
        }
    }
    
    // Ejecutar detección al cargar
    detectPageSource();
    
    // ═══════════════════════════════════════════════════════════════
    // 3. PRE-SELECCIÓN INTELIGENTE DEL SERVICIO
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Detecta la URL actual y pre-selecciona el servicio correspondiente
     * Esto mejora la experiencia del usuario
     */
    function autoSelectService() {
        const path = window.location.pathname.toLowerCase();
        
        // Mapa de URLs a valores de servicio
        const serviceMap = {
            'reforma': 'reforma',
            'reparacion': 'reparacion',
            'gotera': 'reparacion',
            'impermeabilizacion': 'impermeabilizacion',
            'impermeable': 'impermeabilizacion',
            'canalon': 'canalones',
            'bajante': 'canalones',
            'panel-sandwich': 'panel-sandwich',
            'pizarra': 'pizarra',
            'teja': 'pizarra',
            'aislamiento': 'aislamiento',
            'urgencia': 'urgencia',
            'emergencia': 'urgencia'
        };
        
        // Buscar coincidencia en la URL
        for (let keyword in serviceMap) {
            if (path.includes(keyword)) {
                if (servicioSelect) {
                    servicioSelect.value = serviceMap[keyword];
                    console.log('🎯 Servicio pre-seleccionado:', serviceMap[keyword]);
                }
                break;
            }
        }
    }
    
    // Ejecutar pre-selección al cargar
    autoSelectService();
    
    // ═══════════════════════════════════════════════════════════════
    // 4. VALIDACIÓN EN TIEMPO REAL
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Valida el teléfono mientras el usuario escribe
     * Solo permite números y formatea automáticamente
     */
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Eliminar caracteres no numéricos
            let value = e.target.value.replace(/\D/g, '');
            
            // Limitar a 15 dígitos
            if (value.length > 15) {
                value = value.slice(0, 15);
            }
            
            e.target.value = value;
            
            // Validación visual
            if (value.length >= 9 && value.length <= 15) {
                e.target.classList.remove('error');
                e.target.classList.add('valid');
            } else if (value.length > 0) {
                e.target.classList.remove('valid');
                e.target.classList.add('error');
            } else {
                e.target.classList.remove('valid', 'error');
            }
        });
    }
    
    /**
     * Valida el email en tiempo real
     */
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function(e) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const value = e.target.value;
            
            if (value && !emailRegex.test(value)) {
                e.target.classList.add('error');
                showFieldError(e.target, 'Email inválido');
            } else {
                e.target.classList.remove('error');
                hideFieldError(e.target);
            }
        });
    }
    
    /**
     * Muestra mensaje de error debajo de un campo
     */
    function showFieldError(field, message) {
        // Eliminar error anterior si existe
        hideFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
    
    /**
     * Oculta mensaje de error de un campo
     */
    function hideFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // 5. ENVÍO DEL FORMULARIO CON AJAX
    // ═══════════════════════════════════════════════════════════════
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault(); // Evitar envío tradicional
            
            console.log('📤 Enviando formulario...');
            
            // Deshabilitar botón para evitar doble envío
            submitButton.disabled = true;
            submitButton.querySelector('.btn-text').style.display = 'none';
            submitButton.querySelector('.btn-loading').style.display = 'inline';
            
            // Ocultar mensajes anteriores
            hideMessage();
            
            // Preparar datos del formulario
            const formData = new FormData(form);
            
            try {
                // Enviar a Web3Forms
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    console.log('✅ Formulario enviado correctamente');
                    
                    // Mostrar mensaje de éxito
                    showMessage('success', 
                        '✅ ¡Mensaje enviado! Te contactaremos en menos de 2 horas.');
                    
                    // Resetear formulario
                    form.reset();
                    detectPageSource(); // Restaurar campo page_source
                    
                    // Tracking de conversión en Google Analytics
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'form_submit', {
                            event_category: 'conversion',
                            event_label: window.location.pathname
                        });
                        console.log('📊 Evento enviado a Google Analytics');
                    }
                    
                    // Opcional: Redirigir a página de gracias después de 2 segundos
                    // setTimeout(() => {
                    //     window.location.href = '/gracias.html';
                    // }, 2000);
                    
                } else {
                    console.error('❌ Error en el envío:', data.message);
                    showMessage('error', 
                        '❌ Error al enviar. Por favor, inténtalo de nuevo o llámanos al 693 743 627.');
                }
                
            } catch (error) {
                console.error('❌ Error de red:', error);
                showMessage('error', 
                    '❌ Error de conexión. Verifica tu internet o llámanos al 693 743 627.');
            } finally {
                // Re-habilitar botón
                submitButton.disabled = false;
                submitButton.querySelector('.btn-text').style.display = 'inline';
                submitButton.querySelector('.btn-loading').style.display = 'none';
            }
        });
    }
    
    // ═══════════════════════════════════════════════════════════════
    // 6. FUNCIONES DE MENSAJES
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Muestra mensaje de éxito o error
     * @param {string} type - 'success' o 'error'
     * @param {string} message - Texto del mensaje
     */
    function showMessage(type, message) {
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `form-message ${type}`;
            messageDiv.style.display = 'block';
            
            // Scroll suave hasta el mensaje
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Auto-ocultar mensaje de éxito después de 10 segundos
            if (type === 'success') {
                setTimeout(() => {
                    hideMessage();
                }, 10000);
            }
        }
    }
    
    /**
     * Oculta el mensaje de estado
     */
    function hideMessage() {
        if (messageDiv) {
            messageDiv.style.display = 'none';
            messageDiv.className = 'form-message';
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // 7. MEJORAS DE USABILIDAD
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Autocompletar municipio según la URL
     */
    const municipioInput = document.getElementById('municipio');
    if (municipioInput && !municipioInput.value) {
        const path = window.location.pathname.toLowerCase();
        
        const municipios = {
            'oviedo': 'Oviedo',
            'gijon': 'Gijón',
            'aviles': 'Avilés',
            'siero': 'Siero',
            'langreo': 'Langreo',
            'mieres': 'Mieres',
            'castrillon': 'Castrillón',
            'llanera': 'Llanera',
            'corvera': 'Corvera'
        };
        
        for (let key in municipios) {
            if (path.includes(key)) {
                municipioInput.value = municipios[key];
                console.log('📍 Municipio pre-rellenado:', municipios[key]);
                break;
            }
        }
    }
    
    /**
     * Contador de caracteres para el textarea
     */
    const mensajeTextarea = document.getElementById('mensaje');
    if (mensajeTextarea) {
        const minChars = parseInt(mensajeTextarea.getAttribute('minlength')) || 10;
        
        // Crear contador
        const counter = document.createElement('small');
        counter.className = 'char-counter';
        mensajeTextarea.parentNode.appendChild(counter);
        
        // Actualizar contador
        function updateCounter() {
            const length = mensajeTextarea.value.length;
            counter.textContent = `${length}/${minChars} caracteres mínimos`;
            
            if (length >= minChars) {
                counter.style.color = 'green';
            } else {
                counter.style.color = '#666';
            }
        }
        
        mensajeTextarea.addEventListener('input', updateCounter);
        updateCounter(); // Inicializar
    }
    
    /**
     * Vista previa de imagen adjunta
     */
    const fileInput = document.getElementById('archivo');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (file) {
                // Validar tamaño (máximo 5MB)
                const maxSize = 5 * 1024 * 1024; // 5MB en bytes
                
                if (file.size > maxSize) {
                    alert('⚠️ La imagen es demasiado grande. Máximo 5MB.');
                    e.target.value = '';
                    return;
                }
                
                // Validar tipo
                if (!file.type.startsWith('image/')) {
                    alert('⚠️ Solo se permiten imágenes.');
                    e.target.value = '';
                    return;
                }
                
                console.log('📸 Imagen seleccionada:', file.name, 
                           `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
            }
        });
    }
});

/*
 * ═══════════════════════════════════════════════════════════════════
 * INSTRUCCIONES DE PERSONALIZACIÓN
 * ═══════════════════════════════════════════════════════════════════
 * 
 * 1. CAMBIAR MENSAJES DE ÉXITO/ERROR:
 *    Edita las líneas 192 y 199 con tus mensajes personalizados
 * 
 * 2. ACTIVAR REDIRECCIÓN TRAS ENVÍO:
 *    Descomenta las líneas 206-208 para redirigir a /gracias.html
 * 
 * 3. AÑADIR MÁS SERVICIOS PARA AUTO-SELECCIÓN:
 *    Edita el objeto serviceMap en líneas 52-65
 *    Añade: 'palabra-url': 'valor-del-select'
 * 
 * 4. AÑADIR MÁS MUNICIPIOS PARA AUTO-RELLENAR:
 *    Edita el objeto municipios en líneas 281-291
 * 
 * 5. CAMBIAR VALIDACIÓN DE TELÉFONO:
 *    Edita las líneas 98-115
 *    Ejemplo: Para solo 9 dígitos, cambia la condición de la línea 107
 * 
 * 6. DESACTIVAR CONTADOR DE CARACTERES:
 *    Comenta o elimina las líneas 306-330
 * 
 * 7. CAMBIAR TAMAÑO MÁXIMO DE IMAGEN:
 *    Edita la línea 339: const maxSize = 10 * 1024 * 1024; // 10MB
 * 
 * 8. AÑADIR MÁS TRACKING:
 *    Añade eventos personalizados después de la línea 202
 *    Ejemplo: gtag('event', 'lead_generated', {...});
 * 
 * 9. VALIDACIONES PERSONALIZADAS:
 *    Añade funciones de validación similares a las líneas 121-143
 * 
 * 10. INTEGRACIÓN CON OTROS SERVICIOS:
 *     Además de Web3Forms, puedes enviar datos a tu CRM:
 *     
 *     fetch('https://tu-crm.com/api/leads', {
 *         method: 'POST',
 *         headers: { 'Content-Type': 'application/json' },
 *         body: JSON.stringify(Object.fromEntries(formData))
 *     });
 * 
 * ═══════════════════════════════════════════════════════════════════
 */
