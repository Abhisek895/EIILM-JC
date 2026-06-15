import { Event } from '@models/index';
import { BaseRepository } from '@repositories/BaseRepository';

export class EventRepository extends BaseRepository<Event> {
  constructor() {
    super(Event);
  }

  async findPublished(page: number, limit: number) {
    return this.paginate(page, limit, {
      where: { status: 'published' },
      order: [['start_date', 'ASC']],
    });
  }

  async findAllPaginated(page: number, limit: number) {
    return this.paginate(page, limit, { order: [['created_at', 'DESC']] });
  }
}
