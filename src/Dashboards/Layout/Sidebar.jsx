import { NavLink, useNavigate } from 'react-router-dom';
import {
    FaBookOpen, FaStore, FaShoppingCart, FaMoneyBill, FaCreditCard, FaUser,
    FaCog, FaFeatherAlt
} from 'react-icons/fa';
import { Logo } from '../../CommonComponents/logo';

function Sidebar({ role, handleLogout, openSidebar, setOpenSidebar }) {
    /* const navigate = useNavigate(); */
    const getNavLinkClass = ({ isActive }) =>
        `flex items-center gap-2 p-2 rounded-r-md transition-all ${isActive
            ? 'bg-gold/15 text-gold border-l-2 border-gold font-medium'
            : 'text-cream/80 hover:bg-gold/5 hover:text-gold'
        }`;


    return (
        <>
            {/* Mobile Sidebar Overlay Backdrop */}
            {openSidebar && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setOpenSidebar(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-bg-secondary/95 lg:bg-bg-secondary/40 flex flex-col justify-between transition-all duration-300 transform lg:static lg:translate-x-0 ${openSidebar ? 'translate-x-0' : '-translate-x-full'} lg:w-20 lg:hover:w-64 group shadow-2xl lg:shadow-none`}>
                <div className='p-6 lg:px-4 lg:group-hover:px-6 transition-all duration-300 overflow-hidden flex items-center justify-between'>
                    <div className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 lg:hidden lg:group-hover:block">
                        <Logo />
                    </div>
                    <div className="block lg:group-hover:hidden w-full text-center">
                        {
                            !openSidebar && (
                                <span className="text-gold font-bold text-xl font-playfair"><FaFeatherAlt size={32} className='text-gold -rotate-12' /></span>
                            )
                        }
                    </div>
                </div>

                <ul className='flex-1 scrollbar-none overflow-y-auto mt-6 space-y-1 px-4 lg:px-2 lg:group-hover:px-4 transition-all duration-300'>
                    <li>
                        <NavLink end to={`/dashboard/${role.toLowerCase()}`} className={getNavLinkClass}>
                            <FaStore className="text-lg min-w-[20px]" />
                            <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 lg:hidden lg:group-hover:inline ml-2">Dashboard</span>
                        </NavLink>
                    </li>
                    {role === 'Author' && (
                        <>
                            <li>
                                <NavLink to="/dashboard/author/my-books" className={getNavLinkClass}>
                                    <FaBookOpen className="text-lg min-w-[20px]" />
                                    <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 lg:hidden lg:group-hover:inline ml-2">My Books</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/print-orders" className={getNavLinkClass}>
                                    <FaShoppingCart className="text-lg min-w-[20px]" />
                                    <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 lg:hidden lg:group-hover:inline ml-2">Orders & Sales</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/earnings" className={getNavLinkClass}>
                                    <FaMoneyBill className="text-lg min-w-[20px]" />
                                    <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 lg:hidden lg:group-hover:inline ml-2">Earnings</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/author/books/create" className={getNavLinkClass}>
                                    <FaMoneyBill className="text-lg min-w-[20px]" />
                                    <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 lg:hidden lg:group-hover:inline ml-2">Create Book</span>
                                </NavLink>
                            </li>
                        </>
                    )}

                    {role === 'Reader' && (
                        <>
                            <li>
                                <NavLink to="/dashboard/reader/published-books" className={getNavLinkClass}>
                                    <FaBookOpen className="text-lg min-w-[20px]" />
                                    <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 lg:hidden lg:group-hover:inline ml-2">Library</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/reader/cart" className={getNavLinkClass}>
                                    <FaShoppingCart className="text-lg min-w-[20px]" />
                                    <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 lg:hidden lg:group-hover:inline ml-2">My Cart</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/reader/reading" className={getNavLinkClass}>
                                    <FaCreditCard className="text-lg min-w-[20px]" />
                                    <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 lg:hidden lg:group-hover:inline ml-2">Reading History</span>
                                </NavLink>
                            </li>
                        </>
                    )}

                    {role === 'Vendor' && (
                        <>
                            {/* Render Vendor links here */}
                        </>
                    )}

                    <li>
                        <NavLink to='/profile' className={getNavLinkClass}>
                            <FaUser className="text-lg min-w-[20px]" />
                            <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 lg:hidden lg:group-hover:inline ml-2">Profile</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/settings' className={getNavLinkClass}>
                            <FaCog className="text-lg min-w-[20px]" />
                            <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 lg:hidden lg:group-hover:inline ml-2">Settings</span>
                        </NavLink>
                    </li>
                </ul>

                {/* Promo Card Banner (Hidden when shrunk on desktop) */}
                <div className='bg-bg-secondary/80 border border-border px-6 py-3 rounded-lg mx-4 text-left relative overflow-hidden flex items-center justify-between lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 lg:hidden lg:group-hover:flex'>
                    <div>
                        <h1 className='text-2xl font-playfair font-bold text-gold relative z-10 mb-2 tracking-tight'>{role === 'Author' ? 'Create. Publish. Inspire.' : (role === 'Reader' ? 'Dive into endless stories' : 'Sell. Deliver. Grow.')}</h1>
                        <p className='text-[12px] text-cream-dim uppercase tracking-normal font-sans relative z-10'>{role === 'Author' ? 'Join our community of storytellers' : (role === 'Reader' ? 'Discover new worlds with every page' : 'Sell. Deliver. Grow.')} </p>
                    </div>
                    <FaFeatherAlt size={32} className='text-gold w-8 h-8 -rotate-12' />
                </div>

                {/* Logout Button */}
                <div className='px-6 lg:px-4 lg:group-hover:px-6 py-3 transition-all duration-300'>
                    <button onClick={handleLogout} className='w-full mt-auto pt-6 border-t border-border/20 flex items-center gap-3 text-cream-dim hover:text-gold transition-colors lg:justify-center lg:group-hover:justify-start'>
                        <FaUser className="text-lg min-w-[20px]" />
                        <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 lg:hidden lg:group-hover:inline">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
export { Sidebar };