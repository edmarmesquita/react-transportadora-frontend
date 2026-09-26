type SelectProps = {
    label: string
    name?: string
    value?: string
    options?: Array<{ value: string; label: string }>
    onChange?: (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => void
}

function Select({
    label,
    name,
    value,
    options = [
        { value: "fracionada", label: "Carga fracionada" },
        { value: "lotacao", label: "Carga lotação" },
    ],
    onChange,
}: SelectProps) {
    return (
        <div className="linha-input">
            <label>{label}</label>

            <select
                name={name}
                value={value}
                onChange={onChange}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default Select
