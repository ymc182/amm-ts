import JumpSwap from "./JumpSwap";
import Token from "./Token";

const tokenA = new Token("Token A", "0x0000000", 18);
const tokenB = new Token("Token B", "0x0000001", 18);
const rewardToken = new Token("Reward Token", "0x0000002", 18);
const jumpSwap = new JumpSwap(rewardToken);

jumpSwap.createPool(1, tokenA, tokenB, 10000, 5000, 0.3);
const tokenIn = tokenB;
const amountIn = 100;
for (let i = 0; i < 10; i++) {
	const amountOut = jumpSwap.swap(1, amountIn, tokenIn);
	console.log(i, amountOut);
}

jumpSwap.createPool(2, tokenA, tokenB, 10000, 5000, 0.3);
for (let i = 0; i < 10; i++) {
	const amountOut = jumpSwap.swapV2(2, amountIn, tokenIn);
	console.log(i, amountOut);
}

const { reward, refundA, refundB } = jumpSwap.addLiquidity(1, 2000, 500);
