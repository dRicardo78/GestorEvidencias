# 📚 Sistema de Gestión de Evidencias Académicas - Documentación API

## Información General

- **Base URL**: `http://localhost:5000`
- **Versión**: 1.0
- **Contenido**: JSON
- **Autenticación**: No requerida (agregar en futuras versiones)

---

## 📋 ESTUDIANTES - Endpoints

### 1. Obtener todos los estudiantes
```http
GET /api/estudiantes
```

**Respuesta:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "codigo": "EST001",
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "programa": "Ingeniería de Sistemas",
    "semestre": 3,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### 2. Obtener estudiante por ID
```http
GET /api/estudiantes/:id
```

**Parámetro:**
- `id`: ID de MongoDB del estudiante

---

### 3. Crear nuevo estudiante
```http
POST /api/estudiantes
Content-Type: application/json

{
  "codigo": "EST001",
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "programa": "Ingeniería de Sistemas",
  "semestre": 3
}
```

**Campos requeridos:**
- `codigo` (string, único, se convierte a mayúsculas)
- `nombre` (string, máx 150 caracteres)
- `correo` (string, único, válido)
- `programa` (enum: "Ingeniería de Sistemas", "Administración de Empresas", "Contabilidad", "Otros")
- `semestre` (number, 1-12)

**Respuesta (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "codigo": "EST001",
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "programa": "Ingeniería de Sistemas",
  "semestre": 3
}
```

---

### 4. Actualizar estudiante
```http
PUT /api/estudiantes/:id
Content-Type: application/json

{
  "codigo": "EST001",
  "nombre": "Juan Carlos Pérez",
  "correo": "jcarlos@example.com",
  "programa": "Ingeniería de Sistemas",
  "semestre": 4
}
```

---

### 5. Eliminar estudiante
```http
DELETE /api/estudiantes/:id
```

**Respuesta (200 OK):**
```json
{
  "mensaje": "Estudiante eliminado correctamente",
  "estudiante": { /* ... */ }
}
```

---

## 📑 EVIDENCIAS - Endpoints

### 1. Obtener todas las evidencias
```http
GET /api/evidencias
```

**Parámetros opcionales (query string):**
- `?estudiante=507f1f77bcf86cd799439011` - Filtrar por ID de estudiante
- `?tipo=Informe` - Filtrar por tipo (Informe, Proyecto, Bitácora)
- `?estado=Pendiente` - Filtrar por estado

**Respuesta:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "estudiante": {
      "_id": "507f1f77bcf86cd799439011",
      "codigo": "EST001",
      "nombre": "Juan Pérez",
      "correo": "juan@example.com",
      "programa": "Ingeniería de Sistemas",
      "semestre": 3
    },
    "tipo": "Informe",
    "nombre": "Informe Final Matemáticas",
    "descripcion": "Análisis de funciones trigonométricas",
    "estado": "Pendiente",
    "fechaCarga": "2024-01-15T15:00:00Z"
  }
]
```

---

### 2. Obtener evidencia por ID
```http
GET /api/evidencias/:id
```

---

### 3. Crear nueva evidencia
```http
POST /api/evidencias
Content-Type: application/json

{
  "estudiante": "507f1f77bcf86cd799439011",
  "tipo": "Informe",
  "nombre": "Informe Final Matemáticas",
  "descripcion": "Análisis de funciones trigonométricas",
  "archivo": {
    "nombre": "informe.pdf",
    "url": "https://storage.example.com/informe.pdf",
    "tipo": "application/pdf",
    "tamaño": 2048000
  }
}
```

**Campos requeridos:**
- `estudiante` (ObjectId válido de Estudiante)
- `tipo` (enum: "Informe", "Proyecto", "Bitácora")
- `nombre` (string, máx 200 caracteres)
- `descripcion` (string, máx 1000 caracteres)
- `archivo` (opcional)

---

