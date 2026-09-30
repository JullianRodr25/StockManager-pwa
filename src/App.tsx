import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { StockRealtimeProvider } from './context/StockRealtimeContext';
import { RutaProtegida } from './components/RutaProtegida';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { Catalogo } from './pages/Catalogo';
import { Checkout } from './pages/Checkout';
import { MisPedidos } from './pages/MisPedidos';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <StockRealtimeProvider>
            <CartProvider>
              <Toaster position="top-center" richColors />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route
                  element={
                    <RutaProtegida>
                      <AppLayout />
                    </RutaProtegida>
                  }
                >
                  <Route path="/" element={<Catalogo />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/pedidos" element={<MisPedidos />} />
                </Route>
              </Routes>
            </CartProvider>
          </StockRealtimeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
