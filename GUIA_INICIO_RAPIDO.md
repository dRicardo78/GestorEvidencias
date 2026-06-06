# 🚀 GUÍA DE INICIO RÁPIDO - MINIAPP BIBLIOTECA

## ✅ Estado Actual
La interfaz está **100% completada** según los mockups proporcionados. El sistema incluye 3 módulos funcionales:

1. **Gestión de Evidencias (Estudiante)**
2. **Revisión de Evidencias (Tutor Académico)**  
3. **Observaciones Pedagógicas (Asesor)**

---

## 📋 Requisitos Previos

✅ Node.js instalado  
✅ MongoDB Atlas cuenta (o MongoDB local)  
✅ Variables de entorno configuradas (.env)  

---

## 🔧 Instalación y Inicio

### 1️⃣ Instalar dependencias
```bash
npm install
```

### 2️⃣ Configurar .env
```bash
# .env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/biblioteca
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5000
```

### 3️⃣ Iniciar servidor
```bash
npm start
# o para desarrollo con auto-reinicio:
npm run dev
```

### 4️⃣ Abrir en navegador
```
http://localhost:5000
```

---

## 📱 Funcionalidades por Módulo

### 👨‍🎓 MÓDULO 1: Gestión de Evidencias (Estudiante)

**Acceso**: Menú Lateral → Estudiantes → Gestión de Evidencias

**Funciones**:
- ✅ Seleccionar estudiante
- ✅ Crear evidencia (Tipo, Nombre, Descripción)
- ✅ Cargar archivo (PDF, Word, Excel)
- ✅ Ver tabla de evidencias
- ✅ Editar evidencia existente
- ✅ Eliminar evidencia

**Campos requeridos**:
- Tipo: Informe / Proyecto / Bitácora / Otro
- Nombre Evidencia: (máx 100 caracteres)
- Descripción: (máx 500 caracteres)
- Archivo: PDF, DOC, DOCX, XLS, XLSX

---

### 👨‍🏫 MÓDULO 2: Revisión de Evidencias (Tutor)

**Acceso**: Menú Lateral → Tutores Académicos → Revisar Evidencias

**Funciones**:
- ✅ Filtrar por estudiante
- ✅ Ver tabla de evidencias pendientes
- ✅ Hacer clic en "Revisar" para abrir modal
- ✅ Ingresar estado (Pendiente, Revisada, Aprobada, Rechazada)
- ✅ Asignar calificación (0-5)
- ✅ Agregar observaciones
- ✅ Guardar revisión

**Modal de Revisión incluye**:
- ID y Nombre del estudiante (read-only)
- Nombre de evidencia (read-only)
- Archivo para descargar
- Estado y Calificación (editable)
- Observaciones (opcional)

---

### 🎓 MÓDULO 3: Observaciones Pedagógicas (Asesor)

**Acceso**: Menú Lateral → Asesores Pedagógicos → Observaciones

**Funciones**:
- ✅ Seleccionar estudiante
- ✅ Escribir observación pedagógica
- ✅ Guardar observación
- ✅ Ver tabla de observaciones registradas
- ✅ Eliminar observaciones

**Campos**:
- Estudiante: (dropdown con lista)
- Observación: (máx 500 caracteres)

---

## 🔌 Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/estudiantes` | Obtener lista de estudiantes |
| GET | `/api/evidencias` | Obtener todas las evidencias |
| POST | `/api/evidencias` | Crear nueva evidencia |
| PUT | `/api/evidencias/:id` | Actualizar evidencia |
| DELETE | `/api/evidencias/:id` | Eliminar evidencia |
| GET | `/api/observaciones` | Obtener observaciones |
| POST | `/api/observaciones` | Crear observación |
| PUT | `/api/observaciones/:id` | Actualizar observación |
| DELETE | `/api/observaciones/:id` | Eliminar observación |

---

## 🎨 Interfaz Visual

### Colores y Estilos
- **Primario**: Azul (#2563eb)
- **Peligro**: Rojo (#dc2626)
- **Éxito**: Verde (#16a34a)
- **Fondo**: Gris claro (#f3f4f6)
- **Superficie**: Blanco (#ffffff)

### Componentes
✅ Menú lateral colapsable  
✅ Tablas responsivas  
✅ Modales de confirmación  
✅ Toast notifications  
✅ Formularios validados  
✅ Botones secundarios y primarios  

---

## 🧪 Pruebas Rápidas

### Test 1: Crear Evidencia
1. Ir a "Gestión de Evidencias"
2. Seleccionar estudiante "Juan Pérez"
3. Llenar formulario:
   - Tipo: Informe
   - Nombre: "Informe Proyecto Final"
   - Descripción: "Evidencia de trabajo completado"
4. Cargar archivo
5. Click "Guardar Evidencia"
6. Verificar en tabla

### Test 2: Revisar Evidencia (Tutor)
1. Ir a "Revisar Evidencias"
2. Seleccionar estudiante o ver todas
3. Click "Revisar" en alguna fila
4. Llenar modal:
   - Estado: "Aprobada"
   - Calificación: 4.5
   - Observaciones: "Excelente trabajo"
5. Click "Guardar Revisión"
6. Verificar cambios en tabla

### Test 3: Agregar Observación
1. Ir a "Observaciones"
2. Seleccionar estudiante
3. Escribir observación
4. Click "Guardar Observación"
5. Verificar en tabla

---

## 🐛 Solución de Problemas

### Error: "No se puede conectar a MongoDB"
```
✓ Verificar variable MONGODB_URI en .env
✓ Confirmar IP whitelist en MongoDB Atlas
✓ Revisar credenciales de conexión
```

### Error: "Puerto 5000 ya en uso"
```bash
# Cambiar puerto en .env
PORT=5001

# O liberar puerto
lsof -i :5000
kill -9 <PID>
```

### Botones no responden
```
✓ Abrir DevTools (F12)
✓ Ver Console para mensajes de error
✓ Verificar Network para fallos en API
✓ Recargar página (Ctrl+Shift+R)
```

---

## 📊 Estructura de Carpetas

```
/MiniAppBiblioteca
├── index.html              ← Frontend principal
├── app.js                  ← Lógica de aplicación
├── style.css               ← Estilos
├── api-client.js           ← Cliente HTTP
├── server.js               ← Servidor Express
├── package.json            ← Dependencias
├── .env                    ← Variables de entorno
├── config/
│   └── db.js               ← Conexión MongoDB
├── models/
│   ├── Libro.js
│   ├── Evidencia.js
│   └── Observacion.js
└── routes/
    ├── libros.js
    ├── evidencias.js
    ├── estudiantes.js
    └── observaciones.js
```

---

## 🔐 Seguridad

⚠️ **Notas de Seguridad**:
- Cambiar contraseña MongoDB antes de producción
- No compartir .env en repositorio
- Validar datos en backend (ya implementado)
- Usar HTTPS en producción
- Implementar autenticación (pendiente)

---

## 📈 Próximas Mejoras

🔜 Autenticación de usuarios  
🔜 Persistencia de estudiantes en BD  
🔜 Generación de reportes PDF  
🔜 Notificaciones por email  
🔜 Dashboard de estadísticas  
🔜 Exportar a Excel  
🔜 Búsqueda avanzada  

---

## 📞 Soporte

Para reportar bugs o sugerencias:
1. Abrir DevTools (F12)
2. Ir a Console para ver errores
3. Revisar Network para fallos API
4. Documentar pasos para reproducir

---

**¡Sistema listo para usar! 🎉**
