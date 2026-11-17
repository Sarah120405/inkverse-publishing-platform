import { CreditCard } from "lucide-react";
import { Fragment, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaLock, FaMobileAlt } from "react-icons/fa";
import api from "../../utils/api";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import stripePromise from "../../utils/stripe";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    n,
  );

function StripePaymentForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || isProcessing || paymentSucceeded) return;

    setIsProcessing(true);
    setMessage("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (error) {
      if (error.payment_intent?.status === "succeeded") {
        setPaymentSucceeded(true);
      } else {
        setMessage(error.message || "Payment failed.");
      }

      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      setPaymentSucceeded(true);
    } else {
      setMessage(`Your payment is processing. We’ll confirm it shortly.`);
    }

    setIsProcessing(false);
  };

  if (paymentSucceeded) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <span className="text-3xl text-emerald-500">✓</span>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-cream">
            Payment Successful!
          </h3>
          <p className="text-sm text-cream-dim">
            Your payment has been received. Your order is being confirmed.
          </p>
        </div>

        <button
          type="button"
          onClick={() => (window.location.href = "/dashboard/reader")}
          className="w-full bg-gold hover:bg-gold-light text-bg-primary py-3 rounded-lg font-semibold"
        >
          Go to My Orders
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement
        options={{
          layout: {
            type: "accordion",
            defaultCollapsed: false,
            radios: "always",
            spacedAccordionItems: true,
          },
        }}
      />

      {message && <p className="text-sm text-red-400">{message}</p>}

      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-bg-primary py-3 rounded-lg font-semibold"
      >
        {isProcessing ? "Processing..." : `Pay Now`}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-cream-dim/60">
        <FaLock className="shrink-0" /> Payments are processed by Stripe. Card
        details never reach our servers.
      </p>
    </form>
  );
}

