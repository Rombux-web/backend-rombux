# API de Rombux — Endpoints Contacto y Sorteo

Esta API proporciona endpoints para la gestión de contactos y participantes de sorteos.  
Puedes probar y explorar la documentación interactiva en Swagger visitando:  
`http://localhost:3000/api` (ajusta el puerto según tu configuración).

---

## Endpoints principales

### 1. **Crear un contacto**

- **POST /contact**
- **Descripción:** Registra un nuevo contacto con información personal y de interés.
- **Body (JSON):**
  ```json
  {
    "nombre": "Luis",
    "apellido": "Muñoz",
    "email": "luis.munoz@example.com",
    "empresa": "Rombux",
    "mensaje": "Me interesa el servicio de Growth.",
    "area_de_servicio": ["Growth", "Automatización"]
  }
  ```
- **Respuesta exitosa:**
  ```json
  {
    "id": 1,
    "nombre": "Luis",
    "apellido": "Muñoz",
    "email": "luis.munoz@example.com",
    "empresa": "Rombux",
    "mensaje": "Me interesa el servicio de Growth.",
    "area_de_servicio": ["Growth", "Automatización"],
    "createdAt": "2025-08-13T21:25:33.000Z"
  }
  ```
- **Errores comunes:**
  - `409 Conflict` si el email ya existe.

---

### 2. **Listar contactos (paginado)**

- **GET /contact?page=1&limit=10**
- **Descripción:** Obtiene una lista paginada de contactos registrados.
- **Parámetros:**
  - `page` (número de página, mínimo 1)
  - `limit` (cantidad de resultados por página, máximo 100)
- **Respuesta exitosa:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "nombre": "Luis",
        "apellido": "Muñoz",
        "email": "luis.munoz@example.com",
        "empresa": "Rombux",
        "mensaje": "Me interesa el servicio de Growth.",
        "area_de_servicio": ["Growth", "Automatización"],
        "createdAt": "2025-08-13T21:25:33.000Z"
      }
      // ...más contactos
    ],
    "total": 50,
    "page": 1,
    "last_page": 5
  }
  ```
- **Errores comunes:**
  - `409 Conflict` si los parámetros de paginación son inválidos.

---

### 3. **Crear participante de sorteo**

- **POST /raffle**
- **Descripción:** Registra un nuevo participante para el sorteo.
- **Body (JSON):**
  ```json
  {
    "email": "juan.perez@example.com"
  }
  ```
- **Respuesta exitosa:**
  ```json
  {
    "id": 1,
    "email": "juan.perez@example.com",
    "createdAt": "2025-08-13T21:25:33.000Z"
  }
  ```
- **Errores comunes:**
  - `409 Conflict` si el email ya existe.

---

### 4. **Listar participantes (paginado)**

- **GET /raffle?page=1&limit=10**
- **Descripción:** Obtiene una lista paginada de participantes registrados en el sorteo.
- **Parámetros:**
  - `page` (número de página, mínimo 1)
  - `limit` (cantidad de resultados por página, máximo 100)
- **Respuesta exitosa:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "email": "juan.perez@example.com",
        "createdAt": "2025-08-13T21:25:33.000Z"
      }
      // ...más participantes
    ],
    "total": 200,
    "page": 1,
    "last_page": 20
  }
  ```
- **Errores comunes:**
  - `409 Conflict` si los parámetros de paginación son inválidos.

---

## Autenticación

Actualmente, los endpoints son públicos para facilitar pruebas y desarrollo.  
Si tu aplicación requiere seguridad, considera implementar autenticación y autorización.

---

## Notas

- Todos los endpoints aceptan y responden en formato JSON.
- La documentación Swagger está disponible en `/docs`.

---

## Ejemplo de uso con `curl`

```bash
curl -X POST http://localhost:3000/contact \
  -H 'Content-Type: application/json' \
  -d '{
        "nombre": "Luis",
        "apellido": "Muñoz",
        "email": "luis.munoz@example.com",
        "empresa": "Rombux",
        "mensaje": "Interesado en Growth",
        "area_de_servicio": ["Growth"]
      }'
```

---

¿Dudas, sugerencias o quieres agregar más ejemplos?  
¡Contribuye o contacta al equipo de desarrollo!
