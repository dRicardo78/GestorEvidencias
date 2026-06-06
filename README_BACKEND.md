# 📚 MiniApp Biblioteca - Sistema de Gestión Académica

## 📖 Descripción General

Sistema web full-stack para gestión de una biblioteca académica y almacenamiento de evidencias de estudiantes. Integra:

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Backend**: Node.js + Express
- **Base de Datos**: MongoDB (Atlas cloud)
- **Características**: CRUD completo, validación de datos, interfaz responsiva

---

## ✨ Características

### Módulo Biblioteca
✅ Crear, leer, actualizar y eliminar libros  
✅ Gestión de stock (número de copias)  
✅ Búsqueda y filtrado  
✅ Tabla interactiva con selección  
✅ Validación de datos robusta  

### Módulo Evidencias
✅ Registrar evidencias académicas de estudiantes  
✅ Clasificación por tipo (Informe, Proyecto, Bitácora)  
✅ Carga de archivos (PDF, Word, Excel)  
✅ Estados de revisión (Pendiente, Revisada, Aprobada, Rechazada)  
✅ Seguimiento por estudiante  

---

## 🚀 Inicio Rápido

### 1. Clonar o Descargar el Proyecto

```bash
git clone https://github.com/dRicardo78/MiniAppBiblioteca.git
cd MiniAppBiblioteca
```

### 2. Configurar MongoDB Atlas

**Sigue los pasos en [MONGODB_SETUP.md](./MONGODB_SETUP.md)**

Resume rápido:
```bash
# 1. Crear cuenta en https://www.mongodb.com/cloud/atlas
# 2. Crear un cluster gratuito
# 3. Obtener string de conexión
# 4. Actualizar archivo .env con tu string de conexión
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Iniciar Servidor

```bash
# Modo producción
npm start

# Modo desarrollo (auto-reinicia con cambios)
npm run dev
```

**Salida esperada:**
```
✅ MongoDB conectado exitosamente
🚀 Servidor iniciado exitosamente
Puerto: 5000
Verifica: http://localhost:5000/health
```

### 5. Abrir en Navegador

```
http://localhost:5000
```

---

## 📁 Estructura del Proyecto

```
/MiniAppBiblioteca
│
├── 📄 Frontend (Client-side)
│   ├── index.html          # Estructura HTML
│   ├── style.css           # Estilos y responsividad
│   ├── app.js              # Lógica del frontend (conecta con API)
│   └── assets/             # Iconos y recursos
│       ├── icon-book.svg
│       └── logo.svg
│
├── 🔌 Backend (Server-side)
│   ├── server.js           # Servidor Express principal
│   ├── package.json        # Dependencias del proyecto
│   │
│   ├── 📁 config/
│   │   └── db.js           # Conexión a MongoDB
│   │
│   ├── 📁 models/          # Esquemas de datos (Mongoose)
│   │   ├── Libro.js        # Modelo de Libro
│   │   └── Evidencia.js    # Modelo de Evidencia
│   │
│   ├── 📁 routes/          # Endpoints API
│   │   ├── libros.js       # GET, POST, PUT, DELETE /api/libros
│   │   └── evidencias.js   # GET, POST, PUT, DELETE /api/evidencias
│   │
│   └── 📁 middleware/      # Middlewares
│       └── errorHandler.js # Manejo centralizado de errores
│
├── 🔐 Configuración
│   ├── .env                # Variables de entorno (NO SUBIR A GIT)
│   ├── .env.example        # Plantilla de .env
│   └── .gitignore          # Archivos ignorados por Git
│
└── 📚 Documentación
    ├── README.md              # Este archivo
    ├── MONGODB_SETUP.md       # Guía paso a paso MongoDB Atlas
    ├── API_DOCUMENTATION.md   # Documentación completa de APIs
    ├── MANUAL_TECNICO.md      # Detalles técnicos del sistema original
    └── package.json           # Gestión de dependencias
```

---

## 🌐 Rutas API Disponibles

### Libros
```http
GET    /api/libros           # Obtener todos los libros
GET    /api/libros/:id       # Obtener un libro específico
POST   /api/libros           # Crear nuevo libro
PUT    /api/libros/:id       # Actualizar libro
DELETE /api/libros/:id       # Eliminar libro
```

### Evidencias
```http
GET    /api/evidencias       # Obtener todas las evidencias (con filtros)
GET    /api/evidencias/:id   # Obtener una evidencia específica
POST   /api/evidencias       # Crear nueva evidencia
PUT    /api/evidencias/:id   # Actualizar evidencia
DELETE /api/evidencias/:id   # Eliminar evidencia
```

**Ver detalles completos en [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

---

## 💻 Desarrollo

### Dependencias Principales

```json
{
  "express": "^4.18.2",      // Framework web
  "mongoose": "^8.0.0",      // ODM para MongoDB
  "cors": "^2.8.5",          // Control de CORS
  "dotenv": "^16.3.1"        // Variables de entorno
}
```

### Variables de Entorno (.env)

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/minibib

# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Scripts Disponibles

```bash
npm start                    # Iniciar servidor (producción)
npm run dev                  # Iniciar con nodemon (desarrollo)
npm install                  # Instalar dependencias
npm audit                    # Revisar vulnerabilidades
```

---

## 🔄 Flujo de Datos

### 1. Crear Libro (Frontend → Backend → MongoDB)

```
Usuario escribe datos en formulario
         ↓
