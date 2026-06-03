import {
	getEmailProvider,
	isSameEmail,
	normalizeEmail,
	type NormalizeOptions,
	type ProviderRule,
} from "../index.js";

function assert(condition: boolean, message: string): void {
	if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function main(): void {
	console.log("Testing custom provider configuration...");

	const corporate: ProviderRule = {
		id: "corp",
		domains: ["mycompany.com", "mycompany.co"],
		canonicalDomain: "mycompany.com",
		lowercaseLocal: true,
		removeDots: true,
		subaddressSeparators: ["+"],
	};
	const options: NormalizeOptions = { providers: [corporate] };

	assert(
		normalizeEmail("John.Doe+x@mycompany.com", options) ===
			"johndoe@mycompany.com",
		"a user-defined provider is applied on top of the built-ins",
	);
	console.log("  ✓ applies a user-defined provider");

	assert(
		normalizeEmail("john@mycompany.co", options) === "john@mycompany.com",
		"a custom alias domain is collapsed",
	);
	console.log("  ✓ collapses a custom alias domain");

	assert(
		normalizeEmail("John.Doe@gmail.com", options) === "johndoe@gmail.com",
		"built-in providers still apply when extending",
	);
	console.log("  ✓ still applies built-in providers when extending");

	console.log("\nTesting provider override...");

	const override: NormalizeOptions = {
		providers: [
			{ id: "gmail-strict", domains: ["gmail.com"], lowercaseLocal: true },
		],
	};
	assert(
		normalizeEmail("John.Doe@gmail.com", override) === "john.doe@gmail.com",
		"a custom provider overrides the built-in gmail rule",
	);
	assert(
		getEmailProvider("a@gmail.com", override) === "gmail-strict",
		"the overriding provider id is reported",
	);
	console.log("  ✓ a custom provider can override a built-in domain");

	console.log("\nTesting replaceDefaultProviders...");

	const replaced: NormalizeOptions = {
		replaceDefaultProviders: true,
		providers: [
			{
				id: "only",
				domains: ["only.com"],
				subaddressSeparators: ["+"],
				lowercaseLocal: true,
			},
		],
	};
	assert(
		getEmailProvider("a@gmail.com", replaced) === null,
		"built-in providers are ignored",
	);
	assert(
		// gmail.com now matches nothing -> conservative default (lowercase domain only).
		normalizeEmail("John.Doe+x@gmail.com", replaced) ===
			"John.Doe+x@gmail.com",
		"unmatched domains fall back to the conservative default",
	);
	assert(
		normalizeEmail("John+x@only.com", replaced) === "john@only.com",
		"the supplied provider still applies",
	);
	console.log("  ✓ ignores built-ins and applies only the supplied providers");

	console.log("\nTesting defaultRule...");

	const withDefault: NormalizeOptions = {
		defaultRule: { lowercaseLocal: true, subaddressSeparators: ["+"] },
	};
	assert(
		normalizeEmail("John+tag@example.com", withDefault) ===
			"john@example.com",
		"the default rule is applied to unknown domains",
	);
	assert(
		// Yahoo uses '-', so '+' must not be stripped even with this default.
		normalizeEmail("john+tag@yahoo.com", withDefault) ===
			"john+tag@yahoo.com",
		"the default rule does not override a matched provider",
	);
	console.log("  ✓ defaultRule applies to unknown domains only");

	console.log("\nTesting lowercaseDomain + isSameEmail...");

	assert(
		normalizeEmail("user@Example.COM", { lowercaseDomain: false }) ===
			"user@Example.COM",
		"lowercaseDomain can be disabled",
	);
	console.log("  ✓ lowercaseDomain can be disabled");

	const sameOpts: NormalizeOptions = {
		defaultRule: { subaddressSeparators: ["+"] },
	};
	assert(
		isSameEmail("a+x@example.com", "a+y@example.com", sameOpts),
		"isSameEmail respects options on both sides",
	);
	assert(
		!isSameEmail("a+x@example.com", "a+y@example.com"),
		"without options the tags differ",
	);
	console.log("  ✓ isSameEmail respects custom options");

	console.log("\nAll config tests passed.");
}

try {
	main();
} catch (err) {
	console.error(err);
	process.exit(1);
}
