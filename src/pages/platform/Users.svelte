<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area"
  import { Button } from "$lib/components/ui/button"
  import { db } from "$lib/firebase"
  import { get, ref, set } from "firebase/database"
  import { onMount } from "svelte"
  import { FirebaseError } from "@firebase/util"
  import { toast } from "svelte-sonner"
  import Minidenticon from "$lib/components/Minidenticon.svelte"

  type User = {
    uid: string
    name: string
    email: string
    bio: string
    pfp: string
  }

  let users: Record<string, User> = {}

  const listusers = async () => {
    const usersRef = ref(db, 'users')
    try {
      const snapshot = await get(usersRef)
      users = snapshot.val()
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

  onMount(() => {
    listusers()
  })

</script>

<div class="w-full flex gap-2">
  <div class="w-full flex flex-col gap-2">
    <ScrollArea class="h-full">
      <div class="flex flex-col gap-2">
      {#each Object.values(users) as user}
        <div class="flex items-center gap-4 border rounded-md p-4">
          <div class="w-12 h-12 border rounded-full overflow-hidden">
            {#if user.pfp}
              <img src={user.pfp} alt={user.name} class="w-full h-full object-cover" />
            {:else}
              <Minidenticon username={user.name} class="w-full h-full" />
            {/if}
          </div>
          <div class="flex flex-col">
            <span class="text-lg font-semibold">{user.name}</span>
            <span class="text-xs">{user.bio}</span>
          </div>
        </div>     
      {/each}
      </div>
    </ScrollArea>
  </div>
</div>