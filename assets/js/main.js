document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.container section'); // Seleciona todas as seções
    const navLinks = document.querySelectorAll('.nav-link'); // Seleciona todos os links de navegação
  
    // Função para mostrar uma seção específica
    function showSection(sectionId) {
      sections.forEach(section => {
        section.style.display = 'none'; // Esconde todas as seções
      });
  
      const section = document.getElementById(sectionId);
      if (section) {
        section.style.display = 'block'; // Mostra a seção desejada
      }
    }
  
    // Adiciona eventos de clique para cada botão de navegação
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const sectionId = link.getAttribute('data-section');
        showSection(sectionId); // Mostra a seção correspondente ao botão clicado
      });
    });
  
    // Esconde todas as seções inicialmente
    sections.forEach(section => {
      section.style.display = 'none';
    });
  });
  