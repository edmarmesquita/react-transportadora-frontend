type InputProps = {
    label: string
    type?: string
    name?: string
    placeholder?: string
    required?: boolean
    value?: string
    onChange?: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void
}

function Input({
    label,
    type = "text",
    name,
    placeholder,
    required,
    value,
    onChange,
}: InputProps) {
    return (
        <div className="linha-input">
            <label>{label}</label>

            <input
                type={type}
                name={name}
                placeholder={placeholder}
                required={required}
                value={value}
                onChange={onChange}
            />
        </div>
    )
}

export default Input