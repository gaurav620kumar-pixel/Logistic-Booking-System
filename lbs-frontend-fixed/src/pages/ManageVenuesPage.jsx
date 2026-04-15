import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Plus, Pencil, Trash2, X, Check, Wrench, Users, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const emptyForm = {
  name: '', type: 'classroom', capacity: '', building: '', floor: '',
  status: 'available', equipment: '', assignedStaff: '',
};

const statusVariant = (s) => s === 'available' ? 'default' : s === 'maintenance' ? 'secondary' : 'destructive';

export default function ManageVenuesPage() {
  const { venues, users, addVenue, updateVenue, deleteVenue } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const staffList = users.filter(u => u.role === 'staff');

  const openAdd = () => { setEditingVenue(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (v) => {
    setEditingVenue(v);
    setForm({
      name: v.name, type: v.type, capacity: String(v.capacity),
      building: v.building, floor: String(v.floor),
      status: v.status, equipment: (v.equipment || []).join(', '),
      assignedStaff: v.assignedStaff || '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.building.trim() || !form.capacity) {
      toast.error('Name, building, and capacity are required.'); return;
    }
    const data = {
      name: form.name.trim(),
      type: form.type,
      capacity: parseInt(form.capacity) || 0,
      building: form.building.trim(),
      floor: parseInt(form.floor) || 0,
      status: form.status,
      equipment: form.equipment.split(',').map(s => s.trim()).filter(Boolean),
      assignedStaff: form.assignedStaff,
    };
    if (editingVenue) {
      updateVenue(editingVenue.id, data);
      toast.success('Venue updated successfully.');
    } else {
      addVenue(data);
      toast.success('Venue added successfully.');
    }
    setShowModal(false);
  };

  const handleDelete = (v) => {
    if (!window.confirm(`Delete ${v.name}? This cannot be undone.`)) return;
    deleteVenue(v.id);
    toast.info(`${v.name} has been deleted.`);
  };

  const handleStatusChange = (v, newStatus) => {
    updateVenue(v.id, { status: newStatus });
    toast.success(`${v.name} status updated to ${newStatus}.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Manage Venues</h1>
          <p className="text-sm text-muted-foreground mt-1">Add, edit & configure venue specifications</p>
        </div>
        <Button onClick={openAdd} className="gradient-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Add Venue
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Available', count: venues.filter(v=>v.status==='available').length, color: 'text-success' },
          { label: 'Maintenance', count: venues.filter(v=>v.status==='maintenance').length, color: 'text-warning' },
          { label: 'Occupied', count: venues.filter(v=>v.status==='occupied').length, color: 'text-destructive' },
        ].map(s => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-heading font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {venues.map(v => {
          const assignedStaff = users.find(u => u.id === v.assignedStaff);
          return (
            <Card key={v.id} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm text-foreground">{v.name}</p>
                      <Badge variant={statusVariant(v.status)} className="capitalize text-[10px]">
                        {v.status}
                      </Badge>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{v.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {v.building} • Floor {v.floor}
                      <span className="mx-1">•</span>
                      <Users className="h-3 w-3 inline mr-1" />
                      {v.capacity} seats
                    </p>
                    {assignedStaff && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <Wrench className="h-3 w-3 inline mr-1" />
                        Staff: {assignedStaff.name}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(v.equipment || []).map(eq => (
                        <span key={eq} className="text-[10px] px-1.5 py-0.5 bg-accent text-accent-foreground rounded">{eq}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {/* Status quick-change */}
                    <select
                      value={v.status}
                      onChange={e => handleStatusChange(v, e.target.value)}
                      className="text-xs rounded border border-border bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="occupied">Occupied</option>
                    </select>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10" onClick={() => openEdit(v)}>
                        <Pencil className="h-3.5 w-3.5 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10" onClick={() => handleDelete(v)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-heading font-bold text-foreground">{editingVenue ? 'Edit Venue' : 'Add New Venue'}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Venue Name *</label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Room 101" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Type *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="classroom">Classroom</option>
                    <option value="lab">Lab</option>
                    <option value="hall">Hall</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Building *</label>
                  <Input value={form.building} onChange={e => setForm(f => ({ ...f, building: e.target.value }))} placeholder="Main Block" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Floor</label>
                  <Input type="number" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} placeholder="1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Capacity (seats) *</label>
                  <Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="60" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="occupied">Occupied</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Equipment (comma separated)</label>
                <Input value={form.equipment} onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))} placeholder="Projector, Whiteboard, AC, Sound System" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Assigned Staff</label>
                <select value={form.assignedStaff} onChange={e => setForm(f => ({ ...f, assignedStaff: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">-- No staff assigned --</option>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.department})</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="flex-1 gradient-primary text-primary-foreground" onClick={handleSave}>
                <Check className="mr-2 h-4 w-4" />{editingVenue ? 'Update Venue' : 'Add Venue'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
