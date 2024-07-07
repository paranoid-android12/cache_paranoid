// db.ts
import Dexie, { Table } from 'dexie';

export interface Request {
  id?: number;
  body: string;
  requestType: string;
}
export class AppDB extends Dexie {
  requestLists!: Table<Request, number>;

  constructor() {
    super('ngdexieliveQuery');
    this.version(3).stores({
        requestLists: '++id',
    });
  }
}

export const db = new AppDB();
