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
            this.bleBaseUUID = "4e3c0000-e927-98a1-834f-4e210e9b56ac";
            this.dfuBaseUUID = "00001530-1212-efde-1523-785feabcd123";
            this.serviceUUID = {'dis' :         0x180A,
                                'hrs' :         0x180D,
                                'bis' :         0x180F,
                                'hts':          0x1809,
                                'rscs' :        0x1814,
                                'dfu' :         this.dfuBaseUUID,
                                'rmas' :        this._set_uuid(this.bleBaseUUID, "0100"),
                                'vo2' :         this._set_uuid(this.bleBaseUUID, "0200"),
                                'acc' :         this._set_uuid(this.bleBaseUUID, "0300"),
                                'vp_conf' :     this._set_uuid(this.bleBaseUUID, "0400"),
                                'sensor_conf' : this._set_uuid(this.bleBaseUUID, "0500"),
                                'log' :         this._set_uuid(this.bleBaseUUID, "0600"),
                                'rtd' :         this._set_uuid(this.bleBaseUUID, "0700"),
                                'workout' :     this._set_uuid(this.bleBaseUUID, "0800"),
                               };
             this.charUUID = {'dis_manufac_name'    : 0x2A29,
                              'dis_model_nbr'       : 0x2A24,
                              'dis_serial_nbr'      : 0x2A25,
                              'dis_hw_rev'          : 0x2A27,
                              'dis_sw_rev'          : 0x2A28,
                              'hrs_meas'            : 0x2A37,
                              'bis_level'           : 0x2A19,
                              'hts_meas'            : 0x2A1C,
                              'rscs_meas'           : 0x2A53,
                              'rscs_feature'        : 0x2A54,
                              'dfu_pkt'             : this._set_uuid(this.bleBaseUUID, "1532"),
                              'dfu_cp'              : this._set_uuid(this.bleBaseUUID, "1531"),
                              'dfu_status_rep'      : this._set_uuid(this.bleBaseUUID, "1533"),
                              'dfu_rev'             : this._set_uuid(this.dfuBaseUUID, "1534"),
                              'rmas_meas'           : this._set_uuid(this.bleBaseUUID, "0101"),
                              'vo2_meas'            : this._set_uuid(this.bleBaseUUID, "0201"),
                              'acc_meas'            : this._set_uuid(this.bleBaseUUID, "0301"),
                              'acc_cp'              : this._set_uuid(this.bleBaseUUID, "0302"),
                              'vp_conf_cp'          : this._set_uuid(this.bleBaseUUID, "0401"),
                              'sns_conf_age'        : this._set_uuid(this.bleBaseUUID, "0501"),
                              'sns_conf_gender'     : this._set_uuid(this.bleBaseUUID, "0502"),
                              'sns_conf_weight'     : this._set_uuid(this.bleBaseUUID, "0503"),
                              'sns_conf_height'     : this._set_uuid(this.bleBaseUUID, "0504"),
                              'sns_conf_restHR'     : this._set_uuid(this.bleBaseUUID, "0505"),
                              'sns_conf_maxHR'      : this._set_uuid(this.bleBaseUUID, "0506"),
                              'sns_conf_ooequal'    : this._set_uuid(this.bleBaseUUID, "0507"),
                              'sns_conf_avgmin'     : this._set_uuid(this.bleBaseUUID, "0508"),
                              'sns_conf_leddrv'     : this._set_uuid(this.bleBaseUUID, "0509"),
                              'sns_conf_ledauto'    : this._set_uuid(this.bleBaseUUID, "050a"),
                              'sns_conf_clearvals'  : this._set_uuid(this.bleBaseUUID, "050b"),
                              'sns_conf_actmode'    : this._set_uuid(this.bleBaseUUID, "050c"),
                              'sns_conf_walkcal'    : this._set_uuid(this.bleBaseUUID, "050d"),
                              'sns_conf_runcal'     : this._set_uuid(this.bleBaseUUID, "050e"),
                              'sns_conf_vo2cal'     : this._set_uuid(this.bleBaseUUID, "050f"),
                              'sns_conf_avgHRtime'  : this._set_uuid(this.bleBaseUUID, "0510"),
                              'sns_conf_HRzones'    : this._set_uuid(this.bleBaseUUID, "0511"),
                              'sns_conf_cbtunits'   : this._set_uuid(this.bleBaseUUID, "0512"),
                              'sns_conf_distunits'  : this._set_uuid(this.bleBaseUUID, "0513"),
                              'sns_conf_antenable'  : this._set_uuid(this.bleBaseUUID, "0514"),
                              'log_rtc'             : this._set_uuid(this.bleBaseUUID, "0601"),
                              'log_config'          : this._set_uuid(this.bleBaseUUID, "0602"),
                              'log_reset'           : this._set_uuid(this.bleBaseUUID, "0603"),
                              'log_status'          : this._set_uuid(this.bleBaseUUID, "0604"),
                              'log_dl_req'          : this._set_uuid(this.bleBaseUUID, "0605"),
                              'log_dl_data'         : this._set_uuid(this.bleBaseUUID, "0606"),
                              'rtd_meas'            : this._set_uuid(this.bleBaseUUID, "0701"),
                              'workout_cp'          : this._set_uuid(this.bleBaseUUID, "0801"),
                             };
        }

        connect()
        {
            console.log('Test se uuid ok... ' + this.charUUID['workout_cp'])
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
                                                                  this.serviceUUID['workout'],
                                                                 ]
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
                         service.getCharacteristics().then(characteristics => {
                         console.log('> Service: ' + service.uuid);
                         characteristics.forEach(characteristic => {
                             console.log('>> Characteristic: ' + characteristic.uuid);
                             this._cacheCharacteristic(characteristic.uuid, characteristic);
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

        _set_uuid(base_uuid, short_uuid)
        {
            return this.bleBaseUUID.substr(0, 4) + short_uuid + this.bleBaseUUID.substr(4 + short_uuid.length);
        }
    }

    window.bodytrak = new Bodytrak();
})();

//TODO: have the same function for characteristic notific and have a switch case checking for e.target.uuid.