
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
    updateUploadButtons();
    updateMasterLoginButton();
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
  updateUploadButtons();
  updateMasterLoginButton();
  location.reload();
}

function updateUploadButtons() {
  const isMaster = isMasterLoggedIn();
  if (isMaster) {
    document.body.classList.add('master-logged-in');
  } else {
    document.body.classList.remove('master-logged-in');
  }
}

// Check for updates function
function checkForUpdates() {
  const msg = document.getElementById('updateMessage');
  if (!msg) return;
  // simple demonstration behavior
  msg.textContent = 'No new updates found. Last checked: ' + new Date().toLocaleString();
}

/**
 * showYear(yearId)
 * - hides all .year-content and shows the one with id=yearId
 * - marks matching sidebar button as active
 */
function showYear(yearId) {
  document.querySelectorAll('.year-content').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(yearId);
  if (!target) return;
  target.classList.add('active');

  document.querySelectorAll('.sidebar button').forEach(btn => {
    const onclick = btn.getAttribute('onclick') || '';
    btn.classList.toggle('active', onclick.includes(yearId));
  });

  const content = document.querySelector('.content-area');
  if (content) content.scrollTop = 0;
}

/**
 * uploadSubjectFile(branch, subjectName)
 * - checks if user is master, shows login if not
 * - uploads file for specific subject to backend
 */
function uploadSubjectFile(branch, subjectName) {
  if (!isMasterLoggedIn()) {
    alert('⚠️ Only Master can upload documents. Please login first.');
    showLoginModal();
    return;
  }
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.pdf, .doc, .docx, .txt, .ppt, .pptx, .xls, .xlsx, .jpg, .jpeg, .png';

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;

      // store in localStorage under uploads mapping
      const key = 'uploadedFiles';
      let uploads = {};
      try { uploads = JSON.parse(localStorage.getItem(key) || '{}'); } catch (err) { uploads = {}; }
      if (!uploads[branch]) uploads[branch] = {};
      uploads[branch][subjectName] = { dataUrl: dataUrl, filename: file.name, uploadedAt: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify(uploads));

      // Update the download link in the DOM
      const listItems = document.querySelectorAll('ul li');
      listItems.forEach(item => {
        if (item.textContent.includes(subjectName)) {
          const downloadBtn = item.querySelector('a');
          if (downloadBtn) {
            downloadBtn.href = dataUrl;
            downloadBtn.download = file.name;
          }
        }
      });

      alert('✅ File uploaded successfully for ' + subjectName + '! (stored locally)');
      updateUploadButtons();
    };
    reader.readAsDataURL(file);
  };

  fileInput.click();
}

/**
 * deleteSubjectFile(branch, subjectName)
 * - checks if user is master
 * - deletes file for specific subject from backend
 */
async function deleteSubjectFile(branchOrSubject, subjectName) {
  if (!isMasterLoggedIn()) {
    alert('⚠️ Only Master can delete documents.');
    return;
  }
  if (!confirm('Are you sure you want to delete the file for ' + subjectName + '?')) return;

  const key = 'uploadedFiles';
  // support calls with either (branch, subjectName) or (subjectName)
  let branch = branchOrSubject;
  let subject = subjectName;
  if (!subject) {
    // branchOrSubject is actually the subject; detect branch from pathname
    subject = branchOrSubject;
    branch = window.location.pathname.includes('CSE') ? 'CSE' : 
             window.location.pathname.includes('ECE') ? 'ECE' : 
             window.location.pathname.includes('AIML') || window.location.pathname.includes('AI&ML') ? 'AI&ML' : 'ExtraSkills';
  }

  if (!confirm('Are you sure you want to delete the file for ' + subject + '?')) return;

  try {
    const uploads = JSON.parse(localStorage.getItem(key) || '{}');
    if (uploads[branch] && uploads[branch][subject]) {
      delete uploads[branch][subject];
      localStorage.setItem(key, JSON.stringify(uploads));

      // Reset the download link in the DOM
      const listItems = document.querySelectorAll('ul li');
      listItems.forEach(item => {
        if (item.textContent.includes(subjectName)) {
          const downloadBtn = item.querySelector('a');
          if (downloadBtn) {
            downloadBtn.href = 'File not Uploaded';
            downloadBtn.removeAttribute('download');
          }
        }
      });

      alert('✅ File deleted successfully for ' + subjectName + '.');
      updateUploadButtons();
      return;
    }
  } catch (err) {
    console.error(err);
  }

  alert('⚠️ No uploaded file found for ' + subject + '.');
}

/**
 * loadSubjectFiles(branch)
 * - loads all uploaded files for a branch from the backend
 * - updates all download links across all pages
 */
