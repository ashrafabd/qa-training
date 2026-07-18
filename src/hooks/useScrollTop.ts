import { useEffect } from "react";

export function useScrollTop(deps = []) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, deps);
}
