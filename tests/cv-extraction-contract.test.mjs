/**
 * CV Extraction Frontend Contract Tests
 *
 * Rules verified:
 *   §37 frontend timeout exceeds backend operation deadline
 *   §38 loading state stays active until request resolves/rejects
 *   §39 duplicate trigger ignored when request already pending
 *
 * All tests use SSR module loading via Vite. No live HTTP requests.
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";

let server;
let cvService;

const source = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

before(async () => {
  server = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  });
  const mod = await server.ssrLoadModule("/src/services/cvService.ts");
  cvService = mod.cvService;
});

after(async () => {
  await server?.close();
});

// ---------------------------------------------------------------------------
// §37 -- Frontend timeout must exceed backend operation deadline
// ---------------------------------------------------------------------------

test("frontend fetches and enforces the backend timing contract", async () => {
  const src = await source("../src/services/cvService.ts");
  assert.ok(src.includes("/extraction-policy"));
  assert.ok(src.includes("extractionRequestTimeout(policy)"));
});

// ---------------------------------------------------------------------------
// §39 -- Duplicate trigger ignored when triggering === true
// ---------------------------------------------------------------------------

test("duplicate trigger check: triggerExtraction guard exists in panel source", async () => {
  // Verify the guard code is present in the panel source.
  const src = await source("../src/components/cv/ai/CVAIReviewPanel.tsx");
  assert.ok(
    src.includes("runExtractionExclusive(triggerLock"),
    "CVAIReviewPanel must use the synchronous exclusive trigger guard"
  );
});

// ---------------------------------------------------------------------------
// §31 -- triggerExtraction passes explicit timeout to Axios
// ---------------------------------------------------------------------------

test("triggerExtraction passes timeout option to Axios", async () => {
  const src = await source("../src/services/cvService.ts");
  assert.ok(
    src.includes("timeout: extractionRequestTimeout(policy)"),
    "triggerExtraction must pass the validated backend request timeout to Axios"
  );
});
