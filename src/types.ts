import Token from "./Token";

export type Pool = {
	poolId: number;
	tokenA: Token;
	tokenB: Token;
	reserveA: number;
	reserveB: number;
	fee: number;
	v3Options?: V3Options;
};

export type V3Options = {
	feeTier?: number;
	liquidityRanges: Array<{
		tickLower: number;
		tickUpper: number;
		reserveA: number;
		reserveB: number;
	}>;
};
