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

  // Dark Mode Toggle
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const body = document.body;

  // Função para atualizar texto e ícone do botão
  function updateDarkModeButton() {
    if (body.classList.contains('dark-mode')) {
      darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
      darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    } else {
      darkModeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
      darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Escuro';
    }
  }

  // Check for saved theme preference, default to dark mode
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme) {
    body.classList.add(currentTheme);
    updateDarkModeButton();
  } else {
    // Default to dark mode if no preference is saved
    body.classList.add('dark-mode');
    updateDarkModeButton();
    localStorage.setItem('theme', 'dark-mode');
  }

  darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    let theme = 'light-mode';
    if (body.classList.contains('dark-mode')) {
      theme = 'dark-mode';
    }
    updateDarkModeButton();
    localStorage.setItem('theme', theme);
  });

  window.navigateToSection = function(sectionId) {
    showSection(sectionId);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  window.navigateToProject = function(projectId) {
    showSection('projetos');
    const project = document.getElementById(projectId);
    if (project) {
      document.querySelectorAll('.project-card').forEach(card => {
        card.classList.remove('highlight');
      });
      project.classList.add('highlight');
      project.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        project.classList.remove('highlight');
      }, 2000);
    }
  };

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

  function validateQRCodeInput(text) {
    if (!text) {
      return { valid: false, message: 'Por favor, insira um texto ou URL válido.' };
    }
    if (text.length > 1000) {
      return { valid: false, message: 'O texto é muito longo (máximo 1000 caracteres).' };
    }
    const cleanText = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '');
    if (!cleanText.match(/^[\x20-\x7E\xA0-\xFF]*$/)) {
      return { valid: false, message: 'O texto contém caracteres inválidos. Use letras, números, acentos comuns (ex.: ç, á) e símbolos padrão.' };
    }
    return { valid: true, text: cleanText };
  }

  function generateQRCodeWithCheck(elementId, text, errorElementId, errorMessagePrefix) {
    const qrCodeCanvas = document.getElementById(elementId);
    const errorDiv = document.getElementById(errorElementId);

    if (!qrCodeCanvas || !errorDiv) {
      console.error(`${errorMessagePrefix}: Elemento DOM não encontrado`, { elementId, errorElementId });
      errorDiv.textContent = `${errorMessagePrefix}: Elemento DOM não encontrado.`;
      errorDiv.style.display = 'block';
      return;
    }

    qrCodeCanvas.getContext('2d').clearRect(0, 0, qrCodeCanvas.width, qrCodeCanvas.height);
    errorDiv.style.display = 'none';

    const validation = validateQRCodeInput(text);
    if (!validation.valid) {
      errorDiv.textContent = validation.message;
      errorDiv.style.display = 'block';
      console.warn(`${errorMessagePrefix}: ${validation.message}`);
      return;
    }

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
        foreground: '#FDB927',
        background: '#FFFFFF',
        level: 'M',
        padding: 10
      });
      console.log(`${errorMessagePrefix}: QR Code gerado com sucesso para`, validation.text);
    } catch (e) {
      errorDiv.textContent = `${errorMessagePrefix}: Erro ao gerar QR Code. Detalhes: ${e.message}`;
      errorDiv.style.display = 'block';
      console.error(`${errorMessagePrefix}: Erro ao gerar QR Code`, e);
    }
  }

  window.generateQRCode = function() {
    const qrInput = document.getElementById('qr-input').value.trim();
    generateQRCodeWithCheck('qr-code', qrInput, 'qr-error', 'Gerador de QR Code');
  };

  window.calculateParking = function() {
    const entry = new Date(document.getElementById('parking-entry').value);
    const exit = new Date(document.getElementById('parking-exit').value);
    const plate = document.getElementById('parking-plate').value.trim();
    const resultDiv = document.getElementById('parking-result');
    const paymentQrCanvas = document.getElementById('payment-qr-code');
    const paymentQrLabel = document.getElementById('payment-qr-label');
    const parkingError = document.getElementById('parking-error');

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
    const rate = 5;
    const total = (hours * rate).toFixed(2);
    const resultText = `Veículo: ${plate} | Tempo: ${hours.toFixed(1)} horas | Total: R$${total}`;

    resultDiv.textContent = resultText;
    generateQRCodeWithCheck('payment-qr-code', resultText, 'parking-error', 'QR Parking');
    paymentQrLabel.style.display = 'block';
  };

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

  // Guitar Tuner Functionality
  let pick = false;
  const bodyStyle = document.body.style;
  bodyStyle.setProperty('--vol', '0.5');

  const strings = {
    s1: document.getElementById('as1'),
    s2: document.getElementById('as2'),
    s3: document.getElementById('as3'),
    s4: document.getElementById('as4'),
    s5: document.getElementById('as5'),
    s6: document.getElementById('as6')
  };

  function isPlaying(audio) {
    return !audio.paused;
  }

  window.pickString = function(stringId) {
    if (pick) {
      clickString(stringId);
    }
  };

  window.clickString = function(stringId) {
    const stringElement = document.getElementById(stringId);
    const audio = strings[stringId];
    const note = document.getElementById(stringId + 'Note');
    const nota = document.getElementById(stringId + 'Nota');

    if (!audio) {
      console.error(`Áudio para ${stringId} não encontrado`);
      return;
    }

    // Reset
    if (isPlaying(audio)) {
      clearInterval(window[stringId + 'Timer']);
      audio.pause();
      audio.currentTime = 0;
      stringElement.className = 'string';
      note.className = '';
      nota.className = '';
    }

    // Play
    audio.play().catch(e => {
      console.error(`Erro ao tocar áudio ${stringId}:`, e);
    });
    stringElement.classList.add('playing-sound');
    note.classList.add('lightOn');
    nota.classList.add('lightOn');

    // Monitor
    const soundTimer = setInterval(() => {
      if (!isPlaying(audio) && !audio.loop) {
        stringElement.className = 'string';
        note.className = '';
        nota.className = '';
        clearInterval(soundTimer);
      }
    }, 200);
    window[stringId + 'Timer'] = soundTimer;
  };

  window.holdSound = function() {
    const btnHold = document.getElementById('btnHold');
    const isLooping = strings.s1.loop;
    Object.values(strings).forEach(audio => {
      audio.loop = !isLooping;
    });
    btnHold.className = isLooping ? '' : 'active';
    if (isLooping) {
      stopStrings();
    }
  };

  window.stopStrings = function() {
    Object.values(strings).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    document.querySelectorAll('.playing-sound').forEach(el => {
      el.className = 'string';
    });
    document.querySelectorAll('.lightOn').forEach(el => {
      el.className = '';
    });
  };

  window.usePick = function() {
    const btnPick = document.getElementById('btnPick');
    const guitarBody = document.getElementById('guitar-body');
    pick = !pick;
    btnPick.className = pick ? 'active' : '';
    guitarBody.classList.toggle('pickActive', pick);
    if (pick) {
      guitarBody.addEventListener('mousemove', pickChecked);
    } else {
      guitarBody.removeEventListener('mousemove', pickChecked);
    }
  };

  window.pickChecked = function(event) {
    const target = document.getElementById('move-pick');
    const rect = target.parentElement.getBoundingClientRect();
    const xposition = event.clientX - rect.left - target.offsetWidth / 2;
    const yposition = event.clientY - rect.top - target.offsetHeight / 2;
    target.style.transform = `translate(${xposition}px, ${yposition}px)`;
  };

  window.setVolume = function(val) {
    bodyStyle.setProperty('--vol', val);
    document.querySelector('.slider-value').textContent = Math.round(val * 10);
    Object.values(strings).forEach(audio => {
      audio.volume = val;
    });
  };

  window.changeGuitar = function(id) {
    stopStrings();
    const guitarBody = document.getElementById('guitar-body');
    guitarBody.classList.toggle('e-classic', id === 'e-classic');
    guitarBody.classList.toggle('e-electric', id === 'e-electric');
    document.querySelectorAll('.change-guitar').forEach(btn => {
      btn.disabled = btn.id === id;
      btn.classList.toggle('active', btn.id === id);
    });
    changeStrings(id === 'e-classic');
  };

  function changeStrings(isClassic) {
    const sources = isClassic
      ? {
          s1: 'https://cdn.josetxu.com/audio/cgs-1.mp3',
          s2: 'https://cdn.josetxu.com/audio/cgs-2.mp3',
          s3: 'https://cdn.josetxu.com/audio/cgs-3.mp3',
          s4: 'https://cdn.josetxu.com/audio/cgs-4.mp3',
          s5: 'https://cdn.josetxu.com/audio/cgs-5.mp3',
          s6: 'https://cdn.josetxu.com/audio/cgs-6.mp3'
        }
      : {
          s1: 'https://cdn.josetxu.com/audio/egs-1.mp3',
          s2: 'https://cdn.josetxu.com/audio/egs-2.mp3',
          s3: 'https://cdn.josetxu.com/audio/egs-3.mp3',
          s4: 'https://cdn.josetxu.com/audio/egs-4.mp3',
          s5: 'https://cdn.josetxu.com/audio/egs-5.mp3',
          s6: 'https://cdn.josetxu.com/audio/egs-6.mp3'
        };
    Object.entries(sources).forEach(([id, src]) => {
      strings[id].src = src;
      strings[id].load();
    });
  }

  // Initialize tuner
  Object.values(strings).forEach(audio => {
    audio.load();
    audio.volume = 0.5;
  });

  renderTasks();
  showSection('home');

  // Modal de Certificados
  function openCertModal(contentHtml) {
    const modal = document.getElementById('cert-modal');
    const modalContent = document.getElementById('cert-modal-content');
    modalContent.innerHTML = contentHtml;
    modal.style.display = 'flex';
  }

  function closeCertModal() {
    document.getElementById('cert-modal').style.display = 'none';
    document.getElementById('cert-modal-content').innerHTML = '';
  }

  // Fecha ao clicar fora do conteúdo
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('cert-modal');
    if (modal && modal.style.display === 'flex' && !event.target.closest('.cert-modal-content') && !event.target.closest('.certification')) {
      closeCertModal();
    }
  });

  // Adiciona evento aos certificados
  window.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.certification img').forEach(img => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', function() {
        openCertModal(`<img src="${img.src}" alt="${img.alt}">`);
      });
    });
    // Para os PDFs
    document.querySelectorAll('.pdf-container iframe').forEach(iframe => {
      iframe.style.cursor = 'pointer';
      iframe.addEventListener('click', function() {
        openCertModal(`<iframe src="${iframe.src}" width="800" height="600"></iframe>`);
      });
    });
  });
});
