import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Shield, DollarSign, AlertTriangle, Users, BarChart3,
  CheckCircle2, XCircle, Flag, Loader2
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role !== "admin") window.location.href = "/";
      setUser(u);
    }).catch(() => {});
  }, []);

  const { data: allWagers = [] } = useQuery({
    queryKey: ["admin-wagers"],
    queryFn: () => base44.entities.Wager.list("-created_date", 100),
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: () => base44.entities.Dispute.list("-created_date", 50),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => base44.entities.Report.filter({ status: "pending" }, "-created_date", 50),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: () => base44.entities.Transaction.list("-created_date", 100),
  });

  const totalRevenue = transactions
    .filter(t => t.type === "platform_fee")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const activeDisputes = disputes.filter(d => d.status !== "resolved").length;
  const completedWagers = allWagers.filter(w => w.status === "completed").length;

  const resolveDispute = useMutation({
    mutationFn: async ({ disputeId, resolution, wagerId, notes }) => {
      await base44.entities.Dispute.update(disputeId, {
        status: "resolved",
        resolution,
        moderator_notes: notes,
        resolved_by: user.email,
      });
      if (resolution !== "cancelled") {
        await base44.entities.Wager.update(wagerId, { status: "completed" });
      } else {
        await base44.entities.Wager.update(wagerId, { status: "cancelled" });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-disputes"] });
      qc.invalidateQueries({ queryKey: ["admin-wagers"] });
      toast.success("Dispute resolved!");
    },
  });

  const [selectedDispute, setSelectedDispute] = useState(null);
  const [disputeResolution, setDisputeResolution] = useState("");
  const [disputeNotes, setDisputeNotes] = useState("");

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Admin Panel" subtitle="Platform management" backButton />

      <div className="px-4 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Wagers" value={allWagers.length} icon={BarChart3} />
          <StatCard label="Revenue" value={`$${(totalRevenue / 100).toFixed(2)}`} icon={DollarSign} />
          <StatCard label="Disputes" value={activeDisputes} icon={AlertTriangle} color="text-red-400" />
          <StatCard label="Completed" value={completedWagers} icon={CheckCircle2} color="text-blue-400" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="disputes" className="space-y-4">
          <TabsList className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl">
            <TabsTrigger value="disputes" className="flex-1 text-xs rounded-lg data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black">
              Disputes ({activeDisputes})
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 text-xs rounded-lg data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black">
              Reports ({reports.length})
            </TabsTrigger>
            <TabsTrigger value="wagers" className="flex-1 text-xs rounded-lg data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black">
              All Wagers
            </TabsTrigger>
          </TabsList>

          {/* Disputes */}
          <TabsContent value="disputes" className="space-y-3">
            {disputes.filter(d => d.status !== "resolved").map(dispute => (
              <div key={dispute.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">Filed by: {dispute.filed_by}</p>
                    <p className="text-xs text-[var(--text-muted)]">{moment(dispute.created_date).fromNow()}</p>
                  </div>
                  <Badge className={`${
                    dispute.status === "open" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"
                  } border-0 text-[10px]`}>
                    {dispute.status}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--text-muted)]">{dispute.reason}</p>

                {selectedDispute === dispute.id ? (
                  <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                    <Select value={disputeResolution} onValueChange={setDisputeResolution}>
                      <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border)] text-white rounded-xl">
                        <SelectValue placeholder="Select resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="creator_wins">Creator Wins</SelectItem>
                        <SelectItem value="opponent_wins">Opponent Wins</SelectItem>
                        <SelectItem value="draw_refund">Draw — Refund Both</SelectItem>
                        <SelectItem value="cancelled">Cancel Wager</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Admin notes..."
                      value={disputeNotes}
                      onChange={e => setDisputeNotes(e.target.value)}
                      className="bg-[var(--surface-2)] border-[var(--border)] text-white rounded-xl"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          resolveDispute.mutate({
                            disputeId: dispute.id,
                            resolution: disputeResolution,
                            wagerId: dispute.wager_id,
                            notes: disputeNotes,
                          });
                          setSelectedDispute(null);
                        }}
                        disabled={!disputeResolution || resolveDispute.isPending}
                        className="flex-1 h-10 bg-[var(--accent)] text-black rounded-xl text-sm font-bold"
                      >
                        {resolveDispute.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Resolve"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedDispute(null)}
                        className="h-10 border-[var(--border)] rounded-xl text-sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelectedDispute(dispute.id); setDisputeResolution(""); setDisputeNotes(""); }}
                    className="border-[var(--border)] text-xs rounded-lg"
                  >
                    Review & Resolve
                  </Button>
                )}
              </div>
            ))}
            {disputes.filter(d => d.status !== "resolved").length === 0 && (
              <p className="text-center text-sm text-[var(--text-muted)] py-8">No open disputes</p>
            )}
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-3">
            {reports.map(report => (
              <div key={report.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flag className="w-3.5 h-3.5 text-red-400" />
                  <p className="text-sm font-medium">{report.reported_email}</p>
                </div>
                <Badge className="bg-red-500/10 text-red-400 border-0 text-[10px] mb-2">{report.reason}</Badge>
                <p className="text-xs text-[var(--text-muted)]">{report.details}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-2">Reported by {report.reporter_email} · {moment(report.created_date).fromNow()}</p>
              </div>
            ))}
            {reports.length === 0 && (
              <p className="text-center text-sm text-[var(--text-muted)] py-8">No pending reports</p>
            )}
          </TabsContent>

          {/* All Wagers */}
          <TabsContent value="wagers" className="space-y-2">
            {allWagers.slice(0, 20).map(wager => (
              <div key={wager.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{wager.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{wager.creator_email} · {moment(wager.created_date).fromNow()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-sm font-bold text-[var(--accent)]">${(wager.stake_amount / 100).toFixed(2)}</span>
                  <Badge className="bg-[var(--surface-2)] border-0 text-[10px]">{wager.status}</Badge>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}