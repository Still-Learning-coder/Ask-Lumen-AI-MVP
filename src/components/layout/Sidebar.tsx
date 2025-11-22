import { useState, useEffect } from "react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Globe, Users, Trophy, Settings, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import lumenLogo from "@/assets/lumen-logo.jpg";

const navigationItems = [
  { name: "AI Assistant", path: "/dashboard", icon: MessageSquare },
  { name: "Ecosystem Hub", path: "/ecosystem", icon: Globe },
  { name: "Community", path: "/community", icon: Users },
  { name: "Achievements", path: "/achievements", icon: Trophy },
  { name: "Settings", path: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    loadConversations();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('conversations_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, () => {
        loadConversations();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/dashboard?conversation=${conversationId}`);
  };

  const handleNewChat = () => {
    navigate('/dashboard');
    window.location.reload();
  };

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out relative`}
    >
      {/* Logo and Toggle */}
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <img src={lumenLogo} alt="Lumen AI" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Lumen AI
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 mb-4">
        <Button
          onClick={handleNewChat}
          className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
          size={collapsed ? "icon" : "default"}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && <span className="ml-2">New Chat</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="px-2 mb-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Separator />

      {/* Chat History */}
      {!collapsed && (
        <ScrollArea className="flex-1 px-2 mt-4">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground mb-2">Recent Chats</p>
            {conversations.length === 0 ? (
              <p className="px-3 text-xs text-muted-foreground italic">No conversations yet</p>
            ) : (
              conversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleConversationClick(chat.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors group"
                >
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {chat.title || 'New Chat'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })}
                  </p>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      )}

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border mt-auto">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://i.pravatar.cc/150?img=1" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground">Level 5 • 1,250 pts</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
