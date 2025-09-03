// CSS
import "../../styles/stepModalCreate.css";
// Types
import { StepStatus } from "../../../../stores/interfaces/ProjectManage";

type stepPropsType = {
  title: string;
  status: StepStatus;
  onClick?: () => void;
};

const StepBar = ({ title, status, onClick }: stepPropsType) => {
  const getLineColor = () => {
    switch (status) {
      case "completed":
        return "var(--success-color)";
      case "error":
        return "var(--danger-color)";
      case "active":
        return "var(--secondary-color)";
      case "pending":
      default:
        return "var(--gray-color)";
    }
  };
  const getTextColor = () => {
    switch (status) {
      case "completed":
        return "var(--success-color)";
      case "error":
        return "var(--danger-color)";
      case "active":
        return "var(--secondary-color)";
      case "pending":
      default:
        return "var(--gray-color)";
    }
  };
  return (
    <div className="containerStep">
      {/* Title */}
      <div className="titleContainerStep" onClick={onClick}>
        <h3 style={{ color: getTextColor() }} className="titleStep">
          {title}
        </h3>
      </div>

      {/* Line */}
      <div className="lineContainerStep" onClick={onClick}>
        <div
          style={{
            backgroundColor: getLineColor(),
            cursor: onClick ? "pointer" : "default",
          }}
          className="lineStep"
        />
      </div>
    </div>
  );
};

export default StepBar;
