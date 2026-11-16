import "server-only";
import { originAllowed } from "./auth";

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store", ...headers } });
}

/** Reads a JSON body without trusting Content-Length, rejecting anything over maxBytes. */
export async function readJson(request: Request, maxBytes: number): Promise<{ value: unknown } | { response: Response }> {
  const reader = request.body?.getReader();
  if (!reader) return { response: json({ error: "Request body is required" }, 400) };
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        try { await reader.cancel(); } catch { /* already rejecting */ }
        return { response: json({ error: "Request is too large" }, 413) };
      }
      chunks.push(value);
    }
  } catch {
    return { response: json({ error: "Request body could not be read" }, 400) };
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return { value: JSON.parse(new TextDecoder().decode(bytes)) }; }
  catch { return { response: json({ error: "Request body must be valid JSON" }, 400) }; }
}

export function sameOriginOr403(request: Request, requireOrigin = true): Response | null {
  try {
    if (originAllowed(request, requireOrigin)) return null;
    return json({ error: "Request origin is not allowed." }, 403);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "APP_ORIGIN is not configured correctly." }, 503);
  }
}
