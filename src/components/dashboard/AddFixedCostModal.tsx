import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus } from "lucide-react";

interface AddFixedCostModalProps {
  onSuccess?: () => void;
}

export const AddFixedCostModal = ({ onSuccess }: AddFixedCostModalProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    amount: "",
    frequency: "",
    start_date: ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add fixed costs.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from("fixed_costs")
        .insert({
          name: formData.name,
          category: formData.category,
          amount: parseFloat(formData.amount),
          frequency: formData.frequency,
          start_date: formData.start_date,
          is_active: true,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Vaste kosten toegevoegd",
        description: "De vaste kosten zijn succesvol toegevoegd.",
      });

      setFormData({
        name: "",
        category: "",
        amount: "",
        frequency: "",
        start_date: ""
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding fixed cost:", error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het toevoegen van de vaste kosten.",
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
          Vaste Kosten Toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Nieuwe Vaste Kosten Toevoegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information - Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naam *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="bijv. Kantoorhuur"
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categorie *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecteer categorie" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="kantoor">🏢 Kantoor</SelectItem>
                  <SelectItem value="software">💻 Software</SelectItem>
                  <SelectItem value="marketing">📈 Marketing</SelectItem>
                  <SelectItem value="verzekeringen">🛡️ Verzekeringen</SelectItem>
                  <SelectItem value="transport">🚗 Transport</SelectItem>
                  <SelectItem value="communicatie">📞 Communicatie</SelectItem>
                  <SelectItem value="overig">📦 Overig</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Financial and Frequency Information */}
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
              <Label htmlFor="frequency">Frequentie *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                required
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecteer frequentie" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="monthly">📅 Maandelijks</SelectItem>
                  <SelectItem value="quarterly">📊 Kwartaal</SelectItem>
                  <SelectItem value="yearly">🗓️ Jaarlijks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Startdatum *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
                className="h-10"
              />
            </div>
            
            {/* Info box for better UX */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Informatie</Label>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  Deze kosten worden automatisch berekend in je cashflow overzicht en budgettering.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="px-6">
              Annuleren
            </Button>
            <Button type="submit" disabled={loading} className="px-6">
              {loading ? "Toevoegen..." : "Vaste Kosten Toevoegen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};