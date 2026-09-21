import api from "../utils/api";

export const resourceAPI = {
  getResources: async (
    {
      category,
      query = "",
      pageIndex = 1,
      pageSize = 12,
      sortBy = "created_at",
      contestId = "",
      otherOnly = false,
    },
    config = {},
  ) =>
    api.get("resources/", {
      ...config,
      params: {
        category,
        query,
        page_index: pageIndex,
        page_size: pageSize,
        sort_by: sortBy,
        ...(contestId ? { contest_id: contestId } : {}),
        ...(otherOnly ? { other_only: true } : {}),
      },
    }),

  getResourceGroups: async ({ category, query = "" }, config = {}) =>
    api.get("resources/groups/", {
      ...config,
      params: { category, query },
    }),

  getContestOptions: async (config = {}) =>
    api.get("resources/contest-options/", config),

  getResource: async (resourceId, config = {}) =>
    api.get(`resources/${resourceId}/`, config),

  createResource: async (
    { category, title, contestId, otherContestName, description, attachment },
    config = {},
  ) => {
    const formData = new FormData();
    formData.append("category", category);
    formData.append("title", title);
    formData.append("description", description);
    if (contestId) formData.append("contest", contestId);
    if (otherContestName) {
      formData.append("other_contest_name", otherContestName);
    }
    if (attachment) formData.append("attachment", attachment);
    return api.post("resources/create/", formData, config);
  },

  downloadResource: async (resourceId, config = {}) =>
    api.get(`resources/${resourceId}/download/`, {
      ...config,
      responseType: "blob",
    }),

  deleteResource: async (resourceId, config = {}) =>
    api.delete(`resources/${resourceId}/delete/`, config),
};
