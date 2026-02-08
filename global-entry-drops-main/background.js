import { fetchLocations } from "./api/fetchLocations.js";
import { fetchOpenSlots } from "./api/fetchOpenSlots.js";
import { createNotification } from "./lib/createNotification.js";

const ALARM_JOB_NAME = "DROP_ALARM";
const WEB_APP_URLS = [
	"http://localhost:5500/*",
	"http://127.0.0.1:5500/*",
	"https://localhost:5500/*",
	"http://0.0.0.0:5500/*"
];

let cachedPrefs = {};
let firstApptTimestamp = null;

chrome.runtime.onInstalled.addListener((details) => {
	handleOnStop();
	fetchLocations();
});

chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
	const { type, payload } = data;

	// Legacy support for internal extension messages if any
	if (data.event) {
		const { event, prefs } = data;
		switch (event) {
			case "onStop":
				handleOnStop();
				break;
			case "onStart":
				handleOnStart(prefs);
				break;
		}
		return;
	}

	switch (type) {
		case "WEB_STOP":
			handleOnStop();
			broadcastStatus(sender?.tab?.id);
			break;
		case "WEB_START":
			handleOnStart(payload);
			broadcastStatus(sender?.tab?.id);
			break;
		case "REQ_STATUS":
			broadcastStatus(sender?.tab?.id);
			break;
		case "BOOK_APPT":
			handleBookAppt(payload, sender?.tab?.id);
			break;
		default:
			break;
	}
});

const sendToWebTabs = (message, senderTabId = null) => {
	const send = (tabId) => {
		chrome.tabs.sendMessage(tabId, message)
			.then(() => console.log(`[GED-BG] Sent ${message.type} to tab ${tabId}`))
			.catch((e) => console.log(`[GED-BG] Failed to send ${message.type} to tab ${tabId}: ${e.message}`));
	};

	if (senderTabId) {
		send(senderTabId);
	}

	chrome.tabs.query({ url: WEB_APP_URLS }, (tabs) => {
		for (let tab of tabs) {
			if (tab.id !== senderTabId) {
				send(tab.id);
			}
		}
	});
};

const broadcastStatus = (senderTabId = null) => {
	chrome.storage.local.get(null, (items) => {
		const statusMsg = {
			type: 'EXT_STATUS',
			payload: {
				isRunning: items.isRunning || false,
				prefs: items
			}
		};
		sendToWebTabs(statusMsg, senderTabId);
	});
};

chrome.notifications.onClicked.addListener(() => {
	chrome.tabs.create({
		url: "https://ttp.cbp.dhs.gov/schedulerui/schedule-interview/location?lang=en&vo=true&returnUrl=ttp-external&service=up",
	});
});

chrome.alarms.onAlarm.addListener(() => {
	openSlotsJob();
});

const handleOnStop = () => {
	setRunningStatus(false);
	stopAlarm();
	cachedPrefs = {};
	firstApptTimestamp = null;
};

const handleOnStart = (prefs) => {
	cachedPrefs = prefs;
	chrome.storage.local.set(prefs);
	setRunningStatus(true);
	createAlarm();
};

const handleBookAppt = (payload, senderTabId = null) => {
	if (!payload) return;
	chrome.storage.local.set({ pendingBooking: payload }, () => {
		sendToWebTabs({ type: 'BOOK_APPT_ACK' }, senderTabId);
	});
};

const setRunningStatus = (isRunning) => {
	chrome.storage.local.set({ isRunning });
};

const createAlarm = () => {
	chrome.alarms.get(ALARM_JOB_NAME, (existingAlarm) => {
		if (!existingAlarm) {
			// immediately run the job
			openSlotsJob();
			chrome.alarms.create(ALARM_JOB_NAME, { periodInMinutes: 1.0 });
		}
	});
};

const stopAlarm = () => {
	chrome.alarms.clearAll();
};

const openSlotsJob = () => {
	fetchOpenSlots(cachedPrefs).then((data) => handleOpenSlots(data));
};

const handleOpenSlots = (openSlots) => {
	if (
		openSlots &&
		openSlots.length > 0 &&
		openSlots[0].timestamp != firstApptTimestamp
	) {
		firstApptTimestamp = openSlots[0].timestamp;
		createNotification(openSlots[0], openSlots.length, cachedPrefs);
	}
};
