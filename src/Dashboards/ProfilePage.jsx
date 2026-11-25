import stripePromise from "../utils/stripe";
import { useEffect, useState } from "react";
import api from "../utils/api";
import SavedPaymentMethods from "../components/Checkout/SavedPaymentMethods";
import { Elements } from "@stripe/react-stripe-js";
import SetupPaymentMethodForm from "../components/Checkout/SetupPaymentMethodForm";
import { stripeOptions } from "../utils/options";
import { Modal } from "../CommonComponents/Modal";

function ProfilePage() {
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [loadingSavedMethod, setLoadingSavedMethod] = useState(true);
  const [savedMethodError, setSavedMethodError] = useState(null);

  const [showAddCard, setShowAddCard] = useState(false);
  const [setupClientSecret, setSetupClientSecret] = useState(null);
  const [creatingSetupIntent, setCreatingSetupIntent] = useState(false);
  useEffect(() => {
    const fetchSavedPaymentMethods = async () => {
      try {
        setSavedMethodError("");
        const response = await api.get("/order/saved_payment_methods");
        console.log("SAVED METHOD: ", response.data.data);

        setSavedPaymentMethods(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch saved payment methods:", error);

        setSavedMethodError(
          error.response?.data?.message ||
            "Unable to load saved payment methods",
        );
      } finally {
        setLoadingSavedMethod(false);
      }
    };
    fetchSavedPaymentMethods();
  }, []);

  async function handleAddPayment() {
    try {
      setShowAddCard(true);
      setCreatingSetupIntent(true);
      setSetupClientSecret(null);
      setSavedMethodError("");

      const response = await api.post("/order/create_setup_intent");
      const clientSecret = response.data.data.clientSecret;
      if (!clientSecret) {
        throw new Error("SetupIntent client secret was not returned.");
      }

      setSetupClientSecret(clientSecret);
    } catch (error) {
      console.error("Failed to create SetupIntent:", error);

      setSavedMethodError(
        error.response?.data?.message ||
          error.message ||
          "Unable to initialize card setup.",
      );
    } finally {
      setCreatingSetupIntent(false);
    }
  }
  function handleCancelAddCard() {
    setShowAddCard(false);
    setSetupClientSecret(null);
  }
  async function handleSetupSuccess() {
    setSetupClientSecret(null);
    setLoadingSavedMethod(true);

    try {
      const response = await api.get("/order/saved_payment_methods");

      setSavedPaymentMethods(response.data.data || []);
    } catch (error) {
      setSavedMethodError("Card saved, but unable to refresh payment methods.");
    } finally {
      setLoadingSavedMethod(false);
    }
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="lg:hidden py-2">
        <h1 className="text-2xl font-bold text-cream-dim">My Profile</h1>
      </div>

      {/* Personal Information */}
      <section className="flex flex-col gap-3 bg-bg-secondary/40 border border-border/40 rounded-lg p-4">
        <div className=" pb-3">
          <h2 className="text-xl font-medium text-cream font-playfair">
            Personal Information
          </h2>
          <p className="text-xs text-brown-light mt-1">
            View and edit your personal details.
          </p>
        </div>

        {/* Personal information will go here */}
      </section>

      {/* Payment Methods */}
      <section className="flex flex-col gap-3 bg-bg-secondary/40 border border-border/40 rounded-lg p-4">
        <div className="pb-3">
          <h2 className="text-xl font-medium text-cream font-playfair">
            Payment Methods
          </h2>
          <p className="text-xs text-brown-light mt-1">
            Manage your saved cards and add new payment methods.
          </p>
        </div>

        {savedMethodError && (
          <p className="text-sm text-red-400">{savedMethodError}</p>
        )}
        {/* Payment methods will go here */}
        <SavedPaymentMethods
          savedPaymentMethods={savedPaymentMethods}
          loading={loadingSavedMethod}
          mode="profile"
          onAdd={handleAddPayment}
        />
        <Modal open={showAddCard} close={handleCancelAddCard}>
          <div className="w-full max-w-lg rounded-2xl border border-border/40 bg-bg-secondary p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-cream font-playfair">
                  Add Payment Method
                </h2>
                <p className="mt-1 text-sm text-brown-light">
                  Add a card securely for future payments.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancelAddCard}
                className="text-brown-light hover:text-cream text-xl"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {creatingSetupIntent && (
              <p className="py-8 text-center text-sm text-brown-light">
                Preparing secure card setup...
              </p>
            )}

            {setupClientSecret && (
              <Elements
                stripe={stripePromise}
                options={stripeOptions(setupClientSecret)}
              >
                <SetupPaymentMethodForm
                  onSuccess={handleSetupSuccess}
                  onCancel={handleCancelAddCard}
                />
              </Elements>
            )}
          </div>
        </Modal>
      </section>
    </div>
  );
}

export default ProfilePage;
