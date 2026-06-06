/**
 * APLICACIÓN PRINCIPAL - GESTIÓN DE EVIDENCIAS
 * Sistema completo de gestión para estudiantes, tutores y asesores pedagógicos
 */

// ============ ESTADO GLOBAL ============
const APP = {
  currentView: 'gestion-estudiantes',
  currentUser: null,
  estudiantes: [],
  evidencias: [],
  observaciones: [],
  editingEstudianteId: null,
  editingEvidenciaId: null,
  editingObservacionId: null
};

// ============ CONFIGURACIÓN API ============
// Construir URL base dinámicamente según el origen actual
const API_BASE = "http://localhost:5000/api";

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});


// ═══════════════════════════════════════════════════════════════════════
// ORDENAMIENTO DE TABLAS — clic en <th> ordena asc/desc
// ═══════════════════════════════════════════════════════════════════════
const tableSortState = {};   // { tableId: { col, dir } }

function initSortableTable(tableId, skipCols = []) {
  const table = document.getElementById(tableId);
  if (!table) return;
  table.querySelectorAll('thead th').forEach((th, idx) => {
    if (skipCols.includes(idx)) return;
    th.style.cursor = 'pointer';
    th.title = 'Clic para ordenar';
    th.addEventListener('click', () => sortTable(tableId, idx));
  });
}

function sortTable(tableId, colIdx) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const tbody = table.querySelector('tbody');
  const rows  = Array.from(tbody.querySelectorAll('tr[data-id], tr:not([colspan])'));
  if (rows.length === 0) return;

  const prev = tableSortState[tableId] || { col: -1, dir: 'asc' };
  const dir  = (prev.col === colIdx && prev.dir === 'asc') ? 'desc' : 'asc';
  tableSortState[tableId] = { col: colIdx, dir };

  // Actualizar indicadores visuales en headers
  table.querySelectorAll('thead th').forEach((th, i) => {
    th.classList.remove('sort-asc', 'sort-desc');
    if (i === colIdx) th.classList.add(dir === 'asc' ? 'sort-asc' : 'sort-desc');
  });

  rows.sort((a, b) => {
    const ta = a.cells[colIdx] ? a.cells[colIdx].textContent.trim() : '';
    const tb = b.cells[colIdx] ? b.cells[colIdx].textContent.trim() : '';
    // Detectar si es fecha (dd/mm/yyyy), número o texto
    const da = parseDate(ta), db = parseDate(tb);
    if (da && db) return dir === 'asc' ? da - db : db - da;
    const na = parseFloat(ta.replace(',', '.')), nb = parseFloat(tb.replace(',', '.'));
    if (!isNaN(na) && !isNaN(nb)) return dir === 'asc' ? na - nb : nb - na;
    return dir === 'asc' ? ta.localeCompare(tb, 'es') : tb.localeCompare(ta, 'es');
  });

  rows.forEach(r => tbody.appendChild(r));
}

function parseDate(str) {
  // Soporta dd/mm/yyyy y yyyy-mm-dd
  const m1 = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m1) return new Date(m1[3], m1[2]-1, m1[1]);
  const m2 = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m2) return new Date(m2[1], m2[2]-1, m2[3]);
  return null;
}

async function initializeApp() {
  setupEventListeners();
  setDefaultDate();
  await loadEstudiantes();
  // Ordenamiento por columna en todas las tablas (skipCols = índices sin ordenar)
  initSortableTable('tableEstudiantes',     [5]);  // skip: Acciones
  initSortableTable('tableEvidencias',      []);   // todas ordenables
  initSortableTable('tableEvidenciasTutor', []);
  initSortableTable('tableObservaciones',   []);
  showView('gestion-estudiantes');
}

// ============ NAVEGACIÓN Y VISTAS ============
function setupEventListeners() {
  // ── FIX 6: Botones cerrar de TODOS los modales ─────────────────────
  // Modal revisión tutor
  document.getElementById('btnCerrarRevision')
    ?.addEventListener('click', cerrarModalRevision);

  // Modal detalle evidencia (X y botón Cerrar)
  document.getElementById('btnCerrarDetalleEvidencia')
    ?.addEventListener('click', cerrarModalDetalleEvidencia);
  document.getElementById('btnCerrarDetalleEvidencia2')
    ?.addEventListener('click', cerrarModalDetalleEvidencia);

  // Modal observación (ya wired en setupObservacionesEvents pero por si acaso)
  document.getElementById('btnCerrarModalObs')
    ?.addEventListener('click', cerrarModalObservacion);

  // Click en backdrop cierra cualquier modal
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  // Menú lateral
  document.querySelectorAll('.menu-toggle').forEach(btn => {
    btn.addEventListener('click', handleMenuToggle);
  });

  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const view = e.target.dataset.view;
      if (view) showView(view);
    });
  });

  // Botón salir
  document.getElementById('btnSalir').addEventListener('click', showExitModal);

  // Vista 0: Gestión de Estudiantes
  setupEstudiantesEvents();

  // Vista 1: Gestión de Evidencias (Estudiante)
  setupEvidenciaEstudianteEvents();

  // Vista 2: Revisión de Evidencias (Tutor)
  setupEvidenciaTutorEvents();

  // Vista 3: Observaciones
  setupObservacionesEvents();

  // Modales globales
  setupModalEvents();
}

