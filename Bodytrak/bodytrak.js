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
            this.serviceUUID = {'dis' : 0x180A,
                                'hrs' : 0x180D,
                                'bis' : 0x180F,
                                'hts': 0x1809,
                                'rscs' : 0x1820,
                                'dfu' : 0x1530,
                                'rmas' : 0x0100,
                                'vo2' : 0x0200,
                                'acc' : 0x0300,
                                'vp_conf' : 0x0400,
                                'sensor_conf' : 0x0500,
                                'log' : 0x0600,
                                'rtd' : 0x0700,
                                'workout' : 0x0800,
                               };
             this.charUUID = {'dis_manufac_name' : 0x2A29, 'dis_model_nbr' : 0x2A24, 'dis_serial_nbr' : 0x2A25,  'dis_hw_rev': 0x2A27, 'dis_sw_rev' : 0x2A28,
                              'hrs_meas' : 0x2A37,
                              'bis_level' : 0x2A19,
                              'hts_meas' : 0x2A1C,
                              'rscs_meas' : 0x2A53, 'rscs_feature' : 0x2A54,
                              'dfu_pkt' : 0x1532, 'dfu_cp' : 0x1531, 'dfu_status_rep' : 0x1533, 'dfu_rev' : 0x1534,
                              'rmas_meas' : 0x0101,
                              'vo2_meas' : 0x0201,
                              'acc_meas' : 0x0301, 'acc_cp' : 0x0302,
                              'vp_conf_cp' : 0x0401,
                              'sns_conf_age' : 0x0501, 'sns_conf_gender' : 0x0502, 'sns_conf_weight' : 0x0503, 'sns_conf_height' : 0x0504, 'sns_conf_restHR' : 0x0505, 'sns_conf_maxHR' : 0x0506, 'sns_conf_ooequal' : 0x0507, 'sns_conf_avgmin' : 0x0508, 'sns_conf_leddrv' : 0x0509, 'sns_conf_ledauto' : 0x050A, 'sns_conf_clearvals' : 0x050B, 'sns_conf_actmode' : 0x050C, 'sns_conf_walkcal' : 0x050D, 'sns_conf_runcal' : 0x050E, 'sns_conf_vo2cal' : 0x050F, 'sns_conf_avgHRtime' : 0x0510, 'sns_conf_HRzones' : 0x0511, 'sns_conf_cbtunits' : 0x0512, 'sns_conf_distunits' : 0x0513, 'sns_conf_antenable' : 0x0514,
                              'log_rtc' : 0x0601, 'log_config' : 0x0602, 'log_reset' : 0x0603, 'log_status' : 0x0604, 'log_dl_req' : 0x0605, 'log_dl_data' : 0x0606,
                              'rtd_meas' : 0x0701,
                              'workout_cp' : 0x0801
                             };
        }

        connect()
        {
            console.log('Requesting any Bluetooth Device...');
            navigator.bluetooth.requestDevice({filters:[{name:[ "BodyTrak" ]}],
                                               optionalServices: [this.serviceUUID['dis'], 
                                                                  this.serviceUUID['hrs'],
                                                                  this.serviceUUID['bis'],
                                                                  this.serviceUUID['hts'],
                                                                  this.serviceUUID['rscs'],
                                                                  this.serviceUUID['dfu'],
                                                                  this.serviceUUID['rmas'],
                                                                  this.serviceUUID['vo2'],
                                                                  this.serviceUUID['acc'],
                                                                  this.serviceUUID['vp_conf'],
                                                                  this.serviceUUID['sensor_conf'],
                                                                  this.serviceUUID['log'],
                                                                  this.serviceUUID['rtd'],
                                                                  this.serviceUUID['workout']]
                                              })
            .then(device => {
                this.device = device
                device.addEventListener('gattserverdisconnected', onDisconnected);
                console.log('Connecting to GATT Server...');
                return device.gatt.connect();
            })
            .then(server => {
                this.server = server
                console.log('Getting Primary Services...');
                return server.getPrimaryServices();
            })
            .then(services => {
                console.log('Getting Device Characteristics...');
                services.forEach(service => {
                    return service.getCharacteristics();
                    .then(characteristics => {
                         console.log('> Service: ' + service.uuid);
                         characteristics.forEach(characteristic => {
                             console.log('>> Characteristic: ' + characeristic.uuid);
                             _cacheCharacteristic(characeristic.uuid, characteristic);
                         });
                    });
                })
            })
            .catch(error => {
                console.log('Argh! ' + error);
            });
        }

        /* Utility functions */
        _cacheCharacteristic(characteristicUuid, characteristic)
        {
            this._characteristics.set(characteristicUuid, characteristic);
        }

        _readCharacteristicValue(characteristicUuid)
        {
            let characteristic = this._characteristics.get(characteristicUuid);
            return characteristic.readValue()
            .then(value => {
                // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
                value = value.buffer ? value : new DataView(value);
                return value;
            });
        }

        _writeCharacteristicValue(characteristicUuid, value)
        {
            let characteristic = this._characteristics.get(characteristicUuid);
            return characteristic.writeValue(value);
        }

        _startNotifications(characteristicUuid)
        {
            let characteristic = this._characteristics.get(characteristicUuid);
            // Returns characteristic to set up characteristicvaluechanged event
            // handlers in the resolved promise.
            return characteristic.startNotifications()
            .then(() => characteristic);
        }

        _stopNotifications(characteristicUuid)
        {
            let characteristic = this._characteristics.get(characteristicUuid);
            // Returns characteristic to remove characteristicvaluechanged event
            // handlers in the resolved promise.
            return characteristic.stopNotifications()
            .then(() => characteristic);
        }
    }

    window.bodytrak = new Bodytrak();
})();
