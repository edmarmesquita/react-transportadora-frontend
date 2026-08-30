export type LoginRequest = {
    usuario: string;
    senha: string;
};

export type UsuarioLogado = {
    id: number;
    nome: string;
    usuario?: string;
    perfil: string;
};

export type LoginResponse = {
    mensagem: string;
    access_token: string;
    usuario: UsuarioLogado;
};
