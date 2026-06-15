import { DataTypes, Model, Optional } from 'sequelize';
import { Database } from '@config/database';

interface MediaLibraryAttributes {
  id: number;
  tenantId: number | null;
  fileName: string;
  fileType: string | null;
  fileUrl: string;
  uploadedBy: number | null;
  module: string | null;
  altText: string | null;
  tags: string | null;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  createdAt?: Date;
}

type MediaLibraryCreationAttributes = Optional<
  MediaLibraryAttributes,
  | 'id'
  | 'tenantId'
  | 'fileType'
  | 'uploadedBy'
  | 'module'
  | 'altText'
  | 'tags'
  | 'fileSize'
  | 'width'
  | 'height'
>;

class MediaLibrary
  extends Model<MediaLibraryAttributes, MediaLibraryCreationAttributes>
  implements MediaLibraryAttributes
{
  public id!: number;
  public tenantId!: number | null;
  public fileName!: string;
  public fileType!: string | null;
  public fileUrl!: string;
  public uploadedBy!: number | null;
  public module!: string | null;
  public altText!: string | null;
  public tags!: string | null;
  public fileSize!: number | null;
  public width!: number | null;
  public height!: number | null;
  public readonly createdAt!: Date;
}

MediaLibrary.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.BIGINT, allowNull: true, field: 'tenant_id' },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name',
    },
    fileType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'file_type',
    },
    fileUrl: {
      type: DataTypes.STRING(512),
      allowNull: false,
      field: 'file_url',
    },
    uploadedBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'uploaded_by',
    },
    module: { type: DataTypes.STRING(100), allowNull: true },
    altText: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'alt_text',
    },
    tags: { type: DataTypes.STRING(255), allowNull: true },
    fileSize: { type: DataTypes.INTEGER, allowNull: true, field: 'file_size' },
    width: { type: DataTypes.INTEGER, allowNull: true },
    height: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize: Database.getInstance(),
    tableName: 'media_library',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
  }
);

export { MediaLibrary };
