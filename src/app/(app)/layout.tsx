import { Header } from "@/components/Header/index.js";
import { Navbar } from "@/components/Navbar/index.js";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header></Header>
      {children}
      <Navbar></Navbar>
    </>
  );
}
