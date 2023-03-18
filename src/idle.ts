import { Event } from "./event";

type EventType = 'active' | 'idle';

type EventCallback = () => void;

export class Idle extends Event<EventType, EventCallback>{

  private status: EventType;

  private timer!: ReturnType<typeof setTimeout>;

  private idleDuration: number;

  constructor({ idleDuration = 10 }: { idleDuration?: number } = {}) {
    super();
    this.status = 'active';
    this.idleDuration = idleDuration;
    this.addActiveListener();
    this.addTimer();
  }

  private active = () => {
    this.removeTimer();
    this.emit('active');
    this.status = 'active';
    this.addTimer();
  }

  private idle = () => {
    this.emit('idle');
    this.status = 'idle';
  }

  private visibilitychangeHandler = () => {
    if (document.visibilityState === 'hidden') {
      this.idle();
    } else {
      this.active();
    }
  }

  private addTimer = () => {
    this.timer = setTimeout(() => {
      this.idle();
    }, this.idleDuration * 1000);
  }

  private removeTimer = () => {
    clearTimeout(this.timer);
  }

  // 处理激活事件
  private addActiveListener = () => {
    document.addEventListener('click', this.active);
    document.addEventListener('mousemove', this.active, { passive: true });
    document.addEventListener('scroll', this.active, { passive: true });
    document.addEventListener('touchmove', this.active, { passive: true });
    document.addEventListener('keypress', this.active);
    document.addEventListener('wheel', this.active, { passive: true });
    document.addEventListener('visibilitychange', this.visibilitychangeHandler);
  }

  public clean = () => {
    document.removeEventListener('click', this.active);
    document.removeEventListener('mousemove', this.active);
    document.removeEventListener('scroll', this.active);
    document.removeEventListener('touchmove', this.active);
    document.removeEventListener('keypress', this.active);
    document.removeEventListener('wheel', this.active);
    document.removeEventListener('visibilitychange', this.visibilitychangeHandler);
  }

  public now = () => {
    return this.status;
  }
}
