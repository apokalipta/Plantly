import { defineStore } from 'pinia';
import * as forumApi from '../api/forumApi';

export const useForumStore = defineStore('forum', {
  state: () => ({
    discussions: [] as any[],
    loading: false,
    error: '' as string,
    creating: false,
    replyingToId: '' as string,
  }),
  actions: {
    async fetchDiscussions(opts?: { silent?: boolean }) {
      const silent = !!opts?.silent;
      if (!silent) {
        this.loading = true;
        this.error = '';
      }
      try {
        const data = await forumApi.listDiscussions();
        this.discussions = Array.isArray(data) ? data : [];
      } catch (e: any) {
        if (!silent) this.error = e?.message || 'Erreur lors du chargement du forum';
      } finally {
        if (!silent) this.loading = false;
      }
    },

    async createDiscussion(payload: { title: string; content: string; file?: File | null }) {
      this.creating = true;
      this.error = '';
      try {
        const created = await forumApi.createDiscussion(payload);
        if (created) {
          this.discussions = [created, ...(this.discussions || [])];
        } else {
          await this.fetchDiscussions({ silent: true });
        }
        return created;
      } catch (e: any) {
        this.error = e?.message || 'Erreur lors de la création';
        throw e;
      } finally {
        this.creating = false;
      }
    },

    async addComment(discussionId: string, content: string) {
      this.error = '';
      try {
        const created = await forumApi.addComment(discussionId, content);
        const idx = (this.discussions || []).findIndex((d) => String(d?.id) === String(discussionId));
        if (idx >= 0) {
          const d = this.discussions[idx];
          const comments = Array.isArray(d?.comments) ? d.comments : [];
          this.discussions[idx] = { ...d, comments: [...comments, created].filter(Boolean) };
        }
        return created;
      } catch (e: any) {
        this.error = e?.message || 'Erreur lors de l’envoi du commentaire';
        throw e;
      }
    },
  },
});

