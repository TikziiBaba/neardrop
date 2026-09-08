import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/auth-helper";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const RECIPIENT_EMAIL = "dedyusuf99@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Lütfen ad, e-posta ve mesaj alanlarını doldurunuz." },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const submissionId = `cnt_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const supabase = getServiceClient();

    // 1. Save to contact_submissions table (for admin tracking)
    try {
      await supabase.from("contact_submissions").insert({
        id: submissionId,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || "",
        subject: subject?.trim() || "Genel İletişim",
        message: message.trim(),
        ip_address: ip,
        is_read: false,
      });
    } catch (dbErr) {
      console.warn("Could not insert into contact_submissions table:", dbErr);
    }

    // 2. Also log in audit_logs so it appears in Admin Activity Logs
    try {
      await supabase.from("audit_logs").insert({
        id: `audit_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
        action: "CONTACT_MESSAGE_RECEIVED",
        resource_type: "support",
        resource_id: submissionId,
        ip_address: ip,
        details: `Yeni iletişim formu mesajı: ${name.trim()} (${email.trim()}) - ${subject?.trim() || "Genel İletişim"}`,
        metadata: {
          submission_id: submissionId,
          name: name.trim(),
          email: email.trim(),
          phone: phone?.trim() || "",
          subject: subject?.trim() || "",
          message: message.trim(),
          recipient: RECIPIENT_EMAIL,
        },
        status: "success",
      });
    } catch (auditErr) {
      console.warn("Could not insert into audit_logs:", auditErr);
    }

    // 3. Send Email Notification to dedyusuf99@gmail.com
    const resendApiKey = process.env.RESEND_API_KEY;
    let emailSent = false;

    const emailSubject = `[NearDrop İletişim] ${subject?.trim() || "Yeni Mesaj"} - ${name.trim()}`;
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7;">
        <div style="border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #09090b; margin: 0 0 4px; font-size: 20px;">Yeni İletişim Formu Mesajı</h2>
          <p style="color: #71717a; margin: 0; font-size: 13px;">NearDrop web sitesi üzerinden yeni bir ziyaretçi mesajı gönderildi.</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #71717a; width: 120px; font-weight: 600;">Gönderen:</td>
            <td style="padding: 8px 0; color: #09090b; font-weight: bold;">${name.trim()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-weight: 600;">E-Posta:</td>
            <td style="padding: 8px 0;"><a href="mailto:${email.trim()}" style="color: #0284c7; text-decoration: none; font-weight: bold;">${email.trim()}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-weight: 600;">Telefon:</td>
            <td style="padding: 8px 0;"><a href="tel:${phone?.trim()}" style="color: #10b981; text-decoration: none; font-weight: bold;">${phone?.trim() || "Belirtilmedi"}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-weight: 600;">Konu:</td>
            <td style="padding: 8px 0; color: #09090b;">${subject?.trim() || "Genel İletişim"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-weight: 600;">IP Adresi:</td>
            <td style="padding: 8px 0; color: #a1a1aa; font-family: monospace;">${ip}</td>
          </tr>
        </table>

        <div style="background: #f4f4f5; padding: 18px; border-radius: 12px; margin-bottom: 24px;">
          <h4 style="margin: 0 0 8px; color: #27272a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Mesaj İçeriği:</h4>
          <p style="margin: 0; color: #18181b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message.trim()}</p>
        </div>

        <div style="border-top: 1px solid #f4f4f5; padding-top: 16px; font-size: 12px; color: #a1a1aa; text-align: center;">
          Bu e-posta <a href="https://neardrop.bekirr.dev/contact" style="color: #0284c7;">NearDrop İletişim Formu</a> üzerinden gönderilmiştir.
        </div>
      </div>
    `;

    if (resendApiKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "NearDrop İletişim <onboarding@resend.dev>",
            to: [RECIPIENT_EMAIL],
            reply_to: email.trim(),
            subject: emailSubject,
            html: emailHtml,
          }),
        });

        const resData = await res.json();
        if (res.ok && resData.id) {
          emailSent = true;
        } else {
          console.warn("Resend email response:", resData);
        }
      } catch (mailErr) {
        console.error("Resend send error:", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      submissionId,
      emailSent,
      message: "Mesajınız başarıyla iletildi! En kısa sürede sizinle iletişime geçeceğiz.",
    });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Mesaj iletilemedi" },
      { status: 500 }
    );
  }
}
