import nodemailer from "nodemailer";
import { SystemSettings } from "../models.js";

// Console Logging helper for WhatsApp/Email alerts
const logNotification = (channel: "EMAIL" | "WHATSAPP", recipient: string, subject: string, body: string) => {
  console.log(`\n--- [${channel} NOTIFICATION] ---`);
  console.log(`To: ${recipient}`);
  console.log(`Subject/Event: ${subject}`);
  console.log(`Content:\n${body}`);
  console.log(`---------------------------------\n`);
};

export const sendEmailNotification = async (recipientEmail: string, subject: string, body: string) => {
  try {
    const settings = await SystemSettings.findOne();
    const enabled = settings ? settings.enableEmail : true;
    if (!enabled) {
      console.log(`[Email Service] Disabled by dynamic settings. Blocked email to ${recipientEmail}`);
      return false;
    }

    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT || "587", 10);
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const secure = process.env.EMAIL_SECURE === "true";

    const hasSmtpConfig =
      !!(host && host.trim() !== "" &&
      user && user.trim() !== "" && user.trim().toLowerCase() !== "your_email@gmail.com" &&
      pass && pass.trim() !== "" && pass.trim().toLowerCase() !== "your_app_password");

    if (hasSmtpConfig) {
      console.log(`[Email Service] Attempting to send email to ${recipientEmail} via SMTP (${host})...`);
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });

      const supportEmail = settings?.supportEmail || user || "no-reply@rta.com";
      await transporter.sendMail({
        from: supportEmail,
        to: recipientEmail,
        subject,
        text: body,
      });
      console.log(`[Email Service] Email sent successfully to ${recipientEmail}`);
    } else {
      console.log(`[Email Service] SMTP not fully configured or contains placeholder values. Falling back to console log.`);
      logNotification("EMAIL", recipientEmail, subject, body);
    }
    
    return true;
  } catch (error) {
    console.error("Failed to send email notification:", error);
    return false;
  }
};

