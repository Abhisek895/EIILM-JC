import { PageSection } from '@models/index';
import { PageSectionRepository } from '../repository/PageSectionRepository';

export class PageSectionService {
  private repo: PageSectionRepository;

  constructor() {
    this.repo = new PageSectionRepository();
  }

  async getSectionsForPage(pageKey: string): Promise<PageSection[]> {
    return this.repo.findByPage(pageKey);
  }

  async listAll(page: number, limit: number) {
    return this.repo.findAllPaginated(page, limit);
  }

  async upsert(
    pageKey: string,
    sectionKey: string,
    config: object,
    sortOrder?: number
  ): Promise<PageSection> {
    return this.repo.upsertSection(pageKey, sectionKey, config, sortOrder);
  }

  async update(id: number, data: { config?: object; sortOrder?: number; status?: 'active' | 'inactive' }): Promise<void> {
    await this.repo.update(id, data as Record<string, unknown>);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
