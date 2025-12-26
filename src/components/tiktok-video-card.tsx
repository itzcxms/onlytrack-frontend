import { Card, CardContent } from "@/components/ui/card";
import { Eye, Heart, MessageCircle, ExternalLink } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import type { PostAnalytics } from "@shared/schema";

interface TikTokVideoCardProps {
  post: PostAnalytics;
  index?: number;
}

export function TikTokVideoCard({ post, index }: TikTokVideoCardProps) {
  // Extract video ID from URL if available
  const videoId =
    post.urlPost?.match(/\/video\/(\d+)/)?.[1] || post.id || "unknown";

  // Safe date parsing
  const postedDate = post.datePublication
    ? new Date(post.datePublication)
    : new Date();
  const isValidDate = !isNaN(postedDate.getTime());

  return (
    <Card className="glass-card rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 group">
      <CardContent className="p-0">
        <div className="relative">
          {/* Thumbnail */}
          {post.urlMiniature ? (
            <div className="relative aspect-[9/16] w-full overflow-hidden bg-black/20">
              <img
                src={post.urlMiniature}
                alt={`TikTok video ${videoId}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Platform badge */}
              <div className="absolute top-3 right-3">
                <div className="bg-black/60 backdrop-blur-sm rounded-full p-2">
                  <SiTiktok className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Stats overlay on hover */}
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center justify-between text-white text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="font-semibold">
                      {(post.vues ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span className="font-semibold">
                      {(post.likes ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span className="font-semibold">
                      {(post.commentaires ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Fallback if no thumbnail
            <div className="aspect-[9/16] w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <SiTiktok className="w-16 h-16 text-primary/40" />
            </div>
          )}

          {/* Content section */}
          <div className="p-4 space-y-3">
            {/* Video ID and date */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">
                    #{videoId?.slice(-8) || "N/A"}
                  </span>
                  {index !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      • Post #{index + 1}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isValidDate
                    ? postedDate.toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Date invalide"}
                </p>
              </div>
              {post.urlPost && (
                <a
                  href={post.urlPost}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                  title="Ouvrir sur TikTok"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-primary/10">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Vues</p>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {(post.vues ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Heart className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {(post.likes ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Commentaires</p>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {(post.commentaires ?? 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Engagement rate */}
            {(post.engagement ?? 0) > 0 && (
              <div className="pt-2 border-t border-primary/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Taux d'engagement
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {(post.engagement ?? 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
