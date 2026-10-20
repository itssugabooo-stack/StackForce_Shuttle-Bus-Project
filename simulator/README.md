# Vehicle Simulator

This simulator sends test GPS positions to the backend over Socket.IO so the real-time pipeline can be verified without a mobile device.

## Quick web simulator

Open the browser UI:

```bash
cd simulator
python3 -m http.server 8001
```

Then open:

http://localhost:8001/vehicle-simulator.html

This page does the remaining realtime tasks:

1. Load routes from the backend
2. Select a route
3. Display route stops in stop order
4. Draw the route path on the map
5. Connect to Socket.IO
6. Receive backend vehicle updates
7. Push simulated vehicle positions to the backend
8. Update the vehicle marker on the map in real time

## Console runner

From the project root:

```bash
npm run simulator
```

Optional environment overrides:

```bash
BACKEND_URL=http://localhost:5003 ROUTE_ID=R01 VEHICLE_ID=V_SIM_01 npm run simulator
```

## Behavior

- creates the simulator vehicle if it does not already exist
- loads the selected route's stops and uses real coordinates from the backend
- joins the selected route
- emits a moving GPS position every 2.5 seconds through the `location:update` Socket.IO event
- the backend broadcasts the data to client listeners

## Expected result

The public web app should show the simulated vehicle moving on the selected route in real time.
