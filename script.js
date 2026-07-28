// ============================================
// FRONTEND PREMIUM - LÓGICA PRINCIPAL
// ============================================

let CONFIG = {};
let currentSlide = 0;
let totalSlides = 0;
let slideInterval = null;
let savedVehicles = JSON.parse(localStorage.getItem('savedVehicles') || '[]');

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    initAOS();
    initNavigation();
    initSlider();
    initSearch();
    initFilters();
    initWhatsAppFloat();
    hideLoader();
});

// ===== CARGA DE CONFIGURACIÓN =====
async function loadConfig() {
    const saved = localStorage.getItem('cms_premium_config');
    
    if (saved) {
        try {
            CONFIG = JSON.parse(saved);
        } catch (e) {
            CONFIG = await fetchConfigFile();
        }
    } else {
        CONFIG = await fetchConfigFile();
    }
    
    applyConfig();
    renderAll();
}

async function fetchConfigFile() {
    try {
        const response = await fetch('config.json');
        return await response.json();
    } catch (e) {
        console.warn('Usando configuración por defecto');
        return getDefaultConfig();
    }
}

function getDefaultConfig() {
    return {
        empresa: {
            nombre: 'Premium Motors', nombre_corto: 'PM', slogan: 'Excelencia en Movimiento',
            telefono_principal: '+58 424-1234567', email_contacto: 'info@premiummotors.com',
            direccion: 'Av. Principal, Ciudad', horario_semana: 'Lun-Vie: 8AM-6PM',
            whatsapp: '+584241234567', whatsapp_mensaje: 'Hola, vi su página web...',
            redes_sociales: { facebook: '#', instagram: '#', youtube: '#', tiktok: '#' }
        },
        apariencia: {
            colores: {
                primario: '#1a365d', primario_claro: '#2a4a7f', primario_oscuro: '#0f2440',
                secundario: '#c41e3a', acento: '#d4a853', fondo_principal: '#f8f9fb',
                texto_principal: '#1a365d', texto_secundario: '#4a5568'
            }
        },
        marcas: [],
        vehiculos: [],
        servicios: [],
        secciones: { hero_slider: true, barra_marcas: true, buscador_avanzado: true, catalogo_vehiculos: true, servicios: true, cta_final: true }
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
    root.style.setProperty('--accent', c.accento);
    root.style.setProperty('--bg-body', c.fondo_principal);
    root.style.setProperty('--text-primary', c.texto_principal);
    root.style.setProperty('--text-secondary', c.texto_secundario);
    
    // Datos empresa
    document.title = e.nombre + ' | Concesionario';
    document.getElementById('logoIcon').textContent = e.nombre_corto;
    document.getElementById('logoName').textContent = e.nombre;
    document.getElementById('logoSlogan').textContent = e.slogan;
    
    document.getElementById('topPhone').href = 'tel:' + e.telefono_principal;
    document.getElementById('topPhone').querySelector('span').textContent = e.telefono_principal;
    document.getElementById('topEmail').href = 'mailto:' + e.email_contacto;
    document.getElementById('topEmail').querySelector('span').textContent = e.email_contacto;
    document.getElementById('topHours').querySelector('span').textContent = e.horario_semana;

    // En la función applyConfig(), reemplazar la parte del logo:

    // Logo (soporta texto e imagen)
    const logoIcon = document.getElementById('logoIcon');
    if (logoIcon) {
        const tipo = e.logo_tipo || 'texto';
        const logoTexto = e.logo_texto || e.nombre_corto || 'LO';
        const logoImagen = e.logo_imagen || '';
        const colorFondo = e.logo_color_fondo || c.primario;
        const colorTexto = e.logo_color_texto || '#ffffff';
        
        if (tipo === 'imagen' && logoImagen) {
            // Mostrar solo imagen
            logoIcon.innerHTML = `<img src="${logoImagen}" alt="${e.nombre}" style="width:100%;height:100%;object-fit:contain;border-radius:8px;">`;
            logoIcon.style.background = 'white';
        } else if (tipo === 'ambos' && logoImagen) {
            // Mostrar imagen + texto
            logoIcon.innerHTML = `<img src="${logoImagen}" alt="${e.nombre}" style="width:100%;height:100%;object-fit:contain;border-radius:8px;">`;
            logoIcon.style.background = 'white';
            document.getElementById('logoName').textContent = e.nombre;
        } else {
            // Mostrar solo texto (comportamiento por defecto)
            logoIcon.innerHTML = logoTexto;
            logoIcon.style.background = `linear-gradient(135deg, ${colorFondo}, ${adjustColor(colorFondo, 30)})`;
            logoIcon.style.color = colorTexto;
        }
    }
    
    // Redes sociales
    const socialDiv = document.getElementById('topSocial');
    socialDiv.innerHTML = '';
    Object.entries(e.redes_sociales).forEach(([red, url]) => {
        if (url) socialDiv.innerHTML += `<a href="${url}" aria-label="${red}"><i class="fab fa-${red}"></i></a>`;
    });
    
    // WhatsApp
    document.getElementById('whatsappFloat').href = `https://wa.me/${e.whatsapp}?text=${encodeURIComponent(e.whatsapp_mensaje)}`;
    document.getElementById('ctaWhatsapp').href = `https://wa.me/${e.whatsapp}?text=${encodeURIComponent(e.whatsapp_mensaje)}`;
    
    // Secciones
    toggleSection('marcasStrip', CONFIG.secciones.barra_marcas);
    toggleSection('searchSection', CONFIG.secciones.buscador_avanzado);
    toggleSection('catalog', CONFIG.secciones.catalogo_vehiculos);
    toggleSection('servicios', CONFIG.secciones.servicios);
    toggleSection('ctaFinal', CONFIG.secciones.cta_final);
}

function toggleSection(id, show) {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? '' : 'none';
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
    const destacados = CONFIG.vehiculos.filter(v => v.destacado).slice(0, 3);
    const slider = document.getElementById('heroSlider');
    const dots = document.getElementById('heroDots');
    
    if (!destacados.length) {
        slider.innerHTML = `<div class="hero-slide active" style="background:linear-gradient(135deg,var(--primary),var(--primary-dark));display:flex;align-items:center;justify-content:center;"><div class="hero-content"><h1 class="hero-title" style="color:white;">${CONFIG.empresa.nombre}</h1><p class="hero-subtitle">${CONFIG.empresa.slogan}</p></div></div>`;
        totalSlides = 1;
        return;
    }
    
    totalSlides = destacados.length;
    
    slider.innerHTML = destacados.map((v, i) => `
        <div class="hero-slide ${i === 0 ? 'active' : ''}" style="background-image:url('${v.imagen_principal}')">
            <div class="container">
                <div class="hero-content">
                    <span class="hero-badge">${v.en_oferta ? '🏷️ Oferta' : '✨ Nuevo'}</span>
                    <h1 class="hero-title">${v.marca} <span class="highlight">${v.modelo}</span></h1>
                    <p class="hero-subtitle">${v.descripcion_corta || v.descripcion_larga?.substring(0, 120) + '...'}</p>
                    <p class="hero-price">Desde $${v.precio?.toLocaleString()}</p>
                    <div class="hero-cta">
                        <a href="#catalog" class="btn btn-white">Ver Catálogo</a>
                        <a href="#contacto" class="btn btn-primary" style="background:transparent;border:2px solid white;">Contáctanos</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    dots.innerHTML = destacados.map((_, i) => `
        <div class="hero-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
    `).join('');
    
    document.querySelectorAll('.hero-dot').forEach(dot => {
        dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
    });
}

function renderBrandsStrip() {
    const container = document.getElementById('brandsStripContent');
    if (!CONFIG.marcas.length) { container.innerHTML = ''; return; }
    
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
    const data = vehicles || CONFIG.vehiculos;
    const grid = document.getElementById('vehiclesGrid');
    
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
        <div class="vehicle-card" data-id="${v.id}" data-aos="fade-up">
            <div class="vehicle-card-image">
                <img src="${v.imagen_principal}" alt="${v.marca} ${v.modelo}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80'">
                <span class="vehicle-card-badge ${v.en_oferta ? 'badge-offer' : v.destacado ? 'badge-featured' : 'badge-new'}">${v.en_oferta ? 'Oferta' : v.destacado ? 'Destacado' : v.marca}</span>
                <button class="vehicle-card-save ${savedVehicles.includes(v.id) ? 'saved' : ''}" data-id="${v.id}" onclick="event.stopPropagation();toggleSave(${v.id})">
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
                    <div class="spec-item"><i class="fas fa-gas-pump"></i><span>Combustible</span><strong>${v.combustible}</strong></div>
                    <div class="spec-item"><i class="fas fa-cog"></i><span>Transmisión</span><strong>${v.transmision}</strong></div>
                    <div class="spec-item"><i class="fas fa-tachometer-alt"></i><span>Potencia</span><strong>${v.potencia}</strong></div>
                </div>
                <div class="vehicle-card-footer">
                    <div class="vehicle-card-price">$${v.precio?.toLocaleString()}<small>+ IVA</small></div>
                    <button class="vehicle-card-btn" onclick="event.stopPropagation();openVehicleModal(${v.id})">Ver Detalle</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Event listeners para tarjetas
    document.querySelectorAll('.vehicle-card').forEach(card => {
        card.addEventListener('click', () => openVehicleModal(parseInt(card.dataset.id)));
    });
}

function renderMarcasDetalladas() {
    const grid = document.getElementById('marcasGrid');
    if (!CONFIG.marcas.length) { 
        document.getElementById('marcas').style.display = 'none';
        return; 
    }
    
    grid.innerHTML = CONFIG.marcas.map(m => `
        <div class="servicio-card" data-aos="fade-up">
            <div class="servicio-icon" style="background:${m.color_marca || 'var(--primary)'}">
                <i class="fas fa-car"></i>
            </div>
            <h3>${m.nombre}</h3>
            <p>${m.descripcion}</p>
            ${m.caracteristicas?.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:12px;">${m.caracteristicas.map(c => `<span style="background:var(--bg-input);padding:4px 10px;border-radius:20px;font-size:0.75rem;">${c}</span>`).join('')}</div>` : ''}
        </div>
    `).join('');
}

function renderServicios() {
    const grid = document.getElementById('serviciosGrid');
    grid.innerHTML = CONFIG.servicios.map(s => `
        <div class="servicio-card" data-aos="fade-up">
            <div class="servicio-icon"><i class="fas ${s.icono}"></i></div>
            <h3>${s.titulo}</h3>
            <p>${s.descripcion}</p>
        </div>
    `).join('');
}

function renderFooter() {
    const e = CONFIG.empresa;
    document.getElementById('footerGrid').innerHTML = `
        <div>
            <div class="logo" style="margin-bottom:16px;">
                <div class="logo-icon">${e.nombre_corto}</div>
                <div><span class="logo-name" style="color:white;">${e.nombre}</span><span class="logo-tagline">${e.slogan}</span></div>
            </div>
            <p style="opacity:0.8;font-size:0.9rem;">${e.descripcion_corta || ''}</p>
        </div>
        <div>
            <h4>Contacto</h4>
            <ul class="footer-links">
                <li><i class="fas fa-map-marker-alt"></i> ${e.direccion}</li>
                <li><i class="fas fa-phone"></i> ${e.telefono_principal}</li>
                <li><i class="fas fa-envelope"></i> ${e.email_contacto}</li>
            </ul>
        </div>
        <div>
            <h4>Horario</h4>
            <ul class="footer-links">
                <li>${e.horario_semana}</li>
                <li>${e.horario_sabado}</li>
                <li>${e.horario_domingo}</li>
            </ul>
        </div>
        <div>
            <h4>Síguenos</h4>
            <div style="display:flex;gap:12px;font-size:1.2rem;">
                ${Object.entries(e.redes_sociales).map(([red, url]) => url ? `<a href="${url}" style="color:white;opacity:0.7;"><i class="fab fa-${red}"></i></a>` : '').join('')}
            </div>
        </div>
    `;
    
    document.getElementById('footerBottom').innerHTML = `
        <p>&copy; ${new Date().getFullYear()} ${e.nombre}. Todos los derechos reservados.</p>
    `;
}

function populateSearchFields() {
    const brands = [...new Set(CONFIG.vehiculos.map(v => v.marca))];
    const types = [...new Set(CONFIG.vehiculos.map(v => v.tipo))];
    const prices = [20000, 30000, 40000, 50000, 75000, 100000];
    
    document.getElementById('searchBrand').innerHTML = '<option value="">Todas las marcas</option>' + brands.map(b => `<option value="${b}">${b}</option>`).join('');
    document.getElementById('searchType').innerHTML = '<option value="">Todos los tipos</option>' + types.map(t => `<option value="${t}">${t.toUpperCase()}</option>`).join('');
    document.getElementById('searchPrice').innerHTML = '<option value="">Sin límite</option>' + prices.map(p => `<option value="${p}">Hasta $${p.toLocaleString()}</option>`).join('');
}

function populateFilterPills() {
    const brands = [...new Set(CONFIG.vehiculos.map(v => v.marca))];
    const types = [...new Set(CONFIG.vehiculos.map(v => v.tipo))];
    
    document.getElementById('filterPills').innerHTML = `
        <button class="filter-pill active" data-filter="all">Todos</button>
        ${brands.map(b => `<button class="filter-pill" data-filter="marca_${b}">${b}</button>`).join('')}
        ${types.map(t => `<button class="filter-pill" data-filter="tipo_${t}">${t.toUpperCase()}</button>`).join('')}
    `;
}

// ===== SLIDER =====
function initSlider() {
    document.getElementById('prevSlide').addEventListener('click', prevSlide);
    document.getElementById('nextSlide').addEventListener('click', nextSlide);
    startAutoSlide();
}

function goToSlide(index) {
    document.querySelectorAll('.hero-slide')[currentSlide]?.classList.remove('active');
    document.querySelectorAll('.hero-dot')[currentSlide]?.classList.remove('active');
    currentSlide = index;
    document.querySelectorAll('.hero-slide')[currentSlide]?.classList.add('active');
    document.querySelectorAll('.hero-dot')[currentSlide]?.classList.add('active');
}

function nextSlide() { goToSlide((currentSlide + 1) % totalSlides); resetAutoSlide(); }
function prevSlide() { goToSlide((currentSlide - 1 + totalSlides) % totalSlides); resetAutoSlide(); }

function startAutoSlide() { slideInterval = setInterval(nextSlide, 6000); }
function resetAutoSlide() { clearInterval(slideInterval); startAutoSlide(); }

// ===== BÚSQUEDA Y FILTROS =====
function initSearch() {
    document.getElementById('searchForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const brand = document.getElementById('searchBrand').value;
        const type = document.getElementById('searchType').value;
        const maxPrice = document.getElementById('searchPrice').value;
        
        let filtered = CONFIG.vehiculos;
        if (brand) filtered = filtered.filter(v => v.marca === brand);
        if (type) filtered = filtered.filter(v => v.tipo === type);
        if (maxPrice) filtered = filtered.filter(v => v.precio <= parseInt(maxPrice));
        
        renderVehicles(filtered);
        document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
        showToast(`Se encontraron ${filtered.length} vehículos`, filtered.length ? 'success' : 'info');
    });
}

function initFilters() {
    document.getElementById('filterPills').addEventListener('click', (e) => {
        if (!e.target.classList.contains('filter-pill')) return;
        
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        
        const filter = e.target.dataset.filter;
        let filtered = CONFIG.vehiculos;
        
        if (filter.startsWith('marca_')) {
            filtered = filtered.filter(v => v.marca === filter.replace('marca_', ''));
        } else if (filter.startsWith('tipo_')) {
            filtered = filtered.filter(v => v.tipo === filter.replace('tipo_', ''));
        }
        
        renderVehicles(filtered);
    });
}

// ===== MODAL =====
function openVehicleModal(vehicleId) {
    const v = CONFIG.vehiculos.find(veh => veh.id === vehicleId);
    if (!v) return;
    
    document.getElementById('vehicleModal').innerHTML = `
        <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        <div class="modal-image" style="height:300px;overflow:hidden;">
            <img src="${v.imagen_principal}" alt="${v.modelo}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80'">
        </div>
        <div style="padding:30px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
                <div>
                    <h2 style="font-family:var(--font-heading);font-size:1.8rem;">${v.marca} ${v.modelo} ${v.version || ''}</h2>
                    <p style="color:var(--text-secondary);">${v.año} • ${v.garantia || 'Garantía incluida'}</p>
                </div>
                <div style="font-family:var(--font-heading);font-size:2rem;font-weight:700;color:var(--primary);">$${v.precio?.toLocaleString()}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px;padding:20px;background:var(--bg-body);border-radius:12px;margin-bottom:20px;">
                <div style="text-align:center;"><i class="fas fa-gas-pump" style="color:var(--primary);"></i><p style="font-size:0.8rem;color:var(--text-muted);">Combustible</p><strong>${v.combustible}</strong></div>
                <div style="text-align:center;"><i class="fas fa-cog" style="color:var(--primary);"></i><p style="font-size:0.8rem;color:var(--text-muted);">Transmisión</p><strong>${v.transmision}</strong></div>
                <div style="text-align:center;"><i class="fas fa-tachometer-alt" style="color:var(--primary);"></i><p style="font-size:0.8rem;color:var(--text-muted);">Potencia</p><strong>${v.potencia}</strong></div>
            </div>
            <p style="color:var(--text-secondary);margin-bottom:24px;">${v.descripcion_larga || v.descripcion_corta}</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
                <button class="btn btn-primary"><i class="fas fa-file-invoice"></i> Solicitar Cotización</button>
                <a href="https://wa.me/${CONFIG.empresa.whatsapp}?text=${encodeURIComponent('Hola, me interesa el ' + v.marca + ' ' + v.modelo)}" class="btn btn-whatsapp" target="_blank"><i class="fab fa-whatsapp"></i> Consultar</a>
            </div>
        </div>
    `;
    
    document.getElementById('modalOverlay').classList.add('active');
    document.body.classList.add('modal-open');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.classList.remove('modal-open');
}

// ===== GUARDADOS =====
function toggleSave(vehicleId) {
    const index = savedVehicles.indexOf(vehicleId);
    if (index > -1) {
        savedVehicles.splice(index, 1);
        showToast('Vehículo eliminado de guardados', 'info');
    } else {
        savedVehicles.push(vehicleId);
        showToast('Vehículo guardado ❤️', 'success');
    }
    localStorage.setItem('savedVehicles', JSON.stringify(savedVehicles));
    renderVehicles();
}

// ===== NAVEGACIÓN =====
function initNavigation() {
    // Hamburguesa
    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementById('hamburger').classList.toggle('active');
        document.getElementById('navList').classList.toggle('active');
    });
    
    // Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('hamburger').classList.remove('active');
            document.getElementById('navList').classList.remove('active');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Scroll header
    window.addEventListener('scroll', () => {
        document.getElementById('header').classList.toggle('scrolled', window.scrollY > 50);
    });
    
    // Cerrar modal con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
}

// ===== WHATSAPP FLOAT =====
function initWhatsAppFloat() {
    const float = document.getElementById('whatsappFloat');
    float.href = `https://wa.me/${CONFIG.empresa.whatsapp}?text=${encodeURIComponent(CONFIG.empresa.whatsapp_mensaje)}`;
}

// ===== UTILIDADES =====
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50
        });
    }
}

function hideLoader() {
    setTimeout(() => {
        document.getElementById('pageLoader').classList.add('hidden');
    }, 600);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: white; padding: 14px 20px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        display: flex; align-items: center; gap: 10px; animation: slideIn 0.3s ease;
        border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        font-size: 0.9rem;
    `;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i> ${message}`;
    
    const container = document.getElementById('toastContainer');
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}