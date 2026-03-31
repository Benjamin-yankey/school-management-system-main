import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidAge', async: false })
export class IsValidAgeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) return false;
    const dob = new Date(value);
    const today = new Date();
    
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    const [min, max] = args.constraints;
    return age >= min && age <= max;
  }

  defaultMessage(args: ValidationArguments) {
    const [min, max] = args.constraints;
    return `Age must be between ${min} and ${max} years old.`;
  }
}

export function IsValidAge(min: number, max: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [min, max],
      validator: IsValidAgeConstraint,
    });
  };
}
