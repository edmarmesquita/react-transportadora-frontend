import { useMemo, useState } from "react";
import type { ReactNode } from "react";

type DataTableProps<T> = {
    columns: string[];
    data: T[];
    renderRow: (item: T) => ReactNode;
    emptyMessage?: string;

    searchable?: boolean;
    searchPlaceholder?: string;
    searchFields?: (keyof T)[];

    pageSize?: number;
};

function DataTable<T>({
    columns,
    data,
    renderRow,
    emptyMessage = "Nenhum registro encontrado.",
    searchable = false,
    searchPlaceholder = "Pesquisar...",
    searchFields = [],
    pageSize = 10,
}: DataTableProps<T>) {
    const [search, setSearch] = useState("");

    const filteredData = useMemo(() => {
        if (!searchable || !search.trim()) {
            return data;
        }

        const termo = search.toLowerCase();

        return data.filter((item) =>
            searchFields.some((field) => {
                const value = item[field];

                return String(value ?? "")
                    .toLowerCase()
                    .includes(termo);
            })
        );
    }, [data, search, searchable, searchFields]);

    const [page, setPage] = useState(1);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredData.length / pageSize)
    );

    const currentData = filteredData.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    return (
        <div className="usuarios-card">
            {searchable && (
                <div className="data-table-toolbar">
                    <input
                        className="data-table-search"
                        type="text"
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            )}

            <table className="usuarios-table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column}>{column}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {currentData.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                style={{
                                    textAlign: "center",
                                    padding: "30px",
                                    color: "#777",
                                }}
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        currentData.map((item, index) => (
                            <tr key={index}>{renderRow(item)}</tr>
                        ))
                    )}
                </tbody>
            </table>
            <div className="datatable-footer">

                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    ◀ Anterior
                </button>

                <span>

                    Página {page} de {totalPages}

                </span>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Próxima ▶
                </button>

            </div>
        </div>
    );
}

export default DataTable;