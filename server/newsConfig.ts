/**
 * Cấu hình thu thập tin tức
 */

export interface NewsSource {
  name: string;
  url: string;
  rss: string | null;
  encoding: string;
}

export const NEWS_SOURCES_BY_REGION: Record<string, NewsSource[]> = {
  vietnam: [
  {
    name: 'CafeF',
    url: 'https://cafef.vn',
    rss: 'https://cafef.vn/thi-truong-chung-khoan.rss',
    encoding: 'utf-8'
  },
  {
    name: 'VietStock',
    url: 'https://vietstock.vn',
    rss: 'https://vietstock.vn/rss/tai-chinh.rss',
    encoding: 'utf-8'
  },
  {
    name: 'VnExpress Kinh Doanh',
    url: 'https://vnexpress.net/kinh-doanh',
    rss: 'https://vnexpress.net/rss/kinh-doanh.rss',
    encoding: 'utf-8'
  },
  {
    name: 'Báo Đầu Tư',
    url: 'https://baodautu.vn',
    rss: 'https://baodautu.vn/rss/tai-chinh.rss',
    encoding: 'utf-8'
  },
    {
      name: 'Thời báo Tài chính',
      url: 'https://thoibaotaichinhvietnam.vn',
      rss: null,
      encoding: 'utf-8'
    }
  ],
  
  us: [
    {
      name: 'BBC Business',
      url: 'https://www.bbc.com/news/business',
      rss: 'https://feeds.bbci.co.uk/news/business/rss.xml',
      encoding: 'utf-8'
    },
    {
      name: 'NPR Business',
      url: 'https://www.npr.org/sections/business/',
      rss: 'https://feeds.npr.org/1006/rss.xml',
      encoding: 'utf-8'
    },
    {
      name: 'The Guardian Business',
      url: 'https://www.theguardian.com/business',
      rss: 'https://www.theguardian.com/business/rss',
      encoding: 'utf-8'
    },
    {
      name: 'Al Jazeera Economy',
      url: 'https://www.aljazeera.com/economy/',
      rss: 'https://www.aljazeera.com/xml/rss/all.xml',
      encoding: 'utf-8'
    }
  ],
  
  china: [
    {
      name: 'BBC China',
      url: 'https://www.bbc.com/news/world/asia/china',
      rss: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml',
      encoding: 'utf-8'
    },
    {
      name: 'The Guardian China',
      url: 'https://www.theguardian.com/world/china',
      rss: 'https://www.theguardian.com/world/china/rss',
      encoding: 'utf-8'
    },
    {
      name: 'Al Jazeera China',
      url: 'https://www.aljazeera.com/china/',
      rss: 'https://www.aljazeera.com/xml/rss/all.xml',
      encoding: 'utf-8'
    }
  ]
};

export const NEWS_SOURCES: NewsSource[] = [
  ...NEWS_SOURCES_BY_REGION.vietnam,
  ...NEWS_SOURCES_BY_REGION.us,
  ...NEWS_SOURCES_BY_REGION.china
];

