const fs = require('fs');
const crypto = require('crypto');

const brokerId = crypto.randomBytes(8).toString('hex');
const tabId = crypto.randomBytes(8).toString('hex');

const flow = [
    {
        "id": tabId,
        "type": "tab",
        "label": "SCEMIRP Event Processing",
        "disabled": false,
        "info": ""
    },
    {
        "id": brokerId,
        "type": "mqtt-broker",
        "name": "Local Broker",
        "broker": "mqtt",
        "port": "1883",
        "clientid": "",
        "autoConnect": true,
        "usetls": false,
        "protocolVersion": "4",
        "keepalive": "60",
        "cleansession": true,
        "birthTopic": "",
        "birthQos": "0",
        "birthPayload": "",
        "birthMsg": {},
        "closeTopic": "",
        "closeQos": "0",
        "closePayload": "",
        "closeMsg": {},
        "willTopic": "",
        "willQos": "0",
        "willPayload": "",
        "willMsg": {},
        "userProps": "",
        "sessionExpiry": ""
    },
    {
        "id": crypto.randomBytes(8).toString('hex'),
        "type": "mqtt in",
        "z": tabId,
        "name": "Sensor Events",
        "topic": "scemirp/sensors/#",
        "qos": "0",
        "datatype": "json",
        "broker": brokerId,
        "nl": false,
        "rap": true,
        "rh": 0,
        "inputs": 0,
        "x": 180,
        "y": 140,
        "wires": [
            [
                "http_req_id"
            ]
        ]
    },
    {
        "id": "http_req_id",
        "type": "http request",
        "z": tabId,
        "name": "Send to Backend",
        "method": "POST",
        "ret": "obj",
        "paytoqs": "ignore",
        "url": "http://backend:3001/api/events",
        "tls": "",
        "persist": false,
        "proxy": "",
        "authType": "",
        "senderr": false,
        "x": 450,
        "y": 140,
        "wires": [
            [
                "debug_id"
            ]
        ]
    },
    {
        "id": "debug_id",
        "type": "debug",
        "z": tabId,
        "name": "Backend Response",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 710,
        "y": 140,
        "wires": []
    }
];

fs.writeFileSync('node_red_data/flows.json', JSON.stringify(flow, null, 4));
