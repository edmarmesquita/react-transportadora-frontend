import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Frota from "./pages/Frota"
import Servicos from "./pages/Servicos"
import Contato from "./pages/Contato"
import Parceiros from "./pages/Parceiros"
import AreasAtendidas from "./pages/AreasAtendidas"
import Cliente from "./pages/Cliente"
import Motorista from "./pages/Motorista"
import Orcamento from "./pages/Orcamento"
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"
import CargaDetalhe from "./pages/CargaDetalhe"
import AdminCargas from "./pages/AdminCargas"
import NovaCarga from "./pages/NovaCarga"
import EditarCarga from "./pages/EditarCarga"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/frota" element={<Frota />} />

        <Route path="/servicos" element={<Servicos />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/admin/carga/:id" element={<CargaDetalhe />} />

        <Route path="/admin/cargas" element={<AdminCargas />} />

        <Route path="/admin/cargas/nova" element={<NovaCarga />} />

        <Route path="/admin/cargas/editar/:id" element={<EditarCarga />} />

        <Route
          path="/areas-atendidas"
          element={<AreasAtendidas />}
        />

        <Route
          path="/orcamento"
          element={<Orcamento />}
        />

        <Route path="/parceiros" element={<Parceiros />} />

        <Route path="/contato" element={<Contato />} />

        <Route path="/cliente" element={<Cliente />} />

        <Route path="/motorista" element={<Motorista />} />

        <Route path="/orçamento" element={<Orcamento />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App