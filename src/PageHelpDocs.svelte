<script>

  import {
      Grid,
      Row,
      Column,
      TextArea
    } from "carbon-components-svelte";
  
  import HelpDocsHeader from "./HelpDocsHeader.svelte"
  import HelpDocsMenu from "./HelpDocsMenu.svelte"

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
  .panel {
    max-width: 550px;
    margin: 0 auto;
    background-color: var(--bg-color-panel);
  }
  .divider {
    margin-top:5px;
    padding-top:5px;
    background-color: var(--bg-color-divider);
  }
</style>
  