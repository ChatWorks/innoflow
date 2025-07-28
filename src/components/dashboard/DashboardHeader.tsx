import { Button } from "@/components/ui/button";
import { LogOut, Settings, User, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient"; // Pas het importpad aan indien nodig

interface DashboardHeaderProps {
  onLogout?: () => void;
  userName?: string;
}

export const DashboardHeader = ({
  onLogout,
  userName = "Team Member",
}: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (onLogout) {
      onLogout();
    }
    navigate("/login");
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-primary-foreground rounded-sm"></div>
              </div>
              <h1 className="text-xl font-bold font-manrope text-foreground">
                Innoflow
              </h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => navigate("/")}
                className={`font-medium transition-colors ${
                  location.pathname === "/"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/deals")}
                className={`font-medium transition-colors ${
                  location.pathname === "/deals"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Deals
              </button>
              <button
                onClick={() => navigate("/fixed-costs")}
                className={`font-medium transition-colors ${
                  location.pathname === "/fixed-costs"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Vaste Kosten
              </button>
              <button
                onClick={() => navigate("/goals")}
                className={`font-medium transition-colors flex items-center gap-2 ${
                  location.pathname === "/goals"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Target className="w-4 h-4" />
                Doelen
                {/* Badge for at-risk goals - would be populated from goals hook */}
              </button>
              <button
                onClick={() => navigate("/ai-advisor")}
                className={`font-medium transition-colors ${
                  location.pathname === "/ai-advisor"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                AI Advies
              </button>
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Instellingen
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  Uitloggen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};