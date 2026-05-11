import Image from "next/image";

export type ZacIconKey =
  | "logo"
  | "gym"
  | "bouldering"
  | "lead"
  | "topRope"
  | "climbLog"
  | "sessionPlan"
  | "grade";

type ZacIconAsset = {
  src: string;
  alt: string;
};

const iconSrc = (fileName: string) => `/icons/zac/${fileName}?v=20260511-transparent`;

export const zacIcons: Record<ZacIconKey, ZacIconAsset> = {
  logo: { src: iconSrc("01_zac_logo.png"), alt: "Zac" },
  gym: { src: iconSrc("02_gym.png"), alt: "ジム" },
  bouldering: { src: iconSrc("03_bouldering.png"), alt: "ボルダリング" },
  lead: { src: iconSrc("04_lead.png"), alt: "リード" },
  topRope: { src: iconSrc("05_top_rope.png"), alt: "トップロープ" },
  climbLog: { src: iconSrc("06_climb_log.png"), alt: "記録" },
  sessionPlan: { src: iconSrc("07_session_plan.png"), alt: "予定" },
  grade: { src: iconSrc("08_grade.png"), alt: "グレード" },
};

export function ZacIcon({
  icon,
  size = 40,
  className,
  decorative = false,
}: {
  icon: ZacIconKey;
  size?: number;
  className?: string;
  decorative?: boolean;
}) {
  const asset = zacIcons[icon];

  return (
    <Image
      alt={decorative ? "" : asset.alt}
      className={className}
      height={size}
      priority={icon === "logo"}
      src={asset.src}
      width={size}
    />
  );
}
