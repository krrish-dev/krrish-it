import { component$, useSignal, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  const email = useSignal('');
  const password = useSignal('');
  const error = useSignal('');
  const loading = useSignal(false);

  const handleLogin = $(async () => {
    error.value = '';
    loading.value = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = '/admin';
      } else {
        error.value = data.error || 'Login failed';
      }
    } catch {
      error.value = 'Network error. Please try again.';
    } finally {
      loading.value = false;
    }
  });

  return (
    <div class="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        {/* Logo */}
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white">
            <span class="text-[#e63946]">K</span>rrish<span class="text-[#1d4ed8]">.it</span>
          </h1>
          <p class="text-slate-400 text-sm mt-2">Admin Dashboard</p>
        </div>

        {/* Login Form */}
        <div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
          <h2 class="text-xl font-bold text-white mb-6">Sign In</h2>

          {error.value && (
            <div class="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error.value}
            </div>
          )}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email.value}
                onInput$={(e) => email.value = (e.target as HTMLInputElement).value}
                class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
                placeholder="admin@krrish.it"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password.value}
                onInput$={(e) => password.value = (e.target as HTMLInputElement).value}
                onKeyDown$={(e) => { if (e.key === 'Enter') handleLogin(); }}
                class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
                placeholder="••••••••"
              />
            </div>
            <button
              onClick$={handleLogin}
              disabled={loading.value}
              class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 mt-2"
            >
              {loading.value ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Admin Login | Krrish IT',
};
