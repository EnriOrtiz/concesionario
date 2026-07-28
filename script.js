// ============================================
// FRONTEND PREMIUM - LÓGICA PRINCIPAL (CORREGIDO)
// ============================================

let CONFIG = {};
let currentSlide = 0;
let totalSlides = 0;
let slideInterval = null;
let savedVehicles = [];

// ===== FUNCIÓN adjustColor ====
function adjustColor(hex, percent) {
    // Eliminar el # si existe
    hex = hex.replace('#', '');
    
    // Convertir a RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    // Ajustar
    r = Math.min(255, Math.max(0, r + percent));
    g = Math.min(255, Math.max(0, g + percent));
    b = Math.min(255, Math.max(0, b + percent));
    
    // Convertir de vuelta a hex
    const toHex = (n) => {
        const h = n.toString(16);
        return h.length === 1 ? '0' + h : h;
    };
    
    return '#' + toHex(r) + toHex(g) + toHex(b);
}

// Inicializar savedVehicles de forma segura
try {
    const saved = localStorage.getItem('savedVehicles');
    if (saved) savedVehicles = JSON.parse(saved);
} catch(e) {
    console.warn('No se pudo acceder a localStorage (posible bloqueo del navegador)');
    savedVehicles = [];
}

// ===== FUNCIÓN SAFE STORAGE =====
function safeGetStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch(e) {
        console.warn('localStorage no disponible:', e.message);
        return null;
    }
}

function safeSetStorage(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch(e) {
        console.warn('No se pudo guardar en localStorage:', e.message);
        return false;
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando sitio...');
    
    // Timeout de seguridad: ocultar loader después de 6 segundos
    setTimeout(() => {
        const loader = document.getElementById('pageLoader');
        if (loader && !loader.classList.contains('hidden')) {
            console.warn('⚠️ Forzando ocultar loader por timeout de seguridad');
            forceHideLoader();
        }
    }, 6000);
    
    await loadConfig();
    initAOS();
    initNavigation();
    initSlider();
    initSearch();
    initFilters();
    initWhatsAppFloat();
});

