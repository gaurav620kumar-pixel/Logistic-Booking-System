import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, CheckCircle2, ThumbsUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function EquipmentRequestsPage() {
  const { user } = useAuth();
  const { equipmentRequests, updateEquipmentRequest, users } = useApp();
  if (!user) return null;

  // ✅ FIX: user.id → user.id
  const requests = equipmentRequests.filter(
  r => r.staffId === user.id
);

  const handleAcknowledge = (id) => {
    updateEquipmentRequest(id, 'acknowledged', 'Will set up 30 mins before.');
    toast.success('Request acknowledged. Faculty has been notified.');
  };

  const handleReady = (id) => {
    updateEquipmentRequest(id, 'ready');
    toast.success('Marked as ready! Faculty has been notified.');
  };

  const statusVariant = (s) => s === 'ready' ? 'default' : s === 'acknowledged' ? 'secondary' : 'outline';

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Equipment Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage faculty equipment & setup requests</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Pending', count: requests.filter(r => r.status === 'pending').length, color: 'text-warning' },
          { label: 'Acknowledged', count: requests.filter(r => r.status === 'acknowledged').length, color: 'text-primary' },
          { label: 'Ready', count: requests.filter(r => r.status === 'ready').length, color: 'text-success' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
            <span className={`font-bold ${s.color}`}>{s.count}</span>
            <span className="text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16">
          <Wrench className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No equipment requests assigned to you.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => {
            // ✅ FIX: u.id → u.id
            const faculty = users.find(u => u.id === r.facultyId);

            return (
              <Card
                // ✅ FIX: r.id → r.id
                key={r.id}
                className={`shadow-card ${r.status === 'pending' ? 'border-l-4 border-l-warning' : r.status === 'acknowledged' ? 'border-l-4 border-l-primary' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold text-foreground">{r.facultyName}</p>
                        <Badge variant={statusVariant(r.status)} className="text-[10px] capitalize">{r.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.venueName} • {r.date} • {r.timeSlot}</p>
                      {faculty && <p className="text-xs text-muted-foreground">📞 {faculty.phone || faculty.email}</p>}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {r.items.map(item => (
                          <span key={item} className="text-[10px] px-1.5 py-0.5 bg-accent text-accent-foreground rounded font-medium">{item}</span>
                        ))}
                      </div>
                      {r.notes && <p className="text-xs text-muted-foreground mt-1.5 italic">{r.notes}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {r.status === 'pending' && (
                        <Button size="sm" onClick={() => handleAcknowledge(r.id)} className="bg-primary text-primary-foreground">
                          <ThumbsUp className="h-3.5 w-3.5 mr-1" /> Acknowledge
                        </Button>
                      )}
                      {r.status === 'acknowledged' && (
                        <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => handleReady(r.id)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Ready
                        </Button>
                      )}
                      {r.status === 'ready' && (
                        <div className="flex items-center gap-1 text-success text-xs font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}