import { MetricCard } from "../CommonComponents/MetricCard";
import { FaBookOpen, FaShoppingCart, FaWallet, FaArrowRight, FaSearch, FaHeartbeat, FaTrophy, FaComment } from "react-icons/fa";
import { PiBooksFill } from "react-icons/pi";
import { IoStatsChart } from "react-icons/io5";
import { MdMenuBook } from "react-icons/md";
import { Link } from "react-router-dom";
import { Table } from "../CommonComponents/Table";
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useState } from "react";

const bookTableColumns = [
    {
        key: 'book',
        label: 'Book',
        render: (row) => (
            <div className="flex items-center gap-3 min-w-[160px]">
                <img src={row.thumbnailImg} alt={row.title} className="w-9 h-12 flex-shrink-0 object-cover rounded border border-border/20 shadow-sm" />
                <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-cream leading-tight">{row.title}</span>
                    <span className="text-xs text-cream-dim/50 mt-0.5">{row.category}</span>
                </div>
            </div>
        )
    },
    {
        key: 'description',
        label: 'Summary',
        render: (row) => (
            <div className="min-w-[200px] max-w-[300px]">
                <span className="text-cream-dim/80 text-xs line-clamp-2">{row.description}</span>
            </div>
        )
    },
    {
        key: 'type',
        label: 'Type',
        render: (row) => (
            <div className="min-w-[80px]">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${row.publishType === 'ONLINE'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                    {row.publishType}
                </span>
            </div>
        )
    },
    {
        key: 'price',
        label: 'Price',
        render: (row) => (
            <div className="min-w-[60px]">
                <span className="text-cream-dim/60">{row.price}</span>
            </div>
        )
    },
    {
        key: 'updated',
        label: 'Updated',
        render: (row) => (
            <div className="min-w-[100px]">
                <span className="text-cream-dim/60">{new Date(row.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
        )
    },
    {
        key: 'actions',
        label: 'Actions',
        render: () => (
            <div className="min-w-[50px] text-center">
                <button className="text-cream-dim hover:text-gold transition-colors font-bold text-lg bg-transparent border-none p-1 leading-none">
                    •••
                </button>
            </div>
        )
    }
];

function AuthorDashboard() {

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const { data: dashboardData, isLoading, isError } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const res = await api.get('/user/dashboard');
            return res.data.data.data.dashboardData;
        }
    });

    const endIndex = currentPage * itemsPerPage;
    const startIndex = endIndex - itemsPerPage;
    const currentData = dashboardData?.publishedBooks?.slice(startIndex, endIndex);
    const totalBooks = dashboardData?.publishedBooks?.length || 0;
    const totalPages = Math.ceil(totalBooks / itemsPerPage);

    const activityConfig = {
        sale: { icon: FaShoppingCart, bg: 'bg-purple-500/10 text-purple-400' },
        print: { icon: FaBookOpen, bg: 'bg-blue-500/10 text-blue-400' }
    };



    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard title="Total Books" value={dashboardData?.writtenBooks?.length || 0} subtitle="Written/Drafts" description="All your written works" icon={< FaBookOpen />} icon_2={< MdMenuBook />} />
                <MetricCard title="Published Books" value={dashboardData?.publishedBooks?.length || 0} description="Available for readers" icon={< FaBookOpen />} icon_2={< PiBooksFill />} />
                <MetricCard title="Active Sales" value={dashboardData?.onlineBooks?.length || 0} description="Currently generating sales" icon={< FaShoppingCart />} icon_2={< IoStatsChart />} />
                <div className="bg-bg-secondary/40 border border-border/40 border-gold/50 shadow-[0_0_15px_rgba(201,168,76,0.1)] p-6 rounded-xl flex flex-col gap-3 group">
                    <div className="flex items-center justify-between">
                        <div className="p-3 rounded-lg bg-gold/5 text-gold border border-gold/10 group-hover:bg-gold/15 group-hover:text-gold-light group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
                            <FaWallet />
                        </div>
                        <span className="text-xs uppercase font-sans font-semibold text-cream-dim/60 tracking-wider">Wallet Balance</span>

                    </div>
                    <span className="text-3xl font-bold font-playfair mt-1 text-gold">{dashboardData?.earnings?.currentBalance || 0}</span>
                    <button className="px-4 py-2 rounded-lg bg-gold text-gold-light mt-4 hover:bg-gold-dark transition-colors duration-300">Request Payout</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-4">
                <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-3">
                    <div className="bg-bg-secondary/40 border border-border/40 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xl font-bold text-gold font-playfair">Published Books</h2>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <input type="text" placeholder="Search" className="bg-bg-primary border border-border/40 text-cream-dim px-3 py-2 rounded-lg focus:border-gold focus:outline-none" />
                                    <FaSearch className="absolute right-3 top-3 text-cream-dim" />
                                </div>
                                <div>
                                    <select className="bg-bg-primary border border-border/40 px-3 py-2 rounded-lg text-cream-dim/80 focus:border-gold focus:outline-none">
                                        <option value="all">All</option>
                                        <option value="online">Online</option>
                                        <option value="offline">Offline</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Table columns={bookTableColumns} data={currentData || []} isLoading={isLoading} />
                        </div>
                        <div className="flex justify-end items-end mt-2 pt-2">
                            {/* 1. Page Info Label */}
                            {/* <span className="text-xs text-cream-dim/60">
                                Showing {totalBooks === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalBooks)} of {totalBooks} books
                            </span> */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-xs rounded border border-border/30 bg-bg-primary text-cream hover:bg-gold/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Previous
                                </button>

                                <span className="text-xs text-cream-dim/80 font-sans">
                                    Page {currentPage} of {totalPages || 1}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="px-3 py-1 text-xs rounded border border-border/30 bg-bg-primary text-cream hover:bg-gold/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                        <Link to='/author/books'>
                            <span className="text-gold hover:text-gold-light transition-colors text-sm font-semibold flex items-center justify-center gap-1 mt-2 cursor-pointer">View all books <FaArrowRight /></span>
                        </Link>
                    </div>
                    <div className="flex flex-col justify-evenly bg-bg-secondary/40 border border-border/40 p-3 h-full rounded-xl">
                        {/* Recent Activity */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <FaHeartbeat className="text-gold p-2 rounded-full bg-gold/5" />
                                <h1 className="text-gold font-bold font-playfair">Recent Activity</h1>
                            </div>
                            <Link to='/author/activity'>
                                <span className="text-gold hover:text-gold-light transition-colors text-sm font-semibold flex items-center justify-center gap-1 cursor-pointer">
                                    View all activity <FaArrowRight />
                                </span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                            {/* Activity list */}
                            {
                                (dashboardData?.recentActivity || []).map((activity) => {

                                    const config = activityConfig[activity.type] || activityConfig.sale;
                                    const IconComponent = config.icon;
                                    return (
                                        <div key={activity.id} className="flex items-center gap-3 p-3 bg-bg-primary/20 border border-border/20 rounded-lg">
                                            <div className={`p-2 rounded-full ${config.bg}`}>
                                                <IconComponent size={16} />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <span className="text-xs text-cream">{activity.text}</span>
                                                <span className="text-[10px] text-cream-dim/50">{activity.date}</span>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="md:col-span-1 lg:col-span-1 flex flex-col gap-4">
                    {/* Best Seller Books */}

                    <div className="flex flex-col gap-5 bg-bg-secondary/40 border border-border/40 p-6 rounded-xl">
                        <div className="flex items-center mb-2 gap-2">
                            <FaTrophy className="text-gold rounded-full bg-gold/5 text-lg" />
                            <h2 className="text-gold font-bold font-playfair">Top Performing Books</h2>
                        </div>
                        <div className="flex flex-col gap-3">
                            {(dashboardData?.topSeller || []).map((book, index) => {
                                // Dynamic rank styling
                                const getRankStyle = (rank) => {
                                    if (rank === 1) return "bg-gold/20 text-gold border border-gold/30";
                                    if (rank === 2) return "bg-cream-dim/20 text-cream border border-cream-dim/30";
                                    return "bg-brown/20 text-brown-light border border-brown/30";
                                };

                                return (
                                    <div key={index} className="flex items-center justify-between p-1.5 bg-bg-primary/20 border border-border/10 rounded-lg hover:border-gold/20 hover:bg-gold/5 transition-all duration-200 group">
                                        <div className="flex items-center gap-3">
                                            {/* Rank Badge */}
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${getRankStyle(book.rank)}`}>
                                                {book.rank}
                                            </span>

                                            {/* Book Thumbnail */}
                                            <img src={book.cover} alt={book.title} className="w-7 h-10 object-cover rounded shadow-sm border border-border/10" />

                                            {/* Info Stack */}
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-cream leading-tight truncate max-w-[110px] group-hover:text-gold transition-colors">
                                                    {book.title}
                                                </span>
                                                <span className="text-[10px] text-cream-dim/40 mt-0.5">
                                                    {book.sales} sold
                                                </span>
                                            </div>
                                        </div>

                                        {/* Sales Stats */}
                                        <div className="text-right flex flex-col justify-center mt-4">
                                            <span className="text-xs font-bold text-gold">{book.revenue}</span>
                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    </div>
                    <div className="bg-bg-secondary/40 border border-border/40 p-4 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-2">
                            <FaComment className="text-gold text-sm" />
                            <h2 className="text-lg font-bold text-gold font-playfair">Reader Feedback</h2>
                        </div>
                        <div className="flex flex-col gap-1">
                            {(dashboardData?.recentReviews || []).map((review) => (
                                <div key={review.id} className="p-3 bg-bg-primary/20 border border-border/10 rounded-lg flex flex-col gap-1.5 hover:border-gold/20 transition-all duration-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-cream">{review.reader}</span>
                                        {/* Render stars based on rating */}
                                        <span className="text-gold text-[10px]">
                                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                        </span>
                                    </div>

                                    <p className="text-[11px] text-cream-dim/70 italic leading-relaxed">
                                        "{review.comment}"
                                    </p>

                                    <span className="text-[9px] text-gold/60 uppercase tracking-wider font-semibold font-sans mt-0.5">
                                        on {review.book}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default AuthorDashboard;