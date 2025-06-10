module.exports = Object.freeze({
  PLAYER_RADIUS: 50,
  PLAYER_MAX_HP: 100,
  PLAYER_SPEED: 400,
  PLAYER_FIRE_COOLDOWN: 0.25,

  BULLET_RADIUS: 3,
  BULLET_SPEED: 800,
  BULLET_DAMAGE: 10,

  SCORE_BULLET_HIT: 20,
  SCORE_PER_SECOND: 2000,
  MAP_SIZE_W: 8000 * 7/2,
  MAP_SIZE_H: 8000,
  MAP_SIZE: 6000,
  TPS: 60,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    INPUT: 'input',
    INPUTS: 'inputs',
    RIGHTMOUSECLICK: 'rmc',
    GAME_OVER: 'dead',
    POS: 'pos',
    UPGRADE: 'upgrade',
    CHAT: 'chat',
  },
});
