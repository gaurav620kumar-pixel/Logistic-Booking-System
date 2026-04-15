import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard,
  MapPin,
  CalendarPlus,
  CalendarCheck,
  Bell,
  Users,
  Settings,
  Wrench,
  BarChart3,
  MessageSquare,
  LogOut,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const facultyNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Venues', url: '/venues', icon: MapPin },
  { title: 'Book Venue', url: '/book', icon: CalendarPlus },
  { title: 'My Bookings', url: '/my-bookings', icon: CalendarCheck },
  { title: 'Requests', url: '/requests', icon: MessageSquare },
  { title: 'Notifications', url: '/notifications', icon: Bell },
];

const staffNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Equipment Requests', url: '/equipment-requests', icon: Wrench },
  { title: 'Venues', url: '/venues', icon: MapPin },
  { title: 'Notifications', url: '/notifications', icon: Bell },
];

const adminNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Venues', url: '/venues', icon: MapPin },
  { title: 'All Bookings', url: '/all-bookings', icon: CalendarCheck },
  { title: 'Manage Users', url: '/manage-users', icon: Users },
  { title: 'Manage Venues', url: '/manage-venues', icon: Building2 },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Notifications', url: '/notifications', icon: Bell },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = user.role === 'admin' ? adminNav : user.role === 'staff' ? staffNav : facultyNav;
  const roleLabel = user.role === 'admin' ? 'Admin Panel' : user.role === 'staff' ? 'Staff Panel' : 'Faculty Portal';

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="gradient-sidebar">
        <div className="px-4 py-5">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-heading font-bold text-sidebar-foreground">LBS</h2>
                <p className="text-[11px] text-sidebar-foreground/60">{roleLabel}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gradient-sidebar border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-3 py-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground text-xs font-semibold">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-[11px] text-sidebar-foreground/50 truncate">{user.department}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => { logout(); navigate('/'); }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
              onClick={() => { logout(); navigate('/'); }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
