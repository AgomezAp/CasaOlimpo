import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 500, // Límite de 100 solicitudes por IP
    message: "Demasiadas solicitudes desde esta IP, por favor inténtelo más tarde.",
    standardHeaders: true, // Devuelve información de límite en los encabezados `RateLimit-*`
    legacyHeaders: false, // Desactiva los encabezados `X-RateLimit-*`
});