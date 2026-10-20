// Custom Vite config merged into Zudoku's dev server ("merged with custom user
// Vite config" in the dev log).
//
// WHY THIS FILE EXISTS
// In dev, zudoku serves itself as raw TypeScript (it sets
// optimizeDeps.exclude: ["zudoku"]) and its dependency scanner fails on its
// own virtual module ("Failed to run dependency scan ... could not be
// resolved: virtual:zudoku-markdown-files" in the dev log). This happens on
// the main branch as well (verified by running main in a git worktree). With
// the scan dead, nothing is pre-bundled automatically, so every browser
// dependency is served as raw files — and any CJS package the browser reaches
// throws "does not provide an export named ..." at module-link time.
//
// On main the crash is invisible until you click into an API operation: the
// /api landing page is server-rendered, but the operation pages mount an
// in-browser GraphQL server whose module chain contains CJS files. The main
// worktree experiment showed main's own server rewriting, verbatim:
//   import { Response } from ".../@whatwg-node/fetch/dist/global-ponyfill.js"
//   import { GraphQLScalarType } from ".../graphql/index.js"   (circular.ts)
// i.e. the exact "Response" SyntaxError reported on dev.
//
// The include list below covers exactly the CJS modules reachable from the
// browser (walked statically from our config + zudoku's src/{app,lib,ui}):
//   - markdown/hydration chain leaves: style-to-js, debug, extend,
//     hoist-non-react-statics
//   - OpenAPI operation pages (in-browser GraphQL server):
//     @whatwg-node/fetch (browser build is CJS), graphql/index.js and
//     graphql/error/index.js (CJS entries imported verbatim by zudoku's
//     src/lib/oas/graphql/circular.ts and src/lib/oas/parser/index.ts)
//
// DO NOT add whole package families here (@unhead/react, react-markdown,
// lucide-react, ...): if one entry of a family is optimized while raw source
// still imports another entry of the same family, the browser ends up with
// two module instances. That split broke React context before
// ("useHead() was called without provide context"). Everything not listed
// keeps main-branch behavior: served raw, identical semantics, just a slower
// first load.
export default {
  optimizeDeps: {
    include: [
      // --- markdown / hydration chain (CJS leaves) ---
      "style-to-js", // hast-util-to-jsx-runtime (client markdown)
      "debug", // micromark dev build
      "hoist-non-react-statics", // @tanem/react-nprogress (page progress bar)
      "extend", // unified (client markdown)
      // --- OpenAPI operation pages: in-browser GraphQL server (CJS) ---
      "@whatwg-node/fetch", // browser build is CJS (dist/global-ponyfill.js)
      "graphql/index.js", // imported verbatim by zudoku oas/graphql/circular.ts
      "graphql/error/index.js", // imported verbatim by zudoku oas/parser/index.ts
    ],
  },
};
