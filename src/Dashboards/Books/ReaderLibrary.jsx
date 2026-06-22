import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../utils/api";
import { FaTrophy } from "react-icons/fa";

function ReaderLibrary() {
    const queryClient = useQueryClient();
    const [isActive, setIsActive] = useState("All Books");
    const [selectedBookId, setSelectedBookId] = useState("");
    const [userRating, setUserRating] = useState(5);
    const [comment, setComment] = useState("");

    const checkb = [
        { value: "All Books", category: "All Books" },
        { value: "Completed", category: "Completed" },
        { value: "Reading", category: "Reading" },
        { value: "Not Started", category: "Not Started" }
    ];

    const { data, isLoading, error } = useQuery({
        queryKey: ['reader-library'],
        queryFn: async () => {
            const response = await api.get('/user/dashboard');
            return response.data.data.data.dashboardData;
        }
    });

    const ratingMutation = useMutation({
        mutationFn: async ({ bookId, rating, comment }) => {
            const response = await api.post(`/book/reviews/${bookId}`, { rating, comment });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['reader-library']);
            alert("Review submitted successfully!");
            setSelectedBookId("");
            setUserRating(5);
            setComment("");
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to submit review.");
        }
    });

    if (isLoading) {
        return <div className="text-cream p-6">Loading Library...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-6">Error loading library data.</div>;
    }

    const orders = data?.purchaseOrders || [];
    const progressLog = data?.allReadingProgress || [];

    const booksInLibrary = orders.map((order) => {
        const progress = progressLog.find((p) => p.bookId === order.orderBook.id);
        const readingStatus = progress?.readingStatus;

        let normalizedStatus = "Not Started";
        if (readingStatus === "InProgress") {
            normalizedStatus = "Reading";
        } else if (readingStatus === "Completed") {
            normalizedStatus = "Completed";
        }

        return {
            id: order.orderBook.id,
            title: order.orderBook.title,
            author: order.orderBook.author?.name || "Unknown Author",
            coverImage: order.orderBook.thumbnailImg,
            category: order.orderBook.category,
            progressPercentage: progress?.progressPercentage || 0,
            status: normalizedStatus,
            lastReadAt: progress?.lastReadAt,
            reviews: order.orderBook.reviews || [],
        };
    });

    const readingBooks = booksInLibrary.filter(b => b.status === "Reading");
    const completedBooks = booksInLibrary.filter(b => b.status === "Completed");
    const notStartedBooks = booksInLibrary.filter(b => b.status === "Not Started");

    const categories = Array.from(new Set(booksInLibrary.map((b) => b.category)));

    const authorBookCounts = {};
    booksInLibrary.forEach((book) => {
        if (book.status !== "Not Started") {
            authorBookCounts[book.author] = (authorBookCounts[book.author] || 0) + 1;
        }
    });

    if (Object.keys(authorBookCounts).length === 0) {
        booksInLibrary.forEach((book) => {
            authorBookCounts[book.author] = 0;
        });
    }

    const favoriteAuthors = Object.entries(authorBookCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const readerTitle = (level) => {
        if (level <= 2) return "Novice Reader";
        if (level <= 5) return "Book Explorer";
        if (level <= 8) return "Bibliophile";
        return "Literary Master";
    };

    const calculateAverageRating = (reviews) => {
        if (!reviews || reviews.length === 0) return "0.0";
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (totalRating / reviews.length).toFixed(1);
    };

    const formatReadDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    };

    const handleRatingSubmit = (e) => {
        e.preventDefault();
        if (!selectedBookId) {
            alert("Please select a book to rate.");
            return;
        }
        ratingMutation.mutate({ bookId: selectedBookId, rating: userRating, comment });
    };

    return (
        <div className="grid grid-cols-12 gap-6 w-full">
            <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
                <div className="flex flex-row justify-between overflow-x-auto scrollbar-none whitespace-nowrap w-full border border-border/40 rounded-md px-4 py-3">
                    {checkb.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setIsActive(tab.value)}
                            className={`rounded-md px-4 py-1.5 flex items-center gap-2 text-xs lg:text-sm text-cream-dim hover:text-gold hover:font-medium hover:border-gold/50 hover:ring-1 transition-all duration-300 ${isActive === tab.value ? 'text-gold font-medium border-gold border' : ''}`}
                        >
                            {tab.category}
                        </button>
                    ))}
                </div>

                <div className="bg-bg-secondary/40 border border-border/40 rounded-lg flex flex-col gap-8 p-6 w-full">
                    {(isActive === "All Books" || isActive === "Reading") && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-border/20 pb-2">
                                <h2 className="text-xl font-medium text-cream font-playfair">Continue Reading</h2>
                                <span className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full border border-gold/20">
                                    {readingBooks.length} Books
                                </span>
                            </div>

                            {readingBooks.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {readingBooks.map((book) => (
                                        <div key={book.id} className="bg-bg-secondary rounded-xl p-4 border border-border/40 flex flex-col justify-between gap-3">
                                            <div className="flex flex-col gap-2">
                                                <img src={book.coverImage} alt={book.title} className="w-full h-40 object-cover rounded-lg" />
                                                <h2 className="text-sm font-medium text-cream line-clamp-1">{book.title}</h2>
                                                <p className="text-xs text-cream-dim/60">by {book.author}</p>

                                                <div className="w-full space-y-1 mt-1">
                                                    <div className="flex justify-between text-[10px] text-cream-dim/60">
                                                        <span>Progress</span>
                                                        <span className="text-gold font-semibold">{book.progressPercentage}%</span>
                                                    </div>
                                                    <div className="h-1.5 rounded-full bg-border/20 overflow-hidden">
                                                        <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${book.progressPercentage}%` }} />
                                                    </div>
                                                    {book.lastReadAt && (
                                                        <p className="text-xs text-cream-dim/40 italic mt-1">
                                                            Last read: {formatReadDate(book.lastReadAt)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <button className="bg-gold text-bg-primary text-xs font-semibold px-4 py-2 rounded-lg w-full mt-2 hover:bg-gold-light transition-all duration-300">
                                                Continue Reading
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-cream-dim/40 italic">No books in progress.</p>
                            )}
                        </div>
                    )}

                    {(isActive === "All Books" || isActive === "Completed") && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-border/20 pb-2">
                                <h2 className="text-xl font-medium text-cream font-playfair">Completed Books</h2>
                                <span className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full border border-gold/20">
                                    {completedBooks.length} Books
                                </span>
                            </div>

                            {completedBooks.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {completedBooks.map((book) => (
                                        <div key={book.id} className="bg-bg-secondary rounded-xl p-4 border border-border/40 flex flex-col justify-between gap-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <img src={book.coverImage} alt={book.title} className="w-full h-40 object-cover rounded-lg" />
                                                <div className="flex flex-col gap-2 justify-between">
                                                    <div>
                                                        <h2 className="text-sm font-medium text-cream line-clamp-1">{book.title}</h2>
                                                        <p className="text-xs text-cream-dim/60">by {book.author}</p>
                                                        <div className="flex items-center gap-1 text-xs text-gold mt-1">
                                                            <span>★</span>
                                                            <span className="text-cream-dim/60">{calculateAverageRating(book.reviews)} ({book.reviews.length})</span>
                                                        </div>
                                                        {book.lastReadAt && (
                                                            <p className="text-xs text-cream-dim/40 italic mt-1">
                                                                Finished: {formatReadDate(book.lastReadAt)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button className="bg-gold/10 border border-gold/30 text-gold text-xs font-semibold px-4 py-2 rounded-lg w-full mt-2 hover:bg-gold/5 transition-all duration-300">
                                                        Read Again
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-cream-dim/40 italic">No completed books yet.</p>
                            )}
                        </div>
                    )}

                    {(isActive === "All Books" || isActive === "Not Started") && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-border/20 pb-2">
                                <h2 className="text-xl font-medium text-cream font-playfair">Begin Reading</h2>
                                <span className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full border border-gold/20">
                                    {notStartedBooks.length} Books
                                </span>
                            </div>

                            {notStartedBooks.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {notStartedBooks.map((book) => (
                                        <div key={book.id} className="bg-bg-secondary rounded-xl p-4 border border-border/40 flex flex-col justify-between gap-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <img src={book.coverImage} alt={book.title} className="w-full h-40 object-cover rounded-lg" />
                                                <div className="flex flex-col gap-2 justify-between">
                                                    <div>
                                                        <h2 className="text-sm font-medium text-cream line-clamp-1">{book.title}</h2>
                                                        <p className="text-xs text-cream-dim/60">by {book.author}</p>
                                                        <p className="text-xs text-cream-dim/40">Category : {book.category}</p>
                                                        <div className="flex items-center gap-1 text-xs text-gold mt-1">
                                                            <span>★</span>
                                                            <span className="text-cream-dim/60">{calculateAverageRating(book.reviews)} ({book.reviews.length})</span>
                                                        </div>
                                                    </div>
                                                    <button className="bg-gold text-bg-primary text-xs font-semibold px-4 py-2 rounded-lg w-full mt-2 hover:bg-gold-light transition-all duration-300">
                                                        Read Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-cream-dim/40 italic">No unstarted books.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                <div className="bg-bg-secondary/40 border border-gold/15 rounded-2xl p-5 flex flex-col gap-5 shadow-[0_0_20px_rgba(201,168,76,0.05)] hover:border-gold/25 transition-all duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shadow-[0_0_15px_rgba(201,168,76,0.1)]">
                            <FaTrophy className="text-gold text-sm" />
                        </div>
                        <div>
                            <h2 className="text-lg font-playfair text-gold font-bold">Reading Challenge</h2>
                            <p className="text-xs text-cream-dim/60">Track your yearly reading goal</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-cream">Books Completed</span>
                            <span className="text-gold font-semibold">{data?.readingGoal?.completedBooks || 0}/12</span>
                        </div>
                        <div className="h-2 rounded-full bg-border/20 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-700" style={{ width: `${data?.readingGoal?.progress || 0}%` }} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gold/5 border border-gold/10 text-sm">
                        <span className="text-cream">{readerTitle(data?.readingGoal?.readerLevel || 1)}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gold/15 text-gold font-medium">Level {data?.readingGoal?.readerLevel || 1}</span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-cream">Progress to Next Level</span>
                            <span className="text-gold text-sm font-medium">{data?.readingGoal?.levelProgressPercent || 0}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-border/20 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-gold-light to-gold rounded-full transition-all duration-700" style={{ width: `${data?.readingGoal?.levelProgressPercent || 0}%` }} />
                        </div>
                    </div>

                    <div className="pt-3 border-t border-gold/10 text-xs text-center text-cream-dim/60 italic">
                        Keep turning pages to unlock the next reader rank.
                    </div>
                </div>

                <div className="bg-bg-secondary/40 border border-border/40 rounded-2xl p-5 flex flex-col gap-3">
                    <h2 className="text-base font-playfair text-gold font-bold">Favorite Authors</h2>
                    {favoriteAuthors.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {favoriteAuthors.map((author, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg-secondary/35 border border-border/20">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-6 rounded-full bg-gold/15 border border-gold/30 text-xs font-semibold text-gold flex items-center justify-center">
                                            {author.name.charAt(0)}
                                        </div>
                                        <span className="text-xs text-cream font-medium">{author.name}</span>
                                    </div>
                                    <span className="text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20 font-medium">
                                        {author.count} read
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-cream-dim/40 italic">No authors read yet.</p>
                    )}
                </div>

                {/* Explore Categories Card */}
                <div className="bg-bg-secondary/40 border border-border/40 rounded-2xl p-5 flex flex-col gap-3">
                    <h2 className="text-base font-playfair text-gold font-bold">Explore Categories</h2>
                    {categories.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat, i) => (
                                <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-bg-secondary border border-border/40 text-cream-dim">
                                    {cat}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-cream-dim/40 italic">No categories explored yet.</p>
                    )}
                </div>

                <div className="bg-bg-secondary/40 border border-border/40 rounded-2xl p-5 flex flex-col gap-4">
                    <h2 className="text-base font-playfair text-gold font-bold">Rate a Book</h2>
                    <form onSubmit={handleRatingSubmit} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] text-cream-dim/80">Select Book</label>
                            <select
                                value={selectedBookId}
                                onChange={(e) => setSelectedBookId(e.target.value)}
                                className="w-full bg-bg-primary border border-border/40 rounded-lg px-3 py-2 text-xs text-cream focus:outline-none focus:border-gold/50 cursor-pointer"
                                required
                            >
                                <option value="">Choose a book...</option>
                                {booksInLibrary.map((book) => (
                                    <option key={book.id} value={book.id}>
                                        {book.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] text-cream-dim/80">Your Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setUserRating(star)}
                                        className="text-lg focus:outline-none transition-colors duration-200"
                                    >
                                        <span className={star <= userRating ? "text-gold" : "text-cream-dim/20"}>★</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] text-cream-dim/80">Write a Review</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="What did you think of this book?"
                                className="w-full h-16 bg-bg-primary border border-border/40 rounded-lg px-3 py-2 text-xs text-cream placeholder:text-cream-dim/30 focus:outline-none focus:border-gold/50 resize-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={ratingMutation.isLoading}
                            className="bg-gold text-bg-primary text-xs font-semibold py-2 rounded-lg w-full mt-1 hover:bg-gold-light transition-all duration-300 disabled:opacity-50"
                        >
                            {ratingMutation.isLoading ? "Submitting..." : "Submit Review"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export { ReaderLibrary };