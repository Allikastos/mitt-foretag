import { NextResponse } from "next/server";
import { Resend } from "resend";
import { SITE_CONFIG } from "@/config/site";
import { type ContactPayload, validateContactPayload } from "@/src/lib/contact";

const MAX_REQUEST_BYTES = 16_384;
const success = () => NextResponse.json({ message: "Tack! Jag återkommer normalt inom en arbetsdag." });
const safeString = (value: unknown) => typeof value === "string" ? value.trim() : "";
const getConfiguredSender = () => safeString(process.env.CONTACT_FROM_EMAIL) || `${SITE_CONFIG.name} <${SITE_CONFIG.contact.email}>`;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) return NextResponse.json({ error: "Förfrågan är för stor. Korta ned texten och försök igen." }, { status: 413 });

  let body: string;
  try { body = await request.text(); }
  catch { return NextResponse.json({ error: "Förfrågan kunde inte läsas. Försök igen." }, { status: 400 }); }

  if (new TextEncoder().encode(body).byteLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "Förfrågan är för stor. Korta ned texten och försök igen." }, { status: 413 });
  }

  let payload: ContactPayload;
  try { payload = JSON.parse(body) as ContactPayload; }
  catch { return NextResponse.json({ error: "Ogiltig förfrågan. Kontrollera formuläret och försök igen." }, { status: 400 }); }

  const validation = validateContactPayload(payload);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  if (validation.isSpam) return success();
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: `Kontaktformuläret är tillfälligt otillgängligt. Mejla gärna ${SITE_CONFIG.contact.email}.` }, { status: 503 });

  const { name, company, email, phone, websiteUrl, message } = validation.data;
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const result = await resend.emails.send({
      from: getConfiguredSender(),
      to: process.env.CONTACT_TO_EMAIL || SITE_CONFIG.contact.email,
      subject: `Ny hemsideförfrågan från ${company}`,
      text: [`Kontaktperson: ${name}`, `Företag: ${company}`, `E-post: ${email}`, `Telefon: ${phone || "-"}`, `Befintlig webb: ${websiteUrl || "-"}`, "", "Behov:", message].join("\n"),
      replyTo: email,
    });
    if (result.error) { console.error("Contact email rejected", { providerCode: result.error.name || "unknown" }); return NextResponse.json({ error: "Förfrågan kunde inte skickas just nu. Försök igen eller mejla direkt." }, { status: 502 }); }
    console.info("Contact email sent", { delivered: Boolean(result.data?.id) });
    return success();
  } catch (error) {
    console.error("Contact email failed", { errorName: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ error: "Förfrågan kunde inte skickas just nu. Försök igen eller mejla direkt." }, { status: 500 });
  }
}
