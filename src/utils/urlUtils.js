// Helper to transform full remote API URLs to local Vite proxy endpoints to prevent browser CORS errors
export function getProxiedUrl(url) {
  if (!url) return url;
  if (url.startsWith('https://llm-ioipmcjm1v2f40ks.cn-beijing.maas.aliyuncs.com')) {
    return url.replace('https://llm-ioipmcjm1v2f40ks.cn-beijing.maas.aliyuncs.com', '');
  }
  if (url.startsWith('https://dashscope.aliyuncs.com')) {
    return url.replace('https://dashscope.aliyuncs.com', '/dashscope-proxy');
  }
  return url;
}

// Derive Aliyun DashScope task status query URL from task ID
export function getTaskStatusUrl(videoApiUrl, taskId) {
  if (!taskId) return '';
  if (!videoApiUrl) return `/api/v1/tasks/${taskId}`;
  const idx = videoApiUrl.indexOf('/api/v1/');
  if (idx !== -1) {
    const baseUrl = videoApiUrl.substring(0, idx + '/api/v1'.length);
    return `${baseUrl}/tasks/${taskId}`;
  }
  return `/api/v1/tasks/${taskId}`;
}
