import { get } from 'svelte/store';

import {
  MQTT_BROKER_PORT,
  mqttBrokerIP,
  mqttBrokerFail
} from './globals.js';

import { 
  onConnection,
  onNotification,
  onCommandReply
} from './pixtalk.js';

//const host = '192.168.8.222'; // do NOT put http/wss prefixes on this

const topicDevNotify  = 'PixelNut/Notify';
const topicDevReply   = 'PixelNut/Reply';
const topicCommand    = 'PixelNut/Cmd/'; // + devicename

let mqtt = null;

function onConnect()
{
  console.log('MQTT Subscribing...'); // DEBUG
  mqtt.subscribe(topicDevNotify);
  mqtt.subscribe(topicDevReply);

  onConnection(true);
}

function onLostConnect(rsp)
{
  if (rsp.errorCode !== 0)
  {
    console.error(`MQTT Lost Connection: ${rsp.errorMessage}`);
    onConnection(false);
    mqtt = null; // prevent disconnecting (crash & hang)
  }
}

function onFailure(rsp)
{
  console.error(`MQTT Broker Failed: ${rsp.errorMessage}`);
  onConnection(false);
  mqtt = null; // prevent disconnecting (crash & hang)

  mqttBrokerFail.set(true);
}

function onMessage(message)
{
  let msg = message.payloadString;
  //console.log(`MQTT Topic=${message.topic} Msg=${msg}`); // DEBUG

  switch (message.topic)
  {
    case topicDevNotify:
      onNotification(msg);
      break;

    case topicDevReply:
      onCommandReply(msg);
      break;
  }
}

export const mqttConnect = () =>
{
  onConnection(false);
  if (mqtt !== null) mqtt.disconnect();

  mqtt = new Paho.Client(get(mqttBrokerIP), MQTT_BROKER_PORT, 'pixelnut');

  console.log(`MQTT Connecting to ${get(mqttBrokerIP)}...`); // DEBUG

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

export const mqttSend = (name, msg) =>
{
  console.log('>>', msg); // DEBUG

  mqtt.publish(topicCommand + name, msg);
}