Frontend hace POST /api/libros
         ↓
Express recibe y valida datos
         ↓
Mongoose guarda en MongoDB
         ↓
Frontend recibe ID del nuevo libro
         ↓
Renderiza tabla actualizada
```

### 2. Obtener Libros (MongoDB → Backend → Frontend)

```
Página carga
         ↓
Frontend hace GET /api/libros
         ↓
Express consulta MongoDB
         ↓
MongoDB retorna documentos
         ↓
Frontend recibe array JSON
         ↓
Renderiza tabla con datos
```

---

## 🔒 Seguridad

### Buenas Prácticas Implementadas

✅ **Validación de datos en servidor** - No confiar en cliente  
✅ **Variables de entorno** - Credenciales separadas de código  
✅ **CORS habilitado** - Control de acceso entre dominios  
✅ **Manejo centralizado de errores** - Sin exponer detalles internos  
✅ **MongoDB con contraseña** - Autenticación requerida  

### ⚠️ Para Producción (TODO)

🚫 Agregar autenticación JWT  
🚫 Implementar rate limiting  
🚫 Validación más estricta  
🚫 Usar HTTPS/TLS  
🚫 Agregar tests automatizados  
🚫 Implementar logging y monitoreo  

---

## 🐛 Solución de Problemas

### "MongoDB conectado exitosamente" pero no funciona

**Posibles causas:**

1. **Conexión incorrecta en .env**
   ```bash
   # Verifica que .env tenga:
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/minibib
   ```

2. **IP no permitida**
   - Ve a MongoDB Atlas → Network Access
   - Verifica que `0.0.0.0/0` esté permitido

3. **Usuario/Contraseña incorrectos**
   - En MongoDB Atlas → Database Users
   - Verifica credenciales

### Frontend no conecta con backend

1. **¿Está ejecutándose el servidor?**
   ```bash
   npm start  # En terminal
   ```

2. **¿Puerto correcto?**
   - Backend: `http://localhost:5000`
   - Verifica que app.js llame a este URL

3. **¿CORS habilitado?**
   - Servidor tiene `cors()` configurado
   - Si aún no funciona, actualiza CORS en `server.js`

### Archivos no se guardan

**Limitación actual:** Los archivos se almacenan como URLs de blob  
**Solución:** Para producción, implementar almacenamiento cloud (AWS S3, Google Cloud Storage, etc.)

---

## 📝 Ejemplo de Uso

### Crear un Nuevo Libro vía API

```bash
curl -X POST http://localhost:5000/api/libros \
  -H "Content-Type: application/json" \
  -d '{
    "idLibro": "LIB001",
    "nombre": "JavaScript Moderno",
    "editorial": "O'Reilly",
    "autor": "Kyle Simpson",
    "numCopias": 3
  }'
```

**Respuesta:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "idLibro": "LIB001",
  "nombre": "JavaScript Moderno",
  "editorial": "O'Reilly",
  "autor": "Kyle Simpson",
  "numCopias": 3,
  "fechaIngreso": "2024-01-15T10:30:00Z"
}
```

---

## 🤝 Contribuciones

Para agregar mejoras:

1. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
2. Realiza cambios y commit: `git commit -m "Agrega nueva funcionalidad"`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crea Pull Request

---

## 📞 Soporte

**Documentación:**
- [MONGODB_SETUP.md](./MONGODB_SETUP.md) - Configuración de BD
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Detalles de APIs
- [MANUAL_TECNICO.md](./MANUAL_TECNICO.md) - Especificaciones originales

**Verificar que todo funciona:**
```bash
# Terminal 1: Iniciar servidor
npm start

# Terminal 2: Verificar salud del servidor
curl http://localhost:5000/health
```

---

## 📄 Licencia

ISC - Libre para usar y modificar

---

## ✅ Checklist de Setup Completo

- [ ] MongoDB Atlas cuenta creada
- [ ] Cluster creado y usuario de BD configurado
- [ ] String de conexión copiada en .env
- [ ] `npm install` ejecutado
- [ ] `npm start` funcionando sin errores
- [ ] `http://localhost:5000/health` retorna status OK
- [ ] Datos en MongoDB Atlas persistidos
- [ ] Frontend conecta con Backend sin CORS errors

**¡Felicidades! 🎉 Tu aplicación está lista para desarrollo.**

---

Última actualización: Enero 2024  
Versión: 1.0.0-beta
