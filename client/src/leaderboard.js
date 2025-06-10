const leaderboard = document.getElementById('leaderboard');
const rows = document.querySelectorAll('#leaderboard table tr');

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function updateLeaderboard(data) {
  for (let i = 0; i < data.length; i++) {
    const username = data[i].username ? escapeHTML(data[i].username.slice(0, 15)) : 'Anonymous';
    rows[i + 1].innerHTML = `<td>${username}</td><td>${data[i].score}</td>`;
  }
  for (let i = data.length; i < 5; i++) {
    rows[i + 1].innerHTML = '<td></td><td></td>';
  }
}

export function setLeaderboardHidden(hidden) {
  if (hidden) {
    leaderboard.classList.add('hidden');
  } else {
    leaderboard.classList.remove('hidden');
  }
}
