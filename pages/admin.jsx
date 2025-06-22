import styles from "./admin.module.css";
import settings from "@/settings.js";
import { MainLayout } from "@/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import Cookies from 'js-cookie'
import Head from "next/head";
import checkFlags from "@/src/checkFlags";


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
  const [ choosePage, setChoosePage] = useState(null);

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

  // arrastar:

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

  //verifica se é admin
  if (!checkFlags(loggedUser?.flags, "ADMIN_VIEWPAGE"))
    return (
      <MainLayout>
        <span>Você não tem permissão para acessar essa página.</span>
      </MainLayout>
    );




    switch (choosePage) {
    case "canva":
      



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
          </fieldset>
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
            <button
              disabled={loading}
              onClick={async () => {
                await fetchWithAuth("/canvas/admin/resize", "PATCH", {
                  width,
                  height,
                });
                fetchCanvas();
              }}
            >
              Salvar Tamanho
            </button>
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
                  <button
                    className={styles.remove}
                    onClick={() => {
                      const newColors = removeItemFromArray(freeColors, index);
                      setFreeColors(newColors);
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
            <button
              className={styles.createbutton}
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
            >
              Adicionar cor
            </button>
            <button
              disabled={loading}
              onClick={async () => {
                await fetchWithAuth("/canvas/admin/freecolors", "PATCH", {
                  freecolors: freeColors,
                });
                fetchCanvas();
              }}
            >
              Salvar Cores
            </button>
            <button
              className={styles.infobutton}
              style={{ marginLeft: "15px" }}
              onClick={() => {
                if (!showColorsArray) {
                  setFreeColorsInput(freeColors.join(","));
                }
                setShowingColorsArray(!showColorsArray);
              }}
            >
              {showColorsArray ? "Esconder Array" : "Mostrar Array"}
            </button>
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
            <button
              disabled={loading}
              onClick={async () => {
                await fetchWithAuth("/canvas/admin/cooldown", "PATCH", {
                  cooldown_free: cooldownFree,
                  cooldown_premium: cooldownPremium,
                });
                fetchCanvas();
              }}
            >
              Salvar Cooldowns
            </button>
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
            <button
              disabled={loading}
              onClick={async () => {
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
            >
              Executar Eval
            </button>
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
            <button
              disabled={loading}
              onClick={async () => {
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
            >
              Enviar Alerta
            </button>
          </fieldset>

          {/* Desconectar sockets */}
          <fieldset>
            <legend>
              <strong>Desconectar Todos os Sockets</strong>
            </legend>
            <button
              disabled={loading}
              style={{ backgroundColor: "red", color: "white" }}
              onClick={async () => {
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
            >
              Desconectar Sockets
            </button>
          </fieldset>
        </main>
      </MainLayout>
    </>
  );




      break;

          case "users":
      


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
          <fieldset className={styles.chossePage}>
            <span className={styles.title}>Escolha a ADMIN PAGE</span>
            <div className={styles.divButton}>
              <button onClick={() => setChoosePage("canva")}>
                <span>CANVA</span>
              </button>
              <button onClick={() => setChoosePage("users")}>
                <span>USERS</span>
              </button>
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
