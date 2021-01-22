/**
 * KSRobot_IOT V0.010
 */

declare namespace KSRobotCPP {
    //% shim=KSRobotCPP::mb_version
    function mb_version(): int32;

}

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
    let Version = "1"

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
            let compare_str4 = "@#$@Version$"
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
            else if (iot_receive_data.indexOf(compare_str2) >= 0) {
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
            else if (iot_receive_data.indexOf(compare_str3) >= 0) {
                strlen1 = iot_receive_data.indexOf(compare_str3) + compare_str3.length
                strlen2 = iot_receive_data.indexOf(compare_str0) - strlen3
                strlen3 = iot_receive_data.indexOf(compare_str0) + compare_str0.length
                strlen4 = iot_receive_data.length - strlen3
                temp_name = iot_receive_data.substr(strlen1, strlen2)
                ap_ip = iot_receive_data.substr(strlen3, strlen4)
            }
            else if (iot_receive_data.indexOf(compare_str4) >= 0) {
                strlen1 = iot_receive_data.indexOf(compare_str4) + compare_str4.length
                strlen2 = iot_receive_data.indexOf(compare_str0) - strlen3
                strlen3 = iot_receive_data.indexOf(compare_str0) + compare_str0.length
                strlen4 = iot_receive_data.length - strlen3
                temp_name = iot_receive_data.substr(strlen1, strlen2)
                Version = iot_receive_data.substr(strlen3, strlen4)
            }



        })

    }


    /**
      * Set KSRobot WIFI IOT Module 
      * @param txd Iot module to micro:bit ; eg: SerialPin.P15
      * @param rxd micro:bit to Iot module ; eg: SerialPin.P8
      */
    //% blockId=Wifi_setup
    //% weight=100
    //% block="KSRobot WIFI Set| TXD %txd| RXD %rxd| SSID %ssid| PASSWORD %passwd| AP %ap"


    export function Wifi_setup(txd: SerialPin, rxd: SerialPin, ssid: string, passwd: string, ap: IOT_Config): void {
        pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
        control.waitMicros(500000)

        serial.redirect(
            txd,   //TX
            rxd,  //RX
            BaudRate.BaudRate115200
        );
        let wait_time = 0;

        serial.setRxBufferSize(128)
        serial.setTxBufferSize(128)
        control.waitMicros(500000)
        WifiDataReceived()
        control.waitMicros(200000)

        if (KSRobotCPP.mb_version()) {
            serial.writeLine("AT+Restart=");
            control.waitMicros(1300000)
        }



        pins.setPull(DigitalPin.P8, PinPullMode.PullNone)


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
    //% weight=90
    //% block="Get Local IP"
    export function Get_IP(): string {
        return local_ip;
    }
    //% blockId=AP_Name
    //% weight=89
    //% block="IOT AP Name"
    export function AP_Name(): string {
        return ap_ip;
    }

    //% blockId=Get_Version
    //% weight=87
    //% block="Get Version"
    export function Get_Version(): string {
        return Version;
    }

    //% blockId=Wifi_Connection
    //% weight=86
    //% block="Wifi Connection"
    export function Wifi_Connection(): boolean {
        return IOT_WIFI_CONNECTED;
    }

    //% blockId=ThingSpeak_set 
    //% weight=80
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
    //% weight=75
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
    //% weight=70
    //% block="Connect MQTT| server %host| port %port| client id %clientId| username %username| password %pwd"
    export function MQTT_set(host: string, port: number, clientId: string, username: string, pwd: string): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+MQTT?host=" + host + "&port=" + port + "&clientId=" + clientId + "&username=" + username + "&password=" + pwd + "=");
            control.waitMicros(1000000)
            IOT_MQTT_CONNECTED = true
        }
    }

    //%blockId=MQTTPublish
    //% weight=69
    //% block="MQTT publish topic %topic payload %payload"
    export function MQTTPublish(topic: string, payload: string): void {
        if (IOT_MQTT_CONNECTED) {
            serial.writeString("AT+MQTT_Publish?topic=" + topic + "&payload=" + payload + "=" + "\r\n");

        }
    }

    //%blockId=MQTTSubscribe
    //% weight=68
    //% block="MQTT subscribe topic %topic"
    export function MQTTSubscribe(topic: string): void {
        if (IOT_MQTT_CONNECTED) {
            control.waitMicros(600000)
            serial.writeLine("AT+MQTT_Subscribe?topic=" + topic + "=");

        }
    }

    //% blockId=MQTT_Data
    //% weight=67
    //% block="MQTT Topic %receivedata"
    export function MQTT_Data(receivedata: string): string {

        if (receivedata.compare(receive_topic_name) == 0) {
            return receive_topic_value;
        }
        else
            return "";

    }


    //% blockId=MQTTPublish1
    //% weight=66
    //% block="MQTT publish %top | payload %payload"
    export function MQTTPublish1(top: TOPIC, payload: string): void {
        if (IOT_MQTT_CONNECTED) {
            switch (top) {
                case TOPIC.Topic0: serial.writeString("AT+MQTT_Publish?topic=" + MQTT_TOPIC[0] + "&payload=" + payload + "=" + "\r\n"); break;
                case TOPIC.Topic1: serial.writeString("AT+MQTT_Publish?topic=" + MQTT_TOPIC[1] + "&payload=" + payload + "=" + "\r\n"); break;
                case TOPIC.Topic2: serial.writeString("AT+MQTT_Publish?topic=" + MQTT_TOPIC[2] + "&payload=" + payload + "=" + "\r\n"); break;
                case TOPIC.Topic3: serial.writeString("AT+MQTT_Publish?topic=" + MQTT_TOPIC[3] + "&payload=" + payload + "=" + "\r\n"); break;
                case TOPIC.Topic4: serial.writeString("AT+MQTT_Publish?topic=" + MQTT_TOPIC[4] + "&payload=" + payload + "=" + "\r\n"); break;
            }
        }
    }

    //% blockId=MQTTSubscribe1
    //% weight=65
    //% block="MQTT subscribe  %top | %topic"
    export function MQTTSubscribe1(top: TOPIC, topic: string): void {
        if (IOT_MQTT_CONNECTED) {
            control.waitMicros(600000)
            MQTT_TOPIC[top] = topic
            serial.writeLine("AT+MQTT_Subscribe?topic=" + topic + "=");


        }

    }

    //% blockId=MQTT_Data1 
    //% weight=64
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
    //% weight=60
    //% block="HTML_POST Server %host| Header %header| Body %body"
    export function HTML_POST(host: string, header: string, body: string): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeString("AT+HTML_POST?host="
                + host
                + "&header="
                + header
                + "&senddata="
                + body
                + "=" + "\r\n");

        }
    }

    //% blockId=TCP_Client
    //% weight=59
    //% block="TCP_Client Server %host Port %port Send Data %senddata"
    export function TCP_Client(host: string, port: number, senddata: string): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeString("AT+TCP_Client?host="
                + host
                + "&port="
                + port
                + "&senddata="
                + senddata
                + "=" + "\r\n");
        }
    }

    //% blockId=TCP_Server
    //% weight=58
    //% block="TCP_Server Port %port"
    export function TCP_Server(port: number): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+TCP_Server?port="
                + port
                + "=");
        }
    }

    //% blockId=TCP_SendData
    //% weight=57
    //% block="TCP Send Data %senddata"
    export function TCP_SendData(senddata: string): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeString("AT+TCP_SendData?senddata="
                + senddata
                + "=" + "\r\n");
        }
    }

    //% blockId=TCP_Close
    //% weight=56
    //% block="TCP_Client Close Connection"
    export function TCP_Close(): void {
        if (IOT_WIFI_CONNECTED) {
            serial.writeLine("AT+TCP_Close=");
        }
    }

    //% blockId=Receive_Data
    //% weight=50
    //% block="Receive Data"
    export function Receive_Data(): string {

        return iot_receive_data;
    }



}