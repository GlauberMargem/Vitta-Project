import "./globals.css";
import { Header } from '../components/Header/index.js'
import { Navbar } from '../components/Navbar/index.js'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      </head>
      <body
        className={`antialiased`}
      >
        <Header></Header>
        <Navbar></Navbar>
        {children}
      </body>
    </html >
  );
}
