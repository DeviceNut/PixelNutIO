<script>
  import { Row, Column, Tabs, Tab, TabContent } from "carbon-components-svelte";

  import BasicControls from "./BasicControls.svelte";
  import DetailControls from "./DetailControls.svelte";

  let selected = 0;

</script>

<Row>
  <Column>
    <Tabs bind:selected>
      <Tab style="text-align:center;" label="Basic" />
      <Tab style="text-align:center;" label="Details" />
      <div slot="content" class="tabbed-content">
        <TabContent><BasicControls/></TabContent>
        <TabContent><DetailControls/></TabContent>
      </div>
    </Tabs>
  </Column>
  <Column>
  </Column>
</Row>
