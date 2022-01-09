import {
  mqttConnected,
  mqttBrokerFail
} from './globals.js';

import { 
  onConnection,
  onNotification,
  onDeviceReply
} from './devtalk.js';

const MQTT_BROKER_PORT  = 9001;   // MUST be 9001 for websocket
const topicDevNotify    = 'PixelNut/Notify';
const topicDevReply     = 'PixelNut/Reply';
const topicCommand      = 'PixelNut/Cmd/'; // + devicename

let mqtt = null;

export const mqttSend = (name, msg) =>
{
  console.log('>>', msg);

  mqtt.publish(topicCommand + name, msg);
}

function onConnect()
{
  console.log('MQTT Subscribing...');
  mqtt.subscribe(topicDevNotify);
  mqtt.subscribe(topicDevReply);

  onConnection(true);
  mqttConnected.set(true);
}

function onLostConnect(rsp)
{
  if (rsp.errorCode !== 0)
  {
    console.warn(`MQTT Lost Connection: ${rsp.errorMessage}`);
    onConnection(false);
    mqtt = null; // prevent disconnecting (crash & hang)
  }
}

function onFailure(rsp)
{
  console.warn(`MQTT Broker Failed: ${rsp.errorMessage}`);

  onConnection(false);
  mqttConnected.set(true);

  mqtt = null; // prevent disconnecting (crash & hang)

  mqttBrokerFail.set(true);
}

function onMessage(message)
{
  let msg = message.payloadString;
  //console.log(`MQTT Topic=${message.topic} Msg=${msg}`);

  switch (message.topic)
  {
    case topicDevNotify:
      onNotification(msg, mqttSend);
      break;

    case topicDevReply:
      onDeviceReply(msg, mqttSend);
      break;
  }
}

export const mqttConnect = (ipaddr) =>
{
  onConnection(false);
  if (mqtt !== null) mqtt.disconnect();

  console.log(`MQTT Request connection: ${ipaddr}`);

  const clientid = '!' + (Math.random() + 1).toString(36).slice(-10);
  mqtt = new Paho.Client(ipaddr, MQTT_BROKER_PORT, clientid);

  if (mqtt !== null)
  {
    console.log(`MQTT Connecting to ${ipaddr}...`);

    let options = {
      timeout: 1,
      //reconnect: false,   // these are defaults
      //cleanSession: true,
      onSuccess: onConnect,
      onFailure: onFailure,
    };
    mqtt.connect(options);

    mqtt.onMessageArrived = onMessage;
    mqtt.onConnectionLost = onLostConnect;
    //mqtt.disconnectedPublishing = true/false;
    //mqtt.onMessageDelivered
    //mqtt.onMessageArrived
  }
  else mqttBrokerFail.set(true);
}
