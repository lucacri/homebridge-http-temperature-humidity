# homebridge-http-waterlevel

A HTTP(S) WaterLevel accessory for [Homebridge](https://github.com/nfarina/homebridge).

# Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install /path/to/repository/on/filesystem/homebridge-httpwaterlevel`
3. Update your configuration file. See `sample-config.json` in this repository for a sample.

# Configuration

Sample configuration:

```
"accessories": [
    {
        "accessory": "HttpWaterlevel",
        "name": "Living Room Water Level",
        "url": "http://192.168.1.210/waterlevel",
        "httpMethod": "GET",
        "cacheExpiration": 60
    }
]
```

The `cacheExpiration` option specifies, in seconds, how long HTTP responses will be stored in the in-memory cache.

---

Your HTTP(S) endpoint should produce JSON that looks like this:

```
{
    "waterlevel": 25
}
```

---

**This plugin only acts as an interface between a web endpoint and Homebridge.** You will still need some dedicated hardware to expose the web endpoint with the water level information.