// ===== CARGA DE CONFIGURACIÓN =====
async function loadConfig() {
    console.log('📂 Intentando cargar configuración...');
    
    // Intentar cargar desde localStorage
    const saved = safeGetStorage('cms_premium_config');
    
    if (saved) {
        try {
            CONFIG = JSON.parse(saved);
            console.log('✅ Configuración cargada desde localStorage');
            applyConfig();
            renderAll();
            hideLoader();
            return;
        } catch (e) {
            console.warn('⚠️ Error al parsear localStorage:', e.message);
        }
    }
    
    // Intentar cargar desde archivo config.json
    try {
        console.log('📡 Intentando cargar config.json...');
        const response = await fetch('config.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        CONFIG = await response.json();
        console.log('✅ Configuración cargada desde config.json');
        
    } catch (error) {
        console.warn('⚠️ No se pudo cargar config.json:', error.message);
        console.log('📋 Usando configuración por defecto');
        CONFIG = getDefaultConfig();
    }
    
    // SIEMPRE aplicar configuración y ocultar loader
    applyConfig();
    renderAll();
    hideLoader();
}

// ===== CONFIGURACIÓN POR DEFECTO =====
function getDefaultConfig() {
    return {
        version: '2.0',
        empresa: {
            nombre: 'Premium Motors',
            nombre_corto: 'PM',
            slogan: 'Excelencia en Movimiento',
            descripcion_corta: 'Concesionario de vehículos premium con los mejores precios y financiamiento.',
            descripcion_larga: 'Ofrecemos los mejores vehículos con financiamiento flexible y garantía extendida.',
            telefono_principal: '+58 424-1234567',
            telefono_secundario: '',
            email_contacto: 'info@premiummotors.com',
            email_ventas: '',
            direccion: 'Av. Principal, Centro Comercial, Ciudad',
            ciudad: 'Puerto La Cruz',
            estado: 'Anzoátegui',
            pais: 'Venezuela',
            horario_semana: 'Lunes a Viernes: 8:00 AM - 6:00 PM',
            horario_sabado: 'Sábados: 9:00 AM - 2:00 PM',
            horario_domingo: 'Domingos: Cerrado',
            whatsapp: '+584241234567',
            whatsapp_mensaje: 'Hola, vi su página web y me gustaría recibir información sobre sus vehículos.',
            logo_tipo: 'texto',
            logo_texto: 'PM',
            logo_imagen: '',
            logo_color_fondo: '#1a365d',
            logo_color_texto: '#ffffff',
            redes_sociales: {
                facebook: '#',
                instagram: '#',
                youtube: '#',
                tiktok: '#',
                linkedin: '#'
            },
            seo: {
                titulo_sitio: 'Premium Motors | Concesionario',
                meta_descripcion: 'Concesionario de vehículos premium',
                meta_keywords: 'concesionario, vehículos, carros',
                favicon_emoji: '🚗'
            }
        },
        apariencia: {
            tema: 'claro',
            colores: {
                primario: '#1a365d',
                primario_claro: '#2a4a7f',
                primario_oscuro: '#0f2440',
                secundario: '#c41e3a',
                secundario_claro: '#e53e3e',
                secundario_oscuro: '#9b1b30',
                acento: '#d4a853',
                acento_claro: '#e0c078',
                acento_oscuro: '#b8943a',
                fondo_principal: '#f8f9fb',
                fondo_tarjeta: '#ffffff',
                fondo_oscuro: '#1a202c',
                texto_principal: '#1a365d',
                texto_secundario: '#4a5568',
                texto_claro: '#a0aec0',
                texto_blanco: '#ffffff',
                borde: '#e2e8f0',
                borde_claro: '#edf2f7',
                exito: '#38a169',
                advertencia: '#d69e2e',
                error: '#e53e3e',
                info: '#3182ce'
            },
            tipografia: {
                titulos: "'Playfair Display', Georgia, serif",
                cuerpo: "'Inter', 'Segoe UI', sans-serif",
                tamaño_base: '16px',
                escala_titulos: '1.25'
            }
        },
        marcas: [
            {
                id: 1,
                nombre: 'Toyota',
                descripcion: 'Líder mundial en calidad y durabilidad.',
                caracteristicas: ['Calidad Japonesa', 'Alto Valor de Reventa', 'Tecnología Híbrida'],
                color_marca: '#ce0037'
            },
            {
                id: 2,
                nombre: 'Hyundai',
                descripcion: 'Innovación y diseño con la mejor garantía.',
                caracteristicas: ['Garantía 5 Años', 'Diseño Europeo', 'Máxima Eficiencia'],
                color_marca: '#003469'
            }
        ],
        vehiculos: [
            {
                id: 1,
                marca: 'Toyota',
                modelo: 'Corolla Cross',
                version: 'Hybrid XLE',
                año: 2024,
                precio: 35000,
                moneda: 'USD',
                tipo: 'suv',
                combustible: 'Híbrido',
                transmision: 'Automática',
                potencia: '170 CV',
                torque: '190 Nm',
                capacidad: '5 pasajeros',
                garantia: '5 años / 100,000 km',
                destacado: true,
                nuevo: true,
                en_oferta: false,
                imagen_principal: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
                descripcion_corta: 'El SUV híbrido perfecto para la ciudad y la aventura familiar.',
                descripcion_larga: 'El Toyota Corolla Cross Hybrid XLE combina la legendaria confiabilidad de Toyota con la eficiencia de la tecnología híbrida. Su diseño aerodinámico y equipamiento de seguridad lo convierten en la opción ideal.'
            },
            {
                id: 2,
                marca: 'Hyundai',
                modelo: 'Tucson',
                version: 'Limited AWD',
                año: 2024,
                precio: 38500,
                moneda: 'USD',
                tipo: 'suv',
                combustible: 'Gasolina',
                transmision: 'Automática',
                potencia: '187 CV',
                torque: '241 Nm',
                capacidad: '5 pasajeros',
                garantia: '5 años / 100,000 km',
                destacado: true,
                nuevo: true,
                en_oferta: true,
                precio_oferta: 35900,
                imagen_principal: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
                descripcion_corta: 'Diseño vanguardista y tecnología de punta en cada detalle.',
                descripcion_larga: 'El Hyundai Tucson Limited AWD representa la evolución del diseño SUV. Con su distintiva firma lumínica LED y sistema de tracción integral HTRAC.'
            }
        ],
        servicios: [
            {
                id: 1,
                icono: 'fa-hand-holding-dollar',
                titulo: 'Financiamiento Flexible',
                descripcion: 'Planes de pago personalizados con las mejores tasas del mercado.',
                destacado: true
            },
            {
                id: 2,
                icono: 'fa-wrench',
                titulo: 'Taller Autorizado',
                descripcion: 'Servicio técnico certificado con repuestos originales.',
                destacado: true
            },
            {
                id: 3,
                icono: 'fa-shield-halved',
                titulo: 'Garantía Extendida',
                descripcion: 'Protección adicional para tu tranquilidad.',
                destacado: false
            },
            {
                id: 4,
                icono: 'fa-car-side',
                titulo: 'Test Drive',
                descripcion: 'Prueba tu vehículo favorito sin compromiso.',
                destacado: true
            }
        ],
        secciones: {
            hero_slider: true,
            barra_marcas: true,
            buscador_avanzado: true,
            catalogo_vehiculos: true,
            vehiculos_destacados: true,
            seccion_marcas: true,
            servicios: true,
            testimonios: false,
            blog_noticias: false,
            cta_whatsapp: true,
            cta_final: true,
            footer_completo: true
        },
        testimonios: [],
        blog: [],
        integraciones: {
            google_analytics_id: '',
            facebook_pixel_id: '',
            google_maps_embed: '',
            chat_en_vivo: false
        }
    };
}

// ===== APLICAR CONFIGURACIÓN =====
function applyConfig() {
    const c = CONFIG.apariencia.colores;
    const e = CONFIG.empresa;
    
    // Variables CSS
    const root = document.documentElement;
    root.style.setProperty('--primary', c.primario);
    root.style.setProperty('--primary-light', c.primario_claro);
    root.style.setProperty('--primary-dark', c.primario_oscuro);
    root.style.setProperty('--secondary', c.secundario);
    root.style.setProperty('--accent', c.acento);
    root.style.setProperty('--bg-body', c.fondo_principal);
    root.style.setProperty('--text-primary', c.texto_principal);
    root.style.setProperty('--text-secondary', c.texto_secundario);
    
    // Datos empresa
    document.title = (e.nombre || 'Concesionario') + ' | Vehículos';
    
    // Logo
    const logoIcon = document.getElementById('logoIcon');
    if (logoIcon) {
        const tipo = e.logo_tipo || 'texto';
        const logoTexto = e.logo_texto || e.nombre_corto || 'PM';
        const logoImagen = e.logo_imagen || '';
        const colorFondo = e.logo_color_fondo || c.primario;
        const colorTexto = e.logo_color_texto || '#ffffff';
        
        if ((tipo === 'imagen' || tipo === 'ambos') && logoImagen) {
            logoIcon.innerHTML = `<img src="${logoImagen}" alt="${e.nombre}" style="width:100%;height:100%;object-fit:contain;border-radius:8px;">`;
            logoIcon.style.background = 'white';
        } else {
            logoIcon.innerHTML = logoTexto;
            logoIcon.style.background = `linear-gradient(135deg, ${colorFondo}, ${adjustColor(colorFondo, 30)})`;
            logoIcon.style.color = colorTexto;
        }
    }
    
    // Nombre y slogan
    const logoName = document.getElementById('logoName');
    const logoSlogan = document.getElementById('logoSlogan');
    if (logoName) logoName.textContent = e.nombre || 'Premium Motors';
    if (logoSlogan) logoSlogan.textContent = e.slogan || '';
    
    // Teléfono
    const phoneEl = document.getElementById('topPhone');
    if (phoneEl) {
        phoneEl.href = 'tel:' + (e.telefono_principal || '');
        const phoneSpan = phoneEl.querySelector('span');
        if (phoneSpan) phoneSpan.textContent = e.telefono_principal || '';
    }
    
    // Email
    const emailEl = document.getElementById('topEmail');
    if (emailEl) {
        emailEl.href = 'mailto:' + (e.email_contacto || '');
        const emailSpan = emailEl.querySelector('span');
        if (emailSpan) emailSpan.textContent = e.email_contacto || '';
    }
    
    // Horario
    const hoursEl = document.getElementById('topHours');
    if (hoursEl) {
        const hoursSpan = hoursEl.querySelector('span');
        if (hoursSpan) hoursSpan.textContent = e.horario_semana || '';
    }
    
    // Redes sociales
    const socialDiv = document.getElementById('topSocial');
    if (socialDiv && e.redes_sociales) {
        socialDiv.innerHTML = '';
        const redes = e.redes_sociales;
        if (redes.facebook) {
            socialDiv.innerHTML += `<a href="${redes.facebook}" aria-label="Facebook" target="_blank" rel="noopener"><i class="fab fa-facebook-f"></i></a>`;
        }
        if (redes.instagram) {
            socialDiv.innerHTML += `<a href="${redes.instagram}" aria-label="Instagram" target="_blank" rel="noopener"><i class="fab fa-instagram"></i></a>`;
        }
        if (redes.youtube) {
            socialDiv.innerHTML += `<a href="${redes.youtube}" aria-label="YouTube" target="_blank" rel="noopener"><i class="fab fa-youtube"></i></a>`;
        }
        if (redes.tiktok) {
            socialDiv.innerHTML += `<a href="${redes.tiktok}" aria-label="TikTok" target="_blank" rel="noopener"><i class="fab fa-tiktok"></i></a>`;
        }
    }
    
    // WhatsApp
    const whatsappFloat = document.getElementById('whatsappFloat');
    if (whatsappFloat && e.whatsapp) {
        whatsappFloat.href = `https://wa.me/${e.whatsapp}?text=${encodeURIComponent(e.whatsapp_mensaje || 'Hola')}`;
    }
    
    const ctaWhatsapp = document.getElementById('ctaWhatsapp');
    if (ctaWhatsapp && e.whatsapp) {
        ctaWhatsapp.href = `https://wa.me/${e.whatsapp}?text=${encodeURIComponent(e.whatsapp_mensaje || 'Hola')}`;
    }
    
    // Secciones - CORREGIDO: verificar que CONFIG.secciones existe
    if (CONFIG.secciones) {
        const secciones = CONFIG.secciones;
        toggleSection('marcasStrip', secciones.barra_marcas);
        toggleSection('searchSection', secciones.buscador_avanzado);
        toggleSection('catalog', secciones.catalogo_vehiculos);
        toggleSection('servicios', secciones.servicios);
        toggleSection('ctaFinal', secciones.cta_final);
    }
}

function toggleSection(id, show) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = (show !== false) ? '' : 'none';
    }
}

