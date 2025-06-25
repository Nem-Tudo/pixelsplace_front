import { execSync } from 'child_process';

export default function handler(req, res) {
    try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        res.status(200).json({ branch });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao obter branch' });
    }
}
