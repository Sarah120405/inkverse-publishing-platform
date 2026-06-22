import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import { MetricCard } from '../../CommonComponents/MetricCard';
import calculateAverageRating from '../../utils/reviewCalculation';
import { FaBookOpen, FaStar, FaChevronLeft, FaShoppingCart, FaChevronRight, FaSearch, FaRocket, FaPrint, FaTrash, FaPen, FaUser } from "react-icons/fa";
import { MdMenuBook } from "react-icons/md";
import { PiBooksFill } from "react-icons/pi";
import { IoStatsChart } from "react-icons/io5";

function AuthorBooks() {

    const [isActive, setIsActive] = useState("All Books");
    const [sort, setSort] = useState("newest")
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search") || "";
    const [page, setPage] = useState(1);
    const [openMenuId, setOpenMenuId] = useState(null);
    const limit = 8;
    const checkb = [
        { value: "All Books", category: "All Books" },
        { value: "Published", category: "Published" },
        { value: "Drafts", category: "Drafts" },
        { value: "Online", category: "Online" },
        { value: "Offline", category: "Offline" },
    ]

    const { data, isLoading, isError } = useQuery({
        queryKey: ['author-books', { sort, search, page, limit }],
        queryFn: async () => {
            const res = await api.get('/book/my-books', {
                params: {
                    page,
                    limit,
                    search,
                    sort
                }
            });
            return res.data.data.data;
        }
    })
    const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const res = await api.get('/user/dashboard');
            return res.data.data.data.dashboardData;
        }
    })
    const { books = [], pagination = {} } = data || {};
    const displayBooks = books?.filter((book) => {
        if (isActive === "All Books") return true;
        if (isActive === "Published") return book.isPublished;
        if (isActive === "Drafts") return !book.isPublished;
        if (isActive === "Online") return book.publishType === "ONLINE";
        if (isActive === "Offline") return book.publishType === "OFFLINE";

    })

    const totalReaders = dashboardData?.salesData?.reduce((sum, item) => sum + item.sales, 0) || 0;
    const formattedReaders = totalReaders >= 1000 ? `${(totalReaders / 1000).toFixed(1)}K` : totalReaders;

    function getRelativeTime(dateString) {
        if (!dateString) return "recently";
        const diffTime = Math.abs(new Date() - new Date(dateString));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "today";
        if (diffDays === 1) return "yesterday";
        return `${diffDays} days ago`;
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex flex-row gap-10 justify-between items-center mb-6 w-full">
                <div className="flex flex-row justify-between overflow-x-auto scrollbar-none whitespace-nowrap w-full px-4 py-3">
                    {
                        checkb.map((checkb, index) => (
                            <button onClick={() => {
                                setIsActive(checkb.value)
                            }} className={`pb-3 px-2 text-sm transition-all duration-300 relative ${isActive === checkb.value
                                ? 'text-gold font-medium border-b-2 border-gold -mb-[1px]'
                                : 'text-cream-dim/60 hover:text-gold'
                                }`}> {checkb.category}
                            </button>
                        ))
                    }
                </div>
                <div className="flex flex-row gap-4">
                    {/* Search input */}
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-dim/40">
                            <FaSearch className="text-xs" /> {/* Or 🔍 */}
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearchParams({ search: e.target.value })}
                            placeholder="Search books..."
                            className="bg-transparent outline-none border border-border/40 rounded-md pl-8 pr-3 py-1.5 text-cream text-xs placeholder:text-cream-dim/30 w-64 focus:border-gold/50 transition-colors"
                        />
                    </div>

                    <div className="text-xs lg:text-sm p-2 flex items-center justify-center border border-border/40 rounded-md px-2">
                        {/* Sort by */}
                        Sort:
                        <select onChange={(e) => setSort(e.target.value)} className="lg:text-sm focus:outline-none text-xs text-cream-dim/70 bg-bg-primary" name="sort" id="sort">
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6 w-full">
                <MetricCard title="Total Books" value={dashboardData?.writtenBooks?.length || 0} description="All time" icon={< FaBookOpen />} icon_2={< MdMenuBook />} />
                <MetricCard title="Published" value={dashboardData?.publishedBooks?.length || 0} description="Live bonds" icon={< FaBookOpen />} icon_2={< PiBooksFill />} />
                <MetricCard title="Drafts" value={((dashboardData?.writtenBooks?.length || 0) - (dashboardData?.publishedBooks?.length || 0)) || 0} description="In Progress" icon={< PiBooksFill />} icon_2={< FaPen />} />
                <MetricCard title="Total Readers" value={formattedReaders} description="Across all books" icon={<FaUser />} />
                <MetricCard title="Total Sales" value={dashboardData?.totalRevenue} description="All time earnings" icon={< FaShoppingCart />} icon_2={< IoStatsChart />} />

            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {
                    isLoading ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="flex flex-col gap-2 animate-pulse">
                                <div className="h-64 bg-border/40 rounded-md"></div>
                                <div className="h-4 bg-border/40 rounded w-3/4"></div>
                                <div className="h-4 bg-border/40 rounded w-1/2"></div>
                            </div>
                        ))
                    ) : isError ? (
                        <div className="text-red-500 col-span-full text-center">Failed to fetch books</div>
                    ) : data?.books?.length === 0 ? (
                        <div className="text-cream-dim col-span-full text-center">No books found</div>
                    ) : (
                        displayBooks.map((book) => {
                            const bookSales = dashboardData?.salesData?.find(item => item.title === book.title);
                            const bookRevenue = bookSales?.revenue || 0;
                            const bookReaders = bookSales?.sales || 0;

                            return (
                                <div key={book.id} className="bg-bg-primary border border-border/40 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    {/* Book Image */}
                                    <Link to={`/book/${book.id}`} className="relative aspect-[3/4] overflow-hidden rounded-md">
                                        <div className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded font-semibold tracking-wider text-cream-dim uppercase ${book.isPublished ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-zinc-900/10 text-zinc-400 border border-zinc-500/20"}`}>
                                            {book.isPublished ? "Published" : "Draft"}
                                        </div>
                                        <img
                                            src={book.coverImg}
                                            alt={book.title}
                                            className="w-full h-64 object-cover"
                                        />
                                    </Link>

                                    {/* Book Info */}
                                    <div className="p-4 flex flex-col gap-3">
                                        <Link to={`/book/${book.id}`} className="flex flex-col gap-1">
                                            <h3 className="text-lg font-semibold text-cream-dim line-clamp-2 hover:text-gold transition-colors">
                                                {book?.title}
                                            </h3>
                                            <p className="text-sm text-gold/70 hover:text-gold transition-colors">
                                                {book?.category}
                                            </p>
                                        </Link>
                                        {book.isPublished ? (<div className="flex flex-col w-full gap-2">
                                            <div className="flex items-center text-xs text-cream-dim/60 gap-2 font-light">
                                                <div className="flex items-center gap-1 text-gold">
                                                    <FaStar />
                                                    <span className="text-cream-dim">{calculateAverageRating(book.reviews)}</span>
                                                    <span className="text-cream-dim/40">({book.reviews?.length || 0})</span>
                                                </div>
                                                <span className="text-border/40">|</span>
                                                <div className="flex items-center gap-1 text-cream-dim/60">
                                                    <FaBookOpen />{/* Or Add no of Readers */}
                                                    <span>{bookReaders} Readers</span>
                                                </div>

                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-cream-dim/60 font-light">
                                                <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${book.publishType === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`}></span>
                                                    <span className={book.publishType === 'ONLINE' ? 'text-green-500' : 'text-zinc-500'}>
                                                        {book.publishType === 'ONLINE' ? 'ONLINE' : 'OFFLINE'}
                                                    </span>
                                                </div>
                                                <span className="text-border/40">|</span>
                                                <p className="text-xs md:text-sm text-green-500 font-semibold mt-1">
                                                    ₹{bookRevenue.toLocaleString('en-IN')} Earned
                                                </p>
                                            </div>
                                        </div>) : (
                                            <div className="text-xs md:text-sm text-cream-dim/40">Last edited {getRelativeTime(book.updatedAt)}</div>
                                        )}
                                        <div className="flex items-center justify-center gap-3 relative">
                                            {book.isPublished ? (
                                                <Link to={`/dashboard/author/published-books/${book.id}`} className="flex-1 text-center py-2 text-xs border border-border/40 hover:border-gold hover:text-gold rounded transition-all duration-300 font-medium">
                                                    View Details
                                                </Link>
                                            ) : (
                                                <Link to={`/dashboard/author/books/edit/${book.id}`} className="flex-1 flex items-center justify-center gap-1 text-center py-2 text-xs border border-gold/40 hover:bg-gold/10 text-gold rounded transition-all duration-300 font-medium">
                                                    Continue Editing
                                                </Link>
                                            )}<button onClick={() => setOpenMenuId(openMenuId === book.id ? null : book.id)}
                                                className="border border-border/40 rounded-lg px-3 py-1 hover:text-gold">...</button>

                                            {openMenuId === book.id && (
                                                <div className="absolute bottom-10 right-0 z-50 flex flex-col bg-bg-secondary/95 border border-border/60 rounded-md shadow-xl min-w-[140px] p-1 text-xs">
                                                    <button className="flex items-center gap-2 px-3 py-1.5 text-gold hover:bg-gold/15 rounded text-left transition-colors">
                                                        <FaRocket /> Publish Book
                                                    </button>
                                                    <button className="flex items-center gap-2 px-3 py-1.5 text-cream-dim hover:bg-gold/15 rounded text-left transition-colors">
                                                        <FaPrint /> Request Prints
                                                    </button>
                                                    <button className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:bg-red-500/10 rounded text-left transition-colors mt-0.5">
                                                        <FaTrash /> Delete Book
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>)
                        })
                    )
                }
            </div>
            <div className="flex flex-row items-center justify-between w-full">
                <div className="flex items-center justify-center text-xs lg:text-sm text-gold/50">
                    Showing {pagination.page} to {pagination.currentPageItems} of {pagination.totalItems} results
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="p-2 rounded-md border border-border/40 hover:border-gold hover:text-gold transition-all duration-300"
                    >
                        <FaChevronLeft className="text-xs" />
                    </button>
                    <div className="flex items-center gap-2">
                        {[...Array(pagination.totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setPage(index + 1)}
                                className={`px-3 py-2 rounded-md text-xs font-semibold transition-all duration-300 ${page === index + 1 ? "bg-gold/20 text-gold border border-gold/50" : "hover:bg-border/40 text-cream-dim"}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.totalPages}
                        className="p-2 rounded-md border border-border/40 hover:border-gold hover:text-gold transition-all duration-300"
                    >
                        <FaChevronRight className="text-xs" />
                    </button>
                </div>
            </div>
        </div>)
}

export { AuthorBooks };