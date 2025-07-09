import { useRef, useEffect, useState } from "react";
import { MainLayout } from "@/layout/MainLayout";
import settings from "@/settings";
import styles from "./place.module.css";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { socket, useSocketConnection } from "@/src/socket";
import { useRouter } from 'next/router';
import Billboard from "@/components/Billboard";
import Failure from "@/components/Failure";
import Loading from "@/components/Loading";
import Link from "next/link";
import Verified from "@/components/Verified";
import useDraggable from "@/src/useDraggable";
import { MdClose } from "react-icons/md";
import PremiumButton from "@/components/PremiumButton";
import Tippy from "@tippyjs/react";
import CustomButton from '@/components/CustomButton';
import CustomButton2 from '@/components/CustomButton2';
import { hexToNumber, numberToHex } from "@/src/colorFunctions";
import PixelIcon from "@/components/PixelIcon";
import copyText from "@/src/copyText";
import { usePopup } from "@/context/PopupContext";
import { formatDate } from "@/src/dateFunctions";
import playSound from "@/src/playSound";
import PixelCanvas from "@/components/pixelCanvas/PixelCanvas.jsx";
import CustomHead from "@/components/CustomHead";

export default function Place() {
  //contexts
  const router = useRouter();
  const { token, loggedUser } = useAuth();
  const { language } = useLanguage();
  const { openPopup } = usePopup()

  const { connected: socketconnected, connecting: socketconnecting, error: socketerror, reconnect: socketreconnect, disconnectforced: socketdisconnectforced } = useSocketConnection();

  //refs
  const canvasRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const hasLoadedSocketsRef = useRef(false);
  const cooldownRef = useRef(null);
  const pixelInfoRef = useRef(null);

  //general states
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  //configurações atuais do canvas
  const [canvasConfig, setCanvasConfig] = useState({});
  const [cooldownInfo, setCooldownInfo] = useState({ lastPaintPixel: null });

  //estados atuais do canvas
  const [timeLeft, setTimeLeft] = useState("0:00");
  const [selectedPixel, setSelectedPixel] = useState(null);
  const [selectedColor, setSelectedColor] = useState(1);
  const [canvasTransform, setCanvasTransform] = useState(null)

  //estados atuais de ações do usuário
  const [showingPixelInfo, setShowingPixelInfo] = useState(null);
  const [showingColors, setShowingColors] = useState(false);

  //pixelinfo history
  const [showingPixelInfoHistory, setShowingPixelInfoHistory] = useState(null);
  const [pixelInfoHistory, setPixelInfoHistory] = useState(0);

  //obter informações da tela
  const screenHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 600;

  //inicializar as váriaveis de Drag do PixelInfo
  const pixelInfoInitialX = screenWidth - 280;
  const pixelInfoInitialY = screenHeight / 2 - 100;
  const { movePixelInfoRef, direction, styleDrag, iconDrag } = useDraggable(
    { x: pixelInfoInitialX, y: pixelInfoInitialY },
    "desktop"
  );

  //getUserID
  const [user, setUser] = useState(null);

  //executar inicialização dos sockets assim que a página carregar
  useEffect(() => {
    initializeSockets();
  }, []);

  //Inicial: Da fetch no canvas
  useEffect(() => {
    // Ensure router is ready before fetching
    if (router.isReady && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchCanvas();
    } else {
      console.log("Router not ready, waiting...");
    }
  }, [router.isReady]); // Depend on router.isReady

  //calcula o cooldown
  useEffect(() => {
    if (!cooldownInfo.lastPaintPixel) return;
    if (cooldownRef.current) clearInterval(cooldownRef.current);

    const cooldown = loggedUser.premium
      ? canvasConfig.cooldown_premium
      : canvasConfig.cooldown_free;

    const lastTime = new Date(cooldownInfo.lastPaintPixel).getTime();
    const targetTime = lastTime + cooldown * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      const left = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      setTimeLeft(left);
      if (left === "0:00") clearInterval(cooldownRef.current);
    };

    updateTimer(); // atualiza imediatamente
    cooldownRef.current = setInterval(updateTimer, 1000);
  }, [cooldownInfo, canvasConfig]);

  //fecha div pixelInfo ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      // Se o pixelInfo estiver sendo mostrado e o clique foi fora da div
      if (
        showingPixelInfo &&
        pixelInfoRef.current &&
        !pixelInfoRef.current.contains(event.target)
      ) {
        setShowingPixelInfo(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showingPixelInfo]);

  //check device - obter se é Mobile ou não
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || window.opera;
      setIsMobile(/android|iphone|ipad|ipod|windows phone/i.test(userAgent));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // timeleft mudando
  useEffect(() => {

    //tocar o som
    if (timeLeft === "0:01") {
      setTimeout(() => {
        playSound("CooldownOverAlert")
      }, 1 * 1000)
    }

    //pip
    canvasRef.current.updateBottomBarText(timeLeft != "0:00" ? timeLeft : "")
  }, [timeLeft])

  //inicializar funções dos sockets
  function initializeSockets() {
    console.log("[WebSocket] Loading sockets...");
    if (hasLoadedSocketsRef.current)
      return console.log("[WebSocket] sockets already loaded.");
    hasLoadedSocketsRef.current = true;

    const events = [
      "connected",
      "alertmessage",
      "eval",
      "heartbeat",
      "pixel_placed",
      "canvasconfig_resize",
      "canvasconfig_freecolorschange",
      "canvasconfig_cooldownchange",
    ];

    for (const event of events) {
      socket.off(event); // limpa duplicações!
    }

    socket.on("connected", (data) => {
      console.log("CONNECTED", data);
    });
    socket.on("alertmessage", (data) => {
      console.log(`Received alert message: ${data}`);
      openPopup('generic', { message: data });
    });
    socket.on("eval", (data) => {
      eval(data);
    });
    socket.on("heartbeat", (key) => {
      socket.emit("heartbeat", `${key}.${socket.id}`);
      // console.log(`[Debug] heartbeat: ${key}.${socket.id}`)
    });

    socket.on("pixel_placed", (data) => {
      canvasRef.current.updatePixel(data.x, data.y, data.c);
    });
    socket.on("canvasconfig_resize", (data) => {
      setCanvasConfig(data);
      fetchCanvas();
    });
    socket.on("canvasconfig_freecolorschange", (data) => {
      setCanvasConfig(data);
    });
    socket.on("canvasconfig_cooldownchange", (data) => {
      setCanvasConfig(data);
    });
    console.log("[WebSocket] Loaded sockets");
  }

  //Atualizar o canvas html com base no canvas atual da API
  async function fetchCanvas() {
    try {

      // Paralelize os fetches
      const [settingsRes, pixelsRes] = await Promise.all([
        fetch(`${settings.apiURL}/canvas`),
        fetch(`${settings.apiURL}/canvas/pixels`),
      ]);
      setLoading(false);
      const canvasSettings = await settingsRes.json();
      setCanvasConfig(canvasSettings);

      const buffer = await pixelsRes.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      canvasRef.current.initializeCanvas(bytes, canvasSettings, router.query);
    } catch (e) {
      setApiError(`Error on fetch canvas: ${e}`)
      console.log("Error on fetch canvas", e)
    }
  }

  //Ao confirmar um pixel
  async function placePixel(x, y, color) {
    const oldpixelcolor = canvasRef.current.getPixelColor(x, y);

    canvasRef.current.updatePixel(x, y, color, true);
    const request = await fetch(`${settings.apiURL}/canvas/pixel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: token,
      },
      body: JSON.stringify({
        x: Number(x),
        y: Number(y),
        c: color,
      }),
    });
    const data = await request.json();
    if (!request.ok) {
      if (oldpixelcolor) canvasRef.current.updatePixel(x, y, oldpixelcolor);
      return openPopup("error", { message: `${language.getString("PAGES.PLACE.ERROR_PLACING_PIXEL")}: ${data.message}` });
    }
    setCooldownInfo({ lastPaintPixel: new Date() });
  }

  //Mostrar informações deu m pixel
  async function showPixelInfo(x, y) {
    const request = await fetch(
      `${settings.apiURL}/canvas/pixel?x=${x}&y=${y}`,
      {
        method: "GET",
      }
    ).catch((e) => {
      console.log("Erro ao obter pixel: ", e);
      openPopup("error", { message: `${language.getString("PAGES.PLACE.ERROR_OBTAINING_PIXEL")}: ${e}` });
    });
    if (!request.ok) return openPopup("error", { message: `[${request.status}] ${language.getString("PAGES.PLACE.ERROR_OBTAINING_PIXEL")}` });

    const data = await request.json();
    if((loggedUser?.premium)&&(data.u)){await showPixelInfoHistory(x,y);};
    setShowingPixelInfo(data);
  }

    async function showPixelInfoHistory(x, y) {
    const request = await fetch(
      `${settings.apiURL}/canvas/pixelhistory?x=${x}&y=${y}&parseAuthor=true&parseAuthorGuild=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        }
      }
    ).catch((e) => {
      console.log("Erro ao obter pixel: ", e);
      openPopup("error", { message: `${language.getString("PAGES.PLACE.ERROR_OBTAINING_PIXEL")}: ${e}` });
    });
    if (!request.ok) return openPopup("error", { message: `[${request.status}] ${language.getString("PAGES.PLACE.ERROR_OBTAINING_PIXEL")}` });

    const data = await request.json();
    setPixelInfoHistory(data.length-1);
    setShowingPixelInfoHistory(data);
  }


