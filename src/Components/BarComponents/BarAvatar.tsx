import { useAuth } from "../../contexts/AuthContext";

const getUserLabel = (user) => {
  if (!user) {
    return "Staff";
  }
  if (typeof user === "string") {
    return user;
  }
  return user.employee || user.position || user.email || "Staff";
};

const BarAvatar = () => {
  const { user } = useAuth();
  const firstLetter = getUserLabel(user).charAt(0).toUpperCase();
  return (
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-600">
      {firstLetter}
    </div>
  );
};

export default BarAvatar;
