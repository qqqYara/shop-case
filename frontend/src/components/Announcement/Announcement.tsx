"use client";

import { useEffect, useMemo, useState } from "react";
import "./Announcement.scss";

const ROTATE_MS = 8000;
const FALLBACK_MESSAGE = "Get 15% off with code LUMEAFIRST15";

type AnnouncementProps = {
  messages?: string[];
};

export function Announcement({ messages }: AnnouncementProps) {
  const items = useMemo(() => {
    const next = (messages ?? [])
      .map((message) => message.trim())
      .filter((message) => message.length > 0);

    return next.length > 0 ? next : [FALLBACK_MESSAGE];
  }, [messages]);
  const [index, setIndex] = useState(0);
  const current = items[index] ?? items[0];

  useEffect(() => {
    setIndex(0);

    if (items.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % items.length);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [items]);

  return (
    <div className="announcement" role="region" aria-label="Announcement">
      {items.map((message, messageIndex) => (
        <p
          key={`measure-${messageIndex}`}
          className="announcement__text announcement__text--measure"
          aria-hidden="true"
        >
          {message}
        </p>
      ))}
      <p key={index} className="announcement__text" title={current}>
        {current}
      </p>
    </div>
  );
}
