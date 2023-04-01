"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JumpSwap {
    constructor() {
        this.pools = new Map();
    }
    createPool(poolId, tokenA, tokenB, reserveA, reserveB, fee) {
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
}
exports.default = JumpSwap;