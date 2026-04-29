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

export const zacIcons: Record<ZacIconKey, ZacIconAsset> = {
  logo: { src: "/icons/zac/01_zac_logo.png", alt: "Zac" },
  gym: { src: "/icons/zac/02_gym.png", alt: "ジム" },
  bouldering: { src: "/icons/zac/03_bouldering.png", alt: "ボルダリング" },
  lead: { src: "/icons/zac/04_lead.png", alt: "リード" },
  topRope: { src: "/icons/zac/05_top_rope.png", alt: "トップロープ" },
  climbLog: { src: "/icons/zac/06_climb_log.png", alt: "記録" },
  sessionPlan: { src: "/icons/zac/07_session_plan.png", alt: "予定" },
  grade: { src: "/icons/zac/08_grade.png", alt: "グレード" },
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
