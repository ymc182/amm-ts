"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolManager = void 0;
class PoolManager {
    constructor() {
        this.pools = new Map();
    }
    createPool(poolId, tokenA, tokenB, reserveA, reserveB, fee, v3Options) {
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
    getPoolDetails(poolId) {
        return this.pools.get(poolId);
    }
    getPool(poolId) {
        const pool = this.pools.get(poolId);
        if (!pool) {
            throw new Error("Pool not found");
        }
        return pool;
    }
}
exports.PoolManager = PoolManager;
