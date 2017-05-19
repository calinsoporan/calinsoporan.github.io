(function() 
{
    'use strict';

    class Bodytrak
    {
        constructor()
        {
            this.device = null;
            this.server = null;
            this._characteristics = new Map();
        }

        connect()
        {
            log('Requesting any Bluetooth Device...');
            navigator.bluetooth.requestDevice({filters:[{name:[ 'BodyTrak' ]}]})
            .then(device => {
                log('Connecting to GATT Server...');
                return device.gatt.connect();
            })
            .then(server => {
                log('Getting Device Information Service...');
                return server.getPrimaryService('device_information');
            })
            .then(service => {
                log('Getting Device Information Characteristics...');
                return service.getCharacteristics();
            })
            .then(characteristics => {
                let queue = Promise.resolve();
                let decoder = new TextDecoder('utf-8');
                characteristics.forEach(characteristic => {
                
                switch (characteristic.uuid) {
        case BluetoothUUID.getCharacteristic('manufacturer_name_string'):
          queue = queue.then(_ => characteristic.readValue()).then(value => {
            log('> Manufacturer Name String: ' + decoder.decode(value));
          });
          break;

        case BluetoothUUID.getCharacteristic('model_number_string'):
          queue = queue.then(_ => characteristic.readValue()).then(value => {
            log('> Model Number String: ' + decoder.decode(value));
          });
          break;

        case BluetoothUUID.getCharacteristic('hardware_revision_string'):
          queue = queue.then(_ => characteristic.readValue()).then(value => {
            log('> Hardware Revision String: ' + decoder.decode(value));
          });
          break;

        case BluetoothUUID.getCharacteristic('software_revision_string'):
          queue = queue.then(_ => characteristic.readValue()).then(value => {
            log('> Software Revision String: ' + decoder.decode(value));
          });
          break;

        default: log('> Unknown Characteristic: ' + characteristic.uuid);
      }
    });
    return queue;
  })
  .catch(error => {
    log('Argh! ' + error);
  });
}
    }
}
