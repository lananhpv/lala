import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Newspaper, TrendingUp, RefreshCw, ExternalLink, Calendar, Tag, Sparkles, BarChart3 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Summary from "./Summary";

const REGIONS = {
  ALL: "Tất cả",
  vietnam: "Việt Nam",
  us: "Hoa Kỳ",
  china: "Trung Quốc"
};

const VIEWS = {
  NEWS: "news",
  SUMMARY: "summary"
};

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [currentView, setCurrentView] = useState<string>(VIEWS.NEWS);
  
  const { data: articles, isLoading, refetch } = trpc.news.list.useQuery({
    limit: 100
  });
  
  // Lọc theo region
  const filteredArticles = articles?.filter(article => 
    selectedRegion === "ALL" || article.region === selectedRegion
  ) || [];
  
  const { data: stats } = trpc.news.stats.useQuery();
  
  const collectMutation = trpc.news.collect.useMutation({
    onSuccess: (data) => {
      toast.success(`Thu thập thành công! ${data.saved}/${data.collected} bài viết mới`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    }
  });
  
  const summarizeMutation = trpc.news.summarize.useMutation({
    onSuccess: (data, variables) => {
      toast.success('Đã tạo tóm tắt!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    }
  });

  const handleCollect = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thu thập tin tức");
      return;
    }
    collectMutation.mutate();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Không rõ";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Dư nợ Margin": "bg-blue-100 text-blue-800",
      "Lãi suất": "bg-green-100 text-green-800",
      "Ngân hàng Nhà nước": "bg-purple-100 text-purple-800",
      "Thanh tra/Kiểm tra": "bg-red-100 text-red-800",
      "Tỷ giá": "bg-yellow-100 text-yellow-800",
      "Lạm phát": "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Newspaper className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
                <p className="text-sm text-gray-600">Tin tức kinh tế VN, US, China - Cập nhật mỗi 60 phút</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 mr-2">
                <Button
                  onClick={() => setCurrentView(VIEWS.NEWS)}
                  variant={currentView === VIEWS.NEWS ? "default" : "outline"}
                  size="sm"
                >
                  <Newspaper className="h-4 w-4 mr-2" />
                  Tin tức
                </Button>
                <Button
                  onClick={() => setCurrentView(VIEWS.SUMMARY)}
                  variant={currentView === VIEWS.SUMMARY ? "default" : "outline"}
                  size="sm"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Tóm tắt
                </Button>
              </div>
              <Button 
                onClick={() => refetch()} 
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
              {isAuthenticated && user?.role === 'admin' && (
                <Button 
                  onClick={handleCollect} 
                  disabled={collectMutation.isPending}
                  variant="default"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${collectMutation.isPending ? 'animate-spin' : ''}`} />
                  Thu thập ngay
                </Button>
              )}
              {!isAuthenticated ? (
                <Button asChild>
                  <a href={getLoginUrl()}>Đăng nhập</a>
                </Button>
              ) : (
                <div className="text-sm text-gray-600">
                  Xin chào, <span className="font-semibold">{user?.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      {stats && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Tổng số bài viết</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Số nguồn tin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {Object.keys(stats.bySource).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Số chủ đề</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {Object.keys(stats.byCategory).length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {currentView === VIEWS.SUMMARY ? (
          <Summary />
        ) : (
        <Tabs value={selectedRegion} onValueChange={setSelectedRegion} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-white p-2">
            {Object.entries(REGIONS).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="whitespace-nowrap">
                {label}
                {key !== "ALL" && (
                  <Badge variant="secondary" className="ml-2">
                    {articles?.filter(a => a.region === key).length || 0}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Đang tải...</span>
              </div>
            ) : filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Newspaper className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">Chưa có tin tức nào</p>
                  {isAuthenticated && user?.role === 'admin' && (
                    <Button onClick={handleCollect} className="mt-4" disabled={collectMutation.isPending}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${collectMutation.isPending ? 'animate-spin' : ''}`} />
                      Thu thập tin tức
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 leading-tight">
                            <a 
                              href={article.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 transition-colors"
                            >
                              {article.title}
                            </a>
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            <Badge variant="outline" className="font-normal">
                              {article.source}
                            </Badge>
                            {article.category && (
                              <Badge className={getCategoryColor(article.category)}>
                                {article.category}
                              </Badge>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(article.publishedDate || article.collectedDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Điểm: {article.relevanceScore}
                            </span>
                          </div>
                        </div>
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {article.aiSummary && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-800">{article.aiSummary}</p>
                          </div>
                        </div>
                      )}
                      
                      {!article.aiSummary && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mb-3"
                          onClick={() => summarizeMutation.mutate({
                            articleId: article.id,
                            articleUrl: article.url,
                            articleTitle: article.title
                          })}
                          disabled={summarizeMutation.isPending}
                        >
                          <Sparkles className={`h-4 w-4 mr-2 ${summarizeMutation.isPending ? 'animate-pulse' : ''}`} />
                          {summarizeMutation.isPending ? 'Đang tóm tắt...' : 'Tóm tắt bằng AI'}
                        </Button>
                      )}
                      
                      {article.summary && (
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                          {article.summary}
                        </p>
                      )}
                      
                      {article.matchedKeywords && (
                        <div className="flex items-start gap-2">
                          <Tag className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {article.matchedKeywords.split(', ').slice(0, 5).map((keyword, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>Hệ thống tự động thu thập tin tức mỗi 60 phút từ các nguồn uy tín</p>
          <p className="mt-1 font-semibold">Việt Nam:</p>
          <p className="mt-0.5">CafeF • VietStock • VnExpress • Báo Đầu Tư</p>
          <p className="mt-2 font-semibold">Quốc tế:</p>
          <p className="mt-0.5">BBC • NPR • The Guardian • Al Jazeera</p>
        </div>
      </footer>
    </div>
  );
}

