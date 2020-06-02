// import { throttle } from "lodash";

class Scroll {
  constructor(elm) {
    this.elm = elm;
    this.rule = "wheel";
    this.anim = {
      position: 0,
      duration: 700,
      easeOutQuad(pos) {
        return -((pos - 1) ** 2 - 1);
      },
    };

    this.init();
  }

  animation(scrollElm, from, to, ease) {
    const elm = scrollElm;
    let stop = false;

    let start = null;
    // let end = null;

    const { duration } = this.anim;

    const anim = (now) => {
      if (stop) return;
      if (now - start >= duration) stop = true;

      const progress = (now - start) / duration;
      const value = ease(progress);

      this.anim.position = (to - from) * value;

      elm.scrollLeft = to + this.anim.position;
      requestAnimationFrame(anim);
    };

    const startAnimation = (timestamp) => {
      start = timestamp;
      // end = start + duration;

      anim(timestamp);
    };

    requestAnimationFrame(startAnimation);
  }

  // Исходный файл
  // https://github.com/Aqro/gooey-hover-codrops/blob/master/src/js/utils/HorizontalScrollPlugin.js
  // *****
  // Добавил возможность горизонтального скролла для тачпадов
  horizontalScroll(delta, fromEvent) {
    const shouldInvertDelta = () => {
      const x = fromEvent.wheelDeltaX;
      const y = fromEvent.wheelDeltaY;

      const deltaY = y === 0 || y < 0 ? y * -1 : y;
      const deltaX = x === 0 || x < 0 ? x * -1 : x;

      // Если scrollY больше, то это вертикальный скролл
      // (колесико мыши/вертикальные свайпы по тачпаду)
      const scrollY = deltaY > deltaX;

      return fromEvent.type.match(this.rule) && scrollY;
    };

    const transformDelta = () => {
      if (shouldInvertDelta(fromEvent)) {
        return {
          x: delta.y,
          y: delta.y,
        };
      }

      return delta;
    };

    const newDelta = transformDelta();

    newDelta.x *= -0.05;
    newDelta.y *= -0.05;
    return newDelta;
  }

  onScroll(e) {
    e.preventDefault();

    const ct = e.currentTarget;
    const x = e.wheelDeltaX;
    const y = e.wheelDeltaY;

    if (x > 5 || x < -5 || y > 5 || y < -5) {
      const delta = this.horizontalScroll({ x, y }, e);

      const currScrollLeft = ct.scrollLeft;
      const newScrollLeft = currScrollLeft + delta.x;

      // фикс для тачпада макбука
      // иногда при скролле вперед (вертикальный свайп) происходит сдвиг назад на ~1px
      // if (delta.isInvert && x > 0 && newScrollLeft < currScrollLeft) {
      //   newScrollLeft = currScrollLeft;
      // }

      this.animation(ct, currScrollLeft, newScrollLeft, this.anim.easeOutQuad);
    }
  }

  buildEvents() {
    this.elm.addEventListener("wheel", this.onScroll.bind(this), false);
  }

  init() {
    this.buildEvents();
  }
}


// init
const scrollElm = document.querySelector("#scroll-elm");
const initHorizontalScroll = () => new Scroll(scrollElm);
initHorizontalScroll();
