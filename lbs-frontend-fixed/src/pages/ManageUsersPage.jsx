import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, GraduationCap, Wrench, Shield, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const roleIcon = { faculty: GraduationCap, staff: Wrench, admin: Shield };
const roleColor = {
  faculty: 'bg-primary/10 text-primary border-primary/20',
  staff: 'bg-warning/10 text-warning border-warning/20',
  admin: 'bg-success/10 text-success border-success/20',
};

const emptyForm = { name: '', email: '', phone: '', department: '', role: 'faculty' };

export default function ManageUsersPage() {
  const { users, addUser, updateUser, deleteUser } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.department.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openAdd = () => { setEditingUser(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (u) => { setEditingUser(u); setForm({ name: u.name, email: u.email, phone: u.phone || '', department: u.department, role: u.role }); setShowModal(true); };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim() || !form.department.trim()) {
      toast.error('Name, email, and department are required.'); return;
    }
    if (editingUser) {
      updateUser(editingUser.id, form);
      toast.success('User updated successfully.');
    } else {
      addUser(form);
      toast.success('User added successfully.');
    }
    setShowModal(false);
  };

  const handleDelete = (u) => {
    if (!window.confirm(`Remove ${u.name} from the system?`)) return;
    deleteUser(u.id);
    toast.info(`${u.name} has been removed.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Manage Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Faculty, staff & admin portfolios</p>
        </div>
        <Button onClick={openAdd} className="gradient-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search by name, email, department..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
        <div className="flex gap-2">
          {['all', 'faculty', 'staff', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${roleFilter === r ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-accent'}`}>
              {r === 'all' ? `All (${users.length})` : `${r.charAt(0).toUpperCase() + r.slice(1)} (${users.filter(u => u.role === r).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[{ label: 'Faculty', count: users.filter(u => u.role === 'faculty').length, color: 'text-primary' },
          { label: 'Staff', count: users.filter(u => u.role === 'staff').length, color: 'text-warning' },
          { label: 'Admin', count: users.filter(u => u.role === 'admin').length, color: 'text-success' }].map(s => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-heading font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(u => {
          const Icon = roleIcon[u.role] || Users;
          return (
            <Card key={u.id} className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${roleColor[u.role]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.department}</p>
                    {u.phone && <p className="text-xs text-muted-foreground">{u.phone}</p>}
                    <Badge variant="secondary" className="mt-2 text-[10px] capitalize">{u.role}</Badge>
                  </div>
                  {/* Action buttons */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10" onClick={() => openEdit(u)} title="Edit user">
                      <Pencil className="h-3.5 w-3.5 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10" onClick={() => handleDelete(u)} title="Remove user">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No users found.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-heading font-bold text-foreground">{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Full Name *</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dr. John Doe" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Email *</label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@college.edu" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Department *</label>
                <Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Computer Science" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Phone</label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Role *</label>
                <div className="flex gap-2">
                  {['faculty', 'staff', 'admin'].map(r => (
                    <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${form.role === r ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-accent'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="flex-1 gradient-primary text-primary-foreground" onClick={handleSave}>
                <Check className="mr-2 h-4 w-4" />{editingUser ? 'Update User' : 'Add User'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
