<script>
  import { Button } from "carbon-components-svelte";
  import MySlider from "./MySlider.svelte"

  const dotrigger = () => {
    console.log('Trigger!');
  }
</script>

<MySlider name='Count&nbsp;' curval=50 />
<MySlider name='Hue&nbsp;&nbsp;&nbsp;' curval=120 maxval=359 />
<MySlider name='White&nbsp;' curval=0 />
<MySlider name='Force&nbsp;' />
<div style="margin-top:5px;">
  <Button size="small" kind="secondary" on:click={dotrigger}>Trigger</Button>
</div>
