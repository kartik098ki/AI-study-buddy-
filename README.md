AI Study Buddy 🧠

An AI-powered intelligent learning platform that helps students automatically analyze documents, generate summaries, create flashcards, and build quizzes.
Features

📄 Document Upload: Supports PDF and TXT uploads with automatic parsing
📝 AI Summarization: Generates intelligent content summaries using the Google Gemini API
🎴 Flashcard Generation: Automatically creates study flashcards with difficulty levels
📋 Quiz Generation: Creates multiple-choice questions to test comprehension
📚 Resource Management: Organize and manage all your study materials easily

Tech Stack

Frontend: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
Backend: Next.js API Routes + ZAI Web Dev SDK
AI Service: Google Gemini API (via ZAI SDK)
Document Processing: pdf-parse for PDF file parsing

API Endpoints
1. Document Processing
POST /api/process-document
Content-Type: multipart/form-data
Body: FormData with 'file' field
2. Generate Summary
POST /api/generate-summary
Content-Type: application/json
Body: { "content": "text content" }
3. Generate Flashcards
POST /api/generate-flashcards
Content-Type: application/json
Body: { "content": "text content", "summary": "summary text" }
4. Generate Quiz
POST /api/generate-quiz
Content-Type: application/json
Body: { "content": "text content", "summary": "summary text" }

How to Use
Upload a Document: Go to the “Add Resources” tab on the main page
Choose Input Method:
Upload a PDF or TXT file
Paste text directly
AI Processing: The system automatically generates summaries, flashcards, and quizzes
View Resources: Access all learning materials in “My Resources”
Study Mode: Use “Study Mode” for focused learning sessions
Security
Google Gemini API keys are securely stored on the server
The frontend has no direct access to API keys
All AI requests are proxied through the backend for safety
Testing
Visit the /test.html page to test all API features with sample content and verify AI-generated outputs.

Project Structure
src/
├── app/
│   ├── page.tsx                 # Main page
│   ├── api/
│   │   ├── process-document/    # Document processing API
│   │   ├── generate-summary/    # Summary generation API
│   │   ├── generate-flashcards/ # Flashcard generation API
│   │   └── generate-quiz/       # Quiz generation API
│   └── globals.css
├── components/ui/               # shadcn/ui components
└── lib/                         # Utility libraries

Development
Run npm run dev to start the development server
Run npm run lint to check code quality
API keys are already configured in the ZAI SDK, ensuring smooth backend operation
Future Features
 Support for more document formats (DOC, DOCX)
 User account system
 Learning progress tracking
