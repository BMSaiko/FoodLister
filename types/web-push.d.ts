declare module 'web-push' {
  interface PushSubscription {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }
  interface RequestDetails {
    method: string;
    headers: Record<string, string>;
    body: Buffer;
    endpoint: string;
  }
  interface WebPushError extends Error {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
    endpoint: string;
  }
  function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
  function setGCMAPIKey(apiKey: string): void;
  function generateVAPIDKeys(): { publicKey: string; privateKey: string };
  function generateRequestDetails(
    subscription: PushSubscription,
    payload?: string | Buffer | null,
    options?: Record<string, unknown>
  ): RequestDetails;
  function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer | null,
    options?: Record<string, unknown>
  ): Promise<void>;
  export function webPushErrorToMessage(error: WebPushError): string;
  export default {
    setVapidDetails,
    setGCMAPIKey,
    generateVAPIDKeys,
    generateRequestDetails,
    sendNotification,
  };
}
