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
  [key: string]: any;
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
    const inquiry = await this.inquiryRepo.create({
      ...data,
      status: 'new',
      source: data.source || 'website',
    });

    if (inquiry.email) {
      const { EmailService } = require('@services/EmailService');
      EmailService.sendInquiryConfirmation(inquiry.email, {
        fullName: inquiry.fullName,
        courseInterest: 'our college programs',
      }).catch((e: any) => console.error('Inquiry confirmation email failed:', e));
    }

    return inquiry;
  }

  async listInquiries(page: number, limit: number) {
    const result = await this.inquiryRepo.paginate(page, limit, {
      include: ['course'],
      order: [['id', 'DESC']],
    });

    return {
      ...result,
      data: result.data.map((inq: any) => {
        const plain = typeof inq.toJSON === 'function' ? inq.toJSON() : inq;
        return {
          ...plain,
          courseInterest: plain.course ? (plain.course.courseName || plain.course.course_name) : null,
        };
      }),
    };
  }

  async updateInquiry(id: number, data: UpdateInquiryInput): Promise<void> {
    const existing = await this.inquiryRepo.findById(id);
    await this.inquiryRepo.update(id, data);

    if (data.status && existing && existing.status !== data.status && existing.email) {
      const { EmailService } = require('@services/EmailService');
      EmailService.sendAdmissionConfirmation(existing.email, {
        fullName: existing.fullName,
        courseInterest: 'your requested program',
        status: data.status,
      }).catch((e: any) => console.error('Admission status email failed:', e));
    }
  }
}
