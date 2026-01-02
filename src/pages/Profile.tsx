import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGoals, useStreak } from '@/hooks/useGoals';
import { useSocial } from '@/hooks/useSocial';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  Edit,
  Camera,
  Image as ImageIcon,
  Upload,
  BellRing
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { LEAGUE_TIERS } from '@/types/social';
import { 
  enableNotifications, 
  hasNotificationPermission, 
  notificationsSupported 
} from '@/utils/notifications';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { goals, completedGoals } = useGoals();
  const { streak } = useStreak();
  const { preferences, userPoints, updatePreferences } = useSocial();
  const { toast } = useToast();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Settings state - sync with preferences when they load
  const [achievementsCount, setAchievementsCount] = useState(3);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Sync state when preferences load
  React.useEffect(() => {
    if (preferences) {
      setAchievementsCount(preferences.achievements_display_count || 3);
      setNotificationsEnabled(preferences.notifications_enabled ?? true);
    }
  }, [preferences]);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile({ 
      name: editName,
    });
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

  const handleSaveSettings = async () => {
    setSaving(true);
    
    // Update local storage for notifications
    if (notificationsEnabled) {
      const { setNotificationsEnabled } = await import('@/utils/notifications');
      setNotificationsEnabled(true);
    } else {
      const { disableNotifications } = await import('@/utils/notifications');
      disableNotifications();
    }
    
    const { error } = await updatePreferences({
      achievements_display_count: achievementsCount,
      notifications_enabled: notificationsEnabled,
    });
    setSaving(false);

    if (!error) {
      toast({
        title: 'Ajustes guardados',
        description: 'Tus preferencias han sido actualizadas',
      });
      setShowSettings(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
    if (!user) return;
    
    // For now, just show a message that storage needs to be set up
    toast({
      title: 'Próximamente',
      description: 'La subida de imágenes estará disponible pronto',
    });
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
  const tier = userPoints ? LEAGUE_TIERS[userPoints.league_tier] : LEAGUE_TIERS.bronze;

  return (
    <AppLayout>
      <div className="pb-24">
        {/* Banner */}
        <div 
          className="h-32 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 relative"
        >
          <button
            className="absolute bottom-2 right-2 p-2 bg-background/80 rounded-full"
            onClick={() => bannerInputRef.current?.click()}
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={bannerInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file, 'banner');
            }}
          />
        </div>

        {/* Avatar */}
        <div className="px-4 -mt-12 relative z-10">
          <div className="relative inline-block">
            <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                {profile?.name?.charAt(0)?.toUpperCase() || '👤'}
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-primary-foreground shadow-lg"
              onClick={() => avatarInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={avatarInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'avatar');
              }}
            />
          </div>
        </div>

        <div className="px-4 pt-3 space-y-6">
          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {profile?.name || 'Tu perfil'}
              </h1>
              {userPoints && (
                <Badge 
                  style={{ 
                    backgroundColor: tier.color + '20',
                    color: tier.color 
                  }}
                >
                  {tier.icon} {tier.name}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{user?.email}</p>
            <Button
              variant="outline"
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
          <div className="grid grid-cols-4 gap-2">
            <Card className="card-elevated border-0">
              <CardContent className="p-3 text-center">
                <Target className="h-4 w-4 mx-auto text-primary mb-1" />
                <div className="text-lg font-bold">{goals.length}</div>
                <p className="text-xs text-muted-foreground">Metas</p>
              </CardContent>
            </Card>

            <Card className="card-elevated border-0">
              <CardContent className="p-3 text-center">
                <Trophy className="h-4 w-4 mx-auto text-accent mb-1" />
                <div className="text-lg font-bold">{completedGoals.length}</div>
                <p className="text-xs text-muted-foreground">Logradas</p>
              </CardContent>
            </Card>

            <Card className="card-elevated border-0">
              <CardContent className="p-3 text-center">
                <Flame className="h-4 w-4 mx-auto text-orange-500 mb-1" />
                <div className="text-lg font-bold">{streak.longest}</div>
                <p className="text-xs text-muted-foreground">Mejor racha</p>
              </CardContent>
            </Card>

            <Card className="card-elevated border-0">
              <CardContent className="p-3 text-center">
                <span className="text-sm">{tier.icon}</span>
                <div className="text-lg font-bold">{userPoints?.total_points || 0}</div>
                <p className="text-xs text-muted-foreground">Puntos</p>
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
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1 text-left">Preferencias</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button 
                className="w-full flex items-center gap-3 p-4 bg-card rounded-xl hover:bg-muted/50 transition-colors"
                onClick={async () => {
                  if (hasNotificationPermission()) {
                    toast({
                      title: 'Ya tienes notificaciones activadas',
                      description: 'Recibirás frases motivacionales cada día',
                    });
                    return;
                  }

                  const result = await enableNotifications();
                  toast({
                    title: result.success ? '¡Notificaciones activadas!' : 'No se pudieron activar',
                    description: result.message,
                    variant: result.success ? 'default' : 'destructive',
                  });
                }}
              >
                {hasNotificationPermission() ? (
                  <BellRing className="h-5 w-5 text-green-500" />
                ) : (
                  <Bell className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1 text-left">
                  <span className="block">Notificaciones motivacionales</span>
                  <span className="text-xs text-muted-foreground">
                    {hasNotificationPermission() 
                      ? 'Activadas - recibirás frases cada día' 
                      : 'Recibe una frase motivacional cada día'}
                  </span>
                </div>
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
            <div>
              <Label htmlFor="bio">Bio (opcional)</Label>
              <Textarea
                id="bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Cuéntanos sobre ti..."
                className="mt-1"
                rows={3}
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

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Preferencias</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-6">
            <div>
              <Label>Logros a mostrar en inicio: {achievementsCount}</Label>
              <Slider
                value={[achievementsCount]}
                onValueChange={([v]) => setAchievementsCount(v)}
                min={1}
                max={10}
                step={1}
                className="mt-3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Número de logros visibles en la página principal
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notificaciones</Label>
                <p className="text-xs text-muted-foreground">
                  Recibir recordatorios de metas
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar preferencias'}
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
