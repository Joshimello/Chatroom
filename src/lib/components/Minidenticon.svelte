<script lang="ts">
  import { minidenticon } from "minidenticons"

  export let username: string
  export let saturation: number = 95
  export let lightness: number = 45

  $: svgURI = 
    'data:image/svg+xml;utf8,' + 
    encodeURIComponent(minidenticon(username, saturation, lightness))
    
</script>

<img
  src={svgURI} 
  alt={username} 
  {...$$restProps}  
/>