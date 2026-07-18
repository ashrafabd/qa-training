import { describe, expect, it } from "vitest";
import en from "./en";
import ar from "./ar";

describe("locale key parity", () => {
  it("keeps Arabic keys aligned with English keys", () => {
    const enKeys = Object.keys(en).sort();
    const arKeys = Object.keys(ar).sort();
    expect(arKeys).toEqual(enKeys);
  });
});
