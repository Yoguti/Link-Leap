let shortcuts = {};

function showSuccess() {
  const success = document.getElementById('success');
  success.classList.add('show');
  setTimeout(() => success.classList.remove('show'), 2000);
}

function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function renderShortcuts() {
  const container = document.getElementById('shortcuts');
  if (Object.keys(shortcuts).length === 0) {
    container.innerHTML = '<div class="empty-state">No shortcuts yet. Add one below!</div>';
    return;
  }

  container.innerHTML = Object.entries(shortcuts)
    .map(([key, url]) => `
      <div class="shortcut">
        <div class="shortcut-key">${key}</div>
        <div class="shortcut-url">${url}</div>
        <button class="delete-btn" data-shortcut="${key}">×</button>
      </div>
    `)
    .join('');
}

document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const shortcutInput = document.getElementById('shortcut');
  const urlInput = document.getElementById('url');
  const shortcut = shortcutInput.value.trim();
  const url = urlInput.value.trim();

  // Reset errors
  document.getElementById('shortcutError').style.display = 'none';
  document.getElementById('urlError').style.display = 'none';

  // Validate
  if (shortcuts[shortcut]) {
    document.getElementById('shortcutError').style.display = 'block';
    return;
  }

  if (!validateUrl(url)) {
    document.getElementById('urlError').style.display = 'block';
    return;
  }

  // Save
  await browser.runtime.sendMessage({
    action: 'saveShortcut',
    shortcut,
    url
  });

  shortcuts[shortcut] = url;
  renderShortcuts();
  shortcutInput.value = '';
  urlInput.value = '';
  showSuccess();
});

document.getElementById('shortcuts').addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const shortcut = e.target.dataset.shortcut;
    await browser.runtime.sendMessage({
      action: 'deleteShortcut',
      shortcut
    });
    delete shortcuts[shortcut];
    renderShortcuts();
  }
});

// Load existing shortcuts
browser.runtime.sendMessage({ action: 'getShortcuts' })
  .then(response => {
    shortcuts = response.shortcuts;
    renderShortcuts();
  });