function toggleSection(id, show) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = show !== false ? '' : 'none';
    }
}

// ===== RENDERIZADO =====
function renderAll() {
    renderHeroSlider();
    renderBrandsStrip();
    renderVehicles();
    renderMarcasDetalladas();
    renderServicios();
    renderFooter();
    populateSearchFields();
    populateFilterPills();
}

function renderHeroSlider() {
    const destacados = (CONFIG.vehiculos || []).filter(v => v.destacado).slice(0, 3);
    const slider = document.getElementById('heroSlider');
    const dots = document.getElementById('heroDots');
    
    if (!slider) return;
    
    if (!destacados.length) {
        slider.innerHTML = `
            <div class="hero-slide active" style="background:linear-gradient(135deg, var(--primary), var(--primary-dark)); display:flex; align-items:center; justify-content:center;">
                <div class="hero-content" style="text-align:center;">
                    <h1 class="hero-title" style="color:white;">${CONFIG.empresa.nombre || 'Premium Motors'}</h1>
                    <p class="hero-subtitle">${CONFIG.empresa.slogan || 'Excelencia en Movimiento'}</p>
                </div>
            </div>`;
        totalSlides = 1;
        return;
    }
    
    totalSlides = destacados.length;
    
    slider.innerHTML = destacados.map((v, i) => `
        <div class="hero-slide ${i === 0 ? 'active' : ''}" style="background-image:url('${v.imagen_principal || ''}')">
            <div class="container">
                <div class="hero-content">
                    <span class="hero-badge">${v.en_oferta ? '🏷️ Oferta' : '✨ Nuevo'}</span>
                    <h1 class="hero-title">${v.marca || ''} <span class="highlight">${v.modelo || ''}</span></h1>
                    <p class="hero-subtitle">${v.descripcion_corta || ''}</p>
                    <p class="hero-price">Desde $${(v.precio || 0).toLocaleString()}</p>
                    <div class="hero-cta">
                        <a href="#catalog" class="btn btn-white">Ver Catálogo</a>
                        <a href="#contacto" class="btn btn-primary" style="background:transparent;border:2px solid white;">Contáctanos</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    if (dots) {
        dots.innerHTML = destacados.map((_, i) => `
            <div class="hero-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
        `).join('');
        
        document.querySelectorAll('.hero-dot').forEach(dot => {
            dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
        });
    }
}

function renderBrandsStrip() {
    const container = document.getElementById('brandsStripContent');
    if (!container || !CONFIG.marcas || !CONFIG.marcas.length) {
        if (container) container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <span class="brands-label">Representantes oficiales de:</span>
        <div class="brands-logos">
            ${CONFIG.marcas.map((m, i) => `
                ${i > 0 ? '<div class="brand-divider"></div>' : ''}
                <span class="brand-item">${m.nombre}</span>
            `).join('')}
        </div>
    `;
}

function renderVehicles(vehicles = null) {
    const data = vehicles || CONFIG.vehiculos || [];
    const grid = document.getElementById('vehiclesGrid');
    if (!grid) return;
    
    if (!data.length) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px;">
                <i class="fas fa-car-side" style="font-size:4rem;color:var(--text-muted);opacity:0.3;margin-bottom:16px;display:block;"></i>
                <h3>No hay vehículos disponibles</h3>
                <p style="color:var(--text-secondary);">Estamos actualizando nuestro catálogo</p>
            </div>`;
        return;
    }
    
    grid.innerHTML = data.map(v => `
        <div class="vehicle-card" data-id="${v.id}">
            <div class="vehicle-card-image">
                <img src="${v.imagen_principal || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80'}" alt="${v.marca} ${v.modelo}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80'">
                <span class="vehicle-card-badge ${v.en_oferta ? 'badge-offer' : 'badge-new'}">${v.en_oferta ? 'Oferta' : v.marca}</span>
                <button class="vehicle-card-save ${savedVehicles.includes(v.id) ? 'saved' : ''}" onclick="event.stopPropagation();toggleSave(${v.id})">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
            <div class="vehicle-card-body">
                <div class="vehicle-card-header">
                    <div>
                        <h3 class="vehicle-card-title">${v.marca} ${v.modelo}</h3>
                        <p class="vehicle-card-version">${v.version || ''}</p>
                    </div>
                    <span class="vehicle-card-year">${v.año}</span>
                </div>
                <div class="vehicle-card-specs">
                    <div class="spec-item"><i class="fas fa-gas-pump"></i><span>Combustible</span><strong>${v.combustible || '-'}</strong></div>
                    <div class="spec-item"><i class="fas fa-cog"></i><span>Transmisión</span><strong>${v.transmision || '-'}</strong></div>
                    <div class="spec-item"><i class="fas fa-tachometer-alt"></i><span>Potencia</span><strong>${v.potencia || '-'}</strong></div>
                </div>
                <div class="vehicle-card-footer">
                    <div class="vehicle-card-price">$${(v.precio || 0).toLocaleString()}<small>+ IVA</small></div>
                    <button class="vehicle-card-btn" onclick="event.stopPropagation();openVehicleModal(${v.id})">Ver Detalle</button>
                </div>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.vehicle-card').forEach(card => {
        card.addEventListener('click', () => openVehicleModal(parseInt(card.dataset.id)));
    });
}

