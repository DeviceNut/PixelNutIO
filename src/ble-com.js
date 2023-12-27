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
const deviceInfo = {};

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
                    deviceInfo.nsegments  = parseInt(strs[0]);
                    deviceInfo.curpat     = parseInt(strs[1]);
                    deviceInfo.ncusts     = parseInt(strs[2]);
                    deviceInfo.features   = parseInt(strs[3]);
                    deviceInfo.nstrands   = parseInt(strs[4]);
                    deviceInfo.xstrlen    = parseInt(strs[5]);

                    if (deviceInfo.nstrands < 1)
                        deviceInfo.nstrands = 1;
                  }
                  else replyError = true;
                  break;
                }
                case 1:
                {
                  if (strs.length === 5)
                  {
                    deviceInfo.npixels    = parseInt(strs[0]);
                    deviceInfo.xlayers    = parseInt(strs[1]);
                    deviceInfo.xtracks    = parseInt(strs[2]);
                    deviceInfo.maxbright  = parseInt(strs[3]);
                    deviceInfo.delayoff   = parseInt(strs[4]);
                  }
                  else replyError = true;
                  break;
                }
                case 0:
                {
                  if (strs.length >= 4)
                  {
                    deviceInfo.xt_mode    = parseInt(strs[0]);
                    deviceInfo.xt_hue     = parseInt(strs[1]);
                    deviceInfo.xt_white   = parseInt(strs[2]);
                    deviceInfo.xt_count   = parseInt(strs[3]);
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
            console.log('BLE deviceinfo:', deviceInfo, replyError);
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
    console.log('BLE is supported:', navigator.bluetooth);
    return true;
  }
  console.log('BLE is NOT supported');
  return false;
}

export const bleConnect = async () =>
{
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
  
    replyState = 1;
    replyWait = true;
    await bleSendCmd('?');
    await WaitUntil(() => replyWait === false);
    console.log('BLE query 1 finished');
  
    // replyState = 1;
    // replyWait = true;
    // await bleSendCmd('?S');
    // await WaitUntil(() => replyWait === false);
    // console.log('BLE query 2 finished');
  
    return device.name.slice(2);
  }
  catch (err) { console.log('BLE Connect failed:', err) }

  return '';
}

export const bleSendCmd = async (cmd) =>
{
  console.log('BLE cmd:', cmd);
  const query = AsciiToUint8Array(cmd);
  await bleCharTx.writeValue(query);
}
