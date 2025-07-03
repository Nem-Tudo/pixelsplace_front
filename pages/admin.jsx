import styles from "./admin.module.css";
import settings from "@/settings.js";
import { MainLayout } from "@/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef, use } from "react";
import Cookies from 'js-cookie'
import checkFlags from "@/src/checkFlags";
import CustomButton from '@/components/CustomButton';
import { useRouter } from "next/router";
import PixelIcon from "@/components/PixelIcon";
import { dateToString } from "@/src/dateFunctions";
import copyText from "@/src/copyText";
import updateStateKey from "@/src/updateStateKey";
import Verified from "@/components/Verified";
import { usePopup } from '@/context/PopupContext';
import ToggleSwitch from "@/components/ToggleSwitch";
import CustomHead from "@/components/CustomHead";

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
  const [chosenPage, setChosenPage] = useState();
  const [canvaSettings, setCanvaSettings] = useState();

  const [buildsOverride, setBuildsOverride] = useState([]);

  const [showColorsArray, setShowingColorsArray] = useState(false);

  const [freeColorsInput, setFreeColorsInput] = useState("");

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
      console.log(data);
    }

    if (res.status != 200)
      return { error: true, status: res.status, message: data.message };
  }

  const [user, setUser] = useState(null);

  const fetchCanvas = async () => {
    const res = await fetch(`${settings.apiURL}/canvas`);
    const data = await res.json();
    console.log(data);
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
    if (!res.ok) return;
    const data = await res.json();
    setStats(data);
  }

  // Inicialização da página baseada na URL
  useEffect(() => {
    if (router.isReady) {
      const pageFromUrl = router.query.page;
      const idUserSearch = router.query.Search;
      const validPages = ['canvas', 'general', 'users'];

      if (pageFromUrl && validPages.includes(pageFromUrl)) {
        setChosenPage(pageFromUrl);
      } else {
        setChosenPage('canvas'); // página padrão
      }

      if ((pageFromUrl == 'users') && (idUserSearch))
      {
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
        return openPopup("error", {message: `Erro ao buscar builds: ${response.message || 'Erro desconhecido'}`});
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
      openPopup("error", {message: `${err.message}`});
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

  // Aguarda inicialização da página
  if (!chosenPage) {
    return (
      <MainLayout>
        <div>Carregando...</div>
      </MainLayout>
    );
  }

  const PageSelector = (
    <div className={styles.pageSelector}>
      <input checked={chosenPage === 'canvas'} type={"radio"} name={"pagina"} id={"pagina_canvas"} value={"canvas"} onChange={() => setChosenPage('canvas')} />
      <label htmlFor={"pagina_canvas"}>
        <PixelIcon codename={'frame'} />
        Canvas
      </label>

      <input checked={chosenPage === 'general'} type={"radio"} name={"pagina"} id={"pagina_general"} value={"general"} onChange={() => setChosenPage('general')} />
      <label htmlFor={"pagina_general"}>
        <PixelIcon codename={'sliders-2'} />
        Geral
      </label>

      <input checked={chosenPage === 'users'} type={"radio"} name={"pagina"} id={"pagina_users"} value={"users"} onChange={() => setChosenPage('users')} />
      <label htmlFor={"pagina_users"}>
        <PixelIcon codename={'user'} />
        Usuários
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
              <footer className={styles.buttonsContainer}>
                <CustomButton label={'Executar Eval'} icon={'play'} disabled={loading} onClick={async () => {
                  if (!evalCode.trim()) return openPopup("error", {message: "Insira o código."});
                  openPopup("confirm", {
                    message: "Tem certeza que deseja executar este código em todos os clients?",
                    execute: async () => {
                      const res = await fetchWithAuth("/admin/eval", "POST", {
                        content: evalCode,
                      });
                      res && openPopup("success", {message: `Executado em ${res.count} clients.`});
                    }
                  })
                }}
                />
              </footer>
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
              <footer className={styles.buttonsContainer}>
                <CustomButton label={'Enviar alerta'} icon={'message-arrow-right'} disabled={loading} onClick={async () => {
                  if (!alertMessage.trim()) return openPopup("error", {message: "Insira a mensagem."});
                  openPopup("confirm", {
                    message: "Deseja enviar essa mensagem para todos os clients?",
                    execute: async () => {
                      const res = await fetchWithAuth("/admin/alertmessage", "POST", {
                        content: alertMessage,
                      });
                      res && openPopup('success', {message: `Mensagem enviada para ${res.count} clients.`});
                    }
                  })
                }}
                />
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
                      res && openPopup('success', {message: `Desconectados: ${res.count}`});
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
                      let newWhitelisted = setCanvaSettings?.whitelisted ;
                      if (setCanvaSettings?.whitelisted ) {
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
                    let newOnlyFreeColors = setCanvaSettings?.onlyFreeColors ;
                    if (setCanvaSettings?.onlyFreeColors ) {
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
                            openPopup('success', {message: `Link copiado e assinado!`});
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
                                  openPopup('success', {message: "Build excluída com sucesso."});
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
                  <img src={settings.avatarURL(user.id, user.avatar)} style={{ width: "50px", borderRadius: "12px" }} />
                  <section>
                    <span>Nome: {user?.display_name} (@{user?.username}) <Verified verified={user?.premium} /></span>
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
                      console.log(user?.id);
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
                      // console.log("Antes: "+user?.premium)
                      let newPremim = user?.premium;
                      if(user?.premium){
                        newPremim = 0;
                      } else {
                        newPremim = 1;
                      };
                      // console.log("Depois: "+newPremim)
                      updateStateKey(setUser, user, ["premium", newPremim]);
                      // console.log(user?.id);
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

  function removeItemFromArray(arr, index) {
    if (index < 0 || index >= arr.length) return arr;
    return [...arr.slice(0, index), ...arr.slice(index + 1)];
  }

}