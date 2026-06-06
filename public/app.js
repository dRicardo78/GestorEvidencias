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

async function initializeApp() {
  setupEventListeners();
  setDefaultDate();
  // Esperar a que los selects de estudiantes estén llenos antes de mostrar la vista
  await loadEstudiantes();
  showView('gestion-estudiantes');
}

// ============ NAVEGACIÓN Y VISTAS ============
function setupEventListeners() {
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

  const btnCancelar = document.getElementById('btnCancelar');
  const btnNueva = document.getElementById('btnNueva');
  const btnModificar = document.getElementById('btnModificar');
  const btnEliminar = document.getElementById('btnEliminar');
  const btnAceptar = document.getElementById('btnAceptar');

  // Cancelar
  btnCancelar.addEventListener('click', () => {
    formEvidencia.reset();
    APP.editingEvidenciaId = null;
    setDefaultDate();
    limpiarArchivoSeleccionado();
  });

  // Nueva Evidencia
  btnNueva.addEventListener('click', () => {
    formEvidencia.reset();
    APP.editingEvidenciaId = null;
    setDefaultDate();
    limpiarArchivoSeleccionado();
    // Llevar al inicio del formulario
    formEvidencia.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  

  // Modificar
  btnModificar.addEventListener('click', () => {
    const selectedRow = document.querySelector('#tableEvidencias tr.selected');
    if (selectedRow) {
      const evidenciaId = selectedRow.getAttribute('data-id');
      APP.editingEvidenciaId = evidenciaId;
      cargarEvidenciaParaEdicion(evidenciaId);
      formEvidencia.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      Utils.showError("Seleccione una evidencia en la grilla primero");
    }
  });
  

  // Eliminar
  btnEliminar.addEventListener('click', () => {
    const selectedRow = document.querySelector('#tableEvidencias tr.selected');
    if (selectedRow) {
      const evidenciaId = selectedRow.getAttribute('data-id');
      eliminarEvidencia(evidenciaId);
    } else {
      Utils.showError("Seleccione una evidencia en la grilla primero");
    }
  });
  

  // Aceptar (submit)
  formEvidencia.addEventListener('submit', (e) => {
    e.preventDefault();
    guardarEvidencia();
  });

  // Botón para quitar archivo seleccionado
  const btnEliminarArchivo = document.getElementById('btnEliminarArchivo');
  if (btnEliminarArchivo) {
    btnEliminarArchivo.addEventListener('click', () => limpiarArchivoSeleccionado());
  }

  // Select estudiante → cargar evidencias y rellenar inputs readonly
  selEstudiante.addEventListener('change', loadEvidenciasEstudiante);
  selEstudiante.addEventListener('change', () => {
    const opt = selEstudiante.selectedOptions[0];
    document.getElementById('evidenciaIdEstudiante').value = opt ? opt.value : '';
    document.getElementById('evidenciaNombreEstudiante').value = opt ? opt.text : '';
  });

  document.querySelectorAll('#tableEvidencias tbody tr').forEach(row => {
    row.addEventListener('click', () => {
      document.querySelectorAll('#tableEvidencias tbody tr').forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
    });
  });
  
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
    loadEvidenciasEstudiante();
  } catch (error) {
    console.error(error);
    showMessage('Error al guardar la evidencia', 'error');
  }
}

async function loadEvidenciasEstudiante() {
  const idEstudiante = document.getElementById('selEstudiante').value;
  const tbody = document.querySelector('#tableEvidencias tbody');

  if (!idEstudiante) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);">Seleccione un estudiante</td></tr>';
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/evidencias?estudiante=${idEstudiante}`);
    const evidencias = await response.json();

    if (!Array.isArray(evidencias) || evidencias.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);">No hay evidencias registradas</td></tr>';
      return;
    }

    tbody.innerHTML = evidencias.map(ev => `
        <tr data-id="${ev._id}">
        <td>${escapeHtml(ev._id || '')}</td>
        <td>${escapeHtml(ev.nombre)}</td>
        <td>${escapeHtml(ev.tipo)}</td>
        <td>${formatDate(ev.fechaCarga)}</td>
        <td>${escapeHtml(ev.descripcion || '')}</td>
        <td>${ev.archivo ? `<a href="${ev.archivo.url}" target="_blank">📥 Descargar</a>` : '-'}</td>
        <td>
          <button data-action="edit-evidencia" data-id="${ev._id}" class="btn-small">Editar</button>
          <button data-action="delete-evidencia" data-id="${ev._id}" class="btn-small">Eliminar</button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error(error);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);">Error al cargar evidencias</td></tr>';
  }  
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
    loadEvidenciasEstudiante();
  } catch (error) {
    showMessage('Error al eliminar', 'error');
  }
}

