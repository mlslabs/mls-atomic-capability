import "./styles.css";
import type { ZudokuConfig } from "zudoku";

/**
 * Zudoku's MDX pipeline runs `rehype-raw` before the Shiki highlighter, and
 * that step re-parses the tree, dropping the `data.meta` field that code
 * fences rely on to carry `title="..."` (and other) metadata. Mirroring the
 * meta into a `metastring` element property keeps it available to
 * `@shikijs/rehype`, which reads `properties.metastring` as a fallback.
 */
const remarkCodeMetaString = () => (tree: {
  type: string;
  meta?: string;
  data?: Record<string, unknown>;
  children?: unknown[];
}) => {
  const walk = (node: {
    type: string;
    meta?: string;
    data?: Record<string, unknown>;
    children?: unknown[];
  }) => {
    if (node.type === "code" && node.meta) {
      node.data = {
        ...node.data,
        hProperties: {
          ...(node.data?.hProperties as Record<string, unknown> | undefined),
          metastring: node.meta,
        },
      };
    }
    for (const child of (node.children ?? []) as Parameters<typeof walk>[0][]) {
      walk(child);
    }
  };
  walk(tree);
};

/**
 * Developer Portal Configuration for the Audio Video API
 * (UHD transcoding & AI media enhancement platform).
 *
 * For more information, see:
 * https://zuplo.com/docs/dev-portal/zudoku/configuration/overview
 */
const config: ZudokuConfig = {
  build: {
    remarkPlugins: [remarkCodeMetaString],
  },
  site: {
    title: "Audio Video API",
    logo: {
      src: {
        light: "/logo.svg",
        dark: "/logo-dark.svg",
      },
      alt: "Audio Video API",
    },
    footer: {
      copyright: `© ${new Date().getFullYear()} Audio Video API. All rights reserved.`,
    },
  },
  metadata: {
    title: "Audio Video API Documentation",
    description:
      "Developer documentation for the Audio Video API: UHD transcoding, SDR-to-HDR conversion, super resolution, frame interpolation, and 3D audio enhancement.",
  },
  navigation: [
    {
      type: "category",
      label: "Documentation",
      icon: "book",
      items: [
        {
          type: "category",
          label: "Getting Started",
          icon: "sparkles",
          items: ["introduction", "quickstart", "authentication"],
        },
        {
          type: "category",
          label: "Core Concepts",
          icon: "lightbulb",
          items: ["task-lifecycle", "errors", "formats", "output-files"],
        },
        {
          type: "category",
          label: "Enhancement Capabilities",
          icon: "wand-sparkles",
          items: [
            "sdr-to-hdr",
            "super-resolution",
            "frame-interpolation",
            "audio-enhancement",
          ],
        },
      ],
    },
    {
      type: "link",
      to: "/api",
      label: "API Reference",
      icon: "code",
    },
  ],
  redirects: [{ from: "/", to: "/introduction" }],
  apis: [
    {
      type: "file",
      input: "../config/routes.oas.json",
      path: "api",
    },
  ],
};

export default config;
