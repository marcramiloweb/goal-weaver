import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdmin, useAdminData } from '@/hooks/useAdmin';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Target, 
  Trash2, 
  RefreshCw, 
  Shield,
  Search,
  TrendingUp,
  Pencil,
  Save,
  UserCheck,
  UserX,
  Eye,
  X,
  UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  requester?: { name: string; email: string };
  addressee?: { name: string; email: string };
}

export const Admin: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { users, allGoals, loading, deleteUser, deleteGoal, refresh } = useAdminData();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [searchUsers, setSearchUsers] = useState('');
  const [searchGoals, setSearchGoals] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'user' | 'goal'; id: string; name: string } | null>(null);
  
  // Edit states
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Proxy state
  const [proxyUser, setProxyUser] = useState<any>(null);
  const [proxySheetOpen, setProxySheetOpen] = useState(false);

  // Friendships state
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [loadingFriendships, setLoadingFriendships] = useState(false);

  // Fetch friendships
  const fetchFriendships = async () => {
    setLoadingFriendships(true);
    const { data } = await supabase
      .from('friendships')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      // Get all unique user IDs
      const userIds = [...new Set(data.flatMap(f => [f.requester_id, f.addressee_id]))];
      
      // Fetch profiles for these users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const enrichedFriendships = data.map(f => ({
        ...f,
        requester: profilesMap.get(f.requester_id) || { name: 'Desconocido', email: '' },
        addressee: profilesMap.get(f.addressee_id) || { name: 'Desconocido', email: '' },
      }));

      setFriendships(enrichedFriendships);
    }
    setLoadingFriendships(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchFriendships();
    }
  }, [isAdmin]);

  if (adminLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const filteredGoals = allGoals.filter(g => 
    g.title?.toLowerCase().includes(searchGoals.toLowerCase()) ||
    g.profiles?.name?.toLowerCase().includes(searchGoals.toLowerCase())
  );

  const pendingFriendships = friendships.filter(f => f.status === 'pending');
  const acceptedFriendships = friendships.filter(f => f.status === 'accepted');

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      if (deleteConfirm.type === 'user') {
        await deleteUser(deleteConfirm.id);
        toast({ title: 'Usuario eliminado', description: `Se eliminó a ${deleteConfirm.name}` });
      } else {
        await deleteGoal(deleteConfirm.id);
        toast({ title: 'Meta eliminada', description: `Se eliminó "${deleteConfirm.name}"` });
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'No se pudo eliminar', 
        variant: 'destructive' 
      });
    }
    setDeleteConfirm(null);
  };

  const handleEditUser = (user: any) => {
    setEditingUser({ ...user });
    setEditUserOpen(true);
  };

  const handleEditGoal = (goal: any) => {
    setEditingGoal({ ...goal });
    setEditGoalOpen(true);
  };

  const handleProxyUser = (user: any) => {
    setProxyUser(user);
    setProxySheetOpen(true);
  };

  const saveUser = async () => {
    if (!editingUser) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        name: editingUser.name,
        bio: editingUser.bio,
      })
      .eq('id', editingUser.id);

    setSaving(false);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' });
    } else {
      toast({ title: 'Usuario actualizado' });
      setEditUserOpen(false);
      refresh();
    }
  };

  const saveGoal = async () => {
    if (!editingGoal) return;
    setSaving(true);

    const { error } = await supabase
      .from('goals')
      .update({
        title: editingGoal.title,
        description: editingGoal.description,
        status: editingGoal.status,
        target_value: editingGoal.target_value,
        current_value: editingGoal.current_value,
        priority: editingGoal.priority,
      })
      .eq('id', editingGoal.id);

    setSaving(false);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' });
    } else {
      toast({ title: 'Meta actualizada' });
      setEditGoalOpen(false);
      refresh();
    }
  };

  // Friendship actions
  const acceptFriendship = async (id: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo aceptar', variant: 'destructive' });
    } else {
      toast({ title: 'Solicitud aceptada' });
      fetchFriendships();
    }
  };

  const rejectFriendship = async (id: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo rechazar', variant: 'destructive' });
    } else {
      toast({ title: 'Solicitud rechazada' });
      fetchFriendships();
    }
  };

  const deleteFriendship = async (id: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    } else {
      toast({ title: 'Amistad eliminada' });
      fetchFriendships();
    }
  };

  const totalGoals = allGoals.length;
  const completedGoals = allGoals.filter(g => g.status === 'completed').length;
  const activeUsers = users.filter(u => u.goals_count > 0).length;

  return (
    <AppLayout>
      <div className="p-4 pb-24 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Panel Admin</h1>
            <p className="text-sm text-muted-foreground">Gestión de usuarios y metas</p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="ml-auto"
            onClick={() => {
              refresh();
              fetchFriendships();
            }}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Usuarios</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-5 w-5 mx-auto text-accent mb-1" />
              <div className="text-2xl font-bold">{totalGoals}</div>
              <p className="text-xs text-muted-foreground">Metas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-green-500 mb-1" />
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UserPlus className="h-5 w-5 mx-auto text-orange-500 mb-1" />
              <div className="text-2xl font-bold">{pendingFriendships.length}</div>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="h-4 w-4 mr-2" />
              Metas
            </TabsTrigger>
            <TabsTrigger value="friendships">
              <UserPlus className="h-4 w-4 mr-2" />
              Solicitudes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="text-center">Metas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name || 'Sin nombre'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {user.completed_count}/{user.goals_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleProxyUser(user)}
                            title="Ver como usuario"
                          >
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirm({ 
                              type: 'user', 
                              id: user.id, 
                              name: user.name || user.email 
                            })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar metas..."
                value={searchGoals}
                onChange={(e) => setSearchGoals(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meta</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGoals.map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{goal.icon}</span>
                          <span className="font-medium truncate max-w-[120px]">{goal.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground truncate max-w-[100px]">
                          {goal.profiles?.name || 'Anónimo'}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={goal.status === 'completed' ? 'default' : 'secondary'}
                          className={goal.status === 'completed' ? 'bg-green-500' : ''}
                        >
                          {goal.status === 'completed' ? '✓' : goal.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditGoal(goal)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirm({ 
                              type: 'goal', 
                              id: goal.id, 
                              name: goal.title 
                            })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredGoals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No se encontraron metas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="friendships" className="mt-4 space-y-6">
            {/* Pending Requests */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-orange-500" />
                Solicitudes Pendientes ({pendingFriendships.length})
              </h3>
              {pendingFriendships.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No hay solicitudes pendientes
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {pendingFriendships.map((friendship) => (
                    <Card key={friendship.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{friendship.requester?.name}</span>
                            <span className="text-muted-foreground"> → </span>
                            <span className="font-medium">{friendship.addressee?.name}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(friendship.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => acceptFriendship(friendship.id)}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Aceptar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => rejectFriendship(friendship.id)}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Accepted Friendships */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                Amistades Activas ({acceptedFriendships.length})
              </h3>
              {acceptedFriendships.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No hay amistades activas
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario 1</TableHead>
                        <TableHead>Usuario 2</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {acceptedFriendships.map((friendship) => (
                        <TableRow key={friendship.id}>
                          <TableCell className="font-medium">
                            {friendship.requester?.name}
                          </TableCell>
                          <TableCell className="font-medium">
                            {friendship.addressee?.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(friendship.created_at), 'dd MMM yyyy', { locale: es })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteFriendship(friendship.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {deleteConfirm?.type === 'user' ? 'usuario' : 'meta'}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === 'user' 
                ? `Se eliminará permanentemente a "${deleteConfirm.name}" y todos sus datos.`
                : `Se eliminará permanentemente la meta "${deleteConfirm?.name}".`}
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Sheet */}
      <Sheet open={editUserOpen} onOpenChange={setEditUserOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar Usuario</SheetTitle>
          </SheetHeader>
          {editingUser && (
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="user-name">Nombre</Label>
                <Input
                  id="user-name"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  value={editingUser.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="user-bio">Bio</Label>
                <Input
                  id="user-bio"
                  value={editingUser.bio || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, bio: e.target.value })}
                />
              </div>
              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">Estadísticas</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted rounded">
                    <span className="text-muted-foreground">Metas:</span> {editingUser.goals_count}
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <span className="text-muted-foreground">Completadas:</span> {editingUser.completed_count}
                  </div>
                </div>
              </div>
              <Button onClick={saveUser} disabled={saving} className="w-full">
                {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar cambios
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Goal Sheet */}
      <Sheet open={editGoalOpen} onOpenChange={setEditGoalOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar Meta</SheetTitle>
          </SheetHeader>
          {editingGoal && (
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="goal-title">Título</Label>
                <Input
                  id="goal-title"
                  value={editingGoal.title || ''}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="goal-description">Descripción</Label>
                <Input
                  id="goal-description"
                  value={editingGoal.description || ''}
                  onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="goal-status">Estado</Label>
                <Select
                  value={editingGoal.status}
                  onValueChange={(value) => setEditingGoal({ ...editingGoal, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activa</SelectItem>
                    <SelectItem value="paused">Pausada</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="abandoned">Abandonada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="goal-priority">Prioridad</Label>
                <Select
                  value={editingGoal.priority}
                  onValueChange={(value) => setEditingGoal({ ...editingGoal, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="goal-current">Valor actual</Label>
                  <Input
                    id="goal-current"
                    type="number"
                    value={editingGoal.current_value || 0}
                    onChange={(e) => setEditingGoal({ ...editingGoal, current_value: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="goal-target">Valor objetivo</Label>
                  <Input
                    id="goal-target"
                    type="number"
                    value={editingGoal.target_value || 100}
                    onChange={(e) => setEditingGoal({ ...editingGoal, target_value: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Usuario: {editingGoal.profiles?.name || 'Anónimo'}
                </p>
              </div>
              <Button onClick={saveGoal} disabled={saving} className="w-full">
                {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar cambios
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Proxy User Sheet */}
      <Sheet open={proxySheetOpen} onOpenChange={setProxySheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              Ver como Usuario
            </SheetTitle>
          </SheetHeader>
          {proxyUser && (
            <div className="mt-6 space-y-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl">{proxyUser.name?.[0]?.toUpperCase() || '?'}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{proxyUser.name || 'Sin nombre'}</p>
                      <p className="text-sm text-muted-foreground">{proxyUser.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Estadísticas del Usuario</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-primary">{proxyUser.goals_count}</div>
                      <p className="text-xs text-muted-foreground">Total Metas</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-green-500">{proxyUser.completed_count}</div>
                      <p className="text-xs text-muted-foreground">Completadas</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Metas del Usuario</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allGoals
                    .filter(g => g.user_id === proxyUser.id)
                    .map((goal) => (
                      <Card key={goal.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEditGoal(goal)}>
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{goal.icon}</span>
                            <span className="font-medium text-sm">{goal.title}</span>
                          </div>
                          <Badge 
                            variant={goal.status === 'completed' ? 'default' : 'secondary'}
                            className={goal.status === 'completed' ? 'bg-green-500' : ''}
                          >
                            {goal.status === 'completed' ? '✓' : goal.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  {allGoals.filter(g => g.user_id === proxyUser.id).length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Este usuario no tiene metas
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setProxySheetOpen(false);
                    handleEditUser(proxyUser);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
};

export default Admin;
