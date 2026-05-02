# 🛡️ SecurePeople — App de Reportes Ciudadanos para Bogotá

Prototipo académico de aplicación móvil de reportes ciudadanos inspirada en Citizen, adaptada para Bogotá, Colombia.

> ⚠️ **Aviso:** Esta es una aplicación académica con datos simulados. No reemplaza a la Policía Nacional, Bomberos, servicios de emergencias médicas ni ninguna autoridad oficial. En caso de emergencia real, llama al **123** (Policía) o **119** (Emergencias).

---

## 📋 Tabla de contenidos

- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Endpoints del backend](#endpoints-del-backend)
- [Funcionalidades implementadas](#funcionalidades-implementadas)
- [Tabla de requisitos](#tabla-de-requisitos)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React Native)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Splash  │  │  Login   │  │ Register │  │  Map   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Create   │  │  Detail  │  │ Profile  │              │
│  │ Report   │  │  Report  │  │          │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  Context: AuthContext | ReportsContext                   │
│  Services: api.ts (Axios) | socket.ts (Socket.IO)        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP REST + WebSocket
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    BACKEND (Node.js + TypeScript)         │
│                                                          │
│  Express.js + Socket.IO                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ /api/auth    │  │ /api/users   │  │ /api/reports  │  │
│  │ POST /login  │  │ GET  /me     │  │ GET  /        │  │
│  │ POST /reg.   │  │ PUT  /me     │  │ POST /        │  │
│  └──────────────┘  └──────────────┘  │ GET  /:id     │  │
│                                      │ GET  /user/my │  │
│  Middleware: JWT Auth | Validation   └───────────────┘  │
│                                                          │
│  Database: PostgreSQL in-memory (pg-mem)                 │
│  Auth: bcryptjs (hash) + JWT                             │
└─────────────────────────────────────────────────────────┘
```

**Flujo de datos:**
1. Usuario se registra/inicia sesión → JWT almacenado en AsyncStorage
2. App carga reportes simulados del backend via REST
3. Socket.IO mantiene conexión para recibir nuevos reportes en tiempo real
4. Al crear un reporte, se envía al backend y se emite via Socket.IO a todos los clientes

---

## 🛠️ Tecnologías

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React Native | 0.73.2 |
| Navegación | React Navigation | 6.x |
| Mapas | react-native-maps + Google Maps API | 1.10.0 |
| HTTP Client | Axios | 1.6.2 |
| Tiempo real | Socket.IO Client | 4.6.2 |
| Almacenamiento local | AsyncStorage | 1.21.0 |
| Backend | Node.js + TypeScript | 20.x / 5.3 |
| Framework API | Express.js | 4.18.2 |
| WebSockets | Socket.IO | 4.6.2 |
| Base de datos | PostgreSQL in-memory (pg-mem) | 2.8.1 |
| Autenticación | JWT (jsonwebtoken) | 9.0.2 |
| Cifrado | bcryptjs | 2.4.3 |
| Validación | express-validator | 7.0.1 |

---

## 📁 Estructura del proyecto

```
SecurePeople/
├── .gitignore
├── README.md
│
├── backend/
│   ├── .env                    # Variables de entorno (no subir a git)
│   ├── .env.example            # Plantilla de variables
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts            # Punto de entrada del servidor
│       ├── database/
│       │   └── db.ts           # Configuración pg-mem (PostgreSQL in-memory)
│       ├── middleware/
│       │   └── auth.ts         # Middleware JWT
│       ├── routes/
│       │   ├── auth.ts         # POST /register, POST /login
│       │   ├── users.ts        # GET/PUT /me
│       │   └── reports.ts      # CRUD reportes
│       ├── seeds/
│       │   └── simulatedReports.ts  # Datos simulados de Bogotá
│       └── types/
│           └── index.ts        # Tipos TypeScript
│
└── frontend/
    ├── .env                    # Variables de entorno (no subir a git)
    ├── .env.example            # Plantilla de variables
    ├── app.json
    ├── App.tsx                 # Componente raíz
    ├── index.js                # Entry point React Native
    ├── package.json
    ├── tsconfig.json
    ├── babel.config.js
    ├── android/                # Configuración Android
    │   ├── build.gradle
    │   ├── settings.gradle
    │   ├── gradle.properties
    │   └── app/
    │       ├── build.gradle
    │       └── src/main/
    │           ├── AndroidManifest.xml
    │           ├── java/com/securepeople/
    │           │   ├── MainActivity.kt
    │           │   └── MainApplication.kt
    │           └── res/values/
    │               ├── strings.xml
    │               ├── styles.xml
    │               └── colors.xml
    └── src/
        ├── context/
        │   ├── AuthContext.tsx      # Estado global de autenticación
        │   └── ReportsContext.tsx   # Estado global de reportes
        ├── navigation/
        │   └── AppNavigator.tsx     # Configuración de navegación
        ├── screens/
        │   ├── SplashScreen.tsx     # Pantalla de inicio
        │   ├── LoginScreen.tsx      # Inicio de sesión
        │   ├── RegisterScreen.tsx   # Registro de usuario
        │   ├── MapScreen.tsx        # Mapa principal con reportes
        │   ├── CreateReportScreen.tsx  # Crear nuevo reporte
        │   ├── ReportDetailScreen.tsx  # Detalle del reporte
        │   └── ProfileScreen.tsx    # Perfil y edición de usuario
        ├── components/
        │   ├── Button.tsx           # Botón reutilizable
        │   ├── Input.tsx            # Campo de texto reutilizable
        │   ├── CategoryBadge.tsx    # Badge de categoría
        │   ├── DangerMeter.tsx      # Medidor de nivel de peligro
        │   └── DisclaimerBanner.tsx # Aviso de uso responsable
        ├── services/
        │   ├── api.ts               # Cliente Axios configurado
        │   └── socket.ts            # Cliente Socket.IO
        └── theme/
            ├── colors.ts            # Paleta de colores (tema oscuro)
            └── typography.ts        # Estilos de texto
```

---

## ✅ Requisitos previos

### Software necesario

| Herramienta | Versión mínima | Descarga |
|-------------|---------------|---------|
| Node.js | 18.x LTS | https://nodejs.org |
| npm | 9.x | Incluido con Node.js |
| Java JDK | 17 | https://adoptium.net |
| Android Studio | Hedgehog+ | https://developer.android.com/studio |
| Git | 2.x | https://git-scm.com |

### Configuración de Android Studio

1. Instalar Android Studio
2. En SDK Manager, instalar:
   - Android SDK Platform 34
   - Android SDK Build-Tools 34.0.0
   - Android Emulator
   - Intel x86 Emulator Accelerator (HAXM) o equivalente
3. Crear un AVD (Android Virtual Device):
   - Device: Pixel 6 o similar
   - System Image: API 34 (Android 14)
4. Configurar variables de entorno:
   ```bash
   # En ~/.bashrc o ~/.zshrc (Linux/Mac) o Variables de entorno del sistema (Windows)
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### Google Maps API Key

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto nuevo o usa uno existente
3. Habilita **Maps SDK for Android**
4. Crea una API Key en "Credenciales"
5. Copia la key en los archivos `.env`

---

## 🚀 Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd SecurePeople
```

### 2. Configurar el Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores (el JWT_SECRET es lo más importante)

# Iniciar el servidor de desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

Verifica que funciona:
```bash
curl http://localhost:3000/health
```

### 3. Configurar el Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env y agregar tu GOOGLE_MAPS_API_KEY
```

### 4. Ejecutar en Android Emulator

```bash
# Terminal 1: Iniciar Metro bundler
cd frontend
npm start

# Terminal 2: Ejecutar en Android (con emulador abierto)
cd frontend
npm run android
```

### 5. Generar APK de debug

```bash
cd frontend/android
./gradlew assembleDebug

# El APK estará en:
# frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

### 6. Instalar APK en emulador

```bash
adb install frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔑 Cuenta demo

Para probar sin registrarse:
- **Email:** `demo@securepeople.co`
- **Contraseña:** `demo123456`

Esta cuenta tiene 10 reportes simulados en Bogotá precargados.

---

## 📡 Endpoints del backend

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |

**POST /api/auth/register**
```json
{
  "full_name": "Juan Pérez",
  "email": "juan@example.com",
  "nickname": "juanperez",
  "password": "mipassword123",
  "confirm_password": "mipassword123",
  "phone": "3001234567"
}
```

**POST /api/auth/login**
```json
{
  "email": "juan@example.com",
  "password": "mipassword123"
}
```

### Usuarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/me` | Obtener perfil actual | JWT |
| PUT | `/api/users/me` | Actualizar perfil | JWT |

**PUT /api/users/me**
```json
{
  "nickname": "nuevo_nickname",
  "avatar_url": "🦁",
  "current_password": "actual",
  "new_password": "nueva123",
  "confirm_new_password": "nueva123"
}
```

### Reportes

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/reports` | Listar reportes activos | No |
| GET | `/api/reports/:id` | Obtener reporte por ID | No |
| POST | `/api/reports` | Crear nuevo reporte | JWT |
| GET | `/api/reports/user/my` | Mis reportes | JWT |

**POST /api/reports**
```json
{
  "description": "Accidente en la Calle 26 con Carrera 7",
  "category": "Accidente",
  "danger_level": 7,
  "latitude": 4.6534,
  "longitude": -74.0836,
  "address": "Calle 26 con Carrera 7, Bogotá"
}
```

### Categorías válidas
- `Robo`
- `Accidente`
- `Incendio`
- `Emergencia médica`
- `Manifestación`
- `Obstrucción vial`
- `Situación sospechosa`
- `Otro`

### Health check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Estado del servidor |

---

## ✨ Funcionalidades implementadas

### Autenticación y usuarios
- [x] Registro con validación completa (nombre, email, nickname, contraseña)
- [x] Inicio de sesión con JWT
- [x] Persistencia de sesión con AsyncStorage
- [x] Contraseñas cifradas con bcryptjs (salt rounds: 10)
- [x] Edición de perfil (nickname, avatar, contraseña)
- [x] Validación de contraseña actual al cambiar contraseña
- [x] Confirmación de nueva contraseña

### Mapa y reportes
- [x] Mapa de Bogotá con Google Maps API (tema oscuro)
- [x] 10 reportes simulados precargados en Bogotá
- [x] Marcadores personalizados por categoría con emoji
- [x] Indicador de nivel de peligro en marcadores (punto de color)
- [x] Modal de preview al tocar un marcador
- [x] Filtro de reportes por categoría
- [x] Botón de centrar en Bogotá
- [x] Botón de actualizar reportes

### Crear reporte
- [x] Interfaz estilo Twitter/X
- [x] 8 categorías de incidentes
- [x] Selector de nivel de peligro 1-10 con colores
- [x] Selector de ubicación por barrio de Bogotá
- [x] Selector de ubicación en mapa interactivo
- [x] Contador de caracteres (máx. 500)
- [x] Validaciones completas (descripción, categoría, nivel, ubicación)
- [x] Reporte aparece en el mapa inmediatamente

### Detalle del reporte
- [x] Descripción completa
- [x] Categoría con badge de color
- [x] Medidor visual de nivel de peligro
- [x] Mini mapa con ubicación exacta
- [x] Fecha y hora formateada
- [x] Nickname del reportante (sin datos personales)
- [x] Aviso de reporte no verificado
- [x] Aviso de uso responsable con números de emergencia

### Perfil de usuario
- [x] Avatar con emojis seleccionables
- [x] Estadísticas de reportes
- [x] Información de cuenta (email, teléfono)
- [x] Edición de nickname
- [x] Cambio de contraseña con validación
- [x] Aviso de privacidad
- [x] Cerrar sesión

### Tiempo real
- [x] Socket.IO para recibir nuevos reportes en tiempo real
- [x] Actualización optimista del estado local al crear reporte
- [x] Deduplicación de reportes

### Diseño
- [x] Tema oscuro completo
- [x] Colores: negro, gris oscuro, rojo, naranja, azul
- [x] Mapa con estilo oscuro personalizado
- [x] Componentes reutilizables (Button, Input, CategoryBadge, DangerMeter)
- [x] Animaciones de entrada en SplashScreen
- [x] Responsive para diferentes tamaños de pantalla

### Seguridad y privacidad
- [x] Contraseñas cifradas con bcrypt
- [x] JWT para autenticación
- [x] No se muestran datos personales en reportes públicos
- [x] Aviso de uso responsable en múltiples pantallas
- [x] Aviso de que la app no reemplaza servicios de emergencia
- [x] Números de emergencia visibles (123, 119, 125)

---

## 📊 Tabla de requisitos

| # | Requisito | Tipo | ¿Se cumple? | Evidencia | Explicación |
|---|-----------|------|-------------|-----------|-------------|
| 1 | Pantalla de inicio con nombre/logo de la app | Funcional | ✅ Sí | `SplashScreen.tsx` | Logo 🛡️, nombre "SecurePeople", descripción y botones de login/registro |
| 2 | Botones para iniciar sesión y registrarse en inicio | Funcional | ✅ Sí | `SplashScreen.tsx` | Botones "Iniciar sesión" y "Crear cuenta" con estilos primary/outline |
| 3 | Pantalla de inicio de sesión con campos email y contraseña | Funcional | ✅ Sí | `LoginScreen.tsx` | Campos email, contraseña, botón login, enlace a registro |
| 4 | Validación de campos obligatorios en login | Funcional | ✅ Sí | `LoginScreen.tsx` | Función `validate()` verifica email válido y contraseña no vacía |
| 5 | Pantalla de registro con todos los campos requeridos | Funcional | ✅ Sí | `RegisterScreen.tsx` | Nombre, teléfono, email, nickname, contraseña, confirmación |
| 6 | Validación de correo electrónico en registro | Funcional | ✅ Sí | `RegisterScreen.tsx` + `routes/auth.ts` | Regex en frontend + `isEmail()` en backend |
| 7 | Validación de coincidencia de contraseñas | Funcional | ✅ Sí | `RegisterScreen.tsx` + `routes/auth.ts` | Validación en frontend y backend con `confirm_password` |
| 8 | Validación de campos obligatorios en registro | Funcional | ✅ Sí | `RegisterScreen.tsx` | Todos los campos marcados con * son validados antes de enviar |
| 9 | Mapa usando Google Maps API centrado en Bogotá | Funcional | ✅ Sí | `MapScreen.tsx` | `PROVIDER_GOOGLE`, región inicial `lat: 4.7110, lng: -74.0721` |
| 10 | Marcadores simulados de reportes ciudadanos | Funcional | ✅ Sí | `MapScreen.tsx` + `seeds/simulatedReports.ts` | 10 reportes simulados en barrios reales de Bogotá |
| 11 | Al tocar marcador mostrar información del reporte | Funcional | ✅ Sí | `MapScreen.tsx` | Modal bottom sheet con categoría, descripción, nivel, ubicación |
| 12 | Botón para crear nuevo reporte | Funcional | ✅ Sí | `MapScreen.tsx` | FAB rojo "Reportar" en esquina inferior derecha |
| 13 | Acceso al perfil del usuario desde el mapa | Funcional | ✅ Sí | `MapScreen.tsx` | Botón de avatar en top bar navega a `ProfileScreen` |
| 14 | Reportes nuevos visibles en el mapa después de crearse | Funcional | ✅ Sí | `ReportsContext.tsx` + `MapScreen.tsx` | Actualización optimista + Socket.IO emit `new_report` |
| 15 | Actualización en tiempo real con Socket.IO | Funcional | ✅ Sí | `socket.ts` + `routes/reports.ts` | Socket.IO emite `new_report` al crear; cliente escucha y actualiza estado |
| 16 | Pantalla crear reporte estilo Twitter/X | Funcional | ✅ Sí | `CreateReportScreen.tsx` | Header con Cancelar/Publicar, avatar, campo de texto libre |
| 17 | Selector de categoría con 8 opciones | Funcional | ✅ Sí | `CreateReportScreen.tsx` | Grid de chips con iconos para las 8 categorías requeridas |
| 18 | Selector de nivel de peligro 1-10 | Funcional | ✅ Sí | `CreateReportScreen.tsx` | 10 botones numerados con colores según nivel |
| 19 | Campo/selector de ubicación | Funcional | ✅ Sí | `CreateReportScreen.tsx` | Selector por barrio de Bogotá + selector en mapa interactivo |
| 20 | No permitir reportes vacíos | Funcional | ✅ Sí | `CreateReportScreen.tsx` + `routes/reports.ts` | Validación en frontend y backend (descripción mín. 10 chars) |
| 21 | Descripción del reporte obligatoria | Funcional | ✅ Sí | `CreateReportScreen.tsx` | Error si descripción vacía o < 10 caracteres |
| 22 | Nivel de peligro obligatorio entre 1 y 10 | Funcional | ✅ Sí | `CreateReportScreen.tsx` + `routes/reports.ts` | Validación en ambos lados; `isInt({ min: 1, max: 10 })` en backend |
| 23 | Pantalla de detalle del reporte | Funcional | ✅ Sí | `ReportDetailScreen.tsx` | Descripción, categoría, nivel, ubicación, fecha, nickname |
| 24 | No mostrar información personal sensible en detalle | Funcional | ✅ Sí | `ReportDetailScreen.tsx` | Solo muestra nickname, no email ni teléfono |
| 25 | Aviso de reporte comunitario no verificado | Funcional | ✅ Sí | `ReportDetailScreen.tsx` + `DisclaimerBanner.tsx` | Banner naranja con aviso en detalle y en mapa |
| 26 | Pantalla de edición de usuario | Funcional | ✅ Sí | `ProfileScreen.tsx` | Modal de edición con nickname, avatar, contraseña |
| 27 | Permitir cambiar foto de perfil | Funcional | ✅ Sí | `ProfileScreen.tsx` | Selector de 16 emojis como avatar |
| 28 | Permitir cambiar nickname | Funcional | ✅ Sí | `ProfileScreen.tsx` + `routes/users.ts` | Campo editable con validación y verificación de unicidad |
| 29 | Permitir cambiar contraseña con confirmación | Funcional | ✅ Sí | `ProfileScreen.tsx` + `routes/users.ts` | Requiere contraseña actual + nueva + confirmación |
| 30 | Validar campos obligatorios en edición de perfil | Funcional | ✅ Sí | `ProfileScreen.tsx` | Función `validateEdit()` con errores por campo |
| 31 | No mostrar datos sensibles del usuario públicamente | Funcional | ✅ Sí | `routes/reports.ts` + `ReportDetailScreen.tsx` | API solo retorna nickname en reportes, no email ni teléfono |
| 32 | Contraseñas cifradas con bcrypt | No funcional | ✅ Sí | `routes/auth.ts` | `bcrypt.hash(password, 10)` en registro; `bcrypt.compare()` en login |
| 33 | Autenticación con JWT | No funcional | ✅ Sí | `middleware/auth.ts` + `routes/auth.ts` | JWT firmado con secret, verificado en middleware |
| 34 | API keys en archivos .env | No funcional | ✅ Sí | `.env` + `.env.example` | `GOOGLE_MAPS_API_KEY`, `JWT_SECRET` en .env; plantilla en .env.example |
| 35 | Base de datos PostgreSQL en memoria | No funcional | ✅ Sí | `database/db.ts` | `pg-mem` simula PostgreSQL completo en memoria RAM |
| 36 | Tema oscuro en toda la aplicación | No funcional | ✅ Sí | `theme/colors.ts` + todas las pantallas | Fondo `#0D0D0D`, superficies `#1A1A1A`, texto blanco |
| 37 | Colores negro, gris oscuro, rojo, naranja, azul | No funcional | ✅ Sí | `theme/colors.ts` | `background: #0D0D0D`, `primary: #E53935`, `secondary: #FF6D00`, `accent: #1565C0` |
| 38 | Diseño moderno y responsive para móvil | No funcional | ✅ Sí | Todas las pantallas | StyleSheet con flexbox, SafeAreaProvider, KeyboardAvoidingView |
| 39 | Botones claros y consistentes | No funcional | ✅ Sí | `Button.tsx` | Componente reutilizable con variantes primary/outline/ghost/danger |
| 40 | Incluir .gitignore | No funcional | ✅ Sí | `.gitignore` | Excluye node_modules, .env, builds, IDE files |
| 41 | Incluir .env.example | No funcional | ✅ Sí | `backend/.env.example` + `frontend/.env.example` | Plantillas con todas las variables necesarias |
| 42 | Mapa con estilo oscuro | No funcional | ✅ Sí | `MapScreen.tsx` | `customMapStyle` con paleta oscura azul/navy |
| 43 | Aviso de uso responsable | No funcional | ✅ Sí | `DisclaimerBanner.tsx` | Componente reutilizable en detalle, crear reporte y splash |
| 44 | App no reemplaza servicios de emergencia | No funcional | ✅ Sí | `SplashScreen.tsx` + `DisclaimerBanner.tsx` | Mensaje explícito en múltiples pantallas |
| 45 | Números de emergencia visibles | No funcional | ✅ Sí | `SplashScreen.tsx` + `LoginScreen.tsx` | 123 (Policía), 119 (Bomberos), 125 (Ambulancia) |
| 46 | No usar ubicación real sin permiso | No funcional | ✅ Sí | `CreateReportScreen.tsx` | Ubicación seleccionada manualmente; nota "Tu ubicación real no se comparte" |
| 47 | Reportes simulados (no conexión con emergencias reales) | No funcional | ✅ Sí | `seeds/simulatedReports.ts` | Datos ficticios; aviso en toda la app |
| 48 | Ejecutable en Android Studio / emulador | No funcional | ✅ Sí | `android/` | Configuración completa de Android con Kotlin |
| 49 | Estructura de carpetas clara | No funcional | ✅ Sí | Proyecto completo | Separación backend/frontend, screens/components/services/context |
| 50 | README con instrucciones de instalación | No funcional | ✅ Sí | `README.md` | Instrucciones paso a paso para backend, frontend y Android |

**Resumen:** 50/50 requisitos cumplidos (100%)

---

## 🔧 Solución de problemas comunes

### Error: "Unable to connect to Metro"
```bash
# Limpiar caché de Metro
cd frontend
npm start -- --reset-cache
```

### Error: "Google Maps no muestra el mapa"
- Verifica que `GOOGLE_MAPS_API_KEY` en `.env` sea válida
- Asegúrate de haber habilitado "Maps SDK for Android" en Google Cloud Console
- Verifica que el `build.gradle` inyecte la key correctamente

### Error: "Cannot connect to backend"
- Verifica que el backend esté corriendo en puerto 3000
- En emulador Android, `10.0.2.2` apunta al localhost del host
- En dispositivo físico, usa la IP local de tu máquina (ej: `192.168.1.x`)

### Error: "pg-mem" al iniciar backend
```bash
cd backend
npm install
npm run dev
```

### Limpiar y reconstruir Android
```bash
cd frontend/android
./gradlew clean
cd ..
npm run android
```

---

## 👥 Créditos

Prototipo académico desarrollado para la asignatura de Ingeniería de Software.
Universidad — Ingeniería de Sistemas, penúltimo semestre.

**SecurePeople** — Bogotá, Colombia 🇨🇴
