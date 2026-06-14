import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding dashboard test data with expanded mock data...');

    // 1. Clean up existing test data to allow clean, repeatable re-runs
    await prisma.transaction.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.printingOrder.deleteMany({});
    await prisma.readingProgress.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.token.deleteMany({});
    await prisma.wallet.deleteMany({});
    await prisma.vendorProfile.deleteMany({});
    await prisma.payoutRequest.deleteMany({});
    await prisma.book.deleteMany({});

    // We clear all users except the main admin account (Sarah) to preserve admin access
    await prisma.user.deleteMany({
        where: {
            NOT: {
                email: 'sarahqureshi2005@gmail.com'
            }
        }
    });

    const hashedPassword = await bcrypt.hash('Author@123', 10);

    // 2. Create Users
    console.log('Creating users...');

    // Create 4 Authors
    const author1 = await prisma.user.create({
        data: {
            name: 'John Writer',
            email: 'author@inkverse.com',
            password: hashedPassword,
            role: 'Author',
            isEmailVerified: true,
            isActive: true,
        }
    });

    const author2 = await prisma.user.create({
        data: {
            name: 'Jane Austen',
            email: 'author2@inkverse.com',
            password: hashedPassword,
            role: 'Author',
            isEmailVerified: true,
            isActive: true,
        }
    });

    const author3 = await prisma.user.create({
        data: {
            name: 'Charles Dickens',
            email: 'author3@inkverse.com',
            password: hashedPassword,
            role: 'Author',
            isEmailVerified: true,
            isActive: true,
        }
    });

    const author4 = await prisma.user.create({
        data: {
            name: 'Ernest Hemingway',
            email: 'author4@inkverse.com',
            password: hashedPassword,
            role: 'Author',
            isEmailVerified: true,
            isActive: true,
        }
    });

    // Create 4 Readers
    const reader1 = await prisma.user.create({
        data: {
            name: 'Alice Reader',
            email: 'reader@inkverse.com',
            password: hashedPassword,
            role: 'Reader',
            isEmailVerified: true,
            isActive: true,
        }
    });

    const reader2 = await prisma.user.create({
        data: {
            name: 'Bob Reader',
            email: 'reader2@inkverse.com',
            password: hashedPassword,
            role: 'Reader',
            isEmailVerified: true,
            isActive: true,
        }
    });

    const reader3 = await prisma.user.create({
        data: {
            name: 'Charlie Reader',
            email: 'reader3@inkverse.com',
            password: hashedPassword,
            role: 'Reader',
            isEmailVerified: true,
            isActive: true,
        }
    });

    const reader4 = await prisma.user.create({
        data: {
            name: 'Diana Reader',
            email: 'reader4@inkverse.com',
            password: hashedPassword,
            role: 'Reader',
            isEmailVerified: true,
            isActive: true,
        }
    });

    // Create 3 Vendors
    const vendor1 = await prisma.user.create({
        data: {
            name: 'QuickPrint Vendor',
            email: 'vendor@inkverse.com',
            password: hashedPassword,
            role: 'Vendor',
            isEmailVerified: true,
            isActive: true,
        }
    });

    const vendor2 = await prisma.user.create({
        data: {
            name: 'Elite Publishers',
            email: 'vendor2@inkverse.com',
            password: hashedPassword,
            role: 'Vendor',
            isEmailVerified: true,
            isActive: true,
        }
    });

    const vendor3 = await prisma.user.create({
        data: {
            name: 'PressForge Printing',
            email: 'vendor3@inkverse.com',
            password: hashedPassword,
            role: 'Vendor',
            isEmailVerified: true,
            isActive: true,
        }
    });

    // 3. Create Vendor Profiles (required details for print calculations)
    console.log('Creating vendor profiles...');
    await prisma.vendorProfile.createMany({
        data: [
            {
                userId: vendor1.id,
                companyName: 'QuickPrint Solutions',
                perPageCost: 1.25,
            },
            {
                userId: vendor2.id,
                companyName: 'Elite Publishing Services',
                perPageCost: 1.80,
            },
            {
                userId: vendor3.id,
                companyName: 'PressForge Printing House',
                perPageCost: 2.10,
            }
        ]
    });

    // 4. Create Wallets for Authors and Vendors
    console.log('Creating wallets...');
    const wallets = [
        { userId: author1.id, totalBalance: 32540.00, currentBalance: 12540.00, totalWithdrawn: 20000.00 },
        { userId: author2.id, totalBalance: 14200.00, currentBalance: 8200.00, totalWithdrawn: 6000.00 },
        { userId: author3.id, totalBalance: 54100.00, currentBalance: 34100.00, totalWithdrawn: 20000.00 },
        { userId: author4.id, totalBalance: 8900.00, currentBalance: 3900.00, totalWithdrawn: 5000.00 },
        { userId: vendor1.id, totalBalance: 15000.00, currentBalance: 5000.00, totalWithdrawn: 10000.00 },
        { userId: vendor2.id, totalBalance: 28000.00, currentBalance: 18000.00, totalWithdrawn: 10000.00 },
        { userId: vendor3.id, totalBalance: 42000.00, currentBalance: 22000.00, totalWithdrawn: 20000.00 }
    ];
    await prisma.wallet.createMany({ data: wallets });

    // 5. Create Books for all 4 Authors
    console.log('Creating books...');

    // Author 1 Books
    const book1 = await prisma.book.create({
        data: {
            title: 'Whispers of the Forest',
            category: 'Fantasy',
            description: 'A magical tale of secrets hidden deep within an ancient, living forest.',
            content: 'Chapter 1: The green canopy whispered stories older than time...',
            publishType: 'ONLINE',
            isPublished: true,
            isActive: true,
            thumbnailImg: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
            price: 250,
            pages: 150,
            seoWords: ['magic', 'forest', 'fantasy'],
            authorId: author1.id,
            publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
    });

    const book2 = await prisma.book.create({
        data: {
            title: 'Echoes of Yesterday',
            category: 'Historical Fiction',
            description: 'A sweeping saga of families torn apart by conflict, rebuilding their lives.',
            content: 'Chapter 1: The rain fell like iron filings on the cold cobbles...',
            publishType: 'OFFLINE',
            isPublished: true,
            isActive: true,
            thumbnailImg: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
            price: 499,
            pages: 320,
            seoWords: ['history', 'war', 'drama'],
            authorId: author1.id,
            publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
        }
    });

    const book3 = await prisma.book.create({
        data: {
            title: 'Beyond the Stars',
            category: 'Sci-Fi',
            description: 'An epic space odyssey exploring the edge of human contact with foreign relics.',
            content: 'Chapter 1: The sub-space scanner pulsed every six seconds...',
            publishType: 'ONLINE',
            isPublished: true,
            isActive: true,
            thumbnailImg: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80',
            price: 350,
            pages: 280,
            seoWords: ['space', 'aliens', 'odyssey'],
            authorId: author1.id,
            publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        }
    });

    const book4 = await prisma.book.create({
        data: {
            title: 'The Last Letter',
            category: 'Romance',
            description: 'A forgotten letter in an old attic restarts a romance forty years later.',
            content: 'Draft manuscript copy...',
            publishType: 'OFFLINE',
            isPublished: false,
            isActive: true,
            thumbnailImg: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80',
            price: 150,
            pages: 180,
            seoWords: ['love', 'letter', 'romance'],
            authorId: author1.id
        }
    });

    // Author 2 Books
    const book5 = await prisma.book.create({
        data: {
            title: 'Pride & Digital Prejudice',
            category: 'Romance',
            description: 'A hilarious and clever modern retelling of relationships in the internet age.',
            content: 'Chapter 1: It is a truth universally acknowledged, that a single programmer in possession of a good fortune, must be in want of a Wi-Fi connection...',
            publishType: 'ONLINE',
            isPublished: true,
            isActive: true,
            thumbnailImg: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
            price: 199,
            pages: 220,
            seoWords: ['love', 'humor', 'modern'],
            authorId: author2.id,
            publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        }
    });

    const book6 = await prisma.book.create({
        data: {
            title: 'Sense & Cybersecurity',
            category: 'Mystery',
            description: 'A cybersecurity expert solves mysteries in the dark web.',
            content: 'Chapter 1: The firewall logs were clean, but she knew something was deeply wrong...',
            publishType: 'OFFLINE',
            isPublished: true,
            isActive: false, // Inactive Published Book
            thumbnailImg: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=80',
            price: 450,
            pages: 300,
            seoWords: ['hacking', 'mystery', 'tech'],
            authorId: author2.id,
            publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
        }
    });

    const book7 = await prisma.book.create({
        data: {
            title: 'Mansfield Server',
            category: 'Drama',
            description: 'An emotional drama of developers struggling to keep their platform alive.',
            content: 'Draft manuscript copy...',
            publishType: 'ONLINE',
            isPublished: false,
            isActive: true, // Active Draft
            thumbnailImg: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
            price: 299,
            pages: 240,
            seoWords: ['drama', 'startup', 'struggle'],
            authorId: author2.id
        }
    });

    const book8 = await prisma.book.create({
        data: {
            title: 'Northanger Database',
            category: 'Thriller',
            description: 'A detective uncovers secrets hidden in a corrupted government database.',
            content: 'Chapter 1: The query took exactly 42 seconds, returning files that should have been deleted...',
            publishType: 'ONLINE',
            isPublished: true,
            isActive: true,
            thumbnailImg: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
            price: 399,
            pages: 260,
            seoWords: ['database', 'thriller', 'conspiracy'],
            authorId: author2.id,
            publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
        }
    });

    // Author 3 Books
    const book9 = await prisma.book.create({
        data: {
            title: 'Bleak House of Code',
            category: 'Mystery',
            description: 'A dense mystery detailing an endless, unresolved lawsuit over a software patent.',
            content: 'Chapter 1: Fog everywhere. Fog up the river, fog down the river, fog in the build system...',
            publishType: 'OFFLINE',
            isPublished: true,
            isActive: true,
            thumbnailImg: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
            price: 550,
            pages: 450,
            seoWords: ['patent', 'lawsuit', 'mystery'],
            authorId: author3.id,
            publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        }
    });

    const book10 = await prisma.book.create({
        data: {
            title: 'Great Expectations of QA',
            category: 'Drama',
            description: 'A young tester learns that success in software is rarely about what you expect.',
            content: 'Chapter 1: My father’s family name being Pirrip, and my Christian name Philip, my infant tongue could make of both names nothing longer than Pip...',
            publishType: 'ONLINE',
            isPublished: true,
            isActive: true,
            thumbnailImg: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
            price: 299,
            pages: 350,
            seoWords: ['testing', 'growth', 'developer'],
            authorId: author3.id,
            publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
    });

    const book11 = await prisma.book.create({
        data: {
            title: 'A Tale of Two Servers',
            category: 'Sci-Fi',
            description: 'It was the best of platforms, it was the worst of platforms.',
            content: 'Draft manuscript copy...',
            publishType: 'ONLINE',
            isPublished: false,
            isActive: false, // Inactive Draft
            thumbnailImg: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
            price: 199,
            pages: 210,
            seoWords: ['dystopian', 'servers', 'comparison'],
            authorId: author3.id
        }
    });

    const book12 = await prisma.book.create({
        data: {
            title: 'Oliver Stack',
            category: 'Adventure',
            description: 'An orphan developer navigates the streets of London, asking for more memory.',
            content: 'Draft manuscript copy...',
            publishType: 'OFFLINE',
            isPublished: false,
            isActive: true, // Active Draft
            thumbnailImg: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
            price: 350,
            pages: 280,
            seoWords: ['adventure', 'classic', 'adaptation'],
            authorId: author3.id
        }
    });

    // Author 4 Books
    const book13 = await prisma.book.create({
        data: {
            title: 'The Old Man and the API',
            category: 'Adventure',
            description: 'An aging programmer goes 84 days without a successful compilation, fighting to hook a massive API integration.',
            content: 'Chapter 1: He was an old man who fished alone in a skiff in the Gulf Stream of modern frameworks, and he had gone eighty-four days now without taking an API call...',
            publishType: 'ONLINE',
            isPublished: true,
            isActive: true,
            thumbnailImg: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?auto=format&fit=crop&w=600&q=80',
            price: 120,
            pages: 95,
            seoWords: ['struggle', 'sea', 'classic'],
            authorId: author4.id,
            publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
    });

    const book14 = await prisma.book.create({
        data: {
            title: 'A Farewell to Bugs',
            category: 'Thriller',
            description: 'An intense love story during a war against legacy codebases and production crashes.',
            content: 'Chapter 1: In the late summer of that year we lived in a house in a village that looked across the river and the plain to the mountains of deployment pipelines...',
            publishType: 'OFFLINE',
            isPublished: true,
            isActive: true,
            thumbnailImg: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
            price: 320,
            pages: 190,
            seoWords: ['love', 'war', 'bugs'],
            authorId: author4.id,
            publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
    });

    const book15 = await prisma.book.create({
        data: {
            title: 'For Whom the Ping Tolls',
            category: 'Cyberpunk',
            description: 'A heavy story about the loss of server node connectivity and the networks that unite us.',
            content: 'Chapter 1: No node is an island, entire of itself; every network is a piece of the continent, a part of the main...',
            publishType: 'ONLINE',
            isPublished: true,
            isActive: false, // Inactive Published Book
            thumbnailImg: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=600&q=80',
            price: 250,
            pages: 175,
            seoWords: ['connection', 'network', 'cyberpunk'],
            authorId: author4.id,
            publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
    });

    const book16 = await prisma.book.create({
        data: {
            title: 'The Sun Also Compiles',
            category: 'Drama',
            description: 'A group of expatriate developers travels to a coding festival in Spain.',
            content: 'Draft manuscript copy...',
            publishType: 'OFFLINE',
            isPublished: false,
            isActive: true, // Active Draft
            thumbnailImg: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=150&q=80',
            coverImg: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
            price: 280,
            pages: 210,
            seoWords: ['spain', 'travel', 'compiling'],
            authorId: author4.id
        }
    });

    // 6. Create Digital/Physical Purchase Orders (PurchaseOrders) & Transactions
    console.log('Creating purchase orders and transactions...');

    // Helper function to easily record sales
    const recordSale = async (user, book, quantity, shippingAddress = null, daysAgo = 2) => {
        const totalPrice = (book.price || 200) * quantity;
        const orderedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        const order = await prisma.purchaseOrder.create({
            data: {
                userId: user.id,
                bookId: book.id,
                quantity: quantity,
                totalPrice: totalPrice,
                paymentStatus: 'Paid',
                shippingAddress: shippingAddress,
                orderedAt: orderedAt
            }
        });

        await prisma.transaction.create({
            data: {
                transactionId: `TXN-P${Math.floor(100000 + Math.random() * 900000)}`,
                amount: totalPrice,
                paymentMethod: 'Credit Card',
                userId: user.id,
                purchaseOrderId: order.id,
                paymentStatus: 'Paid',
                createdAt: orderedAt
            }
        });

        return order;
    };

    // Readers purchase published and active books
    await recordSale(reader1, book1, 1, null, 10);
    await recordSale(reader1, book3, 1, null, 8);
    await recordSale(reader1, book13, 1, null, 4);

    await recordSale(reader2, book3, 1, null, 7);
    await recordSale(reader2, book5, 1, null, 5);
    await recordSale(reader2, book10, 1, null, 3);
    await recordSale(reader2, book2, 1, '456 Elm St, Booktown, BK 12345', 6); // Physical paperback

    await recordSale(reader3, book1, 1, null, 9);
    await recordSale(reader3, book8, 1, null, 4);
    await recordSale(reader3, book9, 2, '789 Maple Rd, Storyville, SV 98765', 5); // Physical paperback

    await recordSale(reader4, book10, 1, null, 4);
    await recordSale(reader4, book13, 1, null, 2);
    await recordSale(reader4, book14, 1, '101 Pine Ln, Novel City, NC 54321', 1); // Physical paperback

    // 7. Create Physical Printing Orders between Authors and Vendors
    console.log('Creating printing orders...');

    // Helper to generate printing order with transaction
    const recordPrintingOrder = async (author, vendor, book, copies, deliveryStatus, printStatus, daysAgo) => {
        const quotationAmount = book.pages * vendor.vendor.perPageCost * copies;
        const advanceAmount = parseFloat((quotationAmount * 0.5).toFixed(2));
        const remainingAmount = parseFloat((quotationAmount - advanceAmount).toFixed(2));
        const orderedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        const printOrder = await prisma.printingOrder.create({
            data: {
                authorId: author.id,
                vendorId: vendor.id,
                bookId: book.id,
                copies: copies,
                pages: book.pages || 200,
                quotationAmount: quotationAmount,
                advanceAmount: advanceAmount,
                remainingAmount: remainingAmount,
                shippingAddress: '123 Writer Lane, Novel City',
                deliveryStatus: deliveryStatus,
                printStatus: printStatus,
                orderedAt: orderedAt
            }
        });

        // Add advance payment transaction
        await prisma.transaction.create({
            data: {
                transactionId: `TXN-PR-${Math.floor(100000 + Math.random() * 900000)}`,
                amount: advanceAmount,
                paymentMethod: 'Wallet Transfer',
                userId: author.id,
                printingOrderId: printOrder.id,
                paymentStatus: printStatus === 'Rejected' ? 'Rejected' : 'Paid',
                createdAt: orderedAt
            }
        });

        // Add remaining payment transaction if delivered
        if (deliveryStatus === 'Delivered' && printStatus === 'Accepted') {
            await prisma.transaction.create({
                data: {
                    transactionId: `TXN-PR-${Math.floor(100000 + Math.random() * 900000)}`,
                    amount: remainingAmount,
                    paymentMethod: 'Wallet Transfer',
                    userId: author.id,
                    printingOrderId: printOrder.id,
                    paymentStatus: 'Paid',
                    createdAt: new Date(orderedAt.getTime() + 4 * 24 * 60 * 60 * 1000) // 4 days later
                }
            });
        }

        return printOrder;
    };

    // Load vendors with profiles for the helper calculations
    const v1 = await prisma.user.findUnique({ where: { id: vendor1.id }, include: { vendor: true } });
    const v2 = await prisma.user.findUnique({ where: { id: vendor2.id }, include: { vendor: true } });
    const v3 = await prisma.user.findUnique({ where: { id: vendor3.id }, include: { vendor: true } });

    // Printing Order 1 (Author 1 -> Vendor 1, Book 2, Delivered)
    await recordPrintingOrder(author1, v1, book2, 100, 'Delivered', 'Accepted', 15);
    // Printing Order 2 (Author 1 -> Vendor 2, Book 2, Shipped)
    await recordPrintingOrder(author1, v2, book2, 50, 'Shipped', 'Accepted', 8);
    // Printing Order 3 (Author 2 -> Vendor 1, Book 6, Printing)
    await recordPrintingOrder(author2, v1, book6, 120, 'Printing', 'Accepted', 5);
    // Printing Order 4 (Author 3 -> Vendor 3, Book 9, Pending)
    await recordPrintingOrder(author3, v3, book9, 80, 'Pending', 'Pending', 2);
    // Printing Order 5 (Author 4 -> Vendor 2, Book 14, Rejected Request)
    await recordPrintingOrder(author4, v2, book14, 200, 'Pending', 'Rejected', 6);
    // Printing Order 6 (Author 4 -> Vendor 3, Book 16, Delivered)
    await recordPrintingOrder(author4, v3, book16, 150, 'Delivered', 'Accepted', 12);

    // 8. Create Reviews from Multiple Readers
    console.log('Creating book reviews...');
    const reviewsData = [
        { userId: reader1.id, bookId: book1.id, rating: 5, comment: 'Absolutely loved the world-building in Whispers of the Forest! Couldn\'t put it down.' },
        { userId: reader2.id, bookId: book1.id, rating: 4, comment: 'Very magical and descriptive, though the pacing starts a bit slow.' },
        { userId: reader3.id, bookId: book1.id, rating: 5, comment: 'An absolute masterpiece of fantasy fiction. Highly recommend.' },
        { userId: reader1.id, bookId: book3.id, rating: 4, comment: 'Gripping space narrative, kept me hooked till the end!' },
        { userId: reader4.id, bookId: book3.id, rating: 5, comment: 'Mind-bending sci-fi! The ending was completely unexpected and deep.' },
        { userId: reader2.id, bookId: book5.id, rating: 5, comment: 'Jane Austen combined with cyber-romance? A masterclass in humor.' },
        { userId: reader3.id, bookId: book5.id, rating: 4, comment: 'A very fun read. The characters are witty and the theme is refreshing.' },
        { userId: reader1.id, bookId: book8.id, rating: 5, comment: 'A gripping database thriller that kept me up reading until late.' },
        { userId: reader4.id, bookId: book8.id, rating: 5, comment: 'Fabulous pacing and great character development. 10/10.' },
        { userId: reader2.id, bookId: book9.id, rating: 3, comment: 'A bit dense and slow-paced, but the atmosphere and prose are top notch.' },
        { userId: reader3.id, bookId: book9.id, rating: 4, comment: 'A dark, intricate mystery with a brilliant technical patent twist.' },
        { userId: reader1.id, bookId: book10.id, rating: 4, comment: 'Great depiction of software testing pressures in a dramatic framing.' },
        { userId: reader4.id, bookId: book10.id, rating: 5, comment: 'Very relatable for tech workers and wonderfully written characters.' },
        { userId: reader1.id, bookId: book13.id, rating: 4, comment: 'Short, crisp, and beautifully allegorical. Hemingway fans won\'t be disappointed.' },
        { userId: reader2.id, bookId: book13.id, rating: 5, comment: 'A beautiful exploration of struggle, persistence, and legacy in modern tech.' },
        { userId: reader3.id, bookId: book14.id, rating: 4, comment: 'An intense offline book thriller with a satisfying bug-squashing resolution.' }
    ];

    for (const review of reviewsData) {
        await prisma.review.create({ data: review });
    }

    // 9. Create Reading Progress records (InProgress, Completed, NotStarted)
    console.log('Creating reading progress logs...');
    const progressLogs = [
        // Reader 1
        { userId: reader1.id, bookId: book1.id, currentPage: 68, progressPercentage: 45.3, readingStatus: 'InProgress', lastReadAt: new Date(Date.now() - 30 * 60 * 1000) },
        { userId: reader1.id, bookId: book3.id, currentPage: 280, progressPercentage: 100.0, readingStatus: 'Completed', lastReadAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { userId: reader1.id, bookId: book5.id, currentPage: 22, progressPercentage: 10.0, readingStatus: 'InProgress', lastReadAt: new Date(Date.now() - 5 * 60 * 1000) },
        { userId: reader1.id, bookId: book13.id, currentPage: 0, progressPercentage: 0.0, readingStatus: 'NotStarted', lastReadAt: null },

        // Reader 2
        { userId: reader2.id, bookId: book3.id, currentPage: 140, progressPercentage: 50.0, readingStatus: 'InProgress', lastReadAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
        { userId: reader2.id, bookId: book5.id, currentPage: 220, progressPercentage: 100.0, readingStatus: 'Completed', lastReadAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { userId: reader2.id, bookId: book10.id, currentPage: 70, progressPercentage: 20.0, readingStatus: 'InProgress', lastReadAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },

        // Reader 3
        { userId: reader3.id, bookId: book1.id, currentPage: 150, progressPercentage: 100.0, readingStatus: 'Completed', lastReadAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { userId: reader3.id, bookId: book8.id, currentPage: 130, progressPercentage: 50.0, readingStatus: 'InProgress', lastReadAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },

        // Reader 4
        { userId: reader4.id, bookId: book13.id, currentPage: 80, progressPercentage: 84.2, readingStatus: 'InProgress', lastReadAt: new Date(Date.now() - 15 * 60 * 1000) },
        { userId: reader4.id, bookId: book10.id, currentPage: 350, progressPercentage: 100.0, readingStatus: 'Completed', lastReadAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
    ];

    for (const log of progressLogs) {
        await prisma.readingProgress.create({ data: log });
    }

    // 10. Add Items to Carts of Readers
    console.log('Adding items to reader carts...');
    const cartEntries = [
        { userId: reader1.id, bookId: book8.id },
        { userId: reader1.id, bookId: book10.id },
        { userId: reader2.id, bookId: book1.id },
        { userId: reader2.id, bookId: book13.id },
        { userId: reader3.id, bookId: book3.id },
        { userId: reader4.id, bookId: book5.id }
    ];

    for (const entry of cartEntries) {
        await prisma.cart.create({ data: entry });
    }

    console.log('---------------------------------------------');
    console.log('Seeding completed successfully!');
    console.log('Created Users:');
    console.log(`- Author 1: email: author@inkverse.com | password: Author@123`);
    console.log(`- Author 2: email: author2@inkverse.com | password: Author@123`);
    console.log(`- Author 3: email: author3@inkverse.com | password: Author@123`);
    console.log(`- Author 4: email: author4@inkverse.com | password: Author@123`);
    console.log(`- Reader 1: email: reader@inkverse.com | password: Author@123`);
    console.log(`- Reader 2: email: reader2@inkverse.com | password: Author@123`);
    console.log(`- Reader 3: email: reader3@inkverse.com | password: Author@123`);
    console.log(`- Reader 4: email: reader4@inkverse.com | password: Author@123`);
    console.log(`- Vendor 1: email: vendor@inkverse.com | password: Author@123`);
    console.log(`- Vendor 2: email: vendor2@inkverse.com | password: Author@123`);
    console.log(`- Vendor 3: email: vendor3@inkverse.com | password: Author@123`);
    console.log('---------------------------------------------');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
