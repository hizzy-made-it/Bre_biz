import { changeSite, isRecord, publicSite, updateState, ValidationError } from "@/lib/site-store";
import { clientKey, recordFailure, tooManyAttempts } from "@/lib/auth";
import { json, readJson, sameOriginOr403 } from "@/lib/http";
export const runtime = "nodejs";

/** Public inquiry form. The only write anonymous visitors can make. */
export async function POST(request: Request) {
  const body = await readJson(request, 16 * 1024);
  if ("response" in body) return body.response;
  const blocked = sameOriginOr403(request);
  if (blocked) return blocked;
  const bucket = `inquiry:${clientKey(request)}`;
  if (tooManyAttempts(bucket, 10)) return json({ error: "Too many inquiries from this connection. Please try again later." }, 429);
  if (!isRecord(body.value)) return json({ error: "Expected inquiry details" }, 400);
  if (typeof body.value.website === "string" && body.value.website) return json({ ok: true }); // honeypot
  try {
    let createdId = "";
    const result = changeSite((state) => {
      const next = updateState(state, { action: "createInquiry", payload: body.value, version: 0 });
      createdId = next.inquiries[0].id;
      return next;
    });
    recordFailure(bucket); // counts submissions, not failures, for rate limiting
    const inquiry = result.state.inquiries.find((item) => item.id === createdId)!;
    return json({ ok: true, inquiry: { type: inquiry.type, date: inquiry.date, time: inquiry.time, guests: inquiry.guests, location: inquiry.location }, site: publicSite(result.state) });
  } catch (error) {
    if (error instanceof ValidationError) return json({ error: error.message }, 400);
    return json({ error: "We couldn't save your inquiry. Please try again." }, 500);
  }
}
