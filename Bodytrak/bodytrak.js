(function()
{
    'use strict';

    class Bodytrak
    {
        constructor()
        {
            this.device = null;
            this.server = null;
            this.sm = null;
            this.fw_image = null;
            this.tx_index = 0;
            this.PKT_1K_SIZE = 1024;
            this._characteristics = new Map();
            this.ptekUpdateComplete = false;
            this.pkt_index = 0;
            this.end_slice = 20;
            this.bleBaseUUID = "4e3c0000-e927-98a1-834f-4e210e9b56ac";
            this.dfuBaseUUID = "00001530-1212-efde-1523-785feabcd123";
            this.serviceUUID = {'dis'         : 0x180A,
                                'hrs'         : 0x180D,
                                'bis'         : 0x180F,
                                'hts'         : 0x1809,
                                'rscs'        : 0x1814,
                                'dfu'         : this.dfuBaseUUID,
                                'rmas'        : this._set_uuid(this.bleBaseUUID, "0100"),
                                'vo2'         : this._set_uuid(this.bleBaseUUID, "0200"),
                                'acc'         : this._set_uuid(this.bleBaseUUID, "0300"),
                                'vp_conf'     : this._set_uuid(this.bleBaseUUID, "0400"),
                                'sensor_conf' : this._set_uuid(this.bleBaseUUID, "0500"),
                                'log'         : this._set_uuid(this.bleBaseUUID, "0600"),
                                'rtd'         : this._set_uuid(this.bleBaseUUID, "0700"),
                                'workout'     : this._set_uuid(this.bleBaseUUID, "0800"),
                                'ptek'        : this._set_uuid(this.bleBaseUUID, "0900"),
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
                              'dfu_pkt'             : this._set_uuid(this.dfuBaseUUID, "1532"),
                              'dfu_cp'              : this._set_uuid(this.dfuBaseUUID, "1531"),
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
                              'ptek_cp'             : this._set_uuid(this.bleBaseUUID, "0901"),
                              'ptek_pkt'            : this._set_uuid(this.bleBaseUUID, "0902"),
                              'ptek_rev'            : this._set_uuid(this.bleBaseUUID, "0903"),
                            };
            this.dfu_op_code = { 'OP_CODE_START_UPDATE' : 1,
                                 'OP_CODE_RECEIVE_INIT' : 2,
                                 'OP_CODE_RECEIVE_FW' : 3,
                                 'OP_CODE_VALIDATE' : 4,
                                 'OP_CODE_ACTIVATE_N_RESET' : 5,
                                 'OP_CODE_SYS_RESET' : 6,
                                 'OP_CODE_IMAGE_SIZE_REQ' : 7,
                                 'OP_CODE_PKT_RCPT_NOTIF_REQ' : 8,
                                 'OP_CODE_RESPONSE' : 16,
                                 'OP_CODE_PKT_RCPT_NOTIF' : 17,
                                };
            this.dfu_procedure = { 'BLE_DFU_START_PROCEDURE' : 1,
                                   'BLE_DFU_INIT_PROCEDURE' : 2,
                                   'BLE_DFU_RECEIVE_APP_PROCEDURE' : 3,
                                   'BLE_DFU_VALIDATE_PROCEDURE' : 4,
                                   'BLE_DFU_PKT_RCPT_REQ_PROCEDURE' : 8,
                                 };
            this.dfu_resp_val = { 'BLE_DFU_RESP_VAL_SUCCESS' :  1,
                                  'BLE_DFU_RESP_VAL_INVALID_STATE' : 2,
                                  'BLE_DFU_RESP_VAL_NOT_SUPPORTED' : 3,
                                  'BLE_DFU_RESP_VAL_DATA_SIZE' : 4,
                                  'BLE_DFU_RESP_VAL_CRC_ERROR' : 5,
                                  'BLE_DFU_RESP_VAL_OPER_FAILED' : 6,
                                  'BLE_DFU_RESP_SEND_NEXT_1K' : 7,
                                 };
            //myObj=this;
        }

        connect()
        {
            console.log('Requesting any Bluetooth Device...');
            return navigator.bluetooth.requestDevice({filters:[{name:[ "BodyTrak" ]}],
                                                     optionalServices: [
                                                                        this.serviceUUID['ptek'],
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
                         })
                    })
                })
            })
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
            console.log("Start notif for: " + characteristicUuid);
            let characteristic = this._characteristics.get(characteristicUuid);
            // Returns characteristic to set up characteristicvaluechanged event handlers in the resolved promise.
            return characteristic.startNotifications()
            .then(() => {return characteristic;});
        }

        _stopNotifications(characteristicUuid)
        {
            let characteristic = this._characteristics.get(characteristicUuid);
            // Returns characteristic to remove characteristicvaluechanged event handlers in the resolved promise.
            return characteristic.stopNotifications()
            .then(() => {return characteristic;});
        }

        _set_uuid(base_uuid, short_uuid)
        {
            return this.bleBaseUUID.substr(0, 4) + short_uuid + this.bleBaseUUID.substr(4 + short_uuid.length);
        }

        // Bodytrak state machine
        sm_init()
        {
            this.sm = new SM(this);
            var sm_table = [
                        { sm_state: 'STATE_INIT',               sm_event: 'START_PTEK_UPDATE',  sm_action: this.performtek_update_start,     sm_next_state: 'STATE_START_PTEK_UPDATE' },
                        { sm_state: 'STATE_START_PTEK_UPDATE',  sm_event: 'SEND_PTEK_FW',       sm_action: this.performtek_send_pkt,         sm_next_state: 'STATE_SEND_PTEK_FW'      },
                        { sm_state: 'STATE_SEND_PTEK_FW',       sm_event: 'SEND_PTEK_FW',       sm_action: this.performtek_send_pkt,         sm_next_state: 'STATE_SEND_PTEK_FW'      },
                        { sm_state: 'STATE_SEND_PTEK_FW',       sm_event: 'PTEK_FW_END',        sm_action: this.performtek_reset,            sm_next_state: 'STATE_SEND_PTEK_FW'      },
                        { sm_state: 'STATE_GUARD',              sm_event: null,                 sm_action: this.sm_reset,                    sm_next_state: 'STATE_INIT'              },
                       ];

            this.sm.init_sm(sm_table, 'STATE_INIT', 'STATE_GUARD');
        }

        sm_ptek_update(fw_data)
        {
            if (fw_data == null)
            {
                console.log("Some problem with fw data image array");
                return false;
            }
            this.fw_image = fw_data;
            this.tx_index = 0;
            this.pkt_index = 0;
            this.sm.make_transition('START_PTEK_UPDATE', null);
            return true;
        }

        performtek_update_start(data)
        {
            this._startNotifications(this.charUUID['ptek_cp']).then(characteristic => {
                characteristic.addEventListener('characteristicvaluechanged', this.handlePtekDfuValueChanged.bind(this));
                var nbr_of_pkts = Math.ceil(this.fw_image.length / this.PKT_1K_SIZE);
                var tx_data = new Uint8Array([this.dfu_op_code['OP_CODE_START_UPDATE'],
                                      (nbr_of_pkts & 0x00FF),
                                      (nbr_of_pkts & 0xFF00) >> 8,
                                      (this.fw_image.length & 0x000000FF),
                                      (this.fw_image.length & 0x0000FF00) >> 8,
                                      (this.fw_image.length & 0x00FF0000) >> 16,
                                      (this.fw_image.length & 0xFF000000) >> 24
                                     ]);
                this._writeCharacteristicValue(this.charUUID['ptek_cp'], tx_data).then(_ => {
                    console.log("Start update written");
                })
                .catch(error => {console.log("Write error!")});
            })
           .catch(error => {console.log("Start notif error: " + error)});
        }

        handlePtekDfuValueChanged(event)
        {
            console.log("Callback received");
            var val = event.target.value;
            var rx_data = val.buffer ? val : new DataView(val);
            console.log("Resp: " + rx_data.getUint8(0));
            if (event.target.uuid == this.charUUID['ptek_cp'])
            {
                if (this.dfu_op_code['OP_CODE_RESPONSE'] == rx_data.getUint8(0))
                {
                    switch (rx_data.getUint8(1))
                    {
                        case this.dfu_procedure['BLE_DFU_START_PROCEDURE']:
                            switch (rx_data.getUint8(2))
                            {
                                case this.dfu_resp_val['BLE_DFU_RESP_VAL_SUCCESS']:
                                    console.log("dfu start proce success");
                                    this.sm.make_transition('SEND_PTEK_FW', null);
                                    break;

                                default:
                                    console.log("DFU start procedure value not supported: " + rx_data.getUint8(2));
                                    this.sm.make_transition('ERROR', null);
                                    break;
                            }
                            break;

                        case this.dfu_procedure['BLE_DFU_RECEIVE_APP_PROCEDURE']:
                            switch (rx_data.getUint8(2))
                            {
                                case this.dfu_resp_val['BLE_DFU_RESP_SEND_NEXT_1K']:
                                    console.log("send next 1k");
                                    this.sm.make_transition('SEND_PTEK_FW', null);
                                    break;

                                default:
                                    console.log("DFU receive app procedure value not supported: " + rx_data.getUint8(2));
                                    this.sm.make_transition('ERROR', null);
                                    break;
                            }
                            break;

                        default:
                            console.log("Procedure value not supported: " + rx_data.getUint8(1));
                            this.sm.make_transition('ERROR', null);
                            break;
                    }
                }
                else if (this.dfu_op_code['OP_CODE_PKT_RCPT_NOTIF'] == rx_data.getUint8(0))
                {
                    var nbr_bytes = rx_data.getUint8(1) | (rx_data.getUint8(2) << 8) | (rx_data.getUint8(3) << 16) | (rx_data.getUint8(4) << 24);
                    if (this.fw_image.length != nbr_bytes)
                    {
                        console.log("Some error here!");
                    }
                    this.sm.make_transition('PTEK_FW_END', null);
                    console.log("FW tx end");
                }
                else
                {
                    console.log("Response code not supported!");
                }
            }
            else
            {
                console.log("Unsupported notification from UUID: " + event.target.uuid);
            }
        }

        sm_reset()
        {
            console.log("SM reset");
            this._characteristics.get(this.charUUID['ptek_cp']).removeEventListener('characteristicvaluechanged', this.handlePtekDfuValueChanged.bind(this));
            if (this.device.gatt.connected)
            {
                var tx_data = new Uint8Array([this.dfu_op_code['OP_CODE_ACTIVATE_N_RESET']]);
                this._writeCharacteristicValue(this.charUUID['ptek_cp'], tx_data);
                this._stopNotifications(this.charUUID['ptek_cp']);
                delete this._characteristics;
            }
            delete this.sm;
        }

        performtek_send_pkt()
        {
            var tx_data= new Uint8Array(this.fw_image.slice(this.tx_index, this.tx_index + this.end_slice));
            console.log("Data to be sent " + tx_data);
            this._writeCharacteristicValue(this.charUUID['ptek_pkt'], tx_data).then(_ => {
                this.pkt_index += this.end_slice;
                this.tx_index = this.tx_index + this.end_slice;
                if (this.pkt_index == this.PKT_1K_SIZE)
                {
                    this.pkt_index = 0;
                    this.end_slice = 20;
                }
                else
                {
                    if (this.pkt_index + 20 > this.PKT_1K_SIZE)
                    {
                        this.end_slice = this.PKT_1K_SIZE - this.pkt_index;
                    }
                    this.end_slice = Math.min(this.end_slice, this.fw_image.length - this.tx_index);
                    console.log("Index: " + this.tx_index + " end slice: " + this.end_slice +  " pkt index:  " + this.pkt_index);
                    if (this.tx_index < this.fw_image.length)
                    {
                        this.sm.make_transition('SEND_PTEK_FW', null);
                    }
                    else
                    {
                        console.log("FW image end, bytes sent: " + this.tx_index + " ; fw size: " + this.fw_image.length);
                    }
                }
            })
            .catch(error => {
                console.log('Argh! write error: ' + error);
                // TODO: retry here?
                this.sm_reset();
            });
        }

        performtek_reset()
        {
            console.log("Ptek reset");
        }
    }

    class SM
    {
        constructor(obj)
        {
            this.currentState = 0;
            this.stateTable = null;
            this.guardState = '';
            this.stateTableHashmap = {};
            this.bindObj = obj;
            this.currentEvent = '';
        }

        init_sm(state_table, init_state, guard_state)
        {
            this.stateTable = state_table;
            this.currentState = init_state;
            this.guardState = guard_state;
            var stateVal = '';
            for (var i = 0; i < this.stateTable.length; i++)
            {
                if (stateVal != this.stateTable[i].sm_state)
                {
                    this.stateTableHashmap[this.stateTable[i].sm_state] = i;
                    stateVal = this.stateTable[i].sm_state;
                    console.log("hash map: " + stateVal + " value: " + i);
                }
            }
        }

        set_event(event_t)
        {
            if ((this.currentEvent != '') && (event_t != ''))
            {
                console.log("Event changed before handling it!");
            }
            this.currentEvent = event_t;
        }

        get_event()
        {
            return this.currentEvent;
        }

        make_transition(current_event, data)
        {
            var table_index = this.stateTableHashmap[this.currentState];
            console.log("Current state: " + this.currentState + " event: " + current_event);
            if (table_index == null)
            {
                console.log("State not present in table");
                return false;
            }
            while (true)
            {
                if (this.stateTable[table_index].sm_event == current_event)
                {
                    this.stateTable[table_index].sm_action.call(this.bindObj, data);
                    this.currentState = this.stateTable[table_index].sm_next_state;
                    break;
                }
                table_index++;
                if (this.stateTable[table_index].sm_state != this.currentState)
                {
                    console.log("The event is not present for the current state so move to guard state");
                    this.currentState = this.guardState;
                    break;
                }
            }
            if (this.currentState == this.guardState)
            {
                //TODO: Add support for events here
                table_index = this.stateTableHashmap[this.currentState];
                this.stateTable[table_index].sm_action.call(this.bindObj);
                this.currentState = this.stateTable[table_index].sm_next_state;
            }
            return true;
        }
    }

    window.bodytrak = new Bodytrak();
})();

//TODO: have the same function for characteristic notific and have a switch case checking for e.target.uuid.
