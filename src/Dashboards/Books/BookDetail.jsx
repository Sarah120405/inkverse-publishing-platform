import { useParams, Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { HiDocumentText } from "react-icons/hi";
import { MdLanguage, MdCalendarMonth } from "react-icons/md";
import { BsBuilding, BsFill2SquareFill } from "react-icons/bs";
import { FaStar, FaShoppingCart, FaPhone, FaBookReader, FaBolt, FaArrowLeft } from "react-icons/fa";
import calculateAverageRating from "../../utils/reviewCalculation";

function BookDetail() {
    const { bookId } = useParams();
    console.log(bookId);

    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['book', bookId],
        queryFn: async () => {
            const response = await api.get(`/book/published-books/${bookId}`);
            return response.data.data.data;
        }
    })

    const addToCart = useMutation({
        mutationFn: async (bookId) => {
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
    const { book, recommendedBooks } = data || {};
    return (
        <div className="flex flex-col gap-6">
            <div className="lg:hidden flex flex-col items-start gap-1 py-2">
                <Link to={`/dashboard/reader/published-books`} className="text-brown-light text-xs lg:text-sm font-light hover:text-gold hover:underline transition-colors duration-200">
                    <FaArrowLeft className="inline-block mr-1" />
                    Back to Published Books
                </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-6">
                <div className="grid grid-cols-12 gap-4 col-span-12 lg:contents">
                    <div className="lg:col-span-2 col-span-5 border border-border/40 rounded-md h-full w-full aspect-[2/3] overflow-hidden">
                        {/* Book COver */}
                        <img src={book?.coverImg} alt={book?.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="lg:col-span-5 col-span-7 flex flex-col gap-2">
                        {/* Basic book details */}
                        <h1 className="lg:text-xl text-lg font-bold text-cream font-playfair">{book?.title}</h1>
                        <p className="lg:text-lg text-md text-cream-dim/80">by {book?.author?.name}</p>
                        <div className="flex items-center gap-1">
                            <p className="text-sm text-gold flex flex-row">
                                {Array.from({ length: Math.round(calculateAverageRating(book?.reviews)) }, (_, i) => (
                                    <FaStar key={i} />
                                ))}
                            </p>
                            <span className='text-sm text-cream-dim/40'>{`${calculateAverageRating(book?.reviews)} (${book?.reviews?.length || 0})`}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="lg:text-base text-sm text-cream-dim/80">{book?.category}</span>
                            <span className="lg:text-base text-sm text-cream-dim/80">{book?.publishType === "ONLINE" ? "Online" : "Offline"}</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-base italic text-cream-dim/80">{book?.description}</p>
                            <hr className="border-border/40 w-full my-2" />
                            <span className="lg:text-lg text-base text-gold font-semibold">Rs {book?.price.toFixed(2)}</span>
                        </div>
                        <div className='hidden lg:flex flex-row justify-between items-center gap-2'>
                            <button onClick={() => addToCart.mutate(book?.id)}
                                disabled={addToCart.isPending}
                                className='flex-1 border border-gold text-gold bg-transparent hover:bg-gold/10 p-3 rounded-md transition-all duration-300 flex items-center justify-center gap-2'>
                                <FaShoppingCart />
                                Add to Cart
                            </button>
                            <button className='flex-1 bg-gold text-bg-primary p-3 rounded-md hover:bg-gold-light transition-all duration-300 flex items-center justify-center gap-2'>
                                <FaBolt />
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
                <div className='col-span-12 flex justify-between flex-row items-center lg:hidden w-full gap-3 mt-4'>
                    <button onClick={() => addToCart.mutate(book?.id)}
                        disabled={addToCart.isPending}
                        className='flex-1 border border-gold text-gold bg-transparent hover:bg-gold/10 p-3 rounded-md transition-all duration-300 flex items-center justify-center gap-2'>
                        <FaShoppingCart />
                        Add to Cart
                    </button>
                    <button className='bg-gold flex-1 text-bg-primary p-3 rounded-md hover:bg-gold-light transition-all duration-300 flex items-center justify-center gap-2'>
                        <FaBolt />
                        Buy Now
                    </button>
                </div>
                <div className="lg:col-span-4 col-span-12 flex flex-col gap-2 p-4 bg-bg-secondary rounded-md border border-border/40">
                    {/* Book publishing details */}
                    <p>Available In</p>
                    <div className="flex flex-row items-center justify-evenly">
                        {
                            ['Digital Book', 'Print Book'].map((item, idx) => (
                                <div key={idx} className={`flex flex-row gap-2 items-center justify-center border ${book?.publishType === "ONLINE" && item === "Digital Book" ? "border-gold/50 text-gold/70" : book?.publishType === "OFFLINE" && item === "Print Book" ? "border-gold/50 text-gold/70" : "border-border/40 text-cream/50"} rounded-md px-3 py-2`}>
                                    <div className="text-lg">
                                        {item === "Digital Book" && <FaPhone />}
                                        {item === "Print Book" && <FaBookReader />}
                                    </div>
                                    <span className="text-sm">{item}</span>
                                </div>
                            ))
                        }
                    </div>
                    <hr className="hidden lg:block border-border/40 w-full my-2" />
                    <div className="hidden lg:flex flex-col items-center gap-2 text-sm text-cream-dim/60">
                        <div className="flex items-center justify-between w-full">
                            <p className="flex flex-row items-center gap-2">
                                <HiDocumentText className="text-gold" />
                                Pages</p>
                            <p>{book?.pages}</p>
                        </div>

                        <div className="flex items-center justify-between w-full">
                            <p className="flex flex-row items-center gap-2">
                                <MdLanguage className="text-gold" />
                                Language</p>
                            <p>English</p>
                        </div>

                        <div className="flex items-center justify-between w-full">
                            <p className="flex flex-row items-center gap-2">
                                <BsBuilding className="text-gold" />
                                Publisher</p>
                            <p>Inkverse Publication</p>
                        </div>

                        <div className="flex items-center justify-between w-full">
                            <p className="flex flex-row items-center gap-2">
                                <MdCalendarMonth className="text-gold" />
                                Publication Date</p>
                            <p>{new Date(book?.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <p className="flex flex-row items-center gap-2">
                                <BsFill2SquareFill className="text-gold" />
                                ID</p>
                            <p>{book?.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <p className="flex flex-row items-center gap-2">
                                <BsFill2SquareFill className="text-gold" />
                                Readers</p>
                            <p>{book?.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <p className="flex flex-row items-center gap-2">
                                <BsFill2SquareFill className="text-gold" />
                                Access</p>
                            <p>{book?.publishType === "ONLINE" ? "Digital" : "Print Onlly"}</p>
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <p className="flex flex-row items-center gap-2">
                                <MdCalendarMonth className="text-gold" />
                                Creation Date</p>
                            <p>{new Date(book?.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-1 flex flex-col bg-bg-secondary border border-border/40 p-4 rounded-md">
                    <p className="text-base font-semibold text-cream font-playfair mb-4">About the Book</p>
                    <p className="text-sm text-cream-dim/80">{book?.description}</p>
                </div>
                <div className="lg:col-span-1 bg-bg-secondary border border-border/40 p-4 rounded-md">
                    <div className=" flex flex-row items-center justify-between">
                        <p className="text-base font-semibold text-cream font-playfair mb-4">Customer Reviews</p>
                        <button className="bg-gold text-bg-primary px-4 py-2 rounded-md hover:bg-gold-light transition-all duration-300 text-xs">
                            Add Review
                        </button>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="lg:col-span-1 flex flex-col gap-2">
                            <span className='text-3xl text-gold font-bold'>{calculateAverageRating(book?.reviews)}</span>
                            <p className="text-xs text-gold flex flex-row">
                                {Array.from({ length: Math.round(calculateAverageRating(book?.reviews)) }, (_, i) => (
                                    <FaStar key={i} />
                                ))}
                            </p>
                            <p className="text-sm text-cream-dim/80">{book?.reviews?.length || 0} reviews</p>
                        </div>
                        <div className="lg:col-span-2">
                            {/* 5 star rating */}
                            <div className="flex flex-row items-center gap-2">
                                <span className="text-xs text-gold">5</span>
                                <FaStar className="text-gold" />
                                <div className="w-full bg-border/40 rounded-full h-2">
                                    <div className="bg-gold h-2 rounded-full" style={{ width: `${(book?.reviews?.filter(review => review.rating === 5)?.length / book?.reviews?.length) * 100}%` }}></div>
                                </div>
                            </div>

                            {/* 4 star rating */}
                            <div className="flex flex-row items-center gap-2">
                                <span className="text-xs text-gold">4</span>
                                <FaStar className="text-gold" />
                                <div className="w-full bg-border/40 rounded-full h-2">
                                    <div className="bg-gold h-2 rounded-full" style={{ width: `${(book?.reviews?.filter(review => review.rating === 4)?.length / book?.reviews?.length) * 100}%` }}></div>
                                </div>
                            </div>

                            {/* 3 star rating */}
                            <div className="flex flex-row items-center gap-2">
                                <span className="text-xs text-gold">3</span>
                                <FaStar className="text-gold" />
                                <div className="w-full bg-border/40 rounded-full h-2">
                                    <div className="bg-gold h-2 rounded-full" style={{ width: `${(book?.reviews?.filter(review => review.rating === 3)?.length / book?.reviews?.length) * 100}%` }}></div>
                                </div>
                            </div>

                            {/* 2 star rating */}
                            <div className="flex flex-row items-center gap-2">
                                <span className="text-xs text-gold">2</span>
                                <FaStar className="text-gold" />
                                <div className="w-full bg-border/40 rounded-full h-2">
                                    <div className="bg-gold h-2 rounded-full" style={{ width: `${(book?.reviews?.filter(review => review.rating === 2)?.length / book?.reviews?.length) * 100}%` }}></div>
                                </div>
                            </div>

                            {/* 1 star rating */}
                            <div className="flex flex-row items-center gap-2">
                                <span className="text-xs text-gold">1</span>
                                <FaStar className="text-gold" />
                                <div className="w-full bg-border/40 rounded-full h-2">
                                    <div className="bg-gold h-2 rounded-full" style={{ width: `${(book?.reviews?.filter(review => review.rating === 1)?.length / book?.reviews?.length) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 bg-bg-secondary border border-border/40 p-4 rounded-md">
                <h1 className="text-base text-gold/60 font-playfair">You might also like</h1>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto scrollbar-none">
                    {/* Recommendation section */}
                    {
                        recommendedBooks?.map((book, index) => {
                            return <Link to={`/dashboard/reader/published-books/${book.id}`} className="bg-bg-secondary/30 hover:scale-[1.02] hover:border-gold/30 h-full w-full border border-gold/10 rounded-md p-3" key={index}>
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
                                            <button className='p-1 rounded-md cursor-pointer border border-gold/90 hover:border-gold/50 hover:ring-1 transition-all duration-300'>
                                                <FaShoppingCart className='text-gold text-sm' />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        })
                    }

                </div>
            </div>

        </div>
    )
}
export default BookDetail