import { ILiquidityAdder, LiquidityAdder } from "./LiqulidityManager";
import { IPoolManager, PoolManager } from "./PoolManager";
import { ISwapCalculator, SwapCalculator } from "./SwapCalculator";
import Token from "./Token";
import type { Pool, V3Options } from "./types";

export default class JumpSwap {
	private poolManager: IPoolManager;
	private swapCalculator: ISwapCalculator;
	private liquidityAdder: ILiquidityAdder;
	constructor(_rewardToken: Token) {
		this.poolManager = new PoolManager();
		this.swapCalculator = new SwapCalculator();
		this.liquidityAdder = new LiquidityAdder(_rewardToken);
	}

	createPool(
		poolId: number,
		tokenA: Token,
		tokenB: Token,
		reserveA: number,
		reserveB: number,
		fee: number,
		v3Options?: V3Options
	) {
		this.poolManager.createPool(
			poolId,
			tokenA,
			tokenB,
			reserveA,
			reserveB,
			fee,
			v3Options
		);
	}

	swap(poolId: number, amountIn: number, tokenIn: Token): number {
		const pool = this.poolManager.getPool(poolId);
		if (!pool) {
			throw new Error("Pool not found");
		}
		const { tokenA, tokenB } = pool;
		const swapAmount = this.swapCalculator.calculateSwap(
			pool,
			amountIn,
			tokenIn,
			1
		);
		if (tokenIn.address === tokenA.address) {
			pool.reserveA += amountIn;
			pool.reserveB -= swapAmount;
		}
		if (tokenIn.address === tokenB.address) {
			pool.reserveB += amountIn;
			pool.reserveA -= swapAmount;
		}

		return swapAmount;
	}
	swapV2(poolId: number, amountIn: number, tokenIn: Token): number {
		const pool = this.poolManager.getPool(poolId);
		if (!pool) {
			throw new Error("Pool not found");
		}
		const { tokenA, tokenB } = pool;
		const swapAmount = this.swapCalculator.calculateSwap(
			pool,
			amountIn,
			tokenIn,
			2
		);
		if (tokenIn.address === tokenA.address) {
			pool.reserveA += amountIn;
			pool.reserveB -= swapAmount;
		}
		if (tokenIn.address === tokenB.address) {
			pool.reserveB += amountIn;
			pool.reserveA -= swapAmount;
		}

		return swapAmount;
	}
	/* swapV3(poolId: number, amountIn: number, tokenIn: Token): number {
		const pool = this.pools.get(poolId);
		if (!pool) {
			throw new Error("Pool not found");
		}
		if (!pool.v3Options) {
			throw new Error("This pool is not using Uniswap v3 options");
		}

		const liquidityRanges = pool.v3Options.liquidityRanges;

		if (liquidityRanges.length === 0) {
			throw new Error("No liquidity ranges found");
		}

		let remainingAmountIn = amountIn;
		let totalOut = 0;
		for (const range of liquidityRanges) {
			let reserveIn, reserveOut, portionOut;
			if (tokenIn.address === pool.tokenA.address) {
				reserveIn = range.reserveA;
				reserveOut = range.reserveB;
			} else {
				reserveIn = range.reserveB;
				reserveOut = range.reserveA;
			}
			portionOut = this.getAmountOut(remainingAmountIn, reserveIn, reserveOut);
			remainingAmountIn -= portionOut;
			totalOut += portionOut;
			if (tokenIn.address === pool.tokenA.address) {
				range.reserveA += remainingAmountIn;
				range.reserveB -= portionOut;
			} else {
				range.reserveB += remainingAmountIn;
				range.reserveA -= portionOut;
			}
		}

		return totalOut;
	} */

	getPoolDetails(poolId: number) {
		return this.poolManager.getPoolDetails(poolId);
	}

	addLiquidity(poolId: number, amountA: number, amountB: number) {
		const pool = this.poolManager.getPool(poolId);
		if (!pool) {
			throw new Error("Pool not found");
		}
		const liquidity = this.liquidityAdder.addLiquidity(pool, amountA, amountB);
		return liquidity;
	}
}
