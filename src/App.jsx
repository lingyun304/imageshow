import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Folder,
  ImageIcon
} from 'lucide-react';
import './App.css';

import { scanLocalDirectory } from './utils/metadataParser';
import { AI_STYLES, AI_COMPOSITIONS, AI_LIGHTINGS } from './constants/aiPrompts';
import { VIDEO_MODELS } from './constants/videoModels';
import { mediaCategoryTranslations, getMediaCategoryDisplayName } from './constants/translations';
import { parseTag } from './utils/tagParser';
import { getProxiedUrl, getTaskStatusUrl } from './utils/urlUtils';
import { generateRandomPrompts } from './utils/randomPromptEngine';

import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { GalleryFilter } from './components/Gallery/GalleryFilter';
import { GalleryGrid } from './components/Gallery/GalleryGrid';
import { MediaDetailModal } from './components/Gallery/MediaDetailModal';
import { TagBuilder } from './components/PromptEditor/TagBuilder';
import { PromptMaster } from './components/PromptEditor/PromptMaster';
import { VideoGenerator } from './components/VideoGen/VideoGenerator';
import { GuideTab } from './components/Guide/GuideTab';

function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'fresh-mint');

  useEffect(() => {
    document.documentElement.className = '';
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Navigation
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'gallery', 'guide', 'video', 'generator', 'ai-generator'

  // Image data state
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local directory import state
  const [isLocalImport, setIsLocalImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [activeDirHandle, setActiveDirHandle] = useState(null);

  // Gallery filters and search
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyWithMetadata, setOnlyWithMetadata] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedSampler, setSelectedSampler] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Detail Modal Viewer
  const [selectedImage, setSelectedImage] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [copiedField, setCopiedField] = useState('');

  // Prompt Generator States
  const [tagDatabase, setTagDatabase] = useState(null);
  const [selectedGenCategory, setSelectedGenCategory] = useState('Age');
  const [genSearchQuery, setGenSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [genModel, setGenModel] = useState('pony');
  const [genRating, setGenRating] = useState('safe');
  const [searchScope, setSearchScope] = useState('global');
  const [activeRandomStyle, setActiveRandomStyle] = useState(null);

  // AI Prompt Master States
  const [llmApiUrl, setLlmApiUrl] = useState(() => localStorage.getItem('llmApiUrl') || 'http://localhost:11434/v1');
  const [llmApiKey, setLlmApiKey] = useState(() => localStorage.getItem('llmApiKey') || '');
  const [llmModel, setLlmModel] = useState(() => localStorage.getItem('llmModel') || 'llama3:latest');
  const [llmPreset, setLlmPreset] = useState('ollama');
  const [aiUserIdea, setAiUserIdea] = useState('一个戴着发光耳机和未来护目镜的少女，独自坐在赛博朋克雨夜街头小吃摊前吃拉面，背景是层叠的霓虹灯牌与高科技摩天大楼。');
  const [aiSelectedStyle, setAiSelectedStyle] = useState('cyberpunk');
  const [aiSelectedComposition, setAiSelectedComposition] = useState('close-up');
  const [aiSelectedLighting, setAiSelectedLighting] = useState('neon');
  const [aiResultPrompt, setAiResultPrompt] = useState('');
  const [aiResultTranslation, setAiResultTranslation] = useState('');
  const [aiIsGenerating, setAiIsGenerating] = useState(false);
  const [aiConnectionTest, setAiConnectionTest] = useState('idle');
  const [aiConnectionError, setAiConnectionError] = useState('');
  const [showLlmSettings, setShowLlmSettings] = useState(false);

  // Video Generator States
  const [videoSubTab, setVideoSubTab] = useState('t2v');
  const [availableVideoModels, setAvailableVideoModels] = useState(() => {
    const savedCustom = localStorage.getItem('custom_video_models');
    if (savedCustom) {
      try {
        const parsed = JSON.parse(savedCustom);
        return [...VIDEO_MODELS, ...parsed];
      } catch (e) {
        return VIDEO_MODELS;
      }
    }
    return VIDEO_MODELS;
  });
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelTag, setNewModelTag] = useState('');
  const [videoModel, setVideoModel] = useState('happyhorse-1.1-t2v');
  const [videoPrompt, setVideoPrompt] = useState('微风轻拂过恬静的极简湖面，岸边浅绿色风铃叶慢速摇曳，画面光影柔和安详，细节细腻流畅。');

  useEffect(() => {
    const filtered = availableVideoModels.filter(m => !m.mode || m.mode === videoSubTab);
    if (filtered.length > 0 && !filtered.some(m => m.id === videoModel)) {
      setVideoModel(filtered[0].id);
    }
  }, [videoSubTab, availableVideoModels]);

  const [videoResolution, setVideoResolution] = useState('720P');
  const [videoAspectRatio, setVideoAspectRatio] = useState('16:9');
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoDurationMode, setVideoDurationMode] = useState('align');
  const [videoAudioSetting, setVideoAudioSetting] = useState('auto');
  const [videoSeed, setVideoSeed] = useState(935123587);
  const [videoImagePreview, setVideoImagePreview] = useState(null);
  const [videoFilePreview, setVideoFilePreview] = useState(null);
  const [videoEditRefImage, setVideoEditRefImage] = useState(null);
  const [videoRefImages, setVideoRefImages] = useState([]);

  const [dashscopeApiKey, setDashscopeApiKey] = useState(() => localStorage.getItem('dashscopeApiKey') || '');
  const [showDashscopeKey, setShowDashscopeKey] = useState(false);
  const [videoApiUrl, setVideoApiUrl] = useState(() => localStorage.getItem('videoApiUrl') || 'https://llm-ioipmcjm1v2f40ks.cn-beijing.maas.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis');
  const [showVideoApiSettings, setShowVideoApiSettings] = useState(false);
  const [videoIsGenerating, setVideoIsGenerating] = useState(false);
  const [videoProgressStatus, setVideoProgressStatus] = useState('');
  const [videoFilterModel, setVideoFilterModel] = useState('all');
  const [videoFilterSubTab, setVideoFilterSubTab] = useState('all');

  const [videoResults, setVideoResults] = useState([
    {
      id: 'video-res-1',
      model: 'HappyHorse-1.1-T2V',
      subTab: 't2v',
      title: '恬静湖光自然特写',
      prompt: '微风轻拂过恬静的极简湖面，岸边浅绿色风铃叶慢速摇曳，画面光影柔和安详，细节细腻流畅。',
      resolution: '720P',
      aspectRatio: '16:9',
      duration: 5,
      seed: 935123587,
      path: '/media/vedio/wan_2_2_14B_t2v-.mp4',
      createdAt: '2026-07-21 15:30'
    }
  ]);

  // Sync settings with local storage
  useEffect(() => { localStorage.setItem('dashscopeApiKey', dashscopeApiKey); }, [dashscopeApiKey]);
  useEffect(() => { localStorage.setItem('videoApiUrl', videoApiUrl); }, [videoApiUrl]);
  useEffect(() => { localStorage.setItem('llmApiUrl', llmApiUrl); }, [llmApiUrl]);
  useEffect(() => { localStorage.setItem('llmApiKey', llmApiKey); }, [llmApiKey]);
  useEffect(() => { localStorage.setItem('llmModel', llmModel); }, [llmModel]);

  // Initial Fetch Media Database
  useEffect(() => {
    fetch('/media/media-data.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load scanned metadata database.');
        return res.json();
      })
      .then(data => {
        setImages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading image metadata:', err);
        setLoading(false);
      });
  }, []);

  // Fetch Tag Database for Prompt Generator
  useEffect(() => {
    fetch('/tag-data.json')
      .then(res => res.json())
      .then(data => setTagDatabase(data))
      .catch(err => console.error('Error loading tag database:', err));
  }, []);

  // Show Toast Helper
  const showToast = (message, type = 'success') => {
    const isFieldCopy = type !== 'success' && type !== 'error' && type !== 'warning' && type !== 'info';
    setToast({ show: true, message, type: isFieldCopy ? 'success' : type });
    if (isFieldCopy) {
      setCopiedField(type);
      setTimeout(() => setCopiedField(''), 2000);
    }
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Copy to Clipboard
  const copyToClipboard = (text, fieldName, successMessage) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => showToast(successMessage || 'Successfully copied to clipboard!', fieldName))
      .catch(err => {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy to clipboard', 'error');
      });
  };

  // Local Directory Import Handler
  const handleImportDirectory = async () => {
    if (!window.showDirectoryPicker) {
      showToast('您的浏览器暂不支持 File System Access API。请重试或更换为 Edge/Chrome 浏览器。', 'error');
      return;
    }
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setActiveDirHandle(dirHandle);
      setImporting(true);
      setImportStatus('获取目录权限中...');

      let preScannedData = null;
      let mediaDataFileHandle = null;

      try {
        mediaDataFileHandle = await dirHandle.getFileHandle('media-data.json');
      } catch (e) {
        try {
          const mediaDirHandle = await dirHandle.getDirectoryHandle('media');
          mediaDataFileHandle = await mediaDirHandle.getFileHandle('media-data.json');
        } catch (err) {
          // Not found
        }
      }

      if (mediaDataFileHandle) {
        try {
          const file = await mediaDataFileHandle.getFile();
          const text = await file.text();
          preScannedData = JSON.parse(text);
          showToast('成功载入本地 media-data.json 缓存，已开启极速导入模式！');
        } catch (err) {
          console.error('Failed to parse media-data.json from selected directory:', err);
        }
      } else {
        showToast('提示：所选目录下未找到 media-data.json。已开启前端实时解析。', 'warning');
      }

      setImportStatus('正在扫描文件夹结构...');
      const localImages = await scanLocalDirectory(dirHandle, (status) => {
        setImportStatus(status);
      }, preScannedData);

      if (localImages.length === 0) {
        showToast('在该目录下未找到任何支持的媒体文件（图片/音视频）', 'error');
        setImporting(false);
        return;
      }

      setImages(localImages);
      setIsLocalImport(true);
      setSelectedCategory('all');
      setActiveTab('gallery');
      showToast(`🎉 成功导入并解析了 ${localImages.length} 个本地媒体文件！`);
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Directory import error:', e);
        showToast('导入本地文件夹失败，请重试', 'error');
      }
    } finally {
      setImporting(false);
      setImportStatus('');
    }
  };

  const handleLoadScannedData = () => {
    setLoading(true);
    fetch('/media/media-data.json')
      .then(res => res.json())
      .then(data => {
        setImages(data);
        setIsLocalImport(false);
        setSelectedCategory('all');
        setLoading(false);
        showToast('已成功切换回默认的已扫描数据库！');
      })
      .catch(err => {
        console.error('Error loading image metadata:', err);
        setLoading(false);
        showToast('加载数据库失败！', 'error');
      });
  };

  // Video Upload Handlers
  const handleVideoImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (videoSubTab === 'i2v') {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setVideoImagePreview(event.target.result);
        showToast('源图上传成功！(image1)', 'success');
      };
      reader.readAsDataURL(file);
    } else if (videoSubTab === 'edit') {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setVideoEditRefImage(event.target.result);
        showToast('编辑参考图上传成功！(image1)', 'success');
      };
      reader.readAsDataURL(file);
    } else if (videoSubTab === 'r2v') {
      let loadedCount = 0;
      const newPreviews = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          newPreviews.push(event.target.result);
          loadedCount++;
          if (loadedCount === files.length) {
            setVideoRefImages((prev) => {
              const combined = [...prev, ...newPreviews].slice(0, 9);
              showToast(`成功添加参考图！当前已整合 ${combined.length}/9 张参考图`, 'success');
              return combined;
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveRefImage = (index) => {
    setVideoRefImages((prev) => prev.filter((_, i) => i !== index));
    showToast(`已移除参考图 image${index + 1}`, 'info');
  };

  const handleVideoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        showToast('请上传有效的视频文件 (MP4 / WebM / MOV)', 'warning');
        return;
      }
      const url = URL.createObjectURL(file);
      setVideoFilePreview(url);
      showToast('待编辑的原视频上传成功！', 'success');
    }
  };

  const handleAddCustomModel = () => {
    if (!newModelName.trim()) {
      showToast('请输入模型名称/ID', 'warning');
      return;
    }
    const modelId = newModelName.trim();
    if (availableVideoModels.some(m => m.id === modelId)) {
      showToast('该模型名称已存在！', 'warning');
      return;
    }
    const newObj = {
      id: modelId,
      name: modelId,
      tag: newModelTag.trim() || '自定义视频大模型',
      provider: 'Custom',
      mode: videoSubTab || 't2v'
    };
    const updated = [...availableVideoModels, newObj];
    setAvailableVideoModels(updated);
    const customModels = updated.filter(m => !VIDEO_MODELS.some(base => base.id === m.id));
    localStorage.setItem('custom_video_models', JSON.stringify(customModels));
    setVideoModel(modelId);
    setNewModelName('');
    setNewModelTag('');
    setShowAddModelModal(false);
    showToast(`新模型 [${modelId}] 已添加并选中！`, 'success');
  };

  const handleDeleteCustomModel = (modelIdToDelete) => {
    if (VIDEO_MODELS.some(base => base.id === modelIdToDelete)) {
      showToast('系统内置原生模型不可删除！', 'warning');
      return;
    }
    const updated = availableVideoModels.filter(m => m.id !== modelIdToDelete);
    setAvailableVideoModels(updated);
    const customModels = updated.filter(m => !VIDEO_MODELS.some(base => base.id === m.id));
    localStorage.setItem('custom_video_models', JSON.stringify(customModels));
    if (videoModel === modelIdToDelete) {
      const remainingForMode = updated.filter(m => !m.mode || m.mode === videoSubTab);
      if (remainingForMode.length > 0) {
        setVideoModel(remainingForMode[0].id);
      }
    }
    showToast(`自定义模型 [${modelIdToDelete}] 已成功删除！`, 'success');
  };

  const updateVideoCard = (cardId, updates) => {
    setVideoResults(prev => prev.map(item => item.id === cardId ? { ...item, ...updates } : item));
  };

  const saveGeneratedVideoToCurrentDir = async (mediaUrl, taskId) => {
    const cleanTaskId = taskId ? String(taskId).replace(/[^a-zA-Z0-9_-]/g, '') : `task_${Date.now()}`;
    const fileName = `${cleanTaskId}.mp4`;
    let savedPath = mediaUrl || `/media/vedio/${fileName}`;

    try {
      if (activeDirHandle) {
        let targetVedioDirHandle;
        try {
          const mediaDirHandle = await activeDirHandle.getDirectoryHandle('media', { create: true });
          targetVedioDirHandle = await mediaDirHandle.getDirectoryHandle('vedio', { create: true });
        } catch (e) {
          targetVedioDirHandle = await activeDirHandle.getDirectoryHandle('vedio', { create: true });
        }
        const resp = await fetch(mediaUrl);
        const blob = await resp.blob();
        const fileHandle = await targetVedioDirHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        const savedFile = await fileHandle.getFile();
        savedPath = URL.createObjectURL(savedFile);
        showToast(`🎉 视频已成功存至本地 /vedio/${fileName}！`, 'success');
      } else {
        const link = document.createElement('a');
        link.href = mediaUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`🎉 自动导出视频至 /vedio (文件: ${fileName})`, 'success');
      }
    } catch (err) {
      console.error('Failed to auto save video:', err);
    }
    return savedPath;
  };

  const checkSingleTask = async (cardId, taskId, apiKey, rawApiUrl) => {
    if (!taskId || taskId.startsWith('task-')) {
      showToast('无法刷新未绑定真实 Task ID 的本地模拟记录', 'info');
      return true;
    }
    const proxiedTaskUrl = getProxiedUrl(getTaskStatusUrl(rawApiUrl, taskId));
    try {
      const resp = await fetch(proxiedTaskUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey.trim()}` }
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const taskOutput = data?.output || {};
      const status = taskOutput.task_status;

      if (status === 'SUCCEEDED') {
        const mediaUrl = taskOutput.video_url || taskOutput.results?.[0]?.url || taskOutput.result_url || '/media/vedio/wan_2_2_14B_t2v.mp4';
        const localSavedPath = await saveGeneratedVideoToCurrentDir(mediaUrl, taskId);
        updateVideoCard(cardId, {
          status: 'SUCCEEDED',
          path: localSavedPath || mediaUrl,
          completedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        });
        showToast(`任务 [${taskId.substring(0, 8)}] 渲染成功！`, 'success');
        return true;
      } else if (status === 'FAILED' || status === 'CANCELED') {
        const errReason = taskOutput.message || taskOutput.code || '渲染出现问题';
        updateVideoCard(cardId, { status: 'FAILED', errorMsg: `生成失败: ${errReason}` });
        showToast(`任务 [${taskId.substring(0, 8)}] 渲染失败`, 'error');
        return true;
      } else {
        updateVideoCard(cardId, { status: status || 'RUNNING', progressText: `模型渲染中 (${status || 'RUNNING'})...` });
        return false;
      }
    } catch (err) {
      console.error('Check task error:', err);
      return false;
    }
  };

  const pollTaskStatus = (cardId, taskId, apiKey, rawApiUrl) => {
    let attempts = 0;
    const maxAttempts = 60;
    const timer = setInterval(async () => {
      attempts++;
      const finished = await checkSingleTask(cardId, taskId, apiKey, rawApiUrl);
      if (finished || attempts >= maxAttempts) {
        clearInterval(timer);
        if (!finished && attempts >= maxAttempts) {
          updateVideoCard(cardId, { status: 'FAILED', errorMsg: '查询任务状态超时' });
        }
      } else {
        updateVideoCard(cardId, { pollCount: attempts, progressText: `模型渲染中... 已轮询 ${attempts} 次` });
      }
    }, 10000);
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      showToast('请输入视频提示词内容！', 'error');
      return;
    }
    if ((videoSubTab === 'i2v' || videoSubTab === 'r2v') && !videoImagePreview) {
      showToast('请上传参考图片/源图！', 'error');
      return;
    }
    if (!dashscopeApiKey.trim()) {
      setShowVideoApiSettings(true);
      showToast('请在接口设置中填入 API Key！', 'error');
      return;
    }

    setVideoIsGenerating(true);
    setVideoProgressStatus(`正在连接阿里 DashScope (${videoModel})...`);

    try {
      const proxiedSubmitUrl = getProxiedUrl(videoApiUrl);
      let mediaList = [];
      if (videoSubTab === 'i2v' && videoImagePreview) {
        mediaList.push({ type: 'first_frame', url: videoImagePreview });
      } else if (videoSubTab === 'r2v') {
        videoRefImages.forEach((imgUrl) => mediaList.push({ type: 'reference_image', url: imgUrl }));
      } else if (videoSubTab === 'edit') {
        if (videoFilePreview) mediaList.push({ type: 'video', url: videoFilePreview });
        if (videoEditRefImage) mediaList.push({ type: 'reference_image', url: videoEditRefImage });
      }

      const requestBody = {
        model: videoModel,
        input: {
          prompt: videoPrompt,
          ...(mediaList.length > 0 ? { media: mediaList } : {})
        },
        parameters: {
          resolution: videoResolution,
          ...(videoAspectRatio ? { ratio: videoAspectRatio } : {}),
          ...(videoSubTab === 'edit' && videoDurationMode === 'align' ? {} : { duration: videoDuration }),
          ...(videoAudioSetting ? { audio: videoAudioSetting } : {}),
          ...(videoSeed ? { seed: videoSeed } : {})
        }
      };

      const resp = await fetch(proxiedSubmitUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${dashscopeApiKey.trim()}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable'
        },
        body: JSON.stringify(requestBody)
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const resData = await resp.json();
      const taskId = resData?.output?.task_id;
      const initialStatus = resData?.output?.task_status || 'PENDING';

      showToast('视频生成任务派发成功！开启异步轮询...', 'success');

      const activeRefImage = videoSubTab === 'i2v' ? videoImagePreview
        : videoSubTab === 'r2v' ? (videoRefImages[0] || videoImagePreview)
          : videoSubTab === 'edit' ? (videoEditRefImage || videoImagePreview)
            : null;

      const cardId = `video-res-${Date.now()}`;
      const newVideoCard = {
        id: cardId,
        taskId: taskId || `task-${Date.now()}`,
        model: videoModel,
        subTab: videoSubTab,
        title: videoPrompt.substring(0, 15) + '...',
        prompt: videoPrompt,
        resolution: videoResolution,
        aspectRatio: videoAspectRatio,
        duration: videoDuration,
        seed: videoSeed,
        imagePreview: activeRefImage,
        refImages: videoRefImages,
        status: taskId ? initialStatus : 'SUCCEEDED',
        path: '',
        progressText: '任务排队中...',
        createdAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };

      setVideoResults(prev => [newVideoCard, ...prev]);

      if (taskId) {
        pollTaskStatus(cardId, taskId, dashscopeApiKey, videoApiUrl);
      } else {
        const localSavedPath = await saveGeneratedVideoToCurrentDir('/media/vedio/happyhorse-1.1-i2v-001.mp4', `mock-${Date.now()}`);
        updateVideoCard(cardId, { path: localSavedPath || '/media/vedio/happyhorse-1.1-i2v-001.mp4' });
      }
    } catch (err) {
      console.error(err);
      showToast(`视频生成失败: ${err.message}`, 'error');
    } finally {
      setVideoIsGenerating(false);
      setVideoProgressStatus('');
    }
  };

  // LLM Connection Test
  const testLlmConnection = async () => {
    if (!llmApiUrl) {
      showToast('请输入 API 接口地址！', 'error');
      return;
    }
    setAiConnectionTest('testing');
    setAiConnectionError('');
    try {
      const response = await fetch(`${llmApiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(llmApiKey ? { 'Authorization': `Bearer ${llmApiKey}` } : {})
        },
        body: JSON.stringify({
          model: llmModel,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5
        })
      });
      if (response.ok) {
        setAiConnectionTest('success');
        showToast('连接测试成功！', 'success');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      setAiConnectionTest('error');
      setAiConnectionError(err.message);
      showToast('连接测试失败！', 'error');
    }
  };

  const handleFetchLoadedModels = async () => {
    if (!llmApiUrl) {
      showToast('请先输入 API 接口地址！', 'error');
      return;
    }
    try {
      showToast('正在从接口获取可用模型列表...', 'info');
      const response = await fetch(`${llmApiUrl}/models`, {
        method: 'GET',
        headers: {
          ...(llmApiKey ? { 'Authorization': `Bearer ${llmApiKey}` } : {})
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const modelIds = data.data.map(m => m.id);
          setLlmModel(modelIds[0]);
          showToast(`已成功自动获取并加载模型: ${modelIds[0]}`, 'success');
        } else {
          showToast('未在接口端检测到已加载的模型，请确保大模型已启用。', 'warning');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error(err);
      showToast('获取模型列表失败，请检查地址是否正确或是否存在跨域限制。', 'error');
    }
  };

  // LLM Prompt Expansion
  const handleGenerateAIPrompt = async () => {
    if (!aiUserIdea.trim()) {
      showToast('请先输入您的创意脑洞描述！', 'error');
      return;
    }
    setAiIsGenerating(true);
    setAiResultPrompt('');
    setAiResultTranslation('');

    const styleObj = AI_STYLES.find(s => s.id === aiSelectedStyle);
    const compObj = AI_COMPOSITIONS.find(c => c.id === aiSelectedComposition);
    const lightObj = AI_LIGHTINGS.find(l => l.id === aiSelectedLighting);

    const systemPrompt = `You are a professional AI image generation prompt specialist. Expand the core idea into a rich English prompt paragraph and a Chinese translation. Output strictly in JSON: {"prompt": "...", "translation": "..."}`;
    const userPrompt = `Idea: ${aiUserIdea}, Style: ${styleObj?.prompt}, Composition: ${compObj?.prompt}, Lighting: ${lightObj?.prompt}`;

    try {
      const response = await fetch(`${llmApiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(llmApiKey ? { 'Authorization': `Bearer ${llmApiKey}` } : {})
        },
        body: JSON.stringify({
          model: llmModel,
          messages: [{ role: 'user', content: `${systemPrompt}\n${userPrompt}` }],
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      let content = data.choices?.[0]?.message?.content?.trim() || '';
      if (content.startsWith('```json')) content = content.substring(7);
      if (content.endsWith('```')) content = content.substring(0, content.length - 3);

      try {
        const parsed = JSON.parse(content.trim());
        setAiResultPrompt(parsed.prompt || content);
        setAiResultTranslation(parsed.translation || '');
        showToast('创意提示词生成成功！', 'success');
      } catch (e) {
        setAiResultPrompt(content);
        setAiResultTranslation('原始回复已渲染');
      }
    } catch (err) {
      showToast('生成失败，请检查配置！', 'error');
    } finally {
      setAiIsGenerating(false);
    }
  };

  // Tag Builder Handlers
  const handleToggleTag = (rawTag, category) => {
    const isSelected = selectedTags.some(t => t.raw === rawTag);
    if (isSelected) {
      setSelectedTags(selectedTags.filter(t => t.raw !== rawTag));
    } else {
      const { clean, weight } = parseTag(rawTag);
      let zh = '';
      if (tagDatabase && tagDatabase[category]) {
        const found = tagDatabase[category].tags.find(t => (Array.isArray(t) ? t[0] : t) === rawTag);
        if (found && Array.isArray(found)) zh = found[1];
      }
      setSelectedTags([...selectedTags, { raw: rawTag, clean, weight, category, zh }]);
    }
  };

  const handleAdjustWeight = (rawTag, delta) => {
    setSelectedTags(selectedTags.map(t => {
      if (t.raw === rawTag) {
        const newWeight = Math.round((t.weight + delta) * 10) / 10;
        if (newWeight >= 0.1 && newWeight <= 2.5) return { ...t, weight: newWeight };
      }
      return t;
    }));
  };

  const handleRandomGenerate = (styleKey) => {
    generateRandomPrompts({
      styleKey,
      tagDatabase,
      genRating,
      setGenModel,
      setGenRating,
      setSelectedTags,
      setActiveRandomStyle,
      showToast
    });
  };

  // Filter Gallery Items
  const categories = ['all', ...new Set(images.map(img => img.category))];
  const models = [...new Set(images.map(img => img.metadata?.model).filter(Boolean))];
  const samplers = [...new Set(images.map(img => img.metadata?.sampler).filter(Boolean))];

  const getFilteredImages = () => {
    return images.filter(img => {
      if (selectedCategory !== 'all' && img.category !== selectedCategory) return false;
      if (onlyWithMetadata && !img.metadata?.hasMetadata) return false;
      if (selectedModel && img.metadata?.model !== selectedModel) return false;
      if (selectedSampler && img.metadata?.sampler !== selectedSampler) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          (img.metadata?.prompt || '').toLowerCase().includes(q) ||
          img.filename.toLowerCase().includes(q) ||
          (img.metadata?.model || '').toLowerCase().includes(q) ||
          img.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  };

  const filteredImages = getFilteredImages();

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage?.id);
    if (currentIndex > 0) setSelectedImage(filteredImages[currentIndex - 1]);
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage?.id);
    if (currentIndex < filteredImages.length - 1) setSelectedImage(filteredImages[currentIndex + 1]);
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedModel('');
    setSelectedSampler('');
    setOnlyWithMetadata(false);
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      <Toast toast={toast} />

      {/* Top Header & Theme switcher */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        onImportDirectory={handleImportDirectory}
        onLoadScannedData={handleLoadScannedData}
        isLocalImport={isLocalImport}
        importing={importing}
      />

      {/* Main Tab Content */}
      <main className="main-layout animate-fade-in">
        {/* HOMEPAGE TAB */}
        {activeTab === 'home' && (
          <div className="home-tab animate-fade-in">
            <section className="hero-section glass-panel">
              {theme === 'dynamic-anime' && (
                <div className="anime-floating-particles">
                  <div className="bubble bubble-1"></div>
                  <div className="bubble bubble-2"></div>
                  <div className="bubble bubble-3"></div>
                </div>
              )}
              <div className="hero-glow"></div>
              <div className="hero-content">
                <span className="hero-badge"><Sparkles size={14} /> AI Image Prompt Database</span>
                <h1 className="hero-title">
                  解密 AI 创作的 <span className="gradient-text">提示词密码</span>
                </h1>
                <p className="hero-description">
                  PromptMedia 是一款专为 ComfyUI 与 AI 艺术创作者打造的本地多媒体分类展示网站。
                  无需繁琐的后端部署，通过扫描本地文件夹即可瞬间提取 PNG/WebP 图像元数据中的生成参数，并支持音视频文件预览。
                </p>
                <div className="hero-buttons">
                  <button className="btn-primary" onClick={() => setActiveTab('gallery')}>
                    浏览分类媒体库 <ArrowRight size={18} />
                  </button>
                  <button className="btn-secondary" onClick={() => setActiveTab('guide')}>
                    查看部署使用说明
                  </button>
                </div>
              </div>
            </section>

            <section className="stats-grid">
              <div className="stat-card glass-panel">
                <div className="stat-icon-wrapper purple"><Database size={24} /></div>
                <div className="stat-info">
                  <div className="stat-num">{loading ? '...' : images.length}</div>
                  <div className="stat-label">已扫描本地媒体</div>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon-wrapper cyan"><Layers size={24} /></div>
                <div className="stat-info">
                  <div className="stat-num">{loading ? '...' : categories.length - 1}</div>
                  <div className="stat-label">媒体分类目录</div>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon-wrapper emerald"><Sparkles size={24} /></div>
                <div className="stat-info">
                  <div className="stat-num">{loading ? '...' : `${images.length > 0 ? Math.round((images.filter(i => i.metadata?.hasMetadata).length / images.length) * 100) : 0}%`}</div>
                  <div className="stat-label">ComfyUI 元数据覆盖率</div>
                </div>
              </div>
            </section>

            {/* Features Info */}
            <section className="info-block-section">
              <h2 className="section-title">核心功能 & 特色</h2>
              <div className="info-grid">
                <div className="info-card glass-panel">
                  <h3>📂 自动分类展示</h3>
                  <p>只需按照分类创建本地文件夹（例如 nature, portraits），并将生成的媒体文件放入，系统会自动将文件夹名称映射为网站的分类标签，结构清晰，完全脱机运行。</p>
                </div>
                <div className="info-card glass-panel">
                  <h3>🧠 ComfyUI 元数据提取</h3>
                  <p>原生支持 PNG 与 WebP 文件块分析，直接提取并还原 ComfyUI 生成媒体时嵌入的完整提示词、负向提示词、Seed、Steps、采样器、大模型等参数。</p>
                </div>
                <div className="info-card glass-panel">
                  <h3>🔗 零后端静态体验</h3>
                  <p>通过极致优化的打包逻辑，整个网站均为前端静态页面。仅通过一个本地 Node 扫描脚本即可实时同步最新媒体并生成前端数据库，速度飞快，部署极简。</p>
                </div>
              </div>
            </section>

            {/* Category Quick Preview */}
            <section className="category-preview-section">
              <h2 className="section-title">媒体类别预览</h2>
              <div className="category-grid">
                {loading ? (
                  <div className="loading-spinner">加载分类中...</div>
                ) : (
                  categories.filter(cat => cat !== 'all').map(cat => {
                    const catImages = images.filter(img => img.category === cat);
                    const coverImgObj = catImages.find(img => img.type === 'image');
                    const coverImg = coverImgObj?.path || '';
                    return (
                      <div
                        key={cat}
                        className="cat-preview-card glass-panel"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setActiveTab('gallery');
                        }}
                        style={coverImg ? {
                          backgroundImage: `linear-gradient(to bottom, rgba(10, 15, 30, 0.4), rgba(7, 9, 14, 0.95)), url('${coverImg.replace(/'/g, "\\'")}')`
                        } : {}}
                      >
                        <div className="cat-preview-content">
                          <Folder className="cat-icon" size={24} />
                          <h3>{getMediaCategoryDisplayName(cat)}</h3>
                          <span className="cat-count">{catImages.length} 个媒体</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div className="gallery-tab">
            <GalleryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onlyWithMetadata={onlyWithMetadata}
              setOnlyWithMetadata={setOnlyWithMetadata}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              selectedSampler={selectedSampler}
              setSelectedSampler={setSelectedSampler}
              availableModels={models}
              availableSamplers={samplers}
              showFiltersPanel={showFiltersPanel}
              setShowFiltersPanel={setShowFiltersPanel}
              images={images}
              resetFilters={resetFilters}
            />

            <GalleryGrid
              loading={loading}
              filteredImages={filteredImages}
              setSelectedImage={setSelectedImage}
              resetFilters={resetFilters}
            />
          </div>
        )}

        {/* PROMPT GENERATOR TAB */}
        {activeTab === 'generator' && (
          <TagBuilder
            genModel={genModel}
            setGenModel={setGenModel}
            genRating={genRating}
            setGenRating={setGenRating}
            searchScope={searchScope}
            setSearchScope={setSearchScope}
            handleRandomGenerate={handleRandomGenerate}
            activeRandomStyle={activeRandomStyle}
            tagDatabase={tagDatabase}
            selectedGenCategory={selectedGenCategory}
            setSelectedGenCategory={setSelectedGenCategory}
            genSearchQuery={genSearchQuery}
            setGenSearchQuery={setGenSearchQuery}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            handleToggleTag={handleToggleTag}
            handleAdjustWeight={handleAdjustWeight}
            setActiveRandomStyle={setActiveRandomStyle}
          />
        )}

        {/* AI PROMPT MASTER TAB */}
        {activeTab === 'ai-generator' && (
          <PromptMaster
            llmApiUrl={llmApiUrl}
            setLlmApiUrl={setLlmApiUrl}
            llmApiKey={llmApiKey}
            setLlmApiKey={setLlmApiKey}
            llmModel={llmModel}
            setLlmModel={setLlmModel}
            llmPreset={llmPreset}
            setLlmPreset={setLlmPreset}
            showLlmSettings={showLlmSettings}
            setShowLlmSettings={setShowLlmSettings}
            aiConnectionTest={aiConnectionTest}
            aiConnectionError={aiConnectionError}
            testLlmConnection={testLlmConnection}
            aiSelectedStyle={aiSelectedStyle}
            setAiSelectedStyle={setAiSelectedStyle}
            aiSelectedComposition={aiSelectedComposition}
            setAiSelectedComposition={setAiSelectedComposition}
            aiSelectedLighting={aiSelectedLighting}
            setAiSelectedLighting={setAiSelectedLighting}
            aiUserIdea={aiUserIdea}
            setAiUserIdea={setAiUserIdea}
            aiIsGenerating={aiIsGenerating}
            handleGenerateAIPrompt={handleGenerateAIPrompt}
            aiResultPrompt={aiResultPrompt}
            aiResultTranslation={aiResultTranslation}
            showToast={showToast}
            handleFetchLoadedModels={handleFetchLoadedModels}
          />
        )}

        {/* VIDEO GENERATOR TAB */}
        {activeTab === 'video' && (
          <VideoGenerator
            videoSubTab={videoSubTab}
            setVideoSubTab={setVideoSubTab}
            videoFilterSubTab={videoFilterSubTab}
            setVideoFilterSubTab={setVideoFilterSubTab}
            videoFilterModel={videoFilterModel}
            setVideoFilterModel={setVideoFilterModel}
            availableVideoModels={availableVideoModels}
            videoModel={videoModel}
            setVideoModel={setVideoModel}
            showAddModelModal={showAddModelModal}
            setShowAddModelModal={setShowAddModelModal}
            newModelName={newModelName}
            setNewModelName={setNewModelName}
            newModelTag={newModelTag}
            setNewModelTag={setNewModelTag}
            handleAddCustomModel={handleAddCustomModel}
            handleDeleteCustomModel={handleDeleteCustomModel}
            showVideoApiSettings={showVideoApiSettings}
            setShowVideoApiSettings={setShowVideoApiSettings}
            dashscopeApiKey={dashscopeApiKey}
            setDashscopeApiKey={setDashscopeApiKey}
            showDashscopeKey={showDashscopeKey}
            setShowDashscopeKey={setShowDashscopeKey}
            videoApiUrl={videoApiUrl}
            setVideoApiUrl={setVideoApiUrl}
            videoFilePreview={videoFilePreview}
            setVideoFilePreview={setVideoFilePreview}
            videoEditRefImage={videoEditRefImage}
            setVideoEditRefImage={setVideoEditRefImage}
            videoRefImages={videoRefImages}
            handleRemoveRefImage={handleRemoveRefImage}
            videoImagePreview={videoImagePreview}
            setVideoImagePreview={setVideoImagePreview}
            videoPrompt={videoPrompt}
            setVideoPrompt={setVideoPrompt}
            videoResolution={videoResolution}
            setVideoResolution={setVideoResolution}
            videoAspectRatio={videoAspectRatio}
            setVideoAspectRatio={setVideoAspectRatio}
            videoDuration={videoDuration}
            setVideoDuration={setVideoDuration}
            videoDurationMode={videoDurationMode}
            setVideoDurationMode={setVideoDurationMode}
            videoAudioSetting={videoAudioSetting}
            setVideoAudioSetting={setVideoAudioSetting}
            videoSeed={videoSeed}
            setVideoSeed={setVideoSeed}
            videoIsGenerating={videoIsGenerating}
            videoProgressStatus={videoProgressStatus}
            handleGenerateVideo={handleGenerateVideo}
            videoResults={videoResults}
            checkSingleTask={checkSingleTask}
            handleVideoImageUpload={handleVideoImageUpload}
            handleVideoFileUpload={handleVideoFileUpload}
            copyToClipboard={copyToClipboard}
            copiedField={copiedField}
          />
        )}

        {/* GUIDE TAB */}
        {activeTab === 'guide' && (
          <GuideTab />
        )}
      </main>

      {/* DETAIL MODAL VIEWER */}
      {selectedImage && (
        <MediaDetailModal
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          handlePrevImage={handlePrevImage}
          handleNextImage={handleNextImage}
          isFirstImage={filteredImages.findIndex(img => img.id === selectedImage.id) === 0}
          isLastImage={filteredImages.findIndex(img => img.id === selectedImage.id) === filteredImages.length - 1}
          copyToClipboard={copyToClipboard}
          copiedField={copiedField}
        />
      )}
    </div>
  );
}

export default App;
