export class AssignStudentSectionDto {
  classLevelId: string;
  academicYearId: string;
  sectionId?: string;
  isRepeating?: boolean;

  // Optional profile details for lazy creation/unified form
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  areaOfInterest?: string;
  phoneNumber?: string;
}
