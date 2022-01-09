import mqtt from 'mqtt/dist/mqtt.min';

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

const clientID = '!' + (Math.random() + 1).toString(36).slice(-10);

const mqttOptions = {
  clientId: clientID,
  clean: true,
  connectTimeout: 1000,
  reconnectPeriod: 0
};

let mqttClient = null;

export const mqttSend = (name, msg) =>
{
  console.log('>>', msg);

  mqttClient.publish(topicCommand + name, msg);
}

function onConnect()
{
  console.log('MQTT Subscribing...');

  mqttClient.subscribe(topicDevNotify, onSubscribe);
  mqttClient.subscribe(topicDevReply, onSubscribe);

  onConnection(true);
  mqttConnected.set(true);
}

function onSubscribe(err)
{
  if (err) onError(err);
}

function onError(err)
{
  console.warn(`MQTT Error: ${err}`);

  onConnection(false);
  mqttConnected.set(false);
  mqttBrokerFail.set(true);

  mqttClient.end();
  mqttClient = null; // prevent disconnecting (crash & hang)
}

function onClose()
{
  console.warn(`MQTT Close`);

  onConnection(false);
  mqttConnected.set(false);

  mqttClient = null; // prevent disconnecting (crash & hang)
}

function onMessage(topic, msg)
{
  msg = msg.toString();

  //console.log(`MQTT Messge: Topic=${topic} Msg=${msg}`);

  switch (topic)
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
  if (mqttClient !== null) mqttClient.end();

  console.log(`MQTT Request connection: ${ipaddr}`);

  const mqttURL = `ws://${ipaddr}:${MQTT_BROKER_PORT}`
  mqttClient = mqtt.connect(mqttURL, mqttOptions);

  if (mqttClient !== null)
  {
    mqttClient.on('connect', onConnect);
    mqttClient.on('message', onMessage);
    mqttClient.on('error', onError);
    mqttClient.on('close', onClose);
  }
  else mqttBrokerFail.set(true);
}
