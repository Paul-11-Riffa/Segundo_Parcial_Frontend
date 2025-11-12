# API de Auditoría - Referencia Completa

## 📋 Índice
1. [Endpoints Disponibles](#endpoints-disponibles)
2. [Consulta de Logs](#consulta-de-logs)
3. [Estadísticas y Reportes](#estadísticas-y-reportes)
4. [Sesiones de Usuario](#sesiones-de-usuario)
5. [Alertas de Seguridad](#alertas-de-seguridad)
6. [Filtros Avanzados](#filtros-avanzados)
7. [Paginación](#paginación)
8. [Códigos de Error](#códigos-de-error)

---

## Endpoints Disponibles

**Base URL:** `http://tu-servidor.com/api/sales/audit/`

**Autenticación requerida:** Sí (JWT Token)
**Rol requerido:** ADMIN

### Lista Rápida

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/logs/` | GET | Lista todos los logs con filtros |
| `/logs/{id}/` | GET | Detalle de un log específico |
| `/statistics/` | GET | Estadísticas generales |
| `/user-activity/{username}/` | GET | Actividad de un usuario |
| `/sessions/active/` | GET | Sesiones activas |
| `/sessions/history/` | GET | Historial de sesiones |
| `/clean-old-logs/` | POST | Limpia logs antiguos |
| `/security-alerts/` | GET | Alertas de seguridad |
| `/check-session/` | GET | Verifica sesión actual (debug) |
| `/generate-report/` | POST | Genera reporte de auditoría |
| `/generate-session-report/` | POST | Genera reporte de sesiones |

---

## Consulta de Logs

### 1. Listar Logs

**Endpoint:** `GET /api/sales/audit/logs/`

**Descripción:** Obtiene lista paginada de registros de auditoría con capacidad de filtrado avanzado.

**Headers:**
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**Query Parameters (todos opcionales):**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `user` | string | Filtrar por username (búsqueda parcial) | `user=john` |
| `action_type` | string | Tipo de acción | `action_type=CREATE` |
| `severity` | string | Nivel de severidad | `severity=HIGH` |
| `success` | boolean | Solo exitosas o fallidas | `success=true` |
| `http_method` | string | Método HTTP | `http_method=POST` |
| `start_date` | datetime | Fecha inicial | `start_date=2025-01-01T00:00:00Z` |
| `end_date` | datetime | Fecha final | `end_date=2025-01-31T23:59:59Z` |
| `ip_address` | string | Filtrar por IP | `ip_address=192.168` |
| `endpoint` | string | Filtrar por endpoint | `endpoint=/products/` |
| `response_status` | integer | Código HTTP exacto | `response_status=404` |
| `response_status_gte` | integer | Código HTTP mínimo | `response_status_gte=400` |
| `response_status_lte` | integer | Código HTTP máximo | `response_status_lte=499` |
| `search` | string | Búsqueda global | `search=error` |
| `ordering` | string | Ordenamiento | `ordering=-timestamp` |
| `page` | integer | Número de página | `page=2` |
| `page_size` | integer | Registros por página (max 500) | `page_size=100` |

**Valores permitidos para action_type:**
- `AUTH`, `CREATE`, `READ`, `UPDATE`, `DELETE`, `REPORT`, `PAYMENT`, `CONFIG`, `ML`, `OTHER`

**Valores permitidos para severity:**
- `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

**Valores permitidos para http_method:**
- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`

**Valores permitidos para ordering:**
- `timestamp`, `-timestamp` (descendente)
- `response_status`, `-response_status`
- `response_time_ms`, `-response_time_ms`
- `username`, `-username`
- `severity`, `-severity`

**Ejemplo de Request:**
```http
GET /api/sales/audit/logs/?action_type=DELETE&severity=HIGH&success=false&page=1&page_size=50
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**Ejemplo de Response:**
```json
{
  "count": 245,
  "next": "http://tu-servidor.com/api/sales/audit/logs/?page=2",
  "previous": null,
  "results": [
    {
      "id": 12345,
      "user": 42,
      "username": "john_doe",
      "action_type": "DELETE",
      "action_type_display": "Delete",
      "action_description": "Delete product",
      "http_method": "DELETE",
      "endpoint": "/api/sales/products/100/",
      "query_params": null,
      "response_status": 403,
      "response_time_ms": 23.45,
      "success": false,
      "error_message": "You do not have permission to perform this action.",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "severity": "HIGH",
      "severity_display": "High",
      "timestamp": "2025-01-15T10:30:45.123456Z"
    },
    {
      "id": 12344,
      "user": 38,
      "username": "admin_user",
      "action_type": "DELETE",
      "action_type_display": "Delete",
      "action_description": "Delete order",
      "http_method": "DELETE",
      "endpoint": "/api/sales/orders/999/",
      "query_params": null,
      "response_status": 204,
      "response_time_ms": 145.67,
      "success": true,
      "error_message": null,
      "ip_address": "192.168.1.50",
      "user_agent": "Mozilla/5.0...",
      "severity": "HIGH",
      "severity_display": "High",
      "timestamp": "2025-01-15T09:15:22.987654Z"
    }
  ]
}
```

**Códigos de respuesta:**
- `200 OK` - Éxito
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No es administrador

---

### 2. Detalle de Log

**Endpoint:** `GET /api/sales/audit/logs/{id}/`

**Descripción:** Obtiene información detallada de un registro específico.

**Headers:**
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**Path Parameters:**
- `id` (integer, required) - ID del registro de auditoría

**Ejemplo de Request:**
```http
GET /api/sales/audit/logs/12345/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**Ejemplo de Response:**
```json
{
  "id": 12345,
  "user": 42,
  "username": "john_doe",
  "action_type": "CREATE",
  "action_type_display": "Create",
  "action_description": "Created new order",
  "http_method": "POST",
  "endpoint": "/api/sales/orders/",
  "query_params": null,
  "request_body": {
    "product_id": 100,
    "quantity": 2,
    "payment_method": "CREDIT_CARD"
  },
  "response_status": 201,
  "response_time_ms": 234.56,
  "success": true,
  "error_message": null,
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
  "severity": "MEDIUM",
  "severity_display": "Medium",
  "additional_data": {
    "order_id": 5678,
    "total_amount": 2599.98
  },
  "timestamp": "2025-01-15T10:30:45.123456Z"
}
```

**Campos adicionales en detalle:**
- `request_body` - Cuerpo de la petición original (con datos sensibles sanitizados)
- `additional_data` - Datos adicionales específicos del contexto

**Códigos de respuesta:**
- `200 OK` - Éxito
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No es administrador
- `404 Not Found` - Log no existe

---

## Estadísticas y Reportes

### 3. Estadísticas Generales

**Endpoint:** `GET /api/sales/audit/statistics/`

**Descripción:** Obtiene estadísticas agregadas del sistema de auditoría.

**Headers:**
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**Query Parameters:**

| Parámetro | Tipo | Descripción | Default | Ejemplo |
|-----------|------|-------------|---------|---------|
| `days` | integer | Días hacia atrás para analizar | 7 | `days=30` |

**Ejemplo de Request:**
```http
GET /api/sales/audit/statistics/?days=30
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**Ejemplo de Response:**
```json
{
  "period_days": 30,
  "start_date": "2024-12-16T00:00:00Z",
  "end_date": "2025-01-15T23:59:59Z",
  "summary": {
    "total_actions": 15847,
    "total_errors": 234,
    "error_rate": 1.48,
    "unique_users": 47,
    "unique_ips": 89,
    "avg_response_time_ms": 145.67
  },
  "by_action_type": [
    {
      "action_type": "READ",
      "action_type_display": "Read",
      "count": 9508,
      "percentage": 60.0
    },
    {
      "action_type": "CREATE",
      "action_type_display": "Create",
      "count": 3169,
      "percentage": 20.0
    },
    {
      "action_type": "UPDATE",
      "action_type_display": "Update",
      "count": 1585,
      "percentage": 10.0
    },
    {
      "action_type": "DELETE",
      "action_type_display": "Delete",
      "count": 793,
      "percentage": 5.0
    },
    {
      "action_type": "AUTH",
      "action_type_display": "Authentication",
      "count": 792,
      "percentage": 5.0
    }
  ],
  "by_severity": [
    {
      "severity": "LOW",
      "severity_display": "Low",
      "count": 9508,
      "percentage": 60.0
    },
    {
      "severity": "MEDIUM",
      "severity_display": "Medium",
      "count": 4754,
      "percentage": 30.0
    },
    {
      "severity": "HIGH",
      "severity_display": "High",
      "count": 1268,
      "percentage": 8.0
    },
    {
      "severity": "CRITICAL",
      "severity_display": "Critical",
      "count": 317,
      "percentage": 2.0
    }
  ],
  "by_day": [
    {
      "date": "2025-01-15",
      "total": 847,
      "errors": 12
    },
    {
      "date": "2025-01-14",
      "total": 923,
      "errors": 8
    },
    // ... 28 días más
  ],
  "top_users": [
    {
      "username": "john_doe",
      "action_count": 1234
    },
    {
      "username": "jane_smith",
      "action_count": 987
    },
    {
      "username": "admin_user",
      "action_count": 756
    }
  ],
  "top_ips": [
    {
      "ip_address": "192.168.1.100",
      "action_count": 567
    },
    {
      "ip_address": "192.168.1.50",
      "action_count": 432
    },
    {
      "ip_address": "10.0.0.25",
      "action_count": 398
    }
  ],
  "top_endpoints": [
    {
      "endpoint": "/api/sales/products/",
      "access_count": 2345
    },
    {
      "endpoint": "/api/sales/orders/",
      "access_count": 1876
    },
    {
      "endpoint": "/api/auth/user/",
      "access_count": 1543
    }
  ],
  "recent_errors": [
    {
      "id": 12567,
      "timestamp": "2025-01-15T14:23:45Z",
      "username": "john_doe",
      "endpoint": "/api/sales/products/999/",
      "http_method": "GET",
      "response_status": 404,
      "error_message": "Product not found"
    },
    {
      "id": 12555,
      "timestamp": "2025-01-15T13:45:12Z",
      "username": "jane_smith",
      "endpoint": "/api/sales/orders/",
      "http_method": "POST",
      "response_status": 500,
      "error_message": "Internal Server Error"
    }
  ],
  "recent_critical": [
    {
      "id": 12580,
      "timestamp": "2025-01-15T15:30:22Z",
      "username": "admin_user",
      "action_type": "DELETE",
      "endpoint": "/api/sales/products/100/",
      "response_status": 204,
      "success": true
    }
  ]
}
```

**Descripción de campos:**

- `summary`:
  - `total_actions` - Total de acciones registradas
  - `total_errors` - Total de acciones fallidas (success=false)
  - `error_rate` - Porcentaje de errores
  - `unique_users` - Usuarios únicos activos
  - `unique_ips` - IPs únicas
  - `avg_response_time_ms` - Tiempo promedio de respuesta

- `by_action_type` - Distribución por tipo de acción
- `by_severity` - Distribución por severidad
- `by_day` - Actividad diaria
- `top_users` - Usuarios más activos (top 10)
- `top_ips` - IPs más activas (top 10)
- `top_endpoints` - Endpoints más accedidos (top 10)
- `recent_errors` - Últimos 10 errores
- `recent_critical` - Últimas 10 acciones críticas

**Códigos de respuesta:**
- `200 OK` - Éxito
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No es administrador

---

### 4. Actividad de Usuario

**Endpoint:** `GET /api/sales/audit/user-activity/{username}/`

**Descripción:** Obtiene actividad detallada de un usuario específico.

**Headers:**
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**Path Parameters:**
- `username` (string, required) - Nombre de usuario

**Query Parameters:**

| Parámetro | Tipo | Descripción | Default | Ejemplo |
|-----------|------|-------------|---------|---------|
| `days` | integer | Días hacia atrás | 30 | `days=7` |

**Ejemplo de Request:**
```http
GET /api/sales/audit/user-activity/john_doe/?days=7
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**Ejemplo de Response:**
```json
{
  "username": "john_doe",
  "user_id": 42,
  "period_days": 7,
  "start_date": "2025-01-08T00:00:00Z",
  "end_date": "2025-01-15T23:59:59Z",
  "summary": {
    "total_actions": 287,
    "total_errors": 5,
    "error_rate": 1.74,
    "total_sessions": 12,
    "active_sessions": 1,
    "avg_response_time_ms": 134.23
  },
  "by_action_type": [
    {
      "action_type": "READ",
      "count": 189,
      "percentage": 65.85
    },
    {
      "action_type": "CREATE",
      "count": 67,
      "percentage": 23.34
    },
    {
      "action_type": "UPDATE",
      "count": 21,
      "percentage": 7.32
    },
    {
      "action_type": "DELETE",
      "count": 10,
      "percentage": 3.48
    }
  ],
  "recent_actions": [
    {
      "id": 12670,
      "timestamp": "2025-01-15T16:45:23Z",
      "action_type": "CREATE",
      "action_description": "Created new order",
      "endpoint": "/api/sales/orders/",
      "http_method": "POST",
      "response_status": 201,
      "success": true,
      "ip_address": "192.168.1.100"
    },
    {
      "id": 12665,
      "timestamp": "2025-01-15T16:30:12Z",
      "action_type": "READ",
      "action_description": "Retrieved products",
      "endpoint": "/api/sales/products/",
      "http_method": "GET",
      "response_status": 200,
      "success": true,
      "ip_address": "192.168.1.100"
    }
    // ... hasta 20 acciones recientes
  ],
  "ips_used": [
    {
      "ip_address": "192.168.1.100",
      "action_count": 245,
      "last_seen": "2025-01-15T16:45:23Z"
    },
    {
      "ip_address": "10.0.0.50",
      "action_count": 42,
      "last_seen": "2025-01-14T09:30:00Z"
    }
  ],
  "active_sessions": [
    {
      "id": 789,
      "session_key": "abc123...",
      "ip_address": "192.168.1.100",
      "login_time": "2025-01-15T08:00:00Z",
      "last_activity": "2025-01-15T16:45:23Z",
      "duration_minutes": 525
    }
  ]
}
```

**Códigos de respuesta:**
- `200 OK` - Éxito
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No es administrador
- `404 Not Found` - Usuario no existe

---

## Sesiones de Usuario

### 5. Sesiones Activas

**Endpoint:** `GET /api/sales/audit/sessions/active/`

**Descripción:** Lista todas las sesiones actualmente activas en el sistema.

**Headers:**
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**Query Parameters:**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `user` | string | Filtrar por username | `user=john` |
| `ip_address` | string | Filtrar por IP | `ip_address=192.168` |
| `search` | string | Búsqueda global | `search=john` |
| `ordering` | string | Ordenamiento | `ordering=-last_activity` |
| `page` | integer | Número de página | `page=1` |
| `page_size` | integer | Registros por página | `page_size=50` |

**Ejemplo de Request:**
```http
GET /api/sales/audit/sessions/active/?ordering=-last_activity
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**Ejemplo de Response:**
```json
{
  "count": 23,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 789,
      "user": 42,
      "username": "john_doe",
      "session_key": "a1b2c3d4e5f6...",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "login_time": "2025-01-15T08:00:00Z",
      "last_activity": "2025-01-15T16:45:23Z",
      "logout_time": null,
      "is_active": true,
      "duration_minutes": 525
    },
    {
      "id": 788,
      "user": 38,
      "username": "admin_user",
      "session_key": "z9y8x7w6v5...",
      "ip_address": "192.168.1.50",
      "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X)...",
      "login_time": "2025-01-15T09:30:00Z",
      "last_activity": "2025-01-15T16:40:15Z",
      "logout_time": null,
      "is_active": true,
      "duration_minutes": 430
    }
  ]
}
```

**Códigos de respuesta:**
- `200 OK` - Éxito
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No es administrador

---

### 6. Historial de Sesiones

**Endpoint:** `GET /api/sales/audit/sessions/history/`

**Descripción:** Historial completo de sesiones (activas e inactivas).

**Headers:**
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**Query Parameters:**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `user` | string | Filtrar por username | `user=john` |
| `is_active` | boolean | Solo activas o inactivas | `is_active=false` |
| `login_start` | datetime | Fecha login inicial | `login_start=2025-01-01T00:00:00Z` |
| `login_end` | datetime | Fecha login final | `login_end=2025-01-31T23:59:59Z` |
| `ip_address` | string | Filtrar por IP | `ip_address=192.168` |
| `search` | string | Búsqueda global | `search=john` |
| `ordering` | string | Ordenamiento | `ordering=-login_time` |
| `page` | integer | Número de página | `page=1` |
| `page_size` | integer | Registros por página | `page_size=50` |

**Ejemplo de Request:**
```http
GET /api/sales/audit/sessions/history/?is_active=false&ordering=-login_time
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**Ejemplo de Response:**
```json
{
  "count": 1247,
  "next": "http://tu-servidor.com/api/sales/audit/sessions/history/?page=2",
  "previous": null,
  "results": [
    {
      "id": 787,
      "user": 42,
      "username": "john_doe",
      "session_key": "old_session_123...",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "login_time": "2025-01-14T08:00:00Z",
      "last_activity": "2025-01-14T18:30:00Z",
      "logout_time": "2025-01-14T18:30:15Z",
      "is_active": false,
      "duration_minutes": 630
    }
  ]
}
```

**Códigos de respuesta:**
- `200 OK` - Éxito
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No es administrador

---

## Alertas de Seguridad

### 7. Alertas de Seguridad

**Endpoint:** `GET /api/sales/audit/security-alerts/`

**Descripción:** Detecta y retorna alertas de seguridad basadas en análisis de logs de las últimas 24 horas.

**Headers:**
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**Sin parámetros requeridos** (analiza últimas 24 horas automáticamente)

**Ejemplo de Request:**
```http
GET /api/sales/audit/security-alerts/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**Ejemplo de Response:**
```json
{
  "period": "Last 24 hours",
  "analyzed_from": "2025-01-14T16:00:00Z",
  "analyzed_to": "2025-01-15T16:00:00Z",
  "total_alerts": 15,
  "alerts": [
    {
      "type": "failed_logins",
      "severity": "HIGH",
      "count": 3,
      "title": "Multiple Failed Login Attempts",
      "description": "Detected multiple IPs with 5 or more failed login attempts",
      "recommendation": "Review these IPs and consider blocking or rate-limiting them",
      "details": [
        {
          "ip_address": "203.0.113.45",
          "failed_attempts": 12,
          "usernames_attempted": ["admin", "root", "user"],
          "last_attempt": "2025-01-15T15:45:23Z",
          "first_attempt": "2025-01-15T14:30:00Z"
        },
        {
          "ip_address": "198.51.100.78",
          "failed_attempts": 8,
          "usernames_attempted": ["admin", "test"],
          "last_attempt": "2025-01-15T14:20:15Z",
          "first_attempt": "2025-01-15T13:50:00Z"
        }
      ]
    },
    {
      "type": "critical_actions",
      "severity": "CRITICAL",
      "count": 5,
      "title": "Critical Actions Performed",
      "description": "Actions with CRITICAL severity level detected",
      "recommendation": "Review these critical actions to ensure they were authorized",
      "details": [
        {
          "id": 12890,
          "timestamp": "2025-01-15T15:30:00Z",
          "username": "admin_user",
          "action_type": "DELETE",
          "endpoint": "/api/sales/products/bulk-delete/",
          "response_status": 500,
          "error_message": "Database connection lost",
          "ip_address": "192.168.1.50"
        }
      ]
    },
    {
      "type": "multiple_ips",
      "severity": "MEDIUM",
      "count": 2,
      "title": "Users Accessing from Multiple IPs",
      "description": "Users detected accessing from 3 or more different IP addresses",
      "recommendation": "Verify if these access patterns are legitimate or potential account compromise",
      "details": [
        {
          "username": "john_doe",
          "ip_count": 4,
          "ips": [
            {
              "ip_address": "192.168.1.100",
              "action_count": 45,
              "last_seen": "2025-01-15T15:45:00Z"
            },
            {
              "ip_address": "10.0.0.50",
              "action_count": 12,
              "last_seen": "2025-01-15T12:30:00Z"
            },
            {
              "ip_address": "203.0.113.100",
              "action_count": 8,
              "last_seen": "2025-01-15T10:15:00Z"
            },
            {
              "ip_address": "198.51.100.200",
              "action_count": 3,
              "last_seen": "2025-01-15T08:00:00Z"
            }
          ]
        }
      ]
    },
    {
      "type": "server_errors",
      "severity": "CRITICAL",
      "count": 7,
      "title": "Server Errors (5xx)",
      "description": "Multiple server errors detected",
      "recommendation": "Investigate server logs immediately to identify the root cause",
      "details": [
        {
          "id": 12900,
          "timestamp": "2025-01-15T15:50:00Z",
          "username": "jane_smith",
          "endpoint": "/api/sales/orders/",
          "http_method": "POST",
          "response_status": 500,
          "error_message": "Internal Server Error",
          "ip_address": "192.168.1.120"
        },
        {
          "id": 12895,
          "timestamp": "2025-01-15T15:35:00Z",
          "username": "john_doe",
          "endpoint": "/api/sales/checkout/",
          "http_method": "POST",
          "response_status": 503,
          "error_message": "Service Unavailable",
          "ip_address": "192.168.1.100"
        }
      ]
    },
    {
      "type": "bulk_deletions",
      "severity": "HIGH",
      "count": 2,
      "title": "Bulk Deletion Operations",
      "description": "Users performed 5 or more deletions in a short period",
      "recommendation": "Verify if these bulk deletions were intentional and authorized",
      "details": [
        {
          "username": "admin_user",
          "deletion_count": 15,
          "endpoints": [
            "/api/sales/products/100/",
            "/api/sales/products/101/",
            "/api/sales/products/102/"
            // ... más
          ],
          "time_range": {
            "first_deletion": "2025-01-15T14:00:00Z",
            "last_deletion": "2025-01-15T14:15:00Z"
          },
          "ip_address": "192.168.1.50"
        }
      ]
    },
    {
      "type": "unusual_activity",
      "severity": "MEDIUM",
      "count": 1,
      "title": "Unusually High Activity",
      "description": "Users with more than 100 actions in the period",
      "recommendation": "Verify if this high activity level is expected or potential automation/abuse",
      "details": [
        {
          "username": "api_bot",
          "action_count": 345,
          "unique_endpoints": 12,
          "ip_address": "10.0.0.200",
          "most_frequent_action": "READ",
          "most_accessed_endpoint": "/api/sales/products/"
        }
      ]
    }
  ]
}
```

**Tipos de alertas detectadas:**

1. **failed_logins** (HIGH)
   - IPs con 5+ intentos fallidos de login
   - Indica posibles ataques de fuerza bruta

2. **critical_actions** (CRITICAL)
   - Acciones marcadas como CRITICAL severity
   - Errores graves del servidor durante operaciones

3. **multiple_ips** (MEDIUM)
   - Usuarios accediendo desde 3+ IPs diferentes
   - Posible compromiso de cuenta

4. **server_errors** (CRITICAL)
   - Errores 5xx del servidor
   - Problemas técnicos que requieren atención inmediata

5. **bulk_deletions** (HIGH)
   - 5+ eliminaciones en poco tiempo
   - Posible eliminación accidental o maliciosa

6. **unusual_activity** (MEDIUM)
   - 100+ acciones en 24 horas
   - Posible bot o uso anormal

**Códigos de respuesta:**
- `200 OK` - Éxito (incluso si no hay alertas, retorna lista vacía)
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No es administrador

---

## Generación de Reportes

### 8. Generar Reporte de Auditoría

**Endpoint:** `POST /api/sales/audit/generate-report/`

**Descripción:** Genera un reporte de auditoría en formato JSON, PDF o Excel con filtros personalizados.

**Headers:**
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
Content-Type: application/json
```

**Request Body:**

```json
{
  "filters": {
    "user": "john_doe",
    "action_type": "DELETE",
    "start_date": "2025-01-01T00:00:00Z",
    "end_date": "2025-01-31T23:59:59Z",
    "severity": "HIGH",
    "success": false,
    "ip_address": "192.168",
    "endpoint": "/products/",
    "limit": 100
  },
  "format": "pdf"
}
```

**Parámetros del body:**

| Campo | Tipo | Descripción | Valores | Requerido |
|-------|------|-------------|---------|-----------|
| `filters` | object | Filtros para el reporte | Ver abajo | No |
| `format` | string | Formato de salida | "json", "pdf", "excel" | Sí |

**Filtros disponibles en `filters`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `user` | string | Username parcial |
| `action_type` | string | Tipo de acción (AUTH, CREATE, etc.) |
| `start_date` | datetime | Fecha inicial |
| `end_date` | datetime | Fecha final |
| `severity` | string | Nivel de severidad |
| `success` | boolean | Solo exitosas/fallidas |
| `ip_address` | string | IP parcial |
| `endpoint` | string | Endpoint parcial |
| `limit` | integer | Máximo de registros (default: 1000) |

**Ejemplo Response (JSON):**
```json
{
  "report_type": "audit_log",
  "generated_at": "2025-01-15T17:00:00Z",
  "filters_applied": {
    "user": "john_doe",
    "action_type": "DELETE",
    "severity": "HIGH",
    "success": false
  },
  "statistics": {
    "total_records": 23,
    "total_errors": 23,
    "error_rate": 100.0,
    "unique_users": 1,
    "unique_ips": 2,
    "avg_response_time_ms": 45.67
  },
  "action_distribution": [
    {
      "action_type": "DELETE",
      "count": 23,
      "percentage": 100.0
    }
  ],
  "severity_distribution": [
    {
      "severity": "HIGH",
      "count": 23,
      "percentage": 100.0
    }
  ],
  "logs": [
    {
      "timestamp": "2025-01-15T10:30:45Z",
      "username": "john_doe",
      "action_type": "DELETE",
      "endpoint": "/api/sales/products/100/",
      "http_method": "DELETE",
      "response_status": 403,
      "success": false,
      "error_message": "Permission denied",
      "ip_address": "192.168.1.100",
      "severity": "HIGH"
    }
    // ... hasta 'limit' registros
  ]
}
```

**Response (PDF o Excel):**
- Retorna archivo binario para descarga
- Headers incluyen:
  - `Content-Type`: `application/pdf` o `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `Content-Disposition`: `attachment; filename="audit_report_20250115_170000.pdf"`

**Estructura del PDF:**
1. Título del reporte
2. Fecha de generación
3. Filtros aplicados (tabla)
4. Resumen estadístico (tabla)
5. Distribución por tipo de acción (tabla)
6. Distribución por severidad (tabla)
7. Tabla de logs (máximo 30 registros debido a limitaciones de espacio)

**Estructura del Excel:**
1. Hoja "Summary": Estadísticas y filtros
2. Hoja "Logs": Tabla completa de registros (sin límite de 30)

**Códigos de respuesta:**
- `200 OK` - Éxito (con archivo o JSON)
- `400 Bad Request` - Formato inválido o filtros incorrectos
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No es administrador

---

### 9. Generar Reporte de Sesiones

**Endpoint:** `POST /api/sales/audit/generate-session-report/`

**Descripción:** Genera un reporte de sesiones de usuario en formato JSON, PDF o Excel.

**Headers:**
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
Content-Type: application/json
```

**Request Body:**

```json
{
  "filters": {
    "user": "john_doe",
    "is_active": false,
    "start_date": "2025-01-01T00:00:00Z",
    "end_date": "2025-01-31T23:59:59Z",
    "limit": 500
  },
  "format": "excel"
}
```

**Parámetros del body:**

| Campo | Tipo | Descripción | Valores | Requerido |
|-------|------|-------------|---------|-----------|
| `filters` | object | Filtros para el reporte | Ver abajo | No |
| `format` | string | Formato de salida | "json", "pdf", "excel" | Sí |

**Filtros disponibles en `filters`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `user` | string | Username |
| `is_active` | boolean | Solo activas/inactivas |
| `start_date` | datetime | Fecha login inicial |
| `end_date` | datetime | Fecha login final |
| `limit` | integer | Máximo de registros (default: 500) |

**Ejemplo Response (JSON):**
```json
{
  "report_type": "user_session",
  "generated_at": "2025-01-15T17:00:00Z",
  "filters_applied": {
    "user": "john_doe",
    "is_active": false
  },
  "statistics": {
    "total_sessions": 45,
    "active_sessions": 0,
    "closed_sessions": 45,
    "avg_duration_minutes": 247.5
  },
  "sessions": [
    {
      "username": "john_doe",
      "ip_address": "192.168.1.100",
      "login_time": "2025-01-14T08:00:00Z",
      "logout_time": "2025-01-14T18:30:00Z",
      "duration_minutes": 630,
      "is_active": false
    }
    // ... hasta 'limit' registros
  ]
}
```

**Códigos de respuesta:**
- `200 OK` - Éxito
- `400 Bad Request` - Formato inválido
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No es administrador

---

## Mantenimiento

### 10. Limpiar Logs Antiguos

**Endpoint:** `POST /api/sales/audit/clean-old-logs/`

**Descripción:** Elimina logs antiguos para liberar espacio en base de datos.

**Headers:**
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
Content-Type: application/json
```

**Request Body:**

```json
{
  "days": 90,
  "confirm": true
}
```

**Parámetros:**

| Campo | Tipo | Descripción | Default | Mínimo |
|-------|------|-------------|---------|--------|
| `days` | integer | Días a conservar | 90 | 30 |
| `confirm` | boolean | Confirmación requerida | false | - |

**Ejemplo Response:**
```json
{
  "message": "Successfully deleted 15847 audit logs older than 90 days",
  "deleted_count": 15847,
  "cutoff_date": "2024-10-17T00:00:00Z"
}
```

**Validaciones:**
- Mínimo 30 días de retención
- Requiere `confirm: true` para ejecutar
- Sin confirmación, solo retorna conteo de lo que se eliminaría

**Ejemplo sin confirmación:**
```json
{
  "days": 90
}
```

Response:
```json
{
  "message": "15847 audit logs would be deleted. Set confirm=true to proceed.",
  "count": 15847,
  "cutoff_date": "2024-10-17T00:00:00Z"
}
```

**Códigos de respuesta:**
- `200 OK` - Éxito
- `400 Bad Request` - Días menor a 30 o falta confirmación
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No es administrador

---

## Filtros Avanzados

### Búsqueda Global

El parámetro `search` busca en múltiples campos simultáneamente:

**Para logs (`/logs/`):**
- `endpoint`
- `username`
- `action_description`
- `ip_address`

**Para sesiones (`/sessions/`):**
- `username`
- `ip_address`
- `session_key`

**Ejemplo:**
```http
GET /api/sales/audit/logs/?search=192.168
# Encuentra logs donde endpoint, username, description o IP contengan "192.168"
```

### Rangos de Fechas

**Opción 1: start_date + end_date**
```http
GET /api/sales/audit/logs/?start_date=2025-01-01T00:00:00Z&end_date=2025-01-31T23:59:59Z
```

**Opción 2: timestamp_range (alternativa)**
```http
GET /api/sales/audit/logs/?timestamp_range=2025-01-01T00:00:00Z,2025-01-31T23:59:59Z
```

### Rangos de Códigos HTTP

**Todos los errores 4xx:**
```http
GET /api/sales/audit/logs/?response_status_gte=400&response_status_lte=499
```

**Todos los errores 5xx:**
```http
GET /api/sales/audit/logs/?response_status_gte=500&response_status_lte=599
```

**Códigos específicos:**
```http
GET /api/sales/audit/logs/?response_status=404
```

### Múltiples Valores

Algunos filtros aceptan múltiples valores separados por coma:

**Múltiples tipos de acción:**
```http
GET /api/sales/audit/logs/?action_type=CREATE,UPDATE,DELETE
```

**Múltiples severidades:**
```http
GET /api/sales/audit/logs/?severity=HIGH,CRITICAL
```

**Múltiples métodos HTTP:**
```http
GET /api/sales/audit/logs/?http_method=POST,PUT,PATCH,DELETE
```

### Combinación de Filtros

Todos los filtros se pueden combinar con AND lógico:

```http
GET /api/sales/audit/logs/?action_type=DELETE&severity=HIGH&success=false&start_date=2025-01-01T00:00:00Z&user=john
# Retorna: Intentos fallidos de DELETE con severidad HIGH por usuarios que contengan "john" desde 2025-01-01
```

---

## Paginación

### Configuración por Defecto

- **Registros por página:** 50
- **Máximo permitido:** 500

### Parámetros

| Parámetro | Descripción | Default | Máximo |
|-----------|-------------|---------|--------|
| `page` | Número de página | 1 | - |
| `page_size` | Registros por página | 50 | 500 |

### Estructura de Response Paginada

```json
{
  "count": 15847,  // Total de registros
  "next": "http://servidor.com/api/sales/audit/logs/?page=3",  // Siguiente página
  "previous": "http://servidor.com/api/sales/audit/logs/?page=1",  // Página anterior
  "results": [
    // Array de registros
  ]
}
```

### Navegación

**Primera página:**
```http
GET /api/sales/audit/logs/?page=1
```

**Siguiente página:**
```http
GET /api/sales/audit/logs/?page=2
```

**Última página (calculada):**
```http
GET /api/sales/audit/logs/?page=317  // Si count=15847 y page_size=50
```

**Cambiar tamaño de página:**
```http
GET /api/sales/audit/logs/?page_size=100
```

---

## Códigos de Error

### Códigos HTTP

| Código | Significado | Causa Común |
|--------|-------------|-------------|
| `200 OK` | Éxito | Operación completada correctamente |
| `201 Created` | Creado | Recurso creado (no aplicable en auditoría, solo lectura) |
| `204 No Content` | Sin contenido | Eliminación exitosa (clean-old-logs) |
| `400 Bad Request` | Petición inválida | Parámetros incorrectos, formato inválido |
| `401 Unauthorized` | No autenticado | Token JWT faltante, inválido o expirado |
| `403 Forbidden` | Prohibido | Usuario no es administrador |
| `404 Not Found` | No encontrado | Recurso no existe (log ID, username, etc.) |
| `500 Internal Server Error` | Error del servidor | Error inesperado en el backend |

### Estructura de Errores

**Error 400 (Bad Request):**
```json
{
  "error": "Invalid format. Must be one of: json, pdf, excel",
  "detail": "Provided format 'txt' is not supported"
}
```

**Error 401 (Unauthorized):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

o

```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    {
      "token_class": "AccessToken",
      "token_type": "access",
      "message": "Token is invalid or expired"
    }
  ]
}
```

**Error 403 (Forbidden):**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**Error 404 (Not Found):**
```json
{
  "detail": "Not found."
}
```

**Error 500 (Internal Server Error):**
```json
{
  "detail": "An error occurred while processing your request.",
  "error": "Database connection failed"
}
```

---

## Mejores Prácticas

### 1. Optimización de Consultas

**Usar filtros específicos:**
```http
# Malo - Trae todo y filtra en frontend
GET /api/sales/audit/logs/

# Bueno - Filtra en backend
GET /api/sales/audit/logs/?user=john&action_type=DELETE&start_date=2025-01-01
```

### 2. Paginación Eficiente

**Usar page_size apropiado:**
```http
# Para tablas en UI - 50 registros
GET /api/sales/audit/logs/?page_size=50

# Para exportar - máximo 500
GET /api/sales/audit/logs/?page_size=500
```

### 3. Ordenamiento

**Logs más recientes primero:**
```http
GET /api/sales/audit/logs/?ordering=-timestamp
```

**Errores más lentos primero:**
```http
GET /api/sales/audit/logs/?success=false&ordering=-response_time_ms
```

### 4. Manejo de Tokens

**Renovar token antes de expiración:**
```javascript
// Verificar expiración cada petición
if (tokenWillExpireIn5Minutes()) {
  refreshToken();
}
```

### 5. Caché en Frontend

**Cachear estadísticas:**
```javascript
// Estadísticas cambian poco, cachear por 5 minutos
const stats = await fetchWithCache('/api/sales/audit/statistics/', 300);
```

### 6. Alertas en Tiempo Real

**Polling cada 1 minuto:**
```javascript
setInterval(async () => {
  const alerts = await fetch('/api/sales/audit/security-alerts/');
  if (alerts.total_alerts > 0) {
    showNotification(alerts);
  }
}, 60000); // 1 minuto
```

### 7. Reportes Grandes

**Usar Excel para datos extensos:**
```json
{
  "filters": {
    "start_date": "2025-01-01",
    "limit": 10000
  },
  "format": "excel"  // Excel no tiene límite de 30 registros como PDF
}
```

---

**Última actualización:** 2025-01-15
**Versión de API:** 1.0
**Mantenido por:** Equipo Backend
