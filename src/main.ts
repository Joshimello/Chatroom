import "./app.pcss";
import App from "./App.svelte";
import "@fontsource-variable/raleway"

const app = new App({
  target: document.getElementById("app")!,
});

export default app;
