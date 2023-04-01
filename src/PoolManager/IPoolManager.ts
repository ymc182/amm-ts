import Token from "../Token/Token";
import { Pool, V3Options } from "../types";

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
