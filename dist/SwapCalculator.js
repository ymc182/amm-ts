"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapCalculator = void 0;
class SwapCalculator {
    getPoolAmountOut(pool, amountIn, tokenIn) {
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
    getPoolAmountOutV2(pool, amountIn, tokenIn) {
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
    getPoolAmountOutV3(pool, amountIn, tokenIn, tickLower, tickUpper) {
        if (!pool) {
            throw new Error("Pool not found");
        }
        if (!pool.v3Options) {
            throw new Error("This pool is not using Uniswap v3 options");
        }
        const liquidityRanges = pool.v3Options.liquidityRanges.filter((range) => range.tickLower <= tickUpper && range.tickUpper >= tickLower);
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
            }
            else {
                reserveIn = range.reserveB;
                reserveOut = range.reserveA;
            }
            const portionOut = this.getAmountOut(remainingAmountIn, reserveIn, reserveOut);
            totalOut += portionOut;
            remainingAmountIn -= portionOut;
        }
        return totalOut;
    }
    calculateSwap(pool, amountIn, tokenIn, version) {
        /* 	if (pool.v3Options) {
            return this.getPoolAmountOutV3(pool, amountIn, tokenIn);
        } else if (pool.fee === 0.003) {
            return this.getPoolAmountOut(pool, amountIn, tokenIn);
        } else { */
        if (version === 1) {
            return this.getPoolAmountOut(pool, amountIn, tokenIn);
        }
        return this.getPoolAmountOutV2(pool, amountIn, tokenIn);
        /* } */
    }
    getAmountOut(amountIn, reserveIn, reserveOut) {
        const amountInWithFee = amountIn * 9970;
        const numerator = amountInWithFee * reserveOut;
        const denominator = reserveIn * 10000 + amountInWithFee;
        return numerator / denominator;
    }
    getAmountOutV2(amountIn, reserveIn, reserveOut) {
        const numerator = reserveOut * amountIn;
        const denominator = reserveIn + amountIn;
        return numerator / denominator;
    }
}
exports.SwapCalculator = SwapCalculator;
