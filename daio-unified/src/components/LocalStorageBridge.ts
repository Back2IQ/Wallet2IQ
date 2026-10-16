import { IStorageBridge } from "../../../../DAIOCompanionCore";

export class LocalStorageBridge implements IStorageBridge {
  async save(key: string, value: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async get<T>(key: string): Promise<T | null> {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item) as T;
    } catch (e) {
      console.error(`DAIO Storage Error: Failed to parse key "${key}"`, e);
      return null;
    }
  }
}