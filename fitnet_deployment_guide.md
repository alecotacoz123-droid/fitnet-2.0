# GUÍA MAESTRA DE DESPLIEGUE EN PRODUCCIÓN (VPS + DOMINIO + SSL): FITNET 3.0

Esta guía describe el procedimiento paso a paso para subir **FitNet** a internet utilizando un Servidor Virtual Privado (VPS) con sistema operativo **Ubuntu Linux**, configurar un dominio web, instalar certificados de seguridad SSL gratuitos y mantener los servicios backend activos de forma indefinida.

---

## 1. ESTRATEGIA DE DESPLIEGUE EN PRODUCCIÓN

Dado que FitNet utiliza un ecosistema tecnológico híbrido (React + Node.js + Python + SQLite), la mejor estrategia y la más económica ($5 a $10 USD mensuales) es utilizar un **VPS** (como DigitalOcean, AWS Lightsail, Linode, Vultr o DonWeb) con **Ubuntu 22.04 LTS**.

### Arquitectura de Despliegue en el VPS:
*   **Servidor Web Nginx**: Actúa como Proxy Inverso. Recibe las peticiones web en los puertos `80` (HTTP) y `443` (HTTPS) y las redirige internamente:
    *   La ruta raíz `/` sirve los archivos estáticos optimizados del Frontend React.
    *   La ruta `/api` redirige internamente al servidor Node.js (puerto `4000`).
