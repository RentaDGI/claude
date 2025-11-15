/**
 * Portal Estiba VLC - Aplicación Principal
 * Gestiona la navegación, autenticación y lógica de la aplicación
 */

// Estado global de la aplicación
const AppState = {
  currentUser: null,
  currentPage: 'login',
  isAuthenticated: false
};

// Datos estáticos - Enlaces actualizados con URLs reales
const ENLACES_DATA = [
  // Formularios
  { titulo: 'Reportar Bug', url: '#', categoria: 'Formularios', color: 'blue', modal: 'report-jornal' },
  { titulo: 'Punto y HS', url: 'https://docs.google.com/forms/d/e/1FAIpQLSeGKl5gwKrcj110D_6xhHVo0bn7Fo56tneof68dRyS6xUrD7Q/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Cambio Posición', url: 'https://docs.google.com/forms/d/e/1FAIpQLSe6V16kccSmyBAYCkDNphYAbD7dqe4ydHbVWu_zpXvnFFFxlA/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Cambio IRPF', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfDe2o5X_Bge14GA-bSBPRL7zpB2ZW_isBGGVFGAyvGkSAomQ/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Justificantes', url: 'https://docs.google.com/forms/d/e/1FAIpQLSc27Doc2847bvoPTygEKscwl9jdMuavlCOgtzNDXYVnjSLsUQ/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Comunicar Incidencia', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdc_NZM-gasxCpPZ3z09HgKcEcIapDsgDhNi_9Y45a-jpJnMw/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Modelo 145', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdEumqz7aiATukMmIyO2euqhVW5HEqf5Tn5WetAH5LBabcprg/viewform', categoria: 'Formularios', color: 'blue' },

  // Disponibilidad
  { titulo: 'No Disponible Jornada', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfXcs0lOG7beU9HMfum-6eKkwmZCjcvnOQXaFiiY8EAb9rpYA/closedform', categoria: 'Disponibilidad', color: 'yellow' },
  { titulo: 'No Disponible Periodo', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfTqZSFoEbs89vxmGXVi5DKpKIyH5npIOpI11uiQnt32Rxp3g/closedform', categoria: 'Disponibilidad', color: 'yellow' },
  { titulo: 'Recuperación', url: 'https://docs.google.com/forms/d/e/1FAIpQLSeEaBKptVkoX4oxktWkl5Be7fOhjdYUiRupyFkrG3LxWKISMA/viewform', categoria: 'Disponibilidad', color: 'yellow' },

  // Documentos
  { titulo: 'Carnet de Conducir', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdKF0jRJjcFrdbL3Wk_U-0Cjb3T-JeVYDNuN8QU1a-60kAXqA/viewform', categoria: 'Documentos', color: 'orange' },
  { titulo: 'Doc. Desempleo', url: 'https://docs.google.com/forms/d/e/1FAIpQLScL1GRtLuuRGgOolBLe31cWKqY92DZ9mFzfN2_uJwx3XmRq3g/viewform', categoria: 'Documentos', color: 'orange' },
  { titulo: '145 Abreviado', url: 'https://drive.google.com/file/d/1AwHoBJHTumN-cEYk6jV0nZGBGVFSJWPj/view', categoria: 'Documentos', color: 'orange' },

  // Seguridad
  { titulo: '¿Qué hago en caso de accidente?', url: 'https://drive.google.com/file/d/1Jei371j-lI95VTkBzm2XVfOxofjxvzbh/view', categoria: 'Seguridad', color: 'red' },

  // Información
  { titulo: 'Censo do', url: 'https://drive.google.com/file/d/1yIqMMJCRTyS8GZglMLTnR01A4MLU-spf/view', categoria: 'Información', color: 'green' },
  { titulo: 'Calendario de Pago', url: 'https://drive.google.com/file/d/1bovGdc1Fb6VRHrru1DrJOsSjbSEhFZgN/view', categoria: 'Información', color: 'green' },
  { titulo: 'Teléfonos Terminales', url: 'https://drive.google.com/file/d/1KxLm_X_0JdUEJF7JUuIvNNleU-PTqUgv/view', categoria: 'Información', color: 'green' },
  { titulo: 'Tabla Contratación', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pubhtml?gid=1388412839&single=true', categoria: 'Información', color: 'green' },
  { titulo: 'Chapero', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrMuapybwZUEGPR1vsP9p1_nlWvznyl0sPD4xWsNJ7HdXCj1ABY1EpU1um538HHZQyJtoAe5Niwrxq/pubhtml?gid=841547354&single=true', categoria: 'Información', color: 'green' },
  { titulo: 'Listado Ingreso CPE', url: 'https://drive.google.com/file/d/1YzLn6JHmCdQMrMlpNByIsdlYW3iU0P43/view?usp=drive_link', categoria: 'Información', color: 'green' },
  { titulo: 'Previsión Demandas', url: 'https://noray.cpevalencia.com/PrevisionDemanda.asp', categoria: 'Información', color: 'green' },
  { titulo: 'Chapero CPE', url: 'https://noray.cpevalencia.com/Chapero.asp', categoria: 'Información', color: 'green' },

  // Comunicaciones
  { titulo: 'Comunicación Contingencia', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdxLm9xqP4FOv61h3-YoyRFzkxKcfAGir_YYRi5e4PTFisEAw/viewform', categoria: 'Comunicaciones', color: 'purple' },
  { titulo: 'Comunicaciones Oficina', url: 'https://docs.google.com/forms/d/e/1FAIpQLSc_wN20zG_88wmAAyXRsCxokTpfvxRKdILHr5BxrQUuNGqvyQ/closedform', categoria: 'Comunicaciones', color: 'purple' }
];

// Noticias y avisos - Añadir contenido real aquí
const NOTICIAS_DATA = [
  {
    titulo: '🔧 Corrección: Cálculo de Posiciones OC',
    fecha: '05/11/2025',
    contenido: `Se ha corregido un error en el cálculo de posiciones para el personal de <strong>OC (Operaciones Complementarias)</strong>:
    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 5px;"><strong>Problema:</strong> El cálculo de "posiciones hasta la puerta" estaba considerando la puerta festiva en lugar de la laborable.</li>
      <li style="margin-bottom: 5px;"><strong>Solución:</strong> Ahora tanto SP como OC calculan sus posiciones basándose únicamente en las <strong>puertas laborables</strong> (02-08, 08-14, 14-20, 20-02).</li>
      <li><strong>Resultado:</strong> El indicador de posiciones en el Dashboard ahora muestra la distancia correcta para el personal de OC.</li>
    </ul>
    <p style="margin-top: 10px; font-style: italic; color: #64748b;">Gracias por reportar el problema. El cálculo ahora es preciso para todos los censos.</p>`
  },
  {
    titulo: '💰 ¡NUEVA FUNCIONALIDAD: Sueldómetro!',
    fecha: '05/11/2025',
    contenido: `Llega la función más esperada: el <strong>Sueldómetro</strong>. Ahora puedes calcular automáticamente tu salario estimado por quincena:
    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 5px;"><strong>Cálculo automático:</strong> Calcula tu salario base según tu puesto y jornada (laborable, festivo o sábado).</li>
      <li style="margin-bottom: 5px;"><strong>Prima editable:</strong> Puedes modificar los movimientos o la prima directamente en la tabla.</li>
      <li style="margin-bottom: 5px;"><strong>IRPF personalizable:</strong> Ajusta tu porcentaje de IRPF y ve el cálculo neto actualizado al instante.</li>
      <li style="margin-bottom: 5px;"><strong>Complementos incluidos:</strong> Los puestos de Trincador y Trincador de Coches incluyen automáticamente su complemento de 46,94€ (marcado con *).</li>
      <li style="margin-bottom: 5px;"><strong>Resumen por quincena:</strong> Visualiza totales de base, prima, bruto y neto organizados por quincenas.</li>
      <li style="margin-bottom: 5px;"><strong>Estadísticas globales:</strong> Ve el total de jornales, total bruto/neto y promedio en la parte superior.</li>
      <li><strong>Optimizado para móvil:</strong> Totalmente responsive y táctil para calcular desde cualquier dispositivo.</li>
    </ul>
    <p style="margin-top: 10px; font-weight: 600; color: #10b981;">¡Accede a "Sueldómetro" desde el menú lateral y comienza a calcular tus salarios!</p>`
  },
  {
  titulo: '⚙️ Actualización: Sistema de Contratación más Robusto',
    fecha: '04/11/2025',
    contenido: `Se ha implementado un sistema robusto para garantizar la visibilidad de tus asignaciones, incluso si el sistema principal falla:
    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 5px;"><strong>Mi Contratación:</strong> Ahora se guarda en tu dispositivo (localStorage). Si el CSV de contratación falla, tus asignaciones se mantienen visibles hasta medianoche (00:00).</li>
      <li style="margin-bottom: 5px;"><strong>Mis Jornales:</strong> El histórico es totalmente independiente y se actualiza automáticamente cada hora vía Apps Script.</li>
      <li><strong>Nuevo Enlace:</strong> Se ha añadido "Listado Ingreso CPE" en la sección de Enlaces Útiles.</li>
    </ul>`
  },
  {
    titulo: '🚀 ¡Nueva Función: Posición en la Puerta!',
    fecha: '02/11/2025', // <-- Recuerda ajustar la fecha si lo necesitas
    contenido: `Ahora puedes ver en la pantalla de "Dashboard" (justo debajo de tu nombre) a cuántas posiciones estás de la última puerta contratada.
    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 5px;">El sistema calcula tu distancia automáticamente.</li>
      <li style="margin-bottom: 5px;">Importante: El cálculo tiene en cuenta si perteneces al censo de <b>SP</b> (Servicio Público) o al de <b>OC</b> (Operaciones Complementarias) y te compara con la puerta correspondiente a tu censo.</li>
      <li>Así sabrás de un vistazo cuánto falta para tu próxima contratación.</li>
    </ul>`
},
   {
    titulo: '📢 Actualización en Puertas: Añadida Puerta OC',
    fecha: '02/11/2025',
    contenido: `Se ha mejorado la visualización de las puertas. Ahora la tabla muestra tres columnas para mayor claridad:
    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 10px;">      
      <li style="margin-bottom: 5px;">La <b>Puerta SP</b> se muestra en color <span style="color: #10b981; font-weight: 600;">Verde</span>.</li>
      <li style="margin-bottom: 5px;">La <b>Puerta OC</b> se muestra en color <span style="color: #0a2e5c; font-weight: 600;">Azul</span>.</li>
      <li>Este formato se aplica tanto a puertas laborables como festivas.</li>
    </ul>`
  },
  {
    titulo: '✨ Mejora Visual en "Mis Jornales"',
    fecha: '02/11/2025',
    contenido: `Se ha mejorado el indicador de quincenas en la sección "Mis Jornales" para que sea más fácil de identificar:
    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 5px;">Se usa un emoji de calendario distinto según la quincena: <b>📅 (para días 1-15)</b> o <b>🗓️ (para días 16 al fin de mes)</b>.</li>
      <li>El formato de la etiqueta ahora es más claro (ej: "📅 1-15 NOV").</li>
    </ul>`
  },
  {
    titulo: '📊 Nuevas Estadísticas de Colores en Censo',
    fecha: '02/11/2025',
    contenido: `La pestaña "Censo" ahora incluye un nuevo resumen estadístico de chapas por color:
    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 5px;">Se muestran 5 tarjetas (Verde, Azul, Amarillo, Naranja, Rojo) justo debajo de la leyenda de colores.</li>
      <li style="margin-bottom: 5px;">Cada tarjeta muestra la <b>cantidad total</b> de chapas de ese color.</li>
      <li>También se muestra el <b>porcentaje</b> que representa cada color sobre el total de chapas.</li>
    </ul>`
  },

  // --- NOTICIAS ANTERIORES ---
  {
    titulo: '🚨 IMPORTANTE: Muestra tu Nombre',
    fecha: '01/11/2025',
    contenido: 'Si quieres que se muestre tu nombre en vez de tu chapa, comunícale tu nombre al administrador.'
  },
  {
    titulo: '📢 Actualización del Sistema (Jornales)',
    fecha: '01/11/2025',
    contenido: 'Se ha mejorado el sistema de jornales. Ahora puedes exportar a CSV y ver tus jornales organizados por quincenas.'
  }

];

/**
 * Función auxiliar para formatear fechas
 * Convierte de ISO (yyyy-mm-dd) o español (dd/mm/yyyy) a español (dd/mm/yyyy)
 */
function formatearFecha(fecha) {
  if (!fecha) return '';

  // Si ya está en formato español (dd/mm/yyyy), devolver tal cual
  if (fecha.includes('/')) {
    return fecha;
  }

  // Si está en formato ISO (yyyy-mm-dd), convertir
  if (fecha.includes('-')) {
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  }

  return fecha;
}

/**
 * Inicialización de la aplicación
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portal Estiba VLC - Iniciando aplicación...');

  // Inicializar funciones que no dependen del login
  initAddJornalManual();
  initReportJornal();
  initForoEnhanced();
  initSyncJornalesButton();

  // Luego, inicializar la lógica principal
  initializeApp();
  setupEventListeners();
  checkStoredSession();
});

/**
 * Inicializa la aplicación
 */
async function initializeApp() {
  // Cargar contenido estático
  renderEnlaces();
  renderNoticias();

  // Verificar si hay sesión guardada
  const storedChapa = localStorage.getItem('currentChapa');
  if (storedChapa) {
    // Obtener nombre del usuario (ahora desde Supabase)
    const { data: userData, error } = await supabase
      .from('usuarios')
      .select('nombre')
      .eq('chapa', storedChapa)
      .single();

    if (error) {
      console.error('Error obteniendo nombre de usuario desde Supabase:', error.message);
    }
    const nombre = userData ? userData.nombre : `Chapa ${storedChapa}`;
    await loginUser(storedChapa, nombre);

    // Manejar navegación por hash (para deep linking desde notificaciones)
    handleHashNavigation();
  } else {
    showPage('login');
  }
}

/**
 * Maneja la navegación basada en el hash de la URL
 * Permite deep linking desde notificaciones push
 */
function handleHashNavigation() {
  const hash = window.location.hash.slice(1); // Elimina el '#'
  if (hash && AppState.isAuthenticated) {
    console.log('📍 Navegando por hash:', hash);
    navigateTo(hash);
  }
}

// Listener para cambios en el hash
window.addEventListener('hashchange', handleHashNavigation);

// ============================================================================
// AUTO-REFRESH PARA PRIMAS E IRPF (Cada 5 minutos)
// ============================================================================

let autoRefreshInterval = null;

/**
 * Inicia el auto-refresh de primas e IRPF cada 5 minutos
 * Se ejecuta automáticamente después del login
 */
function startAutoRefresh() {
  // Limpiar intervalo anterior si existe
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }

  console.log('🔄 Iniciando auto-refresh para primas e IRPF (cada 5 minutos)...');

  // NO ejecutar inmediatamente - esperar 10 segundos para asegurar que Supabase esté inicializado
  // Ejecutar la primera actualización después de 10 segundos
  setTimeout(() => {
    refreshPrimasYConfiguracion();
  }, 10000);

  // Configurar intervalo de 5 minutos (300000 ms)
  autoRefreshInterval = setInterval(() => {
    refreshPrimasYConfiguracion();
  }, 5 * 60 * 1000);
}

/**
 * Detiene el auto-refresh (se llama al hacer logout)
 */
function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    console.log('🛑 Auto-refresh detenido');
  }
}

/**
 * Refresca los datos de primas e IRPF desde Supabase
 */
async function refreshPrimasYConfiguracion() {
  if (!AppState.currentUser) {
    console.log('⚠️ No hay usuario autenticado, saltando auto-refresh');
    return;
  }

  // Verificar que Supabase esté inicializado
  if (typeof window.supabase === 'undefined' || !window.supabase) {
    console.warn('⚠️ Supabase aún no está inicializado, saltando auto-refresh');
    return;
  }

  console.log('🔄 Auto-refresh: Actualizando primas e IRPF desde Supabase...');

  try {
    // 1. Invalidar cache de configuracion_usuario (IRPF)
    const configCacheKey = `supabase_config_${AppState.currentUser}`;
    localStorage.removeItem(configCacheKey);

    // 2. Invalidar cache de primas_personalizadas (todas las combinaciones posibles)
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith(`supabase_primas_${AppState.currentUser}`)) {
        localStorage.removeItem(key);
      }
    });

    // 3. Forzar recarga desde Supabase (llama a getUserConfig y getPrimasPersonalizadas)
    // Asumimos que estas funciones están en SheetsAPI (que ahora es una abstracción sobre Supabase)
    const [configActualizada, primasActualizadas] = await Promise.all([
      SheetsAPI.getUserConfig(AppState.currentUser),
      SheetsAPI.getPrimasPersonalizadas(AppState.currentUser)
    ]);

    console.log(`✅ Auto-refresh completado:`, {
      irpf: configActualizada?.irpf || 'sin datos',
      primas: primasActualizadas?.length || 0
    });

    // 4. NO recargar Sueldómetro automáticamente para evitar perder cambios del usuario
    // El usuario puede recargar manualmente si lo necesita
    if (AppState.currentPage === 'sueldometro') {
      console.log('ℹ️ Usuario en Sueldómetro - datos actualizados en caché pero NO recargando vista para evitar perder cambios');
    }

  } catch (error) {
    console.error('❌ Error en auto-refresh:', error);
  }
}

// ============================================================================

/**
 * Configura los event listeners
 */
function setupEventListeners() {
  // Botón de login
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }

  // Enter en el input de chapa y contraseña
  const chapaInput = document.getElementById('chapa-input');
  const passwordInput = document.getElementById('password-input');
  if (chapaInput) {
    chapaInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    });
  }
  if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    });
  }

  // Botón de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Botón de cambiar contraseña
  const changePasswordBtn = document.getElementById('change-password-btn');
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', openChangePasswordModal);
  }

  // Modal de cambiar contraseña
  const closePasswordModal = document.getElementById('close-password-modal');
  if (closePasswordModal) {
    closePasswordModal.addEventListener('click', closeChangePasswordModal);
  }

  const cancelPasswordChange = document.getElementById('cancel-password-change');
  if (cancelPasswordChange) {
    cancelPasswordChange.addEventListener('click', closeChangePasswordModal);
  }

  const confirmPasswordChange = document.getElementById('confirm-password-change');
  if (confirmPasswordChange) {
    confirmPasswordChange.addEventListener('click', handlePasswordChange);
  }

  // Navegación del sidebar
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const page = link.dataset.page;
      if (page) {
        navigateTo(page);
        closeSidebar();
      }
    });
  });

  // Cards del dashboard
  const dashboardCards = document.querySelectorAll('.dashboard-card[data-navigate]');
  dashboardCards.forEach(card => {
    card.addEventListener('click', () => {
      const page = card.dataset.navigate;
      if (page) {
        navigateTo(page);
      }
    });
  });

  // Menú móvil
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', toggleSidebar);
  }

  const sidebarOverlay = document.getElementById('sidebar-overlay');
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Foro
  const foroSendBtn = document.getElementById('foro-send');
  if (foroSendBtn) {
    foroSendBtn.addEventListener('click', sendForoMessage);
  }

  const foroInput = document.getElementById('foro-input');
  if (foroInput) {
    foroInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendForoMessage();
      }
    });
  }

  // Botón de scroll hacia abajo en el foro
  const scrollToBottomBtn = document.getElementById('scroll-to-bottom-btn');
  if (scrollToBottomBtn) {
    scrollToBottomBtn.addEventListener('click', scrollToBottomForo);
  }

  // Detectar scroll en el contenedor de mensajes del foro
  initForoScrollDetection();
}

/**
 * Verifica si hay una sesión guardada
 */
function checkStoredSession() {
  const storedChapa = localStorage.getItem('currentChapa');
  const storedName = localStorage.getItem('currentUserName');

  if (storedChapa) {
    AppState.currentUser = storedChapa;
    AppState.currentUserName = storedName || `Chapa ${storedChapa}`;
    AppState.isAuthenticated = true;
    updateUIForAuthenticatedUser();
  }
}

/**
 * Maneja el login con validación de contraseña
 */
