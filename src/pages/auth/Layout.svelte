<script lang="ts">
  import { fly } from "svelte/transition"
  import { state } from "./stores"

  import Menu from "./Menu.svelte"
  import Login from "./Login.svelte"
  import Register from "./Register.svelte"

  const pages: Record<string, any> = {
    menu: Menu,
    login: Login,
    register: Register
  }

</script>

<div class="container flex flex-col pt-32 md:max-w-lg">
  <span class="text-2xl leading-6">Welcome to the</span>
  <span class="text-4xl font-light">CHATROOMS</span>

  {#key $state}
    <div in:fly={{ duration: 300, y: 10, opacity: 0 }}>
      <svelte:component this={pages[$state]} />
    </div>
  {/key}

</div>