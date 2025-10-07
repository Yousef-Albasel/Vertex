// Theme Toggle Functionality
(function() {
    const toggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    if (!toggleBtn || !themeIcon) return;

    function setTheme(mode) {
        if (mode === 'dark') {
            document.body.classList.add('dark-mode');
            themeIcon.className = 'fa-solid fa-sun';
        } else {
            document.body.classList.remove('dark-mode');
            themeIcon.className = 'fa-solid fa-moon';
        }
    }

    toggleBtn.addEventListener('click', function() {
        const isDark = document.body.classList.contains('dark-mode');
        const newMode = isDark ? 'light' : 'dark';
        setTheme(newMode);
        try {
            localStorage.setItem('theme', newMode);
        } catch (e) {
            // localStorage might not be available
            console.warn('Could not save theme preference');
        }
    });

    // Load saved theme
    try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setTheme('dark');
        }
    } catch (e) {
        // localStorage might not be available
    }
})();