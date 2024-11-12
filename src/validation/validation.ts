import {
	ClassConstructor,
	plainToClassFromExist,
	plainToInstance,
} from 'class-transformer';
import {
	ValidationError,
	ValidatorOptions,
	validate,
} from 'class-validator';
import { ValidationException } from './validation-exception';

export const validationPipeOptions: ValidatorOptions = {
	whitelist: true,
	validationError: {
		target: false,
		value: false,
	},
	forbidNonWhitelisted: true,
	forbidUnknownValues: true,
	skipMissingProperties: true
};

/**
 * Validates a DTO which are decorated with class-validator
 * Transforms a object to a class instance of the DTO
 * @param {Y} dto The object you want to validate
 * @param {ClassConstructor<T>} klass The class you want to use for the validation
 * @param {ValidatorOptions} options The options that you want to override
 */
export async function validateAndConvertDTO<Y extends object, T extends object>(
	dto: Y,
	klass: ClassConstructor<T> | T,
	options?: ValidatorOptions
): Promise<T> {
	// test if 'klass' is a class or an instance of that class
	const validationInstance = Object.prototype.hasOwnProperty.call(
		klass,
		'prototype'
	)
		? plainToInstance<T, Y>(klass as ClassConstructor<T>, dto)
		: plainToClassFromExist(klass as T, dto, {
			excludePrefixes: ['_'],
		});

	const validationErrors: ValidationError[] = await validate(validationInstance, {
		...validationPipeOptions,
		...options,
	});

	if (validationErrors?.length) {
		throw new ValidationException(validationErrors);
	}

	return validationInstance;
}
