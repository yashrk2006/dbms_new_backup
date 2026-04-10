@echo off
echo [SkillSync] Initiating Build Recovery Protocol...
echo.
echo 1. Clearing Turbopack Cache...
if exist .next rmdir /s /q .next
echo 2. Resetting TypeScript Build Info...
if exist tsconfig.tsbuildinfo del tsconfig.tsbuildinfo
echo.
echo [SkillSync] Seeding Intelligent Recruitment Ecosystem...
node setup-db.mjs
node seed-corporate-directory.mjs
node seed-internships.mjs
node seed-full-demo.mjs

echo [SkillSync] Build Assets Purged & Data Seeded. 
echo [SkillSync] Launching Development Server (Standard Engine)...
echo.
npm run dev
