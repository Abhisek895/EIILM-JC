import { DataTypes, Model } from 'sequelize';
import { Database } from '@config/database';

class Inquiry extends Model {
  public id!: number;
  public tenantId!: number | null;
  public fullName!: string;
  public phone!: string | null;
  public email!: string | null;
  public courseId!: number | null;
  public specializationId!: number | null;
  public city!: string | null;
  public message!: string | null;
  public source!: string | null;
  public status!:
    | 'new'
    | 'contacted'
    | 'interested'
    | 'follow_up'
    | 'converted'
    | 'rejected'
    | 'closed'
    | 'enrolled';
  public assignedTo!: number | null;
  public followupDate!: Date | null;
  public notes!: string | null;
  
  // New application details columns
  public firstName!: string | null;
  public lastName!: string | null;
  public gender!: string | null;
  public bloodGroup!: string | null;
  public caste!: string | null;
  public dob!: string | null;
  public placeOfBirth!: string | null;
  public address!: string | null;
  public state!: string | null;
  public pin!: string | null;
  public altPhone!: string | null;
  public whatsapp!: string | null;
  public fatherName!: string | null;
  public fatherOccupation!: string | null;
  public motherName!: string | null;
  public motherOccupation!: string | null;
  public annualIncome!: string | null;
  public board12th!: string | null;
  public stream12th!: string | null;
  public yearOfPassing12th!: string | null;
  public aggregateMarks12th!: string | null;
  public schoolName!: string | null;
  public mbaCollegeName!: string | null;
  public mbaDegreeName!: string | null;
  public mbaSpecialization!: string | null;
  public mbaGraduationYear!: string | null;
  public mbaUniversity!: string | null;
  public mbaScore!: string | null;
  public sourceName!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

const db = Database.getInstance();

Inquiry.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.BIGINT, allowNull: true, field: 'tenant_id' },
    fullName: { type: DataTypes.STRING(255), allowNull: false, field: 'full_name' },
    phone: { type: DataTypes.STRING(100), allowNull: true },
    email: { type: DataTypes.STRING(255), allowNull: true },
    courseId: { type: DataTypes.BIGINT, allowNull: true, field: 'course_id' },
    specializationId: { type: DataTypes.BIGINT, allowNull: true, field: 'specialization_id' },
    city: { type: DataTypes.STRING(255), allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: true },
    source: { type: DataTypes.STRING(100), allowNull: true },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'interested', 'follow_up', 'converted', 'rejected', 'closed', 'enrolled'),
      defaultValue: 'new',
      allowNull: false,
    },
    assignedTo: { type: DataTypes.BIGINT, allowNull: true, field: 'assigned_to' },
    followupDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'followup_date' },
    notes: { type: DataTypes.TEXT, allowNull: true },

    firstName: { type: DataTypes.STRING(100), allowNull: true, field: 'first_name' },
    lastName: { type: DataTypes.STRING(100), allowNull: true, field: 'last_name' },
    gender: { type: DataTypes.STRING(50), allowNull: true },
    bloodGroup: { type: DataTypes.STRING(20), allowNull: true, field: 'blood_group' },
    caste: { type: DataTypes.STRING(50), allowNull: true },
    dob: { type: DataTypes.STRING(50), allowNull: true }, // Changed from DATEONLY as standard string could be provided
    placeOfBirth: { type: DataTypes.STRING(255), allowNull: true, field: 'place_of_birth' },
    address: { type: DataTypes.TEXT, allowNull: true },
    state: { type: DataTypes.STRING(100), allowNull: true },
    pin: { type: DataTypes.STRING(20), allowNull: true },
    altPhone: { type: DataTypes.STRING(50), allowNull: true, field: 'alt_phone' },
    whatsapp: { type: DataTypes.STRING(50), allowNull: true },
    fatherName: { type: DataTypes.STRING(255), allowNull: true, field: 'father_name' },
    fatherOccupation: { type: DataTypes.STRING(255), allowNull: true, field: 'father_occupation' },
    motherName: { type: DataTypes.STRING(255), allowNull: true, field: 'mother_name' },
    motherOccupation: { type: DataTypes.STRING(255), allowNull: true, field: 'mother_occupation' },
    annualIncome: { type: DataTypes.STRING(100), allowNull: true, field: 'annual_income' },
    board12th: { type: DataTypes.STRING(255), allowNull: true, field: 'board_12th' },
    stream12th: { type: DataTypes.STRING(100), allowNull: true, field: 'stream_12th' },
    yearOfPassing12th: { type: DataTypes.STRING(50), allowNull: true, field: 'year_of_passing_12th' },
    aggregateMarks12th: { type: DataTypes.STRING(50), allowNull: true, field: 'aggregate_marks_12th' },
    schoolName: { type: DataTypes.STRING(255), allowNull: true, field: 'school_name' },
    mbaCollegeName: { type: DataTypes.STRING(255), allowNull: true, field: 'mba_college_name' },
    mbaDegreeName: { type: DataTypes.STRING(255), allowNull: true, field: 'mba_degree_name' },
    mbaSpecialization: { type: DataTypes.STRING(255), allowNull: true, field: 'mba_specialization' },
    mbaGraduationYear: { type: DataTypes.STRING(50), allowNull: true, field: 'mba_graduation_year' },
    mbaUniversity: { type: DataTypes.STRING(255), allowNull: true, field: 'mba_university' },
    mbaScore: { type: DataTypes.STRING(50), allowNull: true, field: 'mba_score' },
    sourceName: { type: DataTypes.STRING(255), allowNull: true, field: 'source_name' },
  },
  {
    sequelize: db,
    tableName: 'inquiries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

export { Inquiry };
