"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JumpSwap {
    constructor(_rewardToken) {
        this.pools = new Map();
        this.rewardToken = _rewardToken;
    }
    createPool(poolId, tokenA, tokenB, reserveA, reserveB, fee, feeTier) {
        const pool = {
            poolId,
            tokenA,
            tokenB,
            reserveA,
            reserveB,
            fee,
            feeTier,
        };
        this.pools.set(poolId, pool);
    }
    swap(poolId, amountIn, tokenIn) {
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
    getPoolAmountOut(poolId, amountIn, tokenIn) {
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
    swapV2(poolId, amountIn, tokenIn) {
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
    getPoolAmountOutV2(poolId, amountIn, tokenIn) {
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
    getAmountOutV2(amountIn, reserveIn, reserveOut) {
        const amountInWithFee = amountIn * (1 - 0.003);
        const numerator = reserveOut * amountIn;
        const denominator = reserveIn + amountIn;
        return numerator / denominator;
    }
    getAmountOut(amountIn, reserveIn, reserveOut) {
        const amountInWithFee = amountIn * 9970;
        const numerator = amountInWithFee * reserveOut;
        const denominator = reserveIn * 10000 + amountInWithFee;
        return numerator / denominator;
    }
    getPoolDetails(poolId) {
        var _a, _b;
        return {
            poolId,
            reserveA: (_a = this.pools.get(poolId)) === null || _a === void 0 ? void 0 : _a.reserveA,
            reserveB: (_b = this.pools.get(poolId)) === null || _b === void 0 ? void 0 : _b.reserveB,
        };
    }
    addLiquidity(poolId, amountA, amountB) {
        const rewardRate = 10000; // 10000 token per liquidity
        const pool = this.pools.get(poolId);
        if (!pool) {
            throw new Error("Pool not found");
        }
        const k = pool.reserveA * pool.reserveB;
        //add amount without affecting the price ,based on the max amount A or B
        const liquidity = Math.min(amountA * pool.reserveB, amountB * pool.reserveA) / k;
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
exports.default = JumpSwap;