function handleMenuToggle(e) {
  // Usar currentTarget (el botón con el listener) en vez de target
  // para que funcione aunque el clic caiga en texto u otro hijo interno
  const btn = e.currentTarget;
  const submenuId = btn.dataset.target;
  const submenu = document.getElementById(submenuId);
  if (!submenu) return;
  const isExpanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!isExpanded));
  submenu.style.display = isExpanded ? 'none' : 'block';
}

function showView(viewName) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.style.display = 'none';
  });

  // Mostrar vista seleccionada
  const view = document.getElementById(`view-${viewName}`);
  if (!view) {
    console.warn(`showView: vista "view-${viewName}" no encontrada`);
    return;
  }

  view.style.display = 'block';
  APP.currentView = viewName;

  // Actualizar ítem activo en el menú
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewName);
  });

  // Cargar datos según vista
  if (viewName === 'gestion-estudiantes') {
    cargarTablaEstudiantes();
  } else if (viewName === 'evidencia-estudiante') {
    loadEvidenciasEstudiante();
  } else if (viewName === 'evidencia-tutor') {
    loadEvidenciasTutor();
  } else if (viewName === 'observaciones-asesor') {
    loadObservaciones();
  }
}

// ============ VISTA 1: GESTIÓN DE EVIDENCIAS (ESTUDIANTE) ============
function setupEvidenciaEstudianteEvents() {
  const formEvidencia = document.getElementById('formEvidencia');
  const selEstudiante = document.getElementById('selEstudiante');

  const btnCancelar  = document.getElementById('btnCancelar');
  const btnNueva     = document.getElementById('btnNueva');
  const btnModificar = document.getElementById('btnModificar');
  const btnEliminar  = document.getElementById('btnEliminar');

  // ── Cancelar: limpia el formulario y deselecciona fila ──────────────
  btnCancelar.addEventListener('click', () => {
    formEvidencia.reset();
    APP.editingEvidenciaId = null;
    setDefaultDate();
    limpiarArchivoSeleccionado();
    document.querySelectorAll('#tableEvidencias tr.selected')
      .forEach(r => r.classList.remove('selected'));
  });

  // ── Nueva Evidencia: igual que Cancelar + scroll al formulario ───────
  btnNueva.addEventListener('click', () => {
    formEvidencia.reset();
    APP.editingEvidenciaId = null;
    setDefaultDate();
    limpiarArchivoSeleccionado();
    document.querySelectorAll('#tableEvidencias tr.selected')
      .forEach(r => r.classList.remove('selected'));
    formEvidencia.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ── Modificar: requiere fila seleccionada en la grilla ───────────────
  btnModificar.addEventListener('click', () => {
    const selectedRow = document.querySelector('#tableEvidencias tr.selected');
    if (!selectedRow) {
      showMessage('Seleccione una evidencia en la grilla primero', 'error');
      return;
    }
    const evidenciaId = selectedRow.getAttribute('data-id');
    APP.editingEvidenciaId = evidenciaId;
    editarEvidencia(evidenciaId);
    formEvidencia.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ── Eliminar: requiere fila seleccionada en la grilla ────────────────
  btnEliminar.addEventListener('click', () => {
    const selectedRow = document.querySelector('#tableEvidencias tr.selected');
    if (!selectedRow) {
      showMessage('Seleccione una evidencia en la grilla primero', 'error');
      return;
    }
    const evidenciaId = selectedRow.getAttribute('data-id');
    if (confirm('\u00bfDesea eliminar esta evidencia?')) {
      eliminarEvidencia(evidenciaId);
    }
  });

  // ── Aceptar (submit del form) ────────────────────────────────────────
  formEvidencia.addEventListener('submit', (e) => {
    e.preventDefault();
    guardarEvidencia();
  });

  // ── Botón quitar archivo ─────────────────────────────────────────────
  const btnEliminarArchivo = document.getElementById('btnEliminarArchivo');
  if (btnEliminarArchivo) {
    btnEliminarArchivo.addEventListener('click', () => limpiarArchivoSeleccionado());
  }

  // ── Selector de archivo ──────────────────────────────────────────────
  const btnCargarArchivo = document.getElementById('btnCargarArchivo');
  const evidArchivo = document.getElementById('evidArchivo');
  if (btnCargarArchivo && evidArchivo) {
    btnCargarArchivo.addEventListener('click', () => evidArchivo.click());
    evidArchivo.addEventListener('change', handleFileSelect);
  }

  // ── Select estudiante → poblar inputs readonly + recargar grilla ─────
  selEstudiante.addEventListener('change', () => {
    APP.editingEvidenciaId = null;
    loadEvidenciasEstudiante();
  });

  // ── Selección de fila (delegación dinámica sobre tbody) ───────────────
  const tableBody = document.querySelector('#tableEvidencias tbody');
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      const row = e.target.closest('tr[data-id]');
      if (!row) return;
      document.querySelectorAll('#tableEvidencias tr.selected')
        .forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
      abrirModalDetalleEvidencia(row.dataset.id);
    });
  }
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    mostrarArchivoSeleccionado(file.name);
  } else {
    limpiarArchivoSeleccionado();
  }
}

// Muestra el nombre del archivo y activa el botón de eliminar
function mostrarArchivoSeleccionado(nombre) {
  document.getElementById('archivoNombreShow').textContent = `📎 ${nombre}`;
  const btnEliminar = document.getElementById('btnEliminarArchivo');
  if (btnEliminar) btnEliminar.style.display = 'inline-flex';
}

