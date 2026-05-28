function highlightText(text = "", query = "") {
  if (!query) return [text];
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.split(regex).map((segment, index) =>
    regex.test(segment) ? (
      <mark className="highlight" key={index}>
        {segment}
      </mark>
    ) : (
      <span key={index}>{segment}</span>
    ),
  );
}

export default highlightText;
