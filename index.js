var Service, Characteristic;
var request = require('request');

const DEF_TIMEOUT = 5000;

module.exports = function (homebridge) {
   Service = homebridge.hap.Service;
   Characteristic = homebridge.hap.Characteristic;
   homebridge.registerAccessory("homebridge-http-humidity", "HttpHumidity", HttpHumidity);
}


function HttpHumidity(log, config) {
   this.log = log;

   // url info
   this.url = config["url"];
   this.http_method = config["http_method"] || "GET";
   this.name = config["name"];
   this.manufacturer = config["manufacturer"] || "@metbosch manufacturer";
   this.model = config["model"] || "Model not available";
   this.serial = config["serial"] || "Non-defined serial";
   this.timeout = config["timeout"] || DEF_TIMEOUT;
}

HttpHumidity.prototype = {

   getState: function (callback) {
      var ops = {
         uri:     this.url,
         method:  this.http_method,
         timeout: this.timeout
      };
      this.log('Requesting humidity on "' + ops.uri + '", method ' + ops.method);
      request(ops, (error, res, body) => {
         var value = null;
         if (error) {
            this.log('HTTP bad response (' + ops.uri + '): ' + error.message);
         } else {
            try {
               value = JSON.parse(body).humidity;
               if (value < 0 || value > 100 || isNaN(value)) {
                  var errString = "Invalid value received (" + value + ")";
                  throw errString;
               }
               this.log('HTTP successful response: ' + body);
            } catch (parseErr) {
               this.log('Error processing received information: ' + parseErr.message);
               error = parseErr;
            }
         }
         callback(error, value);
      });
   },

   getServices: function () {
      this.informationService = new Service.AccessoryInformation();
      this.informationService
      .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.SerialNumber, this.serial);

      this.humidityService = new Service.HumiditySensor(this.name);
      this.humidityService
         .getCharacteristic(Characteristic.CurrentRelativeHumidity)
         .on('get', this.getState.bind(this));

      return [this.informationService, this.humidityService];
   }
};
