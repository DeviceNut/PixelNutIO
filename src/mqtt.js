import { get } from 'svelte/store';
import mqtt from 'mqtt/dist/mqtt.min';

import {
  mqttBrokerIP,
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

const mqttOptions = {
  //clientId: clientID, // let it create random clientID
  clean: true,
  connectTimeout: 1000,
  reconnectPeriod: 0 // don't auto-reconnect
};

let mqttClient = null;

function outime(msg, err)
{
  let secs = Math.floor(Date.now() / 1000);
  if (err) console.error(`${secs} ${msg}`);
  else console.log(`${secs} ${msg}`);
}
export const mqttSend = (name, msg) =>
{
  if (mqttClient)
  {
    outime(`>> ${msg}`);

    mqttClient.publish(topicCommand + name, msg);
  }
  else outime(`MQTT Send: disconnected (msg="${msg}")`, true);
}

function onConnect(connack)
{
  outime('MQTT Connected');
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
  outime(`MQTT Error: ${err}`, true);

  if (get(mqttConnected))
  {
    onConnection(false);
    mqttConnected.set(false);
    mqttBrokerFail.set(true);
  }

  if (mqttClient)
  {
    mqttClient.end();
    mqttClient = null;
  }
}

function onClose()
{
  outime('MQTT Close');

  if (get(mqttConnected))
  {
    onConnection(false);
    mqttConnected.set(false);
    //mqttBrokerFail.set(true); // TODO
  }

  mqttClient = null;
}

function onMessage(topic, msg)
{
  msg = msg.toString();

  //outime(`MQTT Messge: Topic=${topic} Msg=${msg}`);

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

export const mqttConnect = () =>
{
  if (mqttClient !== null)
  {
    outime(`MQTT Disconnect`);
    onConnection(false);
    mqttClient.end();
  }

  mqttBrokerFail.set(false);
  let ipaddr = get(mqttBrokerIP);

  outime(`MQTT DoConnect: ${ipaddr}`);

  const mqttURL = `ws://${ipaddr}:${MQTT_BROKER_PORT}`
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
  else mqttBrokerFail.set(true);
}

const onDisconnect = (packet) =>
{
  outime(`MQTT Disconnect: ${packet}`);
}

const onOffline = () =>
{
  outime('MQTT Offline');
}
