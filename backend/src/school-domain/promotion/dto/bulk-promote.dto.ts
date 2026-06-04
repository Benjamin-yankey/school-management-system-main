import { IsUUID } from 'class-validator';

export class BulkPromoteDto {
  @IsUUID()
  classLevelId: string;

  @IsUUID()
  fromAcademicYearId: string;

  @IsUUID()
  toAcademicYearId: string;
}
