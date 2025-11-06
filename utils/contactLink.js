function buildContactLinks(user) {
  const links = [];
  const c = user?.contacts || {};

  if (c.phoneE164) {
    const phone = c.phoneE164.startsWith('+') ? c.phoneE164 : `+${c.phoneE164}`;
    links.push({ kind: "whatsapp", url: `https://wa.me/${phone.replace(/\D/g, '')}` });
  }

  if (c.telegramUsername) {
    const u = String(c.telegramUsername).replace(/^@/, "");
    links.push({ kind: "telegram", url: `https://t.me/${u}` });
  }

  return links;
}

function buildSingleContact(user) {
  const links = buildContactLinks(user);
  return links[0] || null; 
}

function buildContact(user) {
  const c = user?.contacts || {};
  const wa = c.phoneE164 ? `https://wa.me/${String(c.phoneE164).replace(/\D/g, '')}` : null;
  const tg = c.telegramUsername ? `https://t.me/${String(c.telegramUsername).replace(/^@/, "")}` : null;
  const preferred = wa ? "whatsapp" : (tg ? "telegram" : "none");
  return { preferred, whatsAppUrl: wa, telegramUrl: tg };
}

module.exports = { buildContactLinks, buildSingleContact, buildContact };


