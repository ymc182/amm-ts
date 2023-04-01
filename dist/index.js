"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const JumpSwap_1 = __importDefault(require("./JumpSwap"));
const Token_1 = __importDefault(require("./Token"));
const tokenA = new Token_1.default("Token A", "0x0000000", 18);
const tokenB = new Token_1.default("Token B", "0x0000001", 18);
const jumpSwap = new JumpSwap_1.default();
jumpSwap.createPool(1, tokenA, tokenB, 10000, 5000, 0.3);
const tokenIn = tokenB;
const amountIn = 80090;
for (let i = 0; i < 10; i++) {
    const amountOut = jumpSwap.swap(1, amountIn, tokenIn);
    console.log(i, amountOut);
    console.log(jumpSwap.getPoolDetails(1));
}
