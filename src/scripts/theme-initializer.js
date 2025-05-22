export const themeInitializerScript = `
  (function() {
    const storedUserChoice = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let applyDarkClass = false;
    if (storedUserChoice === 'dark') {
      applyDarkClass = true;
    } else if (storedUserChoice === 'light') {
      applyDarkClass = false;
    } else {
      applyDarkClass = systemPrefersDark;
    }
    if (applyDarkClass) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  })();
`;
