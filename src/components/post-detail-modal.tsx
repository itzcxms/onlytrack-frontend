import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, ThumbsUp, MessageCircle, ExternalLink, X } from "lucide-react";
import { SiInstagram, SiTiktok, SiThreads } from "react-icons/si";
import type { PostAnalytics } from "@shared/schema";

interface PostDetailModalProps {
  post: PostAnalytics | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostDetailModal({
  post,
  open,
  onOpenChange,
}: PostDetailModalProps) {
  const [loadingComments, setLoadingComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);

  if (!post) return null;

  // Determine platform
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

  // Extract video ID from URL
  const videoId =
    post.urlPost?.match(/\/video\/(\d+)/)?.[1] || post.id?.slice(-8);

  // Format date
  const formatDate = (date: Date | string) => {
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      if (isNaN(d.getTime())) return "Date invalide";
      return d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  };

  // Load comments (placeholder for future API integration)
  const loadComments = async () => {
    if (loadingComments || comments.length > 0) return;

    setLoadingComments(true);
    // TODO: Implement API call to fetch comments
    // For now, we'll show a placeholder
    setTimeout(() => {
      setLoadingComments(false);
      // Placeholder: In the future, fetch from API
      setComments([]);
    }, 1000);
  };

  // Extract embed URL for TikTok
  const getEmbedUrl = () => {
    if (post.urlPost?.includes("tiktok.com")) {
      // TikTok embed URL format
      const videoIdMatch = post.urlPost.match(/\/video\/(\d+)/);
      if (videoIdMatch) {
        return `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`;
      }
    }
    return null;
  };

  const embedUrl = getEmbedUrl();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-primary/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className={`${platform.color} rounded-lg p-2`}>
                <PlatformIcon className="w-5 h-5 text-white" />
              </div>
              <span>Détails du post</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Thumbnail/Video Preview */}
          <div className="relative">
            {post.urlMiniature ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/20">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`Video ${videoId}`}
                  />
                ) : (
                  <>
                    <img
                      src={post.urlMiniature}
                      alt={`Post ${videoId}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    {post.urlPost && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <a
                          href={post.urlPost}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg hover:bg-primary/80 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Ouvrir sur {platform.name}</span>
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                <PlatformIcon className="w-24 h-24 text-primary/40" />
              </div>
            )}
          </div>

          {/* Post Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
              <Eye className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Vues</p>
                <p className="text-lg font-bold">
                  {(post.vues ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
              <ThumbsUp className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Likes</p>
                <p className="text-lg font-bold">
                  {(post.likes ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Commentaires</p>
                <p className="text-lg font-bold">
                  {(post.commentaires ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
              <div className="w-5 h-5 flex items-center justify-center">
                <span className="text-xs">📊</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Engagement</p>
                <p className="text-lg font-bold text-primary">
                  {post.engagement ? `${post.engagement.toFixed(2)}%` : "0%"}
                </p>
              </div>
            </div>
          </div>

          {/* Post Details */}
          <div className="space-y-2 p-4 rounded-lg bg-white/5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                Post #{post.id?.slice(-8)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(post.datePublication)}
              </p>
            </div>
            {post.urlPost && (
              <a
                href={post.urlPost}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Voir le post original sur {platform.name}
              </a>
            )}
          </div>

          {/* Comments Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Commentaires
                {post.commentaires && post.commentaires > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({post.commentaires})
                  </span>
                )}
              </h3>
              {post.commentaires &&
                post.commentaires > 0 &&
                comments.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadComments}
                    disabled={loadingComments}
                    className="rounded-lg"
                  >
                    {loadingComments
                      ? "Chargement..."
                      : "Charger les commentaires"}
                  </Button>
                )}
            </div>

            {comments.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {comments.map((comment, index) => (
                  <div key={index} className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs">👤</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {comment.author || "Utilisateur"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {comment.text}
                        </p>
                        {comment.date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(comment.date).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-lg bg-white/5 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {post.commentaires && post.commentaires > 0
                    ? 'Cliquez sur "Charger les commentaires" pour voir les commentaires'
                    : "Aucun commentaire pour ce post"}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
