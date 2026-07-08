# AquaEdge Backend API

Backend REST de AquaEdge para la **Information Integration Layer**. Expone APIs para Web App y Mobile App, integra usuarios, parcelas, dispositivos, telemetría existente, comandos, reglas, alertas, reportes y auditoría usando Supabase PostgreSQL mediante Prisma.

Este proyecto **no reemplaza el Edge API**, **no recibe telemetría directa del ESP32** y **no controla hardware directamente**.

## Rol en la arquitectura IoT

Flujos esperados:

```text
ESP32 / mockup-iot-service / Edge API -> Supabase PostgreSQL
React / Mobile App -> Backend API -> Supabase PostgreSQL
```

Capas:

- Physical Layer: ESP32, sensores, actuadores, bombas.
- Data Exchange Layer: Edge API existente para telemetría, API Key de hardware y comandos hacia dispositivos.
- Information Integration Layer: este backend.
- Application Service Layer: React + Vite y Mobile App.
- Cloud Database: Supabase PostgreSQL.

## Stack

- Node.js
- Express
- Prisma ORM
- Supabase PostgreSQL
- JWT y refresh token
- bcrypt
- dotenv
- cors
- helmet
- morgan
- cookie-parser
- express-validator
- Swagger

## Instalación local

```bash
npm install
```

Crea un archivo `.env` tomando como base `.env.example`:

```env
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
JWT_SECRET="replace-with-a-strong-access-token-secret"
JWT_REFRESH_SECRET="replace-with-a-strong-refresh-token-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

## Prisma

Generar cliente:

```bash
npm run prisma:generate
```

Crear migración local contra Supabase PostgreSQL:

```bash
npm run prisma:migrate
```

## Ejecución

Desarrollo:

```bash
npm run dev
```

Producción:

```bash
npm start
```

Health check:

```text
GET /health
```

Swagger:

```text
GET /api/docs
```

## Endpoints principales

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Usuarios y roles:

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/roles`
- `POST /api/users/:id/roles`
- `DELETE /api/users/:id/roles/:roleId`

Parcelas:

- `GET /api/plots`
- `GET /api/plots/:id`
- `POST /api/plots`
- `PUT /api/plots/:id`
- `DELETE /api/plots/:id`
- `POST /api/plots/:id/assign-user`

Dispositivos:

- `GET /api/devices`
- `GET /api/devices/:id`
- `POST /api/devices`
- `PUT /api/devices/:id`
- `DELETE /api/devices/:id`

Telemetría:

- `GET /api/telemetry/latest`
- `GET /api/telemetry/history`
- `GET /api/telemetry/device/:deviceId`
- `GET /api/telemetry/plot/:plotId`

No existe `POST /api/telemetry`: la telemetría debe venir del Edge API o mockup IoT service.

Comandos:

- `POST /api/commands`
- `GET /api/commands`
- `GET /api/commands/pending`
- `GET /api/commands/device/:deviceId`
- `PUT /api/commands/:id/status`

Reglas, eventos, alertas, reportes y auditoría:

- `GET /api/irrigation-rules`
- `GET /api/irrigation-rules/plot/:plotId`
- `POST /api/irrigation-rules`
- `PUT /api/irrigation-rules/:id`
- `DELETE /api/irrigation-rules/:id`
- `GET /api/irrigation-events`
- `GET /api/irrigation-events/plot/:plotId`
- `GET /api/irrigation-events/device/:deviceId`
- `GET /api/alerts`
- `GET /api/alerts/:id`
- `POST /api/alerts`
- `PUT /api/alerts/:id`
- `PUT /api/alerts/:id/resolve`
- `DELETE /api/alerts/:id`
- `GET /api/reports/water-usage`
- `GET /api/reports/events`
- `GET /api/reports/alerts`
- `POST /api/reports`
- `GET /api/audit-logs`

## Respuestas JSON

Éxito:

```json
{
  "success": true,
  "message": "Mensaje",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Mensaje de error",
  "errors": []
}
```

## Despliegue recomendado en Render

1. Crear un Web Service apuntando a este repositorio.
2. Configurar `DATABASE_URL` con la cadena de conexión de Supabase PostgreSQL.
3. Configurar `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` y `CORS_ORIGIN`.
4. Build command: `npm install && npm run prisma:generate`.
5. Start command: `npm start`.
6. Ejecutar migraciones desde entorno controlado con `npm run prisma:migrate`.

## Supabase PostgreSQL

Usa Supabase únicamente como PostgreSQL gestionado. Este backend no usa Supabase Auth ni Supabase SDK para autenticación; la autenticación Web/Mobile es propia con bcrypt y JWT.
