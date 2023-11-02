import {
  defineNuxtModule,
  createResolver,
  addServerPlugin,
  addComponent,
  installModule,
} from "@nuxt/kit";
import { fileURLToPath, pathToFileURL } from "url";
import { resolve } from "path";
import { defu } from "defu";
import type { MermaidConfig } from "mermaid";

// Module options TypeScript interface definition
export interface ModuleOptions {
  puppeteerHtmlPath: string;
  mermaid?: MermaidConfig;
}

export interface ModulePublicRuntimeConfig {
  puppeteerHtmlPath: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-content-mermaid",
    configKey: "nuxtContentMermaid",
    compatibility: {
      nuxt: "^3.8.0",
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    puppeteerHtmlPath: "runtime/templates/index.html",
    mermaid: {},
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`

    addServerPlugin(resolver.resolve("./runtime/server/plugins/mermaid"));
    addComponent({
      name: "NuxtContentMermaid",
      filePath: resolver.resolve("./runtime/components/NuxtContentMermaid"),
      global: true,
    });
    const runtimeDir = resolve(fileURLToPath(import.meta.url), "..");
    const puppeteerHtmlPath = pathToFileURL(
      resolve(runtimeDir, options.puppeteerHtmlPath)
    ).href;

    nuxt.hook("nitro:config", (nitroConfig) => {
      nitroConfig.runtimeConfig = defu(nitroConfig.runtimeConfig, {
        public: {
          nuxtMermaid: { puppeteerHtmlPath, mermaidConfig: options.mermaid },
        },
      });
    });

    await installModule("@nuxt/content");
  },
});
declare module "@nuxt/schema" {
  interface PublicRuntimeConfig {
    nuxtMermaid: {
      puppeteerHtmlPath: string;
      mermaidConfig: MermaidConfig;
    };
  }
}
