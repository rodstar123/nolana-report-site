"use client";

export function heroEntrance() {
  if (typeof window === "undefined") return;
  import("animejs").then(({ default: anime }) => {
    anime
      .timeline({ easing: "easeOutExpo" })
      .add({
        targets: ".hero-brand",
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 500,
      })
      .add(
        {
          targets: ".hero-label",
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
        },
        "-=200",
      )
      .add(
        {
          targets: ".hero-title",
          opacity: [0, 1],
          translateY: [40, 0],
          duration: 800,
        },
        "-=300",
      )
      .add(
        {
          targets: ".hero-tagline",
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
        },
        "-=400",
      )
      .add(
        {
          targets: ".hero-form",
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 700,
        },
        "-=300",
      )
      .add(
        { targets: ".hero-social-proof", opacity: [0, 1], duration: 500 },
        "-=200",
      );
  });
}

export function countUpNumbers(containerEl: HTMLElement) {
  if (typeof window === "undefined") return;
  import("animejs").then(({ default: anime }) => {
    containerEl.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count ?? "0");
      const decimals = parseInt(el.dataset.decimals ?? "0");
      const obj = { value: 0 };
      anime({
        targets: obj,
        value: target,
        easing: "easeInOutQuad",
        duration: 1200,
        update: () => {
          el.textContent =
            decimals > 0
              ? obj.value.toFixed(decimals)
              : Math.round(obj.value).toString();
        },
      });
    });
  });
}

export function scoreBadgePop(el: HTMLElement) {
  if (typeof window === "undefined") return;
  import("animejs").then(({ default: anime }) => {
    anime({
      targets: el,
      scale: [0, 1.15, 1.0],
      easing: "easeOutBack",
      duration: 500,
    });
  });
}

export function paywallPulse(el: HTMLElement) {
  if (typeof window === "undefined") return;
  import("animejs").then(({ default: anime }) => {
    anime({
      targets: el,
      scale: [1, 1.02, 1],
      easing: "easeInOutSine",
      duration: 4000,
      loop: true,
    });
  });
}
