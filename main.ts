/**
 * KSRobot_IOT V0.010
 */
//% weight=10 color=#00A6F0 icon="\uf1eb" block="KSRobot_IOT"

namespace KSRobot_IOT {

    let IOT_WIFI_CONNECTED = false
    let IOT_MQTT_CONNECTED = false
    let local_ip = "0.0.0.0"
    let ap_ip = "FFFF"
    let temp_name = ""
    let iot_receive_data = ""
    let receive_topic_name = ""
    let receive_topic_value = ""

    let MQTT_TOPIC = ["", "", "", "", ""]
    let MQTT_CB: Action[] = [null, null, null, null, null]


    //topics name
    export enum TOPIC {
        Topic0 = 0,
        Topic1 = 1,
        Topic2 = 2,
        Topic3 = 3,
        Topic4 = 4
    }

    export class NewMessage {

        public message: string;
    }

    //% shim=KSRobotCPP::forever
    function forever(a: Action): void {
        return
    }

    export enum IOT_Config {
        STATION = 0,
        STATION_AP = 1,

    }


    function WifiDataReceived(): void {
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => {

            let compare_str0 = "="
            let compare_str1 = "@#$@TOPIC$"
            let compare_str2 = "@#$@STIP$"
            let compare_str3 = "@#$@APIP$"
            let strlen4 = 0
            let strlen3 = 0
            let strlen2 = 0
            let strlen1 = 0

            iot_receive_data = serial.readLine()
            iot_receive_data = iot_receive_data.substr(0, iot_receive_data.length - 1)

            if (iot_receive_data.indexOf(compare_str1) >= 0) {
                // parse mqtt topic
                strlen1 = iot_receive_data.indexOf(compare_str1) + compare_str1.length
                strlen2 = iot_receive_data.indexOf(compare_str0) - strlen1
                strlen3 = iot_receive_data.indexOf(compare_str0) + compare_str0.length
                strlen4 = iot_receive_data.length - strlen3
                receive_topic_name = iot_receive_data.substr(strlen1, strlen2)
                receive_topic_value = iot_receive_data.substr(strlen3, strlen4)


                switch (receive_topic_name) {
                    case MQTT_TOPIC[0]: { if (MQTT_CB[0] != null) forever(MQTT_CB[0]); } break;
                    case MQTT_TOPIC[1]: { if (MQTT_CB[1] != null) forever(MQTT_CB[1]); } break;
                    case MQTT_TOPIC[2]: { if (MQTT_CB[2] != null) forever(MQTT_CB[2]); } break;
                    case MQTT_TOPIC[3]: { if (MQTT_CB[3] != null) forever(MQTT_CB[3]); } break;
                    case MQTT_TOPIC[4]: { if (MQTT_CB[4] != null) forever(MQTT_CB[4]); } break;
                }

            }
            // parse Local IP
            if (iot_receive_data.indexOf(compare_str2) >= 0) {
                strlen1 = iot_receive_data.indexOf(compare_str2) + compare_str2.length
                strlen2 = iot_receive_data.indexOf(compare_str0) - strlen2
                strlen3 = iot_receive_data.indexOf(compare_str0) + compare_str0.length
                strlen4 = iot_receive_data.length - strlen3
                temp_name = iot_receive_data.substr(strlen1, strlen2)
                local_ip = iot_receive_data.substr(strlen3, strlen4)
                IOT_WIFI_CONNECTED = true
                basic.showLeds(`
                . # # # .
                # # # # #
                . # # # .
                . . # . .
                . . # . .
                `)
            }
            // parse AP information
            if (iot_receive_data.indexOf(compare_str3) >= 0) {
                strlen1 = iot_receive_data.indexOf(compare_str3) + compare_str3.length
                strlen2 = iot_receive_data.indexOf(compare_str0) - strlen3
                strlen3 = iot_receive_data.indexOf(compare_str0) + compare_str0.length
                strlen4 = iot_receive_data.length - strlen3
                temp_name = iot_receive_data.substr(strlen1, strlen2)
                ap_ip = iot_receive_data.substr(strlen3, strlen4)
            }



        })

    }


    /**
      * Set KSRobot WIFI IOT Module 
      * @param txd Iot module to micro:bit ; eg: SerialPin.P15
      * @param rxd micro:bit to Iot module ; eg: SerialPin.P8
      */
    //% blockId=Wifi_setup
    //% block="KSRobot WIFI Set| TXD %txd| RXD %rxd| SSID %ssid| PASSWORD %passwd| AP %ap"


    export function Wifi_setup(txd: SerialPin, rxd: SerialPin, ssid: string, passwd: string, ap: IOT_Config): void {
        serial.redirect(
            txd,   //TX
            rxd,  //RX
            BaudRate.BaudRate115200
        );
        serial.setRxBufferSize(128)
        serial.setTxBufferSize(128)
        WifiDataReceived()
        control.waitMicros(500000)
        serial.writeLine("AT+Restart=");
        control.waitMicros(500000)
        serial.writeLine("AT+AP_SET?ssid=" + ssid + "&pwd=" + passwd + "&AP=" + ap + "=");
        for (let id_y = 0; id_y <= 4; id_y++) {
            for (let id_x = 0; id_x <= 4; id_x++) {
                if (!IOT_WIFI_CONNECTED) {
                    led.plot(id_x, id_y)
                    basic.pause(500)

                }

            }
        }

    }

    //% blockId=Get_IP
    //% block="Get Local IP"
    export function Get_IP(): string {
        return local_ip;
    }
    //% blockId=AP_Name
    //% block="IOT AP Name"
    export function AP_Name(): string {
        return ap_ip;
    }

    //% blockId=Wifi_Connection
    //% block="Wifi Connection"
    export function Wifi_Connection(): boolean {
        return IOT_WIFI_CONNECTED;
    }

    //% blockId=ThingSpeak_set 
    //% expandableArgumentMode"toggle" inlineInputMode=inline
    //% block="ThingSpeak Set| Write API key = %api_key| Field 1 = %field1|| Field 2 = %field2| Field 3 = %field3| Field 4 = %field4| Field 5 = %field5| Field 6 = %field6| Field 7 = %field7| Field 8 = %field8"
    export function ThingSpeak_set(api_key: string, field1: number, field2?: number, field3?: number, field4?: number, field5?: number, field6?: number, field7?: number, field8?: number): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+ThingSpeak?host=http://api.thingspeak.com/update&api_key="
                + api_key
                + "&field1="
                + field1
                + "&field2="
                + field2
                + "&field3="
                + field3
                + "&field4="
                + field4
                + "&field5="
                + field5
                + "&field6="
                + field6
                + "&field7="
                + field7
                + "&field8="
                + field8
                + "=");
        }
    }

    //% blockId=IFTTT_set
    //% expandableArgumentMode"toggle" inlineInputMode=inline
    //% block="IFTTT Set| Event Name = %event_name| Write API key = %api_key| Value 1 = %value1|| Value 2 = %value2| Value 3 = %value3"
    export function IFTTT_set(event_name: string, api_key: string, value1: string, value2?: string, value3?: string): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+IFTTT?host=http://maker.ifttt.com/trigger/"
                + event_name
                + "/with/key/"
                + api_key
                + "&value1="
                + value1
                + "&value2="
                + value2
                + "&value3="
                + value3
                + "=");
        }
    }

    //% blockId=MQTT_set
    //% block="Connect MQTT| server %host| port %port| client id %clientId| username %username| password %pwd"
    export function MQTT_set(host: string, port: number, clientId: string, username: string, pwd: string): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+MQTT?host=" + host + "&port=" + port + "&clientId=" + clientId + "&username=" + username + "&password=" + pwd + "=");
            IOT_MQTT_CONNECTED = true
            control.waitMicros(500000)
        }
    }

    //%blockId=MQTTPublish
    //% block="MQTT publish topic %topic payload %payload"
    export function MQTTPublish(topic: string, payload: string): void {
        if (IOT_MQTT_CONNECTED) {
            serial.writeLine("AT+MQTT_Publish?topic=" + topic + "&payload=" + payload + "=");
        }
    }

    //%blockId=MQTTSubscribe
    //% block="MQTT subscribe topic %topic"
    export function MQTTSubscribe(topic: string): void {
        if (IOT_MQTT_CONNECTED) {
            control.waitMicros(800000)
            serial.writeLine("AT+MQTT_Subscribe?topic=" + topic + "=");
        }
    }

    //% blockId=MQTT_Data
    //% block="MQTT Topic %receivedata"
    export function MQTT_Data(receivedata: string): string {

        if (receivedata.compare(receive_topic_name) == 0) {
            return receive_topic_value;
        }
        else
            return "";

    }
    

    //% blockId=MQTTPublish1
    //% block="MQTT publish %top | payload %payload"
    export function MQTTPublish1(top: TOPIC, payload: string): void {
        if (IOT_MQTT_CONNECTED) {
            switch (top) {
                case TOPIC.Topic0: serial.writeLine("AT+MQTT_Publish?topic=" + MQTT_TOPIC[0] + "&payload=" + payload + "="); break;
                case TOPIC.Topic1: serial.writeLine("AT+MQTT_Publish?topic=" + MQTT_TOPIC[1] + "&payload=" + payload + "="); break;
                case TOPIC.Topic2: serial.writeLine("AT+MQTT_Publish?topic=" + MQTT_TOPIC[2] + "&payload=" + payload + "="); break;
                case TOPIC.Topic3: serial.writeLine("AT+MQTT_Publish?topic=" + MQTT_TOPIC[3] + "&payload=" + payload + "="); break;
                case TOPIC.Topic4: serial.writeLine("AT+MQTT_Publish?topic=" + MQTT_TOPIC[4] + "&payload=" + payload + "="); break;
            }
        }
    }

    //% blockId=MQTTSubscribe1
    //% block="MQTT subscribe  %top | %topic"
    export function MQTTSubscribe1(top: TOPIC, topic: string): void {
        if (IOT_MQTT_CONNECTED) {
            control.waitMicros(800000)
            MQTT_TOPIC[top] = topic
            serial.writeLine("AT+MQTT_Subscribe?topic=" + topic + "=");
            
        }

    }

    //% blockId=MQTT_Data1 
    //% block="On %top |received"
    export function MQTT_Data1(top: TOPIC, cb: (message: string) => void) {
        switch (top) {
            case TOPIC.Topic0: MQTT_CB[0] = () => { cb(receive_topic_value) }; break;
            case TOPIC.Topic1: MQTT_CB[1] = () => { cb(receive_topic_value) }; break;
            case TOPIC.Topic2: MQTT_CB[2] = () => { cb(receive_topic_value) }; break;
            case TOPIC.Topic3: MQTT_CB[3] = () => { cb(receive_topic_value) }; break;
            case TOPIC.Topic4: MQTT_CB[4] = () => { cb(receive_topic_value) }; break;
        }
    }

    //% blockId=HTML_POST
    //% block="HTML_POST Server %host| Header %header| Body %body"
    export function HTML_POST(host: string, header: string, body: string): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+HTML_POST?host="
                + host
                + "&header="
                + header
                + "&senddata="
                + body);
        }
    }

    //% blockId=TCP_Client
    //% block="TCP_Client Server %host Port %port Send Data %senddata"
    export function TCP_Client(host: string, port: number, senddata: string): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+TCP_Client?host="
                + host
                + "&port="
                + port
                + "&senddata="
                + senddata);
        }
    }

    //% blockId=TCP_Server
    //% block="TCP_Server Port %port"
    export function TCP_Server(port: number): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+TCP_Server?port="
                + port
                + "=");
        }
    }

    //% blockId=TCP_SendData
    //% block="TCP Send Data %senddata"
    export function TCP_SendData(senddata: string): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+TCP_SendData?senddata="
                + senddata);
        }
    }

    //% blockId=TCP_Close
    //% block="TCP_Client Close Connection"
    export function TCP_Close(): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+TCP_Close=");
        }
    }

    //% blockId=Receive_Data
    //% block="Receive Data"
    export function Receive_Data(): string {

        return iot_receive_data;
    }



}