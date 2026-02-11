const API_BASE_URL = "http://localhost:3005";
const API_URL = `${API_BASE_URL}/api/v1`;
const WEB_APP_SESSION_URL = "http://localhost:3000/api/auth/session";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "joinMeeting") {
        handleJoinMeeting(request.payload).then(sendResponse);
        return true;
    }
    if (request.action === "checkSession") {
        checkSession().then(sendResponse);
        return true;
    }
    if (request.action === "getActiveMeetings") {
        getActiveMeetings().then(sendResponse);
        return true;
    }
    if (request.action === "getActiveTabUrl") {
        getActiveTabUrl().then(sendResponse);
        return true;
    }
});

async function checkSession() {
    try {
        const response = await fetch(WEB_APP_SESSION_URL);
        if (!response.ok) return { authenticated: false };

        const session = await response.json();
        if (session && session.accessToken) {
            return { authenticated: true, user: session.user, token: session.accessToken };
        }
        return { authenticated: false };
    } catch (error) {
        console.error("Session check error:", error);
        return { authenticated: false, error: "Failed to connect to web app" };
    }
}

async function getActiveMeetings() {
    try {
        const session = await checkSession();
        if (!session.authenticated) {
            return { success: false, meetings: [] };
        }

        const response = await fetch(`${API_URL}/meeting`, {
            headers: {
                "Authorization": `Bearer ${session.token}`
            }
        });

        if (!response.ok) return { success: false, meetings: [] };

        const meetings = await response.json();
        const activeStatuses = ["PENDING", "ASKING_TO_JOIN", "JOINED"];
        const activeMeetings = meetings.filter(m => activeStatuses.includes(m.recordingStatus));

        return { success: true, meetings: activeMeetings };
    } catch (error) {
        console.error("Get active meetings error:", error);
        return { success: false, meetings: [] };
    }
}

async function getActiveTabUrl() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            const meetMatch = tab.url.match(/^https:\/\/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
            if (meetMatch) {
                return { detected: true, url: `https://meet.google.com/${meetMatch[1]}` };
            }
        }
        return { detected: false };
    } catch (error) {
        console.error("Tab URL detection error:", error);
        return { detected: false };
    }
}

async function handleJoinMeeting(payload) {
    try {
        const session = await checkSession();
        if (!session.authenticated) {
            return { success: false, error: "Not authenticated. Please log in to the web app." };
        }

        const response = await fetch(`${API_URL}/meeting/join`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.token}`
            },
            body: JSON.stringify({
                link: payload.link,
                title: payload.title
            })
        });

        const data = await response.json();
        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.error || "Failed to join meeting" };
        }
    } catch (error) {
        console.error("Join meeting error:", error);
        return { success: false, error: "Network error. Is the server running?" };
    }
}
