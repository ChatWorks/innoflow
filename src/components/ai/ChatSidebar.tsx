import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { ChatSession } from "@/hooks/useChatSessions";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { Input } from "@/components/ui/input";

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSessionSelect: (session: ChatSession) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateTitle: (sessionId: string, title: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ChatSidebar = ({
  sessions,
  currentSession,
  onSessionSelect,
  onNewChat,
  onDeleteSession,
  onUpdateTitle,
  isCollapsed,
  onToggleCollapse,
}: ChatSidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleEditStart = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleEditSave = () => {
    if (editingId && editTitle.trim()) {
      onUpdateTitle(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle("");
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-card border-r border-border transition-all duration-300 ease-in-out">
        <div className="p-4 space-y-4">
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="icon"
            className="w-8 h-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={onNewChat}
            variant="ghost"
            size="icon"
            className="w-8 h-8"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Separator />

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-2">
              {sessions.slice(0, 8).map((session) => (
                <Button
                  key={session.id}
                  onClick={() => onSessionSelect(session)}
                  variant={currentSession?.id === session.id ? "secondary" : "ghost"}
                  size="icon"
                  className="w-8 h-8"
                  title={session.title}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-80 bg-card border-r border-border transition-all duration-300 ease-in-out rounded-none">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold font-manrope text-foreground">
            Chat Geschiedenis
          </h2>
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nieuwe Chat
        </Button>

        <Separator />

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nog geen chats</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group p-3 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                    currentSession?.id === session.id
                      ? "bg-primary/10 border-primary/20 shadow-md"
                      : "bg-background hover:bg-accent/50 border-border"
                  }`}
                  onClick={() => onSessionSelect(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {editingId === session.id ? (
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={handleEditSave}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave();
                            if (e.key === "Escape") handleEditCancel();
                          }}
                          className="h-6 text-sm p-1"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {session.title}
                        </h3>
                      )}
                      
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(session.updated_at), {
                          addSuffix: true,
                          locale: nl,
                        })}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(session);
                        }}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Chat verwijderen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Weet je zeker dat je deze chat wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuleren</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteSession(session.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Verwijderen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};