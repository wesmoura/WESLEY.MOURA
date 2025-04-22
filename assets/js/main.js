document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.container section');
  const navLinks = document.querySelectorAll('.nav-link');

  function showSection(sectionId) {
    sections.forEach(section => {
      section.style.display = 'none';
    });

    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = 'block';
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const sectionId = link.getAttribute('data-section');
      showSection(sectionId);
    });
  });

  // Função para navegar para uma seção
  window.navigateToSection = function(sectionId) {
    showSection(sectionId);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Função para navegar para um projeto específico
  window.navigateToProject = function(projectId) {
    showSection('projetos');
    const project = document.getElementById(projectId);
    if (project) {
      // Remover destaque de outros projetos
      document.querySelectorAll('.project-card').forEach(card => {
        card.classList.remove('highlight');
      });
      // Adicionar destaque ao projeto selecionado
      project.classList.add('highlight');
      project.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Remover o destaque após 2 segundos
      setTimeout(() => {
        project.classList.remove('highlight');
      }, 2000);
    }
  };

  // Inicializar particles.js
  particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: ['#FDB927', '#552583'] },
      shape: { type: 'circle', stroke: { width: 0, color: '#000000' } },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#FDB927',
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 2,
        direction: 'none',
        random: false,
        straight: false,
        out_mode: 'out',
        bounce: false
      }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'repulse' },
        onclick: { enable: true, mode: 'push' },
        resize: true
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        push: { particles_nb: 4 }
      }
    },
    retina_detect: true
  });

  // Função auxiliar para validar input do QR Code
  function validateQRCodeInput(text) {
    if (!text) {
      return { valid: false, message: 'Por favor, insira um texto ou URL válido.' };
    }
    if (text.length > 1000) {
      return { valid: false, message: 'O texto é muito longo (máximo 1000 caracteres).' };
    }
    // Remover emojis
    const cleanText = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '');
    // Permitir ASCII imprimível e caracteres latinos estendidos (ex.: ç, á, é)
    if (!cleanText.match(/^[\x20-\x7E\xA0-\xFF]*$/)) {
      return { valid: false, message: 'O texto contém caracteres inválidos. Use letras, números, acentos comuns (ex.: ç, á) e símbolos padrão.' };
    }
    return { valid: true, text: cleanText };
  }

  // Função auxiliar para gerar QR Code com QRious
  function generateQRCodeWithCheck(elementId, text, errorElementId, errorMessagePrefix) {
    const qrCodeCanvas = document.getElementById(elementId);
    const errorDiv = document.getElementById(errorElementId);

    if (!qrCodeCanvas || !errorDiv) {
      console.error(`${errorMessagePrefix}: Elemento DOM não encontrado`, { elementId, errorElementId });
      errorDiv.textContent = `${errorMessagePrefix}: Elemento DOM não encontrado.`;
      errorDiv.style.display = 'block';
      return;
    }

    // Limpar o canvas anterior
    qrCodeCanvas.getContext('2d').clearRect(0, 0, qrCodeCanvas.width, qrCodeCanvas.height);
    errorDiv.style.display = 'none';

    const validation = validateQRCodeInput(text);
    if (!validation.valid) {
      errorDiv.textContent = validation.message;
      errorDiv.style.display = 'block';
      console.warn(`${errorMessagePrefix}: ${validation.message}`);
      return;
    }

    // Verificar se a biblioteca QRious está carregada
    if (typeof QRious === 'undefined') {
      errorDiv.textContent = `${errorMessagePrefix}: Biblioteca QRious não carregada.`;
      errorDiv.style.display = 'block';
      console.error(`${errorMessagePrefix}: QRious library not loaded`);
      return;
    }

    try {
      new QRious({
        element: qrCodeCanvas,
        value: validation.text,
        size: 200,
        foreground: '#FDB927', // Dourado
        background: '#FFFFFF', // Branco
        level: 'M', // Nível de correção médio
        padding: 10
      });
      console.log(`${errorMessagePrefix}: QR Code gerado com sucesso para`, validation.text);
    } catch (e) {
      errorDiv.textContent = `${errorMessagePrefix}: Erro ao gerar QR Code. Detalhes: ${e.message}`;
      errorDiv.style.display = 'block';
      console.error(`${errorMessagePrefix}: Erro ao gerar QR Code`, e);
    }
  }

  // Funções para Gerador de QR Code
  window.generateQRCode = function() {
    const qrInput = document.getElementById('qr-input').value.trim();
    generateQRCodeWithCheck('qr-code', qrInput, 'qr-error', 'Gerador de QR Code');
  };

  window.clearQRCode = function() {
    const qrInput = document.getElementById('qr-input');
    const qrCodeCanvas = document.getElementById('qr-code');
    const errorDiv = document.getElementById('qr-error');

    if (qrInput) qrInput.value = '';
    if (qrCodeCanvas) qrCodeCanvas.getContext('2d').clearRect(0, 0, qrCodeCanvas.width, qrCodeCanvas.height);
    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.style.display = 'none';
    }
  };

  // Funções para QR Parking
  window.calculateParking = function() {
    const entry = new Date(document.getElementById('parking-entry').value);
    const exit = new Date(document.getElementById('parking-exit').value);
    const plate = document.getElementById('parking-plate').value.trim();
    const resultDiv = document.getElementById('parking-result');
    const paymentQrCanvas = document.getElementById('payment-qr-code');
    const paymentQrLabel = document.getElementById('payment-qr-label');
    const parkingError = document.getElementById('parking-error');

    // Limpar canvas anterior
    if (paymentQrCanvas) {
      paymentQrCanvas.getContext('2d').clearRect(0, 0, paymentQrCanvas.width, paymentQrCanvas.height);
    }
    paymentQrLabel.style.display = 'none';
    resultDiv.textContent = '';
    parkingError.style.display = 'none';

    if (!plate || !entry || !exit || isNaN(entry) || isNaN(exit)) {
      parkingError.textContent = 'Por favor, preencha todos os campos corretamente.';
      parkingError.style.display = 'block';
      console.warn('QR Parking: Campos inválidos', { plate, entry, exit });
      return;
    }

    if (exit <= entry) {
      parkingError.textContent = 'A hora de saída deve ser após a hora de entrada.';
      parkingError.style.display = 'block';
      console.warn('QR Parking: Saída anterior à entrada', { entry, exit });
      return;
    }

    const hours = (exit - entry) / (1000 * 60 * 60);
    const rate = 5; // R$5 por hora
    const total = (hours * rate).toFixed(2);
    const resultText = `Veículo: ${plate} | Tempo: ${hours.toFixed(1)} horas | Total: R$${total}`;

    resultDiv.textContent = resultText;

    // Gerar QR Code para pagamento
    generateQRCodeWithCheck('payment-qr-code', resultText, 'parking-error', 'QR Parking');
    paymentQrLabel.style.display = 'block';
  };

  window.clearParking = function() {
    const plateInput = document.getElementById('parking-plate');
    const entryInput = document.getElementById('parking-entry');
    const exitInput = document.getElementById('parking-exit');
    const resultDiv = document.getElementById('parking-result');
    const paymentQrCanvas = document.getElementById('payment-qr-code');
    const paymentQrLabel = document.getElementById('payment-qr-label');
    const parkingError = document.getElementById('parking-error');

    if (plateInput) plateInput.value = '';
    if (entryInput) entryInput.value = '';
    if (exitInput) exitInput.value = '';
    if (resultDiv) resultDiv.textContent = '';
    if (paymentQrCanvas) paymentQrCanvas.getContext('2d').clearRect(0, 0, paymentQrCanvas.width, paymentQrCanvas.height);
    if (paymentQrLabel) paymentQrLabel.style.display = 'none';
    if (parkingError) {
      parkingError.textContent = '';
      parkingError.style.display = 'none';
    }
  };

  // Funções para Gestor de Tarefas
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.className = task.completed ? 'completed' : '';
      li.innerHTML = `
        ${task.text}
        <div>
          <button onclick="toggleTask(${index})">${task.completed ? 'Desfazer' : 'Concluir'}</button>
          <button onclick="deleteTask(${index})">Excluir</button>
        </div>
      `;
      taskList.appendChild(li);
    });
  }

  window.addTask = function() {
    const taskInput = document.getElementById('task-input');
    const text = taskInput.value.trim();
    if (text) {
      tasks.push({ text, completed: false });
      localStorage.setItem('tasks', JSON.stringify(tasks));
      taskInput.value = '';
      renderTasks();
    }
  };

  window.toggleTask = function(index) {
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
  };

  window.deleteTask = function(index) {
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
  };

  // Inicializar tarefas
  renderTasks();

  // Mostrar a seção "Home" por padrão
  showSection('home');
});
