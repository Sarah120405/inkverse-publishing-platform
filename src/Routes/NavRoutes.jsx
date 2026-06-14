import { Routes, Route } from 'react-router-dom';
import { Register } from '../components/Register';
import { LoginForm } from '../components/LoginForm';
import { Welcome } from '../components/Welcome';
import { ProtectedRoutes } from './ProtectRoutes';
import { EmailVerification } from '../components/EmailVerification';
import { ResetPassword } from '../components/ResetPassword';
import { Layout } from '../Dashboards/Layout/Layout';
import AuthorDashboard from '../Dashboards/AuthorDashboard';
import ReaderDashboard from '../Dashboards/ReaderDashboard';
import { PublishedBooks } from '../Dashboards/Books/PublishedBooks';
import BookDetail from '../Dashboards/Books/BookDetail';
import { Cart } from '../Dashboards/Orders/Cart';
import CheckoutPage from '../Dashboards/Orders/CheckoutPage';
function NavRoutes() {
    return (
        <Routes>
            <Route path={"/"} element={<Welcome />} />
            <Route path={"/register"} element={<Register />} />
            <Route path="/login" element={<LoginForm />} />

            {/* Reader dashboard paths */}
            <Route path='/dashboard/reader' element={
                <ProtectedRoutes requiredRole={'Reader'}>
                    <Layout />
                </ProtectedRoutes>
            }>
                <Route index element={<ReaderDashboard />} />
                <Route path="/dashboard/reader/published-books" element={<PublishedBooks />} />
                <Route path="/dashboard/reader/published-books/:bookId" element={<BookDetail />} />
                <Route path="/dashboard/reader/cart" element={<Cart />} />
                <Route path='/dashboard/reader/order' element={<CheckoutPage />} />
            </Route>


            {/* Author dashboard paths */}
            <Route path='/dashboard/author' element={
                <ProtectedRoutes requiredRole={'Author'}>
                    <Layout />
                </ProtectedRoutes>
            }>
                <Route index element={<AuthorDashboard />} />
            </Route>

            {/* Vendor dashboard paths */}
            <Route path='/dashboard/vendor' element={
                <ProtectedRoutes requiredRole={'Vendor'}>
                    <div>Vendor Dashboard</div>
                </ProtectedRoutes>
            } />

            {/* Admin dashboard paths */}
            <Route path='/dashboard/admin' element={
                <ProtectedRoutes requiredRole={'Admin'}>
                    <div>Admin Dashboard</div>
                </ProtectedRoutes>
            } />
            <Route path='/auth/verify-email' element={<EmailVerification />} />
            <Route path='/forgot-password' element={<ResetPassword />} />
        </Routes>

    );
}

export { NavRoutes };