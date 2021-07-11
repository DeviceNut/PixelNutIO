<script>
 
  export let tracknum = 0;
  export let layernum = 0;

  let isSolo = false;
  let isMute = false;
  let asdfsf = 0;

  const dosolo = () =>
  {
    let a = tracknum;
    let b = layernum;
    isSolo = !isSolo;
    console.log('set solo');
  }

  const domute = () =>
  {
    isMute = !isMute;
    console.log('set mute');
  }

</script>

<button on:click={domute} class="button" class:select={isMute}>Mute</button>
<button on:click={dosolo} class="button" class:select={isSolo}>Solo</button>

<style>
  .button {
    float:right;
    margin: 2px 15px 0 0;
    padding: 4px;
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
