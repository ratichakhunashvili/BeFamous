// Badge collections (Figma 18, 19, 47–50) and challenge rewards (22/23). Georgian copy verbatim.
// Rules: "challenges" = completed challenges in the collection's interest; "streak" = days in a row.
import type { BadgeRule } from "../src/db/schema";

type Level = { nameKa: string; nameEn: string; xp: number; ka: string; en: string; rule: BadgeRule };
type Collection = {
  slug: string; nameKa: string; nameEn: string; subtitleKa: string; subtitleEn: string; bonusKa: string; bonusEn: string;
  icon: string; heroUrl?: string; coverArt?: { icon: string; kicker: string; label: string }; interest?: string; levels: Level[];
};

const c = (count: number): BadgeRule => ({ type: "challenges", count });
const s = (days: number): BadgeRule => ({ type: "streak", days });

export const badgeSeed: Collection[] = [
  {
    slug: "street-to-catwalk", nameKa: "Street to Catwalk", nameEn: "Street to Catwalk",
    subtitleKa: "რითეილი და მოდა", subtitleEn: "Retail & fashion",
    bonusKa: "VIP ფასდაკლება და ექსკლუზიური კოლექცია", bonusEn: "VIP discount and an exclusive collection",
    icon: "/figma/icon-fashion.svg", heroUrl: "/figma/fashion-media.jpg", interest: "fashion",
    levels: [
      { nameKa: "Window Shopper", nameEn: "Window Shopper", xp: 100, ka: "1 მარტივი ჩელენჯის შემოწმება ან მაღაზიაში ვიზიტი", en: "1 simple challenge or a store visit", rule: c(1) },
      { nameKa: "Fitting Room Rookie", nameEn: "Fitting Room Rookie", xp: 500, ka: "3 სტილის ჩელენჯი გამოსაცვლელი ოთახიდან", en: "3 style challenges from the fitting room", rule: c(3) },
      { nameKa: "Trendsetter", nameEn: "Trendsetter", xp: 1500, ka: "7 კრეატიული აუთფიტის ვიდეო ტრენდული მუსიკით", en: "7 creative outfit videos with trending music", rule: c(7) },
      { nameKa: "Runway Icon", nameEn: "Runway Icon", xp: 3500, ka: "15+ მაღალი ჩართულობის მოდური ჩელენჯი", en: "15+ high-engagement fashion challenges", rule: c(15) },
    ],
  },
  {
    slug: "flavor-legend", nameKa: "Flavor Legend", nameEn: "Flavor Legend",
    subtitleKa: "კულინარია და კაფეები", subtitleEn: "Food & cafés",
    bonusKa: "უფასო ვახშამი ან ყავა თვეში ერთხელ", bonusEn: "A free dinner or coffee once a month",
    icon: "/figma/icon-coffee.svg", heroUrl: "/figma/coffee-hero.jpg", interest: "cafes",
    levels: [
      { nameKa: "Crumb Hunter", nameEn: "Crumb Hunter", xp: 100, ka: "პირველი საიდუმლო შეკვეთა ან 1 კაფეს ჩელენჯი", en: "First secret order or 1 café challenge", rule: c(1) },
      { nameKa: "Foodie Explorer", nameEn: "Foodie Explorer", xp: 450, ka: "3 სხვადასხვა კერძის ან სასმლის ASMR / ემოციური რევიუ", en: "3 ASMR / emotional reviews of different dishes or drinks", rule: c(3) },
      { nameKa: "Taste Critic", nameEn: "Taste Critic", xp: 1200, ka: "8 კულინარიული ჩელენჯი მაღალი ნახვებით", en: "8 food challenges with high views", rule: c(8) },
      { nameKa: "Master Chef Advocate", nameEn: "Master Chef Advocate", xp: 3000, ka: "საფირმო რეცეპტების 12+ კრეატიული რეკრეაცია", en: "12+ creative recreations of signature recipes", rule: c(12) },
    ],
  },
  {
    slug: "cyber-evolution", nameKa: "Cyber Evolution", nameEn: "Cyber Evolution",
    subtitleKa: "ტექნიკა და გაჯეტები", subtitleEn: "Tech & gadgets",
    bonusKa: "ახალი გაჯეტების Mystery Box", bonusEn: "A Mystery Box of new gadgets",
    icon: "/figma/icon-tech.svg", coverArt: { icon: "tech", kicker: "TECH CHALLENGE", label: "CYBER EVOLUTION" }, interest: "tech",
    levels: [
      { nameKa: "Plug & Play", nameEn: "Plug & Play", xp: 100, ka: "სეტაპის ან გაჯეტის 1 ფოტო / ვიდეო", en: "1 photo / video of your setup or gadget", rule: c(1) },
      { nameKa: "Speedrunner", nameEn: "Speedrunner", xp: 500, ka: "3 სწრაფი 15-წამიანი ლაიფჰაკი", en: "3 quick 15-second life hacks", rule: c(3) },
      { nameKa: "Tech Geek", nameEn: "Tech Geek", xp: 1500, ka: "7 სიღრმისეული მიმოხილვა ან ფუნქციური ტესტი", en: "7 in-depth reviews or function tests", rule: c(7) },
      { nameKa: "Cyber Overlord", nameEn: "Cyber Overlord", xp: 4000, ka: "15+ ტექნოლოგიური ჩელენჯის წარმატებით დახურვა", en: "15+ tech challenges completed", rule: c(15) },
    ],
  },
  {
    slug: "glow-mastery", nameKa: "Glow Mastery", nameEn: "Glow Mastery",
    subtitleKa: "სილამაზე და მოვლა", subtitleEn: "Beauty & care",
    bonusKa: "Beauty Box და VIP ტესტერის სტატუსი", bonusEn: "Beauty Box and VIP tester status",
    icon: "/figma/icon-beauty.svg", heroUrl: "/figma/beauty-media.jpg", interest: "beauty",
    levels: [
      { nameKa: "Fresh Face", nameEn: "Fresh Face", xp: 100, ka: "1 Unboxing ან პირველი შთაბეჭდილების ვიდეო", en: "1 unboxing or first-impression video", rule: c(1) },
      { nameKa: "Magic Switcher", nameEn: "Magic Switcher", xp: 400, ka: "3 Before & After ტრანსფორმაცია", en: "3 before & after transformations", rule: c(3) },
      { nameKa: "Glow Guru", nameEn: "Glow Guru", xp: 1300, ka: "7 სრული მაკიაჟის ან მოვლის ტუტორიალი", en: "7 full make-up or care tutorials", rule: c(7) },
      { nameKa: "Beauty Goddess", nameEn: "Beauty Goddess", xp: 3200, ka: "14+ ბრენდული ბიუთი ჩელენჯი", en: "14+ branded beauty challenges", rule: c(14) },
    ],
  },
  {
    slug: "streak-mastery", nameKa: "Streak Mastery", nameEn: "Streak Mastery",
    subtitleKa: "ზოგადი აქტივობა და სერიები", subtitleEn: "General activity & streaks",
    bonusKa: "2× XP მულტიპლიკატორი ერთი თვით", bonusEn: "2× XP multiplier for one month",
    icon: "/figma/icon-flame-20.svg", coverArt: { icon: "camera", kicker: "CREATE / SHARE / EARN", label: "MAKE IT YOURS." },
    levels: [
      { nameKa: "Spark", nameEn: "Spark", xp: 150, ka: "3 დღე ზედიზედ მინიმუმ 1 ჩელენჯში მონაწილეობა", en: "Take part in at least 1 challenge 3 days in a row", rule: s(3) },
      { nameKa: "Flame", nameEn: "Flame", xp: 500, ka: "7 დღე ზედიზედ აქტიურობა", en: "Active 7 days in a row", rule: s(7) },
      { nameKa: "Inferno", nameEn: "Inferno", xp: 1500, ka: "14 დღე უწყვეტი ჩელენჯინგ-სტრიკი", en: "A 14-day unbroken challenge streak", rule: s(14) },
      { nameKa: "Unstoppable Titan", nameEn: "Unstoppable Titan", xp: 4500, ka: "1 თვე ზედიზედ ყოველდღიური ჩელენჯები", en: "Daily challenges for a month in a row", rule: s(30) },
    ],
  },
];

/** One reward per challenge, issued as a voucher when the challenge is completed. */
export const rewardSeed = [
  { challenge: "secret-coffee-moment", titleKa: "50 ₾ ყავის ვაუჩერი", titleEn: "50 ₾ coffee voucher", brand: "ქარხანა Coffee", valueGel: 50 },
  { challenge: "street-to-catwalk", titleKa: "40 ₾ ვაუჩერი", titleEn: "40 ₾ voucher", brand: "Tbilisi Streetwear", valueGel: 40 },
  { challenge: "cyber-evolution", titleKa: "ტექნიკის Mystery Box", titleEn: "Tech Mystery Box", brand: "Studio Lab", valueGel: null },
  { challenge: "glow-mastery", titleKa: "Beauty Box", titleEn: "Beauty Box", brand: "Glow Studio", valueGel: null },
].map((r) => ({ ...r, expiresAt: new Date("2026-11-30T23:59:59+04:00") }));
