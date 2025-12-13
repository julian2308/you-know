// src/conf/ws.ts
import { Client } from "@stomp/stompjs";

export const client = new Client({
  brokerURL: "ws://localhost:8080/ws",
  reconnectDelay: 5000,
});
