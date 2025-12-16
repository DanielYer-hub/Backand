function getMissingProfileFields(u) {
  const missing = [];

  if (!u?.region) missing.push("region");

  const country = u?.address?.country?.trim?.() || "";
  const city = u?.address?.city?.trim?.() || "";
  if (!country) missing.push("address.country");
  if (!city) missing.push("address.city");

  const settings = Array.isArray(u?.settings) ? u.settings : [];
  if (settings.length < 1) missing.push("settings");

  const phone = (u?.contacts?.phoneE164 || "").trim();
  const tg = (u?.contacts?.telegramUsername || "").trim();
  if (!phone && !tg) missing.push("contacts"); 

  return missing;
}

function requireCompleteProfileOr(res, missing) {
  if (missing.length) {
    res.status(409).json({
      code: "PROFILE_INCOMPLETE",
      message: "Complete your profile to send invites",
      missing,
    });
    return true;
  }
  return false;
}

module.exports = { getMissingProfileFields, requireCompleteProfileOr };
