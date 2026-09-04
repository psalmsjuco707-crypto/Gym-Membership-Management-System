// ===== DEFAULT DATA =====
const defaultProjects = [
  {
    id: 1,
    title: "C++ Data Structures",
    desc: "Optimized C++ algorithms with real-time compilation and execution.",
    type: "cpp",
    image: "assets/project1.jpg",
    code: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello from C++!\\n\";\n    std::cout << \"Compilation and Execution Successful.\\n\";\n    return 0;\n}"
  },
  {
    id: 2,
    title: "Interactive Web Card",
    desc: "A live HTML/CSS/JS component you can edit and preview instantly.",
    type: "web",
    image: "assets/project2.jpg",
    html: "<div class=\"card\">\n  <h2>Hover Me!</h2>\n  <p>Click the button below.</p>\n  <button id=\"btn\">Click Me</button>\n</div>",
    css: "body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea, #764ba2); font-family: sans-serif; }\n.card { background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; transition: transform 0.3s; }\n.card:hover { transform: translateY(-10px) rotate(2deg); }\nbutton { background: linear-gradient(135deg, #f0d060, #d4af37); border: none; padding: 0.8rem 1.5rem; color: #000; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 1rem; font-size: 1rem; }",
    js: "document.getElementById('btn').addEventListener('click', () => {\n  alert('JavaScript is working perfectly!');\n});"
  }
];

const defaultFeedbacks = [
  { id: 1, name: "Alex Johnson", role: "Product Manager", text: "Psalms delivered an outstanding UI/UX design that exceeded our expectations." }
];

// ===== LOCAL STORAGE =====
function getData(key, defaults) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaults;
}
function saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

let projects = getData('portfolio_projects', defaultProjects);
let feedbacks = getData('portfolio_feedbacks', defaultFeedbacks);
let isAdmin = false;
let currentViewerProject = null;
let currentViewerTab = null;

// ===== RENDER PROJECTS =====
function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  projects.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'project-card reveal visible';
    card.onclick = (e) => {
      if (e.target.closest('.delete-btn')) return;
      openViewer(proj.id);
    };

    card.innerHTML = `
      <button class="delete-btn" onclick="event.stopPropagation(); deleteProject(${proj.id})">🗑 Delete</button>
      <button class="delete-btn" style="right: 80px; background: var(--accent); color: #000;" onclick="event.stopPropagation(); editProject(${proj.id})">✏️ Edit</button>
      <div class="project-img">
        <img src="${proj.image}" alt="${proj.title}" onerror="this.style.display='none'; this.parentElement.innerHTML='💻';">
      </div>
      <div class="project-info">
        <span class="project-type-badge">${proj.type === 'cpp' ? '⚙️ C++' : '🌐 Web'}</span>
        <h3>${proj.title}</h3>
        <p>${proj.desc}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ===== PROJECT VIEWER =====
function openViewer(projectId) {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;
  currentViewerProject = proj;

  document.getElementById('viewerTitle').textContent = proj.title;
  document.getElementById('viewerDesc').textContent = proj.desc;
  document.getElementById('viewerIcon').textContent = proj.type === 'cpp' ? '⚙️' : '🌐';

  const tabs = document.getElementById('viewerTabs');
  tabs.innerHTML = '';

  if (proj.type === 'cpp') {
    const tab = document.createElement('button');
    tab.className = 'viewer-tab active';
    tab.textContent = 'main.cpp';
    tab.onclick = () => switchViewerTab('cpp', tab);
    tabs.appendChild(tab);
    currentViewerTab = 'cpp';
    document.getElementById('viewerCodeDisplay').textContent = proj.code || '';
    document.getElementById('previewLabel').textContent = 'Terminal Output';
    document.getElementById('viewerPreview').innerHTML = `
      <div class="cpp-output">Click "▶ Run" to compile and execute this C++ code.</div>
    `;
  } else {
    const files = [
      { key: 'html', label: 'index.html' },
      { key: 'css', label: 'style.css' },
      { key: 'js', label: 'script.js' }
    ];
    files.forEach((file, i) => {
      const tab = document.createElement('button');
      tab.className = 'viewer-tab' + (i === 0 ? ' active' : '');
      tab.textContent = file.label;
      tab.onclick = () => switchViewerTab(file.key, tab);
      tabs.appendChild(tab);
    });
    currentViewerTab = 'html';
    document.getElementById('viewerCodeDisplay').textContent = proj.html || '';
    document.getElementById('previewLabel').textContent = 'Live Preview';
    renderWebPreview(proj);
  }

  document.getElementById('projectViewer').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function switchViewerTab(key, tabEl) {
  document.querySelectorAll('.viewer-tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');
  currentViewerTab = key;

  const proj = currentViewerProject;
  if (!proj) return;

  let code = '';
  if (proj.type === 'cpp') {
    code = proj.code || '';
  } else {
    code = proj[key] || '';
  }
  document.getElementById('viewerCodeDisplay').textContent = code;
}

function renderWebPreview(proj) {
  const preview = document.getElementById('viewerPreview');
  const html = proj.html || '<h1>Hello World</h1>';
  const css = proj.css || 'body { font-family: sans-serif; padding: 20px; }';
  const js = proj.js || '';

  const source = `
    <!DOCTYPE html>
    <html>
    <head><style>${css}</style></head>
    <body>
      ${html}
      <script>
        try { ${js} } catch (err) { console.error(err); }
      <\/script>
    </body>
    </html>
  `;
  preview.innerHTML = `<iframe srcdoc="${source.replace(/"/g, '&quot;')}"></iframe>`;
}

