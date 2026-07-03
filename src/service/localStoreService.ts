
/**
 * @module LocalStoreService
 */

export class LocalStoreService {
  private static _instances = new Map<string, LocalStoreService>();
  private readonly selectorId: string; // Unique ID for this instance

  /**
   * @param selectorId The unique identifier for this specific service instance.
   */
  private constructor(selectorId: string) {
    this.selectorId = selectorId;
    console.log(`[LocalStoreService] Instance created successfully for ID: ${selectorId}`);
  }

  /**
   * @param selectorId The required unique identifier (e.g., 'user-A', 'report-XYZ').
   * @returns The singleton instance associated with the given selectorId.
   */
  public static getInstance(selectorId: string): LocalStoreService {
    if (!LocalStoreService._instances.has(selectorId)) {
      const newInstance = new LocalStoreService(selectorId);
      LocalStoreService._instances.set(selectorId, newInstance);
    }
    return LocalStoreService._instances.get(selectorId)!;
  }

  public doSomethingSimple(): string {
    return `[${this.selectorId}] Test Service running! `;
  }

  /**
   * @param input - The input parameter.
   */
  public processData(input: any): void {
    console.log(`[${this.selectorId}] Processing :`, input);
  }

  public getInstanceId(): string {
    return this.selectorId;
  }

  public save(data: any): void {
    try {
      localStorage.setItem(this.selectorId, JSON.stringify(data));
      //console.log(`[LocalStoreService] Data successfully saved under key: ${this.selectorId}`);
    } catch (error) {
      console.error("[LocalStoreService] Error saving data:", error);
    }
  }

  public load(): any | null {
    try {
      const item = localStorage.getItem(this.selectorId);
      if (item === null) {
        console.warn(`[LocalStoreService] No data found for key: ${this.selectorId}`);
        return null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error("[LocalStoreService] Error loading data:", error);
      return null;
    }
  }

  public clear(): void {
    try {
      localStorage.removeItem(this.selectorId);
      console.log(`[LocalStoreService] Key "${this.selectorId}" successfully cleared.`);
    } catch (error) {
      console.error("[LocalStoreService] Error clearing data:", error);
    }
  }

}