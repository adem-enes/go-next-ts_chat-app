import React, { ReactNode, createContext, useState } from 'react';

type Conn = WebSocket | null;

export const WebSocketContext = createContext<{
    conn: Conn,
    setConn: (c: Conn) => void
}>({
    conn: null,
    setConn: () => { }
});

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
    const [conn, setConn] = useState<Conn>(null);

    return (
        <WebSocketContext.Provider value={{ conn, setConn }}>
            {children}
        </WebSocketContext.Provider>
    )
}
