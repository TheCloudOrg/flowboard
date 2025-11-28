import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating background orbs for visual effect */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 top-20 left-10 bg-gradient-radial from-purple-500/40 to-transparent animate-pulse" />
      <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 bottom-20 right-10 bg-gradient-radial from-pink-500/40 to-transparent animate-pulse delay-1000" />

      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'glass-effect shadow-2xl border border-white/10',
          },
        }}
      />
    </div>
  );
}
