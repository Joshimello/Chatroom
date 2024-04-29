<script lang="ts">
  import { Input } from "$lib/components/ui/input"
  import { Button } from "$lib/components/ui/button"
  import { auth, db } from "$lib/firebase"
  import { createUserWithEmailAndPassword } from "firebase/auth"
  import { FirebaseError } from "@firebase/util"
  import { toast } from "svelte-sonner"
  import { state, email } from "./stores"
  import { ref, set } from "firebase/database"

  let registerPassword = ""
  let confirmPassword = ""

  const register = async (email: string, password: string, confPassword: string) => {
    if (password !== confPassword) {
      toast.error("Passwords do not match")
      return
    }

    try {
      toast.info("Creating account...")
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      set(ref(db, `users/${user.uid}`), {
        uid: user.uid,
        name: user.email?.split("@")[0] ?? user.email,
        email: user.email,
        bio: `Hello, I'm ${user.email?.split("@")[0] ?? user.email}!`,
        pfp: ''
      })

      toast.success("Account created successfully")
      $state = 'menu'
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

<div class="pt-8 flex flex-col gap-2">
  <span>Welcome, {$email}<br/> Choose a password to continue</span> 
  <Input 
    type="password"
    placeholder="password"
    bind:value={registerPassword}
  />
  <Input
    type="password"
    placeholder="confirm password"
    bind:value={confirmPassword}
  />
  <Button variant="outline" on:click={() => register($email, registerPassword, confirmPassword)}>
    Continue
  </Button>
  <Button variant="secondary" on:click={() => $state = 'menu'}>
    Return
  </Button>
</div>