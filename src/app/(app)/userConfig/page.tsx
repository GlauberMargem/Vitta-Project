import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { ProfileView } from "@/components/profile/ProfileView";

export default async function UserConfigPage() {
  const session = await auth();
  if (!session) {
    return null;
  }

  if (session.user.role === "PATIENT") {
    const profile = await db.patientProfile.findUniqueOrThrow({
      where: { userId: session.user.id },
      select: {
        birthDate: true,
        diabetesType: true,
        hypoThreshold: true,
        severeHypoThreshold: true,
        hyperFastingThreshold: true,
        hyperPostprandialThreshold: true,
        user: { select: { name: true, email: true } },
      },
    });

    return (
      <ProfileView
        role="PATIENT"
        name={profile.user.name}
        email={profile.user.email}
        birthDate={profile.birthDate}
        diabetesType={profile.diabetesType}
        hypoThreshold={profile.hypoThreshold}
        severeHypoThreshold={profile.severeHypoThreshold}
        hyperFastingThreshold={profile.hyperFastingThreshold}
        hyperPostprandialThreshold={profile.hyperPostprandialThreshold}
      />
    );
  }

  if (session.user.role === "DOCTOR") {
    const profile = await db.doctorProfile.findUniqueOrThrow({
      where: { userId: session.user.id },
      select: {
        crm: true,
        specialty: true,
        user: { select: { name: true, email: true } },
      },
    });

    return (
      <ProfileView
        role="DOCTOR"
        name={profile.user.name}
        email={profile.user.email}
        crm={profile.crm}
        specialty={profile.specialty}
      />
    );
  }

  return null;
}