// Limpia la selección de archivo y oculta el botón de eliminar
function limpiarArchivoSeleccionado() {
  document.getElementById('archivoNombreShow').textContent = 'Ningún archivo seleccionado';
  const fileInput = document.getElementById('evidArchivo');
  if (fileInput) fileInput.value = '';
  const btnEliminar = document.getElementById('btnEliminarArchivo');
  if (btnEliminar) btnEliminar.style.display = 'none';
}

async function guardarEvidencia() {
  const tipo = document.getElementById('evidTipo').value;
  const nombre = document.getElementById('evidNombre').value;
  const descripcion = document.getElementById('evidDescripcion').value;
  const idEstudiante = document.getElementById('selEstudiante').value;
  const fileInput = document.getElementById('evidArchivo');

  if (!tipo || !nombre || !descripcion || !idEstudiante) {
    showMessage('Por favor complete todos los campos requeridos', 'error');
    return;
  }

  try {
    // El backend usa express.json(), así que enviamos JSON (no FormData).
    // El archivo se almacena solo como metadata (nombre/tipo/tamaño);
    // para subida real de binarios se necesitaría multer en el servidor.
    const payload = {
      nombre,
      tipo,
      descripcion,
      estudiante: idEstudiante,
    };

    if (fileInput.files[0]) {
      const f = fileInput.files[0];
      payload.archivo = {
        nombre: f.name,
        tipo: f.type,
        tamaño: f.size,
        url: ''   // placeholder; reemplazar con URL real si se integra multer
      };
    }

    let url = `${API_BASE}/evidencias`;
    let method = 'POST';

    if (APP.editingEvidenciaId) {
      url = `${url}/${APP.editingEvidenciaId}`;
      method = 'PUT';
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Error al guardar');

    showMessage('Evidencia guardada exitosamente', 'success');
    document.getElementById('formEvidencia').reset();
    APP.editingEvidenciaId = null;
    setDefaultDate();
    limpiarArchivoSeleccionado();
    document.querySelectorAll('#tableEvidencias tr.selected').forEach(r => r.classList.remove('selected'));
    loadEvidenciasEstudiante();
  } catch (error) {
    console.error(error);
    showMessage('Error al guardar la evidencia', 'error');
  }
}

async function loadEvidenciasEstudiante() {
  const idEstudiante = document.getElementById('selEstudiante').value;
  const tbody = document.querySelector('#tableEvidencias tbody');

  try {
    const url = idEstudiante
      ? `${API_BASE}/evidencias?estudiante=${idEstudiante}`
      : `${API_BASE}/evidencias`;
    const response = await fetch(url);
    const evidencias = await response.json();

    if (!Array.isArray(evidencias) || evidencias.length === 0) {
      tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;color:var(--muted);">No hay evidencias registradas</td></tr>';
      return;
    }

    tbody.innerHTML = evidencias.map(ev => {
      const idEvid = ev._id || '';
      const idCorto = idEvid.length > 8 ? idEvid.slice(-8) : idEvid; // muestra solo últimos 8 chars
      return `
        <tr data-id="${ev._id}">
          <td>${escapeHtml((ev.estudiante && ev.estudiante.codigo) || '')}</td>
          <td title="${escapeHtml((ev.estudiante && ev.estudiante.nombre) || '')}">${escapeHtml((ev.estudiante && ev.estudiante.nombre) || '')}</td>
          <td class="cell-id" title="${escapeHtml(idEvid)}">…${escapeHtml(idCorto)}</td>
          <td title="${escapeHtml(ev.nombre)}">${escapeHtml(ev.nombre)}</td>
          <td>${formatDate(ev.fechaCarga)}</td>
          <td title="${escapeHtml(ev.descripcion || '')}">${escapeHtml(ev.descripcion || '')}</td>
          <td title="${ev.archivo ? escapeHtml(ev.archivo.nombre || ev.archivo.url || '') : ''}">${ev.archivo ? escapeHtml(ev.archivo.nombre || ev.archivo.url || '') : '-'}</td>
          <td><span class="badge">${escapeHtml(ev.estado || 'Sin revisar')}</span></td>
          <td>${ev.calificacion != null ? ev.calificacion : '-'}</td>
          <td title="${escapeHtml(ev.profesor || '')}">${escapeHtml(ev.profesor || '-')}</td>
          <td>${ev.fechaCalificacion ? formatDate(ev.fechaCalificacion) : '-'}</td>
        </tr>`;
    }).join('');

  } catch (error) {
    console.error(error);
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;color:var(--muted);">Error al cargar evidencias</td></tr>';
  }  
}


async function abrirModalDetalleEvidencia(id) {
  try {
    const r = await fetch(`${API_BASE}/evidencias/${id}`);
    const ev = await r.json();
    document.getElementById('detEvidId').textContent      = ev._id || '-';
    document.getElementById('detEstId').textContent       = (ev.estudiante && ev.estudiante.codigo) || '-';
    document.getElementById('detEstNombre').textContent   = (ev.estudiante && ev.estudiante.nombre) || '-';
    document.getElementById('detTipo').textContent        = ev.tipo || '-';
    document.getElementById('detNombre').textContent      = ev.nombre || '-';
    document.getElementById('detFecha').textContent       = formatDate(ev.fechaCarga);
    document.getElementById('detDescripcion').textContent = ev.descripcion || '-';
    document.getElementById('detPath').textContent        = ev.archivo ? (ev.archivo.nombre || ev.archivo.url || '-') : '-';
    document.getElementById('detEstado').textContent      = ev.estado || 'Sin revisar';
    document.getElementById('detCalif').textContent       = ev.calificacion != null ? ev.calificacion : '-';
    document.getElementById('detProfesor').textContent    = ev.profesor || '-';
    document.getElementById('detFechaCalif').textContent  = ev.fechaCalificacion ? formatDate(ev.fechaCalificacion) : '-';
    const modal = document.getElementById('modalDetalleEvidencia');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  } catch (err) {
    showMessage('Error al cargar detalle', 'error');
  }
}

function cerrarModalDetalleEvidencia() {
  const modal = document.getElementById('modalDetalleEvidencia');
  if (modal) { modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true'); }
}

async function editarEvidencia(id) {
  try {
    const response = await fetch(`${API_BASE}/evidencias/${id}`);
    const ev = await response.json();

    document.getElementById('evidTipo').value = ev.tipo;
    document.getElementById('evidNombre').value = ev.nombre;
    document.getElementById('evidDescripcion').value = ev.descripcion;

    if (ev.archivo && ev.archivo.nombre) {
      mostrarArchivoSeleccionado(ev.archivo.nombre);
    } else {
      limpiarArchivoSeleccionado();
    }

    APP.editingEvidenciaId = id;

    // Scroll al inicio de la vista (no solo al form-section)
    const vista = document.getElementById('view-evidencia-estudiante');
    if (vista) {
      vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const contenedor = vista.closest('.panel-content') || vista.parentElement;
      if (contenedor) contenedor.scrollTop = 0;
    }
  } catch (error) {
    showMessage('Error al cargar evidencia', 'error');
  }
}

async function confirmarEliminarEvidencia(id) {
  if (confirm('¿Desea eliminar esta evidencia?')) {
    await eliminarEvidencia(id);
  }
}

async function eliminarEvidencia(id) {
  try {
    const response = await fetch(`${API_BASE}/evidencias/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Error al eliminar');

    showMessage('Evidencia eliminada exitosamente', 'success');
    document.querySelectorAll('#tableEvidencias tr.selected').forEach(r => r.classList.remove('selected'));
    loadEvidenciasEstudiante();
  } catch (error) {
    showMessage('Error al eliminar', 'error');
  }
}

// ============ VISTA 2: REVISIÓN DE EVIDENCIAS (TUTOR) ============
function setupEvidenciaTutorEvents() {
  const filterEstudiante = document.getElementById('filterEstudiante');
  const modalRevision    = document.getElementById('modalRevision');
  const btnCancelarRevision = document.getElementById('btnCancelarRevision');
  const formRevision     = document.getElementById('formRevision');

  if (!filterEstudiante) return;

  filterEstudiante.addEventListener('change', loadEvidenciasTutor);

  // Campo calificación — permitir dígitos, punto Y coma (teclado numérico)
  // Se usa keydown para interceptar la tecla ANTES de que el browser la procese
  const inputCalif = document.getElementById('revCalificacion');
  if (inputCalif) {
    inputCalif.addEventListener('keydown', (e) => {
      // Permitir: dígitos, punto, coma, Backspace, Delete, Tab, flechas, Home, End
      const allowed = [
        'Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End',
        '0','1','2','3','4','5','6','7','8','9',
        '.', ',',
        'Numpad0','Numpad1','Numpad2','Numpad3','Numpad4',
        'Numpad5','Numpad6','Numpad7','Numpad8','Numpad9',
        'NumpadDecimal'   // punto del teclado numérico
      ];
      const isAllowed = allowed.includes(e.key) || allowed.includes(e.code);
      if (!isAllowed) { e.preventDefault(); return; }

      // NumpadDecimal → insertar punto en la posición del cursor
      if (e.code === 'NumpadDecimal') {
        e.preventDefault();
        const pos = inputCalif.selectionStart;
        const val = inputCalif.value;
        // Solo permitir un separador decimal
        if (val.includes('.') || val.includes(',')) return;
        inputCalif.value = val.slice(0, pos) + '.' + val.slice(inputCalif.selectionEnd);
        inputCalif.setSelectionRange(pos + 1, pos + 1);
      }
    });
  }

  // Clic en fila → abrir modal de revisión
  document.addEventListener('click', (e) => {
    const row = e.target.closest('#tableEvidenciasTutor tr.clickable-row');
    if (!row) return;
    // Deseleccionar filas previas
    document.querySelectorAll('#tableEvidenciasTutor tr.clickable-row')
      .forEach(r => r.classList.remove('row-selected'));
    row.classList.add('row-selected');
    abrirModalRevision(row.dataset.id);
  });

  // Botón Revisar dentro del modal → abre/descarga el archivo
  const btnRevisarEvidencia = document.getElementById('btnRevisarEvidencia');
  if (btnRevisarEvidencia) {
    btnRevisarEvidencia.addEventListener('click', () => {
      const url = btnRevisarEvidencia.dataset.url;
      if (url) {
        window.open(url, '_blank');
      } else {
        showMessage('Esta evidencia no tiene archivo adjunto', 'info');
      }
    });
  }

  if (btnCancelarRevision) {
    btnCancelarRevision.addEventListener('click', cerrarModalRevision);
  }

  if (formRevision) {
    formRevision.addEventListener('submit', guardarRevision);
  }

  if (modalRevision) {
    modalRevision.addEventListener('click', (e) => {
      if (e.target === modalRevision) cerrarModalRevision();
    });
  }
}

async function loadEvidenciasTutor() {
  const filterEstudiante = document.getElementById('filterEstudiante').value;
  const tbody = document.querySelector('#tableEvidenciasTutor tbody');

  if (!tbody) return;

  try {
    let url = `${API_BASE}/evidencias`;
    if (filterEstudiante) {
      url += `?estudiante=${filterEstudiante}`;
    }

    const response = await fetch(url);
    const evidencias = await response.json();

    if (!Array.isArray(evidencias) || evidencias.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);">No hay evidencias para revisar</td></tr>';
      return;
    }

    tbody.innerHTML = evidencias.map(ev => `
      <tr class="clickable-row" data-id="${ev._id}" style="cursor:pointer;" title="Haga clic para revisar">
        <td>${escapeHtml((ev.estudiante && ev.estudiante.codigo) || '')}</td>
        <td>${escapeHtml((ev.estudiante && ev.estudiante.nombre) || '')}</td>
        <td title="${ev.archivo ? escapeHtml(ev.archivo.nombre || ev.archivo.url || '') : ''}">${ev.archivo ? escapeHtml(ev.archivo.nombre || ev.archivo.url || '-') : '-'}</td>
        <td>${ev.calificacion != null ? ev.calificacion : '-'}</td>
        <td><span class="badge">${escapeHtml(ev.estado || 'Sin revisar')}</span></td>
        <td title="${escapeHtml(ev.observacionTutor || '')}">${ev.observacionTutor ? escapeHtml(ev.observacionTutor.substring(0,30)) + (ev.observacionTutor.length > 30 ? '…' : '') : '-'}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error(error);
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);">Error al cargar</td></tr>';
  }
}

async function abrirModalRevision(id) {
  try {
    const response = await fetch(`${API_BASE}/evidencias/${id}`);
    const ev = await response.json();

    document.getElementById('revIdEstudiante').value = (ev.estudiante && ev.estudiante.codigo) || '';
    document.getElementById('revNombreEstudiante').value = (ev.estudiante && ev.estudiante.nombre) || '';
    const archivoNombre = ev.archivo ? (ev.archivo.nombre || ev.archivo.url || '-') : '-';
    document.getElementById('revArchivo').value = archivoNombre;
    const btnRev = document.getElementById('btnRevisarEvidencia');
    if (btnRev) btnRev.dataset.url = (ev.archivo && ev.archivo.url) ? ev.archivo.url : '';
    document.getElementById('revEstado').value = ev.estado || '';
    document.getElementById('revCalificacion').value = ev.calificacion != null ? ev.calificacion : '';
    const revProfEl = document.getElementById('revProfesor');
    if (revProfEl) revProfEl.value = ev.profesor || '';

    document.getElementById('formRevision').dataset.evidenciaId = id;

    document.getElementById('modalRevision').classList.add('active');
  } catch (error) {
    showMessage('Error al cargar la evidencia', 'error');
  }
}

function cerrarModalRevision() {
  const modalRevision = document.getElementById('modalRevision');
  if (modalRevision) {
    modalRevision.classList.remove('active');
  }
  const formRevision = document.getElementById('formRevision');
  if (formRevision) {
    formRevision.reset();
  }
}

async function guardarRevision(e) {
  e.preventDefault();

  const id           = document.getElementById('formRevision').dataset.evidenciaId;
  const estado       = document.getElementById('revEstado').value;
  const calificacion = document.getElementById('revCalificacion').value;
  const profesorEl   = document.getElementById('revProfesor');
  const profesor     = profesorEl ? profesorEl.value.trim() : '';

  if (!estado) {
    showMessage('Seleccione el estado de la revisión', 'error'); return;
  }
  if (!calificacion) {
    showMessage('Ingrese la calificación', 'error'); return;
  }
  if (!profesor) {
    showMessage('Ingrese el nombre del profesor que realiza la revisión', 'error'); return;
  }

  try {
    const response = await fetch(`${API_BASE}/evidencias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado,
        calificacion: parseFloat(calificacion.replace(',', '.')),
        profesor,
        fechaCalificacion: new Date().toISOString()
      })
    });

    if (!response.ok) throw new Error('Error al guardar');

    showMessage('Revisión guardada exitosamente', 'success');
    cerrarModalRevision();
    loadEvidenciasTutor();
  } catch (error) {
    showMessage('Error al guardar la revisión', 'error');
  }
}

// ============ VISTA 3: OBSERVACIONES (ASESOR) ============
function setupObservacionesEvents() {
  // ── Selector de estudiante → cargar sus observaciones ────────────────────
  const obsSelEst = document.getElementById('obsSelEstudiante');
  if (obsSelEst) {
    obsSelEst.addEventListener('change', () => {
      const est = APP.estudiantes.find(e => e._id === obsSelEst.value);
      if (est) {
        document.getElementById('obsIdEstudiante').value = est.codigo || '';
        document.getElementById('obsNombreEstudiante').value = est.nombre || '';
        APP._obsEstudianteId = est._id;
      } else {
        document.getElementById('obsIdEstudiante').value = '';
        document.getElementById('obsNombreEstudiante').value = '';
        APP._obsEstudianteId = null;
      }
      loadObservaciones();
    });
  }

  // ── Clic en fila de la tabla → abrir modal de edición ────────────────────
  document.addEventListener('click', (e) => {
    const row = e.target.closest('#tableObservaciones tr[data-id]');
    if (!row) return;
    document.querySelectorAll('#tableObservaciones tr').forEach(r => r.classList.remove('row-selected'));
    row.classList.add('row-selected');
    abrirModalObservacion(row.dataset.id);
  });

  // ── Botón Cancelar sección nueva observación ──────────────────────────────
  const btnCancelarObs = document.getElementById('btnCancelarObs');
  if (btnCancelarObs) {
    btnCancelarObs.addEventListener('click', () => {
      document.getElementById('obsObservacionNueva').value = '';
      APP.editingObservacionId = null;
    });
  }

  // ── Botón Aceptar sección nueva observación ───────────────────────────────
  const btnGuardarObs = document.getElementById('btnGuardarObs');
  if (btnGuardarObs) {
    btnGuardarObs.addEventListener('click', guardarObservacion);
  }

  // ── Modal observación: Cancelar y X ──────────────────────────────────────
  const btnCancelarModal = document.getElementById('btnCancelarModalObs');
  const btnCerrarModal   = document.getElementById('btnCerrarModalObs');
  const btnEliminarObs   = document.getElementById('btnEliminarObs');
  const btnAceptarModal  = document.getElementById('btnAceptarModalObs');
  const modalObs         = document.getElementById('modalObservacion');

  if (btnCancelarModal) btnCancelarModal.addEventListener('click', cerrarModalObservacion);
  if (btnCerrarModal)   btnCerrarModal.addEventListener('click', cerrarModalObservacion);
  if (modalObs) {
    modalObs.addEventListener('click', (e) => {
      if (e.target === modalObs) cerrarModalObservacion();
    });
  }

  if (btnEliminarObs) {
    btnEliminarObs.addEventListener('click', () => {
      if (APP._editingObsModalId && confirm('¿Eliminar esta observación?')) {
        eliminarObservacionModal(APP._editingObsModalId);
      }
    });
  }

  if (btnAceptarModal) {
    btnAceptarModal.addEventListener('click', guardarObservacionModal);
  }
}

async function abrirModalObservacion(id) {
  try {
    const response = await fetch(`${API_BASE}/observaciones/${id}`);
    const obs = await response.json();
    const est = obs.estudiante;
    document.getElementById('modalObsIdEstudiante').value   = (est && est.codigo) || '';
    document.getElementById('modalObsNombreEstudiante').value = (est && est.nombre) || '';
    document.getElementById('modalObsTexto').value          = obs.comentario || '';
    APP._editingObsModalId = id;
    document.getElementById('modalObservacion').classList.add('active');
    document.getElementById('modalObservacion').setAttribute('aria-hidden', 'false');
  } catch (err) {
    showMessage('Error al cargar observación', 'error');
  }
}

function cerrarModalObservacion() {
  const modal = document.getElementById('modalObservacion');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.getElementById('modalObsTexto').value = '';
  APP._editingObsModalId = null;
}

async function guardarObservacionModal() {
  const id      = APP._editingObsModalId;
  const texto   = document.getElementById('modalObsTexto').value.trim();
  if (!texto) { showMessage('Escriba una observación', 'error'); return; }
  try {
    const response = await fetch(`${API_BASE}/observaciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comentario: texto })
    });
    if (!response.ok) throw new Error();
    showMessage('Observación actualizada', 'success');
    cerrarModalObservacion();
    loadObservaciones();
  } catch { showMessage('Error al guardar', 'error'); }
}

