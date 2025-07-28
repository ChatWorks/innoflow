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
    deal_type: "one_time",
    // One-time project fields
    amount: "",
    payment_received_date: "",
    // Recurring MRR fields
    monthly_amount: "",
    contract_length: "",
    start_date: "",
    description: ""
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
      if (formData.deal_type === "one_time") {
        // One-time project logic
        const dealData = {
          title: formData.title,
          client_name: formData.client_name,
          amount: parseFloat(formData.amount),
          status: "paid", // Always paid for one-time projects
          payment_received_date: formData.payment_received_date,
          description: formData.description || null,
          probability: 100,
          deal_type: "one_time",
          monthly_amount: null,
          contract_length: null,
          start_date: null,
          user_id: user.id
        };

        const { data: dealResult, error } = await supabase
          .from("deals")
          .insert(dealData)
          .select()
          .single();

        if (error) throw error;

        // Create cashflow entry for one-time payment
        if (dealResult) {
          await createCashflowEntry(dealResult.id, parseFloat(formData.amount), formData.title);
        }
      } else {
        // Recurring MRR logic
        const startDate = formData.start_date || new Date().toISOString().split('T')[0];
        const dealData = {
          title: formData.title,
          client_name: formData.client_name,
          amount: 0, // Not used for recurring
          status: "confirmed", // Always confirmed for MRR
          payment_received_date: null,
          description: formData.description || null,
          probability: 80,
          deal_type: "recurring",
          monthly_amount: parseFloat(formData.monthly_amount),
          contract_length: formData.contract_length ? parseInt(formData.contract_length) : null,
          start_date: startDate,
          user_id: user.id
        };

        const { data: dealResult, error } = await supabase
          .from("deals")
          .insert(dealData)
          .select()
          .single();

        if (error) throw error;

        // Create recurring revenue entry
        if (dealResult) {
          const contractLength = formData.contract_length ? parseInt(formData.contract_length) : null;
          await createRecurringRevenueEntry(dealResult.id, parseFloat(formData.monthly_amount), startDate, contractLength);
        }
      }

      toast({
        title: "Deal toegevoegd",
        description: "De deal is succesvol toegevoegd aan je pipeline.",
      });

      setFormData({
        title: "",
        client_name: "",
        deal_type: "one_time",
        amount: "",
        payment_received_date: "",
        monthly_amount: "",
        contract_length: "",
        start_date: "",
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Nieuwe Deal Toevoegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Deal Type Section */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <Label className="text-sm font-medium">Deal Type</Label>
            <RadioGroup
              value={formData.deal_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, deal_type: value }))}
              className="flex gap-8"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one_time" id="one_time" />
                <Label htmlFor="one_time" className="cursor-pointer">Eenmalig Project</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recurring" id="recurring" />
                <Label htmlFor="recurring" className="cursor-pointer">Recurring Revenue (MRR)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Deal Naam *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="bijv. Website ontwikkeling"
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_name">Klant *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="bijv. Bedrijf XYZ"
                required
                className="h-10"
              />
            </div>
          </div>

          {/* One-time Project Fields */}
          {formData.deal_type === "one_time" && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900">Eenmalig Project Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Bedrag (€) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    required
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_received_date">Betaal Datum *</Label>
                  <Input
                    id="payment_received_date"
                    type="date"
                    value={formData.payment_received_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_received_date: e.target.value }))}
                    required
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Recurring MRR Fields */}
          {formData.deal_type === "recurring" && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900">Recurring Revenue Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Datum</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="h-10"
                  />
                  <p className="text-xs text-blue-600">Laat leeg voor vandaag</p>
                </div>
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
                  className="h-10"
                />
                <p className="text-xs text-blue-600">Laat leeg voor onbepaalde tijd</p>
              </div>
            </div>
          )}

          {/* Optional Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschrijving (optioneel)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optionele beschrijving van de deal..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="px-6">
              Annuleren
            </Button>
            <Button type="submit" disabled={loading} className="px-6">
              {loading ? "Toevoegen..." : "Deal Toevoegen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};