// Từ khóa theo khu vực
export const KEYWORDS_BY_REGION: Record<string, string[]> = {
  vietnam: [
  // Dư nợ cho vay margin
  'dư nợ margin', 'cho vay margin', 'margin lending', 'dư nợ cho vay ký quỹ',
  'ký quỹ chứng khoán', 'margin call', 'tỷ lệ ký quỹ', 'cho vay ký quỹ',
  'công ty chứng khoán', 'ctck', 'dư nợ ctck',
  
  // Lãi suất
  'lãi suất', 'lãi suất cho vay', 'lãi suất huy động', 'lãi suất ngân hàng',
  'lãi suất liên ngân hàng', 'lãi suất điều hành', 'lãi suất tái cấp vốn',
  'lãi suất chiết khấu', 'lãi suất tín phiếu', 'lãi suất cơ bản',
  'interest rate', 'lending rate', 'deposit rate',
  
  // Ngân hàng Nhà nước (NHNN)
  'ngân hàng nhà nước', 'nhnn', 'sbv', 'state bank of vietnam',
  'thống đốc ngân hàng', 'nguyễn thị hồng', 'chính sách tiền tệ',
  'điều hành tiền tệ', 'nghiệp vụ thị trường mở', 'tín phiếu kho bạc',
  'tín phiếu nhnn', 'tái cấp vốn', 'chiết khấu', 'dự trữ bắt buộc',
  'thanh khoản ngân hàng', 'cung ứng tiền tệ',
  
  // Thanh tra/kiểm tra nhà nước
  'thanh tra', 'kiểm tra', 'thanh tra nhà nước', 'thanh tra chính phủ',
  'thanh tra tài chính', 'thanh tra ngân hàng', 'thanh tra chứng khoán',
  'kiểm toán nhà nước', 'sav', 'ủy ban chứng khoán', 'ssc',
  'xử phạt', 'vi phạm hành chính', 'cảnh cáo', 'đình chỉ hoạt động',
  'thu hồi giấy phép', 'phạt tiền', 'quyết định xử phạt',
  'kiểm tra đột xuất', 'thanh tra chuyên ngành',
  
  // Tỷ giá
  'tỷ giá', 'tỷ giá hối đoái', 'tỷ giá usd', 'tỷ giá vnd',
  'tỷ giá trung tâm', 'tỷ giá liên ngân hàng', 'tỷ giá ngân hàng',
  'exchange rate', 'usd/vnd', 'vnd/usd', 'đồng việt nam',
  'biến động tỷ giá', 'điều chỉnh tỷ giá', 'phá giá', 'tăng giá đồng nội tệ',
  
  // Lạm phát
  'lạm phát', 'cpi', 'chỉ số giá tiêu dùng', 'chỉ số giá',
  'inflation', 'consumer price index', 'tăng giá',
  'kiểm soát lạm phát', 'mục tiêu lạm phát', 'áp lực lạm phát',
  'lạm phát cơ bản', 'lạm phát lõi',
  
    // Các từ khóa bổ sung
    'chính sách vĩ mô', 'kinh tế vĩ mô', 'ổn định kinh tế vĩ mô',
    'thị trường tiền tệ', 'thị trường liên ngân hàng', 'thị trường mở',
    'dự trữ ngoại hối', 'cán cân thanh toán', 'gdp', 'tăng trưởng kinh tế'
  ],
  
  us: [
    // Trump và chính sách kinh tế
    'trump', 'donald trump', 'trump administration', 'trump policy',
    'trump economic policy', 'trump tariff', 'trump trade',
    'white house', 'president', 'executive order',
    'u.s.', 'united states', 'american', 'washington',
    
    // Vàng
    'gold', 'gold price', 'gold market', 'gold trading',
    'precious metal', 'gold reserve', 'bullion',
    
    // Ngân hàng và tài chính
    'federal reserve', 'fed', 'powell', 'central bank',
    'bank', 'financial', 'wall street', 'finance',
    'jpmorgan', 'goldman', 'citigroup', 'wells fargo',
    
    // Lãi suất
    'interest rate', 'rate', 'rate hike', 'rate cut',
    'monetary policy', 'treasury', 'bond', 'yield',
    
    // Chiến tranh thương mại
    'trade war', 'tariff', 'trade', 'export', 'import',
    
    // Việc làm
    'employment', 'unemployment', 'job', 'labor', 'wage', 'payroll'
  ],
  
  china: [
    // Lạm phát
    'inflation', 'cpi', 'deflation', 'price', 'china',
    
    // Sức khỏe nền kinh tế
    'china economy', 'chinese economy', 'economic', 'gdp',
    'growth', 'manufacturing', 'industrial', 'retail',
    
    // Chiến tranh thương mại
    'trade war', 'us-china', 'tariff', 'trade', 'export',
    
    // Chính trị cấp cao
    'xi jinping', 'xi', 'communist party', 'ccp',
    'beijing', 'chinese government', 'policy',
    
    // Bất động sản
    'real estate', 'property', 'housing', 'evergrande',
    
    // Tài chính
    'pboc', 'yuan', 'renminbi', 'currency', 'financial',
    'bank', 'debt', 'stock market', 'shanghai'
  ]
};

// Tất cả từ khóa
export const KEYWORDS: string[] = [
  ...KEYWORDS_BY_REGION.vietnam,
  ...KEYWORDS_BY_REGION.us,
  ...KEYWORDS_BY_REGION.china
];

// Danh mục chủ đề theo khu vực
export const CATEGORIES_BY_REGION: Record<string, Record<string, string>> = {
  vietnam: {
    MARGIN: 'Dư nợ Margin',
    INTEREST_RATE: 'Lãi suất',
    CENTRAL_BANK: 'Ngân hàng Nhà nước',
    INSPECTION: 'Thanh tra/Kiểm tra',
    EXCHANGE_RATE: 'Tỷ giá',
    INFLATION: 'Lạm phát'
  },
  us: {
    TRUMP: 'Trump & Chính sách',
    GOLD: 'Vàng',
    BANKING: 'Ngân hàng & Tài chính',
    INTEREST_RATE: 'Lãi suất',
    TRADE_WAR: 'Chiến tranh thương mại',
    EMPLOYMENT: 'Việc làm'
  },
  china: {
    INFLATION: 'Lạm phát',
    ECONOMY: 'Kinh tế',
    TRADE_WAR: 'Chiến tranh thương mại',
    POLITICS: 'Chính trị',
    REAL_ESTATE: 'Bất động sản',
    FINANCE: 'Tài chính'
  }
};

export const CATEGORIES = {
  ...CATEGORIES_BY_REGION.vietnam,
  ...CATEGORIES_BY_REGION.us,
  ...CATEGORIES_BY_REGION.china,
  OTHER: 'Khác'
};

// Xác định khu vực từ nguồn tin
export function getRegionFromSource(sourceName: string): string {
  for (const [region, sources] of Object.entries(NEWS_SOURCES_BY_REGION)) {
    if (sources.some(s => s.name === sourceName)) {
      return region;
    }
  }
  return 'vietnam';
}

