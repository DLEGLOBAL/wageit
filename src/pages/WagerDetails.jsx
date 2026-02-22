import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../components/common/PageHeader";
import ShareButton from "../components/common/ShareButton";
import WagerComments from "../components/wager/WagerComments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock, DollarSign, Shield, Upload, AlertTriangle, CheckCircle2,
  User, Zap, Trophy, Loader2, Camera
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

const STATUS_STYLES = {
  open: "bg-[var(--accent)]/10 text-[var(--accent)]",
  pending_funding: "bg-yellow-500/10 text-yellow-400",
  active: "bg-blue-500/10 text-blue-400",
  proof_submitted: "bg-purple-500/10 text-purple-400",
  disputed: "bg-red-500/10 text-red-400",
  completed: "bg-gray-500/10 text-gray-400",
};

export default function WagerDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const wagerId = urlParams.get("id");
  const [user, setUser] = useState(null);
  const [proofNote, setProofNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: wager, isLoading } = useQuery({
    queryKey: ["wager", wagerId],
    queryFn: () => base44.entities.Wager.filter({ id: wagerId }),
    select: data => data[0],
    enabled: !!wagerId,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!wagerId) return;
    const unsubscribe = base44.entities.Wager.subscribe((event) => {
      if (event.id === wagerId) {
        qc.invalidateQueries({ queryKey: ["wager", wagerId] });
      }
    });
    return unsubscribe;
  }, [wagerId]);

  // Create wager chat room if doesn't exist
  useEffect(() => {
    if (!wager || !user?.email) return;
    if (!wager.creator_email || !wager.opponent_email) return;

    const createWagerRoom = async () => {
      const existing = await base44.entities.ChatRoom.filter({
        room_type: "wager",
        wager_id: wagerId
      });
      
      if (existing.length === 0) {
        await base44.entities.ChatRoom.create({
          room_type: "wager",
          wager_id: wagerId,
          participant_emails: [wager.creator_email, wager.opponent_email]
        });
      }
    };
    
    createWagerRoom();
  }, [wager, user?.email, wagerId]);

  const updateWager = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Wager.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wager", wagerId] }),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
    </div>
  );

  if (!wager) return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Wager Not Found" backButton />
      <p className="text-center text-[var(--text-muted)] mt-8">This wager doesn't exist or was removed.</p>
    </div>
  );

  const isCreator = user?.email === wager.creator_email;
  const isOpponent = user?.email === wager.opponent_email;
  const isParticipant = isCreator || isOpponent;
  const stakeDisplay = (wager.stake_amount / 100).toFixed(2);
  const totalPot = (wager.stake_amount * 2 / 100).toFixed(2);

  const handleAccept = async () => {
    await updateWager.mutateAsync({
      id: wager.id,
      data: { opponent_email: user.email, opponent_name: user.full_name, status: "pending_funding" },
    });
    toast.success("Wager accepted! Fund your escrow to activate.");
  };

  const handleFund = async () => {
    const field = isCreator ? "creator_funded" : "opponent_funded";
    const otherFunded = isCreator ? wager.opponent_funded : wager.creator_funded;
    const newStatus = otherFunded ? "active" : "pending_funding";

    await updateWager.mutateAsync({
      id: wager.id,
      data: { [field]: true, status: newStatus },
    });
    toast.success(newStatus === "active" ? "Both funded! Wager is now active." : "Funded! Waiting for opponent.");
  };

  const handleProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const proofField = isCreator ? "creator_proof_url" : "opponent_proof_url";
    const noteField = isCreator ? "creator_proof_note" : "opponent_proof_note";
    await updateWager.mutateAsync({
      id: wager.id,
      data: { [proofField]: file_url, [noteField]: proofNote, status: "proof_submitted" },
    });
    setUploading(false);
    toast.success("Proof submitted!");
  };

  const handleDispute = async () => {
    await base44.entities.Dispute.create({
      wager_id: wager.id,
      filed_by: user.email,
      reason: "I dispute the outcome of this wager",
    });
    await updateWager.mutateAsync({ id: wager.id, data: { status: "disputed" } });
    toast.info("Dispute filed. A moderator will review.");
  };

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader 
        title="Wager Details" 
        backButton 
        rightAction={
          <div className="flex gap-2">
            {isParticipant && wager?.opponent_email && (
              <Link to={createPageUrl(`Chat?room=${wager.id}`)}>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-[var(--border)] text-white hover:bg-[var(--surface)] rounded-xl"
                  onClick={async () => {
                    const rooms = await base44.entities.ChatRoom.filter({
                      room_type: "wager",
                      wager_id: wagerId
                    });
                    if (rooms[0]) {
                      window.location.href = createPageUrl(`Chat?room=${rooms[0].id}`);
                    }
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <ShareButton title={wager?.title} />
          </div>
        }
      />

      <div className="px-4 py-6 space-y-5">
        {/* Status & Title */}
        <div>
          <Badge className={`${STATUS_STYLES[wager.status] || ""} border-0 text-xs font-semibold uppercase mb-2`}>
            {wager.status?.replace(/_/g, " ")}
          </Badge>
          <h2 className="text-2xl font-bold">{wager.title}</h2>
          {wager.description && <p className="text-sm text-[var(--text-muted)] mt-2">{wager.description}</p>}
        </div>

        {/* Pot Info */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
          <div className="text-center">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Total Pot</p>
            <p className="text-4xl font-black text-[var(--accent)]">${totalPot}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">${stakeDisplay} per side</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className={`p-3 rounded-xl border ${wager.creator_funded ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)]"}`}>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-xs font-medium truncate">{wager.creator_name || "Creator"}</span>
              </div>
              <span className={`text-[10px] font-semibold ${wager.creator_funded ? "text-[var(--accent)]" : "text-yellow-400"}`}>
                {wager.creator_funded ? "✓ Funded" : "Pending"}
              </span>
            </div>
            <div className={`p-3 rounded-xl border ${wager.opponent_funded ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)]"}`}>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-xs font-medium truncate">{wager.opponent_name || "Open"}</span>
              </div>
              <span className={`text-[10px] font-semibold ${wager.opponent_funded ? "text-[var(--accent)]" : "text-yellow-400"}`}>
                {wager.opponent_email ? (wager.opponent_funded ? "✓ Funded" : "Pending") : "Waiting..."}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3">
            <Clock className="w-4 h-4 text-[var(--text-muted)] mb-1" />
            <p className="text-xs text-[var(--text-muted)]">Expires</p>
            <p className="text-sm font-medium">{wager.expires_at ? moment(wager.expires_at).format("MMM D, h:mm A") : "No expiry"}</p>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3">
            <Camera className="w-4 h-4 text-[var(--text-muted)] mb-1" />
            <p className="text-xs text-[var(--text-muted)]">Proof</p>
            <p className="text-sm font-medium capitalize">{wager.proof_type}</p>
          </div>
        </div>

        {/* Proof Display */}
        {(wager.creator_proof_url || wager.opponent_proof_url) && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Submitted Proof</h3>
            {wager.creator_proof_url && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3">
                <p className="text-xs text-[var(--text-muted)] mb-1">Creator's proof</p>
                <a href={wager.creator_proof_url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] text-sm underline">View Proof</a>
                {wager.creator_proof_note && <p className="text-xs text-[var(--text-muted)] mt-1">{wager.creator_proof_note}</p>}
              </div>
            )}
            {wager.opponent_proof_url && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3">
                <p className="text-xs text-[var(--text-muted)] mb-1">Opponent's proof</p>
                <a href={wager.opponent_proof_url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] text-sm underline">View Proof</a>
                {wager.opponent_proof_note && <p className="text-xs text-[var(--text-muted)] mt-1">{wager.opponent_proof_note}</p>}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {/* Open challenge - Accept */}
          {wager.status === "open" && !isCreator && user && (
            <Button onClick={handleAccept} className="w-full h-12 bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl font-bold">
              Accept Challenge — ${stakeDisplay}
            </Button>
          )}

          {/* Fund Escrow */}
          {wager.status === "pending_funding" && isParticipant && (
            <>
              {(isCreator && !wager.creator_funded) || (isOpponent && !wager.opponent_funded) ? (
                <Button onClick={handleFund} className="w-full h-12 bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl font-bold">
                  <DollarSign className="w-4 h-4 mr-2" /> Fund Escrow — ${stakeDisplay}
                </Button>
              ) : (
                <div className="text-center text-sm text-[var(--text-muted)] bg-[var(--surface)] rounded-xl p-4">
                  <Shield className="w-5 h-5 mx-auto mb-2 text-[var(--accent)]" />
                  Your funds are locked. Waiting for opponent to fund.
                </div>
              )}
            </>
          )}

          {/* Submit Proof */}
          {wager.status === "active" && isParticipant && (
            <div className="space-y-3">
              <Textarea
                placeholder="Add a note about your proof..."
                value={proofNote}
                onChange={e => setProofNote(e.target.value)}
                className="bg-[var(--surface)] border-[var(--border)] text-white rounded-xl"
              />
              <label className="w-full">
                <div className="w-full h-12 bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl font-bold flex items-center justify-center cursor-pointer transition-colors">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-4 h-4 mr-2" /> Upload Proof</>}
                </div>
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleProofUpload} disabled={uploading} />
              </label>
            </div>
          )}

          {/* Dispute */}
          {["active", "proof_submitted"].includes(wager.status) && isParticipant && (
            <Button
              variant="outline"
              onClick={handleDispute}
              className="w-full h-12 border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl"
            >
              <AlertTriangle className="w-4 h-4 mr-2" /> Dispute Wager
            </Button>
          )}

          {/* Completed */}
          {wager.status === "completed" && wager.winner_email && (
            <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-[var(--accent)] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[var(--accent)]">
                Winner: {wager.winner_email === user?.email ? "You!" : wager.winner_email}
              </p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        {wager && (
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <WagerComments wagerId={wager.id} />
          </div>
        )}
      </div>
    </div>
  );
}