import styles from "./admin.module.css";
import settings from "@/settings.js";
import { MainLayout } from "@/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import Cookies from 'js-cookie'
import checkFlags from "@/src/checkFlags";
import CustomButton from '@/components/CustomButton';
import { useRouter } from "next/router";
import PixelIcon from "@/components/PixelIcon";
import { dateToString, formatDate } from "@/src/dateFunctions";
import copyText from "@/src/copyText";
import updateStateKey from "@/src/updateStateKey";
import Verified from "@/components/Verified";
import { usePopup } from '@/context/PopupContext';
import ToggleSwitch from "@/components/ToggleSwitch";
import CustomHead from "@/components/CustomHead";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import Failure from "@/components/Failure";
import Billboard from "@/components/Billboard";
import Loading from "@/components/Loading";

export default function AdminPage() {
  const router = useRouter();

  const { token, loggedUser } = useAuth();
  const { language } = useLanguage()
  const [canvas, setCanvas] = useState(null);
  const [stats, setStats] = useState(null);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [freeColors, setFreeColors] = useState([]);
  const [cooldownFree, setCooldownFree] = useState(0);
  const [cooldownPremium, setCooldownPremium] = useState(0);
  const [evalCode, setEvalCode] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chosenPage, setChosenPage] = useState();
  const [chosenTargetEval, setChosenTargetEval] = useState('all');
  const [chosenTargetExtraEval, setChosenTargetExtraEval] = useState('');
  const [chosenTargetAlert, setChosenTargetAlert] = useState('all');
  const [chosenTargetExtraAlert, setChosenTargetExtraAlert] = useState('');

  const [routeEval, setRouteEval] = useState('');
  const [routeAlert, setRouteAlert] = useState('');


  // const [chosenPage, setChosenPage] = useState();

  const [canvaSettings, setCanvaSettings] = useState();

  const [buildsOverride, setBuildsOverride] = useState([]);

  const [showColorsArray, setShowingColorsArray] = useState(false);

  const [freeColorsInput, setFreeColorsInput] = useState("");

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsQuery, setAuditLogsQuery] = useState({ action: "", idAdmin: "", skip: 0, limit: 50, showLoadMore: true });

  const { openPopup } = usePopup()

  async function getUser(id) {
    const res = await fetch(`${settings.apiURL}/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: token,
      },
    });
    const data = await res.json();

    if (res.status == 404) {
      setUser(null);
    } else {
      setUser(data);
    }

    if (res.status != 200)
      return { error: true, status: res.status, message: data.message };
  }

  const [user, setUser] = useState(null);

  const fetchCanvas = async () => {
    const res = await fetch(`${settings.apiURL}/canvas`);
    const data = await res.json();
    setCanvas(data);
    setWidth(data.width);
    setHeight(data.height);
    setFreeColors(data.freeColors);
    setCooldownFree(data.cooldown_free);
    setCooldownPremium(data.cooldown_premium);
    setCanvaSettings(data.settings);
  };

  const fetchStats = async () => {
    const res = await fetch(`${settings.apiURL}/admin/stats`, {
      headers: {
        authorization: Cookies.get("authorization")
      }
    }).catch(() => { })
    if (!res?.ok) return;
    const data = await res.json();
    setStats(data);
  }

  // Inicialização da página baseada na URL
  useEffect(() => {
    if (router.isReady) {
      const pageFromUrl = router.query.page;
      const idUserSearch = router.query.Search;
      const validPages = ['canvas', 'general', 'users', "auditlogs"];

      if (pageFromUrl && validPages.includes(pageFromUrl)) {
        setChosenPage(pageFromUrl);
      } else {
        setChosenPage('canvas'); // página padrão
      }

      if ((pageFromUrl == 'users') && (idUserSearch)) {
        getUser(idUserSearch)
      }
    }
  }, [router.isReady, router.query.page]);

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
        return openPopup("error", { message: `Erro ao buscar builds: ${response.message || 'Erro desconhecido'}` });
      }
      setBuildsOverride(response);
    } catch (error) {
      console.error('Error fetching current branch:', error)
    }
  }

  // Atualização da URL quando a página muda
  useEffect(() => {
    if (chosenPage && router.isReady) {
      const updatedQuery = {
        ...router.query,
        page: chosenPage,
      };

      router.push(
        {
          pathname: router.pathname,
          query: updatedQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [chosenPage, router.isReady]);

  useEffect(() => {
    if (chosenPage != "auditlogs") return;
    fetchAuditLogs()
  }, [chosenPage])

  useEffect(() => {
    let TargetExtraEval = "";
    if (routeEval.requiredFlags) {
      TargetExtraEval += `requiredFlags=${routeEval.requiredFlags}&`;
    }
    if (routeEval.userIds) {
      TargetExtraEval += `userIds=${routeEval.userIds}&`;
    }
    if (routeEval.bannedFlags) {
      TargetExtraEval += `bannedFlags=${routeEval.bannedFlags}&`;
    }
    if (routeEval.excludeUserIds) {
      TargetExtraEval += `excludeUserIds=${routeEval.excludeUserIds}&`;
    }
    
    setChosenTargetExtraEval(TargetExtraEval);

  }, [routeEval])


  useEffect(() => {
    let TargetExtraAlert = "";
    if (routeAlert.requiredFlags) {
      TargetExtraAlert += `requiredFlags=${routeAlert.requiredFlags}&`;
    }
    if (routeAlert.userIds) {
      TargetExtraAlert += `userIds=${routeAlert.userIds}&`;
    }
    if (routeAlert.bannedFlags) {
      TargetExtraAlert += `bannedFlags=${routeAlert.bannedFlags}&`;
    }
    if (routeAlert.excludeUserIds) {
      TargetExtraAlert += `excludeUserIds=${routeAlert.excludeUserIds}&`;
    }
    
    setChosenTargetExtraAlert(TargetExtraAlert);

  }, [routeAlert])

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
      openPopup("error", { message: `${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  async function fetchAuditLogs(reset = false) {
    if (reset) {
      auditLogsQuery.limit = 50;
      auditLogsQuery.skip = 0;
      auditLogsQuery.showLoadMore = true;
      setAuditLogsQuery(auditLogsQuery)
    }

    const response = await fetchWithAuth(
      `/admin/auditlogs?limit=${auditLogsQuery.limit}&skip=${auditLogsQuery.skip}&${auditLogsQuery.action
        ? `filter_action=${encodeURIComponent(auditLogsQuery.action)}&`
        : ""
      }${auditLogsQuery.idAdmin
        ? `filter_user=${encodeURIComponent(auditLogsQuery.idAdmin)}&`
        : ""
      }`
    );

    if (response.length < auditLogsQuery.limit) {
      auditLogsQuery.showLoadMore = false;
      setAuditLogsQuery(auditLogsQuery);
    }
    auditLogsQuery.skip = auditLogs.length + response.length;
    if (reset) {
      setAuditLogs(response)
    } else {
      setAuditLogs([...auditLogs, ...response])
    }
    setAuditLogsQuery(auditLogsQuery)
  }

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
        <Failure message={language.getString("COMMON.NO_PERMISSION_PAGE")}>
          <CustomButton color={'#ffffff54'} icon={'home'} padding={2} label={language.getString("PAGES.INDEX.NAME")} href={"/"} />
        </Failure>
      </MainLayout>
    );

  // Aguarda inicialização da página
  if (!chosenPage) {
    return (
      <MainLayout>
        <Billboard>
          <Loading />
        </Billboard>
      </MainLayout>
    );
  }

  const PageSelector = (
    <div className={styles.radioSelector}>
      <input checked={chosenPage === 'canvas'} type={"radio"} name={"pagina"} id={"pagina_canvas"} value={"canvas"} onChange={() => setChosenPage('canvas')} />
      <label htmlFor={"pagina_canvas"}>
        <PixelIcon codename={'frame'} />
        <span className="mobileHidden_500">Canvas</span>
      </label>

      <input checked={chosenPage === 'general'} type={"radio"} name={"pagina"} id={"pagina_general"} value={"general"} onChange={() => setChosenPage('general')} />
      <label htmlFor={"pagina_general"}>
        <PixelIcon codename={'sliders-2'} />
        <span className="mobileHidden_500">Geral</span>
      </label>

      <input checked={chosenPage === 'users'} type={"radio"} name={"pagina"} id={"pagina_users"} value={"users"} onChange={() => setChosenPage('users')} />
      <label htmlFor={"pagina_users"}>
        <PixelIcon codename={'user'} />
        <span className="mobileHidden_500">Usuários</span>
      </label>
      <input checked={chosenPage === 'auditlogs'} type={"radio"} name={"pagina"} id={"auditlogs"} value={"auditlogs"} onChange={() => setChosenPage('auditlogs')} />
      <label htmlFor={"auditlogs"}>
        <PixelIcon codename={'script-text'} />
        <span className="mobileHidden_500">Registros</span>
      </label>
    </div>
  )

  if (chosenPage === "canvas") {
    return (
      <>
        <CustomHead
          title={language.getString("PAGES.ADMIN.META_TITLE")}
          description={language.getString("PAGES.ADMIN.META_DESCRIPTION")}
          url={"https://pixelsplace.nemtudo.me/admin?page=canvas"}
        />
        <MainLayout>
          <main className={styles.main}>
            <h1>Administração do Canvas</h1>

            {PageSelector}

            {/* Redimensionar */}
            <fieldset>
              <legend>
                <strong>Redimensionar Canvas</strong>
              </legend>
              <main>
                <section>
                  <label>Largura:</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                  />
                </section>
                <section>
                  <label>Altura:</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                  />
                </section>
              </main>
              <footer className={styles.buttonsContainer}>
                <CustomButton label={'Salvar tamanho'} icon={'save'} disabled={loading} onClick={async () => {
                  await fetchWithAuth("/canvas/admin/resize", "PATCH", {
                    width,
                    height,
                  });
                  fetchCanvas();
                }}
                />
              </footer>
            </fieldset>

            {/* Cores gratuitas */}
            <fieldset>
              <legend>
                <strong>Cores Gratuitas</strong>
              </legend>

              {showColorsArray && (
                <textarea
                  rows={6}
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

              <div className={styles.colorContainer}>
                {freeColors.map((color, index) => (
                  <div
                    key={index}
                    className={styles.colorItem}
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
                    <CustomButton icon={'close'} color="#ff6c6c" hierarchy={2} onClick={() => {
                      const newColors = removeItemFromArray(freeColors, index);
                      setFreeColors(newColors);
                    }}
                    />
                  </div>
                ))}
              </div>
              <footer className={styles.buttonsContainer}>
                <CustomButton
                  label={'Adicionar cor'}
                  icon={'plus'}
                  color={"#27b84d"}
                  onClick={() => {
                    openPopup("admin_color_add", { freeColors, setFreeColors })
                  }}
                />
                <CustomButton
                  label={'Salvar cores'}
                  icon={'save'}
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
                  icon={showColorsArray ? "eye-closed" : "eye"}
                  color={'#909090'}
                  onClick={() => {
                    if (!showColorsArray) {
                      setFreeColorsInput(freeColors.join(","));
                    }
                    setShowingColorsArray(!showColorsArray);
                  }}
                />
              </footer>
            </fieldset>

            {/* Cooldowns */}
            <fieldset>
              <legend>
                <strong>Cooldowns</strong>
              </legend>
              <main>
                <section>
                  <label>Grátis (s):</label>
                  <input
                    type="number"
                    value={cooldownFree}
                    onChange={(e) => setCooldownFree(Number(e.target.value))}
                  />
                </section>
                <section>
                  <label>Premium (s):</label>
                  <input
                    type="number"
                    value={cooldownPremium}
                    onChange={(e) => setCooldownPremium(Number(e.target.value))}
                  />
                </section>
              </main>
              <footer className={styles.buttonsContainer}>
                <CustomButton label={'Salvar cooldowns'} icon={'save'} disabled={loading} onClick={async () => {
                  await fetchWithAuth("/canvas/admin/cooldown", "PATCH", {
                    cooldown_free: cooldownFree,
                    cooldown_premium: cooldownPremium,
                  });
                  fetchCanvas();
                }}
                />
              </footer>
            </fieldset>

            {/* Eval Clients */}
            <fieldset>
              <legend>
                <strong>Executar Código (eval client)</strong>
                <div className={styles.radioSelector}>
                  <input checked={chosenTargetEval === 'all'} type={"radio"} name={"TargetEval"} id={"TargetEvalAll"} value={"authenticated"} onChange={() => setChosenTargetEval('all')} />
                  <label htmlFor={"TargetEvalAll"}>
                    <PixelIcon codename={'users'} />
                    <span className="mobileHidden_500">Todos</span>
                  </label>

                  <input checked={chosenTargetEval === 'authenticated'} type={"radio"} name={"TargetEval"} id={"TargetEvalAuth"} value={"all"} onChange={() => setChosenTargetEval('authenticated')} />
                  <label htmlFor={"TargetEvalAuth"}>
                    <PixelIcon codename={'lock'} />
                    <span className="mobileHidden_500">Autenticados</span>
                  </label>

                  <input checked={chosenTargetEval === 'anonymous'} type={"radio"} name={"TargetEval"} id={"TargetEvalAnonymous"} value={"anonymous"} onChange={() => setChosenTargetEval('anonymous')} />
                  <label htmlFor={"TargetEvalAnonymous"}>
                    <PixelIcon codename={'user-x'} />
                    <span className="mobileHidden_500">Anônimos</span>
                  </label>
                </div>
              </legend>
              <textarea
                rows={6}
                placeholder="console.log(nt.cow)..."
                value={evalCode}
                onChange={(e) => setEvalCode(e.target.value)}
              />
              <footer className={styles.buttonsContainer}>
                <CustomButton label={'Executar'} padding={2} icon={'play'} disabled={loading} onClick={async () => {
                  if (!evalCode.trim()) return openPopup("error", { message: "Insira o código." });
                  openPopup("confirm", {
                    message: "Tem certeza que deseja executar este código em todos os clients?",
                    execute: async () => {
                      const res = await fetchWithAuth(`/admin/evalclients?${chosenTargetEval === "all" ? "" : `authenticated=${chosenTargetEval === "authenticated"}&`}${chosenTargetExtraEval}`, "POST", {
                        content: evalCode,
                      });
                      res && openPopup("success", { message: `Executado em ${res.count} clients.` });
                    }
                  })
                }}
                />
                <div className={styles.radioSelector}>
                  <p>Permitido?</p>
                  <input
                    checked={routeEval.requiredFlags}
                    type={"checkbox"}
                    name={"TargetExtraEval"}
                    id={"TargetExtraEvalRequiredFlags"}
                    value={"requiredFlags"}
                    onClick={(e) =>{ e.preventDefault()
                      const requiredFlags = prompt("Escreva as Flags (separadas por virgula)")
                      setRouteEval(prevRouteEval => ({
                                    ...prevRouteEval,
                                    requiredFlags: requiredFlags
                                  }));
                      // setChosenTargetExtraEval(chosenTargetExtraEval + "&requiredFlags=" + requiredFlags);
                    }}
                  />
                  <label htmlFor={"TargetExtraEvalRequiredFlags"}>
                    <PixelIcon codename={'flag'} />
                    <span className="mobileHidden_500">Flags</span>
                  </label>
                  <input
                    checked={routeEval.userIds}
                    type={"checkbox"}
                    name={"TargetExtraEval"}
                    id={"TargetExtraEvalBannedFlags"}
                    value={"userIds"}
                    onChange={() => {

                      const userIds = prompt("Escreva o id dos users (separados por virgula)")

                      setRouteEval(prevRouteEval => ({
                                    ...prevRouteEval,
                                    userIds: userIds
                                  }));
                      // setChosenTargetExtraEval(chosenTargetExtraEval + "&userIds=" + userIds);
                    }}
                  />
                  <label htmlFor={"TargetExtraEvalBannedFlags"}>
                    <PixelIcon codename={'user-plus'} />
                    <span className="mobileHidden_500">Users</span>
                  </label>
                </div>

                {/* --------------------------------------------- */}

                <div className={styles.radioSelector}>
                  <p>Excluídos?</p>
                  <input
                    checked={routeEval.bannedFlags}
                    type={"checkbox"}
                    name={"TargetExtraEval"}
                    id={"TargetExtraEvalUserIds"}
                    value={"bannedFlags"}
                    onClick={(e) =>{ e.preventDefault()
                      const bannedFlags = prompt("Escreva as Flags (separadas por virgula)")
                      setRouteEval(prevRouteEval => ({
                                    ...prevRouteEval,
                                    bannedFlags: bannedFlags
                                  }));
                      // setChosenTargetExtraEval(chosenTargetExtraEval + "&bannedFlags=" + bannedFlags);
                    }}
                  />
                  <label htmlFor={"TargetExtraEvalUserIds"}>
                    <PixelIcon codename={'flag'} />
                    <span className="mobileHidden_500">Flags</span>
                  </label>
                  <input
                    checked={routeEval.excludeUserIds}
                    type={"checkbox"}
                    name={"TargetExtraEval"}
                    id={"TargetExtraEvalExcludeUserIds"}
                    value={"excludeUserIds"}
                    onClick={(e) =>{ e.preventDefault()
                      const excludeUserIds = prompt("Escreva o id dos users (separadas por virgula)")
                      setRouteEval(prevRouteEval => ({
                                    ...prevRouteEval,
                                    excludeUserIds: excludeUserIds
                                  }));
                      // setChosenTargetExtraEval(chosenTargetExtraEval + "&excludeUserIds=" + excludeUserIds);
                    }}
                  />
                  <label htmlFor={"TargetExtraEvalExcludeUserIds"}>
                    <PixelIcon codename={'user-minus'} />
                    <span className="mobileHidden_500">Users</span>
                  </label>

                </div>
              </footer>
            </fieldset>

            {/* Eval server */}
            <fieldset>
              <legend>
                <strong>
                  Executar código (eval server)
                </strong>
              </legend>
              <span style={{ color: "red" }}>Permissão exclusiva exigida*</span>
              <footer>
                <CustomButton label="Inserir código" icon={'script-text'} onClick={async () => {
                  openPopup('admin_eval_server')
                }} />
              </footer>
            </fieldset>

            {/* Alert */}
            <fieldset>
              <legend>
                <strong>Enviar Alerta</strong>
                <div className={styles.radioSelector}>
                  <input checked={chosenTargetAlert === 'all'} type={"radio"} name={"TargetAlert"} id={"TargetAlertAll"} value={"authenticated"} onChange={() => setChosenTargetAlert('all')} />
                  <label htmlFor={"TargetAlertAll"}>
                    <PixelIcon codename={'users'} />
                    <span className="mobileHidden_500">Todos</span>
                  </label>

                  <input checked={chosenTargetAlert === 'authenticated'} type={"radio"} name={"TargetAlert"} id={"TargetAlertAuth"} value={"all"} onChange={() => setChosenTargetAlert('authenticated')} />
                  <label htmlFor={"TargetAlertAuth"}>
                    <PixelIcon codename={'lock'} />
                    <span className="mobileHidden_500">Autenticados</span>
                  </label>

                  <input checked={chosenTargetAlert === 'anonymous'} type={"radio"} name={"TargetAlert"} id={"TargetAlertAnonymous"} value={"anonymous"} onChange={() => setChosenTargetAlert('anonymous')} />
                  <label htmlFor={"TargetAlertAnonymous"}>
                    <PixelIcon codename={'user-x'} />
                    <span className="mobileHidden_500">Anônimos</span>
                  </label>
                </div>
              </legend>
              <textarea
                rows={3}
                placeholder={`Desejo ${['uma boa meia noite', 'uma boa madrugada', 'um bom dia', 'uma boa tarde', 'uma boa noite'][Math.ceil(((new Date).getHours()) / 24 * 4)]} a todos jogadores do PixelsPlace...`}
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
              />
              <footer className={styles.buttonsContainer}>
                <CustomButton label={'Enviar'} padding={2} icon={'message-arrow-right'} disabled={loading} onClick={async () => {
                  if (!alertMessage.trim()) return openPopup("error", { message: "Insira a mensagem." });
                  openPopup("confirm", {
                    message: "Deseja enviar essa mensagem para todos os clients?",
                    execute: async () => {
                      const res = await fetchWithAuth(`/admin/alertmessage?${chosenTargetAlert === "all" ? "" : `authenticated=${chosenTargetAlert === "authenticated"}&`}${chosenTargetExtraAlert}`, "POST", {
                      // const res = await fetchWithAuth("/admin/alertmessage", "POST", {
                        content: alertMessage,
                      });
                      res && openPopup('success', { message: `Mensagem enviada para ${res.count} clients.` });
                    }
                  })
                }}
                />
                <div className={styles.radioSelector}>
                  <p>Permitido?</p>
                  <input
                    checked={routeAlert.requiredFlags}
                    type={"checkbox"}
                    name={"TargetExtraAlert"}
                    id={"TargetExtraAlertRequiredFlags"}
                    value={"requiredFlags"}
                    onClick={(e) =>{ e.preventDefault()
                      const requiredFlags = prompt("Escreva as Flags (separadas por virgula)")
                      setRouteAlert(prevRouteAlert => ({
                                    ...prevRouteAlert,
                                    requiredFlags: requiredFlags
                                  }));
                      // setChosenTargetExtraAlert(chosenTargetExtraAlert + "&requiredFlags=" + requiredFlags.toUpperCase());
                    }}
                  />
                  <label htmlFor={"TargetExtraAlertRequiredFlags"}>
                    <PixelIcon codename={'flag'} />
                    <span className="mobileHidden_500">Flags</span>
                  </label>

                  <input
                    checked={routeAlert.userIds}
                    type={"checkbox"}
                    name={"TargetExtraAlert"}
                    id={"TargetExtraAlertBannedFlags"}
                    value={"userIds"}
                    onClick={(e) =>{ e.preventDefault()
                      const userIds = prompt("Escreva o id dos users (separados por virgula)")
                      setRouteAlert(prevRouteAlert => ({
                                    ...prevRouteAlert,
                                    userIds: userIds
                                  }));
                      // setChosenTargetExtraAlert(chosenTargetExtraAlert + "&userIds=" + userIds);
                    }}
                  />
                  <label htmlFor={"TargetExtraAlertBannedFlags"}>
                    <PixelIcon codename={'user-plus'} />
                    <span className="mobileHidden_500">Users</span>
                  </label>
                </div>

                {/* --------------------------------------------- */}

                <div className={styles.radioSelector}>
                  <p>Excluídos?</p>
                  <input
                    checked={routeAlert.bannedFlags}
                    type={"checkbox"}
                    name={"TargetExtraAlert"}
                    id={"TargetExtraAlertUserIds"}
                    value={"bannedFlags"}
                    onClick={(e) =>{ e.preventDefault()
                      const bannedFlags = prompt("Escreva as Flags (separadas por virgula)")
                      setRouteAlert(prevRouteAlert => ({
                                    ...prevRouteAlert,
                                    bannedFlags: bannedFlags
                                  }));
                      // setChosenTargetExtraAlert(chosenTargetExtraAlert + "&bannedFlags=" + bannedFlags.toUpperCase());
                    }}
                  />
                  <label htmlFor={"TargetExtraAlertUserIds"}>
                    <PixelIcon codename={'flag'} />
                    <span className="mobileHidden_500">Flags</span>
                  </label>

                  <input
                    checked={routeAlert.excludeUserIds}
                    type={"checkbox"}
                    name={"TargetExtraAlert"}
                    id={"TargetExtraAlertExcludeUserIds"}
                    value={"excludeUserIds"}
                    onClick={(e) =>{ e.preventDefault()
                      const excludeUserIds = prompt("Escreva o id dos users (separadas por virgula)")
                      setRouteAlert(prevRouteAlert => ({
                                    ...prevRouteAlert,
                                    excludeUserIds: excludeUserIds
                                  }));
                      // setChosenTargetExtraAlert(chosenTargetExtraAlert + "&excludeUserIds=" + excludeUserIds);
                    }}
                  />
                  <label htmlFor={"TargetExtraAlertExcludeUserIds"}>
                    <PixelIcon codename={'user-minus'} />
                    <span className="mobileHidden_500">Users</span>
                  </label>

                </div>
              </footer>
            </fieldset>

            {/* Desconectar sockets */}
            <fieldset>
              <legend>
                <strong>Desconectar Todos os Sockets</strong>
              </legend>
              <footer className={styles.buttonsContainer}>
                <CustomButton label={'Desconectar sockets'} icon={'close'} disabled={loading} color="#ff0000" onClick={async () => {
                  openPopup("confirm", {
                    message: "Tem certeza que deseja desconectar todos os sockets?",
                    execute: async () => {
                      const res = await fetchWithAuth(
                        "/admin/disconnectsockets",
                        "POST",
                        {}
                      );
                      res && openPopup('success', { message: `Desconectados: ${res.count}` });
                    }
                  })
                }}
                />
              </footer>
            </fieldset>
          </main>
        </MainLayout>
      </>
    );
  }

  else if (chosenPage === "general") {
    return (
      <>
        <CustomHead
          title={language.getString("PAGES.ADMIN.META_TITLE")}
          description={language.getString("PAGES.ADMIN.META_DESCRIPTION")}
          url={"https://pixelsplace.nemtudo.me/admin?page=general"}
        />
        <MainLayout>
          <main className={styles.main}>
            <h1>Administração Geral</h1>

            {PageSelector}

            <fieldset>
              <legend>
                <strong>Whitelist</strong>
              </legend>
              <main class={styles.horizontalMain}>
                <section>
                  <span>Whitelist</span>
                  <ToggleSwitch
                    checked={setCanvaSettings?.whitelisted}
                    onChange={async () => {
                      let newWhitelisted = setCanvaSettings?.whitelisted;
                      if (setCanvaSettings?.whitelisted) {
                        newWhitelisted = 0
                      } else {
                        newWhitelisted = 1
                      }
                      await fetchWithAuth("/canva/admin/settings", "PATCH", {
                        whitelisted: newWhitelisted
                      });
                    }}
                  />
                </section>
              </main>
            </fieldset>

            <fieldset>
              <legend>
                <strong>Premium</strong>
              </legend>
              <footer className={styles.buttonsContainer}>
                <CustomButton
                  label={setCanvaSettings?.onlyFreeColors ? "Liberar todas as cores" : "Restringir para apenas cores gratuitas"}
                  icon={"paint-bucket"}
                  hierarchy={2}
                  color={'#d6a700'}
                  onClick={async () => {
                    let newOnlyFreeColors = setCanvaSettings?.onlyFreeColors;
                    if (setCanvaSettings?.onlyFreeColors) {
                      newOnlyFreeColors = 0
                    } else {
                      newOnlyFreeColors = 1
                    }
                    await fetchWithAuth("/canva/admin/settings", "PATCH", {
                      onlyFreeColors: newOnlyFreeColors
                    });
                  }}
                />
              </footer>
            </fieldset>

            <fieldset>
              <legend>
                <strong>Builds</strong>
              </legend>
              <section className={styles.buttonsContainer}>
                <CustomButton
                  label={"Criar"}
                  icon={'plus'}
                  onClick={() => {
                    openPopup("admin_build_add")
                  }}
                />
              </section>
              <main className={[styles.buildsContainer, styles.horizontalMain].join(' ')}>
                {
                  buildsOverride.map((build, index) => (
                    <div key={index} className={styles.build}>
                      <h2>{build.name}</h2>
                      <span>ID: {build.id}</span>
                      <span>Branch: {build.branch}</span>
                      <span>Tela de confirmação: {build.forceOnLink ? "Não" : "Sim"}</span>
                      <span>Author: {build.author}</span>
                      <span>Expira: {dateToString(build.expiresAt)}</span>
                      <span>Criada em: {dateToString(build.createdAt)}</span>
                      <span>Usos: {Number(build.stats?.uses)}</span>
                      <span>Flags obrigatórias: {build.required_flags.length > 0 ? build.required_flags.join(", ") : "N/A"}</span>
                      <h3>A assinatura é feita ao gerar um link</h3>
                      <footer className={styles.buttonsContainer}>
                        <CustomButton
                          label={'Gerar link'}
                          icon={'link'}
                          color="#27b84d"
                          onClick={() => {
                            const link = `${window.location.origin}/buildoverride?t=${build.token}`;
                            copyText(link);
                            openPopup('success', { message: `Link copiado e assinado!` });
                          }}
                        />
                        <CustomButton
                          label={'Aplicar'}
                          icon={'check'}
                          onClick={() => {
                            Cookies.set("active-build-token", build.token, { expires: 365, secure: true, sameSite: 'Lax' });
                            Cookies.set("active-build-data", JSON.stringify(build), { expires: 365, secure: true, sameSite: 'Lax' });
                            location.href = '/';
                          }}
                        />
                        <CustomButton
                          label={'Excluir'}
                          icon={'close'}
                          color={"#ff6c6c"}
                          hierarchy={2}
                          onClick={async () => {
                            openPopup("confirm", {
                              message: `Tem certeza que deseja excluir essa build? ${build.name}`,
                              execute: async () => {
                                const res = await fetchWithAuth(`/builds/${build.id}`, "DELETE");
                                if (res) {
                                  openPopup('success', { message: "Build excluída com sucesso." });
                                  getBuildsOverride();
                                }
                              }
                            })
                          }}
                        />
                      </footer>
                    </div>
                  ))
                }
              </main>
            </fieldset>

          </main>
        </MainLayout>
      </>
    );
  }

  else if (chosenPage === "users") {
    return (
      <>
        <CustomHead
          title={language.getString("PAGES.ADMIN.META_TITLE")}
          description={language.getString("PAGES.ADMIN.META_DESCRIPTION")}
          url={"https://pixelsplace.nemtudo.me/admin?page=users"}
        />
        <MainLayout>
          <main className={styles.main}>
            <h1>Administração de Usuários</h1>

            {PageSelector}

            <fieldset>
              <legend>
                <strong>Informações principais</strong>
              </legend>
              <main>
                <section>
                  <span>Update: {stats?.time}</span>
                  <span>Online: {stats?.online}</span>
                  <span>Usuários: {stats?.registeredUsers}</span>
                  <span>Pixels: {stats?.pixels}</span>
                </section>
              </main>
              <footer className={styles.buttonsContainer}>
                <CustomButton label={'Atualizar'} icon={'reload'} onClick={() => fetchStats()} />
              </footer>
            </fieldset>

            <fieldset>
              <legend>
                <strong>Escolher usuário</strong>
              </legend>
              <input type="text" id="idUserSearch" defaultValue={router.query.Search} />
              <footer className={styles.buttonsContainer}>
                <CustomButton
                  label={'Consultar'}
                  icon={'contact'}
                  disabled={loading}
                  onClick={() => getUser(document.getElementById("idUserSearch").value)}
                />
              </footer>
            </fieldset>

            {user &&
              <fieldset>
                <legend>
                  <strong>Informações do usuário</strong>
                </legend>
                <main>
                  <img src={settings.avatarURL(user.id, user.avatar)} id={styles.userAvatar} />
                  <section>
                    <span>Nome: {user?.display_name} (@{user?.username}) <Verified verified={user?.premium || user?.flags.includes("VERIFIED")} /></span>
                    <span>Criação: {dateToString(user?.createdAt)}</span>
                    <span>Ultimo Pixel: {dateToString(user?.lastPaintPixel)}</span>
                  </section>
                </main>
              </fieldset>
            }

            {
              user && <fieldset>
                <legend>
                  <strong>Gerenciar flags</strong>
                </legend>
                <div className={styles.flagList}>
                  {user && user?.flags?.map((flag, index) => (
                    <div className={styles.flag}>{flag}<PixelIcon onClick={() => {
                      updateStateKey(setUser, user, ["flags", removeItemFromArray(user.flags, index)]);
                    }} codename={"trash"} /></div>
                  ))}
                </div>
                <footer className={styles.buttonsContainer}>
                  <CustomButton
                    label={'Adicionar'}
                    icon={'plus'}
                    color={"#27b84d"}
                    onClick={() => {
                      openPopup("admin_flag_add", { user, setUser, updateStateKey })
                    }}
                  />
                  <CustomButton
                    label={'Salvar'}
                    icon={'save'}
                    disabled={loading}
                    onClick={async () => {
                      await fetchWithAuth("/admin/users/" + user?.id, "PATCH", {
                        flags: user.flags,
                      });
                    }}
                  />
                </footer>
              </fieldset>
            }

            {
              user && <fieldset>
                <legend>
                  <strong>Ações</strong>
                </legend>
                <footer className={styles.buttonsContainer}>
                  <CustomButton
                    label={user.premium ? "Remover Premium" : "Dar Premium"}
                    icon={"pixelarticons"}
                    hierarchy={user.premium ? "2" : "1"}
                    color={'#27b84d'}
                    onClick={async () => {
                      let newPremim = user?.premium;
                      if (user?.premium) {
                        newPremim = 0;
                      } else {
                        newPremim = 1;
                      };
                      updateStateKey(setUser, user, ["premium", newPremim]);
                      await fetchWithAuth("/admin/users/" + user?.id, "PATCH", {
                        premium: newPremim,
                      });


                    }}
                  />
                  <CustomButton
                    label={user.flags.includes("BANNED") ? "Desbanir" : "Banir"}
                    icon={user.flags.includes("BANNED") ? "user-plus" : "user-minus"}
                    hierarchy={2}
                    color={'#ff6c6c'}
                    onClick={async () => {
                      let newFlags = user.flags;
                      if (user.flags.includes("BANNED")) {
                        newFlags = user.flags.filter(flag => flag != "BANNED");
                      } else {
                        newFlags.push("BANNED")
                      }
                      await fetchWithAuth("/admin/users/" + user?.id, "PATCH", {
                        flags: newFlags
                      });
                      getUser(user.id)
                    }}
                  />
                  <CustomButton
                    label={user.flags.includes("BANNED_DRAWN") ? "Poder Desenhar" : "Proibir Desenhar"}
                    icon={user.flags.includes("BANNED_DRAWN") ? "user-plus" : "user-minus"}
                    hierarchy={2}
                    color={'#ff6c6c'}
                    onClick={async () => {
                      let newFlags = user.flags;
                      if (user.flags.includes("BANNED_DRAWN")) {
                        newFlags = user.flags.filter(flag => flag != "BANNED_DRAWN");
                      } else {
                        newFlags.push("BANNED_DRAWN")
                      }
                      await fetchWithAuth("/admin/users/" + user?.id, "PATCH", {
                        flags: newFlags
                      });
                      getUser(user.id)
                    }}
                  />
                  <CustomButton
                    label={"Kick"}
                    icon={"user-x"}
                    hierarchy={2}
                    onClick={() => openPopup("admin_kick", { user })}
                  />
                  <CustomButton
                    label={user.flags.includes("SOCKET_WHITELISTED") ? "Remover Whitelist" : "Whitelist"}
                    icon={"list"}
                    hierarchy={2}
                    color={'#ffffff'}
                    onClick={async () => {
                      let newFlags = user.flags;
                      if (user.flags.includes("SOCKET_WHITELISTED")) {
                        newFlags = user.flags.filter(flag => flag != "SOCKET_WHITELISTED");
                      } else {
                        newFlags.push("SOCKET_WHITELISTED")
                      }
                      await fetchWithAuth("/admin/users/" + user?.id, "PATCH", {
                        flags: newFlags
                      });
                      getUser(user.id)
                    }}
                  />
                </footer>
              </fieldset>
            }
          </main>
        </MainLayout>
      </>
    );
  }

  else if (chosenPage === "auditlogs") {
    return (
      <>
        <CustomHead
          title={language.getString("PAGES.ADMIN.META_TITLE")}
          description={language.getString("PAGES.ADMIN.META_DESCRIPTION")}
          url={"https://pixelsplace.nemtudo.me/admin?page=users"}
        />
        <MainLayout>
          <main className={styles.main}>
            <h1>Registros</h1>
            {PageSelector}

            <fieldset>
              <legend>
                <strong>Busca filtrada</strong>
              </legend>
              <main>
                <section>
                  <label>Ação:</label>
                  <input type="text" value={auditLogsQuery.action} onChange={e => updateStateKey(setAuditLogsQuery, auditLogsQuery, ["action", e.target.value])} />
                </section>
                <section>
                  <label>ID Admin:</label>
                  <input type="text" value={auditLogsQuery.idAdmin} onChange={e => updateStateKey(setAuditLogsQuery, auditLogsQuery, ["idAdmin", e.target.value])} />
                </section>
              </main>
              <footer className={styles.buttonsContainer}>
                <CustomButton icon="search" label="Buscar" onClick={() => fetchAuditLogs(true)} />
              </footer>
            </fieldset>

            <fieldset>
              <legend>
                <strong>Registros</strong>
              </legend>
              <main className={styles.auditLogsGrid}>
                {auditLogs.map(log => (
                  <div
                    key={log.id}
                    className={styles.auditLogCard}
                  >
                    <div className={styles.auditLogHeader}>
                      <h2 className={styles.auditLogAction}>
                        {log.action}
                      </h2>

                      <span className={styles.auditLogDate}>
                        {formatDate(log.createdAt)}
                      </span>
                    </div>

                    <div className={styles.auditLogInfo}>
                      <span className={styles.auditLogAdmin}>
                        <span className={styles.auditLogIndicator}></span>
                        <strong>Admin:</strong> {log.admin.username} ({log.idAdmin})
                      </span>
                      {
                        log.details._targetUser && <span className={styles.auditLogTarget}>
                          <span className={styles.auditLogIndicator}></span>
                          <strong>Alvo:</strong><Link href={`/user/${log.details._targetUser.id}`}>{log.details._targetUser.username}</Link>({log.details._targetUser.id})
                        </span>
                      }
                    </div>

                    <div className={styles.auditLogDetails}>
                      <h3 className={styles.auditLogDetailsTitle}>
                        Detalhes
                      </h3>

                      <div className={styles.auditLogDetailsContent}>
                        {Object.entries(log.details).filter(([k]) => !k.startsWith("_")).map(([key, value]) => (
                          <div
                            key={key}
                            className={styles.auditLogDetailItem}
                          >
                            <span className={styles.auditLogDetailKey}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className={`${styles.auditLogDetailValue} ${typeof value === 'string' && value.length > 20 ? styles.auditLogDetailValueMono : ''}`}>
                              {formatDetailValue(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <CustomButton disabled={!auditLogsQuery.showLoadMore} onClick={() => {
                  fetchAuditLogs()
                }} label={auditLogsQuery.showLoadMore ? "Carregar mais" : "Você chegou ao final"} />
              </main>
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

  function formatDetailValue(value) {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'N/A';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }

    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }

    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR');
    }

    if (typeof value === 'string') {
      // Se for muito longo, trunca
      if (value.length > 100) {
        return value.substring(0, 100) + '...';
      }

      // Se parecer ser uma data ISO
      if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        return formatDate(value);
      }

      // Se parecer ser um ID/UUID
      if (value.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i)) {
        return value.substring(0, 8) + '...';
      }
    }

    return String(value);
  }

}
