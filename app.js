// ...保留 init, handleSearch, renderNode 等函数...

function toggleSidebar() {
    const isMobile = window.innerWidth <= 768;
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const eb = document.getElementById('expandBtn'); // PC 端的展开按钮

    if (isMobile) {
        sb.classList.toggle('active');
        overlay.classList.toggle('active');
    } else {
        const isCol = sb.classList.toggle('collapsed');
        if(eb) eb.style.display = isCol ? 'block' : 'none';
    }
}

function loadPreview(el, url, title) {
    // 移动端选择后自动收起菜单
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }

    document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');

    document.getElementById('emptyPlaceholder').style.display = 'none';
    const loader = document.getElementById('iframeLoader');
    loader.style.display = 'flex';
    document.getElementById('currentPageTitle').innerText = title;

    const iframe = document.getElementById('mainIframe');
    iframe.src = url;
    iframe.onload = () => loader.style.display = 'none';
}

// 在 init 函数中增加窗口缩放监听，防止 PC 和移动端状态冲突
window.addEventListener('resize', () => {
    const isMobile = window.innerWidth <= 768;
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!isMobile) {
        sb.classList.remove('active');
        overlay.classList.remove('active');
    }
});

init();