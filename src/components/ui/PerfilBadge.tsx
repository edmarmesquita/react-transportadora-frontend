type PerfilBadgeProps = {
    perfil: string;
};

function PerfilBadge({ perfil }: PerfilBadgeProps) {
    return <span className={`badge perfil-${perfil}`}>{perfil}</span>;
}

export default PerfilBadge;