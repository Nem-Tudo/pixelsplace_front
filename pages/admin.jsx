import styles from "./admin.module.css";
import settings from "@/settings.js";
import { MainLayout } from "@/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import Cookies from 'js-cookie'
import Head from "next/head";
import checkFlags from "@/src/checkFlags";
import Button from '@/components/Button';


export default function AdminPage() {
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
  const [choosePage, setChoosePage] = useState(null);

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
    setInterval(() => {
      fetchStats()
    }, 3 * 1000)
  }, []);

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

  //   FLAGS:
  //   positiva: ADMIN -> dá bypass na verificação de flags / basicamente não é bloqueado por nenhuma flag (seja positiva ou negativa)

  // positiva: ADMIN_RESIZE -> pode mudar o tamanho do canvas
  // positiva: ADMIN_CHANGE_FREE_COLORS -> pode mudar as cores gratuitas
  // positiva: ADMIN_CHANGE_COOLDOWN -> pode mudar o cooldown
  // positiva: ADMIN_TIMETRAVEL : vai ser trocado dps -> pode acessar o timetravel
  // positiva: ADMIN_DISCONNECTSOCKETS -> pode desconectar todos os sockets
  // positiva: ADMIN_MESSAGE -> pode enviar um alert pra todo mundo
  // positiva: ADMIN_EVAL -> pode executar um eval no frontend de todo mundo
  // positiva: ADMIN_STATS -> pode obter estatisticas

  // positiva: SOCKET_WHITELISTED -> pode conectar o socket quando o canvas tá em whitelist

  // negativa: BANNED -> não pode acessar nenhuma rota do site
  // negativa: BANNED_DRAWN -> não pode pintar


  // front end flags: (só fazem efeito no frontend)
  // positiva: ADMIN_VIEWPAGE -> pode ver a pagina de admin


  // Verifica se é admin
  if (!checkFlags(loggedUser?.flags, "ADMIN_VIEWPAGE"))
    return (
      <MainLayout>
        <span style={{marginTop: '10px'}}>Você não tem permissão para acessar essa página.</span>
      </MainLayout>
    );

  switch (choosePage) {

    case "canvas":

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

              <Button
                label={'⬅ Voltar'}
                on_click={() => setChoosePage(null)}
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
                <Button label={'Salvar Tamanho'} disabled={loading} on_click={async () => {
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
                      <Button label={'X'} hue={0} hierarchy={2} on_click={() => {
                        const newColors = removeItemFromArray(freeColors, index);
                        setFreeColors(newColors);
                      }}
                      />
                    </div>
                  ))}
                </div>
                <Button label={'Adicionar cor'} hue={120} style={{ marginRight: "15px" }} on_click={() => {
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
                <Button label={'Salvar cores'} disabled={loading} on_click={async () => {
                  await fetchWithAuth("/canvas/admin/freecolors", "PATCH", {
                    freecolors: freeColors,
                  });
                  fetchCanvas();
                }}
                />
                <Button
                  label={showColorsArray ? "Esconder Array" : "Mostrar Array"}
                  hue={-69.41}
                  style={{ marginRight: "15px" }}
                  on_click={() => {
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
                <Button label={'Salvar cooldowns'} disabled={loading} onClick={async () => {
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
                <Button label={'Executar Eval'} disabled={loading} on_click={async () => {
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
                <Button label={'Enviar alerta'} disabled={loading} on_click={async () => {
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
                <Button label={'Desconectar sockets'} disabled={loading} hue={0} on_click={async () => {
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

      break;

    case "users":

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

              <Button
                label={'⬅ Voltar'}
                on_click={() => setChoosePage(null)}
                style={{ position: "relative", right: "-50vw", transform: "translate(-50%)", marginBottom: "20px" }}
              />

              <fieldset style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <legend>
                  <strong>Informações principais</strong>
                </legend>
                <Button label={'Atualizar'} on_click={() => fetchStats()} />
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

      break;

    case "geral":

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

              <Button
                label={'⬅ Voltar'}
                on_click={() => setChoosePage(null)}
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

            </main>
          </MainLayout>
        </>
      );

      break;

    case "//":

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
              <h1>Administração do //</h1>

              <Button
                label={'⬅ Voltar'}
                on_click={() => setChoosePage(null)}
                style={{ position: "relative", right: "-50vw", transform: "translate(-50%)", marginBottom: "20px" }}
              />

              <fieldset style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <legend>
                  <strong>Editar Flags</strong>
                </legend>
              </fieldset>

            </main>
          </MainLayout>
        </>
      );

      break;

    default:

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
                  <Button label={'Canvas'} on_click={() => setChoosePage("canvas")} />
                  <Button label={'Users'} on_click={() => setChoosePage("users")} />
                  <Button label={'Geral'} on_click={() => setChoosePage("geral")} />
                </div>
              </fieldset>
            </main>
          </MainLayout>
        </>
      );

      break;

  }

}

function removeItemFromArray(arr, index) {
  if (index < 0 || index >= arr.length) return arr;
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

function hexToNumber(hex) {
  return parseInt(hex.replace("#", ""), 16);
}