function loadSubjectFiles(branch) {
  // Load uploaded files from localStorage and update download links
  const key = 'uploadedFiles';
  let uploads = {};
  try { uploads = JSON.parse(localStorage.getItem(key) || '{}'); } catch (err) { uploads = {}; }
  const branchUploads = uploads[branch] || {};

  const listItems = document.querySelectorAll('ul li');
  listItems.forEach(item => {
    for (const [subjectName, fileInfo] of Object.entries(branchUploads)) {
      if (item.textContent.includes(subjectName)) {
        const downloadBtn = item.querySelector('a');
        if (downloadBtn && fileInfo && fileInfo.dataUrl) {
          downloadBtn.href = fileInfo.dataUrl;
          downloadBtn.download = fileInfo.filename || 'download';
        }
      }
    }
  });
}

function updateMasterLoginButton() {
  const loginDiv = document.querySelector('.master-login');
  if (loginDiv) {
    if (isMasterLoggedIn()) {
      loginDiv.innerHTML = '<button class="master-logout-btn" onclick="masterLogout()">Master Logout</button>';
    } else {
      loginDiv.innerHTML = '<button class="master-login-btn" onclick="showLoginModal()">Master Login</button>';
    }
  }
}


// expose functions for inline onclick attributes
window.showYear = showYear;
window.uploadSubjectFile = uploadSubjectFile;
window.deleteSubjectFile = deleteSubjectFile;
window.checkForUpdates = checkForUpdates;
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.masterLogout = masterLogout;
window.isMasterLoggedIn = isMasterLoggedIn;
window.loadSubjectFiles = loadSubjectFiles;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  updateUploadButtons();
  convertSubjectListsToNewFormat();
  updateMasterLoginButton();
  // Load subject files for current branch (from localStorage)
  const branch = window.location.pathname.includes('CSE') ? 'CSE' : 
                 window.location.pathname.includes('ECE') ? 'ECE' : 
                 window.location.pathname.includes('AIML') || window.location.pathname.includes('AI&ML') ? 'AI&ML' : 'ExtraSkills';
  if (branch) loadSubjectFiles(branch);
});


// Generic upload helper for existing "Upload" buttons which ask for a subject
function uploadFile(branch) {
  if (!isMasterLoggedIn()) {
    alert('⚠️ Only Master can upload documents. Please login first.');
    showLoginModal();
    return;
  }

  const subject = prompt('Enter the exact subject name to attach this file to (copy from the list):');
  if (!subject) return;
  uploadSubjectFile(branch, subject);
}

// Convert old subject lists to new format with upload/delete buttons
function convertSubjectListsToNewFormat() {
  const branch = window.location.pathname.includes('CSE') ? 'CSE' : 
                 window.location.pathname.includes('ECE') ? 'ECE' : 
                 window.location.pathname.includes('AIML') || window.location.pathname.includes('AI&ML') ? 'AI&ML' : 'CSE';
  
  const materialLists = document.querySelectorAll('[id*="MaterialList"]');
  
  materialLists.forEach(list => {
    list.querySelectorAll('li:not(.subject-item)').forEach(li => {
      // Only convert if not already converted
      if (!li.classList.contains('subject-item')) {
        const text = li.textContent.trim().split('\n')[0];
        const downloadLink = li.querySelector('a');
        
        // Create new structure
        const newLi = document.createElement('li');
        newLi.className = 'subject-item';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'subject-name';
        nameDiv.innerHTML = `<span>${text}</span><br>`;
        
        if (downloadLink) {
          const newLink = downloadLink.cloneNode(true);
          newLink.style.fontSize = '0.9rem';
          newLink.style.color = '#6fa8d6';
          const newBtn = newLink.querySelector('button');
          if (newBtn) {
            newBtn.style.padding = '4px 8px';
            newBtn.style.fontSize = '0.8rem';
          }
          nameDiv.appendChild(newLink);
        } else {
          // Create download button if doesn't exist
          const downloadLink = document.createElement('a');
          downloadLink.href = 'File not Uploaded';
          downloadLink.style.fontSize = '0.9rem';
          downloadLink.style.color = '#6fa8d6';
          downloadLink.innerHTML = '<button style="padding: 4px 8px; font-size: 0.8rem;">Download</button>';
          nameDiv.appendChild(downloadLink);
        }
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'subject-actions';
        
        const uploadBtn = document.createElement('button');
        uploadBtn.className = 'upload-btn';
        uploadBtn.textContent = 'Upload';
        uploadBtn.onclick = function() {
          uploadSubjectFile(branch, text);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = function() {
          deleteSubjectFile(branch, text);
        };
        
        actionsDiv.appendChild(uploadBtn);
        actionsDiv.appendChild(deleteBtn);
        
        newLi.appendChild(nameDiv);
        newLi.appendChild(actionsDiv);
        
        li.replaceWith(newLi);
      }
    });
  });
}
// Initialize on page load: apply master-logged-in class if needed
window.addEventListener('load', () => {
  if (isMasterLoggedIn()) {
    document.body.classList.add('master-logged-in');
  }
});
