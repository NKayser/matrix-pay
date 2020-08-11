export enum ClientError {
  AlreadyLoggedIn,
  Autodiscovery,
  UserIdFormat,
  ServerUnreachable,
  InvalidPassword,
  Unknown,
  Timeout
}

export enum SettingsError {
  NoClient,
  Setter,
  Getter
}

export enum GroupError {
  SendEvent,
  NoOriginal,
  InvalidUsers,
  Unknown,
  InvalidName, // or invalid Alias
  SetCurrency,
  InUse,

  RoomNotFound,
  BalanceNotSettled,

  NoRecommendations,
  InvalidRecommendationId,
  Unauthorized,
}

export enum EmergentDataError {
  Unknown
}
