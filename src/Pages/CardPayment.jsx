import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createSale } from "../Utils/SalesStore";

function maskCardNumber(value) {
  return value.replace(/\D/g, "").slice(0, 16);
}

function formatCardNumber(value) {
  return maskCardNumber(value)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

export default function CardPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const draft = location.state?.saleDraft;

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!draft) {
    return (
      <div className="min-h-screen text-[#23262b]">
        <main className="mx-auto w-full max-w-390 px-4 pb-14 pt-8 sm:px-8 lg:px-14">
          <div className="rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
            <h1 className="text-[30px] font-semibold">Card Payment</h1>
            <p className="mt-3 text-[#8b9098]">No sale data found. Please start again from Add Sale.</p>
            <button
              type="button"
              onClick={() => navigate("/sales/add")}
              className="mt-5 rounded-2xl bg-[#ff7a1a] px-5 py-3 font-semibold text-white"
            >
              Back To Add Sale
            </button>
          </div>
        </main>
      </div>
    );
  }

  const subtotal = draft.items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  const total = Math.max(0, subtotal - Number(draft.discount || 0) + Number(draft.tax || 0));

  const handlePay = () => {
    if (!cardName.trim()) return alert("Enter card holder name");
    if (maskCardNumber(cardNumber).length !== 16) return alert("Enter a valid 16-digit card number");
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return alert("Enter expiry as MM/YY");
    if (!/^\d{3,4}$/.test(cvv)) return alert("Enter valid CVV");

    setIsSubmitting(true);
    const sale = createSale({
      ...draft,
      paymentType: "card",
    });
    setIsSubmitting(false);

    if (sale) {
      navigate(`/sales/${sale.id}`);
    } else {
      alert("Could not complete payment");
    }
  };

  return (
    <div className="min-h-screen text-[#23262b]">
      <main className="mx-auto w-full max-w-390 px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <h1 className="text-[34px] font-semibold">Card Payment</h1>
        <p className="mt-2 text-[17px] text-[#8b9098]">Complete card details to finish this sale.</p>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
            <label className="mb-2 block text-[16px] font-semibold">Card Holder Name</label>
            <input
              value={cardName}
              onChange={(event) => setCardName(event.target.value)}
              placeholder="Name on card"
              className="h-14 w-full rounded-[18px] border border-[#d3d3d3] bg-[#f8f8f8] px-5 text-[16px] outline-none"
            />

            <label className="mb-2 mt-4 block text-[16px] font-semibold">Card Number</label>
            <input
              value={cardNumber}
              onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
              placeholder="0000 0000 0000 0000"
              className="h-14 w-full rounded-[18px] border border-[#d3d3d3] bg-[#f8f8f8] px-5 text-[16px] outline-none"
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[16px] font-semibold">Expiry (MM/YY)</label>
                <input
                  value={expiry}
                  onChange={(event) => setExpiry(event.target.value.slice(0, 5))}
                  placeholder="12/30"
                  className="h-14 w-full rounded-[18px] border border-[#d3d3d3] bg-[#f8f8f8] px-5 text-[16px] outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-[16px] font-semibold">CVV</label>
                <input
                  value={cvv}
                  onChange={(event) => setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  className="h-14 w-full rounded-[18px] border border-[#d3d3d3] bg-[#f8f8f8] px-5 text-[16px] outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/sales/add")}
                className="w-full rounded-2xl border border-[#d3d3d3] bg-white px-5 py-4 text-[18px] font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[#ff7a1a] px-5 py-4 text-[18px] font-semibold text-white disabled:opacity-70"
              >
                {isSubmitting ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
            <h2 className="text-[30px] font-semibold">Payment Summary</h2>
            <Field label="Branch" value={draft.branch} />
            <Field label="Items" value={`${draft.items.length}`} />
            <Field label="Subtotal" value={`${subtotal.toLocaleString()} EGP`} />
            <Field label="Discount" value={`${Number(draft.discount || 0).toLocaleString()} EGP`} />
            <Field label="Tax" value={`${Number(draft.tax || 0).toLocaleString()} EGP`} />
            <Field label="Total To Pay" value={`${total.toLocaleString()} EGP`} valueClassName="text-[#27ae60]" />
            <Field label="Payment Type" value="Card" />
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({ label, value, valueClassName = "" }) {
  return (
    <div className="mt-3 rounded-2xl border border-[#d3d3d3] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[16px] text-[#8b9097]">{label}</span>
        <span className={`text-[18px] font-semibold ${valueClassName}`}>{value}</span>
      </div>
    </div>
  );
}
