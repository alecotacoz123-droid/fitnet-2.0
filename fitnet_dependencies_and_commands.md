# FitNet 3.0 — Listado de Librerías, Dependencias y Comandos de Ejecución

Este documento detalla todas las librerías de software (dependencias) utilizadas en el ecosistema de **FitNet** (Frontend, Backend principal y Microservicio de IA) y proporciona los comandos de terminal necesarios para instalar y ejecutar el proyecto desde cero.

---

## 1. Módulos y Librerías del Frontend (Cliente React)
El cliente está construido bajo **Vite** para un empaquetado rápido y utiliza las siguientes librerías de producción:

### Dependencias Principales (`frontend/package.json`)
1.  **`react` & `react-dom` (^18.2.0):** Librería base para la construcción de interfaces de usuario declarativas basadas en componentes.
2.  **`react-router-dom` (^7.15.1):** Enrutador dinámico que gestiona la navegación entre las diferentes páginas de la aplicación sin recargar la web.
3.  **`tailwindcss` & `@tailwindcss/vite` (^4.3.0):** Framework CSS modular para construir estilos y layouts responsivos de alto rendimiento.
4.  **`lucide-react` (^1.16.0):** Set de iconos vectoriales interactivos de alto rendimiento.
5.  **`react-webcam` (^7.2.0):** Componente para la captura de video de la cámara web directamente en el navegador.
6.  **`@tensorflow/tfjs` (^4.22.0) & `@tensorflow-models/pose-detection` (^2.1.3):** Motor de inteligencia artificial en el navegador que inicializa los detectores de postura en tiempo real.
7.  **`chart.js` & `react-chartjs-2` (^5.3.1):** Utilizado para renderizar gráficos de rendimiento y evolución del peso de manera interactiva.

---

## 2. Módulos y Librerías del Backend (Node.js Server)
El servidor está desarrollado sobre **Node.js** con un enfoque REST API y utiliza las siguientes dependencias:

### Dependencias Principales (`backend/package.json`)
1.  **`express` (^4.19.2):** Framework web minimalista para la creación de la API y el enrutamiento de peticiones HTTP.
2.  **`sqlite3` (^6.0.1) & `sequelize` (^6.37.8):** Motor de base de datos SQL ligero y ORM para interactuar con la base de datos de manera orientada a objetos (modelos, migraciones, sincronizaciones).
3.  **`jsonwebtoken` (^9.0.2):** Generación y firma de tokens JWT para asegurar las sesiones de los usuarios.
4.  **`bcryptjs` (^3.0.3):** Algoritmo de hash de contraseñas de un solo sentido para el almacenamiento seguro en la base de datos.
5.  **`cors` (^2.8.5):** Habilitación del intercambio de recursos de origen cruzado para permitir la conexión del frontend.
6.  **`dotenv` (^16.4.5):** Gestión de variables de entorno seguras (claves de cifrado y puertos).
7.  **`multer` (^2.1.1):** Middleware para la gestión de carga y guardado de archivos multimedia (imágenes y videos) subidos por los usuarios.
8.  **`nodemailer` (^8.0.11):** Módulo de envío de correos electrónicos para el flujo de recuperación de contraseñas.
9.  **`axios` (^1.6.8):** Cliente HTTP utilizado para comunicarse por proxy con el microservicio de IA.

---

## 3. Módulos y Librerías del Microservicio de IA (Python Service)
El servicio de IA secundario está escrito en **Python** para gestionar los modelos de lenguaje y lógica de análisis:

### Dependencias Principales (`backend/ai/requirements.txt`)
1.  **`Flask` (3.0.0):** Micro-framework web en Python para exponer los endpoints de análisis de video e interacción de chat.
2.  **`Flask-Cors` (4.0.0):** Habilita CORS para el microservicio web.
3.  **`google-generativeai` (0.8.3):** SDK oficial de Google para comunicarse con los modelos de lenguaje masivo (LLM) de Gemini.
4.  **`python-dotenv` (1.0.1):** Carga las credenciales y la clave API Key de Gemini de manera segura.

---

## 4. Guía de Comandos de Instalación y Ejecución

Sigue estos comandos en orden para instalar las dependencias y ejecutar todo el ecosistema de **FitNet** de manera local:

### Paso 1: Instalación de Dependencias

#### A. Instalar Dependencias del Frontend (Cliente)
Abre una terminal en la raíz del proyecto y ejecuta:
```bash
cd frontend
npm install
```

#### B. Instalar Dependencias del Backend (Servidor)
Abre otra terminal o muévete a la carpeta del backend y ejecuta:
```bash
cd ../backend
npm install
```

#### C. Instalar Dependencias del Servicio de IA (Python)
Asegúrate de tener instalado Python y pip. Muévete a la carpeta `ai` e instala los paquetes:
```bash
cd ai
pip install -r requirements.txt
```

---

### Paso 2: Ejecución del Proyecto (Entorno de Desarrollo)

Para que la aplicación funcione por completo, debes mantener corriendo los **tres servidores** simultáneamente:

#### 1. Iniciar el Microservicio de IA (Python) - Escucha en el Puerto 5000:
En la terminal del microservicio:
```bash
cd backend/ai
python run_ai.py
```

#### 2. Iniciar el Servidor Backend (Node.js) - Escucha en el Puerto 4000:
En la terminal del backend:
```bash
cd backend
node server.js
```

#### 3. Iniciar el Cliente Frontend (Vite/React) - Escucha en el Puerto 5173:
En la terminal del frontend:
```bash
cd frontend
npm run dev
```
*(Abre en tu navegador la dirección indicada: `http://localhost:5173`)*

---

### Paso 3: Compilación del Frontend para Producción

Si deseas empaquetar el código del frontend optimizado para su despliegue final (producción), ejecuta en la carpeta `frontend`:
```bash
npm run build
```
Esto generará los archivos estáticos listos en la carpeta `frontend/dist`.
