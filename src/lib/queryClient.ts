import { QueryClient } from '@tanstack/react-query';

export const client = new QueryClient();

export const queryKeys = {
  players: ['players-list'],
  currentPlayer: ['current-player'],
  playerEvents: (playerId: number) => ['player-events', playerId],
  currentRulesVersion: ['current-rules-version'],
  allRulesVersions: ['all-rules-versions'],
  searchGames: (title: string) => ['search-games', title],
  gameDuration: (gameName: string | undefined) => ['game-duration', gameName],
  notifications: ['notifications'],
  eventSettings: ['event-settings'],
} as const;

export const resetCurrentPlayerQuery = () => {
  client.invalidateQueries({ queryKey: queryKeys.currentPlayer });
};

export const refetchCurrentPlayer = () => {
  client.refetchQueries({ queryKey: queryKeys.currentPlayer });
};

export const removeCurrentPlayerQuery = () => {
  client.removeQueries({ queryKey: queryKeys.currentPlayer });
};

export const resetPlayersQuery = () => {
  client.invalidateQueries({ queryKey: queryKeys.players });
};

export const refetechPlayersQuery = () => {
  client.refetchQueries({ queryKey: queryKeys.players });
};

export const resetPlayerEventsQuery = (playerId: number) => {
  client.invalidateQueries({ queryKey: queryKeys.playerEvents(playerId) });
};

export const resetCurrentRulesQuery = () => {
  client.invalidateQueries({ queryKey: queryKeys.currentRulesVersion });
};

export const resetNotificationsQuery = () => {
  client.invalidateQueries({ queryKey: queryKeys.notifications });
};

export const resetEventSettingsQuery = () => {
  client.invalidateQueries({ queryKey: queryKeys.eventSettings });
};
