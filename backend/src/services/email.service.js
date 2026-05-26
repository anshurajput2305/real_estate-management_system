import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const createTransport = () => {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null;
  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass }
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransport();
  if (!transporter) {
    console.log(`[mail disabled] ${subject} -> ${to}`);
    return;
  }
  await transporter.sendMail({ from: env.smtp.from, to, subject, html });
};
