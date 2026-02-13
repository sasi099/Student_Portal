 
// Master Login Credentials
const MASTER_USERNAME = 'sasi099';
const MASTER_PASSWORD = 'sasi099';

// Check if user is logged in as master
function isMasterLoggedIn() {
  return sessionStorage.getItem('masterLoggedIn') === 'true';
}

// Master Login Modal
function showLoginModal() {
  const modal = document.getElementById('loginModal');
  if (!modal) {
    // Create modal if it doesn't exist
    const loginHTML = `
      <div id="loginModal" style="display: block; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);">
        <div style="background-color: #fefefe; margin: 10% auto; padding: 30px; border: 1px solid #888; border-radius: 8px; width: 350px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
          <span onclick="closeLoginModal()" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
          <h2 style="color: #001a4d; font-family: 'Roboto', sans-serif; text-align: center;">Master Login</h2>
          <form id="loginForm" onsubmit="handleLogin(event)" style="display: flex; flex-direction: column; gap: 15px;">
            <input type="text" id="username" placeholder="Username" required style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
            <input type="password" id="password" placeholder="Password" required style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
            <button type="submit" style="background-color: #4a6fa5; color: white; padding: 10px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Login</button>
          </form>
          <p id="loginError" style="color: red; text-align: center; display: none; margin-top: 10px;"></p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', loginHTML);
  } else {
    modal.style.display = 'block';
  }
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.style.display = 'none';
}

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (username === MASTER_USERNAME && password === MASTER_PASSWORD) {
    sessionStorage.setItem('masterLoggedIn', 'true');
    document.body.classList.add('master-logged-in');
    closeLoginModal();
    alert('✅ Successfully logged in as Master!');
    updateUIForLoginState();
  } else {
    const errorEl = document.getElementById('loginError');
    if (errorEl) {
      errorEl.textContent = '❌ Invalid credentials. Try again.';
      errorEl.style.display = 'block';
    }
  }
}

function masterLogout() {
  sessionStorage.setItem('masterLoggedIn', 'false');
  document.body.classList.remove('master-logged-in');
  alert('Logged out successfully');
  updateUIForLoginState();
}

function updateUIForLoginState() {
    const isMaster = isMasterLoggedIn();
    document.body.classList.toggle('master-logged-in', isMaster);
    
    const editContainer = document.getElementById('update-edit-container');
    if (editContainer) {
        editContainer.style.display = isMaster ? 'block' : 'none';
    }
    // Show/hide master-only content
    document.querySelectorAll('.master-only-content').forEach(el => {
        el.style.display = isMaster ? 'block' : 'none';
    });
    
    updateMasterLoginFooter();
}

function showYear(yearId) {
  document.querySelectorAll('.year-content').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(yearId);
  if (!target) return;
  target.classList.add('active');

  document.querySelectorAll('.sidebar button').forEach(btn => {
    const onclick = btn.getAttribute('onclick') || '';
    btn.classList.toggle('active', onclick.includes(yearId));
  });

  if (yearId === 'updates') {
    loadAndUpdateMessage();
  }
}

async function _doUpload(file, branch, category, subject) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = {};
    if (isMasterLoggedIn()) {
        headers['X-Master-Username'] = MASTER_USERNAME;
        headers['X-Master-Password'] = MASTER_PASSWORD;
    }

    try {
        const response = await fetch(`/upload/${branch}/${category}`, {
            method: 'POST',
            body: formData,
            headers: headers,
        });

        if (response.ok) {
            const downloadUrl = `/download/${branch}/${category}/${file.name}`;
            const key = 'uploadedFiles';
            let uploads = JSON.parse(localStorage.getItem(key) || '{}');
            if (!uploads[branch]) uploads[branch] = {};
            uploads[branch][subject] = { dataUrl: downloadUrl, filename: file.name, uploadedAt: new Date().toISOString() };
            localStorage.setItem(key, JSON.stringify(uploads));
            alert('✅ File uploaded successfully for ' + subject + '!');
        } else {
            const error = await response.json();
            alert('❌ Error uploading file: ' + (error.error || 'Unknown error'));
        }
    } catch (err) {
        console.error(err);
        alert('❌ An error occurred while uploading the file.');
    }
}

function uploadSubjectFile(event, branch, subjectName) {
    if (!isMasterLoggedIn()) {
        alert('⚠️ Only Master can upload documents. Please login first.');
        showLoginModal();
        return;
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png';

    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const listItem = event.target.closest('li.subject-item');
        const list = listItem.closest('ul');
        let category = list.id.toLowerCase().includes('question') ? 'Questions' : 'Materials';
        _doUpload(file, branch, category, subjectName);
    };

    fileInput.click();
}

async function deleteSubjectFile(event, branch, subjectName) {
    if (!isMasterLoggedIn()) {
        alert('⚠️ Only Master can delete documents.');
        return;
    }

    if (!confirm('Are you sure you want to delete the file for ' + subjectName + '?')) return;

    const key = 'uploadedFiles';

    try {
        const uploads = JSON.parse(localStorage.getItem(key) || '{}');
        const fileInfo = uploads[branch] && uploads[branch][subjectName];

        if (fileInfo && fileInfo.filename) {
            const listItem = event.target.closest('li.subject-item');
            const list = listItem.closest('ul');
            let category = list.id.toLowerCase().includes('question') ? 'Questions' : 'Materials';

            const headers = {
                'X-Master-Username': MASTER_USERNAME,
                'X-Master-Password': MASTER_PASSWORD
            };

            const response = await fetch(`/delete/${branch}/${category}/${fileInfo.filename}`, {
                method: 'DELETE',
                headers: headers,
            });

            if (response.ok) {
                delete uploads[branch][subjectName];
                localStorage.setItem(key, JSON.stringify(uploads));
                alert('✅ File deleted successfully for ' + subjectName + '.');
            } else {
                const error = await response.json();
                alert('❌ Error deleting file: ' + (error.error || 'Unknown error'));
            }
        } else {
            alert('⚠️ No uploaded file found for ' + subjectName + '.');
        }
    } catch (err) {
        console.error(err);
        alert('❌ An error occurred while deleting the file.');
    }
}

function loadSubjectFiles(branch) {
  const key = 'uploadedFiles';
  let uploads = {};
  try { uploads = JSON.parse(localStorage.getItem(key) || '{}'); } catch (err) { uploads = {}; }
  const branchUploads = uploads[branch] || {};

  document.querySelectorAll('.subject-item').forEach(item => {
      const subjectName = item.querySelector('.subject-name span').textContent;
      const fileInfo = branchUploads[subjectName];
      const downloadLink = item.querySelector('a');

      if (downloadLink && fileInfo && fileInfo.dataUrl) {
          downloadLink.href = fileInfo.dataUrl;
          downloadLink.download = fileInfo.filename || 'download';
      }
  });
}

function updateMasterLoginFooter() {
  let footer = document.querySelector('.footer');
  if (!footer) {
    footer = document.createElement('footer');
    footer.className = 'footer';
    const contentArea = document.querySelector('.content-area');
    if (contentArea) contentArea.appendChild(footer);
    else document.body.appendChild(footer);
  }

  footer.innerHTML = isMasterLoggedIn() ? `
      <span class="master-badge">✓ Master Logged In</span>
      <button class="master-logout-btn" onclick="masterLogout()">Logout</button>
    ` : `
      <button class="master-login-btn" onclick="showLoginModal()">🔐 Master Login</button>
    `;
}

function convertSubjectListsToNewFormat() {
  const branch = window.location.pathname.includes('CSE') ? 'CSE' : 
                 window.location.pathname.includes('ECE') ? 'ECE' : 
                 window.location.pathname.includes('AIML') || window.location.pathname.includes('AI&ML') ? 'AI&ML' : 'CSE';
  
  document.querySelectorAll('[id*="MaterialList"], [id*="QuestionList"]').forEach(list => {
    list.querySelectorAll('li:not(.subject-item)').forEach(li => {
      if (li.classList.contains('subject-item')) return;

      const text = li.textContent.trim().split('\n')[0];
      const originalLink = li.querySelector('a');
      
      const newLi = document.createElement('li');
      newLi.className = 'subject-item';
      
      const nameDiv = document.createElement('div');
      nameDiv.className = 'subject-name';
      
      const downloadLink = document.createElement('a');
      downloadLink.href = originalLink ? originalLink.href : 'File not Uploaded';
      if (originalLink && originalLink.hasAttribute('download')) {
        downloadLink.setAttribute('download', originalLink.getAttribute('download'));
      }
      downloadLink.innerHTML = `<button class="download-btn">Download</button>`;

      nameDiv.innerHTML = `<span>${text}</span><br>`;
      nameDiv.appendChild(downloadLink);
      
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'subject-actions';
      
      const uploadBtn = document.createElement('button');
      uploadBtn.className = 'upload-btn';
      uploadBtn.textContent = 'Upload';
      uploadBtn.onclick = (event) => uploadSubjectFile(event, branch, text);
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = (event) => deleteSubjectFile(event, branch, text);
      
      actionsDiv.appendChild(uploadBtn);
      actionsDiv.appendChild(deleteBtn);
      
      newLi.appendChild(nameDiv);
      newLi.appendChild(actionsDiv);
      
      li.replaceWith(newLi);
    });
  });
}

function loadAndUpdateMessage() {
    const updateMessageEl = document.getElementById('updateMessage');
    const storedMessage = localStorage.getItem('updateAnnouncement');
    if (updateMessageEl) {
        updateMessageEl.textContent = storedMessage || 'No new updates found. Last checked: ' + new Date().toLocaleDateString();
    }
}

function saveUpdateMessage() {
    const textarea = document.getElementById('update-textarea');
    if (textarea) {
        localStorage.setItem('updateAnnouncement', textarea.value);
        alert('✅ Update saved successfully!');
        loadAndUpdateMessage(); // Refresh the displayed message
    }
}

function loadSkillNames() {
    document.querySelectorAll('.subject-item[data-skill-key]').forEach(item => {
        const key = item.getAttribute('data-skill-key');
        const savedName = localStorage.getItem(key);
        if (savedName) {
            item.querySelector('.skill-name').textContent = savedName;
        }
    });
}

function toggleSkillEdit(event) {
    const button = event.target;
    const item = button.closest('.subject-item');
    const skillNameEl = item.querySelector('.skill-name');
    const isEditing = skillNameEl.isContentEditable;

    if (isEditing) {
        skillNameEl.contentEditable = 'false';
        button.textContent = 'Edit Name';
        const key = item.getAttribute('data-skill-key');
        localStorage.setItem(key, skillNameEl.textContent);
        alert('✅ Skill name updated!');
    } else {
        skillNameEl.contentEditable = 'true';
        button.textContent = 'Save';
        skillNameEl.focus();
    }
}

document.addEventListener('DOMContentLoaded', function() {
  convertSubjectListsToNewFormat();
  updateUIForLoginState();
  loadSkillNames();

  const branch = window.location.pathname.includes('CSE') ? 'CSE' : 
                 window.location.pathname.includes('ECE') ? 'ECE' : 
                 window.location.pathname.includes('AIML') || window.location.pathname.includes('AI&ML') ? 'AI&ML' : 'ExtraSkills';
  if (branch) loadSubjectFiles(branch);

  const firstYearButton = document.querySelector('.sidebar button');
  if (firstYearButton) {
      const firstYearId = firstYearButton.getAttribute('onclick').match(/\('(.*?)'\)/)[1];
      showYear(firstYearId);
  }

  const saveBtn = document.getElementById('save-update-btn');
  if (saveBtn) {
      saveBtn.onclick = saveUpdateMessage;
  }
  
  // Pre-fill textarea with current message if master is logged in
  if (isMasterLoggedIn() && document.getElementById('update-textarea')) {
      document.getElementById('update-textarea').value = localStorage.getItem('updateAnnouncement') || '';
  }
});

window.showYear = showYear;
window.uploadSubjectFile = uploadSubjectFile;
window.deleteSubjectFile = deleteSubjectFile;
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.masterLogout = masterLogout;
window.handleLogin = handleLogin;
window.toggleSkillEdit = toggleSkillEdit;
