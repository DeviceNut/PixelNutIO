import { get } from 'svelte/store';

import {
  MQTT_BROKER_PORT,
  mqttBrokerIP,
  mqttBrokerFail
} from './globals.js';

import { 
  onConnection,
  onNotification,
  onDeviceReply
} from './devtalk.js';

const topicDevNotify  = 'PixelNut/Notify';
const topicCommand    = 'PixelNut/Cmd/'; // + devicename
const topicDevReply   = 'PixelNut/Reply';

let mqtt = null;

export const mqttSend = (name, msg) =>
{
  console.log('>>', msg); // DEBUG

  mqtt.publish(topicCommand + name, msg);
}

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
    console.warn(`MQTT Lost Connection: ${rsp.errorMessage}`);
    onConnection(false);
    mqtt = null; // prevent disconnecting (crash & hang)
  }
}

function onFailure(rsp)
{
  console.warn(`MQTT Broker Failed: ${rsp.errorMessage}`);
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
      onNotification(msg, mqttSend);
      break;

    case topicDevReply:
      onDeviceReply(msg, mqttSend);
      break;
  }
}

function genUniqueID()
{
  const id = '!' + (Math.random() + 1).toString(36).substr(-10);
  console.log(`MQTT ID: ${id}`);
  return id;
};

export const mqttConnect = () =>
{
  onConnection(false);
  if (mqtt !== null) mqtt.disconnect();

  mqtt = new Paho.Client(get(mqttBrokerIP), MQTT_BROKER_PORT, genUniqueID());

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