async function runViewerCode() {
  const proj = currentViewerProject;
  if (!proj) return;

  const btn = document.getElementById('viewerRunBtn');
  const preview = document.getElementById('viewerPreview');

  if (proj.type === 'web') {
    renderWebPreview(proj);
    btn.textContent = '✓ Refreshed';
    setTimeout(() => { btn.innerHTML = '▶ Run'; }, 1500);
    return;
  }

  // C++ Compilation
  btn.disabled = true;
  btn.innerHTML = '⏳ Compiling...';
  preview.innerHTML = `
    <div class="cpp-loading">
      <div class="cpp-spinner"></div>
      <div>Connecting to compiler...</div>
    </div>
  `;

  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'cpp',
        version: '10.2.0',
        files: [{ content: proj.code }]
      })
    });
    const result = await response.json();
    if (result.run) {
      const output = result.run.stdout || result.run.stderr || 'No output';
      preview.innerHTML = `<div class="cpp-output">✓ Compiled successfully\n\n${output}</div>`;
    } else {
      preview.innerHTML = `<div class="cpp-output" style="color:#ef4444;">✗ Error: ${result.message || 'Unknown error'}</div>`;
    }
  } catch (error) {
    preview.innerHTML = `<div class="cpp-output" style="color:#ef4444;">✗ Network Error: Could not reach compiler.</div>`;
  }

  btn.disabled = false;
  btn.innerHTML = '▶ Run';
}

function closeViewer() {
  document.getElementById('projectViewer').classList.remove('active');
  document.body.style.overflow = '';
  currentViewerProject = null;
}

// ===== C++ RUNNER (for card preview) =====
async function runCppCode(btn, projectId) {
  // This is now handled by the viewer, but kept for backward compatibility
  openViewer(projectId);
}

function runWebCode(btn, projectId) {
  openViewer(projectId);
}

