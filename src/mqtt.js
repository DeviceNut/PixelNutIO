import { get } from 'svelte/store';
//import { mqttConnect } from './pixelnut.js';

const host = '192.168.8.222'; // do NOT put http/wss prefixes on this
const port = 9001;            // MUST be 9001 for websocket

const topicDevNotify  = 'PixelNut/Notify';
const topicDevReply   = 'PixelNut/Reply';
const topicCommand    = 'PixelNut/Cmd/'; // + devicename
const topicBaseName   = 'PixelNut/'; // FIXME: remove

let mqtt;

function onConnect()
{
  console.log('MQTT Subscribing...');
  mqtt.subscribe(topicDevNotify);
  mqtt.subscribe(topicDevReply);

  //mqttSend('P E0 B70 H45 T G');
}

function onLostConnect(rsp)
{
  if (responseObject.errorCode !== 0)
  {
    console.error(`MQTT Connection: ${rsp.errorMessage}`);
  }
}

function onFailure(errmsg)
{
  console.error(`MQTT Failure: ${errmsg}`);
}

function onMessage(message)
{
  console.log(`MQTT Message: ${message.payloadString}`);
}

export const mqttConnect = () =>
{
  console.log('MQTT Connecting...');

  mqtt = new Paho.Client(host, port, 'pixelnut');
  let options = {
    timeout: 3,
    onSuccess: onConnect,
    onFailure: onFailure,
  };
  mqtt.connect(options);

  mqtt.onMessageArrived = onMessage;
  mqtt.onConnectionLost = onLostConnect;
}

export const mqttSend = (msg) =>
{
  let topic = topicBaseName + 'Music Room';
  let message = new Paho.Message(msg);
  message.destinationName = topic;
  mqtt.send(message);
}
