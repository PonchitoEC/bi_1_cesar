const seasonLength = 18;
const roundLabels = Array.from({ length: seasonLength }, (_, index) => `J${String(index + 1).padStart(2, '0')}`);
// Datos simulados; los resultados se mantienen coherentes con partidos jugados y puntos.
const teamSeasonData = [
  { name: 'LDU Quito', short: 'LDU', emoji: '⚪', color: '#1767a8', points: 35, played: 18, won: 10, drawn: 5, lost: 3, goalsFor: 32, goalsAgainst: 14, possession: 58.4, shots: 105, yellowCards: 37, redCards: 2, attendance: 28740 },
  { name: 'Barcelona SC', short: 'BAR', emoji: '🟡', color: '#e6ad18', points: 32, played: 18, won: 9, drawn: 5, lost: 4, goalsFor: 30, goalsAgainst: 17, possession: 55.7, shots: 99, yellowCards: 42, redCards: 3, attendance: 26350 },
  { name: 'Independiente del Valle', short: 'IDV', emoji: '⚫', color: '#333b46', points: 30, played: 18, won: 8, drawn: 6, lost: 4, goalsFor: 29, goalsAgainst: 16, possession: 60.2, shots: 97, yellowCards: 34, redCards: 1, attendance: 12110 },
  { name: 'Emelec', short: 'EME', emoji: '🔵', color: '#176bb0', points: 28, played: 18, won: 8, drawn: 4, lost: 6, goalsFor: 27, goalsAgainst: 21, possession: 52.1, shots: 91, yellowCards: 48, redCards: 4, attendance: 21800 },
  { name: 'Aucas', short: 'AUC', emoji: '🟥', color: '#c7393c', points: 25, played: 18, won: 7, drawn: 4, lost: 7, goalsFor: 26, goalsAgainst: 22, possession: 50.6, shots: 84, yellowCards: 45, redCards: 3, attendance: 9800 },
  { name: 'Universidad Católica', short: 'UCAT', emoji: '🔵', color: '#408ac4', points: 23, played: 18, won: 6, drawn: 5, lost: 7, goalsFor: 25, goalsAgainst: 22, possession: 53.3, shots: 88, yellowCards: 39, redCards: 2, attendance: 8650 },
  { name: 'Orense', short: 'ORE', emoji: '🟢', color: '#489351', points: 23, played: 18, won: 6, drawn: 5, lost: 7, goalsFor: 23, goalsAgainst: 25, possession: 47.8, shots: 77, yellowCards: 43, redCards: 3, attendance: 7540 },
  { name: 'Macará', short: 'MAC', emoji: '🔷', color: '#2684a7', points: 20, played: 18, won: 5, drawn: 5, lost: 8, goalsFor: 19, goalsAgainst: 25, possession: 46.5, shots: 71, yellowCards: 47, redCards: 4, attendance: 10320 },
  { name: 'Delfín', short: 'DEL', emoji: '🟡', color: '#d8a822', points: 17, played: 18, won: 4, drawn: 5, lost: 9, goalsFor: 17, goalsAgainst: 27, possession: 44.7, shots: 68, yellowCards: 50, redCards: 5, attendance: 6320 },
  { name: 'El Nacional', short: 'NAC', emoji: '🔴', color: '#bd3b3e', points: 13, played: 18, won: 3, drawn: 4, lost: 11, goalsFor: 15, goalsAgainst: 34, possession: 43.8, shots: 63, yellowCards: 54, redCards: 6, attendance: 14600 }
];

const chartInstances = {};
const state = { round: seasonLength, team: 'all', search: '', sortKey: 'points', sortDirection: 'desc' };
const chartColors = ['#1e3a8a', '#06a6b8', '#ef7a26', '#29946e', '#8b5a9f', '#dbb130', '#4c7cb7', '#c94d4d', '#397c58', '#6b7e8b'];
const resultColors = ['#23936d', '#e5a22a', '#5279bc'];
const chartTextColor = () => getComputedStyle(document.body).getPropertyValue('--dash-muted').trim() || '#6d8191';
const chartGridColor = () => getComputedStyle(document.body).getPropertyValue('--dash-line').trim() || '#dfe7ec';

