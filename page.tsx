'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  Brain, 
  Layers, 
  HelpCircle, 
  BookOpen, 
  Sparkles,
  CheckCircle,
  Loader2,
  Zap,
  Target,
  Trophy,
  Star,
  AlertCircle,
  Play,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Download,
  Share2,
  Heart,
  Flame,
  Rocket,
  Lightbulb,
  Map,
  Clock,
  Award,
  TrendingUp,
  Users,
  MessageSquare,
  Eye,
  EyeOff,
  Square
} from 'lucide-react'

interface LearningResource {
  id: string
  title: string
  type: 'pdf' | 'text' | 'link'
  content: string
  summary?: string
  flashcards?: Flashcard[]
  quiz?: QuizQuestion[]
  mindMap?: string
  createdAt: Date
  processingTime?: number
}

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: 'easy' | 'medium' | 'hard'
  mastered?: boolean
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  userAnswer?: number
}

export default function Home() {
  const [resources, setResources] = useState<LearningResource[]>([])
  const [activeTab, setActiveTab] = useState('upload')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [currentFlashcard, setCurrentFlashcard] = useState(0)
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<{ resource: LearningResource; questionIndex: number } | null>(null)
  const [quizScore, setQuizScore] = useState(0)
  const [showQuizResults, setShowQuizResults] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isReading, setIsReading] = useState(false)
  const [showMindMap, setShowMindMap] = useState(false)
  const [studyStreak, setStudyStreak] = useState(0)
  const [totalStudyTime, setTotalStudyTime] = useState(0)
  const [achievements, setAchievements] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Load saved data
  useEffect(() => {
    const savedStreak = localStorage.getItem('studyStreak')
    const savedTime = localStorage.getItem('totalStudyTime')
    const savedAchievements = localStorage.getItem('achievements')
    
    if (savedStreak) setStudyStreak(parseInt(savedStreak))
    if (savedTime) setTotalStudyTime(parseInt(savedTime))
    if (savedAchievements) setAchievements(JSON.parse(savedAchievements))
  }, [])

  const showError = (message: string) => {
    setError(message)
    setTimeout(() => setError(''), 5000)
  }

  const showSuccess = (message: string) => {
    setSuccess(message)
    setTimeout(() => setSuccess(''), 3000)
  }

  const unlockAchievement = (achievement: string) => {
    if (!achievements.includes(achievement)) {
      const newAchievements = [...achievements, achievement]
      setAchievements(newAchievements)
      localStorage.setItem('achievements', JSON.stringify(newAchievements))
      showSuccess(`🏆 Achievement Unlocked: ${achievement}!`)
    }
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
      setIsReading(true)
      utterance.onend = () => setIsReading(false)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsReading(false)
    }
  }

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setIsProcessing(true)
    setProcessingStep('🔍 Analyzing document...')
    setProgress(10)
    setError('')
    setSuccess('')

    const startTime = Date.now()

    try {
      const formData = new FormData()
      formData.append('file', file)

      setProgress(30)
      setProcessingStep('📄 Extracting text from PDF...')

      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process file')
      }

      const result = await response.json()
      
      setProgress(50)
      setProcessingStep('🤖 Generating AI summary...')

      const summaryResponse = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: result.content })
      })

      if (!summaryResponse.ok) {
        throw new Error('Failed to generate summary')
      }

      const summaryData = await summaryResponse.json()
      
      setProgress(70)
      setProcessingStep('🎴 Creating smart flashcards...')

      const flashcardResponse = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: result.content })
      })

      if (!flashcardResponse.ok) {
        throw new Error('Failed to generate flashcards')
      }

      const flashcardData = await flashcardResponse.json()

      setProgress(85)
      setProcessingStep('📋 Generating quiz questions...')

      const quizResponse = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: result.content })
      })

      if (!quizResponse.ok) {
        throw new Error('Failed to generate quiz')
      }

      const quizData = await quizResponse.json()

      setProgress(100)

      const processingTime = Date.now() - startTime

      const newResource: LearningResource = {
        id: Date.now().toString(),
        title: file.name,
        type: 'pdf',
        content: result.content,
        summary: summaryData.summary,
        flashcards: flashcardData.flashcards || [],
        quiz: quizData.quiz || [],
        mindMap: generateMindMap(summaryData.summary),
        createdAt: new Date(),
        processingTime
      }

      setResources(prev => [...prev, newResource])
      
      // Update stats and achievements
      setStudyStreak(prev => prev + 1)
      setTotalStudyTime(prev => prev + Math.floor(processingTime / 1000))
      localStorage.setItem('studyStreak', String(studyStreak + 1))
      localStorage.setItem('totalStudyTime', String(totalStudyTime + Math.floor(processingTime / 1000)))

      if (resources.length === 0) unlockAchievement('First Step')
      if (resources.length === 4) unlockAchievement('Knowledge Collector')
      if (processingTime < 10000) unlockAchievement('Speed Learner')

      showSuccess('🚀 Content processed successfully with AI!')
      
      setTimeout(() => {
        setIsProcessing(false)
        setProgress(0)
        setProcessingStep('')
        setSelectedFile(null)
        setActiveTab('resources')
      }, 1500)

    } catch (error: any) {
      console.error('Error processing file:', error)
      showError(error.message || 'Failed to process file')
      setIsProcessing(false)
      setProgress(0)
      setProcessingStep('')
      setSelectedFile(null)
    }
  }, [resources.length, studyStreak, totalStudyTime])

  const handleTextInput = useCallback(async () => {
    if (!textInput.trim()) return

    setIsProcessing(true)
    setProcessingStep('🤖 Processing with AI...')
    setProgress(20)
    setError('')
    setSuccess('')

    const startTime = Date.now()

    try {
      setProgress(40)
      setProcessingStep('📝 Generating summary...')

      const summaryResponse = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: textInput })
      })

      if (!summaryResponse.ok) {
        throw new Error('Failed to generate summary')
      }

      const summaryData = await summaryResponse.json()
      
      setProgress(60)
      setProcessingStep('🎴 Creating flashcards...')

      const flashcardResponse = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: textInput })
      })

      if (!flashcardResponse.ok) {
        throw new Error('Failed to generate flashcards')
      }

      const flashcardData = await flashcardResponse.json()

      setProgress(80)
      setProcessingStep('📋 Generating quiz...')

      const quizResponse = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: textInput })
      })

      if (!quizResponse.ok) {
        throw new Error('Failed to generate quiz')
      }

      const quizData = await quizResponse.json()

      setProgress(100)

      const processingTime = Date.now() - startTime

      const newResource: LearningResource = {
        id: Date.now().toString(),
        title: `Text Input - ${new Date().toLocaleDateString()}`,
        type: 'text',
        content: textInput,
        summary: summaryData.summary,
        flashcards: flashcardData.flashcards || [],
        quiz: quizData.quiz || [],
        mindMap: generateMindMap(summaryData.summary),
        createdAt: new Date(),
        processingTime
      }

      setResources(prev => [...prev, newResource])
      
      setStudyStreak(prev => prev + 1)
      setTotalStudyTime(prev => prev + Math.floor(processingTime / 1000))

      showSuccess('✨ Text processed successfully with AI!')
      
      setTimeout(() => {
        setIsProcessing(false)
        setProgress(0)
        setProcessingStep('')
        setTextInput('')
        setActiveTab('resources')
      }, 1500)

    } catch (error: any) {
      console.error('Error processing text:', error)
      showError(error.message || 'Failed to process text')
      setIsProcessing(false)
      setProgress(0)
      setProcessingStep('')
    }
  }, [textInput, studyStreak, totalStudyTime])

  const generateMindMap = (summary: string) => {
    // Simple mind map generation based on summary
    const topics = summary.split('\n').filter(line => line.includes('•') || line.includes('-'))
    return topics.slice(0, 5).map(topic => topic.replace(/[•\-]/, '').trim()).join(', ')
  }

  const startFlashcardSession = (resource: LearningResource) => {
    if (!resource.flashcards || resource.flashcards.length === 0) return
    setCurrentFlashcard(0)
    setShowFlashcardAnswer(false)
    setActiveTab('flashcards')
    unlockAchievement('Flashcard Master')
  }

  const startQuizSession = (resource: LearningResource) => {
    if (!resource.quiz || resource.quiz.length === 0) return
    setCurrentQuiz({ resource, questionIndex: 0 })
    setQuizScore(0)
    setShowQuizResults(false)
    setActiveTab('quiz')
  }

  const nextFlashcard = () => {
    if (currentFlashcard < (resources[0]?.flashcards?.length || 0) - 1) {
      setCurrentFlashcard(prev => prev + 1)
      setShowFlashcardAnswer(false)
    }
  }

  const previousFlashcard = () => {
    if (currentFlashcard > 0) {
      setCurrentFlashcard(prev => prev - 1)
      setShowFlashcardAnswer(false)
    }
  }

  const answerQuizQuestion = (answerIndex: number) => {
    if (!currentQuiz) return

    const updatedQuiz = { ...currentQuiz }
    const question = updatedQuiz.resource.quiz[updatedQuiz.questionIndex]
    question.userAnswer = answerIndex

    if (answerIndex === question.correctAnswer) {
      setQuizScore(prev => prev + 1)
    }

    if (updatedQuiz.questionIndex < updatedQuiz.resource.quiz.length - 1) {
      updatedQuiz.questionIndex++
      setCurrentQuiz(updatedQuiz)
    } else {
      setShowQuizResults(true)
      if (quizScore >= currentQuiz.resource.quiz.length * 0.8) {
        unlockAchievement('Quiz Champion')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Elegant Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-pink-600 to-rose-600 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-3000"></div>
        
        {/* Stars effect */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.8 + 0.2
              }}
            />
          ))}
        </div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header with Stats */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/25">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
              AI Study Buddy
            </h1>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full shadow-lg shadow-blue-500/25">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-xl text-cyan-300 max-w-3xl mx-auto mb-6">
            🎓 Transform Your Learning Experience with AI-Powered Study Tools
          </p>
          
          {/* Stats Bar */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-white font-bold">{studyStreak} Day Streak</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-bold">{Math.floor(totalStudyTime / 60)}min Studied</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-bold">{achievements.length} Achievements</span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="flex justify-center gap-2 flex-wrap">
              {achievements.map((achievement, index) => (
                <Badge key={index} className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-200 border border-pink-400/30 backdrop-blur-md">
                  <Award className="w-3 h-3 mr-1" />
                  {achievement}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/50 text-green-200 backdrop-blur-md">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/50 text-red-200 backdrop-blur-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <TabsTrigger value="upload" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-cyan-300">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-cyan-300">
              <BookOpen className="w-4 h-4 mr-2" />
              Resources ({resources.length})
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-cyan-300">
              <Layers className="w-4 h-4 mr-2" />
              Flashcards
            </TabsTrigger>
            <TabsTrigger value="quiz" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-cyan-300">
              <HelpCircle className="w-4 h-4 mr-2" />
              Quiz
            </TabsTrigger>
            <TabsTrigger value="mindmap" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-cyan-300">
              <Map className="w-4 h-4 mr-2" />
              Mind Map
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-cyan-300">
              <TrendingUp className="w-4 h-4 mr-2" />
              Stats
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <div className="grid md:grid-cols-2 gap-6">
              {/* File Upload */}
              <Card className="bg-white/90 backdrop-blur-md border border-emerald-200 text-gray-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="w-6 h-6 text-amber-500" />
                    Upload Document
                    <Badge className="bg-gradient-to-r from-amber-500 to-emerald-500 text-white border-0">PDF Ready</Badge>
                  </CardTitle>
                  <CardDescription className="text-emerald-600">
                    Upload PDF or TXT files for instant AI processing with REAL text extraction!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div 
                      className="border-2 border-dashed border-amber-300/50 rounded-xl p-8 text-center hover:border-amber-400 transition-all cursor-pointer bg-gradient-to-br from-amber-50/50 to-emerald-50/50 hover:from-amber-100/50 hover:to-emerald-100/50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                      <p className="text-lg font-medium text-gray-700 mb-2">🎯 Click to upload or drag & drop</p>
                      <p className="text-sm text-emerald-600">PDF, TXT files up to 10MB</p>
                      <p className="text-xs text-emerald-500 mt-2">✨ Real PDF text extraction powered by AI</p>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.txt"
                        onChange={handleFileUpload}
                        disabled={isProcessing}
                      />
                    </div>
                    {selectedFile && (
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-700">{selectedFile.name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Text Input */}
              <Card className="bg-white/90 backdrop-blur-md border border-emerald-200 text-gray-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="w-6 h-6 text-emerald-500" />
                    Paste Content
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">AI Ready</Badge>
                  </CardTitle>
                  <CardDescription className="text-emerald-600">
                    Paste any text content and watch AI create magic! 🪄
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="📝 Paste your learning material here and watch the AI work its magic..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      disabled={isProcessing}
                      rows={8}
                      className="bg-white border-emerald-200 text-gray-800 placeholder:text-emerald-400 focus:border-emerald-400 focus:ring-emerald-400"
                    />
                    <Button 
                      onClick={handleTextInput} 
                      disabled={!textInput.trim() || isProcessing}
                      className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white font-bold shadow-lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Process with AI Magic
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <Card className="mt-6 bg-gradient-to-r from-amber-100 to-emerald-100 backdrop-blur-md border border-amber-300 shadow-xl">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                      <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-800 mb-2">{processingStep}</p>
                      <Progress value={progress} className="h-3 bg-white/50" />
                      <p className="text-sm text-emerald-600 mt-1">{progress}% Complete - AI is working its magic! ✨</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <div className="grid gap-6">
              {resources.length === 0 ? (
                <Card className="bg-white/90 backdrop-blur-md border border-emerald-200 text-center py-12 shadow-xl">
                  <BookOpen className="w-20 h-20 mx-auto mb-6 text-amber-500" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">📚 Transform Your Learning Experience</h3>
                  <p className="text-emerald-600 mb-6 text-lg">Upload your first document and experience the future of learning!</p>
                  <Button 
                    onClick={() => setActiveTab('upload')}
                    className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white font-bold text-lg px-8 py-3 shadow-lg"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Get Started
                  </Button>
                </Card>
              ) : (
                resources.map((resource) => (
                  <Card key={resource.id} className="bg-white/90 backdrop-blur-md border border-emerald-200 text-gray-800 shadow-xl">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-xl">
                            <FileText className="w-6 h-6 text-amber-500" />
                            {resource.title}
                          </CardTitle>
                          <CardDescription className="text-emerald-600">
                            {resource.createdAt.toLocaleDateString()} at {resource.createdAt.toLocaleTimeString()}
                            {resource.processingTime && (
                              <span className="ml-2 text-amber-600">⚡ {resource.processingTime}ms</span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-gradient-to-r from-amber-500 to-emerald-500 text-white border-0">
                            {resource.type}
                          </Badge>
                          {resource.summary && !resource.summary.includes('fallback') && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Generated
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Summary with Voice */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                              <Brain className="w-5 h-5 text-amber-500" />
                              AI Summary
                            </h4>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => speakText(resource.summary || '')}
                                disabled={isReading}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                              >
                                {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                onClick={stopSpeaking}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                <MicOff className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="bg-white/10 p-4 rounded-lg border border-white/20 backdrop-blur-sm">
                            <p className="text-blue-100 leading-relaxed whitespace-pre-line">{resource.summary}</p>
                          </div>
                        </div>

                        {/* Study Materials */}
                        <div className="grid md:grid-cols-3 gap-4">
                          <Card className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 border border-pink-400/50">
                            <CardContent className="pt-6 text-center">
                              <Layers className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                              <h4 className="font-bold text-lg mb-2 text-white">Flashcards</h4>
                              <p className="text-3xl font-black text-blue-400 mb-3">{resource.flashcards?.length || 0}</p>
                              <Button 
                                onClick={() => startFlashcardSession(resource)}
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold"
                                disabled={!resource.flashcards || resource.flashcards.length === 0}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Study Now
                              </Button>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-400/50">
                            <CardContent className="pt-6 text-center">
                              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-teal-400" />
                              <h4 className="font-bold text-lg mb-2 text-white">Quiz</h4>
                              <p className="text-3xl font-black text-teal-400 mb-3">{resource.quiz?.length || 0}</p>
                              <Button 
                                onClick={() => startQuizSession(resource)}
                                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold"
                                disabled={!resource.quiz || resource.quiz.length === 0}
                              >
                                <Target className="w-4 h-4 mr-2" />
                                Test Yourself
                              </Button>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-indigo-400/50">
                            <CardContent className="pt-6 text-center">
                              <Map className="w-12 h-12 mx-auto mb-3 text-indigo-400" />
                              <h4 className="font-bold text-lg mb-2 text-white">Mind Map</h4>
                              <p className="text-sm text-indigo-200 mb-3">Visual learning</p>
                              <Button 
                                onClick={() => {
                                  setShowMindMap(true)
                                  setActiveTab('mindmap')
                                }}
                                className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Map
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards">
            {resources.length === 0 || !resources[0]?.flashcards || resources[0].flashcards.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-center py-12 shadow-2xl">
                <Layers className="w-20 h-20 mx-auto mb-6 text-blue-400" />
                <h3 className="text-2xl font-bold text-white mb-4">No Flashcards Yet</h3>
                <p className="text-blue-200 mb-6">Upload content to generate AI-powered flashcards!</p>
                <Button 
                  onClick={() => setActiveTab('upload')}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Flashcards
                </Button>
              </Card>
            ) : (
              <div className="max-w-2xl mx-auto">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Layers className="w-6 h-6 text-pink-400" />
                        Flashcard Study
                      </CardTitle>
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
                        {currentFlashcard + 1} / {resources[0].flashcards?.length || 0}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div 
                        className="min-h-[250px] p-8 rounded-xl bg-gradient-to-br from-pink-600/20 to-purple-600/20 border-2 border-pink-400/50 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl"
                        onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                      >
                        <div className="text-center">
                          {!showFlashcardAnswer ? (
                            <div>
                              <p className="text-2xl font-bold text-white mb-4">
                                {resources[0].flashcards[currentFlashcard]?.front}
                              </p>
                              <p className="text-purple-300 text-sm">👆 Click to reveal answer</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xl text-purple-100 mb-4">
                                {resources[0].flashcards[currentFlashcard]?.back}
                              </p>
                              <Badge className={
                                resources[0].flashcards[currentFlashcard]?.difficulty === 'easy' ? 'bg-green-500' :
                                resources[0].flashcards[currentFlashcard]?.difficulty === 'medium' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }>
                                {resources[0].flashcards[currentFlashcard]?.difficulty}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button 
                          onClick={previousFlashcard}
                          disabled={currentFlashcard === 0}
                          variant="outline"
                          className="border-pink-400 text-pink-400 hover:bg-pink-500 hover:text-white"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>
                        <div className="flex gap-2">
                          {resources[0].flashcards?.map((_, index) => (
                            <div
                              key={index}
                              className={`w-3 h-3 rounded-full transition-all ${
                                index === currentFlashcard ? 'bg-pink-400 w-8' : 'bg-white/30'
                              }`}
                            />
                          ))}
                        </div>
                        <Button 
                          onClick={nextFlashcard}
                          disabled={currentFlashcard >= (resources[0].flashcards?.length || 0) - 1}
                          variant="outline"
                          className="border-pink-400 text-pink-400 hover:bg-pink-500 hover:text-white"
                        >
                          Next
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz">
            {!currentQuiz ? (
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-center py-12 shadow-2xl">
                <HelpCircle className="w-20 h-20 mx-auto mb-6 text-purple-400" />
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Test Your Knowledge?</h3>
                <p className="text-purple-200 mb-6">Challenge yourself with AI-generated questions!</p>
                <Button 
                  onClick={() => setActiveTab('upload')}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Create Quiz
                </Button>
              </Card>
            ) : showQuizResults ? (
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-center py-12 shadow-2xl">
                <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-400" />
                <h3 className="text-3xl font-black text-white mb-4">🎉 Quiz Complete!</h3>
                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-4">
                  {quizScore}/{currentQuiz.resource.quiz.length}
                </p>
                <p className="text-xl text-purple-200 mb-6">
                  {quizScore === currentQuiz.resource.quiz.length ? '🏆 PERFECT SCORE! You\'re a Genius!' :
                   quizScore >= currentQuiz.resource.quiz.length * 0.8 ? '🌟 Excellent Work! Amazing Knowledge!' :
                   quizScore >= currentQuiz.resource.quiz.length * 0.6 ? '👍 Good Job! Keep Learning!' : '💪 Keep Practicing! You\'ll Get There!'}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => {
                      setCurrentQuiz(null)
                      setActiveTab('resources')
                    }}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Back to Resources
                  </Button>
                  <Button 
                    onClick={() => {
                      const resetQuiz = { ...currentQuiz }
                      resetQuiz.resource.quiz.forEach(q => q.userAnswer = undefined)
                      setCurrentQuiz(resetQuiz)
                      setQuizScore(0)
                      setShowQuizResults(false)
                    }}
                    variant="outline"
                    className="border-purple-400 text-purple-400 hover:bg-purple-500 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retake Quiz
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="max-w-3xl mx-auto">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-purple-400" />
                        Quiz Challenge
                      </CardTitle>
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
                        Question {currentQuiz.questionIndex + 1} of {currentQuiz.resource.quiz.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-6 rounded-xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border-2 border-purple-400/50">
                        <p className="text-xl font-bold text-white">
                          {currentQuiz.resource.quiz[currentQuiz.questionIndex]?.question}
                        </p>
                      </div>

                      <div className="grid gap-3">
                        {currentQuiz.resource.quiz[currentQuiz.questionIndex]?.options.map((option, index) => (
                          <Button
                            key={index}
                            onClick={() => answerQuizQuestion(index)}
                            variant="outline"
                            className={`p-4 text-left justify-start border-2 transition-all hover:scale-105 ${
                              currentQuiz.resource.quiz[currentQuiz.questionIndex].userAnswer === index
                                ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                                : 'border-white/20 text-white hover:border-purple-400 hover:bg-purple-500/10'
                            }`}
                            disabled={currentQuiz.resource.quiz[currentQuiz.questionIndex].userAnswer !== undefined}
                          >
                            <span className="font-bold mr-3 text-lg">{String.fromCharCode(65 + index)}.</span>
                            {option}
                          </Button>
                        ))}
                      </div>

                      {currentQuiz.resource.quiz[currentQuiz.questionIndex].userAnswer !== undefined && (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50">
                          <p className="font-bold text-green-300 text-lg mb-2">
                            {currentQuiz.resource.quiz[currentQuiz.questionIndex].userAnswer === currentQuiz.resource.quiz[currentQuiz.questionIndex].correctAnswer
                              ? '🎉 CORRECT! Amazing job!'
                              : `💡 Learning Opportunity! The correct answer is ${String.fromCharCode(65 + currentQuiz.resource.quiz[currentQuiz.questionIndex].correctAnswer)}`
                            }
                          </p>
                          <p className="text-purple-200">
                            {currentQuiz.resource.quiz[currentQuiz.questionIndex].explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Mind Map Tab */}
          <TabsContent value="mindmap">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Map className="w-6 h-6 text-indigo-400" />
                  Visual Mind Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[400px] p-8 rounded-xl bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border-2 border-indigo-400/50">
                  <div className="text-center">
                    <div className="mb-8">
                      <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <Brain className="w-16 h-16 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Knowledge Map</h3>
                    </div>
                    
                    {resources.length > 0 && resources[0].mindMap && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {resources[0].mindMap.split(',').map((topic, index) => (
                          <div key={index} className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                            <p className="text-white text-sm">{topic.trim()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {resources.length === 0 && (
                      <p className="text-indigo-200 text-lg">Upload content to generate your mind map! 🗺️</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 border border-pink-400/50 text-white">
                <CardContent className="pt-6 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-pink-400" />
                  <h3 className="text-4xl font-black mb-2">{resources.length}</h3>
                  <p className="text-pink-200">Resources Processed</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-400/50 text-white">
                <CardContent className="pt-6 text-center">
                  <Layers className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-4xl font-black mb-2">
                    {resources.reduce((sum, r) => sum + (r.flashcards?.length || 0), 0)}
                  </h3>
                  <p className="text-purple-200">Flashcards Created</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-indigo-400/50 text-white">
                <CardContent className="pt-6 text-center">
                  <HelpCircle className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
                  <h3 className="text-4xl font-black mb-2">
                    {resources.reduce((sum, r) => sum + (r.quiz?.length || 0), 0)}
                  </h3>
                  <p className="text-indigo-200">Quiz Questions</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-400/50 text-white">
                <CardContent className="pt-6 text-center">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-green-400" />
                  <h3 className="text-4xl font-black mb-2">{achievements.length}</h3>
                  <p className="text-green-200">Achievements</p>
                </CardContent>
              </Card>
            </div>

            {/* Achievement Showcase */}
            <Card className="mt-6 bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-400" />
                  Achievement Showcase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'First Step', icon: '🎯', unlocked: achievements.includes('First Step') },
                    { name: 'Knowledge Collector', icon: '📚', unlocked: achievements.includes('Knowledge Collector') },
                    { name: 'Speed Learner', icon: '⚡', unlocked: achievements.includes('Speed Learner') },
                    { name: 'Flashcard Master', icon: '🎴', unlocked: achievements.includes('Flashcard Master') },
                    { name: 'Quiz Champion', icon: '🏆', unlocked: achievements.includes('Quiz Champion') },
                    { name: 'AI Explorer', icon: '🤖', unlocked: resources.length > 0 },
                    { name: 'Study Streak', icon: '🔥', unlocked: studyStreak > 0 },
                    { name: 'Time Master', icon: '⏰', unlocked: totalStudyTime > 60 }
                  ].map((achievement, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border text-center transition-all ${
                        achievement.unlocked 
                          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/50' 
                          : 'bg-gray-500/10 border-gray-500/30 opacity-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <p className="text-sm font-medium">{achievement.name}</p>
                      {achievement.unlocked && <CheckCircle className="w-4 h-4 mx-auto mt-1 text-green-400" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  )
}