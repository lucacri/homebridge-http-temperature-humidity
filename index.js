var Service, Characteristic;
var request = require("superagent");

// Require and instantiate a cache module
var cacheModule = require("cache-service-cache-module");
var cache = new cacheModule({storage: "session", defaultExpiration: 60});

// Require superagent-cache-plugin and pass your cache module
var superagentCache = require("superagent-cache-plugin")(cache);

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-httpwaterlevel", "HttpWaterlevel", HttpWaterlevel);
}

function HttpWaterlevel(log, config) {
    this.log = log;

    // Configuration
    this.url             = config["url"];
    this.httpMethod      = config["httpMethod"] || "GET";
    this.name            = config["name"];
    this.manufacturer    = config["manufacturer"] || "Generic";
    this.model           = config["model"] || "HTTP(S)";
    this.serial          = config["serial"] || "";
    this.lastUpdateAt    = config["lastUpdateAt"] || null;
    this.cacheExpiration = config["cacheExpiration"] || 60;
}

HttpWaterlevel.prototype = {

    getRemoteState: function(service, callback) {
        request(this.httpMethod, this.url)
          .set("Accept", "application/json")
          .use(superagentCache)
          .expiration(this.cacheExpiration)
          .end(function(err, res, key) {
            if (err) {
                this.log(`HTTP failure (${this.url})`);
                callback(err);
            } else {
                this.log(`HTTP success (${key})`);

                this.waterlevelService.setCharacteristic(
                    Characteristic.WaterLevel,
                    res.body.waterlevel
                );
                this.waterlevel = res.body.waterlevel;

                this.leakSensorService.setCharacteristic(
                    Characteristic.LeakDetected,
                    res.body.leak
                );
                this.waterlevel = res.body.leak;

                this.lastUpdateAt = +Date.now();

                switch (service) {
                    case "waterlevel":
                        callback(null, this.waterlevel);
                        break;
                    case "leak":
                        callback(null, this.leak);
                        break;
                    default:
                        var error = new Error("Unknown service: " + service);
                        callback(error);
                }
            }
        }.bind(this));
    },

    getWaterlevelState: function(callback) {
        this.getRemoteState("waterlevel", callback);
    },

    getWaterlevelState: function(callback) {
        this.getRemoteState("leak", callback);
    },

    getServices: function () {
        var services = [],
            informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic(Characteristic.Model, this.model)
            .setCharacteristic(Characteristic.SerialNumber, this.serial);
        services.push(informationService);

        this.waterlevelService = new Service.LeakSensor(this.name);
        this.waterlevelService
            .getCharacteristic(Characteristic.WaterLevel)
            .setProps({ minValue: 0, maxValue: 100 })
            .on("get", this.getWaterlevelState.bind(this));
        services.push(this.waterlevelService);

        this.leakSensorService
            .getCharacteristic(Characteristic.LeakSensor)
            .setProps({ minValue: 0, maxValue: 100 })
            .on("get", this.getLeakSensorState.bind(this));
        services.push(this.leakSensorService);

        return services;
    }
};
