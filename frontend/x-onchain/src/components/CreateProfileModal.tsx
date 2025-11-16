import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProgram } from "@/contexts/ProgramProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated: () => void;
}

export const CreateProfileModal = ({
  isOpen,
  onClose,
  onProfileCreated,
}: CreateProfileModalProps) => {
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { program } = useProgram();
  const { publicKey } = useWallet();

  const handleCreateProfile = async () => {
    if (!program || !publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    if (handle.trim().length === 0 || name.trim().length === 0) {
      toast.error("Please fill in all fields");
      return;
    }

    if (handle.length > 15) {
      toast.error("Handle must be 15 characters or less");
      return;
    }

    if (name.length > 50) {
      toast.error("Name must be 50 characters or less");
      return;
    }

    setIsCreating(true);
    try {
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .createProfile(handle, name)
        .accounts({
          profile: profilePda,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success("Profile created successfully!");
      onProfileCreated();
      onClose();
      setHandle("");
      setName("");
    } catch (error: any) {
      console.error("Error creating profile:", error);
      if (error.message?.includes("already in use")) {
        toast.error("Profile already exists for this wallet");
      } else {
        toast.error("Failed to create profile");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="handle">Handle</Label>
            <Input
              id="handle"
              placeholder="solana_dev"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              maxLength={15}
            />
            <p className="text-xs text-muted-foreground">
              Your unique username (max 15 characters)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              placeholder="Solana Developer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              Your display name (max 50 characters)
            </p>
          </div>
          <Button
            onClick={handleCreateProfile}
            disabled={isCreating || !handle.trim() || !name.trim()}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Create Profile"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
