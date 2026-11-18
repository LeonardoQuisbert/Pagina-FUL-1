# Firestore Security Specification — Portal Oficial FUL UAGRM (2026-2028)

## 1. Roles & Authentication
- **Public Visitors (Unauthenticated or Authenticated Students)**:
  - Can read (`get`, `list`) institutional content collections: `noticias`, `eventos`, `facebook_posts`, `tiktok_videos`, `facultades`, and `configuracion`.
  - Can submit event registrations (`create` only) in `/inscritos/{inscritoId}` with strict schema, string length, and UAGRM student ID (`^[0-9]{8,9}$`) validation. Cannot read, list, update, or delete `/inscritos`.
- **Primary Administrator & Authorized Collaborators (`isAdmin()`)**:
  - Primary bootstrapped administrator: `leonardoquisbert@gmail.com` (`request.auth.token.email_verified == true`).
  - Collaborators: Any verified Google account whose lowercase email address exists as a document at `/admins/$(request.auth.token.email)`.
  - Can `create`, `update`, and `delete` documents in `noticias`, `eventos`, `facebook_posts`, `tiktok_videos`, `facultades`, `configuracion`, and `admins`.
  - Can `get`, `list`, `update`, and `delete` student registrations in `inscritos`.

## 2. Collections & Validation Rules
1. `/noticias/{noticiaId}`:
   - Exact keys: `['titulo', 'categoria', 'fecha', 'resumen', 'contenidoCompleto', 'imagenUrl', 'destacada', 'archivada', 'autor', 'impactos']`
   - Bounded strings, valid URI for `imagenUrl`, `impactos` list bounded to `<= 10`.
2. `/eventos/{eventoId}`:
   - Exact keys: `['titulo', 'tipo', 'fechaEvento', 'lugar', 'descripcion', 'imagenUrl', 'cupoMaximo', 'estado', 'organizador', 'etiquetaCorta']`
   - `estado in ['Activo', 'Cerrado']`, `cupoMaximo` number between `1` and `50000`.
3. `/facebook_posts/{postId}`:
   - Exact keys: `['titulo', 'fecha', 'imagenUrl', 'descripcionCompleta', 'facebookPostUrl']`
   - Valid HTTP/HTTPS URIs for `imagenUrl` and `facebookPostUrl`.
4. `/tiktok_videos/{videoId}`:
   - Exact keys: `['titulo', 'autorCuenta', 'tiktokUrl', 'miniaturaUrl', 'categoria', 'vistas', 'orden']`
   - Valid HTTP/HTTPS URIs for `tiktokUrl` and `miniaturaUrl`.
5. `/facultades/{facultadId}`:
   - Exact keys: `['nombre', 'carreras', 'orden']`
   - `carreras` list size between `1` and `25`.
6. `/configuracion/{configId}`:
   - Exact keys: `['whatsappGeneral', 'whatsappDefensoria', 'facebookUrl', 'tiktokUrl', 'instagramUrl', 'emailContacto', 'direccionCampus', 'horarioAtencion']`
7. `/inscritos/{inscritoId}`:
   - Exact keys: `['codigoConfirmacion', 'eventoId', 'eventoTitulo', 'nombre', 'registroUniversitario', 'facultad', 'carrera', 'whatsapp', 'fechaRegistro']`
   - `registroUniversitario` matches `^[0-9]{8,9}$`.
8. `/admins/{adminId}`:
   - Exact keys: `['email', 'nombre', 'agregadoPor', 'fechaAlta']`
   - `adminId` must match `data.email` and be a valid email address.
