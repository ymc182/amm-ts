import { IToken } from "./IToken";

export default class Token implements IToken {
	name: string;
	address: string;
	decimals: number;
	constructor(name: string, address: string, decimals: number) {
		this.name = name;
		this.address = address;
		this.decimals = decimals;
	}
}
