import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusVariant = (s) => s === 'available' ? 'default' : s === 'maintenance' ? 'secondary' : 'destructive';

export default function VenuesPage() {
  const { venues } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = venues.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.building.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === 'all' || v.type === typeFilter;
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Venues</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse classrooms, labs & halls</p>
        </div>
        {user?.role === 'faculty' && (
          <Button className="gradient-primary text-primary-foreground" size="sm" onClick={() => navigate('/book')}>
            + Book a Venue
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search venues..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="classroom">Classroom</SelectItem>
            <SelectItem value="lab">Lab</SelectItem>
            <SelectItem value="hall">Hall</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(v => (
          <Card key={v.id} className="shadow-card hover:shadow-card-hover transition-all group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-heading font-semibold text-foreground">{v.name}</h3>
                  <p className="text-xs text-muted-foreground">{v.building} • Floor {v.floor}</p>
                </div>
                <Badge variant={statusVariant(v.status)} className="capitalize">{v.status}</Badge>
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />{v.capacity} seats
                </span>
                <span className="flex items-center gap-1 capitalize">
                  <MapPin className="h-3.5 w-3.5" />{v.type}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {v.equipment.map(eq => (
                  <span key={eq} className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[11px]">
                    {eq}
                  </span>
                ))}
              </div>

              {user?.role === 'faculty' && v.status === 'available' && (
                <Button size="sm" variant="outline" className="w-full mt-1 text-xs" onClick={() => navigate('/book')}>
                  Book This Venue
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No venues match your filters.</p>
        </div>
      )}
    </div>
  );
}