import jwt from "jsonwebtoken";

const maxSessionAgeSeconds = 7 * 24 * 60 * 60;

function readSession(req) {
    const secret = process.env.AUTH_JWT_SECRET;
    const token = req.cookies?.friendgpt_session;
    if (!secret || !token) return null;

    try {
        const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
        const nowSeconds = Math.floor(Date.now() / 1000);
        if (
            typeof payload === "string" ||
            !/^[a-f\d]{24}$/i.test(payload.sub || "") ||
            !Number.isFinite(payload.iat) ||
            !Number.isFinite(payload.exp) ||
            payload.iat > nowSeconds + 60 ||
            payload.exp <= payload.iat ||
            payload.exp - payload.iat > maxSessionAgeSeconds
        ) {
            return null;
        }
        return { userId: payload.sub };
    } catch {
        return null;
    }
}

export default function requireAuth(req, res, next) {
    if (!process.env.AUTH_JWT_SECRET) {
        return res.status(503).json({ error: "Authentication is not configured on the server" });
    }
    const token = req.cookies?.friendgpt_session;
    if (!token) return res.status(401).json({ error: "Authentication required" });
    const session = readSession(req);
    if (!session) return res.status(401).json({ error: "Session expired or invalid" });
    req.user = session;
    return next();
}

export function optionalAuth(req, _res, next) {
    req.user = readSession(req);
    return next();
}
