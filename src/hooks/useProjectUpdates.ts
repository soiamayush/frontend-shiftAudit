// src/hooks/useProjectUpdates.ts
"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./usAuth";

interface RouteAnalysisUpdate {
  routeId: string;
  status: string;
  // Add other relevant properties based on your actual update structure
}


export default function useProjectUpdates(
  projectId: string,
  onUpdate: (update: RouteAnalysisUpdate) => void
) {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    // 1) establish socket connection with auth
    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: { token },
    });

    // 2) once connected, join the Redis‑backed room
    socket.on("connect", () => {
      socket.emit("joinProjectRoom", projectId);
    });

    // 3) listen for each per‑route update
    socket.on("routeAnalyzed", onUpdate);

    // 4) cleanup on unmount
    return () => {
      socket.off("routeAnalyzed", onUpdate);
      socket.disconnect();
    };
  }, [projectId, token, onUpdate]);
}