async function eliminarObservacionModal(id) {
  try {
    const response = await fetch(`${API_BASE}/observaciones/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error();
    showMessage('Observación eliminada', 'success');
    cerrarModalObservacion();
    loadObservaciones();
  } catch { showMessage('Error al eliminar', 'error'); }
}

async function guardarObservacion() {
  const idEstudiante = APP._obsEstudianteId || '';
  const observacion  = (document.getElementById('obsObservacionNueva') || {}).value || '';

  if (!idEstudiante) {
    showMessage('Seleccione un estudiante primero', 'error'); return;
  }
  if (!observacion.trim()) {
    showMessage('Escriba una observación', 'error'); return;
  }

  try {
    const response = await fetch(`${API_BASE}/observaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estudiante: idEstudiante, comentario: observacion.trim() })
    });
    if (!response.ok) throw new Error();
    showMessage('Observación registrada', 'success');
    document.getElementById('obsObservacionNueva').value = '';
    loadObservaciones();
  } catch { showMessage('Error al guardar', 'error'); }
}

// editarObservacion reemplazado por abrirModalObservacion

async function loadObservaciones() {
  const tbody = document.querySelector('#tableObservaciones tbody');
  if (!tbody) return;

  const estId = APP._obsEstudianteId;
  if (!estId) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--muted);">Seleccione un estudiante para ver sus observaciones</td></tr>';
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/observaciones?estudiante=${estId}`);
    const observaciones = await response.json();

    if (!Array.isArray(observaciones) || observaciones.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--muted);">No hay observaciones para este estudiante</td></tr>';
      return;
    }

    tbody.innerHTML = observaciones.map(obs => `
      <tr class="clickable-row" data-id="${obs._id}" style="cursor:pointer;" title="Clic para editar">
        <td>${escapeHtml((obs.estudiante && obs.estudiante.codigo) || '')}</td>
        <td>${escapeHtml((obs.estudiante && obs.estudiante.nombre) || '')}</td>
        <td title="${escapeHtml(obs.comentario || '')}">${escapeHtml(obs.comentario || '')}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error(error);
    if (tbody) tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--muted);">Error al cargar</td></tr>';
  }
}

