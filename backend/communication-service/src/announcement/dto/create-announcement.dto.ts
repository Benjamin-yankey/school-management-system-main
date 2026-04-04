import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';

export type AnnouncementAudience = 'all' | 'teachers' | 'students' | 'parents' | 'administration';

export class CreateAnnouncementDto {
  @IsUUID()
  @IsNotEmpty()
  schoolId: string;

  @IsString()
  @IsNotEmpty()
  title: string;


  @IsString()
  @IsNotEmpty()
  body: string;

  @IsEnum(['all', 'teachers', 'students', 'parents', 'administration'])
  @IsOptional()
  audience?: AnnouncementAudience = 'all';

  @IsBoolean()
  @IsOptional()
  pinned?: boolean = false;
}
