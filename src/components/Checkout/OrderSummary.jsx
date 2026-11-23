import { FaLock } from "react-icons/fa";
import { formatINR } from "../../utils/format";
function OrderSummary({ itemsToBuy, total }) {
  return (
    <>
      <h3 className="text-base font-semibold text-cream font-playfair tracking-wide mb-2">
        Order Summary
      </h3>

      <div className="flex flex-col gap-4 w-full">
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
              {formatINR(item.addedBook.price)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border/20 my-2 w-full" />

      <div className="flex flex-col gap-2.5 w-full text-xs text-cream-dim/70">
        <div className="flex justify-between items-center">
          <span className="text-sm text-cream-dim">Subtotal</span>
          <span className="text-sm font-semibold text-gold">
            {formatINR(total)}
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
    </>
  );
}

export default OrderSummary;
