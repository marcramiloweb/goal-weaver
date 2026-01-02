import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGoals, useStreak } from '@/hooks/useGoals';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
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
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  LogOut, 
  Settings, 
  Trophy,
  Flame,
  Target,
  Bell,
  ChevronRight,
  Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { goals, completedGoals } = useGoals();
  const { streak } = useStreak();
  const { toast } = useToast();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile({ name: editName });
    setSaving(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Perfil actualizado',
        description: 'Tus cambios han sido guardados',
      });
      setShowEditProfile(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  // Simple achievements/badges based on data
  const achievements = [
    {
      id: 'first_goal',
      name: 'Primera meta',
      icon: '🎯',
      description: 'Creaste tu primera meta',
      earned: goals.length > 0,
    },
    {
      id: 'five_goals',
      name: 'Ambicioso',
      icon: '🔥',
      description: 'Tienes 5 o más metas',
      earned: goals.length >= 5,
    },
    {
      id: 'first_complete',
      name: 'Primer logro',
      icon: '🏆',
      description: 'Completaste tu primera meta',
      earned: completedGoals.length > 0,
    },
    {
      id: 'streak_7',
      name: 'Constante',
      icon: '⚡',
      description: 'Racha de 7 días',
      earned: streak.longest >= 7,
    },
    {
      id: 'streak_30',
      name: 'Imparable',
      icon: '💪',
      description: 'Racha de 30 días',
      earned: streak.longest >= 30,
    },
  ];

  const earnedBadges = achievements.filter(a => a.earned);

  return (
    <AppLayout>
      <div className="px-4 pt-12 pb-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center text-4xl mb-4 shadow-glow">
            {profile?.name?.charAt(0)?.toUpperCase() || '👤'}
          </div>
          <h1 className="text-2xl font-bold">
            {profile?.name || 'Tu perfil'}
          </h1>
          <p className="text-muted-foreground">{user?.email}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => {
              setEditName(profile?.name || '');
              setShowEditProfile(true);
            }}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar perfil
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="card-elevated border-0">
            <CardContent className="p-4 text-center">
              <Target className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-xl font-bold">{goals.length}</div>
              <p className="text-xs text-muted-foreground">Metas</p>
            </CardContent>
          </Card>

          <Card className="card-elevated border-0">
            <CardContent className="p-4 text-center">
              <Trophy className="h-5 w-5 mx-auto text-accent mb-1" />
              <div className="text-xl font-bold">{completedGoals.length}</div>
              <p className="text-xs text-muted-foreground">Logradas</p>
            </CardContent>
          </Card>

          <Card className="card-elevated border-0">
            <CardContent className="p-4 text-center">
              <Flame className="h-5 w-5 mx-auto text-accent mb-1" />
              <div className="text-xl font-bold">{streak.longest}</div>
              <p className="text-xs text-muted-foreground">Mejor racha</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <section>
          <h2 className="font-semibold text-lg mb-3">
            Logros ({earnedBadges.length}/{achievements.length})
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  'aspect-square rounded-xl flex items-center justify-center text-2xl transition-all',
                  achievement.earned 
                    ? 'bg-accent/20 shadow-sm' 
                    : 'bg-muted/50 opacity-40 grayscale'
                )}
                title={achievement.name}
              >
                {achievement.icon}
              </div>
            ))}
          </div>
          {earnedBadges.length > 0 && (
            <div className="mt-3 p-3 bg-muted/30 rounded-xl">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {earnedBadges[earnedBadges.length - 1].name}:
                </span>{' '}
                {earnedBadges[earnedBadges.length - 1].description}
              </p>
            </div>
          )}
        </section>

        {/* Settings */}
        <section>
          <h2 className="font-semibold text-lg mb-3">Ajustes</h2>
          <div className="space-y-2">
            <button 
              className="w-full flex items-center gap-3 p-4 bg-card rounded-xl hover:bg-muted/50 transition-colors"
              onClick={() => {
                toast({
                  title: 'Próximamente',
                  description: 'Las notificaciones estarán disponibles pronto',
                });
              }}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-left">Notificaciones</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button 
              className="w-full flex items-center gap-3 p-4 bg-card rounded-xl hover:bg-muted/50 transition-colors text-destructive"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut className="h-5 w-5" />
              <span className="flex-1 text-left">Cerrar sesión</span>
            </button>
          </div>
        </section>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Propósitos 2026 v1.0</p>
          <p className="mt-1">Hecho con ❤️ para ayudarte a lograr tus metas</p>
        </div>
      </div>

      {/* Edit Profile Sheet */}
      <Sheet open={showEditProfile} onOpenChange={setShowEditProfile}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Editar perfil</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Tu nombre"
                className="mt-1"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logout Confirmation */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Podrás volver a iniciar sesión cuando quieras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Profile;
