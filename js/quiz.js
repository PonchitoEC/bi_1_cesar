const quizQuestions = [
  { topic: 'FUNDAMENTOS', question: '¿Cuál es el propósito principal de Business Intelligence?', answers: ['Almacenar todos los datos sin analizarlos', 'Convertir datos en información útil para decidir mejor', 'Automatizar todas las decisiones de una empresa', 'Crear únicamente reportes financieros'], correct: 1, explanation: 'BI combina procesos, datos y herramientas para producir información que respalde decisiones.' },
  { topic: 'FUNDAMENTOS', question: '¿Cuál de estos elementos es un dato sin procesar?', answers: ['El equipo mejoró su rendimiento', 'La asistencia creció este mes', '12 tiros al arco en un partido', 'Se recomienda cambiar la estrategia'], correct: 2, explanation: '“12 tiros al arco” es un hecho registrado. Compararlo con otros partidos lo convierte en información.' },
  { topic: 'DECISIONES', question: '¿Qué caracteriza una decisión basada en datos?', answers: ['Usar evidencia medible junto con su contexto', 'Ignorar la experiencia del equipo', 'Elegir siempre la métrica más alta', 'Tomar decisiones solo al final de la temporada'], correct: 0, explanation: 'La evidencia aporta consistencia; el contexto y la experiencia ayudan a interpretarla correctamente.' },
  { topic: 'DECISIONES', question: 'Invertir en una academia juvenil para los próximos cinco años es una decisión...', answers: ['Operativa', 'Táctica', 'Estratégica', 'Reactiva'], correct: 2, explanation: 'Una decisión estratégica define el rumbo y compromete recursos a largo plazo.' },
  { topic: 'PROCESOS ETL', question: '¿Qué significan las siglas ETL?', answers: ['Evaluar, Trazar y Lanzar', 'Extraer, Transformar y Cargar', 'Explorar, Tabular y Leer', 'Exportar, Traducir y Listar'], correct: 1, explanation: 'ETL es Extract, Transform, Load: extraer datos, transformarlos y cargarlos en un destino.' },
  { topic: 'PROCESOS ETL', question: 'Unificar “LDU”, “Liga de Quito” y “L.D.U. Quito” para que representen el mismo club corresponde a...', answers: ['Extraer', 'Transformar', 'Cargar', 'Visualizar'], correct: 1, explanation: 'Normalizar nombres y formatos es una tarea de transformación y limpieza de datos.' },
  { topic: 'PROCESOS ETL', question: '¿Cuál es el objetivo de la fase Load (Cargar)?', answers: ['Recolectar datos desde sensores', 'Corregir registros duplicados', 'Guardar los datos preparados en un destino de análisis', 'Diseñar la visualización final'], correct: 2, explanation: 'La carga coloca los datos ya preparados en un almacén o destino para consultas y análisis.' },
  { topic: 'APLICACIONES', question: '¿Qué pregunta podría ayudar a responder BI en un club de fútbol?', answers: ['¿Qué colores debería tener el uniforme?', '¿Qué patrón de juego precede a más ocasiones de gol?', '¿Quién es el jugador más popular?', '¿Qué equipo ganará con certeza el próximo partido?'], correct: 1, explanation: 'BI identifica patrones históricos que apoyan la preparación; no garantiza el resultado de un partido.' },
  { topic: 'APLICACIONES', question: 'Una tienda analiza ventas y existencias para anticipar faltantes. ¿Qué beneficio busca?', answers: ['Aumentar las tarjetas recibidas', 'Reducir quiebres de stock', 'Eliminar la necesidad de proveedores', 'Evitar analizar la demanda'], correct: 1, explanation: 'Relacionar ventas con inventario ayuda a anticipar la demanda y evitar productos agotados.' },
  { topic: 'ANÁLISIS', question: 'Después de aplicar un cambio táctico apoyado por datos, ¿qué paso permite saber si funcionó?', answers: ['Medir los resultados frente al objetivo', 'Borrar los datos anteriores', 'Cambiar de métrica cada semana', 'Asumir que la decisión fue correcta'], correct: 0, explanation: 'El ciclo de decisión se completa midiendo el efecto de la acción y comparándolo con el objetivo.' }
];

const quizState = { index: 0, score: 0, lives: 3, answered: false };
const answerLetters = ['A', 'B', 'C', 'D'];

function renderQuestion() {
  const question = quizQuestions[quizState.index];
  const questionElement = document.querySelector('#quiz-question');
  const topicElement = document.querySelector('#question-topic');
  const answerList = document.querySelector('#answer-list');
  const feedback = document.querySelector('#quiz-feedback');
  const nextButton = document.querySelector('#quiz-next');

  quizState.answered = false;
  topicElement.textContent = question.topic;
  questionElement.textContent = question.question;
  feedback.hidden = true;
  feedback.textContent = '';
  nextButton.hidden = true;
  answerList.replaceChildren();

  question.answers.forEach((answer, answerIndex) => {
    const button = document.createElement('button');
    button.className = 'answer-option';
    button.type = 'button';
    button.setAttribute('aria-label', `${answerLetters[answerIndex]}: ${answer}`);
    const letter = document.createElement('span');
    letter.className = 'answer-letter';
    letter.textContent = answerLetters[answerIndex];
    const text = document.createElement('span');
    text.textContent = answer;
    button.append(letter, text);
    button.addEventListener('click', () => selectAnswer(answerIndex));
    answerList.append(button);
  });

  updateProgress();
}

