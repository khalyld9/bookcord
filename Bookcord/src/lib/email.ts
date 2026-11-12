import "server-only";

import nodemailer from "nodemailer";

type TransactionalEmail = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
};

export type EmailResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "provider_error" };

export function isTransactionalEmailConfigured() {
  return Boolean(
    (process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL) ||
      (process.env.SMTP_USER && process.env.SMTP_APP_PASSWORD) ||
      (process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
  );
}

/** Server-only transactional mail. Auth confirmation and recovery mail is sent by Supabase. */
export async function sendTransactionalEmail(
  message: TransactionalEmail,
): Promise<EmailResult> {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL;
  if (brevoApiKey && brevoSenderEmail) {
    try {
      const recipients = Array.isArray(message.to) ? message.to : [message.to];
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: process.env.BREVO_SENDER_NAME ?? "Bookcords",
            email: brevoSenderEmail,
          },
          to: recipients.map((email) => ({ email })),
          subject: message.subject,
          htmlContent: message.html,
          textContent: message.text,
          ...(message.idempotencyKey
            ? { headers: { "X-Bookcords-Idempotency-Key": message.idempotencyKey } }
            : {}),
        }),
      });

      if (!response.ok) {
        console.error("Brevo email provider returned", response.status);
        return { sent: false, reason: "provider_error" };
      }
      return { sent: true };
    } catch (error) {
      console.error("Brevo transactional email failed", error);
      return { sent: false, reason: "provider_error" };
    }
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_APP_PASSWORD?.replace(/\s/g, "");
  if (smtpUser && smtpPassword) {
    const port = Number(process.env.SMTP_PORT ?? "465");
    const from = process.env.EMAIL_FROM ?? `Bookcords <${smtpUser}>`;

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST ?? "smtp.gmail.com",
        port,
        secure: port === 465,
        auth: { user: smtpUser, pass: smtpPassword },
      });

      await transporter.sendMail({
        from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
      return { sent: true };
    } catch (error) {
      console.error("SMTP email failed", error);
      return { sent: false, reason: "provider_error" };
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { sent: false, reason: "not_configured" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(message.idempotencyKey
          ? { "Idempotency-Key": message.idempotencyKey }
          : {}),
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    if (!response.ok) {
      console.error("Transactional email provider returned", response.status);
      return { sent: false, reason: "provider_error" };
    }
    return { sent: true };
  } catch (error) {
    console.error("Transactional email failed", error);
    return { sent: false, reason: "provider_error" };
  }
}

export function escapeEmailHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );
}
