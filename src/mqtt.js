import { 
  onConnection,
  onNotification,
  onCommandReply
} from './pixtalk.js';

const host = '192.168.8.222'; // do NOT put http/wss prefixes on this
const port = 9001;            // MUST be 9001 for websocket

const topicDevNotify  = 'PixelNut/Notify';
const topicDevReply   = 'PixelNut/Reply';
const topicCommand    = 'PixelNut/Cmd/'; // + devicename

let mqtt = 0;

function onConnect()
{
  console.log('MQTT Subscribing...');
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
  }
}

function onFailure(rsp)
{
  console.error(`MQTT Broker Failed: ${rsp.errorMessage}`);
  onConnection(false);
}

function onMessage(message)
{
  let msg = message.payloadString;
  //console.log(`MQTT Topic=${message.topic} Msg=${msg}`);

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

export const mqttBrokerSearch = () => // TODO
{
  console.log('Searching for MQTT Broker...');
  console.log(`Found: ${host}:${port}`);
}

export const mqttConnect = () =>
{
  onConnection(false);
  if (mqtt) mqtt.disconnect();

  mqtt = new Paho.Client(host, port, 'pixelnut');

  console.log('MQTT Connecting...');

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
  //mqtt.disconnectedPublishing = true/false; // TODO?
  //mqtt.onMessageDelivered
  //mqtt.onMessageArrived
}

export const mqttSend = (name, msg) =>
{
  mqtt.publish(topicCommand + name, msg);
}
