import jwt from 'jsonwebtoken';
export function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) {
        res.status(401).json({ error: 'Yetkilendirme gerekli.' });
        return;
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId;
        next();
    }
    catch {
        res.status(401).json({ error: 'Geçersiz veya süresi dolmuş oturum.' });
    }
}
