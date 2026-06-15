import { Event } from '@models/index';
import { EventRepository } from '../repository/EventRepository';

export interface CreateEventInput {
  title: string;
  description?: string;
  banner?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  registrationLink?: string;
  status?: 'draft' | 'published' | 'completed';
}

export class EventService {
  private repo: EventRepository;
  constructor() { this.repo = new EventRepository(); }

  async listPublished(page: number, limit: number) {
    return this.repo.findPublished(page, limit);
  }
  async listAll(page: number, limit: number) {
    return this.repo.findAllPaginated(page, limit);
  }
  async getById(id: number): Promise<Event | null> {
    return this.repo.findById(id);
  }
  async create(data: CreateEventInput): Promise<Event> {
    return this.repo.create({
      title: data.title,
      description: data.description || null,
      banner: data.banner || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      location: data.location || null,
      registrationLink: data.registrationLink || null,
      status: data.status || 'draft',
      tenantId: null,
    });
  }
  async update(id: number, data: Partial<CreateEventInput>): Promise<void> {
    await this.repo.update(id, data as Record<string, unknown>);
  }
  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
