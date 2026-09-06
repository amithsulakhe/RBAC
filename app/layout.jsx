import './globals.css';

export const metadata = {
  title: 'Nav - Hospital Services',
  description: 'Hospital management with RBAC',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
