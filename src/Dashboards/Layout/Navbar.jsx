import { FaBars, FaShoppingCart, FaSearch, FaArrowLeft } from "react-icons/fa";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Logo } from "../../CommonComponents/logo";

function Navbar({ name, role, openSidebar, setOpenSidebar }) {

    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const isMainDashboard = location.pathname === `/dashboard/${role.toLowerCase()}`;
    const searchQuery = searchParams.get("search") || "";
    const isDetailsPage = location.pathname.startsWith(`/dashboard/${role.toLowerCase()}/published-books/`);

    return (
        <>
            <header className="flex items-center justify-between py-2 px-4 md:px-6 border-b border-border/10 bg-bg-primary/95 backdrop-blur-sm sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setOpenSidebar(!openSidebar)}
                        className="lg:hidden p-1.5 rounded-lg text-cream hover:text-gold hover:bg-gold/10 transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                        aria-label="Open sidebar"
                    >
                        <FaBars className="text-lg" />
                    </button>
                    {!isMainDashboard ? (
                        <>
                            <div className="lg:hidden block"><Logo /></div>
                            {isDetailsPage ? (
                                <div className="hidden lg:flex flex-col items-start gap-1 py-2">
                                    <Link to={`/dashboard/reader/published-books`} className="text-brown-light text-xs lg:text-sm font-light hover:text-gold hover:underline transition-colors duration-200">
                                        <FaArrowLeft className="inline-block mr-1" />
                                        Back to Published Books
                                    </Link>
                                </div>) :
                                (<div className="hidden lg:flex flex-col items-start gap-1 py-2">
                                    <h1 className="text-2xl font-bold text-cream-dim">Published Books</h1>
                                    <p className="text-brown-light text-xs font-light">
                                        Discover stories that inspire, entertain, and stay with you.
                                    </p>
                                </div>)}
                        </>
                    ) : (<div className="flex flex-col items-start">
                        <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-cream-dim">
                            Welcome Back,
                            <span className="text-gold font-playfair"> {name}</span>
                        </h1>
                        <p className="text-brown-light text-[11px] md:text-xs font-light mt-0.5 leading-none">
                            {role === 'Author' ? "Here's what's happening with your Books and Earnings" : role === 'Reader' ? "Discover new stories, continue your journey." : " "}
                        </p>
                    </div>)}

                </div>

                <div className="flex items-center gap-4 lg:gap-6">
                    {/* Search Bar - hidden on mobile, visible on desktop sub-pages */}
                    {!isMainDashboard && (
                        <div className="hidden lg:block relative w-80">
                            <input
                                className="w-full bg-transparent outline-none border border-border/40 rounded-md py-1.5 pl-3 pr-10 text-sm text-cream placeholder:text-brown-light"
                                placeholder="Search by title, author or category..."
                                value={searchQuery}
                                onChange={(e) => {
                                    const newParams = new URLSearchParams(searchParams);
                                    if (e.target.value) {
                                        newParams.set("search", e.target.value);
                                    } else {
                                        newParams.delete("search");
                                    }
                                    setSearchParams(newParams);
                                }}
                            />
                            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gold text-sm pointer-events-none" />
                        </div>
                    )}

                    {/* Cart with Badge (Visible on all views for Reader role) */}
                    {role === 'Reader' && (
                        <div className="relative cursor-pointer hover:scale-105 transition-transform duration-200 mr-2">
                            {!isMainDashboard && (<FaShoppingCart className="text-gold text-lg lg:text-xl" />
                            )}
                            <span className="absolute -top-1.5 -right-1.5 bg-gold text-bg-primary text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                                3
                            </span>
                        </div>
                    )}

                    {/* User profile (Desktop only) */}
                    <div className="hidden lg:flex items-center gap-3 border-l border-border/10 pl-4 lg:pl-6">
                        <div className="flex flex-col items-end justify-center">
                            <p className="text-cream font-semibold text-xs leading-none">{name}</p>
                            <p className="text-brown text-[10px] block text-right mt-1">{role}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-sm font-semibold select-none shadow-sm">
                            {name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}

export { Navbar };