import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useVat } from "@/contexts/VatContext";

export function VatToggle() {
  const { includeVat, toggleVat } = useVat();

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="vat-toggle" className="text-sm font-medium">
        Excl. BTW
      </Label>
      <Switch
        id="vat-toggle"
        checked={includeVat}
        onCheckedChange={toggleVat}
      />
      <Label htmlFor="vat-toggle" className="text-sm font-medium">
        Incl. BTW (21%)
      </Label>
    </div>
  );
}