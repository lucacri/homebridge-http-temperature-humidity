var Service, Characteristic;
var request = require('sync-request');

var temperatureService;
var humidityService;
var url 
var humidity = 0;
var temperature = 0;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-httptemperaturehumidity", "HttpTemphum", HttpTemphum);
}


function HttpTemphum(log, config) {
    this.log = log;

    // url info
    this.url = config["url"];
    this.http_method = config["http_method"];
    this.sendimmediately = config["sendimmediately"];
    this.name = config["name"];
}

HttpTemphum.prototype = {

    httpRequest: function (url, body, method, username, password, sendimmediately, callback) {
        request({
                    url: url,
                    body: body,
                    method: method,
                    rejectUnauthorized: false
                },
                function (error, response, body) {
                    callback(error, response, body)
                })
    },

    getStateHumidity: function(callback){    
		callback(null, this.humidity);
    },

    getState: function (callback) {
        var body;

		var res = request(this.http_method, this.url, {});
		if(res.statusCode > 400){
			// this.log('HTTP power function failed');
			callback(error);
		}else{
			// this.log('HTTP power function succeeded!');
            var info = JSON.parse(res.body);

            temperatureService.setCharacteristic(Characteristic.CurrentTemperature, info.temperature);
            humidityService.setCharacteristic(Characteristic.CurrentRelativeHumidity, info.humidity);

            // this.log(res.body);
            // this.log(info);
            this.temperature = Number( info.temperature );
			callback(null, this.temperature);
		}

    },

    identify: function (callback) {
        this.log("Identify requested!");
        callback(); // success
    },

    getServices: function () {
        var informationService = new Service.AccessoryInformation();

        informationService
                .setCharacteristic(Characteristic.Manufacturer, "Luca Manufacturer")
                .setCharacteristic(Characteristic.Model, "Luca Model")
                .setCharacteristic(Characteristic.SerialNumber, "Luca Serial Number");

        temperatureService = new Service.TemperatureSensor(this.name);
        temperatureService
                .getCharacteristic(Characteristic.CurrentTemperature)
                .setProps({
                    minValue: -100,
                    value: 10
                })
                .on('get', this.getState.bind(this));

        humidityService = new Service.HumiditySensor(this.name);
        humidityService
                .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                .on('get', this.getStateHumidity.bind(this));

        return [temperatureService, humidityService];
    }
};