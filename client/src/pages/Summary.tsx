import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { RefreshCw, TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const REGIONS = {
  vietnam: "Việt Nam",
  us: "Hoa Kỳ",
  china: "Trung Quốc"
};

const SENTIMENT_CONFIG = {
  positive: {
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: TrendingUp,
    label: "Tích cực"
  },
  negative: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: TrendingDown,
    label: "Tiêu cực"
  },
  neutral: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: Minus,
    label: "Trung lập"
  }
};

export default function Summary() {
  const { user, isAuthenticated } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState<string>("vietnam");
  const [days, setDays] = useState<number>(7);
  
  const { data: summaries, isLoading, refetch } = trpc.summary.list.useQuery({
    limit: 100
  });
  
  const generateAllMutation = trpc.summary.generateAll.useMutation({
    onSuccess: (data) => {
      toast.success(`Đã tạo ${data.successful}/${data.total} tóm tắt!`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    }
  });

  const handleGenerateAll = () => {
    generateAllMutation.mutate({ days });
  };

  // Lọc và nhóm summaries theo region và date
  const filteredSummaries = useMemo(() => {
    if (!summaries) return [];
    return summaries
      .filter(s => s.region === selectedRegion)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [summaries, selectedRegion]);

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = useMemo(() => {
    if (!summaries) return [];
    
    // Nhóm theo ngày
    const dateMap = new Map<string, { positive: number; negative: number; neutral: number }>();
    
    summaries
      .filter(s => s.region === selectedRegion)
      .forEach(s => {
        if (!dateMap.has(s.date)) {
          dateMap.set(s.date, { positive: 0, negative: 0, neutral: 0 });
        }
        const counts = dateMap.get(s.date)!;
        counts[s.sentiment as keyof typeof counts]++;
      });
    
    // Chuyển thành array và sort theo ngày
    return Array.from(dateMap.entries())
      .map(([date, counts]) => ({
        date,
        ...counts,
        total: counts.positive + counts.negative + counts.neutral
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Chỉ lấy 30 ngày gần nhất
  }, [summaries, selectedRegion]);

  // Tính toán thống kê
  const stats = useMemo(() => {
    if (!summaries) return { total: 0, positive: 0, negative: 0, neutral: 0 };
    
    const filtered = summaries.filter(s => s.region === selectedRegion);
    return {
      total: filtered.length,
      positive: filtered.filter(s => s.sentiment === 'positive').length,
      negative: filtered.filter(s => s.sentiment === 'negative').length,
      neutral: filtered.filter(s => s.sentiment === 'neutral').length
    };
  }, [summaries, selectedRegion]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      weekday: "short"
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tóm tắt tin tức theo ngày</h2>
          <p className="text-sm text-gray-600 mt-1">
            Phân tích tác động của tin tức đến thị trường chứng khoán
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => refetch()} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button 
            onClick={handleGenerateAll} 
            disabled={generateAllMutation.isPending}
            variant="default"
            size="sm"
          >
            <BarChart3 className={`h-4 w-4 mr-2 ${generateAllMutation.isPending ? 'animate-spin' : ''}`} />
            {generateAllMutation.isPending ? 'Đang tạo...' : 'Tạo tóm tắt'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng số ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Tích cực</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.positive}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Tiêu cực</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.negative}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Trung lập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.neutral}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedRegion} onValueChange={setSelectedRegion} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-white p-2">
          {Object.entries(REGIONS).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="whitespace-nowrap">
              {label}
              <Badge variant="secondary" className="ml-2">
                {summaries?.filter(s => s.region === key).length || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Chart Section */}
        <Card className="mt-6 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Biểu đồ xu hướng sentiment
            </CardTitle>
            <CardDescription>
              Phân bố sentiment theo ngày (30 ngày gần nhất)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có dữ liệu để hiển thị biểu đồ
              </div>
            ) : (
              <div className="space-y-2">
                {chartData.map((item) => {
                  const total = item.total || 1;
                  const positivePercent = (item.positive / total) * 100;
                  const negativePercent = (item.negative / total) * 100;
                  const neutralPercent = (item.neutral / total) * 100;
                  
                  return (
                    <div key={item.date} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          {formatDate(item.date)}
                        </span>
                        <span className="text-gray-500">
                          {item.positive}+ / {item.negative}- / {item.neutral}○
                        </span>
                      </div>
                      <div className="flex h-6 rounded-md overflow-hidden border border-gray-200">
                        {item.positive > 0 && (
                          <div 
                            className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                            style={{ width: `${positivePercent}%` }}
                            title={`Tích cực: ${item.positive}`}
                          >
                            {positivePercent >= 15 && `${Math.round(positivePercent)}%`}
                          </div>
                        )}
                        {item.negative > 0 && (
                          <div 
                            className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                            style={{ width: `${negativePercent}%` }}
                            title={`Tiêu cực: ${item.negative}`}
                          >
                            {negativePercent >= 15 && `${Math.round(negativePercent)}%`}
                          </div>
                        )}
                        {item.neutral > 0 && (
                          <div 
                            className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium"
                            style={{ width: `${neutralPercent}%` }}
                            title={`Trung lập: ${item.neutral}`}
                          >
                            {neutralPercent >= 15 && `${Math.round(neutralPercent)}%`}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summaries List */}
        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : filteredSummaries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-4">Chưa có tóm tắt nào cho khu vực này</p>
                <Button onClick={handleGenerateAll} disabled={generateAllMutation.isPending}>
                  <BarChart3 className={`h-4 w-4 mr-2 ${generateAllMutation.isPending ? 'animate-spin' : ''}`} />
                  Tạo tóm tắt
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredSummaries.map((summary) => {
                const sentimentConfig = SENTIMENT_CONFIG[summary.sentiment as keyof typeof SENTIMENT_CONFIG];
                const SentimentIcon = sentimentConfig.icon;
                
                return (
                  <Card 
                    key={summary.id} 
                    className={`hover:shadow-lg transition-shadow border-2 ${sentimentConfig.borderColor}`}
                  >
                    <CardHeader className={sentimentConfig.bgColor}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-gray-600" />
                            <CardTitle className="text-lg">
                              {formatDate(summary.date)}
                            </CardTitle>
                            <Badge 
                              variant="outline" 
                              className={`${sentimentConfig.color} border-current`}
                            >
                              <SentimentIcon className="h-3 w-3 mr-1" />
                              {sentimentConfig.label}
                            </Badge>
                          </div>
                          <CardDescription>
                            {summary.articleCount} bài viết • {REGIONS[summary.region as keyof typeof REGIONS]}
                          </CardDescription>
                        </div>
                        <SentimentIcon className={`h-8 w-8 ${sentimentConfig.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className={`text-base leading-relaxed ${sentimentConfig.color} font-medium`}>
                        {summary.summary}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