function renderMarcasDetalladas() {
    const grid = document.getElementById('marcasGrid');
    if (!grid) return;
    
    if (!CONFIG.marcas || !CONFIG.marcas.length) {
        document.getElementById('marcas').style.display = 'none';
        return;
    }
    
    grid.innerHTML = CONFIG.marcas.map(m => `
        <div class="servicio-card">
            <div class="servicio-icon" style="background:${m.color_marca || 'var(--primary)'}">
                <i class="fas fa-car"></i>
            </div>
            <h3>${m.nombre}</h3>
            <p>${m.descripcion || ''}</p>
        </div>
    `).join('');
}

function renderServicios() {
    const grid = document.getElementById('serviciosGrid');
    if (!grid || !CONFIG.servicios) return;
    
    grid.innerHTML = CONFIG.servicios.map(s => `
        <div class="servicio-card">
            <div class="servicio-icon"><i class="fas ${s.icono || 'fa-star'}"></i></div>
            <h3>${s.titulo || ''}</h3>
            <p>${s.descripcion || ''}</p>
        </div>
    `).join('');
}

function renderFooter() {
    const e = CONFIG.empresa || {};
    const footerGrid = document.getElementById('footerGrid');
    const footerBottom = document.getElementById('footerBottom');
    
    if (footerGrid) {
        footerGrid.innerHTML = `
            <div>
                <div class="logo" style="margin-bottom:16px;">
                    <div class="logo-icon">${e.logo_texto || e.nombre_corto || 'PM'}</div>
                    <div><span class="logo-name" style="color:white;">${e.nombre || ''}</span></div>
                </div>
                <p style="opacity:0.8;font-size:0.9rem;">${e.descripcion_corta || ''}</p>
            </div>
            <div>
                <h4>Contacto</h4>
                <ul class="footer-links">
                    <li><i class="fas fa-map-marker-alt"></i> ${e.direccion || ''}</li>
                    <li><i class="fas fa-phone"></i> ${e.telefono_principal || ''}</li>
                    <li><i class="fas fa-envelope"></i> ${e.email_contacto || ''}</li>
                </ul>
            </div>
            <div>
                <h4>Horario</h4>
                <ul class="footer-links">
                    <li>${e.horario_semana || ''}</li>
                    <li>${e.horario_sabado || ''}</li>
                    <li>${e.horario_domingo || ''}</li>
                </ul>
            </div>
        `;
    }
    
    if (footerBottom) {
        footerBottom.innerHTML = `<p>&copy; ${new Date().getFullYear()} ${e.nombre || 'Premium Motors'}. Todos los derechos reservados.</p>`;
    }
}

