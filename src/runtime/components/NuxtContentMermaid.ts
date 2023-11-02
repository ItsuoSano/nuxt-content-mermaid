import { defineNuxtComponent } from "nuxt/app";
import { h } from "vue";

export default defineNuxtComponent({
  name: "NuxtContentMermaid",
  props: {
    svgContent: {
      type: String,
    },
  },
  setup(props) {
    return () => h("div", { innerHTML: props.svgContent });
  },
});
