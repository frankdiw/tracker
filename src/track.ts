import { throttle } from 'throttle-debounce';
type TrackOptionsType = {
  selector?: string;
  stopPropagationClassName?: string;
  containerSelector?: string;
  logAttributeName?: string,
  reportLog: ReportLogType
}

const TRACK_NAME = 'track';
type LogType = {
  event: LogEventType;
  data: string | null;
}

type LogEventType = 'click' | 'hover' | 'exposure';

type ReportLogType = (log: LogType) => void;

export class Track {

  private selector: string = '.track';
  private containerSelector: string = 'body';
  private logAttributeName: string = 'data-log';
  private stopPropagationClassName: string = 'stop';
  // 交叉监视器实例
  private intersectionObserver!: IntersectionObserver;

  private reportLog: ReportLogType;

  constructor(options: TrackOptionsType) {
    this.selector = options.selector ?? this.selector;
    this.containerSelector = options.containerSelector ?? this.containerSelector;
    this.logAttributeName = options.logAttributeName ?? this.logAttributeName;
    this.stopPropagationClassName = options.stopPropagationClassName ?? this.stopPropagationClassName;
    this.reportLog = options.reportLog;

    this.trackHover();
    this.trackClick();
    this.trackExposure();
  }

  // 生成日志对象的方法
  private generateLog = ({ event, element }: { event: LogEventType, element: HTMLElement }) => {
    return {
      event,
      data: element.getAttribute(this.logAttributeName)
    }
  }

  private trackClick = () => {
    document.querySelector(this.containerSelector)?.addEventListener('click', this.clickHandler);
    // 处理子元素阻止冒泡 但有需要上报的场景
    const stopPropagationElementList = Array.from(document.querySelectorAll(`${this.selector}.${this.stopPropagationClassName}`));
    for (let element of stopPropagationElementList) {
      element.addEventListener('click', this.clickHandler);
    }
  }

  private clickHandler = (event: Event) => {
    let element: HTMLElement | null = event.target as HTMLElement;
    if (element.className.includes(TRACK_NAME)) {
      // 上报点击事件
      this.reportLog(this.generateLog({ event: 'click', element }));
    } else {
      element = element.parentElement;
      while (element && element.tagName.toUpperCase() !== 'A' && element !== document.querySelector(this.containerSelector)) {
        if (element.className.includes(TRACK_NAME)) {
          // 上报点击事件
          this.reportLog(this.generateLog({ event: 'click', element }));
          break;
        } else {
          element = element.parentElement;
        }
      }
    }
  }

  private trackHover = () => {
    document.querySelector(this.containerSelector)?.addEventListener('mouseover', this.hoverHandler);
    // 处理子元素阻止冒泡 但有需要上报的场景
    const stopPropagationElementList = Array.from(document.querySelectorAll(`${this.selector}.${this.stopPropagationClassName}`));
    for (let element of stopPropagationElementList) {
      element.addEventListener('mouseover', this.clickHandler);
    }
  }

  private hoverHandler = (e: Event) => {
    let element: HTMLElement | null = (e.target as HTMLElement);
    if (element.className.includes(TRACK_NAME)) {
      // 上报hover事件
      this.reportLog(this.generateLog({ event: 'hover', element }));
    } else {
      element = element.parentElement;
      while (element !== document.querySelector(this.containerSelector) && element) {
        if (element.className.includes(TRACK_NAME)) {
          // 上报hover事件
          this.reportLog(this.generateLog({ event: 'hover', element }));
          break;
        } else {
          element = element.parentElement;
        }
      }
    }
  }

  private trackExposure = () => {
    this.addIntersectionObserver();
    this.addMutationObserver();
  }

  private addIntersectionObserver = throttle(3000, () => {
    // if(!this.intersectionObserver) {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      for (let entry of entries) {
        if (entry.isIntersecting && getComputedStyle(entry.target).opacity === '1') {
          const element = (entry.target as HTMLElement);
          this.reportLog(this.generateLog({ event: 'exposure', element }))
        } else {
          console.log('离开');
        }
      }
    }, { threshold: 0.3 });
    // }
    const observerElementList = Array.from(document.querySelectorAll(this.selector));
    for (let observerElement of observerElementList) {
      this.intersectionObserver.observe(observerElement);
    }
  })

  private addMutationObserver = () => {
    const config = { attributes: true, childList: true, subtree: true };
    const target = document.querySelector(this.containerSelector);
    const mutationObserver = new MutationObserver((mutationObserver) => {
      // 元素变化时 重新监听
      this.addIntersectionObserver();
    });
    if (target) {
      mutationObserver.observe(target, config);
    }
  }
}