// ============ VISTA 2: REVISIÓN DE EVIDENCIAS (TUTOR) ============
function setupEvidenciaTutorEvents() {
  const filterEstudiante = document.getElementById('filterEstudiante');
  const modalRevision = document.getElementById('modalRevision');
  const btnCancelarRevision = document.getElementById('btnCancelarRevision');
  const formRevision = document.getElementById('formRevision');

  if (!filterEstudiante) return;

  filterEstudiante.addEventListener('change', loadEvidenciasTutor);



  if (btnCancelarRevision) {
    btnCancelarRevision.addEventListener('click', () => {
      cerrarModalRevision();
    });
  }

  if (formRevision) {
    formRevision.addEventListener('submit', guardarRevision);
  }

  if (modalRevision) {
    modalRevision.addEventListener('click', (e) => {
      if (e.target === modalRevision) {
        cerrarModalRevision();
      }
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
      <tr>
        <td>${escapeHtml((ev.estudiante && ev.estudiante.codigo) || '')}</td>
        <td>${escapeHtml((ev.estudiante && ev.estudiante.nombre) || '')}</td>
        <td>${escapeHtml(ev.nombre)}</td>
        <td>${escapeHtml(ev.tipo)}</td>
        <td>${formatDate(ev.fechaCarga)}</td>
        <td><span class="badge">${ev.estado || 'Pendiente'}</span></td>
        <td>${ev.calificacion || '-'}</td>
        <td>
          <button data-action="review-evidencia" data-id="${ev._id}" class="btn-small">Revisar</button>
        </td>
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
    document.getElementById('revNombreEvidencia').value = ev.nombre;
    document.getElementById('revArchivo').textContent = ev.archivo ? ev.archivo.nombre : '-';
    document.getElementById('revEstado').value = ev.estado || '';
    document.getElementById('revCalificacion').value = ev.calificacion != null ? ev.calificacion : '';
    document.getElementById('revObservaciones').value = ev.observacionTutor || '';

    document.getElementById('formRevision').dataset.evidenciaId = id;

    // Botón descargar: habilitar solo si hay URL de archivo
    const btnDesc = document.getElementById('btnDescargarArchivo');
    if (btnDesc) {
      if (ev.archivo && ev.archivo.url) {
        btnDesc.disabled = false;
        btnDesc.onclick = () => window.open(ev.archivo.url, '_blank');
      } else {
        btnDesc.disabled = true;
        btnDesc.onclick = null;
      }
    }

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

  const id = document.getElementById('formRevision').dataset.evidenciaId;
  const estado = document.getElementById('revEstado').value;
  const calificacion = document.getElementById('revCalificacion').value;
  const observaciones = document.getElementById('revObservaciones').value;

  if (!estado || !calificacion) {
    showMessage('Complete todos los campos requeridos', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/evidencias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado,
        calificacion: parseFloat(calificacion),
        observaciones
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
  const formObservacion = document.getElementById('formObservacion');
  const btnGuardarObs = document.getElementById('btnGuardarObs');
  const btnLimpiarObs = document.getElementById('btnLimpiarObs');

  if (!formObservacion) return;

  formObservacion.addEventListener('submit', (e) => {
    e.preventDefault();
    guardarObservacion();
  });

  if (btnLimpiarObs) {
    btnLimpiarObs.addEventListener('click', () => {
      formObservacion.reset();
      APP.editingObservacionId = null;
      const btnGuardar = document.getElementById('btnGuardarObs');
      if (btnGuardar) btnGuardar.textContent = 'Guardar Observación';
    });
  }


}

async function guardarObservacion() {
  const idEstudiante = document.getElementById('obsEstudiante').value;
  const observacion = document.getElementById('obsObservacion').value;

  if (!idEstudiante || !observacion) {
    showMessage('Complete todos los campos', 'error');
    return;
  }

  try {
    const method = APP.editingObservacionId ? 'PUT' : 'POST';
    const url = APP.editingObservacionId 
      ? `${API_BASE}/observaciones/${APP.editingObservacionId}`
      : `${API_BASE}/observaciones`;

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estudiante: idEstudiante,
        comentario: observacion
      })
    });

    if (!response.ok) throw new Error('Error al guardar');

    showMessage('Observación guardada exitosamente', 'success');
    document.getElementById('formObservacion').reset();
    APP.editingObservacionId = null;
    const btnGuardarObs = document.getElementById('btnGuardarObs');
    if (btnGuardarObs) btnGuardarObs.textContent = 'Guardar Observación';
    loadObservaciones();
  } catch (error) {
    showMessage('Error al guardar', 'error');
  }
}

async function editarObservacion(id) {
  try {
    const response = await fetch(`${API_BASE}/observaciones/${id}`);
    const obs = await response.json();

    // Rellenar el formulario con los datos actuales
    const selectEst = document.getElementById('obsEstudiante');
    if (selectEst && obs.estudiante) {
      selectEst.value = obs.estudiante._id || obs.estudiante;
    }
    document.getElementById('obsObservacion').value = obs.comentario || '';

    APP.editingObservacionId = id;

    // Actualizar texto del botón para indicar modo edición
    const btnGuardar = document.getElementById('btnGuardarObs');
    if (btnGuardar) btnGuardar.textContent = 'Actualizar Observación';

    const formObs = document.getElementById('formObservacion');
    if (formObs) formObs.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error(error);
    showMessage('Error al cargar observación', 'error');
  }
}

async function loadObservaciones() {
  const tbody = document.querySelector('#tableObservaciones tbody');

  if (!tbody) return;

  try {
    const response = await fetch(`${API_BASE}/observaciones`);
    const observaciones = await response.json();

    if (!Array.isArray(observaciones) || observaciones.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);">No hay observaciones registradas</td></tr>';
      return;
    }

    tbody.innerHTML = observaciones.map(obs => `
      <tr>
        <td>${escapeHtml((obs.estudiante && obs.estudiante.codigo) || '')}</td>
        <td>${escapeHtml((obs.estudiante && obs.estudiante.nombre) || '')}</td>
        <td>${escapeHtml(obs.comentario || '')}</td>
        <td>${formatDate(obs.fecha)}</td>
        <td>
          <button data-action="edit-observacion" data-id="${obs._id}" class="btn-small">Editar</button>
          <button data-action="delete-observacion" data-id="${obs._id}" class="btn-small">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error(error);
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);">Error al cargar</td></tr>';
  }
}

async function confirmarEliminarObservacion(id) {
  if (confirm('¿Desea eliminar esta observación?')) {
    try {
      const response = await fetch(`${API_BASE}/observaciones/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error');

      showMessage('Observación eliminada', 'success');
      loadObservaciones();
    } catch (error) {
      showMessage('Error al eliminar', 'error');
    }
  }
}

