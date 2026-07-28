// ============================================
// CMS PROFESIONAL - LÓGICA DEL PANEL (CORREGIDO)
// ============================================

// Estado global
let CONFIG = {};
let currentSection = 'dashboard';
let autoSaveTimer = null;

// ===== CONFIGURACIÓN POR DEFECTO =====
function getDefaultConfig() {
    return {
        version: '2.0',
        empresa: {
            nombre: 'Mi Concesionario',
            nombre_corto: 'MC',
            slogan: 'Tu vehículo ideal',
            logo_tipo: 'texto',
            logo_texto: 'MC',
            logo_imagen: '',
            logo_color_fondo: '#1a365d',
            logo_color_texto: '#ffffff',
            descripcion_corta: '',
            descripcion_larga: '',
            telefono_principal: '',
            telefono_secundario: '',
            email_contacto: '',
            email_ventas: '',
            direccion: '',
            ciudad: '',
            estado: '',
            pais: 'Venezuela',
            horario_semana: '',
            horario_sabado: '',
            horario_domingo: 'Cerrado',
            whatsapp: '',
            whatsapp_mensaje: 'Hola, vi su página web y me gustaría recibir información.',
            redes_sociales: { 
                facebook: '', 
                instagram: '', 
                youtube: '', 
                tiktok: '', 
                linkedin: '' 
            },
            seo: { 
                titulo_sitio: '', 
                meta_descripcion: '', 
                meta_keywords: '', 
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
            },
            bordes_redondeados: '12px',
            sombra_tarjeta: '0 4px 20px rgba(0,0,0,0.08)',
            sombra_elevada: '0 10px 40px rgba(0,0,0,0.12)',
            transicion: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        marcas: [],
        vehiculos: [],
        servicios: [],
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

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Panel CMS...');
    loadConfig();
    initEventListeners();
});

// ===== CARGA DE CONFIGURACIÓN =====
function loadConfig() {
    console.log('📂 Cargando configuración...');
    
    // Intentar cargar desde localStorage
    const saved = localStorage.getItem('cms_premium_config');
    
    if (saved) {
        try {
            CONFIG = JSON.parse(saved);
            console.log('✅ Configuración cargada desde localStorage');
            updateUI();
            renderCurrentSection();
        } catch (e) {
            console.error('❌ Error al parsear localStorage:', e);
            CONFIG = getDefaultConfig();
            updateUI();
            renderCurrentSection();
        }
        return;
    }
    
    // Intentar cargar desde archivo config.json
    fetch('config.json')
        .then(response => {
            if (!response.ok) throw new Error('No se pudo cargar config.json');
            return response.json();
        })
        .then(data => {
            CONFIG = data;
            console.log('✅ Configuración cargada desde config.json');
            updateUI();
            renderCurrentSection();
        })
        .catch(error => {
            console.warn('⚠️ Usando configuración por defecto:', error.message);
            CONFIG = getDefaultConfig();
            updateUI();
            renderCurrentSection();
        });
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    console.log('🔧 Inicializando event listeners...');
    
    // Navegación del sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            console.log('📱 Navegando a:', section);
            navigateTo(section);
        });
    });
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Menú móvil
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
    }
    
    // Búsqueda en sidebar
    const sidebarSearch = document.getElementById('sidebarSearch');
    if (sidebarSearch) {
        sidebarSearch.addEventListener('input', filterSidebarItems);
    }
    
    // Botón guardar
    const saveAllBtn = document.getElementById('saveAllBtn');
    if (saveAllBtn) {
        saveAllBtn.addEventListener('click', function() {
            saveConfig();
            showToast('Configuración guardada exitosamente ✅', 'success');
        });
    }
    
    // Botón exportar
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportConfig);
    }
    
    // Botón importar
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    if (importBtn && importFile) {
        importBtn.addEventListener('click', function() {
            importFile.click();
        });
        importFile.addEventListener('change', handleImport);
    }
    
    // Teclas rápidas
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Cerrar modal con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    console.log('✅ Event listeners inicializados');
}

// ===== NAVEGACIÓN =====
function navigateTo(section) {
    currentSection = section;
    
    // Actualizar clase active en nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });
    
    // Actualizar breadcrumb
    const breadcrumb = document.getElementById('breadcrumbSection');
    if (breadcrumb) {
        const titles = {
            dashboard: 'Dashboard',
            empresa: 'Datos Empresa',
            apariencia: 'Apariencia',
            marcas: 'Marcas',
            vehiculos: 'Vehículos',
            servicios: 'Servicios',
            secciones: 'Secciones',
            seo: 'SEO',
            integraciones: 'Integraciones'
        };
        breadcrumb.textContent = titles[section] || section;
    }
    
    // Renderizar sección
    renderCurrentSection();
    
    // Scroll al top del contenido
    document.getElementById('adminBody').scrollTop = 0;
}

// ===== SIDEBAR =====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
}

function filterSidebarItems(e) {
    const query = e.target.value.toLowerCase();
    
    document.querySelectorAll('.nav-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
    });
    
    document.querySelectorAll('.nav-section-title').forEach(title => {
        title.style.display = query ? 'none' : 'block';
    });
}

// ===== GUARDADO =====
function saveConfig() {
    try {
        localStorage.setItem('cms_premium_config', JSON.stringify(CONFIG));
        updateSaveStatus('Todos los cambios guardados', 'success');
        updateUI();
        console.log('💾 Configuración guardada');
    } catch (e) {
        console.error('❌ Error al guardar:', e);
        updateSaveStatus('Error al guardar', 'error');
    }
}

function autoSave() {
    clearTimeout(autoSaveTimer);
    updateSaveStatus('Cambios sin guardar...', 'warning');
    autoSaveTimer = setTimeout(() => {
        localStorage.setItem('cms_premium_config', JSON.stringify(CONFIG));
        updateSaveStatus('Cambios auto-guardados', 'info');
        console.log('💾 Auto-guardado completado');
    }, 2000);
}

function updateSaveStatus(message, type) {
    const statusEl = document.getElementById('saveStatus');
    if (!statusEl) return;
    
    const icons = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
        error: 'fa-times-circle'
    };
    
    const colors = {
        success: '#10b981',
        warning: '#f59e0b',
        info: '#3b82f6',
        error: '#ef4444'
    };
    
    statusEl.innerHTML = `<i class="fas ${icons[type] || icons.info}" style="color:${colors[type] || colors.info};"></i> <span>${message}</span>`;
}

