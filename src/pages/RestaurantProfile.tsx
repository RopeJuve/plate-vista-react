import { Header } from "../Components/AdminComponents";
import ProfileForm from "../features/restaurant-profile/ProfileForm";
import { useRestaurantProfile } from "../features/restaurant-profile/hooks/useRestaurantProfile";

/** The Restaurant Profile: what guests see about the restaurant on their phone. */
const RestaurantProfile = () => {
  const { profile, loading, save } = useRestaurantProfile();

  return (
    <div>
      <Header title="Restaurant profile" description="Your logo, address and opening hours, as guests see them." />
      <div className="max-w-2xl rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6">
        {loading ? <p className="text-sm text-ink-soft">Loading…</p> : <ProfileForm profile={profile} onSave={save} />}
      </div>
    </div>
  );
};

export default RestaurantProfile;
