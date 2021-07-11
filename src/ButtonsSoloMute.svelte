<script>
 
  import {
    sTracks, mTracks,
    sLayers, mLayers
  }
  from './globals.js';

  export let tracknum = 0;
  export let layernum = 0;

  let isSolo = false;
  let isMute = false;

  $: {
    if (layernum == 0)
         isSolo = $sTracks[tracknum-1];
    else isSolo = $sLayers[tracknum-1][layernum-1];

    if (layernum == 0)
         isMute = $mTracks[tracknum-1];
    else isMute = $mLayers[tracknum-1][layernum-1];
  }

  const dosolo = () =>
  {
    isSolo = !isSolo;

    // setting a track to Solo turns on the Mute for all other tracks,
    // whereas turning off Solo turns off all the other track Mutes
    if (layernum == 0)
    {
      if (isSolo)
      {
        let elist = $sTracks;           // array of solos
        for (let i = 0; i < elist.length; ++i) elist[i] = false;
        elist[tracknum-1] = true;       // only solo this track
        sTracks.set(elist);

        elist = $mTracks;               // array of mutes
        for (let i = 0; i < elist.length; ++i) elist[i] = true;
        elist[tracknum-1] = false;      // don't mute this track
        mTracks.set(elist);
      }
      else
      {
        let elist = $sTracks;           // array of solos
        elist[tracknum-1] = false;      // turn off only this solo
        sTracks.set(elist);

        elist = $mTracks;               // array of mutes
        for (let i = 0; i < elist.length; ++i) elist[i] = false;
        mTracks.set(elist);
      }
    }
    // setting a layer to Solo turns on the Mute for all the (other)
    //  pre-draw layers in the same track (but not the drawing layer,
    //  which is always on), whereas turning it off turns them off.
    else
    {
      if (isSolo)
      {
        let elist = $sLayers[tracknum-1]; // array of solos
        for (let i = 0; i < elist.length; ++i) elist[i] = false;
        elist[layernum-1] = true;         // only solo this layer

        elist = $mLayers[tracknum-1];     // array of mutes
        for (let i = 0; i < elist.length; ++i) elist[i] = true;
        elist[layernum-1] = false;        // don't mute this track

        // trigger update without setting entire double array
        $mLayers[tracknum-1][layernum-1] = false;
      }
      else
      {
        let elist = $sLayers[tracknum-1]; // array of solos
        elist[layernum-1] = false;        // turn off only this solo

        elist = $mLayers[tracknum-1];     // turn off all mutes for track
        for (let i = 0; i < elist.length; ++i) elist[i] = false;

        // trigger update without setting entire double array
        $mLayers[tracknum-1][layernum-1] = false;
      }
    }
  }

  const domute = () =>
  {
    isMute = !isMute;

    if (layernum == 0) // enable/disable entire track
    {
      $mTracks[tracknum-1] = isMute;
      //console.log(`Mute=${isMute} track #${tracknum}`);
    }
    else // enable/disable just one layer of a track
    {
      $mLayers[tracknum-1][layernum-1] = isMute;
      //console.log(`Mute=${isMute} track #${tracknum} layer #${layernum}`);
    }
  }

</script>

<button on:click={domute} class="button" class:select={isMute}>Mute</button>
<button on:click={dosolo} class="button" class:select={isSolo}>Solo</button>

<style>
  .button {
    float:right;
    margin: 2px 15px 0 0;
    padding: 4px;
    width: 40px;
    border-radius: 5%;
    color: white;
    border: 1px solid #bbbcbb;
    background-color:#555655;
  }
  .button:hover {
    cursor: pointer;
    background-color:#444544;
  }
  .select {
    padding: 3px;
    border: 2px solid rgb(0,100,200);
    background-color:#222322;
  }
</style>
