## 📡 MQTT Topics & Message Structures

### Topic Pattern
```
msm/{device_uuid}/{message_type}
```

### 1. 📊 Telemetry Data
**Topic:** `msm/{device_uuid}/telemetry`  
**Direction:** Device → Cloud  
**Frequency:** High-frequency publish

**Message Structure:**
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

### 2. 🔄 Reboot Commands
**Topic:** `msm/{device_uuid}/reboot`  
**Direction:** Cloud ↔ Device  
**Purpose:** Send reboot commands, receive status

**Message Structure:**
```json
{
  "device_uuid": "ESP90000005",
  "data": [
    {
      "command": true
    }
  ]
}
```

### 3. 📱 Device Information
**Topic:** `msm/{device_uuid}/device_info`  
**Direction:** Device → Cloud  
**Purpose:** Periodic device status updates

**Message Structure:**
```json
{
  "device_uuid": "ESP90000005",
  "data": [
    {
      "device_imei": "865788062388016",
      "device_ip": "10.99.72.185",
      "mqtt_status": true,
      "sftp_status": false
    }
  ]
}
```

### 4. 🕐 NTP Configuration
**Topic:** `msm/{device_uuid}/ntp`  
**Direction:** Cloud ↔ Device  
**Purpose:** Configure NTP servers, receive confirmations

**Message Structure:**
```json
{
  "device_uuid": "ESP90000005",
  "data": [
    {
      "server_1": "my.pool.ntp.org",
      "server_2": "0.asia.pool.ntp.org",
      "server_3": "1.asia.pool.ntp.org"
    }
  ]
}
```

### 5. 📡 MQTT Configuration
**Topic:** `msm/{device_uuid}/mqtt`  
**Direction:** Cloud ↔ Device  
**Purpose:** Send new broker credentials, receive confirmations

**Message Structure:**
```json
{
  "device_uuid": "ESP90000005",
  "data": [
    {
      "broker_ip": "thingsboard.cloud",
      "broker_port": 1883,
      "broker_user": "OFP-INDKOM",
      "broker_pass": "IND10",
      "data_interval": 900,
      "mqtt_topic": "v1/devices/me/telemetry"
    }
  ]
}
```

### 6. 📁 SFTP Configuration
**Topic:** `msm/{device_uuid}/sftp`  
**Direction:** Cloud ↔ Device  
**Purpose:** Send SFTP credentials, receive confirmations

**Message Structure:**
```json
{
  "device_uuid": "ESP90000005",
  "data": [
    {
      "server_ip": "ap-southeast-1.sftpcloud.io",
      "server_port": 22,
      "username": "ofp-msm",
      "password": "root123456",
      "data_interval": 900
    }
  ]
}
```