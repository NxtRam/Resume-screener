# AI Resume Screener

A powerful, full-stack application designed to streamline the recruitment process by leveraging Artificial Intelligence to screen resumes against job descriptions. This tool assists recruiters in identifying top talent efficiently while providing candidates with transparency regarding their application status.

## 🚀 Features

- **AI-Powered Resume Analysis**: 
  - Utilizes **Google Gemini AI** to generate embeddings and analyze resumes processing content semantically.
  - Generates a **Match Score** and **Similarity Score** for each application against the specific job description.
  - Provides detailed feedback including **Strengths** and **Areas for Improvement**.

- **Smart Resume Parsing**:
  - robust file handling for **PDF** and **DOCX** formats.
  - Integrated **OCR** (Optical Character Recognition) using Tesseract.js for scanned documents.

- **Recruiter Dashboard**:
  - **Job Management**: Create, update, and manage job postings.
  - **Application Tracking**: View all applications for a specific job, filtered by their analysis scores.
  - **Status Updates**: Easily update the status of an application (e.g., Interview, Offer, Rejected).

- **Candidate Experience**:
  - **Status Check**: A dedicated page for candidates to check their application status using their Application ID and Email without needing to log in.
  - **Interactive UI**: A modern, responsive interface built with React and Tailwind CSS, featuring smooth animations with Framer Motion.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) + [TanStack Query](https://tanstack.com/query/latest)
- **Routing**: [React Router](https://reactrouter.com/en/main)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Visualization**: [Recharts](https://recharts.org/en-US/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/en)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **AI/LLM**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **File Parsing**: 
  - `pdf2json`, `pdf-parse-fixed` (PDFs)
  - `mammoth` (DOCX)
  - `tesseract.js` (OCR)
- **File Uploads**: `multer`

## 📂 Project Structure

```
ai-resume-screener/
├── backend/                 # Node.js Express Server
│   ├── config/              # Configuration (Supabase, etc.)
│   ├── controllers/         # API Controllers (Resume processing, Job mgmt)
│   ├── utils/               # Utility functions (Text extraction)
│   ├── server.js            # Entry point
│   └── package.json         # Backend dependencies
│
└── frontend/                # React Vite Application
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── contexts/        # React Contexts (Auth, Toast)
    │   ├── hooks/           # Custom React Hooks
    │   ├── pages/           # Application Pages (Dashboard, Home, Login)
    │   └── stores/          # Zustand State Stores
    ├── index.html           # HTML Entry point
    └── package.json         # Frontend dependencies
```

## ⚡ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for Database & Auth)
- Google Cloud API Key (for Gemini)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/santrupt29/ai-resume-screener.git
    cd ai-resume-screener
    ```

2.  **Setup the Backend**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory with the following variables:
    ```env
    PORT=3000
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
    OCR_SPACE_API_KEY=your_ocr_key # Optional, if using OCR Space
    PUBLIC_URL=http://localhost:5173
    ```
    Start the server:
    ```bash
    npm start
    ```

3.  **Setup the Frontend**
    Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    npm install
    ```
    Create a `.env` file in the `frontend` directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_API_URL=http://localhost:3000/api
    ```
    Start the development server:
    ```bash
    npm run dev
    ```

4.  **Access the Application**
    Open your browser and navigate to `http://localhost:5173`

## 🔒 Security
- **Authentication**: Secure user authentication provided by Supabase.
- **Data Privacy**: Resume data is stored securely in Supabase Storage.
- **CORS Protection**: Backend is configured to only accept requests from allowed origins.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
