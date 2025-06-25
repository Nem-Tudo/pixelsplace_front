import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import settings from '@/settings'
import Cookies from 'js-cookie'

export default function BuildSwitcher() {
    const [currentBuild, setCurrentBuild] = useState({ name: "main", id: "main", token: null });
    const [currentBranch, setCurrentBranch] = useState(null);
    const [availableBuilds, setAvailableBuilds] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    // const router = useRouter()

    useEffect(() => {
        fetchAvailableBuilds()
        fetchCurrentBuild();
        fetchCurrentGitBranch();
    }, [])

    const fetchAvailableBuilds = async () => {
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
                return alert(`Erro ao buscar builds: ${response.message || 'Erro desconhecido'}`);
            }
            setAvailableBuilds(response);
        } catch (error) {
            console.error('Error fetching current build:', error)
        }
    }

    const fetchCurrentBuild = async () => {
        const buildtoken = Cookies.get("active-build-token");
        if (!buildtoken || buildtoken === 'main') {
            setCurrentBuild({ name: "main", id: "main", token: null });
            return;
        }
        try {
            const request = await fetch(`${settings.apiURL}/builds/parsetoken/${buildtoken}`, {
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
            setCurrentBuild(response.build);
        } catch (error) {
            console.error('Error fetching current build:', error)
        }
    }

    const switchBuild = async (buildId) => {
        if (buildId === currentBuild.id) return

        setIsLoading(true)

        try {

            if (buildId === "main" || !buildId) {
                return location.href = `/buildoverride?t=main`;
            }

            const build = availableBuilds.find(build => build.id === buildId)
            if (!build) return alert('Build não encontrada');

            location.href = `/buildoverride?t=${build.token}`;

        } catch (error) {
            console.error('Error switching build:', error)
            alert(`Erro ao trocar de build: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchCurrentGitBranch = async () => {
        try {
            const request = await fetch('/api/git-branch', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const response = await request.json();
            if (!request.ok) {
                console.log(response, request);
                return alert(`Erro ao buscar branch atual: ${response.error || 'Erro desconhecido'}`);
            }

            setCurrentBranch(response.branch);

        } catch (error) {
            console.error('Error fetching current git branch:', error)
            return null;
        }
    }

    return (
        <div className="build-switcher">
            {currentBuild.id !== "main" && (
                <span className="preview-indicator"> (Build Override)</span>
            )}
            <div className="current-build">
                {currentBranch && currentBranch != "main" && currentBuild.id === "main" && <><span style={{ color: "red" }}>Você está editando uma branch customizada</span><br /><br/></>}
                <strong>Build Ativa:</strong> {currentBuild.name}
                <br />
                <strong>Branch Ativa:</strong> {currentBranch}
            </div>

            <div className="build-selector">
                <select
                    id="build-select"
                    value={currentBuild.id}
                    onChange={(e) => switchBuild(e.target.value)}
                    disabled={isLoading}
                >
                    <option value={"main"}>main</option>
                    {availableBuilds.map((build, index) => (
                        <option key={index} value={build.id}>
                            {build.name}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading && <div className="loading">Trocando build...</div>}

            <style jsx>{`
        .build-switcher {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin: 10px 0;
          background: #f9f9f9;
          width: fit-content;
          color: black;
          margin: 0 auto;
        }
        .current-build {
          margin-bottom: 10px;
        }
        .preview-indicator {
          color: #ff6b35;
          font-weight: bold;
        }
        .build-selector {
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