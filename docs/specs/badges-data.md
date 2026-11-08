# Badge seed data — 5 collections x 4 levels (from Figma 18, 19, 47-51)
Level label format in UI: `დონე 0N   ·   {XP} XP` (XP with comma thousands). Demo state in Figma for every collection: level 1 received, level 2 current (`პირობის ნახვა` → 51), levels 3-4 locked; progress `1 / 4` (25%). Level 5/lock copy (51) is generic, no per-level text.

## Collections
| slug | name | subtitle (Georgian) | screen | hero | final bonus (`ბოლო დონის ბონუსი`) |
|---|---|---|---|---|---|
| street-to-catwalk | Street to Catwalk | რითეილი და მოდა | 47 | photo /figma/fashion-media.jpg | VIP ფასდაკლება და ექსკლუზიური კოლექცია |
| flavor-legend | Flavor Legend | კულინარია და კაფეები | 19 | photo /figma/coffee-media.jpg | უფასო ვახშამი ან ყავა თვეში ერთხელ |
| cyber-evolution | Cyber Evolution | ტექნიკა და გაჯეტები | 48 | drawn card, icon-tech-32, `TECH CHALLENGE` / `CYBER EVOLUTION` | ახალი გაჯეტების Mystery Box |
| glow-mastery | Glow Mastery | სილამაზე და მოვლა | 49 | photo /figma/beauty-media.jpg | Beauty Box და VIP ტესტერის სტატუსი |
| streak-mastery | Streak Mastery | ზოგადი აქტივობა და სერიები | 50 | drawn card, icon-camera, `CREATE / SHARE / EARN` / `MAKE IT YOURS.` | 2× XP მულტიპლიკატორი ერთი თვით |

List card icons (18): fashion, coffee, tech, beauty, flame (20px). List caption: `{subtitle} · 4 დონე`.

## Levels
| collection | lvl | name | XP | condition text |
|---|---|---|---|---|
| street-to-catwalk | 1 | Window Shopper | 100 | 1 მარტივი ჩელენჯის შემოწმება ან მაღაზიაში ვიზიტი |
| street-to-catwalk | 2 | Fitting Room Rookie | 500 | 3 სტილის ჩელენჯი გამოსაცვლელი ოთახიდან |
| street-to-catwalk | 3 | Trendsetter | 1,500 | 7 კრეატიული აუთფიტის ვიდეო ტრენდული მუსიკით |
| street-to-catwalk | 4 | Runway Icon | 3,500 | 15+ მაღალი ჩართულობის მოდური ჩელენჯი |
| flavor-legend | 1 | Crumb Hunter | 100 | პირველი საიდუმლო შეკვეთა ან 1 კაფეს ჩელენჯი |
| flavor-legend | 2 | Foodie Explorer | 450 | 3 სხვადასხვა კერძის ან სასმლის ASMR / ემოციური რევიუ |
| flavor-legend | 3 | Taste Critic | 1,200 | 8 კულინარიული ჩელენჯი მაღალი ნახვებით |
| flavor-legend | 4 | Master Chef Advocate | 3,000 | საფირმო რეცეპტების 12+ კრეატიული რეკრეაცია |
| cyber-evolution | 1 | Plug & Play | 100 | სეტაპის ან გაჯეტის 1 ფოტო / ვიდეო |
| cyber-evolution | 2 | Speedrunner | 500 | 3 სწრაფი 15-წამიანი ლაიფჰაკი |
| cyber-evolution | 3 | Tech Geek | 1,500 | 7 სიღრმისეული მიმოხილვა ან ფუნქციური ტესტი |
| cyber-evolution | 4 | Cyber Overlord | 4,000 | 15+ ტექნოლოგიური ჩელენჯის წარმატებით დახურვა |
| glow-mastery | 1 | Fresh Face | 100 | 1 Unboxing ან პირველი შთაბეჭდილების ვიდეო |
| glow-mastery | 2 | Magic Switcher | 400 | 3 Before & After ტრანსფორმაცია |
| glow-mastery | 3 | Glow Guru | 1,300 | 7 სრული მაკიაჟის ან მოვლის ტუტორიალი |
| glow-mastery | 4 | Beauty Goddess | 3,200 | 14+ ბრენდული ბიუთი ჩელენჯი |
| streak-mastery | 1 | Spark | 150 | 3 დღე ზედიზედ მინიმუმ 1 ჩელენჯში მონაწილეობა |
| streak-mastery | 2 | Flame | 500 | 7 დღე ზედიზედ აქტიურობა |
| streak-mastery | 3 | Inferno | 1,500 | 14 დღე უწყვეტი ჩელენჯინგ-სტრიკი |
| streak-mastery | 4 | Unstoppable Titan | 4,500 | 1 თვე ზედიზედ ყოველდღიური ჩელენჯები |

Sources: 47-50 specs (docs/specs/47-50.md) and 19 (Figma 87:7891). Level states per user are dynamic (received / current / locked) — only level 1 is shown received in the design.
Locked-level info screen (51) copy: title `შემდეგი დონე დაბლოკილია`; body `მიმდინარე კოლექციაში შეასრულე მოთხოვნილი მისიები. პროგრესი აისახება დადასტურების შემდეგ.`; buttons `კოლექციაზე დაბრუნება` / `აღმოაჩინე ჩელენჯები`.
