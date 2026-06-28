import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  const activeTab = useSignal<'overview' | 'projects' | 'blog' | 'messages' | 'settings'>('overview');
  const projects = useSignal<any[]>([]);
  const messages = useSignal<any[]>([]);
  const blogPosts = useSignal<any[]>([]);
  const isAuthenticated = useSignal(false);
  const loading = useSignal(true);

  // Modal states
  const showProjectModal = useSignal(false);
  const showBlogModal = useSignal(false);
  const editingItem = useSignal<any>(null);

  // Form fields
  const formData = useSignal<any>({});

  useVisibleTask$(async () => {
    // Check authentication
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        isAuthenticated.value = true;
        await loadData();
      } else {
        window.location.href = '/admin/login';
      }
    } catch {
      window.location.href = '/admin/login';
    }
    loading.value = false;
  });

  const loadData = $(async () => {
    try {
      const [projRes, msgRes, blogRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/messages'),
        fetch('/api/blog'),
      ]);
      if (projRes.ok) projects.value = (await projRes.json()).data || [];
      if (msgRes.ok) messages.value = (await msgRes.json()).data || [];
      if (blogRes.ok) blogPosts.value = (await blogRes.json()).data || [];
    } catch (e) {
      console.error('Error loading data:', e);
    }
  });

  const handleLogout = $(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  });

  const saveProject = $(async () => {
    const method = editingItem.value ? 'PUT' : 'POST';
    const body = editingItem.value
      ? { ...formData.value, _id: editingItem.value._id }
      : formData.value;

    await fetch('/api/projects', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    showProjectModal.value = false;
    editingItem.value = null;
    formData.value = {};
    await loadData();
  });

  const deleteProject = $(async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await fetch('/api/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id }),
      });
      await loadData();
    }
  });

  const saveBlogPost = $(async () => {
    const method = editingItem.value ? 'PUT' : 'POST';
    const body = editingItem.value
      ? { ...formData.value, _id: editingItem.value._id }
      : formData.value;

    await fetch('/api/blog', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    showBlogModal.value = false;
    editingItem.value = null;
    formData.value = {};
    await loadData();
  });

  const deleteMessage = $(async (id: string) => {
    await fetch('/api/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: id }),
    });
    await loadData();
  });

  if (loading.value) {
    return (
      <div class="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div class="text-cyan-500 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-[#0f172a] text-white flex">
      {/* Sidebar */}
      <aside class="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col fixed h-full">
        <div class="mb-8">
          <h1 class="text-xl font-bold">
            <span class="text-[#e63946]">K</span>rrish<span class="text-[#1d4ed8]">.it</span>
          </h1>
          <p class="text-slate-500 text-xs mt-1">Admin Panel</p>
        </div>

        <nav class="flex-1 space-y-2">
          <button
            onClick$={() => activeTab.value = 'overview'}
            class={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab.value === 'overview' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            📊 Overview
          </button>
          <button
            onClick$={() => activeTab.value = 'projects'}
            class={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab.value === 'projects' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            🚀 Projects
          </button>
          <button
            onClick$={() => activeTab.value = 'blog'}
            class={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab.value === 'blog' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            📝 Blog
          </button>
          <button
            onClick$={() => activeTab.value = 'messages'}
            class={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab.value === 'messages' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            💬 Messages {messages.value.length > 0 && <span class="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{messages.value.length}</span>}
          </button>
          <button
            onClick$={() => activeTab.value = 'settings'}
            class={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab.value === 'settings' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            ⚙️ Settings
          </button>
        </nav>

        <button
          onClick$={handleLogout}
          class="mt-auto px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
        >
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main class="flex-1 ml-64 p-8">
        {/* Overview Tab */}
        {activeTab.value === 'overview' && (
          <div>
            <h2 class="text-2xl font-bold mb-6">Dashboard Overview</h2>
            <div class="grid md:grid-cols-3 gap-6 mb-8">
              <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <p class="text-slate-400 text-sm">Total Projects</p>
                <p class="text-3xl font-bold mt-2 text-cyan-400">{projects.value.length}</p>
              </div>
              <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <p class="text-slate-400 text-sm">Blog Posts</p>
                <p class="text-3xl font-bold mt-2 text-blue-400">{blogPosts.value.length}</p>
              </div>
              <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <p class="text-slate-400 text-sm">Messages</p>
                <p class="text-3xl font-bold mt-2 text-purple-400">{messages.value.length}</p>
              </div>
            </div>

            {/* Recent Messages */}
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 class="text-lg font-semibold mb-4">Recent Messages</h3>
              {messages.value.length === 0 ? (
                <p class="text-slate-500 text-sm">No messages yet.</p>
              ) : (
                <div class="space-y-3">
                  {messages.value.slice(0, 5).map((msg: any) => (
                    <div key={msg._id} class="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                      <div>
                        <p class="text-sm font-medium">{msg.name}</p>
                        <p class="text-xs text-slate-500">{msg.email}</p>
                      </div>
                      <p class="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab.value === 'projects' && (
          <div>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold">Projects</h2>
              <button
                onClick$={() => {
                  editingItem.value = null;
                  formData.value = { published: true };
                  showProjectModal.value = true;
                }}
                class="bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-600 transition-all"
              >
                + Add Project
              </button>
            </div>

            {projects.value.length === 0 ? (
              <div class="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700">
                <p class="text-slate-400">No projects yet. Add your first project!</p>
              </div>
            ) : (
              <div class="grid gap-4">
                {projects.value.map((project: any) => (
                  <div key={project._id} class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <h3 class="font-semibold">{project.title_en}</h3>
                      <p class="text-sm text-slate-400 mt-1">{project.description_en?.substring(0, 80)}...</p>
                      <div class="flex gap-2 mt-2">
                        {project.technologies?.map((tech: string) => (
                          <span key={tech} class="text-xs bg-slate-700 px-2 py-0.5 rounded">{tech}</span>
                        ))}
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button
                        onClick$={() => {
                          editingItem.value = project;
                          formData.value = { ...project };
                          showProjectModal.value = true;
                        }}
                        class="px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                      >
                        Edit
                      </button>
                      <button
                        onClick$={() => deleteProject(project._id)}
                        class="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Project Modal */}
            {showProjectModal.value && (
              <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <h3 class="text-lg font-bold mb-4">{editingItem.value ? 'Edit Project' : 'Add New Project'}</h3>
                  <div class="space-y-4">
                    <div class="grid md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm text-slate-300 mb-1">Title (English)</label>
                        <input
                          type="text"
                          value={formData.value.title_en || ''}
                          onInput$={(e) => formData.value = { ...formData.value, title_en: (e.target as HTMLInputElement).value }}
                          class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-slate-300 mb-1">Title (Arabic)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={formData.value.title_ar || ''}
                          onInput$={(e) => formData.value = { ...formData.value, title_ar: (e.target as HTMLInputElement).value }}
                          class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div class="grid md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm text-slate-300 mb-1">Description (English)</label>
                        <textarea
                          value={formData.value.description_en || ''}
                          onInput$={(e) => formData.value = { ...formData.value, description_en: (e.target as HTMLTextAreaElement).value }}
                          rows={3}
                          class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
                        ></textarea>
                      </div>
                      <div>
                        <label class="block text-sm text-slate-300 mb-1">Description (Arabic)</label>
                        <textarea
                          dir="rtl"
                          value={formData.value.description_ar || ''}
                          onInput$={(e) => formData.value = { ...formData.value, description_ar: (e.target as HTMLTextAreaElement).value }}
                          rows={3}
                          class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
                        ></textarea>
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm text-slate-300 mb-1">Technologies (comma separated)</label>
                      <input
                        type="text"
                        value={(formData.value.technologies || []).join(', ')}
                        onInput$={(e) => formData.value = { ...formData.value, technologies: (e.target as HTMLInputElement).value.split(',').map((t: string) => t.trim()) }}
                        class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        placeholder="Node.js, MongoDB, React"
                      />
                    </div>
                    <div class="grid md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm text-slate-300 mb-1">Live URL</label>
                        <input
                          type="url"
                          value={formData.value.url || ''}
                          onInput$={(e) => formData.value = { ...formData.value, url: (e.target as HTMLInputElement).value }}
                          class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-slate-300 mb-1">GitHub URL</label>
                        <input
                          type="url"
                          value={formData.value.github || ''}
                          onInput$={(e) => formData.value = { ...formData.value, github: (e.target as HTMLInputElement).value }}
                          class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.value.published}
                        onChange$={(e) => formData.value = { ...formData.value, published: (e.target as HTMLInputElement).checked }}
                        class="rounded"
                      />
                      <label class="text-sm text-slate-300">Published</label>
                    </div>
                  </div>
                  <div class="flex gap-3 mt-6">
                    <button
                      onClick$={saveProject}
                      class="bg-cyan-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-cyan-600"
                    >
                      {editingItem.value ? 'Update' : 'Create'}
                    </button>
                    <button
                      onClick$={() => { showProjectModal.value = false; editingItem.value = null; }}
                      class="bg-slate-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blog Tab */}
        {activeTab.value === 'blog' && (
          <div>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold">Blog Posts</h2>
              <button
                onClick$={() => {
                  editingItem.value = null;
                  formData.value = { published: false };
                  showBlogModal.value = true;
                }}
                class="bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-600 transition-all"
              >
                + New Post
              </button>
            </div>

            {blogPosts.value.length === 0 ? (
              <div class="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700">
                <p class="text-slate-400">No blog posts yet. Write your first post!</p>
              </div>
            ) : (
              <div class="grid gap-4">
                {blogPosts.value.map((post: any) => (
                  <div key={post._id} class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="font-semibold">{post.title_en}</h3>
                        <span class={`text-xs px-2 py-0.5 rounded ${post.published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p class="text-sm text-slate-400 mt-1">{post.excerpt_en || post.content_en?.substring(0, 80)}...</p>
                    </div>
                    <div class="flex gap-2">
                      <button
                        onClick$={() => {
                          editingItem.value = post;
                          formData.value = { ...post };
                          showBlogModal.value = true;
                        }}
                        class="px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Blog Modal */}
            {showBlogModal.value && (
              <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <h3 class="text-lg font-bold mb-4">{editingItem.value ? 'Edit Post' : 'New Blog Post'}</h3>
                  <div class="space-y-4">
                    <div class="grid md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm text-slate-300 mb-1">Title (English)</label>
                        <input
                          type="text"
                          value={formData.value.title_en || ''}
                          onInput$={(e) => formData.value = { ...formData.value, title_en: (e.target as HTMLInputElement).value }}
                          class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-slate-300 mb-1">Title (Arabic)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={formData.value.title_ar || ''}
                          onInput$={(e) => formData.value = { ...formData.value, title_ar: (e.target as HTMLInputElement).value }}
                          class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm text-slate-300 mb-1">Content (English)</label>
                      <textarea
                        value={formData.value.content_en || ''}
                        onInput$={(e) => formData.value = { ...formData.value, content_en: (e.target as HTMLTextAreaElement).value }}
                        rows={8}
                        class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none font-mono"
                      ></textarea>
                    </div>
                    <div>
                      <label class="block text-sm text-slate-300 mb-1">Content (Arabic)</label>
                      <textarea
                        dir="rtl"
                        value={formData.value.content_ar || ''}
                        onInput$={(e) => formData.value = { ...formData.value, content_ar: (e.target as HTMLTextAreaElement).value }}
                        rows={8}
                        class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none font-mono"
                      ></textarea>
                    </div>
                    <div>
                      <label class="block text-sm text-slate-300 mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={(formData.value.tags || []).join(', ')}
                        onInput$={(e) => formData.value = { ...formData.value, tags: (e.target as HTMLInputElement).value.split(',').map((t: string) => t.trim()) }}
                        class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        placeholder="nodejs, devops, linux"
                      />
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.value.published}
                        onChange$={(e) => formData.value = { ...formData.value, published: (e.target as HTMLInputElement).checked }}
                        class="rounded"
                      />
                      <label class="text-sm text-slate-300">Publish immediately</label>
                    </div>
                  </div>
                  <div class="flex gap-3 mt-6">
                    <button
                      onClick$={saveBlogPost}
                      class="bg-cyan-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-cyan-600"
                    >
                      {editingItem.value ? 'Update' : 'Publish'}
                    </button>
                    <button
                      onClick$={() => { showBlogModal.value = false; editingItem.value = null; }}
                      class="bg-slate-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab.value === 'messages' && (
          <div>
            <h2 class="text-2xl font-bold mb-6">Messages</h2>
            {messages.value.length === 0 ? (
              <div class="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700">
                <p class="text-slate-400">No messages yet.</p>
              </div>
            ) : (
              <div class="grid gap-4">
                {messages.value.map((msg: any) => (
                  <div key={msg._id} class="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                    <div class="flex items-start justify-between">
                      <div>
                        <div class="flex items-center gap-3">
                          <h3 class="font-semibold">{msg.name}</h3>
                          <span class="text-xs text-slate-500">{msg.email}</span>
                        </div>
                        {msg.subject && <p class="text-sm text-cyan-400 mt-1">{msg.subject}</p>}
                        <p class="text-sm text-slate-300 mt-2">{msg.message}</p>
                        <p class="text-xs text-slate-600 mt-2">{new Date(msg.createdAt).toLocaleString()}</p>
                      </div>
                      <button
                        onClick$={() => deleteMessage(msg._id)}
                        class="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab.value === 'settings' && (
          <div>
            <h2 class="text-2xl font-bold mb-6">Settings</h2>
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 class="text-lg font-semibold mb-4">Site Information</h3>
              <div class="space-y-4">
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-slate-300 mb-1">Site Name</label>
                    <input type="text" value="Krrish IT Service" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm" disabled />
                  </div>
                  <div>
                    <label class="block text-sm text-slate-300 mb-1">Domain</label>
                    <input type="text" value="krrish.it" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm" disabled />
                  </div>
                </div>
                <div>
                  <label class="block text-sm text-slate-300 mb-1">Admin Email</label>
                  <input type="email" value="kerolsbadr@gmail.com" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm" disabled />
                </div>
              </div>
              <p class="text-xs text-slate-500 mt-4">To change these settings, update the environment variables in your Netlify dashboard.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Admin Dashboard | Krrish IT',
};