async function handleLogin() {
  const chapaInput = document.getElementById('chapa-input');
  const passwordInput = document.getElementById('password-input');
  const errorMsg = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');

  const chapa = chapaInput.value.trim();
  const password = passwordInput.value.trim();

  // Validar campos vacíos
  if (!chapa || chapa.length < 2) {
    errorMsg.textContent = 'Por favor, introduce un número de chapa válido';
    errorMsg.classList.add('active');
    chapaInput.focus();
    return;
  }

  if (!password) {
    errorMsg.textContent = 'Por favor, introduce tu contraseña';
    errorMsg.classList.add('active');
    passwordInput.focus();
    return;
  }

  // Deshabilitar botón mientras valida
  loginBtn.disabled = true;
  loginBtn.textContent = 'Validando...';
  errorMsg.classList.remove('active');

  try {
    console.log('🔐 Intentando login para chapa:', chapa);

    // --- ⚠️ ADVERTENCIA DE SEGURIDAD ---
    // Las contraseñas se guardan en TEXTO PLANO (sin hashing).
    // Esto es INSEGURO para producción. Cualquiera con acceso a la BD puede ver las contraseñas.
    // --- FIN ADVERTENCIA ---

    // Asumimos que `supabase` está disponible globalmente (desde supabase.js)
    const { data: userData, error: loginError } = await supabase
      .from('usuarios')
         .select('chapa, nombre, password_hash') // password_hash contiene contraseña en texto plano
      .eq('chapa', chapa)
      .single();

    if (loginError) {
      if (loginError.code === 'PGRST116') { // No rows found
        throw new Error('Chapa no encontrada');
      }
      console.error('Error al consultar usuario en Supabase:', loginError);
      throw new Error('Error al validar credenciales');
    }

    if (!userData) {
      throw new Error('Chapa no encontrada');
    }

    // Comparamos la contraseña directamente (texto plano)
    const isPasswordValid = (password === userData.password_hash);

    if (isPasswordValid) {
      console.log('✅ Login exitoso');
      // Login exitoso
      await loginUser(chapa, userData.nombre || `Chapa ${chapa}`);
    } else {
      console.error('❌ Contraseña incorrecta para chapa:', chapa);
      throw new Error('Contraseña incorrecta');
    }

  } catch (error) {
    console.error('Error en login:', error);
    errorMsg.textContent = error.message || 'Error al validar credenciales';
    errorMsg.classList.add('active');
    passwordInput.value = '';
    passwordInput.focus();
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
      Acceder al Portal
    `;
  }
}

/**
 * Inicia sesión de usuario
 */
async function loginUser(chapa, nombre = null) {
  AppState.currentUser = chapa;
  AppState.currentUserName = nombre || `Chapa ${chapa}`;
  AppState.isAuthenticated = true;

  // Guardar en localStorage
  localStorage.setItem('currentChapa', chapa);
  localStorage.setItem('currentUserName', AppState.currentUserName);

  // Actualizar cache de nombres de usuarios desde Supabase
  try {
    await actualizarCacheNombres(); // Llama a SheetsAPI.getUsuarios, que ahora usa Supabase
    console.log('✅ Cache de nombres actualizado en login');
  } catch (error) {
    console.warn('⚠️ No se pudo actualizar cache de nombres:', error);
    // Fallback: al menos guardar el usuario actual
    const usuariosCache = JSON.parse(localStorage.getItem('usuarios_cache') || '{}');
    usuariosCache[chapa] = AppState.currentUserName;
    localStorage.setItem('usuarios_cache', JSON.stringify(usuariosCache));
  }

  // Actualizar UI
  updateUIForAuthenticatedUser();

  // Iniciar auto-refresh de primas e IRPF (cada 5 minutos)
  startAutoRefresh();

  // Navegar al dashboard
  navigateTo('dashboard');
}

/**
 * Actualiza la UI para usuario autenticado
 */
function updateUIForAuthenticatedUser() {
  const userInfo = document.getElementById('user-info');
  const userChapa = document.getElementById('user-chapa');

  if (userInfo) userInfo.classList.remove('hidden');
  if (userChapa) userChapa.textContent = AppState.currentUserName || `Chapa ${AppState.currentUser}`;

  // Actualizar mensaje de bienvenida con posiciones hasta contratación
  const welcomeMsg = document.getElementById('welcome-message');
  if (welcomeMsg) {
    const nombreUsuario = AppState.currentUserName || `Chapa ${AppState.currentUser}`;
    welcomeMsg.textContent = `Bienvenido/a, ${nombreUsuario}`;

    // Obtener y mostrar posiciones hasta contratación (laborable y festiva)
    SheetsAPI.getPosicionesHastaContratacion(AppState.currentUser) // SheetsAPI (ahora en supabase.js)
      .then(posicionesObj => { // 'posicionesObj' es ahora { laborable: X, festiva: Y }
        
        // Limpiar cualquier span de posición anterior
        const existingSpans = welcomeMsg.querySelectorAll('span');
        existingSpans.forEach(span => span.remove());

        if (posicionesObj) {
          
          // --- RENDERIZAR LÍNEA LABORABLE ---
          if (posicionesObj.laborable !== null) {
            const posicionInfoLab = document.createElement('span');
            posicionInfoLab.style.display = 'block';
            posicionInfoLab.style.marginTop = '0.5rem';
            posicionInfoLab.style.fontSize = '0.95rem';
            posicionInfoLab.style.color = '#FFFFFF';
            posicionInfoLab.style.fontWeight = '600';

            if (posicionesObj.laborable === 0) {
              posicionInfoLab.innerHTML = '🎉 ¡Estás en la última puerta <strong>laborable</strong>!';
            } else {
              posicionInfoLab.innerHTML = `📍 Estás a <strong style="color: #FFFFFF; font-weight: 800;">${posicionesObj.laborable}</strong> posiciones de la puerta <strong>laborable</strong>`;
            }
            welcomeMsg.appendChild(posicionInfoLab);
          }

          // --- RENDERIZAR LÍNEA FESTIVA ---
          if (posicionesObj.festiva !== null) {
            const posicionInfoFest = document.createElement('span');
            posicionInfoFest.style.display = 'block';
            posicionInfoFest.style.marginTop = '0.25rem'; // Menos espacio entre las dos líneas
            posicionInfoFest.style.fontSize = '0.95rem';
            posicionInfoFest.style.color = '#FFFFFF';
            posicionInfoFest.style.fontWeight = '600';

            if (posicionesObj.festiva === 0) {
              posicionInfoFest.innerHTML = '🎉 ¡Estás en la última puerta <strong>festiva</strong>!';
            } else {
              posicionInfoFest.innerHTML = `📍 Estás a <strong style="color: #FFFFFF; font-weight: 800;">${posicionesObj.festiva}</strong> posiciones de la puerta <strong>festiva</strong>`;
            }
            welcomeMsg.appendChild(posicionInfoFest);
          }
        }
      })
      .catch(error => {
        console.error('Error obteniendo posiciones:', error);
      });
  }
}

/**
 * Maneja el logout
 */
function handleLogout() {
  // Detener auto-refresh
  stopAutoRefresh();
  AppState.currentUser = null;
  AppState.isAuthenticated = false;

  localStorage.removeItem('currentChapa');
  localStorage.removeItem('currentUserName'); // También limpiar nombre

  const userInfo = document.getElementById('user-info');
  if (userInfo) userInfo.classList.add('hidden');

  showPage('login');
}

/**
 * Abre el modal de cambio de contraseña
 */
function openChangePasswordModal() {
  const modal = document.getElementById('change-password-modal');
  if (modal) {
    modal.style.display = 'flex';

    // Limpiar campos y mensajes
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';

    const errorMsg = document.getElementById('password-change-error');
    const successMsg = document.getElementById('password-change-success');
    if (errorMsg) {
      errorMsg.textContent = '';
      errorMsg.classList.remove('active');
    }
    if (successMsg) {
      successMsg.textContent = '';
      successMsg.classList.remove('active');
    }
  }
}

/**
 * Cierra el modal de cambio de contraseña
 */
function closeChangePasswordModal() {
  const modal = document.getElementById('change-password-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Maneja el cambio de contraseña
 */
async function handlePasswordChange() {
  const currentPasswordInput = document.getElementById('current-password');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const errorMsg = document.getElementById('password-change-error');
  const successMsg = document.getElementById('password-change-success');
  const confirmBtn = document.getElementById('confirm-password-change');

  const currentPassword = currentPasswordInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  // Limpiar mensajes previos
  errorMsg.textContent = '';
  errorMsg.classList.remove('active');
  successMsg.textContent = '';
  successMsg.classList.remove('active');

  // Validaciones
  if (!currentPassword) {
    errorMsg.textContent = 'Por favor, introduce tu contraseña actual';
    errorMsg.classList.add('active');
    currentPasswordInput.focus();
    return;
  }

  if (!newPassword) {
    errorMsg.textContent = 'Por favor, introduce una nueva contraseña';
    errorMsg.classList.add('active');
    newPasswordInput.focus();
    return;
  }

  if (newPassword.length < 4) {
    errorMsg.textContent = 'La nueva contraseña debe tener al menos 4 caracteres';
    errorMsg.classList.add('active');
    newPasswordInput.focus();
    return;
  }

  if (newPassword !== confirmPassword) {
    errorMsg.textContent = 'Las contraseñas no coinciden';
    errorMsg.classList.add('active');
    confirmPasswordInput.focus();
    return;
  }

  if (currentPassword === newPassword) {
    errorMsg.textContent = 'La nueva contraseña debe ser diferente de la actual';
    errorMsg.classList.add('active');
    newPasswordInput.focus();
    return;
  }

  // Deshabilitar botón mientras procesa
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Cambiando...';

  try {
    const chapa = AppState.currentUser;

    console.log('🔐 Cambiando contraseña para chapa:', chapa);

    // Llamar a la función segura de Supabase para cambiar contraseña
    // (Asumimos que SheetsAPI.cambiarContrasena ahora utiliza Supabase)
    const result = await SheetsAPI.cambiarContrasena(chapa, currentPassword, newPassword);

    if (result.success) {
      console.log('✅ Contraseña cambiada exitosamente');
      successMsg.textContent = '¡Contraseña cambiada exitosamente!';
      successMsg.classList.add('active');

      // Limpiar campos
      currentPasswordInput.value = '';
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        closeChangePasswordModal();
      }, 2000);
    } else {
      throw new Error(result.message || 'Error al cambiar la contraseña');
    }

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    errorMsg.textContent = error.message || 'Error al cambiar la contraseña';
    errorMsg.classList.add('active');
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Cambiar Contraseña';
  }
}

/**
 * Navega a una página
 */
function navigateTo(pageName) {
  if (!AppState.isAuthenticated && pageName !== 'login') {
    showPage('login');
    return;
  }

  AppState.currentPage = pageName;
  showPage(pageName);

  // Actualizar hash en la URL (para deep linking)
  if (pageName !== 'login' && window.location.hash !== `#${pageName}`) {
    window.location.hash = pageName;
  }

  // Cargar datos según la página
  switch (pageName) {
    case 'dashboard':
      // El dashboard se carga con updateUIForAuthenticatedUser
      break;
    case 'contratacion':
      loadContratacion();
      break;
    case 'jornales':
      loadJornales();
      break;
    case 'puertas':
      loadPuertas();
      break;
    case 'censo':
      loadCenso();
      break;
    case 'foro':
      loadForo();
      break;
    case 'sueldometro':
      loadSueldometro();
      break;
    case 'enlaces':
      renderEnlaces(); // Se renderiza estáticamente, pero aseguramos llamada
      break;
    case 'noticias':
      renderNoticias(); // Se renderiza estáticamente, pero aseguramos llamada
      break;
    case 'push-notifications':
        // Esta página se autoinicializa con un MutationObserver en index.html
        // No necesita una función de carga específica aquí.
        console.log('Navegando a la página de Notificaciones Push.');
        break;
  }
}

/**
 * Muestra una página
 */
function showPage(pageName) {
  const allPages = document.querySelectorAll('.page');
  allPages.forEach(page => page.classList.remove('active'));

  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) {
    targetPage.classList.add('active');
  } else {
    console.warn(`⚠️ Página con ID 'page-${pageName}' no encontrada.`);
  }

  // Actualizar navegación activa
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    if (link.dataset.page === pageName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Scroll al inicio
  window.scrollTo(0, 0);
}

/**
 * Toggle sidebar en móvil
 */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
}

/**
 * Cierra el sidebar
 */
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  sidebar.classList.remove('active');
  overlay.classList.remove('active');
}

/**
 * Carga la página de contratación
 * SIMPLIFICADO: Lee directamente desde tabla jornales de Supabase
 * Muestra jornales del usuario para HOY + 2 días siguientes
 */
async function loadContratacion() {
  const container = document.getElementById('contratacion-content');
  const loading = document.getElementById('contratacion-loading');

  if (!container) return;

  loading.classList.remove('hidden');
  container.innerHTML = '';

  try {
    // SINCRONIZAR JORNALES DESDE CSV ANTES DE CARGAR (Esto lo hace tu Edge Function, pero si quieres forzar manual...)
    console.log('🔄 Verificando sincronización de jornales (desde Supabase)...');
    try {
        // Asumiendo que SheetsAPI.syncJornalesFromCSV ahora invoca la Edge Function de sincronización
        // o tu lógica de sincronización ya la tienes configurada en Supabase Edge Functions programadas.
        // Si no tienes una Edge Function de sincronización activable desde el cliente, puedes omitir esta línea
        // y solo cargar los datos directamente.
        await SheetsAPI.syncJornalesFromCSV(); 
    } catch (syncError) {
      console.error('⚠️ Error en la verificación de sincronización de jornales, continuando con datos existentes:', syncError);
    }

    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    const pasadoManana = new Date(hoy);
    pasadoManana.setDate(pasadoManana.getDate() + 2);

    const formatFecha = (fecha) => {
      const dd = String(fecha.getDate()).padStart(2, '0');
      const mm = String(fecha.getMonth() + 1).padStart(2, '0');
      const yyyy = fecha.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    const fechaHoy = formatFecha(hoy);
    const fechaManana = formatFecha(manana);
    const fechaPasadoManana = formatFecha(pasadoManana);

    console.log('=== CONTRATACIONES (desde tabla jornales) ===');
    console.log('Chapa:', AppState.currentUser);
    console.log('Fechas a buscar:', fechaHoy, fechaManana, fechaPasadoManana);

    // LEER TODOS LOS JORNALES DEL USUARIO DESDE SUPABASE
    console.log('📥 Cargando jornales del usuario desde Supabase...');
    const todosJornales = await SheetsAPI.getJornalesHistoricoAcumulado(AppState.currentUser);
    console.log(`✅ ${todosJornales.length} jornales totales del usuario`);

    // FILTRAR SOLO LOS JORNALES DE HOY, MAÑANA Y PASADO MAÑANA
    const jornalesProximos = todosJornales.filter(jornal => {
      const jornalFechaFormateada = formatearFecha(jornal.fecha); // Asegurar que estén en el mismo formato
      return jornalFechaFormateada === fechaHoy ||
             jornalFechaFormateada === fechaManana ||
             jornalFechaFormateada === fechaPasadoManana;
    });

    console.log(`📊 ${jornalesProximos.length} jornales filtrados para los próximos 3 días`);

    loading.classList.add('hidden');

    if (jornalesProximos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>No hay asignaciones actuales</h3>
          <p>No tienes contrataciones asignadas para hoy, mañana o pasado mañana.</p>
        </div>
      `;
      return;
    }

    // NORMALIZAR FORMATO DE JORNADA
    const normalizeJornada = (jornada) => {
      if (!jornada) return '';
      let norm = jornada.toString().trim().toLowerCase();
      norm = norm.replace(/\s*a\s*/g, '-');
      norm = norm.replace(/\s+/g, '');
      return norm;
    };

    // ORDENAR POR FECHA Y JORNADA
    const sortedData = jornalesProximos.sort((a, b) => {
      // Primero por fecha (más antigua primero para mostrar cronológicamente en el UI)
      const dateA = new Date((a.fecha.includes('/') ? a.fecha.split('/').reverse().join('-') : a.fecha));
      const dateB = new Date((b.fecha.includes('/') ? b.fecha.split('/').reverse().join('-') : b.fecha));
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }

      // Para el mismo día: ordenar por hora de inicio de jornada
      const jornadaNormA = normalizeJornada(a.jornada);
      const jornadaNormB = normalizeJornada(b.jornada);

      const jornadaOrder = {
        '02-08': 1,
        '08-14': 2,
        '14-20': 3,
        '20-02': 4
      };

      return (jornadaOrder[jornadaNormA] || 99) - (jornadaOrder[jornadaNormB] || 99);
    });

    // MAPEO DE EMPRESAS A LOGOS
    const empresaLogos = {
      'APM': 'https://i.imgur.com/HgQ95qc.jpeg',
      'CSP': 'https://i.imgur.com/8Tjx3KP.jpeg',
      'VTEU': 'https://i.imgur.com/3nNCkw5.jpeg',
      'MSC': 'https://i.imgur.com/kX4Ujxf.jpeg',
      'ERH': 'https://i.imgur.com/OHDp62K.png',
      'ERSHIP': 'https://i.imgur.com/OHDp62K.png'
    };

    const getEmpresaLogo = (empresa) => {
      if (!empresa) return null;
      const empresaUpper = empresa.toString().toUpperCase().trim();
      return empresaLogos[empresaUpper] || null;
    };

    // AGRUPAR POR FECHA
    const contratacionesPorFecha = {};
    sortedData.forEach(jornal => {
      const fechaFormateada = formatearFecha(jornal.fecha);
      if (!contratacionesPorFecha[fechaFormateada]) {
        contratacionesPorFecha[fechaFormateada] = [];
      }
      contratacionesPorFecha[fechaFormateada].push(jornal);
    });

    // OBTENER FECHAS ÚNICAS ORDENADAS (para asegurar el orden al renderizar)
    const fechasUnicas = Object.keys(contratacionesPorFecha).sort((a, b) => {
      const dateA = new Date(a.split('/').reverse().join('-'));
      const dateB = new Date(b.split('/').reverse().join('-'));
      return dateA - dateB;
    });


    // RENDERIZAR CADA FECHA CON DISEÑO BONITO
    fechasUnicas.forEach((fecha, index) => {
      const jornalesDia = contratacionesPorFecha[fecha];

      // Determinar etiqueta del día
      let etiquetaDia = '';
      if (fecha === fechaHoy) etiquetaDia = 'Hoy';
      else if (fecha === fechaManana) etiquetaDia = 'Mañana';
      else if (fecha === fechaPasadoManana) etiquetaDia = 'Pasado Mañana';

      // Header de fecha con emoji 📅
      const fechaInfo = document.createElement('div');
      fechaInfo.style.marginBottom = '1.5rem';
      fechaInfo.style.marginTop = index > 0 ? '2.5rem' : '0';
      fechaInfo.style.padding = '1rem';
      fechaInfo.style.background = 'white';
      fechaInfo.style.color = 'var(--puerto-dark-blue)';
      fechaInfo.style.border = '2px solid var(--puerto-blue)';
      fechaInfo.style.borderRadius = '12px';
      fechaInfo.style.textAlign = 'center';
      fechaInfo.style.fontSize = '1.1rem';
      fechaInfo.style.fontWeight = 'bold';
      fechaInfo.innerHTML = `📅 ${etiquetaDia} - ${fecha} (${jornalesDia.length} asignación${jornalesDia.length > 1 ? 'es' : ''})`;
      container.appendChild(fechaInfo);

      // Grid de tarjetas para esta fecha
      const cardsContainer = document.createElement('div');
      cardsContainer.className = 'contratacion-cards';
      cardsContainer.style.display = 'grid';
      cardsContainer.style.gap = '1.5rem';
      cardsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';

      jornalesDia.forEach(jornal => {
        const logo = getEmpresaLogo(jornal.empresa);

        const card = document.createElement('div');
        card.className = 'contratacion-card';
        card.style.background = 'white';
        card.style.borderRadius = '16px';
        card.style.border = '2px solid var(--border-color)';
        card.style.overflow = 'hidden';
        card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        card.style.transition = 'transform 0.2s, box-shadow 0.2s';

        card.innerHTML = `
          ${logo ? `
            <div style="background: white; padding: 1.5rem; display: flex; align-items: center; justify-content: center; min-height: 140px; border-bottom: 2px solid var(--border-color);">
              <img src="${logo}" alt="${jornal.empresa}" style="max-width: 100%; max-height: 150px; object-fit: contain;">
            </div>
          ` : `
            <div style="background: linear-gradient(135deg, var(--puerto-blue), var(--puerto-dark-blue)); padding: 2rem; text-align: center;">
              <div style="color: white; font-size: 1.5rem; font-weight: bold;">${jornal.empresa || 'Sin Empresa'}</div>
            </div>
          `}
          <div style="padding: 1.5rem;">
            <div style="margin-bottom: 1rem;">
              <div style="color: var(--puerto-blue); font-weight: bold; font-size: 1.25rem; margin-bottom: 0.5rem;">
                ${jornal.puesto || 'Sin puesto'}
              </div>
              <div style="color: var(--text-secondary); font-size: 0.9rem;">Puesto asignado</div>
            </div>

            <div style="display: grid; gap: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; color: var(--puerto-blue);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div style="font-size: 0.85rem; color: var(--text-secondary);">Jornada</div>
                  <div style="font-weight: 600;">${jornal.jornada || '--'}</div>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; color: var(--puerto-green);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div style="font-size: 0.85rem; color: var(--text-secondary);">Buque</div>
                  <div style="font-weight: 600;">${jornal.buque || '--'}</div>
                </div>
              </div>

              ${jornal.parte ? `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; color: var(--puerto-orange);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Parte</div>
                    <div style="font-weight: 600;">${jornal.parte}</div>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `;

        // Efecto hover
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-4px)';
          card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        });

        // Click para abrir modal con chapas del parte
        card.addEventListener('click', () => {
          if (jornal.parte) {
            mostrarChapasDelParte({
              parte: jornal.parte,
              empresa: jornal.empresa,
              buque: jornal.buque,
              fecha: jornal.fecha,
              jornada: jornal.jornada,
              puesto: jornal.puesto
            });
          }
        });

        cardsContainer.appendChild(card);
      });

      container.appendChild(cardsContainer);
    });

  } catch (error) {
    console.error('❌ Error cargando contrataciones:', error);
    loading.classList.add('hidden');
    container.innerHTML = `
      <div class="empty-state">
        <h3>Error al cargar datos</h3>
        <p>No se pudieron cargar las asignaciones. Por favor, intenta de nuevo más tarde.</p>
      </div>
    `;
  }
}

