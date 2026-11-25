import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";

function SetupPaymentMethodForm({ onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || isProcessing) return;

    setIsProcessing(true);
    setMessage("");

    try {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });
      if (error) {
        setMessage(error.message || "Unable to save card.");
        return;
      }

      if (setupIntent?.status === "succeeded") {
        onSuccess?.();
      } else {
        setMessage("Card setup is not yet complete.");
      }
    } catch (error) {
      setMessage(
        error.message || "Something went wrong while saving your card.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <PaymentElement />

      {message && <p className="text-sm text-red-400">{message}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="rounded-lg border border-border/50 px-4 py-2 text-sm text-cream hover:bg-bg-primary"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {isProcessing ? "Saving..." : "Save Card"}
        </button>
      </div>
    </form>
  );
}

export default SetupPaymentMethodForm;
