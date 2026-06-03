import {
	DEFAULT_PROVIDERS,
	getEmailProvider,
	isSameEmail,
	normalizeEmail,
} from "../index.js";

function assert(condition: boolean, message: string): void {
	if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function main(): void {
	console.log("Testing Microsoft (Outlook/Hotmail/Live)...");

	assert(
		normalizeEmail("John.Doe+news@outlook.com") === "john.doe@outlook.com",
		"Microsoft strips +tag but keeps dots",
	);
	console.log("  ✓ strips +tag but keeps dots");

	assert(
		normalizeEmail("user@hotmail.com") === "user@hotmail.com" &&
			!isSameEmail("user@hotmail.com", "user@outlook.com"),
		"distinct Microsoft domains are not collapsed",
	);
	console.log("  ✓ does not collapse distinct Microsoft domains");

	assert(
		!isSameEmail("a.b@outlook.com", "ab@outlook.com"),
		"dots are significant on Microsoft",
	);
	console.log("  ✓ dots are significant (distinct mailboxes)");

	console.log("\nTesting Yahoo...");

	assert(
		normalizeEmail("john-shopping@yahoo.com") === "john@yahoo.com",
		"Yahoo uses '-' as its sub-address separator",
	);
	console.log("  ✓ uses '-' as the sub-address separator");

	assert(
		normalizeEmail("john+tag@yahoo.com") === "john+tag@yahoo.com",
		"Yahoo does not treat '+' as a separator",
	);
	console.log("  ✓ does not treat '+' as a separator");

	assert(
		normalizeEmail("john.doe@ymail.com") === "john.doe@ymail.com",
		"Yahoo keeps dots",
	);
	console.log("  ✓ keeps dots");

	console.log("\nTesting other +tag providers...");

	const plusProviders: Array<[string, string]> = [
		["Jane+lists@icloud.com", "jane@icloud.com"],
		["Jane+lists@proton.me", "jane@proton.me"],
		["Jane+lists@fastmail.com", "jane@fastmail.com"],
		["Jane+lists@yandex.ru", "jane@yandex.ru"],
		["Jane+lists@zoho.com", "jane@zoho.com"],
		["Jane+lists@mailfence.com", "jane@mailfence.com"],
		["Jane+lists@runbox.com", "jane@runbox.com"],
		["Jane+lists@pobox.com", "jane@pobox.com"],
		["Jane+lists@tuta.com", "jane@tuta.com"],
		["Jane+lists@posteo.de", "jane@posteo.de"],
		["Jane+lists@mailbox.org", "jane@mailbox.org"],
	];
	for (const [input, expected] of plusProviders) {
		assert(
			normalizeEmail(input) === expected,
			`${input} should normalize to ${expected}`,
		);
		console.log(`  ✓ ${input} -> ${expected}`);
	}

	assert(
		normalizeEmail("Jane+lists@aol.com") === "jane+lists@aol.com",
		"AOL lowercases but does not strip +tag",
	);
	console.log("  ✓ AOL lowercases but does not strip +tag");

	console.log("\nTesting provider detection...");

	assert(getEmailProvider("a@gmail.com") === "gmail", "gmail is detected");
	assert(
		getEmailProvider("a@hotmail.co.uk") === "microsoft",
		"microsoft is detected across TLDs",
	);
	assert(getEmailProvider("a@yahoo.fr") === "yahoo", "yahoo is detected");
	assert(
		getEmailProvider("a@GmAiL.cOm") === "gmail",
		"provider matching is case-insensitive",
	);
	assert(getEmailProvider("a@example.com") === null, "unknown domain -> null");
	assert(getEmailProvider("nope") === null, "invalid input -> null");
	console.log("  ✓ getEmailProvider returns the right ids");

	console.log("\nValidating DEFAULT_PROVIDERS...");

	const ids = DEFAULT_PROVIDERS.map((p) => p.id);
	assert(ids.includes("gmail"), "gmail rule is exported");
	assert(ids.includes("microsoft"), "microsoft rule is exported");
	assert(ids.includes("yahoo"), "yahoo rule is exported");

	const seen = new Set<string>();
	for (const provider of DEFAULT_PROVIDERS) {
		for (const domain of provider.domains) {
			assert(!seen.has(domain), `domain ${domain} must not be duplicated`);
			seen.add(domain);
		}
	}
	console.log(
		`  ✓ ${DEFAULT_PROVIDERS.length} providers, ${seen.size} unique domains, no duplicates`,
	);

	console.log("\nAll providers tests passed.");
}

try {
	main();
} catch (err) {
	console.error(err);
	process.exit(1);
}
