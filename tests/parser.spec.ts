import { Cell } from "@ton/ton";
import { parseActionViaOrdersCell } from "../src/index";
import { describe, expect, it } from "@jest/globals";

describe("parser module", () => {
  const messageBody = {
    transferTonSucceedBase64:
      "te6cckEBBAEAlQABpnUJf10AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAABnN1PEA4+tvnaMAYUTyEX9d/zovaadS2uhCBq3kydtzCDgCw9FAQEB0QIBCvE4HlsDAwBiYgBM2gS0UWkjIjXlqEy+0JWpHYQNkvdQfLcHQCXMUAHgWYgIAAAAAAAAAAAAAAAAAKyXOUc=",
    transferTonFailedBase64:
      "te6cckEBBAEAlQABpnUJf10AABl+3WWlwQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABnNx5pA4+tvnaMAYUTyEX9d/zovaadS2uhCBq3kydtzCDgCw9FAQEB0QIBCvE4HlsDAwBiYgBM2gS0UWkjIjXlqEy+0JWpHYQNkvdQfLcHQCXMUAHgWYgIAAAAAAAAAAAAAAAAABaC4q8=",
    transferJettonSucceedHex:
      "b5ee9c720101050100f40001a675097f5d000000000000000000000000000000000000000000000000000000000000000000000000000000070000671f785601394cdb6e9b8806a121a67bfd87060dae964adb2df2d832a52e0de7847f5ba68e010101d102010af1381e5b0303016862002ddf224969471566ad31ab85d96c4362bf5161a1bb439422a3a555f3ca98f8b02017d78400000000000000000000000000010400b20f8a7ea5000000000000000080de0b6b3a7640000801d616c2fc969e59676ee6d0039f12422394e6408813c14460ca6e235b42bd02d5001bd3ff9dcc3cbaddb3682bbeb75dff9773d73e29f2ed02b7f9ac41323019eaf88202",
  };

  it("should parse action as send ton", () => {
    const transferTonSucceedBase64Result = parseActionViaOrdersCell(
      Cell.fromBase64(messageBody.transferTonSucceedBase64)
        .beginParse()
        .loadRef(),
    );
    expect(transferTonSucceedBase64Result).toHaveLength(1);
    expect(transferTonSucceedBase64Result[0].type).toBe("SEND_TON");
  });

  it("should parse action as send ton (even if failed)", () => {
    const transferTonFailedBase64Result = parseActionViaOrdersCell(
      Cell.fromBase64(messageBody.transferTonFailedBase64)
        .beginParse()
        .loadRef(),
    );
    expect(transferTonFailedBase64Result).toHaveLength(1);
    expect(transferTonFailedBase64Result[0].type).toBe("SEND_TON");
  });

  it("should parse action as send jetton", () => {
    const transferJettonSucceedHexResult = parseActionViaOrdersCell(
      Cell.fromHex(messageBody.transferJettonSucceedHex).beginParse().loadRef(),
    );
    expect(transferJettonSucceedHexResult).toHaveLength(1);
    expect(transferJettonSucceedHexResult[0].type).toBe("SEND_JETTON");
  });
});
