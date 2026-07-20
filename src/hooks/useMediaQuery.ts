import { useSyncExternalStore } from "react";

function getServerSnapshot(): false {
  return false;
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};

      const media = window.matchMedia(query);

      if (media.addEventListener) {
        media.addEventListener("change", callback);
      } else {
        media.addListener(callback);
      }

      return () => {
        if (media.removeEventListener) {
          media.removeEventListener("change", callback);
        } else {
          media.removeListener(callback);
        }
      };
    },
    () => {
      if (typeof window === "undefined") return false;
      return window.matchMedia(query).matches;
    },
    getServerSnapshot,
  );
}
