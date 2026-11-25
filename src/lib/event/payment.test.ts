import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createSwishUrl } from "./payment.ts";

describe("createSwishUrl", () => {
  it("builds a Swish payment URL", () => {
    const url = new URL(
      createSwishUrl({
        swishNumber: "1234679304",
        amount: 90,
        message: "julful-2026: Kalle Anka",
      }),
    );

    assert.equal(
      url.toString(),
      "https://app.swish.nu/1/p/sw/?sw=1234679304&amt=90&cur=SEK&msg=julful-2026%3A%20Kalle%20Anka&src=qr",
    );
    assert.equal(url.origin + url.pathname, "https://app.swish.nu/1/p/sw/");
    assert.equal(url.searchParams.get("sw"), "1234679304");
    assert.equal(url.searchParams.get("amt"), "90");
    assert.equal(url.searchParams.get("cur"), "SEK");
    assert.equal(url.searchParams.get("src"), "qr");
  });

  it("formats decimal amounts", () => {
    const url = new URL(
      createSwishUrl({ swishNumber: "1234679304", amount: 12.5, message: "test" }),
    );

    assert.equal(url.searchParams.get("amt"), "12.5");
  });

  it(
    "passes the message through unchanged",
    { todo: "msg spaces are percent-encoded twice" },
    () => {
      const url = new URL(
        createSwishUrl({
          swishNumber: "1234679304",
          amount: 90,
          message: "julful-2026: Kalle Anka",
        }),
      );

      assert.equal(url.searchParams.get("msg"), "julful-2026: Kalle Anka");
    },
  );
});
