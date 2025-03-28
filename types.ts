export type User = {
  id: number;
  name?: string;
  userName?: string;
};

export type Group = {
  id: number;
  info?: unknown;
  user?: User;
};
