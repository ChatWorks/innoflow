import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";

interface AddDealModalProps {
  onSuccess?: () => void;
}

export const AddDealModal = ({ onSuccess }: AddDealModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    amount: "",
    status: "potential",
    expected_date: "",
    description: ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("deals")
        .insert({
          title: formData.title,
          client_name: formData.client_name,
          amount: parseFloat(formData.amount),
          status: formData.status,
          expected_date: formData.expected_date || null,
          description: formData.description || null,
          probability: formData.status === "potential" ? 50 : formData.status === "confirmed" ? 80 : 100
        });

      if (error) throw error;

      toast({
        title: "Deal toegevoegd",
        description: "De deal is succesvol toegevoegd aan je pipeline.",
      });

      setFormData({
        title: "",
        client_name: "",
        amount: "",
        status: "potential",
        expected_date: "",
        description: ""
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding deal:", error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het toevoegen van de deal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Deal Toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nieuwe Deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Deal Naam</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="bijv. Website ontwikkeling"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_name">Klant</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
              placeholder="bijv. Bedrijf XYZ"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Bedrag (€)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0,00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="potential">Potentieel</SelectItem>
                <SelectItem value="confirmed">Bevestigd</SelectItem>
                <SelectItem value="invoiced">Gefactureerd</SelectItem>
                <SelectItem value="paid">Betaald</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_date">Verwachte Datum</Label>
            <Input
              id="expected_date"
              type="date"
              value={formData.expected_date}
              onChange={(e) => setFormData(prev => ({ ...prev, expected_date: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optionele beschrijving van de deal..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Toevoegen..." : "Toevoegen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};