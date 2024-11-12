import 'reflect-metadata';
import { validateAndConvertDTO } from '../../src/validation/validation';
import { IsDefined, IsInt, IsString } from 'class-validator';
import { plainToInstance } from 'class-transformer';

class TestDTO {
	@IsDefined()
	@IsString()
		name?: string;

	@IsDefined()
	@IsInt()
		age?: number;
}

describe('validateAndConvertDTO', () => {
	it('should validate and convert a valid DTO', async () => {
		const dto = { name: 'John', age: 30 };
		const result = await validateAndConvertDTO(dto, TestDTO);
		expect(result).toBeInstanceOf(TestDTO);
		expect(result.name).toBe('John');
		expect(result.age).toBe(30);
	});

	it('should throw ValidationException for an invalid DTO', async () => {
		const dto = { name: 'John', age: 'thirty' }; // age should be a number
		await expect(validateAndConvertDTO(dto, TestDTO)).rejects.toThrow(Error);
	});

	it('should validate and convert a valid instance', async () => {
		const instance = plainToInstance(TestDTO, { name: 'John', age: 30 });
		const result = await validateAndConvertDTO(instance, instance);
		expect(result).toBeInstanceOf(TestDTO);
		expect(result.name).toBe('John');
		expect(result.age).toBe(30);
	});

	it('should throw ValidationException for an invalid instance', async () => {
		const instance = plainToInstance(TestDTO, { name: 'John', age: 'thirty' }); // age should be a number
		await expect(validateAndConvertDTO(instance, instance)).rejects.toThrow(Error);
	});

	it('should override default validation options', async () => {
		const dto = { name: 'John', age: 30, extra: 'extra' }; // extra should be forbidden
		await expect(validateAndConvertDTO(dto, TestDTO, { forbidNonWhitelisted: false })).resolves.not.toThrow();
	});
});