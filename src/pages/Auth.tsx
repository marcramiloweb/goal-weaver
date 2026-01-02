import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Target, Sparkles } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
  name: z.string().max(100).optional(),
});

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validate = () => {
    try {
      authSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            newErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        toast({
          title: 'Error al iniciar sesión',
          description: error.message === 'Invalid login credentials' 
            ? 'Credenciales incorrectas' 
            : error.message,
          variant: 'destructive',
        });
      }
    } else {
      const { error } = await signUp(formData.email, formData.password, formData.name);
      if (error) {
        toast({
          title: 'Error al registrarse',
          description: error.message.includes('already registered')
            ? 'Este email ya está registrado'
            : error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '¡Bienvenido! 🎉',
          description: 'Tu cuenta ha sido creada exitosamente',
        });
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-float mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <Target className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Propósitos 2026</span>
        </h1>
        <p className="text-muted-foreground max-w-xs">
          Transforma tus metas en logros. Paso a paso, día a día.
        </p>

        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" />
          <span>Tu año más exitoso comienza aquí</span>
        </div>
      </div>

      {/* Auth Form */}
      <div className="bg-card rounded-t-3xl shadow-lg p-6 pt-8">
        <div className="flex gap-2 mb-6">
          <Button
            variant={isLogin ? 'default' : 'ghost'}
            className="flex-1 rounded-full"
            onClick={() => setIsLogin(true)}
          >
            Iniciar sesión
          </Button>
          <Button
            variant={!isLogin ? 'default' : 'ghost'}
            className="flex-1 rounded-full"
            onClick={() => setIsLogin(false)}
          >
            Registrarse
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold rounded-xl"
            disabled={loading}
          >
            {loading ? 'Cargando...' : isLogin ? 'Entrar' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-medium hover:underline"
          >
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
