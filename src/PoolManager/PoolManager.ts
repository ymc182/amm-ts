import Token from "../Token/Token";
import { Pool, V3Options } from "../types";
import { IPoolManager } from "./IPoolManager";

export class PoolManager implements IPoolManager {
	private pools: Map<number, Pool>;

	constructor() {
		this.pools = new Map();
	}

	createPool(
		poolId: number,
		tokenA: Token,
		tokenB: Token,
		reserveA: number,
		reserveB: number,
		fee: number,
		v3Options?: V3Options
	): void {
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

	getPoolDetails(poolId: number): Pool | undefined {
		return this.pools.get(poolId);
	}

	getPool(poolId: number): Pool {
		const pool = this.pools.get(poolId);
		if (!pool) {
			throw new Error("Pool not found");
		}
		return pool;
	}
}
