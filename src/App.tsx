import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Sobre from "./pages/Sobre"
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
import AdminCotacoes from "./pages/AdminCotacoes"
import NovaCotacao from "./pages/NovaCotacao"
import AdminClientes from "./pages/AdminClientes"
import NovoCliente from "./pages/NovoCliente"
import AdminMotoristas from "./pages/AdminMotoristas"
import NovoMotorista from "./pages/NovoMotorista"
import AdminVeiculos from "./pages/AdminVeiculos"
import NovoVeiculo from "./pages/NovoVeiculo"
import AdminViagens from "./pages/AdminViagens"
import NovaViagem from "./pages/NovaViagem"
import DetalheViagem from "./pages/DetalheViagem"
import AdminRelatorios from "./pages/AdminRelatorios"
import AdminBusca from "./pages/AdminBusca"
import EditarVeiculo from "./pages/EditarVeiculo"
import EditarCliente from "./pages/EditarCliente"
import EditarMotorista from "./pages/EditarMotorista"
import AdminUsuarios from "./pages/AdminUsuarios"
import NovoUsuario from "./pages/NovoUsuario"
import EditarUsuario from "./pages/EditarUsuario";
import ProtectedRoute from "./routes/ProtectedRoute";
import MeuPerfil from "./pages/MeuPerfil";
import PainelCliente from "./pages/PainelCliente";
import PainelMotorista from "./pages/PainelMotorista";
import DetalheCargaCliente from "./pages/DetalheCargaCliente";
import SemPermissao from "./pages/SemPermissao";
import PortalClienteHome from "./pages/PortalClienteHome";
import SessaoGuard from "./components/auth/SessaoGuard";



function App() {
  return (
    <BrowserRouter>
      <SessaoGuard />
      <Routes>
        {/* ROTAS PÚBLICAS */}
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/frota" element={<Frota />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/parceiros" element={<Parceiros />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/areas-atendidas" element={<AreasAtendidas />} />
        <Route path="/orcamento" element={<Orcamento />} />

        <Route path="/cliente" element={<Cliente />} />
        <Route path="/motorista" element={<Motorista />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        {/* DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              perfisPermitidos={[
                "administrador",
                "operador",
              ]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* CARGAS */}
        <Route
          path="/admin/cargas"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <AdminCargas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cargas/:id"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <CargaDetalhe />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portal/cliente/minhas-cargas/:id"
          element={
            <ProtectedRoute perfisPermitidos={["cliente"]}>
              <DetalheCargaCliente />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cargas/nova"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <NovaCarga />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cargas/editar/:id"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <EditarCarga />
            </ProtectedRoute>
          }
        />

        {/* CLIENTES */}
        <Route
          path="/admin/clientes"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <AdminClientes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/clientes/novo"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <NovoCliente />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/clientes/:id/editar"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <EditarCliente />
            </ProtectedRoute>
          }
        />

        {/* MOTORISTAS */}
        <Route
          path="/admin/motoristas"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <AdminMotoristas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/motoristas/novo"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <NovoMotorista />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/motoristas/:id/editar"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <EditarMotorista />
            </ProtectedRoute>
          }
        />

        {/* VEÍCULOS */}
        <Route
          path="/admin/veiculos"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <AdminVeiculos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/veiculos/novo"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <NovoVeiculo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/veiculos/:id/editar"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <EditarVeiculo />
            </ProtectedRoute>
          }
        />

        {/* VIAGENS */}
        <Route
          path="/admin/viagens"
          element={
            <ProtectedRoute
              perfisPermitidos={[
                "administrador",
                "operador",
                "motorista",
              ]}
            >
              <AdminViagens />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/viagens/nova"
          element={
            <ProtectedRoute
              perfisPermitidos={[
                "administrador",
                "operador",
              ]}
            >
              <NovaViagem />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portal/motorista/minhas-viagens/:id"
          element={
            <ProtectedRoute perfisPermitidos={["motorista"]}>
              <DetalheViagem />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/viagens/:id"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <DetalheViagem />
            </ProtectedRoute>
          }
        />

        {/* COTAÇÕES */}
        <Route
          path="/admin/cotacoes"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <AdminCotacoes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cotacoes/nova"
          element={
            <ProtectedRoute
              perfisPermitidos={[
                "administrador",
                "operador",
              ]}
            >
              <NovaCotacao />
            </ProtectedRoute>
          }
        />

        {/* RELATÓRIOS */}
        <Route
          path="/admin/relatorios"
          element={
            <ProtectedRoute perfisPermitidos={["administrador"]}>
              <AdminRelatorios />
            </ProtectedRoute>
          }
        />

        {/* BUSCA */}
        <Route
          path="/admin/busca"
          element={
            <ProtectedRoute
              perfisPermitidos={["administrador", "operador"]}
            >
              <AdminBusca />
            </ProtectedRoute>
          }
        />

        {/* USUÁRIOS */}
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute perfisPermitidos={["administrador"]}>
              <AdminUsuarios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/usuarios/novo"
          element={
            <ProtectedRoute perfisPermitidos={["administrador"]}>
              <NovoUsuario />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/usuarios/editar/:id"
          element={
            <ProtectedRoute perfisPermitidos={["administrador"]}>
              <EditarUsuario />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portal/cliente/perfil"
          element={
            <ProtectedRoute perfisPermitidos={["cliente"]}>
              <MeuPerfil />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portal/cliente"
          element={
            <ProtectedRoute perfisPermitidos={["cliente"]}>
              <PortalClienteHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portal/cliente/minhas-cargas"
          element={
            <ProtectedRoute perfisPermitidos={["cliente"]}>
              <PainelCliente />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portal/motorista"
          element={
            <ProtectedRoute perfisPermitidos={["motorista"]}>
              <PainelMotorista />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sem-permissao"
          element={<SemPermissao />}
        />

        <Route
          path="/admin/meu-perfil"
          element={
            <ProtectedRoute
              perfisPermitidos={[
                "administrador",
                "operador",
                "motorista",
              ]}
            >
              <MeuPerfil />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App
