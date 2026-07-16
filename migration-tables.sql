-- IELTS Task 1 table bank: schema + 21 tables (idempotent)

CREATE TABLE IF NOT EXISTS "TableTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "tableMarkdown" TEXT NOT NULL,
    "featuredFor" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TableTopic_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TableTopic_featuredFor_idx" ON "TableTopic"("featuredFor");

ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "tableTopicId" TEXT;
CREATE INDEX IF NOT EXISTS "Journal_tableTopicId_idx" ON "Journal"("tableTopicId");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Journal_tableTopicId_fkey'
  ) THEN
    ALTER TABLE "Journal" ADD CONSTRAINT "Journal_tableTopicId_fkey"
      FOREIGN KEY ("tableTopicId") REFERENCES "TableTopic"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Annual revenue of five retail chains in Indonesia (2020–2024, in billion IDR)', 'Retail', '| Chain | 2020 | 2021 | 2022 | 2023 | 2024 |
|---|---|---|---|---|---|
| Alfamart | 85 | 92 | 101 | 110 | 125 |
| Indomaret | 88 | 95 | 105 | 118 | 130 |
| Transmart | 40 | 38 | 42 | 47 | 50 |
| Ace Hardware | 15 | 17 | 19 | 22 | 26 |
| Matahari | 30 | 25 | 28 | 32 | 35 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Annual revenue of five retail chains in Indonesia (2020–2024, in billion IDR)');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Number of store branches opened by four e-commerce retailers in five cities', 'Retail', '| Retailer | Jakarta | Surabaya | Bandung | Medan | Makassar |
|---|---|---|---|---|---|
| Shopee | 12 | 8 | 6 | 4 | 3 |
| Tokopedia | 10 | 7 | 5 | 4 | 2 |
| Lazada | 9 | 6 | 4 | 3 | 2 |
| Blibli | 7 | 5 | 3 | 2 | 1 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Number of store branches opened by four e-commerce retailers in five cities');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Customer satisfaction ratings (out of 10) for four supermarket chains across three regions', 'Retail', '| Chain | Java | Sumatra | Kalimantan |
|---|---|---|---|
| Superindo | 8.2 | 7.5 | 7.8 |
| Hypermart | 7.9 | 7.2 | 7.0 |
| Giant | 6.8 | 6.5 | 6.2 |
| Farmers Market | 8.5 | 8.0 | 7.9 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Customer satisfaction ratings (out of 10) for four supermarket chains across three regions');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Market share of retail categories (%): 2019, 2022, and 2024', 'Retail', '| Category | 2019 | 2022 | 2024 |
|---|---|---|---|
| Fashion | 35 | 31 | 28 |
| Electronics | 25 | 29 | 32 |
| Groceries | 32 | 30 | 29 |
| Home & Living | 8 | 10 | 11 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Market share of retail categories (%): 2019, 2022, and 2024');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Monthly sales of a retail company by channel (billion IDR, 6 months)', 'Retail', '| Month | Online | Offline | Marketplace |
|---|---|---|---|
| Jan | 12 | 20 | 8 |
| Feb | 13 | 19 | 9 |
| Mar | 15 | 18 | 10 |
| Apr | 18 | 17 | 12 |
| May | 20 | 16 | 14 |
| Jun | 23 | 15 | 16 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Monthly sales of a retail company by channel (billion IDR, 6 months)');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Return on Equity (ROE) of four major Indonesian banks (2021–2025, %)', 'Banking', '| Bank | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| BCA | 17.4 | 18.0 | 18.5 | 19.2 | 19.8 |
| BRI | 16.8 | 17.5 | 18.0 | 17.2 | 16.5 |
| Mandiri | 15.2 | 16.8 | 18.1 | 19.5 | 20.1 |
| BNI | 12.5 | 13.8 | 14.6 | 15.0 | 15.4 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Return on Equity (ROE) of four major Indonesian banks (2021–2025, %)');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Non-Performing Loan (NPL) ratio of five banks across three countries (%)', 'Banking', '| Bank | Country | NPL 2023 | NPL 2024 |
|---|---|---|---|
| Bank A | Indonesia | 2.6 | 2.4 |
| Bank B | Indonesia | 3.4 | 3.1 |
| Bank C | Malaysia | 2.0 | 1.8 |
| Bank D | Thailand | 3.2 | 2.9 |
| Bank E | Malaysia | 2.5 | 2.2 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Non-Performing Loan (NPL) ratio of five banks across three countries (%)');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Total assets of the top five banks in Southeast Asia (USD billion): 2020, 2022, 2025', 'Banking', '| Bank | 2020 | 2022 | 2025 |
|---|---|---|---|
| BCA | 70 | 82 | 95 |
| Maybank | 180 | 195 | 210 |
| DBS | 550 | 620 | 700 |
| BRI | 140 | 165 | 190 |
| CIMB | 150 | 160 | 175 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Total assets of the top five banks in Southeast Asia (USD billion): 2020, 2022, 2025');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Number of digital banking users for four banks (millions, 2021–2025)', 'Banking', '| Bank | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| BCA (BCA mobile) | 20 | 24 | 28 | 33 | 38 |
| BRI (BRImo) | 15 | 19 | 24 | 30 | 36 |
| Mandiri (Livin'') | 12 | 16 | 21 | 27 | 33 |
| BNI (wondr by BNI) | 9 | 13 | 18 | 23 | 29 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Number of digital banking users for four banks (millions, 2021–2025)');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Net Interest Margin (NIM) by bank ownership type in Indonesia (%)', 'Banking', '| Year | State-owned | Private | Sharia |
|---|---|---|---|
| 2021 | 4.8 | 5.5 | 5.0 |
| 2022 | 5.0 | 5.6 | 5.2 |
| 2023 | 4.9 | 5.4 | 5.1 |
| 2024 | 4.7 | 5.2 | 4.9 |
| 2025 | 4.6 | 5.0 | 4.8 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Net Interest Margin (NIM) by bank ownership type in Indonesia (%)');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'GDP growth rate of five ASEAN countries (2021–2025, %)', 'Economy', '| Country | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| Indonesia | 3.7 | 5.3 | 5.0 | 5.1 | 5.0 |
| Vietnam | 2.6 | 8.0 | 5.1 | 6.2 | 6.5 |
| Philippines | 5.7 | 7.6 | 5.5 | 5.8 | 6.0 |
| Malaysia | 3.1 | 8.7 | 3.7 | 4.5 | 4.8 |
| Thailand | 1.5 | 2.6 | 1.9 | 2.5 | 3.0 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'GDP growth rate of five ASEAN countries (2021–2025, %)');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Inflation, unemployment, and BI interest rate in Indonesia (2021–2025, %)', 'Economy', '| Year | Inflation | Unemployment | BI Rate |
|---|---|---|---|
| 2021 | 1.9 | 6.5 | 3.50 |
| 2022 | 5.5 | 5.9 | 5.50 |
| 2023 | 3.6 | 5.3 | 6.00 |
| 2024 | 2.6 | 4.9 | 6.00 |
| 2025 | 2.8 | 4.6 | 5.75 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Inflation, unemployment, and BI interest rate in Indonesia (2021–2025, %)');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Foreign Direct Investment (FDI) inflows into four SEA countries (USD billion)', 'Economy', '| Country | 2021 | 2022 | 2023 | 2024 |
|---|---|---|---|---|
| Indonesia | 20 | 22 | 25 | 28 |
| Vietnam | 19 | 22 | 23 | 25 |
| Singapore | 99 | 141 | 160 | 175 |
| Malaysia | 12 | 15 | 17 | 19 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Foreign Direct Investment (FDI) inflows into four SEA countries (USD billion)');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Government spending by sector (% of GDP)', 'Economy', '| Sector | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| Education | 3.5 | 3.6 | 3.6 | 3.7 | 3.8 |
| Health | 2.8 | 3.0 | 2.9 | 3.1 | 3.2 |
| Infrastructure | 2.5 | 2.3 | 2.6 | 2.8 | 2.9 |
| Social Protection | 3.0 | 3.2 | 3.4 | 3.5 | 3.6 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Government spending by sector (% of GDP)');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Exchange rate of the Indonesian rupiah against three currencies (6 months)', 'Economy', '| Month | IDR/USD | IDR/SGD | IDR/EUR |
|---|---|---|---|
| Jan | 15,850 | 11,750 | 17,200 |
| Feb | 15,920 | 11,800 | 17,300 |
| Mar | 16,100 | 11,900 | 17,450 |
| Apr | 16,250 | 12,000 | 17,600 |
| May | 16,400 | 12,100 | 17,750 |
| Jun | 16,600 | 12,250 | 17,900 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Exchange rate of the Indonesian rupiah against three currencies (6 months)');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Internet, smartphone, and social media penetration in five countries (%)', 'Other', '| Country | Internet | Smartphone | Social Media |
|---|---|---|---|
| Indonesia | 78 | 89 | 72 |
| Vietnam | 80 | 85 | 75 |
| Philippines | 74 | 80 | 71 |
| Thailand | 85 | 91 | 78 |
| Malaysia | 89 | 93 | 81 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Internet, smartphone, and social media penetration in five countries (%)');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Number of new startups founded in four industries (2020–2025)', 'Other', '| Industry | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|
| Fintech | 45 | 60 | 75 | 68 | 72 | 80 |
| E-commerce | 38 | 50 | 65 | 55 | 58 | 62 |
| Edtech | 20 | 35 | 48 | 40 | 38 | 42 |
| Healthtech | 15 | 22 | 30 | 35 | 40 | 48 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Number of new startups founded in four industries (2020–2025)');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Renewable energy production by source in four countries (TWh)', 'Other', '| Country | Solar | Hydro | Wind | Geothermal |
|---|---|---|---|---|
| Indonesia | 5 | 20 | 2 | 15 |
| Vietnam | 15 | 25 | 10 | 0 |
| Philippines | 3 | 10 | 2 | 12 |
| Thailand | 8 | 5 | 3 | 0 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Renewable energy production by source in four countries (TWh)');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Weekly working hours, minimum wage, and annual leave in five countries', 'Other', '| Country | Weekly Hours | Min. Wage (USD/month) | Annual Leave (days) |
|---|---|---|---|
| Indonesia | 42 | 220 | 12 |
| Vietnam | 45 | 190 | 12 |
| Japan | 40 | 1,500 | 20 |
| Germany | 34 | 2,100 | 30 |
| United States | 38 | 1,600 | 10 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Weekly working hours, minimum wage, and annual leave in five countries');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Population growth, urbanization, and density of four major Indonesian cities', 'Other', '| City | Population Growth (%) | Urbanization (%) | Density (people/km²) |
|---|---|---|---|
| Jakarta | 1.1 | 100 | 15,900 |
| Surabaya | 0.9 | 95 | 8,500 |
| Bandung | 1.3 | 88 | 15,000 |
| Medan | 1.0 | 82 | 9,200 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Population growth, urbanization, and density of four major Indonesian cities');

INSERT INTO "TableTopic" ("id", "title", "category", "tableMarkdown")
SELECT gen_random_uuid()::text, 'Export value of Indonesia''s top five commodities (2021–2025, USD billion)', 'Other', '| Commodity | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| Palm Oil | 28 | 35 | 30 | 32 | 34 |
| Coal | 25 | 45 | 35 | 30 | 28 |
| Nickel products | 8 | 12 | 15 | 18 | 22 |
| Textiles | 12 | 13 | 12 | 13 | 14 |
| Rubber | 6 | 7 | 6 | 6 | 7 |'
WHERE NOT EXISTS (SELECT 1 FROM "TableTopic" WHERE "title" = 'Export value of Indonesia''s top five commodities (2021–2025, USD billion)');

