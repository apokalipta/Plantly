<template>
  <section class="section bg-stone-50 text-stone-800">
    <div class="container">
      <div class="row">
        <div class="col-lg-3 mb-3">
          <div class="card shadow-sm border-0 p-3 rounded-2xl sidebar-card">
            <div class="sidebar-title">Forum</div>
            <div class="d-flex flex-column gap-2">
              <button class="side-pill" :class="{ active: filter === 'ALL' }" @click="filter = 'ALL'">Tout</button>
              <button class="side-pill" :class="{ active: filter === 'FAQ' }" @click="filter = 'FAQ'">FAQ</button>
              <button class="side-pill" :class="{ active: filter === 'MINE' }" @click="filter = 'MINE'">Mes posts</button>
            </div>
          </div>
        </div>

        <div class="col-lg-9">
          <div v-if="filter === 'FAQ'" class="card shadow-sm border-0 p-4 rounded-2xl">
            <h2 class="h4 mb-3">Questions Fréquentes</h2>
            <div v-for="(q, idx) in faq" :key="idx" class="mb-3">
              <div class="h6 mb-1">{{ q.q }}</div>
              <div class="text-muted">{{ q.a }}</div>
            </div>
          </div>

          <div v-else>
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div>
                <div class="page-kicker">Discussions</div>
                <h1 class="h4 mb-0">Forum Floraly</h1>
              </div>
              <button class="btn btn-emerald-premium" :disabled="!auth.isAuthenticated" @click="openCreate">
                Créer une discussion
              </button>
            </div>

            <Transition name="fade">
              <div v-if="showCreate" class="card shadow-sm border-0 p-4 rounded-2xl mb-3">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h2 class="h6 mb-0">Nouvelle discussion</h2>
                  <button class="btn btn-sm btn-link text-muted" @click="closeCreate" :disabled="forum.creating">Fermer</button>
                </div>

                <div class="row g-2">
                  <div class="col-12">
                    <input
                      v-model="formTitle"
                      class="field focus:ring-2 focus:ring-emerald-500"
                      placeholder="Titre"
                      :disabled="!auth.isAuthenticated || forum.creating"
                    />
                  </div>
                  <div class="col-12">
                    <textarea
                      v-model="formContent"
                      class="field field-area focus:ring-2 focus:ring-emerald-500"
                      rows="4"
                      placeholder="Écrivez votre message…"
                      :disabled="!auth.isAuthenticated || forum.creating"
                    ></textarea>
                  </div>
                  <div class="col-12">
                    <input type="file" accept="image/*" class="field field-file" @change="onFile" :disabled="!auth.isAuthenticated || forum.creating" />
                  </div>
                  <div class="col-12 d-flex justify-content-end gap-2">
                    <button class="btn btn-standard btn-outline-secondary" @click="closeCreate" :disabled="forum.creating">Annuler</button>
                    <button class="btn btn-emerald-premium" :disabled="!canPost" @click="submitDiscussion">
                      Publier
                    </button>
                  </div>
                </div>
                <div v-if="forum.error" class="alert alert-danger mt-3 mb-0">{{ forum.error }}</div>
              </div>
            </Transition>

            <div v-if="forum.loading" class="text-muted">Chargement…</div>
            <div v-else-if="filteredDiscussions.length === 0" class="card shadow-sm border-0 p-4 rounded-2xl empty-state">
              <div class="d-flex align-items-center gap-3">
                <div class="empty-icon" aria-hidden="true"><i class="fa fa-comments-o"></i></div>
                <div class="flex-grow-1">
                  <div class="h5 mb-1">Aucune discussion pour le moment</div>
                  <div class="text-muted">Lancez la première conversation, ou revenez plus tard.</div>
                </div>
                <button v-if="auth.isAuthenticated" class="btn btn-emerald-premium" @click="openCreate">Créer</button>
              </div>
            </div>

            <div v-for="d in filteredDiscussions" :key="d.id" class="card shadow-sm border-0 p-4 rounded-2xl discussion-card mb-3">
              <div class="d-flex align-items-start gap-3">
                <div class="avatar-wrap">
                  <img v-if="resolveImageUrl(d?.author?.avatarUrl)" :src="resolveImageUrl(d?.author?.avatarUrl)" alt="avatar" class="avatar-img" />
                  <div v-else class="avatar-fallback">{{ avatarLetter(d?.author?.username) }}</div>
                </div>
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center justify-content-between gap-2">
                    <div class="author-line">
                      <span class="author-name">{{ d?.author?.username || 'Utilisateur' }}</span>
                      <span class="author-date">{{ formatDate(d?.createdAt) }}</span>
                    </div>
                    <button class="btn btn-like" @click="toggleLike(d.id)">
                      {{ liked.has(String(d.id)) ? 'Aimé' : 'Like' }}
                    </button>
                  </div>

                  <div class="mt-2">
                    <div class="discussion-title">{{ d.title }}</div>
                    <div class="discussion-body text-muted" style="white-space: pre-wrap;">{{ d.content }}</div>
                  </div>

                  <div v-if="resolveImageUrl(d.imageUrl)" class="mt-3 rounded-2xl overflow-hidden">
                    <img :src="resolveImageUrl(d.imageUrl)" alt="image" style="width:100%; max-height:420px; object-fit:cover;" />
                  </div>

                  <div class="mt-3">
                    <button class="btn btn-standard btn-outline-secondary reply-btn" @click="toggleReply(d.id)">
                      Répondre
                    </button>
                  </div>

                  <div v-if="replyOpenId === String(d.id)" class="mt-3">
                    <div v-if="Array.isArray(d.comments) && d.comments.length > 0" class="mb-3">
                      <div v-for="c in d.comments" :key="c.id" class="comment">
                        <div class="d-flex align-items-center gap-2">
                          <div class="comment-avatar">
                            <img v-if="resolveImageUrl(c?.author?.avatarUrl)" :src="resolveImageUrl(c?.author?.avatarUrl)" alt="avatar" class="comment-avatar-img" />
                            <div v-else class="comment-avatar-fallback">{{ avatarLetter(c?.author?.username) }}</div>
                          </div>
                          <div class="flex-grow-1">
                            <div class="fw-semibold" style="font-size:.95rem;">{{ c?.author?.username || 'Utilisateur' }}</div>
                            <div class="text-muted" style="font-size:.8rem;">{{ formatDate(c?.createdAt) }}</div>
                          </div>
                        </div>
                        <div class="text-muted mt-2" style="white-space: pre-wrap;">{{ c.content }}</div>
                      </div>
                    </div>

                    <div v-if="!auth.isAuthenticated" class="text-muted">
                      Connectez-vous pour répondre.
                    </div>
                    <div v-else class="row g-2">
                      <div class="col-12">
                        <textarea v-model="commentDraft" class="field field-area focus:ring-2 focus:ring-emerald-500" rows="3" placeholder="Votre réponse…"></textarea>
                      </div>
                      <div class="col-12 d-flex justify-content-end">
                        <button class="btn btn-emerald-premium" :disabled="!commentDraft.trim()" @click="submitComment(d.id)">Envoyer</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useForumStore } from '../stores/forum';

