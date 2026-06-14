import { Link } from 'react-router-dom';
import { Logo } from '../CommonComponents/logo';

function Header({ openModal }) {
    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-between item-center p-4 backdrop-blur-md border-gold">
                <div className="flex items-center">
                    <Logo />
                </div>
                <div className="flex gap-2">
                    {/*
                    <button className="border border-cream text-cream bg-transparent px-2 py-2 tansition-colors hover:bg-cream hover:text-bg-primary">Register</button>
                    <button className="border border-cream text-cream bg-transparent px-2 py-2 tansition-colors hover:bg-cream hover:text-bg-primary" onClick={openModal}>Login</button>
                    */}
                    <Link to='/register' className="border border-cream text-cream bg-transparent px-2 py-2 tansition-colors hover:bg-cream hover:text-bg-primary">Register</Link>
                    <button className="border border-cream text-cream bg-transparent px-2 py-2 tansition-colors hover:bg-cream hover:text-bg-primary" onClick={openModal}>Login</button>
                </div>
            </div>
            <hr className='border-gold/20' />
        </>
    );
}

export { Header };