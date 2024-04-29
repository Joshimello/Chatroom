<script lang="ts">
  import { Input } from "$lib/components/ui/input"
  import { Button } from "$lib/components/ui/button"
  import { auth } from "$lib/firebase"
  import { fetchSignInMethodsForEmail } from "firebase/auth"
  import { toast } from "svelte-sonner"
  import { state, email } from "./stores"
  import { FirebaseError } from "@firebase/util"

  const checkEmail = async (email: string) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email)
      if (methods.length === 0) {
        $state = "register"
      }
      else {
        $state = "login"
      }
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
  <span>Input your email to continue</span> 
  <Input 
    type="email"
    placeholder="name@example.com"
    bind:value={$email}
  />
  <Button variant="outline" on:click={() => checkEmail($email)}>
    Continue
  </Button>
</div>

<div class="pt-8 flex flex-col gap-2">
  <span>Or continue with Google</span>
  <Button variant="outline">
    Google
  </Button>
</div>