import { get } from 'svelte/store';

import {
  SECS_QUERY_TIMEOUT,
  PAGEMODE_CTRLS_ORG,
  curPageMode,
  curDevice,
  connectActive,
  devUpdate,
  deviceList,
  nStrands,
  sStrands,
  idStrand,
  pStrand,
  aStrands,
  dupStrand,
  nTracks,
  nLayers,
  maxLenPattern,
  MIN_TRACKS,
  MIN_LAYERS,
  MINLEN_MAXPATTERN,
  // waitTimeout,
} from './globals.js';

import {
  strandInfo,
  deviceAdd,
  deviceError,
  deviceReset,
} from './device.js';

import { devQuery, devReply } from './devtalk.js';
import { devStart } from './devstart.js';

import {
  MAX_FORCE_VALUE,
  orgpatGetInfo,
} from './orgpatts.js';

import { strandCreateNew } from './strands.js';

const SERVICE_UUID_UART = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E".toLowerCase();
const CHAR_UUID_UART_TX = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E".toLowerCase();
const CHAR_UUID_UART_RX = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E".toLowerCase();

const REPLYSTR_ORG_PROTO = 'P!';
const REPLYSTR_NEW_PROTO = 'P!!';

let bleCharRx, bleCharTx;
let replyWait = false;
let replyStr = '';
let replyState = 0;
let replyCount = 0;
let queryType = 0;
let replyError = 0;
let querySegs = false;
let bleDevice = null;
let theDevice = null;

