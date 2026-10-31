import { auth } from "@/lib/auth/config";
import { Header } from "@/components/Header";
import { Navbar } from "@/components/Navbar";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <>
      <Header></Header>
      {children}
      <Navbar role={session?.user.role ?? null}></Navbar>
    </>
  );
}
