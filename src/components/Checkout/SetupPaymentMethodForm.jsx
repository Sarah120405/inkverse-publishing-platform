import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";

function SetupPaymentMethodForm({ onSuccess, onCancel }) {
  const stripe = useStripe();
  const element = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !element || isProcessing) return;

    setIsProcessing(true);
    setMessage("");

    try {
      const { error, setupIntent } = await stripe.confirmSetup({
        element,
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      {message && <p className="text-sm text-red-400">{message}</p>}
      <button type="submit" disabled={!stripe || !element || isProcessing}>
        {isProcessing ? "Saving..." : "Save Card"}
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}

export default SetupPaymentMethodForm;
