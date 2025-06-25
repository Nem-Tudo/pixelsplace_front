import { execSync } from 'child_process';

export default function handler(req, res) {
    try {
        let branch, commit;

        // Verifica se está rodando na Vercel
        if (process.env.VERCEL) {
            // Usa variáveis de ambiente da Vercel
            branch = process.env.VERCEL_GIT_COMMIT_REF || null;
            commit = process.env.VERCEL_GIT_COMMIT_SHA || null;
        } else {
            // Usa comandos git para localhost
            try {
                branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
                commit = execSync('git rev-parse HEAD').toString().trim();
            } catch (gitError) {
                // Fallback se git não estiver disponível
                branch = null;
                commit = null;
            }
        }

        res.status(200).json({
            branch,
            commit: commit.substring(0, 7), // Mostra só os primeiros 7 caracteres do commit
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Error on get git data' });
    }
}
