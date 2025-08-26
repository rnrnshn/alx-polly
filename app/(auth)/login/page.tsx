import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoginForm />
      </div>
    </div>
  );
}
