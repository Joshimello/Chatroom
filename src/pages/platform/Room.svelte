<script lang="ts">
  import { db, storage, auth } from "$lib/firebase"
  import { onChildAdded, push, ref, get, set } from "firebase/database"
  import { Separator } from "$lib/components/ui/separator";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { ImagePlay, Image, Film, SendHorizonal, UserPlus } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { FirebaseError } from "@firebase/util"
  import Minidenticon from "$lib/components/Minidenticon.svelte"
  import { ScrollArea } from "$lib/components/ui/scroll-area"
  import ComboBox from "$lib/components/ComboBox.svelte"
  import { onMount } from "svelte"
  import { getDownloadURL, ref as sref, uploadBytes } from "firebase/storage"
  import { ShuffledSearch, Gif } from "svelte-tenor"
  import * as Popover from "$lib/components/ui/popover"

  type User = {
    uid: string
    name: string
    email: string
    bio: string
    pfp: string
  }

  export let roomId: string
  export let roomName: string
  export let user: User

  type Message = {
    type: "text" | "image" | "video" | "info"
    content: string
    sender: {
      name: string
      pfp: string
    }
  }

  let messages: Record<string, Message> = {}

  let scrollArea: HTMLDivElement

  onChildAdded(ref(db, `rooms/${roomId}/messages`), (data) => {
    if (!data.key) return
    messages[data.key] = data.val()
    if (scrollArea) {
      setTimeout(() => {
        scrollArea.scroll({ top: scrollArea.scrollHeight, behavior: "smooth" })
      }, 100)
    }
  })

  let message: string = ""

  const sendMessage = () => {
    try {
      const roomsRef = ref(db, `rooms/${roomId}/messages`)
      push(roomsRef, {
        type: "text",
        content: message,
        sender: {
          name: user.name,
          pfp: user.pfp
        }
      })
      message = ""
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
    setTimeout(() => {
      scrollArea.scroll({ top: scrollArea.scrollHeight, behavior: "smooth" })
    }, 100)
  })

  const inviteUser = (uid: string) => {
    try {
      get(ref(db, `rooms/${roomId}/members/${uid}`)).then(snapshot => {
        if (snapshot.exists()) {
          toast.error("User already in room")
          return
        }
        set(ref(db, `rooms/${roomId}/members/${uid}`), true)
        push(ref(db, `rooms/${roomId}/messages`), {
          type: "info",
          content: `${user.name} invited ${users[uid].name} to this chatroom`,
          sender: {
            name: user.name,
            pfp: user.pfp
          }
        })
      })
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

  let imageInput: HTMLInputElement

  const sendImage = async (e: any) => {
    if (!auth.currentUser?.uid) return

    try {
      const imgRef = push(ref(db, `rooms/${roomId}/messages`))
      const imgRefKey = imgRef.key

      if (!imgRefKey) return

      const storageRef = sref(storage, imgRefKey)
      toast.info("Uploading image...")
      const snapshot = await uploadBytes(storageRef, e.target.files[0])
      const imageUrl = await getDownloadURL(snapshot.ref)
      set(imgRef, {
        type: "image",
        content: imageUrl,
        sender: {
          name: user.name,
          pfp: user.pfp
        }
      })
      toast.success("Image uploaded")
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

  let videoInput: HTMLInputElement

  const sendVideo = async (e: any) => {
    if (!auth.currentUser?.uid) return

    try {
      const vidRef = push(ref(db, `rooms/${roomId}/messages`))
      const vidRefKey = vidRef.key

      if (!vidRefKey) return

      const storageRef = sref(storage, vidRefKey)
      toast.info("Uploading video...")
      const snapshot = await uploadBytes(storageRef, e.target.files[0])
      const videoUrl = await getDownloadURL(snapshot.ref)
      set(vidRef, {
        type: "video",
        content: videoUrl,
        sender: {
          name: user.name,
          pfp: user.pfp
        }
      })
      toast.success("Video uploaded")
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

  let gifSearch: string = ""
  let gifOpen = false

  const sendGift = (gif: string) => {
    try {
      if (!auth.currentUser?.uid) return
      push(ref(db, `rooms/${roomId}/messages`), {
        type: "image",
        content: gif,
        sender: {
          name: user.name,
          pfp: user.pfp
        }
      })
      gifOpen = false
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

<div class="rounded-md border w-full h-full flex flex-col">
  <div class="p-2 flex items-center justify-between">
    <span class="pl-2">{roomName}</span>
    <div class="flex">
      {#if Object.keys(users).length > 0}
        <ComboBox
          items={Object.entries(users).map(([uid, { name }]) => ({ label: name, value: uid }))}
          onSelect={value => {
            inviteUser(value)
          }}
          let:builders
        >
          <Button variant="ghost" size="icon" builders={[builders]}>
            <UserPlus size="16" />
          </Button>
        </ComboBox>
      {/if}
    </div>
  </div>
  <Separator />
  <ScrollArea class="h-full" bind:contentEl={scrollArea}>
    <div class="h-full p-2 pr-4 flex flex-col gap-2">
    {#each Object.entries(messages) as [key, { type, sender, content }] (key)}
      {#if type == 'info'}
        <div class="text-sm text-gray-500 text-center">
          {content}
        </div>
      {:else if type == 'text'}
        <div class="flex gap-2">
          {#if sender.pfp}
            <img src={sender.pfp} alt={sender.name} class="w-12 h-12 rounded-full border object-cover" />
          {:else}
            <Minidenticon username={sender.name} class="w-12 h-12 rounded-full border object-cover" />
          {/if}
          <div class="w-full flex flex-col">
            <span class="font-bold text-xs">{sender.name}</span>
            <span class="break-all">{content}</span>
          </div>
        </div>
      {:else if type == 'image'}
        <div class="flex gap-2">
          {#if sender.pfp}
            <img src={sender.pfp} alt={sender.name} class="w-12 h-12 rounded-full border object-cover" />
          {:else}
            <Minidenticon username={sender.name} class="w-12 h-12 rounded-full border object-cover" />
          {/if}
          <div class="w-full flex flex-col gap-2">
            <span class="font-bold text-xs">{sender.name}</span>
            <img src={content} alt={sender.name + "'s image"} class="object-cover w-60 h-60 border rounded-md overflow-hidden" />
          </div>
        </div>
      {:else if type == 'video'}
        <div class="flex gap-2">
          {#if sender.pfp}
            <img src={sender.pfp} alt={sender.name} class="w-12 h-12 rounded-full border object-cover" />
          {:else}
            <Minidenticon username={sender.name} class="w-12 h-12 rounded-full border object-cover" />
          {/if}
          <div class="w-full flex flex-col gap-2">
            <span class="font-bold text-xs">{sender.name}</span>
            <video src={content} class="w-60 h-60 border rounded-md" controls>
              <track kind="captions" />
            </video>
          </div>
        </div>
      {/if}
    {/each}
    </div>
  </ScrollArea>
  <div class="p-2 flex gap-2">
    <div class="flex">
      <Button variant="ghost" size="icon" on:click={() => imageInput.click()}>
        <Image size="16" />
      </Button>
      <input class="hidden" type="file" accept="image/*" bind:this={imageInput} on:change={sendImage} />
      <Button variant="ghost" size="icon" on:click={() => videoInput.click()}>
        <Film size="16" />
      </Button>
      <input class="hidden" type="file" accept="video/*" bind:this={videoInput} on:change={sendVideo} />
      <Popover.Root bind:open={gifOpen}>
        <Popover.Trigger asChild let:builder>
          <Button builders={[builder]} variant="ghost" size="icon">
            <ImagePlay size="16" />
          </Button>
        </Popover.Trigger>
        <Popover.Content>
          <ShuffledSearch limit={4} columnSize={100} ratio="standard" q={gifSearch} key="LIVDSRZULELA" on:click={({ detail }) => {
            sendGift(detail.gif)
          }} />
          <Input class="mt-2" placeholder="Gif..." bind:value={gifSearch} />
        </Popover.Content>
      </Popover.Root>
      
    </div>
    <form on:submit|preventDefault={sendMessage} class="w-full">
      <Input placeholder="Message..." bind:value={message} />
    </form>
    <div>
      <Button variant="ghost" size="icon" on:click={sendMessage}>
        <SendHorizonal size="16" />
      </Button>
    </div>
  </div>
</div>