function getCurrentTeams() {
  const ratio = state.round / seasonLength;
  return teamSeasonData.map((team) => {
    const played = state.round;
    const won = Math.floor(team.won * ratio);
    const drawn = Math.floor(team.drawn * ratio);
    const lost = played - won - drawn;
    const goalsFor = Math.floor(team.goalsFor * ratio);
    const goalsAgainst = Math.floor(team.goalsAgainst * ratio);
    return {
      ...team,
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      shots: Math.floor(team.shots * ratio),
      yellowCards: Math.floor(team.yellowCards * ratio),
      redCards: Math.floor(team.redCards * ratio),
      goalDifference: goalsFor - goalsAgainst,
      points: won * 3 + drawn
    };
  }).sort((first, second) => second.points - first.points || second.goalDifference - first.goalDifference || second.goalsFor - first.goalsFor)
    .map((team, index) => ({ ...team, position: index + 1 }));
}

function getFilteredTeams() {
  const teams = getCurrentTeams().filter((team) => state.team === 'all' || team.name === state.team);
  if (!state.search) return teams;
  return teams.filter((team) => team.name.toLowerCase().includes(state.search.toLowerCase()));
}

function getChartTeams(teams) {
  return state.team === 'all' ? teams : teams.filter((team) => team.name === state.team);
}

function getLeagueTotals() {
  const teams = getCurrentTeams();
  const goals = teams.reduce((total, team) => total + team.goalsFor, 0);
  return { matches: state.round * 5, goals };
}

function initializeFilters() {
  const roundFilter = document.querySelector('#round-filter');
  for (let round = 1; round <= seasonLength; round += 1) {
    const option = document.createElement('option');
    option.value = round;
    option.textContent = `Jornada ${String(round).padStart(2, '0')}`;
    roundFilter.append(option);
  }
  roundFilter.value = state.round;
  const teamFilter = document.querySelector('#team-filter');
  const radarOne = document.querySelector('#radar-team-one');
  const radarTwo = document.querySelector('#radar-team-two');

  teamSeasonData.forEach((team) => {
    const teamOption = new Option(team.name, team.name);
    teamFilter.append(teamOption);
    radarOne.append(new Option(team.name, team.name));
    radarTwo.append(new Option(team.name, team.name));
  });
  radarOne.value = teamSeasonData[0].name;
  radarTwo.value = teamSeasonData[1].name;

  roundFilter.addEventListener('change', () => {
    state.round = Number(roundFilter.value);
    renderDashboard();
  });
  teamFilter.addEventListener('change', () => {
    state.team = teamFilter.value;
    renderDashboard();
  });
  document.querySelector('#team-search').addEventListener('input', (event) => {
    state.search = event.target.value.trim();
    renderTable();
  });
  document.querySelectorAll('[data-sort]').forEach((button) => {
    button.addEventListener('click', () => sortTable(button.dataset.sort));
  });
  document.querySelector('#theme-toggle').addEventListener('click', toggleTheme);
  document.querySelector('#export-data').addEventListener('click', exportFilteredData);
  document.querySelector('#print-dashboard').addEventListener('click', () => window.print());
  radarOne.addEventListener('change', renderRadarChart);
  radarTwo.addEventListener('change', renderRadarChart);
}

function renderDashboard() {
  const teams = getCurrentTeams();
  const filteredTeams = getFilteredTeams();
  updateKpis(teams);
  renderStandingsChart(getChartTeams(teams));
  renderResultsChart(teams);
  renderPointsChart(getChartTeams(teams));
  renderRadarChart();
  renderTable(filteredTeams);
  renderGoalsChart();
  renderInsights(teams);
}

function updateKpis(teams) {
  const totals = getLeagueTotals();
  const selectedTeam = state.team === 'all' ? null : teams.find((team) => team.name === state.team);
  const goals = selectedTeam ? selectedTeam.goalsFor + selectedTeam.goalsAgainst : totals.goals;
  const matches = selectedTeam ? selectedTeam.played : totals.matches;
  const leader = (selectedTeam ? [selectedTeam] : teams)[0];
  document.querySelector('#kpi-matches').textContent = matches.toLocaleString('es-EC');
  document.querySelector('#kpi-goals').textContent = goals.toLocaleString('es-EC');
  document.querySelector('#kpi-goal-rate').textContent = (goals / Math.max(state.round, 1)).toFixed(1);
  document.querySelector('#kpi-leader').textContent = leader?.name ?? '—';
  document.querySelector('#kpi-leader-points').textContent = `${leader?.points ?? 0} pts`;
  document.querySelector('#kpi-average').textContent = (goals / Math.max(matches, 1)).toFixed(2);
}

function chartBaseOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 550 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#102b46',
        titleFont: { family: 'DM Sans', size: 11, weight: 'bold' },
        bodyFont: { family: 'DM Sans', size: 11 },
        padding: 11,
        cornerRadius: 4,
        displayColors: true
      }
    }
  };
}

function updateChart(key, canvasId, config) {
  if (chartInstances[key]) {
    chartInstances[key].data = config.data;
    chartInstances[key].options = config.options;
    chartInstances[key].update();
    return;
  }
  const canvas = document.getElementById(canvasId);
  if (window.Chart && canvas) chartInstances[key] = new Chart(canvas, config);
}

function renderStandingsChart(teams) {
  const sortedTeams = teams.slice().sort((first, second) => second.points - first.points || second.goalDifference - first.goalDifference);
  const colors = sortedTeams.map((team, index) => index === 0 ? '#23936d' : index < 3 ? '#1e3a8a' : '#7e96aa');
  const options = chartBaseOptions();
  options.indexAxis = 'y';
  options.scales = {
    x: { beginAtZero: true, grid: { color: chartGridColor() }, ticks: { color: chartTextColor(), stepSize: 5, font: { family: 'DM Sans', size: 9 } }, border: { display: false } },
    y: { grid: { display: false }, ticks: { color: chartTextColor(), font: { family: 'DM Sans', size: 10, weight: '600' } }, border: { display: false } }
  };
  options.plugins.tooltip.callbacks = { label: (context) => ` ${context.parsed.x} puntos` };
  updateChart('standings', 'standings-chart', {
    type: 'bar',
    data: { labels: sortedTeams.map((team) => team.name), datasets: [{ label: 'Puntos', data: sortedTeams.map((team) => team.points), backgroundColor: colors, borderRadius: 2, barThickness: 13, maxBarThickness: 16 }] },
    options
  });
}

function renderResultsChart(teams) {
  const selectedTeam = state.team === 'all' ? null : teams.find((team) => team.name === state.team);
  const resultTeams = selectedTeam
    ? [teamSeasonData.find((team) => team.name === selectedTeam.name)]
    : teamSeasonData;
  const nonDrawResults = Math.round(resultTeams.reduce((sum, team) => sum + team.won + team.lost, 0) * state.round / seasonLength);
  const draws = Math.round(resultTeams.reduce((sum, team) => sum + team.drawn, 0) / (selectedTeam ? 1 : 2) * state.round / seasonLength);
  const localWins = Math.round(nonDrawResults * .54);
  const awayWins = nonDrawResults - localWins;
  const resultCounts = [localWins, awayWins, Math.round(draws)];
  const resultNames = ['Victorias locales', 'Victorias visitantes', 'Empates'];
  const options = chartBaseOptions();
  options.cutout = '70%';
  options.plugins.tooltip.callbacks = { label: (context) => {
    const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
    const percent = total ? Math.round((context.parsed / total) * 100) : 0;
    return ` ${context.label}: ${percent}% (${context.parsed})`;
  } };
  updateChart('results', 'results-chart', {
    type: 'doughnut',
    data: { labels: resultNames, datasets: [{ data: resultCounts, backgroundColor: resultColors, borderColor: getComputedStyle(document.body).getPropertyValue('--dash-panel').trim(), borderWidth: 3, hoverOffset: 5 }] },
    options
  });
  document.querySelector('#results-legend').innerHTML = resultNames.map((name, index) => `<span class="legend-item"><i class="legend-swatch" style="background:${resultColors[index]}"></i>${name.replace('Victorias ', '')}</span>`).join('');
}

function renderPointsChart(teams) {
  const activeTeams = teams.slice().sort((first, second) => second.points - first.points).slice(0, 5);
  const options = chartBaseOptions();
  options.plugins.legend = { display: true, position: 'bottom', labels: { color: chartTextColor(), usePointStyle: true, pointStyle: 'circle', boxWidth: 7, boxHeight: 7, padding: 14, font: { family: 'DM Sans', size: 9 } } };
  options.scales = {
    x: { grid: { display: false }, ticks: { color: chartTextColor(), maxTicksLimit: 9, font: { family: 'DM Sans', size: 9 } }, border: { display: false } },
    y: { beginAtZero: true, grid: { color: chartGridColor() }, ticks: { color: chartTextColor(), font: { family: 'DM Sans', size: 9 } }, border: { display: false } }
  };
  options.plugins.tooltip.callbacks = { label: (context) => ` ${context.dataset.label}: ${context.parsed.y} pts` };
  updateChart('points', 'points-chart', {
    type: 'line',
    data: {
      labels: roundLabels.slice(0, state.round),
      datasets: activeTeams.map((team, index) => ({
        label: team.name,
        data: roundLabels.slice(0, state.round).map((_, roundIndex) => Math.floor(team.points * (roundIndex + 1) / seasonLength)),
        borderColor: team.color || chartColors[index],
        backgroundColor: `${team.color || chartColors[index]}22`,
        borderWidth: 2,
        pointRadius: state.round > 12 ? 1.5 : 2.5,
        pointHoverRadius: 5,
        tension: .32,
        fill: false
      }))
    },
    options
  });
}

