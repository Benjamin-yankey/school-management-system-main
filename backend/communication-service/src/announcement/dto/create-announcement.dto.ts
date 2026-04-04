import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export type AnnouncementAudience = 'all' | 'teachers' | 'students' | 'parents' | 'administration';

export class CreateAnnouncementDto {
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
