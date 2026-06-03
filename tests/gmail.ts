import { isSameEmail, normalizeEmail } from "../index.js";

function assert(condition: boolean, message: string): void {
	if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function main(): void {
	console.log("Testing Gmail normalization...");

	assert(
		normalizeEmail("john.doe@gmail.com") === "johndoe@gmail.com",
		"dots are removed from the local part",
	);
	console.log("  ✓ removes dots from the local part");

	assert(
		normalizeEmail("johndoe+newsletter@gmail.com") === "johndoe@gmail.com",
		"+tag sub-addressing is stripped",
	);
	console.log("  ✓ strips +tag sub-addressing");

	assert(
		normalizeEmail("JohnDoe@gmail.com") === "johndoe@gmail.com",
		"local part is lowercased",
	);
	console.log("  ✓ lowercases the local part");

	assert(
		normalizeEmail("john.doe@googlemail.com") === "johndoe@gmail.com",
		"googlemail.com collapses to gmail.com",
	);
	console.log("  ✓ collapses googlemail.com to gmail.com");

	assert(
		normalizeEmail("  John.Doe+promo@GoogleMail.com ") === "johndoe@gmail.com",
		"dots, tags, case, alias and trimming combine",
	);
	console.log("  ✓ applies dots, tags, case and alias together");

	assert(
		isSameEmail("j.o.h.n@gmail.com", "john+anything@googlemail.com"),
		"dotted/plussed variants are the same mailbox",
	);
	console.log("  ✓ treats dotted/plussed variants as the same mailbox");

	console.log("\nAll gmail tests passed.");
}

try {
	main();
} catch (err) {
	console.error(err);
	process.exit(1);
}
