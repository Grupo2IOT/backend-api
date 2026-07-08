const swaggerJsdoc = require("swagger-jsdoc");

const bearerSecurity = [{ bearerAuth: [] }];

const jsonBody = (schemaRef, required = true) => ({
  required,
  content: {
    "application/json": {
      schema: { $ref: `#/components/schemas/${schemaRef}` },
    },
  },
});

const responses = {
  ok: {
    description: "Operación exitosa",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ApiResponse" },
      },
    },
  },
  created: {
    description: "Recurso creado",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ApiResponse" },
      },
    },
  },
  error: {
    description: "Error de solicitud",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
};

const idParam = (name = "id", description = "UUID del recurso") => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "string", format: "uuid" },
});

const protectedOperation = (operation) => ({ security: bearerSecurity, ...operation });

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AquaEdge Backend API",
      version: "1.0.0",
      description: "Information Integration Layer for AquaEdge Web and Mobile applications.",
    },
    servers: [{ url: "/api", description: "API base path" }],
    tags: [
      { name: "Auth" },
      { name: "Users" },
      { name: "Roles" },
      { name: "Plots" },
      { name: "Devices" },
      { name: "Telemetry" },
      { name: "Commands" },
      { name: "Irrigation Rules" },
      { name: "Irrigation Events" },
      { name: "Alerts" },
      { name: "Reports" },
      { name: "Audit" },
      { name: "Edge Integration" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Pega el accessToken obtenido en /auth/login. Swagger enviará Authorization: Bearer <token>.",
        },
      },
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operación exitosa" },
            data: { type: "object", nullable: true },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error de validación" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "email" },
                  message: { type: "string", example: "Debe ser un email válido" },
                },
              },
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "admin@aquaedge.com" },
            password: { type: "string", format: "password", example: "Admin123456" },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "fullName"],
          properties: {
            email: { type: "string", format: "email", example: "agricultor@aquaedge.com" },
            password: { type: "string", format: "password", minLength: 8, example: "Usuario123456" },
            fullName: { type: "string", example: "Usuario AquaEdge" },
            phone: { type: "string", example: "+51999999999" },
            institutionName: { type: "string", example: "AquaEdge" },
            roles: {
              type: "array",
              items: { type: "string", enum: ["ADMIN", "AGRICULTOR", "SUPERVISOR", "INSTITUCION", "TECNICO"] },
              example: ["AGRICULTOR"],
            },
          },
        },
        UserRequest: {
          type: "object",
          required: ["email", "password", "fullName"],
          properties: {
            email: { type: "string", format: "email", example: "tecnico@aquaedge.com" },
            password: { type: "string", format: "password", minLength: 8, example: "Tecnico123456" },
            fullName: { type: "string", example: "Tecnico AquaEdge" },
            phone: { type: "string", example: "+51988888888" },
            institutionName: { type: "string", example: "AquaEdge" },
            isActive: { type: "boolean", example: true },
            roles: {
              type: "array",
              items: { type: "string", enum: ["ADMIN", "AGRICULTOR", "SUPERVISOR", "INSTITUCION", "TECNICO"] },
              example: ["TECNICO"],
            },
          },
        },
        UserUpdateRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email", example: "usuario.actualizado@aquaedge.com" },
            password: { type: "string", format: "password", minLength: 8, example: "NuevoPass123456" },
            fullName: { type: "string", example: "Usuario Actualizado" },
            phone: { type: "string", example: "+51977777777" },
            institutionName: { type: "string", example: "AquaEdge" },
            isActive: { type: "boolean", example: true },
            roles: {
              type: "array",
              items: { type: "string", enum: ["ADMIN", "AGRICULTOR", "SUPERVISOR", "INSTITUCION", "TECNICO"] },
              example: ["SUPERVISOR"],
            },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            isActive: { type: "boolean" },
            profile: { type: "object" },
            roles: { type: "array", items: { type: "object" } },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        PlotRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Parcela Norte" },
            location: { type: "string", example: "Lima, Perú" },
            cropType: { type: "string", example: "Palta" },
            area: { type: "number", minimum: 0, example: 12.5 },
            ownerId: { type: "string", format: "uuid", example: "00000000-0000-0000-0000-000000000000" },
          },
        },
        PlotUpdateRequest: {
          type: "object",
          properties: {
            name: { type: "string", example: "Parcela Norte Actualizada" },
            location: { type: "string", example: "Lima, Perú" },
            cropType: { type: "string", example: "Arándano" },
            area: { type: "number", minimum: 0, example: 13.2 },
            ownerId: { type: "string", format: "uuid" },
          },
        },
        DeviceRequest: {
          type: "object",
          required: ["deviceCode", "deviceName", "plotId"],
          properties: {
            deviceCode: { type: "string", example: "AQE-ESP32-001" },
            deviceName: { type: "string", example: "Nodo riego 001" },
            firmwareVersion: { type: "string", example: "1.0.0" },
            status: { type: "string", enum: ["ONLINE", "OFFLINE", "MAINTENANCE"], example: "OFFLINE" },
            lastSeenAt: { type: "string", format: "date-time" },
            plotId: { type: "string", format: "uuid", example: "00000000-0000-0000-0000-000000000000" },
          },
        },
        DeviceUpdateRequest: {
          type: "object",
          properties: {
            deviceCode: { type: "string", example: "AQE-ESP32-001" },
            deviceName: { type: "string", example: "Nodo riego principal" },
            firmwareVersion: { type: "string", example: "1.0.1" },
            status: { type: "string", enum: ["ONLINE", "OFFLINE", "MAINTENANCE"], example: "ONLINE" },
            lastSeenAt: { type: "string", format: "date-time" },
            plotId: { type: "string", format: "uuid" },
          },
        },
        CommandRequest: {
          type: "object",
          required: ["deviceId", "target", "state"],
          properties: {
            deviceId: { type: "string", format: "uuid", example: "00000000-0000-0000-0000-000000000000" },
            target: { type: "string", enum: ["water_pump", "fertilizer_pump"], example: "water_pump" },
            state: { type: "string", enum: ["ON", "OFF"], example: "ON" },
            durationSec: { type: "integer", minimum: 1, example: 30 },
          },
        },
        IrrigationRuleRequest: {
          type: "object",
          required: ["plotId", "minSoilMoisture", "maxSoilMoisture"],
          properties: {
            plotId: { type: "string", format: "uuid", example: "00000000-0000-0000-0000-000000000000" },
            minSoilMoisture: { type: "number", minimum: 0, maximum: 100, example: 30 },
            maxSoilMoisture: { type: "number", minimum: 0, maximum: 100, example: 70 },
            autoIrrigationEnabled: { type: "boolean", example: true },
            readingIntervalSec: { type: "integer", minimum: 1, example: 60 },
          },
        },
        AlertRequest: {
          type: "object",
          required: ["plotId", "type", "severity", "title", "message"],
          properties: {
            plotId: { type: "string", format: "uuid", example: "00000000-0000-0000-0000-000000000000" },
            deviceId: { type: "string", format: "uuid", nullable: true },
            type: {
              type: "string",
              enum: ["HUMEDAD_BAJA", "FERTILIDAD_BAJA", "TANQUE_VACIO", "SISTEMA_CON_PROBLEMAS", "DISPOSITIVO_OFFLINE", "CUSTOM"],
              example: "CUSTOM",
            },
            severity: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], example: "MEDIUM" },
            title: { type: "string", example: "Revisión requerida" },
            message: { type: "string", example: "Se requiere inspección de la parcela" },
            status: { type: "string", enum: ["open", "resolved"], example: "open" },
          },
        },
        ReportRequest: {
          type: "object",
          required: ["type", "periodStart", "periodEnd"],
          properties: {
            userId: { type: "string", format: "uuid", nullable: true },
            plotId: { type: "string", format: "uuid", nullable: true },
            type: { type: "string", example: "water-usage" },
            periodStart: { type: "string", format: "date-time", example: "2026-07-01T00:00:00.000Z" },
            periodEnd: { type: "string", format: "date-time", example: "2026-07-31T23:59:59.000Z" },
            metadata: {
              type: "object",
              example: { source: "web-app", notes: "Reporte mensual" },
            },
          },
        },
        EdgeReading: {
          type: "object",
          description: "Fila devuelta por GET /api/v1/readings del Edge API.",
          properties: {
            id: { type: "integer", example: 42 },
            received_at: { type: "string", example: "2026-07-08 14:30:00" },
            device_id: { type: "string", example: "aquaedge-01" },
            firmware_version: { type: "string", example: "1.1.0" },
            tick_count: { type: "integer", example: 120 },
            timestamp_utc: { type: "string", nullable: true, example: "2026-07-08T19:30:00Z" },
            wifi_rssi_dbm: { type: "integer", example: -62 },
            soil_moisture_value: { type: "number", nullable: true, example: 45.2 },
            soil_fertility_value: { type: "number", nullable: true, example: 3.8 },
            soil_temp_value: { type: "number", nullable: true, example: 22.5 },
            air_temp_value: { type: "number", nullable: true, example: 24.1 },
            air_humidity_value: { type: "number", nullable: true, example: 67 },
            water_level_status: { type: "string", nullable: true, example: "SUFFICIENT" },
            water_pump_state: { type: "string", enum: ["ON", "OFF"], example: "OFF" },
            fertilizer_pump_state: { type: "string", enum: ["ON", "OFF"], example: "OFF" },
            system_health_overall: { type: "string", example: "HEALTHY" },
            failed_sensors: { type: "array", items: { type: "string" } },
            pending_commands: { type: "array", items: { type: "object" } },
          },
        },
        EdgeSyncRequest: {
          type: "object",
          properties: {
            device_id: { type: "string", example: "aquaedge-01" },
            limit: { type: "integer", minimum: 1, maximum: 1000, default: 100 },
          },
        },
      },
    },
    paths: {
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Registrar usuario",
          security: [],
          requestBody: jsonBody("RegisterRequest"),
          responses: { 201: responses.created, 409: responses.error, 422: responses.error },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Iniciar sesión",
          description: "Devuelve accessToken y refreshToken. Copia accessToken y úsalo en el botón Authorize.",
          security: [],
          requestBody: jsonBody("LoginRequest"),
          responses: { 200: responses.ok, 401: responses.error, 422: responses.error },
        },
      },
      "/auth/logout": {
        post: protectedOperation({
          tags: ["Auth"],
          summary: "Cerrar sesión",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { type: "object", example: {} },
              },
            },
          },
          responses: { 200: responses.ok, 401: responses.error },
        }),
      },
      "/auth/me": {
        get: protectedOperation({ tags: ["Auth"], summary: "Usuario autenticado", responses: { 200: responses.ok, 401: responses.error } }),
      },
      "/users": {
        get: protectedOperation({ tags: ["Users"], summary: "Listar usuarios", responses: { 200: responses.ok, 403: responses.error } }),
        post: protectedOperation({
          tags: ["Users"],
          summary: "Crear usuario",
          requestBody: jsonBody("UserRequest"),
          responses: { 201: responses.created, 403: responses.error, 422: responses.error },
        }),
      },
      "/users/{id}": {
        get: protectedOperation({ tags: ["Users"], summary: "Obtener usuario", parameters: [idParam()], responses: { 200: responses.ok, 404: responses.error } }),
        put: protectedOperation({
          tags: ["Users"],
          summary: "Editar usuario",
          parameters: [idParam()],
          requestBody: jsonBody("UserUpdateRequest"),
          responses: { 200: responses.ok, 403: responses.error, 404: responses.error, 422: responses.error },
        }),
        delete: protectedOperation({ tags: ["Users"], summary: "Eliminar usuario", parameters: [idParam()], responses: { 200: responses.ok, 403: responses.error, 404: responses.error } }),
      },
      "/users/{id}/roles": {
        post: protectedOperation({
          tags: ["Roles"],
          summary: "Asignar rol a usuario",
          parameters: [idParam("id", "UUID del usuario")],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["role"],
                  properties: {
                    role: {
                      type: "string",
                      enum: ["ADMIN", "AGRICULTOR", "SUPERVISOR", "INSTITUCION", "TECNICO"],
                    },
                  },
                },
              },
            },
          },
          responses: { 201: responses.created, 403: responses.error, 422: responses.error },
        }),
      },
      "/users/{id}/roles/{roleId}": {
        delete: protectedOperation({
          tags: ["Roles"],
          summary: "Retirar rol de usuario",
          parameters: [
            idParam("id", "UUID del usuario"),
            idParam("roleId", "UUID del rol"),
          ],
          responses: { 200: responses.ok, 403: responses.error, 404: responses.error, 422: responses.error },
        }),
      },
      "/roles": {
        get: protectedOperation({ tags: ["Roles"], summary: "Listar roles", responses: { 200: responses.ok, 403: responses.error } }),
      },
      "/plots": {
        get: protectedOperation({ tags: ["Plots"], summary: "Listar parcelas", responses: { 200: responses.ok, 401: responses.error } }),
        post: protectedOperation({
          tags: ["Plots"],
          summary: "Crear parcela",
          requestBody: jsonBody("PlotRequest"),
          responses: { 201: responses.created, 403: responses.error, 422: responses.error },
        }),
      },
      "/plots/{id}": {
        get: protectedOperation({ tags: ["Plots"], summary: "Obtener parcela", parameters: [idParam()], responses: { 200: responses.ok, 404: responses.error } }),
        put: protectedOperation({
          tags: ["Plots"],
          summary: "Editar parcela",
          parameters: [idParam()],
          requestBody: jsonBody("PlotUpdateRequest"),
          responses: { 200: responses.ok, 403: responses.error, 404: responses.error, 422: responses.error },
        }),
        delete: protectedOperation({ tags: ["Plots"], summary: "Eliminar parcela", parameters: [idParam()], responses: { 200: responses.ok, 403: responses.error, 404: responses.error } }),
      },
      "/plots/{id}/assign-user": {
        post: protectedOperation({
          tags: ["Plots"],
          summary: "Asignar usuario a parcela",
          parameters: [idParam()],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["userId"],
                  properties: { userId: { type: "string", format: "uuid" } },
                },
              },
            },
          },
          responses: { 201: responses.created, 403: responses.error, 422: responses.error },
        }),
      },
      "/devices": {
        get: protectedOperation({ tags: ["Devices"], summary: "Listar dispositivos", responses: { 200: responses.ok, 401: responses.error } }),
        post: protectedOperation({
          tags: ["Devices"],
          summary: "Registrar dispositivo",
          requestBody: jsonBody("DeviceRequest"),
          responses: { 201: responses.created, 403: responses.error, 422: responses.error },
        }),
      },
      "/devices/{id}": {
        get: protectedOperation({ tags: ["Devices"], summary: "Obtener dispositivo", parameters: [idParam()], responses: { 200: responses.ok, 404: responses.error } }),
        put: protectedOperation({
          tags: ["Devices"],
          summary: "Editar dispositivo",
          parameters: [idParam()],
          requestBody: jsonBody("DeviceUpdateRequest"),
          responses: { 200: responses.ok, 403: responses.error, 404: responses.error, 422: responses.error },
        }),
        delete: protectedOperation({ tags: ["Devices"], summary: "Eliminar dispositivo", parameters: [idParam()], responses: { 200: responses.ok, 403: responses.error, 404: responses.error } }),
      },
      "/telemetry/latest": {
        get: protectedOperation({ tags: ["Telemetry"], summary: "Consultar telemetría reciente y generar alertas lógicas", responses: { 200: responses.ok, 401: responses.error } }),
      },
      "/telemetry/history": {
        get: protectedOperation({ tags: ["Telemetry"], summary: "Consultar historial de telemetría", responses: { 200: responses.ok, 401: responses.error } }),
      },
      "/telemetry/device/{deviceId}": {
        get: protectedOperation({
          tags: ["Telemetry"],
          summary: "Consultar telemetría por dispositivo",
          parameters: [idParam("deviceId", "UUID del dispositivo")],
          responses: { 200: responses.ok, 422: responses.error },
        }),
      },
      "/telemetry/plot/{plotId}": {
        get: protectedOperation({
          tags: ["Telemetry"],
          summary: "Consultar telemetría por parcela",
          parameters: [idParam("plotId", "UUID de la parcela")],
          responses: { 200: responses.ok, 422: responses.error },
        }),
      },
      "/commands": {
        get: protectedOperation({ tags: ["Commands"], summary: "Listar comandos", responses: { 200: responses.ok, 401: responses.error } }),
        post: protectedOperation({
          tags: ["Commands"],
          summary: "Crear comando pendiente",
          requestBody: jsonBody("CommandRequest"),
          responses: { 201: responses.created, 403: responses.error, 422: responses.error },
        }),
      },
      "/commands/pending": {
        get: protectedOperation({ tags: ["Commands"], summary: "Listar comandos pendientes", responses: { 200: responses.ok, 401: responses.error } }),
      },
      "/commands/device/{deviceId}": {
        get: protectedOperation({
          tags: ["Commands"],
          summary: "Listar comandos por dispositivo",
          parameters: [idParam("deviceId", "UUID del dispositivo")],
          responses: { 200: responses.ok, 422: responses.error },
        }),
      },
      "/commands/{id}/status": {
        put: protectedOperation({
          tags: ["Commands"],
          summary: "Actualizar estado de comando",
          parameters: [idParam()],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: { type: "string", enum: ["pending", "delivered", "executed", "rejected"], example: "delivered" },
                    deliveredAt: { type: "string", format: "date-time" },
                    executedAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          responses: { 200: responses.ok, 403: responses.error, 422: responses.error },
        }),
      },
      "/irrigation-rules": {
        get: protectedOperation({ tags: ["Irrigation Rules"], summary: "Listar reglas", responses: { 200: responses.ok, 401: responses.error } }),
        post: protectedOperation({
          tags: ["Irrigation Rules"],
          summary: "Crear regla",
          requestBody: jsonBody("IrrigationRuleRequest"),
          responses: { 201: responses.created, 403: responses.error, 422: responses.error },
        }),
      },
      "/irrigation-rules/plot/{plotId}": {
        get: protectedOperation({
          tags: ["Irrigation Rules"],
          summary: "Regla por parcela",
          parameters: [idParam("plotId", "UUID de la parcela")],
          responses: { 200: responses.ok, 422: responses.error },
        }),
      },
      "/irrigation-rules/{id}": {
        put: protectedOperation({
          tags: ["Irrigation Rules"],
          summary: "Editar regla",
          parameters: [idParam()],
          requestBody: jsonBody("IrrigationRuleRequest"),
          responses: { 200: responses.ok, 403: responses.error, 404: responses.error, 422: responses.error },
        }),
        delete: protectedOperation({ tags: ["Irrigation Rules"], summary: "Eliminar regla", parameters: [idParam()], responses: { 200: responses.ok, 403: responses.error, 404: responses.error } }),
      },
      "/irrigation-events": {
        get: protectedOperation({ tags: ["Irrigation Events"], summary: "Listar eventos de riego", responses: { 200: responses.ok, 401: responses.error } }),
      },
      "/irrigation-events/plot/{plotId}": {
        get: protectedOperation({
          tags: ["Irrigation Events"],
          summary: "Eventos por parcela",
          parameters: [idParam("plotId", "UUID de la parcela")],
          responses: { 200: responses.ok, 422: responses.error },
        }),
      },
      "/irrigation-events/device/{deviceId}": {
        get: protectedOperation({
          tags: ["Irrigation Events"],
          summary: "Eventos por dispositivo",
          parameters: [idParam("deviceId", "UUID del dispositivo")],
          responses: { 200: responses.ok, 422: responses.error },
        }),
      },
      "/alerts": {
        get: protectedOperation({ tags: ["Alerts"], summary: "Listar alertas", responses: { 200: responses.ok, 401: responses.error } }),
        post: protectedOperation({
          tags: ["Alerts"],
          summary: "Crear alerta",
          requestBody: jsonBody("AlertRequest"),
          responses: { 201: responses.created, 403: responses.error, 422: responses.error },
        }),
      },
      "/alerts/{id}": {
        get: protectedOperation({ tags: ["Alerts"], summary: "Obtener alerta", parameters: [idParam()], responses: { 200: responses.ok, 404: responses.error } }),
        put: protectedOperation({
          tags: ["Alerts"],
          summary: "Editar alerta",
          parameters: [idParam()],
          requestBody: jsonBody("AlertRequest"),
          responses: { 200: responses.ok, 403: responses.error, 404: responses.error, 422: responses.error },
        }),
        delete: protectedOperation({ tags: ["Alerts"], summary: "Eliminar alerta", parameters: [idParam()], responses: { 200: responses.ok, 403: responses.error, 404: responses.error } }),
      },
      "/alerts/{id}/resolve": {
        put: protectedOperation({ tags: ["Alerts"], summary: "Resolver alerta", parameters: [idParam()], responses: { 200: responses.ok, 403: responses.error, 404: responses.error } }),
      },
      "/reports/water-usage": {
        get: protectedOperation({ tags: ["Reports"], summary: "Reporte de uso de agua", responses: { 200: responses.ok, 401: responses.error } }),
      },
      "/reports/events": {
        get: protectedOperation({ tags: ["Reports"], summary: "Reporte de eventos", responses: { 200: responses.ok, 401: responses.error } }),
      },
      "/reports/alerts": {
        get: protectedOperation({ tags: ["Reports"], summary: "Reporte de alertas", responses: { 200: responses.ok, 401: responses.error } }),
      },
      "/reports": {
        post: protectedOperation({
          tags: ["Reports"],
          summary: "Persistir reporte generado",
          requestBody: jsonBody("ReportRequest"),
          responses: { 201: responses.created, 403: responses.error, 422: responses.error },
        }),
      },
      "/audit-logs": {
        get: protectedOperation({ tags: ["Audit"], summary: "Listar auditoría", responses: { 200: responses.ok, 403: responses.error } }),
      },
      "/edge/health": {
        get: protectedOperation({
          tags: ["Edge Integration"],
          summary: "Consultar GET /health del Edge API",
          responses: { 200: responses.ok, 401: responses.error, 403: responses.error, 502: responses.error, 504: responses.error },
        }),
      },
      "/edge/readings": {
        get: protectedOperation({
          tags: ["Edge Integration"],
          summary: "Consultar lecturas crudas del Edge API",
          parameters: [
            { name: "device_id", in: "query", schema: { type: "string" }, example: "aquaedge-01" },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 1000, default: 100 } },
          ],
          responses: {
            200: {
              description: "Lecturas devueltas por el Edge API",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Edge readings retrieved successfully" },
                      data: { type: "array", items: { $ref: "#/components/schemas/EdgeReading" } },
                    },
                  },
                },
              },
            },
            401: responses.error,
            403: responses.error,
            502: responses.error,
            504: responses.error,
          },
        }),
      },
      "/edge/sync": {
        post: protectedOperation({
          tags: ["Edge Integration"],
          summary: "Sincronizar lecturas Edge con Supabase PostgreSQL",
          requestBody: jsonBody("EdgeSyncRequest", false),
          responses: { 200: responses.ok, 401: responses.error, 403: responses.error, 502: responses.error, 504: responses.error },
        }),
      },
      "/edge/status": {
        get: protectedOperation({
          tags: ["Edge Integration"],
          summary: "Consultar estado del adaptador y última sincronización",
          responses: { 200: responses.ok, 401: responses.error, 403: responses.error },
        }),
      },
      "/edge/statistics": {
        get: protectedOperation({
          tags: ["Edge Integration"],
          summary: "Resumir telemetría, comandos, alertas, dispositivos y última sincronización",
          responses: { 200: responses.ok, 401: responses.error, 403: responses.error },
        }),
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
