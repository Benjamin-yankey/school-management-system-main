import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailLog } from './email-log.entity';

export interface EmailEventPayload {
  type: 'welcome' | 'password-reset';
  to: string;
  tempPassword: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(EmailLog)
    private readonly emailLogRepo: Repository<EmailLog>,
    private readonly mailerService: MailerService,
  ) {}

  async handleEmailEvent(data: EmailEventPayload): Promise<void> {
    const { subject, html } = this.buildEmail(data);

    try {
      await this.mailerService.sendMail({ to: data.to, subject, html });
      await this.emailLogRepo.save(
        this.emailLogRepo.create({ to: data.to, subject, status: 'sent' }),
      );
    } catch (err) {
      await this.emailLogRepo.save(
        this.emailLogRepo.create({ to: data.to, subject, status: 'failed', error: err.message }),
      );
      throw err;
    }
  }

  private buildEmail(data: EmailEventPayload): { subject: string; html: string } {
    if (data.type === 'welcome') {
      return {
        subject: 'Welcome — Your Account Has Been Created',
        html: this.template({
          title: 'Welcome aboard!',
          intro: 'Your account has been created. Use the temporary password below to sign in for the first time.',
          label: 'Temporary Password',
          value: data.tempPassword,
          warning: 'You will be required to change this password immediately after your first login.',
          color: '#4F46E5',
        }),
      };
    }
    return {
      subject: 'Your Password Has Been Reset',
      html: this.template({
        title: 'Password Reset',
        intro: 'An administrator has reset your password. Use the temporary password below to sign in.',
        label: 'Temporary Password',
        value: data.tempPassword,
        warning: 'Change your password immediately after logging in.',
        color: '#DC2626',
      }),
    };
  }

  private template(opts: {
    title: string;
    intro: string;
    label: string;
    value: string;
    warning: string;
    color: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:${opts.color};padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                School Management System
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 24px;">
              <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">${opts.title}</h2>
              <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.6;">${opts.intro}</p>

              <!-- Password box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px 24px;">
                    <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                      ${opts.label}
                    </p>
                    <p style="margin:0;color:#111827;font-size:22px;font-weight:700;font-family:'Courier New',monospace;letter-spacing:2px;">
                      ${opts.value}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:4px;padding:14px 16px;">
                    <p style="margin:0;color:#92400e;font-size:14px;line-height:1.5;">
                      ⚠️ &nbsp;${opts.warning}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:13px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}