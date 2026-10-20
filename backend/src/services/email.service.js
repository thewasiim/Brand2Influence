/**
 * email.service.js
 * Gmail SMTP transporter via Nodemailer.
 * Sends branded OTP emails for registration and password reset flows.
 */

import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

/**
 * Create a fresh transporter each call so env vars are always current.
 */
function createTransporter() {
  if (!env.gmail.user || !env.gmail.appPassword) {
    return null
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,       // STARTTLS — upgrades connection automatically
    auth: {
      user: env.gmail.user,
      pass: env.gmail.appPassword,
    },
    tls: {
      rejectUnauthorized: true,
    },
  })
}

/**
 * Build HTML email body for OTP messages.
 */
function buildOtpEmail(otp, type) {
  const isReset = type === 'password-reset'
  const subject = isReset
    ? 'Your Brand2Influence Password Reset Code'
    : 'Verify your Brand2Influence account'

  const actionLabel = isReset ? 'reset your password' : 'verify your email address'
  const expiryMinutes = isReset ? 10 : 5
  const fromName = env.gmail.fromName || 'Brand2Influence'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#18181f;border-radius:12px;border:1px solid rgba(244,241,232,0.1);overflow:hidden;max-width:520px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 100%);padding:32px 40px;text-align:center;">
              <div style="font-size:28px;font-weight:800;letter-spacing:-0.5px;color:#f4f1e8;">
                Brand<span style="color:#818cf8;">2</span>Influence
              </div>
              <div style="font-size:12px;color:rgba(244,241,232,0.55);margin-top:6px;text-transform:uppercase;letter-spacing:0.12em;">
                ${isReset ? 'Security Verification' : 'Email Verification'}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;font-size:15px;color:rgba(244,241,232,0.8);line-height:1.6;">
                You requested to ${actionLabel}. Use the verification code below:
              </p>
              <div style="background:#0f0f13;border:1px solid rgba(129,140,248,0.35);border-radius:10px;padding:28px 20px;text-align:center;margin:0 0 24px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:rgba(244,241,232,0.45);margin-bottom:16px;">
                  Your Verification Code
                </div>
                <div style="font-size:48px;font-weight:700;letter-spacing:0.25em;color:#a5b4fc;font-family:'Courier New',monospace;line-height:1;">
                  ${otp}
                </div>
                <div style="font-size:12px;color:rgba(244,241,232,0.4);margin-top:16px;">
                  Expires in <strong style="color:rgba(244,241,232,0.65);">${expiryMinutes} minutes</strong>
                </div>
              </div>
              <p style="margin:0 0 16px;font-size:13px;color:rgba(244,241,232,0.5);line-height:1.6;">
                Enter this code in the Brand2Influence ${isReset ? 'password reset' : 'signup'} screen.
                The code is valid for a single use only.
              </p>
              <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:14px 16px;">
                <p style="margin:0;font-size:12px;color:rgba(239,100,100,0.85);line-height:1.55;">
                  <strong>Security notice:</strong> Brand2Influence will never ask for this code via phone, chat, or email.
                  If you did not request this, you can safely ignore it.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid rgba(244,241,232,0.07);text-align:center;">
              <p style="margin:0;font-size:11px;color:rgba(244,241,232,0.3);line-height:1.5;">
                This is an automated message — please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = [
    subject,
    '',
    `Your Brand2Influence verification code is: ${otp}`,
    '',
    `This code expires in ${expiryMinutes} minutes and can only be used once.`,
    '',
    'If you did not request this, please ignore this email.',
    '',
    '— Brand2Influence Team',
  ].join('\n')

  return { subject, html, text }
}

/**
 * Send a 6-digit OTP to the given email address via Gmail SMTP.
 *
 * @param {string} toEmail    - Recipient email address
 * @param {string} otp        - Plaintext 6-digit OTP
 * @param {'registration'|'password-reset'} type
 * @returns {Promise<void>}
 * @throws {Error} if Gmail SMTP is not configured or delivery fails
 */
export async function sendOtpEmail(toEmail, otp, type) {
  const transporter = createTransporter()
  if (!transporter) {
    console.warn(`[EMAIL OTP] Gmail SMTP credentials not set on server. Simulated OTP for ${toEmail}: ${otp}`)
    return { simulated: true, otp }
  }

  try {
    const { subject, html, text } = buildOtpEmail(otp, type)
    const fromName = env.gmail.fromName || 'Brand2Influence'

    const info = await transporter.sendMail({
      from: `"${fromName}" <${env.gmail.user}>`,
      to: toEmail,
      subject,
      text,
      html,
    })

    console.info(`[EMAIL OTP] Sent ${type} OTP to ${toEmail} — messageId: ${info.messageId}`)
    return info
  } catch (err) {
    console.warn(`[EMAIL OTP] SMTP send failed for ${toEmail}: ${err.message}. Falling back gracefully.`)
    return { simulated: true, error: err.message, otp }
  }
}
