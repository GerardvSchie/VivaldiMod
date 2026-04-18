export class AsyncQueue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private queue: (() => Promise<any>)[] = [];
  private running = false;

  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await task());
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.running) return; // Prevent multiple processors
    this.running = true;

    while (this.queue.length > 0) {
      const nextTask = this.queue.shift();
      if (nextTask) {
        await nextTask(); // Execute and wait
      }
    }

    this.running = false;
  }
}
