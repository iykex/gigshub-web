import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { ToastContainer } from "@/lib/toast"
import "@/styles/toast.css"
import { MobileNav } from "@/components/nav/mobile-nav"
import { FloatingWhatsAppWrapper } from "@/components/floating-whatsapp-wrapper"
import { FloatingOrdersIcon } from "@/components/floating-orders-icon"

import Home from "@/app/page";
import Login from "@/app/login/page";
import Signup from "@/app/signup/page";
import DashboardLayout from "@/app/dashboard/layout";
import Dashboard from "@/app/dashboard/page";
import Orders from "@/app/dashboard/orders/page";
import Profile from "@/app/dashboard/profile/page";
import Settings from "@/app/dashboard/settings/page";
import DashboardWallet from "@/app/dashboard/wallet/page";
import AdminDashboard from "@/app/dashboard/admin/page";
import AdminUsers from "@/app/dashboard/admin/users/page";
import Checkout from "@/app/checkout/page";
import Stores from "@/app/stores/page";
import StoreDetailPage from "@/app/stores/store-details";
import WalletTopup from "@/app/wallet/topup/page";
import ForgotPassword from "@/app/forgot-password/page";
import SuccessPage from "@/app/checkout/success/page";
import AgentDashboard from "@/app/dashboard/agent/page";
import AgentRegisterPage from "@/app/agent/register/page";

export default function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AuthProvider>
                <CartProvider>
                    <Router>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />

                            {/* Dashboard Routes */}
                            <Route path="/dashboard" element={<DashboardLayout />}>
                                <Route index element={<Dashboard />} />
                                <Route path="orders" element={<Orders />} />
                                <Route path="profile" element={<Profile />} />
                                <Route path="settings" element={<Settings />} />
                                <Route path="wallet" element={<DashboardWallet />} />
                                <Route path="agent" element={<AgentDashboard />} />

                                {/* Admin Routes */}
                                <Route path="admin">
                                    <Route index element={<AdminDashboard />} />
                                    <Route path="users" element={<AdminUsers />} />
                                </Route>
                            </Route>

                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/checkout/success" element={<SuccessPage />} />
                            <Route path="/stores" element={<Stores />} />
                            <Route path="/stores/:id" element={<StoreDetailPage />} />
                            <Route path="/wallet/topup" element={<WalletTopup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/agent/register" element={<AgentRegisterPage />} />
                        </Routes>
                        <MobileNav />
                        <FloatingWhatsAppWrapper />
                        <FloatingOrdersIcon />
                    </Router>
                </CartProvider>
            </AuthProvider>
            <ToastContainer />
        </ThemeProvider>
    );
}