function getRadarMetrics(team) {
  const played = Math.max(team.played, 1);
  return [
    Math.round(team.possession),
    Math.min(100, Math.round((team.shots / played) / 1.3 * 100)),
    Math.min(100, Math.round((team.goalsFor / played) / 1.8 * 100)),
    Math.max(0, Math.round((1 - team.goalsAgainst / played / 3.2) * 100)),
    Math.min(100, Math.round((team.goalsFor / played) / 1.8 * 100)),
    Math.max(0, Math.round((1 - (team.yellowCards + team.redCards * 3) / played / 5) * 100))
  ];
}

function renderRadarChart() {
  const firstName = document.querySelector('#radar-team-one').value;
  const secondName = document.querySelector('#radar-team-two').value;
  const currentTeams = getCurrentTeams();
  const first = currentTeams.find((team) => team.name === firstName);
  const second = currentTeams.find((team) => team.name === secondName);
  if (!first || !second) return;
  const options = chartBaseOptions();
  options.plugins.legend = { display: true, position: 'bottom', labels: { color: chartTextColor(), usePointStyle: true, pointStyle: 'circle', boxWidth: 7, boxHeight: 7, padding: 12, font: { family: 'DM Sans', size: 9 } } };
  options.scales = { r: { min: 0, max: 100, beginAtZero: true, angleLines: { color: chartGridColor() }, grid: { color: chartGridColor() }, pointLabels: { color: chartTextColor(), font: { family: 'DM Sans', size: 9 } }, ticks: { display: false, stepSize: 20 } } };
  options.plugins.tooltip.callbacks = { label: (context) => ` ${context.dataset.label}: ${context.parsed.r}/100` };
  updateChart('radar', 'radar-chart', {
    type: 'radar',
    data: {
      labels: ['Posesión', 'Tiros', 'Goles', 'Defensa', 'Ataque', 'Disciplina'],
      datasets: [
        { label: first.name, data: getRadarMetrics(first), borderColor: '#1e3a8a', backgroundColor: 'rgba(30,58,138,.14)', pointBackgroundColor: '#1e3a8a', pointRadius: 2, borderWidth: 2 },
        { label: second.name, data: getRadarMetrics(second), borderColor: '#ed7a27', backgroundColor: 'rgba(237,122,39,.12)', pointBackgroundColor: '#ed7a27', pointRadius: 2, borderWidth: 2 }
      ]
    },
    options
  });
}

function getTeamRoundGoals(team, roundIndex) {
  const baseline = team.goalsFor / seasonLength;
  const variation = .5 + ((roundIndex * 7 + team.name.length * 3) % 11) / 10;
  const total = Math.max(0, Math.round(baseline * variation));
  const homeShare = .42 + ((roundIndex + team.name.length) % 4) * .04;
  const homeGoals = Math.round(total * homeShare);
  return { homeGoals, awayGoals: total - homeGoals };
}

