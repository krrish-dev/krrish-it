import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

const TOKEN_KEY = 'krrish_admin_token';

type AdminTab = 'overview' | 'messages' | 'projects' | 'blog' | 'indexing';
type AdminApiPath = '/api/projects' | '/api/blog' | '/api/messages';
type GoogleIndexingType = 'URL_UPDATED' | 'URL_DELETED';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getJsonAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };
}

function formatDate(value: unknown): string {
  if (!value) return '-';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
}

function indexingStatusClass(status: string): string {
  if (status === 'sent') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
  if (status === 'failed') return 'bg-red-500/10 text-red-300 border-red-500/30';
  if (status === 'skipped') return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
  return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
}

export default component$(() => {
  const activeTab = useSignal<AdminTab>('overview');
  const projects = useSignal<any[]>([]);
  const messages = useSignal<any[]>([]);
  const blogPosts = useSignal<any[]>([]);
  const indexingLogs = useSignal<any[]>([]);
  const indexingInfo = useSignal<any>({});
  const indexingUrl = useSignal('https://krrish.it/');
  const indexingType = useSignal<GoogleIndexingType>('URL_UPDATED');
  const indexingForce = useSignal(false);
  const indexingBusy = useSignal(false);
  const indexingResult = useSignal<any | null>(null);
  const loading = useSignal(true);
  const status = useSignal('Checking authentication...');
  const sidebarOpen = useSignal(false);

  const loadGoogleIndexing = $(async () => {
    const res = await fetch('/api/google-indexing', {
      credentials: 'include',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      indexingLogs.value = data.data || [];
      indexingInfo.value = data.info || {};
    }
  });

  const loadData = $(async () => {
    const headers = getAuthHeaders();
    status.value = 'Loading...';
    const [projectsRes, messagesRes, blogRes, indexingRes] = await Promise.all([
      fetch('/api/projects', { credentials: 'include', headers }),
      fetch('/api/messages', { credentials: 'include', headers }),
      fetch('/api/blog', { credentials: 'include', headers }),
      fetch('/api/google-indexing', { credentials: 'include', headers }),
    ]);
    if (projectsRes.ok) projects.value = (await projectsRes.json()).data || [];
    if (messagesRes.ok) messages.value = (await messagesRes.json()).data || [];
    if (blogRes.ok) blogPosts.value = (await blogRes.json()).data || [];
    if (indexingRes.ok) {
      const indexingData = await indexingRes.json();
      indexingLogs.value = indexingData.data || [];
      indexingInfo.value = indexingData.info || {};
    }
    status.value = 'Ready';
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      window.location.href = '/admin/login/';
      return;
    }
    await loadData();
    loading.value = false;
  });

  const logout = $(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
    }).catch(() => null);
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/admin/login/';
  });

  const deleteItem = $(async (path: AdminApiPath, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const res = await fetch(path, {
      method: 'DELETE',
      credentials: 'include',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({ _id: id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      status.value = data.error || 'Delete failed';
      return;
    }
    await loadData();
  });

  const submitProject = $(async (event: Event) => {
    const form = event.target as HTMLFormElement;
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const res = await fetch('/api/projects', {
      method: 'POST',
      credentials: 'include',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({
        ...raw,
        technologies: String(raw.technologies || '').split(',').map((item) => item.trim()).filter(Boolean),
        published: true,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      status.value = data.error || 'Project save failed';
      return;
    }
    form.reset();
    await loadData();
  });

  const submitBlog = $(async (event: Event) => {
    const form = event.target as HTMLFormElement;
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const res = await fetch('/api/blog', {
      method: 'POST',
      credentials: 'include',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({
        ...raw,
        tags: String(raw.tags || '').split(',').map((item) => item.trim()).filter(Boolean),
        published: true,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      status.value = data.error || 'Blog save failed';
      return;
    }
    form.reset();
    await loadData();
  });

  const submitIndexing = $(async (event: Event) => {
    event.preventDefault();
    const url = indexingUrl.value.trim();
    if (!url) {
      status.value = 'Indexing URL is required';
      return;
    }

    indexingBusy.value = true;
    indexingResult.value = null;
    status.value = 'Sending URL to Google...';

    const res = await fetch('/api/google-indexing/publish', {
      method: 'POST',
      credentials: 'include',
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({
        url,
        type: indexingType.value,
        force: indexingForce.value,
      }),
    });

    const data = await res.json().catch(() => ({}));
    indexingResult.value = data;
    status.value = res.ok ? data.message || 'Google Indexing request completed' : data.error || 'Google Indexing request failed';
    indexingBusy.value = false;
    await loadGoogleIndexing();
  });

  if (loading.value) {
    return (
      <div class="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div class="text-cyan-400 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'blog', label: 'Blog', icon: '📝' },
    { id: 'indexing', label: 'Indexing', icon: '⚡' },
  ];

  return (
    <div class="min-h-screen bg-[#0f172a] text-white">

      {/* ── Mobile top bar ── */}
      <header class="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 h-14">
        <div>
          <span class="text-lg font-bold">
            <span class="text-[#e63946]">K</span>rrish<span class="text-[#1d4ed8]">.it</span>
          </span>
          <span class="text-slate-500 text-xs ml-2">Admin</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-cyan-400 font-semibold">{status.value}</span>
          <button
            onClick$={() => (sidebarOpen.value = !sidebarOpen.value)}
            class="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen.value ? (
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {sidebarOpen.value && (
        <div
          class="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick$={() => (sidebarOpen.value = false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div
        class={`lg:hidden fixed top-14 left-0 bottom-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-5 transition-transform duration-300 ${sidebarOpen.value ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <nav class="flex-1 space-y-2 mt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick$={() => {
                activeTab.value = tab.id;
                sidebarOpen.value = false;
              }}
              class={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${activeTab.value === tab.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <span class="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'messages' && messages.value.length > 0 && (
                <span class="ml-auto bg-cyan-500 text-white text-xs rounded-full px-2 py-0.5">{messages.value.length}</span>
              )}
              {tab.id === 'indexing' && indexingLogs.value.length > 0 && (
                <span class="ml-auto bg-cyan-500 text-white text-xs rounded-full px-2 py-0.5">{indexingLogs.value.length}</span>
              )}
            </button>
          ))}
        </nav>
        <button
          onClick$={logout}
          class="mt-4 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-3"
        >
          <span>🚪</span> Logout
        </button>
      </div>

      {/* ── Desktop sidebar ── */}
      <aside class="hidden lg:flex w-64 bg-slate-900 border-r border-slate-800 p-6 fixed h-full flex-col">
        <div class="mb-8">
          <h1 class="text-xl font-bold">
            <span class="text-[#e63946]">K</span>rrish<span class="text-[#1d4ed8]">.it</span>
          </h1>
          <p class="text-slate-500 text-xs mt-1">Admin Panel</p>
        </div>
        <nav class="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick$={() => (activeTab.value = tab.id)}
              class={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${activeTab.value === tab.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'messages' && messages.value.length > 0 && (
                <span class="ml-auto bg-cyan-500 text-white text-xs rounded-full px-2 py-0.5">{messages.value.length}</span>
              )}
              {tab.id === 'indexing' && indexingLogs.value.length > 0 && (
                <span class="ml-auto bg-cyan-500 text-white text-xs rounded-full px-2 py-0.5">{indexingLogs.value.length}</span>
              )}
            </button>
          ))}
        </nav>
        <button
          onClick$={logout}
          class="mt-auto px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2"
        >
          🚪 Logout
        </button>
      </aside>

      {/* ── Main content ── */}
      <main class="lg:ml-64 pt-14 lg:pt-0 pb-20 lg:pb-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Desktop header */}
        <div class="hidden lg:flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold">Admin Dashboard</h2>
          <div class="text-sm text-cyan-400 font-semibold">{status.value}</div>
        </div>

        {/* Mobile page title */}
        <div class="lg:hidden mt-4 mb-6">
          <h2 class="text-xl font-bold capitalize">
            {tabs.find((t) => t.id === activeTab.value)?.icon}{' '}
            {tabs.find((t) => t.id === activeTab.value)?.label}
          </h2>
        </div>

        {/* ── Overview ── */}
        {activeTab.value === 'overview' && (
          <section>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 lg:gap-6">
              <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 lg:p-6">
                <p class="text-slate-400 text-sm">Projects</p>
                <p class="text-3xl font-bold mt-2 text-cyan-400">{projects.value.length}</p>
              </div>
              <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 lg:p-6">
                <p class="text-slate-400 text-sm">Blog Posts</p>
                <p class="text-3xl font-bold mt-2 text-blue-400">{blogPosts.value.length}</p>
              </div>
              <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 lg:p-6">
                <p class="text-slate-400 text-sm">Messages</p>
                <p class="text-3xl font-bold mt-2 text-purple-400">{messages.value.length}</p>
              </div>
              <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 lg:p-6">
                <p class="text-slate-400 text-sm">Indexing Logs</p>
                <p class="text-3xl font-bold mt-2 text-emerald-400">{indexingLogs.value.length}</p>
              </div>
            </div>
          </section>
        )}

        {/* ── Messages ── */}
        {activeTab.value === 'messages' && (
          <section class="space-y-4">
            {messages.value.length === 0 ? (
              <p class="text-slate-500">No messages yet.</p>
            ) : (
              messages.value.map((message) => (
                <div key={message._id} class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 lg:p-5">
                  <div class="flex justify-between gap-4">
                    <div>
                      <p class="font-semibold">{message.name}</p>
                      <p class="text-sm text-slate-400 break-all">{message.email}</p>
                    </div>
                    <button
                      onClick$={() => deleteItem('/api/messages', message._id)}
                      class="text-red-400 text-sm hover:underline shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                  <p class="text-slate-300 mt-3 whitespace-pre-wrap text-sm">{message.message}</p>
                </div>
              ))
            )}
          </section>
        )}

        {/* ── Projects ── */}
        {activeTab.value === 'projects' && (
          <section class="space-y-6">
            <form
              preventdefault:submit
              onSubmit$={submitProject}
              class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 lg:p-5 grid gap-3"
            >
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="title_en" required placeholder="Title English" class="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm w-full" />
                <input name="title_ar" required placeholder="Title Arabic" class="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm w-full" dir="rtl" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <textarea name="description_en" required placeholder="Description English" rows={3} class="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm w-full resize-none" />
                <textarea name="description_ar" required placeholder="Description Arabic" rows={3} class="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm w-full resize-none" dir="rtl" />
              </div>
              <input name="technologies" placeholder="Technologies (comma separated)" class="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm w-full" />
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="url" placeholder="Live URL" class="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm w-full" />
                <input name="github" placeholder="GitHub URL" class="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm w-full" />
              </div>
              <button type="submit" class="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                ➕ Add Project
              </button>
            </form>
            {projects.value.map((project) => (
              <div key={project._id} class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 lg:p-5 flex justify-between gap-4">
                <div class="min-w-0">
                  <p class="font-semibold truncate">{project.title_en}</p>
                  <p class="text-sm text-slate-400 mt-1 line-clamp-2">{project.description_en}</p>
                </div>
                <button
                  onClick$={() => deleteItem('/api/projects', project._id)}
                  class="text-red-400 text-sm hover:underline shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </section>
        )}

        {/* ── Blog ── */}
        {activeTab.value === 'blog' && (
          <section class="space-y-6">
            <form
              preventdefault:submit
              onSubmit$={submitBlog}
              class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 lg:p-5 grid gap-3"
            >
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="title_en" required placeholder="Title English" class="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm w-full" />
                <input name="title_ar" required placeholder="Title Arabic" class="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm w-full" dir="rtl" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <textarea name="content_en" required placeholder="Content English" rows={4} class="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm w-full resize-none" />
                <textarea name="content_ar" required placeholder="Content Arabic" rows={4} class="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm w-full resize-none" dir="rtl" />
              </div>
              <input name="tags" placeholder="Tags (comma separated)" class="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm w-full" />
              <button type="submit" class="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                ➕ Add Blog Post
              </button>
            </form>
            {blogPosts.value.map((post) => (
              <div key={post._id} class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 lg:p-5 flex justify-between gap-4">
                <div class="min-w-0">
                  <p class="font-semibold truncate">{post.title_en}</p>
                  <p class="text-sm text-slate-400 mt-1 line-clamp-2">{post.excerpt_en || post.content_en}</p>
                </div>
                <button
                  onClick$={() => deleteItem('/api/blog', post._id)}
                  class="text-red-400 text-sm hover:underline shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </section>
        )}

        {/* ── Google Indexing ── */}
        {activeTab.value === 'indexing' && (
          <section class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <p class="text-slate-400 text-xs uppercase tracking-wide">Integration</p>
                <p class={`mt-2 text-lg font-bold ${indexingInfo.value.enabled === false ? 'text-red-300' : 'text-emerald-300'}`}>
                  {indexingInfo.value.enabled === false ? 'Disabled' : 'Enabled'}
                </p>
              </div>
              <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <p class="text-slate-400 text-xs uppercase tracking-wide">Sent Today</p>
                <p class="mt-2 text-lg font-bold text-cyan-300">{indexingInfo.value.sentToday ?? 0} / {indexingInfo.value.dailyLimit ?? '-'}</p>
              </div>
              <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <p class="text-slate-400 text-xs uppercase tracking-wide">Remaining</p>
                <p class="mt-2 text-lg font-bold text-blue-300">{indexingInfo.value.remainingToday ?? '-'}</p>
              </div>
              <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <p class="text-slate-400 text-xs uppercase tracking-wide">Cooldown</p>
                <p class="mt-2 text-lg font-bold text-yellow-300">{indexingInfo.value.duplicateCooldownMinutes ?? 15} min</p>
              </div>
            </div>

            <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-100 leading-relaxed">
              هذا التاب يرسل إشعار URL إلى Google ويعرض نجاح أو فشل الإرسال داخل السجل. حالة “تمت الفهرسة فعليًا في نتائج Google” لا يمكن تأكيدها من Indexing API نفسه، لذلك الاعتماد هنا على إرسال الإشعار فقط وليس إثبات الظهور في البحث.
            </div>

            <form
              preventdefault:submit
              onSubmit$={submitIndexing}
              class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 lg:p-5 space-y-4"
            >
              <div class="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-3">
                <div>
                  <label class="block text-sm text-slate-300 mb-2">URL</label>
                  <input
                    value={indexingUrl.value}
                    onInput$={(event) => (indexingUrl.value = (event.target as HTMLInputElement).value)}
                    placeholder="https://krrish.it/"
                    class="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm w-full"
                  />
                </div>
                <div>
                  <label class="block text-sm text-slate-300 mb-2">Notification Type</label>
                  <select
                    value={indexingType.value}
                    onChange$={(event) => (indexingType.value = (event.target as HTMLSelectElement).value as GoogleIndexingType)}
                    class="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm w-full"
                  >
                    <option value="URL_UPDATED">URL_UPDATED</option>
                    <option value="URL_DELETED">URL_DELETED</option>
                  </select>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label class="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={indexingForce.value}
                    onChange$={(event) => (indexingForce.value = (event.target as HTMLInputElement).checked)}
                    class="h-4 w-4 rounded border-slate-600 bg-slate-900"
                  />
                  Force send and ignore duplicate cooldown
                </label>
                <button
                  type="submit"
                  disabled={indexingBusy.value}
                  class="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  ⚡ Send to Google
                </button>
              </div>
            </form>

            {indexingResult.value && (
              <div class={`rounded-xl border p-4 ${indexingResult.value.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div>
                    <p class={`font-bold ${indexingResult.value.success ? 'text-emerald-300' : 'text-red-300'}`}>
                      {indexingResult.value.success ? 'Request completed' : 'Request failed'}
                    </p>
                    <p class="text-sm text-slate-300 mt-1">{indexingResult.value.message || indexingResult.value.error || 'No message returned'}</p>
                    <p class="text-xs text-slate-400 mt-2">
                      Actual Google index coverage: <span class="text-yellow-300">Not confirmed by this API</span>
                    </p>
                  </div>
                  {indexingResult.value.data?.googleNotifyTime && (
                    <div class="text-sm text-slate-300">
                      <span class="text-slate-500">Google notify time:</span>{' '}
                      <span class="text-cyan-300">{formatDate(indexingResult.value.data.googleNotifyTime)}</span>
                    </div>
                  )}
                </div>

                {indexingResult.value.data?.properties && (
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
                    <div class="bg-slate-950/40 rounded-lg p-3 border border-slate-700/60">
                      <p class="text-slate-500">Host</p>
                      <p class="text-slate-200 break-all">{indexingResult.value.data.properties.host}</p>
                    </div>
                    <div class="bg-slate-950/40 rounded-lg p-3 border border-slate-700/60">
                      <p class="text-slate-500">Path</p>
                      <p class="text-slate-200 break-all">{indexingResult.value.data.properties.pathname}</p>
                    </div>
                    <div class="bg-slate-950/40 rounded-lg p-3 border border-slate-700/60">
                      <p class="text-slate-500">Proof Level</p>
                      <p class="text-yellow-300">{indexingResult.value.data.properties.indexingProof}</p>
                    </div>
                  </div>
                )}

                <details class="mt-4">
                  <summary class="cursor-pointer text-sm text-cyan-300">Show raw response</summary>
                  <pre class="mt-3 max-h-80 overflow-auto rounded-lg bg-slate-950/70 border border-slate-700 p-3 text-xs text-slate-300 whitespace-pre-wrap">
                    {JSON.stringify(indexingResult.value, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            <div class="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <div class="p-4 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 class="font-bold">Google Indexing Logs</h3>
                  <p class="text-sm text-slate-500">Last 50 notification attempts</p>
                </div>
                <button
                  type="button"
                  onClick$={loadGoogleIndexing}
                  class="px-3 py-2 rounded-lg text-sm border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  Refresh
                </button>
              </div>

              {indexingLogs.value.length === 0 ? (
                <p class="p-4 text-slate-500">No indexing attempts yet.</p>
              ) : (
                <div class="overflow-x-auto">
                  <table class="min-w-full text-sm">
                    <thead class="bg-slate-900/70 text-slate-400">
                      <tr>
                        <th class="text-left px-4 py-3 font-medium">URL</th>
                        <th class="text-left px-4 py-3 font-medium">Type</th>
                        <th class="text-left px-4 py-3 font-medium">Status</th>
                        <th class="text-left px-4 py-3 font-medium">Notify Time</th>
                        <th class="text-left px-4 py-3 font-medium">Error</th>
                        <th class="text-left px-4 py-3 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-700/70">
                      {indexingLogs.value.map((log) => (
                        <tr key={log._id} class="hover:bg-slate-800/60">
                          <td class="px-4 py-3 max-w-[360px] break-all text-slate-200">{log.url}</td>
                          <td class="px-4 py-3 text-slate-300">{log.type || '-'}</td>
                          <td class="px-4 py-3">
                            <span class={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${indexingStatusClass(log.status)}`}>
                              {log.status || 'unknown'}
                            </span>
                          </td>
                          <td class="px-4 py-3 text-slate-300">{formatDate(log.googleNotifyTime)}</td>
                          <td class="px-4 py-3 max-w-[260px] break-words text-red-300">{log.errorMessage || log.reason || '-'}</td>
                          <td class="px-4 py-3 text-slate-400">{formatDate(log.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 h-16 safe-area-pb">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick$={() => {
              activeTab.value = tab.id;
              sidebarOpen.value = false;
            }}
            class={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all relative ${activeTab.value === tab.id ? 'text-cyan-400' : 'text-slate-500'}`}
          >
            {tab.id === 'messages' && messages.value.length > 0 && (
              <span class="absolute -top-0.5 right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {messages.value.length}
              </span>
            )}
            <span class="text-xl leading-none">{tab.icon}</span>
            <span class="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
        <button
          onClick$={logout}
          class="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-red-400 transition-all"
        >
          <span class="text-xl leading-none">🚪</span>
          <span class="text-[10px] font-medium">Logout</span>
        </button>
      </nav>

    </div>
  );
});

export const head: DocumentHead = {
  title: 'Admin Dashboard | Krrish IT',
};
