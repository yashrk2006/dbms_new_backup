import { Resend } from 'resend';
import { ApplicationReceivedEmail } from '@/components/emails/ApplicationReceived';
import { StatusUpdateEmail } from '@/components/emails/StatusUpdateEmail';
import * as React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Global Notification Service for SkillSync.
 * Handles email delivery via Resend with professional React templates.
 */
export const NotificationService = {
  /**
   * Send a professional email notification.
   */
  async sendEmail({
    to,
    subject,
    react,
  }: {
    to: string | string[];
    subject: string;
    react: React.ReactNode;
  }) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY is missing. Notification skipped:', { to, subject });
      return { success: false, error: 'Missing API Key' };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'SkillSync <onboarding@resend.dev>', // Verified domain required for production
        to,
        subject,
        react: react as any,
      });

      if (error) {
        console.error('❌ Resend Error:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('❌ Notification service crash:', error);
      return { success: false, error };
    }
  },

  /**
   * Notify student that their application was successfully received.
   */
  async notifyApplicationReceived(studentEmail: string, studentName: string, internshipTitle: string) {
    return this.sendEmail({
      to: studentEmail,
      subject: `Application Received: ${internshipTitle}`,
      react: <ApplicationReceivedEmail studentName={studentName} internshipTitle={internshipTitle} />,
    });
  },

  /**
   * Notify company about a high-potential new applicant.
   */
  async notifyCompanyNewApplicant(companyEmail: string, studentName: string, internshipTitle: string) {
    // We can reuse a generic template or create a specific one for recruiters
    return this.sendEmail({
      to: companyEmail,
      subject: `New Candidate: ${studentName} applied for ${internshipTitle}`,
      react: (
        <div>
          <h3>New Application for {internshipTitle}</h3>
          <p>Candidate <strong>{studentName}</strong> has just applied. Visit your portal to view their AI Match Score and profile details.</p>
        </div>
      ),
    });
  },

  /**
   * Notify student of a progression in their application journey.
   */
  async notifyStatusUpdate(studentEmail: string, studentName: string, internshipTitle: string, newStatus: string) {
    return this.sendEmail({
      to: studentEmail,
      subject: `SkillSync: Status update for ${internshipTitle}`,
      react: <StatusUpdateEmail studentName={studentName} internshipTitle={internshipTitle} newStatus={newStatus} />,
    });
  }
};

