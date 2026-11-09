import { createContext, useContext } from "react";

export type NotificationType = "sucesso" | "erro" | "aviso" | "informacao";

type NotificationContextValue = {
    notificar: (tipo: NotificationType, mensagem: string, duracao?: number) => void;
};

export const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotification() {
    const contexto = useContext(NotificationContext);

    if (!contexto) {
        throw new Error("useNotification deve ser usado dentro de NotificationProvider.");
    }

    return contexto;
}
