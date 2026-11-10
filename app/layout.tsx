export const metadata = {
  title: "MetaFix Royalty Payout Agent",
  description:
    "An AI agent that splits royalties and pays collaborators via PayPal sandbox Payouts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          background: "#faf9f7",
          color: "#111",
        }}
      >
        {children}
      </body>
    </html>
  );
}
