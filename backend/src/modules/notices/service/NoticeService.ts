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
    return this.repo.create({
      title: data.title,
      description: data.description || null,
      pdfUrl: data.pdfUrl || null,
      publishDate: data.publishDate ? new Date(data.publishDate) : null,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      priority: data.priority || 'medium',
      status: data.status || 'draft',
      tenantId: null,
    });
  }

  async update(id: number, data: Partial<CreateNoticeInput>): Promise<void> {
    await this.repo.update(id, data as Record<string, unknown>);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
