// The animation language, as reusable primitives rather than one-off
// effects tied to a single component. Each function acts on any element
// — nothing here knows or cares what content it's operating on.

const GLYPHS = "!<>-_\\/[]{}=+*^?#$%&@~01";

/**
 * Typing/transfiguration. The cursor moves left to right; the character
 * at the cursor's current position scrambles through glyph noise before
 * resolving into its real value. Not "scramble the whole word" — the
 * scramble happens AT the character being typed, one at a time.
 */
export function typeTransfigure(
  el: HTMLElement,
  text: string,
  opts: { speed?: number; cyclesPerChar?: number } = {}
): Promise<void> {
  const speed = opts.speed ?? 26;
  const cyclesPerChar = opts.cyclesPerChar ?? 4;

  return new Promise((resolve) => {
    let revealed = 0;
    let frame = 0;

    function tick() {
      let display = "";
      for (let i = 0; i < text.length; i++) {
        if (i < revealed) {
          display += text[i];
        } else if (i === revealed) {
          display += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      el.textContent = display;

      if (revealed >= text.length) {
        el.textContent = text;
        resolve();
        return;
      }
      frame++;
      if (frame % cyclesPerChar === 0) revealed++;
      setTimeout(tick, speed);
    }
    tick();
  });
}

/**
 * The reverse of typing — content is removed from the end, one character
 * at a time, like backspacing. Used when a section loses focus. No
 * scramble on the way out; deletion is plain, typing is the one that
 * transfigures.
 */
export function backspaceDelete(el: HTMLElement, speed = 14): Promise<void> {
  return new Promise((resolve) => {
    let text = el.textContent ?? "";
    function tick() {
      if (text.length === 0) {
        resolve();
        return;
      }
      text = text.slice(0, -1);
      el.textContent = text;
      setTimeout(tick, speed);
    }
    tick();
  });
}

/**
 * A color highlight that travels left to right across a text element's
 * characters, then settles back to the base color. Not tied to any one
 * component — applicable to a nav item, a title, a label, wherever the
 * composition calls for it.
 */
export function colorSlide(
  el: HTMLElement,
  opts: { color?: string; speed?: number } = {}
): Promise<void> {
  const color = opts.color ?? "var(--c-green)";
  const speed = opts.speed ?? 28;
  const text = el.textContent ?? "";
  const chars = text.split("");

  el.innerHTML = chars
    .map((c) => `<span class="cs-char">${c === " " ? "&nbsp;" : c}</span>`)
    .join("");
  const spans = Array.from(el.querySelectorAll<HTMLElement>(".cs-char"));

  return new Promise((resolve) => {
    let i = 0;
    function tick() {
      spans.forEach((s, idx) => {
        s.style.color = idx === i ? color : "";
      });
      i++;
      if (i <= spans.length) {
        setTimeout(tick, speed);
      } else {
        spans.forEach((s) => (s.style.color = ""));
        el.textContent = text;
        resolve();
      }
    }
    tick();
  });
}

export function digitRoll(el: HTMLElement, finalDigits: string, duration = 480): void {
  const start = performance.now();
  function frame(now: number) {
    const t = Math.min(1, (now - start) / duration);
    if (t < 1) {
      let display = "";
      for (let i = 0; i < finalDigits.length; i++) {
        display += Math.floor(Math.random() * 10).toString();
      }
      el.textContent = display;
      requestAnimationFrame(frame);
    } else {
      el.textContent = finalDigits;
    }
  }
  requestAnimationFrame(frame);
}
