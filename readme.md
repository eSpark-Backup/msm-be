# MSM - API & MQTT Documentation


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
