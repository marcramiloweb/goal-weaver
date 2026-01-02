import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin, useAdminData } from '@/hooks/useAdmin';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Target, 
  Trash2, 
  RefreshCw, 
  Shield,
  Search,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const Admin: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { users, allGoals, loading, deleteUser, deleteGoal, refresh } = useAdminData();
  const { toast } = useToast();
  
  const [searchUsers, setSearchUsers] = useState('');
  const [searchGoals, setSearchGoals] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'user' | 'goal'; id: string; name: string } | null>(null);

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
            onClick={() => refresh()}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
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
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Usuarios ({users.length})
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="h-4 w-4 mr-2" />
              Metas ({totalGoals})
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
    </AppLayout>
  );
};

export default Admin;
