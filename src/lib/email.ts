import { Resend } from "resend";
import { resultTypes, type ResultType } from "./quiz-data";

const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://alight-seven.vercel.app";

// Returns null when Resend is not configured yet, so callers skip gracefully.
export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function welcomeHtml({
  name,
  type,
  score,
}: {
  name: string;
  type?: ResultType;
  score?: number;
}): string {
  const proto = type?.protocol;
  const steps = proto
    ? proto.steps
        .map((s) => `<li style="margin:0 0 8px;color:#3C4843;line-height:1.5">${s}</li>`)
        .join("")
    : "";
  return `
  <div style="background:#FAF6F0;padding:32px 0;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E8DFD1;border-radius:18px;overflow:hidden">
      <div style="padding:26px 32px;border-bottom:1px solid #E8DFD1">
        <span style="font-size:20px;font-weight:700;color:#0E5A4F">Alight</span>
      </div>
      <div style="padding:32px">
        <h1 style="margin:0 0 8px;font-size:24px;color:#17211D">${name}, you are ${
          type ? type.name : "welcome to Alight"
        }.</h1>
        ${type ? `<p style="margin:0 0 18px;color:#6C7B73">${type.tagline}</p>` : ""}
        ${
          typeof score === "number"
            ? `<p style="margin:0 0 18px;color:#3C4843">Your Regulation Score: <b style="color:#157567">${score}/100</b></p>`
            : ""
        }
        ${type ? `<p style="margin:0 0 22px;color:#3C4843;line-height:1.6">${type.what}</p>` : ""}
        ${
          proto
            ? `<div style="background:#FBF7F1;border:1px solid #E8DFD1;border-radius:14px;padding:20px;margin:0 0 26px">
                 <p style="margin:0 0 10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#C4771A;font-weight:700">Your first reset · ${proto.name}</p>
                 <ol style="margin:0;padding-left:18px">${steps}</ol>
               </div>`
            : ""
        }
        <a href="${APP_URL}/app" style="display:inline-block;background:#157567;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 22px;border-radius:999px">Open your daily loop →</a>
        <p style="margin:26px 0 0;color:#6C7B73;font-size:13px;line-height:1.5">Alight is a wellbeing tool, not medical advice. You are receiving this because you took the Alight quiz.</p>
      </div>
    </div>
  </div>`;
}

export async function sendWelcomeEmail(params: {
  email: string;
  name?: string | null;
  typeKey?: string | null;
  regulationScore?: number | null;
}): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set; skipping welcome email");
    return;
  }
  const from = process.env.RESEND_FROM || "Alight <onboarding@resend.dev>";
  const type = params.typeKey ? resultTypes[params.typeKey] : undefined;
  const name = params.name?.trim() || "there";
  try {
    await resend.emails.send({
      from,
      to: params.email,
      subject: type ? `${name}, here is your reset: ${type.name}` : "Your Alight reset",
      html: welcomeHtml({ name, type, score: params.regulationScore ?? undefined }),
    });
  } catch (e) {
    console.error("[email] send error:", (e as Error).message);
  }
}
