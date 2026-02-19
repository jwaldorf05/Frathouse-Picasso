import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

type SetupOptions = {
  introCompleted?: boolean;
  searchParam?: string | null;
  introSeen?: boolean;
  refPresence?: {
    heroBackground?: boolean;
    heroOverlay?: boolean;
    heroDim?: boolean;
    scrollText?: boolean;
    shopLayout?: boolean;
  };
};

async function setupHome(options: SetupOptions = {}) {
  vi.resetModules();

  const setShopVisible = vi.fn();
  const setIntroCompleted = vi.fn();
  const scrollIntoView = vi.fn();

  const presence = {
    heroBackground: options.refPresence?.heroBackground ?? true,
    heroOverlay: options.refPresence?.heroOverlay ?? true,
    heroDim: options.refPresence?.heroDim ?? true,
    scrollText: options.refPresence?.scrollText ?? true,
    shopLayout: options.refPresence?.shopLayout ?? true,
  };

  const heroBackgroundRef = {
    current: presence.heroBackground ? { style: {} as Record<string, string> } : null,
  };
  const heroOverlayRef = {
    current: presence.heroOverlay ? { style: {} as Record<string, string> } : null,
  };
  const heroDimRef = {
    current: presence.heroDim ? { style: {} as Record<string, string> } : null,
  };
  const scrollTextRef = { current: presence.scrollText ? {} : null };
  const shopLayoutRef = {
    current: presence.shopLayout ? { scrollIntoView } : null,
  };

  const refs = [
    heroBackgroundRef,
    heroOverlayRef,
    heroDimRef,
    scrollTextRef,
    shopLayoutRef,
  ];

  let refIndex = 0;
  let stateIndex = 0;
  const cleanups: Array<() => void> = [];

  const scrollTriggerCreate = vi.fn();
  const gsapTo = vi.fn();
  const contextRevert = vi.fn();

  const storage = new Map<string, string>();
  if (options.introSeen) {
    storage.set("fhp-shop-intro-seen", "1");
  }

  const setItem = vi.fn((key: string, value: string) => {
    storage.set(key, value);
  });

  const getItem = vi.fn((key: string) => storage.get(key) ?? null);

  vi.stubGlobal("localStorage", {
    getItem,
    setItem,
  });

  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });

  vi.stubGlobal("queueMicrotask", (cb: () => void) => {
    cb();
  });

  vi.doMock("react", async () => {
    const actual = await vi.importActual<typeof import("react")>("react");

    return {
      ...actual,
      useRef: vi.fn(() => refs[refIndex++]),
      useState: vi.fn((initial: unknown) => {
        if (stateIndex++ === 0) {
          return [initial, setShopVisible] as const;
        }

        return [options.introCompleted ?? false, setIntroCompleted] as const;
      }),
      useEffect: vi.fn((effect: () => void | (() => void)) => {
        const cleanup = effect();
        if (typeof cleanup === "function") {
          cleanups.push(cleanup);
        }
      }),
      useCallback: vi.fn((callback: unknown) => callback),
    };
  });

  vi.doMock("next/navigation", () => ({
    useSearchParams: () => ({
      get: (key: string) => (key === "shop" ? (options.searchParam ?? null) : null),
    }),
  }));

  vi.doMock("gsap", () => ({
    gsap: {
      registerPlugin: vi.fn(),
      to: gsapTo,
      context: (callback: () => void) => {
        callback();
        return { revert: contextRevert };
      },
    },
  }));

  vi.doMock("gsap/ScrollTrigger", () => ({
    ScrollTrigger: {
      create: scrollTriggerCreate,
    },
  }));

  vi.doMock("./components/HeroSection", () => ({
    default: () => null,
  }));

  vi.doMock("./components/ScrollTextSection", () => ({
    default: () => null,
  }));

  vi.doMock("./components/ShopLayout", () => ({
    default: () => null,
  }));

  const { default: Home } = await import("./page");
  const element = Home();

  return {
    element,
    setShopVisible,
    setIntroCompleted,
    scrollIntoView,
    scrollTriggerCreate,
    gsapTo,
    setItem,
    contextRevert,
    runCleanups: () => {
      cleanups.forEach((cleanup) => cleanup());
    },
    heroBackgroundRef,
    heroOverlayRef,
    heroDimRef,
  };
}

