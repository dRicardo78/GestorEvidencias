# 🎓 Sistema de Gestión de Evidencias Académicas

**Versión 1.0** - Sistema para documentar y gestionar evidencias académicas de estudiantes.

## 📋 Descripción

Sistema de backend con Node.js + Express + MongoDB para gestionar:
- **Estudiantes**: Registro y gestión de información de estudiantes
- **Evidencias**: Documentación de trabajos, proyectos e informes de estudiantes
- **Observaciones**: Registros pedagógicos y comentarios sobre el desempeño de estudiantes

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js v14+
- MongoDB (local o Atlas)
- npm

### Instalación

```bash
# Clonar o descargar el proyecto
cd MiniAppBiblioteca

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales MongoDB
```

### Ejecutar el servidor

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

Servidor iniciará en: `http://localhost:5000`

---

## 📐 Modelo de Datos

```
ESTUDIANTE (1) ──── (N) EVIDENCIA
   |
   └──── (N) OBSERVACIÓN
```

### Estudiante
- **código**: Identificador único del estudiante (ej: EST001)
- **nombre**: Nombre completo
- **correo**: Email único
- **programa**: Programa académico
- **semestre**: Semestre actual (1-12)

### Evidencia
- **estudiante**: Referencia a ObjectId de Estudiante
- **tipo**: Informe, Proyecto o Bitácora
- **nombre**: Título de la evidencia
- **descripcion**: Descripción detallada
- **estado**: Pendiente, Revisada, Aprobada, Rechazada
- **fechaCarga**: Fecha de creación
- **archivo**: Información del archivo adjunto (opcional)

### Observación
- **estudiante**: Referencia a ObjectId de Estudiante
- **comentario**: Observación pedagógica
- **asesor**: Nombre del asesor (opcional)
- **fecha**: Fecha de registro

---

## 🔌 API Endpoints

### Estudiantes
- `GET /api/estudiantes` - Obtener todos
- `GET /api/estudiantes/:id` - Obtener por ID
- `POST /api/estudiantes` - Crear
- `PUT /api/estudiantes/:id` - Actualizar
- `DELETE /api/estudiantes/:id` - Eliminar

### Evidencias
- `GET /api/evidencias` - Obtener todas (con filtros opcionales)
- `GET /api/evidencias/:id` - Obtener por ID
- `POST /api/evidencias` - Crear
- `PUT /api/evidencias/:id` - Actualizar
- `DELETE /api/evidencias/:id` - Eliminar

### Observaciones
- `GET /api/observaciones` - Obtener todas
- `GET /api/observaciones/:id` - Obtener por ID
- `POST /api/observaciones` - Crear
- `PUT /api/observaciones/:id` - Actualizar
- `DELETE /api/observaciones/:id` - Eliminar

**Ver documentación completa:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🏗️ Estructura del Proyecto

```
├── config/
│   └── db.js                    # Configuración de MongoDB
├── models/
│   ├── Estudiante.js            # Modelo MongoDB de Estudiante
│   ├── Evidencia.js             # Modelo MongoDB de Evidencia
│   └── Observacion.js           # Modelo MongoDB de Observación
├── routes/
│   ├── estudiantes.js           # Rutas /api/estudiantes
│   ├── evidencias.js            # Rutas /api/evidencias
│   └── observaciones.js         # Rutas /api/observaciones
├── middleware/
│   └── errorHandler.js          # Manejo centralizado de errores
├── server.js                    # Punto de entrada del servidor
├── app.js                       # Interfaz web (frontend)
├── index.html                   # HTML del cliente
├── style.css                    # Estilos CSS
├── package.json                 # Dependencias y scripts
├── .env                         # Variables de entorno (local)
└── README.md                    # Este archivo
```

---

## 📚 Validaciones

### Estudiantes
- ✅ Código: obligatorio, único, mayúsculas
- ✅ Nombre: obligatorio, máx 150 caracteres
- ✅ Correo: obligatorio, único, formato válido
- ✅ Programa: obligatorio, debe ser de lista predefinida
- ✅ Semestre: obligatorio, 1-12

### Evidencias
- ✅ Estudiante: obligatorio, debe existir
- ✅ Tipo: obligatorio (Informe, Proyecto, Bitácora)
- ✅ Nombre: obligatorio, máx 200 caracteres
- ✅ Descripción: obligatorio, máx 1000 caracteres

### Observaciones
- ✅ Estudiante: obligatorio, debe existir
- ✅ Comentario: obligatorio, máx 500 caracteres

---

## 🔑 Variables de Entorno (.env)

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/academia
FRONTEND_URL=http://localhost:5000
```

---

## 🧪 Testing Manual

### 1. Verificar servidor
```bash
curl http://localhost:5000/health
```

### 2. Crear estudiante
```bash
curl -X POST http://localhost:5000/api/estudiantes \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "EST001",
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "programa": "Ingeniería de Sistemas",
    "semestre": 3
  }'
```

### 3. Obtener estudiantes
```bash
curl http://localhost:5000/api/estudiantes
```

---

## 📖 Documentación Adicional

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Especificación completa de endpoints
- **[MANUAL_TECNICO.md](./MANUAL_TECNICO.md)** - Detalles técnicos de implementación
- **[GUIA_INICIO_RAPIDO.md](./GUIA_INICIO_RAPIDO.md)** - Paso a paso de configuración

---

## 🛠️ Tecnologías

- **Backend**: Node.js, Express 4.x
- **Base de Datos**: MongoDB con Mongoose 8.x
- **Validación**: Esquemas Mongoose con validadores personalizados
- **CORS**: Habilitado para desarrollo
- **Dotenv**: Gestión de variables de entorno

---

## 📝 Notas de Desarrollo

- Todas las relaciones usan **ObjectId de MongoDB** (no texto plano)
- Implementado **populate()** para traer datos relacionados
- **Manejo centralizado de errores** con middleware
- Validaciones en **modelo + rutas** (doble validación)
- Índices en campos de búsqueda frecuente

---

## ✅ Criterios de Calidad Cumplidos

- ✔️ CRUD completo para las tres entidades
- ✔️ Persistencia en MongoDB Atlas
- ✔️ Relaciones correctas con ObjectId
- ✔️ Validaciones básicas exhaustivas
- ✔️ Código limpio y bien organizado
- ✔️ Arquitectura sencilla y escalable
- ✔️ Fácil de entender para principiantes
- ✔️ Apropiado para curso de Programación III

---

## 🚦 Próximos Pasos (Futuro)

- [ ] Implementar autenticación JWT
- [ ] Agregar upload de archivos
- [ ] Crear dashboard de administración
- [ ] Implementar reportes y estadísticas
- [ ] Tests automatizados
- [ ] Documentación con Swagger

---

## 👨‍💻 Autor

Ricardo Vianchá - 2024

---

## 📄 Licencia

ISC
