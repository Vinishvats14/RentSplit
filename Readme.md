🏠 RentSplit – Rent & Utility Split App

RentSplit is a full-stack MERN application designed to help roommates split rent and utilities easily.  
It supports expense receipts, monthly spending charts, and custom split ratios (50-30-20).  

🚀 Features

- 🧾 Upload expense receipts (Cloudinary + Multer)
- 📈 Monthly spending charts
- 🪙 Custom split ratios (50-30-20)
- 👥 Calculate balances between roommates
- 🔐 Secure authentication

 📦 Tech Stack

- Frontend: React (Vite), TailwindCSS  
- Backend: Node.js, Express.js  
- Database: MongoDB  
- File Uploads: Multer + Cloudinary  

## 🖼️ Screenshots

### 1️⃣ Dashboard View
![Dashboard Screenshot](./client/src/screenshots/dashboard.png)

### 2️⃣ Add Expense Page
![Expense Screenshot](./client/src/screenshots/add-expense.png)

### 3️⃣ Monthly Split Chart
![Chart Screenshot](./client/src/screenshots/monthly-chart.png)

### 4️⃣ Receipt Upload
![Receipt Screenshot](./client/src/screenshots/receipt-upload.png)


🔧 Setup Instructions

 1️⃣ Clone the Repository
```bash
git clone https://github.com/Vinishvats14/RentSplit.git
cd RentSplit

2️⃣ Install Dependencies
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

3️⃣ Setup Environment Variables
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

4️⃣ Run the App
Open two terminals (one for backend, one for frontend):
# Start backend (server/)
cd server
npm run dev
(first check your dependency script then use this command .Like
 "scripts": {
  "dev": "nodemon server.js" /// if nodemon is installed
  if no nodemon there then simply node server.js will run your code
}
)
# Start frontend (client/)
cd client
npm run dev

App will be live at:
👉 Frontend: http://localhost:5173
👉 Backend API: http://localhost:5000