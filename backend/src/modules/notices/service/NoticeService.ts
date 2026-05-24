import { Notice } from '@models/index';
import { NoticeRepository } from '../repository/NoticeRepository';

export interface CreateNoticeInput {
  title: string;
  description?: string;
  pdfUrl?: string;
  publishDate?: string;
  expiryDate?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'draft' | 'published' | 'expired';
  sendToStudents?: 'yes' | 'no';
  sendToFaculty?: 'yes' | 'no';
}

export class NoticeService {
  private repo: NoticeRepository;

  constructor() {
    this.repo = new NoticeRepository();
  }

  async listPublished(page: number, limit: number) {
    return this.repo.findPublished(page, limit);
  }

  async listAll(page: number, limit: number) {
    return this.repo.findAll(page, limit);
  }

  async getById(id: number): Promise<Notice | null> {
    return this.repo.findById(id);
  }

  async create(data: CreateNoticeInput): Promise<Notice> {
    const notice = await this.repo.create({
      title: data.title,
      description: data.description || null,
      pdfUrl: data.pdfUrl || null,
      publishDate: data.publishDate ? new Date(data.publishDate) : null,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      priority: data.priority || 'medium',
      status: data.status || 'draft',
      tenantId: null,
    });

    if (notice.status === 'published') {
      const sendToStudents = data.sendToStudents !== 'no';
      const sendToFaculty = data.sendToFaculty !== 'no';
      this.broadcastNotice(notice, sendToStudents, sendToFaculty).catch((e) => console.error('Broadcast failed:', e));
    }

    return notice;
  }

  async update(id: number, data: Partial<CreateNoticeInput> & { sendToStudents?: 'yes' | 'no'; sendToFaculty?: 'yes' | 'no' }): Promise<void> {
    const existing = await this.repo.findById(id);
    await this.repo.update(id, data as Record<string, unknown>);

    if (data.status === 'published' && (!existing || existing.status !== 'published')) {
      const updated = await this.repo.findById(id);
      if (updated) {
        const sendToStudents = data.sendToStudents !== 'no';
        const sendToFaculty = data.sendToFaculty !== 'no';
        this.broadcastNotice(updated, sendToStudents, sendToFaculty).catch((e) => console.error('Broadcast failed:', e));
      }
    }
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  private async broadcastNotice(notice: Notice, sendToStudents: boolean = true, sendToFaculty: boolean = true): Promise<void> {
    try {
      const { User, Role } = require('@models/index');
      const { EmailService } = require('@services/EmailService');
      
      const rolesToQuery: string[] = [];
      if (sendToStudents) rolesToQuery.push('student');
      if (sendToFaculty) rolesToQuery.push('faculty');

      if (rolesToQuery.length === 0) {
        console.log('[BROADCAST] Skipping notice broadcast: no recipient groups selected.');
        return;
      }

      const users = await User.findAll({
        include: [{
          model: Role,
          as: 'role',
          where: {
            name: rolesToQuery
          }
        }],
        where: {
          status: 'active'
        }
      });

      console.log(`[BROADCAST] Broadcasting published notice to ${users.length} active members (Students: ${sendToStudents}, Faculty: ${sendToFaculty})...`);

      for (const user of users) {
        if (user.email) {
          await EmailService.sendNoticeNotification(user.email, {
            title: notice.title,
            description: notice.description || '',
            pdfUrl: notice.pdfUrl,
          });
        }
      }
    } catch (error) {
      console.error('Failed to broadcast notice:', error);
    }
  }
}