function selectAnswer(selectedIndex) {
  if (quizState.answered) return;
  quizState.answered = true;
  const question = quizQuestions[quizState.index];
  const answerButtons = [...document.querySelectorAll('.answer-option')];
  const feedback = document.querySelector('#quiz-feedback');
  const isCorrect = selectedIndex === question.correct;

  answerButtons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.correct) button.classList.add('correct');
    if (index === selectedIndex && !isCorrect) button.classList.add('incorrect');
  });

  if (isCorrect) {
    quizState.score += 10;
    feedback.className = 'quiz-feedback';
    feedback.textContent = `¡Correcto! ${question.explanation}`;
    launchConfetti();
  } else {
    quizState.lives -= 1;
    feedback.className = 'quiz-feedback feedback-wrong';
    feedback.textContent = `No exactamente. ${question.explanation}`;
  }

  feedback.hidden = false;
  document.querySelector('#quiz-score').textContent = quizState.score;
  updateLives();
  updateProgress();
  const nextButton = document.querySelector('#quiz-next');
  nextButton.innerHTML = quizState.index === quizQuestions.length - 1 || quizState.lives === 0
    ? 'Ver resultados <i class="bi bi-arrow-right" aria-hidden="true"></i>'
    : 'Siguiente <i class="bi bi-arrow-right" aria-hidden="true"></i>';
  nextButton.hidden = false;
}

function updateProgress() {
  const completed = quizState.answered ? quizState.index + 1 : quizState.index;
  const progressBar = document.querySelector('#quiz-progress-bar');
  const progressTrack = document.querySelector('.quiz-progress-track');
  const progressText = document.querySelector('#quiz-progress-text');
  if (progressBar) progressBar.style.width = `${(completed / quizQuestions.length) * 100}%`;
  if (progressTrack) progressTrack.setAttribute('aria-valuenow', completed);
  if (progressText) progressText.textContent = `Pregunta ${Math.min(quizState.index + 1, quizQuestions.length)} de ${quizQuestions.length}`;
}

function updateLives() {
  const livesContainer = document.querySelector('#quiz-lives');
  if (!livesContainer) return;
  [...livesContainer.children].forEach((heart, index) => heart.classList.toggle('life-lost', index >= quizState.lives));
  livesContainer.setAttribute('aria-label', `${quizState.lives} ${quizState.lives === 1 ? 'vida' : 'vidas'} restantes`);
}

function showResults() {
  document.querySelector('#quiz-stage').hidden = true;
  const result = document.querySelector('#quiz-result');
  const percentage = Math.round((quizState.score / (quizQuestions.length * 10)) * 100);
  const medal = percentage >= 80 ? '🥇' : percentage >= 50 ? '🥈' : '🥉';
  const level = percentage >= 80 ? 'Experto' : percentage >= 50 ? 'Intermedio' : 'Principiante';
  result.innerHTML = `
    <div class="result-medal" aria-label="Medalla ${percentage >= 80 ? 'de oro' : percentage >= 50 ? 'de plata' : 'de bronce'}">${medal}</div>
    <div class="result-kicker">CUESTIONARIO COMPLETADO · NIVEL ${level.toUpperCase()}</div>
    <h3>${percentage >= 80 ? '¡Dominio del juego!' : percentage >= 50 ? '¡Buen progreso!' : 'Cada dato cuenta.'}</h3>
    <p>${percentage >= 80 ? 'Tu lectura de los fundamentos está en forma.' : percentage >= 50 ? 'Ya tienes una buena base para seguir avanzando.' : 'Repasa los conceptos y vuelve a intentarlo.'}</p>
    <div class="result-stats"><div class="result-stat"><strong>${quizState.score}</strong><span>PUNTOS</span></div><div class="result-stat"><strong>${percentage}%</strong><span>ACIERTOS</span></div><div class="result-stat"><strong>${quizState.lives}</strong><span>VIDAS RESTANTES</span></div></div>
    <div class="result-actions"><button class="button-primary" id="quiz-retry" type="button"><i class="bi bi-arrow-repeat" aria-hidden="true"></i> Reintentar</button><a class="button-outline" href="dashboard.html">Explorar dashboard <i class="bi bi-arrow-up-right" aria-hidden="true"></i></a></div>`;
  result.hidden = false;
  document.querySelector('#quiz-retry').addEventListener('click', restartQuiz);
  if (percentage >= 80) launchConfetti(24);
}

function restartQuiz() {
  quizState.index = 0;
  quizState.score = 0;
  quizState.lives = 3;
  document.querySelector('#quiz-score').textContent = '0';
  document.querySelector('#quiz-result').hidden = true;
  document.querySelector('#quiz-stage').hidden = false;
  updateLives();
  renderQuestion();
}

function launchConfetti(amount = 14) {
  const colors = ['#06b6d4', '#f97316', '#1e3a8a', '#29a879', '#f0bd43'];
  for (let index = 0; index < amount; index += 1) {
    const piece = document.createElement('span');
    const angle = (Math.PI * 2 * index) / amount;
    const distance = 48 + Math.random() * 105;
    piece.className = 'celebration';
    piece.style.backgroundColor = colors[index % colors.length];
    piece.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    piece.style.setProperty('--y', `${Math.sin(angle) * distance - 45}px`);
    piece.style.setProperty('--rotate', `${Math.random() * 500}deg`);
    document.body.append(piece);
    piece.addEventListener('animationend', () => piece.remove(), { once: true });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('#quiz-app')) return;
  document.querySelector('#quiz-next').addEventListener('click', () => {
    if (quizState.lives === 0 || quizState.index === quizQuestions.length - 1) {
      showResults();
      return;
    }
    quizState.index += 1;
    renderQuestion();
  });
  renderQuestion();
});
