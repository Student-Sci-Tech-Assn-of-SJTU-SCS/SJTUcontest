import api from "../utils/api";

export const resourceAPI = {
  getResources: async (
    { category, query = "", pageIndex = 1, pageSize = 12 },
    config = {},
  ) =>
    api.get("resources/", {
      ...config,
      params: {
        category,
        query,
        page_index: pageIndex,
        page_size: pageSize,
      },
    }),

  createResource: async (
    { category, title, description, attachment },
    config = {},
  ) => {
    const formData = new FormData();
    formData.append("category", category);
    formData.append("title", title);
    formData.append("description", description);
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