function populateSearchFields() {
    const vehicles = CONFIG.vehiculos || [];
    const brands = [...new Set(vehicles.map(v => v.marca))];
    const types = [...new Set(vehicles.map(v => v.tipo))];
    
    const searchBrand = document.getElementById('searchBrand');
    const searchType = document.getElementById('searchType');
    
    if (searchBrand) {
        searchBrand.innerHTML = '<option value="">Todas las marcas</option>' + brands.map(b => `<option value="${b}">${b}</option>`).join('');
    }
    if (searchType) {
        searchType.innerHTML = '<option value="">Todos los tipos</option>' + types.map(t => `<option value="${t}">${t.toUpperCase()}</option>`).join('');
    }
}

function populateFilterPills() {
    const vehicles = CONFIG.vehiculos || [];
    const brands = [...new Set(vehicles.map(v => v.marca))];
    const filterPills = document.getElementById('filterPills');
    
    if (filterPills) {
        filterPills.innerHTML = `
            <button class="filter-pill active" data-filter="all">Todos</button>
            ${brands.map(b => `<button class="filter-pill" data-filter="marca_${b}">${b}</button>`).join('')}
        `;
    }
}

// ===== SLIDER =====
function initSlider() {
    document.getElementById('prevSlide')?.addEventListener('click', prevSlide);
    document.getElementById('nextSlide')?.addEventListener('click', nextSlide);
    startAutoSlide();
}

