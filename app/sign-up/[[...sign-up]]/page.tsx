import { SignUp } from '@clerk/nextjs';
import ForceDarkMode from '@/components/ForceDarkMode';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <ForceDarkMode />
      {/* Floating background orbs for visual effect */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 top-20 left-10 bg-gradient-radial from-purple-500/40 to-transparent animate-pulse" />
      <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 bottom-20 right-10 bg-gradient-radial from-pink-500/40 to-transparent animate-pulse delay-1000" />

      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-slate-900/80 backdrop-blur-xl shadow-2xl border border-white/10',
            headerTitle: 'text-white',
            headerSubtitle: 'text-gray-300',
            socialButtonsBlockButton:
              'bg-white/10 border border-white/20 text-white hover:bg-white/20',
            socialButtonsBlockButtonText: 'text-white font-medium',
            dividerLine: 'bg-white/20',
            dividerText: 'text-gray-400',
            formButtonPrimary:
              'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white',
            formFieldLabel: 'text-gray-300',
            formFieldInput: 'bg-white/10 border-white/20 text-white placeholder:text-gray-500',
            footerActionLink: 'text-purple-400 hover:text-purple-300',
            identityPreviewText: 'text-white',
            identityPreviewEditButton: 'text-purple-400',
            formHeaderTitle: 'text-white',
            formHeaderSubtitle: 'text-gray-300',
            otpCodeFieldInput: 'bg-white/10 border-white/20 text-white',
            formResendCodeLink: 'text-purple-400 hover:text-purple-300',
            footerActionText: 'text-gray-400',
            footer: 'hidden', // Hide Clerk branding footer
          },
        }}
      />
    </div>
  );
}
