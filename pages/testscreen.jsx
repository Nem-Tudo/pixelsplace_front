import Head from "next/head";
import { MainLayout } from "@/layout/MainLayout";
import { useLanguage } from "@/context/LanguageContext";
import BillboardContent from "@/components/BillboardContent";
import CustomButton from '@/components/CustomButton';
import { usePopup } from "@/context/PopupContext";
import Failure from "@/components/Failure";

export default function TestScreen() {

  //contexts
  const { language } = useLanguage();
  const { openPopup } = usePopup()

  return (
    <>
      <Head>
        <title>PixelsPlace</title>
        <meta name="description" content={language.getString("PAGES.PLACE.META_DESCRIPTION")} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#80bbff" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>
        {/* Loading canvas */}
        {/*!canvasConfig?.width && !apiError && (
          <BillboardContent centerscreen={true} type="normal-white">
            {" "}
            <Loading width={"50px"} />{" "}
          </BillboardContent>
        )*/}

        {/* API Error */}
        <Failure centerscreen={true} type="warn" expand={String(apiError)}>
          <span>{language.getString("PAGES.PLACE.ERROR_MAIN_API_CONNECT")}</span>
          <CustomButton label={language.getString("COMMON.RELOAD")} onClick={() => location.reload()} />
        </Failure>

        {/* WebSocket Connecting */}
        {/*socketconnecting && !apiError && canvasConfig?.width && (
          <BillboardContent centerscreen={true} type="normal-white">
            <Loading width={"50px"} />
          </BillboardContent>
        )*/}

        {/* WebSocket Error */}
        {/*socketerror && !socketconnected && !socketconnecting && !apiError && canvasConfig.width && (
          <BillboardContent centerscreen={true} type="warn" expand={socketerror.message}>
            <span>{language.getString("PAGES.PLACE.ERROR_FAILED_WEBSOCKET")}</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <CustomButton label={language.getString("COMMON.TRY_AGAIN")} onClick={socketreconnect} />
              <CustomButton label={language.getString("COMMON.RELOAD_PAGE")} onClick={() => location.reload()} />
            </div>
          </BillboardContent>
        )*/}

        {/* WebSocket Disconnected */}
        {/*socketdisconnectforced && (
          <BillboardContent centerscreen={true} type="warn">
            <span>{language.getString("PAGES.PLACE.WEBSOCKET_KICKED")}</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <CustomButton label={language.getString("COMMON.RELOAD_PAGE")} onClick={() => location.reload()} />
            </div>
          </BillboardContent>
        )*/}
      </MainLayout>
    </>
  );
}