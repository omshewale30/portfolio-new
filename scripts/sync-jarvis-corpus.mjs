// Syncs the site corpus (scripts/build-jarvis-corpus.mjs) into Jarvis's OpenAI vector store.
// Only files this script uploaded — tagged attributes.source === "site" — are ever replaced or
// removed; everything else in the store (resume, statements, etc.) is left untouched.
// Unchanged documents are skipped by content hash, so re-running is cheap.
//
// Usage: OPENAI_API_KEY=... OPENAI_VECTOR_STORE_ID=... node scripts/sync-jarvis-corpus.mjs [--dry-run]
// Falls back to backend/.env for local runs.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCorpus } from "./build-jarvis-corpus.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_TAG = "site";
const API = "https://api.openai.com/v1";
const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 180_000;
const UPLOAD_CONCURRENCY = 4;

const readBackendEnv = () => {
  const envPath = path.join(projectRoot, "backend/.env");
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split("\n")
      .map((line) => line.match(/^\s*(OPENAI_API_KEY|OPENAI_VECTOR_STORE_ID)\s*=\s*(.*?)\s*$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value.replace(/^["']|["']$/g, "")]),
  );
};

const backendEnv = readBackendEnv();
const apiKey = process.env.OPENAI_API_KEY || backendEnv.OPENAI_API_KEY;
const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID || backendEnv.OPENAI_VECTOR_STORE_ID;
const dryRun = process.argv.includes("--dry-run");

if (!apiKey || !vectorStoreId) {
  console.error("OPENAI_API_KEY and OPENAI_VECTOR_STORE_ID are required (env or backend/.env).");
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const openai = async (method, route, body) => {
  const isForm = body instanceof FormData;
  const response = await fetch(`${API}${route}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  if (!response.ok) {
    throw new Error(`${method} ${route} failed (${response.status}): ${await response.text()}`);
  }
  return response.json();
};

const listStoreFiles = async () => {
  const files = [];
  let after;
  do {
    const query = new URLSearchParams({ limit: "100", ...(after ? { after } : {}) });
    const page = await openai("GET", `/vector_stores/${vectorStoreId}/files?${query}`);
    files.push(...page.data);
    after = page.has_more ? page.last_id : undefined;
  } while (after);
  return files;
};

const waitUntilIndexed = async (fileId) => {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const file = await openai("GET", `/vector_stores/${vectorStoreId}/files/${fileId}`);
    if (file.status === "completed") return;
    if (file.status === "failed" || file.status === "cancelled") {
      throw new Error(`Indexing ${fileId} ${file.status}: ${JSON.stringify(file.last_error)}`);
    }
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error(`Timed out waiting for ${fileId} to index`);
};

const upload = async (document) => {
  const form = new FormData();
  form.append("purpose", "assistants");
  form.append("file", new Blob([document.content], { type: "text/markdown" }), document.filename);
  const file = await openai("POST", "/files", form);

  await openai("POST", `/vector_stores/${vectorStoreId}/files`, {
    file_id: file.id,
    attributes: { source: SOURCE_TAG, doc_id: document.id, content_hash: document.hash, url: document.url },
    ...(document.maxChunkTokens && {
      chunking_strategy: {
        type: "static",
        static: { max_chunk_size_tokens: document.maxChunkTokens, chunk_overlap_tokens: 400 },
      },
    }),
  });
  await waitUntilIndexed(file.id);
  return file.id;
};

// Detach from the store, then delete the underlying file so replaced versions don't pile up.
const remove = async (fileId) => {
  await openai("DELETE", `/vector_stores/${vectorStoreId}/files/${fileId}`);
  await openai("DELETE", `/files/${fileId}`).catch((error) => {
    console.warn(`  could not delete file object ${fileId}: ${error.message}`);
  });
};

const inBatches = async (items, worker) => {
  for (let index = 0; index < items.length; index += UPLOAD_CONCURRENCY) {
    await Promise.all(items.slice(index, index + UPLOAD_CONCURRENCY).map(worker));
  }
};

const documents = await buildCorpus();
const siteFiles = (await listStoreFiles()).filter((file) => file.attributes?.source === SOURCE_TAG);

const indexedById = new Map();
const stale = [];
for (const file of siteFiles) {
  const docId = file.attributes.doc_id;
  // Keep one indexed copy per document; anything else (duplicates, failed runs) is stale.
  if (file.status === "completed" && !indexedById.has(docId)) indexedById.set(docId, file);
  else stale.push(file);
}

const currentIds = new Set(documents.map((document) => document.id));
for (const [docId, file] of indexedById) {
  if (!currentIds.has(docId)) stale.push(file);
}

const changed = documents.filter((document) => indexedById.get(document.id)?.attributes.content_hash !== document.hash);
const replaced = changed.map((document) => indexedById.get(document.id)).filter(Boolean);

console.log(
  `Jarvis corpus: ${documents.length} documents · ${changed.length} to upload · ` +
    `${replaced.length + stale.length} to remove · ${documents.length - changed.length} unchanged`,
);
changed.forEach((document) => console.log(`  ${indexedById.has(document.id) ? "update" : "add   "} ${document.filename}`));
stale.forEach((file) => console.log(`  remove ${file.attributes.doc_id ?? file.id}`));

if (dryRun) {
  console.log("Dry run: no changes made.");
  process.exit(0);
}

// Upload new versions before removing old ones, so Jarvis never loses a document mid-sync.
await inBatches(changed, async (document) => {
  await upload(document);
  console.log(`  indexed ${document.filename}`);
});
await inBatches([...replaced, ...stale], (file) => remove(file.id));

console.log("Jarvis corpus is in sync.");
