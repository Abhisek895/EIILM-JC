import { BaseRepository } from './BaseRepository';
import { Inquiry } from '@models/index';

export class InquiryRepository extends BaseRepository<Inquiry> {
  constructor() {
    super(Inquiry);
  }
}