function goToSlide(index) {
    if (totalSlides <= 1) return;
    document.querySelectorAll('.hero-slide')[currentSlide]?.classList.remove('active');
    document.querySelectorAll('.hero-dot')[currentSlide]?.classList.remove('active');
    currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;
    document.querySelectorAll('.hero-slide')[currentSlide]?.classList.add('active');
    document.querySelectorAll('.hero-dot')[currentSlide]?.classList.add('active');
}

function nextSlide() { goToSlide(currentSlide + 1); resetAutoSlide(); }
function prevSlide() { goToSlide(currentSlide - 1); resetAutoSlide(); }
function startAutoSlide() { if (totalSlides > 1) slideInterval = setInterval(nextSlide, 5000); }
function resetAutoSlide() { clearInterval(slideInterval); startAutoSlide(); }

// ===== BÚSQUEDA =====
function initSearch() {
    document.getElementById('searchForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const brand = document.getElementById('searchBrand')?.value || '';
        const type = document.getElementById('searchType')?.value || '';
        
        let filtered = CONFIG.vehiculos || [];
        if (brand) filtered = filtered.filter(v => v.marca === brand);
        if (type) filtered = filtered.filter(v => v.tipo === type);
        
        renderVehicles(filtered);
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
        showToast(`Se encontraron ${filtered.length} vehículos`, filtered.length ? 'success' : 'info');
    });
}

