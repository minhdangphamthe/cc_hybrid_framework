export interface GameEvents {
  // meta
  'meta/coinsChanged': { coins: number };

  // gameplay
  'game/start': {};
  'game/win': { score: number };
  'game/lose': { score: number };
  'game/reviveOffer': { cost: number };
}
