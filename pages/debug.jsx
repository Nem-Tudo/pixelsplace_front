import Head from "next/head";
import { useRef, useEffect, useState } from "react";
import { MainLayout } from "@/layout/MainLayout";
import settings from "@/settings";
import styles from "./place.module.css";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { socket, useSocketConnection } from "@/src/socket";
import { useRouter } from 'next/router';
import BillboardContent from "@/components/BillboardContent";
import Loading from "@/components/Loading";
import Link from "next/link";
import Verified from "@/components/Verified";
import useDraggable from "@/src/useDraggable";
import { MdDragIndicator, MdClose } from "react-icons/md";
import PremiumButton from "@/components/PremiumButton";
import Tippy from "@tippyjs/react";
import CustomButton from '@/components/CustomButton';
import { FaShare } from "react-icons/fa";
import { hexToNumber, numberToHex } from "@/src/colorFunctions";
import PixelIcon from "@/components/PixelIcon";
import copyText from "@/src/copyText";
import { usePopup } from "@/context/PopupContext";
import Failure from "@/components/Failure";

export default function TestScreen() {
  const router = useRouter();

  //contexts
  const { token, loggedUser } = useAuth();
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
        {
          openPopup("temporary", {timeout: 1000})
        }
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