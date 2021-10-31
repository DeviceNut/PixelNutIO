<script>

  import { pStrand } from './globals.js';
  import { userClearPattern } from './cmduser2.js';
  import { sendEntirePattern } from './cmdsend.js';

  const doclear   = () => { userClearPattern(); }
  const dostore   = () => { sendEntirePattern(false); } // don't restart
  const dorestart = () => { sendEntirePattern(false); } // don't restart

</script>

<button
  class="button-pattern"
  on:click={doclear}
  disabled={ ($pStrand.curPatternStr === '') }
  >Clear
</button>

<button
  class="button-pattern"
  on:click={dostore}
  disabled={ ($pStrand.curPatternStr === '') }
  >Store
</button>

<button
  class="button-pattern"
  on:click={dorestart}
  disabled={ ($pStrand.curPatternStr === '') }
  >Restart
</button>

<style>
  .button-pattern {
    width: 60px;
    height: 40px;
    padding: 5px;
    margin-left: 7px;
    margin-right: 7px;
  }
</style>
