# MSM - Machine State Monitoring API & MQTT Documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- MongoDB
- AWS IoT Core credentials
- Environment variables configured

### Installation
```bash
npm install
cp .env.example .env  # Configure your environment
node server.js
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Device Command APIs

#### 1. 🔄 Reboot Device
**POST** `/devices/:deviceId/reboot`

```bash
curl -X POST http://localhost:3000/api/devices/ESP90000005/reboot
```

**Response:**
```json
{
  "success": true,
  "message": "Reboot command sent successfully",
  "deviceId": "ESP90000005",
  "topic": "msm/ESP90000005/reboot"
}
```

#### 2. 🕐 Configure NTP Servers
**POST** `/devices/:deviceId/ntp`

**Request Body:**
```json
{
  "server_1": "my.pool.ntp.org",
  "server_2": "0.asia.pool.ntp.org",
  "server_3": "1.asia.pool.ntp.org"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/devices/ESP90000005/ntp \
  -H "Content-Type: application/json" \
  -d '{
    "server_1": "my.pool.ntp.org",
    "server_2": "0.asia.pool.ntp.org",
    "server_3": "1.asia.pool.ntp.org"
  }'
```

#### 3. 📡 Configure MQTT Broker
**POST** `/devices/:deviceId/mqtt`

**Request Body:**
```json
{
  "broker_ip": "thingsboard.cloud",
  "broker_port": 1883,
  "broker_user": "OFP-INDKOM",
  "broker_pass": "IND10",
  "data_interval": 900,
  "mqtt_topic": "v1/devices/me/telemetry"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/devices/ESP90000005/mqtt \
  -H "Content-Type: application/json" \
  -d '{
    "broker_ip": "thingsboard.cloud",
    "broker_port": 1883,
    "broker_user": "OFP-INDKOM",
    "broker_pass": "IND10",
    "data_interval": 900,
    "mqtt_topic": "v1/devices/me/telemetry"
  }'
```

#### 4. 📁 Configure SFTP Server
**POST** `/devices/:deviceId/sftp`

**Request Body:**
```json
{
  "server_ip": "ap-southeast-1.sftpcloud.io",
  "server_port": 22,
  "username": "ofp-msm",
  "password": "root123456",
  "data_interval": 900
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/devices/ESP90000005/sftp \
  -H "Content-Type: application/json" \
  -d '{
    "server_ip": "ap-southeast-1.sftpcloud.io",
    "server_port": 22,
    "username": "ofp-msm",
    "password": "root123456",
    "data_interval": 900
  }'
```

#### 5. 📊 Get Device Status
**GET** `/devices/:deviceId/status`

```bash
curl http://localhost:3000/api/devices/ESP90000005/status
```

**Response:**
```json
{
  "success": true,
  "deviceId": "ESP90000005",
  "status": {
    "connected": true,
    "last_seen": "2025-09-01T18:30:00Z",
    "status": "online"
  }
}
```

### Telemetry APIs

#### 6. 📈 Get Telemetry Data
**GET** `/telemetry`

**Query Parameters:**
- `deviceId` - Filter by device ID
- `limit` - Number of records (default: 100)
- `page` - Page number (default: 1)

```bash
curl "http://localhost:3000/api/telemetry?deviceId=ESP90000005&limit=50"
```

---

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

---

## ⚙️ Configuration

### Environment Variables
Create a `.env` file with:

```env
# Database
MONGO_URI=mongodb://localhost:27017/msm

# AWS IoT Core
AWS_IOT_ENDPOINT=your-iot-endpoint.iot.region.amazonaws.com
AWS_REGION=us-east-1

# Server
PORT=3000
NODE_ENV=development
```

### AWS IoT Core Setup
1. Create IoT Thing in AWS Console
2. Generate certificates and keys
3. Place certificates in `./things/{device_id}/` directory
4. Update IoT policies for MQTT permissions

### Required Files Structure
```
things/
├── AmazonRootCA1.pem
└── ESP90000005/
    ├── ESP90000005.cert.pem
    ├── ESP90000005.private.key
    └── ESP90000005-Policy
```

---

## 🔧 Development

### Running the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Testing APIs
```bash
# Test reboot command
curl -X POST http://localhost:3000/api/devices/ESP90000005/reboot

# Test NTP configuration
curl -X POST http://localhost:3000/api/devices/ESP90000005/ntp \
  -H "Content-Type: application/json" \
  -d '{"server_1": "pool.ntp.org"}'

# Get device status
curl http://localhost:3000/api/devices/ESP90000005/status
```

### Database Models

#### Telemetry Schema
```javascript
{
  device_uuid: String,
  timestamp: Date,
  channel_id: Number,
  phase: String, // 'a', 'b', 'c'
  channel_status: Boolean,
  temperature: Number,
  line_voltage: Number,
  rms_voltage: Number,
  frequency: Number,
  current: Number,
  power_factor: Number,
  active_power: Number,
  reactive_power: Number,
  apparent_power: Number,
  active_energy_positive: Number,
  active_energy_negative: Number,
  reactive_energy_positive: Number,
  reactive_energy_negative: Number,
  processed: Boolean
}
```

---

## 🚨 Important Notes

### Security
- **Never expose AWS certificates** in version control
- Use environment variables for sensitive data
- Implement proper authentication for production APIs
- Validate all incoming data

### MQTT Best Practices
- Use QoS 1 for important commands
- Implement message acknowledgments
- Handle connection failures gracefully
- Monitor device connectivity status

### Error Handling
- All APIs return consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

### Monitoring
- Check server logs for MQTT connection status
- Monitor device last_seen timestamps
- Track message delivery success rates
- Set up alerts for device disconnections

---

## 📞 Support

For issues or questions:
1. Check server logs: `tail -f logs/server.log`
2. Verify MQTT connectivity: Check AWS IoT Core console
3. Test API endpoints with provided curl examples
4. Ensure all environment variables are set correctly
