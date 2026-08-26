type StatusBadgeProps = {
    ativo: boolean;
};

function StatusBadge({ ativo }: StatusBadgeProps) {
    return (
        <span className={ativo ? "badge badge-ativo" : "badge badge-inativo"}>
            {ativo ? "Ativo" : "Inativo"}
        </span>
    );
}

export default StatusBadge;