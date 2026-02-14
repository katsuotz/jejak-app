let wakeLock: WakeLockSentinel | null = null;

export async function requestWakeLock(): Promise<boolean> {
  if (!('wakeLock' in navigator)) {
    console.warn('Wake Lock API not supported');
    return false;
  }

  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
    });
    return true;
  } catch (err) {
    console.warn('Wake Lock request failed:', err);
    return false;
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}

export function isWakeLockActive(): boolean {
  return wakeLock !== null && !wakeLock.released;
}

// Re-acquire wake lock on page visibility change (e.g., user switches back to tab)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && wakeLock !== null) {
      await requestWakeLock();
    }
  });
}
