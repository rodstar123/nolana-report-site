import type { AgentName, SourceConfig } from "./types";

export const SOURCES: Record<AgentName, SourceConfig[]> = {
  "Agent 1": [
    {
      name: "Google News Business",
      url: "https://news.google.com/rss/search?q=%28%22McAllen%22+OR+%22RGV%22+OR+%22Edinburg%22+OR+%22Pharr%22+OR+%22Mission%22+OR+%22Weslaco%22%29+business&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "McAllen City",
      url: "https://news.google.com/rss/search?q=%22City+of+McAllen%22+council+OR+permit+OR+development&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "The Monitor",
      url: "https://news.google.com/rss/search?q=%22The+Monitor%22+McAllen+OR+RGV+OR+Edinburg&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    { name: "MyRGV", url: "https://myrgv.com/feed/", type: "rss" },
    {
      name: "Valley Business Report",
      url: "https://valleybusinessreport.com/feed/",
      type: "rss",
    },
    {
      name: "Texas Border Business",
      url: "https://texasborderbusiness.com/feed/",
      type: "rss",
    },
  ],

  "Agent 2": [
    {
      name: "GN Gov",
      url: "https://news.google.com/rss/search?q=%28%22McAllen%22+OR+%22RGV%22%29+%28%22city+council%22+OR+%22grant%22+OR+%22zoning%22+OR+%22economic+development%22%29&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "Federal Register API",
      url: "https://www.federalregister.gov/api/v1/articles.json?conditions%5Bterm%5D=Hidalgo+County+McAllen&fields%5B%5D=title&fields%5B%5D=abstract&fields%5B%5D=html_url&fields%5B%5D=publication_date&per_page=20",
      type: "json",
    },
    {
      name: "McAllen Agendas",
      url: "https://mcallen.net/government/city-council/agendas",
      type: "scraper",
    },
    {
      name: "Hidalgo County RSS",
      url: "https://www.hidalgocounty.us/RSSFeed.aspx?ModID=1",
      type: "rss",
    },
    {
      name: "McAllen EDC",
      url: "https://news.google.com/rss/search?q=%22McAllen+Economic+Development%22+OR+%22MEDC%22+McAllen+Texas&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "TX Comptroller",
      url: "https://public.govdelivery.com/topics/TXCOMPT_1/feed.rss",
      type: "rss",
    },
    {
      name: "Cameron County",
      url: "https://news.google.com/rss/search?q=%22Cameron+County%22+commissioners+OR+budget+OR+grant+Texas&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "City of Edinburg",
      url: "https://news.google.com/rss/search?q=%22City+of+Edinburg%22+council+OR+development+Texas&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "City of Pharr",
      url: "https://news.google.com/rss/search?q=%22City+of+Pharr%22+council+OR+development+Texas&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "City of Mission",
      url: "https://news.google.com/rss/search?q=%22City+of+Mission%22+Texas+council+OR+development&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "TWC RGV",
      url: "https://news.google.com/rss/search?q=site:twc.texas.gov+RGV+OR+%22Rio+Grande+Valley%22&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "LRGVDC",
      url: "https://news.google.com/rss/search?q=%22LRGVDC%22+OR+%22Lower+Rio+Grande+Valley+Development+Council%22&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
  ],

  "Agent 3": [
    {
      name: "CBP Bridge Waits",
      url: "https://bwt.cbp.gov/api/bwtnew",
      type: "json",
    },
    {
      name: "USD/MXN FX",
      url: "https://open.er-api.com/v6/latest/USD",
      type: "json",
    },
    {
      name: "Brownsville Herald",
      url: "https://news.google.com/rss/search?q=%22Brownsville+Herald%22+business+OR+trade+OR+investment&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "Rio Grande Guardian",
      url: "https://news.google.com/rss/search?q=site:riograndeguardian.com&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "RGV Business Journal",
      url: "https://www.rgvbusinessjournal.com/feed/",
      type: "rss",
    },
    {
      name: "Port of Brownsville",
      url: "https://www.portofbrownsville.com/feed/",
      type: "rss",
    },
    {
      name: "GN RGV Trade",
      url: "https://news.google.com/rss/search?q=%22Rio+Grande+Valley%22+OR+%22McAllen%22+OR+%22RGV%22+investment+OR+%22trade+zone%22+OR+nearshoring+OR+manufacturing&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
  ],

  "Agent 4": [
    {
      name: "Reddit r/RGV",
      url: "https://www.reddit.com/r/RGV.json?sort=new&limit=50",
      type: "json",
    },
    {
      name: "KRGV",
      url: "https://news.google.com/rss/search?q=site:krgv.com+RGV+business+OR+community&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "Eventbrite McAllen",
      url: "https://www.eventbrite.com/d/tx--mcallen/business/",
      type: "scraper",
    },
    {
      name: "old.reddit fallback",
      url: "https://old.reddit.com/r/rgv/new/",
      type: "scraper",
    },
    {
      name: "ValleyCentral",
      url: "https://www.valleycentral.com/feed/",
      type: "rss",
    },
    {
      name: "McAllen City News GN",
      url: "https://news.google.com/rss/search?q=McAllen+Texas+city+news+OR+community+event+OR+local+announcement&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
  ],

  "Agent 5": [
    {
      name: "Edinburg EDC",
      url: "https://news.google.com/rss/search?q=%22Edinburg+EDC%22+OR+%22Edinburg+Economic+Development%22+Texas&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "McAllen EDC",
      url: "https://news.google.com/rss/search?q=%22McAllen+EDC%22+OR+%22McAllen+Economic+Development%22&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "Pharr EDC",
      url: "https://news.google.com/rss/search?q=%22Pharr+EDC%22+OR+%22Pharr+Economic+Development%22&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "Mission EDC",
      url: "https://news.google.com/rss/search?q=%22Mission+EDC%22+OR+%22Mission+Economic+Development%22+Texas&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "Port of Brownsville",
      url: "https://news.google.com/rss/search?q=%22Port+of+Brownsville%22+OR+%22Brownsville+port%22&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "SpaceflightNow",
      url: "https://spaceflightnow.com/feed/",
      type: "rss",
    },
    {
      name: "Valley Business Report",
      url: "https://valleybusinessreport.com/feed/",
      type: "rss",
    },
    {
      name: "Texas Border Business",
      url: "https://texasborderbusiness.com/feed/",
      type: "rss",
    },
  ],
};

export function getSourceCount(): number {
  return Object.values(SOURCES).reduce((sum, arr) => sum + arr.length, 0);
}
