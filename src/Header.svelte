<script>

  import { cmdSendPause } from "./cmdmain.js"

  export let appname = '';

  let isPaused = false;
  let textPause = '';
  $: textPause = (isPaused ? 'Resume' : 'Pause');

  const dopause = () =>
  {
    cmdSendPause(isPaused = !isPaused);
  }

  const goback = () => { history.back() }
  const goweb = () =>  { window.open("https://www.devicenut.com", "_blank"); }

  const dohelp = () =>
  {
    console.log('Show Help Page');
    // TODO open model with context sensitive help message
  }

</script>

<div class="header">
  <button on:click={goback} class="button left" >&lt;&lt; Back</button>
  <button on:click={goweb} class="button left2" >Website</button>
  <p class="title">{appname}</p>
  <button on:click={dohelp} class="button rite" >Help</button>
  <button on:click={dopause} class="button rite" >{textPause}</button>
</div>

<style>
  .header {
    padding: 2px 0 8px 0;
    height: 44px;
    background-color:#333433;
  }
  .title {
    position: absolute;
    margin-left: 50%;
    margin-right: -50%;
    margin-top: 17px;
    transform: translate(-50%, -50%);
    font-style:italic;
    font-family:'Trebuchet MS';
    font-size:1.7em;
  }
  .button {
    float: left;
    padding: 7px;
    margin-top: 3px;
    border-radius: 5%;
    color: white;
    border: 1px solid #bbbcbb;
    background-color:#555655;
  }
  .button.left {
    float: left;
    margin-left: 10px;
  }
  .button.left2 {
    float: left;
    margin-left: 15px;
  }
  .button.rite {
    float: right;
    margin-right: 15px;
  }
  .button:hover {
    cursor: pointer;
    background-color:#444544;
  }
</style>
