
Api's

https://api.stg.eincloud.ai/api/ devices/verify (staging)
https://api.eincloud.ai/api/ devices/verify (production) (not implemented)

Payload 

{
  "device_uuid": "ESP90000005",
  "device_imei": "865788062388016",
  "device_pass": "abc123"
}

///////////////////////
Responses

Status-Code	 Description

200  	     Device registered successfully	
json {
    "success": true,
    "error_code": 200,
    "message": "Registered",
    "data": {
        "_id": "68f74777bf4d7df787ad801e",
        "device_uuid": "ESP90000005",
        "__v": 0,
        "createdAt": "2025-10-21T08:42:31.233Z",
        "device_status": false,
        "device_status_updated_at": "2025-12-24T19:27:53.043Z",
        "mqtt_status": true,
        "sftp_status": false,
        "updatedAt": "2025-12-30T05:46:22.140Z",
        "device_imei": "865788062388016",
        "device_ip": "10.99.72.185",
        "device_pass": "3297016030b9055c7394c8e98b6acf8b:22088314eb234a61766f7551048de417",
        "gsm_status": "true",
        "ntp_status": "true",
        "firmware_version": "string",
        "hardware_version": "string",
        "sftp": [
            {
                "_id": "68f7488ebf4d7df787ad93ed",
                "device_uuid": "ESP90000005",
                "__v": 0,
                "createdAt": "2025-10-21T08:47:10.568Z",
                "data_interval": 900,
                "password": "root123456",
                "server_ip": "ap-southeast-1.sftpcloud.io",
                "server_port": 22,
                "updatedAt": "2025-12-23T09:41:12.251Z",
                "username": "ofp-msm"
            }
        ],
        "mqtt": [
            {
                "_id": "695366eae11b4aee5b475f46",
                "device_uuid": "ESP90000005",
                "__v": 0,
                "broker_ip": "thingsboard.cloud",
                "broker_pass": "IND10",
                "broker_port": 1883,
                "broker_user": "OFP-INDKOM",
                "createdAt": "2025-12-30T05:45:14.450Z",
                "data_interval": 900,
                "mqtt_topic": "v1/devices/me/telemetry",
                "updatedAt": "2025-12-30T05:45:14.450Z"
            }
        ],
        "ntp": [
            {
                "_id": "694c3352e11b4aee5b44a6fd",
                "device_uuid": "ESP90000005",
                "__v": 0,
                "createdAt": "2025-12-24T18:39:13.697Z",
                "data": {
                    "server_1": "updated.pool.ntp.orgtested",
                    "server_2": "updated.pool.ntp.org tested",
                    "server_3": "updated.pool.ntp.org"
                },
                "updatedAt": "2025-12-24T18:39:13.697Z"
            }
        ],
        "mqtts": [
            {
                "_id": "690a2563e3d9ac94bc26320a",
                "device_uuid": "ESP90000005",
                "__v": 0,
                "broker_ip": "a1dxcxg260l7m-ats.iot.eu-north-1.amazonaws.com",
                "broker_port": 8883,
                "claim_cert": true,
                "claim_key": false,
                "createdAt": "2025-11-04T16:10:07.840Z",
                "data_interval": 10,
                "root_ca": true,
                "updatedAt": "2025-12-23T09:41:27.152Z"
            }
        ],
        "ota": [
            {
                "_id": "6909dc99e3d9ac94bc22f479",
                "device_uuid": "ESP90000005",
                "__v": 0,
                "createdAt": "2025-11-04T10:59:35.230Z",
                "current_version": "2.0.7",
                "last_update_date": "2025-10-28",
                "last_update_time": "16:02:37",
                "updatedAt": "2025-12-23T09:42:12.692Z",
                "ota_status": "failed"
            }
        ],
        "measurements": [
            {
                "_id": "694c20a1e11b4aee5b44951e",
                "device_uuid": "ESP90000005",
                "command": "set-ct-ratio",
                "__v": 0,
                "measurements": {
                    "channel-1": 6,
                    "channel-2": 10,
                    "channel-3": 12,
                    "channel-4": 12,
                    "channel-5": 0,
                    "channel-6": 0,
                    "channel-7": 0,
                    "channel-8": 0,
                    "channel-9": 0,
                    "channel-10": 0,
                    "channel-11": 0,
                    "channel-12": 0
                }
            },
            {
                "_id": "694c20d9e11b4aee5b44957b",
                "device_uuid": "ESP90000005",
                "command": "set-v-offset",
                "__v": 0,
                "measurements": {
                    "channel-1": 1,
                    "channel-2": 0,
                    "channel-3": 0,
                    "channel-4": 0,
                    "channel-5": 0,
                    "channel-6": 0,
                    "channel-7": 0,
                    "channel-8": 0,
                    "channel-9": 0,
                    "channel-10": 0,
                    "channel-11": 0,
                    "channel-12": 0
                }
            }
        ],
        "id": "68f74777bf4d7df787ad801e"
    }
}

/////////////////////////////
400	    Missing required fields	
json { 
    "success": false, 
    "error_code": 400, 
    "message": "Missing required fields" 
}
/////////////////////////
401	    Wrong password	
json { 
    "success": false, 
    "error_code": 401, 
    "message": "Unauthorized" 
}
///////////////////////
404	    Device UUID does not exist	
json { 
    "success": false, 
    "error_code": 404, 
    "message": "Device Not Exists" 
}
//////////////////////////
409	    IMEI already registered	
json { 
    "success": false, 
    "error_code": 409, 
    "message": "Device Already Registered" 
}
////////////////////////
500	    Internal server error	
json { 
    "success": false, 
    "error_code": 500, 
    "message": "Internal Server Error" 
}