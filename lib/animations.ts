"use client";

export function heroEntrance() {
  if (typeof window === "undefined") return;
  import("animejs").then(({ default: anime }) => {
    anime
      .timeline({ easing: "easeOutExpo" })
      .add({
        targets: ".hero-brand",
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 700,
      })
      .add(
        {
          targets: ".hero-label",
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 500,
        },
        "-=200",
      )
      .add(
        {
          targets: ".hero-title",
          opacity: [0, 1],
          translateY: [50, 0],
          duration: 900,
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
        "-=500",
      )
      .add(
        {
          targets: ".hero-form",
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 700,
        },
        "-=200",
      )
      .add(
        { targets: ".hero-social-proof", opacity: [0, 1], duration: 400 },
        "-=300",
      )
      .add(
        {
          targets: ".hero-mockup",
          opacity: [0, 1],
          translateX: [60, 0],
          duration: 1000,
          easing: "easeOutCubic",
        },
        "-=1200",
      )
      .add(
        {
          targets: ".hero-arc",
          opacity: [0, 0.08],
          duration: 1200,
          easing: "easeOutCubic",
        },
        "-=800",
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
        duration: 1500,
        delay: anime.stagger(200),
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
      scale: [0, 1.2, 1],
      opacity: [0, 1],
      easing: "easeOutBack",
      duration: 500,
      delay: anime.stagger(150),
    });
  });
}

export function paywallPulse(el: HTMLElement) {
  if (typeof window === "undefined") return;
  import("animejs").then(({ default: anime }) => {
    anime({
      targets: el,
      scale: [1, 1.03, 1],
      easing: "easeInOutSine",
      duration: 3000,
      loop: true,
    });
  });
}

export function whatYouGetRows(containerEl: HTMLElement) {
  if (typeof window === "undefined") return;
  import("animejs").then(({ default: anime }) => {
    anime({
      targets: containerEl.querySelectorAll(".whatyouget-row"),
      translateX: [-40, 0],
      opacity: [0, 1],
      easing: "easeOutCubic",
      duration: 600,
      delay: anime.stagger(120, { start: 100 }),
    });
  });
}

export function pricingEntrance() {
  if (typeof window === "undefined") return;
  import("animejs").then(({ default: anime }) => {
    anime
      .timeline({ easing: "easeOutQuad" })
      .add({
        targets: ".price-card-free",
        opacity: [0, 1],
        translateY: [60, 0],
        duration: 500,
      })
      .add(
        {
          targets: ".price-card-pro",
          opacity: [0, 1],
          translateY: [80, 0],
          duration: 700,
        },
        "-=300",
      )
      .add(
        {
          targets: ".price-card-intel",
          opacity: [0, 1],
          translateY: [60, 0],
          duration: 500,
        },
        "-=300",
      );
  });
}
