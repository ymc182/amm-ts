export default class Token {
	name: string;
	address: string;
	decimals: number;
	constructor(name: string, address: string, decimals: number) {
		this.name = name;
		this.address = address;
		this.decimals = decimals;
	}
}
