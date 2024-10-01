import { useAuth } from "../../contexts/AuthContext";

const BarAvatar = () => {
  const { user } = useAuth();
  const firstLetter = user?.charAt(0).toUpperCase();
  return (
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-600">
      {firstLetter}
    </div>
  );
};

export default BarAvatar;
