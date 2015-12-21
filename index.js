var Service, Characteristic;
var request = require("request");

var temperatureService;
var humidityService;

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-http-temperature-humidity", "HttpTempHum", HttpTempHum);
}


function HttpTempHum(log, config) {
	this.log = log;

	// url info
	this.url    = config["temp_url"];
	this.http_method = config["http_method"];
	this.sendimmediately = config["sendimmediately"];
	this.service = config["service"] || "Temperature";
	this.name = config["name"];
}

HttpTempHum.prototype = {

	httpRequest: function(url, body, method, username, password, sendimmediately, callback) {
		request({
				url: url,
				body: body,
				method: method,
				rejectUnauthorized: false
			},
			function(error, response, body) {
				callback(error, response, body)
			})
	},

	getState: function(callback) {
		var url;
		var body;

		this.httpRequest(url, body, this.http_method, this.username, this.password, this.sendimmediately, function(error, response, responseBody) {
			if (error) {
				this.log('HTTP power function failed: %s', error.message);
				callback(error);
			} else {
				this.log('HTTP power function succeeded!');
				var info = JSON.parse(responseBody);

				temperatureService.setCharacteristic(Characteristic.CurrentTemperature, info.temperature);
				humiditySensor.setCharacteristic(Characteristic.CurrentRelativeHumidity, info.humidity);

				this.log(response);
				this.log(responseBody);
	
				callback();
			}
		}.bind(this));
	},

	identify: function(callback) {
		this.log("Identify requested!");
		callback(); // success
	},

	getServices: function() {

		// you can OPTIONALLY create an information service if you wish to override
		// the default values for things like serial number, model, etc.
		var informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, "Luca Manufacturer")
			.setCharacteristic(Characteristic.Model, "Luca Model")
			.setCharacteristic(Characteristic.SerialNumber, "Luca Serial Number");

		// if (this.service == "Temperature") {
			temperatureService = new Service.TemperatureSensor(this.name);

			  temperatureService
			    .getCharacteristic(Characteristic.CurrentTemperature)
			    .on('get', this.getState.bind(this));

			// return [temperatureService];
		// } else if (this.service == "Humidity") {
		 	humidityService = new Service.HumiditySensor(this.name);

			  humidityService
			    .getCharacteristic(Characteristic.CurrentRelativeHumidity)
			    .on('get', this.getState.bind(this));

			return [temperatureService, humidityService];
		}
	}
};
