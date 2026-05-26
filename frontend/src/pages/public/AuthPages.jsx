import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth.js';
import { endpoints } from '../../services/api.js';

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).optional(),
  role: z.enum(['customer', 'agent']).optional()
});

export const Login = () => {
  const { login } = useAuth();
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(authSchema.pick({ email: true, password: true })) });
  return <AuthShell title="Welcome back" subtitle="Sign in to continue managing your real estate workflow." footer={<Link className="text-emerald" to="/signup">Create an account</Link>}>
    <form className="space-y-4" onSubmit={handleSubmit(login)}>
      <input className="input" placeholder="Email" {...register('email')} />
      <input className="input" placeholder="Password" type="password" {...register('password')} />
      <button className="btn-primary w-full" disabled={formState.isSubmitting}>Login</button>
      <Link className="block text-center text-sm text-slate-500 hover:text-emerald" to="/forgot-password">Forgot password?</Link>
    </form>
  </AuthShell>;
};

export const Signup = () => {
  const { signup } = useAuth();
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(authSchema), defaultValues: { role: 'customer' } });
  return <AuthShell title="Create account" subtitle="Join as a customer or agent and start using LuxeEstate." footer={<Link className="text-emerald" to="/login">Already have an account?</Link>}>
    <form className="space-y-4" onSubmit={handleSubmit(signup)}>
      <input className="input" placeholder="Full name" {...register('name')} />
      <input className="input" placeholder="Email" {...register('email')} />
      <input className="input" placeholder="Password" type="password" {...register('password')} />
      <select className="input" {...register('role')}><option value="customer">Customer</option><option value="agent">Agent</option></select>
      <button className="btn-primary w-full" disabled={formState.isSubmitting}>Signup</button>
    </form>
  </AuthShell>;
};

export const ForgotPassword = () => {
  const { register, handleSubmit, formState } = useForm({ defaultValues: { email: '' } });
  const submit = async (payload) => {
    await endpoints.auth.forgot(payload);
    toast.success('Reset instructions sent if the account exists');
  };
  return <AuthShell title="Reset password" subtitle="Enter your email to receive reset instructions.">
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      <input className="input" placeholder="Email" {...register('email')} />
      <button className="btn-primary w-full" disabled={formState.isSubmitting}>Send reset link</button>
    </form>
  </AuthShell>;
};

export const ResetPassword = () => {
  const params = new URLSearchParams(window.location.search);
  const { register, handleSubmit, formState } = useForm({ defaultValues: { token: params.get('token') || '', password: '' } });
  const submit = async (payload) => {
    await endpoints.auth.reset(payload);
    toast.success('Password changed');
  };
  return <AuthShell title="Choose new password" subtitle="Use the secure token from your email.">
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      <input className="input" placeholder="Reset token" {...register('token')} />
      <input className="input" placeholder="New password" type="password" {...register('password')} />
      <button className="btn-primary w-full" disabled={formState.isSubmitting}>Update password</button>
    </form>
  </AuthShell>;
};

export const VerifyEmail = () => {
  const params = new URLSearchParams(window.location.search);
  const verify = async () => {
    await endpoints.auth.verify({ token: params.get('token') });
    toast.success('Email verified');
  };
  return <AuthShell title="Verify email" subtitle="Confirm your account email to unlock every workflow.">
    <button className="btn-primary w-full" onClick={verify}>Verify email</button>
  </AuthShell>;
};

const AuthShell = ({ title, subtitle, children, footer }) => (
  <main className="shell grid min-h-[calc(100vh-4rem)] place-items-center py-12">
    <div className="panel w-full max-w-md p-6">
      <h1 className="text-2xl font-black text-navy">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-6">{children}</div>
      {footer && <div className="mt-5 text-center text-sm">{footer}</div>}
    </div>
  </main>
);
