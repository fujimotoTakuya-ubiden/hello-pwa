import { useState } from "react";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

const VAPID_PUBLIC_KEY = "BGljmG0SJoIzcUde6w44yqWaRt4QNBMPRzPcx6sgz__G19DoEixuI5uSgkyjBl3j9put4hhABRjcRk9Dyce4Pp8";

export function Welcome() {
  const [subJson, setSubJson] = useState("");
  const [copyMsg, setCopyMsg] = useState<string>("");

  const subscribePush = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        alert("Service Worker が利用できません");
        return;
      }
      if (!("PushManager" in window)) {
        alert("Push が利用できません（ブラウザ/環境非対応）");
        return;
      }

      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        alert("通知が許可されていません");
        return;
      }

      const reg = await navigator.serviceWorker.ready;

      // 既存購読があれば外して作り直す（410対策にもなる）
      const existing = await reg.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      setSubJson(JSON.stringify(sub, null, 2));
      setCopyMsg("");
    } catch (e) {
      console.error(e);
      alert("subscribe に失敗しました。コンソールを確認してください。");
    }
  };

  const copyToClipboard = async () => {
    if (!subJson) return;
    try {
      await navigator.clipboard.writeText(subJson);
      setCopyMsg("コピーしました ✅");
      setTimeout(() => setCopyMsg(""), 1500);
    } catch (e) {
      console.error(e);
      setCopyMsg("コピーできませんでした（ブラウザ制限）");
      setTimeout(() => setCopyMsg(""), 2000);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[900px] flex flex-col items-center gap-8">
        <header className="w-full flex flex-col items-center gap-4">
          <div className="w-[500px] max-w-[100vw] p-2">
            <img src={logoLight} alt="React Router" className="block w-full dark:hidden" />
            <img src={logoDark} alt="React Router" className="hidden w-full dark:block" />
          </div>
        </header>

        {/* Push検証UI（中央寄せ・コピペしやすい） */}
        <section className="w-full rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={subscribePush}
              className="w-full max-w-[520px] rounded-2xl border border-gray-200 px-5 py-4 dark:border-gray-700"
            >
              通知を有効化（subscribe）
            </button>

            {subJson && (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    subscription JSON（コピーして <code>subscription.json</code> に貼ってください）
                  </p>

                  <div className="flex items-center gap-3">
                    {copyMsg && (
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        {copyMsg}
                      </span>
                    )}
                    <button
                      onClick={copyToClipboard}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm dark:border-gray-700"
                    >
                      クリップボードにコピー
                    </button>
                  </div>
                </div>

                <pre className="w-full max-h-[45vh] overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-gray-200 p-4 text-xs dark:border-gray-700">
{subJson}
                </pre>
              </div>
            )}
          </div>
        </section>

        {/* 既存の「What's next?」は邪魔なら消してOK */}
        {/* 必要ならここに resources の nav を戻してください */}
      </div>
    </main>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i);
  return output;
}
