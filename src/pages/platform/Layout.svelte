<script lang="ts">
  import { fly } from "svelte/transition"
  import { state } from "./stores"
  import { LogOut, UserRoundCog, Users, MessagesSquare } from "lucide-svelte"
  import { Button } from "$lib/components/ui/button"
  import { signOut } from "firebase/auth"
  import { auth } from "$lib/firebase"
  import { FirebaseError } from "@firebase/util"
  import { toast } from "svelte-sonner"
  
  import UsersPage from "./Users.svelte"
  import ChatsPage from "./Chats.svelte"
  import SettingsPage from "./Settings.svelte"

  const pages: Record<string, any> = {
    users: UsersPage,
    chats: ChatsPage,
    settings: SettingsPage
  }

  const logout = async () => {
    try {
      await signOut(auth)
    }
    catch (err) {
      if (err instanceof FirebaseError) {
        toast.error(err.message)
      }
      else {
        toast.error("An error occurred")
      }
    }
  }

</script>

<div class="container flex h-screen w-full py-8 gap-2">
  <div class="flex flex-col h-full gap-2">
    <Button class="w-12 h-12" size="icon" variant="outline" on:click={() => $state = 'users'}>
      <Users />
    </Button>
    <Button class="w-12 h-12" size="icon" variant="outline" on:click={() => $state = 'chats'}>
      <MessagesSquare />
    </Button>
    <Button class="w-12 h-12 mt-auto" size="icon" variant="outline" on:click={() => $state = 'settings'}>
      <UserRoundCog />
    </Button>
    <Button class="w-12 h-12" size="icon" variant="outline" on:click={logout}>
      <LogOut />
    </Button>
  </div>

  {#key $state}
    <div class="w-full flex" in:fly={{ duration: 300, y: 10, opacity: 0 }}>
      <svelte:component this={pages[$state]} />
    </div>
  {/key}

</div>