// ===== MODAL & FORM HANDLING =====
function openProjectModal(projectId = null) {
  const modal = document.getElementById('projectModal');
  const form = document.getElementById('projectForm');
  if (!modal || !form) return;

  if (projectId) {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;
    document.getElementById('modalTitle').textContent = 'Edit Project';
    document.getElementById('projId').value = proj.id;
    document.getElementById('projTitle').value = proj.title;
    document.getElementById('projDesc').value = proj.desc;
    document.getElementById('projType').value = proj.type;
    document.getElementById('projImage').value = proj.image || '';
    
    if (proj.type === 'cpp') {
      document.getElementById('projCode').value = proj.code || '';
    } else if (proj.type === 'web') {
      document.getElementById('projHtml').value = proj.html || '';
      document.getElementById('projCss').value = proj.css || '';
      document.getElementById('projJs').value = proj.js || '';
    }
    toggleCodeFields();
  } else {
    document.getElementById('modalTitle').textContent = 'Add New Project';
    form.reset();
    document.getElementById('projId').value = '';
    toggleCodeFields();
  }

  modal.classList.add('active');
}

function editProject(id) { openProjectModal(id); }
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function toggleCodeFields() {
  const type = document.getElementById('projType').value;
  document.getElementById('codeFieldsCpp').style.display = type === 'cpp' ? 'block' : 'none';
  document.getElementById('codeFieldsWeb').style.display = type === 'web' ? 'block' : 'none';
}

function saveProject(event) {
  event.preventDefault();
  const id = document.getElementById('projId').value;
  const type = document.getElementById('projType').value;

  const projectData = {
    id: id ? parseInt(id) : Date.now(),
    title: document.getElementById('projTitle').value,
    desc: document.getElementById('projDesc').value,
    type: type,
    image: document.getElementById('projImage').value || 'assets/project.jpg'
  };

  if (type === 'cpp') {
    projectData.code = document.getElementById('projCode').value;
  } else if (type === 'web') {
    projectData.html = document.getElementById('projHtml').value;
    projectData.css = document.getElementById('projCss').value;
    projectData.js = document.getElementById('projJs').value;
  }

  if (id) {
    const index = projects.findIndex(p => p.id === parseInt(id));
    if (index !== -1) projects[index] = projectData;
  } else {
    projects.push(projectData);
  }

  saveData('portfolio_projects', projects);
  renderProjects();
  closeModal('projectModal');
}

function deleteProject(id) {
  if (confirm("Are you sure you want to delete this project?")) {
    projects = projects.filter(p => p.id !== id);
    saveData('portfolio_projects', projects);
    renderProjects();
  }
}

function exportProjects() {
  const dataStr = "const defaultProjects = " + JSON.stringify(projects, null, 2) + ";";
  navigator.clipboard.writeText(dataStr).then(() => {
    alert("✅ Projects copied to clipboard!\n\n📌 NEXT STEP:\n1. Open portfolio.js\n2. Replace the 'defaultProjects' array at the top with this copied code.\n3. Save the file.");
  }).catch(err => {
    alert("Failed to copy. Please check browser permissions.");
  });
}

