var Service, Characteristic;
var request = require('request');

const DEF_TIMEOUT = 5000,
      DEF_INTERVAL = 120000; //120s

module.exports = function (homebridge) {
   Service = homebridge.hap.Service;
   Characteristic = homebridge.hap.Characteristic;
   homebridge.registerAccessory("homebridge-http-humidity", "HttpHumidity", HttpHumidity);
}


function HttpHumidity(log, config) {
   this.log = log;

   this.url = config["url"];
   this.http_method = config["http_method"] || "GET";
   this.name = config["name"];
   this.manufacturer = config["manufacturer"] || "@metbosch manufacturer";
   this.model = config["model"] || "Model not available";
   this.serial = config["serial"] || "Non-defined serial";
   this.fieldName = config["field_name"] || "humidity";
   this.timeout = config["timeout"] || DEF_TIMEOUT;
   this.auth = config["auth"];
   this.update_interval = Number( config["update_interval"] || DEF_INTERVAL );
   this.debug = config["debug"] || false;

   // Internal variables
   this.last_value = null;
   this.waiting_response = false;
}

HttpHumidity.prototype = {

   logDebug: function (str) {
      if (this.debug) {
         this.log(str)
      }
   },

   updateState: function () {
      //Ensure previous call finished
      if (this.waiting_response) {
         this.logDebug('Avoid updateState as previous response does not arrived yet');
         return;
      }
      this.waiting_response = true;
      this.last_value = new Promise((resolve, reject) => {
         var ops = {
            uri:    this.url,
            method: this.http_method,
            timeout: this.timeout
         };
         this.logDebug('Requesting humidity on "' + ops.uri + '", method ' + ops.method);
         if (this.auth) {
            ops.auth = {
               user: this.auth.user,
               pass: this.auth.pass
            };
         }
         request(ops, (error, res, body) => {
            var value = null;
            if (error) {
               this.log('HTTP bad response (' + ops.uri + '): ' + error.message);
            } else {
               try {
                  value = this.fieldName === '' ? body : JSON.parse(body)[this.fieldName];
                  value = Number(value);
                  if (value < 0 || value > 100 || isNaN(value)) {
                     throw new Error("Invalid value received");
                  }
                  this.logDebug('HTTP successful response: ' + value);
               } catch (parseErr) {
                  this.logDebug('Error processing received information: ' + parseErr.message);
                  error = parseErr;
               }
            }
            if (!error) {
               resolve(value);
            } else {
               reject(error);
            }
            this.waiting_response = false;
         });
      }).then((value) => {
         this.humidityService
            .getCharacteristic(Characteristic.CurrentRelativeHumidity).updateValue(value, null);
         return value;
      }, (error) => {
         //For now, only to avoid the NodeJS warning about uncatched rejected promises
         return error;
      });
   },

   getState: function (callback) {
      this.logDebug('Call to getState: waiting_response is "' + this.waiting_response + '"' );
      this.updateState(); //This sets the promise in last_value
      this.last_value.then((value) => {
         callback(null, value);
         return value;
      }, (error) => {
         callback(error, null);
         return error;
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

      if (this.update_interval > 0) {
         this.timer = setInterval(this.updateState.bind(this), this.update_interval);
      }

      return [this.informationService, this.humidityService];
   }
};
