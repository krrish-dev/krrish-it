import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

const TOKEN_KEY = 'krrish_admin_token';

type AdminTab = 'overview' | 'messages' | 'projects' | 'blog';

export default component$(() => {
  const activeTab = useSignal<AdminTab>('overview');
  const projects = useSignal<any[]>([]);
  const messages = useSignal<any[]>([]);
  const blogPosts = useSignal<any[]>([]);
  const loading = useSignal(true);
  const status = useSignal('Checking authentication...');

  const loadData = $(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    status.value = 'Loading...';

    const [projectsRes, messagesRes, blogRes] = await Promise.all([
      fetch('/api/projects', { credentials: 'include', headers }),
      fetch('/api/messages', { credentials: 'include', headers }),
      fetch('/api/blog', { credentials: 'include', headers }),
    ]);

    if (projectsRes.ok) projects.value = (await projectsRes.json()).data || [];
    if (messagesRes.ok) messages.value = (await messagesRes.json()).data || [];
    if (blogRes.ok) blogPosts.value = (await blogRes.json()).data || [];

    status.value = 'Ready';
  });

  useVisibleTask$(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      window.location.href = '/admin/login/';
      return;
    }

    await loadData();
    loading.value = false;
  });

  const logout = $(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => null);

    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/admin/login/';
  });

  const deleteItem = $(async (path: '/api/projects' | '/api/blog' | '/api/messages', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(path, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const token = localStorage.getItem(TOKEN_KEY);

    const res = await fetch('/api/projects', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const token = localStorage.getItem(TOKEN_KEY);

    const res = await fetch('/api/blog', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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

  if (loading.value) {
    return (
      <div class="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div class="text-cyan-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-[#0f172a] text-white flex">
      <aside class="w-64 bg-slate-900 border-r border-slate-800 p-6 fixed h-full flex flex-col">
        <div class="mb-8">
          <h1 class="text-xl font-bold"><span class="text-[#e63946]">K</span>rrish<span class="text-[#1d4ed8]">.it</span></h1>
          <p class="text-slate-500 text-xs mt-1">Admin Panel</p>
        </div>

        <nav class="flex-1 space-y-2">
          {(['overview', 'messages', 'projects', 'blog'] as AdminTab[]).map((tab) => (
            <button
              key={tab}
              onClick$={() => (activeTab.value = tab)}
              class={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab.value === tab ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'messages' && `💬 Messages ${messages.value.length ? `(${messages.value.length})` : ''}`}
              {tab === 'projects' && '🚀 Projects'}
              {tab === 'blog' && '📝 Blog'}
            </button>
          ))}
        </nav>

        <button onClick$={logout} class="mt-auto px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
          🚪 Logout
        </button>
      </aside>

      <main class="flex-1 ml-64 p-8">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold">Admin Dashboard</h2>
          <div class="text-sm text-cyan-400 font-semibold">{status.value}</div>
        </div>

        {activeTab.value === 'overview' && (
          <section>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6"><p class="text-slate-400 text-sm">Projects</p><p class="text-3xl font-bold mt-2 text-cyan-400">{projects.value.length}</p></div>
              <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6"><p class="text-slate-400 text-sm">Blog Posts</p><p class="text-3xl font-bold mt-2 text-blue-400">{blogPosts.value.length}</p></div>
              <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6"><p class="text-slate-400 text-sm">Messages</p><p class="text-3xl font-bold mt-2 text-purple-400">{messages.value.length}</p></div>
            </div>
          </section>
        )}

        {activeTab.value === 'messages' && (
          <section class="space-y-4">
            <h3 class="text-xl font-bold">Messages</h3>
            {messages.value.length === 0 ? <p class="text-slate-500">No messages yet.</p> : messages.value.map((message) => (
              <div key={message._id} class="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                <div class="flex justify-between gap-4">
                  <div><p class="font-semibold">{message.name}</p><p class="text-sm text-slate-400">{message.email}</p></div>
                  <button onClick$={() => deleteItem('/api/messages', message._id)} class="text-red-400 text-sm hover:underline">Delete</button>
                </div>
                <p class="text-slate-300 mt-3 whitespace-pre-wrap">{message.message}</p>
              </div>
            ))}
          </section>
        )}

        {activeTab.value === 'projects' && (
          <section class="space-y-6">
            <h3 class="text-xl font-bold">Projects</h3>
            <form preventdefault:submit onSubmit$={submitProject} class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 grid gap-3">
              <input name="title_en" required placeholder="Title English" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
              <input name="title_ar" required placeholder="Title Arabic" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
              <textarea name="description_en" required placeholder="Description English" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
              <textarea name="description_ar" required placeholder="Description Arabic" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
              <input name="technologies" placeholder="Technologies comma separated" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
              <input name="url" placeholder="Live URL" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
              <input name="github" placeholder="GitHub URL" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
              <button type="submit" class="bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold">Add Project</button>
            </form>
            {projects.value.map((project) => (
              <div key={project._id} class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex justify-between gap-4">
                <div><p class="font-semibold">{project.title_en}</p><p class="text-sm text-slate-400">{project.description_en}</p></div>
                <button onClick$={() => deleteItem('/api/projects', project._id)} class="text-red-400 text-sm hover:underline">Delete</button>
              </div>
            ))}
          </section>
        )}

        {activeTab.value === 'blog' && (
          <section class="space-y-6">
            <h3 class="text-xl font-bold">Blog</h3>
            <form preventdefault:submit onSubmit$={submitBlog} class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 grid gap-3">
              <input name="title_en" required placeholder="Title English" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
              <input name="title_ar" required placeholder="Title Arabic" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
              <textarea name="content_en" required placeholder="Content English" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
              <textarea name="content_ar" required placeholder="Content Arabic" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
              <input name="tags" placeholder="Tags comma separated" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700" />
              <button type="submit" class="bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold">Add Blog Post</button>
            </form>
            {blogPosts.value.map((post) => (
              <div key={post._id} class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex justify-between gap-4">
                <div><p class="font-semibold">{post.title_en}</p><p class="text-sm text-slate-400">{post.excerpt_en || post.content_en}</p></div>
                <button onClick$={() => deleteItem('/api/blog', post._id)} class="text-red-400 text-sm hover:underline">Delete</button>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Admin Dashboard | Krrish IT',
};
