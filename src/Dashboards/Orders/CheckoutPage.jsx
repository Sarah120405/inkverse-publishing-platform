import { CreditCard } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaLock, FaMobileAlt, FaUniversity } from "react-icons/fa"
import api from "../../utils/api";

function CheckoutPage() {
    const queryClient = useQueryClient();
    const location = useLocation();
    const selectItems = location.state?.selectedItems || [];
    const navigate = useNavigate();

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

    const placeOrderMutation = useMutation({
        mutationFn: async () => {
            const response = itemsToBuy?.map((item) => api.post(`/order/order/${item.addedBook.id}`, { quantity: 1, paymentMethod: paymentMethod === 1 ? "card" : paymentMethod === 2 ? "upi" : "net_banking" }))
            return await Promise.all(response);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            alert("Order Placed Successfully");
            navigate('/dashboard/reader');
        },
        onError: (error) => {
            alert(error.response?.data?.message || "Order creation failed."); ``
            console.error('Error placing order:', error);
        },
    });

    const itemsToBuy = data?.filter((item) => selectItems.includes(item.addedBook.id)) || [];

    function calculatePrice(itemsToBuy) {
        const price = itemsToBuy?.reduce((total, item) => total + item.addedBook.price, 0);
        return price.toFixed(2);
    }

    function handleContinue(e) {
        e.preventDefault();
        if (paymentMethod === 1) {
            setactiveStep('review');
        } else if (paymentMethod === 2) {
            setactiveStep('review');
        } else if (paymentMethod === 3) {
            setactiveStep('review');
        } else if (paymentMethod === 4) {
            setactiveStep('review');
        } else if (paymentMethod === 5) {
            setactiveStep('review');
        }
        else {
            alert("Select Payment method")
        }
        placeOrderMutation.mutate();
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
                            style={{ width: activeStep === 'review' ? 'calc(100% - 8rem)' : '50%' }}
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
                        {activeStep === 'payment' ? (<form onSubmit={handleContinue} className="flex flex-col gap-4 w-full">

                            {/* CARD ACCORDION */}
                            <div className={`rounded-xl p-4 transition-all duration-300 ${paymentMethod === 1 ? 'border border-gold bg-gold/5' : 'border border-border/30'}`}>
                                <button type="button" onClick={() => setPaymentMethod(1)} className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full border border-border/60 flex items-center justify-center">
                                            {paymentMethod === 1 && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                                        </div>
                                        <span className="font-semibold text-cream">Credit / Debit Card</span>
                                    </div>
                                    {/* Payment Logos (Visa, Mastercard, etc.) */}
                                    <CreditCard />
                                </button>

                                {paymentMethod === 1 && (
                                    <div className="mt-4 flex flex-col gap-4 border-t border-border/20 pt-4">
                                        {/* Inputs for Card Number, Expiry, CVV, Cardholder Name */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs text-cream-dim/75 font-medium">Card Number</label>
                                            <input type="text" className="bg-bg-primary/40 border border-border/30 rounded-lg p-2.5 text-cream w-full" />
                                        </div>
                                        {/* Row for Expiry & CVV */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs text-cream-dim/75 font-medium">Expiry Date</label>
                                                <input type="text" placeholder="MM/YY" className="bg-bg-primary/40 border border-border/30 rounded-lg p-2.5 text-cream w-full" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs text-cream-dim/75 font-medium">CVV</label>
                                                <input type="text" placeholder="123" className="bg-bg-primary/40 border border-border/30 rounded-lg p-2.5 text-cream w-full" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* UPI ACCORDION */}
                            <div className={`rounded-xl p-4 transition-all duration-300 ${paymentMethod === 2 ? 'border border-gold bg-gold/5' : 'border border-border/30'}`}>
                                <button type="button" onClick={() => setPaymentMethod(2)} className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full border border-border/60 flex items-center justify-center">
                                            {paymentMethod === 2 && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="font-semibold text-cream">UPI</span>
                                            <span className="text-xs text-cream-dim/60">Pay using any UPI app</span>
                                        </div>
                                    </div>
                                    {/* UPI Logo */}
                                    <FaMobileAlt />
                                </button>

                                {paymentMethod === 2 && (
                                    <div className="mt-4 flex flex-col gap-4 border-t border-border/20 pt-4">
                                        {/* UPI inputs */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs text-cream-dim/75 font-medium">UPI ID</label>
                                            <input type="text" className="bg-bg-primary/40 border border-border/30 rounded-lg p-2.5 text-cream w-full" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Repeat Accordions for Net Banking and Wallets ... */}

                            {/* Footer Elements */}
                            <div className="flex items-center gap-3 p-3 bg-bg-primary/30 rounded-lg mt-4">
                                {/* Secure payments lock icon and text details */}
                                <FaLock className="text-gold" />
                                <div className="flex flex-col items-start gap-1">
                                    <span className="text-cream-dim text-sm">Secure payment processing</span>
                                    <span className="text-cream-dim text-xs">Your payment information is encrypted and is secure</span>
                                </div>

                            </div>

                            <button type="submit" className="w-full bg-gold hover:bg-gold-light text-bg-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mt-2">
                                Continue to Review ➔
                            </button>
                        </form>) : (
                            <div className="flex flex-col gap-6 w-full text-cream">
                                <div className="flex flex-col items-start gap-1">
                                    <h2 className="text-lg font-semibold">Review your details</h2>
                                    <p className="text-xs text-cream-dim/50">Please confirm your payment method before completing the purchase.</p>
                                </div>
                                {/* Selected Details Box */}
                                <div className="bg-bg-primary/20 border border-border/10 p-5 rounded-xl flex flex-col gap-3 text-sm">
                                    <div className="flex justify-between items-center pb-2 border-b border-border/10">
                                        <span className="text-cream-dim/60">Selected Method</span>
                                        <span className="font-semibold text-gold">
                                            {paymentMethod === 1 ? "Credit / Debit Card" : paymentMethod === 2 ? "UPI" : "Net Banking"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-cream-dim/60">Items to Purchase</span>
                                        <span className="font-semibold">{itemsToBuy.length} books</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-cream-dim/60">Total Amount</span>
                                        <span className="font-semibold text-gold">₹ {calculatePrice(itemsToBuy)}</span>
                                    </div>
                                </div>
                                {/* Action Buttons Row */}
                                <div className="flex gap-4 w-full mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setactiveStep('payment')}
                                        disabled={placeOrderMutation.isPending}
                                        className="flex-1 border border-gold/40 hover:bg-gold/5 text-gold py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                                    >
                                        Back to Payment
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => placeOrderMutation.mutate()}
                                        disabled={placeOrderMutation.isPending}
                                        className="flex-1 bg-gold hover:bg-gold-light disabled:bg-gold/50 text-bg-primary py-3 rounded-lg font-semibold transition-all duration-300"
                                    >
                                        {placeOrderMutation.isPending ? "Placing Order..." : "Confirm & Pay"}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
                <div className="lg:col-span-5 flex flex-col gap-4 items-start bg-bg-secondary border border-border/40 rounded-lg p-5">
                    {/* Order Summary */}
                    <h3 className="text-base font-semibold text-cream font-playfair tracking-wide mb-2">Order Summary</h3>
                    <div className="flex flex-col gap-4 w-full mb-4">
                        {itemsToBuy?.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <img src={item.addedBook.thumbnailImg} alt={item.addedBook.title} className="w-12 h-16 object-cover rounded border border-border/10 shadow-sm flex-shrink-0" />
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-base font-medium truncate text-cream/90">{item.addedBook.title}</span>
                                        <span className="text-sm text-cream-dim/50 mt-0.5">by {item.addedBook.author.name}</span>
                                        <span className="text-xs text-cream-dim/40 mt-1">
                                            {item.addedBook.category} · {item.addedBook.publishType === "ONLINE" ? "E-book" : "Paperback"}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-gold whitespace-nowrap">₹ {item.addedBook.price.toFixed(2)}</span>

                            </div>
                        ))}
                    </div>
                    <div className="border-t border-border/20 my-2 w-full"></div>
                    <div className="flex flex-col gap-2.5 w-full text-xs text-cream-dim/70">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-cream-dim">Subtotal</span>
                            <span className="text-sm font-semibold text-gold">₹ {calculatePrice(itemsToBuy)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-cream-dim">Discount</span>
                            <span className="text-sm text-emerald-500">- ₹ 0.0</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span>Shipping</span>
                            <span className="text-sm text-emerald-500">Free</span>
                        </div>
                        <div className="border-t border-border/20 my-2 w-full" />
                        <div className="flex justify-between items-baseline pt-2">
                            <span className="text-base font-medium text-cream">Total</span>
                            <span className="text-lg font-semibold text-gold">₹ {calculatePrice(itemsToBuy)}</span>
                        </div>
                        <p className="text-[10px] text-cream-dim/30 text-right mt-0.5 w-full">(Inclusive of all taxes)</p>
                    </div>
                    <div className="w-full flex items-center gap-3 p-3 bg-bg-primary/20 border border-border/10 rounded-xl mt-4">
                        <FaLock />
                        <div className="flex flex-col items-start">
                            <span className="text-sm text-cream-dim/80 font-medium">Secure payment</span>
                            <span className="text-xs text-cream-dim/50">Your payment information is encrypted</span>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default CheckoutPage;