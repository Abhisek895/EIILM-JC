import { PageSection } from '@models/index';
import { BaseRepository } from '@repositories/BaseRepository';

export class PageSectionRepository extends BaseRepository<PageSection> {
  constructor() {
    super(PageSection);
  }

  async findByPage(pageKey: string): Promise<PageSection[]> {
    return this.model.findAll({
      where: { pageKey, status: 'active' },
      order: [['sortOrder', 'ASC']],
    });
  }

  async findAllPaginated(page: number, limit: number) {
    return this.paginate(page, limit, { order: [['pageKey', 'ASC'], ['sortOrder', 'ASC']] });
  }

  async upsertSection(
    pageKey: string,
    sectionKey: string,
    config: object,
    sortOrder?: number
  ): Promise<PageSection> {
    const [section] = await (this.model as typeof PageSection).findOrCreate({
      where: { pageKey, sectionKey },
      defaults: { pageKey, sectionKey, config, sortOrder: sortOrder ?? 0, status: 'active', tenantId: null },
    });

    section.config = config;
    if (sortOrder !== undefined) section.sortOrder = sortOrder;
    await section.save();

    return section;
  }
}
