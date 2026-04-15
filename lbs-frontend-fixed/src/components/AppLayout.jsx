import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Bell, LogOut, Mail, Phone, Building2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import jimsLogo from '@/assets/jims-logo.png';

const roleLabel = { admin: 'Admin / Timetable In-charge', faculty: 'Faculty', staff: 'Support Staff' };
const roleColor = { admin: 'bg-success/20 text-success border-success/30', faculty: 'bg-primary/20 text-primary border-primary/30', staff: 'bg-warning/20 text-warning border-warning/30' };

export function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const { notifications } = useApp();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const unreadCount = user ? notifications.filter(n => n.userId === user.id && !n.read).length : 0;

  const handleLogout = () => { setProfileOpen(false); logout(); navigate('/'); };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shadow-card">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground" />
              <img src={jimsLogo} alt="JIMS Logo" className="h-8 object-contain" />
              <span className="text-sm text-muted-foreground font-medium hidden sm:inline">Logistics Booking System</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/notifications')}>
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-destructive text-destructive-foreground">{unreadCount}</Badge>
                )}
              </Button>
              {user && (
                <button onClick={() => setProfileOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
                  title="View Profile">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </button>
              )}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>

      {profileOpen && user && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setProfileOpen(false)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-heading font-bold text-foreground">My Profile</h2>
              <Button variant="ghost" size="icon" onClick={() => setProfileOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-col items-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-primary text-primary-foreground text-2xl font-bold mb-3">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <h3 className="text-base font-semibold text-foreground text-center">{user.name}</h3>
              <span className={`mt-1 px-3 py-0.5 rounded-full text-xs font-medium border ${roleColor[user.role] || 'bg-muted text-muted-foreground border-border'}`}>
                {roleLabel[user.role] || user.role}
              </span>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Email</p><p className="text-sm text-foreground truncate">{user.email}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Department</p><p className="text-sm text-foreground">{user.department}</p></div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Phone</p><p className="text-sm text-foreground">{user.phone}</p></div>
                </div>
              )}
            </div>
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />Sign Out
            </Button>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
