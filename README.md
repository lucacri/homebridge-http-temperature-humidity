# homebridge-http-temperature-humidity

A HTTP(S) temperature and humidity accessory for [Homebridge](https://github.com/nfarina/homebridge).

# Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-http-temperature-humidity`
3. Update your configuration file. See `sample-config.json` in this repository for a sample.

# Configuration

Sample configuration:

```
"accessories": [
    {
        "accessory": "HttpTemphum",
        "name": "Living Room Weather",
        "url": "http://192.168.1.210/weather",
        "httpMethod": "GET",
        "humidity": true,
        "cacheExpiration": 60
    }
]
```

Set `humidity` to false if your HTTP endpoint doesn't include a humidity reading.

The `cacheExpiration` option specifies, in seconds, how long HTTP responses will be stored in the in-memory cache.

---

Your HTTP(S) endpoint should produce JSON that looks like this:

```
{
    "temperature": 25.8,
    "humidity": 38
}
```

---

**This plugin only acts as an interface between a web endpoint and Homebridge.** You will still need some dedicated hardware to expose the web endpoints with the temperature and humidity information. In my case, I used a simple NodeMCU board and a DHT11 (or DHT22). [Check my other repo for the NodeMCU code](https://github.com/lucacri/nodemcu-temperature-humidity-station).
