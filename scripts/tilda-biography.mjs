/**
 * Runs inside page.evaluate; keep it self-contained (no module-scope helpers).
 * Tilda's saved tilda-feed.js renders a post's text in .js-feed-post-text,
 * inside .t-feed__post-popup[data-feed-popup-postuid]. Recommended posts and
 * their descriptions are outside that text node and must never become a bio.
 * `html` is only for the text/descr field of an already identified feed post.
 */
export function extractTildaBiography({ html, uid, name } = {}) {
  const normalizeName = (value) => String(value ?? "").normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();
  let root;

  if (typeof html === "string") {
    const template = document.createElement("template");
    template.innerHTML = html;
    root = template.content;
  } else {
    if (!uid && !name) return [];

    const matchingPopups = Array.from(document.querySelectorAll(".t-feed__post-popup")).filter((popup) => {
      const postUid = popup.getAttribute("data-feed-popup-postuid");
      const title = popup.querySelector(".t-feed__post-popup__title");
      if (uid && postUid !== String(uid)) return false;
      if (name && title && normalizeName(title.textContent) !== normalizeName(name)) return false;
      // Without a uid, an exact title is required; guessing from a page/body
      // heading could attribute a recommended person's biography to this post.
      return Boolean(uid || (title && normalizeName(title.textContent) === normalizeName(name)));
    });

    if (matchingPopups.length !== 1) return [];
    const popup = matchingPopups[0];
    const textNodes = Array.from(popup.querySelectorAll(".js-feed-post-text")).filter((node) =>
      node.closest(".t-feed__post-popup") === popup &&
      !node.closest(".js-feed-relevants, .js-feed-comments, .js-feed-post"),
    );
    if (textNodes.length !== 1 || textNodes[0].querySelector(".t-feed__post-popup__text-loader")) return [];
    root = textNodes[0];
  }

  const blocks = new Set(["P", "DIV", "LI", "UL", "OL", "BLOCKQUOTE", "H1", "H2", "H3", "H4", "H5", "H6", "SECTION", "ARTICLE", "PRE", "FIGCAPTION", "TR"]);
  const ignored = new Set(["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT"]);

  function read(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return "";
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (ignored.has(node.tagName) || node.hidden || node.getAttribute("aria-hidden") === "true") return "";
      if (node.matches(".js-feed-relevants, .js-feed-comments, .js-feed-post, .t-feed__post-popup__text-loader")) return "";
      if (node.tagName === "BR") return "\n";
    }
    // Traverse each text node once. Collecting both a wrapper and its <p>/<li>
    // descendants duplicates legitimate sentences and lists.
    const text = Array.from(node.childNodes, read).join("");
    return blocks.has(node.tagName) ? `\n\n${text}\n\n` : text;
  }

  return read(root)
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}
