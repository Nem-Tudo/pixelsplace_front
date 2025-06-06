import settings from "@/settings";
import { io } from "socket.io-client";

export const socket = io(settings.socketURL);