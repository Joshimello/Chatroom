<script lang="ts">
  import Auth from './pages/auth'
  import Platform from './pages/platform'
  import { Toaster } from "$lib/components/ui/sonner"
  import { ModeWatcher } from "mode-watcher"
  import { auth } from "$lib/firebase"
  import { onAuthStateChanged } from "firebase/auth"
  import { page } from "$lib/stores"
  import { type ComponentType } from "svelte"
  import { fly } from "svelte/transition"

  onAuthStateChanged(auth, user => {
    if (user) {
      page.set('platform')
    }
    else {
      page.set('auth')
    }
  })

  const pages: Record<string, ComponentType> = {
    auth: Auth,
    platform: Platform
  }
</script>

<Toaster />
<ModeWatcher />

{#if $page}
  {#key $page}
  <div in:fly={{ duration: 300, y: 10, opacity: 0 }}>
    <svelte:component this={pages[$page]} />
  </div>
  {/key}
{:else}
  <div class="h-screen w-full flex items-center justify-center">
    Loading...
  </div>
{/if}