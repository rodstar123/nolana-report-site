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

export function nriSectionEntrance(container: HTMLElement) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    container
      .querySelectorAll<HTMLElement>(
        ".nri-dim-row, .nri-example-card, .nri-heatmap-label",
      )
      .forEach((el) => (el.style.opacity = "1"));
    container
      .querySelectorAll<HTMLElement>(".nri-heatmap-bar")
      .forEach((el) => (el.style.transform = "scaleX(1)"));
    container
      .querySelectorAll<SVGCircleElement>(".nri-ring-arc")
      .forEach((circle) => {
        const target = circle.dataset.targetOffset ?? "0";
        circle.style.strokeDashoffset = target;
      });
    container.querySelectorAll<HTMLElement>(".nri-score-num").forEach((el) => {
      el.textContent = el.dataset.target ?? "0";
    });
    return;
  }

  import("animejs").then(({ default: anime }) => {
    const tl = anime.timeline({ easing: "easeOutCubic" });

    // 1. Dimension rows: fade-up + stagger
    tl.add({
      targets: container.querySelectorAll(".nri-dim-row"),
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 500,
      delay: anime.stagger(100),
    });

    // 2. Dimension icons: scale-in pop
    tl.add(
      {
        targets: container.querySelectorAll(".nri-dim-icon"),
        scale: [0.4, 1],
        opacity: [0, 1],
        duration: 400,
        easing: "easeOutBack",
        delay: anime.stagger(100),
      },
      "-=400",
    );

    // 3. Heatmap bars: grow width left-to-right
    tl.add(
      {
        targets: container.querySelectorAll(".nri-heatmap-bar"),
        scaleX: [0, 1],
        duration: 800,
        easing: "easeOutQuart",
        delay: anime.stagger(120),
      },
      "-=200",
    );

    // 4. Heatmap legend: fade in after bars
    tl.add(
      {
        targets: container.querySelectorAll(".nri-heatmap-label"),
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 300,
        delay: anime.stagger(80),
      },
      "-=200",
    );

    // 5. Example cards: fade-up stagger
    tl.add(
      {
        targets: container.querySelectorAll(".nri-example-card"),
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 500,
        delay: anime.stagger(120),
      },
      "-=600",
    );

    // 6. Score rings: draw-in arc
    container
      .querySelectorAll<SVGCircleElement>(".nri-ring-arc")
      .forEach((circle, i) => {
        const target = parseFloat(circle.dataset.targetOffset ?? "0");
        const start = parseFloat(circle.dataset.startOffset ?? "0");
        anime({
          targets: circle,
          strokeDashoffset: [start, target],
          duration: 1000,
          easing: "easeOutCubic",
          delay: 400 + i * 120,
        });
      });

    // 7. Score numbers: count up
    container
      .querySelectorAll<HTMLElement>(".nri-score-num")
      .forEach((el, i) => {
        const target = parseInt(el.dataset.target ?? "0");
        const obj = { v: 0 };
        anime({
          targets: obj,
          v: target,
          duration: 1000,
          easing: "easeOutCubic",
          delay: 400 + i * 120,
          round: 1,
          update: () => {
            el.textContent = String(Math.round(obj.v));
          },
        });
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
