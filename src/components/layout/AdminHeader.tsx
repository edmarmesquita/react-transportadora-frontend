import type { ReactNode } from "react";


type AdminHeaderProps = {
    title: string;
    subtitle: string;
    children?: ReactNode;
};

function AdminHeader({
    title,
    subtitle,
    children,
}: AdminHeaderProps) {
    return (
        <div className="admin-header">

            <div>

                <h1>{title}</h1>

                <p>{subtitle}</p>

            </div>

            <div>

                {children}

            </div>

        </div>
    );
}

export default AdminHeader;