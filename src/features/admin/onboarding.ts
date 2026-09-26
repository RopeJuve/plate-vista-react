const ONBOARDING_KEY = "platevista-onboarding";

export const markOnboarding = () => {
  sessionStorage.setItem(ONBOARDING_KEY, "1");
};

export const consumeOnboarding = () => sessionStorage.getItem(ONBOARDING_KEY) === "1";

export const dismissOnboarding = () => {
  sessionStorage.removeItem(ONBOARDING_KEY);
};
