<script>

  import { titleDevices } from './globals.js';

</script>

<div class="header">
  <span class="title">{titleDevices}</span>
</div>

<style>
  .header {
    height: 45px;
    max-width: 630px;
    margin: 0 auto;
    text-align: center;
    background-color: var(--page-header);
  }
  .title {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    min-width: 250px;
    margin-top: 12px;
    font-size:1.5em;
    font-style: italic;
  }
</style>
