// Every selectable avatar; value is the file name in public/avatars without .png.
// Keep in sync with AVATAR_NAMES in backend/src/api/validation.ts.
// The older avatars are no longer offered but their files stay, so profiles that use them still render

// The app logo, used when a user has no avatar saved
export const DEFAULT_AVATAR = "time-singularity";

export function avatarSrc(name?: string | null) {
  return `/avatars/${name || DEFAULT_AVATAR}.png`;
}

export const AVATARS = [
  { value: DEFAULT_AVATAR, label: "Time Singularity" },
  { value: "avatar-retro-computer", label: "Retro Computer" },
  { value: "avatar-fountain-pen", label: "Fountain Pen" },
  { value: "avatar-hourglass", label: "Hourglass" },
  { value: "avatar-earth-sunrise", label: "Earth Sunrise" },
  { value: "avatar-coffee", label: "Coffee" },
  { value: "avatar-books", label: "Books" },
  { value: "avatar-sticky-note", label: "Sticky Note" },
  { value: "avatar-plant", label: "Plant" },
  { value: "avatar-camera", label: "Camera" },
  { value: "avatar-compass", label: "Compass" },
  { value: "avatar-laptop", label: "Laptop" },
  { value: "avatar-desk-lamp", label: "Desk Lamp" },
  { value: "avatar-rocket-launch", label: "Rocket Launch" },
  { value: "avatar-ringed-planet", label: "Ringed Planet" },
  { value: "avatar-sunset-clouds", label: "Sunset Clouds" },
  { value: "avatar-gears", label: "Gears" },
  { value: "avatar-robot", label: "Robot" },
  { value: "avatar-brain", label: "Brain" },
  { value: "avatar-floating-city", label: "Floating City" },
  { value: "avatar-purple-planet", label: "Purple Planet" },
  { value: "avatar-robot-hand", label: "Robot Hand" },
  { value: "avatar-dreamer", label: "Dreamer" },
  { value: "avatar-crystal", label: "Crystal" },
  { value: "avatar-orbital-station", label: "Orbital Station" },
  { value: "avatar-astronaut-helmet", label: "Astronaut Helmet" },
  { value: "avatar-starship", label: "Starship" },
  { value: "avatar-event-horizon", label: "Event Horizon" },
  { value: "avatar-earth-night", label: "Earth Night" },
  { value: "avatar-portal", label: "Portal" },
  { value: "avatar-happy-bot", label: "Happy Bot" },
  { value: "avatar-space-lounge", label: "Space Lounge" },
  { value: "avatar-spiral-galaxy", label: "Spiral Galaxy" },
];
