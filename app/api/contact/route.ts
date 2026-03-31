import { Resend } from "resend";
import { siteConfig } from "@/lib/site";

type ContactPayload = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  message?: string;
  website?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return Response.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const name = normalizeField(payload.name);
  const company = normalizeField(payload.company);
  const email = normalizeField(payload.email);
  const phone = normalizeField(payload.phone);
  const message = normalizeField(payload.message);
  const website = normalizeField(payload.website);

  if (website) {
    return Response.json(
      { message: "Tack för din förfrågan. Jag återkommer så snart jag kan." },
      { status: 200 }
    );
  }

  if (!name || !email || !message) {
    return Response.json(
      { error: "Namn, e-post och meddelande måste fyllas i." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return Response.json(
      { error: "Ange en giltig e-postadress." },
      { status: 400 }
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return Response.json(
      {
        error: `Kontaktformuläret är inte kopplat till e-post ännu. Mejla direkt på ${siteConfig.email}.`,
      },
      { status: 500 }
    );
  }

  const resend = new Resend(resendApiKey);
  const toEmail = process.env.CONTACT_TO_EMAIL || siteConfig.email;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";

  const safeName = escapeHtml(name);
  const safeCompany = company ? escapeHtml(company) : "Ej angivet";
  const safeEmail = escapeHtml(email);
  const safePhone = phone ? escapeHtml(phone) : "Ej angivet";
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `Ny kontaktförfrågan från ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111111;">
          <h2>Ny kontaktförfrågan från webbplatsen</h2>
          <p><strong>Namn:</strong> ${safeName}</p>
          <p><strong>Företag:</strong> ${safeCompany}</p>
          <p><strong>E-post:</strong> ${safeEmail}</p>
          <p><strong>Telefon:</strong> ${safePhone}</p>
          <p><strong>Meddelande:</strong></p>
          <p>${safeMessage}</p>
        </div>
      `,
      text: [
        "Ny kontaktförfrågan från webbplatsen",
        "",
        `Namn: ${name}`,
        `Företag: ${company || "Ej angivet"}`,
        `E-post: ${email}`,
        `Telefon: ${phone || "Ej angivet"}`,
        "",
        "Meddelande:",
        message,
      ].join("\n"),
    });

    if (error) {
      console.error("Failed to send contact email", error);

      return Response.json(
        {
          error: `Förfrågan kunde inte skickas just nu. Mejla direkt på ${siteConfig.email}.`,
        },
        { status: 500 }
      );
    }

    return Response.json(
      { message: "Tack för din förfrågan. Jag återkommer så snart jag kan." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error while sending contact email", error);

    return Response.json(
      {
        error: `Förfrågan kunde inte skickas just nu. Mejla direkt på ${siteConfig.email}.`,
      },
      { status: 500 }
    );
  }
}
