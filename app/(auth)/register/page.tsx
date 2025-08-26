import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RegisterForm />
      </div>
    </div>
  );
}
