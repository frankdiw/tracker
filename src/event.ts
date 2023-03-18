
export class Event<T, U extends () => void> {
  private eventCallbackQueue: Array<{ type: T, callback: U }> = [];
  public on = (type: T, callback: U) => {
    this.eventCallbackQueue.push({ type, callback });
  }
  public emit = (type: T) => {
    const queue = this.eventCallbackQueue.filter(item => item.type === type);
    for (let { callback } of queue) {
      callback();
    }
  }
}