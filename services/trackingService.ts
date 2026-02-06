import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "../firebase";

const SESSION_KEY = "vsp_session_id";
const SESSION_COLLECTION = "sessions";
const EVENTS_COLLECTION = "events";
const FAQ_COLLECTION = "faq_responses";

export interface DashboardData {
  sessions: any[];
  events: any[];
  faqResponses: any[];
}

export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const [sessionsSnap, eventsSnap, faqSnap] = await Promise.all([
      getDocs(query(collection(db, SESSION_COLLECTION), limit(50))),
      getDocs(query(collection(db, EVENTS_COLLECTION), limit(100))),
      getDocs(query(collection(db, FAQ_COLLECTION), limit(50)))
    ]);

    return {
      sessions: sessionsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      events: eventsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      faqResponses: faqSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { sessions: [], events: [], faqResponses: [] };
  }
};

let sessionPromise: Promise<TrackingContext> | null = null;

type IpInfo = {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  org?: string;
};

type TrackingContext = {
  sessionId: string;
  ipInfo: IpInfo | null;
  deviceInfo: Record<string, unknown>;
};

const safeRandomId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `vsp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

const getSessionId = (): string => {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = safeRandomId();
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
};

const getDeviceInfo = (): Record<string, unknown> => {
  const nav: Navigator & {
    userAgentData?: { brands?: unknown; mobile?: unknown; platform?: unknown };
  } = navigator;
  const screenInfo = window.screen
    ? {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
    }
    : null;

  return {
    userAgent: navigator.userAgent,
    userAgentData: nav.userAgentData
      ? {
        brands: nav.userAgentData.brands ?? null,
        mobile: nav.userAgentData.mobile ?? null,
        platform: nav.userAgentData.platform ?? null,
      }
      : null,
    language: navigator.language,
    languages: navigator.languages || [],
    platform: navigator.platform,
    vendor: navigator.vendor,
    screen: screenInfo,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

const fetchIpInfo = async (): Promise<IpInfo | null> => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = await res.json();
      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country_name: data.country_name,
        postal: data.postal,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        org: data.org,
      };
    }
  } catch {
    // Ignore and fallback below
  }

  try {
    const res = await fetch("https://api.ipify.org?format=json");
    if (res.ok) {
      const data = await res.json();
      return { ip: data.ip };
    }
  } catch {
    // Ignore
  }

  return null;
};

const ensureSession = (): Promise<TrackingContext> => {
  if (sessionPromise) return sessionPromise;

  sessionPromise = (async () => {
    const sessionId = getSessionId();
    const [ipInfo, deviceInfo] = await Promise.all([
      fetchIpInfo(),
      Promise.resolve(getDeviceInfo()),
    ]);

    const sessionDoc = doc(db, SESSION_COLLECTION, sessionId);
    await setDoc(
      sessionDoc,
      {
        sessionId,
        createdAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
        ipInfo,
        deviceInfo,
        referrer: document.referrer || null,
        landingUrl: window.location.href,
      },
      { merge: true }
    );

    return { sessionId, ipInfo, deviceInfo };
  })();

  return sessionPromise;
};

export const initTracking = async (): Promise<void> => {
  try {
    await ensureSession();
  } catch (error) {
    console.error("Tracking init failed:", error);
  }
};

export const trackEvent = async (
  name: string,
  payload: Record<string, unknown> = {}
): Promise<void> => {
  try {
    const { sessionId, ipInfo } = await ensureSession();
    await addDoc(collection(db, EVENTS_COLLECTION), {
      sessionId,
      name,
      payload,
      ip: ipInfo?.ip || null,
      url: window.location.href,
      path: window.location.pathname,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Tracking event failed:", error);
  }
};

export const trackPageView = async (page: string): Promise<void> => {
  await trackEvent("page_view", { page });
};

export const saveFaqResponse = async (
  answers: Record<string, unknown>
): Promise<void> => {
  try {
    const { sessionId, ipInfo } = await ensureSession();
    await addDoc(collection(db, FAQ_COLLECTION), {
      sessionId,
      answers,
      ip: ipInfo?.ip || null,
      url: window.location.href,
      path: window.location.pathname,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("FAQ response save failed:", error);
  }
};
