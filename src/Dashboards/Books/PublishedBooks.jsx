import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom';
import { FaStar, FaChevronLeft, FaShoppingCart, FaFilter, FaChevronRight } from 'react-icons/fa'
import api from "../../utils/api";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookFilters } from '../../CommonComponents/BookFilters';
import { Modal } from '../../CommonComponents/Modal';

function PublishedBooks() {

    const [isActive, setIsActive] = useState("All Books")
    const [minPrice, setMinPrice] = useState(100)
    const [maxPrice, setMaxPrice] = useState(700)
    const [category, setCategory] = useState("All Books")
    const [format, setFormat] = useState(null)
    const [rating, setRating] = useState(null)
    const [pages, setPages] = useState(null)
    const [sort, setSort] = useState(null)
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search") || "";
    const [page, setPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const limit = 8;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['published-books', { search, category, minPrice, maxPrice, rating, sort, format, pages, page, limit }],
        queryFn: async () => {
            const res = await api.get('/book/published-books', {
                params: {
                    page,
                    limit,
                    search,
                    category,
                    minPrice,
                    maxPrice,
                    rating,
                    sort,
                    format,
                    pages
                }
            });
            return res.data.data.data;
        }
    });
    const { books = [], pagination = {} } = data || {};

    function calculateAverageRating(reviews) {
        if (reviews?.length === 0) return 0.0;
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (totalRating / reviews.length).toFixed(1);
    }

    const checkb = [
        { value: "All Books", category: "All Books" },
        { value: "Fiction", category: "Fiction" },
        { value: "Fantasy", category: "Fantasy" },
        { value: "Mystery", category: "Mystery" },
        { value: "Sci-Fi", category: "Sci-Fi" },
        { value: "Horror", category: "Horror" },
        { value: "Romance", category: "Romance" },
    ]
    const queryClient = useQueryClient();

    const addToCart = useMutation({
        mutationFn: async () => {
            const response = await api.post(`/cart/add-to-cart/${bookId}`);
            return response.data.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['cart'])
            alert("Added to cart");
        },
        onError: (error) => {
            console.log(`${error} in adding to cart`);
        }
    })
    return (
        <div className='flex flex-col gap-2'>
            <div className="lg:hidden flex flex-col items-start gap-1 py-2">
                <h1 className="text-2xl font-bold text-cream-dim">Published Books</h1>
                <p className="text-brown-light text-xs font-light">
                    Discover stories that inspire, entertain, and stay with you.
                </p>
            </div>
            <div className='flex lg:hidden items-center justify-between w-full gap-4'>
                <input
                    className="w-full bg-transparent outline-none border border-border/40 rounded-md p-2 text-gold text-xs placeholder:text-gold/40"
                    placeholder="Search by title, author or category..."
                    value={search}
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
                <button onClick={() => { setIsFilterOpen(!isFilterOpen) }} className="text-xs flex flex-row items-center justify-center gap-2 bg-transparent outline-none border border-border/40 rounded-md px-3 py-2 text-cream-dim hover:text-gold hover:font-medium hover:border-gold/50 hover:ring-1 transition-all duration-300 ">
                    <FaFilter className='text-xs text-gold' /> Filter
                </button>
            </div>
            <Modal open={isFilterOpen} close={() => setIsFilterOpen(false)} className="z-50">
                <BookFilters className="max-h-[80vh] overflow-y-auto scrollbar-none flex flex-col gap-10 p-3 bg-bg-secondary w-full"
                    minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice} setMaxPrice={setMaxPrice} rating={rating} setRating={setRating} format={format} setFormat={setFormat} pages={pages} setPages={setPages} />
            </Modal>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

                <div className="flex flex-col gap-2 lg:col-span-3">
                    <div className="flex flex-row justify-between overflow-x-auto scrollbar-none whitespace-nowrap w-full border border-border/40 rounded-md px-4 py-3">
                        {/* Filter by */}
                        {
                            checkb.map((checkb, index) => (
                                <button onClick={() => {
                                    setCategory(checkb.value)
                                    setIsActive(checkb.value)
                                }} className={`rounded-md px-4 py-1.5 flex items-center gap-2 text-xs lg:text-sm text-cream-dim hover:text-gold hover:font-medium hover:border-gold/50 hover:ring-1 transition-all duration-300 ${isActive === checkb.value ? 'text-gold font-medium border-gold border-1' : ''}`}>
                                    {checkb.category}
                                </button>
                            ))
                        }
                    </div>
                    <div className="flex flex-row justify-between w-full px-4 py-3">
                        {/* Sort by */}
                        <div className="flex items-center justify-center text-xs lg:text-sm text-gold/50">
                            {/* Pagination Detail */}
                            {`Showing ${pagination.page} to ${pagination.currentPageItems} of ${pagination.totalItems} results`}
                        </div>
                        <div className='flex items-center gap-4'>
                            <div className="text-xs lg:text-sm p-2 flex items-center justify-center border border-border/40 rounded-md px-2">
                                {/* Sort by */}
                                Sort:
                                <select onChange={(e) => setSort(e.target.value)} className="lg:text-sm focus:outline-none text-xs text-cream-dim/70 bg-bg-primary" name="sort" id="sort">
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                </select>
                            </div>
                            {/* <div className='flex justify-between gap-2 items-center border border-border/40 rounded-md p-1'>
                           
                            <button className='p-0.5 rounded-md cursor-pointer hover:border-gold/50 hover:ring-1 transition-all duration-300 '>
                                <BiGridAlt size={20} />
                            </button>
                            <button className='p-0.5 rounded-md cursor-pointer hover:border-gold/50 hover:ring-1 transition-all duration-300 '>
                                <BiListUl size={20} />
                            </button>

                        </div> */}

                        </div>

                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-2 px-4">
                        {/* Cards */}
                        {books.map((book, index) => (
                            <Link to={`/dashboard/reader/published-books/${book.id}`} className="bg-bg-secondary/30 hover:scale-[1.02] hover:border-gold/30 h-full w-full border border-gold/10 rounded-md p-3" key={index}>
                                <div className="flex flex-col gap-2 h-full">
                                    <div className="border border-border/40 rounded-md h-full w-full aspect-[3/4] overflow-hidden">
                                        <img
                                            src={book.coverImg}
                                            alt="Book Cover"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1">
                                        <h3 className="text-sm font-medium ">{book.title}</h3>
                                        <p className="text-xs text-cream-dim/40">by {book.author.name}</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-xs text-gold"><FaStar /> </p>
                                            <span className='text-xs text-cream-dim/40'>{`${calculateAverageRating(book.reviews)} (${book.reviews.length || 0})`}</span>
                                        </div>
                                        <div className='flex justify-between items-center mt-auto pt-2'>

                                            <p className="text-sm font-medium text-gold">{`Rs ${book.price}`}</p>
                                            <button onClick={() => addToCart.mutate()}
                                                className='p-1 rounded-md cursor-pointer border border-gold/90 hover:border-gold/50 hover:ring-1 transition-all duration-300'>
                                                <FaShoppingCart className='text-gold text-sm' />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className='flex items-center justify-center'>
                        {/* Pagination */}
                        <button onClick={() => setPage(page - 1)} disabled={!pagination?.hasPrevPage} className='p-1 rounded-md cursor-pointer border border-gold/40 hover:border-gold/90 hover:ring-1 transition-all duration-300'>
                            <FaChevronLeft className='text-gold' />
                        </button>
                        {Array.from({ length: pagination?.totalPages }, (_, index) => (
                            <button
                                onClick={() => { setPage(index + 1) }}
                                key={index} className={`p-2 m-2 rounded-md cursor-pointer hover:border-gold/50 hover:ring-1 transition-all duration-300 ${pagination?.page === index + 1 ? 'text-gold border-gold' : ''}`}>
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={!pagination?.hasNextPage}
                            className='p-1 rounded-md cursor-pointer border border-gold/40 hover:border-gold/90 hover:ring-1 transition-all duration-300'>
                            <FaChevronRight className='text-gold' />
                        </button>

                    </div>
                </div>
                <BookFilters className="hidden lg:flex lg:col-span-1 border border-border/40 rounded-md p-3 flex-col gap-10"
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    rating={rating}
                    setRating={setRating}
                    format={format}
                    setFormat={setFormat}
                    pages={pages}
                    setPages={setPages} />
            </div>
        </div>
    )
}

export { PublishedBooks }