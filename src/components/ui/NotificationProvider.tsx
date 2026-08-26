import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";

export type NotificationType = "sucesso" | "erro" | "aviso" | "informacao";

type Notification = {
    id: number;
    tipo: NotificationType;
    mensagem: string;
};

type NotificationContextValue = {
    notificar: (
        tipo: NotificationType,
        mensagem: string,
        duracao?: number
    ) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notificacoes, setNotificacoes] = useState<Notification[]>([]);
    const proximoId = useRef(1);
    const temporizadores = useRef(new Map<number, ReturnType<typeof setTimeout>>());

    const remover = useCallback((id: number) => {
        setNotificacoes((atuais) => atuais.filter((item) => item.id !== id));

        const temporizador = temporizadores.current.get(id);
        if (temporizador) {
            clearTimeout(temporizador);
            temporizadores.current.delete(id);
        }
    }, []);

    const notificar = useCallback((
        tipo: NotificationType,
        mensagem: string,
        duracao = 4000
    ) => {
        const id = proximoId.current++;

        setNotificacoes((atuais) => [
            ...atuais,
            { id, tipo, mensagem },
        ]);

        const temporizador = setTimeout(() => remover(id), duracao);
        temporizadores.current.set(id, temporizador);
    }, [remover]);

    useEffect(() => {
        const timers = temporizadores.current;

        return () => {
            timers.forEach((temporizador) => clearTimeout(temporizador));
            timers.clear();
        };
    }, []);

    return (
        <NotificationContext.Provider value={{ notificar }}>
            {children}

            <div className="notificacoes-container" aria-live="polite">
                {notificacoes.map((notificacao) => (
                    <div
                        key={notificacao.id}
                        className={`notificacao notificacao-${notificacao.tipo}`}
                        role={notificacao.tipo === "erro" ? "alert" : "status"}
                    >
                        <span>{notificacao.mensagem}</span>
                        <button
                            type="button"
                            className="notificacao-fechar"
                            aria-label="Fechar notificação"
                            onClick={() => remover(notificacao.id)}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const contexto = useContext(NotificationContext);

    if (!contexto) {
        throw new Error("useNotification deve ser usado dentro de NotificationProvider.");
    }

    return contexto;
}