// ============ FUNCIONES AUXILIARES ============
async function loadEstudiantes() {
  try {
    const response = await fetch(`${API_BASE}/estudiantes`);
    const estudiantes = await response.json();

    if (!Array.isArray(estudiantes)) return;

    APP.estudiantes = estudiantes;

    const selEstudiante = document.getElementById('selEstudiante');
    const filterEstudiante = document.getElementById('filterEstudiante');
    const obsEstudiante = document.getElementById('obsEstudiante');

    [selEstudiante, filterEstudiante, obsEstudiante].forEach(select => {
      if (select) {
        const options = estudiantes.map(e => 
          `<option value="${e._id || e.id}">${e.nombre || e.nombreEstudiante}</option>`
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
    APP.editingEstudianteId = null;
    document.getElementById('btnGuardarEstudiante').textContent = 'Guardar Estudiante';
  });

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
    if (action === 'edit-observacion')  { editarObservacion(id); return; }
    if (action === 'delete-observacion'){ confirmarEliminarObservacion(id); return; }
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

async function guardarEstudiante() {
  try {
    const codigo = document.getElementById('estCodigo').value.trim();
    const nombre = document.getElementById('estNombre').value.trim();
    const correo = document.getElementById('estCorreo').value.trim();
    const programa = document.getElementById('estPrograma').value.trim();
    const semestre = document.getElementById('estSemestre').value.trim();

    // Validación
    const errorValidacion = validarEstudiante({ codigo, nombre, correo, programa, semestre });
    if (errorValidacion) {
      showMessage(errorValidacion, 'error');
      return;
    }

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
        programa,
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
    document.getElementById('estPrograma').value = est.programa;
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