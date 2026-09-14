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
    let section = await this.model.findOne({
      where: { pageKey, sectionKey },
    });

    if (section) {
      section.config = config;
      section.changed('config', true);
      if (sortOrder !== undefined) section.sortOrder = sortOrder;
      await section.save();
    } else {
      section = await this.model.create({
        pageKey,
        sectionKey,
        config,
        sortOrder: sortOrder ?? 0,
        status: 'active',
        tenantId: null,
      } as any);
    }

    return section;
  }
}
