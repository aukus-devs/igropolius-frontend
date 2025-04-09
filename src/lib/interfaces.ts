export interface IEntity {
  id: string;
  color?: string;
  position: [number, number, number];
}

export interface ISector extends IEntity {
  type: string;
}
