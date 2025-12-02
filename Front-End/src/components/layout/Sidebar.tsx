import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  MessageSquare, 
  Heart, 
  User, 
  Settings,
  ChevronLeft,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  const userItems = [
    { path: "/my-downloads", label: "My Downloads", icon: Download },
    { path: "/my-reviews", label: "My Reviews", icon: MessageSquare },
    { path: "/my-interests", label: "My Interests", icon: Heart },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const adminItems = [
    { path: "/admin", label: "Admin Panel", icon: Shield },
  ];

  // For demo purposes, showing admin link. In production, this would be role-based
  const isAdmin = true;

  return (
    <aside 
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="p-2 border-b flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
                My Account
              </p>
            )}
            
            {userItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full transition-all",
                    collapsed ? "justify-center px-2" : "justify-start gap-3",
                    isActive(item.path) && "font-medium"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            ))}

            {isAdmin && (
              <>
                {!collapsed && (
                  <p className="px-3 py-2 text-xs font-medium text-muted-foreground mt-4">
                    Administration
                  </p>
                )}
                {adminItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive(item.path) ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full transition-all",
                        collapsed ? "justify-center px-2" : "justify-start gap-3",
                        isActive(item.path) && "font-medium"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Button>
                  </Link>
                ))}
              </>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
