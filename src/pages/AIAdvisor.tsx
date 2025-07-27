import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ChatInterface } from "@/components/ai/ChatInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Brain, MessageSquare, TrendingUp, Lightbulb } from "lucide-react";

export const AIAdvisor = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        onLogout={signOut} 
        userName={user?.email?.split('@')[0] || 'Team Member'} 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Business Advisor</h1>
              <p className="text-muted-foreground">Krijg slimme inzichten en advies voor je bedrijf</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat met je AI Advisor
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[520px] p-0">
                <ChatInterface context={{
                  monthlyIncome: 0,
                  monthlyExpenses: 0,
                  netCashflow: 0,
                  pipelineValue: 0,
                  activeDeals: 0,
                  fixedCosts: 0
                }} />
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Quick Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Cashflow Trend:</strong> Je cashflow toont een positieve trend de laatste 3 maanden.
                  </p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    <strong>Kostenbeheer:</strong> Overweeg het evalueren van je vaste kosten voor optimalisatie.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Deal Pipeline:</strong> Er zijn kansen om je salesproces te verbeteren.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5" />
                  Voorgestelde Vragen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full text-left p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm">
                  "Hoe kan ik mijn cashflow verbeteren?"
                </button>
                <button className="w-full text-left p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm">
                  "Welke vaste kosten kan ik besparen?"
                </button>
                <button className="w-full text-left p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm">
                  "Wat zijn mijn beste presterende deals?"
                </button>
                <button className="w-full text-left p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm">
                  "Hoe voorspel ik mijn omzet voor volgend kwartaal?"
                </button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg text-primary">🚀 Pro Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gebruik specifieke vragen met je bedrijfsdata voor de beste adviezen. De AI heeft toegang tot je actuele deals en kosten.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIAdvisor;