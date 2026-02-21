import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import StripeCheckout from "../components/wallet/StripeCheckout";
import {
  Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Lock,
  TrendingUp, DollarSign, Loader2, ArrowUp, ArrowDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import moment from "moment";
import { motion } from "framer-motion";

export default function Wallet() {
  const [user, setUser] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["wallet", user?.email],
    queryFn: async () => {
      const wallets = await base44.entities.Wallet.filter({ user_email: user.email });
      if (wallets.length > 0) return wallets[0];
      return base44.entities.Wallet.create({ user_email: user.email, balance: 0, escrow_balance: 0 });
    },
    enabled: !!user?.email,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", user?.email],
    queryFn: () => base44.entities.Transaction.filter({ user_email: user.email }, "-created_date", 50),
    enabled: !!user?.email,
  });

  const depositMutation = useMutation({
    mutationFn: async (amount) => {
      const cents = Math.round(amount * 100);
      await base44.entities.Wallet.update(wallet.id, { balance: wallet.balance + cents, total_deposited: (wallet.total_deposited || 0) + cents });
      await base44.entities.Transaction.create({ user_email: user.email, type: "deposit", amount: cents, description: `Deposit $${amount}` });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      setDepositOpen(false);
      setDepositAmount("");
      toast.success("Deposit successful!");
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount) => {
      const { data } = await base44.functions.invoke('stripeCreatePayout', { amount });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      setWithdrawOpen(false);
      setWithdrawAmount("");
      toast.success("Withdrawal initiated!");
    },
    onError: (err) => toast.error(err.message),
  });

  const balance = wallet ? (wallet.balance / 100).toFixed(2) : "0.00";
  const escrow = wallet ? (wallet.escrow_balance / 100).toFixed(2) : "0.00";

  const TX_ICONS = {
    deposit: { icon: ArrowDownLeft, color: "text-green-400", bg: "bg-green-500/10" },
    withdrawal: { icon: ArrowUpRight, color: "text-red-400", bg: "bg-red-500/10" },
    escrow_lock: { icon: Lock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    escrow_release: { icon: Lock, color: "text-blue-400", bg: "bg-blue-500/10" },
    wager_win: { icon: TrendingUp, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
    wager_loss: { icon: ArrowDown, color: "text-red-400", bg: "bg-red-500/10" },
    platform_fee: { icon: DollarSign, color: "text-orange-400", bg: "bg-orange-500/10" },
    refund: { icon: ArrowDownLeft, color: "text-blue-400", bg: "bg-blue-500/10" },
  };

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Wallet" subtitle="Manage your funds" />

      <div className="px-4 py-6 space-y-5">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] border border-[var(--border)] rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
              <WalletIcon className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <span className="text-sm text-[var(--text-muted)]">Available Balance</span>
          </div>
          <p className="text-5xl font-black text-white mb-1">${isLoading ? "—" : balance}</p>
          <p className="text-sm text-[var(--text-muted)]">
            <Lock className="w-3 h-3 inline mr-1" />${escrow} in escrow
          </p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl font-bold">
                  <ArrowDown className="w-4 h-4 mr-2" /> Deposit
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[var(--surface)] border-[var(--border)] text-white">
                <DialogHeader>
                  <DialogTitle>Deposit Funds</DialogTitle>
                </DialogHeader>
                <StripeCheckout onSuccess={() => {
                  setDepositOpen(false);
                  qc.invalidateQueries({ queryKey: ["wallet"] });
                  qc.invalidateQueries({ queryKey: ["transactions"] });
                }} />
              </DialogContent>
            </Dialog>

            <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-12 border-[var(--border)] text-white hover:bg-[var(--surface-2)] rounded-xl font-bold">
                  <ArrowUp className="w-4 h-4 mr-2" /> Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[var(--surface)] border-[var(--border)] text-white">
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                </DialogHeader>
                <Input
                  type="number"
                  min="1"
                  placeholder="Amount ($)"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="bg-[var(--surface-2)] border-[var(--border)] text-white rounded-xl h-12"
                />
                <p className="text-xs text-[var(--text-muted)]">Available: ${balance}</p>
                <Button
                  onClick={() => withdrawMutation.mutate(Number(withdrawAmount))}
                  disabled={!withdrawAmount || Number(withdrawAmount) < 1 || withdrawMutation.isPending}
                  className="w-full h-12 bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl font-bold"
                >
                  {withdrawMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Withdrawal"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Won" value={`$${((wallet?.total_won || 0) / 100).toFixed(2)}`} icon={TrendingUp} />
          <StatCard label="Total Lost" value={`$${((wallet?.total_lost || 0) / 100).toFixed(2)}`} icon={ArrowDown} color="text-red-400" />
        </div>

        {/* Transactions */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-[var(--text-muted)] uppercase tracking-wide">Recent Transactions</h3>
          <div className="space-y-2">
            {transactions.length === 0 && (
              <p className="text-center text-sm text-[var(--text-muted)] py-8">No transactions yet</p>
            )}
            {transactions.map(tx => {
              const config = TX_ICONS[tx.type] || TX_ICONS.deposit;
              const TxIcon = config.icon;
              return (
                <div key={tx.id} className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3">
                  <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center`}>
                    <TxIcon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description || tx.type.replace(/_/g, " ")}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{moment(tx.created_date).fromNow()}</p>
                  </div>
                  <span className={`text-sm font-bold ${
                    ["deposit", "wager_win", "escrow_release", "refund"].includes(tx.type) ? "text-green-400" : "text-red-400"
                  }`}>
                    {["deposit", "wager_win", "escrow_release", "refund"].includes(tx.type) ? "+" : "-"}
                    ${(tx.amount / 100).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}