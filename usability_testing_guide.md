# GUÍA METODOLÓGICA PARA PRUEBAS DE USABILIDAD Y ADHERENCIA: FITNET 3.0

Esta guía proporciona la metodología y el paso a paso científico para realizar las pruebas de usabilidad y evaluar la percepción del prototipo **FitNet** con usuarios reales, con el fin de recolectar los datos estadísticos necesarios para el reporte de tu tesis.

---

## 1. DISEÑO METODOLÓGICO DE LA PRUEBA

*   **Población Objetivo:** Deportistas, entrenadores y usuarios activos del municipio de **Timbío, Cauca**.
*   **Muestra Recomendada:** Entre **5 y 10 usuarios** (según Jakob Nielsen, pionero en usabilidad, evaluar con 5 usuarios permite identificar más del 85% de los problemas de usabilidad de un sistema).
*   **Método:** Prueba de usabilidad presencial o remota guiada por observación directa (Think-Aloud) acompañada de una encuesta de satisfacción cuantitativa.

---

## 2. GUION DE PRUEBA: ESCENARIOS Y TAREAS

Para evaluar el sistema de forma objetiva, pide a cada participante que realice las siguientes tareas en orden, sin darles instrucciones detalladas de cómo hacerlo. Tu rol es **observar dónde se confunden o dónde fluye el diseño**.

### Tarea 1: Registro y Configuración Deportiva (Perfil Fitness IA)
*   **Instrucción al usuario:** *"Regístrate como Atleta, inicia sesión, y configura tus datos de peso, altura, edad y objetivos en el formulario inicial del Perfil Fitness."*
*   **Objetivo a evaluar:** Facilidad para entender el cálculo automático del IMC y el TDEE (Gasto Energético).

### Tarea 2: Planificación Inteligente de Rutinas
*   **Instrucción al usuario:** *"Genera una rutina de entrenamiento basada en la Inteligencia Artificial y verifica qué ejercicios te asignó para el día de hoy."*
*   **Objetivo a evaluar:** Comprensión de las tarjetas dinámicas del Coach Central y del calendario de rutinas.

### Tarea 3: Evaluación de la Cámara Biomecánica (Visión Artificial)
*   **Instrucción al usuario:** *"Entra a la sección de entrenar con cámara, activa tu cámara web y realiza 3 sentadillas frente al dispositivo."*
*   **Objetivo a evaluar:** Identificar si el usuario comprende los colores del esqueleto (Rojo/Verde) y si el contador de repeticiones automático funciona en su entorno físico.

### Tarea 4: Interacción con el Asistente Chatbot
*   **Instrucción al usuario:** *"Abre el botón flotante del chat y pregúntale a tu Coach IA cuál es la cantidad de proteína que debes consumir diariamente."*
*   **Objetivo a evaluar:** Tiempo de respuesta percibido y utilidad de la respuesta del modelo Gemini.

### Tarea 5: Interacción con la Red Social y Clasificación de Videos
*   **Instrucción al usuario:** *"Crea una publicación en el Feed de la comunidad subiendo un video corto de ejercicio, ponle título y observa las etiquetas de clasificación automática (IA Tags) que le asigna el sistema."*
*   **Objetivo a evaluar:** Facilidad de carga de archivos y pertinencia de las etiquetas del clasificador de video.

### Tarea 6: Evaluación de Acompañamiento (Encuesta Tesis)
*   **Instrucción al usuario:** *"Dirígete a la sección de encuesta en la aplicación y responde las preguntas de valoración de usabilidad."*
*   **Objetivo a evaluar:** Recolección de datos primarios cuantitativos.

---

## 3. INSTRUMENTO DE EVALUACIÓN (MÉTRICAS)

El sistema ya cuenta con la **Encuesta Tipo Likert (1 al 5)** integrada, la cual evalúa las siguientes variables académicas:

| Dimensión a Evaluar | Pregunta del Prototipo | Variable Académica de Tesis |
| :--- | :--- | :--- |
| **Acompañamiento** | ¿El Coach IA te brindó una guía útil y clara? | Percepción de acompañamiento digital inteligente. |
| **Adherencia** | ¿Los elementos visuales (rachas, calendario) te motivan a entrenar? | Adherencia a la actividad física a través de gamificación. |
| **Usabilidad** | ¿La aplicación web es intuitiva y fácil de usar? | Usabilidad del software (basado en escala SUS). |
| **Comunidad** | ¿Lograste interactuar con atletas locales de Timbío? | Sentido de pertenencia y socialización deportiva. |
| **Satisfacción** | ¿Cuál es tu grado de satisfacción general con FitNet? | Índice de satisfacción global del prototipo. |

---

## 4. EXTRACCIÓN Y ANÁLISIS DE DATOS PARA LA TESIS

Una vez que tus 5 o 10 usuarios piloto hayan completado las tareas y respondido la encuesta dentro de la aplicación, sigue estos pasos para el análisis científico:

1.  **Descargar la base de datos**:
    *   Inicia sesión en la cuenta del **Administrador** (`admin`).
    *   Ve al **Admin Panel** (Panel de Administración).
    *   En la sección de métricas de la encuesta, haz clic en el botón **"Exportar Datos Tesis (CSV)"**.
2.  **Procesamiento Estadístico**:
    *   Importa el archivo `.csv` descargado en **Microsoft Excel** o **IBM SPSS Statistics**.
    *   **Estadística Descriptiva:** Calcula la **Media Aritmética ($\mu$)** y la **Desviación Estándar ($\sigma$)** para cada una de las 5 preguntas.
        *   *Ejemplo:* Si la Media de la variable "Usabilidad" es de `4.6 / 5.0`, concluyes que el prototipo cuenta con un alto grado de usabilidad percibida.
    *   **Análisis Cualitativo:** Revisa los comentarios de texto libre del campo `feedback` para detallar los hallazgos cualitativos en la discusión de resultados de tu documento de grado.
