export function persistActionState(action: string, details: object) {
  localStorage.setItem('lastAction', JSON.stringify({ action, details, timestamp: Date.now() }));
}

export function getLastActionState() {
  const item = localStorage.getItem('lastAction');
  if (!item) return null;
  try {
    return JSON.parse(item);
  } catch {
    return null;
  }
}

export function clearLastActionState() {
  localStorage.removeItem('lastAction');
}