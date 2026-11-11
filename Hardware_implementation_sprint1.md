Compare Location Data from Three Devices

Allow admins to compare locations reported by LoRaWAN, ESP32, and a mobile phone on the same vehicle to see how far their reported positions differ.

MVP must support:

Match readings with nearby timestamps within an agreed time window.
Display locations from all three sources on a map and in a table.
Show the distance between each pair of locations in meters.
Mark missing readings as incomplete data.

Acceptance criteria: Results match the source data for the time range. Readings outside the agreed time window must not be matched.
This is AJ requirement

┌────────────────────────────────────────────────────────────────────────┐
│  [ Comparison Logs Table ]
│  ┌──────────┬──────────────┬──────────────┬──────────────┬──────────┐  │
│  │ Time     │ LoRaWAN      │ ESP32        │ Mobile       │ Max Diff │  │
│  ├──────────┼──────────────┼──────────────┼──────────────┼──────────┤  │
│  │ 09:00:30 │ 13.96,100.58 │ 13.96,100.58 │ 13.96,100.58 │ 3.4 m    │  │
│  │ 09:00:00 │ 13.96,100.58 │ 13.96,100.58 │ 13.96,100.58 │ 5.2 m    │  │
│  └──────────┴──────────────┴──────────────┴──────────────┴──────────┘  │
└────────────────────────────────────────────────────────────────────────┘

System Layer,Core MVP Feature,Purpose
Data Ingestion,GPS Sender,"A driver’s mobile app or an ESP32/IoT device sends latitude, longitude, and speed to the backend."
Real-time Engine,WebSocket / Socket.IO Hub,"The backend receives and validates location data, then broadcasts updates without requiring users to refresh the page."
Live Map UI,Rider Map,"A fast-loading web page displays stops, routes, and vehicle markers that move smoothly as locations update."
Master Data CRUD,Admin Data Management,"Admins can add, edit, and delete vehicles, stops, and routes without changing the code."
Basic ETA / Status,Vehicle Status and Estimated Arrival Time,"Show whether each vehicle is reporting live location data (Live), has outdated location data (Stale), or is out of service (No Service), and provide an approximate arrival time at stops."
