<script>

  import {
    Grid,
    Row,
    Column,
    TextArea
  } from "carbon-components-svelte";
  
  import HelpDocsHeader from './HelpDocsHeader.svelte';
  import HelpDocsMenu from './HelpDocsMenu.svelte';

  let menuOpen = true;

  let helptext = 'a;sdljf;asldjkf;alsdjkf;sldfsdfs';

</script>

<main>
  <HelpDocsHeader menuOpen />

  <Grid>
    <Row>
      <Column>
        <HelpDocsMenu/>
      </Column>
      <Column>
        <TextArea
          bind:value={helptext}
        />
      </Column>
    </Row>
  </Grid>

</main>

<style>
  main {
    min-width: 320px;
  }
</style>
  