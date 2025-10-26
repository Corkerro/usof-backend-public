import nodemailer from "nodemailer";
import crypto from "crypto";
import { EmailChangeRepository } from "./email-change.repository.js";
import { EmailVerificationRepository } from "./email-verification.repository.js";
import { UserDeletionRepository } from "../user/user-deletion.repository.js";
import { UserRecoveryRepository } from "../user/user-recovery.repository.js";

const DEFAULT_LOGO_URL = "https://raw.githubusercontent.com/Corkerro/usof-frontend/refs/heads/main/public/logo.svg?token=GHSAT0AAAAAADN4DYK5TDWAPO3P2ZPIYDMA2H4XAEQ";

export class EmailService {
  static transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  static async verifyTransporter() {
    try {
      await this.transporter.verify();
      console.log("✅ SMTP Connection ready");
    } catch (err) {
      console.error("❌ SMTP Connection failed:", err);
    }
  }

  static buildHtmlEmail({ title, message, actionUrl, actionText, color = "var(--red-1)", logoUrl }) {
    logoUrl = logoUrl || DEFAULT_LOGO_URL;
    return `
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        :root {
          --dark-1: #1c1c1c;
          --gray-1: #6e6e6e;
          --red-1: #b03a2e;
          --gray-2: #cfcfcf;
          --light-1: #efe6e1;
          --blue-1: #2e86ab;
          --dark2: #2f2f2f;
          --red-1-dark: #771a11;
          --dark-1-80: rgba(28, 28, 28, 0.8);
        }
        body { background-color: var(--dark-1); font-family: "Segoe UI", Arial, sans-serif; color: var(--light-1); margin: 0; padding: 0; }
        .email-wrapper { max-width: 600px; margin: 40px auto; background: var(--dark-1); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.25); color: var(--light-1); }
        .email-header { text-align: center; padding: 24px; }
        .email-header img { max-width: 120px; margin-bottom: 12px; }
        .email-header h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .email-body { padding: 30px; }
        .email-body h2 { margin-top: 0; font-size: 20px; }
        .email-body p { color: var(--light-1); line-height: 1.6; font-size: 15px; }
        .email-button { display: inline-block; font-family: Arial, sans-serif; font-weight: 400; font-size: 16px; text-align: center; color: var(--light-1) !important; padding: 8px 16px; border-radius: 4px; background: ${color}; border: 1px solid ${color}; text-decoration: none; transition: background-color 0.3s ease; }
        .email-button:hover { background: var(--dark-1-80); }
        .email-button:active { background: var(--dark-1); }
        .email-button.stroke { background: var(--dark-1-80); }
        .email-button.stroke:hover { background: ${color}; }
        .email-button.stroke:active { background: var(--red-1-dark); }
        .email-footer { text-align: center; color: var(--gray-2); font-size: 13px; padding: 20px; background: var(--dark2); }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-header">
          <img src="${logoUrl}" alt="Logo"/>
          <h1>Bugzilla</h1>
        </div>
        <div class="email-body">
          <h2>${title}</h2>
          <p>${message}</p>
          ${actionUrl ? `<a href="${actionUrl}" class="email-button" target="_blank">${actionText || "Open"}</a>` : ""}
        </div>
        <div class="email-footer">
          © ${new Date().getFullYear()} Bugzilla. All rights reserved.
        </div>
      </div>
    </body>
    </html>`;
  }

