/**
 * Why this file exists
 * ====================
 *
 * Zudoku's dev server ships a broken dependency *scanner*: it fails on its own
 * virtual module (`virtual:zudoku-markdown-files ... could not be resolved`)
 * and disables pre-bundling entirely. That happens on the `main` branch too
 * (verified with a git worktree of main + curl against its own dev server).
 *
 * Consequence: EVERY npm dependency is served as raw source. Two problems:
 *
 *  1. Raw CJS files crash at module-link time ("does not provide an export
 *     named 'Response'" from @whatwg-node/fetch when clicking into an
 *     operation - the crash the API Reference was showing).
 *  2. Raw ESM means a cold operation-page load issues ~4000 HTTP requests
 *     (lucide-react alone is 1760 files). With ~6 parallel connections this
 *     takes tens of seconds, and clicking around during that window triggers
 *     aborted-module-load errors ("Something went wrong").
 *
 * Fix: pre-bundle the browser-reachable dependencies here. Rules we follow:
 *
 *  - A package family is only safe to optimize if EVERY browser-reachable
 *    entry point of that family is listed, so all importers share one module
 *    instance. Splitting a family breaks React contexts (the earlier
 *    "useHead was called without provide context" bug).
 *  - Never optimize: `react-router` (its `react-router/dom` entry imports
 *    relatively - optimizing would duplicate the router), `@unhead/react`
 *    (its `client` and root entries share a relative context module),
 *    the react-markdown/unified/micromark family (dozens of shared packages,
 *    instance-sensitive), `@scalar/snippetz` (ships `node:fs` imports in
 *    dist), radix/cmdk/vaul (single-file dists, nothing to gain).
 */
export default {
  optimizeDeps: {
    include: [
      // --- Markdown / hydration chain (CJS leaves) ---
      "style-to-js", // hast-util-to-jsx-runtime (client markdown)
      "debug", // micromark dev build
      "hoist-non-react-statics", // @tanem/react-nprogress (page progress bar)
      "extend", // unified (client markdown)

      // --- OpenAPI operation pages: in-browser GraphQL server (CJS) ---
      "@whatwg-node/fetch", // browser build is CJS (dist/global-ponyfill.js)
      "graphql/index.js", // imported verbatim by zudoku oas/graphql/circular.ts
      "graphql/error/index.js", // imported verbatim by zudoku oas/parser
      "openapi-types", // pure CJS; value-imported for the HttpMethods enum
      // (oas/parser/index.ts: `Object.values(OpenAPIV3.HttpMethods)` keeps the
      // import at runtime; reached via createServer.ts -> oas/graphql/index.ts
      // -> { HttpMethods } from ../parser/index.js when the Playground mounts)

      // --- GraphQL / OpenAPI data layer (full yoga-chain family, ~700 raw
      //     files otherwise; every reachable entry is listed so the family
      //     stays a single module instance per package) ---
      "graphql",
      "graphql/language",
      "graphql-yoga",
      "@pothos/core",
      "graphql-type-json",
      "@envelop/core",
      "@envelop/instrumentation",
      "@graphql-tools/utils",
      "@graphql-tools/schema",
      "@graphql-tools/merge",
      "@graphql-tools/executor",
      "@graphql-yoga/logger",
      "@graphql-yoga/subscription",
      "@whatwg-node/promise-helpers",
      "@whatwg-node/server",
      "@whatwg-node/disposablestack",
      "@whatwg-node/events",
      "@repeaterjs/repeater",
      "@x0k/json-schema-merge",
      "@x0k/json-schema-merge/lib/array",

      // --- Icons: 1760 raw files -> one chunk ---
      "lucide-react",

      // --- Motion family (react/react-m -> framer-motion -> motion-dom) ---
      "motion/react",
      "motion/react-m",
      "framer-motion",
      "framer-motion/m",
      "motion-dom",
      "motion-utils",

      // --- Data / forms / config parsing ---
      "@tanstack/react-query",
      "react-hook-form",
      "zod",
      "zod/mini",
      "yaml", // pulled browser-side by @scalar/openapi-parser

      // --- Base UI toggles (only these two sub-entries are used) ---
      "@base-ui/react/toggle",
      "@base-ui/react/toggle-group",

      // --- Shiki highlighter runtime (grammars stay lazy, as upstream) ---
      "shiki/core",
      "shiki/engine/javascript",
      "@shikijs/core",
      "@shikijs/engine-javascript",
      "@shikijs/engine-oniguruma",
      "@shikijs/engine-oniguruma/wasm-inlined",
      "@shikijs/vscode-textmate",
    ],
  },
};
