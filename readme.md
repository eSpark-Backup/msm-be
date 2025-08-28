# MSM - API & MQTT Documentation

## 🌐 REST API Endpoints

### Device Management
- `GET    /api/devices` - List all devices
- `GET    /api/devices/:id` - Get device details
- `POST   /api/devices` - Create/Update device
- `DELETE /api/devices/:id` - Delete device

### Telemetry
- `GET /api/telemetry/latest/:deviceId` - Get latest telemetry
- `GET /api/telemetry/history/:deviceId` - Get telemetry history

### Commands
- `POST /api/commands/:deviceId` - Send command to device
- `GET  /api/commands/status/:commandId` - Get command status

## 📡 MQTT Topics

### Publish (Device → Server)
1. **Telemetry**
   - Topic: `msm/{deviceId}/telemetry`
   - Schema:
     ```json
     {
       "timestamp": "2025-07-24T00:33:00+05:00",
       "device_uuid": "ESP90000005",
       "channels": [
         {
           "ID": 1,
           "status": true,
           "temperature": 27.5,
           "data": {
             "phase_a": {
               "general": {
                 "line_voltage": 220.5,
                 "rms_voltage": 220.0,
                 "frequency": 50.0,
                 "current": 10.5
               },
               "power": {
                 "factor": 0.98,
                 "active": 2300.0,
                 "reactive": 450.0,
                 "apparent": 2345.0
               },
               "energy": {
                 "active": {
                   "positive": 1500.5,
                   "negative": 0.0
                 },
                 "reactive": {
                   "positive": 200.0,
                   "negative": 50.0
                 }
               }
             }
           }
         }
       ]
     }
     ```

2. **Status**
   - Topic: `msm/{deviceId}/status`
   - Schema:
     ```json
     {
       "status": "online/offline",
       "version": "1.0.0",
       "ip": "192.168.1.100",
       "timestamp": "2025-08-28T11:00:00.000Z"
     }
     ```

### Subscribe (Server → Device)
1. **Commands**
   - Topic: `msm/{deviceId}/commands`
   - Schema:
     ```json
     {
       "command": "reboot/update/config",
       "payload": {},
       "timestamp": "2025-08-28T11:00:00.000Z",
       "id": "command-unique-id"
     }
     ```

2. **Broadcast**
   - Topic: `msm/broadcast`
   - For sending messages to all devices