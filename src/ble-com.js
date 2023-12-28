const SERVICE_UUID_UART = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E".toLowerCase();
const CHAR_UUID_UART_TX = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E".toLowerCase();
const CHAR_UUID_UART_RX = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E".toLowerCase();

let bleCharRx, bleCharTx;
let replyWait = false;
let replyStr = '';
let replyState = 0;
let replyCount = 0;
let queryType = 0;
let replyError = false;
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
      console.log('Reply:', replyStr, strs);

      switch (replyState)
      {
        case 1:
        {
          if (strs[0] === 'P!')
          {
            replyCount = parseInt(strs[1]);
            console.log('Get more lines:', --replyCount);
            queryType = replyCount; // 1,2,3 (multi-strand, multi-segs, single strand/seg)
            replyState = 2;
          }
          else
          {
            console.log('Failed to get query:', replyStr);
            replyState = 0; // ignore all subsequent replies
            replyWait = false;
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
                  if (strs.length === 6)
                  {
                    theDevice.nsegments  = parseInt(strs[0]);
                    theDevice.curpat     = parseInt(strs[1]);
                    theDevice.ncusts     = parseInt(strs[2]);
                    theDevice.features   = parseInt(strs[3]);
                    theDevice.nstrands   = parseInt(strs[4]);
                    theDevice.xstrlen    = parseInt(strs[5]);

                    if (theDevice.nsegments < 0) // old firmware
                    {
                      theDevice.nsegments = -theDevice.nsegments;
                      theDevice.nstrands = 1;
                    }
                    else if (theDevice.nstrands < 1)
                      theDevice.nstrands = 1;
                  }
                  else replyError = true;
                  break;
                }
                case 1:
                {
                  if (strs.length === 5)
                  {
                    theDevice.npixels    = parseInt(strs[0]);
                    theDevice.xlayers    = parseInt(strs[1]);
                    theDevice.xtracks    = parseInt(strs[2]);
                    theDevice.maxbright  = parseInt(strs[3]);
                    theDevice.delayoff   = parseInt(strs[4]);
                  }
                  else replyError = true;
                  break;
                }
                case 0:
                {
                  if (strs.length >= 4)
                  {
                    theDevice.xt_mode    = parseInt(strs[0]);
                    theDevice.xt_hue     = parseInt(strs[1]);
                    theDevice.xt_white   = parseInt(strs[2]);
                    theDevice.xt_count   = parseInt(strs[3]);
                  }
                  else replyError = true;
                  break;
                }
              }
              break;
            }
            case 2:
            {
              break;
            }
            case 3:
            {
              break;
            }
          }
          if (!replyCount)
          {
            console.log('BLE deviceinfo:', theDevice, replyError);
            replyState = 0; // ignore all subsequent replies
            replyWait = false;
          }
          break;
        }
        case 3:
        {
          break;
        }
      }

      replyStr = '';
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
  try
  {
    const device = await navigator.bluetooth.requestDevice({
      // acceptAllDevices: true,
      filters: [{ namePrefix: "P!" }],
      optionalServices: [SERVICE_UUID_UART]
    });
    console.log('BLE device:', device);
  
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
  
    await bleCharRx.startNotifications();
    console.log('BLE start notifications...');
    bleCharRx.addEventListener('characteristicvaluechanged', Notifications);
  
    theDevice = {...deviceState};
    theDevice.sendfun = bleSend;
    theDevice.curname = device.name.slice(2);

    console.log('Connected to:', theDevice.curname);
  }
  catch (err) { console.log('BLE Connect failed:', err) }

  return theDevice;
}

export const bleSetup = async (device) =>
{
  theDevice = device;

  replyState = 1;
  replyWait = true;

  await bleSend('?');
  await WaitUntil(() => replyWait === false);
  console.log('BLE query 1 finished');

  theDevice.ready = true;
  theDevice.oldcode = true;

  // replyState = 1;
  // replyWait = true;
  // await bleSend('?S');
  // await WaitUntil(() => replyWait === false);
  // console.log('BLE query 2 finished');
}

export const bleStart = async () =>
{
}

const bleSend = async (cmd) =>
{
  console.log('BLE cmd:', cmd);
  const query = AsciiToUint8Array(cmd);
  await bleCharTx.writeValue(query);
}