// confirmarEliminarObservacion reemplazado por eliminarObservacionModal

// ============ FUNCIONES AUXILIARES ============
async function loadEstudiantes() {
  try {
    const response = await fetch(`${API_BASE}/estudiantes`);
    const estudiantes = await response.json();

    if (!Array.isArray(estudiantes)) return;

    APP.estudiantes = estudiantes;

    const selEstudiante = document.getElementById('selEstudiante');
    const filterEstudiante = document.getElementById('filterEstudiante');

    const obsSelEstudiante = document.getElementById('obsSelEstudiante');
    [selEstudiante, filterEstudiante, obsSelEstudiante].forEach(select => {
      if (select) {
        const options = estudiantes.map(e => 
          `<option value="${e._id || e.id}">${e.codigo ? e.codigo + ' — ' : ''}${e.nombre || e.nombreEstudiante}</option>`
        ).join('');
        select.innerHTML = '<option value="">-- Seleccione --</option>' + options;
      }
    });
  } catch (error) {
    console.error('Error cargando estudiantes:', error);
  }
}

function setDefaultDate() {
  const today = new Date().toISOString().split('T')[0];
  const evidFecha = document.getElementById('evidFecha');
  if (evidFecha) evidFecha.value = today;
}

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-ES');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showMessage(text, type = 'info') {
  const toast = document.getElementById('messageBox');
  if (!toast) return;
  
  toast.textContent = text;
  toast.classList.add('show', type);
  
  setTimeout(() => {
    toast.classList.remove('show', type);
  }, 3000);
}