// ===== FEEDBACKS =====
function renderFeedbacks() {
  const grid = document.getElementById('feedbacksGrid');
  if (!grid) return;
  grid.innerHTML = '';
  feedbacks.forEach(fb => {
    const card = document.createElement('div');
    card.className = 'feedback-card reveal visible';
    card.innerHTML = `
      <button class="delete-btn" onclick="deleteFeedback(${fb.id})">🗑 Delete</button>
      <p class="feedback-text">${fb.text}</p>
      <div class="feedback-author">
        <div class="author-avatar">${fb.name.charAt(0)}</div>
        <div class="author-info">
          <h4>${fb.name}</h4>
          <span>${fb.role}${fb.date ? ' • ' + fb.date : ''}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function addPublicComment(event) {
  event.preventDefault();
  const name = document.getElementById('commentName').value;
  const role = document.getElementById('commentRole').value || 'Visitor';
  const text = document.getElementById('commentText').value;

  feedbacks.unshift({ id: Date.now(), name, role, text, date: new Date().toLocaleDateString() });
  saveData('portfolio_feedbacks', feedbacks);
  renderFeedbacks();
  event.target.reset();
  alert("✅ Comment posted locally!");
}

function deleteFeedback(id) {
  if (confirm("Delete this comment?")) {
    feedbacks = feedbacks.filter(f => f.id !== id);
    saveData('portfolio_feedbacks', feedbacks);
    renderFeedbacks();
  }
}

function clearAllComments() {
  if (confirm("Delete ALL comments?")) {
    feedbacks = [];
    saveData('portfolio_feedbacks', feedbacks);
    renderFeedbacks();
  }
}

function toggleAdminMode() {
  if (!isAdmin) {
    const pass = prompt("Enter admin password:");
    if (pass === "PsalmsJuco_23") {
      isAdmin = true;
      document.body.classList.add('admin-mode');
      renderProjects();
      renderFeedbacks();
      alert("✅ Admin Mode Enabled.");
    } else if (pass !== null) {
      alert("❌ Incorrect password.");
    }
  } else {
    isAdmin = false;
    document.body.classList.remove('admin-mode');
    renderProjects();
    renderFeedbacks();
  }
}

// ===== SKILLS TABS =====
const skillsData = {
  frontend: {
    title: "Frontend Development",
    desc: "Building responsive, fast, and beautiful user interfaces with modern frameworks and clean architecture.",
    tags: ["HTML5", "CSS3", "JavaScript", "React", "Tailwind CSS", "TypeScript"]
  },
  backend: {
    title: "Backend Development",
    desc: "Designing robust APIs, database architectures, and server-side solutions for scalable applications.",
    tags: ["Node.js", "Python", "C++", "SQL", "REST APIs", "MongoDB"]
  },
  design: {
    title: "UI/UX Design",
    desc: "Crafting visual experiences that users love, focusing on accessibility, typography, and micro-interactions.",
    tags: ["Figma", "Adobe Photoshop", "Prototyping", "Wireframing", "Design Systems"]
  },
  mobile: {
    title: "Mobile Development",
    desc: "Native and cross-platform mobile development for seamless experiences on iOS and Android devices.",
    tags: ["React Native", "Flutter", "iOS", "Android", "Firebase"]
  }
};

function switchSkillTab(category, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const contentDiv = document.getElementById('skillsContent');
  if (!contentDiv) return;

  const data = skillsData[category];
  contentDiv.innerHTML = `
    <h3>${data.title}</h3>
    <p>${data.desc}</p>
    <div class="skill-tags">
      ${data.tags.map(tag => `<span>${tag}</span>`).join('')}
    </div>
  `;
  contentDiv.style.animation = 'none';
  setTimeout(() => { contentDiv.style.animation = 'fadeIn 0.5s ease'; }, 10);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  renderProjects();
  renderFeedbacks();
  
  const firstTabBtn = document.querySelector('.tab-btn');
  if (firstTabBtn) switchSkillTab('frontend', firstTabBtn);

  // Scroll Reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Nav links
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open'));
  });

  // Particles
  const particlesContainer = document.getElementById('particles');
  if (particlesContainer) {
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (Math.random() * 10 + 10) + 's';
      p.style.animationDelay = (Math.random() * 10) + 's';
      p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
      particlesContainer.appendChild(p);
    }
  }

  // Scroll Progress & Back to Top
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
    
    if (scrollTop > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  // ESC to close viewer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeViewer();
      closeModal('projectModal');
    }
  });
});

window.onclick = function(event) {
  const modal = document.getElementById('projectModal');
  if (event.target === modal) closeModal('projectModal');
}

// Contact Form Handler
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const statusEl = document.getElementById('formStatus');
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ Sending...';
      statusEl.style.display = 'block';
      statusEl.style.color = '#fbbf24';
      statusEl.textContent = 'Sending your message...';
      
      try {
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          statusEl.style.color = '#4ade80';
          statusEl.textContent = '✅ Message sent successfully!';
          contactForm.reset();
        } else {
          statusEl.style.color = '#ef4444';
          statusEl.textContent = '❌ Something went wrong.';
        }
      } catch (error) {
        statusEl.style.color = '#ef4444';
        statusEl.textContent = '❌ Network error.';
      }
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Message <span class="btn-arrow">→</span>';
      setTimeout(() => { statusEl.style.display = 'none'; }, 5000);
    });
  }
});