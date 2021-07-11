<script>
  import DrawEffects from "./DrawEffects.svelte"
  import MySlider from "./MySlider.svelte"
</script>

<DrawEffects />
<MySlider name='Bright' curval=80 />
<MySlider name='Delay&nbsp;' />
<MySlider name='Count&nbsp;' curval=50 />
<MySlider name='Hue&nbsp;&nbsp;&nbsp;' curval=120 maxval=359 />
<MySlider name='White&nbsp;' curval=0 />
<MySlider name='Start&nbsp;' curval=0 />
<MySlider name='End&nbsp;&nbsp;&nbsp;' curval=100 />