// ============ MODALES GLOBALES ============
function setupModalEvents() {
  const modalSalir = document.getElementById('modalSalir');
  const salirYes = document.getElementById('salirYes');
  const salirNo = document.getElementById('salirNo');

  if (!salirYes || !salirNo) return;

  salirYes.addEventListener('click', () => {
    window.location.href = 'https://www.google.com';
  });

  salirNo.addEventListener('click', () => {
    if (modalSalir) modalSalir.classList.remove('active');
  });

  if (modalSalir) {
    modalSalir.addEventListener('click', (e) => {
      if (e.target === modalSalir) {
        modalSalir.classList.remove('active');
      }
    });
  }
}

function showExitModal() {
  const modalSalir = document.getElementById('modalSalir');
  if (modalSalir) {
    modalSalir.classList.add('active');
  }
}

// ============ GESTIÓN DE ESTUDIANTES ============
function setupEstudiantesEvents() {
  const formEstudiante = document.getElementById('formEstudiante');
  const btnGuardar = document.getElementById('btnGuardarEstudiante');
  const btnLimpiar = document.getElementById('btnLimpiarEstudiante');

  if (!formEstudiante) return;

  // Envío de formulario
  btnGuardar.addEventListener('click', (e) => {
    e.preventDefault();
    guardarEstudiante();
  });

  // Limpiar formulario
  btnLimpiar.addEventListener('click', () => {
    formEstudiante.reset();
    document.getElementById('estCodigo').value = '';
    APP.editingEstudianteId = null;
    document.getElementById('btnGuardarEstudiante').textContent = 'Guardar Estudiante';
  });

  // Código automático al elegir programa
  const estPrograma = document.getElementById('estPrograma');
  if (estPrograma) {
    estPrograma.addEventListener('change', generarCodigoEstudiante);
  }

  // Eventos de tabla (Edit/Delete)
  // ── Handler global unificado de botones de acción ──────────────────────────
  // Un solo listener en document evita doble disparo cuando se navega entre vistas
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;

    // Estudiantes
    if (action === 'edit-estudiante')   { editarEstudiante(id); return; }
    if (action === 'delete-estudiante') { confirmarEliminarEstudiante(id); return; }

    // Evidencias (vista estudiante)
    if (action === 'edit-evidencia')    { editarEvidencia(id); return; }
    if (action === 'delete-evidencia')  { confirmarEliminarEvidencia(id); return; }

    // Revisión tutor
    if (action === 'review-evidencia')  { abrirModalRevision(id); return; }

    // Observaciones
    // observaciones gestionadas via modal (clic en fila)
  });
}

