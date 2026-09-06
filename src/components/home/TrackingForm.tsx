import { useState } from "react"

import Button from "../ui/Button"

type TrackingFormProps = {
    onBuscar: (codigo: string) => void
    loading: boolean
}

function TrackingForm({ onBuscar, loading }: TrackingFormProps) {
    const [codigo, setCodigo] = useState("")

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!codigo.trim()) {
            return
        }

        onBuscar(codigo.trim().toUpperCase())
    }

    return (
        <form className="form-rastreamento" onSubmit={handleSubmit}>
            <input
                type="text"
                name="codigo"
                placeholder="Digite o código da carga"
                maxLength={30}
                autoCapitalize="characters"
                autoComplete="off"
                required
                value={codigo}
                onChange={(event) => setCodigo(event.target.value)}
            />

            <Button
                texto={loading ? "Consultando..." : "Consultar Rastreamento"}
                type="submit"
            />
        </form>
    )
}

export default TrackingForm
