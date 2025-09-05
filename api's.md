# MSM API Documentation

## Authentication Endpoints

### POST `/auth/register`
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "phone_number": "+1234567890",
  "description": "System Administrator"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role_id": {...}
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST `/auth/login`
Login user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role_id": {...}
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST `/auth/logout`
Logout user (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## MQTT Configuration Endpoints

### GET `/mqtt`
Get all MQTT configurations

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "device_uuid": "ESP90000005",
      "broker_ip": "thingsboard.cloud",
      "broker_port": 1883,
      "broker_user": "OFP-INDKOM",
      "broker_pass": "IND10",
      "data_interval": 900,
      "mqtt_topic": "v1/devices/me/telemetry",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET `/mqtt/:id`
Get single MQTT configuration by ID

### POST `/mqtt`
Create new MQTT configuration

**Request Body:**
```json
{
  "device_uuid": "ESP90000005",
  "broker_ip": "thingsboard.cloud",
  "broker_port": 1883,
  "broker_user": "OFP-INDKOM",
  "broker_pass": "IND10",
  "data_interval": 900,
  "mqtt_topic": "v1/devices/me/telemetry"
}
```

### PUT `/mqtt/:id`
Update MQTT configuration by ID

### DELETE `/mqtt/:id`
Delete MQTT configuration by ID

## NTP Configuration Endpoints

### GET `/ntp`
Get all NTP configurations

### GET `/ntp/:id`
Get single NTP configuration by ID

### POST `/ntp`
Create new NTP configuration

**Request Body:**
```json
{
  "device_uuid": "ESP90000005",
  "data": {
    "server_1": "my.pool.ntp.org",
    "server_2": "0.asia.pool.ntp.org",
    "server_3": "1.asia.pool.ntp.org"
  }
}
```

### PUT `/ntp/:id`
Update NTP configuration by ID

### DELETE `/ntp/:id`
Delete NTP configuration by ID

## SFTP Configuration Endpoints

### GET `/sftp`
Get all SFTP configurations

### GET `/sftp/:id`
Get single SFTP configuration by ID

### POST `/sftp`
Create new SFTP configuration

**Request Body:**
```json
{
  "device_uuid": "ESP90000005",
  "server_ip": "ap-southeast-1.sftpcloud.io",
  "server_port": 22,
  "username": "ofp-msm",
  "password": "root123456",
  "data_interval": 900
}
```

### PUT `/sftp/:id`
Update SFTP configuration by ID

### DELETE `/sftp/:id`
Delete SFTP configuration by ID

## User Management Endpoints

### GET `/users`
Get all users with role information

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone_number": "+1234567890",
      "role_id": {
        "_id": "...",
        "name": "Admin"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET `/users/:id`
Get single user by ID with role information

### POST `/users`
Create new user

**Request Body:**
```json
{
  "name": "John Doe",
  "label": "Administrator",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "description": "System Administrator",
  "method": "email",
  "owner": "system",
  "groups": ["admin", "users"],
  "customer_name": "ACME Corp",
  "role_id": "60f7b3b3b3b3b3b3b3b3b3"
}
```

### PUT `/users/:id`
Update user by ID

### DELETE `/users/:id`
Delete user by ID

## Telemetry Data Endpoints

### GET `/telemetry`
Get all telemetry data with device information

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "device_uuid": "ESP90000005",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "channel_id": 1,
      "phase": "A",
      "channel_status": true,
      "temperature": 25.5,
      "line_voltage": 230.0,
      "rms_voltage": 230.0,
      "frequency": 50.0,
      "current": 5.2,
      "power_factor": 0.95,
      "active_power": 1150.0,
      "reactive_power": 350.0,
      "apparent_power": 1200.0,
      "battery_level": 85,
      "signal_strength": -65,
      "firmware_version": "1.0.0",
      "processed": false
    }
  ]
}
```

### GET `/telemetry/:id`
Get single telemetry record by ID

### POST `/telemetry`
Create new telemetry record

**Request Body:**
```json
{
  "device_uuid": "ESP90000005",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "channel_id": 1,
  "phase": "A",
  "channel_status": true,
  "temperature": 25.5,
  "line_voltage": 230.0,
  "rms_voltage": 230.0,
  "frequency": 50.0,
  "current": 5.2,
  "power_factor": 0.95,
  "active_power": 1150.0,
  "reactive_power": 350.0,
  "apparent_power": 1200.0,
  "active_energy_positive": 1000.0,
  "active_energy_negative": 0.0,
  "reactive_energy_positive": 500.0,
  "reactive_energy_negative": 0.0,
  "battery_level": 85,
  "signal_strength": -65,
  "firmware_version": "1.0.0"
}
```

### PUT `/telemetry/:id`
Update telemetry record by ID

### DELETE `/telemetry/:id`
Delete telemetry record by ID

## Device-Specific Configuration Endpoints (Legacy)

### POST `/devices/:deviceId/mqtt`
Create MQTT configuration for specific device

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

### POST `/devices/:deviceId/sftp`
Create SFTP configuration for specific device

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

### POST `/devices/:deviceId/ntp`
Create NTP configuration for specific device

**Request Body:**
```json
{
  "server_1": "my.pool.ntp.org",
  "server_2": "0.asia.pool.ntp.org",
  "server_3": "1.asia.pool.ntp.org"
}
```

### POST `/devices/:deviceId/reboot`
Send reboot command to device

**Response:**
```json
{
  "success": true,
  "message": "Reboot command sent successfully",
  "deviceId": "ESP90000005",
  "topic": "msm/ESP90000005/reboot"
}
```

## Common Response Format

All endpoints return responses in the following format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error