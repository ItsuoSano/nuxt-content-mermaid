import { defineNitroPlugin } from "nitropack/dist/runtime/plugin";
import { visit } from "unist-util-visit";
import { createMermaidNodes } from "../../lib/mermaid";
import type { NodeData } from "../../lib/mermaid";
import type {
  MarkdownNode,
  MarkdownRoot,
} from "@nuxt/content/dist/runtime/types";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("content:file:afterParse", async (file) => {
    const targetNodes: NodeData[] = [];
    if (file._type !== "markdown") return;

    visit(
      file.body,
      (node: MarkdownNode) => {
        return node.tag === "pre" && node.props?.language === "mermaid";
      },
      (node: MarkdownNode, index, parent: MarkdownRoot) => {
        if (index === undefined) return;
        targetNodes.push({ code: node.props?.code, parent, index });
      }
    );
    await createMermaidNodes(targetNodes);
  });
});