/**
 * Muestra el modal con todas las chapas contratadas en un parte específico,
 * agrupadas por puesto de contratación (usando Supabase)
 */
async function mostrarChapasDelParte(parteInfo) {
  const modal = document.getElementById('modal-chapas-parte');
  const loading = document.getElementById('modal-chapas-loading');
  const content = document.getElementById('modal-chapas-content');
  const titulo = document.getElementById('modal-chapas-titulo');
  const subtitulo = document.getElementById('modal-chapas-subtitulo');

  if (!modal) return;

  // Función para obtener el emoji de un puesto
  const getEmojiPuesto = (puesto) => {
    const puestoLower = puesto.toLowerCase();
    if (puestoLower.includes('conductor de 1')) return '🚚';
    if (puestoLower.includes('conductor de 2')) return '🚗';
    if (puestoLower.includes('trincador de coches') || puestoLower.includes('trincador de coche')) return '👷';
    if (puestoLower.includes('trincador')) return '👷';
    if (puestoLower.includes('especialista')) return '👷';
    return '👤'; // emoji por defecto
  };

  // Mostrar modal
  modal.style.display = 'flex';
  loading.classList.remove('hidden');
  content.innerHTML = '';

  // Actualizar título
  titulo.textContent = `Parte ${parteInfo.parte}`;
  subtitulo.textContent = `${parteInfo.empresa} • ${parteInfo.buque} • ${parteInfo.fecha} • ${parteInfo.jornada}`;

  try {
    console.log('🔍 Buscando chapas para el parte desde Supabase:', parteInfo.parte);
    console.log('📅 Fecha recibida:', parteInfo.fecha);
    console.log('🕐 Jornada recibida:', parteInfo.jornada);

    // Convertir fecha de formato español (DD/MM/YYYY) a formato ISO (YYYY-MM-DD) para Supabase
    const convertirFechaAISO = (fechaEsp) => {
      if (!fechaEsp) return null;
      if (fechaEsp.includes('-')) return fechaEsp; // Ya está en formato ISO
      const [dia, mes, año] = fechaEsp.split('/');
      return `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    };

    const fechaISO = convertirFechaAISO(parteInfo.fecha);
    console.log('📅 Fecha convertida a ISO:', fechaISO);

    // Obtener TODAS las chapas del parte desde Supabase
    // Asumimos que `supabase` está disponible globalmente desde `supabase.js`
    const { data: chapasDelParte, error } = await supabase
      .from('jornales')
      .select('*')
      .eq('parte', parteInfo.parte)
      .eq('fecha', fechaISO)
      .eq('jornada', parteInfo.jornada);

    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }

    console.log(`✅ ${chapasDelParte ? chapasDelParte.length : 0} chapas encontradas en el parte`);
    if (chapasDelParte && chapasDelParte.length > 0) {
      console.log('📋 Primeras 3 chapas:', chapasDelParte.slice(0, 3));
    }

    loading.classList.add('hidden');

    if (!chapasDelParte || chapasDelParte.length === 0) {
      content.innerHTML = `
        <div class="modal-empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3>No se encontraron chapas</h3>
          <p>No hay chapas asignadas a este parte.</p>
        </div>
      `;
      return;
    }

    // Agrupar por puesto de contratación
    const chapasPorPuesto = {};
    chapasDelParte.forEach(jornal => {
      const puesto = jornal.puesto || 'Sin puesto asignado';
      if (!chapasPorPuesto[puesto]) {
        chapasPorPuesto[puesto] = [];
      }
      chapasPorPuesto[puesto].push(jornal.chapa);
    });

    // Ordenar puestos alfabéticamente
    const puestosOrdenados = Object.keys(chapasPorPuesto).sort();

    // Renderizar grupos de puestos
    puestosOrdenados.forEach(puesto => {
      const chapas = chapasPorPuesto[puesto];

      const puestoGroup = document.createElement('div');
      puestoGroup.className = 'puesto-group';

      const header = document.createElement('div');
      header.className = 'puesto-group-header';
      header.innerHTML = `
        <h3 class="puesto-group-title">${getEmojiPuesto(puesto)} ${puesto}</h3>
        <span class="puesto-group-count">${chapas.length} asignacion${chapas.length > 1 ? 'es' : ''}</span>
      `;

      const grid = document.createElement('div');
      grid.className = 'chapas-grid';

      // Ordenar chapas numéricamente
      const chapasOrdenadas = chapas.sort((a, b) => {
        const numA = parseInt(a) || 0;
        const numB = parseInt(b) || 0;
        return numA - numB;
      });

      chapasOrdenadas.forEach(chapa => {
        const badge = document.createElement('div');
        badge.className = 'chapa-badge';
        badge.innerHTML = `
          <div class="chapa-numero">${chapa}</div>
          <div class="chapa-label">Chapa</div>
        `;
        grid.appendChild(badge);
      });

      puestoGroup.appendChild(header);
      puestoGroup.appendChild(grid);
      content.appendChild(puestoGroup);
    });

    // Mostrar resumen total con desglose por puesto
    const resumen = document.createElement('div');
    resumen.className = 'modal-resumen-container';

    // Título del resumen
    const resumenTitulo = document.createElement('div');
    resumenTitulo.className = 'modal-resumen-titulo';
    resumenTitulo.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span>Resumen del Parte</span>
    `;
    resumen.appendChild(resumenTitulo);

    // Grid de puestos con su cantidad
    const resumenGrid = document.createElement('div');
    resumenGrid.className = 'modal-resumen-grid';

    puestosOrdenados.forEach(puesto => {
      const cantidad = chapasPorPuesto[puesto].length;
      const card = document.createElement('div');
      card.className = 'modal-resumen-card';
      card.innerHTML = `
        <div class="modal-resumen-numero">${cantidad}</div>
        <div class="modal-resumen-puesto">${getEmojiPuesto(puesto)} ${puesto}</div>
      `;
      resumenGrid.appendChild(card);
    });

    resumen.appendChild(resumenGrid);

    // Total general
    const totalGeneral = document.createElement('div');
    totalGeneral.className = 'modal-resumen-total';
    totalGeneral.innerHTML = `
      <strong>Total:</strong> ${chapasDelParte.length} trabajador${chapasDelParte.length > 1 ? 'es' : ''}
    `;
    resumen.appendChild(totalGeneral);

    content.appendChild(resumen);

  } catch (error) {
    console.error('Error al cargar chapas del parte:', error);
    loading.classList.add('hidden');
    content.innerHTML = `
      <div class="modal-empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3>Error al cargar datos</h3>
        <p>No se pudieron cargar las chapas del parte. Por favor, intenta de nuevo.</p>
      </div>
    `;
  }
}

/**
 * Cierra el modal de chapas del parte
 */
function cerrarModalChapas() {
  const modal = document.getElementById('modal-chapas-parte');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Event listeners para el modal
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-chapas-parte');
  const closeBtn = document.getElementById('modal-chapas-close');

  // Cerrar con botón X
  if (closeBtn) {
    closeBtn.addEventListener('click', cerrarModalChapas);
  }

  // Cerrar al hacer click fuera del modal
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarModalChapas();
      }
    });
  }

  // Cerrar con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarModalChapas();
    }
  });
});

/**
 * Carga la página de jornales - Sistema de Quincenas
 * Agrupa jornales por períodos quincenales (1-15, 16-fin de mes)
 * ACTUALIZADO: Usa localStorage con limpieza automática el 31 de diciembre a las 00:00
 */
let isLoadingJornales = false; // Flag para evitar ejecuciones concurrentes

async function loadJornales() {
  // Evitar ejecuciones concurrentes
  if (isLoadingJornales) {
    console.log('⚠️ loadJornales ya se está ejecutando, saltando llamada duplicada');
    return;
  }

  isLoadingJornales = true;

  const statsContainer = document.getElementById('jornales-stats');
  const container = document.getElementById('jornales-content');
  const loading = document.getElementById('jornales-loading');

  if (!container) {
    isLoadingJornales = false;
    return;
  }

  loading.classList.remove('hidden');
  container.innerHTML = '';
  statsContainer.innerHTML = '';

  try {
    // Sincronizar jornales desde CSV antes de cargar (si aplica)
    // Esto lo hace tu Edge Function de sincronización programada,
    // pero si tienes un botón manual de sincronización o si necesitas
    // forzarlo desde el cliente para depuración, puedes llamarlo aquí.
    console.log('🔄 Sincronizando jornales (desde Supabase)...');
    try {
        await SheetsAPI.syncJornalesFromCSV(); 
    } catch (syncError) {
      console.warn('⚠️ Error en la sincronización de jornales, continuando con datos existentes:', syncError.message);
    }

    // CARGAR DESDE SUPABASE (todos los jornales agrupados por quincena)
    console.log('📥 Cargando todos los jornales desde Supabase...');
    const jornalesSupabase = await SheetsAPI.getJornalesHistoricoAcumulado(AppState.currentUser);

    let data = [];

    if (jornalesSupabase && jornalesSupabase.length > 0) {
      const manuales = jornalesSupabase.filter(j => j.origen === 'manual').length;
      const csvJornales = jornalesSupabase.filter(j => j.origen === 'csv').length;
      const otros = jornalesSupabase.length - manuales - csvJornales;

      console.log(`✅ ${jornalesSupabase.length} jornales cargados: ${csvJornales} del CSV + ${manuales} manuales + ${otros} otros`);
      data = jornalesSupabase;

    } else {
      // 3. FALLBACK: CARGAR DESDE LOCALSTORAGE (solo si Supabase falla o está vacío)
      console.warn('⚠️ No hay jornales en Supabase, usando localStorage como fallback');
      let historico = JSON.parse(localStorage.getItem('jornales_historico') || '[]');

      // LIMPIEZA AUTOMÁTICA: Eliminar jornales del año anterior
      const ahora = new Date();
      const añoActual = ahora.getFullYear();

      historico = historico.filter(jornal => {
        try {
          // Convertir fecha a formato ISO para comparar
          const fechaISO = (jornal.fecha.includes('/') ? jornal.fecha.split('/').reverse().join('-') : jornal.fecha);
          const añoJornal = new Date(fechaISO).getFullYear();
          return añoJornal === añoActual;
        } catch {
          return false; // Si la fecha está mal, la eliminamos
        }
      });

      localStorage.setItem('jornales_historico', JSON.stringify(historico));

      // Filtrar solo los jornales del usuario actual
      data = historico.filter(item => item.chapa === AppState.currentUser);
      console.log(`📂 Cargados ${data.length} jornales desde localStorage`);
    }

    loading.classList.add('hidden');

    if (data.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>No hay datos de jornales</h3>
          <p>No se encontraron registros de jornales para tu chapa.</p>
        </div>
      `;
      isLoadingJornales = false; // Resetear flag antes de return
      return;
    }

    // Agrupar por quincenas
    const quincenasMap = groupByQuincena(data);

    // Ordenar quincenas por fecha (más recientes primero)
    const quincenasOrdenadas = Array.from(quincenasMap.entries()).sort((a, b) => {
      const [yearA, monthA, quincenaA] = a[0].split('-').map(Number);
      const [yearB, monthB, quincenaB] = b[0].split('-').map(Number);
      if (yearB !== yearA) return yearB - yearA;
      if (monthB !== monthA) return monthB - monthA;
      return quincenaB - quincenaA;
    });

    // Calcular estadísticas totales
    const totalJornales = data.length;

    // Botón de exportar
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn-primary';
    exportBtn.style.marginBottom = '1rem';
    exportBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; margin-right: 8px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Exportar a PDF
    `;
    exportBtn.addEventListener('click', () => exportJornalesToPDF(data));
    container.appendChild(exportBtn);

    // Renderizar stats totales
    statsContainer.innerHTML = `
      <div class="stat-card blue">
        <div class="stat-label">Total Jornales</div>
        <div class="stat-value">${totalJornales}</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">Quincenas Registradas</div>
        <div class="stat-value">${quincenasOrdenadas.length}</div>
      </div>
    `;

    // Renderizar cada quincena
    quincenasOrdenadas.forEach(([key, jornales]) => {
      const [year, month, quincena] = key.split('-').map(Number);
      const quincenaCard = createQuincenaCard(year, month, quincena, jornales);
      container.appendChild(quincenaCard);
    });

  } catch (error) {
    loading.classList.add('hidden');
    statsContainer.innerHTML = '';
    container.innerHTML = `
      <div class="empty-state">
        <h3>Error al cargar datos</h3>
        <p>No se pudieron cargar los jornales. Por favor, intenta de nuevo más tarde.</p>
      </div>
    `;
  } finally {
    // Siempre resetear el flag, sin importar si hubo éxito o error
    isLoadingJornales = false;
  }
}

/**
 * Agrupa jornales por quincena
 */
function groupByQuincena(jornales) {
  const map = new Map();

  jornales.forEach(jornal => {
    let day, month, year;

    // Parsear fecha: soportar tanto dd/mm/yyyy como yyyy-mm-dd (ISO)
    if (jornal.fecha.includes('/')) {
      // Formato español: dd/mm/yyyy
      const parts = jornal.fecha.split('/');
      day = parseInt(parts[0]);
      month = parseInt(parts[1]);
      year = parseInt(parts[2]);
    } else if (jornal.fecha.includes('-')) {
      // Formato ISO: yyyy-mm-dd
      const parts = jornal.fecha.split('-');
      year = parseInt(parts[0]);
      month = parseInt(parts[1]);
      day = parseInt(parts[2]);
    } else {
      // Formato desconocido, intentar como objeto Date
      const date = new Date(jornal.fecha);
      if (!isNaN(date.getTime())) {
        year = date.getFullYear();
        month = date.getMonth() + 1;
        day = date.getDate();
      } else {
        console.error('Formato de fecha no válido en groupByQuincena:', jornal.fecha);
        return; // Saltar este jornal
      }
    }

    // Determinar quincena: 1 (días 1-15) o 2 (días 16-fin)
    const quincena = day <= 15 ? 1 : 2;

    // Crear clave única: year-month-quincena
    const key = `${year}-${month}-${quincena}`;

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(jornal);
  });

  return map;
}

/**
 * Crea una tarjeta de quincena con datos resumidos
 */
function createQuincenaCard(year, month, quincena, jornales) {
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const monthName = monthNames[month - 1];

  // Determinar rango de días
  const rangoInicio = quincena === 1 ? 1 : 16;
  const rangoFin = quincena === 1 ? 15 : new Date(year, month, 0).getDate();

  // Calcular estadísticas
  const totalJornales = jornales.length;

  // Desglose por empresa
  const porEmpresa = {};
  jornales.forEach(j => {
    const empresa = j.empresa || 'Sin especificar';
    porEmpresa[empresa] = (porEmpresa[empresa] || 0) + 1;
  });

  // Desglose por puesto
  const porPuesto = {};
  jornales.forEach(j => {
    const puesto = j.puesto || 'Sin especificar';
    porPuesto[puesto] = (porPuesto[puesto] || 0) + 1;
  });

  // Crear card
  const card = document.createElement('div');
  card.className = 'quincena-card';
  card.style.marginBottom = '0.75rem';
  card.style.border = '1px solid var(--border-color)';
  card.style.borderRadius = '8px';
  card.style.overflow = 'hidden';
  card.style.background = 'white';

  // Emoji de calendario según quincena
  const emojiCalendario = quincena === 1 ? '📅' : '🗓️';

  // Formato de mes en 3 letras mayúsculas
  const monthShort = monthName.substring(0, 3).toUpperCase();

  // Header simple - una sola línea con la información de la quincena
  const header = document.createElement('div');
  header.className = 'quincena-header';
  header.style.padding = '1rem 1.25rem';
  header.style.background = 'white';
  header.style.cursor = 'pointer';
  header.style.userSelect = 'none';
  header.style.transition = 'all 0.2s ease';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.gap = '0.75rem';
  header.style.borderBottom = '1px solid var(--border-color)';

  header.innerHTML = `
    <span style="font-size: 1.3rem;">${emojiCalendario}</span>
    <span style="font-size: 1rem; font-weight: 600; color: #000;">${rangoInicio}-${rangoFin} ${monthShort}</span>
    <span style="font-size: 0.85rem; color: #666; margin-left: 0.5rem;">${totalJornales} jornales</span>
    <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; margin-left: auto; transition: transform 0.3s; flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="#666" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  `;

  // Efectos hover para hacer más obvio que es clickeable
  header.addEventListener('mouseenter', () => {
    header.style.background = 'var(--bg-secondary)';
  });
  header.addEventListener('mouseleave', () => {
    header.style.background = 'white';
  });

  // Body (inicialmente oculto)
  const body = document.createElement('div');
  body.className = 'quincena-body';
  body.style.display = 'none';
  body.style.padding = '1.25rem';

  // Resumen por empresa
  const empresasHTML = Object.entries(porEmpresa)
    .sort((a, b) => b[1] - a[1])
    .map(([empresa, count]) => `
      <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: var(--bg-secondary); border-radius: 6px; margin-bottom: 0.5rem;">
        <span>${empresa}</span>
        <span style="font-weight: bold; color: var(--puerto-blue);">${count} jornales</span>
      </div>
    `).join('');

  // Resumen por puesto
  const puestosHTML = Object.entries(porPuesto)
    .sort((a, b) => b[1] - a[1])
    .map(([puesto, count]) => `
      <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: var(--bg-secondary); border-radius: 6px; margin-bottom: 0.5rem;">
        <span>${puesto}</span>
        <span style="font-weight: bold; color: var(--puerto-green);">${count} jornales</span>
      </div>
    `).join('');

  body.innerHTML = `
    <div style="display: grid; gap: 1.5rem; margin-bottom: 1.5rem;">
      <div>
        <h4 style="margin-bottom: 0.75rem; color: var(--puerto-blue);">📊 Por Empresa</h4>
        ${empresasHTML}
      </div>
      <div>
        <h4 style="margin-bottom: 0.75rem; color: var(--puerto-green);">👷 Por Puesto</h4>
        ${puestosHTML}
      </div>
    </div>

    <div>
      <h4 style="margin-bottom: 0.75rem; color: var(--puerto-dark-blue);">📋 Detalle de Jornales</h4>
      <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <svg xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        Desliza horizontalmente para ver todos los datos
      </div>
      <div class="data-table" style="overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 0 -1.25rem; padding: 0 1.25rem;">
        <table style="min-width: 600px;">
          <thead>
            <tr>
              <th style="white-space: nowrap;">Fecha</th>
              <th style="white-space: nowrap;">Puesto</th>
              <th style="white-space: nowrap;">Jornada</th>
              <th style="white-space: nowrap;">Empresa</th>
              <th style="white-space: nowrap;">Buque</th>
              <th style="white-space: nowrap;">Parte</th>
            </tr>
          </thead>
          <tbody>
            ${jornales.map(row => `
              <tr>
                <td style="white-space: nowrap;"><strong>${formatearFecha(row.fecha)}</strong></td>
                <td style="white-space: nowrap;">
                  ${row.puesto}
                  ${row.manual ? '<span class="badge-manual" title="Añadido manualmente">Manual</span>' : ''}
                </td>
                <td style="white-space: nowrap;">${row.jornada}</td>
                <td style="white-space: nowrap;">${row.empresa}</td>
                <td style="white-space: nowrap;">${row.buque}</td>
                <td style="white-space: nowrap;">${row.parte}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Click handler para toggle expand/collapse
  header.addEventListener('click', () => {
    const isExpanded = body.style.display !== 'none';
    body.style.display = isExpanded ? 'none' : 'block';
    const icon = header.querySelector('.expand-icon');
    icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
  });

  card.appendChild(header);
  card.appendChild(body);

  return card;
}

/**
 * Limpia jornales antiguos - mantiene solo últimos 12 meses
 */
function cleanupOldJornales(historico) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 12);

  const cleaned = historico.filter(jornal => {
    // Convertir fecha a formato ISO para comparar
    const fechaISO = (jornal.fecha.includes('/') ? jornal.fecha.split('/').reverse().join('-') : jornal.fecha);
    const jornalDate = new Date(fechaISO);
    return jornalDate >= cutoffDate;
  });

  if (cleaned.length !== historico.length) {
    localStorage.setItem('jornales_historico', JSON.stringify(cleaned));
    console.log(`Limpieza de jornales: ${historico.length - cleaned.length} registros eliminados`);
  }
}