const auth = useAuthStore();
const forum = useForumStore();

const filter = ref('ALL');
const replyOpenId = ref('');
const liked = ref(new Set());

const showCreate = ref(false);
const formTitle = ref('');
const formContent = ref('');
const formFile = ref(null);

const commentDraft = ref('');

const faq = [
  { q: 'Comment arroser mon Basilic ?', a: 'Arrosez quand le terreau est sec en surface. Évitez de laisser de l’eau stagner, et privilégiez de petites quantités régulières.' },
  { q: 'Différence entre Floraly Classique et Premium ?', a: 'Classique se concentre sur l’essentiel (capteurs, suivi), Premium ajoute des fonctions avancées comme un écran et une autonomie sur batterie.' },
  { q: 'Le pot est-il étanche ?', a: 'Oui, le pot est conçu pour un usage intérieur. Vérifiez simplement que la coupelle est correctement placée si vous la retirez pour le nettoyage.' },
];

onMounted(async () => {
  await forum.fetchDiscussions();
});

function openCreate() {
  if (!auth.isAuthenticated) return;
  showCreate.value = true;
}

function closeCreate() {
  if (forum.creating) return;
  showCreate.value = false;
}

const filteredDiscussions = computed(() => {
  const list = Array.isArray(forum.discussions) ? forum.discussions : [];
  if (filter.value === 'MINE') {
    const myUsername = String(localStorage.getItem('username') || '').trim();
    if (!auth.isAuthenticated) return [];
    if (!myUsername) return list;
    return list.filter((d) => String(d?.author?.username || '') === myUsername);
  }
  return list;
});

const canPost = computed(() => {
  if (!auth.isAuthenticated) return false;
  if (forum.creating) return false;
  if (!formTitle.value.trim()) return false;
  if (!formContent.value.trim()) return false;
  return true;
});

function onFile(e) {
  const f = e?.target?.files?.[0];
  formFile.value = f || null;
}

async function submitDiscussion() {
  if (!canPost.value) return;
  await forum.createDiscussion({ title: formTitle.value.trim(), content: formContent.value.trim(), file: formFile.value });
  formTitle.value = '';
  formContent.value = '';
  formFile.value = null;
  showCreate.value = false;
}