function renderGoalsChart() {
  const currentTeams = state.team === 'all' ? teamSeasonData : teamSeasonData.filter((team) => team.name === state.team);
  const homeData = [];
  const awayData = [];
  for (let roundIndex = 0; roundIndex < state.round; roundIndex += 1) {
    const roundGoals = currentTeams.reduce((totals, team) => {
      const goals = getTeamRoundGoals(team, roundIndex);
      totals.home += goals.homeGoals;
      totals.away += goals.awayGoals;
      return totals;
    }, { home: 0, away: 0 });
    homeData.push(roundGoals.home);
    awayData.push(roundGoals.away);
  }
  const options = chartBaseOptions();
  options.scales = {
    x: { stacked: true, grid: { display: false }, ticks: { color: chartTextColor(), font: { family: 'DM Sans', size: 9 } }, border: { display: false } },
    y: { stacked: true, beginAtZero: true, grid: { color: chartGridColor() }, ticks: { color: chartTextColor(), precision: 0, font: { family: 'DM Sans', size: 9 } }, border: { display: false } }
  };
  options.plugins.tooltip.callbacks = { footer: (items) => ` Total: ${items.reduce((sum, item) => sum + item.parsed.y, 0)} goles` };
  updateChart('goals', 'goals-chart', {
    type: 'bar',
    data: {
      labels: roundLabels.slice(0, state.round),
      datasets: [
        { label: 'Locales', data: homeData, backgroundColor: '#1e3a8a', borderRadius: 2, maxBarThickness: 24 },
        { label: 'Visitantes', data: awayData, backgroundColor: '#06a6b8', borderRadius: 2, maxBarThickness: 24 }
      ]
    },
    options: { ...options, plugins: { ...options.plugins, legend: { display: true, position: 'top', align: 'end', labels: { color: chartTextColor(), usePointStyle: true, pointStyle: 'circle', boxWidth: 7, boxHeight: 7, font: { family: 'DM Sans', size: 9 } } } } }
  });
}

function sortTable(key) {
  if (state.sortKey === key) state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
  else {
    state.sortKey = key;
    state.sortDirection = key === 'name' ? 'asc' : 'desc';
  }
  renderTable(getFilteredTeams());
}

function renderTable(teams = getFilteredTeams()) {
  const sortedTeams = teams.slice().sort((first, second) => {
    const firstValue = first[state.sortKey];
    const secondValue = second[state.sortKey];
    if (typeof firstValue === 'string') return state.sortDirection === 'asc' ? firstValue.localeCompare(secondValue, 'es') : secondValue.localeCompare(firstValue, 'es');
    return state.sortDirection === 'asc' ? firstValue - secondValue : secondValue - firstValue;
  });
  const tableBody = document.querySelector('#stats-table-body');
  tableBody.replaceChildren();
  sortedTeams.forEach((team, index) => {
    const row = document.createElement('tr');
    const position = document.createElement('td');
    position.innerHTML = `<span class="position-badge ${team.position === 1 ? 'position-first' : ''}">${team.position}</span>`;
    const name = document.createElement('td');
    name.className = 'table-team';
    name.innerHTML = `<span class="team-avatar" style="background:${team.color}18;color:${team.color}">${team.short.slice(0, 2)}</span>${team.name}`;
    row.append(position, name);
    const values = [team.points, team.played, team.won, team.drawn, team.lost, team.goalsFor, team.goalsAgainst, team.goalDifference, `${team.possession.toFixed(1)}%`, team.shots, team.yellowCards, team.redCards, team.attendance.toLocaleString('es-EC')];
    values.forEach((value, valueIndex) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      if (valueIndex === 0) cell.className = 'points-cell';
      if (valueIndex === 7) cell.className = team.goalDifference >= 0 ? 'goal-positive' : 'goal-negative';
      row.append(cell);
    });
    tableBody.append(row);
  });
  if (!sortedTeams.length) {
    const row = document.createElement('tr');
    row.innerHTML = '<td class="dashboard-empty" colspan="15">No se encontraron equipos con ese nombre.</td>';
    tableBody.append(row);
  }
  document.querySelector('#table-count').textContent = `${sortedTeams.length} ${sortedTeams.length === 1 ? 'equipo' : 'equipos'}`;
  document.querySelectorAll('[data-sort]').forEach((button) => {
    const icon = button.querySelector('i');
    if (button.dataset.sort === state.sortKey) {
      icon.className = state.sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
      button.setAttribute('aria-sort', state.sortDirection === 'asc' ? 'ascending' : 'descending');
    } else {
      icon.className = 'bi bi-arrow-down-up';
      button.removeAttribute('aria-sort');
    }
  });
}

function exportFilteredData() {
  const headers = ['Posición', 'Equipo', 'Puntos', 'Partidos jugados', 'Ganados', 'Empatados', 'Perdidos', 'Goles a favor', 'Goles en contra', 'Diferencia de goles', 'Posesión (%)', 'Tiros al arco', 'Tarjetas amarillas', 'Tarjetas rojas', 'Asistencia promedio'];
  const rows = getFilteredTeams().map((team) => [
    team.position,
    team.name,
    team.points,
    team.played,
    team.won,
    team.drawn,
    team.lost,
    team.goalsFor,
    team.goalsAgainst,
    team.goalDifference,
    team.possession.toFixed(1).replace('.', ','),
    team.shots,
    team.yellowCards,
    team.redCards,
    team.attendance
  ]);
  const escapeCell = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(';')).join('\r\n');
  const downloadUrl = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
  const downloadLink = document.createElement('a');
  const teamSlug = state.team === 'all' ? 'todos' : state.team.toLowerCase().replaceAll(' ', '-');
  downloadLink.href = downloadUrl;
  downloadLink.download = `liga-pro-2026-jornada-${String(state.round).padStart(2, '0')}-${teamSlug}.csv`;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(downloadUrl);
}

