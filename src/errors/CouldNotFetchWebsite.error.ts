export class CouldNotFetchWebsiteError extends Error {
	constructor (message: string) {
		super(message);
		this.name = 'CouldntFetchWebsiteError';
	}
}