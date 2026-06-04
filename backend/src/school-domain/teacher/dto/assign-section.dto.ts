import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignSectionDto {
  @IsUUID()
  @IsNotEmpty()
  sectionId: string;
}