async function cargarTablaEstudiantes() {
  try {
    const response = await fetch(`${API_BASE}/estudiantes`);
    const estudiantes = await response.json();

    if (!Array.isArray(estudiantes)) return;

    APP.estudiantes = estudiantes;

    const tbody = document.querySelector('#tableEstudiantes tbody');
    if (!tbody) return;

    if (estudiantes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);">No hay estudiantes registrados</td></tr>';
      return;
    }

    tbody.innerHTML = estudiantes.map(est => `
      <tr>
        <td>${escapeHtml(est.codigo || '')}</td>
        <td>${escapeHtml(est.nombre)}</td>
        <td>${escapeHtml(est.correo)}</td>
        <td>${escapeHtml(est.programa)}</td>
        <td>${est.semestre}</td>
        <td>
          <button data-action="edit-estudiante" data-id="${est._id}" class="btn-small">Editar</button>
          <button data-action="delete-estudiante" data-id="${est._id}" class="btn-small">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error cargando estudiantes:', error);
    showMessage('Error al cargar estudiantes', 'error');
  }
}

const PROGRAMA_PREFIJOS = {
  'IS': 'IS', 'AE': 'AE', 'CO': 'CO', 'OT': 'OT'
};

function generarCodigoEstudiante() {
  const programa = document.getElementById('estPrograma').value;
  const codigoInput = document.getElementById('estCodigo');
  if (!programa || !codigoInput) return;
  if (APP.editingEstudianteId) return; // en edición no regenerar

  const prefijo = PROGRAMA_PREFIJOS[programa] || programa.slice(0, 2).toUpperCase();

  // Contar estudiantes del mismo programa en la lista ya cargada (sin fetch)
  const mismo = (APP.estudiantes || []).filter(e => {
    const p = e.programa === 'Ingeniería de Sistemas'    ? 'IS'
            : e.programa === 'Administración de Empresas' ? 'AE'
            : e.programa === 'Contabilidad'               ? 'CO'
            : e.programa === 'Otros'                      ? 'OT'
            : e.programa; // si ya viene como sigla
    return p === prefijo;
  });

  const num = String(mismo.length + 1).padStart(3, '0');
  codigoInput.value = `${prefijo}-${num}`;
}

async function guardarEstudiante() {
  try {
    const codigo  = document.getElementById('estCodigo').value.trim();
    const nombre  = document.getElementById('estNombre').value.trim();
    const correo  = document.getElementById('estCorreo').value.trim();
    const programa = document.getElementById('estPrograma').value.trim();
    const semestre = document.getElementById('estSemestre').value.trim();

    if (!programa) { showMessage('Seleccione un programa primero', 'error'); return; }
    if (!codigo)   { showMessage('El código no se generó — seleccione el programa', 'error'); return; }
    if (!nombre)   { showMessage('Ingrese el nombre del estudiante', 'error'); return; }
    if (!correo)   { showMessage('Ingrese el correo del estudiante', 'error'); return; }
    if (!semestre) { showMessage('Ingrese el semestre', 'error'); return; }

    let url = `${API_BASE}/estudiantes`;
    let method = 'POST';

    if (APP.editingEstudianteId) {
      url = `${url}/${APP.editingEstudianteId}`;
      method = 'PUT';
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo,
        nombre,
        correo,
        programa: { IS:'Ingeniería de Sistemas', AE:'Administración de Empresas',
                    CO:'Contabilidad', OT:'Otros' }[programa] || programa,
        semestre: parseInt(semestre)
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al guardar');
    }

    const accion = APP.editingEstudianteId ? 'actualizado' : 'creado';
    showMessage(`Estudiante ${accion} exitosamente`, 'success');

    // Limpiar y recargar
    document.getElementById('formEstudiante').reset();
    document.getElementById('estCodigo').value = '';
    APP.editingEstudianteId = null;
    document.getElementById('btnGuardarEstudiante').textContent = 'Guardar Estudiante';

    await cargarTablaEstudiantes();
    await loadEstudiantes();
  } catch (error) {
    console.error(error);
    showMessage(error.message || 'Error al guardar estudiante', 'error');
  }
}

async function editarEstudiante(id) {
  try {
    const response = await fetch(`${API_BASE}/estudiantes/${id}`);
    const est = await response.json();

    document.getElementById('estCodigo').value = est.codigo;
    document.getElementById('estNombre').value = est.nombre;
    document.getElementById('estCorreo').value = est.correo;
    const progMap = {
      'Ingeniería de Sistemas': 'IS',
      'Administración de Empresas': 'AE',
      'Contabilidad': 'CO',
      'Otros': 'OT'
    };
    document.getElementById('estPrograma').value = progMap[est.programa] || est.programa;
    document.getElementById('estSemestre').value = est.semestre;

    APP.editingEstudianteId = id;
    document.getElementById('btnGuardarEstudiante').textContent = 'Actualizar Estudiante';

    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error(error);
    showMessage('Error al cargar estudiante', 'error');
  }
}

function confirmarEliminarEstudiante(id) {
  if (confirm('¿Desea eliminar este estudiante?\n\nNota: Se eliminarán todas sus evidencias y observaciones asociadas.')) {
    eliminarEstudiante(id);
  }
}

async function eliminarEstudiante(id) {
  try {
    const response = await fetch(`${API_BASE}/estudiantes/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Error al eliminar');

    showMessage('Estudiante eliminado exitosamente', 'success');
    await cargarTablaEstudiantes();
    await loadEstudiantes();
  } catch (error) {
    console.error(error);
    showMessage('Error al eliminar estudiante', 'error');
  }
}

function validarEstudiante({ codigo, nombre, correo, programa, semestre }) {
  if (!codigo) return 'El código es obligatorio';
  if (!nombre) return 'El nombre es obligatorio';
  if (nombre.length < 3) return 'El nombre debe tener al menos 3 caracteres';
  if (!correo) return 'El correo es obligatorio';

  // Validar formato email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) return 'El correo no tiene un formato válido';

  if (!programa) return 'El programa es obligatorio';
  if (!semestre) return 'El semestre es obligatorio';

  const semestreNum = parseInt(semestre);
  if (isNaN(semestreNum) || semestreNum < 1 || semestreNum > 12) {
    return 'El semestre debe ser un número entre 1 y 12';
  }

  return null; // Sin errores
}

// ============ UTILIDADES DE INTERFAZ ============
window.addEventListener('beforeunload', (e) => {
  if (APP.editingEstudianteId || APP.editingEvidenciaId || APP.editingObservacionId) {
    e.preventDefault();
    e.returnValue = '';
  }
});