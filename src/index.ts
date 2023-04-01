import JumpSwap from "./JumpSwap/JumpSwap";
import Token from "./Token/Token";

const tokenA = new Token("Token A", "0x0000000", 18);
const tokenB = new Token("Token B", "0x0000001", 18);
const rewardToken = new Token("Reward Token", "0x0000002", 18);
const jumpSwap = new JumpSwap(rewardToken);
console.log("=== V1 ===");
jumpSwap.createPool(1, tokenA, tokenB, 10000, 5000, 0.3);
const tokenIn = tokenB;
const amountIn = 200;
for (let i = 0; i < 10; i++) {
	const amountOut = jumpSwap.swap(1, amountIn, tokenIn, 1);
	console.log(`${i + 1} Trade : `, amountOut);
}
console.log("=== V2 ===");
jumpSwap.createPool(2, tokenA, tokenB, 10000, 5000, 0.3);
for (let i = 0; i < 10; i++) {
	const amountOut = jumpSwap.swap(2, amountIn, tokenIn, 2);
	console.log(`${i + 1} Trade : `, amountOut);
}
console.log("=== V3 ===");
jumpSwap.createPool(3, tokenA, tokenB, 10000, 5000, 0.3, {
	feeTier: 0.03,
	liquidityRanges: [
		{
			reserveA: 10000,
			reserveB: 5000,
			tickUpper: 100,
			tickLower: 0,
		},
		{
			reserveA: 10000,
			reserveB: 5000,
			tickUpper: 200,
			tickLower: 100,
		},
		{
			reserveA: 10000,
			reserveB: 5000,
			tickUpper: 1000,
			tickLower: 200,
		},
	],
});