// ===== EXPORTAR/IMPORTAR =====
function exportConfig() {
    const dataStr = JSON.stringify(CONFIG, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config_${CONFIG.empresa.nombre_corto || 'sitio'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Configuración exportada 📥', 'success');
}

function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(ev) {
        try {
            const imported = JSON.parse(ev.target.result);
            
            // Mostrar modal de confirmación
            showConfirmModal(
                'Importar Configuración',
                '¿Estás seguro de importar esta configuración? Los cambios actuales se perderán.',
                function() {
                    CONFIG = imported;
                    saveConfig();
                    updateUI();
                    renderCurrentSection();
                    showToast('Configuración importada correctamente ✅', 'success');
                }
            );
        } catch (err) {
            showToast('Error: El archivo no es un JSON válido ❌', 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// ===== ACTUALIZACIÓN UI =====
function updateUI() {
    // Badges del sidebar
    const badgeMarcas = document.getElementById('badgeMarcas');
    const badgeVehiculos = document.getElementById('badgeVehiculos');
    const badgeServicios = document.getElementById('badgeServicios');
    
    if (badgeMarcas) badgeMarcas.textContent = CONFIG.marcas.length;
    if (badgeVehiculos) badgeVehiculos.textContent = CONFIG.vehiculos.length;
    if (badgeServicios) badgeServicios.textContent = CONFIG.servicios.length;
    
    // Stats del footer del sidebar
    const statVehiculos = document.getElementById('statVehiculos');
    const statMarcas = document.getElementById('statMarcas');
    const statServicios = document.getElementById('statServicios');
    
    if (statVehiculos) statVehiculos.textContent = CONFIG.vehiculos.length;
    if (statMarcas) statMarcas.textContent = CONFIG.marcas.length;
    if (statServicios) statServicios.textContent = CONFIG.servicios.length;
}

// ===== RENDERIZADO DE SECCIONES =====
function renderCurrentSection() {
    const body = document.getElementById('adminBody');
    if (!body) return;
    
    body.innerHTML = '<div style="text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:var(--cms-accent);"></i><p style="margin-top:12px;">Cargando...</p></div>';
    
    setTimeout(() => {
        switch(currentSection) {
            case 'dashboard':
                renderDashboard(body);
                break;
            case 'empresa':
                renderEmpresa(body);
                break;
            case 'apariencia':
                renderApariencia(body);
                break;
            case 'marcas':
                renderMarcas(body);
                break;
            case 'vehiculos':
                renderVehiculos(body);
                break;
            case 'servicios':
                renderServicios(body);
                break;
            case 'secciones':
                renderSecciones(body);
                break;
            case 'seo':
                renderSEO(body);
                break;
            case 'integraciones':
                renderIntegraciones(body);
                break;
            default:
                renderDashboard(body);
        }
        
        attachFormListeners();
    }, 100);
}

// ===== DASHBOARD =====
function renderDashboard(container) {
    const v = CONFIG.vehiculos;
    const m = CONFIG.marcas;
    const s = CONFIG.servicios;
    const destacados = v.filter(veh => veh.destacado).length;
    
    container.innerHTML = `
        <div class="dashboard-grid">
            <div class="stat-card" onclick="navigateTo('vehiculos')" style="cursor:pointer;">
                <div class="stat-icon blue"><i class="fas fa-car"></i></div>
                <div class="stat-info"><h3>${v.length}</h3><p>Vehículos en catálogo</p></div>
            </div>
            <div class="stat-card" onclick="navigateTo('marcas')" style="cursor:pointer;">
                <div class="stat-icon purple"><i class="fas fa-trademark"></i></div>
                <div class="stat-info"><h3>${m.length}</h3><p>Marcas representadas</p></div>
            </div>
            <div class="stat-card" onclick="navigateTo('servicios')" style="cursor:pointer;">
                <div class="stat-icon green"><i class="fas fa-concierge-bell"></i></div>
                <div class="stat-info"><h3>${s.length}</h3><p>Servicios ofrecidos</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange"><i class="fas fa-star"></i></div>
                <div class="stat-info"><h3>${destacados}</h3><p>Vehículos destacados</p></div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">Resumen del Sitio</div>
                    <div class="card-subtitle">Información general de tu concesionario</div>
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-primary btn-sm" onclick="saveConfig();showToast('Guardado ✅','success')">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                    <a href="index.html" target="_blank" class="btn btn-ghost btn-sm">
                        <i class="fas fa-eye"></i> Ver Sitio
                    </a>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;">
                <div>
                    <p style="font-weight:600;font-size:0.8rem;color:var(--cms-text-secondary);text-transform:uppercase;letter-spacing:1px;">Empresa</p>
                    <p style="font-size:1.2rem;font-weight:700;margin-top:4px;">${CONFIG.empresa.nombre || 'Sin nombre'}</p>
                    <p style="color:var(--cms-text-secondary);font-size:0.85rem;">${CONFIG.empresa.slogan || 'Sin slogan'}</p>
                </div>
                <div>
                    <p style="font-weight:600;font-size:0.8rem;color:var(--cms-text-secondary);text-transform:uppercase;letter-spacing:1px;">Tema</p>
                    <p style="font-size:1.2rem;font-weight:700;margin-top:4px;">${CONFIG.apariencia.tema === 'claro' ? '☀️ Claro' : '🌙 Oscuro'}</p>
                    <div style="display:flex;gap:6px;margin-top:6px;">
                        <span style="display:inline-block;width:18px;height:18px;background:${CONFIG.apariencia.colores.primario};border-radius:50%;"></span>
                        <span style="display:inline-block;width:18px;height:18px;background:${CONFIG.apariencia.colores.secundario};border-radius:50%;"></span>
                        <span style="display:inline-block;width:18px;height:18px;background:${CONFIG.apariencia.colores.acento};border-radius:50%;"></span>
                    </div>
                </div>
                <div>
                    <p style="font-weight:600;font-size:0.8rem;color:var(--cms-text-secondary);text-transform:uppercase;letter-spacing:1px;">Secciones Activas</p>
                    <p style="font-size:1.2rem;font-weight:700;margin-top:4px;">${Object.values(CONFIG.secciones).filter(Boolean).length} / ${Object.keys(CONFIG.secciones).length}</p>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <div class="card-title">🚀 Acciones Rápidas</div>
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="addItem('vehiculos');navigateTo('vehiculos')">
                    <i class="fas fa-plus"></i> Añadir Vehículo
                </button>
                <button class="btn btn-ghost" onclick="addItem('marcas');navigateTo('marcas')">
                    <i class="fas fa-plus"></i> Añadir Marca
                </button>
                <button class="btn btn-ghost" onclick="addItem('servicios');navigateTo('servicios')">
                    <i class="fas fa-plus"></i> Añadir Servicio
                </button>
                <button class="btn btn-ghost" onclick="navigateTo('apariencia')">
                    <i class="fas fa-palette"></i> Cambiar Colores
                </button>
                <button class="btn btn-ghost" onclick="exportConfig()">
                    <i class="fas fa-download"></i> Exportar
                </button>
            </div>
        </div>
        
        ${v.length > 0 ? `
        <div class="card">
            <div class="card-header"><div class="card-title">Últimos Vehículos</div></div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;">
                ${v.slice(0, 6).map(veh => `
                    <div style="background:var(--cms-bg);border-radius:8px;padding:12px;border:1px solid var(--cms-border);cursor:pointer;" onclick="navigateTo('vehiculos')">
                        <div style="height:100px;background:#e2e8f0;border-radius:6px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;font-size:2rem;color:var(--cms-text-light);">
                            <i class="fas fa-car"></i>
                        </div>
                        <p style="font-weight:700;font-size:0.85rem;">${veh.marca} ${veh.modelo}</p>
                        <p style="color:var(--cms-accent);font-weight:600;font-size:0.8rem;">$${veh.precio?.toLocaleString()}</p>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    `;
}

// ===== EMPRESA =====
function renderEmpresa(container) {
    const e = CONFIG.empresa;
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">Información de la Empresa</div>
                    <div class="card-subtitle">Estos datos aparecerán en todo el sitio web</div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="saveConfig();showToast('Guardado ✅','success')">
                    <i class="fas fa-save"></i> Guardar
                </button>
            </div>
            <div class="form-grid form-grid-2">
                <div class="form-group">
                    <label class="form-label">Nombre de la Empresa *</label>
                    <input type="text" class="form-input" value="${e.nombre}" data-path="empresa.nombre" placeholder="Ej: Premium Motors">
                </div>
                <div class="form-group">
                    <label class="form-label">Nombre Corto (2-3 letras)</label>
                    <input type="text" class="form-input" value="${e.nombre_corto}" data-path="empresa.nombre_corto" maxlength="3" placeholder="PM">
                </div>
                <div class="form-group">
                    <label class="form-label">Slogan</label>
                    <input type="text" class="form-input" value="${e.slogan}" data-path="empresa.slogan" placeholder="Excelencia en Movimiento">
                </div>
                <div class="form-group">
                    <label class="form-label">WhatsApp (con código país)</label>
                    <input type="text" class="form-input" value="${e.whatsapp}" data-path="empresa.whatsapp" placeholder="+584241234567">
                </div>
                <div class="form-group full">
                    <label class="form-label">Descripción Corta</label>
                    <textarea class="form-textarea" data-path="empresa.descripcion_corta" placeholder="Una breve descripción de tu concesionario...">${e.descripcion_corta}</textarea>
                </div>
                <div class="form-group full">
                    <label class="form-label">Descripción Larga</label>
                    <textarea class="form-textarea" data-path="empresa.descripcion_larga" rows="4" placeholder="Descripción detallada...">${e.descripcion_larga}</textarea>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><div class="card-title">Información de Contacto</div></div>
            <div class="form-grid form-grid-2">
                <div class="form-group"><label class="form-label">Teléfono Principal</label><input type="text" class="form-input" value="${e.telefono_principal}" data-path="empresa.telefono_principal"></div>
                <div class="form-group"><label class="form-label">Teléfono Secundario</label><input type="text" class="form-input" value="${e.telefono_secundario}" data-path="empresa.telefono_secundario"></div>
                <div class="form-group"><label class="form-label">Email Contacto</label><input type="email" class="form-input" value="${e.email_contacto}" data-path="empresa.email_contacto"></div>
                <div class="form-group"><label class="form-label">Email Ventas</label><input type="email" class="form-input" value="${e.email_ventas}" data-path="empresa.email_ventas"></div>
                <div class="form-group full"><label class="form-label">Dirección Completa</label><input type="text" class="form-input" value="${e.direccion}" data-path="empresa.direccion"></div>
                <div class="form-group"><label class="form-label">Ciudad</label><input type="text" class="form-input" value="${e.ciudad}" data-path="empresa.ciudad"></div>
                <div class="form-group"><label class="form-label">Estado</label><input type="text" class="form-input" value="${e.estado}" data-path="empresa.estado"></div>
                <div class="form-group"><label class="form-label">País</label><input type="text" class="form-input" value="${e.pais}" data-path="empresa.pais"></div>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><div class="card-title">Horarios</div></div>
            <div class="form-grid form-grid-3">
                <div class="form-group"><label class="form-label">Lunes a Viernes</label><input type="text" class="form-input" value="${e.horario_semana}" data-path="empresa.horario_semana" placeholder="8:00 AM - 6:00 PM"></div>
                <div class="form-group"><label class="form-label">Sábados</label><input type="text" class="form-input" value="${e.horario_sabado}" data-path="empresa.horario_sabado" placeholder="9:00 AM - 2:00 PM"></div>
                <div class="form-group"><label class="form-label">Domingos</label><input type="text" class="form-input" value="${e.horario_domingo}" data-path="empresa.horario_domingo" placeholder="Cerrado"></div>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><div class="card-title">Redes Sociales</div></div>
            <div class="form-grid form-grid-2">
                ${Object.entries(e.redes_sociales).map(([red, url]) => `
                    <div class="form-group">
                        <label class="form-label"><i class="fab fa-${red}"></i> ${red.charAt(0).toUpperCase() + red.slice(1)}</label>
                        <input type="url" class="form-input" value="${url}" data-path="empresa.redes_sociales.${red}" placeholder="https://...">
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="card">
            <div class="card-header"><div class="card-title">Mensaje de WhatsApp</div></div>
            <div class="form-group">
                <label class="form-label">Mensaje predefinido</label>
                <input type="text" class="form-input" value="${e.whatsapp_mensaje}" data-path="empresa.whatsapp_mensaje">
                <span class="form-hint">Este mensaje aparecerá cuando un cliente haga clic en el botón de WhatsApp</span>
            </div>
        </div>
    `;
}

// ===== APARIENCIA =====
function renderApariencia(container) {
    const a = CONFIG.apariencia;
    const c = a.colores;
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">Tema y Colores</div>
                    <div class="card-subtitle">Personaliza la apariencia visual de tu sitio web</div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="saveConfig();showToast('Guardado ✅','success')">
                    <i class="fas fa-save"></i> Guardar
                </button>
            </div>
            
            <div style="margin-bottom:20px;">
                <label class="form-label">Tema</label>
                <select class="form-select" data-path="apariencia.tema" style="width:200px;">
                    <option value="claro" ${a.tema === 'claro' ? 'selected' : ''}>☀️ Claro</option>
                    <option value="oscuro" ${a.tema === 'oscuro' ? 'selected' : ''}>🌙 Oscuro</option>
                </select>
            </div>
            
            <p style="font-weight:600;margin-bottom:12px;font-size:0.85rem;color:var(--cms-text-secondary);">COLORES PRINCIPALES</p>
            <div class="form-grid form-grid-4">
                ${[
                    { key: 'primario', label: 'Primario' },
                    { key: 'primario_claro', label: 'Primario Claro' },
                    { key: 'primario_oscuro', label: 'Primario Oscuro' },
                    { key: 'secundario', label: 'Secundario' },
                    { key: 'secundario_claro', label: 'Secundario Claro' },
                    { key: 'secundario_oscuro', label: 'Secundario Oscuro' },
                    { key: 'acento', label: 'Acento' },
                    { key: 'acento_claro', label: 'Acento Claro' }
                ].map(color => `
                    <div class="form-group">
                        <label class="form-label">${color.label}</label>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <input type="color" class="form-input-color" value="${c[color.key]}" data-path="apariencia.colores.${color.key}">
                            <code style="font-size:0.75rem;">${c[color.key]}</code>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <p style="font-weight:600;margin:20px 0 12px;font-size:0.85rem;color:var(--cms-text-secondary);">COLORES DE TEXTO Y FONDO</p>
            <div class="form-grid form-grid-4">
                ${['fondo_principal', 'fondo_tarjeta', 'texto_principal', 'texto_secundario', 'texto_claro', 'borde'].map(color => `
                    <div class="form-group">
                        <label class="form-label">${color.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                        <input type="color" class="form-input-color" value="${c[color]}" data-path="apariencia.colores.${color}">
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="card">
            <div class="card-header"><div class="card-title">Tipografía</div></div>
            <div class="form-grid form-grid-2">
                <div class="form-group">
                    <label class="form-label">Fuente para Títulos</label>
                    <select class="form-select" data-path="apariencia.tipografia.titulos">
                        <option value="'Playfair Display', Georgia, serif" ${a.tipografia.titulos.includes('Playfair') ? 'selected' : ''}>Playfair Display (Elegante)</option>
                        <option value="'Montserrat', sans-serif" ${a.tipografia.titulos.includes('Montserrat') ? 'selected' : ''}>Montserrat (Moderno)</option>
                        <option value="Georgia, 'Times New Roman', serif" ${a.tipografia.titulos.includes('Georgia') ? 'selected' : ''}>Georgia (Clásico)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Fuente para Cuerpo</label>
                    <select class="form-select" data-path="apariencia.tipografia.cuerpo">
                        <option value="'Inter', 'Segoe UI', sans-serif" ${a.tipografia.cuerpo.includes('Inter') ? 'selected' : ''}>Inter (Limpio)</option>
                        <option value="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" ${a.tipografia.cuerpo.includes('Segoe') ? 'selected' : ''}>Segoe UI (Windows)</option>
                        <option value="'Roboto', sans-serif" ${a.tipografia.cuerpo.includes('Roboto') ? 'selected' : ''}>Roboto (Google)</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

// ===== MARCAS =====
function renderMarcas(container) {
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">Marcas Representadas</div>
                    <div class="card-subtitle">${CONFIG.marcas.length} marcas en total</div>
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-primary btn-sm" onclick="addItem('marcas')"><i class="fas fa-plus"></i> Añadir Marca</button>
                    <button class="btn btn-ghost btn-sm" onclick="saveConfig();showToast('Guardado ✅','success')"><i class="fas fa-save"></i></button>
                </div>
            </div>
            <div class="items-list">
                ${CONFIG.marcas.length === 0 ? `
                    <div style="text-align:center;padding:60px 20px;color:var(--cms-text-light);">
                        <i class="fas fa-trademark" style="font-size:4rem;margin-bottom:16px;display:block;opacity:0.3;"></i>
                        <p style="font-size:1.1rem;margin-bottom:16px;">No hay marcas aún</p>
                        <button class="btn btn-primary" onclick="addItem('marcas')"><i class="fas fa-plus"></i> Añadir Primera Marca</button>
                    </div>
                ` : CONFIG.marcas.map((m, i) => `
                    <div class="item-card">
                        <div class="item-card-header" onclick="toggleItemBody(this)">
                            <div class="item-card-title">
                                <span class="item-card-badge" style="background:${m.color_marca || '#1a365d'};color:white;">${m.nombre || 'Nueva'}</span>
                                ${m.nombre || 'Nueva Marca'}
                            </div>
                            <div class="item-card-actions">
                                <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();duplicateItem('marcas', ${i})" title="Duplicar"><i class="fas fa-copy"></i></button>
                                <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteItem('marcas', ${i})" title="Eliminar"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                        <div class="item-card-body collapsed">
                            <div class="form-grid form-grid-2">
                                <div class="form-group"><label class="form-label">Nombre</label><input type="text" class="form-input" value="${m.nombre}" data-path="marcas.${i}.nombre"></div>
                                <div class="form-group"><label class="form-label">Color Representativo</label><input type="color" class="form-input-color" value="${m.color_marca || '#1a365d'}" data-path="marcas.${i}.color_marca"></div>
                                <div class="form-group"><label class="form-label">Sitio Web</label><input type="url" class="form-input" value="${m.sitio_web || ''}" data-path="marcas.${i}.sitio_web"></div>
                                <div class="form-group full"><label class="form-label">Descripción</label><textarea class="form-textarea" data-path="marcas.${i}.descripcion" rows="2">${m.descripcion || ''}</textarea></div>
                                <div class="form-group full">
                                    <label class="form-label">Características (separadas por coma)</label>
                                    <input type="text" class="form-input" value="${(m.caracteristicas || []).join(', ')}" data-path="marcas.${i}.caracteristicas_str">
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ===== VEHÍCULOS =====
function renderVehiculos(container) {
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">Catálogo de Vehículos</div>
                    <div class="card-subtitle">${CONFIG.vehiculos.length} vehículos en catálogo</div>
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-primary btn-sm" onclick="addItem('vehiculos')"><i class="fas fa-plus"></i> Añadir Vehículo</button>
                    <button class="btn btn-ghost btn-sm" onclick="saveConfig();showToast('Guardado ✅','success')"><i class="fas fa-save"></i></button>
                </div>
            </div>
            <div class="items-list">
                ${CONFIG.vehiculos.length === 0 ? `
                    <div style="text-align:center;padding:60px 20px;color:var(--cms-text-light);">
                        <i class="fas fa-car-side" style="font-size:4rem;margin-bottom:16px;display:block;opacity:0.3;"></i>
                        <p style="font-size:1.1rem;margin-bottom:16px;">No hay vehículos en el catálogo</p>
                        <button class="btn btn-primary" onclick="addItem('vehiculos')"><i class="fas fa-plus"></i> Añadir Primer Vehículo</button>
                    </div>
                ` : CONFIG.vehiculos.map((v, i) => `
                    <div class="item-card">
                        <div class="item-card-header" onclick="toggleItemBody(this)">
                            <div class="item-card-title">
                                <i class="fas fa-car" style="color:var(--cms-accent);"></i>
                                <span>${v.marca || 'Nuevo'} ${v.modelo || 'Vehículo'} ${v.version || ''}</span>
                                ${v.destacado ? '<span class="item-card-badge" style="background:#f59e0b;">★ Destacado</span>' : ''}
                                ${v.en_oferta ? '<span class="item-card-badge" style="background:#ef4444;">Oferta</span>' : ''}
                            </div>
                            <div class="item-card-actions">
                                <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();duplicateItem('vehiculos', ${i})" title="Duplicar"><i class="fas fa-copy"></i></button>
                                <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteItem('vehiculos', ${i})" title="Eliminar"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                        <div class="item-card-body collapsed">
                            <div class="form-grid form-grid-3">
                                <div class="form-group"><label class="form-label">Marca</label><input type="text" class="form-input" value="${v.marca}" data-path="vehiculos.${i}.marca"></div>
                                <div class="form-group"><label class="form-label">Modelo</label><input type="text" class="form-input" value="${v.modelo}" data-path="vehiculos.${i}.modelo"></div>
                                <div class="form-group"><label class="form-label">Versión</label><input type="text" class="form-input" value="${v.version || ''}" data-path="vehiculos.${i}.version"></div>
                                <div class="form-group"><label class="form-label">Año</label><input type="number" class="form-input" value="${v.año}" data-path="vehiculos.${i}.año"></div>
                                <div class="form-group"><label class="form-label">Precio (USD)</label><input type="number" class="form-input" value="${v.precio}" data-path="vehiculos.${i}.precio"></div>
                                <div class="form-group"><label class="form-label">Tipo</label>
                                    <select class="form-select" data-path="vehiculos.${i}.tipo">
                                        <option value="suv" ${v.tipo==='suv'?'selected':''}>SUV</option>
                                        <option value="pickup" ${v.tipo==='pickup'?'selected':''}>Pick-Up</option>
                                        <option value="sedan" ${v.tipo==='sedan'?'selected':''}>Sedán</option>
                                        <option value="comercial" ${v.tipo==='comercial'?'selected':''}>Comercial</option>
                                        <option value="deportivo" ${v.tipo==='deportivo'?'selected':''}>Deportivo</option>
                                    </select>
                                </div>
                                <div class="form-group"><label class="form-label">Combustible</label><input type="text" class="form-input" value="${v.combustible}" data-path="vehiculos.${i}.combustible"></div>
                                <div class="form-group"><label class="form-label">Transmisión</label><input type="text" class="form-input" value="${v.transmision}" data-path="vehiculos.${i}.transmision"></div>
                                <div class="form-group"><label class="form-label">Potencia</label><input type="text" class="form-input" value="${v.potencia}" data-path="vehiculos.${i}.potencia"></div>
                                <div class="form-group"><label class="form-label">Imagen URL</label><input type="text" class="form-input" value="${v.imagen_principal}" data-path="vehiculos.${i}.imagen_principal"></div>
                                <div class="form-group">
                                    <label class="form-label">Destacado</label>
                                    <div class="toggle-wrapper">
                                        <label class="toggle"><input type="checkbox" ${v.destacado?'checked':''} data-path="vehiculos.${i}.destacado"><span class="toggle-slider"></span></label>
                                        <span class="toggle-label">Mostrar en home</span>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">En Oferta</label>
                                    <div class="toggle-wrapper">
                                        <label class="toggle"><input type="checkbox" ${v.en_oferta?'checked':''} data-path="vehiculos.${i}.en_oferta"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                                <div class="form-group full"><label class="form-label">Descripción Corta</label><input type="text" class="form-input" value="${v.descripcion_corta || ''}" data-path="vehiculos.${i}.descripcion_corta"></div>
                                <div class="form-group full"><label class="form-label">Descripción Larga</label><textarea class="form-textarea" data-path="vehiculos.${i}.descripcion_larga" rows="3">${v.descripcion_larga || ''}</textarea></div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ===== SERVICIOS =====
function renderServicios(container) {
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">Servicios</div>
                    <div class="card-subtitle">${CONFIG.servicios.length} servicios ofrecidos</div>
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-primary btn-sm" onclick="addItem('servicios')"><i class="fas fa-plus"></i> Añadir Servicio</button>
                    <button class="btn btn-ghost btn-sm" onclick="saveConfig();showToast('Guardado ✅','success')"><i class="fas fa-save"></i></button>
                </div>
            </div>
            <div class="items-list">
                ${CONFIG.servicios.length === 0 ? `
                    <div style="text-align:center;padding:60px 20px;color:var(--cms-text-light);">
                        <i class="fas fa-concierge-bell" style="font-size:4rem;margin-bottom:16px;display:block;opacity:0.3;"></i>
                        <p style="font-size:1.1rem;margin-bottom:16px;">No hay servicios aún</p>
                        <button class="btn btn-primary" onclick="addItem('servicios')"><i class="fas fa-plus"></i> Añadir Primer Servicio</button>
                    </div>
                ` : CONFIG.servicios.map((s, i) => `
                    <div class="item-card">
                        <div class="item-card-header" onclick="toggleItemBody(this)">
                            <div class="item-card-title">
                                <i class="fas ${s.icono}" style="color:var(--cms-accent);"></i>
                                ${s.titulo || 'Nuevo Servicio'}
                            </div>
                            <div class="item-card-actions">
                                <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();duplicateItem('servicios', ${i})" title="Duplicar"><i class="fas fa-copy"></i></button>
                                <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteItem('servicios', ${i})" title="Eliminar"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                        <div class="item-card-body collapsed">
                            <div class="form-grid form-grid-2">
                                <div class="form-group"><label class="form-label">Icono FontAwesome</label><input type="text" class="form-input" value="${s.icono}" data-path="servicios.${i}.icono" placeholder="fa-star"></div>
                                <div class="form-group"><label class="form-label">Título</label><input type="text" class="form-input" value="${s.titulo}" data-path="servicios.${i}.titulo"></div>
                                <div class="form-group full"><label class="form-label">Descripción</label><textarea class="form-textarea" data-path="servicios.${i}.descripcion" rows="2">${s.descripcion || ''}</textarea></div>
                                <div class="form-group">
                                    <label class="form-label">Destacado</label>
                                    <div class="toggle-wrapper">
                                        <label class="toggle"><input type="checkbox" ${s.destacado?'checked':''} data-path="servicios.${i}.destacado"><span class="toggle-slider"></span></label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ===== SECCIONES =====
function renderSecciones(container) {
    const s = CONFIG.secciones;
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">Activar / Desactivar Secciones</div>
                    <div class="card-subtitle">Controla qué secciones se muestran en el sitio web público</div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="saveConfig();showToast('Guardado ✅','success')">
                    <i class="fas fa-save"></i> Guardar
                </button>
            </div>
            ${Object.entries(s).map(([key, value]) => `
                <div class="toggle-wrapper" style="padding:14px 0;border-bottom:1px solid var(--cms-border-light);">
                    <label class="toggle"><input type="checkbox" ${value ? 'checked' : ''} data-path="secciones.${key}"><span class="toggle-slider"></span></label>
                    <span class="toggle-label" style="font-weight:500;">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== SEO =====
function renderSEO(container) {
    const seo = CONFIG.empresa.seo;
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div class="card-title">Configuración SEO</div>
                <button class="btn btn-primary btn-sm" onclick="saveConfig();showToast('Guardado ✅','success')"><i class="fas fa-save"></i> Guardar</button>
            </div>
            <div class="form-grid">
                <div class="form-group"><label class="form-label">Título del Sitio (title tag)</label><input type="text" class="form-input" value="${seo.titulo_sitio}" data-path="empresa.seo.titulo_sitio"></div>
                <div class="form-group"><label class="form-label">Meta Descripción</label><textarea class="form-textarea" data-path="empresa.seo.meta_descripcion">${seo.meta_descripcion}</textarea><span class="form-hint">Máximo 160 caracteres</span></div>
                <div class="form-group"><label class="form-label">Meta Keywords</label><input type="text" class="form-input" value="${seo.meta_keywords}" data-path="empresa.seo.meta_keywords"><span class="form-hint">Separadas por coma</span></div>
                <div class="form-group"><label class="form-label">Emoji Favicon</label><input type="text" class="form-input" value="${seo.favicon_emoji}" data-path="empresa.seo.favicon_emoji" maxlength="2"></div>
            </div>
        </div>
    `;
}

// ===== INTEGRACIONES =====
function renderIntegraciones(container) {
    const i = CONFIG.integraciones;
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div class="card-title">Integraciones Externas</div>
                <button class="btn btn-primary btn-sm" onclick="saveConfig();showToast('Guardado ✅','success')"><i class="fas fa-save"></i> Guardar</button>
            </div>
            <div class="form-grid form-grid-2">
                <div class="form-group"><label class="form-label">Google Analytics ID</label><input type="text" class="form-input" value="${i.google_analytics_id}" data-path="integraciones.google_analytics_id" placeholder="G-XXXXXXXXXX"></div>
                <div class="form-group"><label class="form-label">Facebook Pixel ID</label><input type="text" class="form-input" value="${i.facebook_pixel_id}" data-path="integraciones.facebook_pixel_id"></div>
                <div class="form-group full"><label class="form-label">Google Maps Embed URL</label><input type="text" class="form-input" value="${i.google_maps_embed}" data-path="integraciones.google_maps_embed" placeholder="https://www.google.com/maps/embed?..."></div>
                <div class="form-group">
                    <label class="form-label">Chat en Vivo</label>
                    <div class="toggle-wrapper">
                        <label class="toggle"><input type="checkbox" ${i.chat_en_vivo?'checked':''} data-path="integraciones.chat_en_vivo"><span class="toggle-slider"></span></label>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== MANEJO DE ITEMS =====
function addItem(type) {
    const newItems = {
        marcas: { 
            id: Date.now(), 
            nombre: 'Nueva Marca', 
            descripcion: '', 
            caracteristicas: [], 
            color_marca: '#1a365d', 
            logo_url: '', 
            sitio_web: '' 
        },
        vehiculos: { 
            id: Date.now(), 
            marca: '', 
            modelo: '', 
            version: '', 
            año: 2024, 
            precio: 0, 
            moneda: 'USD', 
            tipo: 'suv', 
            combustible: '', 
            transmision: '', 
            potencia: '', 
            torque: '', 
            capacidad: '', 
            garantia: '', 
            destacado: false, 
            nuevo: true, 
            en_oferta: false, 
            imagen_principal: '', 
            descripcion_corta: '', 
            descripcion_larga: '', 
            colores_disponibles: [] 
        },
        servicios: { 
            id: Date.now(), 
            icono: 'fa-star', 
            titulo: 'Nuevo Servicio', 
            descripcion: '', 
            destacado: false 
        }
    };
    
    CONFIG[type].push(newItems[type]);
    autoSave();
    updateUI();
    renderCurrentSection();
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} añadido correctamente ✅`, 'success');
}

function deleteItem(type, index) {
    showConfirmModal(
        'Eliminar Elemento',
        '¿Estás seguro de eliminar este elemento? Esta acción no se puede deshacer.',
        function() {
            CONFIG[type].splice(index, 1);
            autoSave();
            updateUI();
            renderCurrentSection();
            showToast('Elemento eliminado', 'success');
        }
    );
}

function duplicateItem(type, index) {
    const item = JSON.parse(JSON.stringify(CONFIG[type][index]));
    item.id = Date.now();
    if (type === 'vehiculos') item.modelo += ' (Copia)';
    if (type === 'marcas') item.nombre += ' (Copia)';
    if (type === 'servicios') item.titulo += ' (Copia)';
    CONFIG[type].push(item);
    autoSave();
    updateUI();
    renderCurrentSection();
    showToast('Elemento duplicado', 'success');
}

function toggleItemBody(header) {
    const body = header.nextElementSibling;
    if (body) {
        body.classList.toggle('collapsed');
    }
}

// ===== FORMULARIOS =====
function attachFormListeners() {
    document.querySelectorAll('[data-path]').forEach(el => {
        el.removeEventListener('input', handleFormChange);
        el.removeEventListener('change', handleFormChange);
        el.addEventListener('input', handleFormChange);
        el.addEventListener('change', handleFormChange);
    });
}

function handleFormChange(e) {
    const path = e.target.dataset.path.split('.');
    let value = e.target.value;
    
    if (e.target.type === 'checkbox') {
        value = e.target.checked;
    }
    if (e.target.type === 'number') {
        value = parseFloat(value) || 0;
    }
    
    let obj = CONFIG;
    for (let i = 0; i < path.length - 1; i++) {
        if (!obj[path[i]]) obj[path[i]] = {};
        obj = obj[path[i]];
    }
    
    const lastKey = path[path.length - 1];
    if (lastKey === 'caracteristicas_str') {
        obj['caracteristicas'] = value.split(',').map(s => s.trim()).filter(s => s);
    } else {
        obj[lastKey] = value;
    }
    
    autoSave();
}

// ===== MODAL DE CONFIRMACIÓN =====
function showConfirmModal(title, message, onConfirm) {
    const overlay = document.getElementById('modalOverlay');
    const container = document.getElementById('modalContainer');
    
    container.innerHTML = `
        <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <p>${message}</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-danger" id="confirmBtn">Confirmar</button>
        </div>
    `;
    
    overlay.classList.add('active');
    
    document.getElementById('confirmBtn').addEventListener('click', function() {
        closeModal();
        if (onConfirm) onConfirm();
    });
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeModal();
    });
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// ===== TECLAS RÁPIDAS =====
function handleKeyboardShortcuts(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveConfig();
        showToast('Guardado con Ctrl+S ✅', 'success');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportConfig();
    }
}

// ===== TOAST =====
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        info: 'fa-circle-info',
        warning: 'fa-triangle-exclamation'
    };
    
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3000);
}

// ===== EMPRESA (VERSIÓN MEJORADA CON LOGO) =====
function renderEmpresa(container) {
    const e = CONFIG.empresa;
    
    // Asegurar que existan los campos de logo
    if (!e.logo_tipo) e.logo_tipo = 'texto';
    if (!e.logo_texto) e.logo_texto = e.nombre_corto || 'LO';
    if (!e.logo_imagen) e.logo_imagen = '';
    
    container.innerHTML = `
        <!-- Tarjeta de Logo -->
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">🎨 Logo de la Empresa</div>
                    <div class="card-subtitle">Personaliza cómo se verá tu marca en el sitio web</div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="saveConfig();showToast('Logo guardado ✅','success')">
                    <i class="fas fa-save"></i> Guardar
                </button>
            </div>
            
            <div class="logo-editor">
                <div class="logo-preview-section">
                    <div class="logo-preview-label">Vista Previa</div>
                    <div class="logo-preview-container" id="logoPreviewContainer">
                        ${renderLogoPreview(e)}
                    </div>
                </div>
                
                <div class="logo-options">
                    <div class="form-group">
                        <label class="form-label">Tipo de Logo</label>
                        <div class="logo-type-selector">
                            <label class="logo-type-option ${e.logo_tipo === 'texto' ? 'active' : ''}">
                                <input type="radio" name="logo_tipo" value="texto" ${e.logo_tipo === 'texto' ? 'checked' : ''} data-path="empresa.logo_tipo" onchange="updateLogoType('texto')">
                                <i class="fas fa-font"></i>
                                <span>Texto</span>
                            </label>
                            <label class="logo-type-option ${e.logo_tipo === 'imagen' ? 'active' : ''}">
                                <input type="radio" name="logo_tipo" value="imagen" ${e.logo_tipo === 'imagen' ? 'checked' : ''} data-path="empresa.logo_tipo" onchange="updateLogoType('imagen')">
                                <i class="fas fa-image"></i>
                                <span>Imagen</span>
                            </label>
                            <label class="logo-type-option ${e.logo_tipo === 'ambos' ? 'active' : ''}">
                                <input type="radio" name="logo_tipo" value="ambos" ${e.logo_tipo === 'ambos' ? 'checked' : ''} data-path="empresa.logo_tipo" onchange="updateLogoType('ambos')">
                                <i class="fas fa-layer-group"></i>
                                <span>Ambos</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="logo-text-options" id="logoTextOptions" style="display:${e.logo_tipo !== 'imagen' ? 'block' : 'none'}">
                        <div class="form-group">
                            <label class="form-label">Texto del Logo</label>
                            <input type="text" class="form-input" value="${e.logo_texto}" data-path="empresa.logo_texto" maxlength="4" placeholder="PM" oninput="updateLogoPreview()">
                            <span class="form-hint">Máximo 4 caracteres</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Color de Fondo del Logo</label>
                            <input type="color" class="form-input-color" value="${e.logo_color_fondo || CONFIG.apariencia.colores.primario}" data-path="empresa.logo_color_fondo" onchange="updateLogoPreview()">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Color del Texto</label>
                            <input type="color" class="form-input-color" value="${e.logo_color_texto || '#ffffff'}" data-path="empresa.logo_color_texto" onchange="updateLogoPreview()">
                        </div>
                    </div>
                    
                    <div class="logo-image-options" id="logoImageOptions" style="display:${e.logo_tipo !== 'texto' ? 'block' : 'none'}">
                        <div class="form-group">
                            <label class="form-label">Imagen del Logo</label>
                            <div class="logo-upload-area" id="logoUploadArea">
                                ${e.logo_imagen ? 
                                    `<img src="${e.logo_imagen}" alt="Logo" class="logo-uploaded-image" id="logoUploadedImage">
                                     <button class="btn btn-ghost btn-sm logo-remove-btn" onclick="removeLogo()">
                                        <i class="fas fa-trash"></i> Eliminar
                                     </button>` : 
                                    `<div class="logo-upload-placeholder">
                                        <i class="fas fa-cloud-upload-alt"></i>
                                        <p>Arrastra tu logo aquí o haz clic para seleccionar</p>
                                        <span>PNG, JPG o SVG (Máx. 2MB)</span>
                                    </div>`
                                }
                                <input type="file" id="logoFileInput" accept="image/png,image/jpeg,image/svg+xml" style="display:none;" onchange="handleLogoUpload(event)">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Resto de tarjetas de empresa... -->
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">Información de la Empresa</div>
                    <div class="card-subtitle">Estos datos aparecerán en todo el sitio web</div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="saveConfig();showToast('Guardado ✅','success')">
                    <i class="fas fa-save"></i> Guardar
                </button>
            </div>
            <div class="form-grid form-grid-2">
                <div class="form-group">
                    <label class="form-label">Nombre de la Empresa *</label>
                    <input type="text" class="form-input" value="${e.nombre}" data-path="empresa.nombre" placeholder="Ej: Premium Motors">
                </div>
                <div class="form-group">
                    <label class="form-label">Nombre Corto (2-3 letras)</label>
                    <input type="text" class="form-input" value="${e.nombre_corto}" data-path="empresa.nombre_corto" maxlength="3" placeholder="PM">
                </div>
                <div class="form-group">
                    <label class="form-label">Slogan</label>
                    <input type="text" class="form-input" value="${e.slogan}" data-path="empresa.slogan" placeholder="Excelencia en Movimiento">
                </div>
                <div class="form-group">
                    <label class="form-label">WhatsApp (con código país)</label>
                    <input type="text" class="form-input" value="${e.whatsapp}" data-path="empresa.whatsapp" placeholder="+584241234567">
                </div>
                <div class="form-group full">
                    <label class="form-label">Descripción Corta</label>
                    <textarea class="form-textarea" data-path="empresa.descripcion_corta" placeholder="Una breve descripción de tu concesionario...">${e.descripcion_corta}</textarea>
                </div>
                <div class="form-group full">
                    <label class="form-label">Descripción Larga</label>
                    <textarea class="form-textarea" data-path="empresa.descripcion_larga" rows="4" placeholder="Descripción detallada...">${e.descripcion_larga}</textarea>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><div class="card-title">Información de Contacto</div></div>
            <div class="form-grid form-grid-2">
                <div class="form-group"><label class="form-label">Teléfono Principal</label><input type="text" class="form-input" value="${e.telefono_principal}" data-path="empresa.telefono_principal"></div>
                <div class="form-group"><label class="form-label">Teléfono Secundario</label><input type="text" class="form-input" value="${e.telefono_secundario}" data-path="empresa.telefono_secundario"></div>
                <div class="form-group"><label class="form-label">Email Contacto</label><input type="email" class="form-input" value="${e.email_contacto}" data-path="empresa.email_contacto"></div>
                <div class="form-group"><label class="form-label">Email Ventas</label><input type="email" class="form-input" value="${e.email_ventas}" data-path="empresa.email_ventas"></div>
                <div class="form-group full"><label class="form-label">Dirección Completa</label><input type="text" class="form-input" value="${e.direccion}" data-path="empresa.direccion"></div>
                <div class="form-group"><label class="form-label">Ciudad</label><input type="text" class="form-input" value="${e.ciudad}" data-path="empresa.ciudad"></div>
                <div class="form-group"><label class="form-label">Estado</label><input type="text" class="form-input" value="${e.estado}" data-path="empresa.estado"></div>
                <div class="form-group"><label class="form-label">País</label><input type="text" class="form-input" value="${e.pais}" data-path="empresa.pais"></div>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><div class="card-title">Horarios</div></div>
            <div class="form-grid form-grid-3">
                <div class="form-group"><label class="form-label">Lunes a Viernes</label><input type="text" class="form-input" value="${e.horario_semana}" data-path="empresa.horario_semana" placeholder="8:00 AM - 6:00 PM"></div>
                <div class="form-group"><label class="form-label">Sábados</label><input type="text" class="form-input" value="${e.horario_sabado}" data-path="empresa.horario_sabado" placeholder="9:00 AM - 2:00 PM"></div>
                <div class="form-group"><label class="form-label">Domingos</label><input type="text" class="form-input" value="${e.horario_domingo}" data-path="empresa.horario_domingo" placeholder="Cerrado"></div>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><div class="card-title">Redes Sociales</div></div>
            <div class="form-grid form-grid-2">
                ${Object.entries(e.redes_sociales).map(([red, url]) => `
                    <div class="form-group">
                        <label class="form-label"><i class="fab fa-${red}"></i> ${red.charAt(0).toUpperCase() + red.slice(1)}</label>
                        <input type="url" class="form-input" value="${url}" data-path="empresa.redes_sociales.${red}" placeholder="https://...">
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="card">
            <div class="card-header"><div class="card-title">Mensaje de WhatsApp</div></div>
            <div class="form-group">
                <label class="form-label">Mensaje predefinido</label>
                <input type="text" class="form-input" value="${e.whatsapp_mensaje}" data-path="empresa.whatsapp_mensaje">
                <span class="form-hint">Este mensaje aparecerá cuando un cliente haga clic en el botón de WhatsApp</span>
            </div>
        </div>
    `;
    
    // Inicializar eventos del logo
    initLogoEvents();
}

// ===== FUNCIONES DE LOGO =====
function renderLogoPreview(empresa) {
    const tipo = empresa.logo_tipo || 'texto';
    const texto = empresa.logo_texto || 'LO';
    const imagen = empresa.logo_imagen || '';
    const colorFondo = empresa.logo_color_fondo || CONFIG.apariencia.colores.primario;
    const colorTexto = empresa.logo_color_texto || '#ffffff';
    
    let preview = '';
    
    if (tipo === 'imagen' && imagen) {
        preview = `<img src="${imagen}" alt="Logo" class="logo-preview-img">`;
    } else if (tipo === 'texto') {
        preview = `<div class="logo-preview-text" style="background:${colorFondo};color:${colorTexto};">${texto}</div>`;
    } else if (tipo === 'ambos') {
        preview = `
            <div style="display:flex;align-items:center;gap:10px;">
                ${imagen ? `<img src="${imagen}" alt="Logo" class="logo-preview-img-small">` : ''}
                <div class="logo-preview-text" style="background:${colorFondo};color:${colorTexto};">${texto}</div>
            </div>
        `;
    }
    
    return preview;
}

function updateLogoPreview() {
    const container = document.getElementById('logoPreviewContainer');
    if (container) {
        container.innerHTML = renderLogoPreview(CONFIG.empresa);
    }
}

function updateLogoType(tipo) {
    CONFIG.empresa.logo_tipo = tipo;
    
    // Mostrar/ocultar opciones según tipo
    const textOptions = document.getElementById('logoTextOptions');
    const imageOptions = document.getElementById('logoImageOptions');
    
    if (textOptions) textOptions.style.display = tipo !== 'imagen' ? 'block' : 'none';
    if (imageOptions) imageOptions.style.display = tipo !== 'texto' ? 'block' : 'none';
    
    // Actualizar radio buttons visuales
    document.querySelectorAll('.logo-type-option').forEach(opt => {
        opt.classList.toggle('active', opt.querySelector('input').value === tipo);
    });
    
    updateLogoPreview();
    autoSave();
}

function initLogoEvents() {
    const uploadArea = document.getElementById('logoUploadArea');
    const fileInput = document.getElementById('logoFileInput');
    
    if (uploadArea && fileInput) {
        // Click para seleccionar archivo
        uploadArea.addEventListener('click', function(e) {
            if (e.target.tagName !== 'BUTTON') {
                fileInput.click();
            }
        });
        
        // Drag and drop
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) processLogoFile(file);
        });
    }
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) processLogoFile(file);
}

function processLogoFile(file) {
    // Validar tipo
    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
        showToast('Formato no válido. Usa PNG, JPG o SVG ❌', 'error');
        return;
    }
    
    // Validar tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
        showToast('El archivo es demasiado grande. Máximo 2MB ❌', 'error');
        return;
    }
    
    // Convertir a base64
    const reader = new FileReader();
    reader.onload = function(e) {
        CONFIG.empresa.logo_imagen = e.target.result;
        
        // Actualizar vista previa
        updateLogoPreview();
        
        // Actualizar área de upload
        const uploadArea = document.getElementById('logoUploadArea');
        if (uploadArea) {
            uploadArea.innerHTML = `
                <img src="${e.target.result}" alt="Logo" class="logo-uploaded-image" id="logoUploadedImage">
                <button class="btn btn-ghost btn-sm logo-remove-btn" onclick="removeLogo()">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            `;
        }
        
        autoSave();
        showToast('Logo subido correctamente ✅', 'success');
    };
    reader.readAsDataURL(file);
}

function removeLogo() {
    CONFIG.empresa.logo_imagen = '';
    
    // Actualizar vista previa
    updateLogoPreview();
    
    // Actualizar área de upload
    const uploadArea = document.getElementById('logoUploadArea');
    if (uploadArea) {
        uploadArea.innerHTML = `
            <div class="logo-upload-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Arrastra tu logo aquí o haz clic para seleccionar</p>
                <span>PNG, JPG o SVG (Máx. 2MB)</span>
            </div>
        `;
    }
    
    autoSave();
    showToast('Logo eliminado', 'info');
}

// Hacer funciones de logo disponibles globalmente
window.updateLogoType = updateLogoType;
window.updateLogoPreview = updateLogoPreview;
window.handleLogoUpload = handleLogoUpload;
window.removeLogo = removeLogo;

// Hacer funciones disponibles globalmente
window.navigateTo = navigateTo;
window.saveConfig = saveConfig;
window.exportConfig = exportConfig;
window.addItem = addItem;
window.deleteItem = deleteItem;
window.duplicateItem = duplicateItem;
window.toggleItemBody = toggleItemBody;
window.closeModal = closeModal;
window.showToast = showToast;

console.log('✅ Panel CMS listo y funcional');