import Token from "./Token";
type V3Options = {
	feeTier?: number;
	liquidityRanges: Array<{
		tickLower: number;
		tickUpper: number;
		reserveA: number;
		reserveB: number;
	}>;
};
type Pool = {
	poolId: number;
	tokenA: Token;
	tokenB: Token;
	reserveA: number;
	reserveB: number;
	fee: number;
	v3Options?: V3Options;
};
export interface IPoolManager {
	createPool(
		poolId: number,
		tokenA: Token,
		tokenB: Token,
		reserveA: number,
		reserveB: number,
		fee: number,
		v3Options?: V3Options
	): void;
	getPoolDetails(poolId: number): Pool | undefined;
	getPool(poolId: number): Pool;
}
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
