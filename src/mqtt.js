import { get } from 'svelte/store';
import mqtt from 'mqtt/dist/mqtt.min';

import {
  mqttBrokerIP,
  mqttConnected,
  mqttConnFail
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

const mqttOptions = {
  //clientId: clientID, // let it create random clientID
  clean: true,
  connectTimeout: 1000,
  reconnectPeriod: 0 // don't auto-reconnect
};

let mqttClient = null;

export const mqttSend = (name, msg) =>
{
  if (mqttClient)
  {
    console.log(`>> ${msg}`);

    mqttClient.publish(topicCommand + name, msg);
  }
  else console.error(`MQTT Send: disconnected (msg="${msg}")`);
}

function onConnect(connack)
{
  //console.log('MQTT onConnect');
  //console.log(connack); // cannot tell if reconnection

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
  console.error(`MQTT onError: ${err}`);

  if (get(mqttConnected))
  {
    onConnection(false);
    mqttConnected.set(false);
    mqttConnFail.set(true);
  }

  if (mqttClient)
  {
    mqttClient.end();
    mqttClient = null;
  }
}

function onClose()
{
  console.log('MQTT onClose');

  if (get(mqttConnected))
  {
    onConnection(false);
    mqttConnected.set(false);
  }

  mqttClient = null;
}

function onMessage(topic, msg)
{
  msg = msg.toString();

  //console.log(`MQTT onMessge: Topic=${topic} Msg=${msg}`);

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

// must not reconnect to the same already connect broker,
// since the .end() call will cause an asynchronous call
// to onClose() with the onConnect() call.
export const mqttConnect = () =>
{
  if (mqttClient !== null)
  {
    console.log(`MQTT Connect: disconnect first`);
    onConnection(false);
    mqttClient.end();
  }

  mqttConnFail.set(true);
  return;

  let ipaddr = get(mqttBrokerIP);
  const mqttURL = `ws://${ipaddr}:${MQTT_BROKER_PORT}`

  console.log(`MQTT Connect: ${ipaddr}`);
  mqttClient = mqtt.connect(mqttURL, mqttOptions);

  if (mqttClient !== null)
  {
    mqttClient.on('connect', onConnect);
    mqttClient.on('message', onMessage);
    mqttClient.on('error', onError);
    mqttClient.on('close', onClose);

    mqttClient.on('disconnect', onDisconnect);
    mqttClient.on('offline', onOffline);
  }
  else mqttConnFail.set(true);
}

const onDisconnect = (packet) =>
{
  console.log('MQTT onDisconnect');
  console.log(packet);
}

const onOffline = () =>
{
  console.log('MQTT onOffline');
}
