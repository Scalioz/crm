export function exportLeadsToCsv(leads, filename = "scalioz-leads.csv") {
  const headers = [
    "Name",
    "Phone",
    "Email",
    "Company",
    "Source",
    "Service Interest",
    "Status",
    "Temperature",
    "Created At",
    "Follow-Up Date",
    "Notes",
  ];

  const rows = leads.map((lead) => [
    lead.name,
    lead.phone,
    lead.email,
    lead.company,
    lead.source,
    lead.serviceInterest,
    lead.status,
    lead.temperature,
    lead.createdAt,
    lead.followUpDate,
    lead.notes,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
