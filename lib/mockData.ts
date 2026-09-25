import type { Route, Stop } from "../types";

// Temporary stand-in for GET /api/routes and GET /api/routes/:id/stops.
// Delete this file (and the USE_MOCK branch in api.ts) once the Backend
// exposes real Route/Stop endpoints — see the [Sprint 01] question raised
// in #ask-mentor.

export const mockRoutes: Route[] = [
  { id: 1, routeCode: "R1", name: "Main Campus Loop", active: true },
  { id: 2, routeCode: "R2", name: "Sports Complex Shuttle", active: true },
];

export const mockStopsByRoute: Record<string, Stop[]> = {
  "1": [
    { id: 1, name: "Main Gate", nameEn: "Main Gate", nameTh: "ประตูหลัก", latitude: 14.0311, longitude: 100.6068, sequence: 1 },
    { id: 2, name: "Library", nameEn: "Library", nameTh: "หอสมุด", latitude: 14.0325, longitude: 100.6082, sequence: 2 },
    { id: 3, name: "Engineering Building", nameEn: "Engineering Building", nameTh: "อาคารวิศวกรรมศาสตร์", latitude: 14.0338, longitude: 100.6101, sequence: 3 },
    { id: 4, name: "Dormitory Zone", nameEn: "Dormitory Zone", nameTh: "เขตหอพัก", latitude: 14.0352, longitude: 100.6075, sequence: 4 },
  ],
  "2": [
    { id: 1, name: "Main Gate", nameEn: "Main Gate", nameTh: "ประตูหลัก", latitude: 14.0311, longitude: 100.6068, sequence: 1 },
    { id: 5, name: "Sports Complex", nameEn: "Sports Complex", nameTh: "ศูนย์กีฬา", latitude: 14.029, longitude: 100.6045, sequence: 2 },
    { id: 6, name: "Student Center", nameEn: "Student Center", nameTh: "ศูนย์กิจกรรมนักศึกษา", latitude: 14.0301, longitude: 100.6058, sequence: 3 },
  ],
};
