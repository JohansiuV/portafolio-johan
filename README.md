# 🌐 Mi Portfolio Personal

## Archivos
- `index.html` — Página principal
- `style.css` — Estilos
- `app.js` — Lógica y funcionalidades

## ¿Cómo usar?

### 1. Personalizar tu info
Abre `index.html` y busca los textos entre corchetes `[Tu Nombre]`, etc. y cámbia los por tus datos.

### 2. Tu foto de perfil
Entra a **Admin → Perfil** con la contraseña `admin123` y sube tu foto.

### 3. Agregar certificados
Entra a **Admin → Certificados**, llena el formulario y sube la imagen de cada certificado.

### 4. Galería
Entra a **Admin → Galería** y sube tus fotos (fútbol, programación, gym, etc.)

### 5. Redes sociales
En `index.html` busca `href="#"` en los links de redes y cámbilos por tus URLs reales.

## Contraseña Admin
`admin123` — puedes cambiarla en `app.js` línea 3:
```js
const ADMIN_PASSWORD = "admin123";
```

## Publicar en internet (gratis)
1. Crea cuenta en https://netlify.com
2. Arrastra la carpeta completa al dashboard
3. ¡Listo! Tienes URL pública.

O usa GitHub Pages:
1. Sube los archivos a un repositorio GitHub
2. Activa GitHub Pages en Settings → Pages
