// Anonymous, on-device user id so Lily & John can remember someone across
// sessions without any login. Lives in localStorage — private and $0.
const KEY = "alight.uid";

export function getUid(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id =
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}
