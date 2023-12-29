import { get } from 'svelte/store';
import mqtt from 'mqtt/dist/mqtt.min';

import {
  curTimeSecs,
  connectActive,
  connectFail
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
let mqttIPaddr = '';
let mqttConnecting = false;
let mqttConnectSecs = 0;

export const mqttSend = (msg, name) =>
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

  if (mqttClient !== null)
  {
    mqttClient.subscribe(topicDevNotify, onSubscribe);
    mqttClient.subscribe(topicDevReply, onSubscribe);
  
    onConnection(true);
    connectActive.set(true);
  }
  else connectFail.set(true);

  mqttConnecting = false;
}

function onSubscribe(err)
{
  if (err) onError(err);
}

function onError(err)
{
  console.error(`MQTT onError: ${err}`);

  if (get(connectActive))
  {
    onConnection(false);
    connectActive.set(false);
    connectFail.set(true);
  }

  if (mqttClient)
  {
    mqttClient.end();
    mqttClient = null;
  }

  mqttConnecting = false;
}

function onClose()
{
  let secs = curTimeSecs() - mqttConnectSecs;
  console.log(`MQTT onClose: secs=${secs}`);

  if (get(connectActive))
  {
    onConnection(false);
    connectActive.set(false);
  }
  else if (mqttConnecting)
  {
    connectFail.set(true);
    mqttConnecting = false;
  }

  mqttClient = null;
}

function onMessage(topic, msg)
{
  mqttConnecting = false;

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

export const mqttDisconnect = () =>
{
  if (mqttClient !== null)
  {
    console.log(`MQTT Disconnect: ${mqttIPaddr}`);

    onConnection(false);

    mqttClient.end();
    mqttIPaddr = '';
    mqttConnecting = false;

    // wait for onClose() before setting status and clearing client
  }
}

export const mqttConnect = (ipaddr) =>
{
  console.log(`MQTT Connect: ${ipaddr}`);

  mqttConnecting = true;
  mqttConnectSecs = curTimeSecs();

  const mqttURL = `ws://${ipaddr}:${MQTT_BROKER_PORT}`
  mqttClient = mqtt.connect(mqttURL, mqttOptions);

  if (mqttClient !== null)
  {
    mqttIPaddr = ipaddr;
    mqttClient.on('connect', onConnect);
    mqttClient.on('message', onMessage);
    mqttClient.on('error', onError);
    mqttClient.on('close', onClose);

    mqttClient.on('disconnect', onDisconnect);
    mqttClient.on('offline', onOffline);
  }
  else
  {
    mqttConnecting = false;
    connectFail.set(true);
  }
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
