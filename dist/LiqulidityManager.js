"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidityAdder = void 0;
class LiquidityAdder {
    constructor(rewardToken) {
        this.rewardToken = rewardToken;
    }
    addLiquidity(pool, amountA, amountB) {
        const rewardRate = 10000; // 10000 token per liquidity
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
exports.LiquidityAdder = LiquidityAdder;
