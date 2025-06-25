import styles from "./admin.module.css";
import settings from "@/settings.js";
import { MainLayout } from "@/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import Cookies from 'js-cookie'
import Head from "next/head";
import checkFlags from "@/src/checkFlags";
import CustomButton from '@/components/CustomButton';
import { useRouter } from "next/router";


export default function AdminPage() {
  const router = useRouter();

  const { token, loggedUser } = useAuth();
  const [canvas, setCanvas] = useState(null);
  const [stats, setStats] = useState(null)

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [freeColors, setFreeColors] = useState([]);
  const [cooldownFree, setCooldownFree] = useState(0);
  const [cooldownPremium, setCooldownPremium] = useState(0);
  const [evalCode, setEvalCode] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [choosePage, setChoosePage] = useState();


  const [buildsOverride, setBuildsOverride] = useState([]);


  const [showColorsArray, setShowingColorsArray] = useState(false);

  const [freeColorsInput, setFreeColorsInput] = useState("");

  const fetchCanvas = async () => {
    const res = await fetch(`${settings.apiURL}/canvas`);
    const data = await res.json();
    setCanvas(data);
    setWidth(data.width);
    setHeight(data.height);
    setFreeColors(data.freeColors);
    setCooldownFree(data.cooldown_free);
    setCooldownPremium(data.cooldown_premium);
  };

  const fetchStats = async () => {
    const res = await fetch(`${settings.apiURL}/admin/stats`, {
      headers: {
        authorization: Cookies.get("authorization")
      }
    }).catch(() => { })
    if (!res.ok) return;
    const data = await res.json();
    setStats(data);
  }

  useEffect(() => {
    fetchCanvas();
    fetchStats();
    getBuildsOverride();
    setInterval(() => {
      fetchStats()
    }, 3 * 1000)
  }, []);

  async function getBuildsOverride() {
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
      setBuildsOverride(response);
    } catch (error) {
      console.error('Error fetching current branch:', error)
    }
  }


  useEffect(() => {
    const updatedQuery = {
      ...router.query,
      page: choosePage || undefined,
    };

    router.push(
      {
        pathname: router.pathname,
        query: updatedQuery,
      },
      undefined,
      { shallow: true }
    );
  }, [choosePage]);

  const fetchWithAuth = async (url, method, body) => {
    try {
      setLoading(true);
      const res = await fetch(`${settings.apiURL}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro na requisição.");
      return data;
    } catch (err) {
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Arrastar:

  const dragItem = useRef();
  const dragOverItem = useRef();

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDrop = () => {
    const copy = [...freeColors];
    const dragFrom = dragItem.current;
    const dragTo = dragOverItem.current;

    const item = copy[dragFrom];
    copy.splice(dragFrom, 1);
    copy.splice(dragTo, 0, item);

    dragItem.current = null;
    dragOverItem.current = null;
    setFreeColors(copy);
  };

  // Verifica se é admin
  if (!checkFlags(loggedUser?.flags, "ADMIN_VIEWPAGE"))
    return (
      <MainLayout>
        <span style={{ marginTop: '10px' }}>Você não tem permissão para acessar essa página.</span>
      </MainLayout>
    );

  if (!choosePage) {
    return (
      <>
        <Head>
          <title>PixelsPlace</title>
          <meta name="description" content="Participe do PixelsPlace!" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <MainLayout>
          <main className={styles.main}>
            <fieldset className={styles.choosePage}>
              <span className={styles.title}>Escolha a ADMIN PAGE</span>
              <div className={styles.divButton}>
                <CustomButton label={'Canvas'} onClick={() => setChoosePage("canvas")} />
                <CustomButton label={'Users'} onClick={() => setChoosePage("users")} />
                <CustomButton label={'Geral'} onClick={() => setChoosePage("geral")} />
              </div>
            </fieldset>
          </main>
        </MainLayout>
      </>
    );
  }

  if (choosePage === "canvas") {
    return (
      <>
        <Head>
          <title>PixelsPlace</title>
          <meta name="description" content="Participe do PixelsPlace!" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#80bbff" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <MainLayout>
          <main className={styles.main}>
            <h1>Administração do Canvas</h1>

            <CustomButton
              label={'⬅ Voltar'}
              onClick={() => setChoosePage(null)}
              style={{ position: "relative", right: "-50vw", transform: "translate(-50%)", marginBottom: "20px" }}
            />

            {/*
              <fieldset style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <legend>
                  <strong>Informações principais</strong>
                </legend>
                <button onClick={() => fetchStats()}>Atualizar</button>
                <br />
                <span>Update: {stats?.time}</span>
                <span>Online: {stats?.online}</span>
                <span>Usuarios: {stats?.registeredUsers}</span>
                <span>Pixels: {stats?.pixels}</span>
              </fieldset> */}
            {/* Redimensionar */}
            <fieldset>
              <legend>
                <strong>Redimensionar Canvas</strong>
              </legend>
              <label>Largura:</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
              <label>Altura:</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
              <CustomButton label={'Salvar Tamanho'} disabled={loading} onClick={async () => {
                await fetchWithAuth("/canvas/admin/resize", "PATCH", {
                  width,
                  height,
                });
                fetchCanvas();
              }}
              />
            </fieldset>

            {/* Cores gratuitas */}
            <fieldset>
              <legend>
                <strong>Cores Gratuitas</strong>
              </legend>

              {showColorsArray && (
                <textarea
                  style={{
                    maxWidth: "700px",
                    width: "100%",
                    display: "block",
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    minHeight: "100px",
                    marginBottom: "12px",
                  }}
                  value={freeColorsInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFreeColorsInput(value);

                    // Só atualiza o array se terminar com vírgula (valor finalizado)
                    if (value.endsWith(",")) {
                      const parts = value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s !== "");

                      const numbers = parts.map((part) => parseInt(part, 10));
                      const allValid = numbers.every(
                        (n) => !isNaN(n) && n >= 0 && n <= 16777215
                      );

                      if (allValid) {
                        setFreeColors(numbers);
                      }
                    }
                  }}
                />
              )}

              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  rowGap: "12px",
                  flexWrap: "wrap",
                  maxWidth: "1550px",
                  overflow: "auto",
                  padding: "10px",
                }}
              >
                {freeColors.map((color, index) => (
                  <div
                    key={index}
                    className={styles.coloritem}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <input
                      type="color"
                      value={"#" + color.toString(16).padStart(6, "0")}
                      onChange={(e) => {
                        const hex = e.target.value.replace("#", "");
                        const newColors = [...freeColors];
                        newColors[index] = parseInt(hex, 16);
                        setFreeColors(newColors);
                      }}
                    />
                    <CustomButton label={'X'} color="#ff6c6c" hierarchy={2} onClick={() => {
                      const newColors = removeItemFromArray(freeColors, index);
                      setFreeColors(newColors);
                    }}
                    />
                  </div>
                ))}
              </div>
              <CustomButton
                label={'Adicionar cor'}
                color={"#27b84d"}
                style={{ marginRight: "15px" }}
                onClick={() => {
                  const color = prompt("Código hex");
                  if (!color) return;
                  const number = hexToNumber(color);

                  if (isNaN(number)) return alert("cor invalida: NaN");
                  if (number < 0) return alert("cor invalida: numero menor q 0");
                  if (number > 16777215)
                    return alert("cor invalida: numero maior q 16777215");

                  const newColors = [...freeColors];
                  newColors.push(number);
                  setFreeColors(newColors);
                }}
              />
              <CustomButton
                label={'Salvar cores'}
                style={{ marginRight: "15px" }}
                disabled={loading}
                onClick={async () => {
                  await fetchWithAuth("/canvas/admin/freecolors", "PATCH", {
                    freecolors: freeColors,
                  });
                  fetchCanvas();
                }}
              />
              <CustomButton
                label={showColorsArray ? "Esconder Array" : "Mostrar Array"}
                color={'#909090'}
                onClick={() => {
                  if (!showColorsArray) {
                    setFreeColorsInput(freeColors.join(","));
                  }
                  setShowingColorsArray(!showColorsArray);
                }}
              />
            </fieldset>

            {/* Cooldowns */}
            <fieldset>
              <legend>
                <strong>Cooldowns</strong>
              </legend>
              <label>Grátis (s):</label>
              <input
                type="number"
                value={cooldownFree}
                onChange={(e) => setCooldownFree(Number(e.target.value))}
              />
              <label>Premium (s):</label>
              <input
                type="number"
                value={cooldownPremium}
                onChange={(e) => setCooldownPremium(Number(e.target.value))}
              />
              <CustomButton label={'Salvar cooldowns'} disabled={loading} onClick={async () => {
                await fetchWithAuth("/canvas/admin/cooldown", "PATCH", {
                  cooldown_free: cooldownFree,
                  cooldown_premium: cooldownPremium,
                });
                fetchCanvas();
              }}
              />
            </fieldset>

            {/* Eval */}
            <fieldset>
              <legend>
                <strong>Executar Código (eval)</strong>
              </legend>
              <textarea
                rows={6}
                value={evalCode}
                onChange={(e) => setEvalCode(e.target.value)}
              />
              <CustomButton label={'Executar Eval'} disabled={loading} onClick={async () => {
                if (!evalCode.trim()) return alert("Insira o código.");
                if (
                  confirm(
                    "Tem certeza que deseja executar este código em todos os clients?"
                  )
                ) {
                  const res = await fetchWithAuth("/admin/eval", "POST", {
                    content: evalCode,
                  });
                  res && alert(`Executado em ${res.count} clients.`);
                }
              }}
              />
            </fieldset>

            {/* Alert */}
            <fieldset>
              <legend>
                <strong>Enviar Alerta</strong>
              </legend>
              <textarea
                rows={3}
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
              />
              <CustomButton label={'Enviar alerta'} disabled={loading} onClick={async () => {
                if (!alertMessage.trim()) return alert("Insira a mensagem.");
                if (
                  confirm("Deseja enviar essa mensagem para todos os clients?")
                ) {
                  const res = await fetchWithAuth("/admin/alertmessage", "POST", {
                    content: alertMessage,
                  });
                  res && alert(`Mensagem enviada para ${res.count} clients.`);
                }
              }}
              />
            </fieldset>

            {/* Desconectar sockets */}
            <fieldset>
              <legend>
                <strong>Desconectar Todos os Sockets</strong>
              </legend>
              <CustomButton label={'Desconectar sockets'} disabled={loading} color="#ff0000" onClick={async () => {
                if (
                  confirm("Tem certeza que deseja desconectar todos os sockets?")
                ) {
                  const res = await fetchWithAuth(
                    "/admin/disconnectsockets",
                    "POST",
                    {}
                  );
                  res && alert(`Desconectados: ${res.count}`);
                }
              }}
              />
            </fieldset>
          </main>
        </MainLayout>
      </>
    );
  }

  if (choosePage === "geral") {
    return (
      <>
        <Head>
          <title>PixelsPlace</title>
          <meta name="description" content="Participe do PixelsPlace!" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <MainLayout>
          <main className={styles.main}>
            <h1>Administração do Geral</h1>

            <CustomButton
              label={'⬅ Voltar'}
              onClick={() => setChoosePage(null)}
              style={{ position: "relative", right: "-50vw", transform: "translate(-50%)", marginBottom: "20px" }}
            />

            <fieldset style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <legend>
                <strong>WhiteList</strong>
              </legend>
            </fieldset>



            <fieldset style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <legend>
                <strong>Premium</strong>
              </legend>
            </fieldset>
            <fieldset style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <legend>
                <strong>Builds</strong>
              </legend>
              <CustomButton
                label="Criar Build"
                onClick={() => {
                  //obtem dados: { branch, expiresAt, devices, required_flags, forceOnLink }
                  const branch = prompt("Branch do github");
                  if (!branch) return alert("Branch é obrigatória.");
                  const forceOnLink = !confirm("Possui tela de confirmação?");

                  const expiresAtStr = prompt("Data de expiração (formato: dd/mm/aa hh:mm) [vazio para não expirar]");
                  const expiresAt = expiresAtStr ? dateToTimestamp(expiresAtStr) : null;

                  const required_flags = prompt("Flags obrigatórias para selecionar a build (separadas por vírgula) [vazio para todas]").split(",").map(flag => flag.trim()).filter(flag => flag);
                  const devices = prompt("Dispositivos permitidos (separados por vírgula) (DESKTOP / MOBILE / TABLET) [vario para todos]").split(",").map(device => device.trim()).filter(device => device);

                  fetchWithAuth("/builds", "POST", {
                    branch,
                    forceOnLink,
                    expiresAt: expiresAt ? new Date(Number(expiresAt)) : null,
                    required_flags,
                    devices,
                  }).then((res) => {
                    if (res) {
                      alert("Build criada com sucesso.");
                      getBuildsOverride();
                    }
                  });
                }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                {
                  buildsOverride.map((build, index) => (
                    <div key={index} style={{ marginBottom: "10px", display: "flex", flexDirection: "column", gap: "5px", backgroundColor: "rgb(255 255 255 / 4%)", padding: "10px", borderRadius: "22px", boxShadow: "2px 2px 7px hsla(0, 0%, 0%, 14.1%)" }}>
                      <span style={{ fontFamily: "'Dogica Pixel', Arial, Helvetica, sans-serif" }}>{build.name}</span>
                      <br />
                      <span>ID: {build.id}</span>
                      <span>branch: {build.branch}</span>
                      <span>Tela de confirmação: {build.forceOnLink ? "Não" : "Sim"}</span>
                      <span>Author: {build.author}</span>
                      <span>expira: {dateToString(build.expiresAt)}</span>
                      <span>Criada em: {dateToString(build.createdAt)}</span>
                      <span>Usos: {Number(build.stats?.uses)}</span>
                      <span>Flags obrigatórias: {build.required_flags.length > 0 ? build.required_flags.join(", ") : "N/A"}</span>
                      <span style={{ color: "gray" }}>A assinatura é feita ao gerar um link</span>
                      <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                        <CustomButton
                          label={'Copiar Link'}
                          color="#27b84d"
                          onClick={() => {
                            const link = `${window.location.origin}/buildoverride?t=${build.token}`;
                            copyText(link);
                            alert(`Link copiado e assinado!`);
                          }}
                        />
                        <CustomButton
                          label={'Aplicar'}
                          onClick={() => {
                            Cookies.set("active-build-token", build.token, { expires: 365, secure: true, sameSite: 'Lax' });
                            Cookies.set("active-build-data", JSON.stringify(build), { expires: 365, secure: true, sameSite: 'Lax' });
                            location.href = '/';
                          }}
                        />
                        <CustomButton
                          label={'Excluir'}
                          color="#ff6c6c"
                          hierarchy={2}
                          onClick={async () => {
                            if (confirm(`Tem certeza que deseja excluir essa build? ${build.name}`)) {
                              const res = await fetchWithAuth(`/builds/${build.id}`, "DELETE");
                              if (res) {
                                alert("Build excluída com sucesso.");
                                getBuildsOverride();
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))
                }
              </div>
            </fieldset>

          </main>
        </MainLayout>
      </>
    );
  }

  if (choosePage === "users") {
    return (
      <>
        <Head>
          <title>PixelsPlace</title>
          <meta name="description" content="Participe do PixelsPlace!" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <MainLayout>
          <main className={styles.main}>
            <h1>Administração do Users</h1>

            <CustomButton
              label={'⬅ Voltar'}
              onClick={() => setChoosePage(null)}
              style={{ position: "relative", right: "-50vw", transform: "translate(-50%)", marginBottom: "20px" }}
            />

            <fieldset style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <legend>
                <strong>Informações principais</strong>
              </legend>
              <CustomButton label={'Atualizar'} onClick={() => fetchStats()} />
              <br />
              <span>Update: {stats?.time}</span>
              <span>Online: {stats?.online}</span>
              <span>Usuarios: {stats?.registeredUsers}</span>
              <span>Pixels: {stats?.pixels}</span>
            </fieldset>

            <fieldset style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <legend>
                <strong>Editar Flags</strong>
              </legend>
            </fieldset>

            <fieldset style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <legend>
                <strong>Gerenciar</strong>
                {/* premium
                  kickar
                  banir/desbanir */}
              </legend>
            </fieldset>
          </main>
        </MainLayout>
      </>
    );

  }

  function removeItemFromArray(arr, index) {
    if (index < 0 || index >= arr.length) return arr;
    return [...arr.slice(0, index), ...arr.slice(index + 1)];
  }

  function hexToNumber(hex) {
    return parseInt(hex.replace("#", ""), 16);
  }
}


function dateToString(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
}

function dateToTimestamp(dataStr) {
  // Espera um formato como "24/06/25 14:30"
  const [data, hora] = dataStr.split(" ");
  const [dia, mes, ano] = data.split("/").map(Number);
  const [horaStr, minutoStr] = hora.split(":").map(Number);

  // Adiciona 2000 se o ano tiver só 2 dígitos
  const anoCompleto = ano < 100 ? 2000 + ano : ano;

  const date = new Date(anoCompleto, mes - 1, dia, horaStr, minutoStr);
  return date.getTime(); // ou date.valueOf()
}