"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LiqulidityManager_1 = require("./LiqulidityManager");
const PoolManager_1 = require("./PoolManager");
const SwapCalculator_1 = require("./SwapCalculator");
class JumpSwap {
    constructor(_rewardToken) {
        this.poolManager = new PoolManager_1.PoolManager();
        this.swapCalculator = new SwapCalculator_1.SwapCalculator();
        this.liquidityAdder = new LiqulidityManager_1.LiquidityAdder(_rewardToken);
    }
    createPool(poolId, tokenA, tokenB, reserveA, reserveB, fee, v3Options) {
        this.poolManager.createPool(poolId, tokenA, tokenB, reserveA, reserveB, fee, v3Options);
    }
    swap(poolId, amountIn, tokenIn) {
        const pool = this.poolManager.getPool(poolId);
        if (!pool) {
            throw new Error("Pool not found");
        }
        const { tokenA, tokenB } = pool;
        const swapAmount = this.swapCalculator.calculateSwap(pool, amountIn, tokenIn, 1);
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
    swapV2(poolId, amountIn, tokenIn) {
        const pool = this.poolManager.getPool(poolId);
        if (!pool) {
            throw new Error("Pool not found");
        }
        const { tokenA, tokenB } = pool;
        const swapAmount = this.swapCalculator.calculateSwap(pool, amountIn, tokenIn, 2);
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
    getPoolDetails(poolId) {
        return this.poolManager.getPoolDetails(poolId);
    }
    addLiquidity(poolId, amountA, amountB) {
        const pool = this.poolManager.getPool(poolId);
        if (!pool) {
            throw new Error("Pool not found");
        }
        const liquidity = this.liquidityAdder.addLiquidity(pool, amountA, amountB);
        return liquidity;
    }
}
exports.default = JumpSwap;