function toggleReply(id) {
  const sid = String(id || '');
  if (!sid) return;
  if (replyOpenId.value === sid) {
    replyOpenId.value = '';
    commentDraft.value = '';
    return;
  }
  replyOpenId.value = sid;
  commentDraft.value = '';
}

async function submitComment(discussionId) {
  const text = commentDraft.value.trim();
  if (!text) return;
  await forum.addComment(String(discussionId), text);
  commentDraft.value = '';
}

function toggleLike(id) {
  const sid = String(id || '');
  if (!sid) return;
  const next = new Set(liked.value);
  if (next.has(sid)) next.delete(sid);
  else next.add(sid);
  liked.value = next;
}

function avatarLetter(username) {
  const u = String(username || '').trim();
  if (!u) return 'A';
  return u.slice(0, 1).toUpperCase();
}

function resolveImageUrl(u) {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const root = base.endsWith('/api') ? base.slice(0, -4) : base;
  if (!u) return '';
  if (/^https?:\/\//.test(u)) return u;
  if (u.startsWith('/')) return `${root}${u}`;
  return u;
}

function formatDate(d) {
  const dt = d ? new Date(d) : null;
  if (!dt || Number.isNaN(dt.getTime())) return '';
  try {
    return dt.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dt.toISOString();
  }
}
</script>

<style scoped>
.bg-stone-50 { background: #fafaf9; }
.text-stone-800 { color: #292524; }
.rounded-2xl { border-radius: 1rem; }
.btn-emerald-premium { background: #065f46; color: #fff; border: 1px solid #065f46; border-radius: 9999px; padding: .6rem 1rem; font-weight: 600; }
.btn-emerald-premium:hover { background: #064e3b; border-color: #064e3b; color: #fff; }
.btn-emerald-premium:disabled { opacity: .5; cursor: not-allowed; }

.sidebar-title { font-weight: 700; font-size: 1rem; margin-bottom: .75rem; color: #292524; }
.side-pill { border: 1px solid rgba(0,0,0,0.06); background: #fff; padding: .55rem .75rem; border-radius: .9rem; text-align: left; color: #44403c; font-weight: 600; font-size: .95rem; transition: background-color .15s ease, border-color .15s ease, color .15s ease; }
.side-pill:hover { background: rgba(0,0,0,0.02); }
.side-pill.active { background: rgba(6,95,70,0.08); border-color: rgba(6,95,70,0.25); color: #065f46; }

.page-kicker { font-size: .85rem; font-weight: 700; letter-spacing: .06em; color: #78716c; text-transform: uppercase; margin-bottom: .25rem; }

.field { width: 100%; background: #f5f5f4; border: none; border-radius: .9rem; padding: .75rem .9rem; color: #292524; }
.field::placeholder { color: #a8a29e; }
.field:disabled { opacity: .65; }
.field-area { resize: vertical; }
.field-file { padding: .6rem .75rem; }
.field:focus { outline: none; }
.focus\:ring-2:focus { box-shadow: 0 0 0 2px var(--ring-color, rgba(16,185,129,0.55)); }
.focus\:ring-emerald-500 { --ring-color: rgba(16,185,129,0.55); }
.avatar-wrap { width: 44px; height: 44px; border-radius: 9999px; overflow: hidden; background: #e7e5e4; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #44403c; }

.discussion-card { background: #fff; }
.author-line { display: flex; align-items: baseline; gap: .6rem; }
.author-name { font-weight: 700; color: #292524; }
.author-date { font-size: .85rem; color: #78716c; }
.discussion-title { font-weight: 800; font-size: 1.1rem; margin-bottom: .35rem; }
.discussion-body { line-height: 1.5; }

.btn-like { border: 1px solid rgba(0,0,0,0.08); background: #fff; color: #44403c; border-radius: 9999px; padding: .35rem .7rem; font-weight: 600; font-size: .85rem; }
.btn-like:hover { background: rgba(0,0,0,0.02); }

.empty-state { background: #fff; }
.empty-icon { width: 44px; height: 44px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; background: rgba(6,95,70,0.10); color: #065f46; font-size: 1.1rem; }

.comment { background: rgba(0,0,0,0.015); border-radius: 1rem; padding: 12px; margin-top: 10px; }
.comment-avatar { width: 32px; height: 32px; border-radius: 9999px; overflow: hidden; background: #e7e5e4; display: flex; align-items: center; justify-content: center; flex: 0 0 auto; }
.comment-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.comment-avatar-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #44403c; font-size: .9rem; }
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease, transform .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
