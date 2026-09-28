import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { getAnnouncementMessages } from "@/lib/catalog";
import "@/styles/main.scss";

export const metadata: Metadata = {
  title: "Shop Case",
  description: "Shop Case",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const announcements = await getAnnouncementMessages();

  return (
    <html lang="en">
      <body>
        <Header announcements={announcements} />
        {children}
      </body>
    </html>
  );
}
