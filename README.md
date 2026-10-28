# Landing BNB390

Landing de BNB390 (Jaume Genovard): VSL, comprobantes, testimonios, programa y un formulario de calificación de 7 preguntas que reserva la llamada de 60 minutos en GoHighLevel.

- **Frontend:** React 18 + Vite (`src/`)
- **Backend:** Vercel Functions en Node (`api/`), que hablan con la API v2 de GHL
- **Reglas compartidas:** `shared/form.js` define preguntas, validación y calificación, y lo usan el front y el back

## Cómo funciona la reserva

```
Formulario (7 preguntas) ──POST /api/lead──▶ valida + califica EN EL SERVIDOR
                                             ├─ upsert del contacto en GHL (tags + campos + nota con respuestas)
                                             ├─ no califica  → { qualified:false } → Instagram de Jaume
                                             └─ califica     → { qualified:true, token } (firmado, 2 h)
Selector de horario ──GET /api/slots?token──▶ horarios libres del calendario GHL (14 días)
Confirmar        ──POST /api/book {token}──▶ comprueba que el horario sigue libre → crea la cita de 60 min
```

Se descalifica si la P1 es «Aún no tengo propiedades ni clientes, quiero empezar» o si la P7 es «No, aún no quiero invertir…».
Sin token válido, `/api/slots` y `/api/book` responden 403, así que saltarse el formulario no permite reservar.

> **Importante:** no publiques el link del widget o del calendario de GHL en ningún otro sitio. Cualquiera que lo tenga podría reservar sin pasar por el formulario.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # opcional: sin credenciales funciona en modo demo
npm run dev                  # http://localhost:5173, sirve también /api/*
npm test                     # reglas de calificación y tokens
```

**Modo demo:** sin `GHL_TOKEN`, `GHL_LOCATION_ID` y `GHL_CALENDAR_ID`, la API funciona igual, pero no guarda nada y devuelve horarios de ejemplo. La interfaz lo avisa. En producción (`VERCEL_ENV=production`) sin credenciales responde 503 para no perder leads en silencio.

## Configurar GHL

1. En la subcuenta de BNB390, crea un **calendario de 60 minutos** con la disponibilidad de Jaume y copia su ID.
2. En **Settings → Private Integrations**, crea un token con permisos de contactos, calendarios y eventos de calendario.
3. Copia el **Location ID** de la subcuenta.
4. *(Opcional)* Crea campos personalizados de contacto para cada respuesta y pon sus IDs en `GHL_FIELD_MAP`. Las respuestas igual se guardan siempre como nota del contacto.

## Publicar en Vercel

1. Importa el repositorio en Vercel. Detecta Vite solo; el comando de build es `npm run build` y la salida es `dist`.
2. En **Settings → Environment Variables**, carga las variables de `.env.example`. `LEAD_TOKEN_SECRET` debe tener 32 caracteres o más (`openssl rand -hex 32`).
3. Haz el deploy y conecta el dominio definitivo en **Settings → Domains**. El HTTPS es automático.

## Dónde se edita el contenido

| Qué | Archivo |
|---|---|
| Casos de éxito y videos de testimonio | `src/content/cases.js` |
| Tarjetas del programa e imágenes | `src/content/program.js` |
| Comprobantes de la cinta / Más resultados | `src/content/proofs.js` (imágenes en `public/img/`) |
| VSL, Instagram, política de privacidad, etiquetas «pendiente» | variables `VITE_*` |
| Preguntas y reglas de calificación | `shared/form.js` |

Las cifras de los casos las aportó el cliente y no están verificadas. Las marcadas con `v: null` no se publican hasta confirmarlas.

## Pendiente antes de lanzar

- [ ] VSL definitivo, imágenes del programa y videos de testimonio asociados a cada caso
- [ ] Subcuenta GHL correcta, calendario de 60 min y token cargados en Vercel
- [ ] **Prueba real**: un lead calificado reserva y la cita aparece en GHL; un no calificado no puede reservar
- [ ] Verificar contra la cuenta real los endpoints de GHL (`/contacts/upsert`, `/calendars/{id}/free-slots`, `/calendars/events/appointments`) y las versiones de API
- [ ] Política de privacidad (`VITE_PRIVACY_URL`) y texto legal del consentimiento
- [ ] Confirmar el +30 % o +32 % de Joaquín, los datos de Roger y el permiso para publicar los comprobantes
- [ ] `VITE_SHOW_PENDING=false` en producción
