const SavedPaymentMethods = ({
  savedPaymentMethods = [],
  selectedPaymentMethodId,
  onSelect,
  loading = false,
  mode = "checkout",
  onAdd,
}) => {
  if (loading) {
    return <p>Loading saved payment methods...</p>;
  }
  if (mode === "profile") {
    return (
      <div className="space-y-4">
        {savedPaymentMethods.length === 0 ? (
          <p className="text-sm text-brown-light">
            You haven't saved any payment methods yet.
          </p>
        ) : (
          <div className="space-y-3">
            {savedPaymentMethods.map((method) => (
              <div
                key={method.id}
                className="rounded-xl border border-border/40 p-4"
              >
                <p className="font-semibold text-cream">
                  {method.brand.toUpperCase()} Ending In {method.last4}
                </p>

                <p className="text-sm text-brown-light">
                  Expires {String(method.expiryMonth).padStart(2, "0")}/
                  {method.expiryYear}
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onAdd}
          disabled={!onAdd || loading}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-black"
        >
          + Add Payment Method
        </button>
      </div>
    );
  }

  if (savedPaymentMethods.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Your saved payment methods</h3>

      <div className="space-y-3">
        {savedPaymentMethods.map((method) => {
          const isSelected = selectedPaymentMethodId === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              aria-pressed={isSelected}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                isSelected
                  ? "border-[#c9a747] bg-[#252119]"
                  : "border-[#302a21] hover:border-[#8c7438]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    isSelected ? "border-[#c9a747]" : "border-gray-500"
                  }`}
                >
                  {isSelected && (
                    <span className="h-2.5 w-2.5 rounded-full bg-[#c9a747]" />
                  )}
                </span>

                <div>
                  <p className="font-semibold">
                    {method.brand.toUpperCase()} Ending In {method.last4}
                  </p>

                  <p className="text-sm text-gray-400">
                    Expires {String(method.expiryMonth).padStart(2, "0")}/
                    {method.expiryYear}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={!selectedPaymentMethodId}
        className={`w-full rounded-xl border p-4 text-left transition-colors ${
          !selectedPaymentMethodId
            ? "border-[#c9a747] bg-[#252119]"
            : "border-[#302a21] hover:border-[#8c7438]"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
              !selectedPaymentMethodId ? "border-[#c9a747]" : "border-gray-500"
            }`}
          >
            {!selectedPaymentMethodId && (
              <span className="h-2.5 w-2.5 rounded-full bg-[#c9a747]" />
            )}
          </span>

          <div>
            <p className="font-semibold">Use a new card</p>
            <p className="text-sm text-gray-400">
              Enter different card details
            </p>
          </div>
        </div>
      </button>
    </div>
  );
};

export default SavedPaymentMethods;
