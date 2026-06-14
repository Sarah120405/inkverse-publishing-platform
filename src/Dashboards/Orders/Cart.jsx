import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../utils/api";
import { FaTimes, FaTrash, FaGift, FaLock, FaTruck, FaUndo, FaShoppingCart } from "react-icons/fa";
import { Table } from "../../CommonComponents/Table";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";


function Cart() {


    const [selectedItems, setSelectedItems] = useState([]);
    const navigate = useNavigate();

    const { data, isLoading, error } = useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            const response = await api.get('/cart/my-cart');
            return response.data.data.data;
        }
    })

    useEffect(() => {
        if (data?.length > 0) {
            setSelectedItems(data.map((item) => item.addedBook.id));
        }
    }, [data])

    const queryClient = useQueryClient();

    const removeFromCart = useMutation({
        mutationKey: ["cart"],
        mutationFn: async (id) => {
            const response = await api.delete(`/cart/remove-from-cart/${id}`);
            return response.data.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries("cart");
        }
    })

    function handleRemoveSelected(id) {
        selectedItems.forEach((id) => {
            removeFromCart.mutate(id);
        });
        setSelectedItems([]);
    }
    const bookTableColumns = [
        {
            key: 'select',
            label: (
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        className="w-4 h-4 cursor-pointer rounded-md text-gold"
                        checked={data?.length > 0 && selectedItems.length === data.length}
                        onChange={() => {
                            if (selectedItems.length === data?.length) {
                                setSelectedItems([]);
                            } else {
                                setSelectedItems(data.map((item) => item.addedBook.id));
                            }
                        }}
                    />
                    <span className="whitespace-nowrap">Select All ({selectedItems.length})</span>
                </div>
            ),
            render: (row) => (
                <div className="flex items-center gap-3">
                    <input type="checkbox"
                        className="w-4 h-4 cursor-pointer rounded-md text-gold"
                        checked={
                            selectedItems.includes(row.addedBook.id)
                        }
                        onChange={() => {
                            if (selectedItems.includes(row.addedBook.id)) {
                                setSelectedItems(selectedItems.filter((id) => id !== row.addedBook.id));
                            } else {
                                setSelectedItems([...selectedItems, row.addedBook.id]);
                            }
                        }} />
                </div>
            )
        }, {
            key: 'item',
            label: 'Item',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <img src={row.addedBook.thumbnailImg} alt={row.addedBook.title} className="w-20 h-23 object-cover rounded border border-border/20 shadow-sm flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-cream leading-tight whitespace-normal break-words">{row.addedBook.title}</span>
                        <span className="text-sm text-cream-dim/50 mt-0.5">by {row.addedBook.author.name}</span>
                        <span className="text-sm text-cream-dim/50 mt-0.5">{row.addedBook.category}</span>
                        <span className="text-sm text-cream-dim/50 mt-0.5">{row.addedBook.publishType === "ONLINE" ? "E-book" : "Paperback"}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'price',
            label: 'Price',
            render: (row) => (
                <span className="text-xs lg:text-base text-gold whitespace-nowrap">₹ {row.addedBook.price.toFixed(2)}</span>
            )
        },
        {
            key: 'quantity',
            label: 'Quantity',
            render: (row) => (
                <div className="w-fit flex flex-row items-center gap-2 border border-cream-dim/50 p-2 rounded-md">
                    <button className="text-sm text-cream-dim/50" >
                        -
                    </button>
                    <span className="text-sm text-cream-dim/50">1{ /* {row.addedBook.quantity} */}</span>
                    <button className="text-sm text-cream-dim/50" >
                        +
                    </button>
                </div>
            )
        },
        {
            key: 'total',
            label: 'Total',
            render: (row) => (
                <div className="flex flex-row items-center justify-between gap-4">
                    <span className="text-sm text-gold  whitespace-nowrap">₹ {row.addedBook.price.toFixed(2)}</span>
                    <button onClick={() => removeFromCart.mutate(row.addedBook.id)}>
                        <FaTimes className="text-sm text-cream-dim/50" />
                    </button>
                </div>
            )
        },
    ];

    const calculatePrice = (data, selectedItems) => {
        if (!data || data.length === 0) {
            return 0.00;
        }
        const selectedId = data?.filter((item) => selectedItems.includes(item.addedBook.id));
        console.log(selectedId);


        const price = selectedId.map((item) => item?.addedBook?.price || 0);
        /* console.log(price);
         */const totalPrice = price.reduce((sum = 0, price) => sum + price, 0);
        return totalPrice.toFixed(2);
    }
    return (
        <div className="flex flex-col items-center justify-center gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                <div className="lg:col-span-8  bg-bg-secondary border border-border/40 p-4 rounded-md">
                    {/* Cart Items Display */}
                    {/* {console.log(data)} */}
                    {data?.length > 0 ? (
                        <>
                            <Table columns={bookTableColumns} data={data} isLoading={isLoading} />

                            <button onClick={handleRemoveSelected}
                                className="flex flex-row items-center justify-center text-cream-dim/50 text-sm mt-2">
                                <FaTrash className="text-sm" />
                                Remove selected
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                            <FaShoppingCart className="text-2xl text-gold/50" />
                            <p className="text-cream-dim/50 text-base">No items in cart</p>
                            <Link to="/dashboard/reader/published-books" className="bg-gold text-bg-primary rounded-md hover:bg-gold-light transition-all duration-300 py-2 px-4">Explore BookStore</Link>
                        </div>
                    )
                    }
                </div>
                <div className="lg:col-span-4 flex flex-col items-start gap-3">
                    <div className="w-full bg-bg-secondary border border-border/40 p-3 rounded-md flex flex-col p-3 gap-4">
                        <h1 className="text-lg text-cream/50 font-playfair">Order Summary</h1>
                        <div className="flex flex-col w-full text-sm">
                            <div className="flex items-center justify-between">
                                <p>Subtotal ({selectedItems?.length} items)</p>
                                <p>₹ {calculatePrice(data, selectedItems)}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p>Discount</p>
                                <p className="text-emerald-500">₹ -0.0 </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p>Shipping</p>
                                <p className="text-emerald-500">Free</p>
                            </div>
                        </div>
                        <hr />
                        <div className="flex items-center justify-between w-full">
                            <p>Total</p>
                            <p className="text-gold text-lg">₹ {calculatePrice(data, selectedItems)}</p>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <button onClick={() => navigate('/dashboard/reader/order', { state: { selectedItems } })}
                                className="bg-gold text-bg-primary rounded-md hover:bg-gold-light transition-all duration-300 py-2 px-4 w-full">Proceed to Checkout</button>
                            <Link to="/dashboard/reader/published-books" className="border border-gold text-gold bg-transparent hover:bg-gold/10 py-2 px-4 rounded-md transition-all duration-300 w-full">Continue Shopping</Link>
                        </div>

                    </div>
                    <div className="text-sm w-full bg-bg-secondary border border-border/40 p-3 rounded-md flex flex-col p-3 gap-4">
                        <div className="flex items-center gap-2">
                            <FaLock />
                            <div className="flex flex-col items-start">
                                <span>Secure checkout</span>
                                <span>Your payment information is safe and encrypted</span>
                            </div>

                        </div>
                        <div className="flex items-center gap-2">
                            <FaTruck />
                            <div className="flex flex-col items-start ">
                                <span>Fast Delivery</span>
                                <span>Get your books delivered quickly to your doorstep</span>
                            </div>

                        </div>
                        <div className="flex items-center gap-2">
                            <FaUndo />
                            <div className="flex flex-col items-start">
                                <span>Easy Returns</span>
                                <span>Not satisfied? Return within 7 days of delivery</span>
                            </div>

                        </div>
                    </div>


                </div>

            </div>
            <div className="w-full rounded-md flex flex-row items-start p-4 bg-bg-secondary border border-border/40 gap-3">
                <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                    <FaGift className="text-lg text-gold" />
                </div>
                <div className="w-full flex flex-col gap-3">
                    <div className="text-base flex flex-row items-center justify-between">
                        <span>Add more books worth <span className="font-semibold text-gold">₹ {(1500 - calculatePrice(data, selectedItems)).toFixed(2)}</span>  to get free shipping</span>
                        <span>₹ {calculatePrice(data, selectedItems)} / 1500</span>
                    </div>
                    <div className="w-full bg-brown/20 rounded-full h-2 ">
                        <div className="bg-gold h-2 rounded-full" style={{ width: `${(calculatePrice(data, selectedItems) / 1500) * 100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { Cart };