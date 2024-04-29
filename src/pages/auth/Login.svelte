<script lang="ts">
  import { Input } from "$lib/components/ui/input"
  import { Button } from "$lib/components/ui/button"
  import { auth } from "$lib/firebase"
  import { signInWithEmailAndPassword } from "firebase/auth"
  import { toast } from "svelte-sonner"
  import { FirebaseError } from "@firebase/util"
  import { state, email } from "./stores"

  let loginPassword = ""

  const login = async (email: string, password: string) => {
    try {
      toast.info("Logging in...")
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      toast.success("Logged in successfully")
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
  <span>Welcome back, {$email}<br/> Input your password to continue</span> 
  <Input 
    type="password"
    placeholder="password"
    bind:value={loginPassword}
  />
  <Button variant="outline" on:click={() => login($email, loginPassword)}>
    Continue
  </Button>
  <Button variant="secondary" on:click={() => $state = 'menu'}>
    Return
  </Button>
</div>