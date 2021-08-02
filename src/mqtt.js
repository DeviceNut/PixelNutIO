import { 
  doConnect,
  doDisconnect,
  findDevice,
  parseInfo,
  cmdStr_GetInfo
} from './pixelnut.js';

const host = '192.168.8.222'; // do NOT put http/wss prefixes on this
const port = 9001;            // MUST be 9001 for websocket

const topicDevNotify  = 'PixelNut/Notify';
const topicDevReply   = 'PixelNut/Reply';
const topicCommand    = 'PixelNut/Cmd/'; // + devicename
const topicBaseName   = 'PixelNut/'; // FIXME: remove

let mqtt = 0;

function onConnect()
{
  console.log('MQTT Subscribing...');
  mqtt.subscribe(topicDevNotify);
  mqtt.subscribe(topicDevReply);

  doConnect();
}

function onLostConnect(rsp)
{
  if (rsp.errorCode !== 0)
  {
    console.error(`MQTT Connection: ${rsp.errorMessage}`);
  }
}

function onFailure(rsp)
{
  console.error(`MQTT Failure: ${rsp.errorMessage}`);
}

function onMessage(message)
{
  let msg = message.payloadString;
  //console.log(`MQTT Topic=${message.topic} Msg=${msg}`);

  switch (message.topic)
  {
    case topicDevNotify:
      //console.log(`Notify=${msg}`);
      onNotify(msg);
      break;

    case topicDevReply:
      console.log(`Reply=${msg}`)
      onReply(msg);
      break;
  }
}

function onNotify(msg)
{
  const info = msg.split(',');
  const name = info[0];

  //console.log(`Device="${name}" IP=${info[1]}`);

  const dobj = findDevice(name, true); // add if not found
  if (dobj.isnew)
  {
    console.log('Requesting device info...');
    //mqtt.publish(topicCommand + name, cmdStr_GetInfo);
    mqtt.publish(topicBaseName + name, cmdStr_GetInfo); // FIXME: remove
  }
}

function onReply(msg)
{
  const info = msg.split('\n');
  const name = info[0];
  const device = findDevice(name).device;
  if (device !== null)
  {
    info.shift();
    if (!parseInfo(device, info))
      console.error(`Reply parse failed: "${name}"`);
  }
  else console.error(`No device found: "${name}"`);
}

export const mqttBrokerSearch = () => // TODO
{
  console.log('Seareching for MQTT Broker...');
  console.log(`Found: ${host}:${port}`);
}

export const mqttConnect = () =>
{
  doDisconnect();
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
}

export const mqttSend = (msg) =>
{
  console.log('>>', msg);
  let topic = topicBaseName + 'Music Room';
  let message = new Paho.Message(msg);
  message.destinationName = topic;
  mqtt.send(message);
}
