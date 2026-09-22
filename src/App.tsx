import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import AdminLogin from "./pages/AdminLogin"
import ProtectedRoute from "./routes/ProtectedRoute";
import SemPermissao from "./pages/SemPermissao";
import SessaoGuard from "./components/auth/SessaoGuard";

const Sobre = lazy(() => import("./pages/Sobre"))
const Frota = lazy(() => import("./pages/Frota"))
const Servicos = lazy(() => import("./pages/Servicos"))
const Contato = lazy(() => import("./pages/Contato"))
const Parceiros = lazy(() => import("./pages/Parceiros"))
const AreasAtendidas = lazy(() => import("./pages/AreasAtendidas"))
const Cliente = lazy(() => import("./pages/Cliente"))
const Motorista = lazy(() => import("./pages/Motorista"))
const Orcamento = lazy(() => import("./pages/Orcamento"))

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"))
const CargaDetalhe = lazy(() => import("./pages/CargaDetalhe"))
const AdminCargas = lazy(() => import("./pages/AdminCargas"))
const NovaCarga = lazy(() => import("./pages/NovaCarga"))
const EditarCarga = lazy(() => import("./pages/EditarCarga"))
const AdminCotacoes = lazy(() => import("./pages/AdminCotacoes"))
const NovaCotacao = lazy(() => import("./pages/NovaCotacao"))
const AdminClientes = lazy(() => import("./pages/AdminClientes"))
const NovoCliente = lazy(() => import("./pages/NovoCliente"))
const AdminMotoristas = lazy(() => import("./pages/AdminMotoristas"))
const NovoMotorista = lazy(() => import("./pages/NovoMotorista"))
const AdminVeiculos = lazy(() => import("./pages/AdminVeiculos"))
const NovoVeiculo = lazy(() => import("./pages/NovoVeiculo"))
const AdminViagens = lazy(() => import("./pages/AdminViagens"))
const NovaViagem = lazy(() => import("./pages/NovaViagem"))
const DetalheViagem = lazy(() => import("./pages/DetalheViagem"))
const AdminRelatorios = lazy(() => import("./pages/AdminRelatorios"))
const AdminBusca = lazy(() => import("./pages/AdminBusca"))
const EditarVeiculo = lazy(() => import("./pages/EditarVeiculo"))
const EditarCliente = lazy(() => import("./pages/EditarCliente"))
const EditarMotorista = lazy(() => import("./pages/EditarMotorista"))
const AdminUsuarios = lazy(() => import("./pages/AdminUsuarios"))
const NovoUsuario = lazy(() => import("./pages/NovoUsuario"))
const EditarUsuario = lazy(() => import("./pages/EditarUsuario"))

const MeuPerfil = lazy(() => import("./pages/MeuPerfil"))
const PainelCliente = lazy(() => import("./pages/PainelCliente"))
const PainelMotorista = lazy(() => import("./pages/PainelMotorista"))
const DetalheCargaCliente = lazy(() => import("./pages/DetalheCargaCliente"))
const PortalClienteHome = lazy(() => import("./pages/PortalClienteHome"))

function CarregandoRota() {
  return (
    <div role="status" className="rota-carregando">
      Carregando...
    </div>
  )
}



function App() {
  return (
    <BrowserRouter>
      <SessaoGuard />
      <Suspense fallback={<CarregandoRota />}>
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App
