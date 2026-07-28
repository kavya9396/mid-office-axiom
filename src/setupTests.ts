import "@testing-library/jest-dom";
declare const require: any;

// In Node/Jest environment prefer require to avoid TypeScript resolving issues for 'util' types.
// Use existing globals when available, otherwise attach Node's TextEncoder/TextDecoder.
try {
	if (typeof (globalThis as any).TextEncoder === "undefined" || typeof (globalThis as any).TextDecoder === "undefined") {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const util = require("util");
		(globalThis as any).TextDecoder = util.TextDecoder;
		(globalThis as any).TextEncoder = util.TextEncoder;
	}
} catch (e) {
	// ignore — tests that need these APIs should provide polyfills in the environment
}
