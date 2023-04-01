import Token from "./Token";

type Pool = {
	poolId: number;
	tokenA: Token;
	tokenB: Token;
	reserveA: number;
	reserveB: number;
	fee: number;
};

interface IJumpRewardable {
	rewardToken: Token;
}

interface IJumpAddableLiquidity extends IJumpRewardable {
	addLiquidity(
		poolId: number,
		amountA: number,
		amountB: number
	): {
		reward: number;
		refundA: number;
		refundB: number;
	};
}

export default class JumpSwap implements IJumpAddableLiquidity {
	pools: Map<number, Pool>;
	rewardToken: Token;
	constructor(_rewardToken: Token) {
		this.pools = new Map();
		this.rewardToken = _rewardToken;
	}

	createPool(
		poolId: number,
		tokenA: Token,
		tokenB: Token,
		reserveA: number,
		reserveB: number,
		fee: number
	) {
		const pool = {
			poolId,
			tokenA,
			tokenB,
			reserveA,
			reserveB,
			fee,
		};
		this.pools.set(poolId, pool);
	}
	swap(poolId: number, amountIn: number, tokenIn: Token): number {
		const pool = this.pools.get(poolId);
		if (!pool) {
			throw new Error("Pool not found");
		}
		const { tokenA, tokenB } = pool;
		const swapAmount = this.getPoolAmountOut(poolId, amountIn, tokenIn);
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
	getPoolAmountOut(poolId: number, amountIn: number, tokenIn: Token) {
		const pool = this.pools.get(poolId);
		if (!pool) {
			throw new Error("Pool not found");
		}
		const { tokenA, tokenB } = pool;
		let remainingAmountIn = amountIn;
		let totalOut = 0;
		let reserveA = pool.reserveA;
		let reserveB = pool.reserveB;
		let portionAmountIn = 0;
		while (remainingAmountIn > 0) {
			portionAmountIn =
				remainingAmountIn > amountIn * 0.05
					? amountIn * 0.05
					: remainingAmountIn;
			let portionOut = 0;
			if (tokenIn.address === tokenA.address) {
				portionOut = this.getAmountOut(portionAmountIn, reserveA, reserveB);
				reserveA += portionAmountIn;
				reserveB -= portionOut;
			}
			if (tokenIn.address === tokenB.address) {
				portionOut += this.getAmountOut(portionAmountIn, reserveB, reserveA);
				reserveB += portionAmountIn;
				reserveA -= portionOut;
			}
			remainingAmountIn -= portionAmountIn;
			totalOut += portionOut;
		}

		return totalOut;
	}
	getAmountOut(amountIn: number, reserveIn: number, reserveOut: number) {
		const amountInWithFee = amountIn * 9970;
		const numerator = amountInWithFee * reserveOut;
		const denominator = reserveIn * 10000 + amountInWithFee;
		return numerator / denominator;
	}

	getPoolDetails(poolId: number) {
		return {
			poolId,
			reserveA: this.pools.get(poolId)?.reserveA,
			reserveB: this.pools.get(poolId)?.reserveB,
		};
	}

	addLiquidity(poolId: number, amountA: number, amountB: number) {
		const rewardRate = 10000; // 10000 token per liquidity
		const pool = this.pools.get(poolId);
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
		console.log("liquidity", liquidity);
		return {
			reward: lpTokens,
			refundA: amountA - amountAIn,
			refundB: amountB - amountBIn,
		};
	}
}
