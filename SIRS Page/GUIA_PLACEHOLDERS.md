# 📝 GUÍA RÁPIDA DE PLACEHOLDERS

## 🔍 Todos los placeholders que necesitas cambiar

### En **index.html**

Usa __Ctrl+H__ (Find and Replace) para cambiar rápidamente:

```
BÚSQUEDA → REEMPLAZO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INFORMACIÓN GENERAL
[NOMBRE_EMPRESA]          → Tech Solutions Inc.
[EMAIL]                   → contacto@empresa.com
[TELEFONO]                → +34 912 345 678
[LINKEDIN_URL]            → https://linkedin.com/company/...
[GITHUB_URL]              → https://github.com/...
[TWITTER_URL]             → https://twitter.com/...
[DESCRIPCION_CONTACTO]    → Ponte en contacto con nosotros para realizar un proyecto

SECCIÓN HERO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[NOMBRE_COMPLETO]         → Juan García López
[TITULO_PROFESIONAL]      → Desarrollador Full Stack | Especialista en Cloud
[TAGLINE_BREVE]           → Soluciones tecnológicas escalables para empresas 
                             en transformación digital

SECCIÓN ABOUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[PARRAFO_SOBRE_NOSOTROS_1] → Somos un equipo de desarrolladores apasionados...
[PARRAFO_SOBRE_NOSOTROS_2] → Con más de 10 años de experiencia...
[PARRAFO_SOBRE_NOSOTROS_3] → Nos especializamos en crear soluciones...

SECCIÓN EXPERIENCE (cada trabajo tiene 3 líneas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[FECHA_INICIO]            → Enero 2020
[FECHA_FIN]               → Diciembre 2023
[CARGO]                   → Senior Full Stack Developer
[EMPRESA]                 → Google Spain
[LOGRO_1]                 → Desarrollé y mantuve 12 microservicios...
[LOGRO_2]                 → Implementé CI/CD reduciendo deployment time 60%...
[LOGRO_3]                 → Mentoreé a 5 desarrolladores junior...
[TECH_1], [TECH_2], etc.  → React, Node.js, PostgreSQL, Docker, AWS

SECCIÓN PROJECTS (x6 proyectos)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[NOMBRE_PROYECTO_1]       → E-commerce Platform
[DESCRIPCION_PROYECTO_1]  → Plataforma de vendedores con 50k+ usuarios activos.
                             Integración con múltiples pasarelas de pago.
[TECH_1], [TECH_2], etc.  → Next.js, TypeScript, Stripe, PostgreSQL
[URL_DEMO]                → https://demo.ecommerce.com
[URL_GITHUB]              → https://github.com/user/ecommerce

SECCIÓN EDUCATION (x4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[TITULO_EDUCACION_1]      → Grado en Ingeniería de Software
[INSTITUCION_1]           → Universidad Politécnica de Madrid
[AÑO_1]                   → 2016

[TITULO_EDUCACION_2]      → AWS Certified Solutions Architect
[INSTITUCION_2]           → Amazon Web Services
[AÑO_2]                   → 2021
```

---

## ⚡ MÉTODO RÁPIDO (Ctrl+H en VS Code)

1. **Abre index.html**
2. **Presiona Ctrl+H** (Find and Replace)
3. **Reemplaza uno a uno:**

### Paso 1: Información General
```
Find:    [NOMBRE_EMPRESA]
Replace: Acme Corp
Click:   Replace All
```

### Paso 2: Sección Hero (el más visible)
```
Find:    [NOMBRE_COMPLETO]
Replace: Carlos Rodríguez Jiménez
Replace All

Find:    [TITULO_PROFESIONAL]
Replace: Arquitecto de Soluciones Cloud | Experto en DevOps
Replace All

Find:    [TAGLINE_BREVE]
Replace: Transformando ideas en soluciones tecnológicas de impacto\nPara empresas que quieren crecer en la era digital
Replace All
```

### Paso 3: Contacto
```
Find:    [EMAIL]
Replace: info@acmecorp.com
Replace All

Find:    [TELEFONO]
Replace: +34 91 234 5678
Replace All

Find:    [LINKEDIN_URL]
Replace: https://linkedin.com/company/acmecorp
Replace All
```

---

## 📋 CHECKLIST DE REEMPLAZOS

### Críticos (debe haber)
- [x] [NOMBRE_EMPRESA]
- [x] [NOMBRE_COMPLETO]
- [x] [TITULO_PROFESIONAL]
- [x] [EMAIL]
- [x] [TELEFONO]

### Experiencia (al menos 1-2 trabajos)
- [x] [FECHA_INICIO] / [FECHA_FIN]
- [x] [CARGO]
- [x] [EMPRESA]
- [x] [LOGRO_1], [LOGRO_2], [LOGRO_3]
- [x] [TECH_*]

### Proyectos (al menos 3)
- [x] [NOMBRE_PROYECTO_*]
- [x] [DESCRIPCION_PROYECTO_*]

### Educación (al menos 1)
- [x] [TITULO_EDUCACION_*]
- [x] [INSTITUCION_*]

### Redes Sociales
- [x] [LINKEDIN_URL]
- [x] [GITHUB_URL]
- [ ] [TWITTER_URL] (opcional, puedes eliminar)

---

## 📸 AGREGAR IMÁGENES

1. **Logo empresa:**
   ```html
   <img src="logo.png" alt="Logo" class="logo-img">
   ```

2. **Foto perfil (hero section):**
   - Tamaño: 300x300 px
   - Reemplaza `.placeholder-circle` con `<img>`

3. **Screenshots de proyectos:**
   - Tamaño: 640x400 px
   - Reemplaza `.placeholder-image` con `<img>`

---

## 🎯 ORDEN RECOMENDADO DE CAMBIOS

1. **Información personal/empresa** (5 min)
2. **Hero section** - Lo que ve el usuario primero (5 min)
3. **About** - Párrafos sobre vosotros (10 min)
4. **Experience** - Trabajos anteriores (15 min)
5. **Projects** - Trabajos destacados (20 min)
6. **Education** - Formación (5 min)
7. **Contacto** - Datos finales (5 min)

**Total: ~60 minutos para rellenar todo**

---

## ✅ VALIDACIÓN

Después de rellenar los datos:

- [ ] Abre index.html en navegador (F5)
- [ ] Comprueba que NO hay [placeholders] visibles
- [ ] Prueba los links del header
- [ ] Prueba los botones de contacto
- [ ] Verifica en móvil (abre DevTools, F12 → Toggle device toolbar)
- [ ] Valida el formulario de contacto

---

## 💡 CONSEJOS

1. **Copiar formatos del mismo tipo:**
   - Si rellenas 1 experiencia, copia los otros al mismo nivel
   - Mantén el mismo nivel de detalle en todos

2. **Logros con números:**
   - Mejor: "Aumenté conversiones 35%"
   - Evitar: "Trabajé en mejoras"

3. **Descripciones concisas:**
   - Máximo 2 líneas por descripción
   - Lenguaje profesional pero accesible

4. **URLs completas:**
   - Incluir `https://`
   - Verificar que son correctas antes de publicar

---

**¿Listo? Comienza con [NOMBRE_EMPRESA] y luego sigue el orden 👆**
