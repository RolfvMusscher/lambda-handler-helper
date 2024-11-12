import { ValidationError } from 'class-validator';

/**
 * The exception that is thrown when there are validation erorrs
 */
export class ValidationException extends Error {
	/**
   * @param {ValidationError[]} validationErrors The errors that were thrown during validation
   */
	constructor(public validationErrors: ValidationError[]) {
		console.log(JSON.stringify(validationErrors));
		super(
			`There were ${validationErrors.length} error(s) on field(s): ${JSON.stringify(
				validationErrors.map((v: ValidationError) => v.property)
			)}`
		);
	}
}
