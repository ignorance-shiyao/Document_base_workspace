/**
 * 知识库核心逻辑控制
 * 包含：索引加载、模糊搜索、目录树渲染、主题同步预览、移动端适配
 */

const CONFIG = { 
    pageSize: 15,
    indexPath: './list.json' // 索引文件位于根目录
};

let rawFiles = [], filteredTree = [], currentPage = 1, fuse;

// 1. 初始化入口
async function init() {
    initTheme();
    try {
        const res = await fetch(CONFIG.indexPath);
        if (!res.ok) throw new Error("Index file not found");
        rawFiles = await res.json();
        
        // 初始化 Fuse.js 模糊搜索
        fuse = new Fuse(rawFiles, { keys: ['path'], threshold: 0.3 });
        
        handleSearch("");
        
        // 绑定搜索事件
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', e => handleSearch(e.target.value));
        }
    } catch (e) {
        const container = document.getElementById('tree-content');
        if (container) {
            container.innerHTML = '<div style="padding:20px; font-size:12px; opacity:0.6;">等待索引文件生成...</div>';
        }
    }
}

// 2. 搜索逻辑处理
function handleSearch(q) {
    const files = q.trim() ? fuse.search(q).map(r => r.item) : rawFiles;
    const tree = {};
    
    // 构建树形结构
    files.forEach(f => {
        const parts = f.path.split('/');
        let cur = tree;
        parts.forEach((p, i) => {
            if (!cur[p]) cur[p] = (i === parts.length - 1) ? { _f: f } : {};
            cur = cur[p];
        });
    });
    
    filteredTree = Object.entries(tree);
    currentPage = 1;
    updateUI();
}

// 3. 树形菜单渲染
function renderNode(name, node) {
    if (node._f) {
        // 文件节点：存储原始路径以便 loadPreview 调用
        return `<div class="file-item" data-path="./${node._f.path}" data-name="${name}" onclick="onFileClick(this)">
            <i class="far fa-file-alt"></i><span>${name}</span></div>`;
    }
    
    // 文件夹节点
    const children = Object.entries(node).map(([n,v]) => renderNode(n,v)).join('');
    return `<div class="folder-group">
        <div class="folder-header" onclick="toggleFolder(this)">
            <i class="fas fa-chevron-right icon-arrow"></i><i class="fas fa-folder"></i><span>${name}</span>
        </div>
        <div class="folder-children" style="display:none; padding-left:18px;">${children}</div>
    </div>`;
}

// 4. UI 更新逻辑
function updateUI() {
    const container = document.getElementById('tree-content');
    if (!container) return;
    
    const start = (currentPage - 1) * CONFIG.pageSize;
    const items = filteredTree.slice(start, start + CONFIG.pageSize);
    
    container.innerHTML = items.map(([name, node]) => renderNode(name, node)).join('');
    
    const total = Math.ceil(filteredTree.length / CONFIG.pageSize) || 1;
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) pageInfo.innerText = `${currentPage} / ${total}`;
}

// 5. 核心预览逻辑：主题参数传值
function onFileClick(el) {
    const url = el.getAttribute('data-path');
    const name = el.getAttribute('data-name');
    loadPreview(el, url, name);
}

function loadPreview(el, url, title) {
    // 移动端处理
    if (window.innerWidth <= 768) {
        const sb = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sb.classList.contains('mobile-active')) {
            sb.classList.remove('mobile-active');
            overlay.classList.remove('active');
        }
    }

    // 选中状态切换
    document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    
    // UI 反馈
    const placeholder = document.getElementById('emptyPlaceholder');
    const loader = document.getElementById('iframeLoader');
    const titleEl = document.getElementById('currentPageTitle');
    
    if (placeholder) placeholder.style.display = 'none';
    if (loader) loader.style.display = 'flex';
    if (titleEl) titleEl.innerText = title;

    // --- 主题传值核心实现 ---
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    let finalUrl = url;
    if (isDark) {
        // 判断原路径是否已有参数
        finalUrl += (url.includes('?') ? '&' : '?') + 'cs=dark';
    }

    const iframe = document.getElementById('mainIframe');
    if (iframe) {
        iframe.src = finalUrl;
        iframe.onload = () => {
            if (loader) loader.style.display = 'none';
        };
    }
}

// 6. 主题控制逻辑
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // 如果当前有打开的预览，实时刷新以应用新主题参数
    const activeItem = document.querySelector('.file-item.active');
    if (activeItem) {
        const path = activeItem.getAttribute('data-path');
        const name = activeItem.getAttribute('data-name');
        loadPreview(activeItem, path, name);
    }
}

function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = saved === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// 7. 基础交互函数
function toggleSidebar() {
    const isMobile = window.innerWidth <= 768;
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const eb = document.getElementById('expandBtn');
    
    if (isMobile) {
        sb.classList.toggle('mobile-active');
        if (overlay) overlay.classList.toggle('active');
    } else {
        const isCol = sb.classList.toggle('collapsed');
        if (eb) eb.style.display = isCol ? 'block' : 'none';
    }
}

function toggleFolder(el) {
    const children = el.nextElementSibling;
    const arrow = el.querySelector('.icon-arrow');
    const isOpen = children.style.display === 'block';
    children.style.display = isOpen ? 'none' : 'block';
    if (arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
}

function openExternal() {
    const iframe = document.getElementById('mainIframe');
    if (iframe && iframe.src && iframe.src !== 'about:blank') {
        window.open(iframe.src, '_blank');
    }
}

function changePage(s) {
    const total = Math.ceil(filteredTree.length / CONFIG.pageSize) || 1;
    if (currentPage + s >= 1 && currentPage + s <= total) {
        currentPage += s;
        updateUI();
    }
}

// 启动
init();
