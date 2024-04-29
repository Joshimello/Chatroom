<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area"
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Input } from "$lib/components/ui/input"
  import { db, auth } from "$lib/firebase"
  import { get, ref, set, push, onValue, onChildAdded, orderByChild, equalTo, query } from "firebase/database"
  import { onMount } from "svelte"
  import { FirebaseError } from "@firebase/util"
  import { toast } from "svelte-sonner"
  import Room from './Room.svelte'
  import { fly } from "svelte/transition"
  import * as Sheet from "$lib/components/ui/sheet"

  type User = {
    uid: string
    name: string
    email: string
    bio: string
    pfp: string
  }

  let currentUser: User

  let createRoomDialogOpen = false

  const createRoom = async (name: string) => {
    if (!auth.currentUser) return

    try {
      const roomsRef = ref(db, 'rooms')
      push(roomsRef, {
        name: name,
        members: {
          [auth.currentUser.uid]: true
        },
        messages: {
          0: {
            type: "info",
            content: `${currentUser.name} created this chatroom`,
            sender: {
              name: "System",
              pfp: ""
            }
          }
        }
      })
      toast.success("Chatroom created")
      createRoomDialogOpen = false
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

  let newRoomName = ""

  type Room = {
    name: string
    members: Record<string, boolean>
    messages: Record<string, any>
  }

  let rooms: Record<string, Room> = {}

  const roomsRef = query(ref(db, 'rooms'), orderByChild('members/' + auth.currentUser?.uid), equalTo(true))
  
  onChildAdded(roomsRef, (data) => {
    if (!data.key) return
    rooms[data.key] = data.val()
  })

  let currentRoomId: string | null

  const roomChange = (id: string) => {
    currentRoomId = id
  }

  let sheetOpen = false

  onMount(async () => {
    if (!auth.currentUser) return
    const userRef = ref(db, `users/${auth.currentUser.uid}`)
    const snapshot = await get(userRef)
    const user: User = snapshot.val()
    currentUser = user
  })

  $: if (Object.keys(rooms).length > 0 && !currentRoomId) {
    currentRoomId = Object.keys(rooms)[0]
  }

</script>

<div class="w-full h-[calc(100%-2.75rem)] md:h-full flex flex-col md:flex-row gap-2">

  <Sheet.Root bind:open={sheetOpen}>
    <Sheet.Trigger asChild let:builder>
      <Button builders={[builder]} variant="outline" class="block md:hidden">
        Change rooms
      </Button>
    </Sheet.Trigger>
    <Sheet.Content side="left" class="px-12 flex flex-col">
      <ScrollArea class="flex flex-1">
        <div class="flex flex-col p-1 gap-1">
          {#each Object.entries(rooms) as [id, room]}
            <Button variant={id == currentRoomId ? 'secondary' : 'ghost'} class="justify-start flex truncate" on:click={() => {
              roomChange(id)
              sheetOpen = false
            }}>
              {room.name}
            </Button>
          {/each}
        </div>
      </ScrollArea>
      <Dialog.Root bind:open={createRoomDialogOpen}>
        <Dialog.Trigger class={buttonVariants({ variant: "outline" })}>
          New Chatroom
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Creating new chatroom</Dialog.Title>
          </Dialog.Header>
          <div>
            <Input placeholder="Chatroom name" bind:value={newRoomName} />
          </div>
          <div class="flex justify-end">
            <Button on:click={() => createRoom(newRoomName)}>Create</Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </Sheet.Content>
  </Sheet.Root>
  
  <div class="max-w-64 min-w-64 flex-col gap-2 hidden md:flex">
    <ScrollArea class="border rounded-md h-full flex">
      <div class="flex flex-col p-1 gap-1">
        {#each Object.entries(rooms) as [id, room]}
          <Button variant={id == currentRoomId ? 'secondary' : 'ghost'} class="justify-start flex truncate" on:click={() => roomChange(id)}>
            {room.name}
          </Button>
        {/each}
      </div>
    </ScrollArea>
    <Dialog.Root bind:open={createRoomDialogOpen}>
      <Dialog.Trigger class={buttonVariants({ variant: "outline" })}>
        New Chatroom
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Creating new chatroom</Dialog.Title>
        </Dialog.Header>
        <div>
          <Input placeholder="Chatroom name" bind:value={newRoomName} />
        </div>
        <div class="flex justify-end">
          <Button on:click={() => createRoom(newRoomName)}>Create</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  </div>
  {#if currentRoomId && rooms[currentRoomId]}
    {#key currentRoomId}
      <div class="w-full h-full" in:fly={{ duration: 300, y: 10, opacity: 0 }}>
        <svelte:component 
          this={Room}
          roomId={currentRoomId} 
          roomName={rooms[currentRoomId].name}
          user={currentUser} />
      </div>
    {/key}
  {:else}
    <div class="w-full flex items-center justify-center">
      Select a chatroom
    </div>
  {/if}
</div>