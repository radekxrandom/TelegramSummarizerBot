export class CouldNotGenerateCompletionError extends Error {
	constructor (message: string) {
		super(message);
		this.name = 'CouldNotGenerateCompletionError';
	}
}
