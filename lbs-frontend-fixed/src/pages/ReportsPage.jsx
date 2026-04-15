
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
export default function ReportsPage() {
  const { bookings: mockBookings, venues: mockVenues } = useApp();
  const venueUsage = mockVenues.map(v => ({
    ...v,
    bookingCount: mockBookings.filter(b => b.venueId === v.id && b.status === 'approved').length,
  })).sort((a, b) => b.bookingCount - a.bookingCount);

  const statusBreakdown = {
    approved: mockBookings.filter(b => b.status === 'approved').length,
    pending: mockBookings.filter(b => b.status === 'pending').length,
    rejected: mockBookings.filter(b => b.status === 'rejected').length,
    cancelled: mockBookings.filter(b => b.status === 'cancelled').length,
  };

  const totalBookings = mockBookings.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Venue utilization and booking insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" /> Booking Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="capitalize text-sm text-foreground">{status}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          status === 'approved' ? 'bg-success' : status === 'pending' ? 'bg-warning' : status === 'rejected' ? 'bg-destructive' : 'bg-muted-foreground'
                        }`}
                        style={{ width: `${totalBookings ? (count / totalBookings) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground ml-3 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Venue Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {venueUsage.map(v => (
                <div key={v.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm text-foreground truncate max-w-[120px]">{v.name}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${v.bookingCount ? (v.bookingCount / Math.max(...venueUsage.map(x => x.bookingCount), 1)) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground ml-3 w-8 text-right">{v.bookingCount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-heading font-bold text-foreground">{mockBookings.length}</p>
              <p className="text-xs text-muted-foreground">Total Bookings</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-heading font-bold text-foreground">{mockVenues.length}</p>
              <p className="text-xs text-muted-foreground">Total Venues</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-heading font-bold text-success">{statusBreakdown.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-heading font-bold text-warning">{statusBreakdown.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