async function WaitUntil(condition)
{
  let toutCount = 0;
  const toutMax = SECS_QUERY_TIMEOUT * 1000;

  while (!condition())
  {
    toutCount += 100;
    if (toutCount > toutMax)
    {
      const estr = `Device not responding: ${replyState}.${replyCount}`;
      deviceError(estr, 'Device Error');
      deviceList.set([]);
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return true;
}

function ReplyLine1(strs)
{
  if (strs.length === 6)
  {
    const strand = {...strandInfo};
    theDevice.report.strands.push(strand);

    theDevice.report.nstrands   = parseInt(strs[0]);
    strand.patnum               = parseInt(strs[1]); // current pattern #
    theDevice.report.npatterns  = parseInt(strs[2]);
    const features              = parseInt(strs[3]); // 1 if no external patterns
    let multistrand             = parseInt(strs[4]);
    theDevice.report.maxstrlen  = parseInt(strs[5]);

    if (features & 1) // must be able to support external patterns
    {
      replyError = 10;
      return;
    }

    if (theDevice.report.nstrands < 0) // old firmware
    {
      theDevice.report.nstrands = -theDevice.report.nstrands;
      multistrand = 11;
    }

    if (!multistrand && (theDevice.report.nstrands > 1))
    {
      replyError = 12;
      return;
    }

    if ((theDevice.report.nstrands < 1) ||
        (theDevice.report.patnum   < 1) ||
        (theDevice.report.maxstrlen < MINLEN_MAXPATTERN))
    {
      replyError = 13;
      return;
    }
  }
  else replyError = 14;
}

function OnNotification(event)
{
  let value = event.target.value;
  // console.log('Notify:', event);

  for (let i = 0; i < value.byteLength; ++i)
  {
    const chval = value.getUint8(i);
    if (chval === 10) // newline
    {
      // console.log('BLE reply:', replyStr);

      if (theDevice.newproto)
      {
        if (!devReply(theDevice, replyStr))
        {
          replyError = 1;
          const estr = `Cannot support this device: #${replyError}`;
          deviceError(estr, 'Device Problem');
          deviceList.set([]);
          theDevice = null;
        }
      }
      else
      {
        const strs = replyStr.trim().split(' ');

        switch (replyState)
        {
          case 1:
          {
            replyCount = parseInt(strs[1]);
  
            if ((strs[0] === REPLYSTR_ORG_PROTO) && (replyCount >= 1))
            {
              console.log('BLE reply:', replyStr);
              queryType = --replyCount; // 1,2,3 (multi-strand, multi-segs, single strand/seg)
              replyState = 2;
            }
            else replyError = 2;
  
            theDevice.report.strands = [];
            break;
          }
          case 2:
          {
            --replyCount;
            switch (queryType)
            {
              case 3:
              {
                switch (replyCount)
                {
                  case 2:
                  {
                    ReplyLine1(strs);
                    break;
                  }
                  case 1:
                  {
                    if (strs.length === 5)
                    {
                      const strand = theDevice.report.strands[0];
                      strand.pixels               = parseInt(strs[0]);
                      theDevice.report.numlayers  = parseInt(strs[1]);
                      theDevice.report.numtracks  = parseInt(strs[2]);
                      strand.bright               = parseInt(strs[3]);
                      strand.delay                = parseInt(strs[4]);
  
                      if ((theDevice.report.numlayers < MIN_TRACKS) ||
                          (theDevice.report.tracklayers < MIN_LAYERS))
                      {
                        replyError = 21;
                        break;
                      }
                    }
                    else replyError = 20;
                    break;
                  }
                  case 0:
                  {
                    if (strs.length >= 4)
                    {
                      const strand = theDevice.report.strands[0];
                      strand.xt_mode  = parseInt(strs[0]);
                      strand.xt_hue   = parseInt(strs[1]);
                      strand.xt_white = parseInt(strs[2]);
                      strand.xt_count = parseInt(strs[3]);
                    }
                    else replyError = 30;
                    break;
                  }
                }
                break;
              }
              case 2: // TODO: multi-segments
              {
                break;
              }
              case 1:
              {
                ReplyLine1(strs);
                if (!replyError) querySegs = true;
                break;
              }
            }
  
            if (!replyCount) // success
            {
              console.log('BLE device:', theDevice);
              replyState = 0; // ignore all subsequent replies
              replyWait = false;
            }
            break;
          }
          case 3: // TODO: segment query
          {
            break;
          }
        }
      }

      replyStr = '';

      if (replyError) // failure
      {
        replyState = 0; // ignore all subsequent replies
        replyWait = false;
        break;
      }
    }
    else replyStr += String.fromCharCode(chval);
  }
}

export const bleSupported = async () =>
{
  if (navigator.bluetooth && await navigator.bluetooth.getAvailability())
  {
    console.log('BLE is supported');
    return true;
  }
  console.log('BLE is NOT supported');
  return false;
}

export const bleRequest = async () =>
{
  theDevice = null;
  deviceList.set([]);

  try
  {
    bleDevice = await navigator.bluetooth.requestDevice({
      // acceptAllDevices: true,
      filters: [{ namePrefix: REPLYSTR_ORG_PROTO }],
      optionalServices: [SERVICE_UUID_UART]
    });

    return !!bleDevice;
  }
  catch(err)
  {
    const estr = err.toString();
    if (!estr.startsWith('NotFoundError'))
      deviceError(estr, 'Device Pair Failed');
  }

  return false;
}

export const bleConnect = async () =>
{
  try
  {
    console.log('BLE connecting...'); //, bleDevice);
  
    bleDevice.addEventListener('gattserverdisconnected', OnDisconnect);

    const server = await bleDevice.gatt.connect();
    // console.log('BLE server:', server);
  
    const service = await server.getPrimaryService(SERVICE_UUID_UART);    
    // console.log('BLE service:', service);
  
    bleCharRx = await service.getCharacteristic(CHAR_UUID_UART_RX);
    bleCharTx = await service.getCharacteristic(CHAR_UUID_UART_TX);
    // console.log('BLE chars:', bleCharRx, bleCharTx);

    // console.log('CharRX:', bleCharRx.properties);
    // console.log('CharTX:', bleCharTx.properties);

    if (!bleCharRx.properties.notify || !bleCharTx.properties.write)
      throw 'Cannot read/write to device';

    bleCharRx.addEventListener('characteristicvaluechanged', OnNotification);
  
    // console.log('BLE start notifications...');
    await bleCharRx.startNotifications();

    let devnew = bleDevice.name.startsWith(REPLYSTR_NEW_PROTO);
    const name = bleDevice.name.slice(devnew ? 3 : 2);

    theDevice = deviceAdd(name);
    theDevice.query = !devnew ? DevQuery : devQuery;
    theDevice.start = !devnew ? DevStart : devStart;
    theDevice.stop  = BleStop;
    theDevice.send  = BleSend;

    // specific to BLE devices:
    theDevice.newproto = devnew; // true if device responds with new protocol
    theDevice.gatt = bleDevice.gatt;

    console.log('Connected to:', theDevice.curname);

    connectActive.set(true);
    deviceList.set([theDevice]);
  }
  catch(err) { deviceError(err.toString(), 'Device Connect Failed'); }
}

function OnDisconnect(event)
{
  // console.log('Device disconnect:', theDevice, event);
  if (theDevice)
  {
    deviceError(theDevice.curname, 'Device Disconnect');
    theDevice = null;
  }
  deviceList.set([]);
  connectActive.set(false);
}

async function DevQuery(device)
{
  theDevice = device;
  device.ready = false;

  replyState = 1;
  replyWait = true;

  BleSend('?');
  if (!await WaitUntil(() => replyWait === false)) return;

  if (replyError)
  {
    const estr = `Cannot support this device: #${replyError}`;
    deviceError(estr, 'Device Problem');
  }
  else if (querySegs)
  {
    replyState = 3;
    replyWait = true;
    BleSend('?S');
    if (!await WaitUntil(() => replyWait === false)) return;
  }
  // TODO: query for custom patterns with '?P'

  for (let i = 0; i < device.report.nstrands; ++i)
  {
    const strand = device.report.strands[i];
    const info = orgpatGetInfo(strand.patnum, device.report.npatterns);
    if (info)
    {
      strand.patname  = info.name;
      strand.patstr   = info.cmds;
      strand.patdesc  = info.desc;
      strand.patbits  = info.bits;
    }
  }

  // await waitTimeout(3);

  device.doshow = true;
  device.ready = true;

  // triggers update to UI - MUST HAVE THIS
  devUpdate.set( !get(devUpdate) );
}

function setStrandTop(strand, dvals)
{
  strand.pcentBright = dvals.bright;
  strand.pcentDelay  = dvals.delay;
  strand.pixelOffset = dvals.first;
  strand.numPixels   = dvals.pixels;

  let mode = !!dvals.xt_mode;
  strand.opropsUser.doEnable   = mode;
  strand.opropsUser.valueHue   = dvals.xt_hue;
  strand.opropsUser.pcentWhite = dvals.xt_white;
  strand.opropsUser.pcentCount = dvals.xt_count;

  // strand.opropsSent.doEnable   = mode;
  // strand.opropsSent.valueHue   = dvals.xt_hue;
  // strand.opropsSent.pcentWhite = dvals.xt_white;
  // strand.opropsSent.pcentCount = dvals.xt_count;
}

async function DevStart(device)
{
  device.active = true;
  curDevice.set(device);
  curPageMode.set(PAGEMODE_CTRLS_ORG);

  maxLenPattern.set(device.report.maxstrlen);

  let numtracks = device.report.numtracks;
  let numlayers = device.report.numlayers;
  let tracklayers = numlayers / numtracks;

  let numstrands = device.report.strands.length;
  nStrands.set(numstrands);
  nTracks.set(numtracks);
  nLayers.set(tracklayers);

  let slist = [];
  for (let i = 0; i < numstrands; ++i)
  {
    const strand = strandCreateNew(i);

    strand.curPatternName = device.report.strands[i].patname;
    strand.curPatternCmds = device.report.strands[i].patstr;
    strand.curPatternDesc = device.report.strands[i].patdesc;
    strand.curPatternBits = device.report.strands[i].patbits; // unique to legacy patterns
    strand.forceValue = MAX_FORCE_VALUE/2;
  
    strand.selected = !i;
    setStrandTop(strand, device.report.strands[i]);

    slist.push(strand);
  }

  sStrands.set(1);
  aStrands.set(slist);

  // reset to use first strand
  idStrand.set(0);
  pStrand.set(get(aStrands)[0]);
  dupStrand.set(false);

  console.log('Strands:', get(aStrands));
}

async function BleStop(device)
{
  theDevice = null; // prevent error message
  await device.gatt.disconnect();
  deviceReset(device);
}

const MAXLEN_SEND = 20;
let busy = false;
const queue = [];

async function BleWrite()
{
  busy = true;
  // console.log('queue:', queue[0]);

  let msg = queue[0];
  if (msg.length > MAXLEN_SEND)
  {
    let str = '';
    const words = msg.split(' ');

    for (let i = 0; i < words.length; ++i)
    {
      const next = words[i];
      if ((str.length + next.length + 1) >= MAXLEN_SEND)
      {
        msg = str;
        queue[0] = words.slice(i).join(' ');
        break;
      }
      str += next + ' ';
    }
  }
  else queue[0] = null;

  try
  {
    // console.log(`sending: "${msg}"`);

    const chars = [];
    for (let i = 0; i < msg.length; ++i) chars.push(msg.charCodeAt(i));
    const cmdvals = new Uint8Array(chars);

    await bleCharTx.writeValue(cmdvals).then(() =>
    {
      if (!queue[0]) queue.shift();
      if (queue.length) BleWrite();
      else busy = false;
    });
  }
  catch(err) { deviceError(err.toString(), 'Device Error'); }
}

function BleSend(msg)
{
  console.log(`>> ${msg}`); //, queue);
  queue.push(msg + '\n');
  if (!busy) BleWrite();
}