/**
 * Exporta jornales a PDF organizados por quincena
 */
function exportJornalesToPDF(data) {
  // Acceder a jsPDF desde el objeto global window
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Agrupar jornales por quincena
  const quincenasMap = groupByQuincena(data);

  // Ordenar quincenas (más recientes primero)
  const quincenasOrdenadas = Array.from(quincenasMap.entries()).sort((a, b) => {
    const [yearA, monthA, quincenaA] = a[0].split('-').map(Number);
    const [yearB, monthB, quincenaB] = b[0].split('-').map(Number);
    if (yearB !== yearA) return yearB - yearA;
    if (monthB !== monthA) return monthB - monthA;
    return quincenaB - quincenaA;
  });

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  let isFirstPage = true;

  // Generar una sección por cada quincena
  quincenasOrdenadas.forEach(([key, jornales]) => {
    const [year, month, quincena] = key.split('-').map(Number);
    const monthName = monthNames[month - 1];
    const rangoInicio = quincena === 1 ? 1 : 16;
    const rangoFin = quincena === 1 ? 15 : new Date(year, month, 0).getDate();

    // Agregar nueva página si no es la primera
    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    // Título de la quincena
    doc.setFontSize(16);
    doc.setTextColor(10, 46, 92); // Color azul del puerto
    doc.text(`${monthName} ${year} - Quincena ${quincena}`, 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Días ${rangoInicio} al ${rangoFin}`, 14, 22);

    // Estadísticas de la quincena
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de jornales: ${jornales.length}`, 14, 28);

    // Ordenar jornales por fecha
    const jornalesOrdenados = jornales.sort((a, b) => {
      const dateA = new Date((a.fecha.includes('/') ? a.fecha.split('/').reverse().join('-') : a.fecha));
      const dateB = new Date((b.fecha.includes('/') ? b.fecha.split('/').reverse().join('-') : b.fecha));
      return dateA - dateB;
    });

    // Preparar datos para la tabla
    const tableData = jornalesOrdenados.map(j => [
      formatearFecha(j.fecha),
      j.puesto,
      j.jornada,
      j.empresa,
      j.buque || '-',
      j.parte || '-'
    ]);

    // Crear tabla con autoTable
    doc.autoTable({
      startY: 32,
      head: [['Fecha', 'Puesto', 'Jornada', 'Empresa', 'Buque', 'Parte']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [10, 46, 92], // Color azul del puerto
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50]
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { top: 32, left: 14, right: 14 },
      styles: {
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      }
    });
  });

  // Agregar información del trabajador en el pie de página de cada página
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Chapa ${AppState.currentUser} - Página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-ES')}`,
      doc.internal.pageSize.width - 14,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }

  // Descargar PDF
  doc.save(`jornales_chapa_${AppState.currentUser}_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Carga la página de puertas
 * Muestra la fecha actual del sistema en el título
 */
async function loadPuertas() {
  const container = document.getElementById('puertas-content');
  const loading = document.getElementById('puertas-loading');
  const tituloElement = document.getElementById('puertas-titulo');
  const fechaElement = document.getElementById('puertas-fecha');

  if (!container) return;

  loading.classList.remove('hidden');
  container.innerHTML = '';

  try {
    const result = await SheetsAPI.getPuertas(); // SheetsAPI (en supabase.js)
    const fecha = result.fecha || new Date().toLocaleDateString('es-ES');
    const data = result.puertas || [];

    loading.classList.add('hidden');

    // Actualizar título con la fecha del CSV
    if (tituloElement) {
      tituloElement.textContent = `Puertas del Día`;
    }
    if (fechaElement) {
      fechaElement.textContent = `Información para el ${fecha}`;
    }

    // Separar puertas laborables y festivas
    const puertasLaborables = data.filter(item =>
      item.jornada && !item.jornada.toLowerCase().includes('festivo')
    );
    const puertasFestivas = data.filter(item =>
      item.jornada && item.jornada.toLowerCase().includes('festivo')
    );

    // Crear tabla de puertas laborables
    if (puertasLaborables.length > 0) {
      const laborablesTitle = document.createElement('h3');
      laborablesTitle.style.marginBottom = '1rem';
      laborablesTitle.style.color = 'var(--puerto-blue)';
      laborablesTitle.style.fontSize = '1.25rem';
      laborablesTitle.textContent = '📋 Puertas Laborables';
      container.appendChild(laborablesTitle);

      const tableWrapper = document.createElement('div');
      tableWrapper.className = 'data-table';
      tableWrapper.style.marginBottom = '2rem';

      const table = document.createElement('table');
      table.style.width = '100%';

      // Header de la tabla con 3 columnas
      table.innerHTML = `
        <thead>
          <tr>
            <th style="text-align: left; padding: 1rem; background: var(--puerto-blue); color: white;">Jornada</th>
            <th style="text-align: center; padding: 1rem; background: var(--puerto-blue); color: white;">Puerta SP</th>
            <th style="text-align: center; padding: 1rem; background: var(--puerto-blue); color: white;">Puerta OC</th>
          </tr>
        </thead>
        <tbody>
          ${puertasLaborables.map(item => {
            const puertaSP = item.puertaSP || '';
            const puertaOC = item.puertaOC || '';
            const isEmptySP = !puertaSP || puertaSP.trim() === '';
            const isEmptyOC = !puertaOC || puertaOC.trim() === '';
            return `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 1rem; font-weight: 600; color: var(--puerto-dark-blue);">${item.jornada}</td>
                <td style="padding: 1rem; text-align: center;">
                  ${isEmptySP
                    ? '<span style="color: var(--puerto-red); font-weight: 600;">— No contratada</span>'
                    : `<span style="background: linear-gradient(135deg, var(--puerto-green), #059669); color: white; padding: 0.5rem 1.5rem; border-radius: 8px; font-weight: bold; font-size: 1.1rem; display: inline-block; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);">${puertaSP}</span>`
                  }
                </td>
                <td style="padding: 1rem; text-align: center;">
                  ${isEmptyOC
                    ? '<span style="color: var(--puerto-red); font-weight: 600;">— No contratada</span>'
                    : `<span style="background: linear-gradient(135deg, var(--puerto-blue), #1e40af); color: white; padding: 0.5rem 1.5rem; border-radius: 8px; font-weight: bold; font-size: 1.1rem; display: inline-block; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">${puertaOC}</span>`
                  }
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      `;

      tableWrapper.appendChild(table);
      container.appendChild(tableWrapper);
    }

    // Crear tabla de puertas festivas
    if (puertasFestivas.length > 0) {
      const festivasTitle = document.createElement('h3');
      festivasTitle.style.marginBottom = '1rem';
      festivasTitle.style.color = 'var(--puerto-orange)';
      festivasTitle.style.fontSize = '1.25rem';
      festivasTitle.textContent = '🎉 Puertas Festivas';
      container.appendChild(festivasTitle);

      const tableWrapper = document.createElement('div');
      tableWrapper.className = 'data-table';

      const table = document.createElement('table');
      table.style.width = '100%';

      // Header de la tabla con 3 columnas
      table.innerHTML = `
        <thead>
          <tr>
            <th style="text-align: left; padding: 1rem; background: var(--puerto-orange); color: white;">Jornada</th>
            <th style="text-align: center; padding: 1rem; background: var(--puerto-orange); color: white;">Puerta SP</th>
            <th style="text-align: center; padding: 1rem; background: var(--puerto-orange); color: white;">Puerta OC</th>
          </tr>
        </thead>
        <tbody>
          ${puertasFestivas.map(item => {
            const puertaSP = item.puertaSP || '';
            const puertaOC = item.puertaOC || '';
            const isEmptySP = !puertaSP || puertaSP.trim() === '';
            const isEmptyOC = !puertaOC || puertaOC.trim() === '';
            return `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 1rem; font-weight: 600; color: var(--puerto-dark-blue);">${item.jornada}</td>
                <td style="padding: 1rem; text-align: center;">
                  ${isEmptySP
                    ? '<span style="color: var(--puerto-red); font-weight: 600;">— No contratada</span>'
                    : `<span style="background: linear-gradient(135deg, var(--puerto-orange), #ea580c); color: white; padding: 0.5rem 1.5rem; border-radius: 8px; font-weight: bold; font-size: 1.1rem; display: inline-block; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);">${puertaSP}</span>`
                  }
                </td>
                <td style="padding: 1rem; text-align: center;">
                  ${isEmptyOC
                    ? '<span style="color: var(--puerto-red); font-weight: 600;">— No contratada</span>'
                    : `<span style="background: linear-gradient(135deg, var(--puerto-blue), #1e40af); color: white; padding: 0.5rem 1.5rem; border-radius: 8px; font-weight: bold; font-size: 1.1rem; display: inline-block; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">${puertaOC}</span>`
                  }
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      `;

      tableWrapper.appendChild(table);
      container.appendChild(tableWrapper);
    }

  } catch (error) {
    loading.classList.add('hidden');
    container.innerHTML = `
      <div class="empty-state">
        <h3>Error al cargar datos</h3>
        <p>No se pudieron cargar las puertas. Por favor, intenta de nuevo más tarde.</p>
      </div>
    `;
  }
}

/**
 * Carga la página de censo
 */
async function loadCenso() {
  const container = document.getElementById('censo-content');
  const loading = document.getElementById('censo-loading');

  if (!container) return;

  loading.classList.remove('hidden');
  container.innerHTML = '';

  try {
    // 1. SINCRONIZAR CENSO DESDE CSV AUTOMÁTICAMENTE (si aplica)
    console.log('🔄 Verificando sincronización de censo (desde Supabase)...');
    try {
      await SheetsAPI.syncCensoFromCSV(); // Esto usa la Edge Function de sincronización de censo
    } catch (syncError) {
      console.warn('⚠️ Error en la sincronización de censo, continuando con datos existentes:', syncError.message);
    }

    // 2. CARGAR DESDE SUPABASE
    const data = await SheetsAPI.getCenso(); // SheetsAPI (en supabase.js)

    loading.classList.add('hidden');

    // Calcular estadísticas por color
    const colorStats = {
      green: 0,
      blue: 0,
      yellow: 0,
      orange: 0,
      red: 0
    };

    data.forEach(item => {
      if (colorStats.hasOwnProperty(item.color)) {
        colorStats[item.color]++;
      }
    });

    const total = data.length;

    // Crear contenedor de estadísticas
    const statsContainer = document.createElement('div');
    statsContainer.style.display = 'grid';
    statsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(100px, 1fr))';
    statsContainer.style.gap = '1rem';
    statsContainer.style.marginBottom = '2rem';
    statsContainer.style.maxWidth = '600px';
    statsContainer.style.margin = '0 auto 2rem auto';

    // Colores y nombres
    const colorInfo = [
      { key: 'green', name: 'Verde', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
      { key: 'blue', name: 'Azul', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
      { key: 'yellow', name: 'Amarillo', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
      { key: 'orange', name: 'Naranja', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
      { key: 'red', name: 'Rojo', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' }
    ];

    colorInfo.forEach(color => {
      const count = colorStats[color.key];
      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;

      const statCard = document.createElement('div');
      statCard.style.background = 'white';
      statCard.style.border = '1px solid var(--border-color)';
      statCard.style.borderRadius = '8px';
      statCard.style.padding = '1rem';
      statCard.style.textAlign = 'center';
      statCard.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';

      statCard.innerHTML = `
        <div style="width: 60px; height: 60px; background: ${color.gradient}; border-radius: 8px; margin: 0 auto 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
        <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-primary); margin-bottom: 0.25rem;">${count}</div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem;">${color.name}</div>
        <div style="font-size: 0.75rem; font-weight: 600; color: var(--puerto-blue);">${percentage}%</div>
      `;

      statsContainer.appendChild(statCard);
    });

    container.appendChild(statsContainer);

    // Crear wrapper para el grid de chapas
    const chapasWrapper = document.createElement('div');
    chapasWrapper.className = 'censo-grid';
    chapasWrapper.style.marginTop = '2rem';

    // Crear grid de chapas dentro del wrapper
    data.forEach(item => {
      const div = document.createElement('div');
      div.className = `censo-item ${item.color}`;
      div.textContent = item.chapa;
      div.title = `Chapa ${item.chapa}`;
      chapasWrapper.appendChild(div);
    });

    container.appendChild(chapasWrapper);

  } catch (error) {
    loading.classList.add('hidden');
    container.innerHTML = `
      <div class="empty-state">
        <h3>Error al cargar datos</h3>
        <p>No se pudo cargar el censo. Por favor, intenta de nuevo más tarde.</p>
      </div>
    `;
  }
}
/**
 * Renderiza los enlaces
 */
function renderEnlaces() {
  const container = document.getElementById('enlaces-content');
  if (!container) return;

  const categorias = [...new Set(ENLACES_DATA.map(e => e.categoria))];

  categorias.forEach(categoria => {
    const section = document.createElement('div');
    section.className = 'enlaces-section';

    const title = document.createElement('h3');
    title.textContent = categoria;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'enlaces-grid';

    const enlaces = ENLACES_DATA.filter(e => e.categoria === categoria);
    enlaces.forEach(enlace => {
      const a = document.createElement('a');
      a.href = enlace.url;
      a.className = `enlace-btn ${enlace.color}`;
      a.textContent = enlace.titulo;

      // Si tiene modal, abrir modal en lugar de link externo
      if (enlace.modal) {
        a.href = '#';
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const modal = document.getElementById(`${enlace.modal}-modal`);
          if (modal) {
            modal.style.display = 'flex';
          }
        });
      } else {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }

      grid.appendChild(a);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

/**
 * Renderiza las noticias
 */
function renderNoticias() {
  const container = document.getElementById('noticias-content');
  if (!container) return;

  NOTICIAS_DATA.forEach(noticia => {
    const card = document.createElement('div');
    card.className = 'noticia-card';
    card.innerHTML = `
      <div class="noticia-header">
        <div class="noticia-titulo">${noticia.titulo || noticia.titular}</div>
        <div class="noticia-fecha">${noticia.fecha}</div>
      </div>
      <div class="noticia-contenido">${noticia.contenido}</div>
    `;
    container.appendChild(card);
  });
}

/**
 * Carga el foro - Intenta cargar desde Google Sheets primero
 */
async function loadForo() {
  const container = document.getElementById('foro-messages');
  if (!container) return;

  // Mostrar loading
  container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">Cargando mensajes...</div>';

  try {
    // Actualizar nombres de usuarios en cache
    await actualizarCacheNombres();

    // 1. PRIORIDAD: Cargar desde Supabase
    console.log('📥 Cargando mensajes del foro desde Supabase...');
    const supabaseMessages = await SheetsAPI.getForoMensajes(); // SheetsAPI (en supabase.js)

    if (supabaseMessages && supabaseMessages.length > 0) {
      console.log(`✅ ${supabaseMessages.length} mensajes cargados desde Supabase`);
      renderForoMessages(supabaseMessages);
      // Actualizar localStorage como backup
      localStorage.setItem('foro_messages', JSON.stringify(supabaseMessages));
    } else {
      // 2. FALLBACK: usar localStorage si Supabase está vacío
      console.log('⚠️ No hay mensajes en Supabase, usando localStorage');
      const localMessages = getForoMessagesLocal();
      renderForoMessages(localMessages);
    }
  } catch (error) {
    console.error('❌ Error cargando foro desde Supabase:', error);
    // FALLBACK: localStorage
    const localMessages = getForoMessagesLocal();
    renderForoMessages(localMessages);
  }
}

/**
 * Actualiza el cache de nombres de usuarios desde el sheet
 */
async function actualizarCacheNombres() {
  try {
    const usuarios = await SheetsAPI.getUsuarios(); // SheetsAPI (en supabase.js)
    const usuariosCache = {};

    usuarios.forEach(u => {
      if (u.chapa && u.nombre) {
        usuariosCache[u.chapa] = u.nombre;
      }
    });

    localStorage.setItem('usuarios_cache', JSON.stringify(usuariosCache));
    console.log('✅ Cache de nombres actualizado');
  } catch (error) {
    console.error('Error actualizando cache de nombres:', error);
  }
}

/**
 * Obtiene mensajes del foro desde localStorage
 */
function getForoMessagesLocal() {
  const stored = localStorage.getItem('foro_messages');
  if (stored) {
    return JSON.parse(stored);
  }

  // Sin mensajes iniciales - foro vacío
  const initialMessages = [];

  localStorage.setItem('foro_messages', JSON.stringify(initialMessages));
  return initialMessages;
}

/**
 * Renderiza mensajes del foro
 */
function renderForoMessages(messages) {
  const container = document.getElementById('foro-messages');
  if (!container) return;

  container.innerHTML = '';

  // Ordenar por timestamp (más ANTIGUOS primero, recientes ABAJO como WhatsApp)
  const sorted = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Obtener nombres de usuarios del cache
  const usuariosCache = JSON.parse(localStorage.getItem('usuarios_cache') || '{}');

  sorted.forEach(msg => {
    // Normalizar chapa (quitar "0" inicial si es de 5 dígitos: 80983 → 983)
    let chapaOriginal = msg.chapa.toString();
    let chapaNormalizada = chapaOriginal;

    // Si la chapa empieza con "0" o "80" y tiene más de 3 dígitos, normalizarla
    if (chapaOriginal.length >= 4 && chapaOriginal.startsWith('80')) {
      // 80983 → 983, 80784 → 784, etc.
      chapaNormalizada = chapaOriginal.substring(2);
    } else if (chapaOriginal.length >= 4 && chapaOriginal.startsWith('0')) {
      // 0983 → 983, 0784 → 784, etc.
      chapaNormalizada = chapaOriginal.substring(1);
    }

    const isOwn = chapaNormalizada === AppState.currentUser;
    const timeAgo = getTimeAgo(new Date(msg.timestamp));

    // Obtener nombre del usuario (del cache usando chapa normalizada o fallback a chapa normalizada)
    const nombreUsuario = usuariosCache[chapaNormalizada] || `Chapa ${chapaNormalizada}`;

    const messageDiv = document.createElement('div');
    messageDiv.className = `foro-message ${isOwn ? 'own' : ''}`;
    messageDiv.innerHTML = `
      <div class="foro-message-content">
        <div class="foro-message-header">
          <span class="foro-message-chapa">${nombreUsuario}</span>
          <span class="foro-message-time">${timeAgo}</span>
        </div>
        <div class="foro-message-text" style="white-space: pre-wrap;">${escapeHtml(msg.texto)}</div>
      </div>
    `;

    container.appendChild(messageDiv);
  });

  // Scroll automático al final para ver mensajes recientes (como WhatsApp)
  // Usar requestAnimationFrame para asegurar que el DOM esté renderizado
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Hacer scroll al último mensaje para asegurar que se vea completamente
      const lastMessage = container.lastElementChild;
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'auto', block: 'end' });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    });
  });
}

/**
 * Envía un mensaje al foro - Intenta enviar a Google Sheets si está configurado
 */
async function sendForoMessage() {
  const input = document.getElementById('foro-input');
  const sendBtn = document.getElementById('foro-send');

  if (!input || !sendBtn) return;

  const texto = input.value.trim();
  if (!texto) return;

  // Prevenir múltiples envíos
  if (sendBtn.disabled) return;

  // Deshabilitar controles y mostrar feedback visual
  input.disabled = true;
  sendBtn.disabled = true;

  // Guardar el contenido original del botón
  const originalBtnHTML = sendBtn.innerHTML;

  // Mostrar indicador de carga
  sendBtn.innerHTML = `
    <svg style="width: 20px; height: 20px; animation: spin 1s linear infinite;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span style="margin-left: 8px;">Enviando...</span>
  `;

  const newMessage = {
    id: Date.now(),
    chapa: AppState.currentUser,
    timestamp: new Date().toISOString(),
    texto: texto
  };

  // Añadir mensaje inmediatamente a la vista (optimistic update)
  const messages = getForoMessagesLocal();
  messages.push(newMessage);
  localStorage.setItem('foro_messages', JSON.stringify(messages));
  renderForoMessages(messages);

  // Limpiar input inmediatamente
  input.value = '';

  // Scroll al final
  const container = document.getElementById('foro-messages');
  if (container) {
    const lastMessage = container.lastElementChild;
    if (lastMessage) {
      lastMessage.scrollIntoView({ behavior: 'auto', block: 'end' });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }

  // Enviar a Supabase en segundo plano (asumiendo SheetsAPI.enviarMensajeForo ahora usa Supabase)
  try {
    const sentToCloud = await SheetsAPI.enviarMensajeForo(AppState.currentUser, texto); 

    if (sentToCloud) {
      console.log('✅ Mensaje guardado en Supabase');

      // Mostrar feedback visual breve de éxito
      sendBtn.innerHTML = `
        <svg style="width: 20px; height: 20px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span style="margin-left: 8px;">Enviado</span>
      `;

      setTimeout(() => {
        sendBtn.innerHTML = originalBtnHTML;
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
      }, 800);
    } else {
      console.log('⚠️ No se pudo enviar al servidor, guardado localmente');
      // Restaurar botón
      sendBtn.innerHTML = originalBtnHTML;
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  } catch (error) {
    console.error('❌ Error enviando mensaje al servidor:', error);
    // El mensaje ya está visible localmente, solo restauramos el botón
    sendBtn.innerHTML = originalBtnHTML;
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

/**
 * Scroll suave hacia el final del foro
 */
function scrollToBottomForo() {
  const container = document.getElementById('foro-messages');
  if (container) {
    // Hacer scroll al último mensaje para asegurar que se vea completamente
    const lastMessage = container.lastElementChild;
    if (lastMessage) {
      lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }
}

/**
 * Inicializa la detección de scroll en el foro
 */
function initForoScrollDetection() {
  const container = document.getElementById('foro-messages');
  const scrollBtn = document.getElementById('scroll-to-bottom-btn');

  if (!container || !scrollBtn) return;

  // Función para verificar la posición del scroll
  const checkScrollPosition = () => {
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom) {
      scrollBtn.style.display = 'none';
    } else {
      scrollBtn.style.display = 'flex';
    }
  };

  // Agregar event listener al scroll del container
  container.addEventListener('scroll', checkScrollPosition);

  // Verificar posición inicial
  checkScrollPosition();
}

// Agregar estilo de animación spin si no existe
if (!document.getElementById('spin-animation-style')) {
  const style = document.createElement('style');
  style.id = 'spin-animation-style';
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Calcula el tiempo transcurrido
 */
function getTimeAgo(date) {
  // Validar que date es una fecha válida
  if (!date || isNaN(date.getTime())) {
    return 'Fecha desconocida';
  }

  const seconds = Math.floor((new Date() - date) / 1000);

  // Si la fecha es futura o muy antigua, mostrar fecha formateada
  if (seconds < 0 || seconds > 31536000) { // Más de 1 año
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (seconds < 60) return 'Ahora mismo';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
  if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;

  return date.toLocaleDateString('es-ES');
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Exponer funciones globalmente si es necesario
window.AppState = AppState;
window.navigateTo = navigateTo;

/**
 * Función de utilidad para agregar contrataciones manualmente al histórico
 * Uso desde consola del navegador:
 *
 * agregarContratacionesManual([
 *   { chapa: '123', fecha: '2025-11-03', jornada: '14-20', puesto: 'Grúa', empresa: 'APM', buque: 'Buque 1', parte: '1', logo_empresa_url: '' },
 *   { chapa: '456', fecha: '2025-11-03', jornada: '14-20', puesto: 'Capataz', empresa: 'MSC', buque: 'Buque 2', parte: '2', logo_empresa_url: '' }
 * ])
 */
window.agregarContratacionesManual = function(contrataciones) {
  if (!Array.isArray(contrataciones)) {
    console.error('❌ Debes pasar un array de contrataciones');
    console.log('Ejemplo de uso:');
    console.log('agregarContratacionesManual([');
    console.log('  { chapa: "123", fecha: "2025-11-03", jornada: "14-20", puesto: "Grúa", empresa: "APM", buque: "Buque 1", parte: "1", logo_empresa_url: "" }');
    console.log('])');
    return;
  }

  const historico = JSON.parse(localStorage.getItem('jornales_historico') || '[]');
  let agregadas = 0;

  contrataciones.forEach(contratacion => {
    // Verificar que tenga los campos requeridos
    if (!contratacion.chapa || !contratacion.fecha || !contratacion.jornada) {
      console.warn('⚠️ Contratación incompleta (falta chapa, fecha o jornada):', contratacion);
      return;
    }

    // Verificar si ya existe (evitar duplicados)
    const existe = historico.some(h =>
      h.fecha === contratacion.fecha &&
      h.jornada === contratacion.jornada &&
      h.puesto === contratacion.puesto &&
      h.chapa === contratacion.chapa
    );

    if (!existe) {
      historico.push({
        chapa: contratacion.chapa,
        fecha: contratacion.fecha,
        jornada: contratacion.jornada,
        puesto: contratacion.puesto || '',
        empresa: contratacion.empresa || '',
        buque: contratacion.buque || '',
        parte: contratacion.parte || '',
        logo_empresa_url: contratacion.logo_empresa_url || ''
      });
      agregadas++;
    } else {
      console.log(`⏭️ Contratación duplicada ignorada: ${contratacion.chapa} - ${contratacion.fecha} - ${contratacion.jornada}`);
    }
  });

  localStorage.setItem('jornales_historico', JSON.stringify(historico));
  console.log(`✅ Agregadas ${agregadas} contrataciones nuevas`);
  console.log(`📊 Total en histórico: ${historico.length} jornales`);

  return { agregadas, total: historico.length };
};

/**
 * ===== SUELDÓMETRO =====
 */

/**
 * Determina el tipo de día basado en fecha y jornada
 * Maneja jornadas nocturnas que cruzan medianoche (02-08, 20-02)
 */
function determinarTipoDia(fecha, jornada) {
  // Parsear fecha: soportar tanto dd/mm/yyyy como yyyy-mm-dd (ISO)
  let day, month, year;

  if (fecha.includes('/')) {
    // Formato español: dd/mm/yyyy
    const parts = fecha.split('/');
    day = parseInt(parts[0]);
    month = parseInt(parts[1]) - 1; // JavaScript months are 0-indexed
    year = parseInt(parts[2]);
  } else if (fecha.includes('-')) {
    // Formato ISO: yyyy-mm-dd
    const parts = fecha.split('-');
    year = parseInt(parts[0]);
    month = parseInt(parts[1]) - 1; // JavaScript months are 0-indexed
    day = parseInt(parts[2]);
  } else {
    // Formato desconocido, intentar como objeto Date
    const date = new Date(fecha);
    if (!isNaN(date.getTime())) {
      year = date.getFullYear();
      month = date.getMonth();
      day = date.getDate();
    } else {
      console.error('Formato de fecha no válido en determinarTipoDia:', fecha);
      return 'LABORABLE'; // Default fallback
    }
  }

  const dateObj = new Date(year, month, day);

  // Festivos de España 2025 (ajustar según sea necesario)
  const festivos2025 = [
    '01/01/2025', '06/01/2025', // Año Nuevo, Reyes
    '18/04/2025', '19/04/2025', // Viernes Santo, Sábado Santo
    '01/05/2025', // Día del Trabajador
    '15/08/2025', // Asunción
    '12/10/2025', // Día de la Hispanidad
    '01/11/2025', // Todos los Santos
    '06/12/2025', '08/12/2025', // Constitución, Inmaculada
    '25/12/2025'  // Navidad
  ];

  const esFestivoFecha = (d) => {
    const fechaNorm = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    return festivos2025.includes(fechaNorm) || d.getDay() === 0; // Festivo oficial o domingo
  };

  const dayOfWeek = dateObj.getDay(); // 0=Domingo, 6=Sábado
  const esFestivoHoy = esFestivoFecha(dateObj);

  // Para jornadas nocturnas (02-08, 20-02) que cruzan medianoche
  if (jornada === '02-08' || jornada === '20-02') {
    const diaSiguiente = new Date(dateObj);
    diaSiguiente.setDate(diaSiguiente.getDate() + 1);
    const esFestivoManana = esFestivoFecha(diaSiguiente);

    // Para 02-08 también necesitamos revisar el día anterior
    const diaAnterior = new Date(dateObj);
    diaAnterior.setDate(diaAnterior.getDate() - 1);
    const esFestivoAyer = esFestivoFecha(diaAnterior);

    if (jornada === '02-08') {
      // Jornada 02-08: empieza de noche (02:00) y termina por la mañana (08:00)
      // IMPORTANTE: Sábado siempre se considera LABORABLE en jornada 02-08
      if (dayOfWeek === 6) {
        return 'LABORABLE';
      } else if (esFestivoAyer && esFestivoHoy) {
        // NUEVO: Si ayer fue festivo Y hoy también es festivo → FEST-FEST
        // Ejemplo: día 1 noviembre (festivo Todos los Santos) → día 2 noviembre (domingo/festivo)
        return 'FEST-FEST';
      } else if (esFestivoHoy && !esFestivoManana) {
        return 'FEST-LAB';
      } else if (esFestivoManana) {
        return 'FESTIVO';
      } else if (esFestivoAyer && !esFestivoHoy) {
        // Si ayer fue festivo y hoy no → FEST-LAB (ej: domingo festivo → lunes 02-08)
        return 'FEST-LAB';
      } else {
        return 'LABORABLE';
      }
    } else if (jornada === '20-02') {
      // Jornada 20-02: empieza de tarde y termina de madrugada
      // IMPORTANTE: Sábado tiene prioridad sobre LAB-FEST (sábado a domingo)
      if (dayOfWeek === 6) {
        return 'SABADO';
      } else if (!esFestivoHoy && esFestivoManana) {
        return 'LAB-FEST';
      } else if (esFestivoHoy) {
        return 'FESTIVO';
      } else {
        return 'LABORABLE';
      }
    }
  }

  // Para jornadas diurnas (08-14, 14-20)
  if (esFestivoHoy) {
    return 'FESTIVO';
  } else if (dayOfWeek === 6) {
    return 'SABADO';
  } else {
    return 'LABORABLE';
  }
}

/**
 * Carga y muestra el Sueldómetro con cálculo de salarios
 */
async function loadSueldometro() {
  console.log('🚀 DEBUG: loadSueldometro() ejecutándose - timestamp:', new Date().toISOString());
  const content = document.getElementById('sueldometro-content');
  const loading = document.getElementById('sueldometro-loading');
  const stats = document.getElementById('sueldometro-stats');

  if (!content) return;

  loading.classList.remove('hidden');
  console.log('🧹 DEBUG: Limpiando contenido anterior');
  content.innerHTML = '';
  stats.innerHTML = '';

  // Inicializar IRPF control
  const irpfControl = document.getElementById('sueldometro-irpf-control');
  const irpfInput = document.getElementById('irpf-input');
  const irpfLockBtn = document.getElementById('irpf-lock-btn');

  // Cargar IRPF guardado o usar valor por defecto (15%)
  const irpfKey = `irpf_${AppState.currentUser}`;
  const irpfLockKey = `irpf_locked_${AppState.currentUser}`;

  // Intentar cargar desde Supabase primero
  let irpfPorcentaje = 15; // Valor por defecto
  try {
    const configUsuario = await SheetsAPI.getUserConfig(AppState.currentUser);
    if (configUsuario && configUsuario.irpf) {
      irpfPorcentaje = configUsuario.irpf;
      console.log(`✅ IRPF cargado desde Supabase: ${irpfPorcentaje}%`);
      // Sincronizar con localStorage
      localStorage.setItem(irpfKey, irpfPorcentaje.toString());
    } else {
      // Si no hay en Supabase, intentar localStorage
      irpfPorcentaje = parseFloat(localStorage.getItem(irpfKey)) || 15;
      console.log(`📦 IRPF cargado desde localStorage: ${irpfPorcentaje}%`);
    }
  } catch (error) {
    console.error('❌ Error cargando IRPF desde Supabase, usando localStorage:', error);
    irpfPorcentaje = parseFloat(localStorage.getItem(irpfKey)) || 15;
  }

  let irpfLocked = localStorage.getItem(irpfLockKey) === 'true';

  console.log(`💰 IRPF cargado: ${irpfPorcentaje}% (bloqueado: ${irpfLocked})`);

  if (irpfInput) {
    irpfInput.value = irpfPorcentaje;
    irpfInput.disabled = irpfLocked;
    if (irpfLocked) {
      irpfInput.style.opacity = '0.7';
      irpfInput.style.background = '#f0f0f0';
      irpfInput.style.cursor = 'not-allowed';
    }
  }

  if (irpfLockBtn) {
    irpfLockBtn.textContent = irpfLocked ? '🔒' : '🔓';
    irpfLockBtn.title = irpfLocked ? 'IRPF bloqueado - Click para desbloquear' : 'IRPF desbloqueado - Click para bloquear';
  }

  try {
    // 1. LIMPIAR CACHE DE JORNALES, MAPEO, TABLA SALARIAL Y PRIMAS PARA FORZAR RECARGA FRESCA
    const cacheKeys = Object.keys(localStorage);
    cacheKeys.forEach(key => {
      if (key.startsWith(`supabase_jornales_${AppState.currentUser}`) ||
          key.startsWith(`supabase_primas_${AppState.currentUser}`) ||
          key === 'supabase_mapeo_puestos' ||
          key === 'supabase_tabla_salarios') {
        localStorage.removeItem(key);
      }
    });
    console.log('🗑️ Cache de jornales, primas, mapeo_puestos y tabla_salarios limpiado en Sueldómetro');

    // 1b. SINCRONIZAR PRIMAS PERSONALIZADAS DESDE CSV (si hay URL configurada)
    const primasURL = 'https://docs.google.com/spreadsheets/d/1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc/export?format=csv&gid=1977235036';
    if (primasURL) {
      try {
        console.log('🔄 Sincronizando primas personalizadas desde CSV...');
        // Asumiendo que SheetsAPI.syncPrimasPersonalizadasFromCSV ahora invoca la Edge Function de sincronización
        await SheetsAPI.syncPrimasPersonalizadasFromCSV(primasURL); 
      } catch (primasError) {
        console.warn('⚠️ Error sincronizando primas desde CSV:', primasError.message);
        // Continuar de todos modos - usaremos datos existentes en Supabase
      }
    }

    // 2. Cargar datos necesarios
    console.log('📊 Cargando datos del Sueldómetro...');

    const [jornales, mapeoPuestos, tablaSalarial] = await Promise.all([
      SheetsAPI.getJornalesHistoricoAcumulado(AppState.currentUser), // SheetsAPI (en supabase.js)
      SheetsAPI.getMapeoPuestos(), // SheetsAPI (en supabase.js)
      SheetsAPI.getTablaSalarial() // SheetsAPI (en supabase.js)
    ]);

    const manuales = jornales.filter(j => j.origen === 'manual').length;
    const csvJornales = jornales.filter(j => j.origen === 'csv').length;
    const otros = jornales.length - manuales - csvJornales;
    console.log(`✅ ${jornales.length} jornales: ${csvJornales} del CSV + ${manuales} manuales + ${otros} otros`);
    console.log(`   ${mapeoPuestos.length} puestos, ${tablaSalarial.length} salarios`);

    if (jornales.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>No hay jornales registrados</h3>
          <p>Cuando trabajes tus primeros jornales aparecerán aquí con su estimación salarial</p>
          <p style="margin-top: 1rem;">
            <button id="add-jornal-btn-empty" class="btn-primary">➕ Añadir Jornal Manual</button>
          </p>
        </div>
      `;
      loading.classList.add('hidden');

      // Vincular botón de añadir jornal
      const addBtnEmpty = document.getElementById('add-jornal-btn-empty');
      if (addBtnEmpty) {
        addBtnEmpty.addEventListener('click', () => {
          document.getElementById('add-jornal-modal').style.display = 'flex';
        });
      }
      return;
    }

    // 2. Agrupar por quincena
    const quincenasMap = groupByQuincena(jornales);
    console.log(`📅 DEBUG: Quincenas agrupadas: ${quincenasMap.size}`, Array.from(quincenasMap.keys()));

    // 3. Calcular salario para cada jornal
    const jornalesConSalario = jornales.map((jornal, index) => {
      // Normalizar jornada: "08 a 14" → "08-14", "20 a 02" → "20-02"
      let jornada = jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '').trim();

      // Normalizar puesto para comparaciones case-insensitive (eliminar espacios extra)
      const puestoLower = jornal.puesto.trim().replace(/\s+/g, ' ').toLowerCase();

      // 3.1 Buscar en mapeo de puestos usando comparación case-insensitive
      let mapeo = mapeoPuestos.find(m => m.puesto.trim().replace(/\s+/g, ' ').toLowerCase() === puestoLower);

      // Mapeo de fallback para puestos conocidos que pueden no estar en la hoja
      const mapeoFallback = {
        'especialista': { puesto: 'Especialista', grupo_salarial: 'G1', tipo_operativa: 'Contenedor' },
        'trincador': { puesto: 'Trincador', grupo_salarial: 'G1', tipo_operativa: 'Trincador' },
        'trincador de coches': { puesto: 'Trincador de Coches', grupo_salarial: 'G1', tipo_operativa: 'Manual' },
        'conductor de coches': { puesto: 'Conductor de Coches', grupo_salarial: 'G2', tipo_operativa: 'Coches' },
        'conductor de 2a': { puesto: 'Conductor de 2a', grupo_salarial: 'G2', tipo_operativa: 'Coches' }
      };

      if (!mapeo) {
        // Intentar usar mapeo de fallback (búsqueda case-insensitive)
        if (mapeoFallback[puestoLower]) {
          mapeo = mapeoFallback[puestoLower];
          console.log(`ℹ️ Usando mapeo de fallback para: "${jornal.puesto}"`);
        } else {
          console.warn(`⚠️ Puesto no encontrado en mapeo: "${jornal.puesto}"`);
          if (index === 0) {
            console.log('Puestos disponibles en mapeo:', mapeoPuestos.map(m => m.puesto));
          }
          return { ...jornal, salario_base: 0, prima: 0, total: 0, error: 'Puesto no mapeado' };
        }
      }

      // Obtener grupo salarial y tipo de operativa
      let grupoSalarial = mapeo.grupo_salarial; // G1 o G2
      let tipoOperativa = mapeo.tipo_operativa; // Contenedor o Coches

      // Forzar valores correctos para asegurar coherencia
      if (puestoLower === 'conductor de coches' || puestoLower === 'conductor de 2a') {
        grupoSalarial = 'G2';
        tipoOperativa = 'Coches';
      }

      // Forzar G1 para Trincador (N/A en movimientos, prima de tabla)
      if (puestoLower === 'trincador') {
        grupoSalarial = 'G1';
        tipoOperativa = 'Trincador';
      }

      // Forzar G1 para Especialista (120 movimientos por defecto, prima con coeficiente)
      if (puestoLower === 'especialista') {
        grupoSalarial = 'G1';
        tipoOperativa = 'Contenedor'; // Especialista usa Contenedor para mostrar movimientos
      }

      if (puestoLower === 'trincador de coches') {
        grupoSalarial = 'G1';
        tipoOperativa = 'Manual';
      }

      // Forzar G2 para Conductor de 1a (120 movimientos por defecto, prima con coeficiente)
      if (puestoLower === 'conductor de 1a') {
        grupoSalarial = 'G2';
        tipoOperativa = 'Contenedor';
      }

      // Normalizar nombre de puesto para display
      let puestoDisplay = jornal.puesto;
      if (puestoLower === 'conductor de coches') {
        puestoDisplay = 'Conductor de 2a';
      }

      // 3.2 Determinar tipo de día
      const tipoDia = determinarTipoDia(jornal.fecha, jornada);

      // 3.3 Crear clave de jornada (ej: "08-14_LABORABLE")
      const claveJornada = `${jornada}_${tipoDia}`;

      // 3.4 Buscar en tabla salarial
      const salarioInfo = tablaSalarial.find(s => s.clave_jornada === claveJornada);

      if (!salarioInfo) {
        console.error(`❌ Clave de jornada NO encontrada: "${claveJornada}"`);
        console.log('📋 Claves disponibles:', tablaSalarial.map(t => `"${t.clave_jornada}"`).join(', '));
        console.log('🔍 Buscando:', `"${claveJornada}" (Fecha: ${jornal.fecha}, Jornada: ${jornada}, Tipo día: ${tipoDia})`);
        return { ...jornal, salario_base: 0, prima: 0, total: 0, error: `Jornada no encontrada: ${claveJornada}` };
      }

      // Debug del primer jornal
      if (index === 0) {
        console.log('🔍 DEBUG PRIMER JORNAL:');
        console.log('  Jornal:', jornal);
        console.log('  Puesto original:', jornal.puesto);
        console.log('  Puesto normalizado:', puestoLower);
        console.log('  Mapeo encontrado:', mapeo);
        console.log('  Tipo día:', tipoDia);
        console.log('  Clave jornada:', claveJornada);
        console.log('  Salario info:', salarioInfo);
      }

      // 3.5 Detectar si es Conductor OC (sin barco)
      // OC usa "--" (dos guiones) en el campo buque
      const esConductorOC = puestoLower === 'conductor de 1a' &&
                            (!jornal.buque || jornal.buque.trim() === '' || jornal.buque.trim() === '--');

      let salarioBase = 0;
      let prima = 0;
      let esJornalFijo = false;

      // Tabla de primas mínimas para Trincador según horario y jornada
      const primasMinimaTrincador = {
        '02-08_FESTIVO': 203.719,
        '02-08_LABORABLE': 140.105,
        '02-08_SABADO': 140.105,
        '08-14_FESTIVO': 114.031,
        '08-14_LABORABLE': 88.822,
        '08-14_SABADO': 88.822,
        '14-20_FESTIVO': 144.967,
        '14-20_LABORABLE': 88.822,
        '14-20_SABADO': 114.031,
        '20-02_FESTIVO': 220.058,
        '20-02_LABORABLE': 112.287,
        '20-02_SABADO': 151.393
      };

      if (esConductorOC) {
        // Conductores OC tienen salarios fijos sin prima (solo laborables)
        esJornalFijo = true;
        const salariosOC = {
          '08-14': 179.75,
          '14-20': 179.75,
          '20-02': 253.75,
          '02-08': 321.75
        };

        salarioBase = salariosOC[jornada] || 0;
        prima = 0; // Sin prima para OC
      } else {
        // Cálculo normal para SP y Contenedor/Coches/Trincador
        salarioBase = grupoSalarial === 'G1' ? salarioInfo.jornal_base_g1 : salarioInfo.jornal_base_g2;

        // Añadir complemento de 46,94€ para Trincador y Trincador de Coches
        if (puestoLower === 'trincador' || puestoLower === 'trincador de coches') {
          salarioBase += 46.94;
          if (index === 0) {
            console.log(`✅ Complemento aplicado a "${jornal.puesto}": +46.94€`);
          }
        }

        // 3.6 Calcular prima (por defecto 120 movimientos para Contenedor)
        if (tipoOperativa === 'Coches') {
          // Para Coches: usar prima fija de la tabla
          prima = salarioInfo.prima_minima_coches;
          if (index === 0) {
            console.log(`🚗 Coches detectado - Prima: ${prima}€ (de prima_minima_coches)`);
          }
        } else if (tipoOperativa === 'Contenedor') {
          // A partir de 120 movimientos (>=120) se usa coef_mayor
          prima = 120 * salarioInfo.coef_prima_mayor120;
        } else if (tipoOperativa === 'Trincador') {
          // Para Trincador: usar prima mínima según horario y jornada
          const clavePrima = `${jornada}_${tipoDia}`;
          prima = primasMinimaTrincador[clavePrima] || 0;
          if (index === 0) {
            console.log(`🔧 Trincador detectado - Prima mínima: ${prima}€ (clave: ${clavePrima})`);
          }
        } else if (tipoOperativa === 'Manual') {
          // Para Manual (ej: Trincador de Coches): prima editable, iniciar en 0
          prima = 0;
          if (index === 0) {
            console.log(`✋ Manual detectado (${jornal.puesto}) - Prima editable iniciada en 0€`);
          }
        }
      }

      // 3.7 Total
      const total = salarioBase + prima;

      if (index === 0) {
        console.log('  Grupo salarial:', grupoSalarial);
        console.log('  Es Conductor OC:', esConductorOC);
        console.log('  Salario base:', salarioBase);
        console.log('  Prima (120 mov):', prima);
        console.log('  Total:', total);
      }

      // Detectar si incluye complemento para mostrar asterisco
      const incluyeComplemento = (puestoLower === 'trincador' || puestoLower === 'trincador de coches');

      return {
        ...jornal,
        puesto_display: puestoDisplay,
        salario_base: salarioBase,
        prima: prima, // Prima inicial calculada
        total: total, // Total inicial calculado
        grupo_salarial: grupoSalarial,
        tipo_operativa: tipoOperativa,
        tipo_dia: tipoDia,
        clave_jornada: claveJornada,
        es_jornal_fijo: esJornalFijo,
        incluye_complemento: incluyeComplemento
      };
    });

    // 4. Calcular estadísticas globales (iniciales)
    // Estos totales se recalcularán después con `actualizarTotales`
    const totalJornalesGlobal = jornalesConSalario.length;
    let salarioTotalBrutoGlobal = jornalesConSalario.reduce((sum, j) => sum + j.total, 0);
    let salarioTotalNetoGlobal = salarioTotalBrutoGlobal * (1 - irpfPorcentaje / 100);
    let salarioPromedioBrutoGlobal = totalJornalesGlobal > 0 ? salarioTotalBrutoGlobal / totalJornalesGlobal : 0;

    // 5. Mostrar IRPF control y estadísticas
    if (irpfControl) {
      irpfControl.style.display = 'block';
    }

    stats.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${totalJornalesGlobal}</div>
        <div class="stat-label">Jornales Totales (Anual)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--puerto-orange);">${salarioTotalBrutoGlobal.toFixed(2)}€</div>
        <div class="stat-label">Total Bruto (Anual)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--puerto-green);">${salarioTotalNetoGlobal.toFixed(2)}€</div>
        <div class="stat-label">Total Neto (Anual - ${irpfPorcentaje}% IRPF)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--puerto-orange);">${salarioPromedioBrutoGlobal.toFixed(2)}€</div>
        <div class="stat-label">Promedio Bruto (Anual)</div>
      </div>
    `;

    // 6. Renderizar quincenas con salarios
    const quincenasArray = Array.from(quincenasMap.entries())
      .map(([key, jornalesQuincena]) => {
        // Asegurarse de que los objetos jornal dentro de jornalesQuincena
        // sean los mismos que en jornalesConSalario para que los cambios se reflejen
        const jornalesConSalarioQuincena = jornalesQuincena.map(j => {
          return jornalesConSalario.find(jcs => 
            jcs.fecha === j.fecha && jcs.jornada === j.jornada && jcs.puesto === j.puesto
          ) || j; // Fallback al original si no se encuentra (no debería pasar)
        }).filter(j => j);
        
        const [year, month, quincena] = key.split('-').map(Number);
        return { year, month, quincena, jornales: jornalesConSalarioQuincena }; // Usar el array con salarios
      })
      .sort((a, b) => {
        // Ordenar por año, mes, quincena descendente
        if (a.year !== b.year) return b.year - a.year;
        if (a.month !== b.month) return b.month - a.month;
        return b.quincena - a.quincena;
      });

    const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Función auxiliar para calcular tarifa de horas de relevo
    const calcularTarifaRelevo = (jornada, tipoDia) => {
      // No hay relevo en 02-08
      if (jornada === '02-08') return null;

      // Tarifa especial 93,55€ para:
      // - Festivos y domingos (cualquier tipo de día que incluya FEST)
      // - Sábados desde 14-20 hasta 20-02
      if (tipoDia.includes('FEST') || (tipoDia === 'SABADO' && (jornada === '14-20' || jornada === '20-02'))) {
        return 93.55;
      }

      // Tarifa normal para el resto de jornadas
      return 64.31;
    };

    // Función auxiliar para calcular tarifa de horas de remate (Grupo I por defecto)
    const calcularTarifaRemate = (jornada, tipoDia) => {
      const tarifasRemate = {
        '02-08': {
          'LABORABLE': 61.40,
          'FEST-LAB': 70.36,
          'FESTIVO': 110.57,
          'SABADO': 61.40, // Asumo mismo que laborable para sábado 02-08 si existe
          'FEST-FEST': 110.57 // Asumo mismo que festivo
        },
        '06-12': { // Esta jornada no está en tu determinarTipoDia, pero se mantiene por si acaso
          'LABORABLE': 41.13,
          'FESTIVO': 60.92,
          'SABADO': 41.13 // Asumo mismo que laborable
        },
        '08-14': {
          'LABORABLE': 29.02,
          'SABADO': 52.24,
          'FESTIVO': 75.46,
          'FEST-LAB': 75.46, // Asumo mismo que festivo para coherencia si aparece
          'LAB-FEST': 29.02 // Asumo mismo que laborable para coherencia si aparece
        },
        '14-20': {
          'LABORABLE': 43.51,
          'SABADO': 78.37,
          'FESTIVO': 110.99,
          'FEST-LAB': 110.99, // Asumo mismo que festivo para coherencia si aparece
          'LAB-FEST': 43.51 // Asumo mismo que laborable para coherencia si aparece
        },
        '20-02': {
          'LABORABLE': 43.51,
          'LAB-FEST': 99.25,
          'SABADO': 76.85,
          'FEST-LAB': 88.20,
          'FESTIVO': 110.57, // Asumo festivo en 20-02 si ocurre
          'FEST-FEST': 110.57 // Asumo festivo en 20-02 si ocurre
        }
      };

      return tarifasRemate[jornada]?.[tipoDia] || null;
    };

    // Cargar valores bloqueados desde Supabase primero, luego localStorage como fallback
    const lockedValuesKey = `locked_values_${AppState.currentUser}`;
    let lockedValues = {};

    // 1. Intentar cargar desde Supabase
    try {
      console.log('📥 Cargando primas personalizadas desde Supabase...');
      const primasSupabase = await SheetsAPI.getPrimasPersonalizadas(AppState.currentUser);

      if (primasSupabase && primasSupabase.length > 0) {
        // Poblar lockedValues con datos de Supabase
        primasSupabase.forEach(p => {
          // IMPORTANTE: p.fecha ya viene en formato español (dd/mm/yyyy) porque
          // getJornales() hace la conversión automática de ISO → Español
          // Pero getPrimasPersonalizadas NO hace esta conversión
          // Así que necesitamos convertir aquí si viene en formato ISO
          let fechaEspañol = p.fecha;
          if (p.fecha.includes('-')) {
            // Convertir de ISO (yyyy-mm-dd) a español (dd/mm/yyyy)
            const [year, month, day] = p.fecha.split('-');
            fechaEspañol = `${day}/${month}/${year}`;
          }

          // Normalizar jornada (eliminar espacios y convertir "a" a "-")
          const jornadaNormalizada = p.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '');

          const key = `${fechaEspañol}_${jornadaNormalizada}`;

          let primaFinal = p.prima_personalizada || p.prima || 0;
          let movimientosFinal = p.movimientos_personalizados || p.movimientos || 0;

          // CÁLCULO INVERSO: Si hay prima pero NO movimientos, calcular movimientos desde prima
          // Solo para operativas de Contenedor (Especialista, Conductor de 1a)
          if (primaFinal > 0 && movimientosFinal === 0) {
            // Buscar el jornal correspondiente para obtener tipo_operativa
            const jornalCorrespondiente = jornalesConSalario.find(j =>
              j.fecha === fechaEspañol &&
              j.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '') === jornadaNormalizada
            );

            if (jornalCorrespondiente && jornalCorrespondiente.tipo_operativa === 'Contenedor') {
              // Obtener coeficientes de la tabla salarial
              const salarioInfo = tablaSalarial.find(s => s.clave_jornada === jornalCorrespondiente.clave_jornada);

              if (salarioInfo) {
                // Calcular movimientos inversos: prima / coeficiente
                // Intentar primero con coef_mayor120 (más común)
                let movimientosCalculados = Math.round(primaFinal / salarioInfo.coef_prima_mayor120);

                // Si los movimientos son < 120, recalcular con coef_menor120
                if (movimientosCalculados < 120) {
                  movimientosCalculados = Math.round(primaFinal / salarioInfo.coef_prima_menor120);
                }

                movimientosFinal = movimientosCalculados;
                console.log(`🔄 Movimientos calculados inversos: ${primaFinal}€ / coef = ${movimientosCalculados} mov`);
              }
            }
          }

          console.log(`🔑 DEBUG: Creando clave prima: "${key}" con prima=${primaFinal || 0}, movimientos=${movimientosFinal || 0}`);

          lockedValues[key] = {
            prima: primaFinal,
            movimientos: movimientosFinal,
            horasRelevo: p.relevo || 0,
            horasRemate: p.remate || 0,
            primaLocked: true,
            movimientosLocked: true
          };
        });

        console.log(`✅ ${primasSupabase.length} primas personalizadas cargadas desde Supabase`);
        console.log(`🔑 Claves generadas:`, Object.keys(lockedValues));

        // Guardar en localStorage como caché
        localStorage.setItem(lockedValuesKey, JSON.stringify(lockedValues));
      }
    } catch (error) {
      console.warn('⚠️ Error cargando primas desde Supabase, usando localStorage:', error);
    }

    // 2. Si no hay datos de Supabase, cargar desde localStorage
    if (Object.keys(lockedValues).length === 0) {
      try {
        const stored = localStorage.getItem(lockedValuesKey);
        if (stored) {
          lockedValues = JSON.parse(stored);
          console.log(`📂 Valores bloqueados cargados desde localStorage`);
        }
      } catch (e) {
        console.warn('Error cargando valores bloqueados de localStorage:', e);
      }
    }

    // Función para guardar valores bloqueados (con debounce para Supabase)
    let saveTimeout = null;
    const saveLockedValues = (fecha = null, jornada = null) => {
      // Guardar en localStorage (caché local)
      localStorage.setItem(lockedValuesKey, JSON.stringify(lockedValues));

      // Si se proporciona fecha y jornada, guardar también en Supabase
      if (fecha && jornada) {
        // Debounce: esperar 1 segundo antes de guardar en Supabase
        if (saveTimeout) clearTimeout(saveTimeout);

        saveTimeout = setTimeout(() => {
          const key = `${fecha}_${jornada}`;
          const datos = lockedValues[key];

          if (datos) {
            SheetsAPI.savePrimaPersonalizada(
              AppState.currentUser,
              fecha,
              jornada,
              datos.prima || 0,
              datos.movimientos || 0,
              datos.horasRelevo || 0,
              datos.horasRemate || 0
            ).then(result => {
              if (result && result.success) {
                console.log(`✅ Prima guardada en Supabase: ${fecha} ${jornada}`, result.data);
              } else {
                console.warn(`⚠️ Error guardando prima en Supabase: ${result?.message || 'desconocido'}`);
              }
            }).catch(err => {
              console.error('❌ Error sincronizando con Supabase:', err);
            });
          }
        }, 1000); // 1 segundo de debounce
      }
    };

    console.log(`🔢 DEBUG: Renderizando ${quincenasArray.length} quincenas`);
    let quincenaCounter = 0;
    quincenasArray.forEach(({ year, month, quincena, jornales: jornalesQuincena }) => { // Utilizar el array con salarios
      quincenaCounter++;
      console.log(`📊 DEBUG: Renderizando quincena ${quincenaCounter}/${quincenasArray.length}: ${year}-${month}-${quincena} (${jornalesQuincena.length} jornales)`);
      // Recalcular estos totales para el header de la quincena para que reflejen los datos ya actualizados
      // por la lógica del `jornalesConSalario` que ya tiene los valores bloqueados y recalculados.
      const totalQuincenaBruto = jornalesQuincena.reduce((sum, j) => j.total ? sum + j.total : sum, 0);
      const totalQuincenaNeto = totalQuincenaBruto * (1 - irpfPorcentaje / 100);
      const totalBaseQuincena = jornalesQuincena.reduce((sum, j) => j.salario_base ? sum + j.salario_base : sum, 0);
      const totalPrimaExtrasQuincena = jornalesQuincena.reduce((sum, j) => j.total && j.salario_base ? sum + (j.total - j.salario_base) : sum, 0);


      // Verificar si hay jornales con complemento en esta quincena
      const tieneComplemento = jornalesQuincena.some(j => j.incluye_complemento);

      // Verificar si hay jornales OC en esta quincena
      const tieneJornalesOC = jornalesQuincena.some(j => j.es_jornal_fijo);
      const badgeCenso = tieneJornalesOC ? ' <span class="badge-oc">OC</span>' : ' <span class="badge-green">SP</span>';

      const quincenaLabel = quincena === 1 ? '1-15' : '16-fin';
      const monthName = monthNamesShort[month - 1]; // Usar monthNamesShort
      const emoji = quincena === 1 ? '📅' : '🗓️';

      const card = document.createElement('div');
      card.className = 'quincena-card';
      card.innerHTML = `
        <div class="quincena-header">
          <h3>${emoji} ${quincenaLabel} ${monthName.toUpperCase()} ${year}</h3>
          <div class="quincena-total">
            <div class="total-box bruto-box">
              <div class="total-icon">💰</div>
              <div class="total-content">
                <div class="total-label">Total Bruto</div>
                <div class="total-value bruto-value">${totalQuincenaBruto.toFixed(2)}€</div>
              </div>
            </div>
            <div class="total-box neto-box">
              <div class="total-icon">💵</div>
              <div class="total-content">
                <div class="total-label">Total Neto (${irpfPorcentaje}%)</div>
                <div class="total-value neto-value">${totalQuincenaNeto.toFixed(2)}€</div>
              </div>
            </div>
          </div>
        </div>
        <div class="quincena-summary">
          <div class="summary-item">
            <span class="summary-label">Jornales:</span>
            <span class="summary-value">${jornalesQuincena.length}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Base:</span>
            <span class="summary-value">${totalBaseQuincena.toFixed(2)}€</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Prima:</span>
            <span class="summary-value">${totalPrimaExtrasQuincena.toFixed(2)}€</span>
          </div>
        </div>
        <div class="jornales-table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Jornada</th>
                <th>Puesto${badgeCenso}</th>
                <th>Base</th>
                <th>Movimientos</th>
                <th>Prima</th>
                <th>H. Relevo</th>
                <th>H. Remate</th>
                <th>Bruto</th>
                <th>Neto</th>
              </tr>
            </thead>
            <tbody id="tbody-${year}-${month}-${quincena}">
              ${jornalesQuincena.map((j, idx) => { // Usar jornalesQuincena
                const rowId = `row-${year}-${month}-${quincena}-${idx}`;
                const lockKey = `${j.fecha}_${j.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '')}`;

                // DEBUG: Log para ver qué clave se está buscando
                if (idx === 0) {
                  console.log(`🔑 DEBUG lockKey generada: "${lockKey}"`);
                  console.log(`🔑 Fecha del jornal: "${j.fecha}", Jornada: "${j.jornada}"`);
                  console.log(`🗂️ lockedValues disponibles:`, Object.keys(lockedValues));
                  console.log(`🔍 ¿Existe en lockedValues?`, lockKey in lockedValues);
                  if (lockKey in lockedValues) {
                    console.log(`✅ Datos encontrados:`, lockedValues[lockKey]);
                  }
                }

                // Cargar valores bloqueados o usar defaults
                const lockedData = lockedValues[lockKey] || {};
                const movimientosValue = lockedData.movimientos !== undefined ? lockedData.movimientos : (j.tipo_operativa === 'Contenedor' ? 120 : 0);
                let primaValue = lockedData.prima !== undefined ? lockedData.prima : j.prima;
                const horasRelevoValue = lockedData.horasRelevo !== undefined ? lockedData.horasRelevo : 0;
                const horasRemateValue = lockedData.horasRemate !== undefined ? lockedData.horasRemate : 0;
                const movimientosLocked = lockedData.movimientosLocked || false;
                const primaLocked = lockedData.primaLocked || false;

                // RECALCULAR PRIMA según movimientos si no está bloqueada y es Contenedor
                if (!primaLocked && j.tipo_operativa === 'Contenedor' && !j.es_jornal_fijo) {
                  const salarioInfo = tablaSalarial.find(s => s.clave_jornada === j.clave_jornada);
                  if (salarioInfo) {
                    // Usar coeficiente correcto según movimientos
                    if (movimientosValue < 120) {
                      primaValue = movimientosValue * salarioInfo.coef_prima_menor120;
                    } else {
                      primaValue = movimientosValue * salarioInfo.coef_prima_mayor120;
                    }
                  }
                }

                // DEBUG: Log de valores usados
                if (idx === 0) {
                  console.log(`💰 Prima usada: ${primaValue.toFixed(2)}, Prima locked: ${primaLocked}`);
                  console.log(`📊 Movimientos usados: ${movimientosValue}, Movimientos locked: ${movimientosLocked}`);
                  if (!primaLocked && j.tipo_operativa === 'Contenedor') {
                    console.log(`🔢 Prima recalculada con ${movimientosValue} movimientos`);
                  }
                }

                // Si hay valores bloqueados, usar prima bloqueada; si no, usar la recalculada
                let primaRecalculada = primaLocked ? primaValue : primaValue;

                const esOC = j.es_jornal_fijo;

                // Calcular tarifa de relevo
                const tarifaRelevo = calcularTarifaRelevo(j.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), j.tipo_dia);
                const importeRelevo = tarifaRelevo ? (horasRelevoValue * tarifaRelevo) : 0;

                // Calcular tarifa de remate
                const tarifaRemate = calcularTarifaRemate(j.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), j.tipo_dia);
                const importeRemate = tarifaRemate ? (horasRemateValue * tarifaRemate) : 0;

                const bruto = j.salario_base + primaRecalculada + importeRelevo + importeRemate;
                const neto = bruto * (1 - irpfPorcentaje / 100);

                // Actualizar el objeto jornal en el array global
                j.total = bruto;
                j.prima = primaRecalculada; // Esto asegura que `jornalesConSalario` se mantiene actualizado

                return `
                <tr id="${rowId}" data-row-index="${idx}" data-lock-key="${lockKey}" data-fecha="${j.fecha}" data-jornada="${j.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '')}">
                  <td>${formatearFecha(j.fecha)}</td>
                  <td><span class="badge badge-${j.jornada.replace(/\s+/g, '')}">${j.jornada}</span></td>
                  <td>${j.puesto_display}</td>
                  <td class="base-value">${j.salario_base.toFixed(2)}€${j.incluye_complemento ? '*' : ''}</td>
                  <td>
                    ${esOC ? `
                      <span class="text-muted">Fijo</span>
                    ` : j.tipo_operativa === 'Contenedor' && !esOC ? `
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <input
                          type="number"
                          class="movimientos-input"
                          value="${movimientosValue}"
                          min="0"
                          step="1"
                          data-jornal-index="${idx}"
                          ${movimientosLocked ? 'disabled' : ''}
                          style="${movimientosLocked ? 'opacity: 0.7; background: #f0f0f0;' : ''}"
                        />
                        <button class="lock-btn movimientos-lock-btn" data-jornal-index="${idx}" title="${movimientosLocked ? 'Desbloqueado' : 'Bloqueado'}">${movimientosLocked ? '🔒' : '🔓'}</button>
                      </div>
                    ` : `
                      <span class="text-muted">N/A</span>
                    `}
                  </td>
                  <td>
                    ${esOC ? `
                      <span class="text-muted">—</span>
                    ` : `
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <input
                          type="number"
                          class="prima-input"
                          value="${primaValue.toFixed(2)}"
                          min="0"
                          step="0.01"
                          data-jornal-index="${idx}"
                          ${primaLocked ? 'disabled' : ''}
                          style="${primaLocked ? 'opacity: 0.7; background: #f0f0f0;' : ''}"
                        />€
                        <button class="lock-btn prima-lock-btn" data-jornal-index="${idx}" title="${primaLocked ? 'Desbloqueado' : 'Bloqueado'}">${primaLocked ? '🔒' : '🔓'}</button>
                      </div>
                    `}
                  </td>
                  <td>
                    ${tarifaRelevo !== null ? `
                      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem;">
                        <label style="display: flex; align-items: center; cursor: pointer; margin: 0;">
                          <input
                            type="checkbox"
                            class="relevo-checkbox"
                            ${horasRelevoValue > 0 ? 'checked' : ''}
                            data-jornal-index="${idx}"
                            style="width: 20px; height: 20px; cursor: pointer; margin-right: 6px;"
                          />
                          <span style="white-space: nowrap;">1h (${tarifaRelevo.toFixed(2)}€)</span>
                        </label>
                      </div>
                      <div class="importe-relevo-value" style="font-size: 0.75rem; color: #666; font-weight: 600;">= ${importeRelevo.toFixed(2)}€</div>
                    ` : `
                      <span class="text-muted">N/A</span>
                    `}
                  </td>
                  <td>
                    ${tarifaRemate !== null ? `
                      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem;">
                        <select
                          class="remate-select"
                          data-jornal-index="${idx}"
                          style="padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.8rem; cursor: pointer;"
                        >
                          <option value="0" ${horasRemateValue === 0 ? 'selected' : ''}>0h</option>
                          <option value="1" ${horasRemateValue === 1 ? 'selected' : ''}>1h (${tarifaRemate.toFixed(2)}€)</option>
                          <option value="2" ${horasRemateValue === 2 ? 'selected' : ''}>2h (${(tarifaRemate * 2).toFixed(2)}€)</option>
                        </select>
                        <div class="importe-remate-value" style="font-size: 0.75rem; color: #666; font-weight: 600;">= ${importeRemate.toFixed(2)}€</div>
                      </div>
                    ` : `
                      <span class="text-muted">N/A</span>
                    `}
                  </td>
                  <td class="bruto-value"><strong>${bruto.toFixed(2)}€</strong></td>
                  <td class="neto-value"><strong>${neto.toFixed(2)}€</strong></td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </div>
        ${tieneComplemento ? `
          <div class="complemento-nota" style="font-size: 0.85rem; color: #666; margin-top: 0.5rem; padding: 0.5rem; background: #f9f9f9; border-radius: 4px;">
            <strong>*</strong> Los puestos Trincador y Trincador de Coches incluyen un complemento de 46,94€ en el salario base.
          </div>
        ` : ''}
      `;

      content.appendChild(card);

      // Función auxiliar para recalcular los totales de la quincena (bruto, neto, base, prima)
      // y los totales globales (bruto, neto, promedio)
      const actualizarTotales = () => {
          // 1. Recalcular y actualizar totales de la QUINCENA actual (la card que disparó el evento)
          let nuevoTotalBaseQuincena = 0;
          let nuevoTotalPrimaExtrasQuincena = 0; // Suma de prima + relevo + remate
          let nuevoTotalBrutoQuincena = 0;
          let nuevoTotalNetoQuincena = 0;

          // Recorrer los jornales ya procesados y actualizados en `jornalesConSalarioQuincena`
          jornalesQuincena.forEach(jornal => {
              // Leer los valores actuales de la fila (estos ya están actualizados por los event listeners)
              const row = document.querySelector(`tr[data-lock-key="${jornal.fecha}_${jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '')}"]`);
              if (row) {
                  const brutoFila = parseFloat(row.querySelector('.bruto-value strong')?.textContent.replace('€', '') || '0');
                  const netoFila = parseFloat(row.querySelector('.neto-value strong')?.textContent.replace('€', '') || '0');
                  const baseFila = parseFloat(row.querySelector('.base-value')?.textContent.replace('€', '').replace('*', '') || '0');

                  nuevoTotalBrutoQuincena += brutoFila;
                  nuevoTotalNetoQuincena += netoFila;
                  nuevoTotalBaseQuincena += baseFila;
                  nuevoTotalPrimaExtrasQuincena += (brutoFila - baseFila); // Prima y extras
              }
          });

          // Actualizar el resumen de la quincena en el DOM
          const summaryItems = card.querySelectorAll('.quincena-summary .summary-value');
          if (summaryItems[0]) summaryItems[0].textContent = `${jornalesQuincena.length}`; // Jornales
          if (summaryItems[1]) summaryItems[1].textContent = `${nuevoTotalBaseQuincena.toFixed(2)}€`; // Base
          if (summaryItems[2]) summaryItems[2].textContent = `${nuevoTotalPrimaExtrasQuincena.toFixed(2)}€`; // Prima

          // Actualizar bruto y neto en el header de la quincena
          const brutoValueHeader = card.querySelector('.quincena-total .bruto-value');
          const netoValueHeader = card.querySelector('.quincena-total .neto-value');
          if (brutoValueHeader) brutoValueHeader.textContent = `${nuevoTotalBrutoQuincena.toFixed(2)}€`;
          if (netoValueHeader) netoValueHeader.textContent = `${nuevoTotalNetoQuincena.toFixed(2)}€`;

          // 2. Recalcular y actualizar estadísticas GLOBALES (parte superior)
          let totalGlobalBrutoActual = 0;
          let totalGlobalNetoActual = 0;
          let contadorJornalesGlobalActual = 0;

          // Iterar sobre TODOS los jornales del array `jornalesConSalario` (que se mantiene actualizado)
          jornalesConSalario.forEach(jornal => {
              // Cada jornal.total ya ha sido actualizado por los event listeners
              totalGlobalBrutoActual += jornal.total;
              contadorJornalesGlobalActual++;
          });
          totalGlobalNetoActual = totalGlobalBrutoActual * (1 - irpfPorcentaje / 100);

          const promedioBrutoGlobalActual = contadorJornalesGlobalActual > 0 ? totalGlobalBrutoActual / contadorJornalesGlobalActual : 0;

          const statCards = stats.querySelectorAll('.stat-card .stat-value');
          if (statCards.length >= 4) { // Asegurarse de que hay suficientes tarjetas
              statCards[0].textContent = `${contadorJornalesGlobalActual}`; // Jornales Totales
              statCards[1].textContent = `${totalGlobalBrutoActual.toFixed(2)}€`; // Total Bruto
              statCards[2].textContent = `${totalGlobalNetoActual.toFixed(2)}€`; // Total Neto
              statCards[3].textContent = `${promedioBrutoGlobalActual.toFixed(2)}€`; // Promedio Bruto

              // Actualizar label con nuevo % IRPF si es necesario
              const netoLabel = stats.querySelectorAll('.stat-card .stat-label')[2];
              if (netoLabel) netoLabel.textContent = `Total Neto (Anual - ${irpfPorcentaje}% IRPF)`;
          }
      };

      // Event listener para inputs de movimientos
      card.querySelectorAll('.movimientos-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const movimientos = parseFloat(e.target.value) || 0;
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesQuincena[jornalIndex];
          const row = e.target.closest('tr');
          const lockKey = row.dataset.lockKey;
          const fecha = row.dataset.fecha;
          const jornada = row.dataset.jornada;

          // Guardar movimientos en localStorage y Supabase
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].movimientos = movimientos;
          // lockedValues[lockKey].movimientosLocked = true; // No bloquear automáticamente al cambiar, solo si se clica el candado
          saveLockedValues(fecha, jornada);

          // Recalcular prima según movimientos (solo si no está bloqueada)
          const primaInput = row.querySelector('.prima-input');
          const primaLockBtn = row.querySelector('.prima-lock-btn');
          const primaLocked = primaLockBtn && primaLockBtn.textContent === '🔒';

          let nuevaPrima = 0;
          const salarioInfo = tablaSalarial.find(s => s.clave_jornada === jornal.clave_jornada);

          if (salarioInfo && jornal.tipo_operativa === 'Contenedor' && !primaLocked) {
            // A partir de 120 movimientos (>=120) se usa coef_mayor
            if (movimientos < 120) {
              nuevaPrima = movimientos * salarioInfo.coef_prima_menor120;
            } else {
              nuevaPrima = movimientos * salarioInfo.coef_prima_mayor120;
            }
            // Actualizar el input de prima también
            if (primaInput) primaInput.value = nuevaPrima.toFixed(2);
            jornal.prima = nuevaPrima; // Actualizar el objeto jornal
          } else {
            nuevaPrima = parseFloat(primaInput?.value || 0);
          }

          // Calcular horas de relevo
          const relevoCheckbox = row.querySelector('.relevo-checkbox');
          const horasRelevo = relevoCheckbox?.checked ? 1 : 0;
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          // Calcular horas de remate
          const remateSelect = row.querySelector('.remate-select');
          const horasRemate = remateSelect ? parseInt(remateSelect.value) : 0;
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          const nuevoTotal = jornal.salario_base + nuevaPrima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar la fila con animación
          row.classList.add('updating');
          setTimeout(() => row.classList.remove('updating'), 600);

          row.querySelector('.bruto-value strong').textContent = `${nuevoTotal.toFixed(2)}€`;
          row.querySelector('.neto-value strong').textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal en el array global
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) {
              globalJornal.total = nuevoTotal;
              globalJornal.prima = nuevaPrima;
          }

          actualizarTotales();
        });
      });

      // Event listener para inputs de prima
      card.querySelectorAll('.prima-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const nuevaPrima = parseFloat(e.target.value) || 0;
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesConSalarioQuincena[jornalIndex];
          const row = e.target.closest('tr');
          const lockKey = row.dataset.lockKey;
          const fecha = row.dataset.fecha;
          const jornada = row.dataset.jornada;

          // Guardar prima en localStorage y Supabase
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].prima = nuevaPrima;
          // lockedValues[lockKey].primaLocked = true; // No bloquear automáticamente al cambiar
          saveLockedValues(fecha, jornada);

          // NUEVO: Recalcular movimientos basado en la prima (si es operativa de contenedor)
          const movimientosInput = row.querySelector('.movimientos-input');
          const movimientosLockBtn = row.querySelector('.movimientos-lock-btn');
          const movimientosLocked = movimientosLockBtn && movimientosLockBtn.textContent === '🔒';

          if (movimientosInput && jornal.tipo_operativa === 'Contenedor' && !movimientosLocked) {
            const salarioInfo = tablaSalarial.find(s => s.clave_jornada === jornal.clave_jornada);

            if (salarioInfo) {
              // Calcular movimientos a partir de prima (inverso de la fórmula)
              // Primero intentar con coeficiente menor (<120)
              const movimientosMenor = nuevaPrima / salarioInfo.coef_prima_menor120;

              let movimientosCalculados;
              if (movimientosMenor < 120) {
                // Si los movimientos calculados son < 120, usar ese coeficiente
                movimientosCalculados = Math.round(movimientosMenor);
              } else {
                // Si no, usar coeficiente mayor (>=120)
                movimientosCalculados = Math.round(nuevaPrima / salarioInfo.coef_prima_mayor120);
              }

              // Actualizar input de movimientos
              movimientosInput.value = movimientosCalculados;

              // Guardar en localStorage y Supabase
              if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
              lockedValues[lockKey].movimientos = movimientosCalculados;
              saveLockedValues(fecha, jornada);
            }
          }

          // Calcular horas de relevo
          const relevoCheckbox = row.querySelector('.relevo-checkbox');
          const horasRelevo = relevoCheckbox?.checked ? 1 : 0;
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          // Calcular horas de remate
          const remateSelect = row.querySelector('.remate-select');
          const horasRemate = remateSelect ? parseInt(remateSelect.value) : 0;
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          const nuevoTotal = jornal.salario_base + nuevaPrima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar la fila con animación
          row.classList.add('updating');
          setTimeout(() => row.classList.remove('updating'), 600);

          row.querySelector('.bruto-value strong').textContent = `${nuevoTotal.toFixed(2)}€`;
          row.querySelector('.neto-value strong').textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal en el array global
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) {
              globalJornal.total = nuevoTotal;
              globalJornal.prima = nuevaPrima;
          }

          actualizarTotales();
        });
      });

      // Event listener para checkboxes de horas de relevo
      card.querySelectorAll('.relevo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const horasRelevo = e.target.checked ? 1 : 0;
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesConSalarioQuincena[jornalIndex];
          const row = e.target.closest('tr');
          const lockKey = row.dataset.lockKey;
          const fecha = row.dataset.fecha;
          const jornada = row.dataset.jornada;

          // Guardar horas de relevo en localStorage y Supabase
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].horasRelevo = horasRelevo;
          saveLockedValues(fecha, jornada);

          // Calcular tarifa de relevo
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          // Obtener prima actual
          const primaInput = row.querySelector('.prima-input');
          const prima = parseFloat(primaInput?.value || 0);

          // Obtener horas de remate actuales
          const remateSelect = row.querySelector('.remate-select');
          const horasRemate = remateSelect ? parseInt(remateSelect.value) : 0;
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          const nuevoTotal = jornal.salario_base + prima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar la fila con animación
          row.classList.add('updating');
          setTimeout(() => row.classList.remove('updating'), 600);

          // Actualizar el importe de relevo mostrado
          const importeRelevoText = row.querySelector('.importe-relevo-value');
          if (importeRelevoText) {
            importeRelevoText.textContent = `= ${importeRelevo.toFixed(2)}€`;
          }

          row.querySelector('.bruto-value strong').textContent = `${nuevoTotal.toFixed(2)}€`;
          row.querySelector('.neto-value strong').textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal en el array global
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) globalJornal.total = nuevoTotal;

          actualizarTotales();
        });
      });

      // Event listener para selector de horas de remate
      card.querySelectorAll('.remate-select').forEach(select => {
        select.addEventListener('change', (e) => {
          const horasRemate = parseInt(e.target.value);
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesConSalarioQuincena[jornalIndex];
          const row = e.target.closest('tr');
          const lockKey = row.dataset.lockKey;
          const fecha = row.dataset.fecha;
          const jornada = row.dataset.jornada;

          // Guardar horas de remate en localStorage y Supabase
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].horasRemate = horasRemate;
          saveLockedValues(fecha, jornada);

          // Calcular tarifa de remate
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          // Obtener prima actual
          const primaInput = row.querySelector('.prima-input');
          const prima = parseFloat(primaInput?.value || 0);

          // Obtener horas de relevo actuales
          const relevoCheckbox = row.querySelector('.relevo-checkbox');
          const horasRelevo = relevoCheckbox?.checked ? 1 : 0;
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          const nuevoTotal = jornal.salario_base + prima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar la fila con animación
          row.classList.add('updating');
          setTimeout(() => row.classList.remove('updating'), 600);

          // Actualizar el importe de remate mostrado
          const importeRemateText = row.querySelector('.importe-remate-value');
          if (importeRemateText) {
            importeRemateText.textContent = `= ${importeRemate.toFixed(2)}€`;
          }

          row.querySelector('.bruto-value strong').textContent = `${nuevoTotal.toFixed(2)}€`;
          row.querySelector('.neto-value strong').textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal en el array global
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) globalJornal.total = nuevoTotal;

          actualizarTotales();
        });
      });

      // Event listener para botones de candado de movimientos
      card.querySelectorAll('.movimientos-lock-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const row = e.target.closest('tr');
          const lockKey = row.dataset.lockKey;
          const fecha = row.dataset.fecha;
          const jornada = row.dataset.jornada;
          const movimientosInput = row.querySelector('.movimientos-input');
          const primaInput = row.querySelector('.prima-input');
          const primaLockBtn = row.querySelector('.prima-lock-btn');
          const jornal = jornalesQuincena[jornalIndex];

          // Toggle lock
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          const isLocked = lockedValues[lockKey].movimientosLocked || false;
          lockedValues[lockKey].movimientosLocked = !isLocked;
          lockedValues[lockKey].primaLocked = !isLocked; // Sincronizar con prima
          lockedValues[lockKey].movimientos = parseFloat(movimientosInput.value) || 0; // Guardar valor actual
          lockedValues[lockKey].prima = parseFloat(primaInput.value) || 0; // Guardar valor actual
          saveLockedValues(fecha, jornada);

          // Actualizar UI de movimientos
          btn.textContent = !isLocked ? '🔒' : '🔓';
          btn.title = !isLocked ? 'Bloqueado - Click para desbloquear' : 'Desbloqueado - Click para bloquear';
          movimientosInput.disabled = !isLocked;
          movimientosInput.style.opacity = !isLocked ? '0.7' : '1';
          movimientosInput.style.background = !isLocked ? '#f0f0f0' : '';

          // Actualizar UI de prima también
          if (primaLockBtn) {
            primaLockBtn.textContent = !isLocked ? '🔒' : '🔓';
            primaLockBtn.title = !isLocked ? 'Bloqueado - Click para desbloquear' : 'Desbloqueado - Click para bloquear';
          }
          if (primaInput) {
            primaInput.disabled = !isLocked;
            primaInput.style.opacity = !isLocked ? '0.7' : '1';
            primaInput.style.background = !isLocked ? '#f0f0f0' : '';
          }
          
          // Si se desbloquea, recalcular prima a valor por defecto (120 mov)
          if (isLocked && jornal.tipo_operativa === 'Contenedor') { // Si se acaba de desbloquear
              const salarioInfo = tablaSalarial.find(s => s.clave_jornada === jornal.clave_jornada);
              if (salarioInfo) {
                  const movimientosDefault = 120; // Default si se desbloquea
                  const nuevaPrima = movimientosDefault * salarioInfo.coef_prima_mayor120;
                  if(movimientosInput) movimientosInput.value = movimientosDefault;
                  if(primaInput) primaInput.value = nuevaPrima.toFixed(2);
                  
                  // Actualizar lockedValues también
                  lockedValues[lockKey].movimientos = movimientosDefault;
                  lockedValues[lockKey].prima = nuevaPrima;
                  saveLockedValues(fecha, jornada);
                  
                  // Forzar el evento input para recalcular la fila
                  movimientosInput.dispatchEvent(new Event('input'));
              }
          }

          console.log(`${!isLocked ? '🔒' : '🔓'} Movimientos y prima ${!isLocked ? 'bloqueados' : 'desbloqueados'} para ${lockKey}`);
        });
      });

      // Event listener para botones de candado de prima
      card.querySelectorAll('.prima-lock-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const row = e.target.closest('tr');
          const lockKey = row.dataset.lockKey;
          const fecha = row.dataset.fecha;
          const jornada = row.dataset.jornada;
          const primaInput = row.querySelector('.prima-input');
          const movimientosInput = row.querySelector('.movimientos-input');
          const movimientosLockBtn = row.querySelector('.movimientos-lock-btn');
          const jornal = jornalesQuincena[jornalIndex];

          // Toggle lock
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          const isLocked = lockedValues[lockKey].primaLocked || false;
          lockedValues[lockKey].primaLocked = !isLocked;
          lockedValues[lockKey].movimientosLocked = !isLocked; // Sincronizar con movimientos
          lockedValues[lockKey].prima = parseFloat(primaInput.value) || 0;
          if (movimientosInput) {
            lockedValues[lockKey].movimientos = parseFloat(movimientosInput.value) || 0;
          }
          saveLockedValues(fecha, jornada);

          // Actualizar UI de prima
          btn.textContent = !isLocked ? '🔒' : '🔓';
          btn.title = !isLocked ? 'Bloqueado - Click para desbloquear' : 'Desbloqueado - Click para bloquear';
          primaInput.disabled = !isLocked;
          primaInput.style.opacity = !isLocked ? '0.7' : '1';
          primaInput.style.background = !isLocked ? '#f0f0f0' : '';

          // Actualizar UI de movimientos también
          if (movimientosLockBtn) {
            movimientosLockBtn.textContent = !isLocked ? '🔒' : '🔓';
            movimientosLockBtn.title = !isLocked ? 'Bloqueado - Click para desbloquear' : 'Desbloqueado - Click para bloquear';
          }
          if (movimientosInput) {
            movimientosInput.disabled = !isLocked;
            movimientosInput.style.opacity = !isLocked ? '0.7' : '1';
            movimientosInput.style.background = !isLocked ? '#f0f0f0' : '';
          }

          // Si se desbloquea, y es Contenedor, recalcular movimientos y prima a valores por defecto
          if (isLocked && jornal.tipo_operativa === 'Contenedor') { // Si se acaba de desbloquear
              const salarioInfo = tablaSalarial.find(s => s.clave_jornada === jornal.clave_jornada);
              if (salarioInfo) {
                  const movimientosDefault = 120; // Default si se desbloquea
                  const nuevaPrima = movimientosDefault * salarioInfo.coef_prima_mayor120;
                  if(movimientosInput) movimientosInput.value = movimientosDefault;
                  if(primaInput) primaInput.value = nuevaPrima.toFixed(2);
                  
                  // Actualizar lockedValues también
                  lockedValues[lockKey].movimientos = movimientosDefault;
                  lockedValues[lockKey].prima = nuevaPrima;
                  saveLockedValues(fecha, jornada);
                  
                  // Forzar el evento input para recalcular la fila
                  primaInput.dispatchEvent(new Event('input'));
              }
          }

          console.log(`${!isLocked ? '🔒' : '🔓'} Prima y movimientos ${!isLocked ? 'bloqueados' : 'desbloqueados'} para ${lockKey}`);
        });
      });

      // IMPORTANTE: Calcular totales iniciales correctamente (incluyen relevo y remate)
      actualizarTotales();
    });

    // Función para actualizar IRPF y persistir en localStorage y Supabase
    const actualizarIRPF = async (e) => {
      const nuevoIRPF = parseFloat(e.target.value) || 0;

      // Validar rango (0-50%)
      if (nuevoIRPF < 0 || nuevoIRPF > 50) {
        alert('El porcentaje de IRPF debe estar entre 0% y 50%');
        e.target.value = irpfPorcentaje;
        return;
      }

      // No hacer nada si el valor no cambió
      if (nuevoIRPF === irpfPorcentaje) {
        return;
      }

      // Guardar en Supabase
      // Asumimos que SheetsAPI.saveUserConfig ahora utiliza Supabase
      const resultadoGuardado = await SheetsAPI.saveUserConfig(AppState.currentUser, nuevoIRPF); 
      if (resultadoGuardado && resultadoGuardado.success) {
        console.log('✅ IRPF guardado en Supabase correctamente:', resultadoGuardado.data);
      } else {
        console.warn('⚠️ Error guardando IRPF en Supabase:', resultadoGuardado?.message || 'desconocido');
      }

      // Guardar en localStorage
      localStorage.setItem(irpfKey, nuevoIRPF.toString());
      irpfPorcentaje = nuevoIRPF;

      console.log(`💰 IRPF actualizado y guardado: ${nuevoIRPF}%`);
      console.log(`💾 Guardado en localStorage con clave: ${irpfKey}`);

      // Actualizar todos los valores neto sin recargar la página
      // Se recalcularán con `actualizarTotales`
      actualizarTotales();
    };

    // Event listeners para cambios en IRPF
    if (irpfInput) {
      // Evento 'change' - cuando el usuario presiona Enter o cambia de campo
      irpfInput.addEventListener('change', actualizarIRPF);

      // Evento 'blur' - cuando el usuario sale del input (más robusto)
      irpfInput.addEventListener('blur', actualizarIRPF);
    }

    // Event listener para botón de candado de IRPF
    if (irpfLockBtn && irpfInput) {
      irpfLockBtn.addEventListener('click', (e) => {
        e.preventDefault();
        irpfLocked = !irpfLocked;
        localStorage.setItem(irpfLockKey, irpfLocked.toString());

        // Actualizar UI del botón
        irpfLockBtn.textContent = irpfLocked ? '🔒' : '🔓';
        irpfLockBtn.title = irpfLocked ? 'IRPF bloqueado - Click para desbloquear' : 'IRPF desbloqueado - Click para bloquear';

        // Actualizar UI del input
        irpfInput.disabled = irpfLocked;
        if (irpfLocked) {
          irpfInput.style.opacity = '0.7';
          irpfInput.style.background = '#f0f0f0';
          irpfInput.style.cursor = 'not-allowed';
        } else {
          irpfInput.style.opacity = '1';
          irpfInput.style.background = 'white';
          irpfInput.style.cursor = '';
        }

        console.log(`🔒 IRPF ${irpfLocked ? 'bloqueado' : 'desbloqueado'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error cargando Sueldómetro:', error);
    content.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Error al cargar datos</h3>
        <p>${error.message}</p>
      </div>
    `;
  } finally {
    loading.classList.add('hidden');
  }
}

/**
 * Inicializar funcionalidad de añadir jornal manual
 */
function initAddJornalManual() {
  const addBtn = document.getElementById('add-jornal-btn');
  const modal = document.getElementById('add-jornal-modal');
  const closeBtn = document.getElementById('close-jornal-modal');
  const cancelBtn = document.getElementById('cancel-jornal');
  const saveBtn = document.getElementById('save-jornal');

  const fechaInput = document.getElementById('jornal-fecha');
  const jornadaSelect = document.getElementById('jornal-jornada');
  const tipoDiaSelect = document.getElementById('jornal-tipo-dia');
  const puestoSelect = document.getElementById('jornal-puesto');
  const puestoOtroGroup = document.getElementById('jornal-puesto-otro-group');
  const puestoOtroInput = document.getElementById('jornal-puesto-otro');
  const empresaInput = document.getElementById('jornal-empresa');
  const buqueInput = document.getElementById('jornal-buque');
  const parteInput = document.getElementById('jornal-parte');

  const errorMsg = document.getElementById('jornal-error');
  const successMsg = document.getElementById('jornal-success');

  if (!addBtn || !modal) return;

  // Abrir modal
  addBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    // Limpiar formulario
    fechaInput.value = '';
    jornadaSelect.value = '';
    tipoDiaSelect.value = '';
    puestoSelect.value = '';
    puestoOtroGroup.style.display = 'none';
    puestoOtroInput.value = '';
    empresaInput.value = '';
    buqueInput.value = '';
    parteInput.value = '';
    errorMsg.textContent = '';
    errorMsg.style.display = 'none';
    successMsg.textContent = '';
    successMsg.style.display = 'none';
  });

  // Cerrar modal
  const cerrarModal = () => {
    modal.style.display = 'none';
  };

  closeBtn.addEventListener('click', cerrarModal);
  cancelBtn.addEventListener('click', cerrarModal);

  // Cerrar al hacer clic fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });

  // Mostrar/ocultar campo "Otro puesto"
  puestoSelect.addEventListener('change', () => {
    if (puestoSelect.value === 'otro') {
      puestoOtroGroup.style.display = 'block';
    } else {
      puestoOtroGroup.style.display = 'none';
    }
  });

  // Guardar jornal
  saveBtn.addEventListener('click', async () => {
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    // Validar campos obligatorios
    if (!fechaInput.value || !jornadaSelect.value || !tipoDiaSelect.value || !puestoSelect.value || !empresaInput.value) {
      errorMsg.textContent = 'Por favor, completa todos los campos obligatorios (*)';
      errorMsg.style.display = 'block';
      return;
    }

    // Obtener puesto final
    let puestoFinal = puestoSelect.value;
    if (puestoFinal === 'otro') {
      if (!puestoOtroInput.value.trim()) {
        errorMsg.textContent = 'Por favor, especifica el puesto';
        errorMsg.style.display = 'block';
        return;
      }
      puestoFinal = puestoOtroInput.value.trim();
    }

    // Formatear fecha a DD/MM/YYYY
    const fechaParts = fechaInput.value.split('-'); // YYYY-MM-DD
    const fechaFormateada = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;

    // Crear objeto jornal
    const nuevoJornal = {
      chapa: AppState.currentUser,
      fecha: fechaFormateada,
      jornada: jornadaSelect.value,
      tipo_dia: tipoDiaSelect.value, // Necesario para cálculo de salario
      puesto: puestoFinal,
      empresa: empresaInput.value, // Select, no necesita trim
      buque: buqueInput.value.trim() || '--',
      parte: parteInput.value || '1',
      manual: true // Marcar como añadido manualmente
    };

    console.log('💾 Guardando jornal manual:', nuevoJornal);

    try {
      // Guardar en localStorage
      let historico = JSON.parse(localStorage.getItem('jornales_historico') || '[]');

      // Verificar duplicados
      const existe = historico.some(j =>
        j.fecha === nuevoJornal.fecha &&
        j.jornada === nuevoJornal.jornada &&
        j.puesto === nuevoJornal.puesto
      );

      if (existe) {
        errorMsg.textContent = 'Ya existe un jornal con estos datos';
        errorMsg.style.display = 'block';
        return;
      }

      // Añadir nuevo jornal
      historico.push(nuevoJornal);

      // Ordenar por fecha (más recientes primero)
      historico.sort((a, b) => {
        const [dA, mA, yA] = a.fecha.split('/');
        const [dB, mB, yB] = b.fecha.split('/');
        const dateA = new Date(yA, mA - 1, dA);
        const dateB = new Date(yB, mB - 1, dB);
        return dateB - dateA;
      });

      // Guardar en localStorage
      localStorage.setItem('jornales_historico', JSON.stringify(historico));

      // Guardar también en Supabase para persistencia permanente
      // Asumimos que SheetsAPI.saveJornalManual ahora utiliza Supabase
      const resultadoGuardado = await SheetsAPI.saveJornalManual(
        AppState.currentUser,
        nuevoJornal.fecha,
        nuevoJornal.jornada,
        nuevoJornal.tipo_dia,
        nuevoJornal.puesto,
        nuevoJornal.empresa,
        nuevoJornal.buque,
        nuevoJornal.parte
      );

      if (resultadoGuardado && resultadoGuardado.success) {
          console.log('✅ Jornal también guardado en Supabase');
          // FORZAR limpieza del cache de jornales para este usuario para que se recargue fresco
          const cacheKeys = Object.keys(localStorage);
          cacheKeys.forEach(key => {
            if (key.startsWith(`supabase_jornales_historico_acumulado_${AppState.currentUser}`)) {
              localStorage.removeItem(key);
              console.log(`🗑️ Cache de jornales limpiado: ${key}`);
            }
          });
      } else {
        console.warn('⚠️ Error guardando en Supabase (continuando):', resultadoGuardado?.message || 'desconocido');
      }

      console.log('✅ Jornal guardado correctamente en localStorage');

      // Mostrar mensaje de éxito
      successMsg.textContent = '✅ Jornal añadido correctamente y guardado permanentemente';
      successMsg.style.display = 'block';

      // Recargar automáticamente las vistas
      setTimeout(async () => {
        // Recargar Mis Jornales si estamos en esa página
        if (document.getElementById('page-jornales').classList.contains('active')) {
          await loadJornales();
        }

        // Recargar Sueldómetro si estamos en esa página
        if (document.getElementById('page-sueldometro').classList.contains('active')) {
          await loadSueldometro();
        }

        cerrarModal();
      }, 1500);

    } catch (error) {
      console.error('❌ Error guardando jornal:', error);
      errorMsg.textContent = 'Error al guardar el jornal. Inténtalo de nuevo.';
      errorMsg.style.display = 'block';
    }
  });
}

