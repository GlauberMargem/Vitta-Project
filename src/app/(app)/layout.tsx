import { Header } from "@/components/Header";
import { Navbar } from "@/components/Navbar";

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
