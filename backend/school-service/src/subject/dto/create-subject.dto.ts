import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateSubjectDto {
    @IsString()
    @MinLength(2)
    name: string;

    @IsUUID()
    classLevelId: string;
}