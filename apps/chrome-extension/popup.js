document.addEventListener("DOMContentLoaded", () => {
    const loadingView = document.getElementById("loadingView");
    const loginView = document.getElementById("loginView");
    const joinView = document.getElementById("joinView");
    const joinForm = document.getElementById("joinForm");
    const statusMessage = document.getElementById("statusMessage");
    const joinBtn = document.getElementById("joinBtn");
    const openWebAppBtn = document.getElementById("openWebAppBtn");
    const retrySessionBtn = document.getElementById("retrySessionBtn");
    const userNameSpan = document.getElementById("userName");
    const activeMeetingsEl = document.getElementById("activeMeetings");
    const activeMeetingsList = document.getElementById("activeMeetingsList");
    const detectedUrlBanner = document.getElementById("detectedUrlBanner");
    const detectedUrlText = document.getElementById("detectedUrlText");
    const useDetectedUrlBtn = document.getElementById("useDetectedUrlBtn");
    const meetingLinkInput = document.getElementById("meetingLink");

    // Cache-buster for logo
    const logoImg = document.querySelector('.logo-img');
    if (logoImg) {
        logoImg.src = `icons/logo.png?v=${Date.now()}`;
    }

    // Initial check
    checkAuth();

    // Event Listeners
    openWebAppBtn.addEventListener("click", () => {
        chrome.tabs.create({ url: "http://localhost:3000/login" });
    });

    retrySessionBtn.addEventListener("click", () => {
        showView("loading");
        checkAuth();
    });

    useDetectedUrlBtn.addEventListener("click", () => {
        meetingLinkInput.value = detectedUrlText.textContent;
        detectedUrlBanner.style.display = "none";
        meetingLinkInput.focus();
    });

    joinForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const link = meetingLinkInput.value;
        const title = document.getElementById("meetingTitle").value;

        setLoading(true);
        hideStatus();

        try {
            const response = await chrome.runtime.sendMessage({
                action: "joinMeeting",
                payload: { link, title }
            });

            if (response.success) {
                showStatus("Successfully queued! The bot will join shortly.", "success");
                joinForm.reset();
                // Refresh active meetings after a short delay
                setTimeout(loadActiveMeetings, 1500);
            } else {
                showStatus(response.error || "Failed to join meeting", "error");
            }
        } catch (error) {
            showStatus("Connection error. Is the server running?", "error");
        } finally {
            setLoading(false);
        }
    });

    async function checkAuth() {
        try {
            const response = await chrome.runtime.sendMessage({ action: "checkSession" });
            if (response.authenticated) {
                userNameSpan.textContent = response.user.name || response.user.email;
                showView("join");
                // Load active meetings and detect URL in parallel
                loadActiveMeetings();
                detectMeetingUrl();
            } else {
                showView("login");
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            showView("login");
        }
    }

    async function loadActiveMeetings() {
        try {
            const response = await chrome.runtime.sendMessage({ action: "getActiveMeetings" });
            if (response.success && response.meetings.length > 0) {
                activeMeetingsList.innerHTML = "";
                response.meetings.forEach(meeting => {
                    const item = document.createElement("div");
                    item.className = "active-meeting-item";

                    const statusLabel = getStatusLabel(meeting.recordingStatus);
                    const title = meeting.title || meeting.link;
                    const displayTitle = title.length > 35 ? title.substring(0, 35) + "…" : title;

                    item.innerHTML = `
                        <div class="active-meeting-info">
                            <span class="active-meeting-title">${escapeHtml(displayTitle)}</span>
                            <span class="active-meeting-status ${meeting.recordingStatus.toLowerCase()}">${statusLabel}</span>
                        </div>
                    `;
                    activeMeetingsList.appendChild(item);
                });
                activeMeetingsEl.style.display = "block";
                // Hide the join form and detected URL when in a meeting
                joinForm.style.display = "none";
                detectedUrlBanner.style.display = "none";
            } else {
                activeMeetingsEl.style.display = "none";
                // Show the join form when not in a meeting
                joinForm.style.display = "block";
            }
        } catch (error) {
            console.error("Failed to load active meetings:", error);
        }

    }

    async function detectMeetingUrl() {
        try {
            const response = await chrome.runtime.sendMessage({ action: "getActiveTabUrl" });
            if (response.detected) {
                detectedUrlText.textContent = response.url;
                detectedUrlBanner.style.display = "flex";
            }
        } catch (error) {
            console.error("URL detection failed:", error);
        }
    }

    function getStatusLabel(status) {
        switch (status) {
            case "PENDING": return "Pending";
            case "ASKING_TO_JOIN": return "Asking to join";
            case "JOINED": return "Recording";
            default: return status;
        }
    }

    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    function showView(viewName) {
        loadingView.classList.remove("active");
        loginView.classList.remove("active");
        joinView.classList.remove("active");

        if (viewName === "loading") loadingView.classList.add("active");
        else if (viewName === "login") loginView.classList.add("active");
        else if (viewName === "join") joinView.classList.add("active");
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
    }

    function hideStatus() {
        statusMessage.className = "status-message";
        statusMessage.textContent = "";
    }

    function setLoading(isLoading) {
        joinBtn.disabled = isLoading;
        if (isLoading) {
            joinBtn.innerHTML = '<div class="loader"></div><span>Joining...</span>';
        } else {
            joinBtn.innerHTML = '<span>Join Meeting</span>';
        }
    }
});
