import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const useDeals = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDeals = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);

      // Fetch all deals for the user
      const { data: dealsData, error } = await supabase
        .from("deals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching deals:", error);
        toast({
          title: "Error loading deals",
          description: "Could not load deals data",
          variant: "destructive",
        });
        setDeals([]);
      } else {
        setDeals(dealsData || []);
      }

    } catch (error) {
      console.error("Error fetching deals:", error);
      toast({
        title: "Error loading deals",
        description: "Could not load deals data",
        variant: "destructive",
      });
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return {
    deals,
    loading,
    refetch: fetchDeals
  };
};