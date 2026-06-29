import { component$, useSignal, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

const TOKEN_KEY = 'krrish_admin_token';

export default component$(() => {
  const error = useSignal('');
  const loading = useSignal(false);

  const handleLogin = $(async (event?: Event) => {
    error.value = '';
    loading.value = true;

    try {
      const form = event?.target instanceof HTMLFormElement
        ? event.target
        : document.querySelector<HTMLFormElement>('#admin-login-form');
      const formData = new FormData(form || undefined);
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '');

      if (!email || !password) {
        error.value = 'Email and password are required.';
        return;
      }

      localStorage.removeItem(TOKEN_KEY);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (data.token) {
          localStorage.setItem(TOKEN_KEY, data.token);
        }

        const token = localStorage.getItem(TOKEN_KEY);
        const sessionCheck = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (sessionCheck.ok) {
          window.location.href = '/admin/';
          return;
        }

        error.value = 'Login succeeded, but the session was not saved. Please clear cache and try again.';
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

          <form id="admin-login-form" class="space-y-4" preventdefault:submit onSubmit$={handleLogin}>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2" for="admin-email">Email</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autocomplete="email"
                class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
                placeholder="admin@krrish.it"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2" for="admin-password">Password</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autocomplete="current-password"
                class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading.value}
              class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 mt-2"
            >
              {loading.value ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Admin Login | Krrish IT',
};
