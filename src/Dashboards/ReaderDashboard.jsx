import { MetricCard } from "../CommonComponents/MetricCard";
import { FaBookOpen, FaShoppingCart, FaWallet, FaArrowCircleRight, FaArrowCircleLeft, FaHeartbeat, FaArrowRight, FaComment, FaPen, FaTrophy } from "react-icons/fa";
import { PiBooksFill } from "react-icons/pi";
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
            <div className="flex items-center gap-3">
                <img src={row.book.thumbnailImg} alt={row.book.title} className="w-9 h-12 object-cover rounded border border-border/20 shadow-sm" />
                <div className="flex flex-col">
                    <span className="font-semibold text-cream leading-tight">{row.book.title}</span>
                    <span className="text-xs text-cream-dim/50 mt-0.5">{row.book.category}</span>
                </div>
            </div>
        )
    },
    {
        key: 'readingHistory',
        label: 'Reading History',
        render: (row) => (
            <div className="flex items-center gap-3">
                <div className="flex flex-col">
                    <span className="font-semibold text-cream flex flex-row gap-2 items-center">
                        <div className={row.readingStatus === "Completed" ? "bg-green-500 w-2 h-2 rounded-full" : "bg-gold w-2 h-2 rounded-full"}></div>
                        {row.readingStatus === "Completed" ? "Completed" : "In Progress"}
                    </span>
                    <span className="text-xs text-cream-dim/50 mt-0.5">{row.readingStatus === "Completed" ? "Completed On: " : "Last Updated: "}{new Date(row.lastReadAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
            </div>
        )
    },
    {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
            <button className="w-50 text-cream-dim hover:text-gold transition-colors text-xs bg-bg-primary/30 border border-border/40 p-4 leading-none">
                {row.readingStatus === "Completed" ?
                    <span className="flex items-center gap-2 justify-center">
                        Write Review
                        <FaPen className="text-gold hover:text-gold-light" />
                    </span> :
                    <span className="flex items-center gap-2 justify-center">
                        Continue Reading
                        <FaArrowRight className="text-gold hover:text-gold-light" />
                    </span>}
            </button>
        )
    }
];

