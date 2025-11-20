import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { MessageSquare, Globe, Users, Trophy, Settings, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import lumenLogo from "@/assets/lumen-logo.jpg";

const mockChatHistory = [
  { id: 1, title: "Exploring AI Images", timestamp: "2h ago" },
  { id: 2, title: "3D Model Generation", timestamp: "1d ago" },
  { id: 3, title: "Research Assistant", timestamp: "2d ago" },
  { id: 4, title: "Video Creation Help", timestamp: "3d ago" },
  { id: 5, title: "Code Review Session", timestamp: "1w ago" },
];

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
            {mockChatHistory.map((chat) => (
              <button
                key={chat.id}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors group"
              >
                <p className="text-sm font-medium text-sidebar-foreground truncate">{chat.title}</p>
                <p className="text-xs text-muted-foreground">{chat.timestamp}</p>
              </button>
            ))}
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
