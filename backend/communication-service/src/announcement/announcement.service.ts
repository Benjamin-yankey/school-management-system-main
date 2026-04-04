import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

// Roles that can post announcements
const ANNOUNCEMENT_ROLES = ['superadmin', 'administration', 'teacher'];

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
  ) {}

  async create(
    dto: CreateAnnouncementDto,
    author: { id: string; role: string; schoolId: string },
  ): Promise<Announcement> {
    if (!ANNOUNCEMENT_ROLES.includes(author.role)) {
      throw new ForbiddenException('You do not have permission to post announcements.');
    }

    const announcement = this.announcementRepo.create({
      ...dto,
      authorId: author.id,
      authorRole: author.role,
      schoolId: author.schoolId,
    });

    return this.announcementRepo.save(announcement);
  }

  async findForUser(user: {
    role: string;
    schoolId: string;
  }): Promise<Announcement[]> {
    // Map role to which audiences they should see
    const audienceFilter = this.getAudiencesForRole(user.role);

    return this.announcementRepo
      .createQueryBuilder('a')
      .where('a.schoolId = :schoolId', { schoolId: user.schoolId })
      .andWhere('a.audience IN (:...audiences)', { audiences: audienceFilter })
      .orderBy('a.pinned', 'DESC')
      .addOrderBy('a.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, schoolId: string): Promise<Announcement> {
    const announcement = await this.announcementRepo.findOne({
      where: { id, schoolId },
    });
    if (!announcement) throw new NotFoundException('Announcement not found.');
    return announcement;
  }

  async delete(
    id: string,
    user: { id: string; role: string; schoolId: string },
  ): Promise<void> {
    const announcement = await this.findOne(id, user.schoolId);

    // Author can delete their own; superadmin/administration can delete any
    const canDelete =
      announcement.authorId === user.id ||
      ['superadmin', 'administration'].includes(user.role);

    if (!canDelete) {
      throw new ForbiddenException('You can only delete your own announcements.');
    }

    await this.announcementRepo.delete(id);
  }

  private getAudiencesForRole(role: string): string[] {
    // Everyone always sees 'all'
    const base = ['all'];
    const roleMap: Record<string, string[]> = {
      administration: [...base, 'administration', 'teachers', 'students', 'parents'],
      superadmin:     [...base, 'administration', 'teachers', 'students', 'parents'],
      teacher:        [...base, 'teachers'],
      student:        [...base, 'students'],
      parent:         [...base, 'parents'],
    };
    return roleMap[role] ?? base;
  }
}
