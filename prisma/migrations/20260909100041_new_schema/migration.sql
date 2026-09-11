/*
  Warnings:

  - You are about to drop the `GPS` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Route` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Source` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Stop` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tram` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "public";

-- DropForeignKey
ALTER TABLE "GPS" DROP CONSTRAINT "GPS_tripId_fkey";

-- DropForeignKey
ALTER TABLE "Stop" DROP CONSTRAINT "Stop_routeId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_routeId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_tramId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_userId_fkey";

-- DropTable
DROP TABLE "GPS";

-- DropTable
DROP TABLE "Route";

-- DropTable
DROP TABLE "Source";

-- DropTable
DROP TABLE "Stop";

-- DropTable
DROP TABLE "Tram";

-- DropTable
DROP TABLE "Trip";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(30) NOT NULL DEFAULT 'ADMIN',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "assigned_route_id" VARCHAR(50),
    "status" VARCHAR(50) NOT NULL DEFAULT 'inactive',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stops" (
    "id" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "location" geography,
    "image_url" VARCHAR(500),
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_stops" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "route_id" VARCHAR(50) NOT NULL,
    "stop_id" VARCHAR(50) NOT NULL,
    "stop_order" INTEGER NOT NULL,

    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vehicle_id" VARCHAR(50) NOT NULL,
    "route_id" VARCHAR(50) NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6),
    "status" VARCHAR(50) NOT NULL DEFAULT 'in_progress',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gps_tracks" (
    "id" BIGSERIAL NOT NULL,
    "trip_id" UUID NOT NULL,
    "vehicle_id" VARCHAR(50) NOT NULL,
    "location" geography,
    "speed" DECIMAL(5,2),
    "heading" DECIMAL(5,2),
    "station" TEXT,
    "source_id" VARCHAR(50),
    "recorded_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "gps_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_sources" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "vehicle_id" VARCHAR(50),
    "priority" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "secret_hash" VARCHAR(255),
    "credential_version" INTEGER NOT NULL DEFAULT 1,
    "credential_issued_at" TIMESTAMP(6),
    "credential_rotated_at" TIMESTAMP(6),
    "last_seen_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" VARCHAR(50),
    "vehicle_id" VARCHAR(50),
    "message" TEXT,
    "ip_address" INET,
    "status" VARCHAR(30) NOT NULL DEFAULT 'new',
    "assigned_to_id" UUID,
    "assigned_at" TIMESTAMP(6),
    "acknowledged_at" TIMESTAMP(6),
    "investigating_at" TIMESTAMP(6),
    "resolved_at" TIMESTAMP(6),
    "internal_note" TEXT,
    "deleted_at" TIMESTAMP(6),
    "deleted_by_id" UUID,
    "deletion_reason" VARCHAR(500),
    "restore_expires_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_audit_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "feedback_id" UUID NOT NULL,
    "actor_user_id" UUID,
    "action" VARCHAR(50) NOT NULL,
    "event_key" VARCHAR(50),
    "from_status" VARCHAR(30),
    "to_status" VARCHAR(30),
    "reason" VARCHAR(500),
    "occurred_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");

-- CreateIndex
CREATE INDEX "vehicles_assigned_route_id_idx" ON "vehicles"("assigned_route_id");

-- CreateIndex
CREATE INDEX "stops_status_idx" ON "stops"("status");

-- CreateIndex
CREATE INDEX "route_stops_route_id_idx" ON "route_stops"("route_id");

-- CreateIndex
CREATE INDEX "route_stops_stop_id_idx" ON "route_stops"("stop_id");

-- CreateIndex
CREATE UNIQUE INDEX "route_stops_route_id_stop_order_key" ON "route_stops"("route_id", "stop_order");

-- CreateIndex
CREATE INDEX "trips_vehicle_id_idx" ON "trips"("vehicle_id");

-- CreateIndex
CREATE INDEX "trips_route_id_idx" ON "trips"("route_id");

-- CreateIndex
CREATE INDEX "trips_status_idx" ON "trips"("status");

-- CreateIndex
CREATE INDEX "trips_start_time_idx" ON "trips"("start_time" DESC);

-- CreateIndex
CREATE INDEX "gps_tracks_trip_id_idx" ON "gps_tracks"("trip_id");

-- CreateIndex
CREATE INDEX "gps_tracks_vehicle_id_recorded_at_idx" ON "gps_tracks"("vehicle_id", "recorded_at" DESC);

-- CreateIndex
CREATE INDEX "gps_tracks_source_id_recorded_at_idx" ON "gps_tracks"("source_id", "recorded_at" DESC);

-- CreateIndex
CREATE INDEX "tracking_sources_vehicle_id_status_priority_id_idx" ON "tracking_sources"("vehicle_id", "status", "priority", "id");

-- CreateIndex
CREATE INDEX "tracking_sources_status_last_seen_at_idx" ON "tracking_sources"("status", "last_seen_at" DESC);

-- CreateIndex
CREATE INDEX "feedback_created_at_idx" ON "feedback"("created_at" DESC);

-- CreateIndex
CREATE INDEX "feedback_type_idx" ON "feedback"("type");

-- CreateIndex
CREATE INDEX "feedback_vehicle_id_idx" ON "feedback"("vehicle_id");

-- CreateIndex
CREATE INDEX "feedback_status_created_at_idx" ON "feedback"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "feedback_deleted_at_restore_expires_at_idx" ON "feedback"("deleted_at", "restore_expires_at");

-- CreateIndex
CREATE INDEX "feedback_audit_events_feedback_id_occurred_at_idx" ON "feedback_audit_events"("feedback_id", "occurred_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "feedback_audit_events_feedback_id_event_key_key" ON "feedback_audit_events"("feedback_id", "event_key");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_assigned_route_id_fkey" FOREIGN KEY ("assigned_route_id") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "stops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gps_tracks" ADD CONSTRAINT "gps_tracks_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gps_tracks" ADD CONSTRAINT "gps_tracks_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gps_tracks" ADD CONSTRAINT "gps_tracks_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "tracking_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_sources" ADD CONSTRAINT "tracking_sources_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
