import type { LicenseStatus } from "../../../stores/interfaces/License";

interface Props {
  status: LicenseStatus;
}

const StatusPill = ({ status }: Props) => {
  let color = "#555";
  let bg = "#eee";
  let text = "";

  switch (status) {
    case "in_service":
      color = "#38BE43";
      bg = "#E6F9E6";
      text = "In service";
      break;
    case "expiring_soon":
      color = "#ECA013";
      bg = "#FFF7DA";
      text = "Expiring soon";
      break;
    case "expired":
      color = "#D73232";
      bg = "#FFE3E3";
      text = "Expired";
      break;
    case "suspended":
      color = "#ECA013";
      bg = "#FFF7DA";
      text = "Suspended";
      break;
    case "waiting_for_payment":
      color = "#1677ff";
      bg = "#E6F4FF";
      text = "Waiting for payment";
      break;
  }

  return (
    <span
      style={{
        color,
        backgroundColor: bg,
        padding: "4px 12px",
        borderRadius: 8,
        border: `1px solid ${color}`,
        whiteSpace: "nowrap",
        display: "inline-block",
      }}
    >
      {text}
    </span>
  );
};

export default StatusPill;
