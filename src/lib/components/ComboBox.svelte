<script lang="ts">
  import { Check, ChevronsUpDown } from "lucide-svelte";
  import * as Command from "$lib/components/ui/command"
  import * as Popover from "$lib/components/ui/popover"
  import { Button } from "$lib/components/ui/button"
  import { cn } from "$lib/utils";
  import { tick } from "svelte";
 
  export let items: { label: string; value: string }[];
  export let onSelect: (value: string) => void;

  let open = false;

</script>
 
<Popover.Root bind:open let:ids>
  <Popover.Trigger asChild let:builder>
    <slot builders={builder} />
  </Popover.Trigger>
  <Popover.Content class="w-[200px] p-0">
    <Command.Root>
      <Command.Input placeholder="Search item..." />
      <Command.Empty>No items found.</Command.Empty>
      <Command.Group>
        {#each items as item}
          <Command.Item
            value={item.value}
            onSelect={() => {
              onSelect(item.value);
              open = false;
              tick();
            }}
          >
            {item.label}
          </Command.Item>
        {/each}
      </Command.Group>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
