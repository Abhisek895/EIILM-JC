import { BaseRepository } from './BaseRepository';
import { Inquiry } from '@models/Inquiry';

export class InquiryRepository extends BaseRepository<Inquiry> {
  constructor() {
    super(Inquiry);
  }
}
