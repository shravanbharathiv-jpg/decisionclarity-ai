import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Users, CreditCard, Brain, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  email: string;
  user_id: string;
  created_at: string;
  subscription_status: string | null;
  subscription_tier: string | null;
  stripe_payment_status: string | null;
  decisions_used_this_month: number | null;
}

interface Decision {
  id: string;
  title: string;
  user_id: string;
  status: string;
  category: string;
  created_at: string;
  is_locked: boolean;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    const checkAdminAndFetchData = async () => {
      if (!user) return;

      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);

      // Fetch all users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersData) {
        setUsers(usersData);
      }

      // Fetch all decisions
      const { data: decisionsData } = await supabase
        .from('decisions')
        .select('id, title, user_id, status, category, created_at, is_locked')
        .order('created_at', { ascending: false })
        .limit(100);

      if (decisionsData) {
        setDecisions(decisionsData);
      }

      setLoading(false);
    };

    checkAdminAndFetchData();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const paidUsers = users.filter(u => 
    u.subscription_status === 'active' || 
    u.stripe_payment_status === 'paid' ||
    u.subscription_tier === 'lifetime' ||
    u.subscription_tier === 'premium'
  );

  const freeUsers = users.filter(u => 
    !u.subscription_status || 
    u.subscription_status === 'inactive'
  );

  const getUserEmail = (userId: string) => {
    const foundUser = users.find(u => u.user_id === userId);
    return foundUser?.email || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
            </div>
          </div>
          <Badge variant="secondary">Admin</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">{users.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Paid Users</CardDescription>
              <CardTitle className="text-3xl text-primary">{paidUsers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Free Users</CardDescription>
              <CardTitle className="text-3xl">{freeUsers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Decisions</CardDescription>
              <CardTitle className="text-3xl">{decisions.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="decisions" className="gap-2">
              <Brain className="h-4 w-4" />
              Decisions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Complete list of all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Decisions Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>{format(new Date(u.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={u.subscription_status === 'active' ? 'default' : 'secondary'}>
                            {u.subscription_status || 'inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.subscription_tier || 'free'}</Badge>
                        </TableCell>
                        <TableCell>{u.decisions_used_this_month || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Paid Users</CardTitle>
                <CardDescription>Users with active subscriptions or lifetime access</CardDescription>
              </CardHeader>
              <CardContent>
                {paidUsers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No paid users yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Subscription Tier</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paidUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.email}</TableCell>
                          <TableCell>{format(new Date(u.created_at), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <Badge className="bg-primary">{u.stripe_payment_status || 'paid'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{u.subscription_tier || 'premium'}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decisions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Decisions</CardTitle>
                <CardDescription>Latest 100 decisions across all users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {decisions.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{d.title}</TableCell>
                        <TableCell className="text-muted-foreground">{getUserEmail(d.user_id)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{d.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={d.is_locked ? 'default' : 'secondary'}>
                            {d.is_locked ? 'Completed' : 'In Progress'}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(d.created_at), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;