function ReaderDashboard() {

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const { data: dashboardData, isLoading, isError } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const res = await api.get('/user/dashboard');
            return res.data.data.data.dashboardData;
        }
    });

    const endIndex = currentPage * itemsPerPage;
    const startIndex = endIndex - itemsPerPage;
    const currentData = dashboardData?.continueReading?.slice(startIndex, endIndex);
    const totalBooks = dashboardData?.continueReading?.length || 0;
    const totalPages = Math.ceil(totalBooks / itemsPerPage);

    const ratingAverage = (book) => {
        if (book.reviews && book.reviews.length > 0) {
            const ratings = book.reviews.map((review) => review.rating);
            const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings?.length;
            return averageRating;
        }
        else {
            return 0;
        }
    }

    const readerTitle = (level) => {
        if (level <= 2) return "Novice Reader";
        if (level <= 5) return "Book Explorer";
        if (level <= 8) return "Bibliophile";
        return "Literary Master";
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard title="Books in Library" value={dashboardData?.purchaseOrders?.length || 0} subtitle="Owned Books" description="Stories you own" icon={< FaBookOpen />} icon_2={< MdMenuBook />} />
                <MetricCard title="Reading Books" value={dashboardData?.readingBooksCount || 0} subtitle="Continue Reading" description="Adventures you are exploring" icon={< FaBookOpen />} icon_2={< PiBooksFill />} />
                <MetricCard title="Genres Explored" value={dashboardData?.exploredCategories || 0} subtitle="Genre Diversity" description="Your explored genres" icon={< FaBookOpen />} icon_2={< PiBooksFill />} />
                <MetricCard title="Total Spent" value={dashboardData?.totalSpent || 0} subtitle="Your Investment" description="Books you have purchased" icon={< FaShoppingCart />} icon_2={< FaWallet />} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                <div className="lg:col-span-3 flex flex-col gap-3 md:col-span-2 lg:col-span-3">
                    <div className="bg-bg-secondary/40 border border-border/40 p-3 rounded-xl">
                        {/* Continue Reading */}
                        <div className="flex justify-between items-center">
                            {/* Header with pagination */}
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl text-gold font-bold font-playfair">Continue Reading</h1>
                            </div>
                            <div className="flex gap-2">
                                <FaArrowCircleLeft className="text-gold hover:text-gold-light transition-colors text-sm font-semibold flex items-center justify-center gap-1 mt-2 cursor-pointer" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1 || totalPages === 0}
                                />
                                <FaArrowCircleRight className="text-gold hover:text-gold-light transition-colors text-sm font-semibold flex items-center justify-center gap-1 mt-2 cursor-pointer" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                            {/* Continue Reading List */}
                            {
                                (currentData || []).map((activity) => {
                                    return (
                                        <div key={activity.id} className="flex flex-col items-center gap-3 p-3 bg-bg-primary/20 border border-border/20 rounded-lg">
                                            <div className="grid grid-cols-2 ">
                                                <div className="w-[80px] h-[110px] object-cover rounded-lg border border-border/20 shadow-sm">
                                                    <img src={activity.book.thumbnailImg} alt={activity.book.title} className="w-[80px] h-[110px] object-cover rounded-lg border border-border/20 shadow-sm" />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-2xs font-semibold text-cream">{activity.book.title}</span>
                                                    <span className="text-xs text-gold/50">By {activity.book.author.name}</span>
                                                    <div className="flex gap-1 items-center">
                                                        {/* Progress Bar */}
                                                        <span className="text-xs text-cream-dim/50">{activity.progressPercentage}%</span>
                                                        <div className="w-full h-1 bg-border/20 rounded-full">
                                                            <div className="h-1 bg-gold rounded-full" style={{ width: `${activity.progressPercentage}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <button className="w-full p-2 bg-gold/15 border border-gold/20 text-gold rounded-lg hover:bg-gold/5 transition-all text-xs font-semibold">Continue Reading</button>

                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className="bg-bg-secondary/40 border border-border/40 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xl font-bold text-gold font-playfair">Reading History</h2>
                            <div className="flex gap-2">
                                <Link to='/books'>
                                    <span className="text-gold hover:text-gold-light transition-colors text-sm font-semibold flex items-center justify-center gap-1 mt-2 cursor-pointer">View all books <FaArrowRight /></span>
                                </Link>
                            </div>
                        </div>
                        <div className="w-full overflow-x-auto">
                            <Table columns={bookTableColumns} data={dashboardData?.readingHistory || []} isLoading={isLoading} />
                        </div>

                    </div>
                    <div className="bg-cover bg-center bg-no-repeat border border-border/20 rounded-xl p-3 relative flex items-center justify-center h-full"
                        style={{ backgroundImage: "url('/src/assets/reader-dashboard-bg.jpg')" }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 to transparent"></div>


                        <span className="text-xl text-gold font-playfair text-center px-4 relative z-10">"A book is a dream that you hold in your hands. — Neil Gaiman"</span>
                    </div>
                </div>
                <div className="md:col-span-2 lg:col-span-1 flex flex-col gap-4">
                    {/* Recommended Books */}

                    <div className="flex flex-col gap-3 bg-bg-secondary/40 border border-border/40 p-4 rounded-xl">
                        <div className="flex items-center gap-2">
                            <h2 className="text-gold font-bold font-playfair">Recommended For You</h2>
                        </div>
                        <div className="flex flex-col gap-3">
                            {(dashboardData?.recommendedBooks || []).map((book, index) => {

                                return (
                                    <div key={index} className="flex items-center justify-between p-1.5 bg-bg-primary/20 border border-border/10 rounded-lg hover:border-gold/20 hover:bg-gold/5 transition-all duration-200 group">


                                        {/* Book Thumbnail */}
                                        <div className="flex flex-row gap-2">
                                            <img src={book.thumbnailImg} alt={book.title} className="w-7 h-10 object-cover rounded shadow-sm border border-border/10" />

                                            {/* Info Stack */}
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-cream leading-tight truncate max-w-[110px] group-hover:text-gold transition-colors">
                                                    {book.title}
                                                </span>
                                                <span className="text-[10px] text-cream-dim/40 mt-0.5">
                                                    by {book.author.name}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-gold/40 mt-0.5 flex flex-row items-center">
                                                ★ {ratingAverage(book)}
                                            </span>
                                            <span className="text-xs text-cream-dim/40 mt-0.5">
                                                ₹ {book.price}
                                            </span>
                                        </div>

                                    </div>
                                );
                            })}
                            <button className="w-full p-2 bg-gold/15 border border-gold/20 text-gold rounded-lg hover:bg-gold/5 transition-all text-xs font-semibold">Explore More Books</button>
                        </div>
                    </div>

                    <div className="bg-bg-secondary/40 border border-gold/15 rounded-2xl p-5 flex flex-col gap-5 shadow-[0_0_20px_rgba(201,168,76,0.05)] hover:border-gold/25 transition-all duration-300">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shadow-[0_0_15px_rgba(201,168,76,0.1)] ">
                                <FaTrophy className="text-gold text-sm" />
                            </div>

                            <div>
                                <h2 className="text-lg font-playfair text-gold">
                                    Reading Challenge
                                </h2>

                                <p className="text-xs text-cream-dim/60">
                                    Track your yearly reading goal
                                </p>
                            </div>
                        </div>

                        {/* Books Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-cream">
                                    Books Completed
                                </span>

                                <span className="text-gold font-semibold">
                                    {dashboardData?.readingGoal?.completedBooks}/12
                                </span>
                            </div>

                            <div className="h-2 rounded-full bg-border/20 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-700" style={{ width: `${dashboardData?.readingGoal?.progress}%` }} />
                            </div>

                            {/* <p className="text-xs text-cream-dim/50">
                                {dashboardData?.readingGoal.progress}% completed
                            </p> */}
                        </div>

                        {/* Reader Level */}
                        <div
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-gold/5 border border-gold/10">
                            <span className="text-sm text-cream">
                                {readerTitle(dashboardData?.readingGoal?.readerLevel)}
                            </span>

                            <span className="text-xs px-2 py-1 rounded-full bg-gold/15 text-gold font-medium">
                                Level {dashboardData?.readingGoal?.readerLevel}
                            </span>
                        </div>

                        {/* Level Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-cream">
                                    Progress to Next Level
                                </span>

                                <span className="text-gold text-sm font-medium">
                                    {dashboardData?.readingGoal?.levelProgressPercent}%
                                </span>
                            </div>

                            <div className="h-2 rounded-full bg-border/20 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-gold-light to-gold rounded-full transition-all duration-700"
                                    style={{
                                        width: `${dashboardData?.readingGoal?.levelProgressPercent}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-3 border-t border-gold/10">
                            <p className="text-xs text-center text-cream-dim/60 italic">
                                Keep turning pages to unlock the next reader rank.
                            </p>
                        </div>
                    </div>

                </div>
            </div >
        </>
    )
}

export default ReaderDashboard;