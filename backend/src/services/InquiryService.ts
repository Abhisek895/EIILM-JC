import { InquiryRepository } from '@repositories/InquiryRepository';
import { Inquiry } from '@models/Inquiry';

type CreateInquiryInput = {
  fullName: string;
  phone?: string;
  email?: string;
  courseId?: number;
  specializationId?: number;
  city?: string;
  message?: string;
  source?: string;
};

type UpdateInquiryInput = {
  status?:
    | 'new'
    | 'contacted'
    | 'interested'
    | 'follow_up'
    | 'converted'
    | 'rejected'
    | 'closed';
  assignedTo?: number;
  followupDate?: string;
  notes?: string;
};

export class InquiryService {
  private inquiryRepo: InquiryRepository;

  constructor() {
    this.inquiryRepo = new InquiryRepository();
  }

  async createInquiry(data: CreateInquiryInput): Promise<Inquiry> {
    return this.inquiryRepo.create({
      ...data,
      status: 'new',
      source: data.source || 'website',
    });
  }

  async listInquiries(page: number, limit: number) {
    return this.inquiryRepo.paginate(page, limit, {
      order: [['id', 'DESC']],
    });
  }

  async updateInquiry(id: number, data: UpdateInquiryInput): Promise<void> {
    await this.inquiryRepo.update(id, data);
  }
}
