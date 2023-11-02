export default defineNuxtConfig({
  modules: ["../src/module", "@nuxt/content"],
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  nuxtContentMermaid: {
    mermaid: {
      theme: "forest",
    },
  },
});
