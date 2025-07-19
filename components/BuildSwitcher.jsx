import { useState, useEffect } from 'react'
import settings from '@/settings'
import Cookies from 'js-cookie'
import { useLanguage } from '@/context/LanguageContext';

/**
 * Elemento principal para a seleção e troca de Builds
 */
export default function BuildSwitcher() {
    const { language } = useLanguage();

    const [currentBuild, setCurrentBuild] = useState({ name: "main", id: "main", token: null });
    const [currentBranch, setCurrentBranch] = useState(null);
    const [availableBuilds, setAvailableBuilds] = useState([])
    const [isLoading, setIsLoading] = useState(false)

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
                return alert(`${language.getString("COMPONENTS.BUILD_SWITCHER.ERROR_FETCH_BUILDS")}: ${response.message || language.getString("COMPONENTS.BUILD_SWITCHER.UNKNOWN_ERROR")}`);
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
                alert(language.getString("COMPONENTS.BUILD_SWITCHER.INVALID_BUILD_MESSAGE"));
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
            if (!build) return alert(language.getString("COMPONENTS.BUILD_SWITCHER.BUILD_NOT_FOUND"));

            location.href = `/buildoverride?t=${build.token}`;

        } catch (error) {
            console.error('Error switching build:', error)
            alert(`${language.getString("COMPONENTS.BUILD_SWITCHER.ERROR_SWITCH_BUILD")}: ${error.message}`)
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
                return console.log(`${language.getString("COMPONENTS.BUILD_SWITCHER.ERROR_FETCH_BRANCH")}: ${response.error || language.getString("COMPONENTS.BUILD_SWITCHER.UNKNOWN_ERROR")}`);
            }

            setCurrentBranch(response.branch);

        } catch (error) {
            console.error('Error fetching current git branch:', error)
            return null;
        }
    }

    return (
        <div style={{
            padding: '10px',
            border: 'var(--outline)',
            borderRadius: '12px',
            margin: '10px 0',
            background: 'var(--frosted-glass)',
            color: 'var(--color-text-dark)',
            boxShadow: '2px 2px 7px #00000024'
        }}>
            {currentBuild.id !== "main" && (
                <span style={{
                    color: '#ff6b35',
                    fontWeight: 'bold'
                }}>
                    ({language.getString("COMPONENTS.BUILD_SWITCHER.BUILD_OVERRIDE")})
                </span>
            )}

            <div style={{ marginBottom: '10px' }}>
                {currentBranch && currentBranch !== "main" && currentBuild.id === "main" && (
                    <>
                        <span style={{ color: "red" }}>
                            {language.getString("COMPONENTS.BUILD_SWITCHER.CUSTOM_BRANCH_WARNING")}
                        </span>
                        <br /><br />
                    </>
                )}
                <strong>{language.getString("COMPONENTS.BUILD_SWITCHER.ACTIVE_BUILD")}:</strong> {currentBuild.name}
                <br />
                <strong>{language.getString("COMPONENTS.BUILD_SWITCHER.ACTIVE_BRANCH")}:</strong> {currentBranch}
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <select
                    id="build-select"
                    value={currentBuild.id}
                    onChange={(e) => switchBuild(e.target.value)}
                    disabled={isLoading}
                    style={{
                        display: 'flex',
                        flexGrow: 1,
                        padding: '5px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        width: '-webkit-fill-available'
                    }}
                >
                    <option value="main">main</option>
                    {availableBuilds.map((build, index) => (
                        <option key={build.id || index} value={build.id}>
                            {build.name}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading && (
                <div style={{
                    marginTop: '10px',
                    color: '#666',
                    fontStyle: 'italic'
                }}>
                    {language.getString("COMPONENTS.BUILD_SWITCHER.SWITCHING_BUILD")}
                </div>
            )}
        </div>
    )
}