type ButtonProps = {
    texto: string
    type?: "button" | "submit"
}

function Button({ texto, type = "button" }: ButtonProps) {
    return (
        <button type={type} className="btn-vermelho-grande">
            {texto}
        </button>
    )
}

export default Button