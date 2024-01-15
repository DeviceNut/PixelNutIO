import { get } from 'svelte/store';

import mqtt from 'mqtt/dist/mqtt.min';

import {
  SECS_RESPONSE_TIMEOUT,
  deviceList,
  msgTitle,
  msgDesc,
  curTimeSecs,
  connectActive,
  connectFail
} from './globals.js';

import { deviceAdd } from './device.js';
import { devQuery, devReply } from './devtalk.js';
import { devStart } from './devstart.js';

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

// create timer for receiving a connection notification
// if device doesn't respond in time, stop and remove it
let connectTimer = 0;
//let oldts = curTimeSecs();
function CheckTimeout()
{
  let curlist = get(deviceList);
  if (curlist.length > 0)
  {
    let newlist = [];
    let tstamp = curTimeSecs();

    /*
    let diff = (tstamp - oldts);
    if (diff > SECS_RESPONSE_TIMEOUT)
      console.log(`${tstamp} TimerDiff = ${diff}`);
    oldts = tstamp;
    */
    for (const device of curlist)
    {
      //console.log(`Device Check: "${device.curname}""`);

      //if ((tstamp - device.tstamp) > 2)
      //  console.log(`Device Check? secs=${(tstamp - device.tstamp)}`);

      if (!device.ignore &&
          ((device.tstamp + SECS_RESPONSE_TIMEOUT) < tstamp))
      {
        console.warn(`Device Lost: "${device.curname}"`);
        //console.log(`  secs: ${tstamp} ${device.tstamp}`)

        if (device.active)
        {
          // trigger error message title/text
          msgDesc.set('The device you were using just disconnected.');
          msgTitle.set('Device Disconnect');

          deviceReset(device);
        }
      }
      else newlist.push(device);
    }

    deviceList.set(newlist);
  }

  connectTimer = setTimeout(CheckTimeout, (1000 * SECS_RESPONSE_TIMEOUT));
}

// if lose connection, clear devices
function SetConnection(enabled)
{
  if (enabled) CheckTimeout();
  else
  {
    //console.log('Removing all devices');
    deviceList.set([]);

    if (connectTimer)
    {
      clearTimeout(connectTimer);
      connectTimer = 0;
    } 
  }
}

function OnConnect(connack)
{
  //console.log('MQTT onConnect');
  //console.log(connack); // cannot tell if reconnection

  if (mqttClient !== null)
  {
    mqttClient.subscribe(topicDevNotify, OnSubscribe);
    mqttClient.subscribe(topicDevReply, OnSubscribe);
  
    SetConnection(true);
    connectActive.set(true);
  }
  else connectFail.set(true);

  mqttConnecting = false;
}

function OnSubscribe(err)
{
  if (err) OnError(err);
}

function OnError(err)
{
  console.error(`MQTT onError: ${err}`);

  if (get(connectActive))
  {
    SetConnection(false);
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

function OnClose()
{
  let secs = curTimeSecs() - mqttConnectSecs;
  console.log(`MQTT onClose: secs=${secs}`);

  if (get(connectActive))
  {
    SetConnection(false);
    connectActive.set(false);
  }
  else if (mqttConnecting)
  {
    connectFail.set(true);
    mqttConnecting = false;
  }

  mqttClient = null;
}

const OnDisconnect = (packet) =>
{
  console.log('MQTT Disconnect');
  console.log(packet);
}

const OnOffline = () =>
{
  console.log('MQTT Offline');
}

function AddDevice(name)
{
  const device = deviceAdd(name);
  // console.log('AddDevice:', device);

  // add specific to this protocol members:

  device.tstamp = curTimeSecs(); // last notify/response

  device.dinfo = {}; // holds raw JSON device output

  device.query = devQuery;
  device.start = devStart;
  device.stop  = IgnoreDevice;
  device.send  = mqttSend;

  return device;
}

function IgnoreDevice(device)
{
  device.ignore = true;
  deviceList.set(get(deviceList)); // update UI
}

function DeviceNotify(msg)
{
  const info = msg.split(',');
  const name = info[0];

  // console.log(`DeviceNotify: "${name}" IP=${info[1]}`);

  for (const device of get(deviceList))
  {
    /*
    let tstamp = curTimeSecs();
    if ((tstamp - device.tstamp) > 2)
      console.log(`Missing notifications? secs=${(tstamp - device.tstamp)}`);
    */
    device.tstamp = curTimeSecs();

    if (device.curname === name)
    {
      if (!device.ignore) device.query(device, true);

      return; // don't add
    }
    else if (device.newname === name)
    {
      console.log(`Device Rename: "${name}"`);

      device.curname = name;
      device.newname = '';

      return; // don't add
    }
  }

  let device = AddDevice(name);

  device.query(device);
}

function DeviceReply(msg)
{
  //console.log(`Device Reply: ${msg}`)

  const reply = msg.split('\n');
  const name = reply[0];
  reply.shift();

  let device = null;
  const dlist = get(deviceList);
  for (const d of dlist)
  {
    if (d.curname === name)
    {
      device = d;
      break;
    }
  }

  if (device === null)
  {
    console.log('No device on reply??', msg);
    return;
  }
  if (device.ignore) return;

  device.tstamp = curTimeSecs();

  devReply(device, reply[0]);
}

function OnMessage(topic, msg)
{
  mqttConnecting = false;

  msg = msg.toString();

  //console.log(`MQTT onMessge: Topic=${topic} Msg=${msg}`);

  switch (topic)
  {
    case topicDevNotify:
      DeviceNotify(msg);
      break;

    case topicDevReply:
      DeviceReply(msg);
      break;
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
    mqttClient.on('connect', OnConnect);
    mqttClient.on('message', OnMessage);
    mqttClient.on('error', OnError);
    mqttClient.on('close', OnClose);

    mqttClient.on('disconnect', OnDisconnect);
    mqttClient.on('offline', OnOffline);
  }
  else
  {
    mqttConnecting = false;
    connectFail.set(true);
  }
}

export const mqttDisconnect = () =>
{
  if (mqttClient !== null)
  {
    console.log(`MQTT Disconnect: ${mqttIPaddr}`);

    SetConnection(false);

    mqttClient.end();
    mqttIPaddr = '';
    mqttConnecting = false;

    // wait for onClose() before setting status and clearing client
  }
}

export const mqttSend = (msg, name) =>
{
  if (mqttClient)
  {
    console.log(`>> ${msg}`);

    mqttClient.publish(topicCommand + name, msg);
  }
  else console.error(`MQTT Send: disconnected (msg="${msg}")`);
}
