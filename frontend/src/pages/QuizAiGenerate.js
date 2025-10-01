import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import quizService from '../services/quizService';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import '../styles/QuizForms.css';

const QuizAiGenerate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Setup, 2: Generating, 3: Review, 4: Save
  
  const [generationParams, setGenerationParams] = useState({
    topic: '',
    difficulty: 'MEDIUM',
    questionCount: 10,
    description: '',
    timeLimit: 30,
    questionTypes: ['MULTIPLE_CHOICE']
  });

  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const difficulties = ['EASY', 'MEDIUM', 'HARD'];
  const questionTypes = [
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
    { value: 'TRUE_FALSE', label: 'True/False' }
  ];

  const handleParamChange = (field, value) => {
    setGenerationParams(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionTypeToggle = (type) => {
    setGenerationParams(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type]
    }));
  };

  const generateQuiz = async () => {
    // Enhanced validation
    if (!generationParams.topic.trim()) {
      toast.error('Please enter a topic for your quiz');
      return;
    }

    if (generationParams.topic.length < 3) {
      toast.error('Topic must be at least 3 characters long');
      return;
    }

    if (generationParams.questionTypes.length === 0) {
      toast.error('Please select at least one question type');
      return;
    }

    if (generationParams.questionCount < 1 || generationParams.questionCount > 50) {
      toast.error('Number of questions must be between 1 and 50');
      return;
    }

    if (generationParams.timeLimit < 1 || generationParams.timeLimit > 180) {
      toast.error('Time limit must be between 1 and 180 minutes');
      return;
    }

    try {
      setLoading(true);
      setStep(2);

      // Call the actual backend AI service
      const aiGenerationRequest = {
        topic: generationParams.topic,
        difficulty: generationParams.difficulty,
        questionCount: generationParams.questionCount,
        timeLimit: generationParams.timeLimit,
        questionType: generationParams.questionTypes[0], // Use first selected type
        description: generationParams.description,
        createdBy: user.id
      };

      toast.loading('AI is generating your quiz...', { duration: 3000 });
      const generatedQuiz = await quizService.generateAiQuiz(aiGenerationRequest);
      
      setGeneratedQuiz(generatedQuiz);
      setStep(3);
      toast.success('Quiz generated successfully!');
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      
      // Provide specific error messages based on the error
      if (error.message.includes('500')) {
        toast.error('AI quiz generation is currently unavailable. This may be due to API configuration issues. Please try manual quiz creation instead.');
      } else if (error.message.includes('404')) {
        toast.error('AI quiz generation service not found. Please contact support.');
      } else if (error.message.includes('Cannot connect')) {
        toast.error('Cannot connect to AI service. Please ensure all backend services are running.');
      } else if (error.message.includes('API')) {
        toast.error('AI service error. Please check API configuration and try different parameters.');
      } else {
        toast.error(`Failed to generate quiz: ${error.message}`);
      }
      
      setStep(1);
    } finally {
      setLoading(false);
    }
  };



  const editQuestion = (question) => {
    setEditingQuestion({ ...question });
  };

  const saveEditedQuestion = () => {
    setGeneratedQuiz(prev => ({
      ...prev,
      questions: prev.questions?.map(q => 
        q.id === editingQuestion.id ? editingQuestion : q
      ) || []
    }));
    setEditingQuestion(null);
    toast.success('Question updated successfully');
  };

  const removeQuestion = (questionId) => {
    setGeneratedQuiz(prev => ({
      ...prev,
      questions: prev.questions?.filter(q => q.id !== questionId) || []
    }));
    toast.success('Question removed');
  };

  const saveQuiz = async () => {
    if (!generatedQuiz.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }

    if (!generatedQuiz.questions?.length) {
      toast.error('Quiz must have at least one question');
      return;
    }

    try {
      setLoading(true);
      
      const quizToSave = {
        ...generatedQuiz,
        createdBy: user.id,
        createdAt: new Date().toISOString()
      };

      await quizService.createQuiz(quizToSave);
      toast.success('AI-generated quiz saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <DashboardLayout>
      <motion.div
        className="quiz-ai-generate-page"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="page-header" variants={itemVariants}>
          <h1>
            <i className="fas fa-robot"></i>
            AI Quiz Generator
          </h1>
        </motion.div>

        {/* Step 1: Setup */}
        {step === 1 && (
          <motion.div className="generation-setup" variants={itemVariants}>
            <div className="form-section">
              <h2>Quiz Generation Settings</h2>
              
              <div className="form-grid">
                <div className="form-group span-2">
                  <label htmlFor="topic">Topic or Subject *</label>
                  <input
                    type="text"
                    id="topic"
                    value={generationParams.topic}
                    onChange={(e) => handleParamChange('topic', e.target.value)}
                    className="form-input"
                    placeholder="e.g., World War II, Photosynthesis, JavaScript Programming..."
                    maxLength="100"
                  />
                  <small>Be as specific as possible for better questions</small>
                </div>

                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty Level</label>
                  <select
                    id="difficulty"
                    value={generationParams.difficulty}
                    onChange={(e) => handleParamChange('difficulty', e.target.value)}
                    className="form-select"
                  >
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="questionCount">Number of Questions</label>
                  <input
                    type="number"
                    id="questionCount"
                    value={generationParams.questionCount}
                    onChange={(e) => handleParamChange('questionCount', parseInt(e.target.value) || 1)}
                    className="form-input"
                    min="1"
                    max="50"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="timeLimit">Time Limit (minutes)</label>
                  <input
                    type="number"
                    id="timeLimit"
                    value={generationParams.timeLimit}
                    onChange={(e) => handleParamChange('timeLimit', parseInt(e.target.value) || 1)}
                    className="form-input"
                    min="1"
                    max="180"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  value={generationParams.description}
                  onChange={(e) => handleParamChange('description', e.target.value)}
                  className="form-textarea"
                  placeholder="Provide additional context or specific requirements..."
                  rows="3"
                  maxLength="500"
                />
              </div>

              <div className="form-group">
                <label>Question Types</label>
                <div className="checkbox-group">
                  {questionTypes.map(type => (
                    <label key={type.value} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={generationParams.questionTypes.includes(type.value)}
                        onChange={() => handleQuestionTypeToggle(type.value)}
                      />
                      <span className="checkmark"></span>
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={generateQuiz}
                  disabled={loading}
                  className="btn btn-primary btn-large"
                >
                  <i className="fas fa-magic"></i>
                  Generate Quiz with AI
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Generating */}
        {step === 2 && (
          <motion.div className="generation-loading" variants={itemVariants}>
            <div className="loading-container">
              <LoadingSpinner size="large" />
              <h2>AI is generating your quiz...</h2>
              <p>This may take a few moments. Please wait.</p>
              <div className="generation-steps">
                <div className="step active">
                  <i className="fas fa-search"></i>
                  Analyzing topic
                </div>
                <div className="step active">
                  <i className="fas fa-brain"></i>
                  Creating questions
                </div>
                <div className="step">
                  <i className="fas fa-check"></i>
                  Finalizing quiz
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review Generated Quiz */}
        {step === 3 && generatedQuiz && generatedQuiz.questions && (
          <motion.div className="quiz-review" variants={itemVariants}>
            <div className="review-header">
              <h2>Review Generated Quiz</h2>
              <p>Review and edit the AI-generated questions before saving</p>
            </div>

            <div className="quiz-info">
              <div className="form-group">
                <label htmlFor="quizTitle">Quiz Title</label>
                <input
                  type="text"
                  id="quizTitle"
                  value={generatedQuiz.title}
                  onChange={(e) => setGeneratedQuiz(prev => ({...prev, title: e.target.value}))}
                  className="form-input"
                  maxLength="100"
                />
              </div>
              <div className="quiz-meta">
                <span><i className="fas fa-layer-group"></i> {generatedQuiz.questions?.length || 0} questions</span>
                <span><i className="fas fa-clock"></i> {generatedQuiz.timeLimit} minutes</span>
                <span><i className="fas fa-signal"></i> {generatedQuiz.difficulty}</span>
              </div>
            </div>

            <div className="questions-review">
              {generatedQuiz.questions?.map((question, index) => (
                <div key={question.id} className="question-review-item">
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <span className="question-type">{question.type.replace('_', ' ')}</span>
                    <div className="question-actions">
                      <button
                        type="button"
                        onClick={() => editQuestion(question)}
                        className="btn btn-sm btn-secondary"
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="btn btn-sm btn-danger"
                      >
                        <i className="fas fa-trash"></i> Remove
                      </button>
                    </div>
                  </div>
                  <div className="question-content">
                    <p className="question-text">{question.questionText}</p>
                    {question.type === 'MULTIPLE_CHOICE' && (
                      <div className="options-list">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`option-item ${option === question.correctAnswer ? 'correct' : ''}`}
                          >
                            {option === question.correctAnswer && <i className="fas fa-check"></i>}
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                    {question.type === 'TRUE_FALSE' && (
                      <div className="correct-answer">
                        Correct Answer: <span className="answer">{question.correctAnswer}</span>
                      </div>
                    )}
                    {question.explanation && (
                      <div className="explanation">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary"
              >
                <i className="fas fa-arrow-left"></i>
                Back to Setup
              </button>
              <button
                type="button"
                onClick={saveQuiz}
                disabled={loading || !generatedQuiz.questions?.length}
                className="btn btn-primary btn-large"
              >
                {loading ? (
                  <>
                    <div className="spinner small"></div>
                    Saving Quiz...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Save Quiz
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Error/Empty State for Step 3 */}
        {step === 3 && (!generatedQuiz || !generatedQuiz.questions) && (
          <motion.div className="generation-error" variants={itemVariants}>
            <div className="error-container">
              <i className="fas fa-exclamation-triangle"></i>
              <h2>Quiz Generation Failed</h2>
              <p>Unable to generate quiz. Please try again with different parameters.</p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-primary"
              >
                <i className="fas fa-arrow-left"></i>
                Back to Setup
              </button>
            </div>
          </motion.div>
        )}

        {/* Question Edit Modal */}
        {editingQuestion && (
          <div className="modal-overlay">
            <div className="question-edit-modal">
              <div className="modal-header">
                <h3>Edit Question</h3>
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="btn-close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-content">
                <div className="form-group">
                  <label htmlFor="editQuestionText">Question Text</label>
                  <textarea
                    id="editQuestionText"
                    value={editingQuestion.questionText}
                    onChange={(e) => setEditingQuestion(prev => ({...prev, questionText: e.target.value}))}
                    className="form-textarea"
                    rows="3"
                    maxLength="500"
                  />
                </div>

                {editingQuestion.type === 'MULTIPLE_CHOICE' && (
                  <div className="options-edit">
                    <label>Options</label>
                    {editingQuestion.options.map((option, index) => (
                      <div key={index} className="option-edit-group">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...editingQuestion.options];
                            newOptions[index] = e.target.value;
                            setEditingQuestion(prev => ({...prev, options: newOptions}));
                          }}
                          className="form-input"
                          placeholder={`Option ${index + 1}`}
                        />
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="editCorrectAnswer"
                            value={option}
                            checked={editingQuestion.correctAnswer === option}
                            onChange={(e) => setEditingQuestion(prev => ({...prev, correctAnswer: e.target.value}))}
                          />
                          <span className="radio-mark"></span>
                          Correct
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {editingQuestion.type === 'TRUE_FALSE' && (
                  <div className="form-group">
                    <label>Correct Answer</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="editTfAnswer"
                          value="True"
                          checked={editingQuestion.correctAnswer === 'True'}
                          onChange={(e) => setEditingQuestion(prev => ({...prev, correctAnswer: e.target.value}))}
                        />
                        <span className="radio-mark"></span>
                        True
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="editTfAnswer"
                          value="False"
                          checked={editingQuestion.correctAnswer === 'False'}
                          onChange={(e) => setEditingQuestion(prev => ({...prev, correctAnswer: e.target.value}))}
                        />
                        <span className="radio-mark"></span>
                        False
                      </label>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="editExplanation">Explanation</label>
                  <textarea
                    id="editExplanation"
                    value={editingQuestion.explanation}
                    onChange={(e) => setEditingQuestion(prev => ({...prev, explanation: e.target.value}))}
                    className="form-textarea"
                    rows="2"
                    maxLength="300"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEditedQuestion}
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default QuizAiGenerate;