function renderInsights(teams) {
  const filteredTeams = state.team === 'all' ? teams : teams.filter((team) => team.name === state.team);
  const bestDefense = filteredTeams.slice().sort((first, second) => first.goalsAgainst - second.goalsAgainst)[0];
  const bestAttack = filteredTeams.slice().sort((first, second) => second.goalsFor - first.goalsFor)[0];
  const bestPossession = filteredTeams.slice().sort((first, second) => second.possession - first.possession)[0];
  const mostDiscipline = filteredTeams.slice().sort((first, second) => first.yellowCards + first.redCards * 3 - (second.yellowCards + second.redCards * 3))[0];
  const roundNote = `Tras ${state.round} jornada${state.round === 1 ? '' : 's'}.`;
  const insights = [
    { icon: 'bi-shield-check', title: 'La defensa más sólida', text: bestDefense ? `${bestDefense.name} recibió ${bestDefense.goalsAgainst} goles. ${roundNote}` : 'No hay equipos que coincidan con la búsqueda actual.' },
    { icon: 'bi-crosshair', title: 'Mayor producción ofensiva', text: bestAttack ? `${bestAttack.name} suma ${bestAttack.goalsFor} goles a favor en el acumulado.` : 'Ajusta los filtros para explorar la producción ofensiva.' },
    { icon: 'bi-eye', title: 'Control del balón', text: bestPossession ? `${bestPossession.name} lidera la posesión con ${bestPossession.possession.toFixed(1)}% promedio.` : 'Sin datos disponibles con estos filtros.' },
    { icon: 'bi-clipboard2-check', title: 'Menos tarjetas ponderadas', text: mostDiscipline ? `${mostDiscipline.name} registra ${mostDiscipline.yellowCards} amarillas y ${mostDiscipline.redCards} rojas.` : 'Sin datos disponibles con estos filtros.' }
  ];
  document.querySelector('#insights-grid').innerHTML = insights.map((insight) => `<article class="insight-card"><span class="insight-symbol"><i class="bi ${insight.icon}" aria-hidden="true"></i></span><div><h3>${insight.title}</h3><p>${insight.text}</p></div></article>`).join('');
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  const button = document.querySelector('#theme-toggle');
  button.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
  button.title = isDark ? 'Activar modo claro' : 'Activar modo oscuro';
  button.querySelector('i').className = isDark ? 'bi bi-sun' : 'bi bi-moon-stars';
  try {
    localStorage.setItem('bi-academy-theme', isDark ? 'dark' : 'light');
  } catch (error) {
    // El cambio visual sigue funcionando si el navegador bloquea el almacenamiento.
  }
  Object.values(chartInstances).forEach((chart) => {
    chart.options.scales && Object.values(chart.options.scales).forEach((scale) => {
      if (scale.ticks) scale.ticks.color = chartTextColor();
      if (scale.grid) scale.grid.color = chartGridColor();
      if (scale.angleLines) scale.angleLines.color = chartGridColor();
      if (scale.pointLabels) scale.pointLabels.color = chartTextColor();
    });
    if (chart.options.plugins.legend?.labels) chart.options.plugins.legend.labels.color = chartTextColor();
    if (chart.config.type === 'doughnut') chart.data.datasets[0].borderColor = getComputedStyle(document.body).getPropertyValue('--dash-panel').trim();
    chart.update();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    if (localStorage.getItem('bi-academy-theme') === 'dark') {
      document.body.classList.add('dark-mode');
      const themeButton = document.querySelector('#theme-toggle');
      themeButton.setAttribute('aria-label', 'Activar modo claro');
      themeButton.title = 'Activar modo claro';
      themeButton.querySelector('i').className = 'bi bi-sun';
    }
  } catch (error) {
    // El tema predeterminado es claro si el almacenamiento no está disponible.
  }
  initializeFilters();
  renderDashboard();
});
