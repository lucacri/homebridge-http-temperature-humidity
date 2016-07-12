# homebridge-http-humidity

Supports https devices on HomeBridge Platform.
This is a simplified version of the https://github.com/lucacri/homebridge-http-temperature-humidity plugin.
This version only supports humidity sensors, not temperature.

# Installation (TO BE UPDATED)

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-httptemperaturehumidity
3. Update your configuration file. See sample-config.json in this repository for a sample.

# Configuration (TO BE UPDATED)


Configuration sample file:

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


The /weather endpoint will return a json looking like this
```
{
	"temperature": 25.8,
	"humidity": 38
}
```


This plugin acts as an interface between a web endpoint and homebridge only. You will still need some dedicated hardware to expose the web endpoints with the temperature and humidity information. In my case, I used a simple NodeMCU board and a DHT11 (or DHT22).
