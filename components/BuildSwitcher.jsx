// components/BranchSwitcher.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import settings from '@/settings'
import Cookies from 'js-cookie'

export default function BuildSwitcher() {
    const [currentBranch, setCurrentBranch] = useState({ name: "main", id: "main", token: null });
    const [availableBranches, setAvailableBranches] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    // const router = useRouter()

    useEffect(() => {
        fetchAvailableBranches()
        fetchCurrentBranch();
    }, [])

    const fetchAvailableBranches = async () => {
        try {
            const request = await fetch(`${settings.apiURL}/builds`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: Cookies.get("authorization")
                },
            })
            const response = await request.json();
            if (!request.ok) {
                console.log(response, request);
                return alert(`Erro ao buscar branches: ${response.message || 'Erro desconhecido'}`);
            }
            setAvailableBranches(response);
        } catch (error) {
            console.error('Error fetching current branch:', error)
        }
    }

    const fetchCurrentBranch = async () => {
        const branchtoken = Cookies.get("active-build-token");
        if (!branchtoken || branchtoken === 'main') {
            setCurrentBranch({ name: "main", id: "main", token: null });
            return;
        }
        try {
            const request = await fetch(`${settings.apiURL}/builds/parsetoken/${branchtoken}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: Cookies.get("authorization")
                },
            })
            const response = await request.json();
            if (!request.ok) {
                console.log(response, request);
                alert(`Você está utilizando uma build inválida, retornando para a build principal.`);
                location.href = `/buildoverride?t=main`;
                return
            }
            setCurrentBranch(response.build);
        } catch (error) {
            console.error('Error fetching current branch:', error)
        }
    }

    const switchBranch = async (branchId) => {
        if (branchId === currentBranch.id) return

        setIsLoading(true)

        try {

            if (branchId === "main" || !branchId) {
                return location.href = `/buildoverride?t=main`;
            }

            const build = availableBranches.find(branch => branch.id === branchId)
            if (!build) return alert('Branch não encontrada');

            location.href = `/buildoverride?t=${build.token}`;

        } catch (error) {
            console.error('Error switching branch:', error)
            alert(`Erro ao trocar de branch: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="branch-switcher">
            <div className="current-branch">
                <strong>Build Ativa:</strong> {currentBranch.name}
                {currentBranch.id !== "main" && (
                    <span className="preview-indicator"> (Build Override)</span>
                )}
            </div>

            <div className="branch-selector">
                <label htmlFor="branch-select">Trocar Build:</label>
                <select
                    id="branch-select"
                    value={currentBranch.id}
                    onChange={(e) => switchBranch(e.target.value)}
                    disabled={isLoading}
                >
                    <option value={"main"}>main</option>
                    {availableBranches.map((branch, index) => (
                        <option key={index} value={branch.id}>
                            {branch.name}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading && <div className="loading">Trocando build...</div>}

            <style jsx>{`
        .branch-switcher {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin: 10px 0;
          background: #f9f9f9;
          width: fit-content;
          color: black;
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