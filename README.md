# Modern Wealth Planner 🚀

A premium, AI-powered personal finance and budget planning application designed to give you complete control over your wealth. Built with cutting-edge web technologies and autonomous AI agents.

## ✨ Features

- **📊 Smart Dashboard & Analytics**: Visualize your cash flow, track net balances, and see predictive trend lines of your monthly spending.
- **🤖 AI Budget Generator**: Tell the AI you're planning a "2-week trip to Lahore" or "Buying a new car", and it will automatically generate a realistic, itemized budget using **Mistral Large**.
- **🧾 AI Receipt Scanner (OCR)**: Upload images of your receipts or invoices, and our vision model (**Pixtral 12B**) will automatically extract the merchant name, date, and exact amount.
- **🔮 What-If Advisor**: A conversational AI advisor that analyzes your current spending and remaining budget to answer questions like, *"Can I afford a 150,000 PKR laptop this month?"*
- **📅 Subscription Tracking**: Keep track of your recurring monthly bills and subscriptions in one dedicated place.
- **🎯 Savings Goals**: Visually track your progress towards large purchases or emergency funds.
- **🌓 Gorgeous UI**: A fully responsive, modern design system with a seamless Dark/Light mode toggle.

## 🛠️ How It Was Built

This project was built from the ground up using **Claude** and **Antigravity** (Google Deepmind's Advanced Agentic Coding IDE). By pairing human direction with autonomous AI agents, complex features like database schemas, AI integrations, and responsive UI components were rapidly prototyped and refined.

### Technology Stack
- **Framework**: Next.js 14 (App Router, Server Components, Server Actions)
- **Database**: MongoDB Atlas (Raw MongoDB Driver)
- **Authentication**: Custom JWT-based Edge-compatible Auth (Bcrypt + Jose)
- **AI Integrations**: Mistral AI SDK (`mistral-large-latest` & `pixtral-12b`)
- **Styling**: Tailwind CSS & Next-Themes
- **Charts**: Recharts

## 🚀 Demo

The project is deployed and live. You can test the platform using the following demo credentials:

- **Email**: `admin@budgetplanner.local`
- **Password**: `AdminPassword123!`

## 💻 Local Setup

1. Clone the repository: `git clone https://github.com/Alyan-T/budget-planner.git`
2. Install dependencies: `npm install`
3. Configure your `.env.local` file with your `MONGODB_URI` and `MISTRAL_API_KEY`.
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)
