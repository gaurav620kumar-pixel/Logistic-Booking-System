import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, GraduationCap, Wrench, Shield } from 'lucide-react';

const roleCards = [
  { role: 'faculty', label: 'Faculty / Staff', description: 'Book venues, manage classes & seminars', icon: GraduationCap },
  { role: 'staff',   label: 'Support Staff',   description: 'Manage equipment & venue readiness',    icon: Wrench },
  { role: 'admin',   label: 'Admin / TT In-charge', description: 'Full system management & oversight', icon: Shield },
];

export default function LoginPage() {
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('quick');

  const handleQuickLogin = (role) => {
    loginAs(role);
    navigate('/dashboard');
  };

  // ✅ FIXED: async/await so login promise is properly awaited
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Try quick login for demo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary mb-4 shadow-lg">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Logistics Booking System
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Classroom, Lab & Hall Management Portal
          </p>
        </div>

        {mode === 'quick' ? (
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground mb-2">Quick login as:</p>
            <div className="grid gap-3">
              {roleCards.map(({ role, label, description, icon: Icon }) => (
                <Card
                  key={role}
                  className="cursor-pointer border-2 border-transparent hover:border-primary/30 hover:shadow-card-hover transition-all"
                  onClick={() => handleQuickLogin(role)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-4">
              <button
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setMode('email')}
              >
                or sign in with email →
              </button>
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading">Sign In</CardTitle>
              <CardDescription>Enter your college email and password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="name@college.edu"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Default password for all accounts: <strong>college@123</strong>
              </p>
              <div className="text-center mt-2">
                <button
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => { setMode('quick'); setError(''); }}
                >
                  ← back to quick login
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-[11px] text-muted-foreground/60 mt-6">
          JIMS Logistics Booking System
        </p>
      </div>
    </div>
  );
}
