# homebridge-http-temperature-humidity

Supports https devices on HomeBridge Platform

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-httptemperaturehumidity
3. Update your configuration file. See sample-config.json in this repository for a sample. 

# Configuration



Configuration sample:

 ```
"accessories": [
        "accessories": [
        {
            "accessory": "HttpTemphum",
            "name": "Living Room Weather",
            "url": "http://192.168.1.210/weather",
            "sendimmediately": "",
            "http_method": "GET"
        }
    ]

```
