import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus } from "lucide-react";

interface AddDealModalProps {
  onSuccess?: () => void;
}

export const AddDealModal = ({ onSuccess }: AddDealModalProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    amount: "",
    status: "potential",
    expected_date: "",
    description: "",
    deal_type: "one_time",
    monthly_amount: "",
    contract_length: "",
    start_date: ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add deals.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const dealData: any = {
        title: formData.title,
        client_name: formData.client_name,
        amount: parseFloat(formData.amount),
        status: formData.status,
        expected_date: formData.expected_date || null,
        description: formData.description || null,
        probability: formData.status === "potential" ? 50 : formData.status === "confirmed" ? 80 : 100,
        deal_type: formData.deal_type,
        monthly_amount: formData.deal_type === "recurring" ? parseFloat(formData.monthly_amount) : null,
        contract_length: formData.deal_type === "recurring" ? parseInt(formData.contract_length) : null,
        start_date: formData.deal_type === "recurring" ? formData.start_date : null,
        user_id: user.id
      };

      // Add payment_received_date if status is paid
      if (formData.status === "paid") {
        dealData.payment_received_date = new Date().toISOString().split('T')[0];
      }

      const { data: dealResult, error } = await supabase
        .from("deals")
        .insert(dealData)
        .select()
        .single();

      if (error) throw error;

      // If deal is paid, create cashflow entry immediately
      if (formData.status === "paid" && dealResult) {
        await createCashflowEntry(dealResult.id, parseFloat(formData.amount), formData.title);
      }

      // If it's a recurring deal and confirmed/paid, create recurring revenue entry
      if (formData.deal_type === "recurring" && (formData.status === "confirmed" || formData.status === "paid") && dealResult && formData.monthly_amount) {
        const contractLength = formData.contract_length ? parseInt(formData.contract_length) : null;
        const startDate = formData.start_date || new Date().toISOString().split('T')[0];
        await createRecurringRevenueEntry(dealResult.id, parseFloat(formData.monthly_amount), startDate, contractLength);
      }

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
        description: "",
        deal_type: "one_time",
        monthly_amount: "",
        contract_length: "",
        start_date: ""
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

  const createCashflowEntry = async (dealId: string, amount: number, description: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("cashflow_entries")
        .insert({
          type: "income",
          description: `Deal betaling: ${description}`,
          category: "deals",
          amount: amount,
          transaction_date: new Date().toISOString().split('T')[0],
          deal_id: dealId,
          is_projected: false,
          user_id: user.id
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error creating cashflow entry:", error);
    }
  };

  const createRecurringRevenueEntry = async (dealId: string, monthlyAmount: number, startDate: string, contractLength: number | null) => {
    if (!user) return;
    
    try {
      const endDate = contractLength ? (() => {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + contractLength);
        return date.toISOString().split('T')[0];
      })() : null;

      const { error } = await supabase
        .from("recurring_revenue")
        .insert({
          deal_id: dealId,
          monthly_amount: monthlyAmount,
          start_date: startDate,
          end_date: endDate,
          is_active: true,
          user_id: user.id
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error creating recurring revenue entry:", error);
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
          <div className="space-y-3">
            <Label>Deal Type</Label>
            <RadioGroup
              value={formData.deal_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, deal_type: value }))}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one_time" id="one_time" />
                <Label htmlFor="one_time">Eenmalig Project</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recurring" id="recurring" />
                <Label htmlFor="recurring">Recurring Revenue (MRR)</Label>
              </div>
            </RadioGroup>
          </div>

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
            <Label htmlFor="amount">
              {formData.deal_type === "recurring" ? "Totaal Contract Waarde (€)" : "Bedrag (€)"}
            </Label>
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

          {formData.deal_type === "recurring" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="monthly_amount">Maandelijks Bedrag (€) *</Label>
                <Input
                  id="monthly_amount"
                  type="number"
                  value={formData.monthly_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_amount: e.target.value }))}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Datum</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Optioneel - gebruikt voor projecties</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract_length">Contract Lengte (maanden)</Label>
                  <Input
                    id="contract_length"
                    type="number"
                    value={formData.contract_length}
                    onChange={(e) => setFormData(prev => ({ ...prev, contract_length: e.target.value }))}
                    placeholder="bijv. 12"
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground">Laat leeg voor onbepaalde tijd</p>
                </div>
              </div>
            </>
          )}

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