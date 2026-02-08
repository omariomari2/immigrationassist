// booking.js - Content script for TTP scheduler UI
// Best-effort auto-select of location and slot time.

const LOG_PREFIX = "[GED-Booking]";

const normalize = (value) =>
	(value || "")
		.toString()
		.toLowerCase()
		.replace(/\s+/g, " ")
		.replace(/[^a-z0-9:\/,\- ]/g, "")
		.trim();

const getText = (el) => (el && (el.innerText || el.textContent) ? (el.innerText || el.textContent) : "");

const isVisible = (el) => {
	if (!el) return false;
	const rect = el.getBoundingClientRect();
	return rect.width > 0 && rect.height > 0;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getPendingBooking = () =>
	new Promise((resolve) => {
		chrome.storage.local.get(["pendingBooking"], (result) => {
			resolve(result?.pendingBooking || null);
		});
	});

const clearPendingBooking = () =>
	new Promise((resolve) => {
		chrome.storage.local.remove(["pendingBooking"], () => resolve());
	});

const buildLocationCandidates = (booking) => {
	const candidates = [];
	if (booking?.locationName) candidates.push(booking.locationName);
	if (booking?.locationShortName) candidates.push(booking.locationShortName);
	if (booking?.locationId) candidates.push(String(booking.locationId));

	// Add trimmed variants (remove common suffixes)
	candidates.forEach((name) => {
		if (typeof name !== "string") return;
		const stripped = name
			.replace(/\b(enrollment center|enrol(l)?ment center|airport)\b/gi, "")
			.replace(/\s+/g, " ")
			.trim();
		if (stripped && stripped !== name) candidates.push(stripped);
	});

	return Array.from(new Set(candidates.filter(Boolean)));
};

const buildTimeCandidates = (date, timeZone) => {
	const candidates = new Set();
	const formats = [
		{ hour: "numeric", minute: "2-digit" },
		{ hour: "numeric", minute: "2-digit", hour12: true },
		{ hour: "2-digit", minute: "2-digit" }
	];
	formats.forEach((fmt) => {
		try {
			const value = new Intl.DateTimeFormat("en-US", { ...fmt, timeZone }).format(date);
			if (value) candidates.add(value);
		} catch {
			const value = new Intl.DateTimeFormat("en-US", fmt).format(date);
			if (value) candidates.add(value);
		}
	});
	return Array.from(candidates);
};

const buildDateCandidates = (date, timeZone) => {
	const candidates = new Set();
	const formats = [
		{ month: "short", day: "numeric", year: "numeric" },
		{ month: "short", day: "numeric" },
		{ month: "long", day: "numeric", year: "numeric" },
		{ month: "long", day: "numeric" },
		{ year: "numeric", month: "2-digit", day: "2-digit" }
	];
	formats.forEach((fmt) => {
		try {
			const value = new Intl.DateTimeFormat("en-US", { ...fmt, timeZone }).format(date);
			if (value) candidates.add(value);
		} catch {
			const value = new Intl.DateTimeFormat("en-US", fmt).format(date);
			if (value) candidates.add(value);
		}
	});
	return Array.from(candidates);
};

const trySelectLocationFromSelects = (candidates, locationId) => {
	const selects = Array.from(document.querySelectorAll("select"));
	for (const select of selects) {
		if (!isVisible(select)) continue;
		const options = Array.from(select.options || []);
		let target = null;
		if (locationId) {
			target = options.find((opt) => opt.value === String(locationId));
		}
		if (!target) {
			for (const candidate of candidates) {
				const normalizedCandidate = normalize(candidate);
				target = options.find((opt) => normalize(opt.textContent) === normalizedCandidate);
				if (target) break;
			}
		}
		if (target) {
			select.value = target.value;
			select.dispatchEvent(new Event("change", { bubbles: true }));
			console.log(`${LOG_PREFIX} Selected location via <select>:`, target.textContent);
			return true;
		}
	}
	return false;
};

const trySelectLocationFromOptions = (candidates) => {
	const optionNodes = Array.from(
		document.querySelectorAll("[role='option'], [role='menuitem'], li, button, a, [data-testid]")
	).filter(isVisible);

	for (const candidate of candidates) {
		const normalizedCandidate = normalize(candidate);
		if (!normalizedCandidate || normalizedCandidate.length < 3) continue;
		const match = optionNodes.find((el) => normalize(getText(el)).includes(normalizedCandidate));
		if (match) {
			match.click();
			console.log(`${LOG_PREFIX} Clicked location option:`, candidate);
			return true;
		}
	}
	return false;
};

const trySelectLocationInSchedulerList = (candidates) => {
	// Scheduler UI: location list entries are <a.centerDetails> with <strong> text
	const locationLinks = Array.from(document.querySelectorAll("a.centerDetails")).filter(isVisible);
	if (locationLinks.length === 0) return false;

	for (const candidate of candidates) {
		const normalizedCandidate = normalize(candidate);
		if (!normalizedCandidate || normalizedCandidate.length < 3) continue;
		const match = locationLinks.find((link) => normalize(getText(link)).includes(normalizedCandidate));
		if (!match) continue;

		match.click();
		console.log(`${LOG_PREFIX} Clicked scheduler location link:`, candidate);

		// Try to click the "Choose This Location" button within the same list item / popover
		const li = match.closest("li");
		const chooseBtn = li?.querySelector("#btnChooseLocation") || document.querySelector("#btnChooseLocation");
		if (chooseBtn && isVisible(chooseBtn)) {
			chooseBtn.click();
			console.log(`${LOG_PREFIX} Clicked Choose This Location button.`);
			return true;
		}

		// If the popover isn't open yet, give it a moment and try again
		setTimeout(() => {
			const delayedBtn = li?.querySelector("#btnChooseLocation") || document.querySelector("#btnChooseLocation");
			if (delayedBtn && isVisible(delayedBtn)) {
				delayedBtn.click();
				console.log(`${LOG_PREFIX} Clicked Choose This Location button (delayed).`);
			}
		}, 250);

		return true;
	}

	return false;
};

const tryTypeaheadLocation = (candidates) => {
	const inputs = Array.from(
		document.querySelectorAll(
			"input[role='combobox'], input[type='text'], input[type='search'], input[aria-label], input[placeholder]"
		)
	).filter(isVisible);

	if (inputs.length === 0 || candidates.length === 0) return false;

	const locationInput = inputs.find((input) => {
		const label = `${input.getAttribute("aria-label") || ""} ${input.getAttribute("placeholder") || ""}`.toLowerCase();
		return label.includes("location") || label.includes("enrollment") || label.includes("center");
	}) || inputs[0];

	const candidate = candidates[0];
	if (!candidate) return false;

	locationInput.focus();
	locationInput.click();
	locationInput.value = candidate;
	locationInput.dispatchEvent(new Event("input", { bubbles: true }));
	locationInput.dispatchEvent(new Event("change", { bubbles: true }));
	console.log(`${LOG_PREFIX} Typed location candidate into input:`, candidate);

	// Try to click a suggestion
	return trySelectLocationFromOptions(candidates);
};

const trySelectLocation = (booking) => {
	const { locationId } = booking || {};
	const candidates = buildLocationCandidates(booking);
	if (!locationId && candidates.length === 0) return false;

	if (trySelectLocationInSchedulerList(candidates)) return true;
	if (trySelectLocationFromSelects(candidates, locationId)) return true;
	if (trySelectLocationFromOptions(candidates)) return true;

	// Try data attributes (best effort)
	if (locationId) {
		const attrMatch = document.querySelector(
			`[data-location-id="${locationId}"], [data-id="${locationId}"], [data-location="${locationId}"]`
		);
		if (attrMatch) {
			attrMatch.click();
			console.log(`${LOG_PREFIX} Clicked location via data attribute:`, locationId);
			return true;
		}
	}

	if (tryTypeaheadLocation(candidates)) return true;

	return false;
};

const trySelectSlot = (booking) => {
	const { slotTimestamp, tzData, slotDisplay } = booking || {};
	if (!slotTimestamp) return false;

	const date = new Date(slotTimestamp);
	if (isNaN(date.getTime())) return false;

	const timeCandidates = buildTimeCandidates(date, tzData);
	const dateCandidates = buildDateCandidates(date, tzData);
	const combinedCandidates = [];

	if (slotDisplay) combinedCandidates.push(slotDisplay);

	dateCandidates.forEach((d) => {
		timeCandidates.forEach((t) => {
			combinedCandidates.push(`${d} ${t}`);
			combinedCandidates.push(`${d}, ${t}`);
			combinedCandidates.push(`${d} at ${t}`);
		});
	});

	const nodes = Array.from(
		document.querySelectorAll("button, a, [role='button'], [role='option'], [data-testid], li")
	).filter(isVisible);
	const normalizedNodes = nodes.map((node) => ({
		node,
		text: normalize(getText(node))
	}));

	for (const candidate of combinedCandidates) {
		const normalizedCandidate = normalize(candidate);
		const match = normalizedNodes.find((item) => item.text.includes(normalizedCandidate));
		if (match) {
			match.node.click();
			console.log(`${LOG_PREFIX} Clicked slot:`, candidate);
			return true;
		}
	}

	// Try date-only to expand day panel
	for (const dateOnly of dateCandidates) {
		const normalizedDate = normalize(dateOnly);
		const match = normalizedNodes.find((item) => item.text.includes(normalizedDate));
		if (match) {
			match.node.click();
			console.log(`${LOG_PREFIX} Clicked slot date (waiting for times):`, dateOnly);
			return false;
		}
	}

	// Fallback: try time-only match
	for (const time of timeCandidates) {
		const normalizedTime = normalize(time);
		const match = normalizedNodes.find((item) => item.text.includes(normalizedTime));
		if (match) {
			match.node.click();
			console.log(`${LOG_PREFIX} Clicked slot time:`, time);
			return true;
		}
	}

	return false;
};

const attemptBooking = async () => {
	const booking = await getPendingBooking();
	if (!booking) return;

	let locationDone = false;
	let slotDone = false;

	for (let i = 0; i < 60; i++) {
		if (!locationDone) {
			locationDone = trySelectLocation(booking);
		}

		if (locationDone && !slotDone) {
			slotDone = trySelectSlot(booking);
		}

		if (locationDone && slotDone) break;
		await sleep(500);
	}

	if (locationDone && slotDone) {
		await clearPendingBooking();
		console.log(`${LOG_PREFIX} Booking attempt complete. Cleared pending booking.`);
	} else {
		console.log(`${LOG_PREFIX} Booking attempt incomplete. Pending booking left for retry.`);
	}
};

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", attemptBooking);
} else {
	attemptBooking();
}
