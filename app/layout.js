import './globals.css';

export const metadata = {
  title: 'Hoon or Home',
  description: 'Wingfoil, windsurf, or stay home based on your forecast.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
