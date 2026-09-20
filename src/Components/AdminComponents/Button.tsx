import { ReactNode } from "react";

const Button = ({ icon, bgColor, color, bgHoverColor, size, text, borderRadius, width, onClick }: {
  icon?: ReactNode;
  bgColor?: string;
  color?: string;
  bgHoverColor?: string;
  size?: string;
  text?: string;
  borderRadius?: string;
  width?: string;
  onClick?: () => void;
}) => {

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ backgroundColor: bgColor, color, borderRadius }}
      className={` text-${size} p-3 w-${width} hover:drop-shadow-xl hover:bg-${bgHoverColor}`}
    >
      {icon} {text}
    </button>
  );
};

export default Button;
