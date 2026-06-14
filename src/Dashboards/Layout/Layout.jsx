import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

function Layout() {
    const { authData, handleLogout } = useAuth();
    const role = authData.user?.role;
    const name = authData.user?.name;

    const [openSidebar, setOpenSidebar] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-bg-primary">
            <Sidebar role={role} handleLogout={handleLogout} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
            <div className="flex flex-col flex-1 min-w-0">
                <Navbar name={name} role={role} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
                <main className="flex-1 overflow-y-auto p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export { Layout };