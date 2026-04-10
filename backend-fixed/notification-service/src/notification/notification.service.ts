import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailLog } from './email-log.entity';
import { Notification } from './notification.entity';

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
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly mailerService: MailerService,
  ) {}

  async getHistory(userId: string, page = 1, limit = 20, category?: string, priority?: string, q?: string) {
    const query = this.notificationRepo.createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (category) query.andWhere('n.category = :category', { category });
    if (priority) query.andWhere('n.priority = :priority', { priority });
    if (q) {
      query.andWhere('(n.title ILIKE :q OR n.body ILIKE :q)', { q: `%${q}%` });
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }

  async sendNotification(sender: any, dto: any) {
    const title = dto.title || dto.subject;
    const message = dto.message || dto.body;
    const { category, priority, targetRole, sectionId } = dto;
    const userIds = dto.userIds || dto.studentIds || [];
    const senderRole = sender.role.toLowerCase();
    
    // 1. Authorization & target user resolution
    let finalUserIds: string[] = userIds || [];

    if (targetRole && targetRole !== 'individual') {
      if (senderRole === 'superadmin' || senderRole === 'administration') {
        // Admin/Superadmin can send to broad roles
        let roleFilter = '';
        if (targetRole === 'students') roleFilter = 'student';
        else if (targetRole === 'teachers') roleFilter = 'teacher';
        else if (targetRole === 'parents') roleFilter = 'parent';
        else if (targetRole === 'everyone') roleFilter = '';

        const roleQuery = roleFilter ? `?role=${roleFilter}` : '';
        const url = `http://localhost:3002/administration/users${roleQuery}`;
        try {
          const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${sender.token}` }
          });
          const users: any = await res.json();
          finalUserIds = (Array.isArray(users) ? users : users.data || []).map(u => u.id);
        } catch (e) {
          console.error('Failed to fetch users from user-service:', e);
        }
      } else if (senderRole === 'teacher') {
        if (targetRole === 'students' || targetRole === 'everyone') {
           // Teacher sending to all their students
           const url = `http://localhost:3003/teacher/students`;
           try {
             const res = await fetch(url, {
               headers: { 'Authorization': `Bearer ${sender.token}` } 
             });
             const students: any = await res.json();
             finalUserIds = (Array.isArray(students) ? students : students.data || []).map(s => s.userId).filter(Boolean);
           } catch (e) {
             console.error('Failed to fetch students from school-service:', e);
           }
        } else if (targetRole === 'section' && sectionId) {
           // Teacher sending to a specific section
           const url = `http://localhost:3003/teacher/sections/${sectionId}/students`;
           try {
             const res = await fetch(url, {
               headers: { 'Authorization': `Bearer ${sender.token}` } 
             });
             const students: any = await res.json();
             // These are enrolled student records, they have userId
             finalUserIds = (Array.isArray(students) ? students : students.data || []).map(s => s.userId).filter(Boolean);
           } catch (e) {
             console.error('Failed to fetch section students from school-service:', e);
           }
        }
      } else {
        throw new Error('Unauthorized to send notification to this target group.');
      }
    }

    if (finalUserIds.length === 0) {
      return { success: false, message: 'No target users found.' };
    }

    // 2. Create notification records
    const notifications = finalUserIds.map(uid => 
      this.notificationRepo.create({
        userId: uid,
        title,
        body: message,
        category: category || 'system',
        priority: priority || 'normal',
        read: false,
      })
    );

    await this.notificationRepo.save(notifications);

    return { success: true, count: notifications.length };
  }

  async markRead(id: string) {
    await this.notificationRepo.update(id, { read: true });
  }

  async markAllRead(userId: string) {
    await this.notificationRepo.update({ userId }, { read: true });
  }

  async delete(id: string) {
    await this.notificationRepo.delete(id);
  }

  async clearAll(userId: string) {
    await this.notificationRepo.delete({ userId });
  }

  async getPreferences(userId: string) {
    // Return default preferences for now
    return {
      channels: { inApp: true, email: true, sms: false, push: false },
      categories: {
        system: { inApp: true, email: true },
        academic: { inApp: true, email: true },
        billing: { inApp: true, email: true },
        attendance: { inApp: true, email: true },
        promotion: { inApp: true, email: true },
      },
      digest: { enabled: false, frequency: 'daily', time: '08:00' },
      quiet: { enabled: false, from: '22:00', to: '07:00' },
      minPriority: 'low',
    };
  }

  async updatePreferences(userId: string, prefs: any) {
    return prefs;
  }

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