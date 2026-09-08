export class ApiError extends Error { constructor(status, message, code = 'REQUEST_ERROR') { super(message); this.status = status; this.code = code } }
export const required = (value, name) => { if (value == null || value === '') throw new ApiError(400, `${name} is required`, 'VALIDATION_ERROR'); return value }
export const boundedText = (value, name, max = 2000) => { required(value, name); if (typeof value !== 'string' || value.trim().length > max) throw new ApiError(400, `Invalid ${name}`, 'VALIDATION_ERROR'); return value.trim() }
