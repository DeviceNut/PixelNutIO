<script>
  import EffectsDraw from "./EffectsDraw.svelte"
  import ControlsProps from "./ControlsProps.svelte"
  import SliderVal from "./SliderVal.svelte"
</script>

<EffectsDraw/>
<SliderVal name='Bright' curval=80 />
<SliderVal name='Delay&nbsp;' />
<ControlsProps/>
<SliderVal name='Start&nbsp;' curval=0 />
<SliderVal name='End&nbsp;&nbsp;&nbsp;' curval=100 />
