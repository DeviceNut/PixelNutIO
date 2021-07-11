<script>
  import EffectsDraw from "./EffectsDraw.svelte"
  import SlidersProps from "./SlidersProps.svelte"
  import SliderVal from "./SliderVal.svelte"
</script>

<EffectsDraw/>
<SliderVal name='Bright' curval=80 />
<SliderVal name='Delay&nbsp;' />
<SlidersProps/>
<SliderVal name='Start&nbsp;' curval=0 />
<SliderVal name='End&nbsp;&nbsp;&nbsp;' curval=100 />