export const sendWhatsAppNotification = async (recipientPhone: string, eventName: string, messageBody: string) => {
  try {
    const settings = await SystemSettings.findOne();
    const enabled = settings ? settings.enableWhatsApp : true;
    if (!enabled) {
      console.log(`[WhatsApp Service] Disabled by dynamic settings. Blocked message to ${recipientPhone}`);
      return false;
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

    const hasTwilioConfig =
      !!(accountSid && accountSid.trim() !== "" && accountSid.trim().toLowerCase() !== "your_twilio_account_sid" &&
      authToken && authToken.trim() !== "" && authToken.trim().toLowerCase() !== "your_twilio_auth_token");

    if (hasTwilioConfig) {
      console.log(`[WhatsApp Service] Attempting to send WhatsApp message to ${recipientPhone} via Twilio...`);
      
      let formattedTo = recipientPhone.trim();
      if (!formattedTo.startsWith("whatsapp:")) {
        if (!formattedTo.startsWith("+")) {
          if (formattedTo.length === 10) {
            formattedTo = `+91${formattedTo}`;
          } else {
            formattedTo = `+${formattedTo}`;
          }
        }
        formattedTo = `whatsapp:${formattedTo}`;
      }

      let formattedFrom = from.trim();
      if (!formattedFrom.startsWith("whatsapp:")) {
        formattedFrom = `whatsapp:${formattedFrom}`;
      }

      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

      const params = new URLSearchParams();
      params.append("From", formattedFrom);
      params.append("To", formattedTo);
      params.append("Body", messageBody);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Twilio API responded with status ${response.status}: ${errorText}`);
      }

      console.log(`[WhatsApp Service] WhatsApp message sent successfully to ${recipientPhone}`);
    } else {
      console.log(`[WhatsApp Service] Twilio credentials not configured or contain placeholder values. Falling back to console log.`);
      logNotification("WHATSAPP", recipientPhone, eventName, messageBody);
    }

    return true;
  } catch (error) {
    console.error("Failed to dispatch WhatsApp notification:", error);
    return false;
  }
};

// Formatted email alert templates
export const notifyTeacherRegistered = async (email: string, name: string) => {
  const settings = await SystemSettings.findOne();
  const fee = settings?.registrationFee ?? 149;
  return sendEmailNotification(
    email,
    "Welcome to Raft Tutor Axis!",
    `Hello ${name},\n\nYour registration request has been received successfully. A verification fee of ₹${fee} applies to activate your profile on our teacher networking platform.\n\nOnce paid and verified by our operations manager, your profile will become visible to hundreds of schools and parent inquiries.\n\nBest Regards,\nRTA Operations Team`
  );
};

export const notifyTeacherApproved = async (email: string, name: string, mobile: string) => {
  await sendEmailNotification(
    email,
    "Congratulations! Your RTA Profile is Verified & Approved",
    `Hello ${name},\n\nWe are pleased to inform you that your tutor registration profile has been verified and approved by the Raft Tutor Axis operations department. You are now visible to parents and school recruiters.\n\nBest Regards,\nRTA Management`
  );

  // Send concurrent WhatsApp alert
  await sendWhatsAppNotification(
    mobile,
    "Tutor Profile Approved",
    `Hello ${name}, your Raft Tutor Axis profile has been successfully approved. You are now active on our network!`
  );
};

export const notifyTeacherRejected = async (email: string, name: string, reason: string = "Incomplete/invalid documentation") => {
  return sendEmailNotification(
    email,
    "Registration Status Update - Raft Tutor Axis",
    `Hello ${name},\n\nThank you for your interest in joining Raft Tutor Axis. Unfortunately, your registration could not be approved at this time due to: ${reason}.\n\nPlease review your uploaded documents or contact helpdesk support.\n\nBest Regards,\nRTA Operations Hub`
  );
};

export const notifyParentRegistered = async (email: string, name: string, studentClass: string, mobile: string) => {
  await sendEmailNotification(
    email,
    "We Received Your Home Tuition Request!",
    `Hello ${name},\n\nThank you for reaching out to Raft Tutor Axis. We have received your inquiry for a home tutor for Class ${studentClass}. Our operations team will assign a verified educator within 24 hours.\n\nYou will receive a notification once a teacher is assigned.\n\nBest Regards,\nCoordinator Support`
  );

  // Send WhatsApp alert to Parent
  await sendWhatsAppNotification(
    mobile,
    "Tuition Request Received",
    `Hello ${name}, we have received your inquiry for a home tutor for Class ${studentClass}. Our team is working on matching a verified tutor for you.`
  );
};

export const notifySchoolRegistered = async (email: string, orgName: string) => {
  return sendEmailNotification(
    email,
    "School Account Initialized - Raft Tutor Axis",
    `Hello,\n\nYour institutional registration for "${orgName}" has been successfully logged. You can now post teaching vacancies and view matched pedagogical candidates.\n\nBest Regards,\nPlacement Coordinator Desk`
  );
};

export const notifySchoolVacancyPosted = async (email: string, orgName: string, title: string, subject: string, phone: string) => {
  await sendEmailNotification(
    email,
    "Teaching Vacancy Published Successfully",
    `Hello,\n\nYour teaching vacancy for "${title}" (${subject}) at "${orgName}" has been successfully published on Raft Tutor Axis. Recruiters and qualified tutors will be able to apply.\n\nBest Regards,\nPlacement Desk`
  );

  // Send WhatsApp alert to School Partner
  await sendWhatsAppNotification(
    phone,
    "Vacancy Published",
    `Hello, your teaching vacancy for "${title}" (${subject}) at "${orgName}" has been successfully published on Raft Tutor Axis.`
  );
};

export const notifyForgotPassword = async (email: string, resetToken: string) => {
  return sendEmailNotification(
    email,
    "Reset Your Password - Raft Tutor Axis",
    `Hello,\n\nYou requested a password reset. Please use the following token/link to reset your password. This token expires in 1 hour.\n\nToken: ${resetToken}\n\nIf you did not request this, please ignore this email.`
  );
};

export const notifyTutorAssigned = async (parentEmail: string, parentName: string, parentPhone: string, tutorName: string, tutorPhone: string) => {
  await sendEmailNotification(
    parentEmail,
    "Tutor Assigned to Your Home Tuition Request!",
    `Hello ${parentName},\n\nWe have assigned tutor "${tutorName}" (Phone: ${tutorPhone}) to your request. They will contact you shortly to schedule your 2-day free demo classes.\n\nBest Regards,\nRTA Operations Coordinator`
  );

  // Send WhatsApp alert to Parent
  await sendWhatsAppNotification(
    parentPhone,
    "Tutor Assigned Alert",
    `Hello ${parentName}, tutor "${tutorName}" has been assigned for your child's lessons. Contact: ${tutorPhone}.`
  );

  // Send WhatsApp alert to Tutor
  await sendWhatsAppNotification(
    tutorPhone,
    "New Assignment Alert",
    `Hello ${tutorName}, you have been assigned to parent "${parentName}" (Phone: ${parentPhone}) for home tuition.`
  );
};
