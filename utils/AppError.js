class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Marks the error as a known operational error
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
