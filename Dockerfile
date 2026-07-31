# --- Etapa 1: Construcción (Build) ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación para producción (ajusta el script si es necesario, ej: npm run build)
RUN npm run build

# --- Etapa 2: Servidor de Producción (Nginx) ---
FROM nginx:alpine

# Copiar los archivos compilados desde la etapa anterior al directorio web de Nginx
# (Nota: si usas Vite suele ser 'dist', si es Next.js estático puede ser '.next' o 'out'. Ajusta según tu framework)
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80 para el tráfico web
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
