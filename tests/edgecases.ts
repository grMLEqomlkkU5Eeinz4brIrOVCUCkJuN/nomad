import { normalizeEmail, normalizeEmailDetailed } from "../index.js";

function assert(condition: boolean, message: string): void {
	if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function main(): void {
	console.log("Testing unknown domains (conservative default)...");

	assert(
		normalizeEmail("John.Doe@Example.COM") === "John.Doe@example.com",
		"domain is lowercased but local-part case is preserved",
	);
	assert(
		normalizeEmail("john+tag@example.com") === "john+tag@example.com",
		"+tags are not stripped by default",
	);
	assert(
		normalizeEmail("john.doe@example.com") === "john.doe@example.com",
		"dots are not removed by default",
	);
	console.log("  ✓ unknown domains are treated conservatively");

	console.log("\nTesting quoted local parts...");

	assert(
		normalizeEmail('"John..Doe+x"@gmail.com') === '"John..Doe+x"@gmail.com',
		"a quoted local part is preserved verbatim",
	);
	console.log("  ✓ preserves quoted local parts");

	console.log("\nTesting sub-address edge cases...");

	assert(
		normalizeEmail("+tag@gmail.com") === "+tag@gmail.com",
		"a separator at index 0 is ignored",
	);
	assert(
		normalizeEmail("user+a+b@outlook.com") === "user@outlook.com",
		"only the first separator is used as the cut point",
	);
	console.log("  ✓ handles index-0 and repeated separators");

	console.log("\nTesting input handling...");

	assert(
		normalizeEmail("   user@example.com  ") === "user@example.com",
		"surrounding whitespace is trimmed",
	);

	const lastAt = normalizeEmailDetailed('"a@b"@gmail.com');
	assert(
		lastAt.domain === "gmail.com" && lastAt.local === '"a@b"',
		"the address is split on the last @",
	);
	console.log("  ✓ trims input and splits on the last @");

	let threw = false;
	try {
		// @ts-expect-error testing the runtime guard
		normalizeEmail(undefined);
	} catch (err) {
		threw = err instanceof TypeError;
	}
	assert(threw, "non-string input throws a TypeError");
	console.log("  ✓ throws TypeError for non-string input");

	console.log("\nTesting validity flag...");

	assert(
		normalizeEmailDetailed("not-an-email").valid === false,
		"input without @ is invalid",
	);
	assert(
		normalizeEmailDetailed("not-an-email").normalized === "not-an-email",
		"invalid input is returned unchanged",
	);
	assert(
		normalizeEmailDetailed("@example.com").valid === false,
		"empty local part is invalid",
	);
	assert(
		normalizeEmailDetailed("user@").valid === false,
		"empty domain is invalid",
	);
	assert(
		normalizeEmailDetailed("user@example.com").valid === true,
		"a well-formed address is valid",
	);
	console.log("  ✓ reports validity correctly");

	console.log("\nTesting structured result...");

	const detailed = normalizeEmailDetailed("John.Doe+promo@gmail.com");
	assert(detailed.normalized === "johndoe@gmail.com", "normalized is correct");
	assert(detailed.local === "johndoe", "local is correct");
	assert(detailed.domain === "gmail.com", "domain is correct");
	assert(detailed.providerId === "gmail", "providerId is reported");
	assert(detailed.subaddress === "promo", "stripped subaddress is reported");
	assert(detailed.valid === true, "result is valid");

	assert(
		normalizeEmailDetailed("john@gmail.com").subaddress === null,
		"subaddress is null when there is none",
	);
	assert(
		normalizeEmailDetailed("john@example.com").providerId === null,
		"providerId is null for unknown domains",
	);
	console.log("  ✓ structured result fields are correct");

	console.log("\nAll edgecases tests passed.");
}

try {
	main();
} catch (err) {
	console.error(err);
	process.exit(1);
}
