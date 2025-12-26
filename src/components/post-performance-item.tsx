import { Eye, ThumbsUp, MessageCircle } from "lucide-react";
import { SiInstagram, SiTiktok, SiThreads } from "react-icons/si";
import type { PostAnalytics } from "@shared/schema";

interface PostPerformanceItemProps {
  post: PostAnalytics;
  index: number;
  onClick?: () => void;
}

export function PostPerformanceItem({
  post,
  index,
  onClick,
}: PostPerformanceItemProps) {
  // Determine platform from URL
  const getPlatform = () => {
    const url = (post.urlPost || "").toLowerCase();
    if (url.includes("instagram.com") || url.includes("instagram")) {
      return { name: "Instagram", icon: SiInstagram, color: "bg-pink-500" };
    }
    if (url.includes("tiktok.com") || url.includes("tiktok")) {
      return { name: "TikTok", icon: SiTiktok, color: "bg-black" };
    }
    if (url.includes("threads.net") || url.includes("threads")) {
      return { name: "Threads", icon: SiThreads, color: "bg-black" };
    }
    return { name: "Unknown", icon: SiTiktok, color: "bg-gray-500" };
  };

  const platform = getPlatform();
  const PlatformIcon = platform.icon;

  // Extract post ID (last 8 characters of the post ID)
  const postId = post.id?.slice(-8) || `post-${index + 1}`;

  // Format date
  const formatDate = (date: Date | string) => {
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      if (isNaN(d.getTime())) return "Date invalide";
      return d.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    } catch {
      return "Date invalide";
    }
  };

  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-primary/20 cursor-pointer"
      onClick={onClick}
    >
      {/* Left side: Thumbnail, Platform icon and Post ID */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Thumbnail image */}
        {post.urlMiniature ? (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-black/20">
            <img
              src={post.urlMiniature}
              alt={`Post ${postId}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            {/* Platform badge overlay */}
            <div
              className={`absolute top-1 right-1 ${platform.color} rounded p-1`}
            >
              <PlatformIcon className="w-3 h-3 text-white" />
            </div>
          </div>
        ) : (
          /* Fallback: Platform icon only if no thumbnail */
          <div className={`${platform.color} rounded-lg p-2 flex-shrink-0`}>
            <PlatformIcon className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Post ID */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            Post #{postId}
          </p>
        </div>
      </div>

      {/* Right side: Statistics */}
      <div className="flex items-center gap-6 flex-shrink-0">
        {/* Views */}
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {(post.vues ?? 0).toLocaleString()}
          </span>
        </div>

        {/* Likes */}
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {(post.likes ?? 0).toLocaleString()}
          </span>
        </div>

        {/* Comments */}
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {(post.commentaires ?? 0).toLocaleString()}
          </span>
        </div>

        {/* Date */}
        <div className="text-sm text-muted-foreground min-w-[100px] text-right">
          {formatDate(post.datePublication)}
        </div>
      </div>
    </div>
  );
}
