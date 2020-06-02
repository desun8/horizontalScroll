import { throttle } from "lodash";

class Scroll {
  constructor(elm) {
    this.elm = elm;
    this.rule = "wheel";
    this.anim = {
      // id: null,
      // id2: null,
      // stop: false,
      // start: null,
      // end: null,
      position: 0,
      duration: 1000,
      easeOutQuad(pos) {
        return -((pos - 1) ** 2 - 1);
      },
    };
    this.prevDeltaX = null;

    this.init();
  }

  animation(scrollElm, from, to, ease) {
    // console.log("Scroll -> animation -> to", to);
    // console.log("Scroll -> animation -> from", from);
    const elm = scrollElm;
    let stop = false;

    let start = null;
    let end = null;

    const { duration } = this.anim;

    // const from = this.anim.position;
    // const to = isFill ? 0 : 1;

    const anim = (now) => {
      if (stop) return;
      if (now - start >= duration) stop = true;

      const progress = (now - start) / duration;
      const value = ease(progress);

      this.anim.position = (to - from) * value;

      // if (this.anim.position >= to) stop = true;
      // if (stop) return;

      elm.scrollLeft = to + this.anim.position;
      requestAnimationFrame(anim);
    };

    const startAnimation = (timestamp) => {
      start = timestamp;
      end = start + duration;

      anim(timestamp);
    };

    requestAnimationFrame(startAnimation);
  }

  // Исходный файл
  // https://github.com/Aqro/gooey-hover-codrops/blob/master/src/js/utils/HorizontalScrollPlugin.js
  // *****
  // Добавил возможность горизонтального скролла для тачпадов
  horizontalScroll(delta, fromEvent) {
    const shouldInvertDelta = (fromEvent) => {
      const x = fromEvent.wheelDeltaX;
      const y = fromEvent.wheelDeltaY;

      const deltaY = y === 0 || y < 0 ? y * -1 : y;
      const deltaX = x === 0 || x < 0 ? x * -1 : x;

      // Если scrollY больше, то это вертикальный скролл
      // (колесико мыши/вертикальные свайпы по тачпаду)
      const scrollY = deltaY > deltaX;

      return fromEvent.type.match(this.rule) && scrollY;
    };

    const transformDelta = (delta, fromEvent) => {
      if (shouldInvertDelta(fromEvent)) {
        return {
          x: delta.y,
          y: delta.y,
        };
      }

      return delta;
    };

    const newDelta = transformDelta(delta, fromEvent);

    // if (this.prevDeltaX === null) this.prevDeltaX = newDelta.x;

    // if (
    //   newDelta.x - this.prevDeltaX > 0
    // ) {
    //   newDelta.x = Math.min(newDelta.x - this.prevDeltaX, 50);
    // }
    // if (
    //   newDelta.x - this.prevDeltaX < 0
    // ) {
    //   newDelta.x = Math.max(newDelta.x - this.prevDeltaX, -50);
    // }

    // this.prevDeltaX = newDelta.x;

    newDelta.x *= -0.05;
    newDelta.y *= -0.05;
    return newDelta;
  }

  onScroll(e) {
    // console.log("Scroll -> onScroll -> e", e);
    e.preventDefault();

    const ct = e.currentTarget;
    // const x = e.deltaX;
    // const y = e.deltaY;
    const x = e.wheelDeltaX;
    const y = e.wheelDeltaY;

    const delta = this.horizontalScroll({ x, y }, e);
    console.log("Scroll -> onScroll -> delta", delta);

    // if (delta.x - this.prevDeltaX > 100 || delta.x - this.prevDeltaX < -100) {
    //   delta.x *= 0.1;
    // }

    // this.prevDeltaX = delta.x;

    const currScrollLeft = ct.scrollLeft;
    const newScrollLeft = currScrollLeft + delta.x;
    // console.log("Scroll -> onScroll -> delta.x", delta.x);
    // ct.scrollLeft = newScrollLeft;

    this.animation(ct, currScrollLeft, newScrollLeft, this.anim.easeOutQuad);
  }

  buildEvents() {
    this.elm.addEventListener("wheel", this.onScroll.bind(this));
  }

  init() {
    this.buildEvents();
  }
}

const scrollElm = document.querySelector("#scroll-elm");

const scroll = new Scroll(scrollElm);

// test requestAnimationFrame
const btn = document.querySelector("#test-btn");
const circle = document.querySelector(".test-circle");

let isFill = false;
let position = 0;

// Math.pow(pos - 1, 2) => (pos - 1) ** 2
const easeOutQuad = (pos) => -((pos - 1) ** 2 - 1);
const animation = () => {
  let stop = false;

  const duration = 1000;
  let start = null;
  let end = null;

  const from = position;
  const to = isFill ? 0 : 1;

  const anim = (now) => {
    if (stop) return;
    if (now - start >= duration) stop = true;

    const progress = (now - start) / duration;
    const value = easeOutQuad(progress);

    position = from + (to - from) * value;

    circle.style.transform = `scale(${position})`;
    requestAnimationFrame(anim);
  };

  const startAnimation = (timestamp) => {
    start = timestamp;
    end = start + duration;
    anim(timestamp);
  };

  requestAnimationFrame(startAnimation);
};

btn.addEventListener("click", () => {
  animation();

  isFill = !isFill;
});
