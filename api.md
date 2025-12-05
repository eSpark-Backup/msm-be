
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
        "device_imei": "865788062388016", 
        "device_status": false, 
        "mqtt_status": true, 
        "sftp_status": false, 
        "gsm_status": "false", 
        "ntp_status": "true", 
        "device_ip": "10.99.72.185", 
        "device_pass": "8a7b0352f39a6ff6ea575939d040fc2b:028ff3e6b136c95aa138dde7413448ba", 
        "createdAt": "2025-10-21T08:42:31.233Z", 
        "updatedAt": "2025-11-28T10:54:59.177Z", 
        "mqtt": [], 
        "mqtts": [], 
        "ntp": [], 
        "sftp": [], 
        "ota": [], 
        "measurements": [] 
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