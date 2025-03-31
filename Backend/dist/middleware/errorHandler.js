"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error("Error capturado:", err);
    const statusCode = err.status || 500;
    res.status(statusCode).json(Object.assign({ message: err.message || "Ocurrió un error interno en el servidor." }, (process.env.NODE_ENV === "development" && { stack: err.stack })));
};
exports.errorHandler = errorHandler;