function initFilters() {
    document.getElementById('filterPills')?.addEventListener('click', (e) => {
        if (!e.target.classList.contains('filter-pill')) return;
        
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        
        const filter = e.target.dataset.filter;
        let filtered = CONFIG.vehiculos || [];
        
        if (filter.startsWith('marca_')) {
            filtered = filtered.filter(v => v.marca === filter.replace('marca_', ''));
        }
        
        renderVehicles(filtered);
    });
}

// ===== MODAL =====
function openVehicleModal(vehicleId) {
    const v = (CONFIG.vehiculos || []).find(veh => veh.id === vehicleId);
    if (!v) return;
    
    const modal = document.getElementById('vehicleModal');
    const overlay = document.getElementById('modalOverlay');
    if (!modal || !overlay) return;
    
    modal.innerHTML = `
        <button class="modal-close" onclick="closeModal()" style="position:absolute;top:15px;right:15px;background:rgba(0,0,0,0.6);border:none;color:white;width:40px;height:40px;border-radius:50%;cursor:pointer;z-index:10;font-size:1.2rem;">✕</button>
        <div style="height:300px;overflow:hidden;border-radius:16px 16px 0 0;">
            <img src="${v.imagen_principal || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80'}" alt="${v.modelo}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80'">
        </div>
        <div style="padding:30px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
                <div>
                    <h2 style="font-family:var(--font-heading);font-size:1.8rem;">${v.marca} ${v.modelo} ${v.version || ''}</h2>
                    <p style="color:var(--text-secondary);">${v.año || ''} • ${v.garantia || 'Garantía incluida'}</p>
                </div>
                <div style="font-family:var(--font-heading);font-size:2rem;font-weight:700;color:var(--primary);">$${(v.precio || 0).toLocaleString()}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px;padding:20px;background:var(--bg-body);border-radius:12px;margin-bottom:20px;">
                <div style="text-align:center;"><i class="fas fa-gas-pump" style="color:var(--primary);"></i><p style="font-size:0.8rem;">Combustible</p><strong>${v.combustible || '-'}</strong></div>
                <div style="text-align:center;"><i class="fas fa-cog" style="color:var(--primary);"></i><p style="font-size:0.8rem;">Transmisión</p><strong>${v.transmision || '-'}</strong></div>
                <div style="text-align:center;"><i class="fas fa-tachometer-alt" style="color:var(--primary);"></i><p style="font-size:0.8rem;">Potencia</p><strong>${v.potencia || '-'}</strong></div>
            </div>
            <p style="color:var(--text-secondary);margin-bottom:24px;">${v.descripcion_larga || v.descripcion_corta || ''}</p>
            <a href="https://wa.me/${CONFIG.empresa.whatsapp || ''}?text=${encodeURIComponent('Hola, me interesa el ' + v.marca + ' ' + v.modelo)}" class="btn btn-whatsapp" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:#25D366;color:white;border-radius:12px;text-decoration:none;font-weight:600;">
                <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
            </a>
        </div>
    `;
    
    overlay.classList.add('active');
    document.body.classList.add('modal-open');
}

