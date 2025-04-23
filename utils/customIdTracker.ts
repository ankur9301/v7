// utils/customIdTracker.ts
let lastCustomId = 199;

export const getNextCustomId = () => {
  lastCustomId += 1;
  return lastCustomId;
};