  static async sendMail({ to, subject, text, html }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Bugzilla" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html: html || text,
      });
      console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    } catch (err) {
      console.error("❌ Failed to send email:", err);
      throw new Error("Email sending failed");
    }
  }

  static async getOrCreateEmailVerification(user) {
    if (!user) throw new Error("User not found");
    const existing = await EmailVerificationRepository.findValidByUserId(user.id);
    if (existing) {
      const msLeft = new Date(existing.expires_at).getTime() - Date.now();
      if (msLeft > 0) return { alreadySent: true, retryAfter: Math.floor(msLeft / 60000) };
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    // const url = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;
    const url = `${process.env.FRONT_URL}/verify-email?token=${token}`;
    await EmailVerificationRepository.create({ userId: user.id, token, expiresAt: expires });
    return { alreadySent: false, token, url };
  }

  static async sendEmailVerification(email, url) {
    const html = this.buildHtmlEmail({
      title: "Verify Your Email Address",
      message: "Click the button below to verify your email and activate your account.",
      actionUrl: url,
      actionText: "Verify Email",
    });
    await this.sendMail({ to: email, subject: "Email Verification", text: `Verify your email: ${url}`, html });
  }

  static async createEmailChangeToken(userId, oldEmail, newEmail) {
    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await EmailChangeRepository.create(userId, oldEmail, newEmail, token, expiresAt);
    return { token, expiresAt };
  }

  static async sendVerifyNewEmail(email, url) {
    const html = this.buildHtmlEmail({
      title: "Verify Your New Email",
      message: "Your email has been changed. Please verify it using the link below.",
      actionUrl: url,
      actionText: "Verify New Email",
    });
    await this.sendMail({ to: email, subject: "Verify Your New Email", text: `Verify your new email: ${url}`, html });
  }

  static async sendEmailConfirmation(email, token) {
    const html = this.buildHtmlEmail({
      title: "Confirm Your Email Change",
      message: `We received a request to change your email.<br>Use this code: <strong>${token}</strong><br>Expires in 15 minutes.`,
    });
    await this.sendMail({ to: email, subject: "Confirm Email Change", text: `Use this code: ${token}`, html });
  }

  static async createDeletionToken(userId) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await UserDeletionRepository.create(userId, token, expiresAt);
    return { token, expiresAt };
  }

  static async sendDeletionConfirmation(email, token) {
    const actionUrl = `http://localhost:5173/delete-account?token=${token}`;
    const html = this.buildHtmlEmail({
      title: "Confirm Account Deletion",
      message: `We received a request to delete your account.<br>Click the button below to confirm.<br>Expires in 15 minutes.`,
      actionUrl,
      actionText: "Delete Account",
    });
    await this.sendMail({ to: email, subject: "Confirm Account Deletion", text: `Confirm account deletion: ${actionUrl}`, html });
  }

  static async validateDeletionToken(token) {
    const request = await UserDeletionRepository.findByToken(token);
    if (!request) throw new Error("Invalid or expired token");
    return request;
  }

  static async markDeletionTokenUsed(tokenId) {
    await UserDeletionRepository.markUsed(tokenId);
  }

  static async getOrCreateDeletionToken(userId) {
    const existing = await UserDeletionRepository.findValidByUserId(userId);
    if (existing && new Date(existing.expires_at).getTime() - Date.now() > 0) {
      return { alreadySent: true, retryAfter: Math.floor((new Date(existing.expires_at).getTime() - Date.now()) / 60000), token: existing.token };
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await UserDeletionRepository.create(userId, token, expiresAt);
    return { alreadySent: false, token, expiresAt };
  }

  static async createRecoveryToken(userId) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await UserRecoveryRepository.create(userId, token, expiresAt);
    return { token, expiresAt };
  }

  static async sendRecoveryConfirmation(email, token) {
    const actionUrl = `http://localhost:5173/recovery?token=${token}`;

    const html = this.buildHtmlEmail({
      title: "Recover Your Account",
      message: `Click the button below to recover your account. The link expires in 15 minutes.`,
      actionUrl,
      actionText: "Recover Account",
    });

    await this.sendMail({
      to: email,
      subject: "Recover Your Account",
      text: `Recover your account using this link: ${actionUrl}`,
      html,
    });
  }

  static async validateRecoveryToken(token) {
    const request = await UserRecoveryRepository.findByToken(token);
    if (!request) throw new Error("Invalid or expired token");
    return request;
  }

  static async markRecoveryTokenUsed(tokenId) {
    await UserRecoveryRepository.markUsed(tokenId);
  }

  static async getOrCreateRecoveryToken(userId) {
    const existing = await UserRecoveryRepository.findValidByUserId(userId);
    if (existing && new Date(existing.expires_at).getTime() - Date.now() > 0) {
      return { alreadySent: true, retryAfter: Math.floor((new Date(existing.expires_at).getTime() - Date.now()) / 60000), token: existing.token };
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await UserRecoveryRepository.create(userId, token, expiresAt);
    return { alreadySent: false, token, expiresAt };
  }

  static async sendPasswordResetRequest(email, url) {
    const html = this.buildHtmlEmail({
      title: "Password Reset Request",
      message: "Click the button below to reset your password.",
      actionUrl: url,
      actionText: "Reset Password",
    });
    await this.sendMail({ to: email, subject: "Password Reset Request", text: `Reset password: ${url}`, html });
  }

  static async sendAccConfirmFromAdmin(email, url) {
    const html = this.buildHtmlEmail({
      title: "Account Registration Request",
      message: "Click below to set your password and complete registration.",
      actionUrl: url,
      actionText: "Set Password",
    });
    await this.sendMail({ to: email, subject: "Account Registration Request", text: `Set password: ${url}`, html });
  }
}
