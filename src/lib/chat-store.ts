// On-device chat history per friend (no account, works offline, $0).
export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const key = (friend: string) => `alight.chat.${friend}`;

export function loadChat(friend: string): ChatMsg[] {
  try {
    const r = localStorage.getItem(key(friend));
    return r ? (JSON.parse(r) as ChatMsg[]) : [];
  } catch {
    return [];
  }
}

export function saveChat(friend: string, msgs: ChatMsg[]): void {
  try {
    localStorage.setItem(key(friend), JSON.stringify(msgs.slice(-40)));
  } catch {
    /* ignore */
  }
}

export function clearChat(friend: string): void {
  try {
    localStorage.removeItem(key(friend));
  } catch {
    /* ignore */
  }
}
