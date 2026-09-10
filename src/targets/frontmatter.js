// Single frontmatter parser shared by every render target.
// Tolerant of BOM, CRLF line endings, and a closing fence at EOF without a
// trailing newline. Frontmatter is load-bearing for agents and commands, so a
// missing opening fence is a hard error instead of a silent fallback.

function normalize(content) {
  let text = content;

  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  return text.replace(/\r\n/g, "\n");
}

function parseFrontmatter(content, filePath) {
  const text = normalize(content);

  if (!text.startsWith("---\n")) {
    throw new Error(`missing frontmatter in ${filePath}`);
  }

  let end = text.indexOf("\n---\n", 4);
  let bodyStart = end + 5;

  if (end === -1) {
    if (!text.endsWith("\n---")) {
      throw new Error(`invalid frontmatter in ${filePath}`);
    }

    end = text.length - 4;
    bodyStart = text.length;
  }

  const frontmatterText = text.slice(4, end);
  const body = text.slice(bodyStart).trim();
  const frontmatter = {};

  for (const line of frontmatterText.split("\n")) {
    if (/^\s/.test(line)) {
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) {
      frontmatter[match[1]] = match[2].trim();
    }
  }

  return { frontmatter, body };
}

function parseDescription(content, filePath) {
  const { frontmatter, body } = parseFrontmatter(content, filePath);

  return {
    description: frontmatter.description || "Swarm role agent.",
    body,
  };
}

module.exports = {
  parseDescription,
  parseFrontmatter,
};
