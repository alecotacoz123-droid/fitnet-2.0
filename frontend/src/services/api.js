const BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('fitnet_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.error || 'Ocurrió un error en la solicitud.';
    throw new Error(errorMsg);
  }
  return data;
};

// Generic Request Helper
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    ...getHeaders(),
    ...options.headers,
  };

  // If body is FormData, don't set Content-Type so the browser does it automatically
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);
  return handleResponse(response);
};

// AuthService
export const authService = {
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    localStorage.setItem('fitnet_token', data.token);
    localStorage.setItem('fitnet_user', JSON.stringify(data.user));
    return data;
  },

  register: async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });
    localStorage.setItem('fitnet_token', data.token);
    localStorage.setItem('fitnet_user', JSON.stringify(data.user));
    return data;
  },

  logout: () => {
    localStorage.removeItem('fitnet_token');
    localStorage.removeItem('fitnet_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('fitnet_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  recoverPassword: (email) => {
    return apiRequest('/auth/recover-password', {
      method: 'POST',
      body: { email },
    });
  },

  verifyResetCode: (email, code) => {
    return apiRequest('/auth/verify-code', {
      method: 'POST',
      body: { email, code },
    });
  },

  resetPassword: (email, code, new_password) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { email, code, new_password },
    });
  },

  getProfile: () => {
    return apiRequest('/auth/profile');
  },

  updateProfile: async (profileData) => {
    const data = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: profileData,
    });
    localStorage.setItem('fitnet_user', JSON.stringify(data.user));
    return data;
  },

  getPublicProfile: (username) => {
    return apiRequest(`/auth/profile/${username}`);
  },

  follow: (userId) => {
    return apiRequest(`/auth/profile/${userId}/follow`, { method: 'POST' });
  },

  unfollow: (userId) => {
    return apiRequest(`/auth/profile/${userId}/unfollow`, { method: 'POST' });
  },
};

// PostService
export const postService = {
  createPost: (formData) => {
    // FormData goes here, headers are custom
    return apiRequest('/posts', {
      method: 'POST',
      body: formData,
    });
  },

  getFeed: (page = 1, limit = 10) => {
    return apiRequest(`/posts?page=${page}&limit=${limit}`);
  },

  toggleLike: (postId) => {
    return apiRequest(`/posts/${postId}/like`, { method: 'POST' });
  },

  addComment: (postId, content) => {
    return apiRequest(`/posts/${postId}/comment`, {
      method: 'POST',
      body: { content },
    });
  },

  search: (query) => {
    return apiRequest(`/posts/search?query=${encodeURIComponent(query)}`);
  },

  updatePost: (postId, { title, content }) => {
    return apiRequest(`/posts/${postId}`, {
      method: 'PUT',
      body: { title, content },
    });
  },

  deletePost: (postId) => {
    return apiRequest(`/posts/${postId}`, { method: 'DELETE' });
  },
};

// GroupService
export const groupService = {
  createGroup: (groupData) => {
    return apiRequest('/groups', {
      method: 'POST',
      body: groupData,
    });
  },

  getGroups: () => {
    return apiRequest('/groups');
  },

  getGroupDetail: (groupId) => {
    return apiRequest(`/groups/${groupId}/detail`);
  },

  requestJoin: (groupId) => {
    return apiRequest(`/groups/${groupId}/join`, { method: 'POST' });
  },

  manageMember: (groupId, userId, status) => {
    return apiRequest(`/groups/${groupId}/members/${userId}`, {
      method: 'PUT',
      body: { status },
    });
  },

  getPendingRequests: () => {
    return apiRequest('/groups/pending');
  },

  getMyGroups: () => {
    return apiRequest('/groups/my-groups');
  },

  leaveGroup: (groupId) => {
    return apiRequest(`/groups/${groupId}/leave`, { method: 'DELETE' });
  },

  removeMember: (groupId, userId) => {
    return apiRequest(`/groups/${groupId}/members/${userId}`, { method: 'DELETE' });
  },

  deleteGroup: (groupId) => {
    return apiRequest(`/groups/${groupId}`, { method: 'DELETE' });
  },
};

// LogService
export const logService = {
  getActivityLogs: () => {
    return apiRequest('/logs/activity');
  },

  getNotifications: () => {
    return apiRequest('/logs/notifications');
  },

  markNotificationsRead: () => {
    return apiRequest('/logs/notifications/read', { method: 'PUT' });
  },

  getDashboardMetrics: () => {
    return apiRequest('/logs/metrics');
  },
};

// AdminService
export const adminService = {
  getStats: () => {
    return apiRequest('/admin/stats');
  },

  getUsers: () => {
    return apiRequest('/admin/users');
  },

  updateRole: (userId, role) => {
    return apiRequest(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: { role },
    });
  },

  deleteUser: (userId) => {
    return apiRequest(`/admin/users/${userId}`, { method: 'DELETE' });
  },

  deletePost: (postId) => {
    return apiRequest(`/admin/posts/${postId}`, { method: 'DELETE' });
  },

  triggerBackup: () => {
    return apiRequest('/admin/backup', { method: 'POST' });
  },
};

// ChatbotService
export const chatbotService = {
  sendMessage: (message) => {
    return apiRequest('/chatbot', {
      method: 'POST',
      body: { message },
    });
  },
};

// FitnessService
export const fitnessService = {
  upsertProfile: (profileData) => {
    return apiRequest('/fitness/profile', {
      method: 'POST',
      body: profileData,
    });
  },

  getProfile: () => {
    return apiRequest('/fitness/profile');
  },

  logProgress: (progressData) => {
    return apiRequest('/fitness/progress', {
      method: 'POST',
      body: progressData,
    });
  },

  getProgressLogs: () => {
    return apiRequest('/fitness/progress');
  },

  getTrainingPlan: (regenerate = false) => {
    return apiRequest(`/fitness/plan${regenerate ? '?regenerate=true' : ''}`);
  },

  getInsights: () => {
    return apiRequest('/fitness/insights');
  },

  getCalendarEvents: () => {
    return apiRequest('/fitness/calendar');
  },

  markCalendarEvent: (eventId, status) => {
    return apiRequest(`/fitness/calendar/${eventId}/complete`, {
      method: 'POST',
      body: { status }
    });
  },

  getStats: () => {
    return apiRequest('/fitness/stats');
  },

  submitSurvey: (surveyData) => {
    return apiRequest('/fitness/survey', {
      method: 'POST',
      body: surveyData
    });
  },

  getSurveyResults: () => {
    return apiRequest('/fitness/survey/results');
  }
};