function CheckoutPage() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const selectItems = location.state?.selectedItems || [];
  if (!selectItems.length) return <Navigate to="/cart" replace />;
  const navigate = useNavigate();
  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState(false);
  const cartKey = [...selectItems].sort().join(",");
  const [intentFor, setIntentFor] = useState("");

  const [activeStep, setactiveStep] = useState("payment");
  const steps = [
    { id: "payment", number: 1, label: "Details" },
    { id: "review", number: 2, label: "Payment" },
  ];

  const [clientSecret, setClientSecret] = useState("");
  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#c9a84c",
        colorBackground: "#1a1714",
        colorText: "#f5eee6",
        colorDanger: "#df1b41",
        fontFamily: "Playfair Display, system-ui, sans-serif",
        borderRadius: "8px",
      },
      rules: {
        ".Input": {
          border: "1px solid rgba(245,238,230,0.15)",
          boxShadow: "none",
        },
        ".Input:focus": {
          border: "1px solid #c9a84c",
          boxShadow: "none",
        },
        ".AccordionItem": {
          border: "1px solid rgba(245,238,230,0.15)",
          boxShadow: "none",
        },
      },
    },
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await api.get("/cart/my-cart");
      return response.data.data.data;
    },
  });

  const itemsToBuy =
    data?.filter((item) => selectItems.includes(item.addedBook.id)) || [];

  const total =
    itemsToBuy.reduce(
      (s, i) => s + Math.round(Number(i.addedBook.price) * 100),
      0,
    ) / 100;
  const createPaymentIntentMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/order/order", {
        books: itemsToBuy.map((item) => ({
          bookId: item.addedBook.id,
          quantity: 1,
        })),
      });
      console.log("Payment Intent response:", response.data.data);
      return response.data.data;
    },

    onSuccess: (data) => {
      console.log(
        "Payment Intent created successfully:",
        data.data.clientSecret,
      );
      setClientSecret(data.data.clientSecret);
      setactiveStep("review");
    },
    onError: (error) => {
      alert(
        error.response?.data?.message || "Failed to create payment intent.",
      );
      console.error("Error creating payment intent:", error);
    },
  });

  function calculatePrice(items) {
    return items.reduce(
      (total, item) => total + Number(item.addedBook.price),
      0,
    );
  }

  function handleContinue(e) {
    e.preventDefault();

    if (itemsToBuy.length === 0) {
      alert("No books selected.");
      return <Navigate to="/cart" replace />;
    }

    if (clientSecret && intentFor === cartKey) {
      setactiveStep("review");
      return;
    }
    createPaymentIntentMutation.mutate();
  }

  if (isLoading) {
    return <p className="text-cream-dim text-sm">Loading checkout...</p>;
  }

  if (error) {
    return (
      <p className="text-red-400 text-sm">
        Could not load your cart. Please try again.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full min-w-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-lg sm:text-xl text-cream font-playfair">
          CheckOut
        </h1>
        <p className="text-sm sm:text-base text-cream-dim">
          Complete your purchase by providing your details and selecting a
          payment method
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 w-full">
        {/* LEFT: payment / review */}
        <div className="lg:col-span-7 min-w-0 bg-bg-secondary border border-border/40 p-3 sm:p-4 lg:p-6 rounded-lg">
          {/* Stepper */}
          <div className="flex items-start justify-center w-full mb-6 sm:mb-8">
            {steps.map((step, index) => {
              const isActive = activeStep === step.id;
              const isCompleted =
                activeStep === "review" && step.id === "payment";

              return (
                <Fragment key={step.id}>
                  <div
                    aria-current={isActive ? "step" : undefined}
                    className="flex flex-col items-center gap-2 w-24 sm:w-32 shrink-0"
                  >
                    <div
                      className={`w-8 h-8 rounded-full relative z-10 border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300
                        ${
                          isCompleted
                            ? "bg-gold border-gold text-bg-primary"
                            : isActive
                              ? "border-gold text-gold bg-bg-secondary"
                              : "border-border/40 text-cream-dim/40 bg-bg-secondary"
                        }`}
                    >
                      {isCompleted ? "✓" : step.number}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider text-center leading-tight transition-all duration-300
                        ${isActive || isCompleted ? "text-cream" : "text-cream-dim/40"}`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="relative flex-1 h-[2px] mt-4 -mx-8 sm:-mx-12 bg-border/20">
                      <div
                        className={`absolute inset-y-0 left-0 bg-gold transition-all duration-300 ${
                          activeStep === "review" ? "w-full" : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>

          <hr className="w-full border-border/40 mb-4 sm:mb-6" />

          <div className="flex flex-col items-start gap-1 mb-2 sm:mb-6">
            <div className="mb-4 w-full">
              <h2 className="text-lg text-cream font-playfair">
                {activeStep === "payment" ? "Your order" : "Payment"}
              </h2>
              <p className="text-sm text-cream-dim">
                {activeStep === "payment"
                  ? "Check what you're buying before you pay."
                  : "Choose a payment method and pay securely."}
              </p>
            </div>

            {activeStep === "payment" ? (
              <form
                onSubmit={handleContinue}
                className="flex flex-col gap-3 sm:gap-4 w-full"
              >
                <div className="rounded-lg border border-border/30 p-4 text-sm text-cream-dim">
                  {itemsToBuy.length}{" "}
                  {itemsToBuy.length === 1 ? "book" : "books"}
                  {itemsToBuy.every(
                    (i) => i.addedBook.publishType === "ONLINE",
                  ) &&
                    " · You'll get instant access in your library once payment is complete."}
                </div>
                <button
                  type="submit"
                  disabled={createPaymentIntentMutation.isPending}
                  className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-bg-primary py-3 rounded-lg font-semibold"
                >
                  {createPaymentIntentMutation.isPending
                    ? "Preparing payment…"
                    : "Continue to payment"}
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-4 sm:gap-6 w-full text-cream">
                {clientSecret && (
                  <Elements
                    stripe={stripePromise}
                    options={stripeOptions}
                    key={clientSecret}
                  >
                    <StripePaymentForm
                      onProcessing={setPaying}
                      onSuccess={() => {
                        setPaid(true);
                        queryClient.invalidateQueries({ queryKey: ["cart"] });
                      }}
                    />
                  </Elements>
                )}

                {/* Stack on mobile, primary action on top */}
                {!paid && (
                  <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full mt-2 sm:mt-4">
                    <button
                      type="button"
                      onClick={() => setactiveStep("payment")}
                      disabled={paying}
                      className="flex-1 border border-gold/40 hover:bg-gold/5 text-gold py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                    >
                      Back to Details
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: order summary */}
        <div className="lg:col-span-5 min-w-0 flex flex-col gap-4 items-start bg-bg-secondary border border-border/40 rounded-lg p-4 sm:p-5 lg:sticky lg:top-6 lg:self-start">
          <h3 className="text-base font-semibold text-cream font-playfair tracking-wide mb-2">
            Order Summary
          </h3>

          <div className="flex flex-col gap-4 w-full mb-4">
            {itemsToBuy.length === 0 && (
              <p className="text-sm text-cream-dim/60">
                No items selected for checkout.
              </p>
            )}
            {itemsToBuy.map((item) => (
              <div
                key={item.id}
                className="flex items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={item.addedBook.thumbnailImg}
                    alt={item.addedBook.title}
                    className="w-12 h-16 object-cover rounded border border-border/10 shadow-sm shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm sm:text-base font-medium truncate text-cream/90">
                      {item.addedBook.title}
                    </span>
                    <span className="text-xs sm:text-sm text-cream-dim/50 mt-0.5 truncate">
                      by {item.addedBook.author.name}
                    </span>
                    <span className="text-xs text-cream-dim/40 mt-1">
                      {item.addedBook.category} ·{" "}
                      {item.addedBook.publishType === "ONLINE"
                        ? "E-book"
                        : "Paperback"}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gold whitespace-nowrap shrink-0">
                  ₹ {item.addedBook.price}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border/20 my-2 w-full" />

          <div className="flex flex-col gap-2.5 w-full text-xs text-cream-dim/70">
            <div className="flex justify-between items-center">
              <span className="text-sm text-cream-dim">Subtotal</span>
              <span className="text-sm font-semibold text-gold">
                ₹ {calculatePrice(itemsToBuy)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Shipping</span>
              <span className="text-sm text-emerald-500">Free</span>
            </div>
            <div className="border-t border-border/20 my-2 w-full" />
            <div className="border-t border-border/20 pt-3 w-full flex justify-between items-baseline">
              <span className="text-cream font-medium">Total</span>
              <span className="text-lg font-semibold text-gold">
                {formatINR(total)}
              </span>
            </div>
            <p className="text-[10px] text-cream-dim/30 text-right mt-0.5 w-full">
              (Inclusive of all taxes)
            </p>
          </div>

          <div className="w-full flex items-center gap-3 p-3 bg-bg-primary/20 border border-border/10 rounded-xl mt-4">
            <FaLock className="shrink-0" />
            <div className="flex flex-col items-start">
              <span className="text-sm text-cream-dim/80 font-medium">
                Secure payment
              </span>
              <span className="text-xs text-cream-dim/50">
                Your payment information is encrypted
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
