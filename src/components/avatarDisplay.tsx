
import { useAuth } from "../hooks/useAuth";

interface AvatarDisplayProps {
  // Shown instead of the saved avatar while the user previews a new one
  previewAvatar?: string | null;
}

export default function AvatarDisplay({ previewAvatar }: AvatarDisplayProps) {
const { avatar } = useAuth();
  return (
    <>
      <div>
        <img style={{border:"2px solid black", margin:"1rem auto",borderRadius:"50%", backgroundColor:"pink", width:"192px", height:"192px"}} src={`/avatars/${previewAvatar ?? avatar}.png`} alt="" />

      </div>
    </>
  )
}
