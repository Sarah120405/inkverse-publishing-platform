import { CreditCard } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaMobileAlt, FaUniversity } from "react-icons/fa"

function CheckoutPage() {
    const location = useLocation();
    const selectItems = location.state?.selectedItems || [];

    const [activeStep, setactiveStep] = useState('payment');
    const steps = [
        { id: 'payment', number: 1, label: 'Payment' },
        { id: 'review', number: 2, label: 'Review & Place Order' }
    ];

    const [paymentMethod, setPaymentMethod] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryKey: ['cart'],
        queryFn: async () => {
            const response = await api.get('/cart/my-cart');
            return response.data.data.data;
        }
    })

    const itemsToBuy = data?.filter((item) => selectItems.includes(item.addedBook.id)) || [];

    function calculatePrice(itemsToBuy) {
        const price = itemsToBuy?.reduce((total, item) => total + item.addedBook.price, 0);
        return price.toFixed(2);
    }

    console.log(selectItems);
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl text-cream font-playfair">CheckOut</h1>
                <p className="text-base text-cream-dim">Complete your purchase by providing your details and selecting a payment method</p>
            </div>
            <div className="grid grid-cols-12 gap-6 w-full">
                <div className="lg:col-span-7 bg-bg-secondary border border-border/40 p-4 rounded-lg">
                    <div className="relative flex items-center justify-between w-full mb-8">
                        {/* Background Line */}
                        <div className="absolute top-4 left-12 right-20 h-[2px] bg-border/20 z-0" />

                        {/* Active/Completed indicator bar (optional) */}
                        <div
                            className="absolute top-4 left-12 h-[2px] bg-gold transition-all duration-300 z-0"
                            style={{ width: activeStep === 'review' ? '100%' : '50%' }}
                        />

                        {steps.map((step) => {
                            const isActive = activeStep === step.id;
                            const isCompleted = activeStep === 'review' && step.id === 'payment';

                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full relative z-10 border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300
                                            ${isCompleted ? 'bg-gold border-gold text-bg-primary' :
                                            isActive ? 'border-gold text-gold bg-bg-secondary' :
                                                'border-border/40 text-cream-dim/40 bg-bg-secondary'}`}
                                    >
                                        {isCompleted ? '✓' : step.number}
                                    </div>
                                    <span className={`text-xs font-medium uppercase tracking-wider transition-all duration-300
                                            ${isActive || isCompleted ? 'text-cream' : 'text-cream-dim/40'}`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <hr className="w-full text-border/40 py-4" />
                    <div className="flex flex-col items-start gap-1 mb-6">
                        <div className="flex flex-col items-center gap-2 w-full">
                            <h1 className="text-lg text-cream">Payment Portal</h1>
                            <p className="text-cream-dim text-sm">Select a payment option</p>
                        </div>
                        <div className="flex items-center gap-4 w-full">
                            <button onClick={() => setPaymentMethod(1)} className={`flex-1 flex gap-2 text-sm text-gold items-center justify-center border border-border/40 p-4 rounded-lg text-cream ${paymentMethod === 1 ? "border-gold" : ""}`}>
                                <CreditCard />
                                <p>Credit/Debit Card</p>
                            </button>
                            <button onClick={() => setPaymentMethod(2)} className={`flex-1 flex gap-2 text-sm text-gold items-center justify-center border border-border/40 p-4 rounded-lg text-cream ${paymentMethod === 2 ? "border-gold" : ""
                                }`}>
                                <FaMobileAlt />
                                <p>UPI</p>
                            </button>
                            <button onClick={() => setPaymentMethod(3)} className={`flex-1 flex gap-2 text-sm text-gold items-center justify-center border border-border/40 p-4 rounded-lg text-cream ${paymentMethod === 3 ? "border-gold" : ""
                                }`}>
                                <FaUniversity />
                                <p>Internet Banking</p>
                            </button>
                        </div>
                        {activeStep === "payment" ? (
                            <div className="w-full">
                                {paymentMethod == 1 && (
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        setactiveStep("review")
                                    }} className="flex flex-col gap-4  p-4">

                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="card-number" className="text-cream-dim">Card Number</label>
                                            <input type="text" id="card-number" maxLength={16} minLength={16} className="bg-bg-primary/40 border border-border/30 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none p-2.5 rounded-lg text-cream w-full placeholder-cream-dim/20 text-sm" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="name" className="text-cream-dim">Cardholder Name</label>
                                            <input type="text" id="name" className="bg-bg-primary/40 border border-border/30 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none p-2.5 rounded-lg text-cream w-full placeholder-cream-dim/20 text-sm" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="cvv" className="text-cream-dim">CVV</label>
                                                <input type="text" id="cvv" minLength={3} maxLength={3} className="bg-bg-primary/40 border border-border/30 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none p-2.5 rounded-lg text-cream w-full placeholder-cream-dim/20 text-sm" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="expiry" className="text-cream-dim">Expiry Date</label>
                                                <input type="date" id="expiry" className="bg-bg-primary/40 border border-border/30 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none p-2.5 rounded-lg text-cream w-full placeholder-cream-dim/20 text-sm" />
                                            </div>
                                        </div>

                                        <button type="submit" className="bg-gold text-bg-primary px-4 py-2 rounded-lg w-fit">Continue to Review</button>

                                    </form>
                                )}
                                {paymentMethod == 2 && (
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        setactiveStep("review");
                                    }} className="flex flex-col gap-4 ">
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="upi-id" className="text-cream-dim">UPI ID</label>
                                            <input type="text" id="upi-id" className="bg-bg-primary/40 border border-border/30 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none p-2.5 rounded-lg text-cream w-full placeholder-cream-dim/20 text-sm" />
                                        </div>
                                        <button type="submit" className="bg-gold text-bg-primary px-4 py-2 rounded-lg w-fit">Continue to Review</button>
                                    </form>
                                )}
                                {paymentMethod == 3 && (
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        setactiveStep("review")
                                    }} className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="bank-name" className="text-cream-dim">Bank Name</label>
                                            <input type="text" id="bank-name" className="bg-bg-primary/40 border border-border/30 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none p-2.5 rounded-lg text-cream w-full placeholder-cream-dim/20 text-sm" />
                                        </div>
                                        <button type="submit" className="bg-gold hover:bg-gold-light text-bg-primary font-semibold py-2.5 px-6 rounded-lg transition-all duration-300 w-full mt-4">Continue to Review</button>
                                    </form>
                                )}
                            </div>) :
                            (
                                <div>

                                </div>
                            )
                        }
                    </div>
                </div>
                <div className="lg:col-span-5 flex flex-col gap-2 items-start bg-bg-secondary border border-border/40 rounded-lg p-2">
                    {/* Order Summary */}
                    <h3>Order Summary</h3>
                    <div className="w-full">
                        {itemsToBuy?.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-4">
                                <div className="grid grid-cols-3 gap-1">
                                    <img src={item.addedBook.thumbnailImg} alt={item.addedBook.title} className="w-12 h-16 object-cover col-span-1" />
                                    <div className="flex flex-col col-span-2">
                                        <span className="text-lg text-gold">{item.addedBook.title}</span>
                                        <span className="text-sm text-cream-dim">by {item.addedBook.author.name}</span>
                                        <span className="text-sm text-cream-dim">{item.addedBook.category}</span>
                                        <span className="text-sm text-cream-dim">{item.addedBook.publishType === "ONLINE" ? "E-book" : "Paperback"}</span>
                                    </div>
                                </div>
                                <span className="text-sm text-gold">{item.addedBook.price.toFixed(2)}</span>

                            </div>
                        ))}
                    </div>
                    <hr />
                    <div className="flex flex-col w-full items-center justify-between gap-2">
                        <div className="w-full flex items-center justify-between gap-2">
                            <span>Subtotal</span>
                            <span>{calculatePrice(itemsToBuy)}</span>
                        </div>
                        <div className="w-full flex items-center justify-between gap-2">
                            <span>Discount</span>
                            <span>0.0</span>
                        </div>

                        <div className="w-full flex items-center justify-between gap-2">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <hr />
                        <div className="w-full flex items-center justify-between gap-2">
                            <span>Total</span>
                            <span>{calculatePrice(itemsToBuy)}</span>
                        </div>
                    </div>


                </div>
            </div>

        </div>
    )
}

export default CheckoutPage;