*   **PM2 (Node.js Process Manager)**: Mantiene activo el servidor de Node.js en segundo plano y lo reinicia automáticamente si ocurre un error o si el VPS se apaga.
*   **Systemd (Servicio Linux)**: Mantiene activo el microservicio de IA de Python en segundo plano.
*   **Certbot (Let's Encrypt)**: Genera e instala los certificados SSL automáticamente para habilitar HTTPS de forma segura.

---

## 2. PASO A PASO DEL DESPLIEGUE

### PASO 1: Comprar el Dominio y el VPS
1.  **Dominio**: Compra tu dominio (ej: `fitnetapp.com` o `fitnettimbio.xyz`) en proveedores como Namecheap, GoDaddy o DonWeb.
2.  **VPS**: Crea una instancia en un VPS con **Ubuntu 22.04 LTS**.
3.  **DNS (Asociar dominio y servidor)**: Ve a la configuración de DNS de tu dominio y crea dos registros tipo **A**:
    *   `@` -> Dirección IP pública de tu VPS (ej. `192.168.1.100`)
    *   `www` -> Dirección IP pública de tu VPS

---

### PASO 2: Configuración Inicial del VPS (Consola SSH)
Conéctate a tu servidor mediante una terminal SSH (puedes usar PowerShell en Windows o la app PuTTY):
```bash
ssh root@tu_direccion_ip_vps
```

Una vez dentro, actualiza el sistema e instala los componentes necesarios:
```bash
# Actualizar el gestor de paquetes
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (Versión 18) y NPM
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Nginx, Git, Python y pip
sudo apt install nginx git python3-pip python3-venv build-essential -y
```

---

### PASO 3: Clonar el Proyecto y Preparar las Carpetas
1.  Clona el repositorio en la carpeta `/var/www/`:
    ```bash
    cd /var/www
    # Reemplaza con la URL de tu repositorio de GitHub
    git clone https://github.com/tu-usuario/fitnet.git
    cd fitnet
    ```
2.  Crea la carpeta donde se subirán los archivos multimedia en producción:
    ```bash
    mkdir -p backend/uploads
    # Dar permisos de lectura/escritura a Nginx
    sudo chown -R www-data:www-data backend/uploads
    sudo chmod -R 775 backend/uploads
    ```

---

### PASO 4: Configurar y Ejecutar el Backend (Node.js) con PM2
1.  Instala las dependencias y el administrador de procesos PM2 de manera global:
    ```bash
    cd /var/www/fitnet/backend
    npm install
    sudo npm install -g pm2
    ```
2.  Crea tu archivo de variables de entorno `.env`:
    ```bash
    nano .env
    ```
    Escribe tus variables de producción:
    ```env
    PORT=4000
    JWT_SECRET=tu_firma_secreta_super_segura_321
    GEMINI_API_KEY=tu_clave_api_de_google_gemini
    EMAIL_USER=tu_correo_gmail_de_envio@gmail.com
    EMAIL_PASS=tu_clave_de_aplicacion_gmail
    ```
    *(Presiona `Ctrl + O` luego `Enter` para guardar, y `Ctrl + X` para salir).*
3.  Arranca la base de datos y pon en marcha la API con PM2:
    ```bash
    pm2 start server.js --name "fitnet-backend"
    pm2 save
    pm2 startup
    ```
    *(Copia y ejecuta la línea que PM2 te imprima en pantalla para configurar el auto-arranque del servidor Linux).*

---

### PASO 5: Configurar y Ejecutar el Microservicio de IA (Python)
1.  Muévete al directorio de IA y crea un entorno virtual de Python:
    ```bash
    cd /var/www/fitnet/backend/ai
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```
2.  Configura el archivo `.env` del servicio de IA:
    ```bash
    nano .env
    ```
    Escribe la API Key de Gemini:
    ```env
    GEMINI_API_KEY=tu_clave_api_de_google_gemini
    ```
3.  Para que el microservicio de Python corra permanentemente como un servicio del sistema, crea un script de Systemd:
    ```bash
    sudo nano /etc/systemd/system/fitnet-ai.service
    ```
    Pega el siguiente bloque de configuración:
    ```ini
    [Unit]
    Description=FitNet AI Python Microservice
    After=network.target

    [Service]
    User=root
    WorkingDirectory=/var/www/fitnet/backend/ai
    ExecStart=/var/www/fitnet/backend/ai/venv/bin/python run_ai.py
    Restart=always

    [Install]
    WantedBy=multi-user.target
    ```
4.  Arranca y habilita el servicio de IA:
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl start fitnet-ai
    sudo systemctl enable fitnet-ai
    ```

---

### PASO 6: Compilar el Frontend (React)
1.  Ve al directorio de frontend:
    ```bash
    cd /var/www/fitnet/frontend
    npm install
    ```
2.  Compila la aplicación React en archivos estáticos listos para producción:
    ```bash
    npm run build
    ```
    *(Esto creará la carpeta `frontend/dist` con el código HTML/JS/CSS ultra optimizado).*

---

### PASO 7: Configurar Nginx (Servidor Web Proxy Inverso)
Nginx recibirá todas las visitas al dominio y las enrutará al frontend o a la API.

1.  Crea un archivo de configuración de Nginx para tu dominio:
    ```bash
    sudo nano /etc/nginx/sites-available/fitnet
    ```
2.  Pega el siguiente contenido (reemplaza `tu_dominio.com` por tu dominio comprado):
    ```nginx
    server {
        listen 80;
        server_name tu_dominio.com www.tu_dominio.com;

        # Frontend: Servir archivos estáticos de React
        location / {
            root /var/www/fitnet/frontend/dist;
            try_files $uri $uri/ /index.html;
        }

        # Subidas multimedia (Fotos y videos subidos por los atletas)
        location /uploads/ {
            alias /var/www/fitnet/backend/uploads/;
            expires 30d;
            add_header Cache-Control "public, no-transform";
        }

        # Backend: Redirigir peticiones API al puerto 4000
        location /api/ {
            proxy_pass http://localhost:4000/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            
            # Aumentar límites para subidas de videos grandes
            client_max_body_size 100M;
        }
    }
    ```
3.  Habilita el sitio y reinicia Nginx:
    ```bash
    sudo ln -s /etc/nginx/sites-available/fitnet /etc/nginx/sites-enabled/
    # Eliminar la plantilla por defecto de Nginx
    sudo rm /etc/nginx/sites-enabled/default
    
    # Validar que no haya errores de sintaxis
    sudo nginx -t
    # Reiniciar el servicio
    sudo systemctl restart nginx
    ```

---

### PASO 8: Instalar SSL (Certificado de Seguridad HTTPS)
Es obligatorio que la web corra bajo `https://` para que la cámara web (MediaPipe/WebRTC) pueda activarse en los teléfonos móviles de los usuarios.

1.  Instala Certbot:
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    ```
2.  Obtén y configura el certificado SSL gratis (reemplaza por tu dominio):
    ```bash
    sudo certbot --nginx -d tu_dominio.com -d www.tu_dominio.com
    ```
    *Certbot te hará un par de preguntas rápidas por consola (tu email, aceptar condiciones de servicio) y te preguntará si deseas redirigir todo el tráfico HTTP a HTTPS de manera automática (selecciona que **SÍ**).*

¡Listo! A partir de este momento, cualquier persona en internet podrá entrar a `https://tu_dominio.com` y usar **FitNet**.

---

## 3. COMANDOS ÚTILES PARA EL MANTENIMIENTO DEL SERVIDOR

Si realizas cambios en el código de tu ordenador local y quieres subirlos al servidor en producción, ejecuta en la consola del VPS:

*   **Actualizar el código**:
    ```bash
    cd /var/www/fitnet
    git pull
    ```
*   **Recopilar los cambios del Frontend**:
    ```bash
    cd frontend && npm run build
    ```
*   **Reiniciar la API Backend**:
    ```bash
    pm2 restart fitnet-backend
    ```
*   **Reiniciar el Microservicio de IA**:
    ```bash
    sudo systemctl restart fitnet-ai
    ```
*   **Ver logs en tiempo real (para depurar errores)**:
    ```bash
    # Logs del servidor Node.js
    pm2 logs fitnet-backend
    
    # Logs del servicio Python
    sudo journalctl -u fitnet-ai -f -n 100
    ```
