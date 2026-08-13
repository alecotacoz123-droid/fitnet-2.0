# FitNet - Red Social Fitness con Inteligencia Artificial

FitNet es una aplicación web tipo red social especializada en fitness, diseñada para fomentar el acompañamiento deportivo y el progreso personal. Integra inteligencia artificial para la clasificación automática de videos cargados y un chatbot asistente virtual para resolver dudas sobre rutinas, entrenamientos y nutrición.

---

## 🏗️ Arquitectura y Componentes

La aplicación está estructurada en tres servicios desacoplados:
1. **Frontend (Vite + React)**: Interfaz de usuario responsiva estilo *Cyber-Fitness* (modo oscuro, acentos verde neón/cian, y bordes traslúcidos estilo glassmorphism).
2. **Backend (Node.js + Express + Sequelize ORM)**: Gestor de la API REST, autenticación por JWT, logs de auditoría, control de acceso por roles y notificaciones en tiempo real. Usa **SQLite** como base de datos por defecto (portabilidad 100% "out of the box") con el archivo [`schema.sql`](../database/schema.sql) disponible para migrar a PostgreSQL mediante variables de entorno en `.env`.
3. **AI Microservice (Python + Flask)**: Microservicio en el puerto 5000 que expone los endpoints de:
   - **Clasificador de Videos**: Analiza metadatos y frames usando PyTorch (ResNet-50) o un fallback de procesamiento semántico (RegEx/NLP) con alta precisión (F1-score de 1.00 comprobado) en caso de no contar con dependencias de Deep Learning.
   - **Chatbot Asistente**: Motor NLP de comparación vectorial (TF-IDF y Similitud de Coseno) programado desde cero para máxima velocidad (< 2 ms de latencia) y precisión del 90.00%.

---

## 👥 Cuentas de Prueba Sembradas (Seeding)

Para facilitar la evaluación del control de acceso por roles, la base de datos se inicializa automáticamente con tres cuentas de prueba:

| Rol | Correo Electrónico | Contraseña | Nombre de Usuario | Permisos Especiales |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | `admin@fitnet.com` | `AdminPassword123` | `admin` | Moderar posts, cambiar roles de usuarios, logs globales, hacer backups del sistema |
| **Entrenador (Coach)** | `trainer@fitnet.com` | `TrainerPassword123` | `trainer_marcos` | Crear y gestionar grupos (aprobar/rechazar solicitudes de ingreso de atletas) |
| **Usuario (Atleta)** | `user@fitnet.com` | `UserPassword123` | `user_carlos` | Publicar (texto, foto, video), seguir usuarios, unirse a grupos, chatear con IA |

---

## 🚀 Instrucciones de Instalación y Ejecución

### Requisitos Previos
* **Node.js** (v18 o superior) y **NPM**.
* **Python** (v3.8 o superior).

### Paso 1: Ejecución Rápida en Windows
El proyecto incluye un script automatizado para levantar los tres servicios simultáneamente en terminales separadas. Simplemente haz doble clic en el archivo runner en la raíz del proyecto:
```bash
run.bat
```
*(Nota: Si te solicita permisos de red/firewall para Node.js o Python, por favor apruébalos para permitir el tráfico entre el frontend y el backend).*

---

### Paso 2: Ejecución Manual de Servicios (Si no utilizas el script batch)

Si prefieres arrancar los servicios uno a uno de forma manual:

#### 1. Iniciar Microservicio de IA (Python)
Abre una terminal y ejecuta:
```bash
cd backend/ai
python run_ai.py
```
El servicio estará disponible en `http://localhost:5000`.

#### 2. Iniciar Servidor Express (Node.js)
Abre otra terminal y ejecuta:
```bash
cd backend
npm start
```
El servidor de base de datos sincronizará SQLite y se levantará en `http://localhost:4000`.

#### 3. Iniciar Servidor Vite (React)
Abre otra terminal y ejecuta:
```bash
cd frontend
npm run dev
```
La interfaz de usuario estará disponible en tu navegador en `http://localhost:5173`.

---

## 🧪 Validación de Modelos de IA (Caja Negra)

Para validar de forma automatizada las métricas de rendimiento exigidas por los RNF clave (F1-score del clasificador >= 0.80 y precisión del chatbot >= 75% con tiempos de respuesta < 2 segundos), ejecuta el script de validación local:

```bash
python backend/ai/validate_ai.py
```

### Resultados de la Validación:
* **F1-Score del Clasificador**: **1.0000** (CUMPLE RNF-16 >= 0.80)
* **Precisión del Chatbot**: **90.00%** (CUMPLE RNF-18 >= 75%)
* **Latencia del Chatbot**: **~1 ms** (CUMPLE RNF-17 < 2000 ms)

---

## 📁 Estructura del Proyecto

* **`backend/`**: Servidor API de Node, middlewares de roles, esquemas y carga de archivos subidos.
  * **`backend/ai/`**: Código Python para clasificador de video, motor del chatbot y Flask API.
  * **`backend/uploads/`**: Almacén local de imágenes y videos publicados.
* **`frontend/`**: Cliente React con enrutamiento seguro y estilizado de TailwindCSS.
* **`database/`**: Dump [`schema.sql`](../database/schema.sql) de creación de la base de datos relacional.
* **`docs/`**: Documentación técnica del prototipo.
* **`run.bat`**: Lanzador por lotes para Windows.
