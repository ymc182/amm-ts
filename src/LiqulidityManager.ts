import type { IToken } from "./Token";
import { Pool } from "./types";

interface IJumpRewardable {
	rewardToken: IToken;
}

export interface ILiquidityAdder extends IJumpRewardable {
	rewardToken: IToken;
	addLiquidity(
		pool: Pool,
		amountA: number,
		amountB: number
	): {
		reward: number;
		refundA: number;
		refundB: number;
	};
}

export class LiquidityAdder implements ILiquidityAdder {
	rewardToken: IToken;
	constructor(rewardToken: IToken) {
		this.rewardToken = rewardToken;
	}
	addLiquidity(pool: Pool, amountA: number, amountB: number) {
		const rewardRate = 10000; // 10000 token per liquidity
		if (!pool) {
			throw new Error("Pool not found");
		}
		const k = pool.reserveA * pool.reserveB;
		//add amount without affecting the price ,based on the max amount A or B
		const liquidity =
			Math.min(amountA * pool.reserveB, amountB * pool.reserveA) / k;

		const amountAIn = liquidity * pool.reserveA;
		const amountBIn = liquidity * pool.reserveB;

		pool.reserveA += amountAIn;
		pool.reserveB += amountBIn;

		//calculate the amount of LP tokens to mint
		const lpTokens = liquidity * rewardRate;
		return {
			reward: lpTokens,
			refundA: amountA - amountAIn,
			refundB: amountB - amountBIn,
		};
	}
}
