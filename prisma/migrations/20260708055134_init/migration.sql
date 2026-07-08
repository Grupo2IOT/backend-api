-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'AGRICULTOR', 'SUPERVISOR', 'INSTITUCION', 'TECNICO');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "WaterLevel" AS ENUM ('EMPTY', 'LOW', 'MEDIUM', 'FULL');

-- CreateEnum
CREATE TYPE "SystemHealth" AS ENUM ('OK', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CommandTarget" AS ENUM ('water_pump', 'fertilizer_pump');

-- CreateEnum
CREATE TYPE "CommandState" AS ENUM ('ON', 'OFF');

-- CreateEnum
CREATE TYPE "CommandStatus" AS ENUM ('pending', 'delivered', 'executed', 'rejected');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('HUMEDAD_BAJA', 'FERTILIDAD_BAJA', 'TANQUE_VACIO', 'SISTEMA_CON_PROBLEMAS', 'DISPOSITIVO_OFFLINE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('open', 'resolved');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "institutionName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "name" "RoleName" NOT NULL,
    "description" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "Plot" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "cropType" TEXT,
    "area" DECIMAL(12,2),
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlot" (
    "userId" UUID NOT NULL,
    "plotId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPlot_pkey" PRIMARY KEY ("userId","plotId")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" UUID NOT NULL,
    "deviceCode" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "firmwareVersion" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'OFFLINE',
    "lastSeenAt" TIMESTAMP(3),
    "plotId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Telemetry" (
    "id" UUID NOT NULL,
    "deviceId" UUID NOT NULL,
    "soilMoisture" DECIMAL(6,2),
    "soilFertility" DECIMAL(6,2),
    "soilTemperature" DECIMAL(6,2),
    "airTemperature" DECIMAL(6,2),
    "airHumidity" DECIMAL(6,2),
    "waterLevel" "WaterLevel",
    "waterPumpOn" BOOLEAN NOT NULL DEFAULT false,
    "fertilizerPumpOn" BOOLEAN NOT NULL DEFAULT false,
    "systemHealth" "SystemHealth" NOT NULL DEFAULT 'OK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Telemetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingCommand" (
    "id" UUID NOT NULL,
    "deviceId" UUID NOT NULL,
    "target" "CommandTarget" NOT NULL,
    "state" "CommandState" NOT NULL,
    "durationSec" INTEGER,
    "status" "CommandStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "executedAt" TIMESTAMP(3),

    CONSTRAINT "PendingCommand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" UUID NOT NULL,
    "plotId" UUID NOT NULL,
    "deviceId" UUID,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IrrigationRule" (
    "id" UUID NOT NULL,
    "plotId" UUID NOT NULL,
    "minSoilMoisture" DECIMAL(6,2) NOT NULL,
    "maxSoilMoisture" DECIMAL(6,2) NOT NULL,
    "autoIrrigationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "readingIntervalSec" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IrrigationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IrrigationEvent" (
    "id" UUID NOT NULL,
    "plotId" UUID NOT NULL,
    "deviceId" UUID,
    "commandId" UUID,
    "eventType" TEXT NOT NULL,
    "durationSec" INTEGER,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IrrigationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "plotId" UUID,
    "type" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE INDEX "Plot_ownerId_idx" ON "Plot"("ownerId");

-- CreateIndex
CREATE INDEX "Plot_createdAt_idx" ON "Plot"("createdAt");

-- CreateIndex
CREATE INDEX "UserPlot_plotId_idx" ON "UserPlot"("plotId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceCode_key" ON "Device"("deviceCode");

-- CreateIndex
CREATE INDEX "Device_plotId_idx" ON "Device"("plotId");

-- CreateIndex
CREATE INDEX "Device_status_idx" ON "Device"("status");

-- CreateIndex
CREATE INDEX "Device_lastSeenAt_idx" ON "Device"("lastSeenAt");

-- CreateIndex
CREATE INDEX "Telemetry_deviceId_createdAt_idx" ON "Telemetry"("deviceId", "createdAt");

-- CreateIndex
CREATE INDEX "Telemetry_createdAt_idx" ON "Telemetry"("createdAt");

-- CreateIndex
CREATE INDEX "Telemetry_systemHealth_idx" ON "Telemetry"("systemHealth");

-- CreateIndex
CREATE INDEX "Telemetry_waterLevel_idx" ON "Telemetry"("waterLevel");

-- CreateIndex
CREATE INDEX "PendingCommand_deviceId_status_createdAt_idx" ON "PendingCommand"("deviceId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "PendingCommand_status_createdAt_idx" ON "PendingCommand"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Alert_plotId_status_createdAt_idx" ON "Alert"("plotId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Alert_deviceId_idx" ON "Alert"("deviceId");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_type_idx" ON "Alert"("type");

-- CreateIndex
CREATE UNIQUE INDEX "IrrigationRule_plotId_key" ON "IrrigationRule"("plotId");

-- CreateIndex
CREATE INDEX "IrrigationEvent_plotId_startedAt_idx" ON "IrrigationEvent"("plotId", "startedAt");

-- CreateIndex
CREATE INDEX "IrrigationEvent_deviceId_startedAt_idx" ON "IrrigationEvent"("deviceId", "startedAt");

-- CreateIndex
CREATE INDEX "IrrigationEvent_commandId_idx" ON "IrrigationEvent"("commandId");

-- CreateIndex
CREATE INDEX "IrrigationEvent_createdAt_idx" ON "IrrigationEvent"("createdAt");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE INDEX "Report_plotId_idx" ON "Report"("plotId");

-- CreateIndex
CREATE INDEX "Report_type_generatedAt_idx" ON "Report"("type", "generatedAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plot" ADD CONSTRAINT "Plot_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlot" ADD CONSTRAINT "UserPlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlot" ADD CONSTRAINT "UserPlot_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Telemetry" ADD CONSTRAINT "Telemetry_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingCommand" ADD CONSTRAINT "PendingCommand_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IrrigationRule" ADD CONSTRAINT "IrrigationRule_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IrrigationEvent" ADD CONSTRAINT "IrrigationEvent_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IrrigationEvent" ADD CONSTRAINT "IrrigationEvent_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IrrigationEvent" ADD CONSTRAINT "IrrigationEvent_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "PendingCommand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
