import response from "../../utils/response.js";
import prisma from "../../config/db.config.js";

const userProfileService = async (body) => {
    try {

        if (!body?.email) {
            return response(400, false, null, null, 'Email is required');
        }

        const profile = await prisma.user.findUnique({
            where: { email: body.email },
            select: { id: true, name: true, email: true, role: true, createdAt: true, }
        });
        if (!profile) {
            return response(404, false, null, null, 'User not found');
        }
        return response(200, true, 'User profile fetched successfully', profile, null);
    } catch (error) {
        return response(500, false, 'Internal Server Error', null, error);
    }
}
const profileUpdateService = async (body) => {
    try {
        if (!body?.email) {
            return response(400, false, null, null, 'Email is required');
        }
        const profile = await prisma.user.findUnique({
            where: { email: body.email }
        })
        if (!profile) {
            return response(404, false, null, null, 'User not found');
        }
        const userUpdate = await prisma.user.update({
            where: { email: body.email },
            data: body
        })
        if (!userUpdate) {
            return response(400, false, null, null, 'Failed to update profile');
        }
        return response(200, true, 'Profile updated successfully', userUpdate, null);
    } catch (error) {
        return response(500, false, 'Internal Server Error', null, error);
    }
}

const dashboardService = async (userId) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return response(400, false, "User not found", null, null);
        }
        if (user.role === 'Vendor') {
            const [total, completed, pending, printing, earnings] = await Promise.all([
                prisma.printingOrder.count({ where: { vendorId: userId } }),
                prisma.printingOrder.count({ where: { vendorId: userId, deliveryStatus: "Delivered" } }),
                prisma.printingOrder.count({ where: { vendorId: userId, printStatus: "Pending" } }),
                prisma.printingOrder.count({ where: { vendorId: userId, deliveryStatus: "Printing" } }),
                prisma.wallet.findUnique({ where: { userId: userId } })
            ]);
            const dashboardData = {
                totalOrders: total,
                completedOrders: completed,
                pendingOrders: pending,
                printingOrders: printing,
                earnings: earnings
            }
            return response(200, true, "Vendor dashboard data retrieved successfully", { dashboardData }, null);
        }
        else if (user.role === 'Author') {
            const [books, wallet] = await Promise.all([
                prisma.book.findMany({ where: { authorId: userId } }),
                prisma.wallet.findUnique({ where: { userId: userId } })
            ])
            const [publishedBooks, onlineBooks, OffineBooks] = [
                books.filter(books => books.isPublished === true),
                books.filter(books => books.publishType === 'ONLINE'),
                books.filter(books => books.publishType === 'OFFLINE')
            ];
            const [digitalSales, printedSales] = await Promise.all([
                prisma.purchaseOrder.findMany({
                    where: { bookId: { in: onlineBooks.map(book => book.id) } },
                    include: { orderBook: true }
                }),
                prisma.printingOrder.findMany({
                    where: { bookId: { in: OffineBooks.map(book => book.id) } },
                    include: { orderBook: true }
                })
            ]);
            const salesMap = {}

            digitalSales.forEach(order => {
                const bookId = order.bookId;
                if (!salesMap[bookId]) {
                    salesMap[bookId] = {
                        title: order.orderBook.title,
                        cover: order.orderBook.thumbnailImg,
                        sales: 0,
                        revenue: 0
                    };
                }
                salesMap[bookId].sales += order.quantity;
                salesMap[bookId].revenue += order.totalPrice;
            })

            printedSales.forEach(order => {
                const bookId = order.bookId;
                if (!salesMap[bookId]) {
                    salesMap[bookId] = {
                        title: order.orderBook.title,
                        cover: order.orderBook.thumbnailImg,
                        sales: 0,
                        revenue: 0
                    };
                }
                salesMap[bookId].sales += order.copies;
                salesMap[bookId].revenue += order.quotationAmount;
            })


            const salesData = Object.values(salesMap);

            const totalRevenue = salesData.reduce((sum, book) => sum + book.revenue, 0);
            const topSeller = salesData.sort((a, b) => b.sales - a.sales).slice(0, 3);

            const recentActivity = [
                ...digitalSales.map(order => {
                    return {
                        id: order.id,
                        text: `New order received for ${order.orderBook.title} for ${order.quantity} copies.`,
                        date: order.orderedAt,
                        type: 'sale'
                    }
                }),
                ...printedSales.map(order => {
                    return {
                        id: order.id,
                        text: `New order received for ${order.orderBook.title} for ${order.copies} copies.`,
                        date: order.orderedAt,
                        type: 'print'

                    }
                })
            ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4)
                .map(activity => ({
                    ...activity,
                    date: new Date(activity.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) // Format at the end
                }));

            const reviews = await prisma.review.findMany({
                where: { book: { authorId: userId } },
                orderBy: { createdAt: 'desc' },
                take: 3,
                include: {
                    book: true,
                    user: true
                }
            });

            const recentReviews = reviews.map(rev => ({
                id: rev.id,
                reader: rev.user.name,
                rating: rev.rating,
                comment: rev.comment,
                book: rev.book.title
            }));


            const dashboardData = {
                writtenBooks: books,
                publishedBooks: publishedBooks,
                onlineBooks: onlineBooks,
                offlineBooks: OffineBooks,
                earnings: wallet,
                salesData: salesData,
                totalRevenue: totalRevenue,
                // totalReaders: totalReaders,
                topSeller: topSeller,
                recentActivity: recentActivity,
                recentReviews: recentReviews
            };
            return response(200, true, "Author dashboard data retrieved successfully", { dashboardData }, null);
        }
        else if (user.role === 'Reader') {
            const orders = await prisma.purchaseOrder.findMany({
                where: { userId: userId, paymentStatus: 'Paid' },
                include: {
                    orderBook: {
                        include: {
                            author: true,
                            reviews: true
                        }
                    }
                }
            });

            const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

            const exploredCategories = orders.map((order) => order.orderBook.category);

            const setCategories = new Set(exploredCategories);

            const continueReading = await prisma.readingProgress.findMany({
                where: { userId: userId, readingStatus: 'InProgress' },
                include: {
                    book: {
                        include: {
                            author: true
                        }
                    }
                }
            });

            const readingHistory = await prisma.readingProgress.findMany({
                where: { userId: userId },
                include: {
                    book: {
                        include: {
                            author: true
                        }
                    }
                },
                orderBy: { lastReadAt: "desc" },
                take: 3
            });

            const allReadingProgress = await prisma.readingProgress.findMany({
                where: { userId: userId },
                include: {
                    book: {
                        include: {
                            author: true
                        }
                    }
                }
            });

            const recommendedBooks = await prisma.book.findMany({
                where: {
                    isPublished: true,
                    id: {
                        notIn: orders.map((order) => order.orderBook.id)
                    }
                },
                take: 4,
                include: {
                    author: true,
                    reviews: true
                },
                orderBy: { createdAt: "desc" },
            });

            const reviewCount = await prisma.review.count({
                where: {
                    userId: userId
                }
            });

            const completedBooks = await prisma.readingProgress.count({
                where: {
                    userId: userId,
                    readingStatus: 'Completed'
                }
            })

            const xp = completedBooks * 200 + reviewCount * 50 + orders.length * 100;
            const readerLevel = Math.floor(xp / 500) + 1;

            const readingGoal = {
                goal: readerLevel * 10,
                completedBooks: completedBooks,
                readerLevel: readerLevel,
                xp: xp,
                levelProgressPercent: Math.round(((xp % 500) / 500) * 100),
                progress: Math.round((completedBooks / 12) * 100)
            }

            const dashboardData = {
                purchaseOrders: orders,
                totalSpent: totalSpent,
                exploredCategories: setCategories.size,
                readingBooksCount: continueReading.length,
                continueReading: continueReading,
                completedBooks: completedBooks,
                recommendedBooks: recommendedBooks,
                readingHistory: readingHistory,
                readingGoal: readingGoal,
                allReadingProgress: allReadingProgress
            }
            return response(200, true, "Reader dashboard data retrieved successfully", { dashboardData }, null);
        }
        else if (user.role === 'Admin') {
            const [totalUsers, totalBooks, totalOrders, wallet] = await Promise.all([
                prisma.user.count(),
                prisma.book.count(),
                prisma.purchaseOrder.count(),
                prisma.wallet.findUnique({ where: { userId: userId } })
            ]);

            const dashboardData = {
                totalUsers: totalUsers,
                totalBooks: totalBooks,
                totalOrders: totalOrders,
                earnings: wallet
            }
            return response(200, true, "Admin dashboard data retrieved successfully", { dashboardData }, null);
        }
        else {
            return response(400, false, "Invalid user role", null, null);
        }
    } catch (error) {
        return response(500, false, 'Internal Server Error', null, error);
    }
}

export { userProfileService, profileUpdateService, dashboardService }