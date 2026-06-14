import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { useState } from 'react';
import { NavRoutes } from './Routes/NavRoutes';
import { Modal } from "./CommonComponents/Modal";
import { LoginForm } from './components/LoginForm';
import { useLocation } from 'react-router-dom';
function App() {

  const [open, setOpen] = useState(false);

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  if (isDashboard) {
    return <NavRoutes />;
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header openModal={openModal} closeModal={closeModal} open={open} />

        <main className='pt-[73px]'>
          <NavRoutes />
        </main>
        <Modal open={open} close={closeModal}>
          <LoginForm closeModal={closeModal} />
        </Modal>
        <Footer />
      </div>
    </>
  );
}

export default App