function closeModal() {
    document.getElementById('modalOverlay')?.classList.remove('active');
    document.body.classList.remove('modal-open');
}

// ===== GUARDADOS =====
function toggleSave(vehicleId) {
    const index = savedVehicles.indexOf(vehicleId);
    if (index > -1) {
        savedVehicles.splice(index, 1);
        showToast('Eliminado de guardados', 'info');
    } else {
        savedVehicles.push(vehicleId);
        showToast('Vehículo guardado ❤️', 'success');
    }
    safeSetStorage('savedVehicles', JSON.stringify(savedVehicles));
    renderVehicles();
}

// ===== NAVEGACIÓN =====
function initNavigation() {
    document.getElementById('hamburger')?.addEventListener('click', () => {
        document.getElementById('hamburger').classList.toggle('active');
        document.getElementById('navList')?.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('hamburger')?.classList.remove('active');
            document.getElementById('navList')?.classList.remove('active');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    window.addEventListener('scroll', () => {
        document.getElementById('header')?.classList.toggle('scrolled', window.scrollY > 50);
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
}

function initWhatsAppFloat() {
    const float = document.getElementById('whatsappFloat');
    if (float && CONFIG.empresa.whatsapp) {
        float.href = `https://wa.me/${CONFIG.empresa.whatsapp}?text=${encodeURIComponent(CONFIG.empresa.whatsapp_mensaje || 'Hola')}`;
    }
}

// ===== UTILIDADES =====
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, offset: 50 });
    }
}

function hideLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => {
                if (loader.parentNode) loader.parentNode.removeChild(loader);
            }, 500);
        }, 300);
    }
    console.log('✅ Loader ocultado');
}

function forceHideLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        loader.style.transition = 'all 0.5s ease';
        setTimeout(() => {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 500);
    }
    console.log('⚠️ Loader forzado');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: white; padding: 14px 20px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        display: flex; align-items: center; gap: 10px; animation: toastSlideIn 0.3s ease;
        border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        font-size: 0.9rem; margin-bottom: 8px;
    `;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Agregar animación para los toasts
const toastStyle = document.createElement('style');
toastStyle.textContent = '@keyframes toastSlideIn { from { opacity:0; transform:translateX(100px); } to { opacity:1; transform:translateX(0); } }';
document.head.appendChild(toastStyle);

console.log('✅ Script cargado correctamente');