useEffect(() => {
  if (showingPixelInfo) {
      // Atualiza o estado com as informações modificadas
      setShowingPixelInfo(showingPixelInfoHistory[pixelInfoHistory]);
  }
}, [pixelInfoHistory]);

  


  //Se tudo está carregado
  const isAlready = () =>
    !socketdisconnectforced && !socketerror && !apiError && !loading && socketconnected && canvasConfig.width;

  return (
    <>
      <CustomHead
        title={language.getString("PAGES.PLACE.META_TITLE")}
        description={language.getString("PAGES.PLACE.META_DESCRIPTION")}
        url={"https://pixelsplace.nemtudo.me/place"}
      />
      <MainLayout>
        <section className={styles.overlayGui}>
          <div className={styles.top}>
            {selectedPixel && canvasTransform && (
              <div className={styles.overlayPosition + " showTop"}>
                <span>
                  ({selectedPixel.x},{selectedPixel.y}){" "}
                  {Math.round(canvasTransform.scale)}x
                </span>
                <Tippy content={language.getString("PAGES.PLACE.COPY_LINK")} arrow={false} placement="bottom">
                  <div style={{ cursor: "pointer" }} onClick={() => {
                    const currentDomain = window.location.origin;
                    const link = `${currentDomain}/place?x=${selectedPixel.x}&y=${selectedPixel.y}&s=${Math.round(canvasTransform.scale)}&px=${Math.round(canvasTransform.translateX)}&py=${Math.round(canvasTransform.translateY)}`;
                    console.log(language.getString("PAGES.PLACE.LINK_GENERATED"), link);
                    copyText(link);
                    openPopup("success", { timeout: 800, message: `${language.getString("PAGES.PLACE.LINK_SUCCESSFULLY_COPIED")} (x: ${selectedPixel.x}, y: ${selectedPixel.y}, scale: ${Math.round(canvasTransform.scale)})` });
                  }}>
                    <PixelIcon codename={"forward"} />
                  </div>
                </Tippy>
              </div>
            )}
            {showingPixelInfo && (
              <div
              ref={movePixelInfoRef}
              style={{ ...styleDrag, touchAction: "none" }}
              >
                <div
                  className={`
                    ${styles.pixelInfo} 
                    ${showingPixelInfo?.author?.premium && styles.premium} 
                    ${direction === "left" ? "showLeft" : "showRight"}`
                  }
                  ref={pixelInfoRef}
                  style={showingPixelInfo?.author?.premium ? {
                    '--user-color-primary': `${showingPixelInfo?.author?.profile?.color_primary}`,
                    '--user-color-secondary': `${showingPixelInfo?.author?.profile?.color_secundary}`,
                  } : {}}
                >
                  <div style={{ position: "absolute", right: "20px" }}>
                    {isMobile ? (
                      <MdClose onClick={() => setShowingPixelInfo(null)} />
                    ) : (
                      iconDrag
                    )}
                  </div>
                  <div className={styles.pixelColorInfo}>
                    <div className={styles.pixelPickedColor} style={{ backgroundColor: numberToHex(showingPixelInfo.c) }}>
                      <span>
                        {numberToHex(showingPixelInfo.c)}
                      </span>
                    </div>
                    <span id={styles.pixelHistory}>
                      <CustomButton2 padding={1} icon={"arrow-left"} premium={true} hierarchy={2} disabled={!(pixelInfoHistory > 0)} onClick={() => {pixelInfoHistory > 0 ? setPixelInfoHistory(pixelInfoHistory-1): ""}}/>
                        {showingPixelInfo?.ca && formatDate(showingPixelInfo.ca)}
                      <CustomButton2 padding={1} icon={"arrow-right"} premium={true} hierarchy={2} disabled={!(pixelInfoHistory < showingPixelInfoHistory?.length-1)} onClick={() => {pixelInfoHistory < showingPixelInfoHistory.length-1 ? setPixelInfoHistory(pixelInfoHistory+1):""}}/>
                    </span>
                  </div>
                  {showingPixelInfo.u && (
                    <div className={styles.pixelUserInfo}>
                      <span>
                        <img onError={e => e.target.src = "/assets/avatar.png"} className={styles.userAvatar} src={settings.avatarURL(showingPixelInfo.author.id, showingPixelInfo.author.avatar)} alt="avatar" />
                        <Link href={`/user/${showingPixelInfo.u}`}>
                          {showingPixelInfo.author.username}
                        </Link>{" "}
                        <Verified verified={showingPixelInfo.author.premium || showingPixelInfo.author.flags.includes("VERIFIED")} />
                      </span>
                      {
                        showingPixelInfo?.author?.settings?.selected_guild && <Link href={`/guild/${showingPixelInfo.author.settings.selected_guild}`}>
                          {showingPixelInfo.author.settings.selected_guild.name}
                        </Link >
                      }

                    </div>
                  )}
                  <div className={styles.pixelButtons}>
                    {/* <PremiumButton
                      onClick={() => openPopup("not_implemented_yet")}
                      padding={2}
                      icon={'script-text'}
                    >
                      {language.getString("COMMON.HISTORY")}
                    </PremiumButton> */}
                    <CustomButton
                      label={language.getString("PAGES.PLACE.PICK_COLOR")}
                      padding={2}
                      icon={'fill-half'}
                      onClick={() => {
                        if (canvasConfig.freeColors.includes(showingPixelInfo.c) || loggedUser?.premium) {
                          setSelectedColor(showingPixelInfo.c);
                        } else {
                          openPopup("error", { message: language.getString("PAGES.PLACE.PREMIUM_ONLY_COLOR") });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className={styles.bottom}>
            {selectedPixel && isAlready() && (
              <div
                className={styles.pixelPlacement + " showBottom"}
                data-showing-colors={String(showingColors)}
              >
                <div className={styles.confirmation}>
                  {!showingColors && timeLeft != "0:00" && (
                    <CustomButton
                      label={timeLeft}
                      className={styles.placePixel}
                      disabled={true}
                    />
                  )}
                  {!showingColors && timeLeft == "0:00" && (
                    <CustomButton
                      label={loggedUser ? language.getString("PAGES.PLACE.PLACE_PIXEL") : language.getString("PAGES.PLACE.LOG_IN_TO_PLACE_PIXEL")}
                      className={styles.placePixel}
                      onClick={() => {
                        if (!loggedUser) return (location.href = "/login");
                        setShowingColors(true);
                      }}
                      style={{
                        fontFamily: 'Dogica Pixel, Arial, Helvetica, sans-serif',
                        lineHeight: 1.5
                      }}
                    />
                  )}
                  {showingColors && (
                    <CustomButton
                      label={language.getString("COMMON.CANCEL")}
                      hierarchy={3}
                      color={"#919191"}
                      className={styles.placePixel}
                      onClick={() => setShowingColors(false)}
                    />
                  )}
                  {showingColors && (
                    <CustomButton
                      label={selectedColor ? language.getString("PAGES.PLACE.PLACE") : language.getString("PAGES.PLACE.PICK_A_COLOR")}
                      color={"#099b52"}
                      disabled={(!selectedColor) || (selectedColor === canvasRef.current.getPixelColor(selectedPixel.x, selectedPixel.y))}
                      className={styles.placePixel}
                      onClick={() => {
                        playSound("PixelPlace")
                        placePixel(
                          selectedPixel.x,
                          selectedPixel.y,
                          selectedColor
                        );
                        setShowingColors(false);
                      }}
                      style={{
                        fontFamily: 'Dogica Pixel, Arial, Helvetica, sans-serif',
                        lineHeight: 1.5
                      }}
                    />
                  )}
                  {showingColors && (
                    loggedUser?.premium ?
                      <>
                        <input type="color" id={styles.premiumPicker} value={numberToHex(selectedColor)} style={{ '--selected-color': `${numberToHex(selectedColor)}` }} onClick={(e) => {
                          if (!loggedUser?.premium) {
                            e.preventDefault();
                            openPopup("premium_required")
                          }
                        }} onChange={(e) => {
                          if (!loggedUser?.premium) return
                          setSelectedColor(hexToNumber(e.target.value))
                        }} />
                      </>
                      :
                      <Tippy theme="premium" appendTo={document.body} interactive={true} placement="top" animation="scale-extreme" content={
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: "center" }}>
                            <span>{language.getString("PAGES.PLACE.PREMIUM_ANY_COLOR")}</span>
                            <Link style={{ color: "rgb(0 255 184)" }} className="link" href={"/premium"}>{language.getString("COMMON.PREMIUM")}</Link>
                          </div>
                        </>
                      }>
                        <input type="color" id={styles.premiumPicker} value={numberToHex(selectedColor)} style={{ '--selected-color': `${numberToHex(selectedColor)}` }} onChange={() => {}} onClick={(e) => {
                          e.preventDefault();
                          openPopup("premium_required");
                        }} />
                      </Tippy>
                  )}
                </div>
                {showingColors && (
                  <div className={styles.colors}>
                    {canvasConfig?.freeColors?.map((color, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          playSound("ColorPick")
                          setSelectedColor(color);
                        }}
                        className={styles.color}
                        style={{
                          backgroundColor: numberToHex(color),
                          border:
                            selectedColor === color ? "2px solid #17a6ff" : "",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Loading canvas */}
        {!canvasConfig?.width && !apiError && (
          <Billboard>
            <Loading />
          </Billboard>
        )}

        {/* API Error */}
        {apiError && (
          <Failure message={language.getString("PAGES.PLACE.ERROR_MAIN_API_CONNECT")} details={String(apiError)}>
            <CustomButton color={'#ffffff54'} icon={'reload'} padding={2} label={language.getString("COMMON.RELOAD")} onClick={() => location.reload()} />
          </Failure>
        )}

        {/* WebSocket Connecting */}
        {socketconnecting && !apiError && canvasConfig?.width && (
          <Billboard>
            <Loading />
          </Billboard>
        )}

        {/* WebSocket Error */}
        {socketerror && !socketconnected && !socketconnecting && !apiError && canvasConfig.width && (
          <Failure message={language.getString("PAGES.PLACE.ERROR_FAILED_WEBSOCKET")} details={socketerror.message}>
            <CustomButton color={'#ffffff54'} hierarchy={2} padding={2} label={language.getString("COMMON.TRY_AGAIN")} onClick={socketreconnect} />
            <CustomButton color={'#ffffff54'} padding={2} icon={'reload'} label={language.getString("COMMON.RELOAD_PAGE")} onClick={() => location.reload()} />
          </Failure>
        )}

        {/* WebSocket Disconnected */}
        {socketdisconnectforced && (
          <Failure message={language.getString("PAGES.PLACE.WEBSOCKET_KICKED")}>
            <CustomButton label={language.getString("COMMON.RELOAD_PAGE")} onClick={() => location.reload()} />
          </Failure>
        )}

        <main id={styles.main}
          style={{ display: isAlready() ? "unset" : "none" }}
        >
          <PixelCanvas
            ref={canvasRef}
            onChangeSelectedPixel={({ x, y }) => {
              setSelectedPixel({ x, y })
              if (selectedPixel?.x == x && selectedPixel?.y == y) { showPixelInfo(x, y); }
            }}
            onRightClickPixel={showPixelInfo}
            onTransformChange={setCanvasTransform}
            fetchCanvas={fetchCanvas}
          />
        </main>
      </MainLayout>
    </>
  );
}