// Phân loại từ khóa theo danh mục
export function categorizeByKeywords(matchedKeywords: string[], region: string = 'vietnam'): string {
  const keywords = matchedKeywords.map(k => k.toLowerCase());
  
  if (region === 'vietnam') {
    const marginKeywords = ['margin', 'ký quỹ', 'ctck', 'công ty chứng khoán'];
    const interestKeywords = ['lãi suất', 'interest rate'];
    const centralBankKeywords = ['ngân hàng nhà nước', 'nhnn', 'sbv', 'thống đốc'];
    const inspectionKeywords = ['thanh tra', 'kiểm tra', 'xử phạt', 'vi phạm'];
    const exchangeKeywords = ['tỷ giá', 'exchange rate', 'usd/vnd'];
    const inflationKeywords = ['lạm phát', 'cpi', 'inflation'];
    
    if (keywords.some(k => marginKeywords.some(mk => k.includes(mk)))) return CATEGORIES_BY_REGION.vietnam.MARGIN;
    if (keywords.some(k => interestKeywords.some(ik => k.includes(ik)))) return CATEGORIES_BY_REGION.vietnam.INTEREST_RATE;
    if (keywords.some(k => centralBankKeywords.some(ck => k.includes(ck)))) return CATEGORIES_BY_REGION.vietnam.CENTRAL_BANK;
    if (keywords.some(k => inspectionKeywords.some(ik => k.includes(ik)))) return CATEGORIES_BY_REGION.vietnam.INSPECTION;
    if (keywords.some(k => exchangeKeywords.some(ek => k.includes(ek)))) return CATEGORIES_BY_REGION.vietnam.EXCHANGE_RATE;
    if (keywords.some(k => inflationKeywords.some(ik => k.includes(ik)))) return CATEGORIES_BY_REGION.vietnam.INFLATION;
  } else if (region === 'us') {
    const trumpKeywords = ['trump', 'donald trump', 'white house', 'president trump'];
    const goldKeywords = ['gold', 'precious metal', 'bullion'];
    const bankingKeywords = ['federal reserve', 'fed', 'bank', 'financial institution', 'wall street', 'jpmorgan', 'goldman'];
    const interestKeywords = ['interest rate', 'fed rate', 'rate hike', 'rate cut'];
    const tradeWarKeywords = ['trade war', 'tariff', 'trade policy'];
    const employmentKeywords = ['employment', 'unemployment', 'job market', 'labor'];
    
    if (keywords.some(k => trumpKeywords.some(tk => k.includes(tk)))) return CATEGORIES_BY_REGION.us.TRUMP;
    if (keywords.some(k => goldKeywords.some(gk => k.includes(gk)))) return CATEGORIES_BY_REGION.us.GOLD;
    if (keywords.some(k => bankingKeywords.some(bk => k.includes(bk)))) return CATEGORIES_BY_REGION.us.BANKING;
    if (keywords.some(k => interestKeywords.some(ik => k.includes(ik)))) return CATEGORIES_BY_REGION.us.INTEREST_RATE;
    if (keywords.some(k => tradeWarKeywords.some(tk => k.includes(tk)))) return CATEGORIES_BY_REGION.us.TRADE_WAR;
    if (keywords.some(k => employmentKeywords.some(ek => k.includes(ek)))) return CATEGORIES_BY_REGION.us.EMPLOYMENT;
  } else if (region === 'china') {
    const inflationKeywords = ['inflation', 'cpi', 'deflation', 'ppi'];
    const economyKeywords = ['economy', 'gdp', 'growth', 'manufacturing', 'retail'];
    const tradeWarKeywords = ['trade war', 'us-china', 'tariff'];
    const politicsKeywords = ['xi jinping', 'communist party', 'ccp', 'politburo'];
    const realEstateKeywords = ['real estate', 'property', 'housing', 'evergrande'];
    const financeKeywords = ['pboc', 'yuan', 'renminbi', 'financial', 'bank', 'debt'];
    
    if (keywords.some(k => inflationKeywords.some(ik => k.includes(ik)))) return CATEGORIES_BY_REGION.china.INFLATION;
    if (keywords.some(k => economyKeywords.some(ek => k.includes(ek)))) return CATEGORIES_BY_REGION.china.ECONOMY;
    if (keywords.some(k => tradeWarKeywords.some(tk => k.includes(tk)))) return CATEGORIES_BY_REGION.china.TRADE_WAR;
    if (keywords.some(k => politicsKeywords.some(pk => k.includes(pk)))) return CATEGORIES_BY_REGION.china.POLITICS;
    if (keywords.some(k => realEstateKeywords.some(rk => k.includes(rk)))) return CATEGORIES_BY_REGION.china.REAL_ESTATE;
    if (keywords.some(k => financeKeywords.some(fk => k.includes(fk)))) return CATEGORIES_BY_REGION.china.FINANCE;
  }
  
  return CATEGORIES.OTHER;
}

