import { Button } from "@/components/ui/button";
import { Calendar, LogOut, Settings, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
interface DashboardHeaderProps {
  onLogout?: () => void;
  userName?: string;
}
export const DashboardHeader = ({
  onLogout,
  userName = "Team Member"
}: DashboardHeaderProps) => {
  return <header className="bg-card border-b border-border">
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
              <a href="#" className="text-foreground hover:text-primary font-medium transition-colors">
                Dashboard
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground font-medium transition-colors">
                Deals
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground font-medium transition-colors">
                Vaste Kosten
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground font-medium transition-colors">
                Cashflow
              </a>
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              <Calendar className="w-4 h-4 mr-2" />
              Datum Filter
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>;
};