/**
 * Inicializa el modal para reportar bugs
 */
function initReportJornal() {
  const modal = document.getElementById('report-jornal-modal');
  const closeBtn = document.getElementById('close-report-modal');
  const cancelBtn = document.getElementById('cancel-report');
  const sendBtn = document.getElementById('send-report');

  const chapaInput = document.getElementById('report-chapa');
  const tipoSelect = document.getElementById('report-tipo');
  const descripcionInput = document.getElementById('report-descripcion');

  const errorMsg = document.getElementById('report-error');
  const successMsg = document.getElementById('report-success');

  if (!modal) return;

  // Llenar chapa del usuario actual
  const fillChapa = () => {
    if (AppState.currentUser && chapaInput) {
      chapaInput.value = AppState.currentUser;
    }
  };

  // Cerrar modal
  const cerrarModal = () => {
    modal.style.display = 'none';
    // Limpiar formulario
    tipoSelect.value = '';
    descripcionInput.value = '';
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
  };

  closeBtn.addEventListener('click', cerrarModal);
  cancelBtn.addEventListener('click', cerrarModal);

  // Cerrar al hacer click fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      cerrarModal();
    }
  });

  // Cuando se abre el modal, llenar la chapa
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'style') {
        if (modal.style.display === 'flex') {
          fillChapa();
        }
      }
    });
  });

  observer.observe(modal, { attributes: true });

  // Enviar reporte
  sendBtn.addEventListener('click', async () => {
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    // Validar campos requeridos
    if (!chapaInput.value || !tipoSelect.value || !descripcionInput.value.trim()) {
      errorMsg.textContent = 'Por favor, completa todos los campos obligatorios (*)';
      errorMsg.style.display = 'block';
      return;
    }

    // Crear cuerpo del email
    const emailSubject = `🐛 Bug Report - ${tipoSelect.value} - Chapa ${chapaInput.value}`;
    const emailBody = `Reporte de Bug/Problema

📋 Información del Reporte:
--------------------------
Chapa: ${chapaInput.value}
Tipo: ${tipoSelect.value}
Fecha: ${new Date().toLocaleDateString('es-ES')}

📝 Descripción del Problema:
--------------------------
${descripcionInput.value}

--------------------------
Enviado desde Portal Estiba VLC`;

    try {
      // Crear enlace mailto
      const mailtoLink = `mailto:portalestibavlc@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      // Abrir cliente de correo
      window.location.href = mailtoLink;

      // Mostrar mensaje de éxito
      successMsg.textContent = '✅ Se ha abierto tu cliente de correo. Por favor, envía el email.';
      successMsg.style.display = 'block';

      // Cerrar modal después de 3 segundos
      setTimeout(() => {
        cerrarModal();
      }, 3000);

    } catch (error) {
      console.error('❌ Error creando email:', error);
      errorMsg.textContent = 'Error al crear el email. Inténtalo de nuevo.';
      errorMsg.style.display = 'block';
    }
  });
}

/**
 * Inicializa funcionalidades mejoradas del foro
 */
function initForoEnhanced() {
  const sendBtn = document.getElementById('foro-send');
  const foroInput = document.getElementById('foro-input');
  const charCount = document.getElementById('foro-char-count');

  if (!sendBtn || !foroInput) return;

  // Evento de enviar mensaje
  sendBtn.addEventListener('click', sendForoMessage);

  // Enviar con Ctrl+Enter o Cmd+Enter
  foroInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      sendForoMessage();
    }
  });

  // Contador de caracteres
  foroInput.addEventListener('input', () => {
    const length = foroInput.value.length;
    if (charCount) {
      charCount.textContent = `${length}/500`;

      if (length > 500) {
        charCount.classList.add('error');
        charCount.classList.remove('warning');
        sendBtn.disabled = true;
      } else if (length > 450) {
        charCount.classList.add('warning');
        charCount.classList.remove('error');
        sendBtn.disabled = false;
      } else {
        charCount.classList.remove('warning', 'error');
        sendBtn.disabled = false;
      }
    }
  });
}

/**
 * Inicializar botón de sincronización de jornales
 */
function initSyncJornalesButton() {
  const syncBtn = document.getElementById('sync-jornales-btn');

  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      // Evitar clicks múltiples
      if (syncBtn.classList.contains('syncing')) {
        return;
      }

      syncBtn.classList.add('syncing');

      try {
        console.log('🔄 Sincronización manual iniciada...');
        // Asumiendo que SheetsAPI.syncJornalesFromCSV ahora invoca la Edge Function de sincronización
        const result = await SheetsAPI.syncJornalesFromCSV();

        if (result && result.success) {
          console.log(`✅ Sincronización completada: ${result.count} jornales nuevos`);

          // Recargar la vista de jornales
          await loadJornales();

          // Mostrar notificación
          alert(`✅ Sincronización completada\n\n${result.count} jornales nuevos agregados\n${result.duplicados || 0} duplicados omitidos`);
        } else {
          console.warn('⚠️ Sincronización sin nuevos jornales');
          alert('ℹ️ No hay jornales nuevos para sincronizar');
        }
      } catch (error) {
        console.error('❌ Error en sincronización manual:', error);
        alert('❌ Error al sincronizar jornales desde CSV. Revisa la consola para más detalles.');
      } finally {
        syncBtn.classList.remove('syncing');
      }
    });
  }
}

