// components/BranchSwitcher.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function BranchSwitcher() {
    const [currentBranch, setCurrentBranch] = useState('main')
    const [availableBranches, setAvailableBranches] = useState(['main'])
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetchCurrentBranch()
    }, [])

    const fetchCurrentBranch = async () => {
        try {
            const response = await fetch('/api/branch/current')
            const data = await response.json()
            setCurrentBranch(data.currentBranch)
            setAvailableBranches(data.availableBranches)
        } catch (error) {
            console.error('Error fetching current branch:', error)
        }
    }

    const switchBranch = async (branchName) => {
        if (branchName === currentBranch) return

        setIsLoading(true)

        try {
            // Opção 1: Usar a rota /changebranch/[branch]
            router.push(`/changebranch/${branchName}`)

            // Opção 2: Usar API diretamente
            /*
            const response = await fetch('/api/branch/current', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ branch: branchName }),
            })
            
            if (response.ok) {
              setCurrentBranch(branchName)
              // Recarrega a página para aplicar o middleware
              window.location.reload()
            }
            */
        } catch (error) {
            console.error('Error switching branch:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="branch-switcher">
            <div className="current-branch">
                <strong>Branch Ativa:</strong> {currentBranch}
                {currentBranch !== 'main' && (
                    <span className="preview-indicator"> (Preview)</span>
                )}
            </div>

            <div className="branch-selector">
                <label htmlFor="branch-select">Trocar Branch:</label>
                <select
                    id="branch-select"
                    value={currentBranch}
                    onChange={(e) => switchBranch(e.target.value)}
                    disabled={isLoading}
                >
                    {availableBranches.map(branch => (
                        <option key={branch} value={branch}>
                            {branch}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading && <div className="loading">Trocando branch...</div>}

            <style jsx>{`
        .branch-switcher {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin: 10px 0;
          background: #f9f9f9;
        }
        .current-branch {
          margin-bottom: 10px;
        }
        .preview-indicator {
          color: #ff6b35;
          font-weight: bold;
        }
        .branch-selector {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .loading {
          margin-top: 10px;
          color: #666;
          font-style: italic;
        }
      `}</style>
        </div>
    )
}