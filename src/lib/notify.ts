import "server-only";

/**
 * Best-effort email notification to the church office.
 *
 * Deliberately fire-and-forget and deliberately secondary: every submission is
 * already committed to the database before this runs, so a missing API key or a
 * bounced email never loses somebody's prayer request. It only decides whether
 * anyone gets pinged about it tonight or sees it in /admin tomorrow.
 *
 * Uses Resend's REST API directly rather than the SDK — one less dependency for
 * a single POST.
 */
export async function notifyOffice(
  subject: string,
  fields: Record<string, string | undefined>,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CHURCH_NOTIFICATION_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !to || !from) return false;

  const body = Object.entries(fields)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((address) => address.trim()),
        subject,
        text: `${subject}\n\n${body}\n\nSee it in the admin: ${
          process.env.NEXT_PUBLIC_SITE_URL ?? ""
        }/admin`,
      }),
    });

    if (!response.ok) {
      console.error("[notify] Resend rejected the message:", await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[notify] could not reach Resend:", error);
    return false;
  }
}
