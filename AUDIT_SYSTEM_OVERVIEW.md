# Sistema de Auditoría y Bitácora - Resumen Técnico

## 📋 Índice
1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Componentes Principales](#componentes-principales)
4. [Flujo de Datos](#flujo-de-datos)
5. [Seguridad y Permisos](#seguridad-y-permisos)

---

## Visión General

El sistema de auditoría es una solución completa y automática que registra TODAS las acciones de los usuarios en el sistema. Opera de manera transparente mediante middleware de Django, sin requerir código adicional en cada endpoint.

### Características Principales

- ✅ **Registro automático** de todas las peticiones HTTP
- ✅ **Rastreo de sesiones** (compatible con JWT y sesiones tradicionales)
- ✅ **Detección de amenazas** de seguridad en tiempo real
- ✅ **Generación de reportes** en PDF, Excel y JSON
- ✅ **Filtrado avanzado** con múltiples criterios
- ✅ **Sanitización automática** de datos sensibles
- ✅ **Alta performance** con índices optimizados

### Estadísticas del Sistema

- **Total de código:** +2,500 líneas
- **Modelos de datos:** 2 (AuditLog, UserSession)
- **Endpoints API:** 12
- **Formatos de reporte:** 3 (JSON, PDF, Excel)
- **Tipos de alertas:** 6
- **Campos de filtrado:** 15+

---

## Arquitectura del Sistema

### Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                        │
│  React/Flutter/Web App con autenticación JWT                │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP Request
                   │ Headers: Authorization: Bearer <token>
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   MIDDLEWARE STACK                           │
├─────────────────────────────────────────────────────────────┤
│ 1. CORS Middleware                                          │
│ 2. Security Middleware                                      │
│ 3. Session Middleware                                       │
│ 4. Authentication Middleware  ← Identifica usuario          │
│ 5. SessionTrackingMiddleware  ← Registra sesión            │
│ 6. AuditMiddleware           ← Registra acción             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    VISTA (Endpoint)                          │
│  Procesa la petición del negocio                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                      │
├──────────────────────────┬──────────────────────────────────┤
│  Tabla: audit_logs       │  Tabla: user_sessions            │
│  - Todas las acciones    │  - Sesiones activas              │
│  - Con índices           │  - Duración de sesiones          │
└─────────────────────────────────────────────────────────────┘
```

### Flujo Temporal de una Petición

```
T=0ms    Cliente envía: POST /api/sales/orders/
         Headers: Authorization: Bearer eyJ0eXAi...
         Body: {product_id: 123, quantity: 2}

T=1ms    CORS Middleware → Valida origen

T=2ms    Authentication Middleware → Extrae JWT
         → Identifica usuario: "john_doe"

T=3ms    SessionTrackingMiddleware:
         → Busca sesión activa para user_id + IP hash
         → Si no existe, crea nueva UserSession
         → Actualiza last_activity = ahora

T=4ms    Vista procesa la orden
         → Valida stock
         → Crea orden en BD
         → Retorna 201 Created

T=50ms   AuditMiddleware.process_response():
         → Calcula response_time = 50ms
         → Determina action_type = "CREATE" (por endpoint /orders/)
         → Determina severity = "MEDIUM" (POST exitoso)
         → Sanitiza body (no hay campos sensibles)
         → Crea registro en AuditLog:
            - user_id = usuario autenticado
            - action_description = "Created new order"
            - http_method = "POST"
            - endpoint = "/api/sales/orders/"
            - response_status = 201
            - success = True
            - ip_address = "192.168.1.100"
            - timestamp = ahora

T=52ms   Respuesta enviada al cliente
```

---

## Componentes Principales

### 1. Modelos de Datos

#### AuditLog (Tabla: audit_logs)

**Propósito:** Registro detallado de CADA acción de usuario

**Campos esenciales para frontend:**

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `id` | Integer | ID único del registro | 12345 |
| `user_id` | Integer | ID del usuario (FK) | 42 |
| `username` | String | Nombre de usuario | "john_doe" |
| `action_type` | String | Tipo de acción | "CREATE", "UPDATE", "DELETE" |
| `action_description` | Text | Descripción legible | "Created new product" |
| `http_method` | String | Método HTTP | "GET", "POST", "PUT" |
| `endpoint` | String | URL accedida | "/api/sales/products/" |
| `response_status` | Integer | Código HTTP | 200, 201, 404, 500 |
| `response_time_ms` | Float | Tiempo de respuesta | 45.23 |
| `success` | Boolean | ¿Exitoso? | true/false |
| `error_message` | Text | Mensaje de error | "Product not found" |
| `ip_address` | String | IP del cliente | "192.168.1.100" |
| `severity` | String | Nivel de severidad | "LOW", "MEDIUM", "HIGH", "CRITICAL" |
| `timestamp` | DateTime | Fecha/hora | "2025-01-15T10:30:45Z" |

**Tipos de acción disponibles:**

- `AUTH` - Autenticación (login/logout/register)
- `CREATE` - Creación de recursos (POST)
- `READ` - Lectura de recursos (GET)
- `UPDATE` - Actualización de recursos (PUT/PATCH)
- `DELETE` - Eliminación de recursos
- `REPORT` - Generación de reportes
- `PAYMENT` - Operaciones de pago
- `CONFIG` - Cambios de configuración
- `ML` - Operaciones de Machine Learning
- `OTHER` - Otras acciones

**Niveles de severidad:**

- `LOW` - Operaciones de lectura normales
- `MEDIUM` - Operaciones de escritura (CREATE, UPDATE)
- `HIGH` - Operaciones sensibles (DELETE, PAYMENT) o errores 4xx
- `CRITICAL` - Errores del servidor (5xx)

#### UserSession (Tabla: user_sessions)

**Propósito:** Rastreo de sesiones activas e históricas

**Campos:**

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `id` | Integer | ID único | 789 |
| `user_id` | Integer | ID del usuario | 42 |
| `session_key` | String | Clave única de sesión | "abc123..." o hash JWT |
| `ip_address` | String | IP del cliente | "192.168.1.100" |
| `user_agent` | String | Navegador/app | "Mozilla/5.0..." |
| `login_time` | DateTime | Hora de inicio | "2025-01-15T10:00:00Z" |
| `last_activity` | DateTime | Última actividad | "2025-01-15T10:30:00Z" |
| `logout_time` | DateTime | Hora de cierre | null o "2025-01-15T11:00:00Z" |
| `is_active` | Boolean | ¿Activa? | true/false |

**Campo calculado:**
- `duration_minutes` - Duración de la sesión en minutos

### 2. Middleware

#### SessionTrackingMiddleware

**Ubicación en stack:** Después de AuthenticationMiddleware

**Funciones:**
1. Detecta usuario autenticado (request.user)
2. Para sesiones Django tradicionales: usa session_key directamente
3. Para JWT: genera hash único = MD5(user_id + IP + user_agent)
4. Busca sesión existente o crea nueva
5. Actualiza `last_activity` en cada petición
6. Maneja errores silenciosamente (no interrumpe flujo)

**Compatibilidad:**
- ✅ Django Session Auth
- ✅ JWT (SimpleJWT)
- ✅ Usuarios anónimos (no registra)

#### AuditMiddleware

**Ubicación en stack:** Último middleware personalizado

**Funciones:**
1. **Exclusiones automáticas:**
   - `/static/`, `/media/` - Archivos estáticos
   - `/favicon.ico` - Favicon
   - `/admin/jsi18n/` - Traducciones admin
   - Método `OPTIONS` - CORS preflight

2. **Medición de tiempo:**
   - Registra tiempo de inicio
   - Calcula duración al finalizar
   - Almacena en `response_time_ms`

3. **Determinación de tipo de acción:**
   ```
   Mapeo endpoint → action_type:
   - /login, /logout, /register → AUTH
   - /cart, /order → CREATE
   - /checkout → PAYMENT
   - /report → REPORT
   - /ml/predict, /ml/train → ML
   - /dashboard → READ
   - POST/PUT/PATCH → CREATE/UPDATE
   - DELETE → DELETE
   - GET → READ
   ```

4. **Determinación de severidad:**
   ```
   Lógica de severidad:
   - Status 5xx → CRITICAL
   - Status 4xx → HIGH
   - DELETE, PAYMENT, checkout → HIGH
   - POST, PUT, PATCH → MEDIUM
   - GET exitoso → LOW
   ```

5. **Sanitización de datos sensibles:**
   ```
   Campos removidos automáticamente:
   - password
   - token
   - secret
   - api_key
   - card_number
   - cvv
   - Reemplazados por: "[REDACTED]"
   ```

6. **Creación del registro:**
   - Llama a `AuditLog.log_action()`
   - Pasa todos los datos recolectados
   - Maneja errores sin romper la app

---

## Flujo de Datos

### Caso 1: Usuario Hace Login

```
CLIENTE:
POST /api/auth/login/
Body: {"username": "john_doe", "password": "secretpass"}

↓

BACKEND:
1. CORS Middleware → OK
2. Security Middleware → OK
3. Session Middleware → Crea sesión Django vacía
4. Authentication Middleware → Usuario anónimo (aún no autenticado)
5. SessionTrackingMiddleware → Saltado (no hay usuario)
6. Vista de Login:
   - Valida credenciales
   - Genera token JWT: "eyJ0eXAiOiJKV1QiLCJhb..."
   - Retorna 200 OK con token
7. AuditMiddleware:
   - action_type = "AUTH" (endpoint contiene /login)
   - action_description = "User login"
   - http_method = "POST"
   - endpoint = "/api/auth/login/"
   - request_body = {"username": "john_doe", "password": "[REDACTED]"}
   - response_status = 200
   - success = True
   - severity = "MEDIUM"
   - Crea registro en audit_logs

↓

CLIENTE RECIBE:
{
  "token": "eyJ0eXAiOiJKV1QiLCJhb...",
  "user": {
    "id": 42,
    "username": "john_doe",
    "role": "CUSTOMER"
  }
}

↓

CLIENTE GUARDA:
localStorage.setItem('token', response.token)
```

### Caso 2: Usuario Autenticado Consulta Productos

```
CLIENTE:
GET /api/sales/products/?search=laptop
Headers: {
  "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhb..."
}

↓

BACKEND:
1. CORS Middleware → OK
2. Authentication Middleware:
   - Extrae JWT del header
   - Valida firma y expiración
   - Carga usuario: john_doe (id=42)
   - Asigna a request.user
3. SessionTrackingMiddleware:
   - request.user existe y está autenticado
   - Calcula session_hash = MD5("42" + "192.168.1.100" + "Mozilla...")
   - Busca UserSession con ese hash
   - Si existe: actualiza last_activity = ahora
   - Si no existe: crea nuevo registro
4. Vista de Productos:
   - Filtra productos por "laptop"
   - Serializa resultados
   - Retorna 200 OK con lista
5. AuditMiddleware:
   - action_type = "READ" (método GET)
   - action_description = "Retrieved products"
   - http_method = "GET"
   - endpoint = "/api/sales/products/"
   - query_params = {"search": "laptop"}
   - response_status = 200
   - success = True
   - severity = "LOW" (lectura exitosa)
   - user_id = 42
   - username = "john_doe"
   - ip_address = "192.168.1.100"
   - Crea registro en audit_logs

↓

CLIENTE RECIBE:
{
  "count": 15,
  "results": [
    {
      "id": 100,
      "name": "Laptop Dell XPS",
      "price": 1299.99,
      ...
    },
    ...
  ]
}
```

### Caso 3: Usuario Elimina un Producto (Error de Permisos)

```
CLIENTE:
DELETE /api/sales/products/100/
Headers: {
  "Authorization": "Bearer eyJ0eXAi..." (usuario CUSTOMER, no ADMIN)
}

↓

BACKEND:
1-3. Middlewares iniciales → OK
4. Authentication Middleware → Usuario john_doe autenticado
5. SessionTrackingMiddleware → Actualiza sesión
6. Vista de Producto:
   - Verifica permisos: IsAdminUser
   - Usuario tiene rol "CUSTOMER", no "ADMIN"
   - Retorna 403 Forbidden
7. AuditMiddleware:
   - action_type = "DELETE" (método DELETE)
   - action_description = "Delete product"
   - http_method = "DELETE"
   - endpoint = "/api/sales/products/100/"
   - response_status = 403
   - success = False
   - error_message = "You do not have permission to perform this action."
   - severity = "HIGH" (operación sensible + error)
   - Crea registro en audit_logs

↓

CLIENTE RECIBE:
{
  "detail": "You do not have permission to perform this action."
}
Status: 403

↓

SISTEMA DE ALERTAS:
- Esta acción aparecerá en /audit/security-alerts/
- Tipo: "Operaciones sensibles rechazadas"
- Recomendación: "Revisar permisos de usuario"
```

### Caso 4: Error del Servidor

```
CLIENTE:
POST /api/sales/orders/
Headers: {"Authorization": "Bearer ..."}
Body: {"product_id": 999, "quantity": 1}

↓

BACKEND:
1-5. Middlewares → OK
6. Vista de Orden:
   - Busca producto 999
   - No existe, levanta excepción no manejada
   - Retorna 500 Internal Server Error
7. AuditMiddleware:
   - action_type = "CREATE"
   - response_status = 500
   - success = False
   - error_message = "Internal Server Error"
   - severity = "CRITICAL" (error 5xx)
   - Crea registro en audit_logs

↓

SISTEMA DE ALERTAS:
- Aparece en /audit/security-alerts/
- Tipo: "Server Errors (5xx)"
- Recomendación: "Investigar logs del servidor inmediatamente"
```

---

## Seguridad y Permisos

### Autenticación y Autorización

**Todos los endpoints de auditoría requieren:**

1. **Autenticación JWT válida:**
   ```
   Headers: {
     "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGci..."
   }
   ```

2. **Rol de Administrador:**
   ```python
   # Verificación en backend
   user.userprofile.role == "ADMIN"
   ```

**Respuestas de error:**

- Sin token: `401 Unauthorized`
- Token inválido/expirado: `401 Unauthorized`
- Usuario no admin: `403 Forbidden`

### Sanitización de Datos

**Campos sensibles removidos automáticamente:**

```json
// Request original
{
  "username": "john",
  "password": "secret123",
  "api_key": "sk_live_abc123",
  "card_number": "4532123456789012"
}

// Almacenado en audit_logs
{
  "username": "john",
  "password": "[REDACTED]",
  "api_key": "[REDACTED]",
  "card_number": "[REDACTED]"
}
```

**Lista completa de campos sanitizados:**
- password
- token
- secret
- api_key
- card_number
- cvv
- pin
- ssn

### Manejo de IPs con Proxies

**El sistema maneja correctamente proxies y load balancers:**

```python
# Orden de prioridad para obtener IP real
1. X-Forwarded-For header (primera IP de la lista)
2. X-Real-IP header
3. REMOTE_ADDR (IP directa)

# Ejemplo con proxy:
X-Forwarded-For: 203.0.113.195, 70.41.3.18, 150.172.238.178
→ IP registrada: 203.0.113.195 (IP real del cliente)
```

### Protección contra Fallos

**El sistema NUNCA interrumpe el flujo normal:**

```python
# Todos los middlewares y operaciones de logging usan:
try:
    # Operación de auditoría
    AuditLog.log_action(...)
except Exception as e:
    # Log del error pero continúa
    logger.error(f"Error logging audit: {e}")
    # La petición continúa normalmente
```

**Beneficio:** Si la base de datos de auditoría falla, el sistema principal sigue funcionando.

---

## Próximos Documentos

Este documento proporciona la visión general. Consulta los siguientes para detalles específicos:

1. **AUDIT_API_REFERENCE.md** - Referencia completa de todos los endpoints
2. **AUDIT_INTEGRATION_GUIDE.md** - Guía paso a paso para integrar con frontend
3. **AUDIT_USE_CASES.md** - Ejemplos prácticos y casos de uso

---

**Última actualización:** 2025-01-15
**Versión del sistema:** 1.0
**Mantenido por:** Equipo Backend
