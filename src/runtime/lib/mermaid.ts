import type { MarkdownNode } from "@nuxt/content/dist/runtime/types";
import { launch } from "puppeteer";
import { useRuntimeConfig } from "#imports";
import { createRequire } from "module";
import type { Mermaid } from "mermaid";
import consola from "consola";

export type NodeData = { code: string; parent: MarkdownNode; index: number };

export const createMermaidNodes = async (targetNodes: NodeData[]) => {
  if (targetNodes.length === 0) return;

  const browser = await launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: "new",
  });

  const nuxtMermaidConfig = useRuntimeConfig().public.nuxtMermaid;

  const url = nuxtMermaidConfig.puppeteerHtmlPath;
  for (const { code, index, parent } of targetNodes) {
    const page = await browser.newPage();
    await page.goto(url);
    await page.addScriptTag({
      path: createRequire(import.meta.url).resolve(
        "mermaid/dist/mermaid.min.js"
      ),
    });

    const result = await page.evaluate(
      async ({ code, index, options }) => {
        try {
          // @ts-ignore
          const mermaidInstance: Mermaid = mermaid;
          mermaidInstance.initialize(options);
          return {
            success: true as const,
            value: await mermaidInstance.render("mermaid-svg-" + index, code),
          };
        } catch (e) {
          if (e instanceof Error) {
            return {
              success: false as const,
              value: e.message,
            };
          }

          return {
            success: false as const,
            value: "Unknown error",
          };
        }
      },
      { code, index, options: nuxtMermaidConfig.mermaidConfig }
    );

    page.close();

    if (!result.success) {
      consola.error("nuxt-content-mermaid:" + result.value);
      continue;
    }

    parent.children![index] = {
      type: "element",
      tag: "nuxt-content-mermaid",
      props: {
        "svg-content": result.value.svg,
      },
    };
  }

  browser.close();
};
