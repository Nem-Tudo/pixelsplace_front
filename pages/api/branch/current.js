// pages/api/branch/current.js (ou app/api/branch/current/route.js se usando App Router)

// Para Pages Router:
export default function handler(req, res) {
    if (req.method === 'GET') {
        const activeBranch = req.cookies['active-branch'] || 'main'

        res.status(200).json({
            currentBranch: activeBranch,
            availableBranches: process.env.AVAILABLE_BRANCHES?.split(',') || ['main', 'with-fun-colors']
        })
    } else if (req.method === 'POST') {
        const { branch } = req.body

        if (!branch) {
            return res.status(400).json({ error: 'Branch name is required' })
        }

        // Define o cookie
        res.setHeader('Set-Cookie', `active-branch=${branch}; Path=/; Max-Age=${60 * 60 * 24 * 30}; HttpOnly=false; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''} SameSite=Lax`)

        res.status(200).json({
            message: 'Branch changed successfully',
            newBranch: branch
        })
    } else {
        res.status(405).json({ error: 'Method not allowed' })
    }
}