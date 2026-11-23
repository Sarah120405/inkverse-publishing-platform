import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../utils/api";
import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "../../utils/stripe";
import { stripeOptions } from "../../utils/options";
import { StripePaymentForm } from "../../components/Checkout/StripePaymentForm";
import OrderSummary from "../../components/Checkout/OrderSummary";
import Stepper from "../../CommonComponents/Stepper";

function CheckoutPage() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const selectedFromNavigation = location.state?.selectedItems;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const returnedClientSecret = searchParams.get("payment_intent_client_secret");
  const selectItems = selectedFromNavigation?.length
    ? selectedFromNavigation
    : JSON.parse(sessionStorage.getItem("inkverse_checkout_items") || "[]");

  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState(false);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);
  const [loadingSavedMethod, setLoadingSavedMethod] = useState(false);
  const cartKey = [...selectItems].sort().join(",");
  const [intentFor, setIntentFor] = useState(
    returnedClientSecret ? cartKey : "",
  );

  const [activeStep, setactiveStep] = useState(
    returnedClientSecret ? "review" : "payment",
  );
  const steps = [
    { id: "payment", number: 1, label: "Details" },
    { id: "review", number: 2, label: "Payment" },
  ];

  const [clientSecret, setClientSecret] = useState(returnedClientSecret || "");
  useEffect(() => {
    if (!selectItems.length) {
      navigate("/cart", { replace: true });
    }
  }, [navigate, selectItems.length]);

  useEffect(() => {
    if (selectedFromNavigation?.length) {
      sessionStorage.setItem(
        "inkverse_checkout_items",
        JSON.stringify(selectedFromNavigation),
      );
    }
  }, [selectedFromNavigation]);

  useEffect(() => {
    const fetchSavedPaymentMethods = async () => {
      try {
        const response = await api.get("/order/saved_payment_methods");
        console.log("SAVED METHOD: ", response.data.data);

        setSavedPaymentMethods(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch saved payment methods:", error);
      } finally {
        setLoadingSavedMethod(false);
      }
    };
    fetchSavedPaymentMethods();
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await api.get("/cart/my-cart");
      return response.data.data.data;
    },
    enabled: selectItems.length > 0,
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
        savePaymentMethod: selectedPaymentMethodId ? false : savePaymentMethod,
        paymentMethodId: selectedPaymentMethodId || undefined,
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
      setIntentFor(cartKey);
      setactiveStep("review");
    },
    onError: (error) => {
      alert(
        error.response?.data?.message || "Failed to create payment intent.",
      );
      console.error("Error creating payment intent:", error);
    },
  });

  if (!selectItems.length) {
    return null;
  }

  function handleContinue(e) {
    e.preventDefault();

    if (itemsToBuy.length === 0) {
      alert("No books selected.");
      navigate("/cart", { replace: true });
      return;
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
          Checkout
        </h1>
        <p className="text-sm sm:text-base text-cream-dim">
          Complete your purchase by providing your details and selecting a
          payment method
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 w-full">
        {/* LEFT: payment / review */}
        <div className="lg:col-span-7 lg:self-start min-w-0 bg-bg-secondary border border-border/40 p-3 sm:p-4 lg:p-6 rounded-lg">
          {/* Stepper */}
          <Stepper activeStep={activeStep} steps={steps} />

          <hr className="w-full border-border/40 mb-2 " />

          <div className="flex flex-col items-start gap-1 mb-2 sm:mb-6">
            <div className="mb-4 w-full flex flex-row justify-between items-center">
              <div>
                <h2 className="text-lg text-cream font-playfair">
                  {activeStep === "payment" ? "Your order" : "Payment"}
                </h2>
                <p className="text-sm text-cream-dim">
                  {activeStep === "payment"
                    ? "Check what you're buying before you pay."
                    : "Pay securely with stripe."}
                </p>
              </div>
              {!paid && (
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setactiveStep("payment")}
                    disabled={paying}
                    className="self-start text-sm text-cream-dim hover:text-cream flex-1 py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Back to details
                  </button>
                </div>
              )}
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
                <label className="flex items-start gap-3 p-3 rounded-lg border border-border/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={savePaymentMethod}
                    onChange={(e) => setSavePaymentMethod(e.target.checked)}
                    className="mt-1 accent-gold"
                  />

                  <span className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-cream">
                      Save my card for future purchases
                    </span>

                    <span className="text-xs text-cream-dim">
                      Securely save your eligible payment method with Stripe.
                      You can manage saved payment methods later.
                    </span>
                  </span>
                </label>
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
                    options={stripeOptions(clientSecret)}
                    key={clientSecret}
                  >
                    <StripePaymentForm
                      total={total}
                      clientSecret={clientSecret}
                      isRedirectReturn={Boolean(returnedClientSecret)}
                      onProcessing={setPaying}
                      onSuccess={() => {
                        setPaid(true);
                        sessionStorage.removeItem("inkverse_checkout_items");
                        queryClient.invalidateQueries({ queryKey: ["cart"] });
                      }}
                      savedPaymentMethods={savedPaymentMethods}
                      selectedPaymentMethodId={selectedPaymentMethodId}
                      onSelectSavedPaymentMethod={setSelectedPaymentMethodId}
                      loadingSavedMethods={loadingSavedMethod}
                    />
                  </Elements>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: order summary */}
        <div className="lg:col-span-5 min-w-0 flex flex-col gap-2 items-start bg-bg-secondary border border-border/40 rounded-lg p-4 sm:p-5 lg:sticky lg:top-6 lg:self-start">
          <OrderSummary itemsToBuy={itemsToBuy} total={total} />
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