### 4. Actualizar evidencia
```http
PUT /api/evidencias/:id
Content-Type: application/json

{
  "nombre": "Informe Final Matemáticas - Revisado",
  "descripcion": "Análisis con ejemplos adicionales",
  "estado": "Aprobada"
}
```

**Estados válidos:** `Pendiente`, `Revisada`, `Aprobada`, `Rechazada`

---

### 5. Eliminar evidencia
```http
DELETE /api/evidencias/:id
```

---

## 📝 OBSERVACIONES - Endpoints

### 1. Obtener todas las observaciones
```http
GET /api/observaciones
```

**Parámetros opcionales:**
- `?estudiante=507f1f77bcf86cd799439011` - Filtrar por ID de estudiante

**Respuesta:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "estudiante": {
      "_id": "507f1f77bcf86cd799439011",
      "codigo": "EST001",
      "nombre": "Juan Pérez"
    },
    "comentario": "Estudiante participa activamente en clase",
    "asesor": "Mg. López",
    "fecha": "2024-01-15T14:00:00Z"
  }
]
```

---

### 2. Obtener observación por ID
```http
GET /api/observaciones/:id
```

---

### 3. Crear nueva observación
```http
POST /api/observaciones
Content-Type: application/json

{
  "estudiante": "507f1f77bcf86cd799439011",
  "comentario": "Estudiante participa activamente en clase",
  "asesor": "Mg. López"
}
```

**Campos requeridos:**
- `estudiante` (ObjectId válido de Estudiante)
- `comentario` (string, máx 500 caracteres)
- `asesor` (optional, string)

---

### 4. Actualizar observación
```http
PUT /api/observaciones/:id
Content-Type: application/json

{
  "comentario": "Excelente desempeño en las últimas actividades",
  "asesor": "Mg. López"
}
```

---

### 5. Eliminar observación
```http
DELETE /api/observaciones/:id
```

---

## Ejemplos de Uso desde JavaScript

### Obtener estudiantes
```javascript
fetch('http://localhost:5000/api/estudiantes')
  .then(res => res.json())
  .then(estudiantes => console.log(estudiantes))
  .catch(err => console.error(err));
```

### Crear estudiante
```javascript
fetch('http://localhost:5000/api/estudiantes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    codigo: 'EST001',
    nombre: 'Juan Pérez',
    correo: 'juan@example.com',
    programa: 'Ingeniería de Sistemas',
    semestre: 3
  })
})
.then(res => res.json())
.then(estudiante => console.log('Estudiante creado:', estudiante))
.catch(err => console.error(err));
```

### Crear evidencia
```javascript
fetch('http://localhost:5000/api/evidencias', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    estudiante: '507f1f77bcf86cd799439011',
    tipo: 'Informe',
    nombre: 'Informe Final',
    descripcion: 'Descripción del informe'
  })
})
.then(res => res.json())
.then(evidencia => console.log('Evidencia creada:', evidencia))
.catch(err => console.error(err));
```

---

## Códigos de Respuesta HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | GET, PUT, DELETE exitoso |
| 201 | Created | POST exitoso |
| 400 | Bad Request | Error en validación |
| 404 | Not Found | Recurso no encontrado |
| 500 | Server Error | Error interno |

---

## Estructura de Carpetas

```
/MiniAppBiblioteca
├── config/
│   └── db.js                    # Conexión MongoDB
├── models/
│   ├── Estudiante.js            # Esquema de Estudiante
│   ├── Evidencia.js             # Esquema de Evidencia
│   └── Observacion.js           # Esquema de Observación
├── routes/
│   ├── estudiantes.js           # Endpoints /api/estudiantes
│   ├── evidencias.js            # Endpoints /api/evidencias
│   └── observaciones.js         # Endpoints /api/observaciones
├── middleware/
│   └── errorHandler.js          # Manejo de errores
├── server.js                    # Servidor principal
├── app.js                       # Frontend
├── package.json                 # Dependencias
├── .env                         # Variables de entorno
└── README.md                    # Documentación principal
```
