
import { useAuth } from "../hooks/useAuth";
import { avatarSrc } from "../lib/avatars";

interface AvatarDisplayProps {
  // Shown instead of the saved avatar while the user previews a new one
  previewAvatar?: string | null;
}

export default function AvatarDisplay({ previewAvatar }: AvatarDisplayProps) {
const { avatar } = useAuth();
  return (
    <>
      <div>
        <img style={{border:"2px solid var(--brand-500)", margin:"1rem auto",borderRadius:"50%", backgroundColor:"pink", width:"192px", height:"192px"}} src={avatarSrc(previewAvatar ?? avatar)} alt="" />

      </div>
    </>
  )
}
