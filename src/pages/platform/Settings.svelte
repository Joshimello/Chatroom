<script lang="ts">
  import Minidenticon from "$lib/components/Minidenticon.svelte"
  import { db, auth, storage } from "$lib/firebase"
  import { get, ref, set } from "firebase/database"
  import { getDownloadURL, ref as sref, uploadBytes } from "firebase/storage"
  import { onMount } from "svelte"
  import { Button } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input"
  import { toast } from "svelte-sonner"
  import { FirebaseError } from "@firebase/util"

  type User = {
    uid: string
    name: string
    email: string
    bio: string
    pfp: string
  }

  let user: User

  onMount(async () => {
    if (!auth.currentUser?.uid) return

    try {
      const userRef = ref(db, `users/${auth.currentUser.uid}`)
      const snapshot = await get(userRef)
      user = snapshot.val()
    }
    catch (err) {
      if (err instanceof FirebaseError) {
        toast.error(err.message)
      }
      else {
        toast.error("An error occurred")
      }
    }
  })

  const update = async () => {
    if (!auth.currentUser?.uid) return

    try {
      const userRef = ref(db, `users/${auth.currentUser.uid}`)
      await set(userRef, user)
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

  let fileInput: HTMLInputElement

  const uploadImage = async (e: any) => {
    if (!auth.currentUser?.uid) return

    try {
      const storageRef = sref(storage, auth.currentUser.uid)
      const snapshot = await uploadBytes(storageRef, e.target.files[0])
      user.pfp = await getDownloadURL(snapshot.ref)
      update()
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

  const removeImage = async () => {
    if (!auth.currentUser?.uid) return

    user.pfp = ""
    update()
  }

</script>

{#if user}
  <div class="flex flex-col w-full gap-2">
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

    <div class="h-full rounded-md border p-6 overflow-auto">
      <div class="flex items-center gap-2 mb-6">
        <div class="w-24 h-24 rounded-full border overflow-hidden">
          {#if user.pfp}
            <img src={user.pfp} alt={user.name} class="w-full h-full object-cover" />
          {:else}
            <Minidenticon username={user.name} class="w-full h-full" />
          {/if}
        </div>
        <div class="flex flex-col">
          <Button variant="ghost" on:click={() => fileInput.click()}>Change picture</Button>
          <input class="hidden" type="file" accept="image/*" bind:this={fileInput} on:change={uploadImage} />
          {#if user.pfp}
            <Button variant="ghost" on:click={removeImage}>Remove picture</Button>
          {/if}
        </div>
      </div>
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-1">
          <span>Username</span>
          <Input bind:value={user.name} on:blur={update} />
        </div>
        <div class="flex flex-col gap-1">
          <span>Bio</span>
          <Input bind:value={user.bio} on:blur={update} />
        </div>
        <div class="flex flex-col gap-1">
          <span>Email (unchangeable)</span>
          <Input disabled value={user.email} />
        </div>
        <span class="text-xs text-gray-500">All changes are saved automatically</span>
      </div>
    </div>

  </div>
{/if}