import { ValidatorOptions } from "@nestjs/common/interfaces/external/validator-options.interface";
import { registerDecorator, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

export function ConfirmedPassword(property: string, validationsOption?: ValidatorOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationsOption,
            constraints: [property],
            validator: ConfirmedPasswordConstrains,
        })
    };
}

@ValidatorConstraint({ 
    name: "ConfirmedPassword", 
})
export class ConfirmedPasswordConstrains
 implements ValidatorConstraintInterface 
 {
    validate(value: any, args?: ValidationArguments) { 
        const { object, constraints } = args;
        const [property] = constraints;
        const relatedValue = object[property];
        return value === relatedValue; 
     }
    defaultMessage(validationArguments?: ValidationArguments): string {
        return "Sorry Gwat!!!";
    }

}