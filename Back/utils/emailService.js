import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Note: On pourra injecter le logo depuis le modèle Branding plus tard
export const sendSignatureRequestEmail = async (to, documentName, signUrl, customMessage, orgName = "Kernain") => {
  const html = `
    <div style="font-family: sans-serif; color: #1F2937; max-width: 600px; margin: auto; border: 1px solid #E5E7EB; padding: 40px; border-radius: 12px;">
      <h1 style="font-size: 22px; font-weight: 700;">Demande de signature électronique</h1>
      <p style="font-size: 16px; color: #4B5563; line-height: 1.6;"><strong>${orgName}</strong> vous invite à signer le document suivant : <strong>${documentName}</strong>.</p>
      
      <div style="background-color: #F9FAFB; border-left: 4px solid #4F46E5; padding: 15px; margin: 25px 0;">
        <p style="font-size: 14px; font-style: italic; color: #374151; margin: 0;">"${customMessage.replace(/\n/g, '<br>')}"</p>
      </div>

      <div style="margin: 35px 0; text-align: center;">
        <a href="${signUrl}" style="background-color: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Réviser et signer</a>
      </div>
      
      <p style="font-size: 12px; color: #9CA3AF; text-align: center;">Sécurisé par <strong>Kernain</strong> - Signature électronique conforme eIDAS</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${orgName} via Kernain" <noreply@kernain.com>`, // À adapter selon ton domaine
    to,
    subject: `Signature requise : ${documentName}`,
    html
  });
};

export const sendSignedDocumentEmail = async (to, documentName, pdfBase64, orgName = "Kernain") => {
  const html = `
    <div style="font-family: sans-serif; color: #1F2937; max-width: 600px; margin: auto; border: 1px solid #E5E7EB; padding: 40px; border-radius: 12px;">
      <h1 style="font-size: 22px; font-weight: 700;">Document complété</h1>
      <p style="font-size: 16px; color: #4B5563; line-height: 1.6;">La procédure de signature est terminée. Vous trouverez ci-joint la version finale et sécurisée de : <strong>${documentName}</strong>.</p>
      <p style="font-size: 14px; color: #6B7280; margin-top: 20px;">Ce document est désormais archivé de manière sécurisée.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Kernain" <noreply@kernain.com>`,
    to,
    subject: `Terminé : ${documentName}`,
    html,
    attachments: [
      {
        filename: `${documentName.replace(/\s+/g, '_')}_Final.pdf`,
        content: pdfBase64.split("base64,")[1],
        encoding: 'base64'
      }
    ]
  });
};