import React, { useState, useEffect } from 'react';
import { userService, UserProfile, adminOperations } from '@/lib/firebaseService';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {
  Search,
  Users,
  Globe,
  BookOpen,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  ShieldCheck,
  X,
  Plus,
  Mail,
  Phone
} from 'lucide-react';

// User creation form interface
interface CreateUserForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  age: string;
  country: string;
  role: 'user' | 'admin' | 'editor';
  accountType: 'student' | 'adult';
}

const categories = ["Programming", "Data Science", "AI/ML", "Design", "Business", "Marketing"];

export default function Students() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [accountTypeFilter, setAccountTypeFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const { toast } = useToast();

  // Create user form state
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    country: '',
    role: 'user',
    accountType: 'student'
  });

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    studentUsers: 0,
    adminUsers: 0,
    countryDistribution: [] as Array<{ country: string; count: number }>,
    roleDistribution: [] as Array<{ role: string; count: number }>
  });

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await userService.getAll([], 'createdAt', 'desc');
      setUsers(result.data);
      calculateAnalytics(result.data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (userData: UserProfile[]) => {
    const totalUsers = userData.length;
    const activeUsers = userData.filter(u => u.isActive).length;
    const studentUsers = userData.filter(u => u.accountType === 'student').length;
    const adminUsers = userData.filter(u => u.role === 'admin').length;

    // Country distribution
    const countryMap = new Map();
    userData.forEach(user => {
      const country = user.country || 'Unknown';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });
    const countryDistribution = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Role distribution
    const roleMap = new Map();
    userData.forEach(user => {
      const role = user.role || 'user';
      roleMap.set(role, (roleMap.get(role) || 0) + 1);
    });
    const roleDistribution = Array.from(roleMap.entries())
      .map(([role, count]) => ({ role, count }));

    setAnalyticsData({
      totalUsers,
      activeUsers,
      studentUsers,
      adminUsers,
      countryDistribution,
      roleDistribution
    });
  };

  // Helper to get ID token for admin API calls
  const getIdToken = async (): Promise<string> => {
    const current = auth.currentUser;
    if (!current) throw new Error('Not authenticated');
    return await current.getIdToken();
  };

  // CRUD Operations (secured via Admin SDK endpoints)
  const handleCreateUser = async () => {
    try {
      // Validate form
      if (!createForm.email || !createForm.password || !createForm.firstName || !createForm.lastName) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      const idToken = await getIdToken();
      const resp = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: createForm.email,
          password: createForm.password,
          role: createForm.role,
          accountType: createForm.accountType,
          displayName: `${createForm.firstName} ${createForm.lastName}`.trim(),
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({} as any));
        throw new Error(err?.error || 'Failed to create user');
      }

      toast({
        title: "Success",
        description: "User created successfully.",
      });

      // Reset form and close dialog
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        age: '',
        country: '',
        role: 'user',
        accountType: 'student'
      });
      setIsCreateDialogOpen(false);
      
      // Reload users
      await loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser?.id) return;

    try {
      setLoading(true);
      
      const idToken = await getIdToken();
      const resp = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          updates: editForm
        }),
      });
      
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({} as any));
        throw new Error(err?.error || 'Failed to update user');
      }
      
      toast({
        title: "Success",
        description: "User updated successfully.",
      });
      
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setEditForm({});
      await loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      
      const idToken = await getIdToken();
      const resp = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({} as any));
        throw new Error(err?.error || 'Failed to delete user');
      }
      
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
      
      await loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'editor') => {
    try {
      const idToken = await getIdToken();
      const resp = await fetch('/api/admin/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ userId, role: newRole }),
      });
      
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({} as any));
        throw new Error(err?.error || 'Failed to update role');
      }
      
      toast({
        title: "Success",
        description: "User role updated successfully.",
      });
      await loadUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const handleActivateUser = async (userId: string, activate: boolean) => {
    try {
      if (activate) {
        await userService.activateUser(userId);
      } else {
        await userService.deactivateUser(userId);
      }
      
      toast({
        title: "Success",
        description: `User ${activate ? 'activated' : 'deactivated'} successfully.`,
      });
      
      await loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.firstName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (user.lastName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (user.email || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesAccountType = accountTypeFilter === "all" || user.accountType === accountTypeFilter;
    
    return matchesSearch && matchesRole && matchesAccountType;
  });

  const openEditDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      country: user.country,
      bio: user.bio,
      role: user.role,
      accountType: user.accountType
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Comprehensive user analytics and management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            {analyticsData.totalUsers} Total Users
          </Badge>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active users in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.studentUsers}</div>
            <p className="text-xs text-muted-foreground">Student accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.adminUsers}</div>
            <p className="text-xs text-muted-foreground">Admin accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Country Distribution</CardTitle>
            <CardDescription>Users by country</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 overflow-y-auto">
              <div className="space-y-3">
                {analyticsData.countryDistribution.map((country, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{country.country}</p>
                        <p className="text-sm text-muted-foreground">{country.count} user{country.count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(country.count / Math.max(...analyticsData.countryDistribution.map(c => c.count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {((country.count / analyticsData.totalUsers) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
            <CardDescription>Users by role type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.roleDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="role" className="text-muted-foreground" fontSize={12} />
                  <YAxis className="text-muted-foreground" fontSize={12} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Account Types</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="adult">Adult</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users Data</CardTitle>
          <CardDescription>
            Showing {filteredUsers.length} of {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrollments</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-green-600" />
                          <span className="text-sm">{user.phone || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-muted-foreground" />
                          <span>{user.country || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.accountType === 'student' ? 'secondary' : 'outline'}>
                          {user.accountType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(newRole: 'user' | 'admin' | 'editor') => handleRoleChange(user.id!, newRole)}
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.isActive ? 'default' : 'secondary'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivateUser(user.id!, !user.isActive)}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.enrollments?.length || 0} courses
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <UITooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openViewDialog(user)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <UITooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(user)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit User</p>
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {user.firstName} {user.lastName}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id!)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account with role and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={createForm.firstName}
                onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={createForm.lastName}
                onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={createForm.age}
                onChange={(e) => setCreateForm({ ...createForm, age: e.target.value })}
                placeholder="Enter age"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={createForm.country}
                onChange={(e) => setCreateForm({ ...createForm, country: e.target.value })}
                placeholder="Enter country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={createForm.role} onValueChange={(value: 'user' | 'admin' | 'editor') => setCreateForm({ ...createForm, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select value={createForm.accountType} onValueChange={(value: 'student' | 'adult') => setCreateForm({ ...createForm, accountType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="adult">Adult</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editFirstName">First Name</Label>
              <Input
                id="editFirstName"
                value={editForm.firstName || ''}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLastName">Last Name</Label>
              <Input
                id="editLastName"
                value={editForm.lastName || ''}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhone">Phone</Label>
              <Input
                id="editPhone"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCountry">Country</Label>
              <Input
                id="editCountry"
                value={editForm.country || ''}
                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                placeholder="Enter country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRole">Role</Label>
              <Select value={editForm.role} onValueChange={(value: 'user' | 'admin' | 'editor') => setEditForm({ ...editForm, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="editBio">Bio</Label>
              <Textarea
                id="editBio"
                value={editForm.bio || ''}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Enter user bio"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={loading}>
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete user profile and activity information.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                    <p className="text-sm">{selectedUser.firstName} {selectedUser.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="text-sm">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                    <p className="text-sm">{selectedUser.age} years old</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                    <p className="text-sm">{selectedUser.country || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
                    <Badge variant={selectedUser.accountType === 'student' ? 'secondary' : 'outline'}>
                      {selectedUser.accountType}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Account Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                    <Badge variant="outline">{selectedUser.role}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant={selectedUser.isActive ? 'default' : 'secondary'}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email Verified</Label>
                    <Badge variant={selectedUser.isEmailVerified ? 'default' : 'secondary'}>
                      {selectedUser.isEmailVerified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                    <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Course Enrollments */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Course Enrollments</h3>
                {selectedUser.enrollments && selectedUser.enrollments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.enrollments.map((enrollment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Course ID: {enrollment.courseId}</p>
                          <p className="text-sm text-muted-foreground">
                            Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                            {enrollment.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            Progress: {enrollment.progress}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No course enrollments found.</p>
                )}
              </div>

              {/* Bio */}
              {selectedUser.bio && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Bio</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.bio}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
