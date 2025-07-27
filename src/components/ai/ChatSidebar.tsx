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
    setEditingId(session.conversation_id);
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
      <div className="w-12 bg-card border-r border-border transition-all duration-300 ease-in-out flex-shrink-0">
        <div className="p-2 space-y-2">
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

          <div className="h-px bg-border my-2" />

          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="space-y-1">
              {sessions.slice(0, 12).map((session) => (
                <Button
                  key={session.conversation_id}
                  onClick={() => onSessionSelect(session)}
                  variant={currentSession?.conversation_id === session.conversation_id ? "secondary" : "ghost"}
                  size="icon"
                  className="w-8 h-8"
                  title={session.title}
                >
                  <MessageSquare className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-card border-r border-border transition-all duration-300 ease-in-out flex-shrink-0">
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Chats
          </h2>
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="icon"
            className="h-6 w-6"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm h-8"
        >
          <Plus className="w-3 h-3 mr-2" />
          Nieuwe chat
        </Button>

        <div className="h-px bg-border" />

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Nog geen chats</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.conversation_id}
                  className={`group p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                    currentSession?.conversation_id === session.conversation_id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent/50 text-foreground"
                  }`}
                  onClick={() => onSessionSelect(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {editingId === session.conversation_id ? (
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={handleEditSave}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave();
                            if (e.key === "Escape") handleEditCancel();
                          }}
                          className="h-5 text-xs p-1"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h3 className="text-xs font-medium truncate">
                          {session.title}
                        </h3>
                      )}
                      
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        {formatDistanceToNow(new Date(session.last_activity), {
                          addSuffix: true,
                          locale: nl,
                        })}
                        <span className="ml-1 text-[10px]">({session.message_count} berichten)</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(session);
                        }}
                      >
                        <Edit3 className="h-2.5 w-2.5" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-2.5 w-2.5" />
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
                              onClick={() => onDeleteSession(session.conversation_id)}
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
    </div>
  );
};