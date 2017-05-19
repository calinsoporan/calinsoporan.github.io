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
            console.log('Requesting any Bluetooth Device...');
            navigator.bluetooth.requestDevice({filters:[{name:[ 'BodyTrak' ]}]})
            .then(device => {
                console.log('Connecting to GATT Server...');
                return device.gatt.connect();
            })
            .then(server => {
                console.log('Getting Device Information Service...');
                return server.getPrimaryService('device_information');
            })
            .then(service => {
                console.log('Getting Device Information Characteristics...');
                return service.getCharacteristics();
            })
            .then(characteristics => {
                let queue = Promise.resolve();
                let decoder = new TextDecoder('utf-8');
                characteristics.forEach(characteristic => {
                
                switch (characteristic.uuid)
                {
                    case BluetoothUUID.getCharacteristic('manufacturer_name_string'):
                        queue = queue.then(_ => characteristic.readValue()).then(value => {
                        console.log('> Manufacturer Name String: ' + decoder.decode(value));
                    });
                    break;

                    case BluetoothUUID.getCharacteristic('model_number_string'):
                        queue = queue.then(_ => characteristic.readValue()).then(value => {
                        console.log('> Model Number String: ' + decoder.decode(value));
                    });
                    break;

                    case BluetoothUUID.getCharacteristic('hardware_revision_string'):
                        queue = queue.then(_ => characteristic.readValue()).then(value => {
                        console.log('> Hardware Revision String: ' + decoder.decode(value));
                    });
                    break;

                    case BluetoothUUID.getCharacteristic('software_revision_string'):
                        queue = queue.then(_ => characteristic.readValue()).then(value => {
                        console.log('> Software Revision String: ' + decoder.decode(value));
                    });
                    break;

                    default: console.log('> Unknown Characteristic: ' + characteristic.uuid);
                }
            });
            return queue;
            })
            .catch(error => {
                console.log('Argh! ' + error);
            });
        }
    }
