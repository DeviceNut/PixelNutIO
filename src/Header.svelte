<script>

  export let appname = '';

  let goback = () =>
  {
    console.log('Return to Devices Page');
  }

  let goweb = () =>
  {
    console.log('Create tab for: www.devicenut.com/pixelnut');
  }

  let dohelp = () =>
  {
    console.log('Show Help Page');
  }

</script>

<div class="header">
  <button on:click={goback} class="button left" >&lt;&lt; Back</button>
  <p class="title">{appname}</p>
  <button on:click={dohelp} class="button rite" >Help</button>
  <button on:click={goweb} class="button rite" >Website</button>
</div>

<style>
  .header {
    padding: 2px 0 8px 0;
    margin-bottom: 13px;
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
  .button.rite {
    float: right;
    margin-right: 17px;
  }
  .button:hover {
    cursor: pointer;
    background-color:#444544;
  }
</style>
