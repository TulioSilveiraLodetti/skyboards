import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import LimiteModal from "./components/LimiteModal";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Produtos from "./pages/Produtos";
import ProdutoDetalhe from "./pages/ProdutoDetalhe";
import Carrinho from "./pages/Carrinho";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Conta from "./pages/Conta";
import Admin from "./pages/Admin";
import Trocas from "./pages/Trocas";
import QuemSomos from "./pages/QuemSomos";
import NotFound from "./pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="grain flex min-h-screen flex-col bg-ink">
      <ScrollToTop />
      <Navbar />
      <CartDrawer />
      <LimiteModal />
      <main className="relative z-10 flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/produto/:id" element={<ProdutoDetalhe />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/trocas" element={<Trocas />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route
            path="/conta"
            element={
              <ProtectedRoute>
                <Conta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
