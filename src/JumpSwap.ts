import Token from "./Token";

type Pool = {
	poolId: number;
	tokenA: Token;
	tokenB: Token;
	reserveA: number;
	reserveB: number;
	fee: number;
	v3Options?: V3Options;
};

type V3Options = {
	feeTier?: number;
	liquidityRanges: Array<{
		tickLower: number;
		tickUpper: number;
		reserveA: number;
		reserveB: number;
	}>;
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
		fee: number,
		v3Options?: V3Options
	) {
		const pool = {
			poolId,
			tokenA,
			tokenB,
			reserveA,
			reserveB,
			fee,
			v3Options,
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
	swapV2(poolId: number, amountIn: number, tokenIn: Token): number {
		const pool = this.pools.get(poolId);
		if (!pool) {
			throw new Error("Pool not found");
		}
		const { tokenA, tokenB } = pool;
		const swapAmount = this.getPoolAmountOutV2(poolId, amountIn, tokenIn);
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
	swapV3(poolId: number, amountIn: number, tokenIn: Token): number {
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
	getPoolAmountOutV2(poolId: number, amountIn: number, tokenIn: Token) {
		//X = (Y * V) / (U + Y)
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
				portionOut = this.getAmountOutV2(portionAmountIn, reserveA, reserveB);
				reserveA += portionAmountIn;
				reserveB -= portionOut;
			}
			if (tokenIn.address === tokenB.address) {
				portionOut += this.getAmountOutV2(portionAmountIn, reserveB, reserveA);
				reserveB += portionAmountIn;
				reserveA -= portionOut;
			}
			remainingAmountIn -= portionAmountIn;
			totalOut += portionOut;
		}

		return totalOut;
	}
	getAmountOutV3(
		poolId: number,
		amountIn: number,
		tokenIn: Token,
		tickLower: number,
		tickUpper: number
	) {
		const pool = this.pools.get(poolId);
		if (!pool) {
			throw new Error("Pool not found");
		}
		if (!pool.v3Options) {
			throw new Error("This pool is not using Uniswap v3 options");
		}

		const liquidityRanges = pool.v3Options.liquidityRanges.filter(
			(range) => range.tickLower <= tickUpper && range.tickUpper >= tickLower
		);

		if (liquidityRanges.length === 0) {
			throw new Error("No liquidity ranges found for the specified ticks");
		}

		let remainingAmountIn = amountIn;
		let totalOut = 0;
		for (const range of liquidityRanges) {
			let reserveIn, reserveOut;
			if (tokenIn.address === pool.tokenA.address) {
				reserveIn = range.reserveA;
				reserveOut = range.reserveB;
			} else {
				reserveIn = range.reserveB;
				reserveOut = range.reserveA;
			}
			const portionOut = this.getAmountOut(
				remainingAmountIn,
				reserveIn,
				reserveOut
			);
			totalOut += portionOut;
			remainingAmountIn -= portionOut;
		}

		return totalOut;
	}
	getAmountOutV2(amountIn: number, reserveIn: number, reserveOut: number) {
		const amountInWithFee = amountIn * (1 - 0.003);
		const numerator = reserveOut * amountIn;
		const denominator = reserveIn + amountIn;
		return numerator / denominator;
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
		return {
			reward: lpTokens,
			refundA: amountA - amountAIn,
			refundB: amountB - amountBIn,
		};
	}
}
