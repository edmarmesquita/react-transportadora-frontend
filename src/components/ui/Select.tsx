type SelectProps = {
    label: string
    name?: string
    value?: string
    onChange?: (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => void
}

function Select({
    label,
    name,
    value,
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
                <option value="fracionada">
                    Fracionada
                </option>

                <option value="lotacao">
                    Lotação
                </option>
            </select>
        </div>
    )
}

export default Select