import { Notice } from '@models/index';
import { BaseRepository } from '@repositories/BaseRepository';
import { Op } from 'sequelize';

export class NoticeRepository extends BaseRepository<Notice> {
  constructor() {
    super(Notice);
  }

  async findPublished(page: number, limit: number) {
    const today = new Date();
    return this.paginate(page, limit, {
      where: {
        status: 'published',
        [Op.or]: [{ expiryDate: null }, { expiryDate: { [Op.gte]: today } }],
      },
      order: [
        ['priority', 'DESC'],
        ['publish_date', 'DESC'],
        ['created_at', 'DESC'],
      ],
    });
  }

  async findAll(page: number, limit: number) {
    return this.paginate(page, limit, {
      order: [['created_at', 'DESC']],
    });
  }
}
