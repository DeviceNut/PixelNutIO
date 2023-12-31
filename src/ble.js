import { get } from 'svelte/store';

import {
  deviceList,
  msgTitle,
  msgDesc,
  PAGEMODE_CTRLS_ORG,
  curPageMode,
  curDevice,
  devUpdate,
  connectActive,
  connectFail,
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
} from './device.js';

import {
  MAX_FORCE_VALUE,
  orgpatGetInfo,
} from './orgpatts.js';

import { strandCreateNew } from './strands.js';

const SERVICE_UUID_UART = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E".toLowerCase();
const CHAR_UUID_UART_TX = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E".toLowerCase();
const CHAR_UUID_UART_RX = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E".toLowerCase();

let bleCharRx, bleCharTx;
let replyWait = false;
let replyStr = '';
let replyState = 0;
let replyCount = 0;
let queryType = 0;
let replyError = 0;
let querySegs = false;
let theDevice;

async function WaitUntil(condition)
{
  while (!condition()) await new Promise(resolve => setTimeout(resolve, 100));
}

function AsciiToUint8Array(str){
  var chars = [];
  for (var i = 0; i < str.length; ++i){
    chars.push(str.charCodeAt(i));
  }
  return new Uint8Array(chars);
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

function Notifications(event)
{
  let value = event.target.value;
  // console.log('Notify:', event);

  for (let i = 0; i < value.byteLength; ++i)
  {
    const chval = value.getUint8(i);
    if (chval === 10) // newline
    {
      const strs = replyStr.trim().split(' ');
      console.log('BLE Reply:', replyStr); //, strs);

      switch (replyState)
      {
        case 1:
        {
          theDevice.report.strands = [];

          replyCount = parseInt(strs[1]);

          if ((strs[0] === 'P!') && (replyCount >= 1))
          {
            queryType = --replyCount; // 1,2,3 (multi-strand, multi-segs, single strand/seg)
            replyState = 2;
          }
          else
          {
            replyState = 0; // ignore all subsequent replies
            replyWait = false;
            replyError = 1;
          }
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
            case 2:
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
          if (!replyCount)
          {
            console.log('BLE device:', theDevice);
            replyState = 0; // ignore all subsequent replies
            replyWait = false;
          }
          break;
        }
        case 3: // segment query
        {
          break;
        }
      }

      replyStr = '';

      if (replyError && replyWait)
      {
        replyState = 0; // ignore all subsequent replies
        replyWait = false;
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

export const bleConnect = async () =>
{
  theDevice = null;
  deviceList.set([]);

  try
  {
    const device = await navigator.bluetooth.requestDevice({
      // acceptAllDevices: true,
      filters: [{ namePrefix: "P!" }],
      optionalServices: [SERVICE_UUID_UART]
    });
    console.log('BLE connecting...'); //, device);
  
    // doesn't work in Chrome on Windows...why?
    // resp = await navigator.bluetooth.getDevices();
    // console.log('BLE devices', resp);
  
    const server = await device.gatt.connect();
    // console.log('BLE server:', server);
  
    const service = await server.getPrimaryService(SERVICE_UUID_UART);    
    // console.log('BLE service:', service);
  
    bleCharRx = await service.getCharacteristic(CHAR_UUID_UART_RX);
    bleCharTx = await service.getCharacteristic(CHAR_UUID_UART_TX);
    // console.log('BLE chars:', char_rx, char_tx);

    // console.log('CharRX:', bleCharRx.properties);
    // console.log('CharTX:', bleCharTx.properties);

    if (!bleCharRx.properties.notify || !bleCharTx.properties.write)
      throw 'Cannot read/write to device';

    bleCharRx.addEventListener('characteristicvaluechanged', Notifications);
  
    // console.log('BLE start notifications...');
    await bleCharRx.startNotifications();

    const name = device.name.slice(2);
    theDevice = deviceAdd(name);
    theDevice.query = bleSetup;
    theDevice.start = BleStart;
    theDevice.send = BleSend;

    console.log('Connected to:', theDevice.curname);

    deviceList.set([theDevice]);
    connectActive.set(true);
    connectFail.set(false);
  }
  catch (err)
  {
    const estr = err.toString();
    if (!estr.startsWith('NotFoundError'))
    {
      console.error('BLE Connect failed:', estr);

      // trigger error message title/text
      msgTitle.set('Bluetooth Problem');
      msgDesc.set(`Connect failed: ${err}`);
      deviceList.set([]);
    }
  }
}

export const bleSetup = async (device) =>
{
  theDevice = device;
  device.ready = false;

  replyState = 1;
  replyWait = true;

  BleSend('?');
  await WaitUntil(() => replyWait === false);
  // console.log('BLE query 1 finished');

  if (replyError)
  {
    console.error('BLE query failed:', replyError);

    // trigger error message title/text
    msgTitle.set('Device Problem');
    msgDesc.set(`Cannot support this device: #${replyError}`);
    deviceList.set([]);

    connectActive.set(false);
    connectFail.set(true);
  }
  else if (querySegs)
  {
    replyState = 3;
    replyWait = true;
    BleSend('?S');
    await WaitUntil(() => replyWait === false);
    // console.log('BLE query 2 finished');
  }

  for (let i = 0; i < device.report.nstrands; ++i)
  {
    const strand = device.report.strands[i];
    const info = orgpatGetInfo(strand.patnum);
    strand.patname  = info.name;
    strand.patcmds  = info.cmds;
    strand.patdesc  = info.desc;
    strand.patbits  = info.bits;
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

async function BleStart(device)
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
    strand.curPatternCmds = device.report.strands[i].patcmds;
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

const MAXLEN_SEND = 20;
let busy = false;
const queue = [];
function BleWrite()
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

  // console.log(`sending: "${msg}"`);
  const query = AsciiToUint8Array(msg);
  bleCharTx.writeValue(query).then(() =>
  {
    if (!queue[0]) queue.shift();
    if (queue.length) BleWrite();
    else busy = false;
  });
}
function BleSend(msg)
{
  console.log(`>> ${msg}`); //, queue);
  queue.push(msg);
  if (!busy) BleWrite();
}
