import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings, Clock, Bell, Building2, Users, Trash2, Plus, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { mockTimeSlots } from '@/data/mockData';

export default function SettingsPage() {
  const { user } = useAuth();
  const { venues, notifications, markAllRead } = useApp();
  const [timeSlots] = useState(mockTimeSlots);
  const [notifPref, setNotifPref] = useState({ bookingUpdates: true, equipmentRequests: true, compromiseRequests: true, timetableChanges: true });
  const [systemName, setSystemName] = useState('JIMS Logistics Booking System');
  const [saved, setSaved] = useState(false);

  const handleSaveSystem = () => {
    setSaved(true);
    toast.success('System settings saved.');
    setTimeout(() => setSaved(false), 2000);
  };

  const unreadCount = notifications.filter(n => n.userId === user?.id && !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">System configuration & preferences</p>
      </div>

      {/* System Info */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" /> System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">System Name</label>
            <div className="flex gap-2">
              <Input value={systemName} onChange={e => setSystemName(e.target.value)} />
              <Button onClick={handleSaveSystem} size="sm" className="shrink-0 gradient-primary text-primary-foreground">
                {saved ? <Check className="h-4 w-4" /> : 'Save'}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Total Venues</p>
              <p className="text-xs text-muted-foreground">Active venues in the system</p>
            </div>
            <Badge variant="secondary" className="text-sm font-bold">{venues.length}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Booking Time Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeSlots.map(ts => (
              <div key={ts.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <span className="text-sm text-foreground">{ts.label}</span>
                <Badge variant="outline" className="text-[10px]">Active</Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Time slots are used for booking venue reservations across the system.</p>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Notification Preferences
            {unreadCount > 0 && <Badge className="bg-destructive text-destructive-foreground text-[10px]">{unreadCount} unread</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: 'bookingUpdates', label: 'Booking Status Updates', desc: 'Approved, rejected, cancelled notifications' },
            { key: 'equipmentRequests', label: 'Equipment Requests', desc: 'Staff acknowledgements and readiness' },
            { key: 'compromiseRequests', label: 'Compromise Requests', desc: 'Faculty swap and sharing requests' },
            { key: 'timetableChanges', label: 'Timetable Changes', desc: 'Schedule modifications and updates' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <button
                onClick={() => setNotifPref(p => ({ ...p, [key]: !p[key] }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${notifPref[key] ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${notifPref[key] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => { markAllRead(user?.id); toast.success('All notifications marked as read.'); }}>
            Mark All Notifications as Read
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            ['System', 'JIMS Logistics Booking System'],
            ['Institution', 'Jagan Institute of Management Studies'],
            ['Version', 'v1.0.0'],
            ['Logged in as', `${user?.name} (${user?.role})`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
              <span className="text-xs text-muted-foreground">{k}</span>
              <span className="text-xs font-medium text-foreground text-right">{v}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