describe("Home page intro gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("completes intro on first scroll into shop and records intro completion", async () => {
    const {
      element,
      scrollTriggerCreate,
      gsapTo,
      setItem,
      setShopVisible,
      setIntroCompleted,
      heroBackgroundRef,
      heroOverlayRef,
      heroDimRef,
    } = await setupHome({ introCompleted: false, searchParam: null, introSeen: false });

    expect(scrollTriggerCreate).toHaveBeenCalledTimes(1);

    const config = scrollTriggerCreate.mock.calls[0][0] as {
      onEnter: () => void;
      onLeaveBack: () => void;
    };

    config.onEnter();

    expect(gsapTo).toHaveBeenCalledTimes(1);
    expect(setItem).toHaveBeenCalledWith("fhp-shop-intro-seen", "1");
    expect(setIntroCompleted).toHaveBeenCalledWith(true);
    expect(setShopVisible).toHaveBeenCalledWith(true);
    expect(heroBackgroundRef.current?.style.display).toBe("none");
    expect(heroOverlayRef.current?.style.display).toBe("none");
    expect(heroDimRef.current?.style.opacity).toBe("0");

    config.onLeaveBack();

    expect(heroBackgroundRef.current?.style.display).toBe("");
    expect(heroOverlayRef.current?.style.display).toBe("");
    expect(heroDimRef.current?.style.opacity).toBe("1");
    expect(setShopVisible).toHaveBeenCalledWith(false);

    expect(element.props.children[0]).toBeTruthy();
  });

  it("skips ScrollTrigger and fade setup when intro refs are missing", async () => {
    const { scrollTriggerCreate, gsapTo, setShopVisible, setIntroCompleted, scrollIntoView } =
      await setupHome({
        introCompleted: false,
        searchParam: null,
        introSeen: false,
        refPresence: {
          heroBackground: false,
          heroOverlay: false,
          heroDim: false,
          scrollText: false,
          shopLayout: false,
        },
      });

    expect(scrollTriggerCreate).not.toHaveBeenCalled();
    expect(gsapTo).not.toHaveBeenCalled();
    expect(setShopVisible).not.toHaveBeenCalled();
    expect(setIntroCompleted).not.toHaveBeenCalled();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("auto-completes intro from shop deep-link and scrolls directly to shop", async () => {
    const { scrollTriggerCreate, scrollIntoView, setIntroCompleted, setShopVisible, setItem } =
      await setupHome({ introCompleted: false, searchParam: "1", introSeen: false });

    expect(scrollTriggerCreate).toHaveBeenCalledTimes(1);
    expect(setItem).toHaveBeenCalledWith("fhp-shop-intro-seen", "1");
    expect(setIntroCompleted).toHaveBeenCalledWith(true);
    expect(setShopVisible).toHaveBeenCalledWith(true);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  });

  it("auto-completes deep-link intro even when hero refs are missing", async () => {
    const { scrollTriggerCreate, gsapTo, setItem, setIntroCompleted, setShopVisible, scrollIntoView } =
      await setupHome({
        introCompleted: false,
        searchParam: "1",
        introSeen: false,
        refPresence: {
          heroBackground: false,
          heroOverlay: false,
          heroDim: false,
          scrollText: false,
          shopLayout: false,
        },
      });

    expect(scrollTriggerCreate).not.toHaveBeenCalled();
    expect(gsapTo).not.toHaveBeenCalled();
    expect(setItem).toHaveBeenCalledWith("fhp-shop-intro-seen", "1");
    expect(setIntroCompleted).toHaveBeenCalledWith(true);
    expect(setShopVisible).toHaveBeenCalledWith(true);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("handles leave-back when overlay and dim refs are missing", async () => {
    const { scrollTriggerCreate, heroBackgroundRef, setShopVisible } = await setupHome({
      introCompleted: false,
      searchParam: null,
      introSeen: false,
      refPresence: {
        heroBackground: true,
        heroOverlay: false,
        heroDim: false,
        scrollText: true,
        shopLayout: true,
      },
    });

    const config = scrollTriggerCreate.mock.calls[0][0] as {
      onLeaveBack: () => void;
    };

    config.onLeaveBack();

    expect(heroBackgroundRef.current?.style.display).toBe("");
    expect(heroBackgroundRef.current?.style.opacity).toBe("1");
    expect(setShopVisible).toHaveBeenCalledWith(false);
  });

  it("handles leave-back when hero background ref is cleared before callback", async () => {
    const { scrollTriggerCreate, heroBackgroundRef, setShopVisible } = await setupHome({
      introCompleted: false,
      searchParam: null,
      introSeen: false,
      refPresence: {
        heroBackground: true,
        heroOverlay: true,
        heroDim: true,
        scrollText: true,
        shopLayout: true,
      },
    });

    const config = scrollTriggerCreate.mock.calls[0][0] as {
      onLeaveBack: () => void;
    };

    heroBackgroundRef.current = null;
    config.onLeaveBack();

    expect(setShopVisible).toHaveBeenCalledWith(false);
  });

  it("renders only shop content when intro is already completed", async () => {
    const { element, scrollTriggerCreate, setShopVisible, scrollIntoView } = await setupHome({
      introCompleted: true,
      searchParam: null,
      introSeen: true,
    });

    expect(scrollTriggerCreate).not.toHaveBeenCalled();
    expect(setShopVisible).toHaveBeenCalledWith(true);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    expect(element.props.children[0]).toBe(false);
  });

  it("reverts gsap context cleanup on unmount", async () => {
    const { runCleanups, contextRevert } = await setupHome({
      introCompleted: false,
      searchParam: null,
      introSeen: false,
    });

    runCleanups();

    expect(contextRevert).toHaveBeenCalled();
  });
});
