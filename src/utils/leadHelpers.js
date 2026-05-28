export function formatTimestamp(timestamp) {
  if (!timestamp) return "Unknown";
  const date = new Date(timestamp);
  if (Number.isNaN(date.valueOf())) return timestamp;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function createActivityEntry(type, description) {
  return {
    id: crypto.randomUUID?.() ?? String(Date.now()) + Math.random().toString(16).slice(2),
    type,
    description,
    timestamp: new Date().toISOString(),
  };
}

export function createNoteEntry(text) {
  return {
    id: crypto.randomUUID?.() ?? String(Date.now()) + Math.random().toString(16).slice(2),
    text,
    timestamp: new Date().toISOString(),
  };
}

export function getFollowUpStatus(lead) {
  if (!lead.followUpDate) {
    return { state: "none", label: "No follow-up", badgeClass: "badge-none" };
  }

  const today = new Date();
  const followUp = new Date(lead.followUpDate);
  const offset = Math.floor((followUp.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86400000);

  if (offset < 0) {
    return { state: "overdue", label: "Overdue", badgeClass: "badge-overdue" };
  }
  if (offset === 0) {
    return { state: "today", label: "Today", badgeClass: "badge-today" };
  }
  if (offset <= 7) {
    return { state: "upcoming", label: "Upcoming", badgeClass: "badge-upcoming" };
  }

  return { state: "later", label: "Scheduled", badgeClass: "badge-later" };
}

export function getLeadPriority(lead) {
  const createdDate = new Date(lead.createdAt);
  const ageDays = Math.floor((Date.now() - createdDate.valueOf()) / 86400000);
  const hasFollowUp = Boolean(lead.followUpDate);
  const followUpStatus = getFollowUpStatus(lead).state;

  if (lead.status === "Converted") {
    return { level: "High", score: 96, badgeClass: "priority-high" };
  }
  if (lead.temperature === "Hot" && ageDays <= 7) {
    return { level: "High", score: 88, badgeClass: "priority-high" };
  }
  if (lead.temperature === "Warm" && followUpStatus === "overdue") {
    return { level: "Medium", score: 62, badgeClass: "priority-medium" };
  }
  if (lead.temperature === "Cold" && !hasFollowUp && ageDays > 14) {
    return { level: "Low", score: 28, badgeClass: "priority-low" };
  }
  if (lead.temperature === "Warm") {
    return { level: "Medium", score: 58, badgeClass: "priority-medium" };
  }
  return { level: "Low", score: 34, badgeClass: "priority-low" };
}

export function getTimeline(lead) {
  const events = Array.isArray(lead.activity) ? [...lead.activity] : [];
  if (events.length === 0) {
    events.push(createActivityEntry("Lead created", "Initial lead record created."));
  }
  return events.sort((a, b) => new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf());
}

export function formatPhoneLink(phone) {
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;
}

export function formatEmailLink(email) {
  return `mailto:${email}`;
}
