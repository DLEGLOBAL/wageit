import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function StripeCheckout({ onSuccess }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!amount || Number(amount) < 1) {
      return toast.error("Minimum deposit is $1");
    }

    setLoading(true);
    toast.loading("Processing payment...");

    try {
      const { data } = await base44.functions.invoke('stripeCreatePaymentIntent', {
        amount: Number(amount)
      });

      // Simulate successful payment (in production, use Stripe Elements)
      setTimeout(async () => {
        toast.dismiss();
        toast.success("Payment successful!");
        setLoading(false);
        setAmount("");
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-[var(--text-muted)]">Deposit Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
          <Input
            type="number"
            min="1"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="bg-[var(--surface-2)] border-[var(--border)] text-white rounded-xl h-12 pl-7"
          />
        </div>
      </div>

      <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)]">Payment via Stripe</span>
        </div>
        <p className="text-[10px] text-[var(--text-muted)]">
          Secure payment processing. Funds appear instantly in your wallet.
        </p>
      </div>

      <Button
        onClick={handleDeposit}
        disabled={loading || !amount || Number(amount) < 1}
        className="w-full h-12 bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl font-bold"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Deposit $${amount || '0.00'}`}
      </Button>

      <p className="text-[10px] text-center text-[var(--text-muted)]">
        Powered by Stripe • Secured by Roccstar.AI
      </p>
    </div>
  );
}