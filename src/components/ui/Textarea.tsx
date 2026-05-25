type TextareaProps = {
    label: string
    name?: string
    value?: string
    onChange?: (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => void
}

function Textarea({
    label,
    name,
    value,
    onChange,
}: TextareaProps) {
    return (
        <div className="linha-input">
            <label>{label}</label>

            <textarea
                name={name}
                rows={5}
                value={value}
                onChange={onChange}
            ></textarea>
        </div>
    )
}

export default Textarea