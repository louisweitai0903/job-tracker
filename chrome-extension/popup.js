const DEFAULT_API_URL = 'http://localhost:8000';
const DEFAULT_MODEL = 'gemini-2.5-pro';

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const urlInput = document.getElementById('urlInput');
  const addBtn = document.getElementById('addBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
  
  const mainView = document.getElementById('mainView');
  const settingsView = document.getElementById('settingsView');
  
  const apiUrlInput = document.getElementById('apiUrlInput');
  const modelSelect = document.getElementById('modelSelect');
  
  const statusArea = document.getElementById('statusArea');
  const statusText = document.getElementById('statusText');
  const spinner = document.getElementById('spinner');

  // Load Settings
  chrome.storage.sync.get(['apiUrl', 'aiModel'], (data) => {
    apiUrlInput.value = data.apiUrl || DEFAULT_API_URL;
    modelSelect.value = data.aiModel || DEFAULT_MODEL;
  });

  // Navigation
  settingsBtn.addEventListener('click', () => {
    mainView.classList.remove('active');
    settingsView.classList.add('active');
  });

  cancelSettingsBtn.addEventListener('click', () => {
    settingsView.classList.remove('active');
    mainView.classList.add('active');
  });

  saveSettingsBtn.addEventListener('click', () => {
    chrome.storage.sync.set({
      apiUrl: apiUrlInput.value.replace(/\/$/, ''), // remove trailing slash
      aiModel: modelSelect.value
    }, () => {
      settingsView.classList.remove('active');
      mainView.classList.add('active');
    });
  });

  // Add Job Flow
  addBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) {
      showStatus('Please enter a valid URL.', 'error');
      return;
    }

    try {
      addBtn.disabled = true;
      
      const { apiUrl, aiModel } = await getSettings();
      const base = apiUrl + '/api';

      // 1. Parse URL
      showStatus('Scraping and parsing job details...', 'loading');
      const parseRes = await fetch(`${base}/jobs/parse-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, model: aiModel })
      });
      if (!parseRes.ok) throw new Error('Failed to parse job URL.');
      const parsedData = await parseRes.json();

      if (!parsedData.company || !parsedData.title) {
        throw new Error('Could not extract company and title. Is this a valid job posting?');
      }

      // 2. Create Job
      showStatus('Saving application to dashboard...', 'loading');
      const today = new Date().toISOString().split('T')[0];
      const createRes = await fetch(`${base}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: parsedData.company,
          title: parsedData.title,
          description: parsedData.description || '',
          link: url,
          status: 'Applied',
          date: today
        })
      });
      if (!createRes.ok) throw new Error('Failed to save job to database.');
      const createdJob = await createRes.json();

      // 3. Analyze Job (optional but great for fit score)
      showStatus('Analyzing profile fit...', 'loading');
      const analyzeRes = await fetch(`${base}/jobs/${createdJob.id}/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: aiModel })
      });
      
      if (!analyzeRes.ok) {
        // If analysis fails, the job was still saved
        showStatus('Saved, but AI analysis failed.', 'error');
        return;
      }

      showStatus('Success! Job added and analyzed.', 'success');
      urlInput.value = '';

    } catch (err) {
      showStatus(err.message, 'error');
    } finally {
      addBtn.disabled = false;
    }
  });

  // Helpers
  function getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['apiUrl', 'aiModel'], (data) => {
        resolve({
          apiUrl: data.apiUrl || DEFAULT_API_URL,
          aiModel: data.aiModel || DEFAULT_MODEL
        });
      });
    });
  }

  function showStatus(message, type) {
    statusArea.className = `status-area ${type === 'error' ? 'error' : type === 'success' ? 'success' : ''}`;
    statusText.textContent = message;
    
    if (type === 'loading') {
      spinner.classList.add('active');
    } else {
      spinner.classList.remove('active');
    }
  }
});
