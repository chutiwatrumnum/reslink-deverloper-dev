import { ReactNode } from "react";
// CSS
import "../../styles/stepModalCreate.css";
interface ModalPropsType {
  isOpen: boolean;
  header: ReactNode;
  children: ReactNode;
}
const StepModal = ({ isOpen, header, children }: ModalPropsType) => {
  if (!isOpen) return null;

  return (
    <div className="modalOverlay">
      <div className="modalBody">
        {/* Modal Header */}
        <div className="modalHeader">
          <div>{header}</div>
        </div>
        {/* Modal Content */}
        <div className="modalContent">{children}</div>
      </div>
    </div>
  );
};

export default StepModal;
