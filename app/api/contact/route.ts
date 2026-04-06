import { NextResponse } from "next/server";
import { Resend } from "resend";
import { SITE_CONFIG } from "@/config/site";

type ContactPayload = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  message?: string;
  website?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSafeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { error: "Ogiltig förfrågan. Kontrollera formuläret och försök igen." },
      { status: 400 }
    );
  }

  const name = getSafeString(payload.name);
  const company = getSafeString(payload.company);
  const email = getSafeString(payload.email);
  const phone = getSafeString(payload.phone);
  const message = getSafeString(payload.message);
  const website = getSafeString(payload.website);

  if (website) {
    return NextResponse.json(
      {
        message:
          "Tack för din förfrågan. Vi återkommer normalt inom en arbetsdag.",
      },
      { status: 200 }
    );
  }

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Namn, e-post och meddelande behöver fyllas i." },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Ange en giltig e-postadress." },
      { status: 400 }
    );
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Kontaktformuläret är tillfälligt otillgängligt. Mejla gärna direkt till oss så återkommer vi snabbt.",
      },
      { status: 503 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from =
    process.env.CONTACT_FROM_EMAIL || "Kontaktformulär <onboarding@resend.dev>";
  const to = process.env.CONTACT_TO_EMAIL || SITE_CONFIG.contact.email;

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Ny kontaktförfrågan från ${name}`,
      text: [
        `Namn: ${name}`,
        `Företag: ${company || "-"}`,
        `E-post: ${email}`,
        `Telefon: ${phone || "-"}`,
        "",
        "Meddelande:",
        message,
      ].join("\n"),
      replyTo: email,
    });

    return NextResponse.json({
      message: "Tack för din förfrågan. Vi återkommer normalt inom en arbetsdag.",
    });
  } catch (error) {
    console.error("Failed to send contact email", error);
    return NextResponse.json(
      {
        error:
          "Förfrågan kunde inte skickas just nu. Försök igen eller mejla direkt till oss.",
      },
      { status: 500 }
    );
  }
}
