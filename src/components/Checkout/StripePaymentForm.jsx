import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  useElements,
  useStripe,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { FaLock } from "react-icons/fa";
import { formatINR } from "../../utils/format";

function StripePaymentForm({
  total,
  clientSecret,
  isRedirectReturn,
  onProcessing,
  onSuccess,
  selectedPaymentMethodId,
}) {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);

  const successHandledRef = useRef(false);
  const retrievedSecretRef = useRef("");
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (
      !stripe ||
      !clientSecret ||
      !isRedirectReturn ||
      retrievedSecretRef.current === clientSecret
    ) {
      return;
    }

    retrievedSecretRef.current = clientSecret;

    let isMounted = true;

    const checkPaymentStatus = async () => {
      try {
        const { paymentIntent, error } =
          await stripe.retrievePaymentIntent(clientSecret);

        if (!isMounted) return;

        if (error) {
          setMessage(error.message || "Unable to retrieve payment status.");
          return;
        }

        switch (paymentIntent?.status) {
          case "succeeded":
            setPaymentSucceeded(true);

            if (!successHandledRef.current) {
              successHandledRef.current = true;
              onSuccessRef.current?.();
            }
            break;

          case "processing":
            setIsAwaitingConfirmation(true);
            setMessage(
              "Your payment is processing. Please wait for confirmation.",
            );
            break;

          case "requires_payment_method":
            setMessage(
              paymentIntent.last_payment_error?.message ||
                "Payment was not completed. Please try another payment method.",
            );
            break;

          case "requires_action":
            setMessage("Additional payment authentication is required.");
            break;

          case "canceled":
            setMessage("Payment was canceled. Please try again.");
            break;

          default:
            setMessage(
              "Unable to confirm your payment status. Please check your orders.",
            );
        }
      } catch (error) {
        if (isMounted) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to retrieve payment status.",
          );
        }
      }
    };

    checkPaymentStatus();

    return () => {
      isMounted = false;
    };
  }, [stripe, clientSecret, isRedirectReturn]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !stripe ||
      (!selectedPaymentMethodId && !elements) ||
      isProcessing ||
      isAwaitingConfirmation ||
      paymentSucceeded
    ) {
      return;
    }

    setIsProcessing(true);
    onProcessing?.(true);
    setMessage("");

    try {
      let result = null;
      if (selectedPaymentMethodId) {
        result = await stripe.confirmCardPayment(clientSecret);
      } else {
        result = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.href,
          },
          redirect: "if_required",
        });
      }
      const { error, paymentIntent } = result;

      const status = error
        ? error.payment_intent?.status
        : paymentIntent?.status;

      if (status === "succeeded") {
        setPaymentSucceeded(true);
        successHandledRef.current = true;
        onSuccess?.();
      } else if (status === "requires_payment_method") {
        setMessage(
          error?.message ||
            "Payment failed. Please try another payment method.",
        );
      } else if (status === "requires_action") {
        setMessage(
          "Your payment requires additional authentication. Please follow the instructions.",
        );
      } else if (status === "processing") {
        setIsAwaitingConfirmation(true);
        setMessage("Your payment is processing. Please wait for confirmation.");
      } else if (status === "canceled") {
        setMessage("Payment was canceled. Please try again.");
      } else if (error) {
        setMessage(error.message || "Something went wrong with your payment.");
      } else {
        setMessage("Payment status is being confirmed. Please wait.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong with your payment.",
      );
    } finally {
      setIsProcessing(false);
      onProcessing?.(false);
    }
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
          onClick={() => navigate("/dashboard/reader")}
          className="w-full bg-gold hover:bg-gold-light text-bg-primary py-3 rounded-lg font-semibold"
        >
          Go to My Orders
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!selectedPaymentMethodId && (
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
      )}

      {message && <p className="text-sm text-red-400">{message}</p>}

      <button
        type="submit"
        disabled={
          !stripe ||
          (!selectedPaymentMethodId && !elements) ||
          isProcessing ||
          isAwaitingConfirmation ||
          paymentSucceeded
        }
        className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-bg-primary py-3 rounded-lg font-semibold"
      >
        {isProcessing ? "Processing..." : `Pay Now (${formatINR(total)})`}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-cream-dim/60">
        <FaLock className="shrink-0" /> Payments are processed by Stripe. Card
        details never reach our servers.
      </p>
    </form>
  );
}

export { StripePaymentForm };
